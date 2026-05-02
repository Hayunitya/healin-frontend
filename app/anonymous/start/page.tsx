"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAnonymousStore } from "@/store/anonymousStore";
import { createAnonymousUser } from "@/lib/services/anonymous";

export default function StartAnonymousPage() {
  const router = useRouter();
  const { setAnonymousProfile } = useAnonymousStore();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hint = useMemo(
    () =>
      "Simpan Anonymous User ID ini. Kamu membutuhkannya untuk membuka riwayat konsultasi nanti.",
    []
  );

  const handleStart = async () => {
    try {
      setLoading(true);
      setError("");
      const profile = await createAnonymousUser();
      setAnonymousProfile({
        anonymousUserId: profile.id,
        anonymousHandle: profile.anon_handle,
        createdAt: profile.created_at,
      });
      setCreatedId(profile.id);
    } catch {
      setError("Gagal membuat anonymous user. Cek koneksi backend kamu.");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600"
        >
          {loading ? "Creating..." : "Create Anonymous User"}
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
      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
    </AuthLayout>
  );
}
