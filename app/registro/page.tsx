import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { PublicHeader } from "@/components/site/PublicHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { redirectIfAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  await redirectIfAuthenticated();

  return (
    <>
      <PublicHeader currentUser={null} />
      <ScreenShell
        eyebrow="Registro"
        title="Crea tu cuenta por rol"
        description="Paciente y doctor comparten autenticacion real, pero cada uno completa datos distintos para vivir un flujo adaptado."
      >
        <RegisterForm />
        <p className="mt-5 text-center text-sm text-white/55">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-bold text-violet-100">
            Inicia sesion
          </Link>
          .
        </p>
      </ScreenShell>
    </>
  );
}
