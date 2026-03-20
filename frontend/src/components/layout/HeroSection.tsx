"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Zap,
  TrendingUp,
  ArrowRight,
  HeartHandshake,
  Flame,
  Target,
} from "lucide-react";

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
        "rounded-3xl border border-white/70 bg-white/82 shadow-[0_18px_50px_rgba(37,99,235,0.12)] backdrop-blur-xl",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-[110px]">
      <div className="text-2xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.00012 + 0.00004,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    const lines = [
      { p0: [0.28, 0.30], p1: [0.48, 0.38], p2: [0.68, 0.45], color: [120, 180, 255] },
      { p0: [0.18, 0.58], p1: [0.46, 0.50], p2: [0.73, 0.44], color: [150, 160, 255] },
      { p0: [0.34, 0.78], p1: [0.52, 0.62], p2: [0.74, 0.48], color: [190, 140, 255] },
      { p0: [0.84, 0.24], p1: [0.72, 0.35], p2: [0.58, 0.45], color: [190, 170, 255] },
    ];

    const draw = () => {
      t += 0.008;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createLinearGradient(0, 0, W * 0.8, H);
      bg.addColorStop(0, "rgba(248,251,255,1)");
      bg.addColorStop(0.35, "rgba(241,244,255,0.98)");
      bg.addColorStop(0.7, "rgba(238,235,255,0.96)");
      bg.addColorStop(1, "rgba(244,241,255,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const glows = [
        { x: 0.72, y: 0.24, r: 0.28, color: "rgba(124,58,237,0.16)" },
        { x: 0.74, y: 0.48, r: 0.24, color: "rgba(59,130,246,0.16)" },
        { x: 0.62, y: 0.56, r: 0.18, color: "rgba(236,72,153,0.10)" },
      ];

      glows.forEach((g) => {
        const pulse = 1 + Math.sin(t * 0.7 + g.x * 5) * 0.04;
        const rg = ctx.createRadialGradient(
          g.x * W,
          g.y * H,
          0,
          g.x * W,
          g.y * H,
          g.r * W * pulse
        );
        rg.addColorStop(0, g.color);
        rg.addColorStop(1, "transparent");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      });

      lines.forEach((ln, i) => {
        const phase = t * 0.5 + i * 0.6;
        const opacity = Math.sin(phase) * 0.18 + 0.34;
        const width = Math.sin(phase * 0.7) * 0.3 + 1.0;

        const x0 = ln.p0[0] * W;
        const y0 = ln.p0[1] * H;
        const x1 = ln.p1[0] * W;
        const y1 = ln.p1[1] * H;
        const x2 = ln.p2[0] * W;
        const y2 = ln.p2[1] * H;

        const grad = ctx.createLinearGradient(x0, y0, x2, y2);
        const [r, g, b] = ln.color;
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${opacity.toFixed(2)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x1, y1, x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = width;
        ctx.stroke();
      });

      particles.forEach((p) => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed * 0.4;

        if (p.x > 1.05) p.x = -0.05;
        if (p.x < -0.05) p.x = 1.05;
        if (p.y > 1.05) p.y = -0.05;
        if (p.y < -0.05) p.y = 1.05;

        if (p.x < 0.36) return;

        const glow = Math.sin(t + p.pulse) * 0.3 + 0.7;
        const alpha = p.opacity * glow;

        const px = p.x * W;
        const py = p.y * H;

        const pg = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        pg.addColorStop(0, `rgba(220,220,255,${(alpha * 0.6).toFixed(2)})`);
        pg.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(px, py, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.fill();
      });

      const hotGlow = ctx.createRadialGradient(
        W * 0.72,
        H * 0.46,
        0,
        W * 0.72,
        H * 0.46,
        W * 0.12
      );
      hotGlow.addColorStop(0, "rgba(236,72,153,0.16)");
      hotGlow.addColorStop(0.55, "rgba(124,58,237,0.10)");
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

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

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
    <section className="relative overflow-x-hidden" style={{ minHeight: "860px" }}>
      <HeroCanvas />

      <div className="relative mx-auto grid min-h-[860px] max-w-[1400px] grid-cols-1 gap-12 px-6 pb-24 pt-14 md:px-10 lg:grid-cols-[1fr_1fr] lg:gap-4 lg:px-12 lg:pt-20">
        <div className="z-10 flex max-w-[620px] flex-col justify-center" style={fadeUp(0.08)}>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Plataforma em crescimento com corretores em todo o Brasil
          </div>

          <h1 className="mt-8 text-5xl font-black leading-[1] tracking-[-0.03em] text-slate-950 sm:text-6xl lg:text-[64px]">
            Pare de perder clientes por{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              não ter o imóvel certo.
            </span>
          </h1>

          <p className="mt-8 max-w-[560px] text-[22px] leading-relaxed text-slate-600">
            Conecte-se com outros corretores e encontre oportunidades reais de negócio.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-base text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              Novos matches sendo gerados
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
              Corretores entrando na rede
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-orange-400" />
              Novas oportunidades todos os dias
            </div>
          </div>

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

          <p className="mt-6 text-sm text-slate-400">
            Sem cartão de crédito · Cancele quando quiser
          </p>

          <div className="mt-12 flex flex-wrap gap-8 border-t border-slate-200/80 pt-8">
            <HeroStat value="100%" label="gratuito para começar" />
            <HeroStat value="+3" label="negócios fechados na rede" />
            <HeroStat value="2" label="estados ativos" />
          </div>
        </div>

        <div className="relative min-h-[700px] lg:min-h-[860px]">
          {/* glow atrás da imagem */}
          <div className="pointer-events-none absolute right-[2%] top-[12%] h-[620px] w-[620px] rounded-full bg-violet-400/18 blur-3xl" />
          <div className="pointer-events-none absolute right-[12%] top-[28%] h-[340px] w-[340px] rounded-full bg-blue-400/18 blur-3xl" />
          <div className="pointer-events-none absolute right-[18%] top-[42%] h-[180px] w-[180px] animate-pulse rounded-full bg-pink-400/18 blur-2xl" />

          {/* imagem principal */}
          <img
            src="/corretores.png"
            alt="Corretores fechando parceria"
            className="absolute z-0 select-none"
            style={{
              ...fadeUp(0.18),
              filter: "drop-shadow(0 28px 55px rgba(37,99,235,0.14))",
              width: "auto",
              height: "1380px",
              objectFit: "contain",
              objectPosition: "top right",
              top: "25px",
              right: "-10%",
              left: "auto",
            }}
            draggable={false}
          />

          {/* Negócio fechado */}
          <FloatingCard
            className="absolute right-[5%] top-[7%] z-20 px-4 py-3"
            style={fadeUp(0.32)}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-100 text-orange-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-800">Negócio fechado</div>
                <div className="text-xs text-slate-400">na plataforma</div>
              </div>
            </div>
          </FloatingCard>

          {/* Compatibilidade */}
          <FloatingCard
            className="absolute right-[2%] top-[25%] z-20 px-4 py-3"
            style={fadeUp(0.4)}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Compatibilidade</div>
                <div className="text-2xl font-black text-violet-700">93%</div>
                <div className="text-xs text-slate-400">calculando agora</div>
              </div>
            </div>
          </FloatingCard>

          {/* Match encontrado */}
          <FloatingCard
            className="absolute left-[-8%] top-[38%] z-20 w-[255px] px-4 py-4"
            style={fadeUp(0.48)}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                <Zap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-slate-800">Match encontrado</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  IA ativa em tempo real
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
              <span>Compatibilidade</span>
              <span className="font-bold text-violet-700">93 / 100</span>
            </div>

            <div className="mt-1.5 h-2 rounded-full bg-slate-100">
              <div className="h-2 w-[93%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex -space-x-2">
                <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-blue-500 text-[9px] font-bold text-white">
                  J
                </div>
                <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-violet-500 text-[9px] font-bold text-white">
                  MC
                </div>
              </div>
              <span className="text-xs text-slate-500">2 corretores conectados</span>
            </div>
          </FloatingCard>

          {/* Parceria iniciada */}
          <FloatingCard
            className="absolute left-[10%] bottom-[19%] z-20 px-4 py-3"
            style={fadeUp(0.58)}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100">
                <HeartHandshake className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-800">Parceria iniciada</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Comissão acordada
                </div>
              </div>
            </div>
          </FloatingCard>

          {/* Comissão estimada */}
          <FloatingCard
            className="absolute bottom-[11%] right-[2%] z-20 px-4 py-4 shadow-[0_20px_60px_rgba(16,185,129,0.18)]"
            style={fadeUp(0.68)}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Comissão estimada</div>
                <div className="text-[20px] font-black text-emerald-600">R$ 14.200</div>
              </div>
            </div>

            <div className="mt-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center text-xs font-medium text-emerald-600">
              sua parte neste match
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
}