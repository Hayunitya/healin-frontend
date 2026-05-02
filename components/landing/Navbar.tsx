"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[92%] max-w-6xl -translate-x-1/2 rounded-full border border-white/20 bg-white/80 px-6 py-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-blue-500">
          Heal.in
        </Link>

        <Link
          href="/login"
          className="rounded-full bg-blue-500 px-5 py-2 text-sm text-white transition hover:bg-blue-600"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
