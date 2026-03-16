"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

type Status = "loading" | "success" | "error" | "no-token";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { user, updateUser } = useAuthStore();

  const [status, setStatus] = useState<Status>(token ? "loading" : "no-token");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;

    api
      .get(`/auth/verify-email?token=${token}`)
      .then(() => {
        updateUser({ emailVerified: true });
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [token]);

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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 w-full max-w-md text-center">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Verificando seu e-mail...</h1>
          <p className="text-gray-500 text-sm">Aguarde um momento.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">E-mail verificado!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Sua conta está confirmada. Agora você tem acesso completo ao ImobMatch.
          </p>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push(user ? "/dashboard" : "/login")}
          >
            {user ? "Ir para o Dashboard" : "Fazer Login"}
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link inválido ou expirado</h1>
          <p className="text-gray-500 text-sm mb-6">
            Este link de verificação não é mais válido. Solicite um novo link abaixo.
          </p>
          {user && !resent ? (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Reenviando...
                </>
              ) : (
                "Reenviar e-mail de verificação"
              )}
            </Button>
          ) : resent ? (
            <p className="text-green-600 text-sm font-medium">
              Novo link enviado! Verifique sua caixa de entrada.
            </p>
          ) : (
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Ir para o Login
              </Button>
            </Link>
          )}
        </>
      )}

      {status === "no-token" && (
        <>
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Verifique seu e-mail</h1>
          <p className="text-gray-500 text-sm mb-6">
            Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta.
          </p>
          {user && !resent && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Reenviando...
                </>
              ) : (
                "Reenviar e-mail"
              )}
            </Button>
          )}
          {resent && (
            <p className="text-green-600 text-sm font-medium">
              Novo link enviado! Verifique sua caixa de entrada.
            </p>
          )}
          <p className="text-xs text-gray-400 mt-4">
            Não recebeu?{" "}
            <span className="text-gray-600">Verifique a pasta de spam.</span>
          </p>
        </>
      )}
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8">
        <Link href="/">
          <Image src="/logo.png" alt="ImobMatch" width={140} height={40} className="h-10 w-auto object-contain" />
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 w-full max-w-md text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Carregando...</p>
          </div>
        }
      >
        <VerificarEmailContent />
      </Suspense>
    </div>
  );
}
