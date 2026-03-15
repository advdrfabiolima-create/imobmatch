"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { STATES } from "@/lib/utils";
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
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: authRegister, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authRegister(data);
      toast.success("Conta criada com sucesso! Bem-vindo ao ImobMatch!");
      router.push("/welcome");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao criar conta");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <img src="/logo.png" alt="ImobMatch" className="h-12 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Criar conta gratuita</h1>
          <p className="text-gray-500 mt-1">Junte-se a milhares de corretores</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Nome completo *</label>
              <Input placeholder="João Silva" {...register("name")} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">E-mail *</label>
              <Input type="email" placeholder="joao@email.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Senha *</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  {...register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
              <Input placeholder="(11) 99999-9999" {...register("phone")} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Estado</label>
              <select
                {...register("state")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
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

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Criar Conta Gratuita
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
