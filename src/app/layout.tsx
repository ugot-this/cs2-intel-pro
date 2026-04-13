import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CS2 Intel Pro — AI-Powered CS2 Match Analysis",
    template: "%s | CS2 Intel Pro",
  },
  description:
    "Premium AI-powered CS2 esports analysis, match predictions, and betting insights. Get accurate win probabilities and advanced team analytics.",
  keywords: ["CS2", "Counter-Strike", "esports", "match prediction", "betting analysis"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
