import api from "@/lib/api";
import { createMockAnonymousUser, getMockAnonymousUserById } from "@/lib/services/mockDb";

export interface CreateAnonymousUserResponse {
  id: string;
  anon_handle: string;
  created_at: string;
}

export async function createAnonymousUser() {
  try {
    const response = await api.post<CreateAnonymousUserResponse>("/users/anonymous", {});
    return response.data;
  } catch {
    return createMockAnonymousUser();
  }
}

export async function findAnonymousUserById(id: string) {
  // Backend saat ini tidak menyediakan GET /users/:id.
  // Gunakan local fallback agar fitur "continue anonymous" tetap bisa berjalan.
  void id;
  return getMockAnonymousUserById(id);
}
