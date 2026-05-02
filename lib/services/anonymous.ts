import api from "@/lib/api";

export interface CreateAnonymousUserResponse {
  id: string;
  anon_handle: string;
  created_at: string;
}

export async function createAnonymousUser() {
  const response = await api.post<CreateAnonymousUserResponse>("/users/anonymous");
  return response.data;
}
