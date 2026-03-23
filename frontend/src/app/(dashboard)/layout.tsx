"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/store/auth.store";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { MailWarning, X, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-verification");
      setResent(true);
    } catch {
      // silent
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-3 text-sm">
      <MailWarning className="h-4 w-4 text-amber-600 flex-shrink-0" />
      <p className="text-amber-300 flex-1">
        <span className="font-medium">Confirme seu e-mail</span> — Verifique sua caixa de entrada ou{" "}
        {resent ? (
          <span className="text-emerald-400 font-medium">novo link enviado!</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-400 font-medium hover:underline disabled:opacity-50"
          >
            {resending ? "enviando..." : "clique aqui para reenviar"}
          </button>
        )}
        .
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-amber-500/20 text-amber-500 transition-colors"
        aria-label="Fechar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen flex flex-col">
        <EmailVerificationBanner />
        <div className="flex-1">{children}</div>
        {/* Rodapé com aviso de isenção de responsabilidade */}
        <footer className="border-t border-white/[0.05] bg-white/[0.02] px-6 py-3">
          <div className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed w-full">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-600 mt-0.5" />
            <p className="flex-1 min-w-0">
              <span className="font-semibold text-slate-500">Aviso Legal:</span>{" "}
              A ImobMatch é uma plataforma de publicidade e não é responsável por negociações de compra, venda,
              locação ou permuta entre usuários. Toda transação é de responsabilidade exclusiva das partes
              e do corretor habilitado pelo CRECI (Lei nº 6.530/1978).{" "}
              <Link href="/termos" className="underline hover:text-slate-400 transition-colors">
                Termos de Uso
              </Link>
              .
            </p>
          </div>
        </footer>
      </main>
      <UpgradeModal />
    </div>
  );
}
