import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
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
        <ClerkProvider>
          <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                  RX
                </div>
                <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                  ResumeX
                </span>
              </Link>

              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  href="/"
                  className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                >
                  Optimize
                </Link>
                <Link
                  href="/jobs"
                  className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
                >
                  Find Jobs
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <SignInButton>
                  <button className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer rounded-full border border-white/10 hover:border-white/20 hover:bg-white/[0.04]">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full cursor-pointer transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 ring-2 ring-blue-500/30 hover:ring-blue-500/50 transition-all",
                    },
                  }}
                />
              </Show>
            </div>
          </header>

          <div className="pt-16">{children}</div>
          <Toaster theme="dark" position="top-center" />
        </ClerkProvider>
      </body>
    </html>
  );
}
