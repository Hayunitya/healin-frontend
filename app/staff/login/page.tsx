"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { useStaffAuthStore } from "@/store/staffAuthStore";
import type { UserRole } from "@/types";

export default function StaffLoginPage() {
  const router = useRouter();
  const { setStaffAuth } = useStaffAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("counselor");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || password.length < 6) {
      alert("Invalid credentials");
      return;
    }

    setStaffAuth(
      {
        id: "staff-1",
        username,
        role,
        createdAt: new Date().toISOString(),
      },
      "mock-staff-token"
    );

    router.push(role === "admin" ? "/admin" : "/dashboard/counselor");
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Staff Log In</h1>
        <p className="mt-4 text-gray-500">
          Khusus counselor dan admin platform Heal.in
        </p>
      </div>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-blue-500"
          >
            <option value="counselor">Counselor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Username</label>
          <input
            type="text"
            placeholder="username staff"
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

        <button className="w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600">
          Log In
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
