import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const host = process.env.DB_HOST ?? "127.0.0.1";
const port = Number(process.env.DB_PORT ?? "3306");
const user = process.env.DB_USER ?? "root";
const password = process.env.DB_PASSWORD ?? "root";
const database = process.env.DB_NAME ?? "la_dental";

const schemaPath = path.join(process.cwd(), "database", "schema.sql");
const schemaSql = await fs.readFile(schemaPath, "utf8");

const defaultCharset = "utf8mb4";
const defaultCollation = "utf8mb4_unicode_ci";

function isMysqlError(error, code) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function escapeIdentifier(identifier) {
  return identifier.replaceAll("`", "``");
}

async function createDatabaseIfMissing() {
  const adminConnection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  try {
    await adminConnection.query(
      `
        CREATE DATABASE IF NOT EXISTS \`${escapeIdentifier(database)}\`
        CHARACTER SET ${defaultCharset}
        COLLATE ${defaultCollation}
      `
    );
  } catch (error) {
    if (
      isMysqlError(error, "ER_DBACCESS_DENIED_ERROR") ||
      isMysqlError(error, "ER_ACCESS_DENIED_ERROR") ||
      isMysqlError(error, "ER_SPECIFIC_ACCESS_DENIED_ERROR")
    ) {
      throw new Error(
        `No pudimos crear la base "${database}" con este usuario. ` +
          "Creala manualmente en tu hosting o ajusta DB_NAME/credenciales y vuelve a ejecutar npm run db:init."
      );
    }

    throw error;
  } finally {
    await adminConnection.end();
  }
}

async function createSchemaConnection() {
  try {
    return await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true
    });
  } catch (error) {
    if (!isMysqlError(error, "ER_BAD_DB_ERROR")) {
      throw error;
    }

    await createDatabaseIfMissing();

    return mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true
    });
  }
}

const connection = await createSchemaConnection();

async function columnExists(connection, tableName, columnName) {
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

async function columnIsNullable(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `
      SELECT IS_NULLABLE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [database, tableName, columnName]
  );

  return rows[0]?.IS_NULLABLE === "YES";
}

async function constraintExists(connection, tableName, constraintName) {
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = ?
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
      LIMIT 1
    `,
    [database, tableName, constraintName]
  );

  return rows.length > 0;
}

async function indexExists(connection, tableName, indexName) {
  const [rows] = await connection.query(
    `
      SELECT 1
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      LIMIT 1
    `,
    [database, tableName, indexName]
  );

  return rows.length > 0;
}

async function ensureAssetMigration(connection) {
  if (
    (await columnExists(connection, "doctor_profiles", "cv_path")) &&
    !(await columnIsNullable(connection, "doctor_profiles", "cv_path"))
  ) {
    await connection.query(
      "ALTER TABLE doctor_profiles MODIFY COLUMN cv_path VARCHAR(255) NULL"
    );
  }

  if (
    (await columnExists(connection, "doctor_photos", "file_path")) &&
    !(await columnIsNullable(connection, "doctor_photos", "file_path"))
  ) {
    await connection.query(
      "ALTER TABLE doctor_photos MODIFY COLUMN file_path VARCHAR(255) NULL"
    );
  }

  if (!(await columnExists(connection, "doctor_profiles", "cv_asset_id"))) {
    await connection.query(
      "ALTER TABLE doctor_profiles ADD COLUMN cv_asset_id INT UNSIGNED NULL AFTER cv_path"
    );
  }

  if (!(await columnExists(connection, "doctor_photos", "asset_id"))) {
    await connection.query(
      "ALTER TABLE doctor_photos ADD COLUMN asset_id INT UNSIGNED NULL AFTER file_path"
    );
  }

  if (!(await indexExists(connection, "file_assets", "idx_file_assets_owner_user_id"))) {
    await connection.query(
      "ALTER TABLE file_assets ADD KEY idx_file_assets_owner_user_id (owner_user_id)"
    );
  }

  if (!(await indexExists(connection, "file_assets", "idx_file_assets_purpose"))) {
    await connection.query(
      "ALTER TABLE file_assets ADD KEY idx_file_assets_purpose (purpose)"
    );
  }

  if (!(await indexExists(connection, "file_assets", "idx_file_assets_sha256"))) {
    await connection.query(
      "ALTER TABLE file_assets ADD KEY idx_file_assets_sha256 (sha256)"
    );
  }

  if (
    !(await constraintExists(connection, "doctor_profiles", "fk_doctor_profiles_cv_asset"))
  ) {
    await connection.query(
      `
        ALTER TABLE doctor_profiles
        ADD CONSTRAINT fk_doctor_profiles_cv_asset
        FOREIGN KEY (cv_asset_id) REFERENCES file_assets(id)
        ON DELETE SET NULL
      `
    );
  }

  if (!(await constraintExists(connection, "doctor_photos", "fk_doctor_photos_asset"))) {
    await connection.query(
      `
        ALTER TABLE doctor_photos
        ADD CONSTRAINT fk_doctor_photos_asset
        FOREIGN KEY (asset_id) REFERENCES file_assets(id)
        ON DELETE SET NULL
      `
    );
  }
}

try {
  await connection.query(schemaSql);
  await ensureAssetMigration(connection);
  console.log(`Base de datos ${database} inicializada correctamente.`);
} finally {
  await connection.end();
}
