# 妮妮的工作台 - 部署指南

## 最简单的方案：GitHub Pages（免费、永久、HTTPS）

### 步骤 1：注册 GitHub
打开 https://github.com/signup ，用邮箱注册一个账号（免费）

### 步骤 2：创建仓库
1. 登录 GitHub 后点击右上角 "+" → "New repository"
2. Repository name 填：nini-workbench
3. 勾选 "Add a README file"
4. 点击 "Create repository"

### 步骤 3：上传文件
1. 在新仓库页面点击 "Add file" → "Upload files"
2. 把 nini-workbench.zip 解压后的所有文件拖进去
3. 点击 "Commit changes"

### 步骤 4：开启 GitHub Pages
1. 点击 Settings（设置）
2. 左侧菜单找到 Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main"，文件夹选 "/ (root)"
5. 点击 Save

### 步骤 5：访问你的 App
等待 1-2 分钟，GitHub 会给你一个固定链接：
https://你的用户名.github.io/nini-workbench/

用 iPhone Safari 打开这个链接 → 分享 → 添加到主屏幕

---

## 其他免费托管方案

### Vercel（推荐，国内访问快）
1. 打开 https://vercel.com 用 GitHub 账号登录
2. 点击 "Add New Project"
3. 导入你的 nini-workbench 仓库
4. 点击 Deploy，几秒后得到链接

### Netlify
1. 打开 https://netlify.com 用 GitHub 账号登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub 仓库 nini-workbench
4. 点击 Deploy site

---

## 数据更新

时政数据每天更新在 builtin-data.js 文件中。
需要更新时，替换这个文件后重新部署即可。
