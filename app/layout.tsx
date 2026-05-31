import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
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
  themeColor: "#E85C51",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${plusJakartaSans.variable} font-sans antialiased`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
