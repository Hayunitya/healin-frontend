import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white">
      <div className="px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 transition hover:text-blue-600"
        >
          Back to Home
        </Link>
      </div>

      <div className="flex items-center justify-center px-6 pb-10">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          {children}
        </div>
      </div>
    </div>
  );
}
