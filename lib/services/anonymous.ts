import { createMockAnonymousUser, getMockAnonymousUserById } from "@/lib/services/mockDb";

export interface CreateAnonymousUserResponse {
  id: string;
  anon_handle: string;
  created_at: string;
}

export async function createAnonymousUser() {
  return createMockAnonymousUser();
}

export async function findAnonymousUserById(id: string) {
  return getMockAnonymousUserById(id);
}
