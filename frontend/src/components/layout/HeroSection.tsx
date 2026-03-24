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
        "rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_20px_60px_rgba(99,102,241,0.15)] backdrop-blur-xl",
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
      <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-sm text-white/50">{label}</div>
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
      bg.addColorStop(0, "rgba(6,12,25,1)");
      bg.addColorStop(0.35, "rgba(10,14,40,0.98)");
      bg.addColorStop(0.65, "rgba(15,10,45,0.97)");
      bg.addColorStop(1, "rgba(12,8,35,1)");
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
        const opacity = (Math.sin(phase) * 0.08 + 0.14); // era: * 0.3 + 0.55
        const width = Math.sin(phase * 0.7) * 0.3 + 0.7;  // era: * 0.6 + 1.2

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

        // Bright core line — muito mais sutil
        const coreGrad = ctx.createLinearGradient(x0, y0, x2, y2);
        coreGrad.addColorStop(0, "rgba(255,255,255,0)");
        coreGrad.addColorStop(0.4, `rgba(255,255,255,${(opacity * 0.25).toFixed(2)})`); // era: * 0.5
        coreGrad.addColorStop(0.6, `rgba(255,255,255,${(opacity * 0.25).toFixed(2)})`);
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
        ctx.fillStyle = `rgba(180,160,255,${(alpha * 0.5).toFixed(2)})`;
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

  const fadeUp = (delay = 0) =>
    ({
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0px)" : "translateY(16px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }) as React.CSSProperties;

  return (
    <section className="relative overflow-hidden lg:min-h-[820px]">
      {/* Animated canvas background */}
      <HeroCanvas />

      {/* Content grid */}
      <div
        className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-0 px-6 pb-6 pt-8 md:px-10 lg:grid-cols-[1fr_1fr] lg:min-h-[820px] lg:gap-4 lg:px-12 lg:pt-10"
        style={{ zIndex: 1 }}
      >

        {/* ── LEFT: copy ─────────────────────────────────────────────────── */}
        <div
          className="z-10 flex flex-col justify-start pt-6 lg:pt-10 lg:max-w-[620px]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(18px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur w-fit sm:px-4 sm:py-2 sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Plataforma em crescimento com corretores em todo o Brasil
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:mt-8 lg:text-[64px] lg:leading-[1.0]">
            Pare de perder clientes por{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              não ter o imóvel certo.
            </span>
          </h1>

          <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-white/60 lg:mt-8 lg:text-[22px]">
            Conecte-se com outros corretores e encontre oportunidades reais de negócio.
          </p>

          {/* Bullets */}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-white/50 lg:mt-8 lg:text-base">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Novos matches sendo gerados
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Corretores entrando na rede
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              Novas oportunidades todos os dias
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-10 lg:gap-4">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)] transition hover:-translate-y-px hover:shadow-[0_20px_45px_rgba(79,70,229,0.34)] sm:w-auto sm:px-8 sm:py-5 sm:text-lg"
            >
              Começar a gerar oportunidades
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
            <Link
              href="/imoveis"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-4 text-base font-semibold text-white/80 shadow-sm backdrop-blur transition hover:border-white/25 hover:bg-white/[0.12] sm:w-auto sm:px-8 sm:py-5 sm:text-lg"
            >
              <Flame className="mr-3 h-5 w-5 text-orange-500" />
              Ver oportunidades
            </Link>
          </div>

          <p className="mt-4 text-sm text-white/35 lg:mt-6">Sem cartão de crédito · Cancele quando quiser</p>

          {/* Mobile: imagem simplificada (sem cards) */}
          <div className="mt-10 flex justify-center lg:hidden">
            <img
              src="/corretores.png"
              alt="Corretores fechando parceria"
              className="w-full max-w-[340px] object-contain select-none"
              style={{
                filter: "drop-shadow(0 16px 40px rgba(37,99,235,0.14))",
                maxWidth: "none",
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* ── RIGHT: photo + floating cards — desktop only ────────────────── */}
        <div className="hidden lg:block relative lg:min-h-[800px]">

          {/* ── Efeitos de luz atrás da foto ─────────────────────────────── */}

          {/* Glows */}
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 520, height: 520, left: "48%", top: "18%", borderRadius: 9999, filter: "blur(50px)", mixBlendMode: "screen", background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(168,85,247,0.20) 35%, transparent 70%)", zIndex: -1 }} />
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 440, height: 440, left: "58%", top: "40%", borderRadius: 9999, filter: "blur(50px)", mixBlendMode: "screen", background: "radial-gradient(circle, rgba(96,165,250,0.28) 0%, transparent 70%)", zIndex: -1 }} />
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 320, height: 320, left: "64%", top: "46%", borderRadius: 9999, filter: "blur(50px)", mixBlendMode: "screen", background: "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)", zIndex: -1 }} />

          {/* Beams — opacidade reduzida para não disputar com o texto */}
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 680, height: 1, left: "42%", top: "32%", borderRadius: 999, opacity: 0.18, filter: "blur(1px)", transformOrigin: "left center", transform: "rotate(-10deg)", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 10%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.10) 90%, transparent 100%)", boxShadow: "0 0 8px rgba(255,255,255,0.15), 0 0 16px rgba(168,85,247,0.12)", zIndex: -1 }} />
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 760, height: 1, left: "38%", top: "48%", borderRadius: 999, opacity: 0.18, filter: "blur(1px)", transformOrigin: "left center", transform: "rotate(8deg)", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 10%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.10) 90%, transparent 100%)", boxShadow: "0 0 8px rgba(255,255,255,0.15), 0 0 16px rgba(168,85,247,0.12)", zIndex: -1 }} />
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 620, height: 1, left: "46%", top: "64%", borderRadius: 999, opacity: 0.18, filter: "blur(1px)", transformOrigin: "left center", transform: "rotate(-6deg)", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 10%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.10) 90%, transparent 100%)", boxShadow: "0 0 8px rgba(255,255,255,0.15), 0 0 16px rgba(168,85,247,0.12)", zIndex: -1 }} />

          {/* ── Luz nas mãos (handshake) ─────────────────────────────────── */}
          {/* Halo externo largo — warm white difuso */}
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 340, height: 260, left: "23%", top: "42%", borderRadius: "50%", filter: "blur(38px)", mixBlendMode: "screen", background: "radial-gradient(ellipse, rgba(255,245,220,0.55) 0%, rgba(255,200,120,0.22) 45%, transparent 75%)", zIndex: 1 }} />
          {/* Halo médio — mais quente, concentrado */}
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 200, height: 160, left: "28%", top: "46%", borderRadius: "50%", filter: "blur(22px)", mixBlendMode: "screen", background: "radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, rgba(255,220,140,0.45) 40%, transparent 70%)", zIndex: 1 }} />
          {/* Núcleo brilhante — ponto focal */}
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 90, height: 70, left: "32%", top: "50%", borderRadius: "50%", filter: "blur(10px)", mixBlendMode: "screen", background: "radial-gradient(ellipse, rgba(255,255,255,0.95) 0%, rgba(255,235,180,0.70) 50%, transparent 100%)", zIndex: 1 }} />
          {/* Reflexo azul-violeta no contorno */}
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 260, height: 200, left: "25%", top: "44%", borderRadius: "50%", filter: "blur(30px)", mixBlendMode: "screen", background: "radial-gradient(ellipse, rgba(140,160,255,0.20) 0%, transparent 70%)", zIndex: 1 }} />

          {/* Sparks */}
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 8, height: 8, left: "69%", top: "45%", borderRadius: "50%", background: "white", boxShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(168,85,247,0.45), 0 0 30px rgba(59,130,246,0.35)", zIndex: -1 }} />
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 5, height: 5, left: "61%", top: "28%", borderRadius: "50%", background: "white", opacity: 0.7, boxShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(168,85,247,0.45), 0 0 30px rgba(59,130,246,0.35)", zIndex: -1 }} />
          <div aria-hidden="true" className="pointer-events-none absolute" style={{ width: 6, height: 6, left: "76%", top: "58%", borderRadius: "50%", background: "white", opacity: 0.8, boxShadow: "0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(168,85,247,0.45), 0 0 30px rgba(59,130,246,0.35)", zIndex: -1 }} />

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
              height: "530px",
              maxWidth: "none",
              objectFit: "contain",
              objectPosition: "top right",
              top: "80px",
              right: "-6%",
              left: "auto",
            }}
            draggable={false}
          />

          {/* Card: Negócio fechado — acima da cabeça da corretora */}
          <FloatingCard className="absolute right-[3%] top-[5%] z-20 px-5 py-4" style={fadeUp(0.32)}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500/20 text-orange-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-white">Negócio fechado</div>
                <div className="text-sm text-white/50">na plataforma</div>
              </div>
            </div>
          </FloatingCard>

          {/* Card: Match encontrado — sobre o cotovelo do homem */}
          <FloatingCard className="absolute left-[-18%] top-[41%] z-20 w-[245px] px-3 py-2.5" style={fadeUp(0.48)}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-500/20 text-violet-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">Match encontrado</div>
                  <div className="text-[11px] text-white/50">Atualizado em tempo real</div>
                </div>
              </div>
              <div className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[11px] font-bold text-violet-300">93%</div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-white/40">
              <span>Compatibilidade</span>
              <span className="text-violet-300">93 / 100</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
              <div className="h-1.5 w-[93%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5">
              <div className="flex -space-x-1.5">
                <div className="grid h-5 w-5 place-items-center rounded-full border-2 border-white/20 bg-blue-500 text-[8px] font-bold text-white">J</div>
                <div className="grid h-5 w-5 place-items-center rounded-full border-2 border-white/20 bg-violet-500 text-[8px] font-bold text-white">MC</div>
              </div>
              <span className="text-[11px] text-white/50">2 corretores conectados</span>
            </div>
          </FloatingCard>

          {/* Card: Parceria iniciada — esquerda inferior */}
          <FloatingCard className="absolute left-[2%] bottom-[16%] z-20 px-5 py-4" style={fadeUp(0.58)}>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-white">Parceria iniciada</div>
                <div className="text-sm font-medium text-emerald-400">Comissão acordada</div>
              </div>
            </div>
          </FloatingCard>

          {/* Card: Comissão estimada — próximo ao crachá da corretora */}
          <FloatingCard className="absolute right-[1%] top-[65%] z-20 px-5 py-4 shadow-[0_20px_60px_rgba(16,185,129,0.18)]" style={fadeUp(0.68)}>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-white/50">Comissão estimada</div>
                <div className="text-[20px] font-black text-emerald-400">R$ 14.200</div>
              </div>
            </div>
            <div className="mt-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-sm font-medium text-emerald-400">
              sua parte neste match
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}