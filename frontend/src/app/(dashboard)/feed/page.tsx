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
  property:    { label: "Imóvel",      color: "bg-blue-500/15 text-blue-300",   icon: Home },
  client:      { label: "Comprador",   color: "bg-emerald-500/15 text-emerald-300", icon: User },
  partnership: { label: "Parceria",    color: "bg-violet-500/15 text-violet-300", icon: UserCheck },
  opportunity: { label: "Oportunidade", color: "bg-orange-500/15 text-orange-300", icon: Zap },
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
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              : user?.name?.charAt(0).toUpperCase()
            }
          </div>
          <p className="text-sm text-muted-foreground">O que você quer compartilhar?</p>
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
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
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
            className="w-full border border-border bg-muted/60 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
            placeholder={QUICK_ACTIONS.find(a => a.type === type)?.placeholder || "Digite sua mensagem..."}
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground/60">{content.length}/500 caracteres</p>
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
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
            {post.user?.avatarUrl
              ? <img src={post.user.avatarUrl} alt={post.user.name} className="w-full h-full object-cover" />
              : post.user?.name?.charAt(0).toUpperCase()
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-medium text-sm text-foreground">{post.user?.name}</p>
              {post.user?.agency && (
                <span className="text-xs text-muted-foreground">· {post.user.agency}</span>
              )}
              {post.user?.city && (
                <span className="text-xs text-muted-foreground/70">· {post.user.city}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${config.color} border-current/20`}>
                <Icon className="h-3 w-3" />
                {config.label}
              </span>
              <span className="text-xs text-muted-foreground/60">{formatDate(post.createdAt)}</span>
            </div>

            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{post.content}</p>

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
                <span className="text-xs text-muted-foreground/60">Reputação:</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  post.user.score >= 200 ? "bg-amber-500/15 text-amber-300 border-amber-500/30" :
                  post.user.score >= 80  ? "bg-slate-400/10 text-slate-300 border-slate-400/30" :
                                           "bg-orange-500/15 text-orange-300 border-orange-500/30"
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
                  ? "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
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
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Rss className="h-6 w-6 text-primary/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Feed vazio</h3>
            <p className="text-muted-foreground">Seja o primeiro a compartilhar algo com a rede</p>
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
