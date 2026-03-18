# 知序 KnowSeq - 智能刷题平台

一款简洁高效的在线刷题练习系统，支持题库管理、多种刷题模式、错题复习等功能。

## 功能特性

### 核心功能
- 📚 **题库管理** - 上传和管理个人题库
- 📝 **顺序刷题** - 按题库顺序逐题练习
- 🎯 **专项练习** - 按知识点、题型分类练习
- ❌ **错题重练** - 自动收录错题，针对性复习
- ⭐ **收藏题目** - 标记重点题目方便回顾
- 🔍 **搜题功能** - 关键词、知识点、标签搜索

### 刷题模式
| 模式 | 说明 |
|------|------|
| 顺序刷题 | 按题目顺序依次练习 |
| 题型专练 | 按选择题/判断题/填空题分类 |
| 知识点练习 | 按知识点分类针对性练习 |
| 未答练习 | 练习未做过的题目 |
| 专项练习 | 难度、收藏等特殊分类 |

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Vue Reactive (本地存储)
- **样式**: CSS Variables 主题系统

## 项目结构

```
quiz-mvp/
├── src/
│   ├── views/           # 页面组件
│   │   ├── HomeView.vue         # 首页
│   │   ├── BankView.vue        # 题库管理
│   │   ├── PracticeView.vue    # 刷题界面
│   │   ├── WrongView.vue       # 错题本
│   │   ├── FavoriteView.vue    # 收藏夹
│   │   └── SearchView.vue      # 搜题
│   ├── router/          # 路由配置
│   ├── utils/           # 工具函数
│   │   ├── questionBank.js     # 题库管理
│   │   ├── practiceSession.js # 刷题会话
│   │   └── storage.js          # 本地存储
│   ├── ui/              # UI 组件
│   │   ├── ToastHost.vue       # 提示组件
│   │   └── toast.js            # 提示函数
│   ├── data/            # 静态数据
│   ├── style.css        # 全局样式
│   └── App.vue          # 根组件
└── package.json
```

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

## 主题系统

项目支持浅色/深色主题切换，使用 CSS 变量统一管理：

```css
/* 浅色主题 */
:root {
  --bg-color: #f7f7f7;
  --card-bg: #ffffff;
  --text-color: #1f2937;
  --primary-color: #2563eb;
}

/* 深色主题 */
[data-theme="dark"] {
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --text-color: #e5e7eb;
  --primary-color: #3b82f6;
}
```

## 数据存储

- 本地存储 (localStorage) - 用户数据、题库、刷题记录
- Session 存储 - 当前刷题会话状态

## 后续规划

- [ ] 用户登录系统
- [ ] 云端数据同步
- [ ] 题库导入功能 (Word/Excel/PDF)
- [ ] 刷题数据统计分析
- [ ] 多人对战模式

## 许可证

MIT License
