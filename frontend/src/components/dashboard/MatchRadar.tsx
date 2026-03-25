"use client";

import { useEffect, useRef, useState } from "react";

export interface MatchRadarProps {
  stats?: {
    propertiesCount?: number;
    buyersCount?: number;
    matchesCount?: number;
    partnershipsPending?: number;
    myOpportunities?: any[];
  };
  size?: number;
}

// ── Fixed node positions ───────────────────────────────────────────────────────
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

// Match pairs: prop index → buyer index
const MATCH_PAIRS: [number, number][] = [[0, 0], [2, 1], [3, 3]];

// Opportunity nodes: inner-mid zone, distinct angles from props/buyers
const OPP_NODES = [
  { angle: 38,  r: 0.33 },
  { angle: 170, r: 0.42 },
  { angle: 285, r: 0.36 },
];

// Opp connections: [opp idx, "p"|"b", node idx]
const OPP_PAIRS: [number, "p" | "b", number][] = [
  [0, "p", 0],
  [1, "p", 2],
  [2, "b", 3],
];

const SWEEP_MS = 6500;

export function MatchRadar({ stats, size = 300 }: MatchRadarProps) {
  const [mounted, setMounted]   = useState(false);
  const [echoes,  setEchoes]    = useState<Set<string>>(new Set());
  const sweepRef                = useRef(0);

  const CX    = size / 2;
  const CY    = size / 2;
  const MAX_R = size * 0.44;

  const propCount  = Math.min(stats?.propertiesCount ?? 0, 5);
  const buyerCount = Math.min(stats?.buyersCount      ?? 0, 5);
  const matchCount = stats?.matchesCount ?? 0;
  const oppCount   = Math.min(stats?.myOpportunities?.length ?? 0, 3);
  const showProps  = propCount;
  const showBuyers = buyerCount;

  const toXY = (deg: number, r: number) => ({
    x: CX + Math.cos((deg * Math.PI) / 180) * r * MAX_R,
    y: CY + Math.sin((deg * Math.PI) / 180) * r * MAX_R,
  });

  // Scan-echo: fires when sweep passes over a real node
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
      const WINDOW = 20;

      PROP_NODES.slice(0, propCount).forEach((n, i) => {
        const diff = ((angle - n.angle) % 360 + 360) % 360;
        if (diff < WINDOW) nearby.add(`p${i}`);
      });
      BUYER_NODES.slice(0, buyerCount).forEach((n, i) => {
        const diff = ((angle - n.angle) % 360 + 360) % 360;
        if (diff < WINDOW) nearby.add(`b${i}`);
      });
      OPP_NODES.slice(0, oppCount).forEach((n, i) => {
        const diff = ((angle - n.angle) % 360 + 360) % 360;
        if (diff < WINDOW) nearby.add(`o${i}`);
      });

      setEchoes(prev => {
        if (nearby.size === 0 && prev.size === 0) return prev;
        const next = new Set(Array.from(prev).concat(Array.from(nearby)));
        prev.forEach(k => { if (!nearby.has(k)) next.delete(k); });
        return next;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [propCount, buyerCount, oppCount]);

  // Concentric rings — graduated opacity (inner brightest)
  const RINGS = [
    { r: 0.25, dash: undefined, opacity: 0.35, width: 1.2 },
    { r: 0.45, dash: undefined, opacity: 0.26, width: 1.0 },
    { r: 0.65, dash: undefined, opacity: 0.17, width: 1.0 },
    { r: 0.82, dash: undefined, opacity: 0.12, width: 0.9 },
    { r: 1.00, dash: "3 5",    opacity: 0.10, width: 0.8 },
  ];

  // 48 tick marks: major at 90°, medium at 30°, minor at 7.5°
  const ticks = Array.from({ length: 48 }, (_, i) => {
    const deg   = i * 7.5;
    const isMaj = i % 12 === 0;
    const isMed = i % 4 === 0 && !isMaj;
    const inner = MAX_R - (isMaj ? 13 : isMed ? 7 : 4);
    const outer = MAX_R;
    const rad   = (deg * Math.PI) / 180;
    return {
      x1: CX + Math.cos(rad) * inner, y1: CY + Math.sin(rad) * inner,
      x2: CX + Math.cos(rad) * outer, y2: CY + Math.sin(rad) * outer,
      opacity: isMaj ? 0.38 : isMed ? 0.20 : 0.09,
      width:   isMaj ? 1.5  : isMed ? 1.0  : 0.6,
    };
  });

  // Quadratic bezier curving through radar center
  const arcPath = (p: {x:number;y:number}, b: {x:number;y:number}) => {
    const mx  = (p.x + b.x) / 2;
    const my  = (p.y + b.y) / 2;
    const cpx = mx * 0.48 + CX * 0.52;
    const cpy = my * 0.48 + CY * 0.52;
    return `M ${p.x} ${p.y} Q ${cpx} ${cpy} ${b.x} ${b.y}`;
  };

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>

      {/* ── Ambient outer glow — continuously pulsing ── */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.14) 0%, rgba(79,142,247,0.06) 42%, transparent 68%)",
          animation: "glow-pulse 3.2s ease-in-out infinite",
        }} />

      {/* ── Center CSS box-shadow pulse (strongest visual anchor) ── */}
      <div className="absolute rounded-full pointer-events-none"
        style={{
          width:  MAX_R * 0.38,
          height: MAX_R * 0.38,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 22px 8px rgba(99,102,241,0.35), 0 0 50px 18px rgba(79,142,247,0.15)",
          animation: "glow-pulse 2.4s ease-in-out infinite",
        }} />

      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}
        xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
        <defs>

          {/* Disk background */}
          <radialGradient id="rm-disk" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#101d50" stopOpacity="0.78" />
            <stop offset="55%"  stopColor="#090e2a" stopOpacity="0.56" />
            <stop offset="100%" stopColor="#050a1a" stopOpacity="0.28" />
          </radialGradient>

          {/* Inner ring subtle fill glow */}
          <radialGradient id="rm-inner-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#5048ff" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#5048ff" stopOpacity="0"    />
          </radialGradient>

          {/* Sweep: trail (widest, faintest) */}
          <radialGradient id="rm-sweep-trail" cx={CX} cy={CY} r={MAX_R} gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.13" />
            <stop offset="65%"  stopColor="#4f8ef7" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0"    />
          </radialGradient>

          {/* Sweep: mid */}
          <radialGradient id="rm-sweep-mid" cx={CX} cy={CY} r={MAX_R} gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.42" />
            <stop offset="55%"  stopColor="#4f8ef7" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0"    />
          </radialGradient>

          {/* Sweep: sharp lead (brightest) */}
          <radialGradient id="rm-sweep-lead" cx={CX} cy={CY} r={MAX_R} gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#c7d2fe" stopOpacity="0.60" />
            <stop offset="35%"  stopColor="#818cf8" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0"    />
          </radialGradient>

          {/* Center radial glow */}
          <radialGradient id="rm-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#c7d2fe" stopOpacity="0.85" />
            <stop offset="30%"  stopColor="#818cf8" stopOpacity="0.50" />
            <stop offset="65%"  stopColor="#4f8ef7" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0"    />
          </radialGradient>

          {/* Connection: shadow layer */}
          <linearGradient id="rm-conn-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.22" />
            <stop offset="50%"  stopColor="#a78bfa" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.22" />
          </linearGradient>

          {/* Connection: lit animated layer */}
          <linearGradient id="rm-conn-lit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#93c5fd" stopOpacity="0.80" />
            <stop offset="50%"  stopColor="#c4b5fd" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.80" />
          </linearGradient>

          {/* Opportunity connection gradient */}
          <linearGradient id="rm-opp-conn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#fb923c" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.65" />
          </linearGradient>

          {/* Soft glow */}
          <filter id="rm-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Strong glow (matches, center nucleus) */}
          <filter id="rm-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Sweep leading edge glow */}
          <filter id="rm-sweep-line" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Blade: wide soft bloom (lightsaber halo) */}
          <filter id="rm-blade-bloom" x="-80%" y="-800%" width="260%" height="1700%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Blade tip: hot flare */}
          <filter id="rm-blade-tip" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Orange glow for opportunity nodes */}
          <filter id="rm-glow-orange" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Extra wide center glow */}
          <filter id="rm-center-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Clip to radar circle */}
          <clipPath id="rm-clip">
            <circle cx={CX} cy={CY} r={MAX_R} />
          </clipPath>

        </defs>

        {/* ── Disk ── */}
        <circle cx={CX} cy={CY} r={MAX_R} fill="url(#rm-disk)"
          stroke="rgba(99,130,245,0.20)" strokeWidth={1} />

        {/* ── Inner ring area subtle fill ── */}
        <circle cx={CX} cy={CY} r={MAX_R * 0.28} fill="url(#rm-inner-glow)" />

        {/* ── Concentric rings ── */}
        {RINGS.map((ring, i) => (
          <circle key={i}
            cx={CX} cy={CY} r={ring.r * MAX_R}
            fill="none"
            stroke={`rgba(139,150,255,${ring.opacity})`}
            strokeWidth={ring.width}
            strokeDasharray={ring.dash}
          />
        ))}

        {/* ── Cross lines (barely visible) ── */}
        {[0, 90].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return <line key={i}
            x1={CX - Math.cos(rad) * MAX_R} y1={CY - Math.sin(rad) * MAX_R}
            x2={CX + Math.cos(rad) * MAX_R} y2={CY + Math.sin(rad) * MAX_R}
            stroke="rgba(139,150,255,0.06)" strokeWidth={0.7} />;
        })}

        {/* ── Tick marks ── */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={`rgba(139,150,255,${t.opacity})`}
            strokeWidth={t.width} strokeLinecap="round" />
        ))}

        {/* ── Lightsaber sweep ── */}
        {mounted && (
          <g clipPath="url(#rm-clip)"
            style={{ transformOrigin: `${CX}px ${CY}px`, animation: `radar-rotate ${SWEEP_MS}ms linear infinite` }}>

            {/* Wide atmospheric trail */}
            <path
              d={`M ${CX} ${CY} L ${CX + MAX_R} ${CY}
                  A ${MAX_R} ${MAX_R} 0 0 0
                  ${CX + MAX_R * Math.cos((-115 * Math.PI) / 180)}
                  ${CY + MAX_R * Math.sin((-115 * Math.PI) / 180)} Z`}
              fill="url(#rm-sweep-trail)"
            />
            {/* Mid cone */}
            <path
              d={`M ${CX} ${CY} L ${CX + MAX_R} ${CY}
                  A ${MAX_R} ${MAX_R} 0 0 0
                  ${CX + MAX_R * Math.cos((-65 * Math.PI) / 180)}
                  ${CY + MAX_R * Math.sin((-65 * Math.PI) / 180)} Z`}
              fill="url(#rm-sweep-mid)"
            />
            {/* Tight lead cone */}
            <path
              d={`M ${CX} ${CY} L ${CX + MAX_R} ${CY}
                  A ${MAX_R} ${MAX_R} 0 0 0
                  ${CX + MAX_R * Math.cos((-20 * Math.PI) / 180)}
                  ${CY + MAX_R * Math.sin((-20 * Math.PI) / 180)} Z`}
              fill="url(#rm-sweep-lead)"
            />
            {/* Blade: outer bloom */}
            <line x1={CX} y1={CY} x2={CX + MAX_R} y2={CY}
              stroke="#93c5fd" strokeWidth={10} opacity={0.20}
              filter="url(#rm-blade-bloom)" />
            {/* Blade: mid electric glow */}
            <line x1={CX} y1={CY} x2={CX + MAX_R} y2={CY}
              stroke="#60a5fa" strokeWidth={4.5} opacity={0.60}
              filter="url(#rm-sweep-line)" />
            {/* Blade: white-hot core */}
            <line x1={CX} y1={CY} x2={CX + MAX_R} y2={CY}
              stroke="#e0f2fe" strokeWidth={1.6} opacity={1} />
            {/* Tip flare outer */}
            <circle cx={CX + MAX_R - 3} cy={CY} r={6}
              fill="#93c5fd" opacity={0.70} filter="url(#rm-blade-tip)" />
            {/* Tip flare core */}
            <circle cx={CX + MAX_R - 3} cy={CY} r={2.5}
              fill="#ffffff" opacity={1} />
          </g>
        )}

        {/* ── Center radial glow (animated) ── */}
        <circle cx={CX} cy={CY} r={MAX_R * 0.30} fill="url(#rm-center)"
          filter="url(#rm-center-glow)"
          style={{ animation: "node-pulse 2.4s ease-in-out infinite" }} />

        {/* ── Match connections (dual-path: shadow + lit animated) ── */}
        {matchCount > 0 && MATCH_PAIRS.slice(0, Math.min(matchCount, 3)).map(([pi, bi], i) => {
          if (pi >= showProps || bi >= showBuyers) return null;
          const p = toXY(PROP_NODES[pi].angle, PROP_NODES[pi].r);
          const b = toXY(BUYER_NODES[bi].angle, BUYER_NODES[bi].r);
          const d = arcPath(p, b);
          return (
            <g key={`conn-${i}`}>
              {/* Shadow — wide, blurred */}
              <path d={d} fill="none" stroke="url(#rm-conn-shadow)"
                strokeWidth={5} opacity={0.65} filter="url(#rm-glow)" />
              {/* Lit — bright animated dashes flowing along path */}
              <path d={d} fill="none" stroke="url(#rm-conn-lit)"
                strokeWidth={1.6} strokeDasharray="4 4" opacity={0.88}
                style={{ animation: "dash-flow 1.1s linear infinite" }} />
              {/* Midpoint node */}
              <circle
                cx={(p.x + b.x) / 2 * 0.48 + CX * 0.52}
                cy={(p.y + b.y) / 2 * 0.48 + CY * 0.52}
                r={3.2} fill="#34d399" opacity={0.90}
                filter="url(#rm-glow-strong)" />
            </g>
          );
        })}

        {/* ── Opportunity connections (orange dashed, inner zone) ── */}
        {oppCount > 0 && OPP_PAIRS.slice(0, oppCount).map(([oi, type, ni], i) => {
          const opp    = toXY(OPP_NODES[oi].angle, OPP_NODES[oi].r);
          const target = type === "p"
            ? (ni < showProps  ? toXY(PROP_NODES[ni].angle,  PROP_NODES[ni].r)  : null)
            : (ni < showBuyers ? toXY(BUYER_NODES[ni].angle, BUYER_NODES[ni].r) : null);
          if (!target) return null;
          const d = arcPath(opp, target);
          return (
            <g key={`oc-${i}`}>
              <path d={d} fill="none" stroke="#fb923c"
                strokeWidth={4} opacity={0.18} filter="url(#rm-glow)" />
              <path d={d} fill="none" stroke="url(#rm-opp-conn)"
                strokeWidth={1.4} strokeDasharray="3 6" opacity={0.75}
                style={{ animation: "dash-flow 1.6s linear infinite" }} />
            </g>
          );
        })}

        {/* ── Property nodes (glowing person, blue) ── */}
        {PROP_NODES.slice(0, showProps).map((n, i) => {
          const pos    = toXY(n.angle, n.r);
          const isReal = i < propCount;
          const echo   = echoes.has(`p${i}`);
          const lit    = isReal && echo;
          const color  = isReal ? "#60a5fa" : "rgba(96,165,250,0.20)";
          const glowC  = lit    ? "#bfdbfe"  : color;
          return (
            <g key={`p-${i}`}>
              {/* Scan-echo rings */}
              {lit && (
                <>
                  <circle cx={pos.x} cy={pos.y} r={26}
                    fill="none" stroke="#93c5fd" strokeWidth={1.5} opacity={0.50}
                    style={{ animation: "radar-ping 0.65s ease-out forwards" }} />
                  <circle cx={pos.x} cy={pos.y} r={18}
                    fill="none" stroke="#bfdbfe" strokeWidth={1} opacity={0.32}
                    style={{ animation: "radar-ping 0.65s ease-out forwards", animationDelay: "0.08s" }} />
                </>
              )}
              {/* Ambient outer halo */}
              {isReal && <circle cx={pos.x} cy={pos.y} r={16}
                fill={lit ? "rgba(96,165,250,0.14)" : "rgba(96,165,250,0.04)"} />}
              {/* Mid halo */}
              {isReal && <circle cx={pos.x} cy={pos.y} r={11}
                fill={lit ? "rgba(96,165,250,0.20)" : "rgba(96,165,250,0.07)"} />}
              {/* Ring stroke */}
              {isReal && <circle cx={pos.x} cy={pos.y} r={9}
                fill="none" stroke={lit ? "rgba(147,197,253,0.55)" : "rgba(96,165,250,0.20)"}
                strokeWidth={1} />}
              {/* House: walls */}
              <rect
                x={pos.x - 5} y={pos.y - 1}
                width={10} height={7} rx={0.5}
                fill={glowC}
                filter={isReal ? (lit ? "url(#rm-glow-strong)" : "url(#rm-glow)") : undefined}
              />
              {/* House: roof */}
              <polygon
                points={`${pos.x},${pos.y - 9} ${pos.x - 6.5},${pos.y - 1} ${pos.x + 6.5},${pos.y - 1}`}
                fill={glowC}
                filter={isReal ? (lit ? "url(#rm-glow-strong)" : "url(#rm-glow)") : undefined}
              />
              {/* House: door */}
              <rect
                x={pos.x - 1.5} y={pos.y + 2}
                width={3} height={4}
                fill="rgba(0,10,40,0.38)"
              />
              {/* Highlight when lit */}
              {lit && <circle cx={pos.x} cy={pos.y - 4} r={2.2} fill="#ffffff" opacity={0.80} />}
            </g>
          );
        })}

        {/* ── Buyer nodes (glowing person, violet) ── */}
        {BUYER_NODES.slice(0, showBuyers).map((n, i) => {
          const pos    = toXY(n.angle, n.r);
          const isReal = i < buyerCount;
          const echo   = echoes.has(`b${i}`);
          const lit    = isReal && echo;
          const color  = isReal ? "#a78bfa" : "rgba(167,139,250,0.20)";
          const glowC  = lit    ? "#ddd6fe"  : color;
          const hr = 4.5;
          const bw = 7;
          const bh = 8;
          const hy = pos.y - bh * 0.5 - hr;
          return (
            <g key={`b-${i}`}>
              {/* Scan-echo rings */}
              {lit && (
                <>
                  <circle cx={pos.x} cy={pos.y} r={24}
                    fill="none" stroke="#c4b5fd" strokeWidth={1.5} opacity={0.50}
                    style={{ animation: "radar-ping 0.65s ease-out forwards" }} />
                  <circle cx={pos.x} cy={pos.y} r={16}
                    fill="none" stroke="#ddd6fe" strokeWidth={1} opacity={0.30}
                    style={{ animation: "radar-ping 0.65s ease-out forwards", animationDelay: "0.08s" }} />
                </>
              )}
              {isReal && <circle cx={pos.x} cy={pos.y} r={16}
                fill={lit ? "rgba(167,139,250,0.14)" : "rgba(167,139,250,0.04)"} />}
              {isReal && <circle cx={pos.x} cy={pos.y} r={11}
                fill={lit ? "rgba(167,139,250,0.20)" : "rgba(167,139,250,0.07)"} />}
              {isReal && <circle cx={pos.x} cy={pos.y} r={9}
                fill="none" stroke={lit ? "rgba(196,181,253,0.55)" : "rgba(167,139,250,0.20)"}
                strokeWidth={1} />}
              {/* Person: body */}
              <ellipse
                cx={pos.x} cy={pos.y + bh * 0.18}
                rx={bw * 0.78} ry={bh * 0.52}
                fill={glowC}
                filter={isReal ? (lit ? "url(#rm-glow-strong)" : "url(#rm-glow)") : undefined}
              />
              {/* Person: head */}
              <circle
                cx={pos.x} cy={hy}
                r={hr}
                fill={glowC}
                filter={isReal ? (lit ? "url(#rm-glow-strong)" : "url(#rm-glow)") : undefined}
              />
              {lit && <circle cx={pos.x} cy={hy} r={hr * 0.55} fill="#ffffff" opacity={0.85} />}
            </g>
          );
        })}

        {/* ── Match overlay (green continuous pulse) ── */}
        {matchCount > 0 && MATCH_PAIRS.slice(0, Math.min(matchCount, 3)).map(([pi], i) => {
          if (pi >= showProps) return null;
          const pos = toXY(PROP_NODES[pi].angle, PROP_NODES[pi].r);
          return (
            <g key={`m-${i}`}>
              <circle cx={pos.x} cy={pos.y} r={11}
                fill="none" stroke="#34d399" strokeWidth={1.5} opacity={0.38}
                style={{ animation: "node-pulse 2.2s ease-in-out infinite" }} />
              <circle cx={pos.x} cy={pos.y} r={6}
                fill="#34d399" filter="url(#rm-glow-strong)"
                style={{ animation: "node-pulse 2.2s ease-in-out infinite" }} />
            </g>
          );
        })}

        {/* ── Opportunity nodes (house, orange, pulsing) ── */}
        {OPP_NODES.slice(0, oppCount).map((n, i) => {
          const pos  = toXY(n.angle, n.r);
          const echo = echoes.has(`o${i}`);
          return (
            <g key={`o-${i}`}>
              {echo && (
                <>
                  <circle cx={pos.x} cy={pos.y} r={22}
                    fill="none" stroke="#fb923c" strokeWidth={1.5} opacity={0.45}
                    style={{ animation: "radar-ping 0.65s ease-out forwards" }} />
                  <circle cx={pos.x} cy={pos.y} r={15}
                    fill="none" stroke="#fbbf24" strokeWidth={1} opacity={0.30}
                    style={{ animation: "radar-ping 0.65s ease-out forwards", animationDelay: "0.08s" }} />
                </>
              )}
              <circle cx={pos.x} cy={pos.y} r={14} fill="rgba(251,146,60,0.06)" />
              <circle cx={pos.x} cy={pos.y} r={9.5} fill="rgba(251,146,60,0.10)" />
              <circle cx={pos.x} cy={pos.y} r={11}
                fill="none" stroke="rgba(251,146,60,0.32)" strokeWidth={1}
                style={{ animation: "node-pulse 2.8s ease-in-out infinite" }} />
              {/* House: walls */}
              <rect
                x={pos.x - 4} y={pos.y - 0.5}
                width={8} height={5.5} rx={0.4}
                fill="#fb923c" filter="url(#rm-glow-orange)"
                style={{ animation: "node-pulse 2.8s ease-in-out infinite" }}
              />
              {/* House: roof */}
              <polygon
                points={`${pos.x},${pos.y - 7} ${pos.x - 5.5},${pos.y - 0.5} ${pos.x + 5.5},${pos.y - 0.5}`}
                fill="#fb923c" filter="url(#rm-glow-orange)"
                style={{ animation: "node-pulse 2.8s ease-in-out infinite" }}
              />
              {/* House: door */}
              <rect
                x={pos.x - 1.2} y={pos.y + 1.5}
                width={2.5} height={3.5}
                fill="rgba(0,0,0,0.28)"
              />
              <circle cx={pos.x} cy={pos.y - 3} r={1.5} fill="#fed7aa" />
            </g>
          );
        })}

        {/* ── Center station (5-layer) ── */}
        {/* Outer breathing ring */}
        <circle cx={CX} cy={CY} r={22} fill="none"
          stroke="rgba(129,140,248,0.14)" strokeWidth={1}
          style={{ animation: "node-pulse 3s ease-in-out infinite" }} />
        {/* Mid structural ring */}
        <circle cx={CX} cy={CY} r={15} fill="none"
          stroke="rgba(129,140,248,0.26)" strokeWidth={1} />
        {/* Inner disk */}
        <circle cx={CX} cy={CY} r={10}
          fill="rgba(99,102,241,0.30)" filter="url(#rm-glow)" />
        {/* Nucleus */}
        <circle cx={CX} cy={CY} r={6} fill="#6366f1" filter="url(#rm-glow-strong)" />
        {/* Core bright dot */}
        <circle cx={CX} cy={CY} r={2.8} fill="#e0e7ff" />
        {/* Cardinal cross lines */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return <line key={i}
            x1={CX + Math.cos(rad) * 13} y1={CY + Math.sin(rad) * 13}
            x2={CX + Math.cos(rad) * 24} y2={CY + Math.sin(rad) * 24}
            stroke="rgba(129,140,248,0.25)" strokeWidth={1} strokeLinecap="round" />;
        })}

      </svg>

      {/* ── Premium legend ── */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pb-1 flex-wrap">
        <LegendItem color="#60a5fa" shape="house"    label="Imóveis" />
        <LegendItem color="#a78bfa" shape="person"   label="Compradores" />
        {matchCount > 0 && (
          <LegendItem color="#34d399" shape="circle"
            label={`${matchCount} match${matchCount > 1 ? "es" : ""}`} pulse />
        )}
        {oppCount > 0 && (
          <LegendItem color="#fb923c" shape="house"
            label={`${oppCount} oport.`} pulse />
        )}
      </div>

    </div>
  );
}

// ── Legend item ──────────────────────────────────────────────────────────────

function LegendItem({
  color, shape, label, pulse,
}: {
  color: string; shape: "circle" | "diamond" | "triangle" | "person" | "house"; label: string; pulse?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
        {pulse && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-40"
            style={{ backgroundColor: color }} />
        )}
        {shape === "house" ? (
          <svg width="9" height="12" viewBox="0 0 9 12">
            <polygon points="4.5,0.5 0.5,5 8.5,5" fill={color} />
            <rect x="1.5" y="5" width="6" height="5.5" rx="0.5" fill={color} />
            <rect x="3.2" y="7.5" width="2.6" height="3" fill="rgba(0,0,0,0.30)" />
          </svg>
        ) : shape === "person" ? (
          <svg width="9" height="12" viewBox="0 0 9 12">
            <circle cx="4.5" cy="3" r="2.4" fill={color} />
            <ellipse cx="4.5" cy="9" rx="3.4" ry="2.8" fill={color} />
          </svg>
        ) : shape === "diamond" ? (
          <svg width="9" height="9" viewBox="0 0 9 9">
            <rect x="1.5" y="1.5" width="6" height="6" transform="rotate(45 4.5 4.5)"
              fill={color} />
          </svg>
        ) : shape === "triangle" ? (
          <svg width="9" height="9" viewBox="0 0 9 9">
            <polygon points="4.5,1 8,8 1,8" fill={color} />
          </svg>
        ) : (
          <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: color }} />
        )}
      </span>
      <span className="text-[9px] font-medium text-muted-foreground whitespace-nowrap">{label}</span>
    </div>
  );
}