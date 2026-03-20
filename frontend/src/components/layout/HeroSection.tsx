"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Zap, TrendingUp, ArrowRight, HeartHandshake, Flame,
} from "lucide-react";

// ─── Floating card wrapper ────────────────────────────────────────────────────
function FloatingCard({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      style={style}
      className={[
        "rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(37,99,235,0.12)]",
        "backdrop-blur-xl",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ─── Hero stat ────────────────────────────────────────────────────────────────
function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[110px]">
      <div className="text-2xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

// ─── Animated background canvas ──────────────────────────────────────────────
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Particle definitions
    const particles: {
      x: number; y: number; r: number;
      speed: number; angle: number; opacity: number; pulse: number;
    }[] = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.00015 + 0.00005,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Curved light lines — each defined by control points (relative 0-1)
    const lines = [
      // Diagonals sweeping from left-center outward
      { p0: [0.15, 0.55], p1: [0.45, 0.35], p2: [0.75, 0.15], color: [130, 180, 255] },
      { p0: [0.10, 0.65], p1: [0.42, 0.48], p2: [0.72, 0.28], color: [150, 160, 255] },
      { p0: [0.08, 0.75], p1: [0.40, 0.60], p2: [0.70, 0.38], color: [180, 140, 255] },
      { p0: [0.12, 0.85], p1: [0.43, 0.68], p2: [0.78, 0.50], color: [200, 150, 255] },
      // Sweeping from bottom center to upper right
      { p0: [0.30, 0.95], p1: [0.60, 0.65], p2: [0.90, 0.25], color: [120, 190, 255] },
      { p0: [0.35, 0.98], p1: [0.65, 0.70], p2: [0.95, 0.35], color: [140, 200, 255] },
      // Subtle ones from top-right going left
      { p0: [0.95, 0.10], p1: [0.65, 0.35], p2: [0.30, 0.55], color: [200, 180, 255] },
      { p0: [0.92, 0.20], p1: [0.68, 0.42], p2: [0.35, 0.60], color: [220, 190, 255] },
      // Fan from center-right
      { p0: [0.78, 0.50], p1: [0.55, 0.65], p2: [0.25, 0.72], color: [160, 200, 255] },
      { p0: [0.82, 0.55], p1: [0.58, 0.72], p2: [0.22, 0.82], color: [180, 210, 255] },
    ];

    const draw = () => {
      t += 0.008;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);

      // ── Base gradient ──────────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, W * 0.7, H);
      bg.addColorStop(0, "rgba(248,251,255,1)");
      bg.addColorStop(0.35, "rgba(235,230,255,0.95)");
      bg.addColorStop(0.65, "rgba(220,215,255,0.90)");
      bg.addColorStop(1, "rgba(230,225,255,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Large ambient glows ────────────────────────────────────────────────
      const glows = [
        { x: 0.65, y: 0.35, r: 0.38, color: "rgba(180,120,255,0.22)" },
        { x: 0.80, y: 0.55, r: 0.28, color: "rgba(255,120,200,0.18)" },
        { x: 0.50, y: 0.55, r: 0.25, color: "rgba(140,180,255,0.20)" },
        { x: 0.55, y: 0.45, r: 0.20, color: "rgba(220,100,180,0.15)" },
      ];
      glows.forEach(g => {
        const pulse = 1 + Math.sin(t * 0.7 + g.x * 5) * 0.08;
        const rg = ctx.createRadialGradient(
          g.x * W, g.y * H, 0,
          g.x * W, g.y * H, g.r * W * pulse
        );
        rg.addColorStop(0, g.color);
        rg.addColorStop(1, "transparent");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      });

      // ── Curved light lines ─────────────────────────────────────────────────
      lines.forEach((ln, i) => {
        const phase = t * 0.4 + i * 0.6;
        const opacity = (Math.sin(phase) * 0.3 + 0.55);
        const width = Math.sin(phase * 0.7) * 0.6 + 1.2;

        const x0 = ln.p0[0] * W, y0 = ln.p0[1] * H;
        const x1 = ln.p1[0] * W, y1 = ln.p1[1] * H;
        const x2 = ln.p2[0] * W, y2 = ln.p2[1] * H;

        // Gradient along the line
        const grad = ctx.createLinearGradient(x0, y0, x2, y2);
        const [r, g, b] = ln.color;
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.25, `rgba(${r},${g},${b},${(opacity * 0.7).toFixed(2)})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${opacity.toFixed(2)})`);
        grad.addColorStop(0.75, `rgba(${r},${g},${b},${(opacity * 0.7).toFixed(2)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x1, y1, x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = width;
        ctx.stroke();

        // Bright core line (white center for fiber-optic glow)
        const coreGrad = ctx.createLinearGradient(x0, y0, x2, y2);
        coreGrad.addColorStop(0, "rgba(255,255,255,0)");
        coreGrad.addColorStop(0.4, `rgba(255,255,255,${(opacity * 0.5).toFixed(2)})`);
        coreGrad.addColorStop(0.6, `rgba(255,255,255,${(opacity * 0.5).toFixed(2)})`);
        coreGrad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x1, y1, x2, y2);
        ctx.strokeStyle = coreGrad;
        ctx.lineWidth = width * 0.35;
        ctx.stroke();
      });

      // ── Sparkle particles ──────────────────────────────────────────────────
      particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed * 0.4;
        if (p.x > 1.05) p.x = -0.05;
        if (p.x < -0.05) p.x = 1.05;
        if (p.y > 1.05) p.y = -0.05;
        if (p.y < -0.05) p.y = 1.05;

        const glow = Math.sin(t * 1.2 + p.pulse) * 0.4 + 0.6;
        const alpha = p.opacity * glow;

        // Only draw particles in right ~60% of the hero (where bg effect is)
        if (p.x < 0.35) return;

        const px = p.x * W;
        const py = p.y * H;

        // Outer glow
        const pg = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        pg.addColorStop(0, `rgba(200,180,255,${(alpha * 0.6).toFixed(2)})`);
        pg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(px, py, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,230,255,${alpha.toFixed(2)})`;
        ctx.fill();
      });

      // ── Hot pink/magenta central glow (behind the handshake area) ──────────
      const hotGlow = ctx.createRadialGradient(
        W * 0.68, H * 0.50, 0,
        W * 0.68, H * 0.50, W * 0.18
      );
      const hotPulse = Math.sin(t * 0.9) * 0.06 + 0.22;
      hotGlow.addColorStop(0, `rgba(255,100,200,${hotPulse.toFixed(2)})`);
      hotGlow.addColorStop(0.5, `rgba(220,80,180,${(hotPulse * 0.5).toFixed(2)})`);
      hotGlow.addColorStop(1, "transparent");
      ctx.fillStyle = hotGlow;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "1060px" }}>
      {/* Animated canvas background */}
      <HeroCanvas />

      {/* Content grid */}
      <div
        className="relative mx-auto grid min-h-[1060px] max-w-[1400px] grid-cols-1 gap-12 px-6 pb-24 pt-14 md:px-10 lg:grid-cols-[1fr_1fr] lg:gap-4 lg:px-12 lg:pt-20"
        style={{ zIndex: 1 }}
      >

        {/* ── LEFT: copy ─────────────────────────────────────────────────── */}
        <div
          className="z-10 flex max-w-[620px] flex-col justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm backdrop-blur w-fit">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Plataforma em crescimento com corretores em todo o Brasil
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-5xl font-black leading-[1.0] tracking-[-0.03em] text-slate-950 sm:text-6xl lg:text-[64px]">
            Pare de perder clientes por{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              não ter o imóvel certo.
            </span>
          </h1>

          <p className="mt-8 max-w-[560px] text-[22px] leading-relaxed text-slate-600">
            Conecte-se com outros corretores e encontre oportunidades reais de negócio.
          </p>

          {/* Bullets */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-base text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Novos matches sendo gerados
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
              Corretores entrando na rede
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400 animate-pulse" />
              Novas oportunidades todos os dias
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-5 text-lg font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)] transition hover:-translate-y-px hover:shadow-[0_20px_45px_rgba(79,70,229,0.34)]"
            >
              Começar a gerar oportunidades
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
            <Link
              href="/imoveis"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-8 py-5 text-lg font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300 hover:bg-white"
            >
              <Flame className="mr-3 h-5 w-5 text-orange-500" />
              Ver oportunidades
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-400">Sem cartão de crédito · Cancele quando quiser</p>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-8 border-t border-slate-200/80 pt-8">
            <HeroStat value="100%" label="gratuito para começar" />
            <HeroStat value="+3" label="negócios fechados na rede" />
            <HeroStat value="2" label="estados ativos" />
          </div>
        </div>

        {/* ── RIGHT: photo + floating cards ──────────────────────────────── */}
        <div className="relative min-h-[800px] lg:min-h-[1000px]">

          {/* Photo — ocupa a coluna inteira, sem cards sobre os rostos */}
          <img
            src="/corretores.png"
            alt="Corretores fechando parceria"
            className="absolute z-0 select-none"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.8s ease 0.15s",
              filter: "drop-shadow(0 28px 55px rgba(37,99,235,0.13))",
              width: "auto",
              height: "580px",
              maxWidth: "none",
              objectFit: "contain",
              objectPosition: "top right",
              top: "70px",
              right: "-6%",
              left: "auto",
            }}
            draggable={false}
          />

          {/* ── Cards: todos posicionados abaixo da linha dos ombros (~35%+) ── */}

          {/* Card: Match encontrado — sobre o cotovelo do homem */}
          <FloatingCard
            className="absolute left-[-14%] top-[33%] z-20 w-[280px] px-4 py-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.6s ease 0.45s, transform 0.6s ease 0.45s",
            } as React.CSSProperties}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-100 text-violet-600 flex-shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-800">Match encontrado</div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Ativo em tempo real
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Compatibilidade</span>
              <span className="text-violet-700 font-bold">93 / 100</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-slate-100">
              <div className="h-2 w-[93%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex -space-x-2">
                <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-blue-500 text-[9px] font-bold text-white">J</div>
                <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-violet-500 text-[9px] font-bold text-white">MC</div>
                <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-pink-500 text-[9px] font-bold text-white">A</div>
                <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-emerald-500 text-[9px] font-bold text-white">R</div>
              </div>
              <span className="text-xs text-slate-500">2 corretores conectados</span>
            </div>
          </FloatingCard>

          {/* Card: Negócio fechado — acima da cabeça da corretora */}
          <FloatingCard
            className="absolute right-[3%] top-[5%] z-20 px-4 py-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s",
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-100 text-orange-500 flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-800">Negócio fechado</div>
                <div className="text-xs text-slate-400">na plataforma</div>
              </div>
            </div>
          </FloatingCard>

          {/* Card: Parceria iniciada — esquerda inferior */}
          <FloatingCard
            className="absolute left-[2%] bottom-[30%] z-20 px-4 py-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.6s ease 0.6s, transform 0.6s ease 0.6s",
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 flex-shrink-0">
                <HeartHandshake className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-800">Parceria iniciada</div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Comissão acordada
                </div>
              </div>
            </div>
          </FloatingCard>

          {/* Card: Comissão estimada — próximo ao crachá da corretora */}
          <FloatingCard
            className="absolute right-[1%] top-[52%] z-20 px-4 py-4 shadow-[0_20px_60px_rgba(16,185,129,0.18)]"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s",
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-white flex-shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Comissão estimada</div>
                <div className="text-[20px] font-black text-emerald-600">R$ 14.200</div>
              </div>
            </div>
            <div className="mt-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 text-center">
              sua parte neste match
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}