"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getMessages,
  getSessionById,
  reportSession,
  summarizeSessionById,
  type SessionMessage,
  type SessionSummary,
} from "@/lib/services/sessions";
import AppNavbar from "@/components/navigation/AppNavbar";
import { useAnonymousStore } from "@/store/anonymousStore";
import { useStaffAuthStore } from "@/store/staffAuthStore";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

export default function SessionChatPage() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId;
  const role = (searchParams.get("role") as "user" | "counselor") ?? "user";

  const { profile, clearAnonymousProfile } = useAnonymousStore();
  const { staff, clearStaffAuth } = useStaffAuthStore();

  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [reportCategory, setReportCategory] = useState("abuse");
  const [reportDetail, setReportDetail] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const senderId = role === "user" ? profile?.anonymousUserId : staff?.id;

  // Auto-scroll ke bawah tiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load riwayat pesan awal via HTTP, lalu sambungkan Socket.io
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const data = await getMessages(sessionId);
        if (mounted) setMessages(data);
      } catch {
        if (mounted) setError("Gagal mengambil riwayat pesan.");
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };

    void init();

    // Setup socket
    const socket = connectSocket();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_session", { sessionId, role, senderId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("new_message", ({ message }: { message: SessionMessage }) => {
      if (mounted) {
        setMessages((prev) => {
          // Hindari duplikat (pesan yang kita kirim sudah masuk via broadcast)
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on("session_ended", () => {
      router.push(role === "counselor" ? "/dashboard/counselor" : "/dashboard/user");
    });

    return () => {
      mounted = false;
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Verifikasi ownership untuk user
  useEffect(() => {
    if (role !== "user") return;
    const check = async () => {
      try {
        const session = await getSessionById(sessionId);
        if (!profile || session.user_id !== profile.anonymousUserId) {
          setAccessDenied(true);
        }
      } catch {
        setAccessDenied(true);
      }
    };
    void check();
  }, [role, sessionId, profile]);

  const riskAlerts = useMemo(
    () => messages.filter((msg) => Boolean(msg.risk_level)),
    [messages]
  );

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    const socket = getSocket();
    if (!socket.connected) {
      setError("Koneksi terputus. Mencoba menghubungkan kembali...");
      connectSocket();
      return;
    }

    setSending(true);
    setError("");

    socket.emit("send_message", {
      sessionId,
      body: draft.trim(),
      sender: role,
      sender_id: senderId,
    });

    setDraft("");
    setSending(false);
  };

  const handleReport = async (e: FormEvent) => {
    e.preventDefault();
    if (role !== "user") {
      setReportMessage("Hanya user yang bisa mengirim report.");
      return;
    }
    if (!profile?.anonymousUserId) {
      setReportMessage("Anonymous user ID tidak ditemukan.");
      return;
    }
    if (!reportDetail.trim()) {
      setReportMessage("Detail laporan wajib diisi.");
      return;
    }
    try {
      setReporting(true);
      setReportMessage("");
      await reportSession(sessionId, {
        reporter_user_id: profile.anonymousUserId,
        category: reportCategory,
        detail: reportDetail.trim(),
      });
      setReportDetail("");
      setReportMessage("Laporan berhasil dikirim.");
    } catch {
      setReportMessage("Gagal mengirim laporan.");
    } finally {
      setReporting(false);
    }
  };

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      setSummaryError("");
      const result = await summarizeSessionById(sessionId);
      setSummary(result);
    } catch {
      setSummaryError("Gagal membuat ringkasan. Pastikan GEMINI_API_KEY sudah diset.");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white">
      <AppNavbar
        title="Session Chat"
        subtitle={sessionId}
        roleLabel={role === "counselor" ? "Counselor" : "Anonymous User"}
        identityLabel={
          role === "counselor"
            ? staff?.username || "Counselor"
            : `${profile?.anonymousHandle ?? "User"} • ${profile?.anonymousUserId ?? "-"}`
        }
        links={[
          {
            label: role === "counselor" ? "Counselor Dashboard" : "User Dashboard",
            href: role === "counselor" ? "/dashboard/counselor" : "/dashboard/user",
          },
        ]}
        onLogout={() => {
          if (role === "counselor") clearStaffAuth();
          else clearAnonymousProfile();
          router.push("/login");
        }}
      />

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {accessDenied ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-800">Akses Ditolak</h2>
            <p className="mt-2 text-sm text-red-700">Session ini bukan milik anonymous ID kamu.</p>
            <Link
              href="/dashboard/user"
              className="mt-4 inline-block rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Kembali ke Dashboard
            </Link>
          </section>
        ) : (
          <>
            {/* Header session */}
            <section className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Session Chat</p>
                  <h1 className="mt-1 text-2xl font-bold text-gray-900 break-all">{sessionId}</h1>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    <p className="text-sm text-gray-600">
                      {connected ? "Terhubung" : "Menghubungkan..."} · Role: {role}
                    </p>
                  </div>
                </div>
                <Link
                  href={role === "counselor" ? "/dashboard/counselor" : "/dashboard/user"}
                  className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Back
                </Link>
              </div>
            </section>

            {/* Risk alerts */}
            {riskAlerts.length > 0 ? (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                  Risk Detection Alerts
                </h2>
                <div className="mt-3 space-y-2 text-sm text-amber-900">
                  {riskAlerts.slice(-3).map((msg) => (
                    <p key={msg.id}>
                      {msg.risk_level?.toUpperCase()} —{" "}
                      {(msg.risk_reasons && msg.risk_reasons[0]) ?? "Sensitive content detected."}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            {riskAlerts.length > 0 ? (
              <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700">Emergency Help</h2>
                <p className="mt-2 text-sm text-red-900">
                  Jika ada risiko bahaya langsung, hubungi bantuan darurat.
                </p>
                <div className="mt-3 grid gap-2 text-sm text-red-900 md:grid-cols-3">
                  <p className="rounded-xl bg-white px-3 py-2">119 ext. 8 (SEJIWA)</p>
                  <p className="rounded-xl bg-white px-3 py-2">112 (Layanan Darurat)</p>
                  <p className="rounded-xl bg-white px-3 py-2">119 (Ambulans)</p>
                </div>
              </section>
            ) : null}

            {/* Chat area */}
            <section className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {initialLoading ? (
                  <p className="py-10 text-center text-sm text-gray-400">Memuat pesan...</p>
                ) : messages.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-500">Belum ada pesan. Mulai percakapan.</p>
                ) : (
                  messages.map((msg) => {
                    const own = msg.sender === role;
                    return (
                      <div key={msg.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            own ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          <p className="mb-1 text-[11px] uppercase opacity-70">{msg.sender}</p>
                          <p>{msg.body}</p>
                          {msg.risk_level ? (
                            <p className={`mt-1 text-[10px] ${own ? "opacity-70" : "text-amber-600"}`}>
                              ⚠ {msg.risk_level.toUpperCase()}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="mt-4 flex gap-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-blue-500"
                />
                <button
                  disabled={sending || !connected}
                  className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
                >
                  {sending ? "..." : "Kirim"}
                </button>
              </form>
              {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
            </section>

            {/* AI Summary — counselor only */}
            {role === "counselor" ? (
              <section className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Ringkasan AI</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Generate ringkasan otomatis sesi ini menggunakan Gemini.
                    </p>
                  </div>
                  <button
                    onClick={handleSummarize}
                    disabled={summarizing}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                  >
                    {summarizing ? "Memproses..." : "Generate Ringkasan"}
                  </button>
                </div>
                {summaryError ? (
                  <p className="mt-3 text-sm text-red-500">{summaryError}</p>
                ) : null}
                {summary ? (
                  <div className="mt-4 space-y-3 rounded-2xl bg-violet-50 p-4">
                    <p className="text-sm text-violet-900">{summary.summary}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-violet-200 px-3 py-1 font-medium text-violet-800">
                        Topik: {summary.topic}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-medium ${
                          summary.risk_level === "high"
                            ? "bg-red-200 text-red-800"
                            : summary.risk_level === "medium"
                            ? "bg-amber-200 text-amber-800"
                            : summary.risk_level === "low"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        Risk: {summary.risk_level}
                      </span>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* Report section — user only */}
            {role === "user" ? (
              <section className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                <h2 className="text-lg font-bold text-gray-900">Report Session</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Laporkan perilaku yang tidak aman atau konten yang melanggar.
                </p>
                <form onSubmit={handleReport} className="mt-4 space-y-3">
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-blue-500"
                  >
                    <option value="abuse">Abusive behavior</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    value={reportDetail}
                    onChange={(e) => setReportDetail(e.target.value)}
                    rows={4}
                    placeholder="Jelaskan detail laporan..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-blue-500"
                  />
                  <button
                    disabled={reporting}
                    className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
                  >
                    {reporting ? "Submitting..." : "Submit Report"}
                  </button>
                  {reportMessage ? <p className="text-sm text-slate-600">{reportMessage}</p> : null}
                </form>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
