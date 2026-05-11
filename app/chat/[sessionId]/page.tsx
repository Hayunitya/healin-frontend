"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getMessages,
  getSessionById,
  reportSession,
  sendMessage,
  type SessionMessage,
} from "@/lib/services/sessions";
import AppNavbar from "@/components/navigation/AppNavbar";
import { useAnonymousStore } from "@/store/anonymousStore";
import { useStaffAuthStore } from "@/store/staffAuthStore";

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
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reportCategory, setReportCategory] = useState("abuse");
  const [reportDetail, setReportDetail] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMessages(sessionId);
      setMessages(data);
    } catch {
      setError("Gagal mengambil messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (role !== "user") return;
      const session = await getSessionById(sessionId);
      if (!session || !profile || session.user_id !== profile.anonymousUserId) {
        setAccessDenied(true);
      }
    };
    void checkOwnership();
  }, [role, sessionId, profile]);

  const riskAlerts = useMemo(
    () => messages.filter((msg) => Boolean(msg.risk_level)),
    [messages]
  );

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    try {
      setSending(true);
      setError("");
      await sendMessage(sessionId, {
        sender: role,
        body: draft.trim(),
      });
      setDraft("");
      await loadMessages();
    } catch {
      setError("Gagal mengirim message.");
    } finally {
      setSending(false);
    }
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
      setReportMessage("Laporan berhasil dikirim (dummy).");
    } catch {
      setReportMessage("Gagal mengirim laporan.");
    } finally {
      setReporting(false);
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
          if (role === "counselor") {
            clearStaffAuth();
          } else {
            clearAnonymousProfile();
          }
          router.push("/login");
        }}
      />
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {accessDenied ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-800">Akses Ditolak</h2>
            <p className="mt-2 text-sm text-red-700">
              Session ini bukan milik anonymous ID kamu.
            </p>
            <Link
              href="/dashboard/user"
              className="mt-4 inline-block rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Kembali ke Dashboard
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Session Chat</p>
                  <h1 className="mt-1 text-2xl font-bold text-gray-900">{sessionId}</h1>
                  <p className="mt-1 text-sm text-gray-600">Role: {role}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadMessages}
                    className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                  <Link
                    href={role === "counselor" ? "/dashboard/counselor" : "/dashboard/user"}
                    className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </section>

            {riskAlerts.length > 0 ? (
              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                  Risk Detection Alerts
                </h2>
                <div className="mt-3 space-y-2 text-sm text-amber-900">
                  {riskAlerts.slice(-3).map((msg) => (
                    <p key={msg.id}>
                      {msg.risk_level?.toUpperCase()} -{" "}
                      {msg.risk_reasons?.[0] || msg.risk_reason || "Sensitive content detected."}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            {riskAlerts.length > 0 ? (
              <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700">
                  Emergency Help
                </h2>
                <p className="mt-2 text-sm text-red-900">
                  Jika ada risiko bahaya langsung, hubungi bantuan darurat secepatnya.
                </p>
                <div className="mt-3 grid gap-2 text-sm text-red-900 md:grid-cols-3">
                  <p className="rounded-xl bg-white px-3 py-2">119 ext. 8 (SEJIWA)</p>
                  <p className="rounded-xl bg-white px-3 py-2">112 (Layanan Darurat)</p>
                  <p className="rounded-xl bg-white px-3 py-2">119 (Ambulans)</p>
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const ownMessage = msg.sender === role;
                  return (
                    <div key={msg.id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          ownMessage ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p className="mb-1 text-[11px] uppercase opacity-70">{msg.sender}</p>
                        <p>{msg.body}</p>
                      </div>
                    </div>
                  );
                })}
                {!loading && messages.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-500">Belum ada pesan.</p>
                ) : null}
              </div>

              <form onSubmit={handleSend} className="mt-4 flex gap-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-blue-500"
                />
                <button
                  disabled={sending}
                  className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
              {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
            </section>

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
