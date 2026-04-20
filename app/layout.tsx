import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { cn } from "@/lib/utils";
import Providers from "@/lib/providers";
import "./globals.css";
import type { ReactNode } from "react";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full antialiased font-sans",
        figtree.variable,
        geistSans.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}