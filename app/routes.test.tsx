import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BlogPostPage, { generateMetadata as blogMetadata, generateStaticParams as blogParams } from "./blog/[slug]/page";
import NovelPage, { generateMetadata as novelMetadata, generateStaticParams as novelParams } from "./novel/[novel]/page";
import ChapterPage, { generateMetadata as chapterMetadata, generateStaticParams as chapterParams } from "./novel/[novel]/[chapter]/page";
import RootLayout, { metadata, viewport } from "./layout";

describe("content routes", () => {
  it("publishes the page shell and canonical metadata", () => {
    const layout = RootLayout({ children: <main id="main-content">Test</main> });
    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("zh-CN");
    expect(metadata.metadataBase?.toString()).toBe("https://hanam7.win/");
    expect(viewport.colorScheme).toBe("light dark");
  });

  it("renders a blog post and handles an unknown slug", async () => {
    const slug = blogParams()[0].slug;
    expect((await blogMetadata({ params: Promise.resolve({ slug }) })).alternates).toEqual({ canonical: `/blog/${slug}` });
    render(await BlogPostPage({ params: Promise.resolve({ slug }) }));
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回博客" })).toHaveAttribute("href", "/#blog");
    expect(await blogMetadata({ params: Promise.resolve({ slug: "missing" }) })).toEqual({});
    await expect(BlogPostPage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow();
  });

  it("renders a novel index and handles an unknown novel", async () => {
    const novel = novelParams()[0].novel;
    expect((await novelMetadata({ params: Promise.resolve({ novel }) })).alternates).toEqual({ canonical: `/novel/${novel}` });
    render(await NovelPage({ params: Promise.resolve({ novel }) }));
    expect(screen.getByRole("heading", { name: "目录" })).toBeInTheDocument();
    expect(await novelMetadata({ params: Promise.resolve({ novel: "missing" }) })).toEqual({});
    await expect(NovelPage({ params: Promise.resolve({ novel: "missing" }) })).rejects.toThrow();
  });

  it("renders a chapter with navigation and handles missing content", async () => {
    const { novel, chapter } = chapterParams()[0];
    expect((await chapterMetadata({ params: Promise.resolve({ novel, chapter }) })).alternates).toEqual({ canonical: `/novel/${novel}/${chapter}` });
    render(await ChapterPage({ params: Promise.resolve({ novel, chapter }) }));
    expect(screen.getByRole("navigation", { name: "章节导航" })).toBeInTheDocument();
    expect(await chapterMetadata({ params: Promise.resolve({ novel, chapter: "missing" }) })).toEqual({});
    await expect(ChapterPage({ params: Promise.resolve({ novel, chapter: "missing" }) })).rejects.toThrow();
    await expect(ChapterPage({ params: Promise.resolve({ novel: "missing", chapter }) })).rejects.toThrow();
  });
});
