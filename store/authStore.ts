import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  getRole: () => UserRole | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // Also store token in localStorage for axios interceptor
        if (typeof window !== "undefined") {
          localStorage.setItem("healin_token", token);
        }
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("healin_token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      getRole: () => get().user?.role ?? null,
    }),
    {
      name: "healin-auth",
      // Only persist user & token, not derived state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);