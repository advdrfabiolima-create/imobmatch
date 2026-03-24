"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatCurrency, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import { Plus, Search, User, Phone, MapPin, DollarSign, Edit, Trash2, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { BuyerFormModal } from "@/components/buyers/buyer-form-modal";

export default function CompradoresPage() {
  const [showForm, setShowForm] = useState(false);
  const [editBuyer, setEditBuyer] = useState<any>(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["buyers", search],
    queryFn: () => api.get("/buyers", { params: { search } }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/buyers/${id}`),
    onSuccess: () => {
      toast.success("Comprador removido");
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
    },
  });

  return (
    <div>
      <Header title="Compradores" />
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar compradores..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => { setEditBuyer(null); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Comprador
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{data?.total ?? 0} comprador(es)</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <User className="h-6 w-6 text-primary/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum comprador cadastrado</h3>
            <Button onClick={() => setShowForm(true)}>Cadastrar Comprador</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.data?.map((buyer: any) => (
              <Card key={buyer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{buyer.buyerName}</h3>
                      <Badge variant={buyer.status === "ACTIVE" ? "success" : "secondary"} className="mt-1">
                        {buyer.status === "ACTIVE" ? "Ativo" : buyer.status === "CLOSED" ? "Fechado" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditBuyer(buyer); setShowForm(true); }} className="p-1.5 hover:bg-accent rounded-lg text-primary">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => confirm("Remover comprador?") && deleteMutation.mutate(buyer.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                      <span>{buyer.desiredCity}{buyer.desiredNeighborhood ? ` - ${buyer.desiredNeighborhood}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                      <span>Até {formatCurrency(buyer.maxPrice)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded text-xs font-medium">
                        {PROPERTY_TYPE_LABELS[buyer.propertyType]}
                      </span>
                      {buyer.bedrooms && (
                        <span className="text-xs text-muted-foreground">{buyer.bedrooms} quarto(s)</span>
                      )}
                    </div>
                    {buyer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                        <span>{buyer.phone}</span>
                      </div>
                    )}
                  </div>
                  {buyer.notes && (
                    <p className="mt-3 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg line-clamp-2">{buyer.notes}</p>
                  )}

                  {(buyer.openMatchCount ?? 0) > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Link
                        href="/matches"
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        <Zap className="h-3.5 w-3.5 fill-white" />
                        🎯 Deu Match! Ver {buyer.openMatchCount} oportunidade{buyer.openMatchCount !== 1 ? "s" : ""}
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <BuyerFormModal
          buyer={editBuyer}
          onClose={() => { setShowForm(false); setEditBuyer(null); }}
          onSuccess={() => {
            setShowForm(false);
            setEditBuyer(null);
            queryClient.invalidateQueries({ queryKey: ["buyers"] });
          }}
        />
      )}
    </div>
  );
}
