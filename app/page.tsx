import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllBlogPosts, getAllNovels } from "@/lib/content";
import { novelArtwork } from "@/lib/artwork";

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
        <div className="hero-copy">
          <p className="hero-kicker">个人札记与虚构</p>
          <h1 id="hero-title" className="hero-title">
            <span>文字是枝，</span>
            <span>思想是海。</span>
          </h1>
          <p className="hero-subtitle">记录北方日常，也写那些现实无法容纳的故事。</p>
          <div className="hero-actions">
            <Link className="button button--primary" href={latestPost ? `/blog/${latestPost.slug}` : "/#blog"}>
              读最新文章
            </Link>
            <Link className="text-link" href="/#novel">进入小说</Link>
          </div>
        </div>
        <figure className="hero-art">
          <Image
            src="/images/hero-branch-sea.webp"
            alt="冰面将融的北方湖泊，一枝树影伸向水面"
            width={1122}
            height={1402}
            priority
            sizes="(max-width: 767px) 100vw, 46vw"
          />
        </figure>
      </section>

      <section id="blog" className="section-shell anchor-target" aria-labelledby="blog-title">
        <div className="section-intro">
          <h2 id="blog-title">最近写下</h2>
          <p>短一些的日常与想法，按时间留下。</p>
        </div>
        <div className="journal-list">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="journal-entry">
              <time dateTime={post.date}>{post.date.replace(/-/g, ".")}</time>
              <div className="journal-entry__copy">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
              <span className="journal-entry__meta">
                {post.tag}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="novel" className="section-shell novel-section anchor-target" aria-labelledby="novel-title">
        <div className="section-intro section-intro--wide">
          <h2 id="novel-title">小说与长篇</h2>
          <p>把无法用日记承载的东西，交给更长的叙事。</p>
        </div>
        <div className="novel-grid">
          {novels.map((novel) => {
            const image = novelArtwork[novel.slug];
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
                    <span>{novel.chapterCount} 章 · {novel.wordCount}</span>
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
          <h2 id="about-title">关于枝海</h2>
          <p className="about-lede">写字的人，偶尔发呆，住在北方。</p>
        </div>
        <div className="about-copy">
          <p>这个站点用来存放不知道该放在哪里的文字。博客记录碎片化的日常与想法，小说则是那些无法用日记承载的、更长的叙事。</p>
          <p>如果你读到了什么喜欢的，那就太好了。</p>
        </div>
      </section>
    </main>
  );
}
