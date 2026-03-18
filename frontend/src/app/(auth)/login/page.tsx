"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowRight, Building2, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type FormData = z.infer<typeof schema>;

const FEATURES = [
  { icon: Zap,       text: "Match automático entre compradores e imóveis" },
  { icon: Users,     text: "Rede colaborativa de corretores parceiros" },
  { icon: Building2, text: "Gestão completa de carteira de imóveis" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      const { user } = useAuthStore.getState();
      toast.success("Bem-vindo ao ImobMatch!");
      router.push(user?.isFirstLogin ? "/welcome" : "/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-white" />
          <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-white" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo.png" alt="ImobMatch" width={160} height={48} className="h-12 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Encontre o match perfeito entre compradores e imóveis.
            </h1>
            <p className="mt-4 text-blue-100 text-lg leading-relaxed">
              O ImobMatch conecta corretores, compradores e imóveis em uma única plataforma inteligente.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-blue-100 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Honest copy */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/20">
            <p className="text-blue-100 text-sm">
              <span className="font-semibold text-white">Plataforma em crescimento</span> com corretores em todo o Brasil. Seja um dos primeiros.
            </p>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-white text-sm leading-relaxed italic">
            "Com o ImobMatch encontrei parceiros para fechar negócios que sozinho não conseguiria. A plataforma transformou minha forma de trabalhar."
          </p>
          <p className="mt-3 text-blue-200 text-xs font-medium">— João Silva, Corretor em São Paulo</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="ImobMatch" width={140} height={40} className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Acesse sua conta</h2>
              <p className="text-gray-500 mt-1.5 text-sm">
                Entre para continuar utilizando o ImobMatch.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 block">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  autoFocus
                  autoComplete="email"
                  {...register("email")}
                  className={`h-11 ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Senha</label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className={`h-11 pr-10 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium gap-2 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

            </form>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Cadastre-se grátis
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
