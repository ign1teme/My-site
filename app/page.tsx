import Link from 'next/link';
import { getAllBlogPosts, getAllNovels } from '@/lib/content';

export default function Home() {
  const posts = getAllBlogPosts();
  const novels = getAllNovels();

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-greeting">Welcome</p>
          <h1 className="hero-title">
            文字是枝，<br />思想是<em>海</em>
          </h1>
          <p className="hero-subtitle">
            在这里记录灵感碎片与连续的故事。<br />
            博客写下此刻，小说通往远方。
          </p>
          <div className="hero-divider" />
        </div>
        <span className="hero-scroll">Scroll</span>
      </section>

      {/* Blog */}
      <section id="blog" style={{ maxWidth: 900, margin: '0 auto' }}>
        <p className="section-label">Journal</p>
        <h2 className="section-title">博客</h2>
        <div className="blog-list">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-item">
              <span className="blog-date">{post.date.replace(/-/g, '.')}</span>
              <div>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                {post.tag && <span className="blog-tag">{post.tag}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Novel */}
      <section id="novel" className="novel-section">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="section-label">Fiction</p>
          <h2 className="section-title">小说</h2>
          <div className="novel-grid">
            {novels.map(novel => (
              <Link key={novel.slug} href={`/novel/${novel.slug}`} className="novel-card">
                <span className={`novel-status ${novel.status === '短篇' || novel.status === '已完结' ? 'completed' : ''}`}>
                  {novel.status}
                </span>
                <h3 className="novel-name">{novel.title}</h3>
                <p className="novel-desc">{novel.description}</p>
                <div className="novel-meta">
                  <span>{novel.chapterCount} 章</span>
                  <span>{novel.wordCount}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ maxWidth: 680, margin: '0 auto' }}>
        <p className="section-label">About</p>
        <h2 className="section-title">关于</h2>
        <div style={{ fontSize: '1rem', lineHeight: 2, color: 'var(--gray-700)' }}>
          <p style={{ marginBottom: '1.2rem' }}>写字的人，偶尔画画，住在北方。</p>
          <p style={{ marginBottom: '1.2rem' }}>
            这个站点用来存放不知道该放在哪里的文字。博客记录碎片化的日常与想法，小说则是那些无法用日记承载的、更长的叙事。
          </p>
          <p>如果你读到了什么喜欢的，那就太好了。</p>
        </div>
      </section>
    </main>
  );
}
