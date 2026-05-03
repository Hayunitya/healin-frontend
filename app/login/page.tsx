"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { createAnonymousUser } from "@/lib/services/anonymous";
import { useAnonymousStore } from "@/store/anonymousStore";
import { useStaffAuthStore } from "@/store/staffAuthStore";

export default function LoginChooserPage() {
  const router = useRouter();
  const { setAnonymousProfile } = useAnonymousStore();
  const { clearStaffAuth } = useStaffAuthStore();
  const [creatingUser, setCreatingUser] = useState(false);

  const handleCounselorRoute = () => {
    clearStaffAuth();
    router.push("/staff/login");
  };

  const handleAdminRoute = () => {
    clearStaffAuth();
    router.push("/admin/login");
  };

  const handleUserLogin = async () => {
    try {
      setCreatingUser(true);
      const profile = await createAnonymousUser();
      setAnonymousProfile({
        anonymousUserId: profile.id,
        anonymousHandle: profile.anon_handle,
        createdAt: profile.created_at,
      });
      router.push("/anonymous/start");
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Masuk ke Heal.in</h1>
        <p className="mt-3 text-gray-600">
          Pilih peran kamu untuk melanjutkan.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <button
          onClick={handleUserLogin}
          disabled={creatingUser}
          className="block w-full rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left transition hover:bg-blue-100 disabled:opacity-70"
        >
          <p className="text-lg font-semibold text-blue-700">User Biasa</p>
          <p className="mt-1 text-sm text-blue-600">
            Langsung dapat Anonymous User ID dan masuk dashboard user.
          </p>
          {creatingUser ? <p className="mt-2 text-xs text-blue-700">Membuat ID...</p> : null}
        </button>

        <button
          onClick={handleCounselorRoute}
          className="block w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:bg-gray-50"
        >
          <p className="text-lg font-semibold text-gray-900">Counselor</p>
          <p className="mt-1 text-sm text-gray-600">
            Masuk dengan akun counselor (login/register).
          </p>
        </button>

        <button
          onClick={handleAdminRoute}
          className="block w-full rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-left transition hover:bg-indigo-100"
        >
          <p className="text-lg font-semibold text-indigo-800">Admin</p>
          <p className="mt-1 text-sm text-indigo-700">
            Masuk ke dashboard admin melalui halaman login admin khusus.
          </p>
        </button>
      </div>
    </AuthLayout>
  );
}
