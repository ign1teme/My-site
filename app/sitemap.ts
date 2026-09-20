import type { MetadataRoute } from "next";
import {
  getAllBlogPosts,
  getAllChapterSlugs,
  getAllNovelSlugs,
} from "@/lib/content";
import { absoluteUrl, parseContentDate } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogRoutes = getAllBlogPosts().map((post) => {
    const lastModified = parseContentDate(post.date);
    return {
      url: absoluteUrl(`/blog/${post.slug}`),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });
  const novelRoutes = getAllNovelSlugs().flatMap((novel) => [
    {
      url: absoluteUrl(`/novel/${novel}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...getAllChapterSlugs(novel).map((chapter) => ({
      url: absoluteUrl(`/novel/${novel}/${chapter}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]);

  return [
    {
      url: absoluteUrl(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...blogRoutes,
    ...novelRoutes,
  ];
}
