import NextAuth from 'next-auth';
import { authConfigEdge } from '@/server/auth/config';

export const { auth } = NextAuth(authConfigEdge);
