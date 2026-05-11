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
  getMockAllSessions,
  getMockAdminOverview,
  getMockUsers,
  getMockMessages,
  getMockReports,
  getMockWaitingSessions,
  markMockReportReviewed,
  updateMockSession,
  updateMockUser,
  type MockMessage,
  type MockReport,
  type MockSession,
} from "@/lib/services/mockDb";

export type SessionRecord = MockSession;
export type SessionMessage = MockMessage & { risk_reasons?: string[] | null };
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
  const response = await api.get<{ data: SessionRecord[] }>("/sessions", {
    params: { user_id },
  });
  return response.data.data;
}

export async function getWaitingSessions() {
  return getMockWaitingSessions();
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
  payload: {
    reporter_user_id: string;
    category: string;
    detail: string;
  }
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
  return getMockReports();
}

export async function markReportReviewed(reportId: string) {
  return markMockReportReviewed(reportId);
}

export async function getAdminOverview() {
  return getMockAdminOverview();
}

export async function getAllUsers() {
  return getMockUsers();
}

export async function adminUpdateUser(id: string, payload: { anon_handle: string }) {
  return updateMockUser(id, payload);
}

export async function adminDeleteUser(id: string) {
  return deleteMockUser(id);
}

export async function getAllSessions() {
  return getMockAllSessions();
}

export async function adminUpdateSession(
  id: string,
  payload: { topic?: string | null; status?: "waiting" | "matched" | "closed" }
) {
  return updateMockSession(id, payload);
}

export async function adminDeleteSession(id: string) {
  return deleteMockSession(id);
}

export async function adminDeleteReport(id: string) {
  return deleteMockReport(id);
}
