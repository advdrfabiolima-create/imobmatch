"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface DisclaimerNoticeProps {
  /** Exibe versão compacta (uma linha expansível) — ideal para sidebar e rodapés */
  compact?: boolean;
}

export function DisclaimerNotice({ compact = false }: DisclaimerNoticeProps) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="text-[10px] leading-relaxed text-[#475569] select-none">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-[#475569] hover:text-[#94A3B8] transition-colors w-full text-left"
          aria-expanded={expanded}
        >
          <AlertTriangle className="h-3 w-3 flex-shrink-0 text-amber-500/70" />
          <span className="font-medium">Isenção de responsabilidade</span>
          {expanded ? (
            <ChevronUp className="h-3 w-3 ml-auto flex-shrink-0" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-auto flex-shrink-0" />
          )}
        </button>

        {expanded && (
          <p className="mt-1.5 text-[9.5px] leading-relaxed text-[#475569] pl-0.5">
            A ImobMatch é uma plataforma de publicidade tecnológica. Não é parte em
            nenhuma negociação imobiliária e não se responsabiliza por transações de compra,
            venda, locação ou permuta realizadas entre usuários.{" "}
            <Link href="/termos" className="underline hover:text-[#94A3B8]">
              Saiba mais
            </Link>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5" />
        <div className="space-y-2 leading-relaxed">
          <p className="font-semibold text-amber-900">
            Aviso Importante — Isenção de Responsabilidade por Transações Imobiliárias
          </p>
          <p>
            A <strong>ImobMatch</strong> é uma plataforma de publicidade e intermediação
            tecnológica destinada exclusivamente a profissionais do mercado imobiliário. Atuamos
            como um <em>veículo de divulgação de anúncios</em> e não somos parte integrante,
            mandante ou interveniente em qualquer negociação, contrato de compra e venda, locação,
            permuta ou outra modalidade de transação imobiliária celebrada entre usuários.
          </p>
          <p>
            Toda e qualquer negociação é de <strong>responsabilidade exclusiva das partes
            envolvidas</strong>. A condução, assessoramento e formalização das transações cabem ao
            corretor de imóveis habilitado perante o CRECI, nos termos da Lei Federal nº 6.530/1978.
          </p>
          <p>
            A ImobMatch <strong>não verifica</strong> a regularidade documental dos imóveis
            anunciados, não realiza avaliações ou vistorias, e não garante a veracidade das
            informações publicadas pelos usuários. A pesquisa de certidões e a devida diligência
            são de responsabilidade das partes contratantes.
          </p>
          <p className="text-xs text-amber-700">
            Para mais detalhes, consulte nossos{" "}
            <Link href="/termos" className="font-medium underline hover:text-amber-900">
              Termos de Uso
            </Link>
            , especialmente a seção sobre Isenção de Responsabilidade por Transações.
          </p>
        </div>
      </div>
    </div>
  );
}
