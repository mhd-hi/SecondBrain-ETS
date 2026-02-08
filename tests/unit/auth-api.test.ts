import type { Mock } from 'vitest';
import { headers } from 'next/headers';

import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@/server/auth';
import { withAuthSimple } from '../../src/lib/auth/api';

// Mock next/headers and the server auth helper before importing the module under test
vi.mock('next/headers', () => ({ headers: vi.fn() }));
vi.mock('@/server/auth', () => ({ auth: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('withAuthSimple wrapper', () => {
  it('returns 401 when user is missing', async () => {
    const mockedHeaders = headers as unknown as Mock;
    const mockedAuth = auth as unknown as Mock;
    mockedHeaders.mockImplementation(() => ({ get: () => null }));
    mockedAuth.mockResolvedValue(null);

    const handler = withAuthSimple(async () => NextResponse.json({ ok: true }));
    const res = await handler(new Request('http://localhost/api/test') as any, { params: Promise.resolve({}) } as any);

    expect(res.status).toBe(401);

    const body = await (res as Response).json();

    expect(body.code).toBe('UNAUTHENTICATED');
  });

  it('injects user from middleware headers when present', async () => {
    const mockedHeaders = headers as unknown as Mock;
    const mockedAuth = auth as unknown as Mock;
    mockedHeaders.mockImplementation(() => ({
      get: (name: string) => {
        if (name === 'x-user-id') {
          return 'user-123';
        }
        if (name === 'x-user-email') {
          return 'user@example.com';
        }
        return null;
      },
    }));
    mockedAuth.mockResolvedValue(null);

    const handler = withAuthSimple(async (_req, user) => NextResponse.json({ userId: user.id }));
    const res = await handler(new Request('http://localhost/api/test') as any, { params: Promise.resolve({}) } as any);

    expect(res.status).toBe(200);

    const body = await (res as Response).json();

    expect(body.userId).toBe('user-123');
  });

  it('injects user from session fallback when headers absent', async () => {
    const mockedHeaders = headers as unknown as Mock;
    const mockedAuth = auth as unknown as Mock;
    mockedHeaders.mockImplementation(() => ({ get: () => null }));
    mockedAuth.mockResolvedValue({ user: { id: 'session-user', email: 's@e.com' } });

    const handler = withAuthSimple(async (_req, user) => NextResponse.json({ userId: user.id }));
    const res = await handler(new Request('http://localhost/api/test') as any, { params: Promise.resolve({}) } as any);

    expect(res.status).toBe(200);

    const body = await (res as Response).json();

    expect(body.userId).toBe('session-user');
  });
});
