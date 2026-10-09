import { createCmsConfig } from '@/lib/cms-config';
import { getAllNovels, getNovelChapters } from '@/lib/content';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  try {
    const novels = getAllNovels();
    const config = createCmsConfig(novels);
    const demo = process.env.NODE_ENV === 'development' && new URL(request.url).searchParams.get('demo') === '1';
    return Response.json({
      config: demo ? { ...config, backend: { name: 'test-repo' } } : config,
      configured: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      demo,
      development: process.env.NODE_ENV === 'development',
      validation: novels.map(novel => ({ slug: novel.slug, chapters: getNovelChapters(novel.slug) })),
      ...(demo ? { demoFiles: readDemoFiles(path.join(process.cwd(), 'content'), 'content') } : {}),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: '后台配置读取失败，请检查站点配置。' }, { status: 503 });
  }
}

function readDemoFiles(directory: string, relative: string): Record<string, unknown> {
  return Object.fromEntries(fs.readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory() || /\.(json|md)$/.test(entry.name)).map(entry => [
    entry.name, entry.isDirectory()
      ? readDemoFiles(path.join(directory, entry.name), `${relative}/${entry.name}`)
      : { content: fs.readFileSync(path.join(directory, entry.name), 'utf8'), path: `${relative}/${entry.name}` },
  ]));
}
