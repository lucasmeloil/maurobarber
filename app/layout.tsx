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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mauro Barber",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
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

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
