"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAnonymousStore } from "@/store/anonymousStore";

const handlePool = ["CalmRiver", "BrightSky", "SilentLeaf", "KindEcho"];

function generateAnonymousProfile() {
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  const randomHandle = `${handlePool[Math.floor(Math.random() * handlePool.length)]}${random.slice(
    0,
    3
  )}`;

  return {
    anonymousUserId: `ANON-${random}`,
    anonymousHandle: randomHandle,
    createdAt: new Date().toISOString(),
  };
}

export default function StartAnonymousPage() {
  const router = useRouter();
  const { setAnonymousProfile } = useAnonymousStore();
  const [createdId, setCreatedId] = useState<string | null>(null);

  const hint = useMemo(
    () =>
      "Simpan Anonymous User ID ini. Kamu membutuhkannya untuk membuka riwayat konsultasi nanti.",
    []
  );

  const handleStart = () => {
    const profile = generateAnonymousProfile();
    setAnonymousProfile(profile);
    setCreatedId(profile.anonymousUserId);
  };

  const goToDashboard = () => {
    router.push("/dashboard/user");
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold text-gray-900">Start Anonymous Chat</h1>
      <p className="mt-3 text-sm text-gray-600">
        Buat identitas anonim tanpa nama asli dan tanpa email.
      </p>

      {!createdId ? (
        <button
          onClick={handleStart}
          className="mt-8 w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600"
        >
          Create Anonymous User
        </button>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
              Anonymous User ID
            </p>
            <p className="mt-2 break-all text-xl font-bold text-blue-900">{createdId}</p>
          </div>
          <p className="text-sm text-gray-600">{hint}</p>
          <button
            onClick={goToDashboard}
            className="w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600"
          >
            Continue to User Dashboard
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
