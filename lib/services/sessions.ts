import api from "@/lib/api";

export interface SessionRecord {
  id: string;
  user_id: string;
  counselor_id: string | null;
  topic: string | null;
  status: "waiting" | "matched" | "closed";
  created_at: string;
  matched_at: string | null;
  closed_at: string | null;
}

export interface SessionMessage {
  id: string;
  session_id: string;
  sender: "user" | "counselor" | "system";
  body: string;
  created_at: string;
  risk_level: string | null;
  risk_score: number | null;
  risk_reason?: string | null;
  risk_reasons?: string[] | null;
}

export async function createSession(payload: { user_id: string; topic: string }) {
  const response = await api.post<SessionRecord>("/sessions", payload);
  return response.data;
}

export async function getSessionsByUser(user_id: string) {
  const response = await api.get<{ data: SessionRecord[] }>("/sessions", {
    params: { user_id },
  });
  return response.data.data;
}

export async function assignSession(sessionId: string, counselor_id: string) {
  const response = await api.post<SessionRecord>(`/sessions/${sessionId}/assign`, {
    counselor_id,
  });
  return response.data;
}

export async function closeSession(sessionId: string) {
  const response = await api.post<SessionRecord>(`/sessions/${sessionId}/close`);
  return response.data;
}

export async function getMessages(sessionId: string) {
  const response = await api.get<{ data: SessionMessage[] }>(`/sessions/${sessionId}/messages`);
  return response.data.data;
}

export async function sendMessage(
  sessionId: string,
  payload: { sender: "user" | "counselor" | "system"; body: string; sender_id?: string }
) {
  const response = await api.post<{
    message: SessionMessage;
    risk_flag: {
      level?: string;
      reason?: string;
      reasons?: string[];
      score?: number;
    } | null;
  }>(`/sessions/${sessionId}/messages`, payload);
  return response.data;
}
