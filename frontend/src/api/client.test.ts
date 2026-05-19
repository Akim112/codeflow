import { beforeEach, describe, expect, it } from 'vitest';

describe('API client (401)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('при 401 без токена не перенаправляет на /auth', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });

    const api = (await import('./client')).default;

    await expect(api.get('/api/progress')).rejects.toThrow('Unauthorized');
    expect(localStorage.getItem('token')).toBeNull();

    globalThis.fetch = originalFetch;
  });
});
