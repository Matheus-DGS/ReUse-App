import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ReUse! — Recicle com propósito",
  description:
    "Plataforma web do ReUse!: encontre materiais recicláveis, aprenda a separar resíduos corretamente e acompanhe seus favoritos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
