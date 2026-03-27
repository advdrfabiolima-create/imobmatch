"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { maskPhone } from "@/lib/masks";

/* ═══════════════════════════════════════════════════════════
   CSS — fiel ao modelo HTML
═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg: #08080f;
  --surface: #0f0f1a;
  --border: rgba(255,255,255,0.09);
  --text: #f0efff;
  --muted: #8a8aaa;
  --accent: #7c5cfc;
  --accent-bright: #9d7fff;
  --accent-dim: rgba(124,92,252,0.15);
  --accent-glow: rgba(124,92,252,0.25);
  --gold: #a78bfa;
  --gold-dim: rgba(167,139,250,0.1);
}

.lv-wrap *, .lv-wrap *::before, .lv-wrap *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.lv-wrap {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;
}

/* GRAIN */
.lv-grain {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
}

/* NAV */
.lv-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: 1px solid transparent;
  transition: all 0.3s;
  backdrop-filter: blur(0px);
}
.lv-nav.scrolled {
  background: rgba(8,8,15,0.92);
  border-color: var(--border);
  backdrop-filter: blur(20px);
}
.lv-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lv-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  opacity: 0.95;
  transition: opacity 0.2s;
}
.lv-logo:hover { opacity: 0.65; }
.lv-logo img { height: 22px; width: auto; object-fit: contain; }
.lv-nav-badge {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-bright);
  border: 1px solid rgba(124,92,252,0.4);
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(124,92,252,0.1);
}

/* HERO */
.lv-hero {
  min-height: auto;
  position: relative;
  overflow: hidden;
}
.lv-hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  min-height: 100vh;
}
.lv-hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 15% 50%, rgba(124,92,252,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 50% 70% at 85% 20%, rgba(167,139,250,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 60% 80%, rgba(93,63,211,0.06) 0%, transparent 50%);
}
.lv-hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}
.lv-hero-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 20px 0;
}
.lv-founder-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gold-dim);
  border: 1px solid rgba(232,201,106,0.25);
  color: var(--gold);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 36px;
  width: fit-content;
}
.lv-founder-tag::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--gold);
  border-radius: 50%;
  animation: lv-pulse-gold 2s infinite;
  flex-shrink: 0;
}
@keyframes lv-pulse-gold {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(167,139,250,0.6); }
  50% { opacity: 0.7; transform: scale(0.85); box-shadow: 0 0 0 4px rgba(167,139,250,0); }
}
.lv-h1 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(42px, 5vw, 68px);
  line-height: 1.05;
  font-weight: 400;
  margin-bottom: 28px;
  letter-spacing: -0.02em;
  color: var(--text);
}
.lv-h1 em {
  font-style: italic;
  color: var(--accent-bright);
  background: linear-gradient(135deg, #9d7fff, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lv-hero-sub {
  font-size: 17px;
  color: var(--muted);
  line-height: 1.7;
  max-width: 480px;
  margin-bottom: 48px;
}
.lv-pain-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 48px;
}
.lv-pain-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  color: #aaa;
}
.lv-pain-list li::before {
  content: '—';
  color: var(--muted);
  flex-shrink: 0;
  margin-top: 2px;
}
.lv-stats-row {
  display: flex;
  gap: 40px;
}
.lv-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lv-stat-num {
  font-family: 'Instrument Serif', serif;
  font-size: 28px;
  color: var(--text);
  line-height: 1;
}
.lv-stat-label {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.03em;
}

/* FORM SIDE */
.lv-hero-right {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 20px 0;
}
.lv-form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 44px;
  width: 100%;
  max-width: 440px;
  position: relative;
  overflow: hidden;
}
.lv-form-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #7c5cfc, #a78bfa, transparent);
}
.lv-form-header { margin-bottom: 32px; }
.lv-form-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 12px;
}
.lv-form-title {
  font-family: 'Instrument Serif', serif;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 400;
  margin-bottom: 8px;
  color: var(--text);
}
.lv-form-subtitle {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}

/* Founder counter */
.lv-founder-counter {
  background: var(--accent-dim);
  border: 1px solid rgba(124,92,252,0.3);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.lv-fc-left { display: flex; align-items: center; gap: 10px; }
.lv-fc-dot {
  width: 8px; height: 8px;
  background: var(--accent-bright);
  border-radius: 50%; flex-shrink: 0;
  animation: lv-pulse-green 2s infinite;
}
@keyframes lv-pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,92,252,0.6); }
  50% { box-shadow: 0 0 0 6px rgba(124,92,252,0); }
}
.lv-fc-text { font-size: 13px; color: var(--text); font-weight: 500; }
.lv-fc-count { color: var(--accent-bright); font-weight: 700; font-size: 15px; }
.lv-fc-badge { font-size: 11px; color: var(--muted); font-weight: 500; }

/* Form inputs */
.lv-form-group { margin-bottom: 18px; }
.lv-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.lv-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 13px 16px;
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  transition: all 0.2s;
  outline: none;
}
.lv-input::placeholder { color: rgba(255,255,255,0.2); }
.lv-input:focus {
  border-color: rgba(124,92,252,0.5);
  background: rgba(124,92,252,0.04);
  box-shadow: 0 0 0 3px rgba(124,92,252,0.1);
}
.lv-input-error { border-color: rgba(239,68,68,0.5) !important; }

.lv-error-msg {
  font-size: 12px;
  color: #f87171;
  margin-top: 5px;
}
.lv-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  margin-bottom: 16px;
}
.lv-alert-warn { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: #fbbf24; }
.lv-alert-err  { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.18); color: #f87171; }

.lv-btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #7c5cfc, #9d7fff);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 15px 24px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  transition: all 0.2s;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 20px rgba(124,92,252,0.3);
}
.lv-btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #8d6dfd, #b09eff);
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(124,92,252,0.45);
}
.lv-btn-submit:active:not(:disabled) { transform: translateY(0); }
.lv-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.lv-form-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 18px;
}
.lv-trust-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--muted);
}

/* Success state */
.lv-success {
  text-align: center;
  padding: 20px 0;
}
.lv-success-icon {
  width: 56px; height: 56px;
  background: var(--accent-dim);
  border: 1px solid rgba(124,92,252,0.4);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
  font-size: 24px;
  color: var(--accent-bright);
}
.lv-success h3 {
  font-family: 'Instrument Serif', serif;
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 10px;
  color: var(--text);
}
.lv-success p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
}

/* SECTIONS */
.lv-section {
  padding: 100px 60px;
  max-width: 1200px;
  margin: 0 auto;
}
.lv-section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 20px;
}
.lv-section h2 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.1;
  font-weight: 400;
  max-width: 700px;
  margin-bottom: 20px;
  color: var(--text);
}
.lv-section > p {
  font-size: 17px;
  color: var(--muted);
  max-width: 580px;
  line-height: 1.7;
  margin-bottom: 60px;
}

/* Benefits grid */
.lv-benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}
.lv-benefit-item {
  background: var(--surface);
  padding: 36px 32px;
  transition: background 0.2s;
}
.lv-benefit-item:hover { background: #151520; }
.lv-benefit-num {
  font-family: 'Instrument Serif', serif;
  font-size: 48px;
  color: rgba(124,92,252,0.22);
  line-height: 1;
  margin-bottom: 16px;
  font-weight: 400;
}
.lv-benefit-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text);
}
.lv-benefit-desc {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.65;
}

/* How it works */
.lv-how-section {
  padding: 80px 60px 100px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border);
}
.lv-how-section h2 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 400;
  line-height: 1.1;
  max-width: 600px;
  margin-bottom: 16px;
  color: var(--text);
}
.lv-how-section > p {
  font-size: 16px;
  color: var(--muted);
  max-width: 520px;
  line-height: 1.7;
}
.lv-steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  margin-top: 60px;
}
.lv-step { position: relative; }
.lv-step-num {
  font-family: 'Instrument Serif', serif;
  font-size: 64px;
  color: rgba(124,92,252,0.18);
  line-height: 1;
  margin-bottom: 20px;
  font-weight: 400;
}
.lv-step-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text);
}
.lv-step-desc {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.7;
}
.lv-step-connector {
  position: absolute;
  top: 32px;
  right: -24px;
  color: var(--border);
  font-size: 20px;
}

/* Honesty section */
.lv-honesty {
  margin: 0 auto 80px;
  max-width: 1080px;
  padding: 0 60px;
}
.lv-honesty-inner {
  background: rgba(124,92,252,0.07);
  border: 1px solid rgba(124,92,252,0.2);
  border-radius: 20px;
  padding: 52px 60px;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  align-items: center;
}
.lv-honesty-left {
  font-family: 'Instrument Serif', serif;
  font-size: 36px;
  line-height: 1.2;
  color: var(--gold);
  font-weight: 400;
}
.lv-honesty-right p {
  font-size: 16px;
  color: #ccc;
  line-height: 1.75;
  margin-bottom: 16px;
}
.lv-honesty-right p:last-child { margin-bottom: 0; }
.lv-honesty-right strong { color: var(--text); }

/* CTA section */
.lv-cta {
  text-align: center;
  padding: 100px 40px 120px;
  position: relative;
  overflow: hidden;
}
.lv-cta::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 600px; height: 300px;
  background: radial-gradient(ellipse, rgba(124,92,252,0.1) 0%, transparent 70%);
  pointer-events: none;
}
.lv-cta h2 {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 400;
  line-height: 1.1;
  margin-bottom: 20px;
  position: relative;
  color: var(--text);
}
.lv-cta > p {
  font-size: 16px;
  color: var(--muted);
  margin-bottom: 40px;
  position: relative;
}
.lv-btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #7c5cfc, #9d7fff);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 18px 36px;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  box-shadow: 0 4px 24px rgba(124,92,252,0.35);
}
.lv-btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(124,92,252,0.5);
}

/* Footer */
.lv-footer {
  border-top: 1px solid var(--border);
  padding: 30px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lv-footer p { font-size: 13px; color: var(--muted); }
.lv-footer-links {
  display: flex;
  gap: 20px;
}
.lv-footer-links a {
  font-size: 13px;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.2s;
}
.lv-footer-links a:hover { color: var(--text); }

/* Fade in */
.lv-fade {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.lv-fade.visible {
  opacity: 1;
  transform: translateY(0);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .lv-hero-inner { grid-template-columns: 1fr; min-height: auto; padding: 80px 24px 40px; gap: 32px; }
  .lv-hero-left { padding: 20px 0 0; }
  .lv-hero-right { padding: 0 0 40px; }
  .lv-form-card { max-width: 100%; }
  .lv-nav-inner { padding: 16px 24px; }
  .lv-section { padding: 60px 24px; }
  .lv-how-section { padding: 60px 24px 80px; }
  .lv-benefits-grid { grid-template-columns: 1fr; }
  .lv-steps-grid { grid-template-columns: 1fr; }
  .lv-step-connector { display: none; }
  .lv-honesty { padding: 0 24px; }
  .lv-honesty-inner { grid-template-columns: 1fr; padding: 36px 28px; gap: 24px; }
  .lv-honesty-left { font-size: 26px; }
  .lv-footer { padding: 24px; flex-direction: column; gap: 10px; text-align: center; }
  .lv-stats-row { gap: 24px; flex-wrap: wrap; }
  .lv-form-card { padding: 28px 24px; }
}
`;

/* ═══════════════════════════════════════════════════════════
   Founder counter (fetch real)
═══════════════════════════════════════════════════════════ */
function useFounderCount() {
  const [count, setCount] = useState<number | null>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    api.get("/early-access/count")
      .then((res) => {
        const n = typeof res.data === "number" ? res.data : Number(res.data ?? 0);
        setCount(n);
      })
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    if (count === null) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(count / 60));
    const id = setInterval(() => {
      cur = Math.min(cur + step, count);
      setDisplayed(cur);
      if (cur >= count) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [count]);

  return { count, displayed };
}

/* ═══════════════════════════════════════════════════════════
   Form
═══════════════════════════════════════════════════════════ */
type Status = "idle" | "loading" | "success" | "duplicate" | "error";

function FounderForm({ onSuccess }: { onSuccess?: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  function validate() {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = "Nome obrigatório";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "E-mail inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      await api.post("/early-access", { fullName: fullName.trim(), email: email.trim(), whatsapp, source: "facebook_group" });
      setStatus("success");
      onSuccess?.();
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? "";
      setStatus(msg.toLowerCase().includes("já") ? "duplicate" : "error");
    }
  }

  if (status === "success") {
    return (
      <div className="lv-success">
        <div className="lv-success-icon">✓</div>
        <h3>Você está dentro.</h3>
        <p>Bem-vindo aos fundadores do ImobMatch.<br />Em breve você receberá o acesso por e-mail.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="lv-form-group">
        <label className="lv-label">Nome completo *</label>
        <input
          className={`lv-input${errors.fullName ? " lv-input-error" : ""}`}
          type="text"
          placeholder="João Silva"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
        {errors.fullName && <p className="lv-error-msg">{errors.fullName}</p>}
      </div>

      <div className="lv-form-group">
        <label className="lv-label">E-mail *</label>
        <input
          className={`lv-input${errors.email ? " lv-input-error" : ""}`}
          type="email"
          placeholder="joao@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {errors.email && <p className="lv-error-msg">{errors.email}</p>}
      </div>

      <div className="lv-form-group">
        <label className="lv-label">
          WhatsApp <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(opcional)</span>
        </label>
        <input
          className="lv-input"
          type="tel"
          placeholder="(11) 99999-9999"
          value={whatsapp}
          onChange={e => setWhatsapp(maskPhone(e.target.value))}
        />
      </div>

      {status === "duplicate" && (
        <div className="lv-alert lv-alert-warn">
          ⚠ Este e-mail já está na lista. Aguarde o contato.
        </div>
      )}
      {status === "error" && (
        <div className="lv-alert lv-alert-err">
          ✕ Algo deu errado. Tente novamente.
        </div>
      )}

      <button className="lv-btn-submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Enviando..." : "Quero ser membro fundador →"}
      </button>

      <div className="lv-form-trust">
        <span className="lv-trust-item">🔒 100% gratuito</span>
        <span className="lv-trust-item">✦ Dados protegidos</span>
        <span className="lv-trust-item">✉ Sem spam</span>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function ListaVipPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const { count, displayed } = useFounderCount();

  /* Nav scroll effect */
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Fade-in on scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".lv-fade").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollToForm() {
    heroRightRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <style>{PAGE_CSS}</style>

      <div className="lv-wrap">
        {/* Grain overlay */}
        <div className="lv-grain" />

        {/* ── NAV ───────────────────────────────────────────── */}
        <nav className={`lv-nav${navScrolled ? " scrolled" : ""}`}>
          <div className="lv-nav-inner">
            <Link href="/" className="lv-logo">
              <img src="/logo_texto_branco.png" alt="ImobMatch" />
            </Link>
            <span className="lv-nav-badge">Membros Fundadores</span>
          </div>
        </nav>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="lv-hero">
          <div className="lv-hero-bg" />
          <div className="lv-hero-inner">
          {/* Coluna esquerda */}
          <div className="lv-hero-left">
            <div className="lv-founder-tag">✦ Grupo Negócios Imobiliários · Acesso Fundador</div>

            <h1 className="lv-h1">
              Seja um dos<br />
              primeiros a<br />
              <em>moldar a rede.</em>
            </h1>

            <p className="lv-hero-sub">
              O ImobMatch ainda está nos primeiros dias. Estamos convidando corretores do grupo para ser membros fundadores — com vantagens que nunca mais voltarão.
            </p>

            <ul className="lv-pain-list">
              <li>Tem cliente mas não acha o imóvel certo?</li>
              <li>Tem imóvel mas não encontra o comprador ideal?</li>
              <li>Difícil fechar parcerias confiáveis com outros corretores?</li>
            </ul>

            <div className="lv-stats-row">
              <div className="lv-stat-item">
                <span className="lv-stat-num">Grátis</span>
                <span className="lv-stat-label">Sem cartão de crédito</span>
              </div>
              <div className="lv-stat-item">
                <span className="lv-stat-num">62,5k</span>
                <span className="lv-stat-label">Corretores no grupo</span>
              </div>
              <div className="lv-stat-item">
                <span className="lv-stat-num">100%</span>
                <span className="lv-stat-label">Focado em corretores</span>
              </div>
            </div>
          </div>

          {/* Coluna direita — formulário */}
          <div className="lv-hero-right" ref={heroRightRef}>
            <div className="lv-form-card">
              <div className="lv-form-header">
                <p className="lv-form-eyebrow">✦ Vaga de Fundador</p>
                <h2 className="lv-form-title">Quero ser membro fundador</h2>
                <p className="lv-form-subtitle">
                  Estamos nos primeiros dias. Quem entra agora ajuda a construir — e ganha vantagens permanentes.
                </p>
              </div>

              {/* Contador real */}
              <div className="lv-founder-counter">
                <div className="lv-fc-left">
                  <div className="lv-fc-dot" />
                  <span className="lv-fc-text">
                    Fundadores confirmados:{" "}
                    <span className="lv-fc-count">
                      {count === null
                        ? <span style={{ display: "inline-block", width: 28, height: 14, borderRadius: 4, background: "rgba(124,92,252,0.2)", verticalAlign: "middle" }} />
                        : displayed.toLocaleString("pt-BR")
                      }
                    </span>
                  </span>
                </div>
                <span className="lv-fc-badge">Atualizado agora</span>
              </div>

              <FounderForm />
            </div>
          </div>
          </div>{/* fim lv-hero-inner */}
        </section>

        {/* ── BENEFÍCIOS ────────────────────────────────────── */}
        <section className="lv-section lv-fade">
          <p className="lv-section-label">Por que entrar agora</p>
          <h2>O que significa ser um membro fundador</h2>
          <p>Entrar agora não é apenas ter acesso antecipado. É fazer parte da construção de algo que o mercado imobiliário brasileiro ainda não tem.</p>

          <div className="lv-benefits-grid">
            {[
              { n: "01", title: "Acesso permanentemente gratuito", desc: "Fundadores nunca pagam pelo plano básico, independente de quando o ImobMatch lançar planos pagos. Isso é para sempre." },
              { n: "02", title: "Perfil com selo Fundador", desc: "Seu perfil dentro da rede vai ter o selo de membro fundador — um diferencial de credibilidade para outros corretores da plataforma." },
              { n: "03", title: "Voz no desenvolvimento", desc: "Fundadores têm canal direto para sugerir funcionalidades. As próximas features serão moldadas por quem está desde o começo." },
              { n: "04", title: "Primeiros matches da rede", desc: "Conforme a rede cresce, os fundadores são os primeiros a receber cruzamentos — seus imóveis e compradores no topo da fila." },
              { n: "05", title: "Prioridade no suporte", desc: "Acesso direto ao fundador da plataforma para dúvidas e suporte. Sem fila, sem chatbot." },
              { n: "06", title: "Vagas limitadas", desc: "O status de fundador é exclusivo para os primeiros membros. Quando encerrarmos esta fase, a entrada passa a ser como usuário comum." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="lv-benefit-item">
                <div className="lv-benefit-num">{n}</div>
                <div className="lv-benefit-title">{title}</div>
                <div className="lv-benefit-desc">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMO FUNCIONA ─────────────────────────────────── */}
        <section className="lv-how-section lv-fade">
          <p className="lv-section-label">Como funciona</p>
          <h2>Do cadastro ao primeiro negócio</h2>
          <p>Simples por design. Sem curva de aprendizado.</p>

          <div className="lv-steps-grid">
            <div className="lv-step">
              <div className="lv-step-num">01</div>
              <div className="lv-step-title">Garanta sua vaga de fundador</div>
              <div className="lv-step-desc">Preencha o formulário acima. Você entra na fila prioritária e recebe o acesso assim que abrimos sua região.</div>
              <div className="lv-step-connector">→</div>
            </div>
            <div className="lv-step">
              <div className="lv-step-num">02</div>
              <div className="lv-step-title">Configure seu perfil</div>
              <div className="lv-step-desc">Cadastre seus imóveis e compradores. A plataforma organiza tudo — região, tipo, faixa de preço, perfil do comprador.</div>
              <div className="lv-step-connector">→</div>
            </div>
            <div className="lv-step">
              <div className="lv-step-num">03</div>
              <div className="lv-step-title">Receba os matches</div>
              <div className="lv-step-desc">O sistema cruza seus dados com os de outros corretores da rede. Quando houver compatibilidade, você recebe a oportunidade.</div>
            </div>
          </div>
        </section>

        {/* ── HONESTIDADE ───────────────────────────────────── */}
        <div className="lv-honesty lv-fade">
          <div className="lv-honesty-inner">
            <div className="lv-honesty-left">
              Uma palavra honesta sobre o momento atual.
            </div>
            <div className="lv-honesty-right">
              <p>O ImobMatch foi lançado há poucos dias. A rede ainda é pequena — e isso é exatamente o ponto. <strong>Um sistema de match só gera valor quando tem massa crítica.</strong></p>
              <p>Estamos construindo essa massa agora, começando pelo maior grupo de corretores do Brasil. Cada fundador que entra aumenta o valor para todos os outros.</p>
              <p>Se você quer estar presente quando a rede atingir escala — e garantir que seu perfil esteja posicionado desde o início — <strong>o momento é agora.</strong></p>
            </div>
          </div>
        </div>

        {/* ── CTA FINAL ─────────────────────────────────────── */}
        <section className="lv-cta lv-fade">
          <h2>Sua concorrência ainda<br />não sabe que isso existe.</h2>
          <p>Enquanto você lê isso, a janela de fundador ainda está aberta. Não por muito tempo.</p>
          <button className="lv-btn-cta" onClick={scrollToForm}>
            Garantir minha vaga de fundador →
          </button>
        </section>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer className="lv-footer">
          <Link href="/" className="lv-logo">
            <img src="/logo_texto_branco.png" alt="ImobMatch" />
          </Link>
          <p>© {new Date().getFullYear()} ImobMatch · Todos os direitos reservados · Seus dados são protegidos</p>
          <div className="lv-footer-links">
            <Link href="/imoveis">Ver imóveis</Link>
            <Link href="/login">Entrar</Link>
          </div>
        </footer>
      </div>
    </>
  );
}