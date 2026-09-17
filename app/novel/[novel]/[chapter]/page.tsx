import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/reading-progress";
import {
  getAllChapterSlugs,
  getAllNovelSlugs,
  getChapter,
  getNovelChapters,
  getNovelMeta,
} from "@/lib/content";

type ChapterPageProps = {
  params: Promise<{ novel: string; chapter: string }>;
};

export function generateStaticParams() {
  const params: { novel: string; chapter: string }[] = [];
  for (const novel of getAllNovelSlugs()) {
    for (const chapter of getAllChapterSlugs(novel)) {
      params.push({ novel, chapter });
    }
  }
  return params;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { novel, chapter: chapterSlug } = await params;
  const meta = getNovelMeta(novel);
  const chapter = await getChapter(novel, chapterSlug);
  if (!meta || !chapter) return {};

  const title = `${chapter.title}｜${meta.title}`;
  const description = `阅读《${meta.title}》${chapter.title}。`;
  const url = `/novel/${novel}/${chapterSlug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { novel, chapter: chapterSlug } = await params;
  const meta = getNovelMeta(novel);
  if (!meta) notFound();

  const chapter = await getChapter(novel, chapterSlug);
  if (!chapter) notFound();

  const chapters = getNovelChapters(novel);
  const currentIndex = chapters.findIndex((item) => item.slug === chapterSlug);
  const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <>
      <ReadingProgress />
      <main id="main-content">
        <article className="article-shell article-shell--novel">
          <header className="article-header">
            <Link href={`/novel/${novel}`} className="back-link">返回目录</Link>
            <p className="article-kicker">{meta.title}</p>
            <h1>{chapter.title}</h1>
          </header>

          <div className="prose novel-prose" dangerouslySetInnerHTML={{ __html: chapter.content }} />

          <nav className="chapter-nav" aria-label="章节导航">
            {previousChapter ? (
              <Link href={`/novel/${novel}/${previousChapter.slug}`} rel="prev">
                <span>上一章</span>
                <strong>{previousChapter.title}</strong>
              </Link>
            ) : <span />}
            {nextChapter ? (
              <Link href={`/novel/${novel}/${nextChapter.slug}`} rel="next">
                <span>下一章</span>
                <strong>{nextChapter.title}</strong>
              </Link>
            ) : <span />}
          </nav>
        </article>
      </main>
    </>
  );
}
