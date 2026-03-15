export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  highlighted: boolean;
  badge?: string;
  features: PlanFeature[];
  cta: string;
  // Preparado para futura integração com gateway de pagamento
  priceId?: string; // Stripe price ID (future)
  paymentLink?: string; // Link direto de pagamento (future)
}

export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 59,
    description: 'Ideal para corretores autônomos começando a organizar sua carteira.',
    highlighted: false,
    features: [
      { text: 'Até 20 imóveis cadastrados', included: true },
      { text: 'Até 30 compradores', included: true },
      { text: 'Matching básico automático', included: true },
      { text: 'Dashboard de gestão', included: true },
      { text: 'Importação de imóveis por link', included: true },
      { text: 'Matching avançado com score', included: false },
      { text: 'Sistema de parcerias', included: false },
      { text: 'Analytics e relatórios', included: false },
      { text: 'Multi-corretor / equipe', included: false },
    ],
    cta: 'Iniciar teste grátis',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    description: 'Para corretores ativos que querem fechar mais negócios.',
    highlighted: true,
    badge: 'Mais popular',
    features: [
      { text: 'Imóveis ilimitados', included: true },
      { text: 'Compradores ilimitados', included: true },
      { text: 'Matching básico automático', included: true },
      { text: 'Dashboard de gestão', included: true },
      { text: 'Importação de imóveis por link', included: true },
      { text: 'Matching avançado com score', included: true },
      { text: 'Sistema de parcerias', included: true },
      { text: 'Analytics e relatórios', included: true },
      { text: 'Multi-corretor / equipe', included: false },
    ],
    cta: 'Iniciar teste grátis',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 399,
    description: 'Para imobiliárias e equipes que precisam de escala.',
    highlighted: false,
    features: [
      { text: 'Imóveis ilimitados', included: true },
      { text: 'Compradores ilimitados', included: true },
      { text: 'Matching básico automático', included: true },
      { text: 'Dashboard de gestão', included: true },
      { text: 'Importação de imóveis por link', included: true },
      { text: 'Matching avançado com score', included: true },
      { text: 'Sistema de parcerias', included: true },
      { text: 'Analytics e relatórios avançados', included: true },
      { text: 'Multi-corretor / gestão de equipe', included: true },
    ],
    cta: 'Iniciar teste grátis',
  },
];

export const TRIAL_DAYS = 14;
