"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, ShieldX, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short",
  });
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE:      "Casa",
  APARTMENT:  "Apartamento",
  LAND:       "Terreno",
  COMMERCIAL: "Comercial",
  RURAL:      "Rural",
};

// ─── Info block reutilizável ──────────────────────────────────────────────────

function InfoBlock({
  label,
  accent,
  children,
}: {
  label: string;
  accent: { bg: string; border: string; text: string };
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4 space-y-1 border"
      style={{ background: accent.bg, borderColor: accent.border }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: accent.text }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

export default function VerificarTermoPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-partnership", id],
    queryFn: () => api.get(`/partnerships/${id}/verify`).then((r) => r.data),
    retry: false,
    staleTime: Infinity,
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-4"
      style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{ background: "rgba(124,58,237,0.07)", filter: "blur(140px)" }}
      />

      <div className="relative z-10 w-full max-w-2xl space-y-4">

        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-4 transition-opacity hover:opacity-70">
            <Image
              src="/logo_texto_branco.png"
              alt="ImobMatch"
              width={160}
              height={48}
              className="h-5 w-auto object-contain mx-auto"
            />
          </Link>
          <h1 className="text-xl font-bold text-white">Verificação de Autenticidade</h1>
          <p className="text-sm text-white/40 mt-1">
            Confirme se o Termo de Parceria é legítimo e não foi adulterado.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            className="rounded-2xl border p-10 flex flex-col items-center gap-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <p className="text-white/40 text-sm">Verificando documento...</p>
          </div>
        )}

        {/* Error / not found */}
        {(isError || (!isLoading && !data)) && (
          <div
            className="rounded-2xl border p-10 flex flex-col items-center gap-3 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            <ShieldX className="h-12 w-12 text-red-400" />
            <p className="font-semibold text-white">Documento não encontrado</p>
            <p className="text-sm text-white/40">
              O ID informado não corresponde a nenhuma parceria na plataforma.
            </p>
          </div>
        )}

        {/* Result */}
        {data && (
          <>
            {/* Status banner */}
            {data.valid ? (
              <div
                className="rounded-2xl border p-6 flex items-start gap-4"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  borderColor: "rgba(16,185,129,0.25)",
                  boxShadow: "0 0 30px rgba(16,185,129,0.08)",
                }}
              >
                <ShieldCheck className="h-10 w-10 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-lg font-bold text-emerald-400">Documento Autêntico</p>
                  <p className="text-sm text-white/50 mt-1">
                    O hash SHA-256 foi recalculado e corresponde exatamente ao registrado no momento
                    da aceitação. Este documento não foi adulterado.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl border p-6 flex items-start gap-4"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  borderColor: "rgba(239,68,68,0.25)",
                  boxShadow: "0 0 30px rgba(239,68,68,0.08)",
                }}
              >
                <ShieldX className="h-10 w-10 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-lg font-bold text-red-400">Documento Inválido</p>
                  <p className="text-sm text-white/50 mt-1">{data.reason}</p>
                </div>
              </div>
            )}

            {/* Details */}
            {data.valid && (
              <div
                className="rounded-2xl border p-6 space-y-5 text-sm"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.08)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              >
                {/* Parties */}
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoBlock
                    label="Corretor Solicitante"
                    accent={{
                      bg: "rgba(37,99,235,0.08)",
                      border: "rgba(37,99,235,0.20)",
                      text: "#60a5fa",
                    }}
                  >
                    <p className="text-white/70">
                      <span className="text-white/35">Nome: </span>
                      <strong className="text-white/80">{data.requester.name}</strong>
                    </p>
                    {data.requester.creci && (
                      <p className="text-white/70">
                        <span className="text-white/35">CRECI: </span>{data.requester.creci}
                      </p>
                    )}
                    {data.requester.agency && (
                      <p className="text-white/70">
                        <span className="text-white/35">Imobiliária: </span>{data.requester.agency}
                      </p>
                    )}
                  </InfoBlock>

                  <InfoBlock
                    label="Corretor Receptor"
                    accent={{
                      bg: "rgba(16,185,129,0.08)",
                      border: "rgba(16,185,129,0.20)",
                      text: "#34d399",
                    }}
                  >
                    <p className="text-white/70">
                      <span className="text-white/35">Nome: </span>
                      <strong className="text-white/80">{data.receiver.name}</strong>
                    </p>
                    {data.receiver.creci && (
                      <p className="text-white/70">
                        <span className="text-white/35">CRECI: </span>{data.receiver.creci}
                      </p>
                    )}
                    {data.receiver.agency && (
                      <p className="text-white/70">
                        <span className="text-white/35">Imobiliária: </span>{data.receiver.agency}
                      </p>
                    )}
                  </InfoBlock>
                </div>

                {/* Property */}
                <InfoBlock
                  label="Imóvel"
                  accent={{
                    bg: "rgba(255,255,255,0.03)",
                    border: "rgba(255,255,255,0.08)",
                    text: "rgba(255,255,255,0.35)",
                  }}
                >
                  <p className="text-white/70">
                    <span className="text-white/35">Título: </span>
                    <strong className="text-white/80">{data.property.title}</strong>
                  </p>
                  <p className="text-white/70">
                    <span className="text-white/35">Tipo: </span>
                    {PROPERTY_TYPE_LABELS[data.property.type] ?? data.property.type}
                  </p>
                  {data.property.city && (
                    <p className="text-white/70">
                      <span className="text-white/35">Cidade: </span>{data.property.city}
                    </p>
                  )}
                </InfoBlock>

                {/* Commission + date */}
                <InfoBlock
                  label="Acordo"
                  accent={{
                    bg: "rgba(245,158,11,0.08)",
                    border: "rgba(245,158,11,0.20)",
                    text: "#fbbf24",
                  }}
                >
                  <p className="text-white/70">
                    <span className="text-white/35">Comissão acordada: </span>
                    {data.commissionSplit
                      ? <strong className="text-white/80">{data.commissionSplit}% / {100 - data.commissionSplit}%</strong>
                      : <span className="text-white/30">A definir entre as partes</span>
                    }
                  </p>
                  <p className="text-white/70">
                    <span className="text-white/35">Data de aceitação: </span>
                    <strong className="text-white/80">{formatDate(data.acceptedAt)}</strong>
                  </p>
                </InfoBlock>

                {/* Hash */}
                <InfoBlock
                  label="Hash SHA-256 Registrado"
                  accent={{
                    bg: "rgba(255,255,255,0.03)",
                    border: "rgba(255,255,255,0.08)",
                    text: "rgba(255,255,255,0.35)",
                  }}
                >
                  <code
                    className="block break-all text-[11px] font-mono rounded p-2 border"
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {data.hash}
                  </code>
                  <p className="text-xs text-white/25 mt-1">
                    ID da parceria: <code className="text-white/40">{data.partnershipId}</code>
                  </p>
                </InfoBlock>

                {/* Link to document */}
                <div className="pt-1 text-center">
                  <Link
                    href={`/termo/${id}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver documento completo
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-center text-xs text-white/20 pt-2">
          useimobmatch.com.br — Verificação pública de autenticidade de termos de parceria
        </p>
      </div>
    </div>
  );
}
