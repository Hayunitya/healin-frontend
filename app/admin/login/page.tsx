"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useStaffAuthStore } from "@/store/staffAuthStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setStaffAuth } = useStaffAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username !== "admin" || password !== "1234567890") {
      setError("Akses admin ditolak. Kredensial tidak valid.");
      return;
    }

    setStaffAuth(
      {
        id: "staff-admin-1",
        username: "admin",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      "mock-admin-token"
    );

    router.push("/admin");
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

        <button className="w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600">
          Enter Admin Dashboard
        </button>
      </form>
    </AuthLayout>
  );
}
