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

export type SessionStatus = "waiting" | "active" | "ended";

export interface Session {
  id: string;
  userId: string;
  counselorId?: string;
  topicId: string;
  topic: Topic;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  createdAt: string;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export type MessageSender = "user" | "counselor";

export interface Message {
  id: string;
  sessionId: string;
  sender: MessageSender;
  content: string;
  isSensitive?: boolean;
  createdAt: string;
}

// ─── Counselor ───────────────────────────────────────────────────────────────

export type CounselorStatus = "online" | "busy" | "offline";

export interface Counselor {
  id: string;
  username: string;
  topics: Topic[];
  status: CounselorStatus;
  totalSessions: number;
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