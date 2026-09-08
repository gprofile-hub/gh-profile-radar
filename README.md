# 📡 gh-profile-radar

> 一款部署在 Cloudflare Pages 上的 GitHub 账号年龄查询工具，通过安全的后端代理获取用户公开资料，自动计算账号年龄，并优雅展示统计信息。

[![GitHub Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/pages/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## ✨ 功能特点

- 🔍 **查询 GitHub 用户公开信息**：用户名、头像、显示名、账号类型、所在地等。
- 📅 **自动计算账号年龄**：精确到“X 年 X 个月 X 天”，并显示总天数。
- 📊 **展示公开统计数据**：公开仓库数、粉丝数、关注数、公开 Gist 数。
- ⚡ **智能认证代理**：后端通过环境变量 `GITHUB_TOKEN` 自动选择认证模式（未认证 60 次/小时，认证后 5000 次/小时）。
- 🎨 **现代化 UI**：毛玻璃质感、柔和渐变、响应式设计，适配桌面与移动端。
- 🔐 **令牌安全**：令牌存储在 Cloudflare 环境变量中，永不暴露给前端。
- 🚀 **一键部署**：基于 Cloudflare Pages Functions，无需管理服务器。

---

## 🖥️ 在线演示

<img width="1919" height="932" alt="image" src="https://github.com/user-attachments/assets/f9c60e08-2f93-42a0-9f1a-564e522df3cf" />

访问 [https://gh-profile-radar.pages.dev](https://gh-profile-radar.pages.dev) 即可体验（由作者部署，可能会因频率限制暂时不可用）。

---

## 📦 技术栈

- **前端**：原生 HTML5 + CSS3 + JavaScript（无框架依赖）
- **后端代理**：Cloudflare Pages Functions（基于 Workers）
- **API**：GitHub REST API（v3）
- **部署平台**：Cloudflare Pages

---

## 🚀 部署到 Cloudflare Pages（推荐）

### 前置要求

- 一个 [GitHub](https://github.com) 账号（用于生成 Personal Access Token，可选）
- 一个 [Cloudflare](https://dash.cloudflare.com/) 账号（免费版即可）

### 步骤

1. **Fork 或克隆本仓库**  
   ```bash
   git clone https://github.com/your-username/gh-profile-radar.git
   cd gh-profile-radar
   ```

2. **（可选）生成 GitHub Personal Access Token**  
   - 访问 https://github.com/settings/tokens → **Generate new token (classic)**
   - 无需勾选任何权限（仅读取公开信息），直接生成并**复制令牌**。

3. **在 Cloudflare Pages 中创建项目**  
   - 登录 Cloudflare Dashboard → **Pages** → **创建项目** → **连接到 Git**（或直接上传文件夹）。
   - 选择你的仓库，点击 **开始设置**。

4. **配置构建与部署**  
   - 项目名称：`gh-profile-radar`（可自定义）
   - 生产分支：`main`（或你的默认分支）
   - 构建命令：**留空**（纯静态页面无需构建）
   - 输出目录：**留空**（根目录即为输出）

5. **设置环境变量（重要）**  
   在 **环境变量（高级）** 部分添加：
   - 变量名：`GITHUB_TOKEN`
   - 值：粘贴第 2 步生成的令牌（若留空则使用未认证请求，限额 60 次/小时）

   > 提示：环境变量可在部署后随时修改并重新部署。

6. **点击“保存并部署”**  
   Cloudflare 会自动构建并发布，几分钟后你的站点即可访问。

---

## 🛠️ 本地开发（可选）

如果你希望在本地调试或修改：

1. **安装 Wrangler CLI（Cloudflare 开发工具）**  
   ```bash
   npm install -g wrangler
   ```

2. **克隆代码并在项目根目录运行**  
   ```bash
   wrangler pages dev . --compatibility-date=2024-01-01
   ```
   默认在 `http://localhost:8788` 启动开发服务器。

3. **设置本地环境变量**（可选）  
   创建 `.dev.vars` 文件：
   ```env
   GITHUB_TOKEN=your_personal_access_token
   ```

---

## 📁 项目结构

```
gh-profile-radar/
├── index.html                # 前端主页面
├── functions/
│   └── api/
│       └── github.js         # Pages Functions 后端代理
└── README.md
```

- **前端**：单页应用，包含所有样式与交互逻辑。
- **后端代理**：接收前端请求，携带令牌（如果有）转发至 GitHub API，并返回结果或友好错误信息。

---

## ⚙️ 配置说明

| 环境变量 | 必填 | 说明 |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | 否 | GitHub Personal Access Token。若不设置，则使用未认证请求（限额 60 次/小时）；设置后限额提升至 5000 次/小时。 |

---

## 🔒 安全注意事项

- 令牌仅存储在 Cloudflare 环境变量中，**不会发送到浏览器**，完全避免前端泄露风险。
- 该令牌无需任何权限（`repo`、`user` 等均不需勾选），仅用于提高 API 速率限制。
- 建议定期更换令牌，并确保仅在受信任的 Pages 项目中使用。

---

## 🤝 贡献

欢迎提出问题、建议或提交 PR！请遵循以下流程：

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交修改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---


---

## ☁️ 部署到 Vercel（替代方案）

除 Cloudflare Pages 外，本项目同样支持部署到 **[Vercel](https://vercel.com/)**，适合已有 Vercel 工作流的用户。

### 前置要求

- 一个 [GitHub](https://github.com) 账号
- 一个 [Vercel](https://vercel.com/) 账号（免费版即可）

### 步骤

1. **Fork 本仓库**

2. **（可选）生成 GitHub Personal Access Token**

   访问 <https://github.com/settings/tokens> → **Generate new token (classic)**，无需勾选任何权限，生成后复制令牌。

3. **在 Vercel 中导入项目**

   登录 [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project** → 选择你 Fork 后的仓库 → **Import**。

4. **配置环境变量（重要）**

   在 **Environment Variables** 部分添加：

   | 变量名 | 值 |
   |---|---|
   | `GITHUB_TOKEN` | 粘贴你的 Personal Access Token（可选，留空则限额 60 次/小时） |

5. **点击 Deploy**

   Vercel 会自动读取项目根目录的 `vercel.json`，完成路由和函数配置后一键发布，几分钟内即可通过专属域名访问。

### 本地预览（可选）

```bash
npm i -g vercel
vercel dev
```

默认在 `http://localhost:3000` 启动，环境变量通过 `.env.local` 加载：

```
GITHUB_TOKEN=your_personal_access_token
```

### 与 Cloudflare Pages 的差异

| 对比项 | Cloudflare Pages | Vercel |
|---|---|---|
| 后端运行时 | Pages Functions (Workers) | Serverless / Edge Function |
| API 文件位置 | `functions/api/github.js` | `api/github.js` |
| 环境变量配置 | Cloudflare Dashboard → Environment variables | Vercel Dashboard → Environment Variables |
| 全球节点 | Cloudflare 边缘网络 | Vercel Edge Network |
| 免费额度 | 100,000 请求/天 | 100 GB 带宽/月 + 100,000 函数调用/天 |

> 💡 两种部署方式均已支持，选择你更熟悉的平台即可。

## 🙏 致谢

- [GitHub API](https://docs.github.com/en/rest) 提供的丰富数据接口
- [Cloudflare Pages](https://pages.cloudflare.com/) 提供的无服务器部署平台
- 所有使用和反馈的朋友

---

**享受查询！** 如果觉得有用，别忘了给个 ⭐ Star 支持一下～ 😊
