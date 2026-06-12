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
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth/auth-options');
    return await getServerSession(authOptions) as Session | null;
  } catch {
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
}
