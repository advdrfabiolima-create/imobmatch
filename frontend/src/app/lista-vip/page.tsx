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
  top: 0; left: 0; right: 0;
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
  padding: 18px 48px;
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
.lv-logo img { height: 20px; width: auto; object-fit: contain; }
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
  position: relative;
  overflow: hidden;
}
.lv-hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 48px 60px;
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
  padding: 100px 60px 60px 32px;
  position: relative;
  z-index: 1;
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
.lv-success-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-dim);
  border: 1px solid rgba(124,92,252,0.35);
  border-radius: 12px;
  padding: 10px 24px;
  margin: 14px auto 20px;
  font-family: 'Instrument Serif', serif;
  font-size: 34px;
  color: var(--accent-bright);
  letter-spacing: -0.01em;
}
.lv-share-box {
  margin-top: 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  text-align: left;
}
.lv-share-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 10px;
}
.lv-share-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.lv-share-url {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'DM Sans', sans-serif;
}
.lv-share-btn {
  background: var(--accent-dim);
  border: 1px solid rgba(124,92,252,0.3);
  color: var(--accent-bright);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  font-family: 'DM Sans', sans-serif;
}
.lv-share-btn:hover { background: rgba(124,92,252,0.22); }
.lv-share-hint {
  font-size: 11px;
  color: var(--muted);
  margin-top: 8px;
  line-height: 1.5;
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
  position: relative;
}
.lv-honesty::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 700px; height: 400px;
  background: radial-gradient(ellipse, rgba(124,92,252,0.1) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.lv-honesty-inner {
  position: relative;
  z-index: 1;
}
.lv-honesty-inner {
  background: rgba(124,92,252,0.07);
  border: 1px solid rgba(124,92,252,0.2);
  border-radius: 20px;
  padding: 52px 60px;
  box-shadow: 0 0 40px rgba(124,92,252,0.12);
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
  padding: 24px 48px;
  text-align: center;
}
.lv-footer p { font-size: 13px; color: var(--muted); }

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
  .lv-hero-inner { grid-template-columns: 1fr; min-height: auto; padding: 80px 16px 40px; gap: 32px; }
  .lv-hero-right { padding: 0 0 24px; width: 100%; }
  .lv-form-card { max-width: 100%; padding: 28px 20px; }
  .lv-nav-inner { padding: 16px 16px; }
  .lv-section { padding: 60px 16px; }
  .lv-how-section { padding: 60px 16px 80px; }
  .lv-benefits-grid { grid-template-columns: 1fr; }
  .lv-steps-grid { grid-template-columns: 1fr; }
  .lv-step-connector { display: none; }
  .lv-honesty { padding: 0 16px; }
  .lv-honesty-inner { grid-template-columns: 1fr; padding: 28px 20px; gap: 24px; }
  .lv-honesty-left { font-size: 26px; }
  .lv-footer { padding: 24px 16px; flex-direction: column; gap: 10px; text-align: center; }
  .lv-stats-row { gap: 24px; flex-wrap: wrap; }
  .lv-form-trust { gap: 12px; flex-wrap: wrap; justify-content: center; }
}

@media (max-width: 480px) {
  .lv-hero-inner { padding: 72px 12px 32px; }
  .lv-form-card { padding: 24px 16px; border-radius: 14px; }
  .lv-nav-inner { padding: 14px 12px; }
  .lv-section { padding: 48px 12px; }
  .lv-how-section { padding: 48px 12px 64px; }
  .lv-honesty { padding: 0 12px; }
  .lv-honesty-inner { padding: 24px 16px; }
  .lv-founder-counter { flex-direction: column; align-items: flex-start; gap: 8px; }
  .lv-form-trust { flex-direction: column; align-items: center; gap: 8px; }
}

/* BARRA DE PROGRESSO */
.lv-progress-wrap {
  background: var(--accent-dim);
  border: 1px solid rgba(124,92,252,0.3);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 28px;
}
.lv-progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.lv-progress-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}
.lv-progress-dot {
  width: 8px; height: 8px;
  background: var(--accent-bright);
  border-radius: 50%; flex-shrink: 0;
  animation: lv-pulse-green 2s infinite;
}
.lv-progress-count {
  font-size: 12px;
  color: var(--accent-bright);
  font-weight: 700;
}
.lv-progress-bar-bg {
  height: 6px;
  background: rgba(124,92,252,0.15);
  border-radius: 99px;
  overflow: hidden;
}
.lv-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c5cfc, #a78bfa);
  border-radius: 99px;
  transition: width 1s ease;
}
.lv-progress-warn {
  margin-top: 8px;
  font-size: 11px;
  color: #fbbf24;
  font-weight: 500;
}

/* MOCKUP DE PRODUTO */
.lv-mockup-section {
  padding: 80px 60px 100px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border);
  position: relative;
}
.lv-mockup-section::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 800px; height: 500px;
  background: radial-gradient(ellipse, rgba(124,92,252,0.09) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.lv-mockup-section > * {
  position: relative;
  z-index: 1;
}
.lv-mockup-wrap {
  margin-top: 48px;
  border: 1px solid rgba(124,92,252,0.2);
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
  box-shadow: 0 0 48px rgba(124,92,252,0.14);
}
.lv-mockup-bar {
  background: rgba(255,255,255,0.025);
  border-bottom: 1px solid var(--border);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.lv-mock-dot-r { width: 10px; height: 10px; border-radius: 50%; background: rgba(239,68,68,0.4); }
.lv-mock-dot-y { width: 10px; height: 10px; border-radius: 50%; background: rgba(251,191,36,0.4); }
.lv-mock-dot-g { width: 10px; height: 10px; border-radius: 50%; background: rgba(52,211,153,0.4); }
.lv-mockup-body {
  padding: 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.lv-mock-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}
.lv-mock-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.lv-mock-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid rgba(124,92,252,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.lv-mock-name { font-size: 13px; font-weight: 600; color: var(--text); }
.lv-mock-loc  { font-size: 11px; color: var(--muted); }
.lv-mock-tag {
  display: inline-block;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 20px; margin-bottom: 12px;
}
.lv-mock-tag-im { background: rgba(124,92,252,0.15); color: var(--accent-bright); border: 1px solid rgba(124,92,252,0.2); }
.lv-mock-tag-co { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
.lv-mock-detail { font-size: 12px; color: var(--muted); line-height: 1.65; }
.lv-mock-match-row {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(124,92,252,0.08), rgba(167,139,250,0.04));
  border: 1px solid rgba(124,92,252,0.3);
  border-radius: 12px;
  padding: 22px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.lv-mock-match-icon {
  width: 44px; height: 44px; flex-shrink: 0;
  background: var(--accent-dim);
  border: 1px solid rgba(124,92,252,0.3);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}
.lv-mock-match-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.lv-mock-match-desc { font-size: 13px; color: var(--muted); }
.lv-mock-match-score {
  margin-left: auto; flex-shrink: 0;
  text-align: center;
}
.lv-mock-match-pct {
  font-family: 'Instrument Serif', serif;
  font-size: 28px; color: var(--accent-bright); line-height: 1;
}
.lv-mock-match-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; }

/* FAQ */
.lv-faq-section {
  padding: 80px 60px 100px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border);
}
.lv-faq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  margin-top: 48px;
}
.lv-faq-item {
  background: var(--surface);
  padding: 28px 32px;
}
.lv-faq-q { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
.lv-faq-a { font-size: 14px; color: var(--muted); line-height: 1.65; }

/* STICKY CTA MOBILE */
.lv-sticky-cta {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  padding: 12px 16px 20px;
  background: rgba(8,8,15,0.96);
  border-top: 1px solid var(--border);
  backdrop-filter: blur(20px);
  z-index: 200;
}
.lv-sticky-btn {
  width: 100%;
  background: linear-gradient(135deg, #7c5cfc, #9d7fff);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 15px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px; font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(124,92,252,0.4);
  transition: transform 0.15s;
}
.lv-sticky-btn:active { transform: scale(0.98); }

@media (max-width: 900px) {
  .lv-sticky-cta { display: block; }
  .lv-faq-grid { grid-template-columns: 1fr; }
  .lv-mockup-section { padding: 48px 16px 60px; }
  .lv-faq-section { padding: 48px 16px 60px; }
  .lv-mockup-body { grid-template-columns: 1fr; }
  .lv-mock-match-row { grid-column: 1; flex-wrap: wrap; }
  .lv-mock-match-score { margin-left: 0; }
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
  const [position, setPosition] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

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
      const res = await api.post("/early-access", { fullName: fullName.trim(), email: email.trim(), whatsapp, source: "facebook_group" });
      setPosition(res.data?.position ?? null);
      setStatus("success");
      onSuccess?.();
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? "";
      setStatus(msg.toLowerCase().includes("já") ? "duplicate" : "error");
    }
  }

  const SHARE_URL = "https://www.useimobmatch.com.br/lista-vip";

  function handleCopy() {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (status === "success") {
    return (
      <div className="lv-success">
        <div className="lv-success-icon">✓</div>
        <h3>Você está dentro.</h3>
        {position !== null && (
          <div className="lv-success-num">Fundador #{position}</div>
        )}
        <p>Bem-vindo aos fundadores do ImobMatch.<br />Você receberá o acesso por e-mail em breve.</p>

        <div className="lv-share-box">
          <p className="lv-share-label">Chamar um colega corretor</p>
          <div className="lv-share-row">
            <span className="lv-share-url">{SHARE_URL}</span>
            <button className="lv-share-btn" type="button" onClick={handleCopy}>
              {copied ? "Copiado ✓" : "Copiar link"}
            </button>
          </div>
          <p className="lv-share-hint">Cada colega que entrar aumenta o valor da rede para todos.</p>
        </div>
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
          WhatsApp <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>— te aviso na hora que seu acesso abrir</span>
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
        {status === "loading" ? "Enviando..." : "Garantir minha vaga gratuita →"}
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
              O comprador certo<br />
              para seu imóvel<br />
              <em>já existe.</em>
            </h1>

            <p className="lv-hero-sub">
              Ele está com outro corretor. O ImobMatch conecta você a quem tem o que seu cliente procura — e vice-versa. Quem entra agora vira fundador, com vantagens permanentes que nunca mais voltarão.
            </p>

            <ul className="lv-pain-list">
              <li>Você perde comissão toda semana por não conhecer o corretor certo no bairro certo.</li>
              <li>Seu comprador sai frustrado porque seu portfólio não tem o imóvel que ele quer.</li>
              <li>Parceria informal quebra no meio. Sem registro, sem compromisso, sem garantia.</li>
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

              {/* Barra de progresso de vagas */}
              <div className="lv-progress-wrap">
                <div className="lv-progress-header">
                  <div className="lv-progress-label">
                    <div className="lv-progress-dot" />
                    <span>Vagas de fundador preenchidas</span>
                  </div>
                  <span className="lv-progress-count">
                    {count === null ? "..." : `${Math.min(displayed, 100)}/100`}
                  </span>
                </div>
                <div className="lv-progress-bar-bg">
                  <div
                    className="lv-progress-bar-fill"
                    style={{ width: count === null ? "0%" : `${Math.min((displayed / 100) * 100, 100)}%` }}
                  />
                </div>
                {count !== null && displayed >= 80 && (
                  <p className="lv-progress-warn">⚡ Últimas vagas disponíveis</p>
                )}
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

        {/* ── MOCKUP DO PRODUTO ─────────────────────────────── */}
        <section className="lv-mockup-section lv-fade">
          <p className="lv-section-label">Como funciona na prática</p>
          <h2>Veja um match acontecendo</h2>
          <p>Quando dois corretores têm perfis compatíveis — um com imóvel, outro com comprador — o sistema identifica e conecta os dois automaticamente.</p>

          <div className="lv-mockup-wrap">
            <div className="lv-mockup-bar">
              <div className="lv-mock-dot-r" />
              <div className="lv-mock-dot-y" />
              <div className="lv-mock-dot-g" />
            </div>
            <div className="lv-mockup-body">
              {/* Card corretor A */}
              <div className="lv-mock-card">
                <div className="lv-mock-card-header">
                  <div className="lv-mock-avatar">🏠</div>
                  <div>
                    <div className="lv-mock-name">Carlos M.</div>
                    <div className="lv-mock-loc">Corretor · São Paulo, SP</div>
                  </div>
                </div>
                <div className="lv-mock-tag lv-mock-tag-im">Imóvel disponível</div>
                <div className="lv-mock-detail">
                  Apartamento 3 quartos · Pinheiros<br />
                  R$ 850.000 · 92 m² · 2 vagas<br />
                  Alto padrão, pronto para morar
                </div>
              </div>

              {/* Card corretor B */}
              <div className="lv-mock-card">
                <div className="lv-mock-card-header">
                  <div className="lv-mock-avatar">👤</div>
                  <div>
                    <div className="lv-mock-name">Fernanda L.</div>
                    <div className="lv-mock-loc">Corretora · São Paulo, SP</div>
                  </div>
                </div>
                <div className="lv-mock-tag lv-mock-tag-co">Comprador qualificado</div>
                <div className="lv-mock-detail">
                  Casal, 3 quartos · Pinheiros ou Itaim<br />
                  Até R$ 900.000 · Mín. 80 m²<br />
                  Financiamento aprovado
                </div>
              </div>

              {/* Match card */}
              <div className="lv-mock-match-row">
                <div className="lv-mock-match-icon">✦</div>
                <div>
                  <div className="lv-mock-match-title">Match encontrado pelo ImobMatch</div>
                  <div className="lv-mock-match-desc">Carlos e Fernanda foram conectados. O imóvel de Carlos atende 100% do perfil do comprador de Fernanda.</div>
                </div>
                <div className="lv-mock-match-score">
                  <div className="lv-mock-match-pct">98%</div>
                  <div className="lv-mock-match-lbl">compatibilidade</div>
                </div>
              </div>
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

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section className="lv-faq-section lv-fade">
          <p className="lv-section-label">Dúvidas frequentes</p>
          <h2>Perguntas que todo corretor faz antes de entrar</h2>

          <div className="lv-faq-grid">
            <div className="lv-faq-item">
              <div className="lv-faq-q">Isso é realmente grátis?</div>
              <div className="lv-faq-a">Sim. Fundadores têm acesso permanentemente gratuito ao plano básico do ImobMatch — sem cartão de crédito, sem cobrança futura. Independente de quando lançarmos planos pagos, o status de fundador é para sempre.</div>
            </div>
            <div className="lv-faq-item">
              <div className="lv-faq-q">Quando vou receber o acesso?</div>
              <div className="lv-faq-a">Estamos liberando por ordem de cadastro, região por região. Você recebe o link de acesso por e-mail assim que sua fila for chamada. Por isso entrar agora faz diferença — sua posição na fila é definida hoje.</div>
            </div>
            <div className="lv-faq-item">
              <div className="lv-faq-q">Funciona na minha cidade?</div>
              <div className="lv-faq-a">O ImobMatch cobre o Brasil inteiro. Quanto mais corretores da sua região se cadastrarem, mais rápido a rede local atinge escala e você começa a receber matches com qualidade.</div>
            </div>
            <div className="lv-faq-item">
              <div className="lv-faq-q">Qual a diferença de um grupo de WhatsApp?</div>
              <div className="lv-faq-a">No WhatsApp você anuncia para todos e espera alguém responder. No ImobMatch o sistema cruza automaticamente o seu comprador com o imóvel certo de outro corretor — sem ruído, sem spam, sem perder tempo.</div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ─────────────────────────────────────── */}
        <section className="lv-cta lv-fade">
          <h2>Sua concorrência ainda<br />não sabe que isso existe.</h2>
          <p>Enquanto você lê isso, a janela de fundador ainda está aberta. Não por muito tempo.</p>
          <button className="lv-btn-cta" onClick={scrollToForm}>
            Garantir minha vaga de fundador →
          </button>
        </section>

        {/* ── STICKY CTA MOBILE ─────────────────────────────── */}
        <div className="lv-sticky-cta">
          <button className="lv-sticky-btn" onClick={scrollToForm}>
            Garantir minha vaga gratuita →
          </button>
        </div>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer className="lv-footer">
          <p>© {new Date().getFullYear()} ImobMatch · Todos os direitos reservados · Seus dados são protegidos</p>
        </footer>
      </div>
    </>
  );
}