import type { DefaultSession, NextAuthConfig } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env';
import { db } from '@/server/db';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Session {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }
}

/**
 * Shared configuration for NextAuth.js providers and callbacks
 */
const sharedConfig = {
  trustHost: true, // Required for production/Vercel
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
    DiscordProvider({
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    }),
  ],
  callbacks: {
    session: ({ session, user, token }) => ({
      ...session,
      user: {
        ...session.user,
        // For database sessions, use user.id, for JWT sessions use token.sub
        id: user?.id ?? token?.sub ?? session.user?.id,
      },
    }),
    jwt: ({ token, user }) => {
      // If user is available (first sign in), add id to token
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    signIn: async () => {
      // Allow sign in
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Error code passed in query string as ?error=
  },
} satisfies Partial<NextAuthConfig>;

/**
 * Full configuration with database adapter (for main app)
 */
export const authConfig = {
  ...sharedConfig,
  adapter: DrizzleAdapter(db),
  session: {
    strategy: 'jwt', // Use JWT for middleware compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;

/**
 * Edge-compatible configuration without database adapter (for middleware)
 */
export const authConfigEdge = {
  ...sharedConfig,
  session: {
    strategy: 'jwt', // Force JWT strategy for edge compatibility
  },
  callbacks: {
    ...sharedConfig.callbacks,
    authorized({ auth }) {
      // For middleware: return true if user is authenticated
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
