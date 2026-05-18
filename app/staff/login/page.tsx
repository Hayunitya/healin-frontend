"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useStaffAuthStore } from "@/store/staffAuthStore";
import api from "@/lib/api";

export default function StaffLoginPage() {
  const router = useRouter();
  const { setStaffAuth } = useStaffAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post<{
        token: string;
        user: { id: string; username: string; role: string; created_at: string };
      }>("/auth/login", { username, password });

      const { token, user } = response.data;

      if (user.role !== "counselor") {
        setError("Akses ditolak. Akun ini bukan counselor.");
        return;
      }

      setStaffAuth(
        { id: user.id, username: user.username, role: "counselor", createdAt: user.created_at },
        token
      );
      router.push("/dashboard/counselor");
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

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Counselor Log In</h1>
        <p className="mt-4 text-gray-500">Khusus counselor platform Heal.in</p>
      </div>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Username</label>
          <input
            type="text"
            placeholder="username counselor"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="********"
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

      <p className="mt-5 text-center text-sm text-gray-600">
        Belum punya akun counselor?{" "}
        <Link href="/staff/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
