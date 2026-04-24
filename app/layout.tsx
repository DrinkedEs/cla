import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "L&A Dental",
  description:
    "Plataforma con MySQL local, autenticacion real y dashboards por rol para pacientes y estudiantes de odontologia."
};

export const viewport: Viewport = {
  themeColor: "#07050D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-ink text-white antialiased">{children}</body>
    </html>
  );
}
