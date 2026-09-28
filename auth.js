import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { queryOne, query } from './lib/db';
import { verifyPassword, isValidEmail } from './lib/auth-helpers';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
    // 2 days of inactivity, then the session expires.
    maxAge: 60 * 60 * 24 * 2,
    updateAge: 60 * 60, // refresh the 2-day window at most once an hour of activity
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(creds) {
        const email = String(creds?.email || '').trim().toLowerCase();
        const password = String(creds?.password || '');
        if (!isValidEmail(email) || !password) return null;

        const user = await queryOne(
          'SELECT id, email, username, password_hash, email_verified, is_admin, suspended_until, avatar_url FROM users WHERE email = $1',
          [email]
        );
        if (!user) return null;
        if (!user.email_verified) return null;          // must confirm email first
        if (!user.password_hash) return null;           // Google-only account
        if (user.suspended_until && new Date(user.suspended_until) > new Date()) return null; // suspended

        const ok = await verifyPassword(password, user.password_hash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatar_url || null,
          isAdmin: user.is_admin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.isAdmin = user.isAdmin;
        token.username = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.isAdmin = token.isAdmin || false;
        session.user.username = token.username;
        session.user.image = token.picture || null;
      }
      return session;
    },
  },
});
