# 人物与 EpicFX 牌面阶段记录

状态：实施中，不是完整还原验收。

已实现待最终画面核验：
- 原生Player姓名/体力节点可逆移入camp-wrap/hp-wrap，原始parent/nextSibling/className保留以回退。
- 真实十周年UI image/decorations/name2_{wei,shu,wu,qun,shen,jin,key}.png，仅展示阵营，不改变玩家身份/生命值。
- player2.css原尺寸128×171.5、本方rightLayout右下，以及decadeLayout.css三人座位规则。
- EpicFX实际覆盖OL的cardFace/1000真实牌面/背/标题底图；新增展示标题，隐藏原竖姓名时保留节点和牌规则。未迁移EpicFX原ui.create.card/game.uncheck整体覆盖。
- 实際首次布局截图出现棕色展示容器覆盖头像，最新CSS已清除继承背景/阴影，并适配原头像宽高；player-paint-check待实际结果核验，不能把旧截图判通过。

运行证据：
- player-restore-check/runtime.json：三人GitHub1.11.7，nameInCamp=camp-wrap、hpInWrap=hp-wrap、originalHpSame=true；原生输入wugu -> 三个目标，未开启AI；simple回退campWrappers/cardTitles/ornaments均零且originalParentsRestored=true。
- player-layout-check/runtime.json：原生输入chitu -> re_guanzhang、回退通过，但截图棕色遮挡，因此视觉未通过。
- player-build.log记录此前完整构建，各模块需按最终代码复建；当前正式dist增量同步的ui模块为无alias的直接ES模块并保持原引擎。

原包基准：
- reference-choose-battle：七项美化运行开启，问答按包内提示真实fill/click完成，选择截图和四张手牌战场真实截图已取得。具体七项不等于所有扩展UI覆盖。
- reference-clean：取得无提示战场/几何。AI自然over=true后录像保存lib.db.transaction报错，不能当完整结算成功。
- reference-no-video：仅隔离参考配置video='0'，不更改引擎/规则；正在连续记录自然局。menu.png虽存在但尚未人工核实真打开，不按文件名通过。

已验证提交：e6c2f8c为原包控件适配（17素材HTTP一致），人物/牌面改动尚在工作区待画面核验后提交。

下一步：复核player-paint-check头像/name/hp、保证原布局回退；读取reference-no-video自然结算与截图；补齐本方手牌排列/空间，原技能DOM与合法主动技能控制，完整扩展冲突和切换，再做八人及正式串流输入。未完成时继续目标，不需用户提醒。
