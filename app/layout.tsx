import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import ClientLayout from "@/app/components/ClientLayout";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mauro Barber",
  description: "Estilo e precisão. Sua barbearia de confiança.",
  icons: {
    icon: "/assets/logo-mauro-barber.png", 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased bg-primary text-secondary`}
      >
        <ClientLayout>
            {children}
        </ClientLayout>
      </body>
    </html>
  );
}
