"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type LogoutButtonProps = {
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function LogoutButton({
  className,
  variant = "ghost"
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <PrimaryButton
      onClick={handleLogout}
      disabled={loading}
      variant={variant}
      icon="arrow"
      className={className}
    >
      {loading ? "Saliendo..." : "Cerrar sesion"}
    </PrimaryButton>
  );
}
