export enum Role {
  CLIENT_PORTAL = 1,
  VIEWER = 2,
  ACCOUNTANT = 3,
  ADMIN = 4,
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.CLIENT_PORTAL]: 1,
  [Role.VIEWER]: 2,
  [Role.ACCOUNTANT]: 3,
  [Role.ADMIN]: 4,
};
