"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UserCheck, Check, X, Building2, FileText, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, any> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
  CANCELLED: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceita",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
};

export default function ParceriasPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["partnerships"],
    queryFn: () => api.get("/partnerships").then((r) => r.data),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/partnerships/${id}/respond`, { status }),
    onSuccess: (_, vars) => {
      toast.success(vars.status === "ACCEPTED" ? "Parceria aceita!" : "Parceria recusada");
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      queryClient.invalidateQueries({ queryKey: ["partnerships-badge"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/partnerships/${id}/cancel`),
    onSuccess: () => {
      toast.success("Parceria cancelada");
      queryClient.invalidateQueries({ queryKey: ["partnerships"] });
      queryClient.invalidateQueries({ queryKey: ["partnerships-badge"] });
    },
  });

  const pending  = data?.data?.filter((p: any) => p.receiverId === user?.id && p.status === "PENDING") || [];
  const sent     = data?.data?.filter((p: any) => p.requesterId === user?.id) || [];
  const active   = data?.data?.filter((p: any) => p.status === "ACCEPTED") || [];

  return (
    <div>
      <Header title="Parcerias" />
      <div className="p-4 md:p-6 space-y-6">

        {/* Pendentes recebidas */}
        {pending.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Aguardando sua resposta ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((p: any) => (
                <Card key={p.id} className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">{p.property?.title}</span>
                          <span className="text-blue-600 font-medium">{formatCurrency(p.property?.price)}</span>
                        </div>
                        {p.buyer && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span>Cliente: <strong>{p.buyer?.buyerName}</strong></span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600">
                          Solicitado por <strong>{p.requester?.name}</strong> em {formatDate(p.createdAt)}
                        </p>
                        {p.message && (
                          <p className="text-sm text-gray-500 mt-2 bg-white p-2 rounded-lg italic">"{p.message}"</p>
                        )}
                        {p.commissionSplit && (
                          <p className="text-xs text-gray-500 mt-1">Comissão proposta: {p.commissionSplit}%</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-1"
                          onClick={() => respondMutation.mutate({ id: p.id, status: "ACCEPTED" })}
                        >
                          <Check className="h-4 w-4" /> Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
                          onClick={() => respondMutation.mutate({ id: p.id, status: "REJECTED" })}
                        >
                          <X className="h-4 w-4" /> Recusar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Parcerias ativas */}
        {active.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Parcerias Ativas ({active.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {active.map((p: any) => (
                <Card key={p.id} className="border-green-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{p.property?.title}</p>
                        <p className="text-blue-600 font-medium text-sm">{formatCurrency(p.property?.price)}</p>
                      </div>
                      <Badge variant="success">Ativa</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {p.buyer && (
                        <div className="flex items-center gap-1.5 py-1 px-2 bg-blue-50 rounded-lg mb-2">
                          <User className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span>Cliente: <strong className="text-blue-800">{p.buyer?.buyerName}</strong></span>
                        </div>
                      )}
                      <p>Solicitante: {p.requester?.name}</p>
                      <p>Receptor: {p.receiver?.name}</p>
                      {p.commissionSplit && <p className="font-medium">Comissão: {p.commissionSplit}%</p>}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Link href={`/parcerias/${p.id}/termo`} target="_blank">
                        <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 w-full">
                          <FileText className="h-4 w-4" />
                          Ver Termo de Parceria
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Minhas solicitações */}
        {sent.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Minhas Solicitações</h2>
            <div className="space-y-3">
              {sent.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{p.property?.title}</p>
                      {p.buyer && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Cliente: {p.buyer?.buyerName}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">Para: {p.receiver?.name} • {formatDate(p.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                      {p.status === "PENDING" && (
                        <Button size="sm" variant="outline" onClick={() => cancelMutation.mutate(p.id)}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <div className="text-center py-16">
            <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma parceria ainda</h3>
            <p className="text-gray-500">Navegue pelos imóveis e solicite parcerias com outros corretores</p>
          </div>
        )}
      </div>
    </div>
  );
}