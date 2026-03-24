"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 40%, #0a0a0f 100%)",
      }}
    >
      {/* Glow de fundo */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 700,
          height: 700,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, rgba(37,99,235,0.10) 45%, transparent 75%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 400,
          height: 400,
          top: "30%",
          left: "60%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(96,165,250,0.10) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

        {/* Logo */}
        <Image
          src="/logo_texto_branco.png"
          alt="ImobMatch"
          width={200}
          height={60}
          className="mb-10 opacity-95"
          priority
        />

        {/* Badge */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
          style={{
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.35)",
            color: "#a78bfa",
          }}
        >
          <Zap size={12} />
          Em breve
        </div>

        {/* Título */}
        <h1
          className="text-4xl md:text-6xl font-black leading-tight mb-6"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #93c5fd 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Estamos construindo algo incrível
        </h1>

        {/* Subtítulo */}
        <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-10">
          Esta página está sendo preparada com muito cuidado para fazer o maior sucesso.
          Enquanto isso, acesse nossa lista exclusiva e garanta seu lugar.
        </p>

        {/* CTA */}
        <Link
          href="/lista-vip"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-105 hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
            boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
          }}
        >
          <Zap size={18} />
          Entrar na Lista VIP
        </Link>

        {/* Rodapé */}
        <p className="mt-16 text-white/20 text-xs">
          © {new Date().getFullYear()} ImobMatch · Todos os direitos reservados
        </p>
      </div>
    </main>
  );
}
