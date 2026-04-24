import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { formatZodError } from "@/lib/validation";

export class AppError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function apiError(message: string, status = 400): never {
  throw new AppError(message, status);
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: formatZodError(error) },
      { status: 400 }
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  ) {
    return NextResponse.json(
      { error: "Ese correo ya esta registrado." },
      { status: 409 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json(
    { error: "Ocurrio un error inesperado." },
    { status: 500 }
  );
}
