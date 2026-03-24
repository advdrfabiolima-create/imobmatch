"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Info } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BANKS = [
  { name: "Caixa Pró-Cotista FGTS", rate: 9.01,  color: "blue",   note: "Exige 3 anos de FGTS" },
  { name: "Caixa SFH",              rate: 10.26, color: "blue",   note: "Até R$ 2,25 mi" },
  { name: "Santander",              rate: 11.49, color: "red",    note: "" },
  { name: "Banco do Brasil",        rate: 10.89, color: "yellow", note: "" },
  { name: "Itaú",                   rate: 11.60, color: "orange", note: "" },
  { name: "Bradesco",               rate: 11.70, color: "red",    note: "" },
];

const MIP_BY_AGE: [number, number][] = [
  [25, 0.000180], [30, 0.000200], [35, 0.000250], [40, 0.000300],
  [45, 0.000400], [50, 0.000550], [55, 0.000800], [60, 0.001200],
  [65, 0.001800], [99, 0.002000],
];

const DFI_RATE    = 0.0001337; // % of property value / month
const ADMIN_FEE   = 25;        // R$/month fixed

// MCMV 2026 subsidy table [maxIncome, maxSubsidy]
const MCMV_FAIXAS = [
  { label: "Faixa 1", maxRenda: 2850,  maxSubsidio: 55000, desc: "Renda até R$ 2.850" },
  { label: "Faixa 2", maxRenda: 4700,  maxSubsidio: 30000, desc: "Renda até R$ 4.700" },
  { label: "Faixa 3", maxRenda: 8600,  maxSubsidio: 8000,  desc: "Renda até R$ 8.600" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMoney(v: string): number {
  return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatMoney(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getMip(age: number): number {
  for (const [maxAge, rate] of MIP_BY_AGE) {
    if (age <= maxAge) return rate;
  }
  return 0.002;
}

function calcPrice(pv: number, annualRate: number, months: number) {
  const i = annualRate / 100 / 12;
  if (i === 0) return pv / months;
  return pv * (i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
}

function calcSacFirst(pv: number, annualRate: number, months: number) {
  const i = annualRate / 100 / 12;
  const amort = pv / months;
  return amort + pv * i;
}

function calcSacLast(pv: number, annualRate: number, months: number) {
  const i = annualRate / 100 / 12;
  const amort = pv / months;
  const balanceLast = amort; // last period balance is just one amortization
  return amort + balanceLast * i;
}

function calcTotalPaid(pv: number, annualRate: number, months: number, system: "price" | "sac") {
  const i = annualRate / 100 / 12;
  if (system === "price") {
    const pmt = calcPrice(pv, annualRate, months);
    return pmt * months;
  }
  // SAC: total = sum of all installments
  const amort = pv / months;
  let total = 0;
  let balance = pv;
  for (let k = 0; k < months; k++) {
    total += amort + balance * i;
    balance -= amort;
  }
  return total;
}

function getMcmvSubsidy(renda: number): number {
  for (const f of MCMV_FAIXAS) {
    if (renda <= f.maxRenda) return f.maxSubsidio;
  }
  return 0;
}

// ─── Mask helpers ─────────────────────────────────────────────────────────────

function maskCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SimuladorPage() {
  const [valorImovel,  setValorImovel]  = useState("");
  const [entrada,      setEntrada]      = useState("");
  const [prazo,        setPrazo]        = useState("360");
  const [renda,        setRenda]        = useState("");
  const [idade,        setIdade]        = useState("");
  const [sistema,      setSistema]      = useState<"price" | "sac">("sac");
  const [selectedBank, setSelectedBank] = useState(0);
  const [showTable,    setShowTable]    = useState(false);

  const imovel  = parseMoney(valorImovel);
  const ent     = parseMoney(entrada);
  const rend    = parseMoney(renda);
  const id      = parseInt(idade) || 35;
  const meses   = parseInt(prazo) || 360;
  const financia = Math.max(imovel - ent, 0);
  const rate    = BANKS[selectedBank].rate;

  const mip     = getMip(id);
  const dfi     = imovel * DFI_RATE;

  const results = useMemo(() => {
    if (financia <= 0 || meses <= 0) return null;

    const priceInstallment = calcPrice(financia, rate, meses);
    const sacFirst         = calcSacFirst(financia, rate, meses);
    const sacLast          = calcSacLast(financia, rate, meses);

    const baseInstallment  = sistema === "price" ? priceInstallment : sacFirst;
    const insurances       = financia * mip + dfi + ADMIN_FEE;
    const totalInstallment = baseInstallment + insurances;

    const totalPaid        = calcTotalPaid(financia, rate, meses, sistema);
    const totalInterest    = totalPaid - financia;

    const comprometimento  = rend > 0 ? (totalInstallment / rend) * 100 : 0;
    const subsidy          = getMcmvSubsidy(rend);

    // amortization table (first 6 + last 3 rows)
    const i = rate / 100 / 12;
    const table: { mes: number; parcela: number; amort: number; juros: number; saldo: number }[] = [];
    let balance = financia;
    const amort = financia / meses;

    for (let k = 1; k <= meses; k++) {
      const juros = balance * i;
      const parcela = sistema === "price" ? priceInstallment : (amort + juros);
      const a = sistema === "price" ? parcela - juros : amort;
      balance -= a;
      if (k <= 6 || k > meses - 3) {
        table.push({ mes: k, parcela, amort: a, juros, saldo: Math.max(balance, 0) });
      }
    }

    return {
      priceInstallment, sacFirst, sacLast, baseInstallment,
      insurances, totalInstallment, totalPaid, totalInterest,
      comprometimento, subsidy, table,
    };
  }, [financia, rate, meses, sistema, mip, dfi, rend]);

  const bankResults = useMemo(() => {
    if (financia <= 0 || meses <= 0) return [];
    return BANKS.map((b) => {
      const base = sistema === "price"
        ? calcPrice(financia, b.rate, meses)
        : calcSacFirst(financia, b.rate, meses);
      const total = base + financia * mip + dfi + ADMIN_FEE;
      const totalPaid = calcTotalPaid(financia, b.rate, meses, sistema);
      return { ...b, installment: total, totalPaid };
    }).sort((a, b) => a.installment - b.installment);
  }, [financia, meses, sistema, mip, dfi]);

  const comprOk = results ? results.comprometimento <= 30 : true;

  return (
    <div>
      <Header title="Simulador de Financiamento" />
      <div className="p-4 md:p-6 max-w-5xl space-y-6">

        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
          <p>
            <span className="font-semibold">Simulação aproximada.</span>{" "}
            Os valores apresentados são estimativas com base nas taxas médias de mercado de março/2026 e podem variar conforme o banco, perfil de crédito, data da contratação e política interna de cada instituição. Consulte o banco de sua preferência para uma simulação oficial.
          </p>
        </div>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Dados do Financiamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Valor do Imóvel (R$)</label>
                <Input
                  value={valorImovel}
                  onChange={(e) => setValorImovel(maskCurrency(e.target.value))}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Entrada (R$)</label>
                <Input
                  value={entrada}
                  onChange={(e) => setEntrada(maskCurrency(e.target.value))}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Valor Financiado
                </label>
                <div className="h-10 flex items-center px-3 rounded-md border border-border bg-muted text-sm font-semibold text-primary">
                  {formatMoney(financia)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Prazo (meses)</label>
                <select
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  className="h-10 w-full rounded-md border px-3 text-sm bg-background text-foreground"
                >
                  {[60,120,180,240,300,360,420].map(m => (
                    <option key={m} value={m}>{m} meses ({m/12} anos)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Renda Bruta Mensal (R$)</label>
                <Input
                  value={renda}
                  onChange={(e) => setRenda(maskCurrency(e.target.value))}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sua Idade</label>
                <Input
                  type="number"
                  min={18}
                  max={75}
                  value={idade}
                  onChange={(e) => setIdade(e.target.value)}
                />
              </div>
            </div>

            {/* Sistema de amortização */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Sistema de Amortização</label>
              <div className="flex rounded-lg border border-border overflow-hidden w-fit">
                {(["sac", "price"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSistema(s)}
                    className={`px-5 py-2 text-sm font-medium transition ${
                      sistema === s ? "bg-primary text-white" : "bg-card text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {s === "sac" ? "SAC" : "PRICE"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {sistema === "sac"
                  ? "SAC: parcelas decrescentes — paga mais juros no início, menos no final"
                  : "PRICE: parcelas fixas — mais fácil de planejar o orçamento"}
              </p>
            </div>

            {/* Banco selecionado */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Banco / Taxa (a.a.)</label>
              <div className="flex flex-wrap gap-2">
                {BANKS.map((b, idx) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setSelectedBank(idx)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      selectedBank === idx
                        ? "bg-primary text-white border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {b.name} — {b.rate.toFixed(2)}%
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {results && (
          <>
            {/* Resultado principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-500/25">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground mb-1">
                    {sistema === "sac" ? "1ª Parcela (com seguros)" : "Parcela Fixa (com seguros)"}
                  </p>
                  <p className="text-3xl font-bold text-primary">{formatMoney(results.totalInstallment)}</p>
                  {sistema === "sac" && (
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Última: {formatMoney(results.sacLast + results.insurances)}
                    </p>
                  )}
                  <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Amortização + Juros</span>
                      <span>{formatMoney(results.baseInstallment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MIP + DFI + Taxa</span>
                      <span>{formatMoney(results.insurances)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground mb-1">Total Pago ao Banco</p>
                  <p className="text-2xl font-bold text-foreground">{formatMoney(results.totalPaid)}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Juros totais: {formatMoney(results.totalInterest)}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${Math.min((financia / results.totalPaid) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {((financia / results.totalPaid) * 100).toFixed(0)}% capital · {((results.totalInterest / results.totalPaid) * 100).toFixed(0)}% juros
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className={comprOk ? "border-emerald-500/25" : "border-red-500/25"}>
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground mb-1">Comprometimento de Renda</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-3xl font-bold ${comprOk ? "text-emerald-400" : "text-red-400"}`}>
                      {results.comprometimento.toFixed(1)}%
                    </p>
                    {comprOk
                      ? <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
                      : <AlertTriangle className="h-5 w-5 text-red-500 mb-1" />
                    }
                  </div>
                  <p className={`text-xs mt-1 ${comprOk ? "text-emerald-400" : "text-red-400"}`}>
                    {comprOk ? "Dentro do limite de 30% recomendado" : "Acima do limite de 30% — banco pode reprovar"}
                  </p>
                  {results.comprometimento > 30 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Renda mínima necessária: {formatMoney(results.totalInstallment / 0.30)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* MCMV */}
            {results.subsidy > 0 && (
              <Card className="border-emerald-500/25 bg-emerald-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Minha Casa Minha Vida — Possível subsídio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {MCMV_FAIXAS.filter(f => parseMoney(renda) <= f.maxRenda).map((f) => (
                      <div key={f.label} className="bg-card rounded-lg border border-emerald-500/25 px-4 py-2">
                        <p className="font-semibold text-emerald-400">{f.label}</p>
                        <p className="text-muted-foreground text-xs">{f.desc}</p>
                        <p className="text-emerald-300 font-bold mt-1">até {formatMoney(f.maxSubsidio)}</p>
                      </div>
                    )).slice(0, 1)}
                    <div className="flex items-center text-xs text-emerald-400 gap-1">
                      <Info className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>O subsídio reduz o valor financiado. Consulte a Caixa Econômica Federal para confirmar elegibilidade.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparativo de bancos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comparativo de Bancos — {meses} meses / {sistema.toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                        <th className="text-left px-4 py-2.5 font-medium">Banco</th>
                        <th className="text-right px-4 py-2.5 font-medium">Taxa a.a.</th>
                        <th className="text-right px-4 py-2.5 font-medium">
                          {sistema === "sac" ? "1ª Parcela" : "Parcela"} (com seg.)
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium">Total Pago</th>
                        <th className="text-right px-4 py-2.5 font-medium hidden md:table-cell">Obs.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankResults.map((b, idx) => (
                        <tr
                          key={b.name}
                          className={`border-b border-border last:border-0 transition ${idx === 0 ? "bg-primary/5" : "hover:bg-accent"}`}
                        >
                          <td className="px-4 py-3 font-medium flex items-center gap-2">
                            {idx === 0 && <Badge variant="secondary" className="text-[10px] py-0">Melhor</Badge>}
                            {b.name}
                          </td>
                          <td className="px-4 py-3 text-right">{b.rate.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatMoney(b.installment)}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{formatMoney(b.totalPaid)}</td>
                          <td className="px-4 py-3 text-right text-xs text-muted-foreground/60 hidden md:table-cell">{b.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground/60 px-4 py-2">
                  * Taxas de março/2026. Inclui seguros MIP, DFI e taxa de administração de R$ 25/mês. TR não incluída. Consulte o banco para simulação oficial.
                </p>
              </CardContent>
            </Card>

            {/* Tabela de amortização */}
            <Card>
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => setShowTable(!showTable)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Tabela de Amortização (prévia)</CardTitle>
                  {showTable ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardHeader>
              {showTable && (
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                          <th className="text-left px-4 py-2.5 font-medium">Mês</th>
                          <th className="text-right px-4 py-2.5 font-medium">Parcela</th>
                          <th className="text-right px-4 py-2.5 font-medium">Amortização</th>
                          <th className="text-right px-4 py-2.5 font-medium">Juros</th>
                          <th className="text-right px-4 py-2.5 font-medium">Saldo Devedor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.table.map((row, idx) => {
                          const isGap = idx === 6 && results.table.length > 9;
                          return (
                            <>
                              {isGap && (
                                <tr key="gap" className="border-b">
                                  <td colSpan={5} className="px-4 py-2 text-center text-xs text-muted-foreground/60">
                                    · · · {meses - 9} meses omitidos · · ·
                                  </td>
                                </tr>
                              )}
                              <tr key={row.mes} className="border-b border-border last:border-0 hover:bg-accent">
                                <td className="px-4 py-2.5 text-muted-foreground">{row.mes}º</td>
                                <td className="px-4 py-2.5 text-right font-medium text-foreground">{formatMoney(row.parcela)}</td>
                                <td className="px-4 py-2.5 text-right text-emerald-400">{formatMoney(row.amort)}</td>
                                <td className="px-4 py-2.5 text-right text-red-400">{formatMoney(row.juros)}</td>
                                <td className="px-4 py-2.5 text-right text-muted-foreground">{formatMoney(row.saldo)}</td>
                              </tr>
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground/60 px-4 py-2">
                    * Parcelas sem seguros. Para o total, adicione {formatMoney(results.insurances)}/mês.
                  </p>
                </CardContent>
              )}
            </Card>
          </>
        )}

        {financia <= 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Preencha os dados acima para ver a simulação
          </div>
        )}
      </div>
    </div>
  );
}
