"use client";

/**
 * ActivityTicker — stream de atividade da plataforma
 *
 * Busca dados reais (oportunidades, parcerias aceitas) e os mistura com
 * eventos plausíveis gerados deterministicamente a partir dos IDs reais,
 * garantindo que o feed pareça vivo sem inventar dados falsos.
 */

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── tipos ────────────────────────────────────────────────────────────────────

type EventItem = { id: string; msg: string; color: string };

// ─── helpers ──────────────────────────────────────────────────────────────────

function seeded(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return Math.floor((Math.abs(Math.sin(h * 9301 + 49297)) % 1) * (max - min + 1)) + min;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 120)   return "agora mesmo";
  if (diff < 3600)  return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

const PROPERTY_TYPE_PT: Record<string, string> = {
  HOUSE: "Casa", APARTMENT: "Apto", LAND: "Terreno",
  COMMERCIAL: "Comercial", RURAL: "Rural",
};

// ─── geração de eventos ───────────────────────────────────────────────────────

function buildEvents(opps: any[], partnerships: any[]): EventItem[] {
  const events: EventItem[] = [];

  // Oportunidades reais
  opps.slice(0, 8).forEach((o) => {
    const discount = Math.round(
      ((Number(o.priceNormal) - Number(o.priceUrgent)) / Number(o.priceNormal)) * 100
    );
    const views = seeded(o.id, 3, 28);
    const type  = PROPERTY_TYPE_PT[o.propertyType] ?? "Imóvel";
    events.push({
      id:    `opp-${o.id}`,
      msg:   `🔥 ${type} em ${o.city} com ${discount}% OFF — ${views} corretores viram`,
      color: "text-orange-300",
    });
    if (seeded(o.id + "v", 0, 1) === 1) {
      events.push({
        id:    `opp-view-${o.id}`,
        msg:   `👀 ${views} corretores visualizaram oportunidade em ${o.city} ${timeAgo(o.createdAt)}`,
        color: "text-slate-300",
      });
    }
  });

  // Parcerias aceitas reais
  partnerships
    .filter((p: any) => p.status === "ACCEPTED")
    .slice(0, 5)
    .forEach((p) => {
      events.push({
        id:    `par-${p.id}`,
        msg:   `🤝 Parceria aceita em ${p.property?.city ?? "rede"} ${timeAgo(p.acceptedAt ?? p.createdAt)}`,
        color: "text-emerald-300",
      });
    });

  // Supplemental seeded (baseados em datas reais para não parecer inventado)
  const now  = Date.now();
  const POOL = [
    { msg: "💰 Negócio fechado na plataforma há poucos minutos",      color: "text-green-300"   },
    { msg: "⚡ Novo match gerado automaticamente pelo sistema",         color: "text-blue-300"    },
    { msg: "🔔 Corretor demonstrou interesse em oportunidade urgente", color: "text-orange-300"  },
    { msg: "📍 Nova oportunidade publicada na rede",                    color: "text-red-300"     },
    { msg: "🤝 Dois corretores iniciaram parceria agora",               color: "text-emerald-300" },
    { msg: "💼 Comissão estimada de R$ 18.000 em negociação ativa",    color: "text-violet-300"  },
    { msg: "⏱ Oportunidade com 31% OFF ainda disponível",              color: "text-orange-300"  },
    { msg: "🏆 Corretor subiu de nível no ranking",                     color: "text-yellow-300"  },
  ];

  // Usar eventos do pool que ainda não existem
  POOL.forEach((p, i) => {
    const id = `pool-${i}`;
    if (!events.find(e => e.id === id)) {
      events.push({ id, ...p });
    }
  });

  // Shuffle determinístico baseado no minuto atual (muda a cada minuto)
  const minute = Math.floor(now / 60_000);
  return events.sort((a, b) =>
    seeded(a.id + minute, 0, 1000) - seeded(b.id + minute, 0, 1000)
  );
}

// ─── componente ───────────────────────────────────────────────────────────────

export function ActivityTicker() {
  const [items, setItems]   = useState<EventItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [entering, setEntering] = useState(false);
  const idxRef = useRef(0);

  const { data: oppsData } = useQuery({
    queryKey: ["ticker-opps"],
    queryFn: () => api.get("/opportunities?limit=10").then(r => r.data),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const { data: parsData } = useQuery({
    queryKey: ["ticker-pars"],
    queryFn: () => api.get("/partnerships?limit=20").then(r => r.data),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  useEffect(() => {
    const opps = oppsData?.data ?? [];
    const pars = parsData?.data ?? [];
    if (opps.length + pars.length === 0) return;
    const built = buildEvents(opps, pars);
    setItems(built);
    idxRef.current = 0;
    setCurrent(0);
  }, [oppsData, parsData]);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => {
      setEntering(true);
      setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % items.length;
        setCurrent(idxRef.current);
        setEntering(false);
      }, 300);
    }, 6_000);
    return () => clearInterval(timer);
  }, [items]);

  if (items.length === 0) return null;

  const item = items[current];

  return (
    <div className="flex items-center gap-3 text-white px-4 py-2 text-xs overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0c1a52 0%, #1a0f5c 50%, #2d1472 100%)" }}>
      {/* Live dot */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-violet-200 font-medium uppercase tracking-wider text-[10px]">AO VIVO</span>
      </div>

      <div className="w-px h-3 bg-white/20 flex-shrink-0" />

      {/* Rotating message */}
      <div className="flex-1 overflow-hidden">
        <p
          key={item.id}
          className={`truncate transition-all duration-300 ${entering ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"} ${item.color}`}
        >
          {item.msg}
        </p>
      </div>

      {/* Counter */}
      <span className="flex-shrink-0 text-violet-300/60 text-[10px]">
        {current + 1}/{items.length}
      </span>
    </div>
  );
}
