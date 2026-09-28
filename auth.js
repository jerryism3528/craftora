import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { queryOne, query } from './lib/db';
import { verifyPassword, isValidEmail } from './lib/auth-helpers';

// Make a unique username from an email local-part.
async function makeUsername(base) {
  let clean = String(base || 'user').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 16) || 'user';
  if (clean.length < 3) clean = clean + 'user';
  let candidate = clean;
  let n = 1;
  while (await queryOne('SELECT id FROM users WHERE username = $1', [candidate])) {
    candidate = `${clean}${n++}`;
  }
  return candidate;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 2,
    updateAge: 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email || '').trim().toLowerCase();
        const password = String(creds?.password || '');
        if (!isValidEmail(email) || !password) return null;

        const user = await queryOne(
          'SELECT id, email, username, password_hash, email_verified, is_admin, suspended_until, avatar_url FROM users WHERE email = $1',
          [email]
        );
        if (!user) return null;
        if (!user.email_verified) return null;
        if (!user.password_hash) return null;
        if (user.suspended_until && new Date(user.suspended_until) > new Date()) return null;

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
    // Runs for every sign-in. For Google, create or link the Craftora account.
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true; // credentials handled in authorize

      const email = String(profile?.email || user?.email || '').trim().toLowerCase();
      if (!email || !profile?.email_verified) return false; // Google must have verified the email

      const existing = await queryOne('SELECT id, suspended_until FROM users WHERE email = $1', [email]);
      if (existing) {
        // Block suspended users.
        if (existing.suspended_until && new Date(existing.suspended_until) > new Date()) return false;
        // Link: ensure the account is marked verified and has an oauth record.
        await query('UPDATE users SET email_verified = COALESCE(email_verified, now()), updated_at = now() WHERE id = $1', [existing.id]);
        await query(
          'INSERT INTO accounts (user_id, provider, provider_account_id) VALUES ($1, $2, $3) ON CONFLICT (provider, provider_account_id) DO NOTHING',
          [existing.id, 'google', account.providerAccountId]
        );
        return true;
      }

      // New Google user: create account (verified, no password).
      const username = await makeUsername(email.split('@')[0]);
      const created = await queryOne(
        'INSERT INTO users (email, username, email_verified, avatar_url) VALUES ($1, $2, now(), $3) RETURNING id',
        [email, username, user?.image || null]
      );
      await query(
        'INSERT INTO accounts (user_id, provider, provider_account_id) VALUES ($1, $2, $3) ON CONFLICT (provider, provider_account_id) DO NOTHING',
        [created.id, 'google', account.providerAccountId]
      );
      return true;
    },

    async jwt({ token, user, account }) {
      // On first sign-in, load the Craftora user by email to get id/admin/username.
      if (user || account) {
        const email = String(token.email || user?.email || '').trim().toLowerCase();
        if (email) {
          const dbUser = await queryOne(
            'SELECT id, username, is_admin, avatar_url FROM users WHERE email = $1',
            [email]
          );
          if (dbUser) {
            token.uid = dbUser.id;
            token.isAdmin = dbUser.is_admin;
            token.username = dbUser.username;
            token.picture = dbUser.avatar_url || token.picture || null;
          }
        }
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
