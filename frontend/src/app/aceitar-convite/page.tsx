"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <img
              src="/logo_texto_preto.png"
              alt="ImobMatch"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {loadingInvite ? (
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          ) : success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">
                Conta criada com sucesso!
              </h1>
              <p className="text-gray-500 mt-2">
                Bem-vindo(a) à equipe <strong>{invite?.agency}</strong>!<br />
                Redirecionando para o login...
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Ir para o login agora
              </Link>
            </>
          ) : tokenError ? (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">
                Convite inválido
              </h1>
              <p className="text-gray-500 mt-2">{tokenError}</p>
              <p className="text-sm text-gray-400 mt-2">
                Peça ao administrador para enviar um novo convite.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Aceitar convite
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Você foi convidado para a equipe{" "}
                <strong className="text-gray-700">{invite?.agency}</strong>
              </p>
            </>
          )}
        </div>

        {!loadingInvite && !success && !tokenError && invite && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email — read-only */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                E-mail
              </label>
              <Input
                type="email"
                value={invite.email}
                readOnly
                className="bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Este é o e-mail que será usado para fazer login.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Seu nome completo
              </label>
              <Input
                type="text"
                placeholder="João Silva"
                autoFocus
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Criar senha
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1.5">
                  Mínimo 8 caracteres com 1 maiúscula, 1 minúscula, 1 número e
                  1 caractere especial.
                </p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Confirmar senha
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita a senha"
                  className="pr-10"
                  {...register("confirm")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirm.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Criar minha conta
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" /> Já tenho conta — fazer login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
