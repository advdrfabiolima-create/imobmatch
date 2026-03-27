"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Users, ArrowRight, Zap, Building2, Search } from "lucide-react";

export default function GatewayPage() {
  const [hovered, setHovered] = useState<"buyer" | "agent" | null>(null);
  const router = useRouter();

  const leftFlex  = hovered === "buyer" ? "1.42 1 0%" : hovered === "agent" ? "0.58 1 0%" : "1 1 0%";
  const rightFlex = hovered === "agent" ? "1.42 1 0%" : hovered === "buyer" ? "0.58 1 0%" : "1 1 0%";

  return (
    <main
      className="h-screen w-screen overflow-hidden"
      style={{ background: "#060c1a" }}
    >
      {/* ── Logo centrada flutuante ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-7 pointer-events-none">
        <img
          src="/logo_texto_branco.png"
          alt="ImobMatch"
          className="h-6 w-auto drop-shadow-lg opacity-95"
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP — split horizontal
      ══════════════════════════════════════════════════════ */}
      <div className="hidden md:flex h-full">

        {/* ── Painel ESQUERDO — Comprador ── */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer group"
          style={{
            flex: leftFlex,
            transition: "flex 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "linear-gradient(150deg, #0a1e38 0%, #0d2e4a 45%, #083540 75%, #051e2a 100%)",
          }}
          onMouseEnter={() => setHovered("buyer")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => router.push("/imoveis")}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.035,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          {/* Ambient glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 520,
              height: 520,
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 68%)",
              filter: "blur(20px)",
            }}
          />
          {/* Bottom edge glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent, rgba(20,184,166,0.25), transparent)" }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-14 max-w-[420px]">
            {/* Icon */}
            <div
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110"
              style={{
                background: "rgba(20,184,166,0.12)",
                border: "1px solid rgba(20,184,166,0.28)",
                boxShadow: "0 0 28px rgba(20,184,166,0.12)",
              }}
            >
              <Home className="h-9 w-9 text-teal-400" />
            </div>

            {/* Label */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-400/65 mb-3">
              Para compradores
            </p>

            {/* Headline */}
            <h2 className="text-[2.4rem] font-extrabold text-white leading-tight tracking-tight mb-4">
              Estou procurando<br />um imóvel
            </h2>

            {/* Sub */}
            <p className="text-white/42 text-[15px] leading-relaxed mb-10">
              Explore centenas de imóveis verificados, direto de corretores.
              Sem cadastro necessário.
            </p>

            {/* CTA */}
            <div
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-white text-[15px] transition-all duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
                boxShadow: "0 8px 28px rgba(13,148,136,0.32)",
              }}
            >
              Não sou corretor
              <ArrowRight className="h-4 w-4" />
            </div>
            <p className="text-white/22 text-xs mt-3">Ver imóveis disponíveis</p>
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-7 flex items-center gap-2 text-white/14 text-xs select-none">
            <Search className="h-3.5 w-3.5" />
            <span>Imóveis · Oportunidades · Radar de descontos</span>
          </div>
        </div>

        {/* ── Divisor central ── */}
        <div className="relative z-20 w-px flex-shrink-0">
          {/* Linha degradê */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.10) 25%, rgba(255,255,255,0.20) 50%, rgba(255,255,255,0.10) 75%, transparent 100%)",
            }}
          />
          {/* Jewel central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: "#060c1a",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 0 20px rgba(99,102,241,0.28), 0 0 40px rgba(99,102,241,0.10)",
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #818cf8, #6366f1)",
                  boxShadow: "0 0 8px rgba(99,102,241,0.60)",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Painel DIREITO — Corretor ── */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer group"
          style={{
            flex: rightFlex,
            transition: "flex 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "linear-gradient(150deg, #0a0e26 0%, #0f1550 35%, #190a50 65%, #0d0a2e 100%)",
          }}
          onMouseEnter={() => setHovered("agent")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => router.push("/lista-vip")}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.035,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          {/* Ambient glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 520,
              height: 520,
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 68%)",
              filter: "blur(20px)",
            }}
          />
          {/* Bottom edge glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(to right, transparent, rgba(99,102,241,0.30), transparent)" }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-14 max-w-[420px]">
            {/* Icon */}
            <div
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.28)",
                boxShadow: "0 0 28px rgba(99,102,241,0.14)",
              }}
            >
              <Users className="h-9 w-9 text-indigo-400" />
            </div>

            {/* Label */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400/65 mb-3">
              Para corretores
            </p>

            {/* Headline */}
            <h2 className="text-[2.4rem] font-extrabold text-white leading-tight tracking-tight mb-4">
              Sou corretor<br />imobiliário
            </h2>

            {/* Sub */}
            <p className="text-white/42 text-[15px] leading-relaxed mb-10">
              Matches automáticos, parcerias com a rede e oportunidades
              em tempo real. Cresça com quem entende o mercado.
            </p>

            {/* CTA */}
            <div
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-white text-[15px] transition-all duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: "0 8px 28px rgba(79,70,229,0.40)",
              }}
            >
              Sou corretor
              <ArrowRight className="h-4 w-4" />
            </div>
            <p className="text-white/22 text-xs mt-3">Acesso antecipado gratuito</p>
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-7 flex items-center gap-2 text-white/14 text-xs select-none">
            <Zap className="h-3.5 w-3.5" />
            <span>Matches · Parcerias · Radar da Rede</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE — empilhado verticalmente
      ══════════════════════════════════════════════════════ */}
      <div className="flex md:hidden flex-col h-full">

        {/* Painel comprador */}
        <div
          className="flex-1 relative flex flex-col items-center justify-center px-8 py-10 active:brightness-90 transition-all"
          style={{
            background: "linear-gradient(150deg, #0a1e38 0%, #083540 100%)",
            cursor: "pointer",
          }}
          onClick={() => router.push("/imoveis")}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              width: 320, height: 320,
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(20,184,166,0.16) 0%, transparent 68%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(20,184,166,0.12)",
                border: "1px solid rgba(20,184,166,0.28)",
              }}
            >
              <Home className="h-7 w-7 text-teal-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400/65 mb-2">Para compradores</p>
            <h2 className="text-2xl font-extrabold text-white mb-2 leading-tight">
              Estou procurando<br />um imóvel
            </h2>
            <p className="text-white/38 text-sm leading-relaxed mb-7 max-w-xs">
              Centenas de imóveis verificados, direto de corretores. Sem cadastro.
            </p>
            <div
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
                boxShadow: "0 6px 20px rgba(13,148,136,0.30)",
              }}
            >
              Não sou corretor <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Divisor mobile */}
        <div className="relative h-px flex-shrink-0 z-20">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.15) 70%, transparent)",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "#060c1a",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 0 16px rgba(99,102,241,0.28)",
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)" }}
              />
            </div>
          </div>
        </div>

        {/* Painel corretor */}
        <div
          className="flex-1 relative flex flex-col items-center justify-center px-8 py-10 active:brightness-90 transition-all"
          style={{
            background: "linear-gradient(150deg, #0a0e26 0%, #190a50 100%)",
            cursor: "pointer",
          }}
          onClick={() => router.push("/lista-vip")}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              width: 320, height: 320,
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 68%)",
            }}
          />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.28)",
              }}
            >
              <Users className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/65 mb-2">Para corretores</p>
            <h2 className="text-2xl font-extrabold text-white mb-2 leading-tight">
              Sou corretor<br />imobiliário
            </h2>
            <p className="text-white/38 text-sm leading-relaxed mb-7 max-w-xs">
              Matches, parcerias e oportunidades em tempo real.
            </p>
            <div
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: "0 6px 20px rgba(79,70,229,0.36)",
              }}
            >
              Sou corretor <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
