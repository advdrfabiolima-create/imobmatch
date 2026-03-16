"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import {
  UsersRound,
  UserPlus,
  Trash2,
  Loader2,
  Mail,
  Crown,
  ArrowRight,
  X,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string;
};

type InvitePayload = {
  email: string;
  role: "ADMIN" | "AGENT";
};

// ── Invite Modal ──────────────────────────────────────────────────────────────
function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "AGENT">("AGENT");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Informe o e-mail do membro");
      return;
    }
    setLoading(true);
    try {
      await api.post("/team/invite", { email: email.trim(), role });
      toast.success("Convite enviado com sucesso!");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao enviar convite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Convidar membro</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              E-mail do membro
            </label>
            <Input
              type="email"
              placeholder="corretor@email.com"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Função na equipe
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["AGENT", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    role === r
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {r === "ADMIN" ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <UsersRound className="h-4 w-4" />
                  )}
                  {r === "ADMIN" ? "Administrador" : "Corretor"}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {role === "ADMIN"
                ? "Administradores podem gerenciar imóveis, compradores e membros da equipe."
                : "Corretores podem gerenciar seus próprios imóveis e compradores."}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Enviar convite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  // Access control — Agency plan only
  if (user?.plan !== "agency" && !user?.isLifetime) {
    return (
      <div>
        <Header title="Gestão de Equipe" />
        <div className="p-6 max-w-2xl mx-auto mt-8">
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <UsersRound className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Recurso exclusivo do plano Agency
              </h2>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                A Gestão de Equipe permite convidar corretores, definir permissões e gerenciar toda
                a operação da sua imobiliária em um só lugar.
              </p>
              <Link href="/plans">
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  Ver planos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-gray-400 mt-4">
                Este recurso está disponível apenas no plano Agency.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["team-members"],
    queryFn: () => api.get("/team/members").then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => api.delete(`/team/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Membro removido da equipe.");
    },
    onError: () => toast.error("Erro ao remover membro"),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: "ADMIN" | "AGENT" }) =>
      api.patch(`/team/members/${memberId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Função atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar função"),
  });

  return (
    <>
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => {
            setShowInvite(false);
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
          }}
        />
      )}

      <div>
        <Header title="Gestão de Equipe" />
        <div className="p-6 max-w-5xl">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Membros ativos", value: members.filter((m) => m.isActive).length },
              { label: "Administradores", value: members.filter((m) => m.role === "ADMIN").length },
              { label: "Corretores", value: members.filter((m) => m.role === "AGENT").length },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Table Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Membros da Equipe</CardTitle>
              <Button
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                onClick={() => setShowInvite(true)}
              >
                <UserPlus className="h-4 w-4" />
                Convidar membro
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-14 px-6">
                  <UsersRound className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-1">Nenhum membro na equipe ainda</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Convide corretores para trabalharem junto com você.
                  </p>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowInvite(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Convidar primeiro membro
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Nome</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">E-mail</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Função</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-right py-3 px-6 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                          {/* Name */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-blue-600 font-semibold text-xs">
                                {member.avatarUrl ? (
                                  <img
                                    src={member.avatarUrl}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  member.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span className="font-medium text-gray-900">
                                {member.name}
                                {member.id === user?.id && (
                                  <span className="ml-2 text-xs text-gray-400">(você)</span>
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4 text-gray-600">{member.email}</td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            {member.id === user?.id ? (
                              <Badge variant="default" className="gap-1">
                                <Crown className="h-3 w-3" />
                                {member.role === "ADMIN" ? "Administrador" : "Corretor"}
                              </Badge>
                            ) : (
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  changeRoleMutation.mutate({
                                    memberId: member.id,
                                    role: e.target.value as "ADMIN" | "AGENT",
                                  })
                                }
                                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              >
                                <option value="AGENT">Corretor</option>
                                <option value="ADMIN">Administrador</option>
                              </select>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <Badge variant={member.isActive ? "success" : "secondary"}>
                              {member.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-6 text-right">
                            {member.id !== user?.id && (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Remover ${member.name} da equipe? Esta ação não pode ser desfeita.`
                                    )
                                  ) {
                                    removeMutation.mutate(member.id);
                                  }
                                }}
                                disabled={removeMutation.isPending}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Remover membro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-gray-400 mt-4">
            Membros convidados receberão um e-mail com instruções para criar sua conta.
          </p>
        </div>
      </div>
    </>
  );
}
