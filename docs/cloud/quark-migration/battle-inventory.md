# 战场 UI 盘点：十周年 UI / 手杀 UI（夸克 1.12.7.0711_β → GitHub 1.11.7）

> 阶段：Inventory。本文只读分析，不运行或安装参考扩展，不修改游戏。规则、AI 和引擎基线固定为 `/root/noname-cloud/source` 的 GitHub 1.11.7；不能把夸克引擎作为交付物。参考来源为已授权本地 runtime、纯净包选择性提取和补丁选择性提取。静态皮肤、动态骨骼不在本盘点范围；龙框、按钮、牌面、字体属于范围，但移植建议默认只实现可复用的 UI 结构/样式，未经授权的第三方美术不复制到交付物。

## 1. 证据边界与版本

| 证据 | 精确位置 | 结论 |
|---|---|---|
| 夸克版本 | `reference/quark-handheld/base-source/game/update.js:1-3` | `1.12.7.0711_β`，不是当前引擎；变更日志 `:14-16` 明确为兼容美化扩展新增/修改函数。 |
| 配置基线 | `reference/quark-handheld/base-source/game/config.js:15-25,74-115,141-179` | 默认 `theme=woodden`、`layout=mobile`、`card_style=default`、`cardback_style=noname_decade1`、`hp_style=xinround`、`card_font=xiaozhuan`；身份局默认 8 人。 |
| 运行配置 | `reference/quark-handheld/runtime/game/config.js` | 与选择性提取同源的游戏配置；不要把其中账号/用户数据复制到源码或证据公开物。 |
| runtime/index.html | `reference/quark-handheld/runtime/index.html`；比较结果 `evidence/quark-migration/battle-zip-comparison.json` | ZIP 无根 `index.html`；runtime index 是本地运行/录制适配入口，SHA-256 `4a522f...307bb`，不能作为 ZIP 内原始文件宣称。 |
| ZIP/补丁完整性 | `reference/quark-handheld/ASSET-FINDINGS.md` | ZIP 与 7z 本地 CRC 通过；广告 MD5 不符已记录，不作为验收门槛。 |
| 现有引擎 UI 接口 | `source/apps/core/noname/ui/create/index.js:3801-3825`、`source/apps/core/noname/ui/index.js:438-567`、`source/apps/core/noname/library/index.js:2501-2718` | 上游已有 arena、手牌容器、触摸滚动、卡牌/牌背 stylesheet 动态加载，应优先通过主题 CSS 和现有接口适配。 |

## 2. 手杀 UI：代码、加载机制与接管点

### 2.1 启动/配置加载

- `extension/手杀ui/extension.js:1` 使用旧式 `game.import('extension', function(lib, game, ui, get, ai, _status){...})`。
- 启动路径从 `extension.js:10-28` 读取 `lib.assetURL`，按配置动态注入 KGMH 开关和启动页 CSS；`extension.js:31-34` 要求本体 `control_style=default`，否则弹窗提示关闭/重启。这是与上游主题/按钮样式的直接冲突点。
- 插件分模块读取机制在 `extension.js:200-247`：按 `lbtn/skill/dialog/character` 四目录读取 `main1.js` 或 `main2.js`，经 `FileReader` 后 `eval`。这不是安全或稳定的主题入口，不能整体移植到 1.11.7；应拆成静态 CSS 或最小、受控的 UI adapter。
- `extension.js:406-408` 的扩展 content 是接管入口；`extension.js:411-466` 包装 `lib.element.player.trySkillAnimate`，插入 AI/技能进度条与技能提示 DOM；`extension.js:470-...` 包装 `ui.create.characterDialog`，插入筛选/技能搜索。
- `extension.js:2395-2417` 暴露结算界面关闭/恢复的 `game.buttoncloseUI`，是结算层冲突风险；不得替换上游结算流程，只能在原生 dialog 上做 CSS/最小节点适配。

### 2.2 功能子模块盘点

| 功能 | 参考源码（行号） | 资源依赖 | 对 1.11.7 的建议 |
|---|---|---|---|
| 战场/玩家附加 UI | `手杀ui/extension.js:411-466`、`layout/main1.js:1-35` | `lbtn/images`、`skill/images`、玩家节点 class | 只保留节点级提示和样式；不要替换 player 初始化/座位算法。用 `lib.element.player.trySkillAnimate` 的 wrapper 前先检测方法签名。 |
| 技能提示/AI 进度条 | `extension.js:417-458`；`skill/main1.js:23-113` | `shoushatip/skilltip.png`、技能按钮图、字体 | 1.11.7 原生技能更新在 `source/apps/core/noname/library/element/content.ts:10581` 等；以原生更新为源，只添加 `.skill-control` 外观。避免读取/改写 AI 决策。 |
| 技能按钮与技能区 | `skill/main1.js:23-40,179-196`；`skill/main1.css:1-80,94-264` | `skill_numbg*.png`、`btn*.png`、`feng/long/longfeng*.png`、`qianfu.png` | 先做 CSS 映射：上游没有同名容器时，在现有 `ui.skills/ui.skills2/ui.skills3` 上建立兼容 class；不复制其技能逻辑。 |
| 角色信息/武将弹框 | `character/main1.js:55-108,150-234`；`character/main1.css:1-50,125-244,320-438` | `dialog2.png`、`name2_<group>.png`、`xing.png`、`bigdialog.png`、武将头像、HY/FZ/ATLL 字体 | 复用上游 `get.nodeintro`/character dialog；只替换结构内的背景、边框和字体。不要移植随机玩家名、会员/鲜花等非 UI 数据逻辑（`main1.js:180-194`）。 |
| 菜单/左侧按钮/身份牌序 | `lbtn/main1.js:74-105,229-339`；`lbtn/main1.css:1-180,375-540` | `uibutton/{btn,confirm-bg-c,cbtn,shoupai1,cardback,paiduiming,...}.png`、SSCD、身份图 | 可将原生 control/menu 作为语义层，使用 CSS background-image；位置必须适配流媒体分辨率，不能照搬固定 `left/top`。 |
| 确认/取消/出牌按钮 | `lbtn/main1.css:194-317` | `cbtn.png`、`confirm-bg-c.png`、`btn.png`、`huanpai2.png`、`qipai.png`、HYZLSJ/shousha | 接管 `ui.create.confirm` 的样式，不接管 `game.check/uncheck`。上游确认调用点见 `source/apps/core/noname/game/check.js:201`。保留原生 disabled/selected 状态和触摸命中区。 |
| 手牌及牌堆提示 | `lbtn/main1.css:321-417` | `shoupai1.png`、`cardback.png`、牌堆/轮次图 | 只调整 `ui.handcards1Container` 和 `.card` 的布局；上游手牌重排会在 `source/apps/core/noname/ui/index.js:438-567` 运行，不能用固定绝对坐标阻断其计算。 |
| 技能/牌面提示与结算 | `extension.js:417-466,2395-2417`；`dialog/main1.js:17-181` | dialog/mark 图、技能提示图 | 保留原生 dialog 生命周期、牌选择和结算事件；实现 CSS 主题与轻量 `dialog:change` 类似通知即可，不搬运 `app.reWriteFunction` 框架。 |
| 字体 | `手杀ui/extension.css:1-24`；`十周年UI/font.css:9-43` | 参考 runtime `font/*.ttf`；手杀自带扩展字体文件 | 字体需逐项授权/许可审查；交付默认使用现有上游字体或可授权字体。字体加载失败必须回退，不能阻塞启动。 |

### 2.3 手杀配置选项（原包实际代码）

手杀扩展配置位于 `手杀ui/extension.js:4438` 起；明确读到的战场相关选项包括：

- `jindutiao`：进度条，`:4610-4615`，默认开启。
- `jindutiaoYangshi`：手杀/十周年 PC/十周年客户端三种进度条，`:4616-4624`，默认 `1`。
- `jindutiaotuoguan`：进度条结束自动托管，`:4626-4630`；**不应移植到规则/AI**，最多做纯视觉倒计时。
- `jindutiaoST`：10ms–2s 刷新间隔，`:4631-4644`。
- `jindutiaoUpdata`、`jindutiaoaiUpdata`：玩家/AI 进度条刷新，`:4646-4654`。
- `jindutiaoSet`：进度条高度 10%–39%，`:4656-4686`。
- 启动页 `extension_手杀ui_qiDongYe`、开关 `extension_手杀ui_KGMH`，加载在 `extension.js:11-28`。

**移植边界：** 进度条可作为表现层，但“托管”会改变控制行为，禁止在本项目主题中实现；不触及规则 AI，无需引擎改动。

## 3. 十周年 UI：代码、加载机制与接管点

### 3.1 核心架构

- 入口 `十周年UI/extension.js:920-936` 检查扩展开关和布局，仅接受 `long2/nova/mobile`，否则提示；这证明它依赖特定夸克布局属性，不是通用主题。
- `:938-978` 创建全局 `window.dui/window.decadeUI`、ResizeSensor 和 SVG clipPath；`:1038-1080` 保存原生 `game/ui/lib.element` 方法作为 ride/base 接口。
- `:6203-6234` 批量 `override(lib, ride.lib)`, `override(ui, ride.ui)`, `override(game, ride.game)`，并缓存 `ui.create.arena/pause/menu`、`lib.init.cssstyles/layout`、大量 `lib.element.player` 方法。这是最大兼容风险：它会接管布局、菜单、player/card 生命周期和游戏外观，而不是普通 CSS 扩展。
- `:7371-7415` 重写 `ui.create.arena` 和 `ui.create.me`：移除原生 layout class，增加 `decadeUI`，创建 `hand-wrap/hand-cards/equips-wrap`，绑定触摸滚动；`:7985-8028` 重写 `lib.init.layout`。1.11.7 适配必须保持原生 layout/handcard API，只复制所需 DOM class 和 CSS。
- `:5621-5653` 设置 `document.body.style.zoom=game.documentZoom` 并改变 dialog 尺寸；`:6084-6087` 以 `game.documentZoom` 换算点击坐标。串流和 CDP/触摸映射下需单独验证，不能直接套用。
- 十周年扩展包含 `skill.js` 的 `decadeUI.content.chooseGuanXing` 等特殊选择器；这些是技能交互逻辑，不属于 UI-only 移植，必须排除。

### 3.2 战场/牌面/按钮/提示/结算

| 功能 | 参考源码/资源 | 真实表现 | 1.11.7 建议 |
|---|---|---|---|
| 背景与 arena | `layout.css:184-215`、`extension.js:7371-7384` | `#autonode` 底部渐变、arena `decadeUI` class、`#time` 字体 | 仅在 theme CSS 设置背景/渐变；不增加/删除 seat geometry。 |
| 手牌 | `layout.css:218-347` | `hand-wrap` 左右布局、170px 高、卡牌 108×150、选中/特殊区 | 上游已有容器与滚动；主题只覆盖变量/尺寸，并在 1280×720、960×540、1560×720 验证。 |
| 牌面/牌背/牌面文字 | `layout.css:352-460`、`card.css:198-218` | 卡牌 108×150、圆角、顶部牌名、字体 `shousha`、花色数字；全皮/替代名有多个状态 | 牌面资源走上游 `only_fullskin/card_style/cardback_style`；不要导入十周年 `decade-card` 逻辑或静态素材包。 |
| 玩家龙/框/势力 | `player1.css:31-77,232-260,300-325`；`player2.css:51-220`；`extension.js:7645-7661` | 蓝/橙/红选择光、camp-wrap、camp-border、龙/虎 frame、HP/护甲等阶 | 以 `.player` 现有节点为目标；龙框只记录为可选资源槽位，未授权素材不进交付；保留 selected/target/selectable 语义。 |
| 选将/武将卡 | `extension.js:5656-5705`；`dialog.css:118-165`、`doudizhu.css:23-120` | 自定义 character button、rarity 图、选将 dialog 和斗地主变体 | 复用上游 `ui.create.characterDialog`，只做外观 adapter；不能覆盖 `game.chooseCharacter`。 |
| 技能提示 | `dialog.css:262-370`、`十周年UI/skill.js` | skill-dialog、控制按钮、拼点/选择技能外观 | CSS 可移植；`skill.js` 的技能选择算法/`game.wait` 不移植。 |
| 菜单/聊天/共享对话框 | `component.js:35-80`、`menu.js:4-180` | decadeUI 自己的 dialog/menu/chat 节点 | 原生 menu/dialog 生命周期不变，只提供 CSS；聊天不影响本地规则。 |
| 结算/牌使用清理 | `extension.js:8030-8065` | 在 `useCardBegin/After` 上注册清理技能，且修改 clear delay | 这是规则事件钩子，**不纳入 UI-only 移植**；用上游 card animation/clear 行为。 |

### 3.3 十周年实际配置选项

配置精确位于 `十周年UI/extension.js:12080-12345`：

- `smoothMode` 必开 `:12085-12088`；`rightLayout` `:12089-12095`。
- `cardPrettify`（off/webp/png，需重启）`:12096-12104`；这是牌面依赖，需映射到上游 card style，不复制运行时引擎。
- `dynamicSkin`、`dynamicSkinOutcrop` `:12126-12145`：明确排除动态皮肤/骨骼。
- `cardAlternateNameVisible` `:12148-12154`；`campIdentityImageMode` `:12155-12158`。
- `playerKillEffect/gameAnimationEffect/playerDieEffect/cardUseEffect/playerLineEffect` `:12159-12193`：动画/特效可作为后续独立能力，当前不引入 Pixi/Spine。
- `outcropSkin` `:12195-12200`：排除皮肤。
- `borderLevel` 一至五阶 `:12202-12215`；`gainSkillsVisible` `:12216-12226`；`playerMarkStyle` `:12228-12238`。
- `shoushajiao` `:12240-12248`；`newSkillStyle` 单列/双列 `:12249-12259`；`newDecadeStyle` 十周年/新手杀/旧手杀 `:12261-12272`；`shadowStyle` `:12274-12284`。
- `rarityLong` 龙头美化 `:12286-12298`，仅适用于手杀样式；`decadeLayout` 十周年/手杀 `:12299-12310`；`aloneEquip` `:12311-12318`；`equipStyle` `:12319-12331`；`loadingStyle` 光标/loading/选项框三套 `:12333-12345`。

## 4. 原配置加载与接管关系

1. 原生启动先加载 `game/config.js` 的 `layout/theme/card/font` 等基础选项，再加载扩展。手杀 UI 通过 `lib.init.css` 和 `game.readFile + eval` 分支加载；十周年 UI 以扩展开关、layout 检查后建立 `decadeUI`，再批量 override。
2. 手杀 UI 与十周年 UI 不是独立可叠加主题：手杀扩展介绍本身写明需搭配十周年 UI（`手杀ui/extension.js:4443-4445`）；十周年 CSS 的 player 文件也注释依赖手杀 UI（runtime `extension/十周年UI/player3.css:159-160`）。
3. 十周年 UI 通过 `ui.create.arena/me`、`lib.init.layout/cssstyles`、`lib.element.player/card` 接管；手杀 UI 通过 `ui.create.characterDialog`、`lib.element.player.trySkillAnimate`、插件重写框架接管。两边共同修改 control/dialog/player/handcard，顺序和版本差异会造成覆盖、重复节点、坐标漂移。
4. 当前 GitHub 1.11.7 已有原生入口：`source/apps/core/noname/ui/create/index.js:3801-3825`（手牌容器）、`source/apps/core/noname/ui/create/index.js:1033`（character dialog 路径）、`source/apps/core/noname/game/check.js:201`（confirm）、`source/apps/core/noname/library/index.js:2501-2718`（card/cardback stylesheet）。移植应围绕这些接口做可关闭主题，而非安装参考扩展。

## 5. 1.11.7 兼容边界与冲突清单

### 可安全优先移植（主题层）

- 颜色、渐变、字体 fallback、按钮/手牌/牌堆/提示背景的 CSS；通过现有 `.control`、`.card`、`.player`、`.dialog`、`#arena` 选择器适配。
- 玩家选中/可选/目标状态的视觉：对应十周年 `player.css` 的 `::before/::after` 资源语义，但保留上游 class 产生方式。
- 选将/角色介绍/技能提示/结算 dialog 的边框、标题、背景；不替换创建与提交逻辑。
- `theme`/独立 theme stylesheet 的开关和回退；保持用户数据与原配置不丢失。

### 必须适配后才可做（最小 UI adapter）

- 手杀 `trySkillAnimate` wrapper、character dialog wrapper：先检查 1.11.7 方法和节点树，再添加 class；不使用 `eval`/动态覆盖框架。
- 十周年 `documentZoom`：仅在串流目标确认 zoom 与坐标映射后，使用现有 viewport 适配；不能全局重写 `getBoundingClientRect`。
- `hand-wrap/hand-cards/equips-wrap`：如果原生节点不足，只添加包装层并桥接原生引用，不能替换 handcard 重排函数。
- 龙框/牌面字体：仅纳入有明确可交付来源且不含静皮/骨骼的大型资源；否则以 CSS border/background fallback 实现。

### 明确不移植（会改变规则/AI或引擎）

- 十周年 `override(lib/ui/game/get)`、`lib.element.player/card` 大规模替换（`extension.js:6203-6234`）。
- `game.check/uncheck`、`game.chooseCharacter`、`game.loop`、`game.over`、`decadeUI.game.wait` 等交互/规则接口替换。
- `十周年UI/skill.js` 的技能选择内容、`extension.js:8030-8065` 的 card event 清理技能。
- 手杀进度条的自动托管选项；它不是纯视觉。
- Pixi/Spine/GSAP、动态皮肤、动态骨骼、live2d 和静态皮肤包。
- runtime 中任何账号、存档、用户数据；不写入源码/公开证据。

## 6. 逐功能移植建议（交付顺序）

1. **基线主题壳**：在现有 theme 机制建立独立、可关闭的 quark-compatible theme；不改默认 simple，不改规则/AI。先复用上游 card/cardback/hp stylesheet。
2. **战场与玩家框**：仅 CSS 覆盖 arena 背景、player 面板、camp/HP/选择态；固定保留八人坐标和上游 `data-position`。做 1280×720、960×540、1560×720 截图对照。
3. **手牌与牌面**：调整 handcard wrapper 的尺寸/间距/选中态，保证 `ui.index.js` 重排、触摸滚动和目标选择仍工作；牌面字体和牌背分开开关。
4. **按钮/技能区**：把 `lbtn/main1.css` 的 confirm/cancel/disabled/skill-button 视觉映射到原生 DOM；技能文本只读 `get.skillTranslation`，不改技能列表和 AI。
5. **选将/武将介绍**：原生 character dialog 外观适配；仅增加搜索/信息展示时才做局部 wrapper，并对 `mode=stone`、国战、斗地主做降级。
6. **提示/结算/菜单**：共用 dialog CSS，保留原生 close/show/over/restart 事件；用自然结算和重新开始验证，不接管 `game.over`。
7. **龙框/字体资源**：最后独立验证来源、许可、大小和加载失败 fallback；不下载静皮/骨骼，不将参考运行时账号数据或大资源提交 Git。

## 7. 验收边界

- UI 验收必须以实际夸克运行截图/录制和上游 1.11.7 同局面截图对照；旧录屏只开十周年 UI、AIoptimize、假装无敌、选将美化，不能当完整基准。
- 必测：选将、8 人战场、手牌展开/选中、目标选中/禁用、确认/取消、技能提示、死亡、结算和重新开始；主题关闭后回退原生。
- 服务器串流只验证画面和触摸映射，不把浏览器自动点击当作实体手机证据；CDP 目标按既定容器分离：stream 19223、quark 19227、record 19226。
- 若必须触及规则/AI，先写明具体原因、接口和最小变更；当前盘点没有发现需要整体更换引擎的理由。任何“直接运行夸克引擎交付”的方案均不符合授权要求。

## 8. 证据索引

- `evidence/quark-migration/battle-css-dependencies.json`
- `evidence/quark-migration/battle-zip-comparison.json`
- `evidence/quark-migration/battle-static-inventory.json`
- `evidence/quark-migration/other-original-settings.json`
- `evidence/quark-migration/other-hooks.json`
- `reference/quark-handheld/ASSET-FINDINGS.md`
- `reference/quark-handheld/base-source/extension/{手杀ui,十周年UI}/`
- `reference/quark-handheld/runtime/extension/{手杀ui,十周年UI}/`
