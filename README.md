# 🎬 Emby-Cloudflare-Proxy (Universal & Cached)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/your-username/Emby-Cloudflare-Proxy?style=social)](https://github.com/your-username/Emby-Cloudflare-Proxy)

一个基于 Cloudflare Workers / Pages 的 Emby & Jellyfin 全能反向代理工具。  
它不仅能加速你的 Emby 远程访问，还内置了**智能图片缓存**（海报墙秒开）和**隐身安全模式**（防扫描）。只需一次部署，即可代理任意服务器。

## ✨ 核心特性
| 特性 | 说明 |
|------|------|
| ⚡ 极速海报墙缓存 | 自动识别 Emby/Jellyfin 海报、封面图等静态资源，CDN 边缘缓存大幅提升加载速度，降低源站带宽压力 |
| ⏱️ API 微缓存 | 独家解决 Resume 接口 1.5s 延迟问题！将慢速接口微缓存 10 秒，频繁进退详情页彻底告别转圈圈。 |
| 🛡️ 隐身安全模式 | 强制拦截 `*.workers.dev` / `*.pages.dev` 默认域名访问，仅支持自定义域名，防止恶意扫描 |
| 🌐 万能通用架构 | 拼接 URL 即可代理任意服务器（`https://你的域名/https://目标IP`），无需修改代码 |
| 📡 完整 WebSocket 支持 | 完美兼容 Emby 远程控制、实时通知、播放状态同步等核心功能 |
| 🤖 多平台部署 | 支持 Cloudflare Workers / Pages 部署，兼容 GitHub Actions 自动更新 |

## 🚀 部署指南 (三选一)
### 方式 A：一键部署 (推荐给 Workers 用户)
点击下方按钮，直接将代码部署到你的 Cloudflare 账号：  

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/lijboys/EmbyProxy)

手动部署 CF Worker：
   - 在 CF Worker 控制台中创建一个新的 Worker。
   - 将 [worker.js](https://github.com/lijboys/EmbyProxy/blob/main/_worker.js) 的内容粘贴到 Worker 编辑器中。
   - 点击 `保存`即可。

### 方式 B：Cloudflare Pages 部署 (推荐，更稳定)
1. Fork 本仓库到你的 GitHub 账号；
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入「Workers & Pages」；
3. 点击「Create Application → Pages → Connect to Git」；
4. 选择你 Fork 的仓库，配置如下（**关键**）：
   | 配置项 | 值 |
   |--------|-----|
   | Framework preset | None |
   | Build command | (留空) |
   | Build output directory | (留空) |
5. 点击「Save and Deploy」，等待部署完成。

### 方式 C：GitHub Actions (自动同步更新)
适合需要修改代码后自动部署的场景：
1. 在 Cloudflare 获取以下信息：
   - `CF_API_TOKEN`：需授予「编辑 Workers/Pages」权限的 API 令牌（[生成地址](https://dash.cloudflare.com/profile/api-tokens)）；
   - `CF_ACCOUNT_ID`：Cloudflare 账户 ID（控制台右上角「我的个人资料」→「账户ID」）；
2. 进入 GitHub 仓库 →「Settings → Secrets and variables → Actions」，添加上述两个密钥；
3. 修改代码并提交到仓库，Actions 会自动触发部署流程。

## ⚙️ 关键配置 (重要)
### 1. 绑定自定义域名 (必做)
为了安全，项目默认禁止 Cloudflare 分配的默认域名（如 `xxx.workers.dev`/`xxx.pages.dev`）访问，**必须绑定自定义域名**：
- **Workers**：进入 Worker →「Settings → Triggers → Add Custom Domain」，填写你的域名（如 `emby.mysite.com`）；
- **Pages**：进入 Pages 项目 →「Custom domains → Set up a custom domain」，填写你的域名并完成 DNS 解析。

### 2. 代码配置项 (可选)
打开 `_worker.js` 文件，修改顶部的配置参数（建议保持默认）：
```javascript
// 是否开启图片缓存？(建议 true，海报墙加速核心)
const ENABLE_IMAGE_CACHE = true; 

// 默认域名拦截的提示语
const BLOCK_MSG = 'Access Denied: Please use custom domain.';

// 可选：添加黑名单域名（禁止代理的服务器）
const BLOCKED_DOMAINS = [
  // 'malicious.com' // 取消注释并添加需屏蔽的域名
];
```

## 📖 使用方法
部署并绑定自定义域名后，按以下格式拼接 URL 访问 Emby/Jellyfin：
```
https://你的自定义域名/目标Emby服务器地址
```

### 示例
| 配置项 | 内容 |
|--------|------|
| 你的自定义域名 | `https://emby.mysite.com` |
| 目标 Emby 地址 | `http://emby.公益.xyz:8096` |
| 最终访问地址 | `https://emby.mysite.com/http://emby.公益.xyz:8096` |

将最终地址填入 Emby 客户端（Infuse/浏览器/TV 端）即可正常使用。

## ❓ 常见问题 (FAQ)
<details>
<summary>Q1: 打开网页显示 "Access Denied: Please use custom domain"？</summary>
这是正常的安全保护机制，你正在使用 Cloudflare 默认域名（如 xxx.workers.dev）访问。请在 Cloudflare 后台绑定自定义域名（如 emby.yourdomain.com），并使用新域名访问。
</details>

<details>
<summary>Q2: 能播放，但海报加载还是慢？</summary>
1. 确认代码中 `ENABLE_IMAGE_CACHE = true`；<br>
2. CDN 缓存为「热缓存」：第一次访问需回源拉取（稍慢），第二次及后续访问会直接从 CDN 读取（秒开）；<br>
3. 多刷新几次海报墙，让 CDN 完成缓存预热。
</details>

<details>
<summary>Q3: 支持 HTTPS 的 Emby 服务器吗？</summary>
完全支持。直接将 HTTPS 地址拼接到自定义域名后即可，示例：<br>
`https://emby.mysite.com/https://emby.secure-server.com:8920`
</details>

<details>
<summary>Q4: 每天有多少流量限制？</summary>
Cloudflare Workers 免费版限制：<br>
- 每日请求数：100,000 次<br>
- 每日出站带宽：10GB<br>
对于个人使用（每天几部电影 + 刷海报墙）完全够用，无需担心超限。
</details>

<details>
<summary>Q5: WebSocket 功能失效（通知/播放同步异常）？</summary>
1. 确认代码中包含 WebSocket 处理逻辑（本项目默认集成）；<br>
2. 检查自定义域名的 DNS 解析是否为「Proxied」（云朵图标点亮）；<br>
3. 清除客户端缓存后重新连接服务器。
</details>

## ⚠️ 免责声明
- 本项目仅供学习交流使用，请勿用于商业或非法用途；
- 使用本工具产生的流量费用、法律责任均由使用者自行承担；
- 请严格遵守 Cloudflare 服务协议及目标 Emby/Jellyfin 服务器的使用规则。

## 📄 许可证
本项目基于 MIT 协议开源 - 详见 [LICENSE](LICENSE) 文件。
