"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Rss, Home, User, UserCheck, Zap, Send, Image as ImageIcon, MessageCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

const POST_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  property:    { label: "Imóvel",      color: "bg-blue-100 text-blue-700",   icon: Home },
  client:      { label: "Comprador",   color: "bg-green-100 text-green-700", icon: User },
  partnership: { label: "Parceria",    color: "bg-purple-100 text-purple-700", icon: UserCheck },
  opportunity: { label: "Oportunidade", color: "bg-orange-100 text-orange-700", icon: Zap },
};

const QUICK_ACTIONS = [
  { type: "property",    label: "Tenho um imóvel",    icon: Home,      placeholder: "Descreva o imóvel disponível..." },
  { type: "client",      label: "Tenho um comprador", icon: User,      placeholder: "Qual o perfil do seu cliente?" },
  { type: "partnership", label: "Busco parceria",     icon: UserCheck, placeholder: "O que você busca em um parceiro?" },
];

function CreatePostCard() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("property");

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/feed", data),
    onSuccess: () => {
      toast.success("Post publicado!");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => toast.error("Erro ao publicar"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate({ type, content });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm overflow-hidden flex-shrink-0">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              : user?.name?.charAt(0).toUpperCase()
            }
          </div>
          <p className="text-sm text-gray-500">O que você quer compartilhar?</p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.type}
                type="button"
                onClick={() => setType(action.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  type === action.type
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-400"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder={QUICK_ACTIONS.find(a => a.type === type)?.placeholder || "Digite sua mensagem..."}
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-400">{content.length}/500 caracteres</p>
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || mutation.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {mutation.isPending ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PostCard({ post, currentUserId }: { post: any; currentUserId?: string }) {
  const config = POST_TYPE_CONFIG[post.type] ?? POST_TYPE_CONFIG.property;
  const Icon = config.icon;
  const isOwnPost = post.userId === currentUserId;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm overflow-hidden flex-shrink-0">
            {post.user?.avatarUrl
              ? <img src={post.user.avatarUrl} alt={post.user.name} className="w-full h-full object-cover" />
              : post.user?.name?.charAt(0).toUpperCase()
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-medium text-sm text-gray-900">{post.user?.name}</p>
              {post.user?.agency && (
                <span className="text-xs text-gray-500">· {post.user.agency}</span>
              )}
              {post.user?.city && (
                <span className="text-xs text-gray-400">· {post.user.city}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                <Icon className="h-3 w-3" />
                {config.label}
              </span>
              <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>

            {/* Contact button */}
            {!isOwnPost && post.user?.phone && (
              <div className="mt-3">
                <a
                  href={`https://wa.me/55${post.user.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contatar via WhatsApp
                </a>
              </div>
            )}

            {/* Score badge */}
            {post.user?.score != null && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-xs text-gray-400">Reputação:</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  post.user.score >= 200 ? "bg-yellow-100 text-yellow-700" :
                  post.user.score >= 80  ? "bg-gray-100 text-gray-600"    :
                                           "bg-orange-100 text-orange-700"
                }`}>
                  {post.user.score >= 200 ? "🥇 Gold" :
                   post.user.score >= 80  ? "🥈 Silver" : "🥉 Bronze"} · {post.user.score} pts
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FeedPage() {
  const { user } = useAuthStore();
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["feed", typeFilter],
    queryFn: () => {
      const params = typeFilter ? `?type=${typeFilter}` : "";
      return api.get(`/feed${params}`).then(r => r.data);
    },
    refetchInterval: 30000,
  });

  const filters = [
    { value: "", label: "Todos" },
    { value: "property", label: "Imóveis" },
    { value: "client", label: "Compradores" },
    { value: "partnership", label: "Parcerias" },
    { value: "opportunity", label: "Oportunidades" },
  ];

  return (
    <div>
      <Header title="Feed da Rede" />

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <CreatePostCard />

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                typeFilter === f.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-blue-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20">
            <Rss className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Feed vazio</h3>
            <p className="text-gray-500">Seja o primeiro a compartilhar algo com a rede</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.data?.map((post: any) => (
              <PostCard key={post.id} post={post} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
