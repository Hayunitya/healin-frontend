"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuthStore } from "@/store/authStore";
import { useAnonymousStore } from "@/store/anonymousStore";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { setAnonymousProfile } = useAnonymousStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{
        token: string;
        user: { id: string; username: string; email: string; anon_handle: string; role: string; created_at: string };
      }>("/auth/register-user", { username, email, password });

      const { token, user } = res.data;
      setAuth({ ...user, role: "user" }, token);

      // Set anonymous profile agar langsung bisa masuk ke sesi
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
      setError(msg ?? "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Buat Akun</h1>
        <p className="mt-2 text-sm text-gray-600">
          Identitas kamu tetap anonim saat konsultasi. Akun hanya untuk menyimpan riwayat sesi.
        </p>
      </div>

      <form onSubmit={handleRegister} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username kamu"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="minimal 6 karakter"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Konfirmasi Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="ulangi password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-70"
        >
          {loading ? "Mendaftar..." : "Daftar"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          Login di sini
        </Link>
      </p>
    </AuthLayout>
  );
}
