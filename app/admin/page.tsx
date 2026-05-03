"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/navigation/AppNavbar";
import { useStaffAuthStore } from "@/store/staffAuthStore";
import { getAdminOverview } from "@/lib/services/sessions";

interface AdminOverview {
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  totalReports: number;
  sessionsByStatus: { waiting: number; matched: number; closed: number };
  reportsByStatus: { open: number; reviewed: number };
  recentSessions: Array<{
    id: string;
    topic: string | null;
    status: string;
    created_at: string;
  }>;
  recentReports: Array<{
    id: string;
    session_id: string;
    category: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { staff, clearStaffAuth } = useStaffAuthStore();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOverview = async () => {
    setLoading(true);
    const data = await getAdminOverview();
    setOverview(data as AdminOverview);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOverview();
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white">
      <AppNavbar
        title="Admin Dashboard"
        subtitle="Monitoring platform Heal.in"
        roleLabel="Admin"
        identityLabel={staff?.username || "Admin"}
        links={[
          { label: "Admin", href: "/admin" },
          { label: "Counselor Reports", href: "/dashboard/counselor/reports" },
        ]}
        onLogout={() => {
          clearStaffAuth();
          router.push("/login");
        }}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-bold text-gray-900">Ringkasan Platform</h2>
          <button
            onClick={loadOverview}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Users</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overview?.totalUsers ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Sessions</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overview?.totalSessions ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Messages</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overview?.totalMessages ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Reports</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overview?.totalReports ?? 0}</p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <h3 className="text-lg font-bold text-gray-900">Session Status</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>Waiting: {overview?.sessionsByStatus.waiting ?? 0}</p>
              <p>Matched: {overview?.sessionsByStatus.matched ?? 0}</p>
              <p>Closed: {overview?.sessionsByStatus.closed ?? 0}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <h3 className="text-lg font-bold text-gray-900">Report Status</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>Open: {overview?.reportsByStatus.open ?? 0}</p>
              <p>Reviewed: {overview?.reportsByStatus.reviewed ?? 0}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <h3 className="text-lg font-bold text-gray-900">Recent Sessions</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2">ID</th>
                    <th className="py-2">Topic</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(overview?.recentSessions ?? []).map((session) => (
                    <tr key={session.id} className="border-b border-gray-100">
                      <td className="py-2 font-mono text-xs">{session.id}</td>
                      <td className="py-2">{session.topic ?? "-"}</td>
                      <td className="py-2 capitalize">{session.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            <h3 className="text-lg font-bold text-gray-900">Recent Reports</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2">ID</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(overview?.recentReports ?? []).map((report) => (
                    <tr key={report.id} className="border-b border-gray-100">
                      <td className="py-2 font-mono text-xs">{report.id}</td>
                      <td className="py-2">{report.category}</td>
                      <td className="py-2 capitalize">{report.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
