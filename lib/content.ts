import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDir = path.join(process.cwd(), 'content');

// ── Blog ──

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
}

export function getAllBlogPosts(): Omit<BlogPost, 'content'>[] {
  const dir = path.join(contentDir, 'blog');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  return files
    .map(filename => {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
      const { data } = matter(raw);
      return {
        slug: filename.replace('.md', ''),
        title: data.title || '',
        date: data.date || '',
        tag: data.tag || '',
        excerpt: data.excerpt || '',
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(contentDir, 'blog', `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);

  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    tag: data.tag || '',
    excerpt: data.excerpt || '',
    content: processed.toString(),
  };
}

export function getAllBlogSlugs(): string[] {
  const dir = path.join(contentDir, 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

// ── Novel ──

export interface NovelMeta {
  title: string;
  description: string;
  status: string;
  slug: string;
  chapterCount: number;
  wordCount: string;
}

export interface Chapter {
  slug: string;
  title: string;
  order: number;
  content: string;
}

export function getAllNovels(): NovelMeta[] {
  const dir = path.join(contentDir, 'novel');
  if (!fs.existsSync(dir)) return [];

  const novelDirs = fs.readdirSync(dir).filter(d =>
    fs.statSync(path.join(dir, d)).isDirectory()
  );

  return novelDirs.map(novelSlug => {
    const metaPath = path.join(dir, novelSlug, 'meta.json');
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

    const chapters = fs.readdirSync(path.join(dir, novelSlug))
      .filter(f => f.endsWith('.md'));

    // 估算字数
    let totalChars = 0;
    chapters.forEach(ch => {
      const raw = fs.readFileSync(path.join(dir, novelSlug, ch), 'utf-8');
      const { content } = matter(raw);
      totalChars += content.replace(/\s/g, '').length;
    });

    const wordCount = totalChars > 10000
      ? `约 ${(totalChars / 10000).toFixed(1)} 万字`
      : `约 ${(totalChars / 1000).toFixed(1)} 千字`;

    return {
      ...meta,
      slug: novelSlug,
      chapterCount: chapters.length,
      wordCount,
    };
  });
}

export function getNovelChapters(novelSlug: string): Omit<Chapter, 'content'>[] {
  const dir = path.join(contentDir, 'novel', novelSlug);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  return files
    .map(filename => {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
      const { data } = matter(raw);
      return {
        slug: filename.replace('.md', ''),
        title: data.title || '',
        order: data.order || 0,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export async function getChapter(novelSlug: string, chapterSlug: string): Promise<Chapter | null> {
  const filePath = path.join(contentDir, 'novel', novelSlug, `${chapterSlug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);

  return {
    slug: chapterSlug,
    title: data.title || '',
    order: data.order || 0,
    content: processed.toString(),
  };
}

export function getNovelMeta(novelSlug: string): Omit<NovelMeta, 'chapterCount' | 'wordCount'> | null {
  const metaPath = path.join(contentDir, 'novel', novelSlug, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;
  return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
}

export function getAllNovelSlugs(): string[] {
  const dir = path.join(contentDir, 'novel');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(d =>
    fs.statSync(path.join(dir, d)).isDirectory()
  );
}

export function getAllChapterSlugs(novelSlug: string): string[] {
  const dir = path.join(contentDir, 'novel', novelSlug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}
