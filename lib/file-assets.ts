import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db, queryOne } from "@/lib/db";
import { apiError } from "@/lib/http";

export type FileAssetPurpose = "doctor_cv" | "doctor_photo";

export type FileAssetInput = {
  purpose: FileAssetPurpose;
  originalName: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  isPublic: boolean;
  content: Buffer;
};

type FileAssetRow = RowDataPacket & {
  id: number;
  owner_user_id: number;
  purpose: FileAssetPurpose;
  original_name: string;
  mime_type: string;
  byte_size: number;
  sha256: string;
  is_public: 0 | 1;
  content: Buffer;
};

export function buildMediaUrl(assetId: number | null) {
  return assetId ? `/media/${assetId}` : null;
}

export async function createAssetInputFromFile(
  file: File,
  purpose: FileAssetPurpose,
  isPublic = true
) {
  return createAssetInputFromBuffer({
    content: Buffer.from(await file.arrayBuffer()),
    originalName: file.name,
    mimeType: file.type || guessMimeType(file.name, purpose),
    purpose,
    isPublic
  });
}

export function createAssetInputFromBuffer(input: {
  content: Buffer;
  originalName: string;
  mimeType: string;
  purpose: FileAssetPurpose;
  isPublic?: boolean;
}) {
  return {
    purpose: input.purpose,
    originalName: input.originalName,
    mimeType: input.mimeType || guessMimeType(input.originalName, input.purpose),
    byteSize: input.content.byteLength,
    sha256: createHash("sha256").update(input.content).digest("hex"),
    isPublic: input.isPublic ?? true,
    content: input.content
  } satisfies FileAssetInput;
}

export async function insertFileAsset(
  connection: PoolConnection,
  ownerUserId: number,
  asset: FileAssetInput
) {
  const [result] = await connection.query<ResultSetHeader>(
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      ownerUserId,
      asset.purpose,
      asset.originalName,
      asset.mimeType,
      asset.byteSize,
      asset.sha256,
      asset.isPublic,
      asset.content
    ]
  );

  return result.insertId;
}

export async function getPublicFileAsset(assetId: number) {
  const asset = await queryOne<FileAssetRow>(
    `
      SELECT
        id,
        owner_user_id,
        purpose,
        original_name,
        mime_type,
        byte_size,
        sha256,
        is_public,
        content
      FROM file_assets
      WHERE id = ?
      LIMIT 1
    `,
    [assetId]
  );

  if (!asset) {
    return null;
  }

  if (!asset.is_public) {
    apiError("Ese archivo no es publico.", 403);
  }

  return {
    id: asset.id,
    originalName: asset.original_name,
    mimeType: asset.mime_type,
    byteSize: asset.byte_size,
    content: asset.content
  };
}

export async function deleteAssetIfUnreferenced(
  connection: PoolConnection,
  assetId: number | null
) {
  if (!assetId) {
    return;
  }

  const [rows] = await connection.query<RowDataPacket[]>(
    `
      SELECT
        (
          SELECT COUNT(*) FROM doctor_profiles WHERE cv_asset_id = ?
        ) +
        (
          SELECT COUNT(*) FROM doctor_photos WHERE asset_id = ?
        ) AS total_references
    `,
    [assetId, assetId]
  );

  const totalReferences = Number(rows[0]?.total_references ?? 0);

  if (totalReferences === 0) {
    await connection.query("DELETE FROM file_assets WHERE id = ?", [assetId]);
  }
}

export function guessMimeType(fileName: string, purpose: FileAssetPurpose) {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (normalized.endsWith(".png")) {
    return "image/png";
  }

  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }

  return purpose === "doctor_cv" ? "application/pdf" : "application/octet-stream";
}

export function buildInlineDisposition(fileName: string) {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `inline; filename="${sanitized}"`;
}
