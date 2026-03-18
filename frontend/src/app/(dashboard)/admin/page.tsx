"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  Users, Building2, Zap, UserCheck, Search, ToggleLeft, Trash2,
  Mail, Send, CheckCircle2, Clock, UserPlus, Phone,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

// ── Status badge dos leads ─────────────────────────────────────────────────────
const LEAD_STATUS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  WAITING:    { label: "Aguardando",  color: "bg-amber-100 text-amber-700 border-amber-200",  icon: Clock        },
  INVITED:    { label: "Convidado",   color: "bg-blue-100 text-blue-700 border-blue-200",     icon: Mail         },
  REGISTERED: { label: "Cadastrado",  color: "bg-green-100 text-green-700 border-green-200",  icon: CheckCircle2 },
};

function LeadStatusBadge({ status }: { status: string }) {
  const cfg = LEAD_STATUS[status] ?? LEAD_STATUS.WAITING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

// ── Aba de Leads ──────────────────────────────────────────────────────────────
function LeadsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected]       = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads", search, statusFilter],
    queryFn: () =>
      api.get("/early-access/leads", { params: { search, status: statusFilter || undefined } })
         .then((r) => r.data),
  });

  const leads: any[] = data?.data ?? [];
  const total: number = data?.total ?? 0;

  // contadores por status
  const counts = {
    total,
    waiting:    leads.filter(l => l.status === "WAITING").length,
    invited:    leads.filter(l => l.status === "INVITED").length,
    registered: leads.filter(l => l.status === "REGISTERED").length,
  };

  // ── Mutações ────────────────────────────────────────────────────────────────
  const inviteOne = useMutation({
    mutationFn: (id: string) => api.post(`/early-access/leads/${id}/invite`),
    onSuccess: (_, id) => {
      toast.success("Convite enviado!");
      setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
    },
    onError: () => toast.error("Erro ao enviar convite."),
  });

  const inviteBulk = useMutation({
    mutationFn: (ids: string[]) => api.post("/early-access/leads/bulk-invite", { ids }),
    onSuccess: (res) => {
      toast.success(res.data?.message ?? "Convites enviados!");
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
    },
    onError: () => toast.error("Erro ao enviar convites em massa."),
  });

  // ── Seleção ─────────────────────────────────────────────────────────────────
  const waitingLeads = leads.filter(l => l.status === "WAITING");
  const allWaitingSelected = waitingLeads.length > 0 && waitingLeads.every(l => selected.has(l.id));

  function toggleAll() {
    if (allWaitingSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(waitingLeads.map(l => l.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  const selectedWaiting = Array.from(selected).filter(id => leads.find(l => l.id === id)?.status === "WAITING");

  return (
    <div className="space-y-5">
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",       value: total,              color: "gray",  icon: Users       },
          { label: "Aguardando",  value: counts.waiting,     color: "amber", icon: Clock       },
          { label: "Convidados",  value: counts.invited,     color: "blue",  icon: Mail        },
          { label: "Cadastrados", value: counts.registered,  color: "green", icon: CheckCircle2 },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
              <div className={`p-2.5 bg-${s.color}-50 rounded-xl`}>
                <s.icon className={`h-5 w-5 text-${s.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros + ação em massa */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, e-mail ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm sm:w-40"
        >
          <option value="">Todos os status</option>
          <option value="WAITING">Aguardando</option>
          <option value="INVITED">Convidados</option>
          <option value="REGISTERED">Cadastrados</option>
        </select>

        {selectedWaiting.length > 0 && (
          <Button
            onClick={() => inviteBulk.mutate(selectedWaiting)}
            disabled={inviteBulk.isPending}
            className="bg-blue-600 hover:bg-blue-700 gap-2 whitespace-nowrap"
          >
            <Send className="h-4 w-4" />
            Convidar {selectedWaiting.length} selecionado(s)
          </Button>
        )}
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UserPlus className="h-10 w-10 mx-auto mb-3" />
          <p className="text-sm">Nenhum lead encontrado.</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          {/* Cabeçalho */}
          <div className="bg-gray-50 border-b px-4 py-2.5 flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <input
              type="checkbox"
              checked={allWaitingSelected}
              onChange={toggleAll}
              className="rounded"
              title="Selecionar todos aguardando"
            />
            <span className="flex-1">Lead</span>
            <span className="hidden md:block w-32">WhatsApp</span>
            <span className="w-28">Status</span>
            <span className="w-28 hidden sm:block">Cadastro</span>
            <span className="w-28 text-right">Ação</span>
          </div>

          <div className="divide-y">
            {leads.map((lead: any) => (
              <div
                key={lead.id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selected.has(lead.id) ? "bg-blue-50" : ""
                }`}
              >
                {/* Checkbox — só para WAITING */}
                <input
                  type="checkbox"
                  checked={selected.has(lead.id)}
                  disabled={lead.status !== "WAITING"}
                  onChange={() => toggleOne(lead.id)}
                  className="rounded disabled:opacity-30"
                />

                {/* Nome + e-mail */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{lead.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{lead.email}</p>
                </div>

                {/* WhatsApp */}
                <div className="hidden md:flex items-center gap-1 w-32 text-xs text-gray-500 truncate">
                  {lead.whatsapp ? (
                    <a
                      href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-600 hover:underline"
                    >
                      <Phone className="h-3 w-3" /> {lead.whatsapp}
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </div>

                {/* Status */}
                <div className="w-28">
                  <LeadStatusBadge status={lead.status} />
                </div>

                {/* Data */}
                <div className="hidden sm:block w-28 text-xs text-gray-400">
                  {formatDate(lead.createdAt)}
                  {lead.invitedAt && (
                    <p className="text-blue-400">Conv: {formatDate(lead.invitedAt)}</p>
                  )}
                </div>

                {/* Ação */}
                <div className="w-28 flex justify-end">
                  {lead.status === "WAITING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                      onClick={() => inviteOne.mutate(lead.id)}
                      disabled={inviteOne.isPending}
                    >
                      <Send className="h-3 w-3" /> Convidar
                    </Button>
                  )}
                  {lead.status === "INVITED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-gray-500 text-xs"
                      onClick={() => inviteOne.mutate(lead.id)}
                      disabled={inviteOne.isPending}
                    >
                      <Mail className="h-3 w-3" /> Reenviar
                    </Button>
                  )}
                  {lead.status === "REGISTERED" && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Ativo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        {total} lead(s) no total · Selecione leads "Aguardando" para convidar em massa
      </p>
    </div>
  );
}

// ── Página principal Admin ────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"stats" | "users" | "properties" | "leads">("stats");
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

  const TABS = [
    { key: "stats",      label: "Estatísticas" },
    { key: "users",      label: "Usuários"     },
    { key: "properties", label: "Imóveis"      },
    { key: "leads",      label: "Lista VIP 🔒"  },
  ] as const;

  return (
    <div>
      <Header title="Administração" />
      <div className="p-4 md:p-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 border-b flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); }}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Stats ── */}
        {tab === "stats" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Corretores", value: stats.usersCount,        icon: Users,     color: "blue"   },
                { label: "Imóveis",    value: stats.propertiesCount,   icon: Building2, color: "green"  },
                { label: "Matches",    value: stats.matchesCount,      icon: Zap,       color: "yellow" },
                { label: "Parcerias",  value: stats.partnershipsCount, icon: UserCheck, color: "purple" },
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

        {/* ── Usuários ── */}
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
                    <p className="text-sm text-gray-500">{u.email} · {u.city}/{u.state}</p>
                    <p className="text-xs text-gray-400">{u._count.properties} imóveis · {u._count.buyers} compradores</p>
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

        {/* ── Imóveis ── */}
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
                    <p className="text-sm text-gray-500">{p.city}/{p.state} · Corretor: {p.agent?.name}</p>
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

        {/* ── Lista VIP ── */}
        {tab === "leads" && <LeadsTab />}

      </div>
    </div>
  );
}
