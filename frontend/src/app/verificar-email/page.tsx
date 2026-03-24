"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
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
    <div
      className="rounded-2xl border p-10 w-full max-w-md text-center"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.4)",
      }}
    >
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Verificando seu e-mail...</h1>
          <p className="text-white/40 text-sm">Aguarde um momento.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">E-mail verificado!</h1>
          <p className="text-white/40 text-sm mb-6">
            Sua conta está confirmada. Agora você tem acesso completo ao ImobMatch.
          </p>
          <Button
            className="w-full h-11 rounded-xl font-semibold border-0 text-white hover:opacity-90 transition-opacity"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
            }}
            onClick={() => router.push(user ? "/dashboard" : "/login")}
          >
            {user ? "Ir para o Dashboard" : "Fazer Login"}
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-14 w-14 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Link inválido ou expirado</h1>
          <p className="text-white/40 text-sm mb-6">
            Este link de verificação não é mais válido. Solicite um novo link abaixo.
          </p>
          {user && !resent ? (
            <Button
              className="w-full h-11 rounded-xl font-semibold border-0 text-white hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
              }}
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
            <p className="text-emerald-400 text-sm font-medium">
              Novo link enviado! Verifique sua caixa de entrada.
            </p>
          ) : (
            <Link href="/login">
              <Button
                className="w-full h-11 rounded-xl font-semibold border-0 text-white hover:opacity-90 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
                }}
              >
                Ir para o Login
              </Button>
            </Link>
          )}
        </>
      )}

      {status === "no-token" && (
        <>
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(37,99,235,0.15)" }}
          >
            <Mail className="h-7 w-7 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Verifique seu e-mail</h1>
          <p className="text-white/40 text-sm mb-6">
            Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta.
          </p>
          {user && !resent && (
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold bg-transparent border text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
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
            <p className="text-emerald-400 text-sm font-medium">
              Novo link enviado! Verifique sua caixa de entrada.
            </p>
          )}
          <p className="text-xs text-white/20 mt-4">
            Não recebeu?{" "}
            <span className="text-white/35">Verifique a pasta de spam.</span>
          </p>
        </>
      )}
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg, #060c1a 0%, #0a1228 50%, #080e1f 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{ background: "rgba(124,58,237,0.07)", filter: "blur(140px)" }}
      />

      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="mb-8">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <Image
              src="/logo_texto_branco.png"
              alt="ImobMatch"
              width={140}
              height={40}
              className="h-5 w-auto object-contain"
            />
          </Link>
        </div>

        <Suspense
          fallback={
            <div
              className="rounded-2xl border p-10 w-full max-w-md text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-white/40 text-sm">Carregando...</p>
            </div>
          }
        >
          <VerificarEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
