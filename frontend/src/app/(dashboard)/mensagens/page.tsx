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

// ─── helpers ─────────────────────────────────────────────────────────────────

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
  if (dt.toDateString() === today.toDateString())
    return `visto às ${fmtTime(d)}`;
  return `visto em ${dt.toLocaleDateString("pt-BR")} às ${fmtTime(d)}`;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_SIZE: Record<number, string> = {
  8: "w-8 h-8", 9: "w-9 h-9", 10: "w-10 h-10",
  11: "w-11 h-11", 12: "w-12 h-12", 14: "w-14 h-14",
};
function Avatar({ name, avatarUrl, size = 10 }: { name: string; avatarUrl?: string; size?: number }) {
  const sz = AVATAR_SIZE[size] ?? "w-10 h-10";
  return (
    <div className={`${sz} rounded-full bg-blue-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-blue-600 font-semibold text-sm`}>
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
    : <Check className="h-3.5 w-3.5 text-blue-300/60 flex-shrink-0" />;
}

// ─── Property card message ────────────────────────────────────────────────────
function PropertyCardMsg({ content }: { content: string }) {
  let data: any = {};
  try { data = JSON.parse(content); } catch { return <p className="text-sm">{content}</p>; }
  return (
    <a
      href={`/imovel/${data.id}`}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl overflow-hidden border border-white/20 hover:opacity-90 transition min-w-[220px]"
    >
      {data.photo && (
        <img src={data.photo} alt={data.title} className="w-full h-28 object-cover" />
      )}
      <div className="p-2.5">
        <p className="font-semibold text-sm leading-tight line-clamp-2">{data.title}</p>
        <p className="text-xs mt-0.5 opacity-80">
          {PROPERTY_TYPE_LABELS[data.type] ?? data.type} • {data.city}
        </p>
        <p className="text-sm font-bold mt-1">{formatCurrency(data.price)}</p>
      </div>
    </a>
  );
}

// ─── Reply quote ─────────────────────────────────────────────────────────────
function ReplyQuote({ msg, isMe }: { msg: any; isMe: boolean }) {
  const preview = msg.messageType === "PROPERTY_CARD"
    ? "🏠 Imóvel compartilhado"
    : msg.content.length > 60 ? msg.content.slice(0, 60) + "…" : msg.content;
  return (
    <div className={`rounded-lg px-2 py-1 mb-1 border-l-2 text-xs ${
      isMe
        ? "bg-blue-500 border-blue-200 text-blue-100"
        : "bg-gray-100 border-blue-400 text-gray-600"
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
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 px-2">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
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
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b">
        <p className="text-sm font-semibold text-gray-800">Compartilhar imóvel</p>
        <button onClick={onClose} className="p-0.5 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {data?.data?.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum imóvel disponível</p>
        )}
        {data?.data?.map((p: any) => (
          <button
            key={p.id}
            onClick={() => { onSelect(p); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition border-b"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {p.photos?.[0]
                ? <img src={p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                : <Home className="h-5 w-5 text-gray-400 m-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.title}</p>
              <p className="text-xs text-gray-500">{p.city}/{p.state}</p>
              <p className="text-xs font-semibold text-blue-600">{formatCurrency(p.price)}</p>
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
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Ping for online status ──────────────────────────────────────────────────
  useEffect(() => {
    const doPing = () => api.post("/users/ping").catch(() => {});
    doPing();
    const id = setInterval(doPing, 20_000);
    return () => clearInterval(id);
  }, []);

  // ── Conversations ───────────────────────────────────────────────────────────
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.get("/messages/conversations").then((r) => r.data),
    refetchInterval: 8_000,
  });

  // ── Auto-open from ?partner= ────────────────────────────────────────────────
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

  // ── Messages ────────────────────────────────────────────────────────────────
  const { data: messages } = useQuery({
    queryKey: ["messages", activeConversation?.partner?.id],
    queryFn: () => api.get(`/messages/${activeConversation.partner.id}`).then((r) => r.data),
    enabled: !!activeConversation?.partner?.id,
    refetchInterval: 3_000,
  });

  // ── Partner online status ───────────────────────────────────────────────────
  const { data: partnerStatus } = useQuery({
    queryKey: ["partner-status", activeConversation?.partner?.id],
    queryFn: () =>
      api.get(`/messages/${activeConversation.partner.id}/status`).then((r) => r.data),
    enabled: !!activeConversation?.partner?.id,
    refetchInterval: 15_000,
  });

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send ────────────────────────────────────────────────────────────────────
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
    sendMutation.mutate({
      content: text,
      messageType: "TEXT",
      replyToId: replyingTo?.id,
    });
  }, [message, replyingTo, sendMutation]);

  const handleSendProperty = (p: any) => {
    const content = JSON.stringify({
      id: p.id,
      title: p.title,
      type: p.type,
      price: Number(p.price),
      city: p.city,
      photo: p.photos?.[0] ?? null,
    });
    sendMutation.mutate({ content, messageType: "PROPERTY_CARD", replyToId: replyingTo?.id });
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  // ── Message grouping + date separators ─────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <Header title="Mensagens" />
      <div className="flex h-[calc(100vh-64px)]">

        {/* ── Conversations sidebar ── */}
        <div className={`border-r bg-white flex flex-col flex-shrink-0 w-full md:w-80 ${activeConversation ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Conversas</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!conversations?.length ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-blue-300" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Nenhuma conversa ainda</p>
                <p className="text-xs text-gray-400 mb-4">Encontre um corretor e inicie uma conversa.</p>
                <Link
                  href="/corretores"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="h-3.5 w-3.5" /> Buscar Corretores
                </Link>
              </div>
            ) : conversations.map((conv: any) => (
              <button
                key={conv.partner.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full p-4 text-left border-b hover:bg-gray-50 transition ${
                  activeConversation?.partner?.id === conv.partner.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={conv.partner.name} avatarUrl={conv.partner.avatarUrl} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-medium text-sm text-gray-900 truncate">{conv.partner.name}</p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? "font-medium text-gray-700" : "text-gray-400"}`}>
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
            <div className="px-4 py-3 border-b bg-white flex items-center gap-3 flex-shrink-0 shadow-sm">
              {/* Back button — mobile only */}
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar
                name={activeConversation.partner.name}
                avatarUrl={activeConversation.partner.avatarUrl}
                size={10}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 leading-tight">
                  {activeConversation.partner.name}
                </p>
                <div className="flex items-center gap-1.5">
                  {partnerStatus?.isOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {partnerStatus?.lastSeen
                        ? fmtLastSeen(partnerStatus.lastSeen)
                        : activeConversation.partner.agency || ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-0.5">
              {processedMessages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-xs mt-1">
                    Envie a primeira mensagem para {activeConversation.partner.name}
                  </p>
                </div>
              )}

              {processedMessages.map((item, idx) => {
                if (item.type === "sep") return <DateSep key={idx} label={item.label!} />;
                const msg = item.msg;
                const isMe = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 group ${isMe ? "justify-end" : "justify-start"} ${item.showAvatar ? "mt-3" : "mt-0.5"}`}
                  >
                    {/* Partner avatar */}
                    {!isMe && (
                      <div className="w-7 flex-shrink-0 self-end mb-1">
                        {item.showAvatar && (
                          <Avatar
                            name={activeConversation.partner.name}
                            avatarUrl={activeConversation.partner.avatarUrl}
                            size={7}
                          />
                        )}
                      </div>
                    )}

                    {/* Reply button (on hover) */}
                    {!isMe && (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-gray-200 self-center"
                        title="Responder"
                      >
                        <Reply className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[65%] rounded-2xl px-3 py-2 ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-white text-gray-900 shadow-sm rounded-bl-sm"
                      }`}
                    >
                      {/* Reply quote */}
                      {msg.replyTo && <ReplyQuote msg={msg.replyTo} isMe={isMe} />}

                      {/* Content */}
                      {msg.messageType === "PROPERTY_CARD"
                        ? <PropertyCardMsg content={msg.content} />
                        : <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      }

                      {/* Time + ticks */}
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        <span className={`text-[10px] ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                          {fmtTime(msg.createdAt)}
                        </span>
                        {isMe && <Ticks isRead={msg.isRead} />}
                      </div>
                    </div>

                    {/* Reply button my side */}
                    {isMe && (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-gray-200 self-center"
                        title="Responder"
                      >
                        <Reply className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="bg-white border-t flex-shrink-0">
              {/* Reply preview bar */}
              {replyingTo && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b">
                  <Reply className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-700">{replyingTo.sender?.name ?? "Você"}</p>
                    <p className="text-xs text-blue-600 truncate">
                      {replyingTo.messageType === "PROPERTY_CARD"
                        ? "🏠 Imóvel compartilhado"
                        : replyingTo.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-0.5 hover:bg-blue-100 rounded-full flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-blue-500" />
                  </button>
                </div>
              )}

              {/* Input row */}
              <div className="flex items-center gap-2 px-4 py-3 relative">
                {/* Emoji button */}
                <div className="relative">
                  <button
                    onClick={() => { setShowEmoji((v) => !v); setShowPropertyPicker(false); }}
                    className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500"
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

                {/* Property picker button */}
                <div className="relative">
                  <button
                    onClick={() => { setShowPropertyPicker((v) => !v); setShowEmoji(false); }}
                    className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500"
                    title="Compartilhar imóvel"
                  >
                    <Home className="h-5 w-5" />
                  </button>
                  {showPropertyPicker && (
                    <PropertyPicker
                      onSelect={handleSendProperty}
                      onClose={() => setShowPropertyPicker(false)}
                    />
                  )}
                </div>

                {/* Text input */}
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Mensagem..."
                  className="flex-1 rounded-full bg-gray-100 border-0 focus-visible:ring-1"
                />

                {/* Send */}
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending}
                  className="rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p className="font-medium">Selecione uma conversa</p>
              <p className="text-sm mt-1">ou vá em Corretores e clique em "Mensagem"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
