import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ImobMatch - Rede de Corretores Imobiliários",
  description: "Plataforma SaaS para corretores imobiliários colaborarem, compartilharem imóveis e fecharem mais negócios.",
  keywords: ["imóveis", "corretor", "imobiliária", "parceria", "SaaS"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
