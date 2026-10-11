# 验证更正与剩余差异

本记录优先于旧报告中扩大“passed”的结论。完整移植未完成。

- `reference` 任务曾标完成，但 reference-no-video 只运行七项扩展，其他提供扩展的 UI 贡献尚未形成运行基准；menu.png 实际仍是战场，不能当菜单打开证据。缺少完整重叠界面切换关系，不满足完整合同。任务系统已完成状态不可重开，因此在此明确披露，不用该状态作为整体验收依据。
- identity8 的 presentationPassed 只证明八人页面/主题与限定回退检查。早期 selection.png 为白屏，不能当选将证据。identity8-chooser-v3 才有实际143角色按钮、630×350 dialog和非白屏截图。仍非与原包八人同阶段逐项一致。
- 旧几何比较以空CSS变量判断主题移除，无证明力；现已改用实际stylesheet disabled状态、主题link移除、包装移除和原生name/hp父节点恢复。需复跑新断言。
- 三人/八人视觉仍有本方头像越过720底边、手牌尺寸/起点/排列与原包不符。a5aeb88复制的手牌CSS本来就在GitHub nova布局，不能声称实现了27px折叠或原包updateHand算法。
- 选将dialog2素材嵌入等级/胜率等文字，当前直接铺设会出现无对应数据的装饰文字，需按真实参考界面重新适配。
- 人工设计的棕金渐变菜单CSS已移除，仅保留真实字体及原生菜单行为；不能称其完整菜单还原。
- 原生技能control挂在#control内，旧arena直接子选择器无效；已改后代选择器。原生控件没有扩展.usable标记，已移除据此绘制禁用的规则。仍缺技能完成事件。
- 多次“初始化卡住”实为探针错误：Node变量probeMode/probePlayers未显式传给evaluate/waitForFunction；DOM querySelectorAll不能使用Playwright :visible。现已修复，加阶段日志与battle-state/interaction-state快照。

实际新证据：
- staged-input：菜单真实点击后读取原生内容，zhuge->old_caoren原生鼠标出牌，errors=[]，simple回退恢复原生节点。
- skill-available-native：从实际候选只读选出re_sunshangxiang（xiaoji/rejieyin），auto=false；技能检查时event=useCard，seen=false/useSkill=0；随后真实鼠标sha->re_mazhong，errors=[]，父节点恢复。禁止把点击/有技能名称当useSkill通过。
- doudizhu-natural-restart-v2：自然AI局over=true round4 alive2 dead1 useCard31，结果截图；重开未尝试，不能算重开成功。doudizhu-restart-final：限定时间over=false，不算自然结算/重开成功。
- 外网401来自既有Selkies认证入口；18093是串流网关，不是游戏HTTP；真正游戏HTTP在容器127.0.0.1:18094。认证资料已存在本地secrets，不输出。401不是永久外部阻塞，继续通过现有部署配置查明认证与串流测试。

下一步：技能检查等待本人phaseUse/原生技能control，点击、合法选择、确认后读原生history；菜单前后检测祖先.hidden与checkVisibility；自然局逐秒落盘并记录重开导航；修正arena/手牌几何和对照资源；补全未移植UI扩展与切换；正式串流输入独立取证；实体手机必须真实设备证据。整体任务保持未完成。
