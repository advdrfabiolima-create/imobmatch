"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)" }}
    >
      <div
        className="rounded-2xl border p-8 max-w-md w-full text-center"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(239,68,68,0.12)" }}
        >
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Algo deu errado</h1>
        <p className="text-sm text-white/40 mb-6 leading-relaxed">
          Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
          {error?.digest && (
            <span className="block mt-2 text-xs text-white/25 font-mono">
              Código: {error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-white text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl border transition-colors hover:bg-white/[0.06]"
            style={{ borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.50)" }}
          >
            <Home className="h-4 w-4" />
            Ir ao painel
          </Link>
        </div>
      </div>
    </div>
  );
}
