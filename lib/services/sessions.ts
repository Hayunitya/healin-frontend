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
