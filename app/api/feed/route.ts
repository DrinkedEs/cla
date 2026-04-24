import { NextResponse } from "next/server";
import { requireApiRole, requireApiUser } from "@/lib/auth";
import { createFeedPost, getFeedForUser } from "@/lib/data";
import { handleApiError } from "@/lib/http";
import { feedPostSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireApiUser();
    const feed = await getFeedForUser(user);
    return NextResponse.json({ ok: true, feed });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiRole("doctor");
    const body = await request.json();
    const parsed = feedPostSchema.parse(body);
    const feed = await createFeedPost(user.id, parsed);
    return NextResponse.json({ ok: true, feed }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
