import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo" aria-label="枝海">
          枝海
        </Link>
        <div className="site-header__actions">
          <nav aria-label="主要导航">
            <ul className="nav-links">
              <li><Link href="/#blog">博客</Link></li>
              <li><Link href="/#novel">小说</Link></li>
              <li><Link href="/#about">关于</Link></li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
