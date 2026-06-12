import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'VIEW';

export type AuditEntity =
  | 'JOURNAL_ENTRY'
  | 'INVOICE'
  | 'USER'
  | 'TENANT'
  | 'CLIENT'
  | 'BANK_TRANSACTION'
  | 'DOCUMENT'
  | 'SETTINGS';

export async function logAudit(
  action: AuditAction,
  entity: AuditEntity,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const session = await auth();

  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      metadata: metadata ?? {},
      userId: session?.user?.id ?? 'anonymous',
      tenantId: (session?.user?.tenantId as string) ?? null,
    },
  });
}
