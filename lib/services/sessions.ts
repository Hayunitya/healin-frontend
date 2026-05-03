import {
  assignMockSession,
  closeMockSession,
  createMockMessage,
  createMockReport,
  createMockSession,
  getMockMessages,
  getMockReports,
  getMockSessionsByUser,
  getMockWaitingSessions,
  markMockReportReviewed,
  type MockMessage,
  type MockReport,
  type MockSession,
} from "@/lib/services/mockDb";

export type SessionRecord = MockSession;
export type SessionMessage = MockMessage;
export type SessionReport = MockReport;

export async function createSession(payload: { user_id: string; topic: string }) {
  return createMockSession(payload);
}

export async function getSessionsByUser(user_id: string) {
  return getMockSessionsByUser(user_id);
}

export async function getWaitingSessions() {
  return getMockWaitingSessions();
}

export async function assignSession(sessionId: string, counselor_id: string) {
  return assignMockSession(sessionId, counselor_id);
}

export async function closeSession(sessionId: string) {
  return closeMockSession(sessionId);
}

export async function getMessages(sessionId: string) {
  return getMockMessages(sessionId);
}

export async function sendMessage(
  sessionId: string,
  payload: { sender: "user" | "counselor" | "system"; body: string; sender_id?: string }
) {
  void payload.sender_id;
  return createMockMessage({
    session_id: sessionId,
    sender: payload.sender,
    body: payload.body,
  });
}

export async function reportSession(
  sessionId: string,
  payload: {
    reporter_role: "user" | "counselor";
    category: string;
    detail: string;
  }
) {
  return createMockReport({
    session_id: sessionId,
    reporter_role: payload.reporter_role,
    category: payload.category,
    detail: payload.detail,
  });
}

export async function getReports() {
  return getMockReports();
}

export async function markReportReviewed(reportId: string) {
  return markMockReportReviewed(reportId);
}
