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
  cpfCnpj?: string;
  personType?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          // Token chegou via cookie httpOnly — apenas guardamos os dados do usuário
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", formData);
          // Token chegou via cookie httpOnly — apenas guardamos os dados do usuário
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // ignora erros de rede — limpamos o estado de qualquer forma
        }
        set({ user: null, isAuthenticated: false });
        window.location.href = "/login";
      },

      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
      setLoading: (v) => set({ isLoading: v }),
    }),
    { name: "imobmatch_auth", partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);
