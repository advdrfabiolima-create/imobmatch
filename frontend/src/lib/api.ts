import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("imobmatch_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros 401 e limites de plano
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("imobmatch_token");
      localStorage.removeItem("imobmatch_user");
      window.location.href = "/login";
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
