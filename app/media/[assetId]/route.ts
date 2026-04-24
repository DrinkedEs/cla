import { NextResponse } from "next/server";
import { getPublicFileAsset, buildInlineDisposition } from "@/lib/file-assets";
import { apiError, handleApiError } from "@/lib/http";

export const runtime = "nodejs";

type MediaRouteProps = {
  params: Promise<{
    assetId: string;
  }>;
};

export async function GET(_: Request, { params }: MediaRouteProps) {
  try {
    const { assetId } = await params;
    const parsedAssetId = Number(assetId);

    if (!Number.isInteger(parsedAssetId) || parsedAssetId <= 0) {
      apiError("Asset invalido.", 400);
    }

    const asset = await getPublicFileAsset(parsedAssetId);

    if (!asset) {
      apiError("Archivo no encontrado.", 404);
    }

    return new NextResponse(asset.content, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType,
        "Content-Length": String(asset.byteSize),
        "Content-Disposition": buildInlineDisposition(asset.originalName),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
