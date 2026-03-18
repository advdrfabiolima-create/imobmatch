"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpgradeStore } from "@/store/upgrade.store";

export function UpgradeModal() {
  const { isOpen, message, open, close } = useUpgradeStore();
  const router = useRouter();

  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      open(msg);
    };
    window.addEventListener("upgrade-required", handler);
    return () => window.removeEventListener("upgrade-required", handler);
  }, [open]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    close();
    router.push("/meu-plano");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <span className="bg-orange-100 p-2 rounded-xl">
              <Lock className="h-5 w-5 text-orange-600" />
            </span>
            <h2 className="font-semibold text-gray-900">Limite do plano atingido</h2>
          </div>
          <button onClick={close} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
            <p className="text-sm font-medium text-blue-900 mb-3">Faça upgrade e desbloqueie:</p>
            <ul className="space-y-1.5 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                Mais imóveis e compradores cadastrados
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                Matching automático com prioridade
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                Maior visibilidade no feed e ranking
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={close}>
              Agora não
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={handleUpgrade}
            >
              <Zap className="h-4 w-4" />
              Ver planos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
