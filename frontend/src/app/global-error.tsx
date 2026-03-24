"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RefreshCw } from "lucide-react";

// Trata erros no root layout — precisa incluir <html> e <body>
export default function GlobalErrorPage({
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
    <html lang="pt-BR">
      <body style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ textAlign: "center", maxWidth: "24rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <AlertCircle style={{ width: "28px", height: "28px", color: "#f87171" }} />
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
            Falha crítica na aplicação
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.40)", marginBottom: "24px" }}>
            Ocorreu um erro inesperado. Por favor, tente recarregar a página.
          </p>
          <button
            onClick={reset}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", color: "#fff", fontSize: "0.875rem", fontWeight: 600, borderRadius: "12px", border: "none", cursor: "pointer" }}
          >
            <RefreshCw style={{ width: "16px", height: "16px" }} />
            Recarregar página
          </button>
        </div>
      </body>
    </html>
  );
}
