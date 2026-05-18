"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAnonymousStore } from "@/store/anonymousStore";
import { useAuthStore } from "@/store/authStore";
import { useStaffAuthStore } from "@/store/staffAuthStore";
import { createAnonymousUser } from "@/lib/services/anonymous";
import api from "@/lib/api";

type View = "chooser" | "user-login";

export default function LoginPage() {
  const router = useRouter();
  const { setAnonymousProfile } = useAnonymousStore();
  const { setAuth } = useAuthStore();
  const { clearStaffAuth } = useStaffAuthStore();

  const [view, setView] = useState<View>("chooser");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnonymous = async () => {
    try {
      setLoading(true);
      const profile = await createAnonymousUser();
      setAnonymousProfile({
        anonymousUserId: profile.id,
        anonymousHandle: profile.anon_handle,
        createdAt: profile.created_at,
      });
      router.push("/dashboard/user");
    } catch {
      setError("Gagal membuat sesi anonim. Cek koneksi backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<{
        token: string;
        user: { id: string; username: string; email: string; anon_handle: string; role: string; created_at: string };
      }>("/auth/login-user", { username, password });

      const { token, user } = res.data;
      setAuth({ ...user, role: "user" }, token);

      // Set anonymous profile dari akun agar bisa masuk ke sesi
      setAnonymousProfile({
        anonymousUserId: user.id,
        anonymousHandle: user.anon_handle,
        createdAt: user.created_at,
      });
      router.push("/dashboard/user");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : null;
      setError(msg ?? "Login gagal. Periksa username dan password.");
    } finally {
      setLoading(false);
    }
  };

  if (view === "user-login") {
    return (
      <AuthLayout>
        <button
          onClick={() => { setView("chooser"); setError(""); }}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Kembali
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Login User</h1>
        <p className="mt-2 text-sm text-gray-600">Masuk dengan akun yang sudah terdaftar.</p>

        <form onSubmit={handleUserLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Masuk ke Heal.in</h1>
        <p className="mt-3 text-gray-600">Pilih cara kamu untuk melanjutkan.</p>
      </div>

      <div className="mt-8 space-y-4">
        {/* Anonim langsung */}
        <button
          onClick={handleAnonymous}
          disabled={loading}
          className="block w-full rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left transition hover:bg-blue-100 disabled:opacity-70"
        >
          <p className="text-lg font-semibold text-blue-700">Lanjut sebagai Anonim</p>
          <p className="mt-1 text-sm text-blue-600">
            Langsung mulai tanpa daftar. Identitas kamu tetap tersembunyi.
          </p>
          {loading ? <p className="mt-2 text-xs text-blue-700">Membuat sesi...</p> : null}
        </button>

        {/* Login dengan akun */}
        <button
          onClick={() => setView("user-login")}
          className="block w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:bg-gray-50"
        >
          <p className="text-lg font-semibold text-gray-900">Login dengan Akun</p>
          <p className="mt-1 text-sm text-gray-600">
            Punya akun? Riwayat sesi tersimpan dan bisa diakses kapan saja.
          </p>
        </button>

        {/* Counselor */}
        <button
          onClick={() => { clearStaffAuth(); router.push("/staff/login"); }}
          className="block w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:bg-gray-50"
        >
          <p className="text-lg font-semibold text-gray-900">Counselor</p>
          <p className="mt-1 text-sm text-gray-600">Masuk dengan akun counselor.</p>
        </button>

        {/* Admin */}
        <button
          onClick={() => { clearStaffAuth(); router.push("/admin/login"); }}
          className="block w-full rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-left transition hover:bg-indigo-100"
        >
          <p className="text-lg font-semibold text-indigo-800">Admin</p>
          <p className="mt-1 text-sm text-indigo-700">Masuk ke dashboard admin.</p>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Belum punya akun user?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </AuthLayout>
  );
}
