<div align="center">

```
            ███╗   ██╗███████╗██╗    ██╗    ███████╗████████╗ ██████╗  ██████╗██╗  ██╗███████╗
            ████╗  ██║██╔════╝██║    ██║    ██╔════╝╚══██╔══╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝
            ██╔██╗ ██║█████╗  ██║ █╗ ██║    ███████╗   ██║   ██║   ██║██║     █████╔╝ ███████╗
            ██║╚██╗██║██╔══╝  ██║███╗██║    ╚════██║   ██║   ██║   ██║██║     ██╔═██╗ ╚════██║
            ██║ ╚████║███████╗╚███╔███╔╝    ███████║   ██║   ╚██████╔╝╚██████╗██║  ██╗███████║
            ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝     ╚══════╝   ╚═╝    ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝
```

### 🔐 企业级安全 • 📊 实时数据 • ⚡ 极速响应

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)](https://www.framer.com/motion/)

[![Security](https://img.shields.io/badge/Security-Zero_Frontend_Keys-green?style=for-the-badge&logo=shield&logoColor=white)]()
[![API](https://img.shields.io/badge/API-Serverless_Proxy-purple?style=for-the-badge&logo=amazonaws&logoColor=white)]()
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white)]()
[![Performance](https://img.shields.io/badge/Performance-A+-orange?style=for-the-badge&logo=lighthouse&logoColor=white)]()

</div>

---

## 🔥 项目介绍
![首页](https://github.com/loopsteam/dashboard/blob/main/images/front.png)
**New Stocks** 是将实时市场数据、新闻资讯和货币汇率聚合。采用现代Web技术构建，专为金融爱好者设计。

### ⚡ 核心功能

- 📰 **实时新闻推送**
![新闻](https://github.com/loopsteam/dashboard/blob/main/images/news.png)
- 📈 **实时市场数据**
![股市](https://github.com/loopsteam/dashboard/blob/main/images/Stocks.png)

## 🚀 快速开始

### 📋 环境要求

```bash
╭─────────────────────────────────────╮
│  System Requirements               │
├─────────────────────────────────────┤
│  Node.js    >= 16.14.0             │
│  npm        >= 8.0.0               │
│  Git        >= 2.0.0               │
│  Memory     >= 2GB RAM             │
╰─────────────────────────────────────╯
```

### 🛠️ 本地开发

```bash
# 1️⃣ 克隆项目
git clone https://github.com/your-username/news-stocks.git
cd news-stocks

# 2️⃣ 安装依赖
npm install

# 3️⃣ 配置环境变量 (本地开发)
cp .env.example .env
# 编辑 .env 文件，添加你的API密钥

# 4️⃣ 启动开发服务器
npm start

# 🌐 浏览器访问: http://localhost:3000
```

### 🚀 生产部署

```bash
# 🔒 安全构建 (自动清理API密钥)
npm run build:safe

# 🚀 Netlify 部署
netlify deploy --prod --dir=build

```

## 🛠️ 技术栈

```bash
┌─────────────────────────────────────────────────────────┐
│ 🎨 Frontend Stack                                       │
├─────────────────────────────────────────────────────────┤
│ ⚛️  React 18.2.0 + TypeScript                          │
│ ✨ Framer Motion 6.5.1 (Smooth animations)            │
│ 🎨 Lucide React (Beautiful SVG icons)                │
│ 🌐 Axios (HTTP client with interceptors)             │
│ 📈 Recharts (Data visualization)                     │
│ 🛠️  Create React App (Zero-config tooling)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🔐 Backend & Security                                   │
├─────────────────────────────────────────────────────────┤
│ 🛡️  Netlify Functions (Serverless proxy)               │
│ 🔒 Zero Frontend API Keys (Enterprise security)       │
│ 🔄 HTTP Proxy Middleware (CORS handling)              │
│ 💾 Smart Caching System (Memory + localStorage)       │
└─────────────────────────────────────────────────────────┘

```

## 🔒 安全特性

### 🛡️ 零前端密钥架构

```bash
╭─ Security Layer ─────────────────────────────────╮
│                                                  │
│  🌐 Frontend (React)                             │
│  ├─ ❌ No API keys exposed                       │
│  ├─ ✅ Environment auto-detection                │
│  └─ ✅ Secure endpoint routing                   │
│                                                  │
│  🔒 Netlify Functions (Serverless)               │
│  ├─ ✅ Server-side API key injection             │
│  ├─ ✅ CORS handling                             │
│  └─ ✅ Request/response filtering                │
│                                                  │
│  🔐 External APIs                                │
│  ├─ ✅ Rate limiting protection                  │
│  ├─ ✅ Error handling & fallbacks               │
│  └─ ✅ Response caching                          │
│                                                  │
╰──────────────────────────────────────────────────╯
```

## 📊 性能优化

- ⚡ **并发请求**: 智能API调用并行化
- 💾 **多级缓存**: 内存缓存 + localStorage持久化
- 🎨 **动画优化**: GPU加速 + 60fps流畅体验
- 📱 **响应式设计**: 移动端友好，自适应布局
- 🔄 **懒加载**: 组件级代码分割

## 🌐 浏览器支持

| 浏览器 | 版本要求 | 支持状态 | 特性 |
|---------|----------|----------|------|
| 🌐 Chrome | 90+ | ✅ 完全支持 | 所有特性 |
| 🦊 Firefox | 88+ | ✅ 完全支持 | 所有特性 |
| 🦭 Safari | 14+ | ✅ 完全支持 | 所有特性 |
| 🗺️ Edge | 90+ | ✅ 完全支持 | 所有特性 |
| 📱 Mobile | iOS 14+/Android 10+ | ✅ 完全支持 | 响应式 |

## 📜 开源协议

此项目基于 [MIT License](LICENSE) 开源协议

---

<div align="center">

### 🌟 如果这个项目对你有帮助，请给个 Star！

[![GitHub stars](https://img.shields.io/github/stars/loopsteam/dashboard?style=social)](https://github.com/loopsteam/dashboard/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/loopsteam/dashboard?style=social)](https://github.com/loopsteam/dashboard/network)

[🐛 报告Bug](https://github.com/loopsteam/dashboard/issues) • [✨ 请求功能](https://github.com/loopsteam/dashboard/issues) • [📚 查看文档](https://github.com/loopsteam/dashboard/wiki)

**让金融数据触手可及** 📈

</div>