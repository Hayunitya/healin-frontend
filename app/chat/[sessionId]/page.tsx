"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getMessages, sendMessage, type SessionMessage } from "@/lib/services/sessions";
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
                  {msg.risk_reason || msg.risk_reasons?.join(", ") || "Sensitive content detected."}
                </p>
              ))}
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
      </div>
    </main>
  );
}
