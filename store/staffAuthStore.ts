import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface StaffAuthState {
  staff: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setStaffAuth: (staff: User, token: string) => void;
  clearStaffAuth: () => void;
}

export const useStaffAuthStore = create<StaffAuthState>()(
  persist(
    (set) => ({
      staff: null,
      token: null,
      isAuthenticated: false,
      setStaffAuth: (staff, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("healin_staff_token", token);
          document.cookie = `healin_staff_token=${token}; path=/`;
          document.cookie = `healin_role=${staff.role}; path=/`;
        }
        set({ staff, token, isAuthenticated: true });
      },
      clearStaffAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("healin_staff_token");
          document.cookie =
            "healin_staff_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "healin_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ staff: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "healin-staff-auth",
      partialize: (state) => ({
        staff: state.staff,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
