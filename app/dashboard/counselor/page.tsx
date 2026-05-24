"use client";

import { useEffect, useState } from "react";
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
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningSessionId, setAssigningSessionId] = useState<string | null>(null);
  const [closingSessionId, setClosingSessionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadSessions = async () => {
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

  useEffect(() => {
    void loadSessions();
  }, []);

  const handleAssign = async (sessionId: string) => {
    if (!staff?.id) {
      setError("Sesi login tidak valid. Silakan login ulang.");
      return;
    }
    try {
      setError("");
      setAssigningSessionId(sessionId);
      await assignSession(sessionId, staff.id);
      await loadSessions();
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
      await loadSessions();
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
        identityLabel={staff?.username ?? "Counselor"}
        links={[
          { label: "Dashboard", href: "/dashboard/counselor" },
          { label: "Reports", href: "/dashboard/counselor/reports" },
        ]}
        onLogout={() => {
          clearStaffAuth();
          router.push("/login");
        }}
      />
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Counselor Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Ambil session dengan status waiting berdasarkan antrean user.
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-5 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-blue-500">Login sebagai</p>
              <p className="mt-1 font-semibold text-blue-800">{staff?.username ?? "-"}</p>
              <p className="font-mono text-xs text-blue-600">{staff?.id ?? "-"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Session Queue</h2>
            <button
              onClick={loadSessions}
              disabled={loading}
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>

          {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

          {sessions.length === 0 && !loading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Tidak ada session yang menunggu saat ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-3">Session ID</th>
                    <th className="py-3">Topic</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Dibuat</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => {
                    const canAssign = session.status === "waiting";
                    return (
                      <tr key={session.id} className="border-b border-gray-100">
                        <td className="py-3 font-mono text-xs text-gray-700">
                          {session.id.slice(0, 8)}…
                        </td>
                        <td className="py-3 text-gray-800">{session.topic ?? "-"}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              session.status === "waiting"
                                ? "bg-amber-100 text-amber-700"
                                : session.status === "matched"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {session.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-500">
                          {new Date(session.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/chat/${session.id}?role=counselor`}
                              className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                            >
                              Buka Chat
                            </Link>
                            {canAssign ? (
                              <button
                                onClick={() => handleAssign(session.id)}
                                disabled={assigningSessionId === session.id}
                                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                              >
                                {assigningSessionId === session.id ? "Assigning…" : "Assign ke Saya"}
                              </button>
                            ) : null}
                            {session.status !== "closed" ? (
                              <button
                                onClick={() => handleClose(session.id)}
                                disabled={closingSessionId === session.id}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                              >
                                {closingSessionId === session.id ? "Closing…" : "Tutup"}
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
          )}
        </section>
      </div>
    </main>
  );
}
