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

后续阶段证据：post-build-three 在全量核心构建后通过三人斗地主，资源无失败、原生 `shan` 出牌历史存在、菜单节点带 quark-menu、simple 回退父节点恢复；identity8-quark-final 通过八人身份局，三种尺寸截图和选将/战场/控件证据齐全。主题关闭后本方座位从夸克右下布局回到 GitHub 原生位置，记录为预期回退差异，不能要求几何不变。`a5aeb88` 又接入原包 `layout.css` 的本方手牌容器左移150px/120px高度/折叠滚动规则；独立矩形探针在公共启动阶段无输出而停止，因此手牌精确矩形仍待单独证据。正式 noname-stream 是 `/root/noname-cloud/source/dist` 的只读 bind mount，最新主题 CSS hash 已与容器一致。

部署边界：`evidence/quark-migration/deploy-stream-boundary.json` 记录源码/dist/正式 noname-stream 容器四项 hash 一致且 bundle 含安装调用；公网 cloud-phone 和容器 HTTP 入口当前均返回 Selkies Basic Auth 401，正式外网串流、实体手机音视频触摸、温升电池暂不能取证，未输出凭据。

技能缺口：适配已接入原生 ui.skills/ui.skills2/ui.skills3 的展示类和真实原包字体渐变，但随机斗地主局未稳定产生可见主动技能控件；SKILL_PROBE 只等待原生节点并读取 useSkill，曾在公共启动阶段无输出超过两分钟，已停止并限制为12秒，不能把技能适配代码当作 useSkill 验收。

下一步：真实点击原生选项菜单并记录弹出节点；补齐本方手牌排列/空间、原生主动技能事件、完整扩展冲突和切换，再做自然结算/重新开始、正式串流输入及实体手机证据。未完成时继续目标，不需用户提醒。
