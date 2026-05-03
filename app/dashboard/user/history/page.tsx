"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/navigation/AppNavbar";
import { useAnonymousStore } from "@/store/anonymousStore";
import { getSessionsByUser, type SessionRecord } from "@/lib/services/sessions";

type SortKey = "created_at" | "status" | "topic";
type SortOrder = "asc" | "desc";

export default function UserHistoryPage() {
  const router = useRouter();
  const { profile, isAnonymousActive, clearAnonymousProfile } = useAnonymousStore();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "matched" | "closed">(
    "all"
  );
  const [topicFilter, setTopicFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const userId = profile?.anonymousUserId;

  const loadSessions = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getSessionsByUser(userId);
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const topicOptions = useMemo(() => {
    const topics = Array.from(new Set(sessions.map((session) => session.topic).filter(Boolean)));
    return topics as string[];
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const byStatus = statusFilter === "all" || session.status === statusFilter;
      const byTopic = topicFilter === "all" || session.topic === topicFilter;
      const byQuery =
        query.trim() === "" ||
        session.id.toLowerCase().includes(query.toLowerCase()) ||
        (session.topic ?? "").toLowerCase().includes(query.toLowerCase());
      return byStatus && byTopic && byQuery;
    });
  }, [sessions, statusFilter, topicFilter, query]);

  const sortedSessions = useMemo(() => {
    const copied = [...filteredSessions];
    copied.sort((a, b) => {
      let base = 0;
      if (sortKey === "created_at") base = +new Date(a.created_at) - +new Date(b.created_at);
      if (sortKey === "status") base = a.status.localeCompare(b.status);
      if (sortKey === "topic") base = (a.topic ?? "").localeCompare(b.topic ?? "");
      return sortOrder === "asc" ? base : -base;
    });
    return copied;
  }, [filteredSessions, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedSessions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSessions.slice(start, start + pageSize);
  }, [sortedSessions, currentPage, pageSize]);

  const filteredStats = useMemo(
    () => ({
      waiting: filteredSessions.filter((s) => s.status === "waiting").length,
      matched: filteredSessions.filter((s) => s.status === "matched").length,
      closed: filteredSessions.filter((s) => s.status === "closed").length,
    }),
    [filteredSessions]
  );

  if (!isAnonymousActive || !profile) {
    return (
      <main className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <h1 className="text-2xl font-bold text-gray-900">Anonymous Session Not Found</h1>
          <p className="mt-3 text-gray-600">Kamu belum punya identitas anonim aktif.</p>
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
    <main className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white">
      <AppNavbar
        title="User Session History"
        subtitle="Audit dan lacak semua riwayat konsultasi"
        roleLabel="Anonymous User"
        identityLabel={`${profile.anonymousHandle} • ${profile.anonymousUserId}`}
        links={[
          { label: "Dashboard", href: "/dashboard/user" },
          { label: "History", href: "/dashboard/user/history" },
        ]}
        onLogout={() => {
          clearAnonymousProfile();
          router.push("/login");
        }}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari session id / topic"
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 md:col-span-2"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | "waiting" | "matched" | "closed");
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="matched">Matched</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={topicFilter}
              onChange={(e) => {
                setTopicFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Topics</option>
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredSessions.length} dari {sessions.length} session.
            </p>
            <div className="flex items-center gap-2">
              <select
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </select>
              <select
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value as SortKey);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="created_at">Sort: Created At</option>
                <option value="status">Sort: Status</option>
                <option value="topic">Sort: Topic</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as SortOrder);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <button
                onClick={loadSessions}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Waiting</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{filteredStats.waiting}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Matched</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{filteredStats.matched}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Closed</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{filteredStats.closed}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Session</h2>
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
                {paginatedSessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-100">
                    <td className="py-3 font-mono text-xs text-gray-700">{session.id}</td>
                    <td className="py-3 text-gray-800">{session.topic ?? "-"}</td>
                    <td className="py-3 capitalize text-gray-800">{session.status}</td>
                    <td className="py-3 text-gray-600">
                      {new Date(session.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/chat/${session.id}?role=user`}
                        className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                      >
                        Open Chat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && paginatedSessions.length === 0 ? (
              <p className="py-6 text-center text-gray-500">Tidak ada session sesuai filter.</p>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • Showing{" "}
              {sortedSessions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              -{Math.min(currentPage * pageSize, sortedSessions.length)} of {sortedSessions.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
