import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cmsOrigin, cmsRepository } from './cms-config';

const maxAge = 600;
const cookieName = 'cms-oauth';

function settings() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const secret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error('CMS authorization is not configured');
  return { clientId, secret, origin: cmsOrigin(), repo: cmsRepository() };
}
function signature(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}
function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
function cookie(value: string, origin: string, age = maxAge) {
  return `${cookieName}=${value}; Path=/api/admin; HttpOnly; SameSite=Lax; Max-Age=${age}${origin.startsWith('https:') ? '; Secure' : ''}`;
}
function error(message: string, status: number, origin = 'https://hanam7.win') {
  return new Response(message, { status, headers: {
    'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
    'Set-Cookie': cookie('', origin, 0),
  } });
}

export async function startAuthorization(): Promise<Response> {
  try {
    const { clientId, secret, origin } = settings();
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(32).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ state, verifier, issued: Date.now() })).toString('base64url');
    const url = new URL('https://github.com/login/oauth/authorize');
    url.search = new URLSearchParams({
      client_id: clientId, redirect_uri: `${origin}/api/admin/callback`, state,
      scope: process.env.CMS_GITHUB_PRIVATE_REPO === 'true' ? 'repo' : 'public_repo',
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 'S256', allow_signup: 'false',
    }).toString();
    return new Response(null, { status: 302, headers: {
      Location: url.toString(), 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
      'Set-Cookie': cookie(`${payload}.${signature(payload, secret)}`, origin),
    } });
  } catch {
    return error('后台登录尚未配置。请按照 docs/admin-setup.md 完成 GitHub 授权配置后重试。', 503);
  }
}

function readAttempt(request: Request, secret: string, state: string) {
  const value = request.headers.get('cookie')?.split(';').map(c => c.trim()).find(c => c.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!value || value.length > 2048) return null;
  const [payload, mac, extra] = value.split('.');
  if (extra || !mac || !equal(signature(payload, secret), mac)) return null;
  try {
    const attempt = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const elapsed = Date.now() - attempt.issued;
    if (typeof attempt.state !== 'string' || typeof attempt.verifier !== 'string' || !Number.isFinite(elapsed) || elapsed < 0 || elapsed > maxAge * 1000 || !equal(attempt.state, state)) return null;
    return attempt as { state: string; verifier: string; issued: number };
  } catch { return null; }
}

export async function finishAuthorization(request: Request): Promise<Response> {
  let config: ReturnType<typeof settings>;
  try { config = settings(); } catch { return error('后台登录尚未配置。', 503); }
  const { origin, secret, clientId, repo } = config;
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '';
  const code = url.searchParams.get('code');
  const attempt = readAttempt(request, secret, state);
  if (!attempt || !code || code.length > 256 || url.searchParams.has('error')) {
    return error('登录已过期或授权未完成。请关闭此窗口，返回后台重新登录。', 400, origin);
  }
  try {
    const exchange = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: secret, code, redirect_uri: `${origin}/api/admin/callback`, code_verifier: attempt.verifier }),
      cache: 'no-store', signal: AbortSignal.timeout(15_000),
    });
    if (!exchange.ok) return error('GitHub 授权服务暂时不可用，请重新登录。', 502, origin);
    const result = await exchange.json();
    if (typeof result.access_token !== 'string' || !result.access_token || result.error) return error('GitHub 授权失败，请重新登录。', 401, origin);
    const permissions = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${result.access_token}`, 'User-Agent': 'Zhihai-CMS' },
      cache: 'no-store', signal: AbortSignal.timeout(15_000),
    });
    if (!permissions.ok || (await permissions.json()).permissions?.push !== true) {
      return error('当前 GitHub 账号没有此网站仓库的写入权限。请使用站点管理员账号登录。', 403, origin);
    }
    const nonce = randomBytes(16).toString('base64');
    const message = `authorization:github:success:${JSON.stringify({ token: result.access_token, provider: 'github' })}`;
    // Escape inline-script delimiters even if the provider ever returns unexpected token characters.
    const literal = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>枝海 · 登录完成</title><body><p>登录完成，正在返回内容后台。若窗口未自动关闭，请返回后台重新登录，并允许弹出窗口。</p><script nonce="${nonce}">
const origin = ${literal(origin)};
if (window.opener) {
  window.addEventListener('message', function receive(event) {
    if (event.origin !== origin || event.source !== window.opener || event.data !== 'authorizing:github') return;
    window.removeEventListener('message', receive);
    window.opener.postMessage(${literal(message)}, origin);
    window.close();
  });
  window.opener.postMessage('authorizing:github', origin);
}
</script></body></html>`;
    return new Response(html, { headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
      'Set-Cookie': cookie('', origin, 0),
    } });
  } catch { return error('暂时无法连接 GitHub。请关闭此窗口后重试。', 502, origin); }
}
