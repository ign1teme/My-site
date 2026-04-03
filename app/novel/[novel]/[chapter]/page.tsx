import Link from 'next/link';
import { getChapter, getNovelMeta, getNovelChapters, getAllNovelSlugs, getAllChapterSlugs } from '@/lib/content';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const params: { novel: string; chapter: string }[] = [];
  for (const novel of getAllNovelSlugs()) {
    for (const chapter of getAllChapterSlugs(novel)) {
      params.push({ novel, chapter });
    }
  }
  return params;
}

export default async function ChapterPage({ params }: { params: { novel: string; chapter: string } }) {
  const meta = getNovelMeta(params.novel);
  if (!meta) notFound();

  const chapter = await getChapter(params.novel, params.chapter);
  if (!chapter) notFound();

  const chapters = getNovelChapters(params.novel);
  const currentIndex = chapters.findIndex(ch => ch.slug === params.chapter);
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <article style={{ maxWidth: 680, margin: '0 auto', padding: '8rem 2rem 5rem', minHeight: '100vh' }}>
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--gray-100)' }}>
        <Link href={`/novel/${params.novel}`} className="back-link">← 返回目录</Link>
        <p style={{
          fontSize: '0.72rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--sakura-400)',
          marginBottom: '0.6rem',
        }}>
          {meta.title}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.2rem',
          fontWeight: 400,
        }}>
          {chapter.title}
        </h1>
      </div>

      <div className="prose novel-prose" dangerouslySetInnerHTML={{ __html: chapter.content }} />

      <div className="chapter-nav">
        {prev ? (
          <Link href={`/novel/${params.novel}/${prev.slug}`}>← {prev.title}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/novel/${params.novel}/${next.slug}`}>{next.title} →</Link>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
