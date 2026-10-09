import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllBlogPosts, getAllNovels } from "@/lib/content";
import { getNovelArtwork } from "@/lib/artwork";

import home from "@/content/pages/home.json";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const posts = getAllBlogPosts();
  const novels = getAllNovels().sort((a, b) => {
    if (a.slug === "sodoma") return -1;
    if (b.slug === "sodoma") return 1;
    return a.title.localeCompare(b.title, "zh-CN");
  });
  const latestPost = posts[0];

  return (
    <main id="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="hero-title">
          <span>{home.hero.titleFirst}</span>
          <span>{home.hero.titleSecond}</span>
        </h1>
        <figure className="hero-art">
          <Image
            src={home.hero.image}
            alt={home.hero.imageAlt}
            width={1122}
            height={1402}
            priority
            sizes="(max-width: 767px) 100vw, 46vw"
          />
        </figure>
        <div className="hero-copy">
          <p className="hero-subtitle">{home.hero.subtitle}</p>
          <div className="hero-actions">
            <Link className="button button--primary" href={latestPost ? `/blog/${latestPost.slug}` : "/#blog"}>
              读最新文章
            </Link>
            <Link className="text-link" href="/#novel">进入小说</Link>
          </div>
        </div>
      </section>

      <section id="blog" className="section-shell anchor-target" aria-labelledby="blog-title">
        <div className="section-intro">
          <h2 id="blog-title">{home.blog.title}</h2>
          <p>{home.blog.intro}</p>
        </div>
        <div className="journal-list">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="journal-entry">
              <time dateTime={post.date}>{post.date.replace(/-/g, ".")}</time>
              <div className="journal-entry__copy">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
              <span className="journal-entry__meta">{post.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="novel" className="section-shell novel-section anchor-target" aria-labelledby="novel-title">
        <div className="section-intro section-intro--wide">
          <h2 id="novel-title">{home.novel.title}</h2>
          <p>{home.novel.intro}</p>
        </div>
        <div className="novel-grid">
          {novels.map((novel) => {
            const image = getNovelArtwork(novel);
            return (
              <Link key={novel.slug} href={`/novel/${novel.slug}`} className="novel-card">
                {image && (
                  <figure className="novel-card__art">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={900}
                      height={1350}
                      sizes="(max-width: 767px) 100vw, 46vw"
                    />
                  </figure>
                )}
                <div className="novel-card__body">
                  <div className="novel-card__line">
                    <span className="novel-status">{novel.status}</span>
                    <span>{novel.chapterCount} 章<span className="novel-card__gap" aria-hidden="true" />{novel.wordCount}</span>
                  </div>
                  <h3>{novel.title}</h3>
                  <p>{novel.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="about" className="section-shell about-section anchor-target" aria-labelledby="about-title">
        <div>
          <h2 id="about-title">{home.about.title}</h2>
          <p className="about-lede">{home.about.lede}</p>
        </div>
        <div className="about-copy">
          {home.about.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </section>
    </main>
  );
}
