import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllNovelSlugs, getNovelChapters, getNovelMeta } from "@/lib/content";
import { novelArtwork } from "@/lib/artwork";

type NovelPageProps = {
  params: Promise<{ novel: string }>;
};

export function generateStaticParams() {
  return getAllNovelSlugs().map((novel) => ({ novel }));
}

export async function generateMetadata({ params }: NovelPageProps): Promise<Metadata> {
  const { novel } = await params;
  const meta = getNovelMeta(novel);
  if (!meta) return {};

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/novel/${novel}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/novel/${novel}`,
    },
  };
}

export default async function NovelPage({ params }: NovelPageProps) {
  const { novel } = await params;
  const meta = getNovelMeta(novel);
  if (!meta) notFound();

  const chapters = getNovelChapters(novel);
  const image = novelArtwork[novel];

  return (
    <main id="main-content" className="novel-detail">
      <Link href="/#novel" className="back-link">返回小说</Link>
      <div className="novel-detail__lead">
        {image && (
          <figure className="novel-detail__art">
            <Image src={image.src} alt={image.alt} width={900} height={1350} priority />
          </figure>
        )}
        <div className="novel-detail__copy">
          <p className="novel-detail__status">{meta.status}</p>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
          <p className="novel-detail__count">共 {chapters.length} 章</p>
        </div>
      </div>

      <section className="chapter-section" aria-labelledby="chapter-list-title">
        <h2 id="chapter-list-title">目录</h2>
        <ol className="chapter-list">
          {chapters.map((chapter, index) => (
            <li key={chapter.slug}>
              <Link href={`/novel/${novel}/${chapter.slug}`}>
                <span className="chapter-num">{String(index + 1).padStart(2, "0")}</span>
                <span>{chapter.title}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
