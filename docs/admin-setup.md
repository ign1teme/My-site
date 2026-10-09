# 枝海内容后台

后台入口：`https://hanam7.win/admin`。编辑器使用自行托管的 Decap CMS 3.15.1，中文界面，只展示有写权限的 GitHub 账号可以管理的内容。公开访问后台入口本身不会授予编辑权限。

## 一次性上线配置

1. 在 [GitHub OAuth Apps](https://github.com/settings/developers) 创建 OAuth App：
   - Application name：`枝海内容后台`
   - Homepage URL：`https://hanam7.win`
   - Authorization callback URL：`https://hanam7.win/api/admin/callback`
2. 在现有 Vercel 项目的 **Settings → Environment Variables** 中填写：

   | 名称 | 值 / 用途 |
   | --- | --- |
   | `GITHUB_CLIENT_ID` | OAuth App 的 Client ID |
   | `GITHUB_CLIENT_SECRET` | OAuth App 的 Client Secret，仅在服务器使用 |
   | `CMS_GITHUB_REPO` | `ign1teme/My-site`，保存内容的仓库 |
   | `CMS_GITHUB_BRANCH` | Vercel 当前生产分支；默认 `main`，上线前核对 |
   | `CMS_SITE_URL` | `https://hanam7.win`，必须与后台实际使用的域名一致 |
   | `CMS_GITHUB_PRIVATE_REPO` | 公开仓库为 `false`；私有仓库为 `true` |

   不要将密钥放在 `NEXT_PUBLIC_*` 变量、GitHub 文件或聊天消息里。
3. Vercel 的 Framework Preset 使用 **Next.js**，Build Command 为 `npm run build`。移除任何将 Output Directory 强制设为 `out` 的覆盖，恢复框架默认值。本版本不再使用 `output: 'export'`，因为登录回调必须在服务器处理。
4. 部署本次代码。读者页面仍然预生成，只有后台配置与授权接口使用服务器。确认 Vercel 的 Git 集成监听上面指定的生产分支；环境变量修改后也需要重新部署。
5. 从 `https://hanam7.win/admin` 登录 GitHub，允许弹出窗口。使用对仓库有写权限的站点管理员账号。首次授权为公开仓库请求 `public_repo`；私有仓库请求 `repo`，GitHub OAuth 的这些权限范围并不局限于单一仓库。
6. 用一篇测试文章验证“保存草稿 → 就绪 → 发布 → Vercel 部署成功 → 网站出现”。本地内存演示不能代替这一步真实联调。

如果先用 `hanaumi.vercel.app` 验证，将 OAuth App 回调和 `CMS_SITE_URL` 都改为该域名；不要从另一个域名混用授权窗口。本地测试建议另建 OAuth App，避免混用生产凭据。

## 日常操作

- **博客文章**：点新建文章，填写标题、显示日期、分类和摘要，在正文中直接写作。工具栏支持标题、加粗、引用、链接、列表和插图。日期用于文章显示及新文章地址，不提供定时发布。
- **小说资料**：修改作品名、简介、状态与封面。新建作品需要一个不重复的英文网址标识，如 `new-story`。已存在的作品网址不能修改。作品删除关闭，避免留下没有归属的章节。
- **作品章节**：选择作品对应的章节栏目，新建章节并填写不重复的顺序数字。原有 `001` 等章节链接保持不变。新章节使用顺序数字作为文件名，排序依据表单中的顺序数字。
- **首页与关于**：编辑开篇标题、介绍、主图，博客和小说栏目标题，以及关于介绍的各段文字。
- **图片**：在图片字段或正文插图工具中选择/上传。文件存入 `public/uploads`，网站路径为 `/uploads/...`。建议使用压缩后的 WebP、JPEG 或 PNG，单张尽量控制在 2 MB 内。

保存首先生成草稿。准备公开时，将状态改为“就绪”，然后点“发布 → 立即发布”。发布合并到生产分支，随后 Vercel 自动构建网站；后台显示已发布代表内容已写入 GitHub，仍需等待网站部署成功。首页和小说信息也遵循此流程。

新作品先发布资料，等 Vercel 更新成功后刷新后台，即可在左侧看到新作品的章节栏目。浏览器预览显示正文排版；完整网站效果以部署预览或正式页面为准。

草稿保存在 GitHub 的工作分支。公开仓库中的草稿可能被直接访问 GitHub 的人看到；若草稿需要保密，应使用私有仓库。GitHub 分支保护可能要求审核，后台不会绕过这些规则。

GitHub 授权使用到期令牌，登录过期时重新登录即可。编辑器使用 Decap 的浏览器登录会话；在共用电脑上使用后请从右上角退出登录。Client Secret 始终留在服务器，登录回调使用签名 state、PKCE、短期 HttpOnly cookie，并核验仓库写权限。

## 本地体验与验证

```sh
npm ci
npm run dev
```

打开 `http://localhost:3000/admin`，可点击“先体验编辑器”。体验模式读取当前网站的内容，所有保存和发布都只发生在浏览器内存中，刷新后消失，不写入文件或 GitHub。正式生产环境完全关闭体验模式。

```sh
npm run test:coverage
npm run build
npm run start
```

浏览器回归脚本为 `tests/browser-admin.cjs`，在运行开发服务器且 Node 能加载 Playwright 时执行 `node tests/browser-admin.cjs`；默认使用已安装的 Edge，可用 `BROWSER_CHANNEL=chrome` 改为 Chrome。截图写入忽略目录 `.artifacts/admin/`。脚本只使用内存体验模式，不操作线上仓库。

## 维护与回退

- 编辑器固定在本地 `public/admin/vendor/`，版本、来源和校验值见该目录 README，第三方许可同时保留。读者页面不会加载编辑器脚本。
- 升级 Decap 时重新检查保存/发布与 375px 编辑界面；手机适配样式依赖固定版本的组件标签。
- 内容仍采用原有 Markdown / JSON 格式，之前的文章、章节和网址无需迁移。可以通过 GitHub 历史回退某一次内容修改，Vercel 将重新构建。
- 若撤回后台功能，读者站点可继续读取原有内容；首页可编辑文案现在位于 `content/pages/home.json`，恢复旧代码前保留这个文件作为备份。

参考：[Decap GitHub 后端](https://decapcms.org/docs/github-backend/)、[编辑工作流](https://decapcms.org/docs/editorial-workflows/)、[GitHub OAuth 授权](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)。
