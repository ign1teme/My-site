// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as config } from './config/route';
import { GET as auth } from './auth/route';
import { GET as callback } from './callback/route';

afterEach(() => { vi.unstubAllEnvs(); });
describe('CMS HTTP routes', () => {
  it('does not expose secrets or activate demo in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GITHUB_CLIENT_ID', 'private-client');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'private-secret');
    const response = config(new Request('https://hanam7.win/api/admin/config?demo=1'));
    const data = await response.json();
    expect(data).toMatchObject({ configured: true, demo: false, development: false });
    expect(data.config.backend.name).toBe('github');
    expect(data.demoFiles).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain('private-secret');
    expect(JSON.stringify(data)).not.toContain('private-client');
  });
  it('provides a local, isolated editor with existing content during development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const data = await config(new Request('http://localhost:3000/api/admin/config?demo=1')).json();
    expect(data.config.backend.name).toBe('test-repo');
    expect(data.demoFiles.blog['2026-04-02-launch.md'].content).toContain('新站点上线');
  });
  it('reports invalid configuration safely', () => {
    vi.stubEnv('CMS_SITE_URL', 'https://hanam7.win/unsafe');
    expect(config(new Request('https://hanam7.win/api/admin/config')).status).toBe(503);
  });
  it('fails closed for both authorization routes without credentials', async () => {
    vi.stubEnv('GITHUB_CLIENT_SECRET', '');
    expect((await auth()).status).toBe(503);
    expect((await callback(new Request('https://hanam7.win/api/admin/callback'))).status).toBe(503);
  });
});
