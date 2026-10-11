# 原包手牌排布与 arena 修正

这是局部移植，不是完整还原通过。

## 来源和实现

- 真实来源：本地 `runtime/extension/十周年UI/layout.css:155-168,218-310`，`extension.js:9795-9877,10068-10072,10764-10777`。
- 修正 arena containing block：left22/right25/top10%/bottom1%，三人人物主面板坐标与原包相同。本方人物主体不再越过720下边界。
- 将原包 hand-wrap/hand-cards 布局适配到原生 `#me/#handcards1`；移除此前误称“原包布局”的 nova 重复 CSS。
- `quark-hand-layout.js` 实现原包靠左、缩放、空间不足重叠、最小 `27*scale` 及横向滚动计算。
- `quark-presentation.js` 只接管展示入口 `ui.updatehl`。原生 Card、规则、AI、事件和输入 handler 不替换；选择抬升继续使用原生 `_transform`。主题回退恢复原 `ui.updatehl` 和原生节点。resize 根据原公式计算手牌容器高度。
- 原包最终 `.card {scale:1.15}` 与 transform scale 同时生效，不以截图估算出另一个尺寸。

## 实际证据

目录均在 `/root/noname-cloud/evidence/quark-migration/`：

- `reference-hand-measure-v2`：隔离原包实际进战场；1280×720，斗地主3人；scale `0.9094736842105263`，wrapper `773×160`，四张手牌约 `112.9566×156.8842`。七项扩展实际加载，仍不等于全部扩展基准。原始错误和缺失请求保留。
- `original-hand-layout-final`：GitHub1.11.7，1280×720，斗地主3人。三人人物主体与四张手牌的 x/y/width/height 对照差为0，详见 `hand-geometry-subset.json`。比较是几何子集：随机角色、牌名、事件阶段不同，不能当同阶段全视觉对照。
- 该局真实鼠标卡牌/目标/确认后原生 useCard=`bingliang -> re_wangyi`，errors=[]；simple 回退 `updateHook=updatehl`，原生name/hp父节点恢复，包装和标题为0。
- `original-hand-identity8`：身份8人实际运行，六张手牌，无错误，回退成功；SKIP_INPUT=1，不能当人工出牌或八人原包同阶段对照。
- `scripts/quark-hand-layout-test.mjs`：0/1/4/8/20/40张纯展示算术、4张原偏移[-5,93,192,290]、min27和关闭fold分支通过。不向引擎造牌/注入事件，不算真实40张手牌操作验收。

## 构建和部署

`hand-layout-build-final.log`：完整 core/character/card/mode 构建正常结束。随后按原包 UA 正则修正移动设备判定（不是 touchscreen 配置）；`hand-layout-build-ua.log` 重建记录保留。仅将构建后的两个 UI 模块和主题CSS复制到既有root dist，未删除现有资源与profile。正式noname-stream的 `/srv/game` 绑定此dist；内部HTTP18094返回hash与实际构建一致：

| 产物 | SHA-256 |
| --- | --- |
| noname/ui/quark-presentation.js | 46b6bd7e2f58fb9ebbd0779b18a2a5047dbfef210663ff015d85e84804c9dd5d |
| noname/ui/quark-hand-layout.js | 80d5accabe2894be352fcae6762505f3e7cec3b0290146c5bded9190129117c7 |
| theme/quark_migration/style.css | 7e09f5d7c3dcc0031c7e1826411279ef962b1c94f3d50226eaa4bb4bdb91ea57 |

正式HTTP产物一致不代表正式串流会话已刷新、串流输入通过或手机体验通过。构建后独立浏览器复测 `original-hand-built`：实际 sha->ol_sp_zhugeliang、errors=[]、回退updatehl；几何子集再次通过。UA更正后复测见 `original-hand-built-ua`（应以最终runtime.json为准）。

## 未解决差异

- 原包手牌在此分辨率底部也伸出720：bottom约734.8；这是实际基准事实，不掩盖为完全可见。后续响应式手机验证需检查触摸与布局。
- 人物头像、name2框、身份标、计数、血量、技能区仍有差异；人物主体几何一致不代表所有子元素一致。
- 原包牌名、花色/点数、卡牌类型/标签、装备和弃牌区域尚未完整还原。
- 菜单、启动、提示、EpicFX/清瑶动态UI运行时、结算与重开，以及全扩展切换仍未完整迁移。
- 不用资源加载/局部几何/鼠标出牌替代完整合同；任务继续未完成。

## 身份八人座位修正（后续阶段）

参考 `reference-identity8-cards` 在1280×720真实原包八人战场运行：座位1/7 top21.4%、侧边32px；2/6 top44px、22%/22.2%；3/5 top7px、35.8%/36.2%；4 top7px、50.2%。来源 `十周年UI/decadeLayout.css:383-428` 的 nova/decade-layout=off，而不是默认nova或on分支。

原目标 `epic-card-identity8-built` 比较失败（座位2 x偏185.25px、座位6 x偏-209.72px等），失败测量落盘，不把八人页面可用当布局一致。仅适配原包座位CSS后 `identity8-original-seat`：8个人物主体和4张手牌 x/y/width/height 差值全部为0，errors=[]，simple回退检查通过；`identity8-geometry-subset.json` 为实测子集。此次SKIP_INPUT=1，没有新增人工出牌证明。

随机武将、牌名和事件不同，参考只启用七项扩展，截图仍有计数、身份/龙框标记、原生范围文本与图形距离重叠、技能区等差异，**不是同阶段全屏还原通过**。正式容器内CSS SHA=`3a30f8877a96befc932147d9f29ca6c0130a761d07d7463d2da0a8ed75adb40f`与dist一致；无正式串流触摸/实体手机新增证据。
