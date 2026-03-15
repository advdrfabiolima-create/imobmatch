"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { X, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { STATES } from "@/lib/utils";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(5, "Título obrigatório"),
  type: z.enum(["HOUSE", "APARTMENT", "LAND", "COMMERCIAL", "RURAL"]),
  price: z.coerce.number().min(1, "Preço obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "Estado obrigatório"),
  neighborhood: z.string().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  parkingSpots: z.coerce.number().optional(),
  areaM2: z.coerce.number().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  property?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function PropertyFormModal({ property, onClose, onSuccess }: Props) {
  const isEditing = !!property;
  const [photos, setPhotos] = useState<string[]>(property?.photos || []);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: property ? {
      title: property.title,
      type: property.type,
      price: property.price,
      city: property.city,
      state: property.state,
      neighborhood: property.neighborhood || "",
      bedrooms: property.bedrooms || undefined,
      bathrooms: property.bathrooms || undefined,
      parkingSpots: property.parkingSpots || undefined,
      areaM2: property.areaM2 || undefined,
      description: property.description || "",
    } : undefined,
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const { data } = await api.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPhotos((prev) => [...prev, ...data.urls]);
      toast.success(`${data.urls.length} foto(s) enviada(s)!`);
    } catch {
      toast.error("Erro ao enviar fotos. Tente novamente.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: (formValues: FormData) => {
      const payload = { ...formValues, photos };
      return isEditing
        ? api.patch(`/properties/${property.id}`, payload)
        : api.post("/properties", payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? "Imóvel atualizado!" : "Imóvel cadastrado!");
      onSuccess();
    },
    onError: () => toast.error("Erro ao salvar imóvel"),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">{isEditing ? "Editar Imóvel" : "Cadastrar Imóvel"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Título *</label>
            <Input placeholder="Ex: Apartamento 3 quartos - Vila Madalena" {...register("title")} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo *</label>
              <select {...register("type")} className="h-10 w-full rounded-md border px-3 text-sm">
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="LAND">Terreno</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="RURAL">Rural</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preço (R$) *</label>
              <Input type="number" placeholder="850000" {...register("price")} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Cidade *</label>
              <Input placeholder="São Paulo" {...register("city")} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estado *</label>
              <select {...register("state")} className="h-10 w-full rounded-md border px-3 text-sm">
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bairro</label>
              <Input placeholder="Vila Madalena" {...register("neighborhood")} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Quartos</label>
              <Input type="number" min="0" {...register("bedrooms")} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Banheiros</label>
              <Input type="number" min="0" {...register("bathrooms")} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Vagas</label>
              <Input type="number" min="0" {...register("parkingSpots")} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Área (m²)</label>
              <Input type="number" min="0" {...register("areaM2")} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descrição</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Descreva o imóvel..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Fotos do Imóvel</label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group">
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl p-4 cursor-pointer transition ${uploading ? "opacity-50 cursor-not-allowed" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}>
              {uploading ? (
                <><Loader2 className="h-5 w-5 animate-spin text-blue-600" /><span className="text-sm text-blue-600">Enviando...</span></>
              ) : (
                <><ImagePlus className="h-5 w-5 text-gray-400" /><span className="text-sm text-gray-500">Clique para adicionar fotos (máx. 10MB cada)</span></>
              )}
              <input type="file" multiple accept="image/*" className="hidden" disabled={uploading} onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={mutation.isPending || uploading}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEditing ? "Salvar Alterações" : "Cadastrar Imóvel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
