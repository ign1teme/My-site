import { describe, expect, it } from 'vitest';
import { validateEntry, updatePublishedEntry } from '../public/admin/validation';

const novels = [{ slug: 'sodoma', chapters: [{ slug: '001', order: 1 }, { slug: '002', order: 2 }] }];
describe('editor publication safety', () => {
  it('keeps chapter orders current between successive publications', () => {
    const current = structuredClone(novels);
    const first = { collection: 'chapters-sodoma', data: { order: 4 }, slug: '001', newRecord: false };
    updatePublishedEntry(first, current);
    expect(() => validateEntry({ ...first, slug: '002' }, current, true)).toThrow('已经使用');
    expect(() => validateEntry({ ...first, slug: '002', data: { order: 1 } }, current, true)).not.toThrow();
    updatePublishedEntry(first, current, true);
    expect(current[0].chapters).toEqual([{ slug: '002', order: 2 }]);
  });
  it('reserves a newly published novel URL immediately', () => {
    const current = structuredClone(novels);
    const entry = { collection: 'novels', data: { slug: 'new-story' }, newRecord: true };
    updatePublishedEntry(entry, current);
    expect(() => validateEntry(entry, current)).toThrow('已经存在');
  });
  it('rejects duplicate novels and changes to existing novel URLs', () => {
    expect(() => validateEntry({ collection: 'novels', data: { slug: 'sodoma' }, newRecord: true }, novels)).toThrow('已经存在');
    expect(() => validateEntry({ collection: 'novels', data: { slug: 'changed' }, newRecord: false, path: 'content/novel/sodoma/meta.json' }, novels)).toThrow('不能修改');
  });
  it('allows a new novel but rejects a suffixed metadata path at publication', () => {
    expect(() => validateEntry({ collection: 'novels', data: { slug: 'new-story' }, newRecord: true }, novels)).not.toThrow();
    expect(() => validateEntry({ collection: 'novels', data: { slug: 'new-story' }, newRecord: true, path: 'content/novel/new-story/meta-1.json' }, novels, true)).toThrow('不能修改');
  });
  it('rejects duplicate orders across padded and new chapter filenames', () => {
    expect(() => validateEntry({ collection: 'chapters-sodoma', data: { order: 1 }, newRecord: true }, novels)).toThrow('已经使用');
    expect(() => validateEntry({ collection: 'chapters-sodoma', data: { order: 2 }, slug: '001', newRecord: false }, novels)).toThrow('已经使用');
    expect(() => validateEntry({ collection: 'chapters-sodoma', data: { order: 1 }, slug: '001', newRecord: false }, novels)).not.toThrow();
  });
  it('rejects automatically suffixed chapter URLs but permits normal chapters', () => {
    expect(() => validateEntry({ collection: 'chapters-sodoma', data: { order: 3 }, slug: '3-1', newRecord: true }, novels, true)).toThrow('发生冲突');
    expect(() => validateEntry({ collection: 'chapters-sodoma', data: { order: 3 }, slug: '3', newRecord: true }, novels, true)).not.toThrow();
  });
});
