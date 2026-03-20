"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const schema = z
  .object({
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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) setTokenError(true);
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password: data.password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        "Link inválido ou expirado. Solicite um novo.";
      toast.error(msg);
      if (err?.response?.status === 400 || err?.response?.status === 401) {
        setTokenError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <img
              src="/logo.png"
              alt="ImobMatch"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">
                Senha redefinida!
              </h1>
              <p className="text-gray-500 mt-2">
                Sua senha foi alterada com sucesso. Redirecionando para o
                login...
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
                Link inválido
              </h1>
              <p className="text-gray-500 mt-2">
                Este link de redefinição é inválido ou expirou.
                <br />
                Solicite um novo link abaixo.
              </p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:underline font-medium"
              >
                Solicitar novo link
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Redefinir senha
              </h1>
              <p className="text-gray-500 mt-1">
                Escolha uma nova senha para sua conta
              </p>
            </>
          )}
        </div>

        {!success && !tokenError && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Nova senha
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

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Confirmar nova senha
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
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar nova senha
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
