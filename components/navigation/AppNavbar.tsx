"use client";

import Link from "next/link";

interface AppNavbarProps {
  title: string;
  subtitle?: string;
  roleLabel: string;
  identityLabel: string;
  links: { label: string; href: string }[];
  onLogout: () => void;
}

export default function AppNavbar({
  title,
  subtitle,
  roleLabel,
  identityLabel,
  links,
  onLogout,
}: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{roleLabel}</p>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
        </div>

        <nav className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div>
            <p className="text-xs text-slate-500">Akun</p>
            <p className="max-w-48 truncate text-sm font-semibold text-slate-800">{identityLabel}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
