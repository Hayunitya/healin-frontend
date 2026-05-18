import api from "@/lib/api";
import { createMockAnonymousUser, getMockAnonymousUserById } from "@/lib/services/mockDb";

export interface AnonymousUserResponse {
  id: string;
  anon_handle: string;
  created_at: string;
}

export async function createAnonymousUser(): Promise<AnonymousUserResponse> {
  try {
    const response = await api.post<AnonymousUserResponse>("/users/anonymous", {});
    return response.data;
  } catch {
    return createMockAnonymousUser();
  }
}

export async function findAnonymousUserById(id: string): Promise<AnonymousUserResponse | null> {
  try {
    const response = await api.get<AnonymousUserResponse>(`/users/${id}`);
    return response.data;
  } catch {
    return getMockAnonymousUserById(id);
  }
}
