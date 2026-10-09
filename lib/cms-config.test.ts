import { describe, expect, it } from 'vitest';
import { createCmsConfig } from './cms-config';

describe('visual publishing configuration', () => {
  const config = createCmsConfig([{ slug: 'sodoma', title: '樱色匿名信' }]);
  it('uses GitHub editorial workflow and the existing repository', () => {
    expect(config.backend).toMatchObject({ name: 'github', repo: 'ign1teme/My-site' });
    expect(config.publish_mode).toBe('editorial_workflow');
    expect(config.media_folder).toBe('public/uploads');
    expect(config.public_folder).toBe('/uploads');
  });
  it('keeps existing paths and creates a chapter editor for every novel', () => {
    expect(config.collections.find(c => c.name === 'blog')).toMatchObject({ folder: 'content/blog', create: true });
    expect(config.collections.find(c => c.name === 'novels')).toMatchObject({ folder: 'content/novel', path: '{{slug}}/meta', extension: 'json' });
    const chapters = config.collections.find(c => c.name === 'chapters-sodoma');
    expect(chapters).toMatchObject({ folder: 'content/novel/sodoma', slug: '{{fields.order}}' });
    expect(chapters?.fields?.find(f => f.name === 'body')).toMatchObject({ widget: 'markdown', modes: ['rich_text'] });
  });
  it('exposes homepage and about copy as form fields', () => {
    expect(config.collections.find(c => c.name === 'pages')?.files?.[0]).toMatchObject({ file: 'content/pages/home.json' });
  });
});
