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
  title: "Mauro Barber | Estilo e Precisão",
  description: "Referência em barbearia clássica e moderna. Agende seu horário e viva essa experiência.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  themeColor: "#000000",
  icons: {
    icon: "/favicon-new.png", 
  },
  openGraph: {
    title: "Mauro Barber",
    description: "Sua barbearia de confiança agora com agendamento online.",
    url: "https://maurobarber.com.br",
    siteName: "Mauro Barber",
    locale: "pt_BR",
    type: "website",
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
