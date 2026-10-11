# 原生技能实际输入验证

本阶段补充操作证据；没有宣称全部技能美化或全部扩展运行时完成。

## 探针适配

`scripts/quark-ui-probe.mjs` 只通过真实原生选将、技能 control、手牌、目标和确认/取消点击操作。没有新增技能、改卡牌定义、改规则/AI、直接调用 useSkill/useCard 或开托管。

旧探针只等12秒或点到技能按钮，缺合法选择完成链。新探针：

1. 从实际候选只读检查技能 `enable`，优先简单出牌阶段技能；最终角色仍以实际 `game.me.name` 为准。
2. 检查原生 event 的父链，须为本人的 `phaseUse`，不能在AI回合误操作。
3. 响应/弃牌/可选触发阻挡时通过原生 UI 取消、选择或确认推进，不无限等同一个暂停事件。
4. 点击技能后做合法手牌/目标/button选择及确认，每轮落盘 `skill-progress.json`。
5. 完成须新增原生 `useSkill` 或带同技能字段的 `useCard`，且匹配实际点击的技能；点击本身不算完成。

## 实际证据

`/root/noname-cloud/evidence/quark-migration/skill-native-completion-v2/runtime.json`：

- 实际角色 `re_mazhong`，`auto=false`。
- 开始为 `chooseToUse`，尚非本人出牌阶段，2次实际取消响应后进入本人 `phaseUse`。
- 实际点击 `refuman`，选择手牌及目标（此次目标为本人）。原生新增 `getAllHistory('useSkill')`：`{skill:'refuman',targets:['re_mazhong']}`。
- 该技能由合法选择后原生 auto-confirm 提交，探针未记录独立确定点击；不能当作额外手动确定操作证明。
- 随后独立原生 `useCard`：`sha → huaxiong`。
- errors=[]、主题资源失败=[]；simple回退后装饰全部清除、name/hp原父节点及updatehl恢复。

早期 `skill-native-completion` 的 `xin_yuji/reguhuo` 被响应阶段阻挡，不能当成功。后续 `skill-native-ancestors` 角色 `re_zhuhuan` 无此处可用出牌阶段技能，又在 `chooseBool` 阻挡，不能当成功。

更严格的 `skill-strict-matched/runtime.json` 实际为 `sunshangxiang/jieyin`：本人 phaseUse、auto=false，点击技能并选2张牌，但没有可选目标/新增 jieyin 事件，completed=false；已有自动触发 bahu 未被错误计入技能成功。源码 `apps/core/character/standard/skill.js:1997-2026` 要求非本人、男性且受伤目标，不能为了通过而改HP/添加目标/篡改规则。资源检查 resourceBatchPassed=true 只是资源/回退检查，**不是该技能完成通过**。后续探针对未完成技能实际点击取消以恢复输入，避免卡在技能选择状态。

仍需：更多技能类别/视为牌、技能区原包完整样式与提示、串流实际输入、完整模式流程及同阶段对照。以上为独立浏览器鼠标输入，不是手机或正式串流触摸证据。
