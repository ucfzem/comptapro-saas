import { auth } from './auth';
import { Role, ROLE_HIERARCHY } from './roles';
import type { Session } from 'next-auth';

export type { Role };

function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

function hasSufficientRole(userRole: Role, allowedRoles: Role[]): boolean {
  const userLevel = getRoleLevel(userRole);
  return allowedRoles.some((r) => userLevel >= getRoleLevel(r));
}

export async function requireRole(allowedRoles: Role[]): Promise<Session> {
  const session = await auth();

  if (!session?.user?.role) {
    throw new Error('Unauthorized: no session found');
  }

  const userRole = session.user.role as Role;

  if (!hasSufficientRole(userRole, allowedRoles)) {
    throw new Error(
      `Forbidden: role ${userRole} does not have sufficient permissions`
    );
  }

  return session;
}

export async function getTenantId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.tenantId) {
    throw new Error('Unauthorized: no tenant found in session');
  }

  return session.user.tenantId as string;
}
