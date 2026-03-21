"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { STATES } from "@/lib/utils";
import { Loader2, Building2, MapPin, Mail, User, Camera, AlertTriangle } from "lucide-react";
import { maskPhone, maskCpfCnpj } from "@/lib/masks";
import toast from "react-hot-toast";
import { AvatarCropModal } from "@/components/ui/avatar-crop-modal";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  agency: z.string().optional(),
  creci: z.string().optional(),
  bio: z.string().optional(),
  cpfCnpj: z.string().optional(),
  personType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PerfilPage() {
  const { user, updateUser, logout } = useAuthStore();
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      city: user?.city || "",
      state: user?.state || "",
      agency: user?.agency || "",
      creci: user?.creci || "",
      bio: user?.bio || "",
      cpfCnpj: user?.cpfCnpj || "",
      personType: user?.personType || "PF",
    },
  });

  const personType = watch("personType") || "PF";

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.patch("/users/profile", data),
    onSuccess: (res) => {
      updateUser(res.data);
      toast.success("Perfil atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar perfil"),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => api.delete("/users/me"),
    onSuccess: () => {
      toast.success("Conta encerrada. Até logo!");
      logout();
      router.push("/login");
    },
    onError: () => toast.error("Erro ao encerrar conta"),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be selected again
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    // Immediate local preview
    setAvatarPreview(URL.createObjectURL(blob));
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");
      const { data } = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ avatarUrl: data.avatarUrl });
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro ao enviar foto");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const currentAvatar = avatarPreview || user?.avatarUrl;

  return (
    <>
    {cropSrc && (
      <AvatarCropModal
        src={cropSrc}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropSrc(null)}
      />
    )}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
          <div className="flex items-center gap-3 p-5 border-b">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Encerrar minha conta</h2>
              <p className="text-xs text-gray-500">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-700">
              Ao encerrar sua conta, você perderá acesso à plataforma e seus dados serão desativados.
              Seus termos de parceria e histórico permanecerão registrados por questões legais.
            </p>
            <p className="text-sm font-medium text-gray-900">
              Tem certeza que deseja encerrar a conta de <span className="text-red-600">{user?.email}</span>?
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteAccountMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => deleteAccountMutation.mutate()}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : "Sim, encerrar conta"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    <div>
      <Header title="Meu Perfil" />
      <div className="p-4 md:p-6 max-w-2xl">
        {/* Profile Summary Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              {/* Avatar com botão de upload */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 text-3xl font-bold select-none">
                      {user?.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-full flex items-center justify-center shadow-md transition"
                  title="Alterar foto ou logomarca"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {user?.agency && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{user.agency}</span>
                    </div>
                  )}
                  {user?.city && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{user.city}{user.state ? `/${user.state}` : ""}</span>
                    </div>
                  )}
                  {user?.creci && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {user.creci}
                    </span>
                  )}
                  <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"}>
                    {user?.role === "ADMIN" ? "Administrador" : "Corretor"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Clique no ícone de câmera para adicionar sua foto ou logomarca
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Editar Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Nome Completo</label>
                  <Input {...register("name")} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Telefone</label>
                  <Input
                    placeholder="(11) 99999-9999"
                    {...register("phone")}
                    onChange={(e) => setValue("phone", maskPhone(e.target.value), { shouldDirty: true })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Imobiliária</label>
                  <Input placeholder="Nome da imobiliária" {...register("agency")} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CRECI</label>
                  <Input placeholder="Ex: CRECI-SP 12345" {...register("creci")} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Cidade</label>
                  <Input placeholder="São Paulo" {...register("city")} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Estado</label>
                  <select {...register("state")} className="h-10 w-full rounded-md border px-3 text-sm">
                    <option value="">Selecione</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Bio / Apresentação</label>
                  <textarea
                    {...register("bio")}
                    rows={3}
                    placeholder="Fale um pouco sobre você e sua especialidade..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Tipo de Pessoa</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit mb-3">
                    {["PF", "PJ"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setValue("personType", type, { shouldDirty: true });
                          setValue("cpfCnpj", "", { shouldDirty: true });
                        }}
                        className={`px-4 py-1.5 text-sm font-medium transition ${
                          personType === type
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {type === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder={personType === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                    {...register("cpfCnpj")}
                    onChange={(e) =>
                      setValue("cpfCnpj", maskCpfCnpj(e.target.value, personType), { shouldDirty: true })
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={mutation.isPending || !isDirty}
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-lg">Informações da Conta</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user?.email}</span>
                <Badge variant="success" className="ml-auto">Verificado</Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4 text-gray-400" />
                <span>Conta ativa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="mt-4 border-red-100">
          <CardHeader><CardTitle className="text-lg text-red-700">Zona de Perigo</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Encerrar minha conta</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Desativa sua conta permanentemente. Você perderá acesso à plataforma.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
                onClick={() => setShowDeleteModal(true)}
              >
                Encerrar conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
