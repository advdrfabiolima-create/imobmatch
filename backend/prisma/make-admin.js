/**
 * Script para promover um usuário a ADMIN.
 * Uso: node prisma/make-admin.js adv.drfabio@hotmail.com
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const email  = process.argv[2];

if (!email) {
  console.error('Uso: node prisma/make-admin.js <email>');
  process.exit(1);
}

async function run() {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`Usuário não encontrado: ${email}`);
    process.exit(1);
  }

  if (user.role === 'ADMIN') {
    console.log(`${email} já é ADMIN.`);
    return;
  }

  await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
  console.log(`✅ ${user.name} (${email}) agora é ADMIN.`);
}

run()
  .catch(e => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
