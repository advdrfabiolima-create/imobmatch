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

// Interceptor para tratar erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("imobmatch_token");
      localStorage.removeItem("imobmatch_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
