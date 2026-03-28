"use client";

import {
  useState, useEffect, useRef, useCallback, Suspense,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { api } from "@/lib/api";
import {
  MessageSquare, Send, Smile, Home, X, Reply, Check, CheckCheck, ArrowLeft, Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: string) {
  const dt = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dt.toDateString() === today.toDateString()) return "Hoje";
  if (dt.toDateString() === yesterday.toDateString()) return "Ontem";
  return dt.toLocaleDateString("pt-BR");
}
function fmtLastSeen(d: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  const today = new Date();
  if (dt.toDateString() === today.toDateString()) return `visto às ${fmtTime(d)}`;
  return `visto em ${dt.toLocaleDateString("pt-BR")} às ${fmtTime(d)}`;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_SIZE: Record<number, string> = {
  7: "w-7 h-7", 8: "w-8 h-8", 9: "w-9 h-9", 10: "w-10 h-10",
  11: "w-11 h-11", 12: "w-12 h-12", 14: "w-14 h-14",
};
function Avatar({ name, avatarUrl, size = 10 }: { name: string; avatarUrl?: string; size?: number }) {
  const sz = AVATAR_SIZE[size] ?? "w-10 h-10";
  return (
    <div className={`${sz} rounded-full bg-primary/20 flex-shrink-0 overflow-hidden flex items-center justify-center text-primary font-semibold text-sm ring-1 ring-primary/20`}>
      {avatarUrl
        ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        : name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Ticks ────────────────────────────────────────────────────────────────────
function Ticks({ isRead }: { isRead: boolean }) {
  return isRead
    ? <CheckCheck className="h-3.5 w-3.5 text-blue-300 flex-shrink-0" />
    : <Check className="h-3.5 w-3.5 text-blue-300/50 flex-shrink-0" />;
}

// ─── Property card message ────────────────────────────────────────────────────
function PropertyCardMsg({ content }: { content: string }) {
  let data: any = {};
  try { data = JSON.parse(content); } catch { return <p className="text-sm">{content}</p>; }
  return (
    <a
      href={`/imovel/${data.id}`} target="_blank" rel="noreferrer"
      className="block rounded-xl overflow-hidden border border-border hover:opacity-90 transition min-w-[220px]"
    >
      {data.photo && <img src={data.photo} alt={data.title} className="w-full h-28 object-cover" />}
      <div className="p-2.5 bg-white/5">
        <p className="font-semibold text-sm leading-tight line-clamp-2">{data.title}</p>
        <p className="text-xs mt-0.5 opacity-70">
          {PROPERTY_TYPE_LABELS[data.type] ?? data.type} • {data.city}
        </p>
        <p className="text-sm font-bold mt-1">{formatCurrency(data.price)}</p>
      </div>
    </a>
  );
}

// ─── Reply quote ──────────────────────────────────────────────────────────────
function ReplyQuote({ msg, isMe }: { msg: any; isMe: boolean }) {
  const preview = msg.messageType === "PROPERTY_CARD"
    ? "🏠 Imóvel compartilhado"
    : msg.content.length > 60 ? msg.content.slice(0, 60) + "…" : msg.content;
  return (
    <div className={`rounded-lg px-2 py-1 mb-1 border-l-2 text-xs ${
      isMe
        ? "bg-white/10 border-blue-300 text-blue-100"
        : "bg-white/5 border-primary/50 text-muted-foreground"
    }`}>
      <p className="font-semibold">{msg.sender?.name}</p>
      <p className="line-clamp-1">{preview}</p>
    </div>
  );
}

// ─── Date separator ───────────────────────────────────────────────────────────
function DateSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground/70 px-2">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Property picker ──────────────────────────────────────────────────────────
function PropertyPicker({ onSelect, onClose }: { onSelect: (p: any) => void; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ["my-properties-picker"],
    queryFn: () => api.get("/properties/my", { params: { status: "AVAILABLE", limit: 20 } }).then((r) => r.data),
  });

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-popover border border-border rounded-2xl shadow-2xl z-30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <p className="text-sm font-semibold text-foreground">Compartilhar imóvel</p>
        <button onClick={onClose} className="p-0.5 hover:bg-accent rounded-lg transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {data?.data?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum imóvel disponível</p>
        )}
        {data?.data?.map((p: any) => (
          <button
            key={p.id}
            onClick={() => { onSelect(p); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent text-left transition border-b border-border/50"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              {p.photos?.[0]
                ? <img src={p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                : <Home className="h-5 w-5 text-muted-foreground m-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.city}/{p.state}</p>
              <p className="text-xs font-semibold text-primary">{formatCurrency(p.price)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MensagensPage() {
  return (
    <Suspense>
      <MensagensContent />
    </Suspense>
  );
}

function MensagensContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const doPing = () => api.post("/users/ping").catch(() => {});
    doPing();
    const id = setInterval(doPing, 20_000);
    return () => clearInterval(id);
  }, []);

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.get("/messages/conversations").then((r) => r.data),
    refetchInterval: 8_000,
  });

  useEffect(() => {
    const partnerId = searchParams?.get("partner");
    if (!partnerId) return;
    const existing = conversations?.find((c: any) => c.partner.id === partnerId);
    if (existing) { setActiveConversation(existing); return; }
    api.get(`/users/${partnerId}`)
      .then((r) => setActiveConversation({ partner: r.data, lastMessage: null, unreadCount: 0 }))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations]);

  const { data: messages } = useQuery({
    queryKey: ["messages", activeConversation?.partner?.id],
    queryFn: () => api.get(`/messages/${activeConversation.partner.id}`).then((r) => r.data),
    enabled: !!activeConversation?.partner?.id,
    refetchInterval: 3_000,
  });

  const { data: partnerStatus } = useQuery({
    queryKey: ["partner-status", activeConversation?.partner?.id],
    queryFn: () => api.get(`/messages/${activeConversation.partner.id}/status`).then((r) => r.data),
    enabled: !!activeConversation?.partner?.id,
    refetchInterval: 15_000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (payload: { content: string; messageType?: string; replyToId?: string }) =>
      api.post("/messages", { receiverId: activeConversation?.partner?.id, ...payload }),
    onSuccess: () => {
      setMessage("");
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversation?.partner?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      inputRef.current?.focus();
    },
  });

  const handleSend = useCallback(() => {
    const text = message.trim();
    if (!text) return;
    sendMutation.mutate({ content: text, messageType: "TEXT", replyToId: replyingTo?.id });
  }, [message, replyingTo, sendMutation]);

  const handleSendProperty = (p: any) => {
    const content = JSON.stringify({
      id: p.id, title: p.title, type: p.type,
      price: Number(p.price), city: p.city, photo: p.photos?.[0] ?? null,
    });
    sendMutation.mutate({ content, messageType: "PROPERTY_CARD", replyToId: replyingTo?.id });
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const processedMessages = (() => {
    if (!messages?.length) return [];
    const result: { type: "sep" | "msg"; label?: string; msg?: any; showAvatar?: boolean }[] = [];
    let lastDate = "";
    let lastSenderId = "";
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const dateLabel = fmtDate(msg.createdAt);
      if (dateLabel !== lastDate) {
        result.push({ type: "sep", label: dateLabel });
        lastDate = dateLabel;
        lastSenderId = "";
      }
      const showAvatar = msg.senderId !== lastSenderId;
      result.push({ type: "msg", msg, showAvatar });
      lastSenderId = msg.senderId;
    }
    return result;
  })();

  return (
    <div>
      <Header title="Mensagens" />
      <div className="flex h-[calc(100vh-64px)]">

        {/* ── Conversations sidebar ── */}
        <div className={`border-r border-border bg-card flex flex-col flex-shrink-0 w-full md:w-80 ${activeConversation ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Conversas</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!conversations?.length ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-primary/60" />
                </div>
                <p className="text-sm font-medium text-foreground/80 mb-1">Nenhuma conversa ainda</p>
                <p className="text-xs text-muted-foreground mb-4">Encontre um corretor e inicie uma conversa.</p>
                <Link
                  href="/corretores"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Users className="h-3.5 w-3.5" /> Buscar Corretores
                </Link>
              </div>
            ) : conversations.map((conv: any) => (
              <button
                key={conv.partner.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full p-4 text-left border-b border-border/50 hover:bg-accent transition ${
                  activeConversation?.partner?.id === conv.partner.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={conv.partner.name} avatarUrl={conv.partner.avatarUrl} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-medium text-sm text-foreground truncate">{conv.partner.name}</p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? "font-medium text-foreground/70" : "text-muted-foreground"}`}>
                      {conv.lastMessage?.messageType === "PROPERTY_CARD"
                        ? "🏠 Imóvel compartilhado"
                        : conv.lastMessage?.content}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat area ── */}
        {activeConversation ? (
          <div className={`flex-1 flex flex-col min-w-0 ${activeConversation ? "flex" : "hidden md:flex"}`}>

            {/* Chat header */}
            <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors flex-shrink-0"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar name={activeConversation.partner.name} avatarUrl={activeConversation.partner.avatarUrl} size={10} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground leading-tight">
                  {activeConversation.partner.name}
                </p>
                <div className="flex items-center gap-1.5">
                  {partnerStatus?.isOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-medium">Online</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {partnerStatus?.lastSeen ? fmtLastSeen(partnerStatus.lastSeen) : activeConversation.partner.agency || ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-background space-y-0.5">
              {processedMessages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-xs mt-1">Envie a primeira mensagem para {activeConversation.partner.name}</p>
                </div>
              )}

              {processedMessages.map((item, idx) => {
                if (item.type === "sep") return <DateSep key={idx} label={item.label!} />;
                const msg  = item.msg;
                const isMe = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 group ${isMe ? "justify-end" : "justify-start"} ${item.showAvatar ? "mt-3" : "mt-0.5"}`}
                  >
                    {!isMe && (
                      <div className="w-7 flex-shrink-0 self-end mb-1">
                        {item.showAvatar && (
                          <Avatar name={activeConversation.partner.name} avatarUrl={activeConversation.partner.avatarUrl} size={7} />
                        )}
                      </div>
                    )}

                    {!isMe && (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-accent self-center"
                        title="Responder"
                      >
                        <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}

                    <div className={`max-w-[65%] rounded-2xl px-3 py-2 ${
                      isMe
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-card text-foreground border border-border/60 shadow-sm rounded-bl-sm"
                    }`}>
                      {msg.replyTo && <ReplyQuote msg={msg.replyTo} isMe={isMe} />}
                      {msg.messageType === "PROPERTY_CARD"
                        ? <PropertyCardMsg content={msg.content} />
                        : <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      }
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        <span className={`text-[10px] ${isMe ? "text-white/60" : "text-muted-foreground/70"}`}>
                          {fmtTime(msg.createdAt)}
                        </span>
                        {isMe && <Ticks isRead={msg.isRead} />}
                      </div>
                    </div>

                    {isMe && (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-accent self-center"
                        title="Responder"
                      >
                        <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="bg-card border-t border-border flex-shrink-0">
              {replyingTo && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-primary/20">
                  <Reply className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary/80">{replyingTo.sender?.name ?? "Você"}</p>
                    <p className="text-xs text-primary/60 truncate">
                      {replyingTo.messageType === "PROPERTY_CARD" ? "🏠 Imóvel compartilhado" : replyingTo.content}
                    </p>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-0.5 hover:bg-primary/20 rounded-full flex-shrink-0">
                    <X className="h-4 w-4 text-primary/60" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-3 relative">
                <div className="relative">
                  <button
                    onClick={() => { setShowEmoji((v) => !v); setShowPropertyPicker(false); }}
                    className="p-2 rounded-full hover:bg-accent transition text-muted-foreground hover:text-foreground"
                    title="Emojis"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  {showEmoji && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowEmoji(false)} />
                      <div className="absolute bottom-full left-0 mb-2 z-30">
                        <EmojiPicker onSelect={handleEmojiSelect} />
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => { setShowPropertyPicker((v) => !v); setShowEmoji(false); }}
                    className="p-2 rounded-full hover:bg-accent transition text-muted-foreground hover:text-foreground"
                    title="Compartilhar imóvel"
                  >
                    <Home className="h-5 w-5" />
                  </button>
                  {showPropertyPicker && (
                    <PropertyPicker onSelect={handleSendProperty} onClose={() => setShowPropertyPicker(false)} />
                  )}
                </div>

                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Mensagem..."
                  className="flex-1 rounded-full bg-muted/60 border-border focus-visible:ring-1 text-foreground placeholder:text-muted-foreground"
                />

                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending}
                  className="rounded-full w-10 h-10 p-0 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="empty-state-icon mx-auto">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-foreground/70">Selecione uma conversa</p>
              <p className="text-sm text-muted-foreground mt-1">ou vá em Corretores e clique em "Mensagem"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
