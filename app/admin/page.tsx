"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminDeleteReport,
  adminDeleteSession,
  adminDeleteUser,
  adminUpdateSession,
  adminUpdateUser,
  getAdminOverview,
  getAllCounselors,
  getAllSessions,
  getAllUsers,
  getEscalations,
  getReports,
  markReportReviewed,
  resolveEscalation,
  suspendCounselor,
  unsuspendCounselor,
  type CounselorRecord,
  type EscalationRecord,
  type SessionRecord,
  type SessionReport,
} from "@/lib/services/sessions";
import { useStaffAuthStore } from "@/store/staffAuthStore";

type Tab = "overview" | "users" | "sessions" | "reports" | "counselors" | "escalations";

interface AdminOverview {
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  totalReports: number;
  sessionsByStatus: { waiting: number; matched: number; closed: number };
  reportsByStatus: { open: number; reviewed: number };
}

interface AdminUser {
  id: string;
  anon_handle: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { staff, clearStaffAuth } = useStaffAuthStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [counselors, setCounselors] = useState<CounselorRecord[]>([]);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [o, u, s, r, c, e] = await Promise.all([
      getAdminOverview(),
      getAllUsers(),
      getAllSessions(),
      getReports(),
      getAllCounselors().catch(() => [] as CounselorRecord[]),
      getEscalations().catch(() => [] as EscalationRecord[]),
    ]);
    setOverview(o as AdminOverview);
    setUsers(u as AdminUser[]);
    setSessions(s as SessionRecord[]);
    setReports(r as SessionReport[]);
    setCounselors(c);
    setEscalations(e);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, []);

  const waitingPct = useMemo(() => {
    const total = overview?.totalSessions ?? 0;
    if (!total) return 0;
    return Math.round(((overview?.sessionsByStatus?.waiting ?? 0) / total) * 100);
  }, [overview]);

  const handleLogout = () => {
    clearStaffAuth();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#eef1f5]">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-blue-200 bg-white">
          <div className="bg-linear-to-r from-[#3c5af5] to-[#6375ff] px-5 py-6 text-white">
            <p className="text-sm uppercase tracking-wide text-blue-100">Heal.in</p>
            <h1 className="mt-1 text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="space-y-1 p-4">
            {[
              ["overview", "Dashboard"],
              ["users", "Manage Users"],
              ["sessions", "Manage Sessions"],
              ["reports", "Manage Reports"],
              ["counselors", "Manage Counselors"],
              ["escalations", `Escalations${escalations.length > 0 ? ` (${escalations.length})` : ""}`],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  tab === key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between bg-linear-to-r from-[#3c5af5] to-[#6375ff] px-6 py-4 text-white">
            <div>
              <h2 className="text-lg font-semibold">Welcome, {staff?.username || "Admin"}</h2>
              <p className="text-xs text-blue-100">Full control and moderation access</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAll}
                className="rounded-lg border border-white/30 px-3 py-2 text-sm hover:bg-white/10"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Log Out
              </button>
            </div>
          </header>

          <div className="space-y-6 p-6">
            {tab === "overview" ? (
              <>
                <div className="grid gap-3 md:grid-cols-4">
                  <KpiCard title="Total Users" value={overview?.totalUsers ?? 0} accent="text-blue-600" />
                  <KpiCard title="Total Sessions" value={overview?.totalSessions ?? 0} accent="text-indigo-600" />
                  <KpiCard title="Total Reports" value={overview?.totalReports ?? 0} accent="text-amber-600" />
                  <KpiCard title="Total Messages" value={overview?.totalMessages ?? 0} accent="text-emerald-600" />
                </div>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Operational Snapshot</h3>
                    <div className="mt-5 space-y-3 text-sm">
                      <p className="text-gray-700">
                        Waiting sessions: <span className="font-bold">{overview?.sessionsByStatus?.waiting ?? 0}</span>
                      </p>
                      <div className="h-3 w-full rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${waitingPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{waitingPct}% of all sessions are still waiting.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Reports Status</h3>
                    <div className="mt-5 space-y-2 text-sm text-gray-700">
                      <p>Open: {overview?.reportsByStatus?.open ?? 0}</p>
                      <p>Reviewed: {overview?.reportsByStatus?.reviewed ?? 0}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {tab === "users" ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2">ID</th>
                        <th className="py-2">Handle</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100">
                          <td className="py-2 font-mono text-xs">{user.id}</td>
                          <td className="py-2">
                            <input
                              defaultValue={user.anon_handle}
                              onBlur={async (e) => {
                                await adminUpdateUser(user.id, { anon_handle: e.target.value });
                                await loadAll();
                              }}
                              className="rounded border border-gray-200 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="py-2">
                            <button
                              onClick={async () => {
                                await adminDeleteUser(user.id);
                                await loadAll();
                              }}
                              className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {tab === "sessions" ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Manage Sessions</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2">ID</th>
                        <th className="py-2">Topic</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session.id} className="border-b border-gray-100">
                          <td className="py-2 font-mono text-xs">{session.id}</td>
                          <td className="py-2">
                            <input
                              defaultValue={session.topic ?? ""}
                              onBlur={async (e) => {
                                await adminUpdateSession(session.id, { topic: e.target.value });
                                await loadAll();
                              }}
                              className="rounded border border-gray-200 px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="py-2">
                            <select
                              defaultValue={session.status}
                              onChange={async (e) => {
                                await adminUpdateSession(session.id, {
                                  status: e.target.value as "waiting" | "matched" | "closed",
                                });
                                await loadAll();
                              }}
                              className="rounded border border-gray-200 px-2 py-1 text-sm"
                            >
                              <option value="waiting">waiting</option>
                              <option value="matched">matched</option>
                              <option value="closed">closed</option>
                            </select>
                          </td>
                          <td className="py-2">
                            <button
                              onClick={async () => {
                                await adminDeleteSession(session.id);
                                await loadAll();
                              }}
                              className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {tab === "reports" ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Manage Reports</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2">Category</th>
                        <th className="py-2 max-w-xs">Detail Laporan</th>
                        <th className="py-2">Session</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-100 align-top">
                          <td className="py-2 font-medium text-gray-800">{report.category}</td>
                          <td className="py-2 max-w-xs text-sm text-gray-700 whitespace-pre-wrap">{report.detail ?? "-"}</td>
                          <td className="py-2">
                            {report.session_id ? (
                              <a
                                href={`/chat/${report.session_id}?role=counselor`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-xs text-blue-600 underline hover:text-blue-800"
                              >
                                {report.session_id.slice(0, 8)}…
                              </a>
                            ) : "-"}
                          </td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${report.status === "open" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              {report.status === "open" ? (
                                <button
                                  onClick={async () => {
                                    await markReportReviewed(report.id);
                                    await loadAll();
                                  }}
                                  className="rounded border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                >
                                  Mark Reviewed
                                </button>
                              ) : null}
                              <button
                                onClick={async () => {
                                  await adminDeleteReport(report.id);
                                  await loadAll();
                                }}
                                className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
            {tab === "counselors" ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Manage Counselors</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aktifkan konselor baru yang menunggu persetujuan, atau suspend konselor yang melanggar.
                </p>
                {counselors.some((c) => !c.is_active) && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                    Ada {counselors.filter((c) => !c.is_active).length} konselor menunggu persetujuan.
                  </p>
                )}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2">Nama</th>
                        <th className="py-2">Email</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {counselors.map((c) => (
                        <tr key={c.id} className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-800">{c.name ?? c.display_name ?? "-"}</td>
                          <td className="py-2 text-gray-600">{c.email}</td>
                          <td className="py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                c.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {c.is_active ? "Aktif" : "Tersuspensi"}
                            </span>
                          </td>
                          <td className="py-2">
                            {c.is_active ? (
                              <button
                                onClick={async () => {
                                  await suspendCounselor(c.id);
                                  await loadAll();
                                }}
                                className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  await unsuspendCounselor(c.id);
                                  await loadAll();
                                }}
                                className="rounded border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                              >
                                Aktifkan
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {counselors.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                            Belum ada konselor terdaftar.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {tab === "escalations" ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Escalations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Pesan berisiko tinggi yang belum ditangani. Prioritaskan sesi dengan status waiting.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2">Session</th>
                        <th className="py-2">Status Sesi</th>
                        <th className="py-2 max-w-xs">Isi Pesan</th>
                        <th className="py-2">Waktu</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escalations.map((esc) => (
                        <tr key={esc.id} className="border-b border-gray-100 align-top">
                          <td className="py-2">
                            <a
                              href={`/chat/${esc.session_id}?role=counselor`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs text-blue-600 underline hover:text-blue-800"
                            >
                              {esc.session_id.slice(0, 8)}...
                            </a>
                          </td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                              esc.session_status === "waiting"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {esc.session_status}
                            </span>
                          </td>
                          <td className="py-2 max-w-xs text-sm text-gray-700 break-words">
                            {esc.message_body ?? "-"}
                          </td>
                          <td className="py-2 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(esc.created_at).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={async () => {
                                await resolveEscalation(esc.id);
                                await loadAll();
                              }}
                              className="rounded border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))}
                      {escalations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                            Tidak ada eskalasi aktif.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function KpiCard({ title, value, accent }: { title: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
