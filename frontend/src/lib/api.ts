import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // envia o cookie httpOnly automaticamente em todas as requisições
});

// Interceptor para tratar erros 401 e limites de plano
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
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
