import { prisma } from '@/lib/prisma';

const FEC_HEADERS = [
  'JournalCode',
  'JournalLib',
  'EcritureNum',
  'EcritureDate',
  'CompteNum',
  'CompteLib',
  'PieceNum',
  'EcritureLib',
  'Debit',
  'Credit',
  'EcritureLet',
  'DateLet',
  'ValidDate',
  'Montantdevise',
  'Iodevise',
].join(';');

const ACCOUNT_LABELS: Record<string, string> = {
  '442000': 'Organismes sociaux',
  '606100': 'Énergie',
  '606300': 'Carburant',
  '606400': 'Fournitures administratives',
};

function formatFECDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function escapeFECField(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export type FECOptions = {
  siren: string;
};

export async function generateFEC(
  tenantId: string,
  fiscalYear: number,
  options: FECOptions
): Promise<string> {
  const yearStart = new Date(`${fiscalYear}-01-01T00:00:00Z`);
  const yearEnd = new Date(`${fiscalYear + 1}-01-01T00:00:00Z`);

  const entries = await prisma.journalEntry.findMany({
    where: {
      tenantId,
      date: { gte: yearStart, lt: yearEnd },
    },
    orderBy: [{ date: 'asc' }, { pieceNumber: 'asc' }],
  });

  if (entries.length === 0) {
    throw new Error(`No journal entries found for fiscal year ${fiscalYear}`);
  }

  const totalDebit = entries.reduce(
    (sum, e) => sum + (e.debit as unknown as number),
    0
  );
  const totalCredit = entries.reduce(
    (sum, e) => sum + (e.credit as unknown as number),
    0
  );

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(
      `FEC validation failed: total debit (${totalDebit}) does not equal total credit (${totalCredit})`
    );
  }

  const headerLine = `FEC|${options.siren}|${fiscalYear}0101`;

  const lines = [headerLine, FEC_HEADERS];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const debit = entry.debit as unknown as number;
    const credit = entry.credit as unknown as number;
    const date = entry.date as unknown as Date;
    const accountCode = entry.accountCode;
    const accountLabel =
      ACCOUNT_LABELS[accountCode] ?? `Compte ${accountCode}`;

    const row = [
      escapeFECField(entry.journalCode ?? 'VT'),
      escapeFECField('Opérations diverses'),
      String(i + 1),
      formatFECDate(date),
      escapeFECField(accountCode),
      escapeFECField(accountLabel),
      escapeFECField(entry.pieceNumber ?? `PIECE-${i + 1}`),
      escapeFECField(entry.label),
      debit.toFixed(2),
      credit.toFixed(2),
      '',
      '',
      formatFECDate(date),
      '',
      '',
    ].join(';');

    lines.push(row);
  }

  return lines.join('\n');
}
