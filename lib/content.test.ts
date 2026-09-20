import fs from "fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAllBlogPosts,
  getAllBlogSlugs,
  getAllChapterSlugs,
  getAllNovels,
  getAllNovelSlugs,
  getBlogPost,
  getChapter,
  getNovelChapters,
  getNovelMeta,
} from "./content";

describe("content repository", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns blog posts newest first with stable slugs", () => {
    const posts = getAllBlogPosts();

    expect(posts).toHaveLength(3);
    expect(posts.map((post) => post.slug)).toEqual([
      "2026-04-02-launch",
      "2026-04-01-saimaa",
      "2026-03-15-writing",
    ]);
  });

  it("loads a blog post and handles a missing post", async () => {
    const post = await getBlogPost("2026-04-02-launch");

    expect(post?.title).toBe("新站点上线");
    expect(post?.content).toContain("<p>");
    await expect(getBlogPost("missing")).resolves.toBeNull();
  });

  it("lists blog slugs", () => {
    expect(getAllBlogSlugs()).toEqual(
      expect.arrayContaining([
        "2026-04-02-launch",
        "2026-04-01-saimaa",
        "2026-03-15-writing",
      ]),
    );
  });

  it("derives novel metadata and word counts from chapters", () => {
    const novels = getAllNovels();
    const sodoma = novels.find((novel) => novel.slug === "sodoma");

    expect(novels).toHaveLength(2);
    expect(sodoma).toMatchObject({ title: "樱色匿名信", chapterCount: 3 });
    expect(sodoma?.wordCount).toMatch(/^约 /);
  });

  it("orders chapters and loads chapter content", async () => {
    const chapters = getNovelChapters("sodoma");
    const chapter = await getChapter("sodoma", "001");

    expect(chapters.map(({ order }) => order)).toEqual([1, 2, 3]);
    expect(chapter?.title).toContain("天堂接口");
    expect(chapter?.content).toContain("<p>");
  });

  it("handles missing novel and chapter paths", async () => {
    expect(getNovelMeta("missing")).toBeNull();
    expect(getNovelChapters("missing")).toEqual([]);
    expect(getAllChapterSlugs("missing")).toEqual([]);
    await expect(getChapter("missing", "001")).resolves.toBeNull();
  });

  it("lists novel and chapter slugs", () => {
    expect(getAllNovelSlugs()).toEqual(expect.arrayContaining(["sodoma", "spring-tide"]));
    expect(getAllChapterSlugs("sodoma")).toEqual(expect.arrayContaining(["001", "002", "003"]));
    expect(getNovelMeta("sodoma")?.title).toBe("樱色匿名信");
  });

  it("returns empty collections when content roots are unavailable", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    expect(getAllBlogPosts()).toEqual([]);
    expect(getAllBlogSlugs()).toEqual([]);
    expect(getAllNovels()).toEqual([]);
    expect(getAllNovelSlugs()).toEqual([]);
  });

  it("provides safe defaults for incomplete frontmatter", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readdirSync").mockReturnValue(["draft.md"] as never);
    vi.spyOn(fs, "readFileSync").mockReturnValue("---\n---\nDraft body" as never);

    expect(getAllBlogPosts()[0]).toMatchObject({
      title: "",
      date: "",
      tag: "",
      excerpt: "",
    });
    await expect(getBlogPost("draft")).resolves.toMatchObject({
      title: "",
      date: "",
      tag: "",
      excerpt: "",
    });
    expect(getNovelChapters("draft")[0]).toMatchObject({ title: "", order: 0 });
    await expect(getChapter("draft", "001")).resolves.toMatchObject({ title: "", order: 0 });
  });

  it("drops raw scripts and unsafe link protocols from markdown", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      "---\ntitle: Safe\n---\n<script>alert(1)</script>\n\n[unsafe](javascript:alert(2))" as never,
    );

    const post = await getBlogPost("unsafe");

    expect(post?.content).not.toContain("<script");
    expect(post?.content).not.toContain("javascript:");
    expect(post?.content).toContain("<a>unsafe</a>");
  });
});
