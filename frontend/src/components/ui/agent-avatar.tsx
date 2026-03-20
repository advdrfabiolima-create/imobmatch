import { cn } from "@/lib/utils";

type Level = "Gold" | "Silver" | "Bronze";

function getLevel(score: number): Level {
  if (score >= 200) return "Gold";
  if (score >= 80)  return "Silver";
  return "Bronze";
}

const BADGE: Record<Level, { emoji: string; bg: string; title: string }> = {
  Gold:   { emoji: "🥇", bg: "bg-yellow-400", title: "Gold — 200+ pts"  },
  Silver: { emoji: "🥈", bg: "bg-gray-300",   title: "Silver — 80+ pts" },
  Bronze: { emoji: "🥉", bg: "bg-orange-300", title: "Bronze"           },
};

const SIZE = {
  sm: { avatar: "w-8  h-8",  text: "text-xs",   badge: "w-4 h-4 text-[9px]  -bottom-2 -right-2" },
  md: { avatar: "w-10 h-10", text: "text-sm",   badge: "w-5 h-5 text-[11px] -bottom-2 -right-2" },
  lg: { avatar: "w-12 h-12", text: "text-base", badge: "w-6 h-6 text-sm     -bottom-2 -right-2" },
};

interface Props {
  name: string;
  avatarUrl?: string | null;
  /** Pontuação de ranking. Sem score = sem selo. */
  score?: number | null;
  size?: keyof typeof SIZE;
  /** Classes extras no container do avatar (ex: cores do fallback) */
  fallbackClassName?: string;
  className?: string;
}

export function AgentAvatar({
  name,
  avatarUrl,
  score,
  size = "md",
  fallbackClassName = "bg-blue-100 text-blue-600",
  className,
}: Props) {
  const s = SIZE[size];
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  const showBadge = score != null && score >= 0;
  const level = showBadge ? getLevel(score!) : null;
  const badge = level ? BADGE[level] : null;

  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      {/* Avatar */}
      <div
        className={cn(
          s.avatar,
          s.text,
          "rounded-full flex items-center justify-center font-bold overflow-hidden",
          fallbackClassName,
        )}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>

      {/* Selo de ranking */}
      {badge && (
        <span
          title={badge.title}
          className={cn(
            "absolute flex items-center justify-center rounded-full border-2 border-white shadow-sm leading-none",
            s.badge,
            badge.bg,
          )}
        >
          {badge.emoji}
        </span>
      )}
    </div>
  );
}
