"use client";

import { create } from "zustand";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string;
  avatar?: string;
  addresses?: any[];
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  checkAuth: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false });
        return data.user;
      }
      set({ user: null, isLoading: false });
      return null;
    } catch {
      set({ user: null, isLoading: false });
      return null;
    }
  },
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null });
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  },
}));
