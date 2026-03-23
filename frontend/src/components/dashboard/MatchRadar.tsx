"use client";

import { useEffect, useState } from "react";

interface MatchRadarProps {
  stats?: {
    propertiesCount?: number;
    buyersCount?: number;
    matchesCount?: number;
    partnershipsPending?: number;
  };
  size?: number;
}

// Fixed node positions — property nodes (blue)
const PROP_NODES = [
  { angle: 28,  r: 0.68 },
  { angle: 145, r: 0.76 },
  { angle: 205, r: 0.60 },
  { angle: 295, r: 0.72 },
  { angle: 75,  r: 0.85 },
];

// Fixed node positions — buyer nodes (violet)
const BUYER_NODES = [
  { angle: 62,  r: 0.54 },
  { angle: 178, r: 0.48 },
  { angle: 248, r: 0.78 },
  { angle: 332, r: 0.62 },
  { angle: 115, r: 0.70 },
];

// Match connection pairs (prop index → buyer index)
const MATCH_PAIRS = [
  [0, 0],
  [2, 1],
  [3, 3],
];

export function MatchRadar({ stats, size = 340 }: MatchRadarProps) {
  const [mounted, setMounted] = useState(false);
  const [activePing, setActivePing] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setActivePing(p => (p + 1) % 3), 2400);
    return () => clearInterval(id);
  }, []);

  const CX = size / 2;
  const CY = size / 2;
  const MAX_R = size * 0.46;

  const propCount  = Math.min(stats?.propertiesCount  ?? 0, 5);
  const buyerCount = Math.min(stats?.buyersCount       ?? 0, 5);
  const matchCount = stats?.matchesCount ?? 0;

  // show at least 3 ghost nodes for visual on empty state
  const showProps  = Math.max(propCount,  3);
  const showBuyers = Math.max(buyerCount, 3);

  const toXY = (angleDeg: number, rRatio: number) => ({
    x: CX + Math.cos((angleDeg * Math.PI) / 180) * rRatio * MAX_R,
    y: CY + Math.sin((angleDeg * Math.PI) / 180) * rRatio * MAX_R,
  });

  const RINGS = [0.30, 0.55, 0.78, 1.00];

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(79,130,246,0.08) 0%, transparent 70%)",
        }}
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          {/* Sweep gradient (fan shape) */}
          <linearGradient id="rm-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#4f8ef7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0"    />
          </linearGradient>

          {/* Center radial glow */}
          <radialGradient id="rm-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#4f8ef7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0"   />
          </radialGradient>

          {/* Match connection line gradient */}
          <linearGradient id="rm-match-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#10b981" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="rm-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong glow filter */}
          <filter id="rm-glow-strong" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip to circle */}
          <clipPath id="rm-clip">
            <circle cx={CX} cy={CY} r={MAX_R + 2} />
          </clipPath>
        </defs>

        {/* ── Background ring fill (very subtle) ── */}
        <circle
          cx={CX} cy={CY} r={MAX_R}
          fill="rgba(15,30,80,0.3)"
          stroke="rgba(79,130,246,0.12)"
          strokeWidth={1}
        />

        {/* ── Concentric rings ── */}
        {RINGS.map((ratio, i) => (
          <circle
            key={i}
            cx={CX} cy={CY}
            r={ratio * MAX_R}
            fill="none"
            stroke={`rgba(99,130,245,${0.08 + i * 0.04})`}
            strokeWidth={1}
          />
        ))}

        {/* ── Cross hairs ── */}
        <line x1={CX - MAX_R} y1={CY} x2={CX + MAX_R} y2={CY} stroke="rgba(99,130,245,0.06)" strokeWidth={1} />
        <line x1={CX} y1={CY - MAX_R} x2={CX} y2={CY + MAX_R} stroke="rgba(99,130,245,0.06)" strokeWidth={1} />

        {/* ── Diagonal cross hairs (lighter) ── */}
        {[45, 135].map((deg, i) => {
          const cos = Math.cos((deg * Math.PI) / 180);
          const sin = Math.sin((deg * Math.PI) / 180);
          return (
            <line
              key={i}
              x1={CX - cos * MAX_R} y1={CY - sin * MAX_R}
              x2={CX + cos * MAX_R} y2={CY + sin * MAX_R}
              stroke="rgba(99,130,245,0.04)"
              strokeWidth={1}
            />
          );
        })}

        {/* ── Sweep arc (rotating scanner) ── */}
        <g
          clipPath="url(#rm-clip)"
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            animation: mounted ? "radar-rotate 6s linear infinite" : "none",
          }}
        >
          {/* The sweep fan — 60° arc */}
          <path
            d={`
              M ${CX} ${CY}
              L ${CX + MAX_R} ${CY}
              A ${MAX_R} ${MAX_R} 0 0 0 ${CX + MAX_R * Math.cos((-60 * Math.PI) / 180)} ${CY + MAX_R * Math.sin((-60 * Math.PI) / 180)}
              Z
            `}
            fill="url(#rm-sweep)"
            opacity={0.6}
          />
          {/* Leading edge line */}
          <line
            x1={CX} y1={CY}
            x2={CX + MAX_R} y2={CY}
            stroke="#4f8ef7"
            strokeWidth={1.5}
            opacity={0.8}
            filter="url(#rm-glow)"
          />
        </g>

        {/* ── Center ambient glow ── */}
        <circle cx={CX} cy={CY} r={MAX_R * 0.18} fill="url(#rm-center-glow)" />

        {/* ── Match connection lines ── */}
        {matchCount > 0 && MATCH_PAIRS.slice(0, Math.min(matchCount, 3)).map(([pi, bi], i) => {
          if (pi >= showProps || bi >= showBuyers) return null;
          const p = toXY(PROP_NODES[pi].angle,   PROP_NODES[pi].r);
          const b = toXY(BUYER_NODES[bi].angle, BUYER_NODES[bi].r);
          return (
            <g key={`conn-${i}`}>
              <line
                x1={p.x} y1={p.y}
                x2={b.x} y2={b.y}
                stroke="url(#rm-match-line)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.6}
              />
              {/* Midpoint dot */}
              <circle
                cx={(p.x + b.x) / 2}
                cy={(p.y + b.y) / 2}
                r={3}
                fill="#10b981"
                opacity={0.8}
                filter="url(#rm-glow)"
              />
            </g>
          );
        })}

        {/* ── Property nodes (blue) ── */}
        {PROP_NODES.slice(0, showProps).map((n, i) => {
          const pos    = toXY(n.angle, n.r);
          const isReal = i < propCount;
          const isPing = isReal && activePing === i % 3 && mounted;
          return (
            <g key={`p-${i}`}>
              {/* Ping ring */}
              {isPing && (
                <circle
                  cx={pos.x} cy={pos.y}
                  r={11}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  opacity={0.5}
                  style={{ animation: "radar-ping 1.6s ease-out forwards" }}
                />
              )}
              {/* Halo */}
              {isReal && (
                <circle cx={pos.x} cy={pos.y} r={9} fill="rgba(59,130,246,0.15)" />
              )}
              {/* Core dot */}
              <circle
                cx={pos.x} cy={pos.y}
                r={isReal ? 5 : 3}
                fill={isReal ? "#3b82f6" : "rgba(59,130,246,0.25)"}
                filter={isReal ? "url(#rm-glow)" : undefined}
              />
            </g>
          );
        })}

        {/* ── Buyer nodes (violet) ── */}
        {BUYER_NODES.slice(0, showBuyers).map((n, i) => {
          const pos    = toXY(n.angle, n.r);
          const isReal = i < buyerCount;
          const isPing = isReal && activePing === (i + 1) % 3 && mounted;
          return (
            <g key={`b-${i}`}>
              {isPing && (
                <circle
                  cx={pos.x} cy={pos.y}
                  r={11}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  opacity={0.5}
                  style={{ animation: "radar-ping 1.6s ease-out forwards" }}
                />
              )}
              {isReal && (
                <circle cx={pos.x} cy={pos.y} r={9} fill="rgba(139,92,246,0.15)" />
              )}
              <circle
                cx={pos.x} cy={pos.y}
                r={isReal ? 5 : 3}
                fill={isReal ? "#8b5cf6" : "rgba(139,92,246,0.25)"}
                filter={isReal ? "url(#rm-glow)" : undefined}
              />
            </g>
          );
        })}

        {/* ── Match highlight nodes (green, on top) ── */}
        {matchCount > 0 && MATCH_PAIRS.slice(0, Math.min(matchCount, 3)).map(([pi], i) => {
          if (pi >= showProps) return null;
          const pos = toXY(PROP_NODES[pi].angle, PROP_NODES[pi].r);
          return (
            <circle
              key={`m-${i}`}
              cx={pos.x} cy={pos.y}
              r={4}
              fill="#10b981"
              filter="url(#rm-glow-strong)"
              style={{ animation: "node-pulse 2.4s ease-in-out infinite" }}
            />
          );
        })}

        {/* ── Center ── */}
        <circle cx={CX} cy={CY} r={8} fill="rgba(79,130,246,0.3)" filter="url(#rm-glow-strong)" />
        <circle cx={CX} cy={CY} r={5} fill="#4f8ef7"              filter="url(#rm-glow)" />
        <circle cx={CX} cy={CY} r={2.5} fill="white" />
      </svg>

      {/* ── Legend ── */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 block" />
          <span className="text-[10px] text-slate-500">Imóveis</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-500 block" />
          <span className="text-[10px] text-slate-500">Compradores</span>
        </div>
        {matchCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
            <span className="text-[10px] text-slate-500">Matches</span>
          </div>
        )}
      </div>
    </div>
  );
}
