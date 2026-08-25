# UI 设计规范看板

一套面向小程序界面的红色母婴与蓝色通用设计系统看板，集中展示并维护颜色、字体、圆角和典型组件状态。

## 在线访问

[打开 UI 设计规范看板](https://guiping02-byte.github.io/ui-guidelines/)

## 看板内容

- 红色母婴与蓝色通用两套主题切换
- 品牌色阶及语义颜色角色
- 字体大小、字重、文字颜色与用途
- 页面背景色、4px 与 8px 圆角规范
- 按钮、输入、标签、筛选项及底部导航状态
- 蓝色价格色、主按钮色、禁用色与渐变色示例
- 浏览器本地保存自定义色值

## 本地运行

环境要求：Node.js `>=22.13.0`，pnpm `11.19.0`。

```bash
pnpm install
pnpm dev
```

## 质量检查

```bash
pnpm test
pnpm lint
```

`pnpm test` 会先完成 vinext 生产构建，再执行颜色 Token、页面结构与样式契约测试。

## 发布更新

提交并推送到 GitHub 的 `main` 分支后，GitHub Pages 会自动构建和发布，通常需要几分钟才能在公开链接上看到更新。

看板中直接修改的色号保存在当前浏览器，不会自动提交或同步回 GitHub；需要永久更新公开看板时，应修改源码并推送到 `main`。

## 技术栈

- React 19
- vinext / Vite
- TypeScript
- GitHub Pages / GitHub Actions
