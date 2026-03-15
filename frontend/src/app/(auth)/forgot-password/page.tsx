"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const schema = z.object({ email: z.string().email("E-mail inválido") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
    } catch {
      toast.error("Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <img src="/logo.png" alt="ImobMatch" className="h-12 w-auto object-contain" />
          </Link>

          {sent ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">E-mail enviado!</h1>
              <p className="text-gray-500 mt-2">
                Se o e-mail existir em nossa base, você receberá as instruções de redefinição de senha em breve.
              </p>
              <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:underline">
                <ArrowLeft className="h-4 w-4" /> Voltar ao login
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Esqueceu a senha?</h1>
              <p className="text-gray-500 mt-1">Digite seu e-mail para receber as instruções</p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">E-mail</label>
              <Input type="email" placeholder="seu@email.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enviar instruções
            </Button>
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
