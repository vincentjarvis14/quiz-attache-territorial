import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Quiz Attaché Territorial",
    template: "%s | Quiz Attaché Territorial",
  },
  description:
    "Préparez le concours d'Attaché Territorial avec 400+ QCM d'expert générés à partir des documents officiels. Sources PDF référencées pour chaque question.",
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
