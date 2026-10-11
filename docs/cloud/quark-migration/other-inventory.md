# 非核心扩展与 UI 贡献独立清单

> **范围与结论**：本清单针对 `/root/noname-cloud/source` 对应的 GitHub 1.11.7 云端验证运行时及现有扩展文件，依据静态文件清单、配置、CRC/大小比较和只读文本检查编写。没有执行扩展或归档脚本，没有下载静态皮肤/Spine 包，也没有把大资源复制进仓库。`other-hooks.json` 中的 assignment 是正则/文本候选，不是运行时证明。
>
> 目标是保留 GitHub 1.11.7 的规则、AI 和数据，以可控的 UI 适配吸收贡献；**不采用 Quark 引擎替换**，也不把扩展直接视作可信核心代码。

## 1. 证据、边界与总体统计

- 证据目录：`/root/noname-cloud/evidence/quark-migration/`；对应报告/清单位于本目录及 `source/docs/cloud/quark-migration/`。
- 扫描到 15 个扩展目录，共 **23,010** 个文件、**5,179,797,032 bytes（约 4.82 GiB）**（统计以 `other-scan-summary.json` 为准；目录包含开发依赖、归档和大媒体，不能据此推断实际加载量）。
- `other-hooks.json` 记录 4,615 个文本 assignment 候选；其中混有注释、压缩/混淆代码，漏检计算属性，不能作为执行证明。
- 原配置启用：十周年UI、手杀ui、皮肤切换、EpicFX、AIoptimize、无名补丁、缘之空、如真似幻、假装无敌、斗转星移、选将美化、曹髦滴圣剑等；太虚幻境配置为关闭。
- 配置与目录不一致：配置列出但没有目录的有 `指示线`、`手杀MVP`、`千幻聆音`、`手杀全扩`、`手杀结算`、`特效测试`、`标记补充`、`笨蛋插件`、`全能搜索`、`Thunder`、`无名扩展`、`神华佗`、`可爱的四月G_E`、`名称重置`、`谋关羽`、`神鲁肃`、`萌新包++`、`淋淋雨`、`极略`、`语音整理`。目录存在但未列入配置的有 `boss`、`cardpile`、`coin`。
- 资源政策：按钮、卡面、字体、龙框/界面资源可作为候选 UI 资产；静态皮肤、`.skel/.atlas` 大包、音视频和归档只记录来源与用途，不在本迁移提交中带入。

## 2. 扩展逐项清单

| 扩展 | 文件规模（文件/字节） | 静态内容与贡献类型 | 规则/AI 与 UI 边界、风险 |
|---|---:|---|---|
| **AIoptimize** | 2 / 1,137,506 | `extension.js`（另有 `.bak`）；大量 `lib.skill.*` 覆写/新增，名称含 `_fenghuyunlong`、`_tianxiayitong` 等 | **规则/AI**，不是纯 UI；约 237 个候选 skill assignment。必须逐技能对比 GitHub 1.11.7 后再选取，禁止因 UI 迁移顺手启用。
| **EpicFX** | 3,816 / 837,663,993 | 14 个 JS、CSS、卡面/装备/技能效果、Pixi/Spine 库；含按钮、卡牌、字体、音效及大媒体 | 主要是卡面、装备、判断区、技能/皮肤特效和布局；约 120 候选，触及 `lib.element.content.judge`、比较/弃牌/确认等核心流程，存在 UI 与流程耦合。配置启用，版本 `1.9.1.1`；优先抽取 CSS/卡面/按钮，隔离流程改写。
| **假装无敌**（含清瑶 runtime） | 6,973 / 1,863,558,459 | `extension.js`、`extension_skin.js`、`CharacterCard.js`、`Function.js`、动画、CSS、skin 目录和大量构建依赖/归档 | UI/动态角色牌/皮肤切换/MVP/动画为主，但同时有 `window.lib/game/get/ai/_status`、`window.cheat`、webpack runtime、消息和路由等广泛全局写入（783 候选）。配置启用；清瑶相关选项含动态角色牌、动画、皮肤目录、预览、懒加载、MVP 等。不可整体移植，先拆 UI 适配层；不复制静态皮肤包。
| **十周年UI** | 3,707 / 856,139,101 | CSS/JS、龙框、Spine、按钮、界面、音效 | **UI/资源**：布局、卡牌、技能样式、进度条、动态皮肤/开场与死亡效果；约 1,205 候选且大量直接改 `ui.*`/`window.*`。配置启用，覆盖面大；与手杀ui、EpicFX、选将美化、皮肤切换有 CSS/节点冲突，需单一主题层和明确加载顺序。
| **手杀ui** | 1,287 / 213,381,043 | CSS/JS、字体、按钮/背景、进度条、聊天/表情相关资源 | UI/交互，约 1,106 候选；会创建/修改 `dialog_lifesay`、`dialog_emoji`、聊天背景、手牌计数和进度条，部分读写 `game.me.storage`。与十周年UI、选将美化、无名补丁存在节点/样式竞争；不应作为规则补丁整体引入。
| **皮肤切换** | 1,310 / 173,558,619 | 49 JS、预览/动态 skin 数据、音效、Live2D 文件、CSS/HTML | UI/资源管理；约 180 候选，修改滑动手势、暂停、技能音效、假角色背景、动态皮肤替换等。配置启用；与假装无敌/清瑶、十周年UI、如真似幻、曹髦特效互相调用路径。只保留本地选择/预览适配接口，不带静态皮肤集合。
| **如真似幻** | 1,527 / 568,500,772 | CSS/HTML/JS、Pixi/GSAP、Spine UI-home/登录/大厅/梦境走廊资源、字体和媒体；混淆代码 | 以 UI/大厅/动态背景/登录及资源加载为主，但有启动流程、背景/卡样式、扩展加载和全局对象写入；约 152 候选，含同步 XHR + `new Function` 加载 `pixi6.min.js`，风险高。配置启用且“兼容假装无敌”开启；必须沙箱化、禁远程/动态代码执行。
| **选将美化** | 188 / 15,089,242 | 选将按钮、标记、龙框/图片、CSS/JS、字体/动画资源 | UI/选将交互；约 128 候选，修改 `chooseCharacter`、对话框、数字背景、阵营标记、技能选择等，可能触及 `lib.game.chooseCharacterTwo`、技能对象。与手杀ui、十周年UI、无名补丁冲突；迁移为选将 UI adapter。
| **曹髦滴圣剑** | 46 / 4,922,618 | `extension.js` 等 4 JS、少量动画/龙框资源 | **UI 特效 + 规则技能**：静态证据显示 `lib.skill._CMeffects`、`mbqianlong`，为 `mb_caomao/mb_caomao2` 增加道心值/进度及圣剑特效，并有 skill-control 定位修改；配置启用。必须把曹髦技能行为单独审查，不能只当皮肤特效；可移植的优先是视觉层。
| **缘之空** | 304 / 22,196,471 | 角色/技能相关 JS 1 个、对话/音频/图片、少量 Spine | 规则/技能替换与 UI 对话/语音并存；约 45 候选，涉及 `cixiong_skill`、`reshuishi`、`gangzhi`、`jueqing`、`huogong` 等，以及选中按钮。属于 gameplay 贡献，不能按主题资源合并；逐技能核对 1.11.7。
| **无名补丁** | 110 / 17,547,324 | 小型 CSS/JS、按钮/背景/音频 | 混合 UI/流程补丁；约 10 候选，修改起始手牌、`gameDraw`、`chooseButton`、铁索牌、阵营样式和新对话/选将。配置启用；应拆为独立小补丁并逐项开关，防止与选将美化、手杀ui冲突。
| **斗转星移** | 1,408 / 39,328,382 | 主要为图片/音频，1 JS/CSS | 混合 UI 与选将/身份/模式流程；约 19 候选，写 `game.zhu`、选将、cheat UI、模式计划和滑动配置。配置启用；需把“金将/星级展示”与 AI/选将行为分开，不能按纯美化处理。
| **太虚幻境** | 2,329 / 566,723,007 | DLC season JS、事件/卡牌/角色/框架、移动/PC CSS、图片音频字体 | **大型玩法/模式扩展**，含约 559 候选，集中于 `lib.config.taixuhuanjing.*` 经验、血量、技能、金币等状态；配置关闭但目录存在。保留为可选独立模式，不能混入核心或 UI 主题。
| **boss** | 1 / 4,307 | boss/剑阁角色包和简介 | 规则/角色包；约 10 个 `lib.characterPack`/`characterIntro` 写入。目录未列配置，先保持不加载。
| **cardpile** | 1 / 1,596 | 卡堆相关小脚本 | 规则/牌堆贡献；无 assignment 候选。目录未列配置，需人工阅读/测试后决定。
| **coin** | 1 / 44,592 | 金币/彩蛋视觉效果、闪烁/星星/雪/烟花 | UI/趣味效果；约 22 个候选，写 `ui.coin` 与 `game.haveFun`。目录未列配置，风险低但仍需隔离全局命名。

### 2.1 未找到目录的配置项

配置中存在但本运行时未找到对应目录的 20 项（见上表总览）不能据名称推断功能，不纳入迁移；需用户提供同版本文件后另行审计。尤其 `极略`、`千幻聆音`、`手杀全扩` 等名称可能涉及 AI、音频或完整玩法，不能用替代品冒充。

## 3. 如真似幻 patch 与 runtime 差异

- patch：约 237,789,261 bytes、1,032 个成员/61 个目录；CRC 校验通过，但供应信息中的 advertised MD5 与实际 SHA-256 记录不一致，不能把广告哈希当完整性依据。
- patch/runtime 成员按 CRC32+大小比较：1,032 项相同、61 项 patch-only；ZIP 扩展清单 22,590 文件，runtime 23,010 文件。
- 已确认不同的包括 `extension.js`、`css/{dream_corridor,font,rzsh,setting}.css`、`html/rzsh.html`、`js/{dream_corridor,dynamicCorridor,pixi6.min,rzsh,setting,update}.js` 及多种图片；runtime 还有大量活动、头像框、Spine 和大厅资源。它们不是可互换版本。
- 静态文字显示其 onload/precontent 会创建全局 UI、加载 CSS、同步请求本地 Pixi 并通过 `new Function` 执行响应；还可能读取/写入背景、卡面样式和扩展加载队列。该路径不能直接进入生产核心。
- runtime 根 `index.html` 不在 ZIP 根目录，是本地 recording adapter；证据表明含账户字段/只读文件 adapter 并会重播配置。**不分发、不复制、不写入本报告**。

## 4. 冲突图与迁移建议

1. **主题/布局冲突**：十周年UI ↔ 手杀ui ↔ EpicFX ↔ 选将美化 ↔ 无名补丁。冲突对象包括 `ui.confirm`、背景层、选将 dialog、进度条、技能/卡牌 CSS、手牌与装备节点。建立一个主题 adapter，按能力（卡面、按钮、选将、进度、特效）注册，而不是按扩展顺序互相覆盖。
2. **动态皮肤/特效冲突**：假装无敌/清瑶 ↔ 皮肤切换 ↔ 如真似幻 ↔ 曹髦滴圣剑。统一资源 resolver 和效果挂载点；只允许本地、声明式资源路径，禁用远程脚本、动态 `new Function`、未经审计的 worker/归档。
3. **规则/AI 冲突**：AIoptimize、缘之空、曹髦滴圣剑、斗转星移、无名补丁、太虚幻境、boss/cardpile。建立 1.11.7 基线快照，逐 skill/card/mode 对比；任何 engine/rule 修改先记录具体行为差异、测试用例和回滚开关。
4. **加载顺序**：先核心引擎和规则，再一个 UI adapter，再可选特效；同类扩展不得同时直接写同一 DOM/原型。配置中的启用状态只作为用户偏好证据，不作为兼容性证明。
5. **保留数据**：原配置、扩展目录和用户数据只读留存；迁移产物只引用清单/哈希/相对路径，不重写用户设置，不提交账号、签名、凭据或运行时 recording 文件。

## 5. 推荐处置矩阵

- **可优先适配（小范围 UI）**：EpicFX 的卡面/按钮/CSS、选将美化的选将 UI、coin 的视觉效果、手杀ui/十周年UI 中经过筛选的字体/按钮/布局规则。
- **需隔离后适配**：假装无敌/清瑶、皮肤切换、如真似幻、曹髦滴圣剑；只移植本地资源接口和显式 UI 行为，动态加载与大皮肤资源不进入仓库。
- **规则审计后才可用**：AIoptimize、缘之空、斗转星移、无名补丁、boss、cardpile、曹髦滴圣剑的 `mbqianlong`/`_CMeffects`。
- **保持可选且默认不加载**：太虚幻境及所有无目录配置项。

## 6. 复核入口

- 文件与资源统计：`evidence/quark-migration/other-files.json`、`other-scan-summary.json`
- 配置与缺口：`other-original-settings.json`、`other-config-gaps.json`
- assignment 候选：`other-hooks.json`、`other-code-index.md`
- 如真似幻 patch/runtime：`other-patch-runtime.json`、`other-zip-runtime.json`、`如真似幻-literal-inspection.txt`
- 曹髦滴圣剑只读检查：`曹髦滴圣剑-literal-inspection.txt`
- 混淆/危险调用摘要：`other-obfuscated-snippets.json`

以上是静态审计清单，不宣称扩展已经在云端运行，也不以 workflow 报告替代实际文件证据。喵。
