"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAnonymousStore } from "@/store/anonymousStore";
import {
  closeSession,
  createSession,
  getSessionsByUser,
  type SessionRecord,
} from "@/lib/services/sessions";

const TOPICS = [
  "Anxiety",
  "Stress",
  "Relationship",
  "Academic Pressure",
  "Family",
  "Self-Esteem",
];

export default function UserDashboardPage() {
  const { profile, isAnonymousActive } = useAnonymousStore();
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [creating, setCreating] = useState(false);
  const [closingSessionId, setClosingSessionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const userId = profile?.anonymousUserId;

  const loadSessions = async () => {
    if (!userId) return;
    try {
      setLoadingSessions(true);
      const data = await getSessionsByUser(userId);
      setSessions(data);
    } catch {
      setError("Gagal mengambil riwayat session.");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCreateSession = async () => {
    if (!userId) return;
    try {
      setCreating(true);
      setError("");
      await createSession({
        user_id: userId,
        topic: selectedTopic,
      });
      await loadSessions();
    } catch {
      setError("Gagal membuat session baru.");
    } finally {
      setCreating(false);
    }
  };

  const waitingCount = useMemo(
    () => sessions.filter((session) => session.status === "waiting").length,
    [sessions]
  );

  const handleCloseSession = async (sessionId: string) => {
    try {
      setError("");
      setClosingSessionId(sessionId);
      await closeSession(sessionId);
      await loadSessions();
    } catch {
      setError("Gagal menutup session.");
    } finally {
      setClosingSessionId(null);
    }
  };

  if (!isAnonymousActive || !profile) {
    return (
      <main className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <h1 className="text-2xl font-bold text-gray-900">Anonymous Session Not Found</h1>
          <p className="mt-3 text-gray-600">
            Kamu belum punya identitas anonim aktif. Mulai sesi baru dulu.
          </p>
          <Link
            href="/anonymous/start"
            className="mt-6 inline-block rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Start Anonymous Chat
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Anonymous User</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{profile.anonymousHandle}</h1>
          <p className="mt-1 text-sm text-gray-600">ID: {profile.anonymousUserId}</p>
        </section>

        <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl font-bold text-gray-900">Mulai Konsultasi</h2>
            <p className="mt-2 text-gray-600">
              Pilih topik, lalu buat session baru. Session akan masuk ke antrean counselor.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {TOPICS.map((topic) => {
                const active = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-blue-500 text-white shadow"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleCreateSession}
              disabled={creating}
              className="mt-8 rounded-2xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating..." : "Start Session"}
            </button>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <h3 className="text-lg font-semibold text-gray-900">Ringkasan</h3>
            <p className="mt-4 text-sm text-gray-600">Total Session</p>
            <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
            <p className="mt-4 text-sm text-gray-600">Waiting</p>
            <p className="text-3xl font-bold text-blue-600">{waitingCount}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Riwayat Session</h2>
            <button
              onClick={loadSessions}
              className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            >
              {loadingSessions ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-3">Session ID</th>
                  <th className="py-3">Topic</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Created</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-100">
                    <td className="py-3 font-mono text-xs text-gray-700">{session.id}</td>
                    <td className="py-3 text-gray-800">{session.topic ?? "-"}</td>
                    <td className="py-3 capitalize text-gray-800">{session.status}</td>
                    <td className="py-3 text-gray-600">
                      {new Date(session.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/chat/${session.id}?role=user`}
                          className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                        >
                          Open Chat
                        </Link>
                        {session.status !== "closed" ? (
                          <button
                            onClick={() => handleCloseSession(session.id)}
                            disabled={closingSessionId === session.id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            {closingSessionId === session.id ? "Closing..." : "Close"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loadingSessions && sessions.length === 0 ? (
              <p className="py-6 text-center text-gray-500">Belum ada session.</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
