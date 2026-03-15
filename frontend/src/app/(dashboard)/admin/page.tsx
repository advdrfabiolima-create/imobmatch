"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Users, Building2, Zap, UserCheck, Search, ToggleLeft, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"stats" | "users" | "properties">("stats");
  const [search, setSearch] = useState("");

  if (user?.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats").then((r) => r.data),
    enabled: tab === "stats",
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => api.get("/admin/users", { params: { search } }).then((r) => r.data),
    enabled: tab === "users",
  });

  const { data: properties } = useQuery({
    queryKey: ["admin-properties", search],
    queryFn: () => api.get("/admin/properties", { params: { search } }).then((r) => r.data),
    enabled: tab === "properties",
  });

  const toggleUser = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle`),
    onSuccess: () => {
      toast.success("Status do usuário alterado");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/properties/${id}`),
    onSuccess: () => {
      toast.success("Imóvel removido");
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  return (
    <div>
      <Header title="Administração" />
      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {(["stats", "users", "properties"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t === "stats" ? "Estatísticas" : t === "users" ? "Usuários" : "Imóveis"}
            </button>
          ))}
        </div>

        {tab === "stats" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Corretores", value: stats.usersCount, icon: Users, color: "blue" },
                { label: "Imóveis", value: stats.propertiesCount, icon: Building2, color: "green" },
                { label: "Matches", value: stats.matchesCount, icon: Zap, color: "yellow" },
                { label: "Parcerias", value: stats.partnershipsCount, icon: UserCheck, color: "purple" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{s.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                    </div>
                    <div className={`p-3 bg-${s.color}-50 rounded-xl`}>
                      <s.icon className={`h-6 w-6 text-${s.color}-600`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">Cadastros Recentes</CardTitle></CardHeader>
              <CardContent>
                <div className="divide-y">
                  {stats.recentUsers?.map((u: any) => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{formatDate(u.createdAt)}</p>
                        <Badge variant={u.isActive ? "success" : "destructive"} className="mt-1">
                          {u.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "users" && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar usuários..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="divide-y border rounded-xl overflow-hidden bg-white">
              {users?.data?.map((u: any) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email} • {u.city}/{u.state}</p>
                    <p className="text-xs text-gray-400">{u._count.properties} imóveis • {u._count.buyers} compradores</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={u.isActive ? "success" : "destructive"}>
                      {u.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => toggleUser.mutate(u.id)}>
                      <ToggleLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "properties" && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar imóveis..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="divide-y border rounded-xl overflow-hidden bg-white">
              {properties?.data?.map((p: any) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">{p.city}/{p.state} • Corretor: {p.agent?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === "AVAILABLE" ? "success" : "secondary"}>{p.status}</Badge>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50"
                      onClick={() => confirm("Remover imóvel?") && deleteProperty.mutate(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
