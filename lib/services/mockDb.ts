export type MockSessionStatus = "waiting" | "matched" | "closed";

export interface MockAnonymousUser {
  id: string;
  anon_handle: string;
  created_at: string;
}

export interface MockSession {
  id: string;
  user_id: string;
  counselor_id: string | null;
  topic: string | null;
  status: MockSessionStatus;
  created_at: string;
  matched_at: string | null;
  closed_at: string | null;
  high_risk_count?: number;
  open_escalations?: number;
}

export interface MockMessage {
  id: string;
  session_id: string;
  sender: "user" | "counselor" | "system";
  body: string;
  created_at: string;
  risk_level: string | null;
  risk_score: number | null;
  risk_reasons: string[] | null;
}

export interface MockReport {
  id: string;
  session_id: string;
  reporter_user_id: string;
  category: string;
  detail: string;
  status: "open" | "reviewed";
  created_at: string;
}

interface MockDbSchema {
  users: MockAnonymousUser[];
  sessions: MockSession[];
  messages: MockMessage[];
  reports: MockReport[];
}

const DB_KEY = "healin_mock_db_v1";
const RISK_KEYWORDS = ["bunuh diri", "self-harm", "mati", "kill myself", "hopeless"];

function readDb(): MockDbSchema {
  if (typeof window === "undefined") {
    return { users: [], sessions: [], messages: [], reports: [] };
  }

  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const initial = { users: [], sessions: [], messages: [], reports: [] };
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as MockDbSchema;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      messages: parsed.messages ?? [],
      reports: parsed.reports ?? [],
    };
  } catch {
    const reset = { users: [], sessions: [], messages: [], reports: [] };
    localStorage.setItem(DB_KEY, JSON.stringify(reset));
    return reset;
  }
}

function writeDb(db: MockDbSchema) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createMockAnonymousUser() {
  const db = readDb();
  const user: MockAnonymousUser = {
    id: uid("usr"),
    anon_handle: `anon_${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
  };
  db.users.unshift(user);
  writeDb(db);
  return user;
}

export function getMockAnonymousUserById(id: string) {
  const db = readDb();
  return db.users.find((user) => user.id === id) ?? null;
}

export function createMockSession(payload: { user_id: string; topic: string }) {
  const db = readDb();
  const session: MockSession = {
    id: uid("ses"),
    user_id: payload.user_id,
    counselor_id: null,
    topic: payload.topic,
    status: "waiting",
    created_at: new Date().toISOString(),
    matched_at: null,
    closed_at: null,
  };
  db.sessions.unshift(session);
  writeDb(db);
  return session;
}

export function getMockSessionsByUser(userId: string) {
  const db = readDb();
  return db.sessions
    .filter((session) => session.user_id === userId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function getMockWaitingSessions() {
  const db = readDb();
  return db.sessions
    .filter((session) => session.status === "waiting")
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function getMockSessionById(sessionId: string) {
  const db = readDb();
  return db.sessions.find((session) => session.id === sessionId) ?? null;
}

export function assignMockSession(sessionId: string, counselorId: string) {
  const db = readDb();
  const session = db.sessions.find((item) => item.id === sessionId);
  if (!session) throw new Error("Session not found");
  session.counselor_id = counselorId;
  session.status = "matched";
  session.matched_at = new Date().toISOString();
  writeDb(db);
  return session;
}

export function closeMockSession(sessionId: string) {
  const db = readDb();
  const session = db.sessions.find((item) => item.id === sessionId);
  if (!session) throw new Error("Session not found");
  session.status = "closed";
  session.closed_at = new Date().toISOString();
  writeDb(db);
  return session;
}

function detectMockRisk(body: string) {
  const lowered = body.toLowerCase();
  const matched = RISK_KEYWORDS.find((keyword) => lowered.includes(keyword));
  if (!matched) return null;
  return { level: "high", score: 0.92, reasons: [`Detected keyword: ${matched}`] };
}

export function getMockMessages(sessionId: string) {
  const db = readDb();
  return db.messages
    .filter((message) => message.session_id === sessionId)
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
}

export function createMockMessage(payload: {
  session_id: string;
  sender: "user" | "counselor" | "system";
  body: string;
}) {
  const db = readDb();
  const risk = payload.sender === "user" ? detectMockRisk(payload.body) : null;
  const message: MockMessage = {
    id: uid("msg"),
    session_id: payload.session_id,
    sender: payload.sender,
    body: payload.body,
    created_at: new Date().toISOString(),
    risk_level: risk?.level ?? null,
    risk_score: risk?.score ?? null,
    risk_reasons: risk?.reasons ?? null,
  };
  db.messages.push(message);
  writeDb(db);
  return {
    message,
    risk_flag: risk,
  };
}

export function createMockReport(payload: {
  session_id: string;
  reporter_user_id: string;
  category: string;
  detail: string;
}) {
  const db = readDb();
  const report: MockReport = {
    id: uid("rpt"),
    session_id: payload.session_id,
    reporter_user_id: payload.reporter_user_id,
    category: payload.category,
    detail: payload.detail,
    status: "open",
    created_at: new Date().toISOString(),
  };
  db.reports.unshift(report);
  writeDb(db);
  return report;
}

export function getMockReports() {
  const db = readDb();
  return db.reports.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function markMockReportReviewed(reportId: string) {
  const db = readDb();
  const report = db.reports.find((item) => item.id === reportId);
  if (!report) throw new Error("Report not found");
  report.status = "reviewed";
  writeDb(db);
  return report;
}

export function getMockAdminOverview() {
  const db = readDb();

  const sessionsByStatus = {
    waiting: db.sessions.filter((session) => session.status === "waiting").length,
    matched: db.sessions.filter((session) => session.status === "matched").length,
    closed: db.sessions.filter((session) => session.status === "closed").length,
  };

  const reportsByStatus = {
    open: db.reports.filter((report) => report.status === "open").length,
    reviewed: db.reports.filter((report) => report.status === "reviewed").length,
  };

  const recentSessions = [...db.sessions]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 8);

  const recentReports = [...db.reports]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 8);

  return {
    totalUsers: db.users.length,
    totalSessions: db.sessions.length,
    totalMessages: db.messages.length,
    totalReports: db.reports.length,
    sessionsByStatus,
    reportsByStatus,
    recentSessions,
    recentReports,
  };
}

export function getMockUsers() {
  const db = readDb();
  return [...db.users].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function updateMockUser(id: string, payload: { anon_handle: string }) {
  const db = readDb();
  const user = db.users.find((item) => item.id === id);
  if (!user) throw new Error("User not found");
  user.anon_handle = payload.anon_handle;
  writeDb(db);
  return user;
}

export function deleteMockUser(id: string) {
  const db = readDb();
  db.users = db.users.filter((user) => user.id !== id);
  db.sessions = db.sessions.filter((session) => session.user_id !== id);
  writeDb(db);
}

export function getMockAllSessions() {
  const db = readDb();
  return [...db.sessions].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function updateMockSession(
  id: string,
  payload: { topic?: string | null; status?: MockSessionStatus }
) {
  const db = readDb();
  const session = db.sessions.find((item) => item.id === id);
  if (!session) throw new Error("Session not found");
  if (payload.topic !== undefined) session.topic = payload.topic;
  if (payload.status) session.status = payload.status;
  writeDb(db);
  return session;
}

export function deleteMockSession(id: string) {
  const db = readDb();
  db.sessions = db.sessions.filter((session) => session.id !== id);
  db.messages = db.messages.filter((message) => message.session_id !== id);
  db.reports = db.reports.filter((report) => report.session_id !== id);
  writeDb(db);
}

export function deleteMockReport(id: string) {
  const db = readDb();
  db.reports = db.reports.filter((report) => report.id !== id);
  writeDb(db);
}
