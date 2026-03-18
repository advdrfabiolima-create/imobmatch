export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number | null;   // null = grátis
  priceAnnual: number | null;
  description: string;
  highlighted: boolean;
  badge?: string;
  features: PlanFeature[];
  cta: string;
  color: 'gray' | 'blue' | 'indigo' | 'violet' | 'purple';
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    priceAnnual: null,
    description: 'Para conhecer a plataforma e testar o básico',
    highlighted: false,
    color: 'gray',
    cta: 'Criar conta grátis',
    features: [
      { text: 'Até 3 imóveis',                        included: true  },
      { text: 'Até 3 compradores',                    included: true  },
      { text: 'Acesso ao feed da rede',               included: true  },
      { text: 'Radar de oportunidades (limitado)',    included: true  },
      { text: 'Matching básico',                      included: true  },
      { text: 'Parcerias liberadas',                  included: true  },
      { text: 'Mensagens liberadas',                  included: true  },
      { text: 'Matching automático',                  included: false },
      { text: 'Destaque nas listagens',               included: false },
      { text: 'Analytics e relatórios',               included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 39,
    priceAnnual: 390,
    description: 'Para corretores que querem parar de perder clientes',
    highlighted: true,
    badge: 'Mais escolhido para começar',
    color: 'blue',
    cta: 'Começar a gerar oportunidades',
    features: [
      { text: 'Até 20 imóveis',                       included: true  },
      { text: 'Até 30 compradores',                   included: true  },
      { text: 'Acesso completo ao feed',              included: true  },
      { text: 'Radar de oportunidades completo',      included: true  },
      { text: 'Matching automático',                  included: true  },
      { text: 'Parcerias ilimitadas',                 included: true  },
      { text: 'Mensagens liberadas',                  included: true  },
      { text: 'Destaque leve nas listagens',          included: true  },
      { text: 'Analytics e relatórios',               included: false },
      { text: 'Badge Corretor Profissional',          included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    priceAnnual: 790,
    description: 'Para quem quer fechar mais negócios com consistência',
    highlighted: false,
    color: 'indigo',
    cta: 'Quero mais visibilidade',
    features: [
      { text: 'Imóveis ilimitados',                   included: true  },
      { text: 'Compradores ilimitados',               included: true  },
      { text: 'Prioridade no algoritmo de match',     included: true  },
      { text: 'Maior visibilidade no feed',           included: true  },
      { text: 'Destaque em oportunidades',            included: true  },
      { text: 'Badge Corretor Profissional',          included: true  },
      { text: 'Analytics e relatórios',               included: true  },
      { text: 'Parcerias ilimitadas',                 included: true  },
      { text: 'Gestão de equipe',                     included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 149,
    priceAnnual: 1490,
    description: 'Para quem quer máxima visibilidade e prioridade',
    highlighted: false,
    color: 'violet',
    cta: 'Quero prioridade total',
    features: [
      { text: 'Tudo do plano Pro',                    included: true  },
      { text: 'Prioridade máxima no algoritmo',       included: true  },
      { text: 'Destaque forte no feed',               included: true  },
      { text: 'Destaque no ranking',                  included: true  },
      { text: 'Analytics avançado',                   included: true  },
      { text: 'Maior exposição em oportunidades',     included: true  },
      { text: 'Gestão de equipe',                     included: false },
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 399,
    priceAnnual: 3990,
    description: 'Para imobiliárias e equipes que querem escalar operações',
    highlighted: false,
    color: 'purple',
    cta: 'Quero escalar minha equipe',
    features: [
      { text: 'Tudo do plano Premium',               included: true  },
      { text: 'Multiusuário (equipe)',                included: true  },
      { text: 'Gestão de corretores',                 included: true  },
      { text: 'Permissões por usuário',               included: true  },
      { text: 'Dashboard avançado de equipe',         included: true  },
      { text: 'Analytics completo',                   included: true  },
    ],
  },
];

const PLAN_ALIASES: Record<string, string> = {
  professional: 'starter',
  basic:        'free',
  enterprise:   'agency',
};

export function normalizePlan(plan: string): string {
  const aliased = PLAN_ALIASES[plan] ?? plan;
  return PLANS.find(p => p.id === aliased) ? aliased : 'free';
}

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find(p => p.id === normalizePlan(id));
}

export function formatPlanPrice(plan: Plan): string {
  if (plan.price === null) return 'Grátis';
  return `R$ ${plan.price}`;
}

// Cores por plano para uso nos componentes
export const PLAN_COLORS: Record<string, {
  ring: string; text: string; btn: string; iconBg: string; badge: string;
}> = {
  free:    { ring: 'ring-gray-200',   text: 'text-gray-600',   btn: 'bg-gray-800 hover:bg-gray-700',     iconBg: 'bg-gray-100',   badge: 'bg-gray-100 text-gray-700'    },
  starter: { ring: 'ring-blue-400',   text: 'text-blue-600',   btn: 'bg-blue-600 hover:bg-blue-700',     iconBg: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-700'    },
  pro:     { ring: 'ring-indigo-500', text: 'text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700', iconBg: 'bg-indigo-50',  badge: 'bg-indigo-100 text-indigo-700' },
  premium: { ring: 'ring-violet-500', text: 'text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700', iconBg: 'bg-violet-50',  badge: 'bg-violet-100 text-violet-700' },
  agency:  { ring: 'ring-purple-500', text: 'text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700', iconBg: 'bg-purple-50',  badge: 'bg-purple-100 text-purple-700' },
};
