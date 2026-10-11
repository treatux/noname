# 手杀 UI 主动/被动技能面板接口移植

这是有限面板适配阶段，尚未覆盖全部技能/扩展接口、特效和冲突切换，不标记完整还原。

## 原包来源与接口差异

原包 `extension/手杀ui/skill/main1.js:41-56,266-275,742-817,971-1029` 创建独立 enable/trigger 面板，并以 `app.mockTouch` 向隐藏技能控件转发点击；`main1.css` 使用实际 btn0/btn1/btn2 图片及 HYZLSJ 字体，主动与被动分组有不同字体/排列，选择/可用状态来自当前原生事件。

GitHub 1.11.7 的 `ui.skills/skills2/skills3` 为原生 Control，按钮通过 `ui.click.control`→Control.custom→`ui.click.skill` 进入事件 backup/check。直接搬原包对 Player/createSkills 的重写会重复接管并改变原引擎接口，因此采用独立 DOM 投影：

- `apps/core/noname/ui/quark-skill-presentation.js` 保留全部原生控件和事件，只在主题启用时用 CSS 隐藏输入源；独立 enable/trigger 显示组投影本人技能，读取原生当前可用控件。
- 可用/选择状态以当前 event.player、event.skill 和仍存在且未 hidden/disabled/removing 的原生 Control 判断。
- 面板点击时重新查当前源按钮，按原包 mockTouch 方式发送 DOM click/touchend；不是直接调用技能函数、制造 useSkill/useCard、修改规则或开托管。
- 未改变原生 ui.create.skills、Player.getSkills 或技能定义。250ms只读技能投影检查；签名不变时不写 DOM，避免观察器自循环。
- 主题回退删除面板，取消原生 Control 隐藏类。旧无背景的技能文本 CSS 被原包分组/图片样式替代。

## 资源

新增原包 `手杀ui/skill/images/btn0.png`、`btn1.png`、`btn2.png`，source/hash 见 `ui-assets.json`；总936项，资源本地管理不进Git。它们分别为可用、选中和不可用背景，非原创SVG/借鉴图。

## 已有运行证据

`/root/noname-cloud/evidence/quark-migration/skill-panel-port/runtime.json`（源码适配轮）：

- 实际 `re_xiahoushi`，auto=false，本人phaseUse；真实鼠标点击面板 `reyanyu`→转发原生Control→选合法sha手牌。
- 原生 `getAllHistory('useSkill')` 新增 `reyanyu`，不是把既有 `bahu` 自动触发算入。
- 后续独立鼠标原生出牌 `qinglong → re_xiahoushi`。
- errors=[]，主题资源失败=[]；simple回退 skillPanels=0、hiddenSkillSources=0，name/hp原父节点及updatehl恢复。
- `skill-panel-geometry-subset.json`：与参考 `reference-card-textures-v2` 的一主动/一被动技能层测量相比，x/y/width/height全部差值0。随机技能和事件不同，**仅布局子集，非同阶段全屏一致**。

完整构建 `skill-panel-build.log` 已结束（core/character/card/mode）。结束后再同步编译产物，避免中途拷贝静态资源导致旧CSS被误用。正式容器内部HTTP18094的技能模块 SHA 与实际dist相同：`3b34d9fcbd2c7c0f450762b1f839a770cbf0b6c056b538535dd162dba4583bac`；CSS为`8623be32caf306c7fcc59899eb3d62dda42a73faac42639c19fee3ce58a936b4`。

编译后复测 `skill-panel-built/runtime.json`：实际 `re_guyong`、auto=false，本人phaseUse，通过面板点击 `reshenxing` 后原生新记同技能 useSkill，随后鼠标 `sha → re_caifuren`；errors=[]、资源失败=[]，simple回退 skillPanels=0/hiddenSkillSources=0、原父节点及updatehl恢复。此技能无需选手牌即原生提交，没有独立确认点击或选中中间态截图，不能当这些额外操作的证明。`skill-progress.json` 是循环内快照（completed=false），完成结论必须以最终 `runtime.json` 的新增原生事件为准。

原包参考外网更新失败仍按原证据披露。正式HTTP产物一致不代表串流输入或实体手机证据。

## 剩余范围

special-enable/special-trigger、全局/装备技能、预亮、次数/充能、失效/限定/觉醒/转换技专用背景与标志、完整提示、清瑶/EpicFX UI 动画、技能详情交互与多扩展切换尚未完整适配。尚未证明所有技能、多模式、手机触摸与串流输入。游戏规则/AI不因验证不足被更改。
