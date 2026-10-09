/** Validate stable URLs and chapter ordering before Decap writes or publishes. */
export function updatePublishedEntry(entry, novels, unpublished = false) {
  const { collection, data, slug } = entry;
  if (collection === 'novels' && !unpublished && !novels.some(novel => novel.slug === data.slug)) {
    novels.push({ slug: data.slug, chapters: [] });
  }
  if (!collection.startsWith('chapters-')) return;
  const novel = novels.find(novel => novel.slug === collection.slice(9));
  if (!novel) return;
  novel.chapters = novel.chapters.filter(chapter => chapter.slug !== slug);
  if (!unpublished) novel.chapters.push({ slug, order: data.order });
}

export function validateEntry(entry, novels, publishing = false) {
  const { collection, data, path, slug, newRecord } = entry;
  if (collection === 'novels') {
    const expected = `content/novel/${data.slug}/meta.json`;
    if (newRecord && novels.some(novel => novel.slug === data.slug)) {
      throw new Error('这个作品网址已经存在，请换一个不重复的网址标识。');
    }
    if ((!newRecord || publishing) && path && path !== expected) {
      throw new Error('作品网址不能修改或重复。请保持原网址，新作品请使用新的网址标识。');
    }
  }
  if (collection.startsWith('chapters-')) {
    const chapters = novels.find(novel => novel.slug === collection.slice(9))?.chapters || [];
    if (chapters.some(chapter => chapter.order === data.order && (newRecord || chapter.slug !== slug))) {
      throw new Error('这个章节顺序已经使用，请填写一个不重复的顺序数字。');
    }
    if (publishing && !chapters.some(chapter => chapter.slug === slug) && slug !== String(data.order)) {
      throw new Error('章节网址发生冲突，请为新章节选择一个未使用的顺序数字。');
    }
  }
}
