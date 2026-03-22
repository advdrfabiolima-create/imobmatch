import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const text = message ? encodeURIComponent(message) : "";
  return `https://wa.me/55${cleaned}${text ? `?text=${text}` : ""}`;
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "Casa",
  CONDO_HOUSE: "Casa em Condomínio",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
  COMMERCIAL: "Comercial",
  RURAL: "Rural",
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponível",
  SOLD: "Vendido",
  RENTED: "Alugado",
  INACTIVE: "Inativo",
};

export const MATCH_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONTACTED: "Contactado",
  VISITED: "Visitado",
  NEGOTIATING: "Em Negociação",
  CLOSED: "Fechado",
  REJECTED: "Rejeitado",
};

export const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];
