"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/navigation/AppNavbar";
import { useStaffAuthStore } from "@/store/staffAuthStore";
import {
  getReports,
  markReportReviewed,
  type SessionReport,
} from "@/lib/services/sessions";

export default function CounselorReportsPage() {
  const router = useRouter();
  const { staff, clearStaffAuth } = useStaffAuthStore();
  const [reports, setReports] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "reviewed">("all");

  const loadReports = async () => {
    setLoading(true);
    const data = await getReports();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    if (filter === "all") return reports;
    return reports.filter((report) => report.status === filter);
  }, [reports, filter]);

  const handleMarkReviewed = async (reportId: string) => {
    setUpdatingId(reportId);
    await markReportReviewed(reportId);
    await loadReports();
    setUpdatingId(null);
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-[#edf4ff] to-white">
      <AppNavbar
        title="Counselor Reports"
        subtitle="Pantau dan tindak lanjut laporan session"
        roleLabel="Counselor"
        identityLabel={staff?.username || "Counselor"}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Laporan Konsultasi</h2>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "open" | "reviewed")}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="reviewed">Reviewed</option>
              </select>
              <button
                onClick={loadReports}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-3">Report ID</th>
                  <th className="py-3">Session</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Reporter</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 align-top">
                    <td className="py-3 font-mono text-xs text-gray-700">{report.id}</td>
                    <td className="py-3 font-mono text-xs text-gray-700">{report.session_id}</td>
                    <td className="py-3 text-gray-800">{report.category}</td>
                    <td className="py-3 text-gray-800 capitalize">{report.reporter_role}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          report.status === "open"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {report.status === "open" ? (
                        <button
                          onClick={() => handleMarkReviewed(report.id)}
                          disabled={updatingId === report.id}
                          className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
                        >
                          {updatingId === report.id ? "Updating..." : "Mark Reviewed"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filteredReports.length === 0 ? (
            <p className="mt-6 text-center text-sm text-gray-500">Belum ada laporan.</p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-bold text-slate-900">Detail Laporan</h3>
          <p className="mt-2 text-sm text-slate-600">
            Laporan detail akan ditampilkan dari kolom detail saat backend final terpasang.
          </p>
        </section>
      </div>
    </main>
  );
}
