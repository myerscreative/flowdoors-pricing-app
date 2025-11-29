import type { Metadata } from "next";
import { Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import BottomNavigationWrapper from "@/components/BottomNavigationWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "VibePoint - Understand Your Emotional Patterns",
  description: "Track your focus, self-talk, and physical sensations—the three ingredients that create your emotional states—and discover the patterns behind what you feel.",
  icons: {
    icon: '/logo-icon.svg',
    apple: '/logo-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${fraunces.variable} antialiased`}
      >
        {children}
        <BottomNavigationWrapper />
      </body>
    </html>
  );
}
