# 魔法森林寻宝 · Magic Forest Quest

一个使用键盘操作的网页冒险游戏（Assignment 2）。在随机生成的魔法森林中探索，找到钥匙打开城堡、用道具对抗危险，最终拾取 **魔法水晶 💎** 完成冒险。

**🎮 在线试玩：** <https://gushenle.github.io/magic-forest-quest/>

## 游戏目标

在魔法森林中找到并拾取魔法水晶 💎：
- 避开/击退怪物，别在沼泽里耗尽生命；
- 找到 **钥匙** 打开城堡大门；
- **生命值归零** 则冒险失败。

每局地图由随机种子生成，因此每次游戏的森林布局都不同。

## 操作方式

| 按键 | 作用 |
| --- | --- |
| 方向键 / `W` `A` `S` `D` | 上 / 左 / 下 / 右移动 |
| `E` | 拾取当前位置的物品 |
| 数字键 `1`–`9` | 使用背包中对应物品 |
| `I` | 查看背包 |
| `L` | 观察四周 |
| 全屏按钮 | 切换窗口 / 全屏模式 |

也支持触屏：在地图上滑动可移动，屏幕方向按钮同样可用。

## 玩法机制

- **物品**：药水（回血）、剑（击退怪物）、钥匙（开城堡门）、魔法水晶（胜利目标）。
- **危险**：沼泽（持续掉血）、怪物（无剑时造成伤害，有剑时被击退）。
- **指令系统**：既可用键盘，也可在输入框输入文字指令（如 `east`、`take`、`use 治愈药水`）。
- **胜负判定**：拾取水晶即胜利；生命值归零即失败。

## 技术特性（对应评分点）

- **类与模块**：`Game`、`World`、`Location`、`Item`、`Danger`、`Player` 等类，全部使用 ES Modules。
- **箭头函数**：物品的动作映射（`{ actionName: (ctx) => ... }`）。
- **生成器与迭代器**：`mapGenerator.js` 中的 `function*` 生成器、`enumerate`、`shuffled` 等迭代工具。
- **函数式编程**：`map` / `filter` / `reduce` 用于统计与渲染。
- **伪随机地图**：相同种子生成相同地图，便于测试与复现。
- **DOM 交互**：键盘事件监听、触摸滑动、全屏切换（Fullscreen API）。
- **CSS**：全部样式集中在 `src/styles.css`，无内联样式；包含 5 种 CSS 动画（脉动、抖动、渐显等）。
- **持久化**：通过 `localStorage` 保存 / 读取游戏进度（`SaveManager`）。
- **图形**：欢迎页插画由生成式 AI 工具制作。

## 项目结构

```
adventure-game/
├── index.html                 # 欢迎 / 游戏 / 结束三个画面
├── public/assets/hero.jpg     # 欢迎页插画
├── src/
│   ├── main.js                # 入口：连接 DOM 与游戏逻辑
│   ├── styles.css             # 全部样式与动画
│   ├── core/                  # 纯逻辑（无 DOM 依赖，便于测试）
│   │   ├── Game.js            # 总游戏类：状态、流程、指令处理、胜负
│   │   ├── World.js           # 世界类：二维 Location 地图
│   │   ├── Location.js        # 地点：坐标、物品、危险、描述
│   │   ├── Item.js            # 物品：名称、描述、动作映射
│   │   ├── Danger.js          # 危险：名称、描述、效果函数
│   │   ├── Player.js          # 玩家：位置、背包、生命值
│   │   ├── mapGenerator.js    # 伪随机数生成器 + 生成器函数
│   │   ├── definitions.js     # 物品 / 危险工厂
│   │   └── SaveManager.js     # localStorage 存档读写
│   └── ui/dom.js              # DOM 渲染、键盘 / 触摸 / 全屏事件
├── test/                      # vitest 单元测试（9 个文件）
├── vite.config.js             # Vite / Vitest 配置
├── eslint.config.js           # ESLint（flat config）
└── .github/workflows/deploy.yml  # GitHub Pages 自动部署
```

## 本地运行

```bash
npm install       # 安装依赖（第一次）
npm run dev       # 启动开发服务器，浏览器打开提示的地址
```

## 测试与代码质量

```bash
npm test          # 运行 vitest 单元测试（约 70 个用例）
npm run lint      # ESLint 检查（要求 0 error 0 warning）
npm run build     # 生产构建，输出到 dist/
```

测试覆盖每个核心类与函数，并对依赖 Web API 的代码使用 **jsdom + mock**（如 `localStorage`、Fullscreen API、触摸事件）。

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages：

```
https://gushenle.github.io/magic-forest-quest/
```

`vite.config.js` 中的 `base` 由 CI 自动注入为仓库名，保证子路径下资源不 404。
