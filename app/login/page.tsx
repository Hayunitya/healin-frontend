"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AuthLayout from "@/components/auth/AuthLayout";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || password.length < 6) {
      alert("Invalid credentials");
      return;
    }

    setAuth(
      {
        id: "1",
        username,
        role: "user",
        createdAt: new Date().toISOString(),
      },
      "mock-token"
    );

    router.push("/dashboard");
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Welcome to{" "}
          <span className="text-blue-500">
            Heal.in
          </span>
        </h1>

        <p className="mt-4 text-gray-500">
          Your safe space to share
        </p>
      </div>

      {/* switch */}
      <div className="mt-8 flex rounded-full bg-gray-100 p-1">
        <Link
          href="/login"
          className="flex-1 rounded-full bg-white py-3 text-center font-medium shadow-sm"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="flex-1 py-3 text-center text-gray-500"
        >
          Register
        </Link>
      </div>

      <form
        onSubmit={handleLogin}
        className="mt-8 space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Username
          </label>

          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Password
          </label>

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
          />
        </div>

        <button className="w-full rounded-2xl bg-blue-500 py-4 font-semibold text-white transition hover:bg-blue-600">
          Log In
        </button>
      </form>
    </AuthLayout>
  );
}