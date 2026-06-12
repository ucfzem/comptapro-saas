export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
};

export async function auth(): Promise<Session | null> {
  return {
    user: {
      id: 'demo-user',
      email: 'admin@comptapro.fr',
      name: 'Admin ComptaPro',
      role: 'ADMIN',
      tenantId: 'demo-tenant-1',
    },
  };
}
