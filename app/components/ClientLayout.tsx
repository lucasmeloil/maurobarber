'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/app/components/Navbar";
import MobileMenu from "@/app/components/MobileMenu";
import Footer from "@/app/components/Footer";
import WhatsAppFloatingButton from "@/app/components/WhatsAppButton";
import { AppProvider } from "@/app/context/AppContext";
import { ToastProvider } from "@/app/context/ToastContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <AppProvider>
        <ToastProvider>
            {!isAdmin && <Navbar />}
            <main className={!isAdmin ? "pt-0 md:pt-[80px] pb-[80px] md:pb-0 min-h-screen" : ""}>
                {children}
            </main>
            {!isAdmin && <Footer />}
            {!isAdmin && <WhatsAppFloatingButton />}
            {!isAdmin && <MobileMenu />}
        </ToastProvider>
    </AppProvider>
  );
}
