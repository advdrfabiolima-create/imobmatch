"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Trophy, Medal, UserCheck, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { AgentAvatar } from "@/components/ui/agent-avatar";

type AgentLevel = "Gold" | "Silver" | "Bronze";

const LEVEL_CONFIG: Record<AgentLevel, {
  label: string; emoji: string;
  bg: string; text: string; border: string;
  bar: string; next: number | null; prev: number;
}> = {
  Gold:   { label: "Gold",   emoji: "🥇", bg: "bg-amber-500/15",  text: "text-amber-300",  border: "border-amber-500/30",  bar: "from-amber-400 to-amber-500",  next: null, prev: 200 },
  Silver: { label: "Silver", emoji: "🥈", bg: "bg-slate-400/10",  text: "text-slate-300",  border: "border-slate-400/30",  bar: "from-slate-400 to-slate-300",  next: 200,  prev: 80  },
  Bronze: { label: "Bronze", emoji: "🥉", bg: "bg-orange-500/15", text: "text-orange-300", border: "border-orange-500/30", bar: "from-orange-400 to-orange-500", next: 80,   prev: 0   },
};

function getLevel(score: number): AgentLevel {
  if (score >= 200) return "Gold";
  if (score >= 80)  return "Silver";
  return "Bronze";
}

function LevelProgress({ score }: { score: number }) {
  const level = getLevel(score);
  const cfg = LEVEL_CONFIG[level];

  if (!cfg.next) {
    return (
      <div className="mt-1.5">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[10px] text-amber-400 font-semibold">Nível máximo atingido!</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-full" />
        </div>
      </div>
    );
  }

  const range    = cfg.next - cfg.prev;
  const progress = Math.min(100, Math.round(((score - cfg.prev) / range) * 100));
  const nextLabel = cfg.next === 80 ? "🥈 Silver" : "🥇 Gold";
  const remaining = cfg.next - score;

  return (
    <div className="mt-1.5">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[10px] text-muted-foreground">→ {nextLabel}</span>
        <span className="text-[10px] text-muted-foreground/70">{remaining} pts restantes</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${cfg.bar} rounded-full transition-all duration-700`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function AchievementBadges({ agent }: { agent: any }) {
  const badges = [
    { key: "match",       earned: (agent.matchesCount ?? 0) > 0,       emoji: "⚡", label: "Primeiro Match"    },
    { key: "partnership", earned: (agent.partnershipsCount ?? 0) > 0,  emoji: "🤝", label: "1ª Parceria"       },
    { key: "deal",        earned: (agent.dealsClosedCount ?? 0) > 0,   emoji: "💰", label: "Negócio Fechado"   },
  ];
  return (
    <div className="flex items-center gap-1 mt-1">
      {badges.map(b => (
        <span key={b.key} title={b.label}
          className={`text-sm transition-all ${b.earned ? "opacity-100" : "opacity-20 grayscale"}`}>
          {b.emoji}
        </span>
      ))}
    </div>
  );
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
  if (rank === 1) return <Trophy className="h-5 w-5 text-amber-400" />;
  if (rank === 2) return <Medal  className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal  className="h-5 w-5 text-orange-400" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
}

export default function RankingPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => api.get("/ranking?limit=50").then(r => r.data),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const agents      = data?.data ?? [];
  const goldCount   = agents.filter((a: any) => getLevel(a.score) === "Gold").length;
  const silverCount = agents.filter((a: any) => getLevel(a.score) === "Silver").length;
  const bronzeCount = agents.filter((a: any) => getLevel(a.score) === "Bronze").length;
  const myAgent     = agents.find((a: any) => a.id === user?.id);

  return (
    <div>
      <Header title="Ranking de Corretores" />

      <div className="p-4 md:p-6">

        {/* Info card — dark premium */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="font-semibold text-foreground">Sistema de Reputação</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Parceria aceita</p>
              <p className="font-bold text-emerald-400">+10 pts</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Imóvel alugado</p>
              <p className="font-bold text-orange-400">+20 pts</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Negócio fechado / vendido</p>
              <p className="font-bold text-blue-400">+50 pts</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-sm justify-center flex-wrap text-foreground/70">
            <span className="flex items-center gap-1.5">🥉 Bronze <span className="text-muted-foreground">&lt;80</span></span>
            <span className="flex items-center gap-1.5">🥈 Silver <span className="text-muted-foreground">80–199</span></span>
            <span className="flex items-center gap-1.5">🥇 Gold <span className="text-muted-foreground">200+</span></span>
          </div>
        </div>

        {/* My position highlight */}
        {myAgent && (
          <div className="bg-gradient-to-r from-indigo-600/80 to-violet-600/80 border border-border text-white rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AgentAvatar
              name={myAgent.name} avatarUrl={myAgent.avatarUrl} score={myAgent.score}
              size="md" fallbackClassName="bg-white/20 text-white"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Sua posição: #{myAgent.rank}</p>
              <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                {(() => {
                  const level = getLevel(myAgent.score);
                  const cfg = LEVEL_CONFIG[level];
                  const range = (cfg.next ?? myAgent.score) - cfg.prev || 1;
                  const pct = cfg.next ? Math.min(100, Math.round(((myAgent.score - cfg.prev) / range) * 100)) : 100;
                  return <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />;
                })()}
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                {myAgent.score} pts · {LEVEL_CONFIG[getLevel(myAgent.score)].emoji} {getLevel(myAgent.score)}
                {LEVEL_CONFIG[getLevel(myAgent.score)].next
                  ? ` · ${LEVEL_CONFIG[getLevel(myAgent.score)].next! - myAgent.score} pts para próximo nível`
                  : " · Nível máximo!"}
              </p>
            </div>
          </div>
        )}

        {/* Level counters */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Gold",   count: goldCount,   emoji: "🥇", style: "bg-amber-500/15 text-amber-300 border-amber-500/20"    },
            { label: "Silver", count: silverCount, emoji: "🥈", style: "bg-slate-400/10 text-slate-300 border-slate-400/20"    },
            { label: "Bronze", count: bronzeCount, emoji: "🥉", style: "bg-orange-500/15 text-orange-300 border-orange-500/20" },
          ].map(item => (
            <Card key={item.label} className={`border ${item.style}`}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl mb-1">{item.emoji}</p>
                <p className="text-xl font-bold">{item.count}</p>
                <p className="text-xs opacity-70">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievement legend */}
        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-2.5">
          <span className="font-medium text-foreground/70">Conquistas:</span>
          <span>⚡ Primeiro Match</span>
          <span>🤝 1ª Parceria</span>
          <span>💰 Negócio Fechado</span>
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent: any) => {
              const isMe = agent.id === user?.id;
              return (
                <Card
                  key={agent.id}
                  className={`transition-all ${isMe ? "ring-2 ring-primary/40 bg-primary/5" : "hover:border-border"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 flex items-center justify-center flex-shrink-0 mt-1">
                        <RankMedal rank={agent.rank} />
                      </div>
                      <AgentAvatar name={agent.name} avatarUrl={agent.avatarUrl} score={agent.score} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {agent.name}
                            {isMe && <span className="ml-1 text-primary/80 text-xs">(você)</span>}
                          </p>
                          <ScoreBadge score={agent.score} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{agent.agency} · {agent.city}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <UserCheck className="h-3 w-3" /> {agent.partnershipsCount} parcerias
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" /> {agent.dealsClosedCount} negócios
                          </span>
                        </div>
                        <AchievementBadges agent={agent} />
                        <LevelProgress score={agent.score} />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-foreground">{agent.score}</p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {agents.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ranking vazio</h3>
            <p className="text-muted-foreground">Feche parcerias para subir no ranking!</p>
          </div>
        )}
      </div>
    </div>
  );
}
