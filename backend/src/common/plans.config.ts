export type PlanType = 'free' | 'starter' | 'pro' | 'premium' | 'agency';

export interface PlanLimits {
  maxProperties: number;  // -1 = ilimitado
  maxBuyers: number;      // -1 = ilimitado
  feedPriority: number;   // maior = aparece antes no feed/listagens
  matchWeight: number;    // multiplicador no algoritmo de match
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free:    { maxProperties: 3,  maxBuyers: 3,  feedPriority: 0, matchWeight: 1 },
  starter: { maxProperties: 20, maxBuyers: 30, feedPriority: 1, matchWeight: 2 },
  pro:     { maxProperties: -1, maxBuyers: -1, feedPriority: 2, matchWeight: 3 },
  premium: { maxProperties: -1, maxBuyers: -1, feedPriority: 3, matchWeight: 4 },
  agency:  { maxProperties: -1, maxBuyers: -1, feedPriority: 3, matchWeight: 4 },
};

// Aliases para nomes de planos antigos ou variações
const PLAN_ALIASES: Record<string, PlanType> = {
  professional: 'starter',
  basic:        'free',
  enterprise:   'agency',
};

export function getPlanLimits(plan: string): PlanLimits {
  const normalized = (PLAN_ALIASES[plan] ?? plan) as PlanType;
  return PLAN_LIMITS[normalized] ?? PLAN_LIMITS.free;
}

export function isWithinLimit(current: number, max: number): boolean {
  return max === -1 || current < max;
}
