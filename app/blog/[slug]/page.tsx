import Link from 'next/link';
import { getBlogPost, getAllBlogSlugs } from '@/lib/content';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return getAllBlogSlugs().map(slug => ({ slug }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <article style={{ maxWidth: 680, margin: '0 auto', padding: '8rem 2rem 5rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <Link href="/#blog" className="back-link">← 返回博客</Link>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--sakura-400)',
          marginBottom: '0.8rem',
        }}>
          {post.date.replace(/-/g, '.')}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.6rem',
          fontWeight: 400,
          lineHeight: 1.25,
        }}>
          {post.title}
        </h1>
      </div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
