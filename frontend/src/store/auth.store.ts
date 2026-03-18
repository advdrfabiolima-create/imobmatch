import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  agency?: string;
  creci?: string;
  bio?: string;
  avatarUrl?: string;
  role: "AGENT" | "ADMIN";
  isFirstLogin?: boolean;
  emailVerified?: boolean;
  plan?: "free" | "starter" | "pro" | "premium" | "agency";
  isLifetime?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          localStorage.setItem("imobmatch_token", data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", formData);
          localStorage.setItem("imobmatch_token", data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem("imobmatch_token");
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = "/login";
      },

      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
      setLoading: (v) => set({ isLoading: v }),
    }),
    { name: "imobmatch_auth", partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
);
