import { siteConfig } from './site';

type Field = { name: string; label?: string; widget: string; [key: string]: unknown };
type Collection = {
  name: string; label: string; fields?: Field[];
  files?: { name: string; label: string; file: string; fields: Field[] }[];
  [key: string]: unknown;
};

const field = (name: string, label: string, widget = 'string', extra = {}): Field => ({ name, label, widget, ...extra });
const body = field('body', '正文', 'markdown', { modes: ['rich_text'], hint: '直接输入文字，用工具栏设置标题、加粗、链接和图片。' });
const media = { media_folder: '/public/uploads', public_folder: '/uploads' };

export function cmsRepository() {
  const repo = process.env.CMS_GITHUB_REPO || 'ign1teme/My-site';
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Invalid CMS repository');
  return repo;
}

export function cmsOrigin() {
  const url = new URL(process.env.CMS_SITE_URL || siteConfig.url);
  const local = process.env.NODE_ENV === 'development' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((!local && url.protocol !== 'https:') || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Invalid CMS origin');
  }
  return url.origin;
}

export function createCmsConfig(novels: { slug: string; title: string }[]) {
  const collections: Collection[] = [
    {
      name: 'blog', label: '博客文章', label_singular: '文章', folder: 'content/blog',
      create: true, slug: '{{fields.date}}-{{slug}}',
      preview_path: 'blog/{{slug}}', summary: '{{title}} · {{date}}',
      sortable_fields: ['date', 'title'],
      fields: [
        field('title', '文章标题'),
        field('date', '显示日期', 'datetime', { format: 'YYYY-MM-DD', date_format: 'YYYY-MM-DD', time_format: false, picker_utc: true, hint: '用于排序，不是定时发布。点击发布后即进入网站更新流程。' }),
        field('tag', '分类', 'string', { required: false }),
        field('excerpt', '摘要', 'text', { hint: '显示在首页文章列表中。' }), body,
      ],
    },
    {
      name: 'novels', label: '小说资料', label_singular: '作品', folder: 'content/novel',
      create: true, delete: false, extension: 'json', format: 'json',
      path: '{{slug}}/meta', slug: '{{fields.slug}}', ...media,
      summary: '{{title}} · {{status}}',
      description: '新作品发布并完成网站更新后，刷新后台即可看到它的章节栏目。',
      fields: [
        field('title', '作品名称'),
        field('slug', '作品网址标识', 'string', { pattern: ['^[a-z0-9]+(?:-[a-z0-9]+)*$', '请使用小写英文字母、数字和短横线'], hint: '例如 spring-tide。用于作品网址，创建后请保持不变。' }),
        field('description', '作品简介', 'text'),
        field('status', '作品状态', 'select', { options: ['连载中', '已完结', '短篇', '暂停更新'], default: '连载中' }),
        field('cover', '作品封面', 'image', { required: false, ...media }),
        field('coverAlt', '封面描述', 'string', { required: false, hint: '为无法查看图片的读者描述画面。' }),
      ],
    },
    ...novels.map((novel): Collection => ({
      name: `chapters-${novel.slug}`, label: `${novel.title} · 章节`, label_singular: '章节',
      folder: `content/novel/${novel.slug}`, create: true, slug: '{{fields.order}}',
      preview_path: `novel/${novel.slug}/{{slug}}`, summary: '第 {{order}} 章 · {{title}}',
      sortable_fields: ['order', 'title'],
      fields: [field('title', '章节标题'), field('order', '章节顺序', 'number', { value_type: 'int', min: 1, step: 1, hint: '填写不重复的正整数，目录会按此顺序排列。已有章节的链接保持不变。' }), body],
    })),
    {
      name: 'pages', label: '首页与关于', delete: false,
      files: [{
        name: 'home', label: '首页内容', file: 'content/pages/home.json',
        fields: [
          field('hero', '首页开篇', 'object', { fields: [
            field('titleFirst', '标题第一行'), field('titleSecond', '标题第二行'),
            field('subtitle', '介绍', 'text'), field('image', '主图', 'image'), field('imageAlt', '主图描述'),
          ] }),
          field('blog', '博客栏目', 'object', { fields: [field('title', '栏目标题'), field('intro', '栏目介绍', 'text')] }),
          field('novel', '小说栏目', 'object', { fields: [field('title', '栏目标题'), field('intro', '栏目介绍', 'text')] }),
          field('about', '关于枝海', 'object', { fields: [field('title', '标题'), field('lede', '短介绍', 'text'), field('paragraphs', '介绍段落', 'list', { field: field('paragraph', '段落', 'text'), min: 1 })] }),
        ],
      }],
    },
  ];
  return {
    backend: { name: 'github', repo: cmsRepository(), branch: process.env.CMS_GITHUB_BRANCH || 'main', base_url: cmsOrigin(), auth_endpoint: 'api/admin/auth' },
    load_config_file: false, locale: 'zh_Hans', publish_mode: 'editorial_workflow',
    site_url: siteConfig.url, display_url: siteConfig.url, logo_url: '/admin/brand.svg',
    media_folder: 'public/uploads', public_folder: '/uploads',
    slug: { encoding: 'unicode', clean_accents: false, sanitize_replacement: '-' },
    collections,
  };
}
