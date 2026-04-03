import Link from 'next/link';
import { getNovelMeta, getNovelChapters, getAllNovelSlugs } from '@/lib/content';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return getAllNovelSlugs().map(novel => ({ novel }));
}

export default function NovelPage({ params }: { params: { novel: string } }) {
  const meta = getNovelMeta(params.novel);
  if (!meta) notFound();

  const chapters = getNovelChapters(params.novel);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '8rem 2rem 5rem', minHeight: '100vh' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Link href="/#novel" className="back-link">← 返回小说</Link>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.6rem',
          fontWeight: 400,
          marginBottom: '0.5rem',
        }}>
          {meta.title}
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', lineHeight: 1.7 }}>
          {meta.description}
        </p>
      </div>
      <ul className="chapter-list">
        {chapters.map((ch, i) => (
          <li key={ch.slug}>
            <Link href={`/novel/${params.novel}/${ch.slug}`}>
              <span>{ch.title}</span>
              <span className="chapter-num">{String(i + 1).padStart(2, '0')}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
