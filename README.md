# 足迹小本本

> 记录想去和去过的地方，让美好的地方不遗忘

一款可爱风格的足迹记录应用，采用 **3D 黏土风** 设计语言，帮助你记录心愿清单和打卡足迹。

## ✨ 功能特性

- 📍 **心愿清单** - 记录想去的地方，支持添加距离、风景特征、备注
- 🥾 **足迹打卡** - 记录去过的地方，支持从心愿一键转化
- 📊 **时间统计** - 按周/月/年统计打卡数量，可视化展示
- 📤 **数据导出** - JSON 格式导出，方便数据迁移
- 📥 **数据导入** - 批量导入历史数据
- 🎨 **3D 黏土风 UI** - 柔和配色、大圆角、凸起阴影

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Expo 54 + React Native + TypeScript |
| **后端** | Express.js + TypeScript |
| **数据库** | Supabase (PostgreSQL) |
| **ORM** | Drizzle ORM + drizzle-zod |
| **校验** | Zod Schema |
| **样式** | React Native StyleSheet + 主题系统 |
| **导航** | Expo Router (Tabs) |

## 📁 项目结构

```
├── client/                     # Expo 前端
│   ├── app/                    # Expo Router 路由配置
│   │   ├── _layout.tsx         # 根布局
│   │   ├── (tabs)/             # Tab 导航组
│   │   │   ├── _layout.tsx     # Tab 布局配置
│   │   │   ├── index.tsx       # 首页
│   │   │   ├── wishlist.tsx    # 心愿清单
│   │   │   ├── footprints.tsx  # 足迹地图
│   │   │   └── profile.tsx     # 个人中心
│   │   └── +not-found.tsx      # 404 页面
│   ├── screens/                # 页面组件实现
│   │   ├── home/               # 首页模块
│   │   ├── wishlist/           # 心愿清单模块
│   │   ├── footprints/         # 足迹地图模块
│   │   └── profile/            # 个人中心模块
│   ├── components/             # 公共组件
│   │   ├── Screen.tsx          # 页面容器（安全区+键盘避让）
│   │   ├── ThemedText.tsx      # 主题文本
│   │   └── ThemedView.tsx      # 主题视图
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useTheme.ts         # 主题 Hook
│   │   └── useSafeRouter.ts    # 安全路由 Hook
│   ├── constants/              # 常量配置
│   │   └── theme.ts            # 主题配置（3D 黏土风）
│   └── assets/                 # 静态资源
│
├── server/                     # Express 后端
│   └── src/
│       ├── index.ts            # 应用入口
│       ├── routes/             # 路由模块
│       │   ├── wishPlaces.ts   # 心愿清单 API
│       │   ├── footprints.ts   # 足迹记录 API
│       │   ├── stats.ts        # 统计 API
│       │   └── data.ts         # 数据导入导出 API
│       ├── types/              # 类型定义
│       │   └── index.ts        # 共享类型
│       └── storage/            # 数据层
│           └── database/
│               ├── shared/
│               │   ├── schema.ts    # Drizzle Schema + Zod
│               │   └── relations.ts # 表关系定义
│               └── supabase-client.ts
│
├── .cozeproj/                  # 脚手架脚本（禁止修改）
├── .coze                       # 配置文件（禁止修改）
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
# 安装所有依赖
pnpm install

# 或分别安装
cd client && pnpm install
cd server && pnpm install
```

### 本地开发

```bash
# 同时启动前后端服务
coze dev
```

服务启动后：
- **前端**: http://localhost:5000
- **后端**: http://localhost:9091

## 📖 API 文档

### 基础信息

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`

### 心愿清单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/wish-places` | 获取心愿列表 |
| POST | `/wish-places` | 创建心愿 |
| PUT | `/wish-places/:id` | 更新心愿 |
| DELETE | `/wish-places/:id` | 删除心愿 |

**创建心愿请求体**:
```json
{
  "name": "西湖",
  "distance": "约200公里",
  "sceneryFeatures": "湖泊、古镇",
  "notes": "想去断桥看雪"
}
```

### 足迹记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/footprints` | 获取足迹列表 |
| POST | `/footprints` | 创建足迹 |
| PUT | `/footprints/:id` | 更新足迹 |
| DELETE | `/footprints/:id` | 删除足迹 |
| POST | `/footprints/check-in/:wishId` | 打卡心愿 |

**查询参数**:
- `startDate`: 起始日期 (ISO 8601)
- `endDate`: 结束日期 (ISO 8601)

### 统计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/stats` | 基础统计 |
| GET | `/stats/time` | 时间统计 |

**时间统计响应**:
```json
{
  "week": 2,
  "month": 5,
  "year": 12,
  "monthlyStats": [
    { "month": "2026-03", "count": 2 }
  ]
}
```

### 数据导入导出

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/export` | 导出所有数据 |
| POST | `/import` | 导入数据 |
| DELETE | `/data` | 清空所有数据 |

## 🗄️ 数据模型

### wish_places (心愿清单)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | varchar(36) | 主键 (UUID) |
| name | varchar(255) | 地点名称 |
| distance | varchar(100) | 距离 |
| scenery_features | text | 风景特征 |
| notes | text | 备注 |
| is_visited | boolean | 是否已打卡 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### footprints (足迹记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | varchar(36) | 主键 (UUID) |
| name | varchar(255) | 地点名称 |
| distance | varchar(100) | 距离 |
| scenery_features | text | 风景特征 |
| notes | text | 备注 |
| visited_at | timestamp | 打卡时间 |
| wish_place_id | varchar(36) | 关联心愿ID |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## 🎨 设计规范

### 3D 黏土风配色

| 用途 | 色值 | 说明 |
|------|------|------|
| Primary | `#7C5CFC` | 主色调（黏土紫） |
| Secondary | `#FF8FAB` | 辅助色（黏土粉） |
| Clay Green | `#4CAF50` | 足迹相关 |
| Clay Yellow | `#FFB74D` | 高亮/星标 |
| Background | `#F8F6FF` | 根背景（浅紫灰） |

### 组件风格

- **大圆角**: `borderRadius: 24-28px`
- **凸起阴影**: 双层阴影模拟 3D 效果
- **白色内描边**: 模拟光照高光
- **柔和过渡**: `withSpring` 弹性动画

## 📝 开发规范

### 路径别名

前端使用 `@/` 指向 `client/` 目录：

```tsx
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
```

### 主题驱动样式

所有页面样式必须使用 `createStyles(theme)` 工厂函数：

```tsx
// styles.ts
export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.backgroundRoot,
    },
  });
};

// index.tsx
const styles = useMemo(() => createStyles(theme), [theme]);
```

### API 调用规范

前端调用 API 时必须添加注释说明服务端信息：

```tsx
/**
 * 服务端文件：server/src/routes/wishPlaces.ts
 * 接口：POST /api/v1/wish-places
 * Body: name: string, distance?: string, sceneryFeatures?: string, notes?: string
 */
const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/wish-places`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, distance, sceneryFeatures, notes }),
});
```

### 类型安全

后端使用 Zod Schema 进行参数校验，并在 `types/index.ts` 中定义共享类型：

```typescript
// 参数校验
const validation = insertWishPlaceSchema.safeParse(req.body);
if (!validation.success) {
  return res.status(400).json({ 
    error: 'Validation failed', 
    details: validation.error.issues 
  });
}
```

## 🔧 依赖管理

| 目录 | 命令 | 说明 |
|------|------|------|
| `client/` | `npx expo install <package>` | Expo SDK 兼容版本 |
| `server/` | `pnpm add <package>` | pnpm 管理 |

**注意**: 禁止使用 `npm` 或 `yarn`

## 📄 License

MIT

---

Made with 💜 by 足迹小本本团队
