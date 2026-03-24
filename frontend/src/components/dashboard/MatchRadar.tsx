"use client";

import { useEffect, useRef, useState } from "react";

export interface MatchRadarProps {
  stats?: {
    propertiesCount?: number;
    buyersCount?: number;
    matchesCount?: number;
    partnershipsPending?: number;
  };
  size?: number;
}

// ── Node layout — posições fixas para consistência visual ──────────────────────
// Os nós ghost (vazios) preenchem o radar mesmo sem dados; nós reais têm glow

const PROP_NODES = [
  { angle: 22,  r: 0.68 },
  { angle: 98,  r: 0.82 },
  { angle: 155, r: 0.60 },
  { angle: 220, r: 0.75 },
  { angle: 300, r: 0.55 },
];

const BUYER_NODES = [
  { angle: 58,  r: 0.50 },
  { angle: 130, r: 0.72 },
  { angle: 195, r: 0.44 },
  { angle: 262, r: 0.66 },
  { angle: 340, r: 0.78 },
];

// Pares de conexão match (prop index → buyer index)
const MATCH_PAIRS: [number, number][] = [[0, 0], [2, 1], [3, 3]];

// Velocidade do sweep em ms por revolução
const SWEEP_MS = 7000;

export function MatchRadar({ stats, size = 300 }: MatchRadarProps) {
  const [mounted, setMounted]     = useState(false);
  const [echoes,  setEchoes]      = useState<Set<string>>(new Set());
  const sweepRef                  = useRef(0); // graus acumulados

  const CX    = size / 2;
  const CY    = size / 2;
  const MAX_R = size * 0.44;

  const propCount  = Math.min(stats?.propertiesCount  ?? 0, 5);
  const buyerCount = Math.min(stats?.buyersCount       ?? 0, 5);
  const matchCount = stats?.matchesCount ?? 0;
  const showProps  = Math.max(propCount,  3);
  const showBuyers = Math.max(buyerCount, 3);

  const toXY = (deg: number, r: number) => ({
    x: CX + Math.cos((deg * Math.PI) / 180) * r * MAX_R,
    y: CY + Math.sin((deg * Math.PI) / 180) * r * MAX_R,
  });

  // Scan-echo: dispara quando sweep passa por um nó real
  useEffect(() => {
    setMounted(true);
    let frame = 0;
    let last  = performance.now();

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      sweepRef.current = (sweepRef.current + (dt / SWEEP_MS) * 360) % 360;

      const nearby = new Set<string>();
      const angle  = sweepRef.current;
      const WINDOW = 18; // graus de tolerância

      PROP_NODES.slice(0, propCount).forEach((n, i) => {
        const diff = ((angle - n.angle) % 360 + 360) % 360;
        if (diff < WINDOW) nearby.add(`p${i}`);
      });
      BUYER_NODES.slice(0, buyerCount).forEach((n, i) => {
        const diff = ((angle - n.angle) % 360 + 360) % 360;
        if (diff < WINDOW) nearby.add(`b${i}`);
      });

      setEchoes(prev => {
        if (nearby.size === 0 && prev.size === 0) return prev;
        const next = new Set(Array.from(prev).concat(Array.from(nearby)));
        // decai nós que saíram da janela
        prev.forEach(k => { if (!nearby.has(k)) next.delete(k); });
        return next;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [propCount, buyerCount]);

  // Rings: 5 anéis com estilos distintos
  const RINGS = [
    { r: 0.25, dash: undefined,  opacity: 0.18 },
    { r: 0.45, dash: undefined,  opacity: 0.14 },
    { r: 0.65, dash: undefined,  opacity: 0.11 },
    { r: 0.82, dash: undefined,  opacity: 0.09 },
    { r: 1.00, dash: "4 6",     opacity: 0.12 },
  ];

  // Tick marks: 24 pequenas marcações na borda (a cada 15°)
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const deg   = i * 15;
    const isMaj = i % 6 === 0; // 4 major ticks a cada 90°
    const inner = MAX_R - (isMaj ? 10 : 5);
    const outer = MAX_R;
    const rad   = (deg * Math.PI) / 180;
    return {
      x1: CX + Math.cos(rad) * inner, y1: CY + Math.sin(rad) * inner,
      x2: CX + Math.cos(rad) * outer, y2: CY + Math.sin(rad) * outer,
      opacity: isMaj ? 0.30 : 0.14,
      width:   isMaj ? 1.5 : 1,
    };
  });

  // Helper: quadratic bezier curvada pelo centro
  const arcPath = (p: {x:number;y:number}, b: {x:number;y:number}) => {
    // ponto de controle: interpolação entre midpoint e centro do radar
    const mx  = (p.x + b.x) / 2;
    const my  = (p.y + b.y) / 2;
    const cpx = mx * 0.55 + CX * 0.45;
    const cpy = my * 0.55 + CY * 0.45;
    return `M ${p.x} ${p.y} Q ${cpx} ${cpy} ${b.x} ${b.y}`;
  };

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>

      {/* ── Ambient outer glow (CSS) ── */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />

      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}
        xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        <defs>

          {/* Fundo do disco — gradiente radial escuro */}
          <radialGradient id="rm-disk" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0e1a45" stopOpacity="0.65" />
            <stop offset="60%"  stopColor="#080f28" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#050a1a" stopOpacity="0.30" />
          </radialGradient>

          {/* Sweep — gradiente radial do centro para fora (não distorce ao girar) */}
          <radialGradient id="rm-sweep-a" cx={CX} cy={CY} r={MAX_R} gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="55%"  stopColor="#4f8ef7" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="rm-sweep-b" cx={CX} cy={CY} r={MAX_R} gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0"    />
          </radialGradient>

          {/* Centro */}
          <radialGradient id="rm-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.60" />
            <stop offset="50%"  stopColor="#4f8ef7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0"    />
          </radialGradient>

          {/* Gradiente das linhas de conexão */}
          <linearGradient id="rm-conn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.55" />
            <stop offset="50%"  stopColor="#a78bfa" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.55" />
          </linearGradient>

          {/* Filtro glow suave */}
          <filter id="rm-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Filtro glow forte (matches) */}
          <filter id="rm-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Filtro glow da linha de sweep */}
          <filter id="rm-sweep-line" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Clip ao círculo externo */}
          <clipPath id="rm-clip">
            <circle cx={CX} cy={CY} r={MAX_R} />
          </clipPath>

        </defs>

        {/* ── Disco de fundo ── */}
        <circle cx={CX} cy={CY} r={MAX_R} fill="url(#rm-disk)"
          stroke="rgba(99,130,245,0.14)" strokeWidth={1} />

        {/* ── Anéis concêntricos ── */}
        {RINGS.map((ring, i) => (
          <circle key={i}
            cx={CX} cy={CY} r={ring.r * MAX_R}
            fill="none"
            stroke={`rgba(139,150,255,${ring.opacity})`}
            strokeWidth={1}
            strokeDasharray={ring.dash}
          />
        ))}

        {/* ── Linhas cruzadas (muito sutis) ── */}
        {[0, 90].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return <line key={i}
            x1={CX - Math.cos(rad) * MAX_R} y1={CY - Math.sin(rad) * MAX_R}
            x2={CX + Math.cos(rad) * MAX_R} y2={CY + Math.sin(rad) * MAX_R}
            stroke="rgba(139,150,255,0.05)" strokeWidth={1} />;
        })}

        {/* ── Tick marks na borda ── */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={`rgba(139,150,255,${t.opacity})`}
            strokeWidth={t.width} strokeLinecap="round" />
        ))}

        {/* ── Sweep rotativo ── */}
        {mounted && (
          <g clipPath="url(#rm-clip)"
            style={{ transformOrigin: `${CX}px ${CY}px`, animation: `radar-rotate ${SWEEP_MS}ms linear infinite` }}>

            {/* Trail largo — sombra do sweep */}
            <path
              d={`M ${CX} ${CY} L ${CX + MAX_R} ${CY}
                  A ${MAX_R} ${MAX_R} 0 0 0
                  ${CX + MAX_R * Math.cos((-100 * Math.PI) / 180)}
                  ${CY + MAX_R * Math.sin((-100 * Math.PI) / 180)} Z`}
              fill="url(#rm-sweep-b)"
            />

            {/* Fan principal */}
            <path
              d={`M ${CX} ${CY} L ${CX + MAX_R} ${CY}
                  A ${MAX_R} ${MAX_R} 0 0 0
                  ${CX + MAX_R * Math.cos((-65 * Math.PI) / 180)}
                  ${CY + MAX_R * Math.sin((-65 * Math.PI) / 180)} Z`}
              fill="url(#rm-sweep-a)"
            />

            {/* Linha líder do sweep */}
            <line x1={CX} y1={CY} x2={CX + MAX_R} y2={CY}
              stroke="#818cf8" strokeWidth={1.5} opacity={0.9}
              filter="url(#rm-sweep-line)" />

            {/* Ponto brilhante na ponta do sweep */}
            <circle cx={CX + MAX_R} cy={CY} r={2}
              fill="#a5b4fc" opacity={0.8} filter="url(#rm-glow)" />
          </g>
        )}

        {/* ── Glow central (camadas) ── */}
        <circle cx={CX} cy={CY} r={MAX_R * 0.22} fill="url(#rm-center)" />

        {/* ── Linhas de conexão (bezier) ── */}
        {matchCount > 0 && MATCH_PAIRS.slice(0, Math.min(matchCount, 3)).map(([pi, bi], i) => {
          if (pi >= showProps || bi >= showBuyers) return null;
          const p = toXY(PROP_NODES[pi].angle, PROP_NODES[pi].r);
          const b = toXY(BUYER_NODES[bi].angle, BUYER_NODES[bi].r);
          return (
            <g key={`conn-${i}`}>
              {/* Linha curved */}
              <path d={arcPath(p, b)}
                fill="none" stroke="url(#rm-conn)"
                strokeWidth={1.2} strokeDasharray="3 5"
                opacity={0.55} />
              {/* Ponto de midpoint */}
              <circle
                cx={(p.x + b.x) / 2 * 0.55 + CX * 0.45}
                cy={(p.y + b.y) / 2 * 0.55 + CY * 0.45}
                r={2.5} fill="#34d399" opacity={0.7}
                filter="url(#rm-glow)" />
            </g>
          );
        })}

        {/* ── Nós de imóveis (diamante azul) ── */}
        {PROP_NODES.slice(0, showProps).map((n, i) => {
          const pos    = toXY(n.angle, n.r);
          const isReal = i < propCount;
          const echo   = echoes.has(`p${i}`);
          return (
            <g key={`p-${i}`}>
              {/* Echo ring quando sweep detecta */}
              {echo && isReal && (
                <circle cx={pos.x} cy={pos.y} r={14}
                  fill="none" stroke="#60a5fa" strokeWidth={1}
                  opacity={0.5}
                  style={{ animation: "radar-ping 0.9s ease-out forwards" }} />
              )}
              {/* Halo externo */}
              {isReal && <circle cx={pos.x} cy={pos.y} r={11}
                fill="rgba(96,165,250,0.08)" />}
              {/* Halo médio */}
              {isReal && <circle cx={pos.x} cy={pos.y} r={7}
                fill="none" stroke="rgba(96,165,250,0.22)" strokeWidth={1} />}
              {/* Diamante (quadrado rotacionado) */}
              <rect
                x={pos.x - (isReal ? 4.5 : 2.5)}
                y={pos.y - (isReal ? 4.5 : 2.5)}
                width={isReal ? 9 : 5}
                height={isReal ? 9 : 5}
                transform={`rotate(45 ${pos.x} ${pos.y})`}
                fill={isReal ? "#60a5fa" : "rgba(96,165,250,0.18)"}
                filter={isReal ? "url(#rm-glow)" : undefined}
              />
            </g>
          );
        })}

        {/* ── Nós de compradores (círculo violeta) ── */}
        {BUYER_NODES.slice(0, showBuyers).map((n, i) => {
          const pos    = toXY(n.angle, n.r);
          const isReal = i < buyerCount;
          const echo   = echoes.has(`b${i}`);
          return (
            <g key={`b-${i}`}>
              {echo && isReal && (
                <circle cx={pos.x} cy={pos.y} r={13}
                  fill="none" stroke="#a78bfa" strokeWidth={1}
                  opacity={0.5}
                  style={{ animation: "radar-ping 0.9s ease-out forwards" }} />
              )}
              {isReal && <circle cx={pos.x} cy={pos.y} r={10}
                fill="rgba(167,139,250,0.09)" />}
              {isReal && <circle cx={pos.x} cy={pos.y} r={6.5}
                fill="none" stroke="rgba(167,139,250,0.20)" strokeWidth={1} />}
              <circle
                cx={pos.x} cy={pos.y}
                r={isReal ? 4 : 2.5}
                fill={isReal ? "#a78bfa" : "rgba(167,139,250,0.18)"}
                filter={isReal ? "url(#rm-glow)" : undefined}
              />
            </g>
          );
        })}

        {/* ── Overlay de match (verde, pulso contínuo) ── */}
        {matchCount > 0 && MATCH_PAIRS.slice(0, Math.min(matchCount, 3)).map(([pi], i) => {
          if (pi >= showProps) return null;
          const pos = toXY(PROP_NODES[pi].angle, PROP_NODES[pi].r);
          return (
            <g key={`m-${i}`}>
              <circle cx={pos.x} cy={pos.y} r={7}
                fill="none" stroke="#34d399" strokeWidth={1}
                opacity={0.45}
                style={{ animation: "node-pulse 2.8s ease-in-out infinite" }} />
              <circle cx={pos.x} cy={pos.y} r={3.5}
                fill="#34d399" filter="url(#rm-glow-strong)"
                style={{ animation: "node-pulse 2.8s ease-in-out infinite" }} />
            </g>
          );
        })}

        {/* ── Centro ── */}
        {/* Anel externo do centro */}
        <circle cx={CX} cy={CY} r={14} fill="none"
          stroke="rgba(129,140,248,0.18)" strokeWidth={1} />
        {/* Disco interno */}
        <circle cx={CX} cy={CY} r={9}
          fill="rgba(99,102,241,0.20)" filter="url(#rm-glow)" />
        {/* Núcleo */}
        <circle cx={CX} cy={CY} r={5} fill="#6366f1" filter="url(#rm-glow)" />
        {/* Core brilhante */}
        <circle cx={CX} cy={CY} r={2.5} fill="#e0e7ff" />
        {/* Cruz central (4 pequenas linhas) */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return <line key={i}
            x1={CX + Math.cos(rad) * 10} y1={CY + Math.sin(rad) * 10}
            x2={CX + Math.cos(rad) * 18} y2={CY + Math.sin(rad) * 18}
            stroke="rgba(129,140,248,0.25)" strokeWidth={1} strokeLinecap="round" />;
        })}

      </svg>

      {/* ── Legenda premium ── */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pb-1">
        <LegendItem color="#60a5fa" shape="diamond" label="Imóveis disponíveis" />
        <LegendItem color="#a78bfa" shape="circle"  label="Compradores ativos"  />
        {matchCount > 0 && (
          <LegendItem color="#34d399" shape="circle" label="Oportunidades identificadas" pulse />
        )}
      </div>

    </div>
  );
}

// ── Legend item ──────────────────────────────────────────────────────────────

function LegendItem({
  color, shape, label, pulse,
}: {
  color: string; shape: "circle" | "diamond"; label: string; pulse?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
        {pulse && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-40"
            style={{ backgroundColor: color }} />
        )}
        {shape === "diamond" ? (
          <svg width="8" height="8" viewBox="0 0 8 8">
            <rect x="1" y="1" width="6" height="6" transform="rotate(45 4 4)"
              fill={color} />
          </svg>
        ) : (
          <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: color }} />
        )}
      </span>
      <span className="text-[9px] font-medium text-slate-500 whitespace-nowrap">{label}</span>
    </div>
  );
}
