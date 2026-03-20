import { normalizePlan, getPlanLimits, isWithinLimit, PLAN_LIMITS } from './plans.config';

describe('plans.config', () => {

  // ─── normalizePlan ──────────────────────────────────────────────────────────

  describe('normalizePlan', () => {
    it('deve retornar cada plano válido corretamente', () => {
      expect(normalizePlan('free')).toBe('free');
      expect(normalizePlan('starter')).toBe('starter');
      expect(normalizePlan('pro')).toBe('pro');
      expect(normalizePlan('premium')).toBe('premium');
      expect(normalizePlan('agency')).toBe('agency');
    });

    it('deve resolver alias "professional" → "starter"', () => {
      expect(normalizePlan('professional')).toBe('starter');
    });

    it('deve resolver alias "basic" → "free"', () => {
      expect(normalizePlan('basic')).toBe('free');
    });

    it('deve resolver alias "enterprise" → "agency"', () => {
      expect(normalizePlan('enterprise')).toBe('agency');
    });

    it('deve retornar "free" para plano desconhecido', () => {
      expect(normalizePlan('invalido')).toBe('free');
      expect(normalizePlan('STARTER')).toBe('free'); // case-sensitive por design
      expect(normalizePlan('')).toBe('free');
    });
  });

  // ─── getPlanLimits ──────────────────────────────────────────────────────────

  describe('getPlanLimits', () => {
    it('free deve ter limite de 3 imóveis e 3 compradores', () => {
      const limits = getPlanLimits('free');
      expect(limits.maxProperties).toBe(3);
      expect(limits.maxBuyers).toBe(3);
    });

    it('starter deve ter limite de 20 imóveis e 30 compradores', () => {
      const limits = getPlanLimits('starter');
      expect(limits.maxProperties).toBe(20);
      expect(limits.maxBuyers).toBe(30);
    });

    it('pro, premium e agency devem ter recursos ilimitados (-1)', () => {
      for (const plan of ['pro', 'premium', 'agency']) {
        const limits = getPlanLimits(plan);
        expect(limits.maxProperties).toBe(-1);
        expect(limits.maxBuyers).toBe(-1);
      }
    });

    it('planos pagos devem ter feedPriority maior que free', () => {
      const free = getPlanLimits('free');
      for (const plan of ['starter', 'pro', 'premium', 'agency']) {
        expect(getPlanLimits(plan).feedPriority).toBeGreaterThan(free.feedPriority);
      }
    });

    it('deve retornar limites do free para plano desconhecido', () => {
      expect(getPlanLimits('plano-inexistente')).toEqual(PLAN_LIMITS.free);
    });
  });

  // ─── isWithinLimit ──────────────────────────────────────────────────────────

  describe('isWithinLimit', () => {
    it('deve retornar true quando max é -1 (ilimitado)', () => {
      expect(isWithinLimit(0, -1)).toBe(true);
      expect(isWithinLimit(9999, -1)).toBe(true);
    });

    it('deve retornar true quando abaixo do limite', () => {
      expect(isWithinLimit(0, 3)).toBe(true);
      expect(isWithinLimit(2, 3)).toBe(true);
    });

    it('deve retornar false quando atingiu o limite exato', () => {
      expect(isWithinLimit(3, 3)).toBe(false);
    });

    it('deve retornar false quando ultrapassou o limite', () => {
      expect(isWithinLimit(4, 3)).toBe(false);
    });
  });
});
