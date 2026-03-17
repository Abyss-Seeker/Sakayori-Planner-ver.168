# Sakayori Planner ver.168 (ฅ^•ﻌ•^ฅ)

一只**可可爱爱**但很能打的计划小助手：用现代前端（Vite + React + Tailwind）做一个顺滑的日程/规划体验。  
图标已配置为 **`/dist/168.png`**（也就是 `public/dist/168.png`）。

---

## 你会得到什么 (๑•̀ㅂ•́)و✧

- **快速打开就能用**：本地开发一键启动
- **现代技术栈**：Vite + React 19 + TypeScript + Tailwind
- **导出能力预备**：已引入 `html2canvas` / `jspdf`（可用于截图/导出 PDF）
- **动画/图标**：`motion` + `lucide-react`
- **AI 能力接口**：已引入 `@google/genai`（按需接入 Gemini）

> 具体功能以 `src/` 代码为准；README 负责可爱、负责上手、负责不迷路。

---

## 快速开始 (ง •̀_•́)ง

### 1) 安装依赖

```bash
npm install
```

### 2) 配置环境变量

复制一份环境变量文件（Windows PowerShell）：

```powershell
Copy-Item .env.example .env
```

然后按需填写：

- **`GEMINI_API_KEY`**：如果你要用 Gemini / AI 功能，需要这个
- **`APP_URL`**：应用的访问地址（本地一般可先填 `http://localhost:3000`）

### 3) 启动开发服务器

```bash
npm run dev
```

默认地址（本项目配置）：  
- **`http://localhost:3000`**

---

## 打包与预览 (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧

### 构建

```bash
npm run build
```

### 本地预览产物

```bash
npm run preview
```

---

## 常用命令一览 (｡•̀ᴗ-)✧

- **`npm run dev`**：启动开发（端口 3000）
- **`npm run build`**：构建生产包
- **`npm run preview`**：预览构建产物
- **`npm run lint`**：TypeScript 类型检查
- **`npm run clean`**：清理 `dist/`（Windows 下如不可用可手动删除）

---

## 项目结构（迷你导览） (・ω・)

- `index.html`：入口 HTML（已设置 favicon 为 `/dist/168.png`）
- `src/`：前端源码
- `public/`：静态资源（会原样复制到构建输出）
- `public/dist/168.png`：应用图标（标签页图标）

---

## 小小 FAQ (՞•ﻌ•՞)

### 图标没刷新？

浏览器对 favicon 很爱缓存：  
- 试试 **强制刷新**（Windows：`Ctrl + F5`）  
- 或者关掉标签页重新打开

---

## License

如果你希望我帮你补上许可证类型（MIT / Apache-2.0 等），告诉我你的偏好即可 (｡•̀ᴗ-)✧