import api from "@/lib/api";
import {
  assignMockSession,
  closeMockSession,
  createMockMessage,
  createMockReport,
  createMockSession,
  deleteMockReport,
  deleteMockSession,
  deleteMockUser,
  getMockAdminOverview,
  getMockAllSessions,
  getMockMessages,
  getMockReports,
  getMockUsers,
  getMockWaitingSessions,
  markMockReportReviewed,
  updateMockSession,
  updateMockUser,
  type MockMessage,
  type MockReport,
  type MockSession,
} from "@/lib/services/mockDb";

export type SessionRecord = MockSession;
export type SessionMessage = MockMessage;
export type SessionReport = MockReport;

interface SessionMessagesResponse {
  data: SessionMessage[];
}

export async function createSession(payload: { user_id: string; topic?: string }) {
  try {
    const response = await api.post<SessionRecord>("/sessions", payload);
    return response.data;
  } catch {
    return createMockSession({ user_id: payload.user_id, topic: payload.topic ?? "" });
  }
}

export async function getSessionsByUser(user_id: string) {
  try {
    const response = await api.get<{ data: SessionRecord[] }>("/sessions", {
      params: { user_id },
    });
    return response.data.data;
  } catch {
    // eslint-disable-next-line no-console
    console.warn("[sessions] fallback to mock for getSessionsByUser");
    return [];
  }
}

export async function getWaitingSessions() {
  try {
    const response = await api.get<{ data: SessionRecord[] }>("/sessions", {
      params: { status: "waiting" },
    });
    return response.data.data;
  } catch {
    return getMockWaitingSessions();
  }
}

export async function assignSession(sessionId: string, counselor_id: string) {
  try {
    const response = await api.post<SessionRecord>(`/sessions/${sessionId}/assign`, {
      counselor_id,
    });
    return response.data;
  } catch {
    return assignMockSession(sessionId, counselor_id);
  }
}

export async function closeSession(sessionId: string) {
  try {
    const response = await api.post<SessionRecord>(`/sessions/${sessionId}/close`, {});
    return response.data;
  } catch {
    return closeMockSession(sessionId);
  }
}

export async function getSessionById(sessionId: string) {
  const response = await api.get<SessionRecord>(`/sessions/${sessionId}`);
  return response.data;
}

export async function getMessages(sessionId: string) {
  try {
    const response = await api.get<SessionMessagesResponse>(`/sessions/${sessionId}/messages`);
    return response.data.data;
  } catch {
    return getMockMessages(sessionId);
  }
}

export async function sendMessage(
  sessionId: string,
  payload: { sender: "user" | "counselor" | "system"; body: string; sender_id?: string }
) {
  try {
    const response = await api.post<{
      message: SessionMessage;
      risk_flag: {
        id: string;
        level: string;
        score: number;
        reasons: string[];
        created_at: string;
      } | null;
    }>(`/sessions/${sessionId}/messages`, payload);
    return response.data;
  } catch {
    return createMockMessage({
      session_id: sessionId,
      sender: payload.sender,
      body: payload.body,
    });
  }
}

export async function reportSession(
  sessionId: string,
  payload: { reporter_user_id: string; category: string; detail: string }
) {
  try {
    const response = await api.post<SessionReport>(`/sessions/${sessionId}/report`, payload);
    return response.data;
  } catch {
    return createMockReport({
      session_id: sessionId,
      reporter_user_id: payload.reporter_user_id,
      category: payload.category,
      detail: payload.detail,
    });
  }
}

export async function getReports() {
  try {
    const response = await api.get<{ data: SessionReport[] }>("/sessions/reports");
    return response.data.data;
  } catch {
    return getMockReports();
  }
}

export async function markReportReviewed(reportId: string) {
  try {
    const response = await api.patch<SessionReport>(`/sessions/reports/${reportId}/review`);
    return response.data;
  } catch {
    return markMockReportReviewed(reportId);
  }
}

export async function adminDeleteReport(id: string) {
  try {
    await api.delete(`/sessions/reports/${id}`);
  } catch {
    return deleteMockReport(id);
  }
}

export async function getAdminOverview() {
  try {
    const [usersRes, sessionsRes, reportsRes] = await Promise.all([
      api.get<{ data: unknown[] }>("/users"),
      api.get<{ data: SessionRecord[] }>("/sessions"),
      api.get<{ data: SessionReport[] }>("/sessions/reports"),
    ]);

    const sessions = sessionsRes.data.data;
    const reports = reportsRes.data.data;

    return {
      totalUsers: usersRes.data.data.length,
      totalSessions: sessions.length,
      totalMessages: 0,
      totalReports: reports.length,
      sessionsByStatus: {
        waiting: sessions.filter((s) => s.status === "waiting").length,
        matched: sessions.filter((s) => s.status === "matched").length,
        closed: sessions.filter((s) => s.status === "closed").length,
      },
      reportsByStatus: {
        open: reports.filter((r) => r.status === "open").length,
        reviewed: reports.filter((r) => r.status === "reviewed").length,
      },
      recentSessions: sessions.slice(0, 8),
      recentReports: reports.slice(0, 8),
    };
  } catch {
    return getMockAdminOverview();
  }
}

export async function getAllUsers() {
  try {
    const response = await api.get<{ data: unknown[] }>("/users");
    return response.data.data;
  } catch {
    return getMockUsers();
  }
}

export async function adminUpdateUser(id: string, payload: { anon_handle: string }) {
  try {
    const response = await api.patch(`/users/${id}`, payload);
    return response.data;
  } catch {
    return updateMockUser(id, payload);
  }
}

export async function adminDeleteUser(id: string) {
  try {
    await api.delete(`/users/${id}`);
  } catch {
    return deleteMockUser(id);
  }
}

export async function getAllSessions() {
  try {
    const response = await api.get<{ data: SessionRecord[] }>("/sessions");
    return response.data.data;
  } catch {
    return getMockAllSessions();
  }
}

export async function adminUpdateSession(
  id: string,
  payload: { topic?: string | null; status?: "waiting" | "matched" | "closed" }
) {
  try {
    const response = await api.patch<SessionRecord>(`/sessions/${id}`, payload);
    return response.data;
  } catch {
    return updateMockSession(id, payload);
  }
}

export async function adminDeleteSession(id: string) {
  try {
    await api.delete(`/sessions/${id}`);
  } catch {
    return deleteMockSession(id);
  }
}

export interface SessionSummary {
  summary: string;
  topic: string;
  risk_level: "none" | "low" | "medium" | "high";
}

export async function summarizeSessionById(sessionId: string): Promise<SessionSummary> {
  const response = await api.post<SessionSummary>(`/sessions/${sessionId}/summarize`);
  return response.data;
}
