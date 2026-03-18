"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Trophy, Medal, Star, UserCheck, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

type AgentLevel = "Gold" | "Silver" | "Bronze";

const LEVEL_CONFIG: Record<AgentLevel, { label: string; emoji: string; bg: string; text: string; border: string }> = {
  Gold:   { label: "Gold",   emoji: "🥇", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" },
  Silver: { label: "Silver", emoji: "🥈", bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-300"   },
  Bronze: { label: "Bronze", emoji: "🥉", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
};

function getLevel(score: number): AgentLevel {
  if (score >= 200) return "Gold";
  if (score >= 80)  return "Silver";
  return "Bronze";
}

function ScoreBadge({ score }: { score: number }) {
  const level = getLevel(score);
  const cfg = LEVEL_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
  return <span className="text-sm font-bold text-gray-400 w-5 text-center">{rank}</span>;
}

export default function RankingPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => api.get("/ranking?limit=50").then(r => r.data),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const agents = data?.data ?? [];

  // Stats summary
  const goldCount   = agents.filter((a: any) => getLevel(a.score) === "Gold").length;
  const silverCount = agents.filter((a: any) => getLevel(a.score) === "Silver").length;
  const bronzeCount = agents.filter((a: any) => getLevel(a.score) === "Bronze").length;

  return (
    <div>
      <Header title="Ranking de Corretores" />

      <div className="p-4 md:p-6">
        {/* Info card */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="font-semibold text-gray-900">Sistema de Reputação</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Parceria aceita</p>
              <p className="font-bold text-green-700">+10 pts</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Negócio fechado</p>
              <p className="font-bold text-blue-700">+50 pts</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Feedback positivo</p>
              <p className="font-bold text-purple-700">+20 pts</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-sm justify-center">
            <span className="flex items-center gap-1.5">🥉 Bronze <span className="text-gray-400">&lt;80</span></span>
            <span className="flex items-center gap-1.5">🥈 Silver <span className="text-gray-400">80–199</span></span>
            <span className="flex items-center gap-1.5">🥇 Gold <span className="text-gray-400">200+</span></span>
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Gold", count: goldCount, emoji: "🥇", color: "text-yellow-600" },
            { label: "Silver", count: silverCount, emoji: "🥈", color: "text-gray-500" },
            { label: "Bronze", count: bronzeCount, emoji: "🥉", color: "text-orange-600" },
          ].map(item => (
            <Card key={item.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl mb-1">{item.emoji}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.count}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent: any) => {
              const isMe = agent.id === user?.id;
              return (
                <Card
                  key={agent.id}
                  className={`transition-shadow hover:shadow-sm ${isMe ? "ring-2 ring-blue-400" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        <RankMedal rank={agent.rank} />
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm overflow-hidden flex-shrink-0">
                        {agent.avatarUrl
                          ? <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                          : agent.name?.charAt(0).toUpperCase()
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {agent.name}
                            {isMe && <span className="ml-1 text-blue-600 text-xs">(você)</span>}
                          </p>
                          <ScoreBadge score={agent.score} />
                        </div>
                        <p className="text-xs text-gray-500 truncate">{agent.agency} · {agent.city}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <UserCheck className="h-3 w-3" />
                            {agent.partnershipsCount} parcerias
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <CheckCircle2 className="h-3 w-3" />
                            {agent.dealsClosedCount} negócios
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">{agent.score}</p>
                        <p className="text-xs text-gray-400">pontos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {agents.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ranking vazio</h3>
            <p className="text-gray-500">Feche parcerias para subir no ranking!</p>
          </div>
        )}
      </div>
    </div>
  );
}
