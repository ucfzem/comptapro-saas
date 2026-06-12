import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ComptaPro database...');

  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant-1' },
    update: {},
    create: {
      id: 'demo-tenant-1',
      name: 'Cabinet Dupont Expertises',
      siren: '123456789',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@comptapro.app' },
    update: {},
    create: {
      email: 'admin@comptapro.app',
      passwordHash: await bcrypt.hash('Admin123!', 12),
      name: 'Pierre Dupont',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const accounts = [
    { code: '101000', label: 'Capital social', type: 'EQUITY' as const },
    { code: '401000', label: 'Fournisseurs', type: 'LIABILITY' as const },
    { code: '411000', label: 'Clients', type: 'ASSET' as const },
    { code: '445660', label: 'TVA déductible', type: 'LIABILITY' as const },
    { code: '445710', label: 'TVA collectée', type: 'LIABILITY' as const },
    { code: '512000', label: 'Banque', type: 'ASSET' as const },
    { code: '606100', label: 'Énergie', type: 'EXPENSE' as const },
    { code: '606300', label: 'Carburant', type: 'EXPENSE' as const },
    { code: '606400', label: 'Fournitures administratives', type: 'EXPENSE' as const },
    { code: '613000', label: 'Loyers', type: 'EXPENSE' as const },
    { code: '622000', label: 'Honoraires', type: 'EXPENSE' as const },
    { code: '641000', label: 'Salaires', type: 'EXPENSE' as const },
    { code: '706000', label: 'Prestations de services', type: 'REVENUE' as const },
  ];

  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: acc.code } },
      update: {},
      create: { ...acc, tenantId: tenant.id },
    });
  }

  const client = await prisma.client.upsert({
    where: { id: 'demo-client-1' },
    update: {},
    create: {
      id: 'demo-client-1',
      name: 'Tech SARL',
      email: 'contact@tech-sarl.fr',
      siren: '987654321',
      tenantId: tenant.id,
    },
  });

  const entries = [
    { date: new Date('2024-01-15'), label: 'Facture prestation Tech SARL', debit: 0, credit: 5000.00, accountCode: '706000', clientId: client.id },
    { date: new Date('2024-01-15'), label: 'Client Tech SARL', debit: 5000.00, credit: 0, accountCode: '411000', clientId: client.id },
    { date: new Date('2024-02-01'), label: 'Achat fournitures bureau', debit: 1250.00, credit: 0, accountCode: '606400' },
    { date: new Date('2024-02-01'), label: 'Fournisseur B', debit: 0, credit: 1250.00, accountCode: '401000' },
    { date: new Date('2024-03-05'), label: 'Loyer local', debit: 2500.00, credit: 0, accountCode: '613000' },
    { date: new Date('2024-03-05'), label: 'Banque - loyer', debit: 0, credit: 2500.00, accountCode: '512000' },
  ];

  for (const entry of entries) {
    await prisma.journalEntry.create({
      data: {
        ...entry,
        tenantId: tenant.id,
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log(`   Tenant: ${tenant.name}`);
  console.log(`   Admin: admin@comptapro.app / Admin123!`);
  console.log(`   Accounts: ${accounts.length}`);
  console.log(`   Journal entries: ${entries.length}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
