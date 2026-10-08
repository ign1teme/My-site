import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { SiteNav } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo" aria-label={siteConfig.name}>
          {siteConfig.name}
        </Link>
        <div className="site-header__actions">
          <SiteNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
