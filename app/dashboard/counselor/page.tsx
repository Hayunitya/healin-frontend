"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/navigation/AppNavbar";
import { useStaffAuthStore } from "@/store/staffAuthStore";
import {
  assignSession,
  closeSession,
  getWaitingSessions,
  type SessionRecord,
} from "@/lib/services/sessions";

export default function CounselorDashboardPage() {
  const router = useRouter();
  const { staff, clearStaffAuth } = useStaffAuthStore();
  const [counselorId, setCounselorId] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("healin_counselor_id") ?? "";
  });
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningSessionId, setAssigningSessionId] = useState<string | null>(null);
  const [closingSessionId, setClosingSessionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSaveCounselorId = () => {
    localStorage.setItem("healin_counselor_id", counselorId);
  };

  const handleLoadSessions = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getWaitingSessions();
      setSessions(data);
    } catch {
      setError("Gagal mengambil data session.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (sessionId: string) => {
    if (!counselorId.trim()) {
      setError("Counselor ID wajib diisi sebelum assign.");
      return;
    }

    try {
      setError("");
      setAssigningSessionId(sessionId);
      await assignSession(sessionId, counselorId.trim());
      await handleLoadSessions();
    } catch {
      setError("Gagal assign session.");
    } finally {
      setAssigningSessionId(null);
    }
  };

  const handleClose = async (sessionId: string) => {
    try {
      setError("");
      setClosingSessionId(sessionId);
      await closeSession(sessionId);
      await handleLoadSessions();
    } catch {
      setError("Gagal close session.");
    } finally {
      setClosingSessionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white">
      <AppNavbar
        title="Counselor Dashboard"
        subtitle="Kelola waiting queue dan ambil session"
        roleLabel="Counselor"
        identityLabel={counselorId || staff?.username || "Counselor belum diatur"}
        links={[
          { label: "Dashboard", href: "/dashboard/counselor" },
          { label: "Reports", href: "/dashboard/counselor/reports" },
          { label: "Staff Login", href: "/staff/login" },
        ]}
        onLogout={() => {
          clearStaffAuth();
          router.push("/login");
        }}
      />
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <h1 className="text-3xl font-bold text-gray-900">Counselor Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Ambil session dengan status waiting berdasarkan antrean user.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <label className="mb-2 block text-sm font-medium text-gray-700">Counselor ID</label>
            <input
              value={counselorId}
              onChange={(e) => setCounselorId(e.target.value)}
              placeholder="UUID counselor dari backend"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-blue-500"
            />
            <button
              onClick={handleSaveCounselorId}
              className="mt-4 rounded-xl bg-blue-500 px-5 py-2 font-medium text-white transition hover:bg-blue-600"
            >
              Save Counselor ID
            </button>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <p className="text-sm font-medium text-gray-700">Global Waiting Queue</p>
            <p className="mt-2 text-sm text-gray-600">
              Menampilkan semua session dengan status waiting dari dummy storage.
            </p>
            <button
              onClick={handleLoadSessions}
              className="mt-4 rounded-xl bg-blue-500 px-5 py-2 font-medium text-white transition hover:bg-blue-600"
            >
              {loading ? "Loading..." : "Load Sessions"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-bold text-gray-900">Session Queue</h2>
          {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-3">Session ID</th>
                  <th className="py-3">Topic</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const canAssign = session.status === "waiting";
                  return (
                    <tr key={session.id} className="border-b border-gray-100">
                      <td className="py-3 font-mono text-xs text-gray-700">{session.id}</td>
                      <td className="py-3 text-gray-800">{session.topic ?? "-"}</td>
                      <td className="py-3 capitalize text-gray-800">{session.status}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/chat/${session.id}?role=counselor`}
                            className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                          >
                            Open Chat
                          </Link>
                          <button
                            onClick={() => handleAssign(session.id)}
                            disabled={!canAssign || assigningSessionId === session.id}
                            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {assigningSessionId === session.id ? "Assigning..." : "Assign"}
                          </button>
                          {session.status !== "closed" ? (
                            <button
                              onClick={() => handleClose(session.id)}
                              disabled={closingSessionId === session.id}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              {closingSessionId === session.id ? "Closing..." : "Close"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">Akun & Setting</h2>
          <p className="mt-2 text-sm text-slate-600">
            Simpan counselor ID untuk proses assign session.
          </p>
          <div className="mt-4 rounded-xl bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Counselor ID</p>
            <p className="mt-1 font-mono text-sm text-slate-800">{counselorId || "-"}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
