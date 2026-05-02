import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AnonymousProfile {
  anonymousUserId: string;
  anonymousHandle: string;
  createdAt?: string;
}

interface AnonymousState {
  profile: AnonymousProfile | null;
  isAnonymousActive: boolean;
  setAnonymousProfile: (profile: AnonymousProfile) => void;
  clearAnonymousProfile: () => void;
}

export const useAnonymousStore = create<AnonymousState>()(
  persist(
    (set) => ({
      profile: null,
      isAnonymousActive: false,
      setAnonymousProfile: (profile) => set({ profile, isAnonymousActive: true }),
      clearAnonymousProfile: () => set({ profile: null, isAnonymousActive: false }),
    }),
    {
      name: "healin-anonymous",
      partialize: (state) => ({
        profile: state.profile,
        isAnonymousActive: state.isAnonymousActive,
      }),
    }
  )
);
