import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001") + "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Injeta o token Bearer em todas as requests autenticadas
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tenta renovar o token quando recebe 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        if (!refreshToken) throw new Error("no refresh token");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        await SecureStore.setItemAsync("access_token", data.accessToken);
        await SecureStore.setItemAsync("refresh_token", data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const usersApi = {
  dashboard: () => api.get("/users/dashboard"),
  updateProfile: (data: Record<string, unknown>) =>
    api.patch("/users/profile", data),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadApi = {
  images: async (uris: string[]): Promise<string[]> => {
    const form = new FormData();
    uris.forEach((uri, i) => {
      form.append("files", { uri, name: `photo_${i}.jpg`, type: "image/jpeg" } as any);
    });
    const { data } = await api.post("/upload/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.urls as string[];
  },
};

// ── Imóveis ───────────────────────────────────────────────────────────────────
export const propertiesApi = {
  myProperties: (page = 1) =>
    api.get("/properties/my", { params: { page, limit: 20 } }),
  getById: (id: string) => api.get(`/properties/${id}`),
  create: (data: Record<string, unknown>) => api.post("/properties", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
};

// ── Compradores ───────────────────────────────────────────────────────────────
export const buyersApi = {
  myBuyers: (page = 1) =>
    api.get("/buyers", { params: { page, limit: 20 } }),
  getById: (id: string) => api.get(`/buyers/${id}`),
  create: (data: Record<string, unknown>) => api.post("/buyers", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/buyers/${id}`, data),
  delete: (id: string) => api.delete(`/buyers/${id}`),
};

// ── Matches ───────────────────────────────────────────────────────────────────
export const matchesApi = {
  list: () => api.get("/matches"),
  best: () => api.get("/matches/best"),
  generate: () => api.post("/matches/generate"),
  updateStatus: (id: string, status: string) =>
    api.patch(`/matches/${id}/status`, { status }),
};

// ── Parcerias ─────────────────────────────────────────────────────────────────
export const partnershipsApi = {
  list: (status?: string) =>
    api.get("/partnerships", { params: status ? { status } : {} }),
  respond: (id: string, status: "ACCEPTED" | "REJECTED", commissionSplit?: number) =>
    api.patch(`/partnerships/${id}/respond`, { status, commissionSplit }),
  cancel: (id: string) => api.patch(`/partnerships/${id}/cancel`),
  close: (id: string, reason: "deal_closed" | "not_closed" | "buyer_quit") =>
    api.patch(`/partnerships/${id}/close`, { reason }),
  remove: (id: string) => api.delete(`/partnerships/${id}`),
};

// ── Mensagens ─────────────────────────────────────────────────────────────────
export const messagesApi = {
  conversations: () => api.get("/messages/conversations"),
  getConversation: (partnerId: string) => api.get(`/messages/${partnerId}`),
  send: (receiverId: string, content: string) =>
    api.post("/messages", { receiverId, content }),
  unread: () => api.get("/messages/unread"),
};

// ── Corretores ─────────────────────────────────────────────────────────────────
export const corretoresApi = {
  list: (params?: { search?: string; city?: string; state?: string; page?: number }) =>
    api.get("/users", { params: { limit: 20, ...params } }),
  getById: (id: string) => api.get(`/users/${id}`),
};

// ── Oportunidades ──────────────────────────────────────────────────────────────
export const oportunidadesApi = {
  list: (params?: { page?: number; city?: string }) =>
    api.get("/opportunities", { params: { limit: 20, ...params } }),
  getById: (id: string) => api.get(`/opportunities/${id}`),
  create: (data: Record<string, unknown>) => api.post("/opportunities", data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/opportunities/${id}/status`, { status }),
  remove: (id: string) => api.delete(`/opportunities/${id}`),
};
