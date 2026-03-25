# AIfootmark - 足迹地图

AIfootmark 是一款基于 Expo (React Native) 和 Express.js 构建的全栈旅行足迹管理应用。它可以帮助用户记录每一个走过的地方，管理未来的转场心愿，并提供精美的数据统计视图。

## 🌟 核心特性

- **足迹管理 (Footprints)**：详细记录已访问的地标、日期、风景特征及个人感悟。
- **心愿清单 (Wishlist)**：收藏想去的远方，支持一键“打卡”将其转化为正式足迹。
- **数据可视化**：通过直观的图表展示旅行分布于统计数据。
- **跨平台体验**：基于 Expo 构建，支持 iOS 和 Android 体验。
- **响应式 UI**：适配深色模式，拥有现代、灵活且精致的界面逻辑。

## 🛠️ 技术栈

### 前端 (Client)
- **框架**: [Expo](https://expo.dev/) (React Native)
- **路由**: Expo Router (基于文件系统的路由)
- **样式**: Vanilla CSS + React Native 样式系统
- **图标**: Expo Symbols / FontAwesome 6
- **图表**: React Native Chart Kit

### 后端 (Server)
- **实时运行环境**: Node.js + [Express.js](https://expressjs.com/)
- **数据库 ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **云数据库**: [Supabase](https://supabase.com/) (PostgreSQL)
- **语言**: TypeScript

### 工具与管理
- **包管理**: pnpm (Monorepo 架构)
- **环境管理**: dotenv

## 📂 项目结构

```text
├── server/                 # 后端代码 (Express)
│   ├── src/
│   │   ├── routes/         # 接口路由 (足迹、心愿、统计等)
│   │   ├── db/             # 数据库 Schema 与 Drizzle 配置
│   │   └── index.ts        # 后端入口
│   └── package.json
├── client/                 # 前端代码 (Expo)
│   ├── app/                # Expo Router 路由配置
│   ├── screens/            # 页面组件实现 (Home, Footprints, Wishlist, Profile)
│   ├── components/         # 公共 UI 组件
│   ├── hooks/              # 自定义 React Hooks
│   ├── constants/          # 主题与常量定义
│   └── package.json
├── package.json            # Monorepo 根配置
└── pnpm-workspace.yaml     # pnpm 工作区配置
```

## 🚀 快速上手

### 1. 克隆与安装

确保你已安装了 `pnpm` 和 `Node.js`。

```bash
# 安装根目录及所有 package 的依赖
pnpm install
```

### 2. 环境变量配置

在 `server/` 和 `client/` 目录下分别创建 `.env` 文件，并参考对应的示例配置必要的 API 密钥和数据库连接字符串。

### 3. 启动开发服务器

在项目根目录下，使用预置命令同时启动前后端服务：

```bash
# 启动所有服务 (需要安装 coze-cli 或使用 package.json 脚本)
pnpm dev
```

或者分别启动：

```bash
# 启动后端
cd server && pnpm dev

# 启动前端
cd client && pnpm start
```

## 📝 开发规范

### 依赖安装
请严格遵循以下命令，**禁止**直接使用 `npm` 或 `yarn`：

| 目录 | 安装命令 |
|------|----------|
| 前端 (`client/`) | `npx expo install <package>` |
| 后端 (`server/`) | `pnpm add <package>` |

### 路径别名
前端已配置 `@/` 别名指向 `client/` 目录。请优先使用别名导入：
```tsx
import { Screen } from '@/components/Screen';
```

## 📄 开源协议

本项目采用 MIT 协议。
