# 微排版助手网站版

这是一个纯静态的微信公众号文章排版网站，可以直接托管到 GitHub Pages 或 Cloudflare Pages。

## 本地预览

直接打开 `index.html` 即可使用。也可以用任意静态服务器预览：

```bash
python -m http.server 8080
```

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库，例如 `wechat-layout-site`。
2. 把本目录里的 `index.html`、`styles.css`、`app.js`、`.nojekyll`、`README.md` 上传到仓库根目录。
3. 进入仓库 `Settings`。
4. 打开 `Pages`。
5. 在 `Build and deployment` 里选择 `Deploy from a branch`。
6. Branch 选择 `main`，目录选择 `/root`，保存。
7. 等待 GitHub Actions / Pages 完成发布。

发布地址通常是：

```text
https://你的用户名.github.io/wechat-layout-site/
```

## 部署到 Cloudflare Pages

1. 登录 Cloudflare Dashboard。
2. 进入 `Workers & Pages`。
3. 创建 Pages 项目，选择连接 GitHub。
4. 选择你的仓库。
5. Framework preset 选择 `None` 或静态站点。
6. Build command 留空。
7. Build output directory 填 `/`。
8. 点击部署。

首次部署后，Cloudflare 会给你一个 `*.pages.dev` 域名。后续每次推送到 GitHub，Cloudflare Pages 会自动重新部署。

## 使用方式

1. 在左侧正文编辑区写文章或导入纯文本。
2. 用左侧工具选择主题、插入标题、引用、重点框、分隔线等模块。
3. 右侧实时查看公众号样式预览。
4. 点击 `复制富文本`，然后粘贴到微信公众号编辑器。
5. 如果富文本复制被浏览器限制，可以点击 `复制 HTML`。

## 文件说明

- `index.html`：页面结构
- `styles.css`：界面和公众号排版样式
- `app.js`：编辑器、主题、复制和导出逻辑
- `.nojekyll`：让 GitHub Pages 按静态文件原样发布
