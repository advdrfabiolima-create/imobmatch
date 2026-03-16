"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { STATES } from "@/lib/utils";
import { maskPhone } from "@/lib/masks";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  agency: z.string().optional(),
  creci: z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "Você deve aceitar os Termos de Uso e a Política de Privacidade",
  }),
});

type FormData = z.infer<typeof schema>;

const BENEFITS = [
  "Match automático comprador × imóvel",
  "Rede colaborativa de corretores parceiros",
  "Importação de imóveis por link",
  "Gestão completa da sua carteira",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: authRegister, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { acceptTerms: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { acceptTerms, ...payload } = data;
      await authRegister(payload);
      toast.success("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      router.push("/verificar-email");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao criar conta");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-white" />
          <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-white" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ImobMatch"
              width={160}
              height={48}
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Crie sua conta gratuita e comece a fechar mais negócios.
            </h1>
            <p className="mt-4 text-blue-100 text-lg leading-relaxed">
              Junte-se a mais de 3.000 corretores que já usam o ImobMatch para encontrar parceiros e compradores.
            </p>
          </div>

          {/* Benefit list */}
          <ul className="space-y-3">
            {BENEFITS.map((text) => (
              <li key={text} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/20">
            <div className="flex -space-x-2">
              {["A", "B", "C", "D"].map((l) => (
                <div
                  key={l}
                  className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="text-blue-100 text-sm">
              <span className="font-semibold text-white">+3.000 corretores</span> já utilizam o ImobMatch
            </p>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-white text-sm leading-relaxed italic">
            "Cadastrei minha carteira inteira em menos de 10 minutos. Os matches chegaram no mesmo dia. Recomendo!"
          </p>
          <p className="mt-3 text-blue-200 text-xs font-medium">— Maria Santos, Corretora em Campinas</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-50 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-6">
          <Link href="/">
            <Image src="/logo.png" alt="ImobMatch" width={140} height={40} className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="w-full max-w-xl">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Criar conta gratuita</h2>
              <p className="text-gray-500 mt-1.5 text-sm">
                Já tem conta?{" "}
                <Link href="/login" className="text-blue-600 font-medium hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nome completo *</label>
                  <Input
                    placeholder="João Silva"
                    autoFocus
                    autoComplete="name"
                    {...register("name")}
                    className={errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">E-mail *</label>
                  <Input
                    type="email"
                    placeholder="joao@email.com"
                    autoComplete="email"
                    {...register("email")}
                    className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Senha *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      {...register("password")}
                      className={`pr-10 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              </div>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">Informações profissionais (opcional)</span>
                </div>
              </div>

              {/* Professional info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
                  <Input
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                    {...register("phone")}
                    onChange={(e) => setValue("phone", maskPhone(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Estado</label>
                  <select
                    {...register("state")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Cidade</label>
                  <Input placeholder="São Paulo" {...register("city")} />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Imobiliária</label>
                  <Input placeholder="Nome da imobiliária" {...register("agency")} />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1">CRECI</label>
                  <Input placeholder="Ex: CRECI-SP 12345 (opcional)" {...register("creci")} />
                </div>
              </div>

              {/* LGPD / Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register("acceptTerms")}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    Li e concordo com os{" "}
                    <Link href="/termos" target="_blank" className="text-blue-600 hover:underline font-medium">
                      Termos de Uso
                    </Link>{" "}
                    e a{" "}
                    <Link href="/privacidade" target="_blank" className="text-blue-600 hover:underline font-medium">
                      Política de Privacidade
                    </Link>
                    . Estou ciente de que meus dados serão tratados conforme a{" "}
                    <span className="font-medium text-gray-700">LGPD (Lei 13.709/2018)</span>.
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium gap-2 mt-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar Conta Gratuita
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Trust */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Gratuito para sempre no plano básico. Sem cartão de crédito.
          </p>
        </div>
      </div>
    </div>
  );
}
