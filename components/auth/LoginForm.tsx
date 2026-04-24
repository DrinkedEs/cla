"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TextInput } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Surface } from "@/components/ui/Surface";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? "")
      })
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; redirectTo?: string }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "No pudimos iniciar sesion.");
      return;
    }

    startTransition(() => {
      router.push(payload?.redirectTo ?? "/");
      router.refresh();
    });
  }

  return (
    <Surface className="mx-auto w-full max-w-xl">
      <form
        action={handleSubmit}
        className="grid gap-4"
      >
        <TextInput
          label="Correo"
          name="email"
          type="email"
          placeholder="paciente@correo.com"
          required
        />
        <TextInput
          label="Contrasena"
          name="password"
          type="password"
          placeholder="Minimo 8 caracteres"
          required
        />
        {error ? (
          <div className="rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
            {error}
          </div>
        ) : null}
        <PrimaryButton type="submit" disabled={isPending} icon="arrow">
          {isPending ? "Entrando..." : "Iniciar sesion"}
        </PrimaryButton>
      </form>
    </Surface>
  );
}
