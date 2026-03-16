"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/store/auth.store";
import { MailWarning, X } from "lucide-react";
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
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-3 text-sm">
      <MailWarning className="h-4 w-4 text-amber-600 flex-shrink-0" />
      <p className="text-amber-800 flex-1">
        <span className="font-medium">Confirme seu e-mail</span> — Verifique sua caixa de entrada ou{" "}
        {resent ? (
          <span className="text-green-700 font-medium">novo link enviado!</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-700 font-medium hover:underline disabled:opacity-50"
          >
            {resending ? "enviando..." : "clique aqui para reenviar"}
          </button>
        )}
        .
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 min-h-screen flex flex-col">
        <EmailVerificationBanner />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
