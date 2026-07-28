# 妮妮的工作台 — 每日必读自动更新部署指南

## 一步到位：自动每天9点更新时政申论

### 1. 在 GitHub 新建一个公开仓库
- 登录 https://github.com → New repository
- 名字随意，如 `nini-news`
- 选 **Public**（公开）
- 勾选 "Add a README file"
- 点 Create repository

### 2. 上传本目录的以下文件到仓库
把 `/workspace/lifehub/` 下的这些文件上传到仓库根目录：
- `fetch-news.js`
- `.github/workflows/daily-news.yml`

上传方法：在 GitHub 仓库页面点 "Add file → Upload files"，拖入文件即可。

### 3. 开启 GitHub Pages
- 仓库 → Settings → Pages
- Source 选 **main** 分支，文件夹选 **/(root)**
- 点 Save，等1-2分钟会显示一个地址，如：
  `https://你的用户名.github.io/nini-news/`

### 4. 在 App 里填入地址
- 打开"妮妮的工作台" → 设置
- 在"GitHub Pages 新闻源地址"填入：
  `https://你的用户名.github.io/nini-news`
- 点"保存地址"

### 5. 完成！
- GitHub Actions 每天9点自动运行 `fetch-news.js`
- 抓取最新微博热搜、百度热搜新闻，生成 `news/daily-YYYY-MM-DD.json`
- App 打开"每日必读"时自动 fetch 当天 JSON，显示实时新闻
- 往日内容保留在仓库，可回溯查看

### 注意
- GitHub Actions 免费额度充足（每天1次运行）
- 仓库公开，但只存新闻摘要，**不含任何个人数据**
- 个人数据全部存在你的 iPhone 本地，不会上传
