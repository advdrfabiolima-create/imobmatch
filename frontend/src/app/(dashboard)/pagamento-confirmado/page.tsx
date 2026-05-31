"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { getPlanById } from "@/config/plans";
import {
  CheckCircle2, XCircle, Loader2, Clock, ArrowRight,
  Zap, Sparkles, Gem, Building2, Users,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type PageState = "checking" | "active" | "failed" | "timeout";

// ─── Ícone por plano ──────────────────────────────────────────────────────────

const PLAN_ICONS: Record<string, React.ElementType> = {
  free:    Users,
  starter: Zap,
  pro:     Sparkles,
  premium: Gem,
  agency:  Building2,
};

// ─── Animação de pulso ────────────────────────────────────────────────────────

function PulsingRing({ color }: { color: string }) {
  return (
    <span
      className="absolute inset-0 rounded-full animate-ping opacity-30"
      style={{ backgroundColor: color }}
    />
  );
}

// ─── Estados visuais ──────────────────────────────────────────────────────────

function CheckingState({ attempt, max }: { attempt: number; max: number }) {
  const pct = Math.min(Math.round((attempt / max) * 100), 99);
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        <PulsingRing color="#7c5cfc" />
        <div className="relative z-10 w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Loader2 className="h-9 w-9 text-primary animate-spin" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Confirmando pagamento…
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          Aguarde enquanto verificamos a confirmação junto ao Asaas. Isso leva alguns instantes.
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Verificando…</span>
          <span>{attempt}ª tentativa</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground/60">
        Não feche esta página. O redirecionamento é automático.
      </p>
    </div>
  );
}

function ActiveState({ plan }: { plan: string }) {
  const planData  = getPlanById(plan);
  const PlanIcon  = PLAN_ICONS[plan] ?? Zap;
  const planName  = planData?.name ?? plan;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-2">
          Pagamento confirmado
        </p>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Seu plano <span className="text-primary">{planName}</span> está ativo!
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          Todos os recursos do plano {planName} já estão disponíveis na sua conta.
        </p>
      </div>

      {/* Badge do plano */}
      <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-5 py-3">
        <PlanIcon className="h-5 w-5 text-primary" />
        <span className="font-semibold text-foreground">{planName}</span>
        <span className="text-xs text-muted-foreground">· Ativo agora</span>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
      >
        Ir para o Dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function FailedState({ status }: { status: string }) {
  const isOverdue = status === "OVERDUE";
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="relative z-10 w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
          <XCircle className="h-10 w-10 text-red-400" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isOverdue ? "Pagamento com problema" : "Pagamento não concluído"}
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          {isOverdue
            ? "Houve um problema com seu pagamento. Verifique os dados e tente novamente."
            : "Sua assinatura foi cancelada ou o pagamento foi estornado."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/meu-plano"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          Tentar novamente
        </Link>
        <a
          href="mailto:contato@useimobmatch.com.br?subject=Problema no pagamento"
          className="inline-flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Falar com suporte
        </a>
      </div>
    </div>
  );
}

function TimeoutState() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="relative z-10 w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
          <Clock className="h-10 w-10 text-amber-400" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Processando seu pagamento
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
          Seu pagamento está sendo processado pelo Asaas. Isso pode levar alguns minutos
          dependendo do método escolhido (boleto pode levar até 3 dias úteis).
        </p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 max-w-sm text-sm text-amber-300 text-left space-y-1.5">
        <p className="font-semibold">O que acontece agora?</p>
        <p className="text-amber-300/80 text-xs leading-relaxed">
          Assim que o pagamento for confirmado, seu plano será ativado automaticamente
          e você receberá um e-mail de confirmação. Você pode verificar o status
          na página <strong>Meu Plano</strong> a qualquer momento.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/meu-plano"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          Ver meu plano
        </Link>
        <a
          href="mailto:contato@useimobmatch.com.br?subject=Status do pagamento"
          className="inline-flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Falar com suporte
        </a>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5_000;
const MAX_ATTEMPTS     = 60; // 5 minutos

export default function PagamentoConfirmadoPage() {
  const router               = useRouter();
  const { updateUser }       = useAuthStore();
  const [state, setState]    = useState<PageState>("checking");
  const [attempt, setAttempt] = useState(0);
  const [subStatus, setSubStatus] = useState("");
  const [planId, setPlanId]  = useState("");
  const timerRef             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef           = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    let attempts = 0;

    async function poll() {
      if (!mountedRef.current) return;

      attempts++;
      setAttempt(attempts);

      try {
        const { data: sub } = await api.get("/billing/subscription");

        if (!mountedRef.current) return;

        if (sub?.status === "ACTIVE") {
          // Atualiza plano no store global para refletir imediatamente na UI
          if (sub.plan) {
            updateUser({ plan: sub.plan });
            setPlanId(sub.plan);
          }
          setState("active");

          // Redireciona para dashboard após 3 segundos
          timerRef.current = setTimeout(() => {
            if (mountedRef.current) router.push("/dashboard");
          }, 3_000);
          return;
        }

        if (sub?.status === "OVERDUE" || sub?.status === "CANCELLED" || sub?.status === "INACTIVE") {
          setSubStatus(sub.status);
          setState("failed");
          return;
        }

        // PENDING ou sem assinatura — continua polling
        if (attempts >= MAX_ATTEMPTS) {
          setState("timeout");
          return;
        }
      } catch {
        // Falha de rede — continua tentando
      }

      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">

        {state === "checking" && (
          <CheckingState attempt={attempt} max={MAX_ATTEMPTS} />
        )}

        {state === "active" && (
          <ActiveState plan={planId} />
        )}

        {state === "failed" && (
          <FailedState status={subStatus} />
        )}

        {state === "timeout" && (
          <TimeoutState />
        )}

      </div>
    </div>
  );
}
