/* Run against `npm run dev`. Requires Playwright (or the Codex bundled NODE_PATH). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, timezoneId: 'Europe/Helsinki' });
  page.setDefaultTimeout(15_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept()); // Only the isolated in-memory publish flow is exercised.
  fs.mkdirSync('.artifacts/admin', { recursive: true });
  try {
    await page.goto('http://127.0.0.1:3000/admin');
    await page.getByText('等待首次授权配置', { exact: true }).waitFor();
    await page.screenshot({ path: '.artifacts/admin/setup-desktop.png' });
    await page.goto('http://127.0.0.1:3000/admin?demo=1');
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await page.getByRole('link', { name: /新站点上线/ }).waitFor();
    await page.screenshot({ path: '.artifacts/admin/list-desktop.png' });
    await page.getByRole('link', { name: /新站点上线/ }).click();
    await page.getByLabel('文章标题', { exact: true }).waitFor();
    await page.frameLocator('iframe').getByRole('heading', { name: '新站点上线', exact: true }).waitFor();
    await page.screenshot({ path: '.artifacts/admin/editor-desktop.png' });
    await page.setViewportSize({ width: 375, height: 812 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: '.artifacts/admin/editor-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://127.0.0.1:3000/admin/index.html?demo=1#/collections/blog/new');
    await page.getByLabel('文章标题', { exact: true }).fill('后台发布测试');
    await page.getByLabel('显示日期', { exact: true }).fill('2026-10-04');
    await page.getByLabel('摘要', { exact: true }).fill('可视化写作测试');
    await page.locator('[contenteditable=true]').fill('这是一段直接输入的正文。');
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await page.waitForFunction(() => Object.keys(window.repoFilesUnpublished).length === 1);
    const draft = await page.evaluate(() => Object.values(window.repoFilesUnpublished)[0]);
    assert.equal(draft.slug, '2026-10-04-后台发布测试');
    assert.match(draft.diffs[0].content, /date: 2026-10-04/);
    assert.equal(await page.evaluate(() => Object.keys(window.repoFiles.content.blog).length), 3);
    await page.getByRole('button', { name: '状态: 草稿', exact: true }).click();
    await page.getByText('就绪', { exact: true }).click();
    await page.getByRole('button', { name: '状态: 就绪', exact: true }).waitFor();
    await page.getByRole('button', { name: '发布', exact: true }).click();
    await page.getByText('立即发布', { exact: true }).click();
    await page.waitForFunction(() => Object.keys(window.repoFiles.content.blog).length === 4);
    assert.equal(await page.evaluate(() => Object.keys(window.repoFilesUnpublished).length), 0);
    // All mutations above are confined to Decap's in-memory test backend.
    await page.goto('http://127.0.0.1:3000/admin/index.html?demo=1#/collections/novels');
    await page.getByRole('link', { name: /无神之明.*连载中/ }).waitFor();
    await page.getByRole('link', { name: /无神之明.*连载中/ }).click();
    await page.getByLabel('作品名称', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('作品网址标识', { exact: true }).inputValue(), 'sodoma');
    await page.getByRole('button', { name: '选择图片', exact: true }).click();
    await page.locator('input[type=file]').setInputFiles('public/images/novel-sodoma.webp');
    await page.getByText('novel-sodoma.webp', { exact: true }).waitFor();
    await page.getByRole('button', { name: '选用已选中项目', exact: true }).click();
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await page.waitForFunction(() => Object.keys(window.repoFilesUnpublished).length === 1);
    const coverDraft = await page.evaluate(() => Object.values(window.repoFilesUnpublished)[0]);
    assert.equal(coverDraft.diffs.find(diff => diff.path.endsWith('.webp')).path, 'public/uploads/novel-sodoma.webp');
    assert.equal(JSON.parse(coverDraft.diffs.find(diff => diff.path.endsWith('.json')).content).cover, '/uploads/novel-sodoma.webp');
    await page.goto('http://127.0.0.1:3000/admin/index.html?demo=1#/collections/novels/new');
    await page.getByLabel('作品名称', { exact: true }).fill('新作测试');
    await page.getByLabel('作品网址标识', { exact: true }).fill('new-story');
    await page.getByLabel('作品简介', { exact: true }).fill('新建作品的兼容性测试。');
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await page.waitForFunction(() => Boolean(window.repoFilesUnpublished['novels/new-story/meta']));
    const novelDraft = await page.evaluate(() => window.repoFilesUnpublished['novels/new-story/meta']);
    assert.equal(novelDraft.diffs[0].path, 'content/novel/new-story/meta.json');
    assert.equal(JSON.parse(novelDraft.diffs[0].content).title, '新作测试');
    await page.goto('http://127.0.0.1:3000/admin/index.html?demo=1#/collections/chapters-sodoma');
    await page.getByRole('link', { name: /第一章/ }).waitFor();
    await page.goto('http://127.0.0.1:3000/admin/index.html?demo=1#/collections/pages/entries/home');
    await page.getByLabel('标题第一行', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('标题第一行', { exact: true }).inputValue(), '文字是枝，');
    assert.deepEqual(errors, []);
    console.log('PASS: existing content, rich-text preview, isolated draft/publish, date/URL consistency, new novel metadata, image upload paths, chapters, homepage settings, 375px editor; no browser errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
