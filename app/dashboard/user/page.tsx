"use client";

import Link from "next/link";
import { useAnonymousStore } from "@/store/anonymousStore";

export default function UserDashboardPage() {
  const { profile, isAnonymousActive } = useAnonymousStore();

  if (!isAnonymousActive || !profile) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Session Not Found</h1>
          <p className="mt-3 text-gray-600">
            Kamu belum punya identitas anonim aktif. Mulai sesi baru dulu.
          </p>
          <Link
            href="/anonymous/start"
            className="mt-6 inline-block rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white"
          >
            Start Anonymous Chat
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
            Anonymous User
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{profile.anonymousHandle}</h1>
          <p className="mt-2 text-gray-600">ID: {profile.anonymousUserId}</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Next Implementation Step</h2>
          <p className="mt-2 text-gray-600">
            Halaman ini siap untuk integrasi pemilihan topik, create session, dan riwayat.
          </p>
        </div>
      </div>
    </main>
  );
}
