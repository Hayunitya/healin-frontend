"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

interface UseAuthOptions {
  /** If true, redirect to /login when not authenticated */
  requireAuth?: boolean;
  /** If set, redirect to /unauthorized when user role doesn't match */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthenticated users (default: /login) */
  redirectTo?: string;
}

export const useAuth = (options: UseAuthOptions = {}) => {
  const { requireAuth = false, allowedRoles, redirectTo = "/login" } = options;
  const router = useRouter();
  const { user, token, isAuthenticated, clearAuth, getRole } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && isAuthenticated) {
      const role = getRole();
      if (role && !allowedRoles.includes(role)) {
        router.replace("/unauthorized");
      }
    }
  }, [isAuthenticated, requireAuth, allowedRoles, redirectTo, router, getRole]);

  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  return {
    user,
    token,
    isAuthenticated,
    role: getRole(),
    logout,
    isUser: getRole() === "user",
    isCounselor: getRole() === "counselor",
    isAdmin: getRole() === "admin",
  };
};