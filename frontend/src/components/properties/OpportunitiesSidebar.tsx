"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame, ArrowRight, ChevronLeft, ChevronRight,
  MapPin, Users, Zap, Building2,
} from "lucide-react";
import { PROPERTY_TYPE_LABELS } from "@/lib/utils";

export interface OpportunityItem {
  id: string;
  title: string;
  propertyType: string;
  priceNormal: number;
  priceUrgent: number;
  city: string;
  neighborhood?: string;
  acceptsOffer?: boolean;
  photoUrl?: string;
  property?: { photos?: string[] };
  agent?: { name?: string; phone?: string; agency?: string };
}

interface Props {
  opportunities: OpportunityItem[];
  total: number;
}

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  }).format(v);
}

// ── Versão desktop ─────────────────────────────────────────────────────────────
export function OpportunitiesSidebar({ opportunities, total }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="hidden lg:block flex-shrink-0 transition-all duration-300"
      style={{ width: collapsed ? 44 : 308 }}
    >
      {/* ── COLAPSADO ── */}
      {collapsed && (
        <div
          className="sticky top-[73px] flex flex-col items-center gap-3 py-4 rounded-2xl border cursor-pointer select-none"
          style={{
            background: "rgba(234,88,12,0.07)",
            borderColor: "rgba(234,88,12,0.22)",
            boxShadow: "0 0 20px rgba(234,88,12,0.06)",
          }}
          onClick={() => setCollapsed(false)}
          title="Expandir oportunidades"
        >
          <Flame className="h-4 w-4 text-orange-400" />
          {total > 0 && (
            <span
              className="text-[10px] font-black text-white w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#dc2626" }}
            >
              {total > 9 ? "9+" : total}
            </span>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-white/25 mt-1" />
        </div>
      )}

      {/* ── EXPANDIDO ── */}
      {!collapsed && (
        <div
          className="sticky top-[73px] flex flex-col gap-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 90px)", scrollbarWidth: "none" }}
        >

          {/* ── Bloco 1: Oportunidades ── */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "rgba(15,8,4,0.60)",
              borderColor: "rgba(234,88,12,0.24)",
              boxShadow: "0 0 32px rgba(234,88,12,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: "rgba(234,88,12,0.11)", borderBottom: "1px solid rgba(234,88,12,0.16)" }}
            >
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Oportunidades urgentes
                </span>
              </div>
              <div className="flex items-center gap-2">
                {total > 0 && (
                  <span
                    className="text-[10px] font-black text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    style={{ background: "#dc2626" }}
                  >
                    {total}
                  </span>
                )}
                <button
                  onClick={() => setCollapsed(true)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  title="Recolher"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-white/35" />
                </button>
              </div>
            </div>

            {/* Cards */}
            {opportunities.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Flame className="h-8 w-8 text-orange-400/15 mx-auto mb-3" />
                <p className="text-xs text-white/28">
                  Nenhuma oportunidade urgente no momento.
                </p>
                <p className="text-[10px] text-white/18 mt-1">
                  Corretores publicam imóveis com desconto aqui.
                </p>
              </div>
            ) : (
              opportunities.map((opp, i) => {
                const pct  = Math.round((1 - opp.priceUrgent / opp.priceNormal) * 100);
                const save = opp.priceNormal - opp.priceUrgent;
                const photo = opp.photoUrl || opp.property?.photos?.[0];

                return (
                  <div
                    key={opp.id}
                    style={{
                      borderBottom: i < opportunities.length - 1
                        ? "1px solid rgba(255,255,255,0.045)"
                        : undefined,
                    }}
                  >
                    {/* Foto */}
                    {photo && (
                      <div className="relative h-[90px] overflow-hidden">
                        <img
                          src={photo}
                          alt={opp.title}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }}
                        />
                        <span
                          className="absolute top-2 left-2 text-[10px] font-black text-white px-2 py-0.5 rounded-full"
                          style={{ background: "#dc2626" }}
                        >
                          −{pct}% OFF
                        </span>
                        {opp.acceptsOffer && (
                          <span
                            className="absolute top-2 right-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full"
                            style={{ background: "#059669" }}
                          >
                            Aceita proposta
                          </span>
                        )}
                      </div>
                    )}

                    <div className="px-3.5 py-3">
                      {/* Badge quando não tem foto */}
                      {!photo && (
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-orange-400/70 font-semibold">
                            {PROPERTY_TYPE_LABELS[opp.propertyType] ?? opp.propertyType}
                          </span>
                          <span
                            className="text-[10px] font-black text-white px-1.5 py-0.5 rounded-full"
                            style={{ background: "#dc2626" }}
                          >
                            −{pct}% OFF
                          </span>
                        </div>
                      )}

                      <p className="text-xs font-bold text-white/88 leading-snug mb-1 line-clamp-2">
                        {opp.title}
                      </p>
                      <div className="flex items-center gap-1 text-white/33 text-[10px] mb-2">
                        <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                        <span className="truncate">
                          {[opp.neighborhood, opp.city].filter(Boolean).join(", ")}
                        </span>
                      </div>

                      <p className="text-[10px] text-white/25 line-through leading-none">
                        {fmt(opp.priceNormal)}
                      </p>
                      <div className="flex items-end justify-between mt-0.5">
                        <div>
                          <p className="text-[15px] font-extrabold text-white/90 leading-tight">
                            {fmt(opp.priceUrgent)}
                          </p>
                          <p className="text-[10px] text-orange-400 font-semibold leading-none mt-0.5">
                            Economia: −{fmt(save)}
                          </p>
                        </div>
                        {opp.acceptsOffer && !photo && (
                          <span className="text-[9px] font-bold text-emerald-400 border border-emerald-400/30 px-1.5 py-0.5 rounded-full">
                            Aceita proposta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Footer: ver todas */}
            <Link
              href="/radar"
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors hover:bg-orange-500/10"
              style={{
                borderTop: "1px solid rgba(234,88,12,0.14)",
                color: "rgba(251,146,60,0.80)",
              }}
            >
              Ver todas as oportunidades
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* ── Bloco 2: Radar teaser ── */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "rgba(6,8,24,0.65)",
              borderColor: "rgba(99,102,241,0.20)",
              boxShadow: "0 0 28px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: "rgba(99,102,241,0.09)", borderBottom: "1px solid rgba(99,102,241,0.13)" }}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Radar da Rede
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold">Ao vivo</span>
              </div>
            </div>

            <div className="px-4 py-4 space-y-3.5">
              {[
                { Icon: Building2, label: "Imóveis na rede",      value: "312", color: "#a78bfa" },
                { Icon: Users,     label: "Compradores ativos",    value: "48",  color: "#60a5fa" },
                { Icon: Zap,       label: "Matches gerados hoje",  value: "23",  color: "#34d399" },
                { Icon: Flame,     label: "Oportunidades ativas",  value: `${total || "—"}`, color: "#fb923c" },
              ].map(({ Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
                    <span className="text-[11px] text-white/42">{label}</span>
                  </div>
                  <span className="text-sm font-extrabold tabular-nums" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>

            <div
              className="px-4 py-3"
              style={{ borderTop: "1px solid rgba(99,102,241,0.13)" }}
            >
              <p className="text-[10px] text-white/28 mb-3 leading-relaxed">
                Quer ver matches em tempo real e fechar parcerias? A rede está aberta para corretores.
              </p>
              <Link
                href="/lista-vip"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-white text-xs transition-all hover:brightness-110 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 14px rgba(79,70,229,0.30)",
                }}
              >
                Sou corretor — quero acesso
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>
      )}
    </aside>
  );
}

// ── Versão mobile: strip horizontal no topo do conteúdo ───────────────────────
export function MobileOpportunitiesStrip({ opportunities, total }: Props) {
  const [open, setOpen] = useState(true);

  if (!open || opportunities.length === 0) {
    if (opportunities.length === 0) return null;
    return (
      <div className="lg:hidden mb-5">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-colors"
          style={{
            background: "rgba(234,88,12,0.08)",
            borderColor: "rgba(234,88,12,0.25)",
            color: "#fb923c",
          }}
        >
          <Flame className="h-3.5 w-3.5" />
          {total} oportunidade{total !== 1 ? "s" : ""} com desconto
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="lg:hidden mb-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
            Oportunidades urgentes
          </span>
          <span
            className="text-[10px] font-black text-white px-1.5 py-0.5 rounded-full"
            style={{ background: "#dc2626" }}
          >
            {total}
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
        >
          Recolher
        </button>
      </div>

      {/* Scroll horizontal */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {opportunities.map((opp) => {
          const pct  = Math.round((1 - opp.priceUrgent / opp.priceNormal) * 100);
          const photo = opp.photoUrl || opp.property?.photos?.[0];
          return (
            <div
              key={opp.id}
              className="flex-shrink-0 w-52 rounded-xl border overflow-hidden"
              style={{
                background: "rgba(15,8,4,0.70)",
                borderColor: "rgba(234,88,12,0.22)",
              }}
            >
              {photo ? (
                <div className="relative h-24">
                  <img src={photo} alt={opp.title} className="w-full h-full object-cover" />
                  <span
                    className="absolute top-2 left-2 text-[10px] font-black text-white px-1.5 py-0.5 rounded-full"
                    style={{ background: "#dc2626" }}
                  >
                    −{pct}% OFF
                  </span>
                </div>
              ) : (
                <div
                  className="h-10 flex items-center px-3"
                  style={{ background: "rgba(234,88,12,0.10)" }}
                >
                  <span
                    className="text-[10px] font-black text-white px-2 py-0.5 rounded-full"
                    style={{ background: "#dc2626" }}
                  >
                    −{pct}% OFF
                  </span>
                </div>
              )}
              <div className="px-3 py-2.5">
                <p className="text-xs font-bold text-white/88 line-clamp-1 mb-0.5">{opp.title}</p>
                <p className="text-[10px] text-white/35 mb-1.5 truncate">{opp.city}</p>
                <p className="text-[10px] text-white/22 line-through">{fmt(opp.priceNormal)}</p>
                <p className="text-sm font-extrabold text-white/90">{fmt(opp.priceUrgent)}</p>
              </div>
            </div>
          );
        })}

        {/* Card "ver todas" */}
        <Link
          href="/radar"
          className="flex-shrink-0 w-40 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors hover:border-orange-400/40"
          style={{
            background: "rgba(234,88,12,0.06)",
            borderColor: "rgba(234,88,12,0.18)",
          }}
        >
          <Flame className="h-6 w-6 text-orange-400/60" />
          <span className="text-xs font-semibold text-orange-400/70 text-center px-2">
            Ver todas as oportunidades
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-orange-400/50" />
        </Link>
      </div>
    </div>
  );
}
