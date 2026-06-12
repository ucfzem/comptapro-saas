import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (credentials.email === 'admin@comptapro.fr' && credentials.password === 'admin') {
          return {
            id: 'demo-user',
            email: 'admin@comptapro.fr',
            name: 'Admin ComptaPro',
            role: 'ADMIN',
            tenantId: 'demo-tenant-1',
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role;
      (session.user as any).tenantId = token.tenantId;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
};
