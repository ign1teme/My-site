export const novelArtwork: Record<string, { src: string; alt: string }> = {
  sodoma: {
    src: "/images/novel-sodoma.png",
    alt: "《无神之明》封面：天神之明",
  },
  "spring-tide": {
    src: "/images/novel-spring-tide.webp",
    alt: "春日融雪汇入河流的插画",
  },
};

export function getNovelArtwork(novel: { slug: string; title: string; cover?: string; coverAlt?: string }) {
  if (novel.cover && /^\/(images|uploads)\//.test(novel.cover) && !novel.cover.includes('..')) {
    return { src: novel.cover, alt: novel.coverAlt || `${novel.title}封面` };
  }
  return novelArtwork[novel.slug];
}
