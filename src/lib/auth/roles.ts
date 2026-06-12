export enum Role {
  CLIENT_PORTAL = 'CLIENT_PORTAL',
  VIEWER = 'VIEWER',
  ACCOUNTANT = 'ACCOUNTANT',
  ADMIN = 'ADMIN',
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.CLIENT_PORTAL]: 1,
  [Role.VIEWER]: 2,
  [Role.ACCOUNTANT]: 3,
  [Role.ADMIN]: 4,
};
