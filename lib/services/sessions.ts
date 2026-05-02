import {
  assignMockSession,
  closeMockSession,
  createMockMessage,
  createMockSession,
  getMockMessages,
  getMockSessionsByUser,
  getMockWaitingSessions,
  type MockMessage,
  type MockSession,
} from "@/lib/services/mockDb";

export type SessionRecord = MockSession;
export type SessionMessage = MockMessage;

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
