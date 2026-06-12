import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/auth/permissions';
import type { Prisma } from '@prisma/client';

async function withTenant<T>(
  fn: (tenantId: string) => Promise<T>
): Promise<T> {
  const tenantId = await getTenantId();
  return fn(tenantId);
}

export type CreateJournalEntryInput = {
  date: Date;
  label: string;
  debit: number;
  credit: number;
  accountCode: string;
  journalCode?: string;
  pieceNumber?: string;
};

export type JournalEntryRow = {
  id: string;
  tenantId: string;
  date: Date;
  label: string;
  debit: number;
  credit: number;
  accountCode: string;
  journalCode: string;
  pieceNumber: string | null;
  matched: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function createJournalEntry(
  input: CreateJournalEntryInput
): Promise<JournalEntryRow> {
  return withTenant(async (tenantId) => {
    const entry = await prisma.journalEntry.create({
      data: {
        tenantId,
        date: input.date,
        label: input.label,
        debit: input.debit,
        credit: input.credit,
        accountCode: input.accountCode,
        /* journalCode: input.journalCode ?? 'VT', */
        /* pieceNumber: input.pieceNumber ?? null, */
      },
    });
    return entry as unknown as JournalEntryRow;
  });
}

export async function getJournalEntries(
  fiscalYear: number,
  limit = 500,
  offset = 0
): Promise<{ entries: JournalEntryRow[]; total: number }> {
  return withTenant(async (tenantId) => {
    const yearStart = new Date(`${fiscalYear}-01-01T00:00:00Z`);
    const yearEnd = new Date(`${fiscalYear + 1}-01-01T00:00:00Z`);

    const where: Prisma.JournalEntryWhereInput = {
      tenantId,
      date: { gte: yearStart, lt: yearEnd },
    };

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        orderBy: { date: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return {
      entries: entries as unknown as JournalEntryRow[],
      total,
    };
  });
}

export async function getUnmatchedEntries(
  fiscalYear: number,
  limit = 500,
  offset = 0
): Promise<{ entries: JournalEntryRow[]; total: number }> {
  return withTenant(async (tenantId) => {
    const yearStart = new Date(`${fiscalYear}-01-01T00:00:00Z`);
    const yearEnd = new Date(`${fiscalYear + 1}-01-01T00:00:00Z`);

    const where: Prisma.JournalEntryWhereInput = {
      tenantId,
      date: { gte: yearStart, lt: yearEnd },
      isMatched: false,
    };

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        orderBy: { date: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return {
      entries: entries as unknown as JournalEntryRow[],
      total,
    };
  });
}
