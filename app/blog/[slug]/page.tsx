import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/reading-progress";
import { getAllBlogSlugs, getBlogPost } from "@/lib/content";

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <ReadingProgress />
      <main id="main-content">
        <article className="article-shell">
          <header className="article-header">
            <Link href="/#blog" className="back-link">返回博客</Link>
            <div className="article-meta">
              <time dateTime={post.date}>{post.date.replace(/-/g, ".")}</time>
              {post.tag && <span>{post.tag}</span>}
            </div>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  );
}
