"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAnonymousStore } from "@/store/anonymousStore";
import { findAnonymousUserById } from "@/lib/services/anonymous";

export default function ContinueAnonymousPage() {
  const router = useRouter();
  const { profile, setAnonymousProfile } = useAnonymousStore();
  const [anonymousUserId, setAnonymousUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill dari localStorage jika sudah pernah login sebelumnya
  useEffect(() => {
    if (profile?.anonymousUserId && !anonymousUserId) {
      setAnonymousUserId(profile.anonymousUserId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!anonymousUserId.trim()) {
      setError("Anonymous User ID wajib diisi.");
      return;
    }

    setLoading(true);
    const user = await findAnonymousUserById(anonymousUserId.trim());
    setLoading(false);
    if (!user) {
      setError("ID tidak ditemukan. Pastikan Anonymous User ID benar.");
      return;
    }

    setAnonymousProfile({
      anonymousUserId: user.id,
      anonymousHandle: user.anon_handle,
      createdAt: user.created_at,
    });
    router.push("/dashboard/user");
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold text-gray-900">Continue Anonymous Session</h1>
      <p className="mt-3 text-sm text-gray-600">
        Masukkan Anonymous User ID untuk membuka kembali riwayat konsultasi.
      </p>

      <form onSubmit={handleContinue} className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Anonymous User ID
          </label>
          <input
            type="text"
            value={anonymousUserId}
            onChange={(e) => {
              setAnonymousUserId(e.target.value);
              setError("");
            }}
            placeholder="ANON-123456"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
          {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
        </div>

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Checking..." : "Continue"}
        </button>
      </form>
    </AuthLayout>
  );
}
