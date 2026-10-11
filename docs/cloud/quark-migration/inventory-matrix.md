# 全扩展实际库存与接管矩阵（生成于本地 runtime）

这份附录把实际目录、文件扫描、assignment 候选和白名单配置连到同一张表。assignment 只是静态候选，不代表执行；运行时激活证据见 `reference-no-video/runtime.json`。未列目录的配置项见 `other-config-gaps.json`，不伪造功能。

|扩展|文件/字节|配置键|候选 assignment|分类与处理决定|
|---|---:|---|---:|---|
|`十周年UI`|3707 / 856,139,101|enable=True; border=five; rarity=xinon|1205|核心布局/玩家/牌/技能/动画UI，拆分适配|
|`手杀ui`|1287 / 213,381,043|enable=True; yangshi/KGMH见 other-original-settings|1106|按钮/字体/技能提示/对话/进度UI，拆分适配|
|`皮肤切换`|1310 / 173,558,619|enable=True|180|皮肤预览/资源管理，排除皮肤包|
|`EpicFX`|3816 / 837,663,993|enable=True; card=True; beautify=1000|120|牌面/装备/技能特效，流程耦合，当前抽取牌面|
|`AIoptimize`|2 / 1,137,506|enable=True; AIoptimize_*|237|规则/AI，禁止随UI启用|
|`无名补丁`|110 / 17,547,324|enable=True|10|流程/选将/初始手牌与UI混合，逐项开关|
|`缘之空`|304 / 22,196,471|enable=True|45|角色/技能与对话混合，规则单独审计|
|`如真似幻`|1527 / 568,500,772|enable=True|152|首页/大厅/动态背景，远程与动态代码隔离|
|`假装无敌`|6973 / 1,863,558,459|enable=True|783|清瑶UI/动画/皮肤，含全局与规则耦合，排除皮肤骨骼|
|`斗转星移`|1408 / 39,328,382|enable=True|19|选将/身份/金将展示与流程混合，逐项审计|
|`选将美化`|188 / 15,089,242|enable=True|128|选将对话/按钮/标记UI，保留原选择逻辑|
|`曹髦滴圣剑`|46 / 4,922,618|enable=True|39|角色技能与特效混合，规则单独审计|
|`太虚幻境`|2329 / 566,723,007|enable=False|559|大型玩法模式，配置关闭，独立可选|
|`boss`|1 / 4,307|enable=missing|10|角色/玩法包，未在配置启用|
|`cardpile`|1 / 1,596|enable=missing|0|牌堆规则脚本，未在配置启用|
|`coin`|1 / 44,592|enable=missing|22|趣味视觉效果，未在配置启用|

## 已落实的真实移植/验证

- 真实移植：背景、shousha 字体、OL 牌面/牌背、龙框稀有度、十周年阵营图、EpicFX 1000 cardFace、手杀 UI 确定/取消/重牌/弃牌/通用按钮与字体。来源及 SHA 在 `ui-assets.json`。
- 真实运行验证：GitHub 1.11.7 三人斗地主中，原生手牌选择/目标/确认产生 `useCard` 历史；主题切换至 `simple` 恢复原生 parent、移除包装/装饰；不调用 `player.useCard`，不以 AI 输入冒充人工。
- 未实现/未宣称：完整技能区、选将美化、菜单、结算外观、八人身份局、串流和实体手机；规则/AI 扩展没有并入。
- 冲突：十周年 UI、手杀 UI、EpicFX、选将美化共同改写 player/card/control/dialog；生产适配只保留原生事件/API，扩展视觉按节点能力挂载。清瑶、皮肤切换、如真似幻的远程/动态代码与皮肤资源不进入核心。

## 证据索引

`other-files.json`, `other-hooks.json`, `other-original-settings.json`, `other-config-gaps.json`, `reference-no-video/runtime.json`, `player-progress.md`, `ui-assets.json`.
