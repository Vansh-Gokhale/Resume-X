import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeX - AI Resume Optimizer",
  description: "Premium AI-powered ATS optimizer and cold email generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-[#050505] text-white min-h-screen selection:bg-white/20`}
      >
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
