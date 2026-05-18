// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "counselor" | "admin";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
  role?: UserRole;
}

// ─── Topic ───────────────────────────────────────────────────────────────────

export interface Topic {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

// ─── Session ─────────────────────────────────────────────────────────────────

// Sesuai dengan database enum dan backend: waiting → matched → active → closed
export type SessionStatus = "waiting" | "matched" | "active" | "closed";

export interface Session {
  id: string;
  user_id: string;
  counselor_id?: string | null;
  topic?: string | null;
  status: SessionStatus;
  created_at: string;
  matched_at?: string | null;
  closed_at?: string | null;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export type MessageSender = "user" | "counselor" | "system";

export interface Message {
  id: string;
  session_id: string;
  sender: MessageSender;
  sender_id?: string | null;
  body: string;
  created_at: string;
  risk_level?: string | null;
  risk_score?: number | null;
  risk_reasons?: string[] | null;
}

// ─── Counselor ───────────────────────────────────────────────────────────────

export interface Counselor {
  id: string;
  name: string;
  email?: string;
  specialization?: string;
  display_name?: string;
  is_active: boolean;
  is_available: boolean;
  created_at: string;
}

// ─── Risk ────────────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high";

export interface RiskFlag {
  id: string;
  session_id: string;
  message_id: string;
  level: RiskLevel;
  score: number;
  reasons: string[];
  created_at: string;
}

// ─── Report ──────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  session_id: string;
  reporter_user_id?: string | null;
  category: string;
  detail: string;
  status: "open" | "reviewed";
  created_at: string;
}

// ─── API Generic ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Emergency Info (sensitive keyword trigger) ───────────────────────────────

export interface EmergencyInfo {
  title: string;
  description: string;
  contacts: { name: string; number: string }[];
}
