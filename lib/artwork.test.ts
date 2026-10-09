import { describe, expect, it } from 'vitest';
import { getNovelArtwork } from './artwork';

describe('CMS novel covers', () => {
  it('shows an uploaded cover and its accessible description', () => {
    expect(getNovelArtwork({ slug: 'new-story', title: '新作', cover: '/uploads/cover.png', coverAlt: '湖畔的树' })).toEqual({ src: '/uploads/cover.png', alt: '湖畔的树' });
    expect(getNovelArtwork({ slug: 'new-story', title: '新作', cover: '/uploads/cover.png' })?.alt).toBe('新作封面');
  });
  it('retains old artwork and rejects unsafe cover locations', () => {
    expect(getNovelArtwork({ slug: 'sodoma', title: '旧作', cover: 'javascript:alert(1)' })?.src).toBe('/images/novel-sodoma.png');
    expect(getNovelArtwork({ slug: 'new-story', title: '新作', cover: '/uploads/../secret' })).toBeUndefined();
  });
});
