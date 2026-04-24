import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  getConversationsForUser,
  getMessagesForUser,
  sendConversationMessage
} from "@/lib/data";
import { handleApiError } from "@/lib/http";
import { messageSendSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const conversationId = Number(searchParams.get("conversationId") ?? 0) || null;
    const [conversations, messages] = await Promise.all([
      getConversationsForUser(user),
      getMessagesForUser(user, conversationId)
    ]);
    return NextResponse.json({ ok: true, conversations, messages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = messageSendSchema.parse(body);
    const messages = await sendConversationMessage(user, parsed);
    const conversations = await getConversationsForUser(user);
    return NextResponse.json({ ok: true, conversations, messages }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
