"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short",
  });
}

export default function TermoParceiraPage() {
  const { id } = useParams<{ id: string }>();

  const { data: agreement, isLoading, isError } = useQuery({
    queryKey: ["partnership-agreement", id],
    queryFn: () => api.get(`/partnerships/${id}/agreement`).then((r) => r.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Termo de parceria não disponível.</p>
          <p className="text-sm text-gray-400 mt-1">
            O documento só é gerado após a parceria ser aceita.
          </p>
        </div>
      </div>
    );
  }

  const commission = Number(agreement.commissionSplit);
  const requesterShare = commission > 0 ? commission : 50;
  const receiverShare  = 100 - requesterShare;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Print button — hidden when printing */}
      <div className="max-w-3xl mx-auto mb-4 flex justify-end print:hidden">
        <Button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      {/* Document */}
      <div
        id="termo-parceria"
        className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Header */}
        <div className="bg-blue-600 px-8 py-6 text-white text-center print:bg-blue-600">
          <div className="flex justify-center mb-3">
            <ShieldCheck className="h-10 w-10 opacity-90" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Termo de Parceria Imobiliária</h1>
          <p className="text-blue-200 text-sm mt-1">
            Documento gerado automaticamente pela plataforma ImobMatch
          </p>
        </div>

        <div className="px-8 py-6 space-y-6 text-sm text-gray-800">

          {/* Intro */}
          <p className="leading-relaxed">
            Pelo presente instrumento particular, as partes identificadas abaixo, doravante
            denominadas <strong>CORRETOR SOLICITANTE</strong> e{" "}
            <strong>CORRETOR RECEPTOR</strong>, celebram o presente Termo de Parceria
            Imobiliária, com base nos dados registrados na plataforma{" "}
            <strong>ImobMatch</strong>, nos termos que se seguem.
          </p>

          {/* Partes */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 border-b pb-1 mb-3">
              1. Identificação das Partes
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Solicitante */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-blue-800 text-xs uppercase tracking-wider mb-2">
                  Corretor Solicitante
                </p>
                <p><span className="text-gray-500">Nome:</span> <strong>{agreement.requester.name}</strong></p>
                {agreement.requester.creci && (
                  <p><span className="text-gray-500">CRECI:</span> {agreement.requester.creci}</p>
                )}
                {agreement.requester.agency && (
                  <p><span className="text-gray-500">Imobiliária:</span> {agreement.requester.agency}</p>
                )}
                <p><span className="text-gray-500">E-mail:</span> {agreement.requester.email}</p>
                {agreement.requester.phone && (
                  <p><span className="text-gray-500">Telefone:</span> {agreement.requester.phone}</p>
                )}
                {agreement.requesterIp && (
                  <p className="text-xs text-gray-400 pt-1">
                    IP na proposta: <code className="bg-white px-1 rounded">{agreement.requesterIp}</code>
                  </p>
                )}
              </div>

              {/* Receptor */}
              <div className="bg-green-50 rounded-xl p-4 space-y-1">
                <p className="font-semibold text-green-800 text-xs uppercase tracking-wider mb-2">
                  Corretor Receptor
                </p>
                <p><span className="text-gray-500">Nome:</span> <strong>{agreement.receiver.name}</strong></p>
                {agreement.receiver.creci && (
                  <p><span className="text-gray-500">CRECI:</span> {agreement.receiver.creci}</p>
                )}
                {agreement.receiver.agency && (
                  <p><span className="text-gray-500">Imobiliária:</span> {agreement.receiver.agency}</p>
                )}
                <p><span className="text-gray-500">E-mail:</span> {agreement.receiver.email}</p>
                {agreement.receiver.phone && (
                  <p><span className="text-gray-500">Telefone:</span> {agreement.receiver.phone}</p>
                )}
                {agreement.receiverIp && (
                  <p className="text-xs text-gray-400 pt-1">
                    IP na aceitação: <code className="bg-white px-1 rounded">{agreement.receiverIp}</code>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Imóvel */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 border-b pb-1 mb-3">
              2. Imóvel Objeto da Parceria
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p><span className="text-gray-500">Título:</span> <strong>{agreement.property.title}</strong></p>
              <p><span className="text-gray-500">Tipo:</span> {{
                HOUSE: "Casa",
                APARTMENT: "Apartamento",
                LAND: "Terreno",
                COMMERCIAL: "Comercial",
                RURAL: "Rural",
                }[agreement.property.type] ?? agreement.property.type}</p>
              {agreement.property.city && (
                <p>
                  <span className="text-gray-500">Localização:</span>{" "}
                  {[agreement.property.neighborhood, agreement.property.city].filter(Boolean).join(", ")}
                </p>
              )}
              <p>
                <span className="text-gray-500">Valor de venda:</span>{" "}
                <strong className="text-green-700">{formatCurrency(agreement.property.price)}</strong>
              </p>
              <p className="text-xs text-gray-400">ID do imóvel: {agreement.property.id}</p>
            </div>
          </section>

          {/* Comissão */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 border-b pb-1 mb-3">
              3. Divisão de Comissão Acordada
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              {commission > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{agreement.requester.name} (Solicitante)</span>
                    <span className="text-lg font-bold text-amber-700">{requesterShare}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-3 bg-amber-200 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${requesterShare}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{agreement.receiver.name} (Receptor)</span>
                    <span className="text-lg font-bold text-green-700">{receiverShare}%</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-center">
                  Divisão de comissão a ser definida entre as partes (não especificada na proposta).
                </p>
              )}
            </div>
          </section>

          {/* Cláusulas */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 border-b pb-1 mb-3">
              4. Cláusulas e Condições
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                As partes comprometem-se a colaborar de boa-fé na intermediação do imóvel descrito
                neste termo, respeitando a divisão de comissão acordada.
              </li>
              <li>
                Os dados de contato do comprador são compartilhados exclusivamente para viabilizar
                o negócio descrito neste acordo, sendo vedado qualquer desvio comercial que prejudique
                qualquer das partes.
              </li>
              <li>
                Em caso de concretização da venda, cada corretor receberá o percentual de comissão
                acordado, calculado sobre a comissão total da transação.
              </li>
              <li>
                Este termo registra o acordo firmado digitalmente na plataforma ImobMatch, tendo
                validade como instrumento de prova entre as partes.
              </li>
              <li>
                O hash de verificação abaixo garante a autenticidade e integridade deste documento,
                não sendo possível adulterá-lo sem invalidar o registro.
              </li>
            </ol>
          </section>

          {/* Datas e assinatura digital */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 border-b pb-1 mb-3">
              5. Registro e Verificação
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-gray-500">Data da proposta:</span>
                <span>{formatDate(agreement.createdAt)}</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-gray-500">Data de aceitação:</span>
                <span className="font-medium text-green-700">{formatDate(agreement.acceptedAt)}</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-gray-500">ID da parceria:</span>
                <code className="break-all">{agreement.id}</code>
              </div>
              {agreement.agreementHash && (
                <div className="pt-2 border-t">
                  <p className="text-gray-500 mb-1">Hash de verificação (SHA-256):</p>
                  <code className="break-all text-[11px] bg-white border rounded p-2 block font-mono text-gray-700">
                    {agreement.agreementHash}
                  </code>
                  <p className="text-gray-400 mt-1">
                    Este código foi gerado no momento da aceitação e identifica unicamente este acordo.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Mensagem original */}
          {agreement.message && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 border-b pb-1 mb-3">
                6. Mensagem da Proposta
              </h2>
              <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600">
                "{agreement.message}"
              </blockquote>
            </section>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 pt-4 border-t">
            <p>
              Documento gerado automaticamente por <strong>ImobMatch</strong> em{" "}
              {formatDate(agreement.acceptedAt)}.
            </p>
            <p className="mt-1">
              A autenticidade pode ser verificada pelo hash SHA-256 registrado acima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
