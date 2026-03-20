import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeBuyer = (overrides: Record<string, any> = {}) => ({
  id:          'buyer-1',
  buyerName:   'Cliente Teste',
  desiredCity: 'Florianópolis',
  maxPrice:    500_000,
  propertyType: 'APARTMENT',
  bedrooms:    null,
  desiredNeighborhood: null,
  agentId:     'agent-1',
  status:      'ACTIVE',
  ...overrides,
});

const makeProperty = (overrides: Record<string, any> = {}) => ({
  id:          'property-1',
  title:       'Apartamento Teste',
  type:        'APARTMENT',
  city:        'Florianópolis',
  price:       400_000,
  bedrooms:    null,
  neighborhood: null,
  status:      'AVAILABLE',
  isPublic:    true,
  agentId:     'agent-2',
  ...overrides,
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MatchesService', () => {
  let service: MatchesService;

  const mockPrisma = {
    buyer:    { findMany: jest.fn(), findUnique: jest.fn() },
    property: { findMany: jest.fn(), findUnique: jest.fn() },
    match: {
      findMany:  jest.fn(),
      findUnique: jest.fn(),
      findFirst:  jest.fn(),
      create:    jest.fn(),
      update:    jest.fn(),
      count:     jest.fn(),
    },
    partnership: { findMany: jest.fn() },
  };

  const mockRanking = { addScore: jest.fn() };

  // Atalho para invocar o método privado em testes
  const score = (buyer: any, property: any): number =>
    (service as any).calculateScore(buyer, property);

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: PrismaService,  useValue: mockPrisma   },
        { provide: RankingService, useValue: mockRanking  },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  // ─── calculateScore — cidade ────────────────────────────────────────────────

  describe('calculateScore — cidade (peso 40)', () => {
    // Isola cidade: tipo diferente (HOUSE vs APARTMENT) + preço acima do budget → somente cidade pontua
    it('deve somar 40 pontos quando cidade é idêntica', () => {
      const buyer    = makeBuyer({ desiredCity: 'Florianópolis', propertyType: 'HOUSE', maxPrice: 100_000 });
      const property = makeProperty({ city: 'Florianópolis', type: 'APARTMENT', price: 200_000 }); // acima do budget
      expect(score(buyer, property)).toBe(40);
    });

    it('deve ser case-insensitive', () => {
      const buyer    = makeBuyer({ desiredCity: 'Florianópolis', propertyType: 'HOUSE', maxPrice: 100_000 });
      const property = makeProperty({ city: 'florianópolis', type: 'APARTMENT', price: 200_000 });
      expect(score(buyer, property)).toBe(40);
    });

    it('deve ignorar acentos na comparação', () => {
      const buyer    = makeBuyer({ desiredCity: 'São Paulo', propertyType: 'HOUSE', maxPrice: 100_000 });
      const property = makeProperty({ city: 'Sao Paulo', type: 'APARTMENT', price: 200_000 });
      expect(score(buyer, property)).toBe(40);
    });

    it('deve pontuar cidade por substring (cidade menor dentro da maior)', () => {
      const buyer    = makeBuyer({ desiredCity: 'Paulo', propertyType: 'HOUSE', maxPrice: 100_000 });
      const property = makeProperty({ city: 'São Paulo', type: 'APARTMENT', price: 200_000 });
      expect(score(buyer, property)).toBe(40);
    });

    it('deve retornar 0 para cidades sem relação', () => {
      const buyer    = makeBuyer({ desiredCity: 'Florianópolis', propertyType: 'HOUSE', maxPrice: 100_000 });
      const property = makeProperty({ city: 'Curitiba', type: 'APARTMENT', price: 200_000 });
      expect(score(buyer, property)).toBe(0);
    });
  });

  // ─── calculateScore — tipo de imóvel (peso 25) ──────────────────────────────

  describe('calculateScore — tipo de imóvel (peso 25)', () => {
    it('deve somar 25 pontos para tipo correto', () => {
      // Cidade diferente para isolar somente o tipo
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000 });
      const property = makeProperty({ city: 'Y', type: 'HOUSE', price: 200_000 });
      expect(score(buyer, property)).toBe(25);
    });

    it('deve não pontuar para tipo errado', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000 });
      expect(score(buyer, property)).toBe(0);
    });
  });

  // ─── calculateScore — preço (peso 25) ──────────────────────────────────────

  describe('calculateScore — preço (peso 25)', () => {
    it('deve dar 25 pontos quando preço está entre 80–100% do orçamento', () => {
      // Cidade e tipo diferentes para isolar preço
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 500_000 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 450_000 }); // 90%
      expect(score(buyer, property)).toBe(25);
    });

    it('deve dar 25 pontos no exato limite de 80%', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 500_000 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 400_000 }); // 80%
      expect(score(buyer, property)).toBe(25);
    });

    it('deve dar 15 pontos quando preço está entre 50–79% do orçamento', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 500_000 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 300_000 }); // 60%
      expect(score(buyer, property)).toBe(15);
    });

    it('deve dar 8 pontos quando preço está abaixo de 50% do orçamento', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 500_000 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 100_000 }); // 20%
      expect(score(buyer, property)).toBe(8);
    });

    it('deve dar 0 pontos quando preço está acima do orçamento', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 300_000 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 400_000 }); // acima
      expect(score(buyer, property)).toBe(0);
    });
  });

  // ─── calculateScore — quartos (peso 10) ────────────────────────────────────

  describe('calculateScore — quartos (peso 10)', () => {
    it('deve somar 10 pontos quando imóvel tem exatamente os quartos desejados', () => {
      // Isolar: cidade diff, tipo diff, preço acima do budget → só quartos
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000, bedrooms: 3 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000, bedrooms: 3 });
      expect(score(buyer, property)).toBe(10);
    });

    it('deve somar 10 pontos quando imóvel tem mais quartos que o mínimo', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000, bedrooms: 2 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000, bedrooms: 4 });
      expect(score(buyer, property)).toBe(10);
    });

    it('deve somar 5 pontos quando imóvel tem exatamente 1 quarto a menos', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000, bedrooms: 3 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000, bedrooms: 2 });
      expect(score(buyer, property)).toBe(5);
    });

    it('deve dar 0 pontos quando imóvel tem 2 ou mais quartos a menos', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000, bedrooms: 4 });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000, bedrooms: 1 });
      expect(score(buyer, property)).toBe(0);
    });

    it('não deve pontuar quartos quando comprador não especificou', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000, bedrooms: null });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000, bedrooms: 3 });
      expect(score(buyer, property)).toBe(0);
    });
  });

  // ─── calculateScore — bairro (bônus 10) ────────────────────────────────────

  describe('calculateScore — bairro (bônus 10)', () => {
    it('deve somar 10 pontos quando bairro coincide', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000, desiredNeighborhood: 'Jardins' });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000, neighborhood: 'Jardins' });
      expect(score(buyer, property)).toBe(10);
    });

    it('deve ser case-insensitive e ignorar acentos no bairro', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000, desiredNeighborhood: 'Jardim São Paulo' });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000, neighborhood: 'jardim sao paulo' });
      expect(score(buyer, property)).toBe(10);
    });

    it('não deve pontuar bairro quando comprador não especificou', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 100_000, desiredNeighborhood: null });
      const property = makeProperty({ city: 'Y', type: 'APARTMENT', price: 200_000, neighborhood: 'Jardins' });
      expect(score(buyer, property)).toBe(0);
    });
  });

  // ─── calculateScore — combinações e limites ─────────────────────────────────

  describe('calculateScore — combinações e teto', () => {
    it('deve somar corretamente cidade + tipo + preço', () => {
      const buyer    = makeBuyer({ desiredCity: 'Florianópolis', propertyType: 'APARTMENT', maxPrice: 500_000 });
      const property = makeProperty({ city: 'Florianópolis', type: 'APARTMENT', price: 450_000 });
      // cidade(40) + tipo(25) + preço-ideal(25) = 90
      expect(score(buyer, property)).toBe(90);
    });

    it('deve atingir 100 pontos com todos os critérios perfeitos', () => {
      const buyer    = makeBuyer({ desiredCity: 'Florianópolis', propertyType: 'APARTMENT', maxPrice: 500_000, bedrooms: 2, desiredNeighborhood: 'Trindade' });
      const property = makeProperty({ city: 'Florianópolis', type: 'APARTMENT', price: 450_000, bedrooms: 3, neighborhood: 'Trindade' });
      // cidade(40) + tipo(25) + preço-ideal(25) + quartos(10) + bairro(10) = 110 → capped 100
      expect(score(buyer, property)).toBe(100);
    });

    it('não deve ultrapassar 100 pontos mesmo com todos os bônus', () => {
      const buyer    = makeBuyer({ desiredCity: 'X', propertyType: 'HOUSE', maxPrice: 500_000, bedrooms: 2, desiredNeighborhood: 'Centro' });
      const property = makeProperty({ city: 'X', type: 'HOUSE', price: 490_000, bedrooms: 4, neighborhood: 'Centro' });
      expect(score(buyer, property)).toBeLessThanOrEqual(100);
    });

    it('deve retornar 0 quando nenhum critério é atendido', () => {
      const buyer    = makeBuyer({ desiredCity: 'Florianópolis', propertyType: 'HOUSE', maxPrice: 100_000 });
      const property = makeProperty({ city: 'Curitiba', type: 'APARTMENT', price: 500_000 });
      expect(score(buyer, property)).toBe(0);
    });
  });

  // ─── updateMatchStatus — ranking ──────────────────────────────────────────

  describe('updateMatchStatus — pontuação ao fechar negócio', () => {
    it('deve adicionar 50 pontos para ambos os corretores ao fechar negócio', async () => {
      const match = {
        id:       'match-1',
        buyer:    { agentId: 'agent-buyer'    },
        property: { agentId: 'agent-property' },
      };
      mockPrisma.match.findFirst.mockResolvedValue(match);
      mockPrisma.match.update.mockResolvedValue({ ...match, status: 'CLOSED' });

      await service.updateMatchStatus('match-1', 'CLOSED', 'agent-buyer');

      expect(mockRanking.addScore).toHaveBeenCalledWith('agent-buyer',    50, 'dealsClosedCount');
      expect(mockRanking.addScore).toHaveBeenCalledWith('agent-property', 50, 'dealsClosedCount');
    });

    it('não deve duplicar pontos quando buyer e property são do mesmo corretor', async () => {
      const match = {
        id:       'match-2',
        buyer:    { agentId: 'agent-1' },
        property: { agentId: 'agent-1' }, // mesmo corretor
      };
      mockPrisma.match.findFirst.mockResolvedValue(match);
      mockPrisma.match.update.mockResolvedValue({ ...match, status: 'CLOSED' });

      await service.updateMatchStatus('match-2', 'CLOSED', 'agent-1');

      // addScore deve ser chamado apenas uma vez
      expect(mockRanking.addScore).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar addScore para status diferentes de CLOSED', async () => {
      const match = {
        id:       'match-3',
        buyer:    { agentId: 'agent-buyer'    },
        property: { agentId: 'agent-property' },
      };
      mockPrisma.match.findFirst.mockResolvedValue(match);
      mockPrisma.match.update.mockResolvedValue({ ...match, status: 'CONTACTED' });

      await service.updateMatchStatus('match-3', 'CONTACTED', 'agent-buyer');

      expect(mockRanking.addScore).not.toHaveBeenCalled();
    });
  });
});
