"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@imobmatch.com.br' },
        update: {},
        create: {
            name: 'Administrador ImobMatch',
            email: 'admin@imobmatch.com.br',
            password: adminPassword,
            phone: '(11) 99999-0000',
            city: 'São Paulo',
            state: 'SP',
            role: client_1.Role.ADMIN,
        },
    });
    const agentPassword = await bcrypt.hash('Agent@123', 10);
    const agent1 = await prisma.user.upsert({
        where: { email: 'corretor@imobmatch.com.br' },
        update: {},
        create: {
            name: 'João Silva',
            email: 'corretor@imobmatch.com.br',
            password: agentPassword,
            phone: '(11) 98765-4321',
            city: 'São Paulo',
            state: 'SP',
            agency: 'ImobMatch Imóveis',
            bio: 'Corretor especializado em imóveis residenciais na zona sul.',
        },
    });
    const agent2 = await prisma.user.upsert({
        where: { email: 'corretor2@imobmatch.com.br' },
        update: {},
        create: {
            name: 'Maria Santos',
            email: 'corretor2@imobmatch.com.br',
            password: agentPassword,
            phone: '(11) 91234-5678',
            city: 'Campinas',
            state: 'SP',
            agency: 'Santos Imóveis',
            bio: 'Especialista em imóveis comerciais e residenciais.',
        },
    });
    const property1 = await prisma.property.create({
        data: {
            title: 'Apartamento 3 quartos - Vila Madalena',
            type: client_1.PropertyType.APARTMENT,
            status: client_1.PropertyStatus.AVAILABLE,
            price: 850000,
            city: 'São Paulo',
            state: 'SP',
            neighborhood: 'Vila Madalena',
            bedrooms: 3,
            bathrooms: 2,
            parkingSpots: 2,
            areaM2: 95,
            description: 'Lindo apartamento reformado, próximo ao metrô, varanda gourmet, lazer completo.',
            agentId: agent1.id,
            isPublic: true,
        },
    });
    const property2 = await prisma.property.create({
        data: {
            title: 'Casa em condomínio - Alphaville',
            type: client_1.PropertyType.HOUSE,
            status: client_1.PropertyStatus.AVAILABLE,
            price: 1500000,
            city: 'Barueri',
            state: 'SP',
            neighborhood: 'Alphaville',
            bedrooms: 4,
            bathrooms: 3,
            parkingSpots: 3,
            areaM2: 280,
            description: 'Casa em condomínio fechado, piscina, churrasqueira, segurança 24h.',
            agentId: agent1.id,
            isPublic: true,
        },
    });
    const buyer1 = await prisma.buyer.create({
        data: {
            buyerName: 'Carlos Oliveira',
            email: 'carlos@email.com',
            phone: '(11) 99876-5432',
            desiredCity: 'São Paulo',
            desiredState: 'SP',
            desiredNeighborhood: 'Vila Madalena',
            maxPrice: 900000,
            propertyType: client_1.PropertyType.APARTMENT,
            bedrooms: 3,
            notes: 'Quer apartamento próximo ao metrô.',
            agentId: agent1.id,
        },
    });
    console.log('✅ Seed concluído com sucesso!');
    console.log('📧 Admin:', admin.email, '| Senha: Admin@123');
    console.log('📧 Corretor:', agent1.email, '| Senha: Agent@123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map