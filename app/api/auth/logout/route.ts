import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearUserSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
