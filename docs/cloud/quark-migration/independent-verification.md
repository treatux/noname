# 夸克移植独立复核

复核标签：`actual_independent_check`  
复核对象：`/root/noname-cloud/source`  
复核基线：失败提交 `72eda4d545423f9da46a749226ab4420b27d94a0`；参考只读目录 `/root/noname-cloud/reference/quark-handheld/runtime`。  
复核原则：本文件只记录复核者实际读取、哈希和命令结果；实现者报告、workflow 输出和既有“通过”字段不替代本次运行成功。

## 结论

**整体：未通过，不能称为“GitHub 1.11.7 引擎 + 夸克真实 UI 已完成移植”。**

可确认的是：源码和已存在的 `dist` 包含 GitHub 1.11.7 引擎版本文件，主题入口能够被静态找到，且没有发现本提交改动原生规则/AI 文件。不能确认的是：夸克真实 UI 资源是否被移植、正式 dist 页面是否实际加载该主题、DOM 适配是否在战场中工作、真实人工输入是否触发 `useCard`。现有运行证据反而明确标记主题捕获失败。

## 逐项判定

| 项目 | 判定 | 独立事实与缺陷 |
|---|---|---|
| GitHub 1.11.7 引擎 | **通过（静态/版本项）** | `apps/core/game/update.js`、`apps/core/dist/game/update.js`、`dist/game/update.js` 的 SHA-256 均为 `d9eac3278257461f31d22fd927404fd0f3b05ff664f7a5aca54fe20343e8be8c`，内容版本为 `1.11.7`。这只证明版本文件一致，不证明主题运行成功。 |
| 真实夸克 UI 资源 | **未通过** | 交付主题只有 3 个文件：`style.css` 4513 字节、`battlefield.svg` 1212 字节、`dragon-frame.svg` 1417 字节；均为提交新增的小型原创资源。参考 runtime 的 `extension` 有 23010 个文件、约 5,179,797,032 字节，参考 `十周年UI`/`手杀ui` 的真实 CSS、图片等未进入交付。当前实现本质是原创 CSS/SVG 外壳，不符合“不接受原创 CSS 替代”。 |
| 资源哈希可追溯 | **通过（仅交付小资源）** | 源码与 `dist/theme/quark-migration/*` 哈希一致：CSS `de584e092c9e72217ccca70e0aaaba1e87d6ae0d8016f87a8c2f31e4f9e3e921`；背景 `64040d083c3b0ed0f8bb8b2db89a287ec329684abe223a6644e9b71a5d1e7d1b`；龙框 `6b789f9915449683b717f84ea63b462c7ffeeabcce577ab04838b2864488ae55`。这不是参考 UI 资源的 hash 证明，只是自有 fallback 文件一致。 |
| DOM 适配 | **未通过** | CSS 选择器覆盖 `.player`、`.card`、`.control`、`.dialog` 等原生节点，属于静态声明；没有正式 dist 战场页面的 DOM 快照、计算样式、命中测试或交互前后证据。既有 `migration-runtime.json` 明确写明 `runtimeThemeCapture.passed=false`，隔离页面停在空启动状态，没有有效战场 DOM/主题样式激活。 |
| 正式 dist 真实页面截图 | **未通过** | 存在 `baseline-stream-0.png` 和 `baseline-record-0.png`，但对应记录主题分别是 `handheld`/`simple`，不是 `quark_migration`。`isolated-quark-theme.png` 虽为 1280x720 PNG，但其运行记录明确标为失败且“notAcceptanceEvidence”；不能作为正式主题页面截图。复核时 `curl http://127.0.0.1:18094/` 连接失败，未能重新取得正在运行的正式 HTTP 页面。 |
| `useCard` 真实证据 | **未通过** | 源码确有原生 `player.useCard` 和 `useCard` 事件链（`apps/core/noname/library/element/player.js`、`apps/core/noname/library/element/content.ts`），但本迁移没有一份由主题页面真实输入产生的事件记录。现有证据中的 `useCard` 搜索结果是源码/静态 hook 盘点，不能证明本次 UI 的人工操作。AI 自动完成、旧录像或截图均不等价于人工 `useCard` 证据。 |
| 原生规则与 AI 未替换 | **通过（提交范围）** | `git diff 72eda4d^ 72eda4d -- apps/core/noname apps/core/mode apps/core/game/update.js` 无输出；提交实际改动集中在配置、主题 CSS/SVG 和文档。未发现 `AI`、模式、事件、选择提交或座位计算被改动。该结论仅针对代码差异，不替代功能回归。 |
| 主题回退 | **部分通过（静态）** | `quark_migration` 是可选主题枚举项，默认主题未被改为该主题；因此存在配置层回退路径。但没有正式页面切换前后截图或 DOM 证据，不能把运行时回退验收标为通过。 |
| 无皮肤下载/秘密提交 | **通过（本提交范围）** | 提交没有新增参考 runtime、账号、cookie、skin、`.skel`、`.atlas` 或远程 loader；主题 CSS 注释也声明排除这些内容。参考目录保留在工作区，不等于被交付。未对正式 profile 执行写入或重置。 |
| 正式构建可重现 | **未通过本次复核** | 在复核 shell 中执行 `cd /root/noname-cloud/source && pnpm build` 直接失败：`pnpm: command not found`，且 `node`/`npm` 也不在当前 PATH。已有 dist 可读，但不能把之前报告的构建结果冒充本次重新构建成功。 |

## 关键证据

1. `git show --stat 72eda4d` 显示提交新增的是 `apps/core/theme/quark-migration/` 的 CSS/SVG；没有参考 UI 资源目录或原始夸克 UI 包进入提交。
2. `apps/core/theme/quark-migration/style.css` 使用 `linear-gradient`、自定义颜色、原创 `battlefield.svg`/`dragon-frame.svg`，并明确注释“原创 fallback”。这与真实夸克 UI 资源移植要求冲突。
3. `/root/noname-cloud/evidence/quark-migration/migration-runtime.json` 的 `runtimeThemeCapture` 为 `passed: false`，原因是空启动页没有战场 DOM/主题 stylesheet 激活；该文件只能作为失败记录，不能作为通过证据。
4. `/root/noname-cloud/evidence/quark-migration/baseline-stream.json` 和 `baseline-record.json` 分别记录旧页面使用 `handheld`、`simple`，不是 `quark_migration`；不能用来证明目标主题。
5. 参考 runtime 中真实 UI 资产规模和文件哈希与交付主题不匹配。参考样例：`runtime/extension/十周年UI/card.css` SHA-256 为 `3410616f1d35ed2f15ff2e66472eaf0758994bf0c682cfe792d72d0937d8e5bd`，交付主题不含该文件；`runtime/index.html` 也不是提交内资源。

## 缺陷与阻塞

- 缺少“参考夸克页面同阶段”与“GitHub 1.11.7 + 目标主题同阶段”的真实截图对照。
- 缺少正式 dist 页面确认 `lib.config.theme === 'quark_migration'`、实际加载的 stylesheet URL、关键节点数量/几何与计算样式。
- 缺少真实人工选牌/选目标/确认操作后 `game.getGlobalHistory('useCard')` 或等价事件对象的现场记录。
- 缺少主题关闭后的正式页面回退证据。
- `pnpm build` 依赖的 Node/pnpm PATH 在本复核环境不可用；已有产物只能作为历史遗留文件检查。
- 参考目录包含大量第三方 UI、皮肤和动态资源；当前提交没有秘密下载迹象，但也没有实现真实 UI 资源移植，不能用“未下载皮肤”替代目标验收。

## 复核边界

本次未导航、刷新、点击或写入正式 `deploy_profile`/`noname-quark_profile`，没有抢占正式 profile，也没有执行新 workflow。由于正式服务端口当前不可连接且构建工具不在 PATH，本文件明确保留运行验证为未通过，不以静态报告宣称运行成功。

## 最终判定

**代码范围的 1.11.7 与规则/AI 保持项通过；真实夸克 UI、DOM 运行、正式 dist 截图、真实 `useCard`、完整构建复现均未通过或仅静态部分通过。当前交付应退回实现阶段，不能标记为完成。**
