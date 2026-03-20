"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X, MessageSquarePlus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: Props) {
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: () => api.post("/feedback", { message }),
    onSuccess: () => {
      toast.success("Feedback enviado! Obrigado pela sua contribuição 🙏");
      onClose();
    },
    onError: () => toast.error("Erro ao enviar. Tente novamente."),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquarePlus className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Enviar Feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 mb-4 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
            <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 leading-relaxed">
              Sua opinião é muito importante para nós e valorizamos a sua ideia.
              Escreva aqui o que você acha que deve melhorar na plataforma ImobMatch
              ou sugira alguma implementação.
            </p>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Descreva sua sugestão ou melhoria..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{message.length} caracteres</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => send.mutate()}
            disabled={message.trim().length < 10 || send.isPending}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <MessageSquarePlus className="h-4 w-4" />
            {send.isPending ? "Enviando..." : "Enviar Feedback"}
          </Button>
        </div>
      </div>
    </div>
  );
}
