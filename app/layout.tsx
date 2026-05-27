import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";

import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#7C3AED",
};

export const metadata: Metadata = {
  title: "Quiz Attaché Territorial",
  description:
    "Préparez efficacement le concours d'Attaché Territorial avec des QCM experts générés par IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} ${inter.variable} font-sans`}>
        <Toaster theme="light" richColors closeButton />
        <ExitModal />
        <HeartsModal />
        <PracticeModal />
        {children}
      </body>
    </html>
  );
}
