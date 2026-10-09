// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startAuthorization, finishAuthorization } from './cms-auth';

describe('CMS GitHub authorization', () => {
  beforeEach(() => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'test-client');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'test-secret-only');
    vi.stubEnv('CMS_SITE_URL', 'https://hanam7.win');
    vi.stubEnv('CMS_GITHUB_REPO', 'ign1teme/My-site');
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  async function begin() {
    const response = await startAuthorization();
    const location = new URL(response.headers.get('location')!);
    return { response, state: location.searchParams.get('state')!, cookie: response.headers.get('set-cookie')!.split(';')[0] };
  }
  function callback(state: string, cookie: string) {
    return new Request(`https://hanam7.win/api/admin/callback?state=${state}&code=test-code`, { headers: { cookie } });
  }
  it('fails closed when authorization is not configured', async () => {
    vi.stubEnv('GITHUB_CLIENT_SECRET', '');
    expect((await startAuthorization()).status).toBe(503);
  });
  it('uses a fixed callback, secure cookie, random state and PKCE', async () => {
    const { response, state } = await begin();
    const url = new URL(response.headers.get('location')!);
    expect(url.origin).toBe('https://github.com');
    expect(url.searchParams.get('redirect_uri')).toBe('https://hanam7.win/api/admin/callback');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(state.length).toBeGreaterThan(30);
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('Secure');
  });
  it('rejects missing, mismatched and tampered state before exchanging a code', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    const { state, cookie } = await begin();
    expect((await finishAuthorization(callback(state, ''))).status).toBe(400);
    expect((await finishAuthorization(callback('wrong', cookie))).status).toBe(400);
    expect((await finishAuthorization(callback(state, cookie + 'x'))).status).toBe(400);
    expect((await finishAuthorization(callback(state, cookie.replace(/\.[^.]+$/, '.' + 'é'.repeat(43))))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects expired authorization attempts', async () => {
    const { state, cookie } = await begin();
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 601_000);
    expect((await finishAuthorization(callback(state, cookie))).status).toBe(400);
  });
  it('only returns credentials to the exact site origin after verifying push access', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ access_token: 'test-access-token' }))
      .mockResolvedValueOnce(Response.json({ permissions: { push: true } }));
    vi.stubGlobal('fetch', fetchMock);
    const { state, cookie } = await begin();
    const response = await finishAuthorization(callback(state, cookie));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    const html = await response.text();
    expect(html).toContain('https://hanam7.win');
    expect(html).toContain('event.source !== window.opener');
    expect(html).toContain('event.origin !== origin');
    expect(html).toContain('authentication:github:success:');
    expect(html).not.toContain('test-secret-only');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.github.com/repos/ign1teme/My-site');
  });
  it('rejects users without write access without returning the token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(Response.json({ access_token: 'private-token' }))
      .mockResolvedValueOnce(Response.json({ permissions: { push: false } })));
    const { state, cookie } = await begin();
    const response = await finishAuthorization(callback(state, cookie));
    expect(response.status).toBe(403);
    expect(await response.text()).not.toContain('private-token');
  });
  it('handles provider errors without leaking credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('secret provider error')));
    const { state, cookie } = await begin();
    const response = await finishAuthorization(callback(state, cookie));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('secret provider error');
  });
});
