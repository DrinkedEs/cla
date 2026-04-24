import { NextResponse } from "next/server";
import { createUserSession, verifyPassword } from "@/lib/auth";
import { getPasswordUserByEmail } from "@/lib/data";
import { handleApiError, apiError } from "@/lib/http";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const user = await getPasswordUserByEmail(parsed.email);

    if (!user) {
      apiError("Correo o contrasena incorrectos.", 401);
    }

    if (user.status !== "active" || user.deleted_at) {
      apiError("Tu cuenta esta desactivada.", 403);
    }

    const isValidPassword = await verifyPassword(parsed.password, user.password_hash);

    if (!isValidPassword) {
      apiError("Correo o contrasena incorrectos.", 401);
    }

    await createUserSession(user.id);

    return NextResponse.json({
      ok: true,
      redirectTo: user.role === "doctor" ? "/doctor" : "/paciente"
    });
  } catch (error) {
    return handleApiError(error);
  }
}
