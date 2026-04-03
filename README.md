# 枝海 — 个人网站

黑白粉配色的个人博客与小说站点，基于 Next.js + Markdown。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000

## 如何管理内容

### 发布博客

在 `content/blog/` 下新建一个 `.md` 文件：

```markdown
---
title: "文章标题"
date: "2026-04-10"
tag: "日常"
excerpt: "首页显示的摘要文字"
---

正文内容，支持 Markdown 语法。

段落之间空一行即可。

> 引用文字这样写

**粗体** 和 *斜体* 也支持。
```

文件名建议格式：`2026-04-10-my-title.md`（日期+英文简称）

### 发布小说 / 新增章节

1. 在 `content/novel/` 下创建小说文件夹（用英文命名），如 `content/novel/my-novel/`
2. 在文件夹内创建 `meta.json`：

```json
{
  "title": "小说名称",
  "description": "一句话简介",
  "status": "连载中",
  "slug": "my-novel"
}
```

3. 每个章节一个 `.md` 文件，用数字命名（`001.md`, `002.md`...）：

```markdown
---
title: "第一章 章节标题"
order: 1
---

章节正文内容...
```

### 删除内容

直接删除对应的 `.md` 文件即可。

### 修改内容

直接编辑对应的 `.md` 文件。

## 发布流程

```bash
git add .
git commit -m "新增文章：xxx"
git push
```

如果部署在 Vercel，push 后会自动构建上线。

## 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入该仓库
3. 框架选择 Next.js，其他默认
4. 点击 Deploy

## 项目结构

```
my-site/
├── app/                    # 页面
│   ├── layout.tsx          # 全局布局（导航、花瓣、页脚）
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式
│   ├── blog/[slug]/        # 博客文章页
│   └── novel/[novel]/      # 小说目录页
│       └── [chapter]/      # 章节阅读页
├── content/                # ← 你的内容都在这里
│   ├── blog/               # 博客 Markdown 文件
│   └── novel/              # 小说文件夹
│       ├── sodoma/         # 每部小说一个文件夹
│       │   ├── meta.json   # 小说信息
│       │   ├── 001.md      # 章节
│       │   └── 002.md
│       └── ...
├── lib/
│   └── content.ts          # 内容读取工具（不用改）
└── package.json
```
