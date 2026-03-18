import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "MoatCheck — AI Startup Idea Validator",
  description:
    "Stress-test your startup idea with AI. Get MOAT analysis, competitor research, success/failure comparisons, and AI disruption risk scoring — powered by DigitalOcean Gradient.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
