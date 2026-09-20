# 枝海

个人博客与小说站点。保留原有文章、章节和 URL，采用 Next.js 静态导出。

## 本地运行

需要 Node.js 20.9 或更新版本。

```bash
npm ci
npm run dev
```

```bash
npm run test:coverage
npm run build
npm audit --audit-level=moderate
```

构建后的静态文件位于 `out/`。博客文章保存在 `content/blog/*.md`；小说目录为 `content/novel/{slug}/`，包含 `meta.json` 和按顺序编号的章节 Markdown。新增内容后重新构建，静态路由和站点地图会自动更新。

## 设计与素材

界面样式集中在 `app/globals.css`；浅色与深色配色使用根级 CSS 变量。主题选择保存在浏览器本地存储，存储不可用时仍可使用系统偏好。阅读页顶部的细线显示阅读进度。

三张编辑插画位于 `public/images/`，分别用于首页和两部小说。新增小说若需要封面，请在 `lib/artwork.ts` 的共用映射中加入图片路径和替代文本。生成素材的原始 PNG 不包含在部署包内，部署版本为压缩后的 WebP。

## Vercel 与域名

现有站点在 Vercel 发布。仓库中的 `vercel.json` 只添加基础安全响应头，不覆盖项目已有的构建与部署设置。`next.config.js` 保持静态导出和不经服务器处理的图片。

上线顺序：

1. 在本地确认测试、构建和依赖审计通过，完成桌面与手机浏览器检查。
2. 推送已审核的变更到 GitHub，确认现有 Vercel 项目完成生产部署，先在 `hanaumi.vercel.app` 检查新版本。
3. 在同一个 Vercel 项目中添加 `hanam7.win` 与 `www.hanam7.win`，将根域名设为主域名。
4. 使用 Vercel 对该项目显示的 DNS 值，在当前 Cloudflare DNS 中新增所需的根域名 A 记录与 `www` CNAME。不要修改 NS、MX、SPF、DKIM 或 DMARC。
5. 等待 Vercel 验证域名并签发证书；检查 HTTPS、文章与章节 URL、站点地图和 `www` 跳转。

不要预先硬编码 Vercel 的通用 DNS 值；该项目可能要求特定值。域名绑定、DNS 修改和 GitHub 推送应分别确认后执行。
