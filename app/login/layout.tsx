import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mauro Barber - Gestão | Login",
  description: "Acesso exclusivo administrativo Mauro Barber.",
  manifest: "/manifest-admin.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mauro Gestão",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

