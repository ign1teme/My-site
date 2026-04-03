import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '枝海',
  description: '文字是枝，思想是海',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {/* Sakura petals */}
        <div className="petal" />
        <div className="petal" />
        <div className="petal" />
        <div className="petal" />
        <div className="petal" />
        <div className="petal" />

        {/* Navigation */}
        <nav>
          <Link href="/" className="nav-logo">枝海</Link>
          <ul className="nav-links">
            <li><Link href="/#blog">博客</Link></li>
            <li><Link href="/#novel">小说</Link></li>
            <li><Link href="/#about">关于</Link></li>
          </ul>
        </nav>

        {children}

        {/* Footer */}
        <footer>
          <div className="footer-line" />
          <p className="footer-text">© 2026 枝海 · Built with quiet intention</p>
        </footer>
      </body>
    </html>
  );
}
