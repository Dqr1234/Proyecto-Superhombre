import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "CenaCheck",
  description: "Personal fitness and nutrition dinner tracker.",
  manifest: "/manifest.json",
  themeColor: "#0a0f1c",
  icons: {
    apple: "/icons/icon.svg",
    icon: "/icons/icon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ServiceWorkerRegister />
        <header>
          <div>
            <h1>CenaCheck</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Evalúa tu cena y tu progreso diario.
            </p>
          </div>
          <nav>
            <Link href="/">Hoy</Link>
            <Link href="/history">Historial</Link>
            <Link href="/stats">Stats</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
