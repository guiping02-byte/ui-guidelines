# UI 设计规范看板

一套面向小程序界面的红色母婴与蓝色通用设计系统看板，集中展示并维护颜色、字体、圆角和典型组件状态。

## 在线访问

[打开 UI 设计规范看板](https://blue-ui-board-lixujie.guiping02.chatgpt.site/)

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

## 技术栈

- React 19
- vinext / Vite
- TypeScript
- OpenAI Sites / Cloudflare Worker runtime

