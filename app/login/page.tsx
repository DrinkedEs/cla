import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicHeader } from "@/components/site/PublicHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { redirectIfAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <>
      <PublicHeader currentUser={null} />
      <ScreenShell
        eyebrow="Acceso"
        title="Inicia sesion en L&A Dental"
        description="Entra con correo y contrasena para llegar directo a tu dashboard de paciente o doctor."
      >
        <LoginForm />
        <p className="mt-5 text-center text-sm text-white/55">
          Si aun no tienes cuenta,{" "}
          <Link href="/registro" className="font-bold text-violet-100">
            registrate aqui
          </Link>
          .
        </p>
      </ScreenShell>
    </>
  );
}
