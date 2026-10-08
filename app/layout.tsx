import "@fontsource/noto-serif-sc/300.css";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/600.css";
import "lxgw-wenkai-webfont/lxgwwenkai-light.css";
import "lxgw-wenkai-webfont/lxgwwenkai-regular.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Petals } from "@/components/petals";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s｜${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#23141c" },
    { media: "(prefers-color-scheme: dark)", color: "#23141c" },
  ],
};

const themeScript = `(function(){try{var saved=localStorage.getItem('theme');var theme=saved==='light'?'light':'dark';document.documentElement.dataset.theme=theme}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Petals />
        <a className="skip-link" href="#main-content">跳到正文</a>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="site-footer__inner">
            <p className="site-footer__brand">{siteConfig.name}</p>
            <p>写于 Saimaa 湖边，拉彭兰塔。</p>
            <p className="site-footer__meta">© 2026 hanam7.win</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
