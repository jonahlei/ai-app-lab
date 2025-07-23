# Computer Use App

这是一个 Computer Use App 项目，用户可以通过自然语言方式，远程控制一台虚机，进行 Computer Use 类操作。

## 功能特点

- 🤖 自然语言交互界面
- 💻 远程虚拟机控制
- 🔍 实时操作反馈

## 技术栈

- **前端框架**: Next.js
- **UI 组件**: Arco.Design + Tailwind CSS
- **状态管理**: Valtio
- **开发语言**: TypeScript

## 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- Yarn 包管理器

### 安装依赖

```bash
yarn
```

### 开发环境

运行开发服务器：

```bash
yarn dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以通过修改 `app/page.tsx` 文件来开始编辑页面。当你编辑文件时，页面会自动更新。

### 生产环境构建

```bash
yarn build
yarn start
```

## 项目结构

```
web_ui/
├── public                                    # 静态资源文件
│   ├── guac                                  # guacamole 客户端
│   ├── images                                # 图片资源
│   └── novnc                                 # novnc 客户端
└── src
    ├── app
    │   ├── api                               # BFF接口
    │   │   ├── sandbox                       # Sandbox Manager 相关接口调用
    │   │   │   ├── create
    │   │   │   ├── delete
    │   │   │   ├── list
    │   │   │   └── terminal-url
    │   │   ├── planner                       # Agent Planner 相关接口调用
    │   │   │   ├── model
    │   │   │   │   └── list
    │   │   │   └── run-task
    │   │   ├── user                          # 用户认证相关接口调用
    │   │   │   ├── login
    │   │   │   └── check-login
    │   ├── index.css                         # 前端全局样式
    │   ├── layout.tsx
    │   └── page.tsx                          # 前端页面入口
    ├── components                            # 前端组件
    ├── hooks                                 # 前端 React Hooks
    ├── middleware.ts                         # BFF 中间件
    ├── services                              # 前端 Service 层
    │   ├── planner.ts                        # Agent Planner Service
    │   ├── user.ts                           # 用户认证 Service
    │   └── sandbox.ts                        # Sandbox Manager Service
    └── store                                 # 前端状态管理
```

## 了解更多

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的特性和 API
- [学习 Next.js](https://nextjs.org/learn) - 一个交互式的 Next.js 教程
