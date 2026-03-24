"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle,
  Eye, EyeOff, Users, Handshake, Star, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const schema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos 1 letra maiúscula")
      .regex(/[a-z]/, "Deve conter pelo menos 1 letra minúscula")
      .regex(/\d/, "Deve conter pelo menos 1 número")
      .regex(/[^A-Za-z\d]/, "Deve conter pelo menos 1 caractere especial"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem",
  });

type FormData = z.infer<typeof schema>;

type InviteInfo = {
  email: string;
  role: "ADMIN" | "AGENT";
  agency: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL
// ─────────────────────────────────────────────────────────────────────────────

const BULLETS = [
  { icon: Users,     text: "Conecte-se à sua equipe e comece a colaborar agora" },
  { icon: Handshake, text: "Acesso a parcerias e oportunidades da rede ImobMatch" },
  { icon: Star,      text: "Ferramentas exclusivas para corretores de alto desempenho" },
];

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative flex-col items-center justify-center px-14 py-16 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0c1a52 0%, #1e1060 45%, #3b1585 80%, #4c1d96 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{ background: "rgba(109,40,217,0.20)", filter: "blur(120px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-80 h-80 rounded-full"
        style={{ background: "rgba(37,99,235,0.14)", filter: "blur(100px)" }}
      />

      <div className="relative z-10 flex flex-col items-start w-full max-w-[340px] gap-12">
        <Link href="/" className="transition-opacity hover:opacity-70">
          <Image
            src="/logo_texto_branco.png"
            alt="ImobMatch"
            width={180}
            height={56}
            className="h-7 w-auto object-contain"
          />
        </Link>

        <div className="space-y-4">
          <h1 className="text-[2.6rem] font-extrabold text-white leading-[1.06] tracking-[-0.035em]">
            Bem-vindo(a)<br />à equipe.
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed font-normal">
            Complete seu cadastro e comece<br />a gerar negócios hoje.
          </p>
        </div>

        <ul className="w-full space-y-4">
          {BULLETS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <Icon className="h-4 w-4 text-white/35 flex-shrink-0 mt-0.5" />
              <span className="text-white/60 text-[13.5px] leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-white/35 text-[12px]">
          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
          Conexão segura · Seus dados não são compartilhados
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM
// ─────────────────────────────────────────────────────────────────────────────

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) {
      setTokenError("Link de convite inválido.");
      setLoadingInvite(false);
      return;
    }

    api
      .get(`/team/invite/accept/${token}`)
      .then((r) => setInvite(r.data))
      .catch((err) => {
        const msg =
          err?.response?.data?.message ?? "Convite inválido ou expirado.";
        setTokenError(msg);
      })
      .finally(() => setLoadingInvite(false));
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setSubmitting(true);
    try {
      await api.post(`/team/invite/accept/${token}`, {
        name: data.name,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Erro ao criar conta. Tente novamente.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingInvite) {
    return (
      <div className="w-full max-w-[400px] flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verificando convite...</p>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="w-full max-w-[400px]">
        <div
          className="bg-card rounded-2xl border border-border px-5 py-10 sm:px-8 text-center"
          style={{
            boxShadow: "0 1px 4px rgba(0,0,0,0.2), 0 12px 40px rgba(0,0,0,0.3)",
          }}
        >
          <CheckCircle className="h-14 w-14 text-emerald-400 mx-auto mb-5" />
          <h2 className="text-[1.55rem] font-bold text-foreground tracking-[-0.03em] leading-tight">
            Conta criada com sucesso!
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Bem-vindo(a) à equipe <strong className="text-foreground">{invite?.agency}</strong>!<br />
            Redirecionando para o login...
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Ir para o login agora
          </Link>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (tokenError) {
    return (
      <div className="w-full max-w-[400px]">
        <div
          className="bg-card rounded-2xl border border-border px-5 py-10 sm:px-8 text-center"
          style={{
            boxShadow: "0 1px 4px rgba(0,0,0,0.2), 0 12px 40px rgba(0,0,0,0.3)",
          }}
        >
          <XCircle className="h-14 w-14 text-red-400 mx-auto mb-5" />
          <h2 className="text-[1.55rem] font-bold text-foreground tracking-[-0.03em] leading-tight">
            Convite inválido
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">{tokenError}</p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Peça ao administrador para enviar um novo convite.
          </p>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[400px]">
      <div
        className="bg-card rounded-2xl border border-border px-5 py-7 sm:px-8 sm:py-9"
        style={{
          boxShadow: "0 1px 4px rgba(0,0,0,0.2), 0 12px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[1.55rem] font-bold text-foreground tracking-[-0.03em] leading-tight">
              Aceitar convite
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Você foi convidado para a equipe{" "}
            <strong className="text-foreground">{invite?.agency}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Email — read-only */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-muted-foreground tracking-wide">
              E-mail
            </label>
            <Input
              type="email"
              value={invite?.email ?? ""}
              readOnly
              className="h-11 text-sm rounded-xl bg-muted/30 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[11.5px] text-muted-foreground/60">
              Este e-mail será usado para fazer login.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-muted-foreground tracking-wide">
              Seu nome completo
            </label>
            <Input
              type="text"
              placeholder="João Silva"
              autoFocus
              {...register("name")}
              className={[
                "h-11 text-sm rounded-xl transition-all duration-150",
                errors.name
                  ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.10]"
                  : "",
              ].join(" ")}
            />
            {errors.name && (
              <p className="text-[11.5px] text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-muted-foreground tracking-wide">
              Criar senha
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                {...register("password")}
                className={[
                  "h-11 text-sm pr-11 rounded-xl transition-all duration-150",
                  errors.password
                    ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.10]"
                    : "",
                ].join(" ")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-[11.5px] text-red-500">{errors.password.message}</p>
            ) : (
              <p className="text-[11.5px] text-muted-foreground/60">
                Mínimo 8 caracteres com 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.
              </p>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-muted-foreground tracking-wide">
              Confirmar senha
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a senha"
                {...register("confirm")}
                className={[
                  "h-11 text-sm pr-11 rounded-xl transition-all duration-150",
                  errors.confirm
                    ? "border-red-400 focus:border-red-400 focus:ring-red-500/[0.10]"
                    : "",
                ].join(" ")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-[11.5px] text-red-500">{errors.confirm.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-1">
            <Button
              type="submit"
              disabled={submitting}
              className="group w-full h-11 rounded-xl font-semibold text-[14.5px] gap-2 border-0 text-white transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                boxShadow: submitting ? "none" : "0 4px 16px rgba(37,99,235,0.25)",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar minha conta
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Fazer login
        </Link>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col items-center justify-center px-6 py-16 sm:px-12 bg-background overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-12">
          <Link href="/">
            <Image
              src="/logo_texto_branco.png"
              alt="ImobMatch"
              width={150}
              height={44}
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          }
        >
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}

export default AcceptInvitePage;
