import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const host = process.env.DB_HOST ?? "127.0.0.1";
const port = Number(process.env.DB_PORT ?? "3306");
const user = process.env.DB_USER ?? "root";
const password = process.env.DB_PASSWORD ?? "root";
const database = process.env.DB_NAME ?? "la_dental";

const connection = await mysql.createConnection({
  host,
  port,
  user,
  password,
  database
});

function guessMimeType(fileName, purpose) {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".webp")) return "image/webp";

  return purpose === "doctor_cv" ? "application/pdf" : "application/octet-stream";
}

async function columnExists(tableName, columnName) {
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [database, tableName, columnName]
  );

  return rows.length > 0;
}

async function tableExists(tableName) {
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
      LIMIT 1
    `,
    [database, tableName]
  );

  return rows.length > 0;
}

async function ensureMigrationColumns() {
  if (!(await tableExists("file_assets"))) {
    throw new Error("Falta la tabla file_assets. Ejecuta primero npm run db:init.");
  }

  if (
    (await columnExists("doctor_profiles", "cv_path")) &&
    !(await columnExists("doctor_profiles", "cv_asset_id"))
  ) {
    await connection.query(
      "ALTER TABLE doctor_profiles ADD COLUMN cv_asset_id INT UNSIGNED NULL AFTER cv_path"
    );
  }

  if (
    (await columnExists("doctor_photos", "file_path")) &&
    !(await columnExists("doctor_photos", "asset_id"))
  ) {
    await connection.query(
      "ALTER TABLE doctor_photos ADD COLUMN asset_id INT UNSIGNED NULL AFTER file_path"
    );
  }
}

async function insertAsset(ownerUserId, purpose, absolutePath, originalName) {
  const content = await fs.readFile(absolutePath);
  const sha256 = createHash("sha256").update(content).digest("hex");
  const mimeType = guessMimeType(originalName, purpose);

  const [result] = await connection.query(
    `
      INSERT INTO file_assets (
        owner_user_id,
        purpose,
        original_name,
        mime_type,
        byte_size,
        sha256,
        is_public,
        content
      )
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `,
    [ownerUserId, purpose, originalName, mimeType, content.byteLength, sha256, content]
  );

  return result.insertId;
}

const canReadCvPath = await columnExists("doctor_profiles", "cv_path");
const canReadPhotoPath = await columnExists("doctor_photos", "file_path");

if (!canReadCvPath && !canReadPhotoPath) {
  console.log("No hay columnas antiguas de filesystem para migrar.");
  await connection.end();
  process.exit(0);
}

const report = {
  migratedCvs: 0,
  migratedPhotos: 0,
  missingCvs: 0,
  missingPhotos: 0,
  cvErrors: 0,
  photoErrors: 0
};

try {
  await ensureMigrationColumns();

  if (canReadCvPath) {
    const [rows] = await connection.query(
      `
        SELECT user_id, cv_path
        FROM doctor_profiles
        WHERE cv_path IS NOT NULL
          AND cv_path <> ''
          AND (cv_asset_id IS NULL OR cv_asset_id = 0)
      `
    );

    for (const row of rows) {
      const relativePath = row.cv_path;
      const absolutePath = path.join(process.cwd(), relativePath);

      try {
        await fs.access(absolutePath);
      } catch {
        report.missingCvs += 1;
        continue;
      }

      try {
        await connection.beginTransaction();
        const assetId = await insertAsset(
          row.user_id,
          "doctor_cv",
          absolutePath,
          path.basename(relativePath)
        );
        await connection.query(
          "UPDATE doctor_profiles SET cv_asset_id = ? WHERE user_id = ?",
          [assetId, row.user_id]
        );
        await connection.commit();
        report.migratedCvs += 1;
      } catch (error) {
        await connection.rollback();
        report.cvErrors += 1;
        console.error("Error migrando CV:", row.user_id, error);
      }
    }
  }

  if (canReadPhotoPath) {
    const [rows] = await connection.query(
      `
        SELECT id, doctor_id, file_path
        FROM doctor_photos
        WHERE file_path IS NOT NULL
          AND file_path <> ''
          AND (asset_id IS NULL OR asset_id = 0)
      `
    );

    for (const row of rows) {
      const relativePath = row.file_path.startsWith("/")
        ? path.join("public", row.file_path.slice(1))
        : row.file_path;
      const absolutePath = path.join(process.cwd(), relativePath);

      try {
        await fs.access(absolutePath);
      } catch {
        report.missingPhotos += 1;
        continue;
      }

      try {
        await connection.beginTransaction();
        const assetId = await insertAsset(
          row.doctor_id,
          "doctor_photo",
          absolutePath,
          path.basename(relativePath)
        );
        await connection.query(
          "UPDATE doctor_photos SET asset_id = ? WHERE id = ?",
          [assetId, row.id]
        );
        await connection.commit();
        report.migratedPhotos += 1;
      } catch (error) {
        await connection.rollback();
        report.photoErrors += 1;
        console.error("Error migrando foto:", row.id, error);
      }
    }
  }

  console.log("Backfill de assets completado:");
  console.log(JSON.stringify(report, null, 2));
} finally {
  await connection.end();
}
