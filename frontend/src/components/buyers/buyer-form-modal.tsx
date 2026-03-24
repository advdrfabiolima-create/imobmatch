"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { X, Loader2 } from "lucide-react";
import { STATES } from "@/lib/utils";
import { maskPhone, maskCurrency, parseCurrency } from "@/lib/masks";
import { CitySelect } from "@/components/ui/city-select";
import toast from "react-hot-toast";

const schema = z.object({
  buyerName: z.string().min(2, "Nome obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  desiredCity: z.string().min(2, "Cidade obrigatória"),
  desiredState: z.string().optional(),
  desiredNeighborhood: z.string().optional(),
  maxPrice: z.string().min(1, "Preço máximo obrigatório"),
  minPrice: z.string().optional(),
  propertyType: z.enum(["HOUSE", "CONDO_HOUSE", "APARTMENT", "LAND", "COMMERCIAL", "RURAL"]),
  bedrooms: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  buyer?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function BuyerFormModal({ buyer, onClose, onSuccess }: Props) {
  const isEditing = !!buyer;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: buyer
      ? {
          ...buyer,
          maxPrice: buyer.maxPrice ? parseCurrency("") || String(Number(buyer.maxPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })) : "",
          minPrice: buyer.minPrice ? String(Number(buyer.minPrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })) : "",
        }
      : { propertyType: "APARTMENT" },
  });

  const watchedState = watch("desiredState");

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        maxPrice: parseCurrency(data.maxPrice),
        minPrice: data.minPrice ? parseCurrency(data.minPrice) : undefined,
      };
      return isEditing ? api.patch(`/buyers/${buyer.id}`, payload) : api.post("/buyers", payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? "Comprador atualizado!" : "Comprador cadastrado!");
      onSuccess();
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-semibold text-foreground">{isEditing ? "Editar Comprador" : "Novo Comprador"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Nome do Comprador *</label>
              <Input placeholder="Carlos Oliveira" {...register("buyerName")} />
              {errors.buyerName && <p className="text-red-500 text-xs mt-1">{errors.buyerName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Telefone</label>
              <Input
                placeholder="(11) 99999-9999"
                {...register("phone")}
                onChange={(e) => setValue("phone", maskPhone(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">E-mail</label>
              <Input type="email" placeholder="carlos@email.com" {...register("email")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Estado *</label>
              <select
                {...register("desiredState")}
                onChange={(e) => {
                  setValue("desiredState", e.target.value, { shouldDirty: true });
                  setValue("desiredCity", "");
                }}
                className="h-10 w-full rounded-md border border-border bg-muted/60 text-foreground px-3 text-sm"
              >
                <option value="">Selecione</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cidade Desejada *</label>
              <CitySelect stateValue={watchedState ?? ""} {...register("desiredCity")} />
              {errors.desiredCity && <p className="text-red-500 text-xs mt-1">{errors.desiredCity.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bairro</label>
              <Input placeholder="Vila Madalena" {...register("desiredNeighborhood")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Preço Mínimo (R$)</label>
              <Input
                placeholder="0,00"
                {...register("minPrice")}
                onChange={(e) => setValue("minPrice", maskCurrency(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preço Máximo (R$) *</label>
              <Input
                placeholder="0,00"
                {...register("maxPrice")}
                onChange={(e) => setValue("maxPrice", maskCurrency(e.target.value))}
              />
              {errors.maxPrice && <p className="text-red-500 text-xs mt-1">{errors.maxPrice.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Imóvel *</label>
              <select {...register("propertyType")} className="h-10 w-full rounded-md border border-border bg-muted/60 text-foreground px-3 text-sm">
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="CONDO_HOUSE">Casa em Condomínio</option>
                <option value="LAND">Terreno</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="RURAL">Rural</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Quartos Mínimos</label>
              <Input type="number" min="0" {...register("bedrooms")} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Observações</label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Detalhes sobre as preferências do comprador..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEditing ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
