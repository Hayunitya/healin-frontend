"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";

export default function StaffRegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || password.length < 6) {
      alert("Username/password tidak valid.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Konfirmasi password tidak sama.");
      return;
    }

    alert("Register counselor berhasil (dummy). Silakan login.");
    router.push("/staff/login");
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Counselor Register</h1>
        <p className="mt-3 text-gray-600">Buat akun staff untuk mengakses dashboard counselor.</p>
      </div>

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>
        <button className="w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600">
          Register
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/staff/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Log In
        </Link>
      </p>
    </AuthLayout>
  );
}
