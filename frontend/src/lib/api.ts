import axios, { AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // envia cookies httpOnly automaticamente
});

// ─── Refresh mutex ─────────────────────────────────────────────────────────
// Evita múltiplos /auth/refresh simultâneos quando várias requests falham com 401

let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];

function subscribeRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function notifySubscribers(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

// ─── Interceptors ──────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config;

    // 401 → tenta renovar tokens via refresh cookie
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh" &&
      typeof window !== "undefined"
    ) {
      if (isRefreshing) {
        // Outra request já está renovando — aguarda o resultado
        return new Promise((resolve, reject) => {
          subscribeRefresh((success) => {
            if (success) resolve(api(originalRequest));
            else reject(error);
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        notifySubscribers(true);
        return api(originalRequest);
      } catch {
        notifySubscribers(false);
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Erro de limite de plano → dispara modal de upgrade
    if (error.response?.status === 400 && typeof window !== "undefined") {
      const msg: string = error.response?.data?.message ?? "";
      if (msg.includes("permite até") || msg.includes("Faça upgrade")) {
        window.dispatchEvent(new CustomEvent("upgrade-required", { detail: msg }));
      }
    }

    return Promise.reject(error);
  }
);
