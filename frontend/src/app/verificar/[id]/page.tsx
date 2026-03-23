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

export default function VerificarTermoPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-partnership", id],
    queryFn: () => api.get(`/partnerships/${id}/verify`).then((r) => r.data),
    retry: false,
    staleTime: Infinity,
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl space-y-4">

        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logo_texto_preto.png"
              alt="ImobMatch"
              width={160}
              height={48}
              className="h-11 w-auto object-contain mx-auto"
            />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Verificação de Autenticidade</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirme se o Termo de Parceria é legítimo e não foi adulterado.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p>Verificando documento...</p>
          </div>
        )}

        {/* Error / not found */}
        {(isError || (!isLoading && !data)) && (
          <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center gap-3 text-center">
            <ShieldX className="h-12 w-12 text-red-400" />
            <p className="font-semibold text-gray-800">Documento não encontrado</p>
            <p className="text-sm text-gray-500">
              O ID informado não corresponde a nenhuma parceria na plataforma.
            </p>
          </div>
        )}

        {/* Result */}
        {data && (
          <>
            {/* Status banner */}
            {data.valid ? (
              <div className="bg-green-50 border border-green-300 rounded-2xl p-6 flex items-start gap-4 shadow">
                <ShieldCheck className="h-10 w-10 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-lg font-bold text-green-800">Documento Autêntico</p>
                  <p className="text-sm text-green-700 mt-1">
                    O hash SHA-256 foi recalculado e corresponde exatamente ao registrado no momento
                    da aceitação. Este documento não foi adulterado.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-300 rounded-2xl p-6 flex items-start gap-4 shadow">
                <ShieldX className="h-10 w-10 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-lg font-bold text-red-800">Documento Inválido</p>
                  <p className="text-sm text-red-700 mt-1">{data.reason}</p>
                </div>
              </div>
            )}

            {/* Details */}
            {data.valid && (
              <div className="bg-white rounded-2xl shadow p-6 space-y-5 text-sm text-gray-800">

                {/* Parties */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
                      Corretor Solicitante
                    </p>
                    <p><span className="text-gray-500">Nome:</span> <strong>{data.requester.name}</strong></p>
                    {data.requester.creci && (
                      <p><span className="text-gray-500">CRECI:</span> {data.requester.creci}</p>
                    )}
                    {data.requester.agency && (
                      <p><span className="text-gray-500">Imobiliária:</span> {data.requester.agency}</p>
                    )}
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">
                      Corretor Receptor
                    </p>
                    <p><span className="text-gray-500">Nome:</span> <strong>{data.receiver.name}</strong></p>
                    {data.receiver.creci && (
                      <p><span className="text-gray-500">CRECI:</span> {data.receiver.creci}</p>
                    )}
                    {data.receiver.agency && (
                      <p><span className="text-gray-500">Imobiliária:</span> {data.receiver.agency}</p>
                    )}
                  </div>
                </div>

                {/* Property */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Imóvel
                  </p>
                  <p><span className="text-gray-500">Título:</span> <strong>{data.property.title}</strong></p>
                  <p><span className="text-gray-500">Tipo:</span> {PROPERTY_TYPE_LABELS[data.property.type] ?? data.property.type}</p>
                  {data.property.city && (
                    <p><span className="text-gray-500">Cidade:</span> {data.property.city}</p>
                  )}
                </div>

                {/* Commission + date */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2">
                    Acordo
                  </p>
                  <p>
                    <span className="text-gray-500">Comissão acordada:</span>{" "}
                    {data.commissionSplit
                      ? <strong>{data.commissionSplit}% / {100 - data.commissionSplit}%</strong>
                      : <span className="text-gray-400">A definir entre as partes</span>
                    }
                  </p>
                  <p>
                    <span className="text-gray-500">Data de aceitação:</span>{" "}
                    <strong>{formatDate(data.acceptedAt)}</strong>
                  </p>
                </div>

                {/* Hash */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Hash SHA-256 Registrado
                  </p>
                  <code className="block break-all text-[11px] font-mono bg-white border rounded p-2 text-gray-700">
                    {data.hash}
                  </code>
                  <p className="text-xs text-gray-400">
                    ID da parceria: <code>{data.partnershipId}</code>
                  </p>
                </div>

                {/* Link to document */}
                <div className="pt-1 text-center">
                  <Link
                    href={`/termo/${id}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
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

        <p className="text-center text-xs text-gray-400 pt-2">
          useimobmatch.com.br — Verificação pública de autenticidade de termos de parceria
        </p>
      </div>
    </div>
  );
}
