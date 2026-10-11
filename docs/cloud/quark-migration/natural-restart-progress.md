# 连续自然结算与真实重开验证

只覆盖独立浏览器、GitHub1.11.7、quark_migration主题、斗地主三人；不冒充串流/手机证据。AI整局用于自然规则流程观察，不冒充人工出牌。

## 探针修正

`scripts/quark-identity-probe.mjs` 从启动后立即逐秒写 JSONL，记录 over/round/alive/dead/useCard/useSkill/event/角色HP，结算先落盘再尝试重开。

旧重开判断依赖一次 async waitForFunction，实测出现 bootstrapped=true 但 state.over=true、无导航的矛盾。现明确废弃该标志：必须实际点击/指针尝试后，记录新页面导航，旧document标记消失、arena存在、players>0且over=false才通过；检查期间持续落盘状态。固定1.8秒延时和一张结算图都不是证明。

## 成功证据

`/root/noname-cloud/evidence/quark-migration/skill-panel-restart-verified/`：

- `quark-doudizhu-natural.jsonl` 连续观测约60.5秒自然结束，round4/useCard23/useSkill14、alive1/dead2。
- `quark-doudizhu-natural-result.png` 原生结算画面。
- `quark-doudizhu-natural.json`：实际 locator 点击“重新开始”，中心hit文本匹配；clicked=true。
- 约80.9秒记录导航到 `http://127.0.0.1:18091/index.html`，新文档marker=null；初期0玩家/无arena，随后3玩家/arena=true/over=false/event=chooseButton。
- 新启动 state.version=1.11.7、theme=quark_migration，`quark-doudizhu-restarted.png` 保存实际选将阶段。errors=[]。
- 此轮确认重开到新选将，未声明重新开始后的第二整局完成。

## 废弃证据及边界

`skill-panel-natural-restart` 第一轮自然结算是有效的（round3/useCard14/useSkill12），但重开 click超时、无导航且state仍over=true；bootstrapped=true 是探针误判，重开证明无效。`quark-doudizhu-restarted.png` 不应当作新局证据。以本文件和 verified 目录优先于旧标志。

本阶段仍没有正式串流输入、实体手机触摸/音频/外网/温升/电池证明；不满足全部 interaction 合同。结算画面仍有未移植/错误装饰文字等差异，同阶段原包结算逐项对照未完成，不宣称完整视觉还原。

## 八人面板回归

`skill-panel-identity8/runtime.json`：8玩家、实际鼠标muniu→caocao、errors=[]，被动技能奸雄/护驾面板可见、回退清理通过。与原包参考比较人物主体8座几何均一致，前4手牌一致，但随机目标该轮手牌数多于原包4张；严格同手牌数比较失败，不能作为完整同阶段一致证据。
