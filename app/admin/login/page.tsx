"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useStaffAuthStore } from "@/store/staffAuthStore";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setStaffAuth } = useStaffAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post<{
        token: string;
        user: { id: string; username: string; role: string; created_at: string };
      }>("/auth/login", { username, password });

      const { token, user } = response.data;

      if (user.role !== "admin") {
        setError("Akses ditolak. Akun ini bukan admin.");
        return;
      }

      setStaffAuth(
        { id: user.id, username: user.username, role: "admin", createdAt: user.created_at },
        token
      );
      router.push("/admin");
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
        <h1 className="text-4xl font-bold text-gray-900">Admin Access</h1>
        <p className="mt-3 text-gray-600">Halaman ini khusus administrator platform.</p>
      </div>

      <form onSubmit={handleAdminLogin} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Admin Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Admin Password</label>
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
          {loading ? "Logging in..." : "Enter Admin Dashboard"}
        </button>
      </form>
    </AuthLayout>
  );
}
