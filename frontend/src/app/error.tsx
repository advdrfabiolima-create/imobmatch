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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Algo deu errado
        </h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
          {error?.digest && (
            <span className="block mt-2 text-xs text-gray-400 font-mono">
              Código: {error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir ao painel
          </Link>
        </div>
      </div>
    </div>
  );
}
