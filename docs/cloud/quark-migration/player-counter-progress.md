# 人物手牌计数与身份图案适配

局部阶段，不是完整人物UI或全屏还原。

## 原包接口与适配

来源十周年UI `player2.css:1393-1509`、`extension.js:7459,7610-7738`。保留 GitHub 原生 Player.node.count/identity、数字和点击处理，不覆盖计数 innerHTML 或 setIdentity；仅附加可逆展示类和身份PNG。

- 计数使用实际 `image/decoration/shousha_shoupai.png`，36×28，left=-8/bottom=-7、HYZLSJ28px。本方计数按原包隐藏。适配清除 GitHub newlayout/global.css 的 padding2px，否则实测40×32、y偏4px。
- 身份使用实际 `image/decorations/identity2_*.png`，35×35、right=-8/top=-8；节点内PNG pointer-events:none，原生点击入口保留。
- 仅根据原生节点已经显示的文本映射，不读取隐藏身份，未知玩家保持“猜”。原包实测“猜”使用 `identity2_cai.png`，早期 guessing.png 推断错误，最终按实测改为cai。
- 当前覆盖普通身份与斗地主，未宣称国战/对决/特殊身份完整覆盖；无对应图片保持原生文字。
- 回退删除PNG和计数/身份类，恢复先前dataset.text，原生数字内容不修改。

资源总945项，源路径、字节长度和SHA见ui-assets.json；大资源本地管理不提交Git。

## 证据

原始目录 `/root/noname-cloud/evidence/quark-migration/`：

- `player-counter-identity3/runtime.json`：3人，原生鼠标nanman→huatuo/re_liaohua，errors=[]、主题资源失败=[]，地主/农民PNG实际加载，回退counterClasses=0/identityImages=0且原父节点恢复。
- `player-counter-identity8/runtime.json`：8人、未知身份为“猜”，PNG加载、计数文本与dataset一致、本人计数隐藏、回退通过；此早期轮count有40×32误差，不能当几何通过。
- `reference-player-counters/runtime.json`：原包七扩展实际8人战场，取得原生count/identity几何与生效图片。参考自身有2项页面错误及原资源/联网失败，不能说参考无错误。
- `player-counter-final/runtime.json`：padding修正后8人、errors=[]、资源失败=[]、回退通过，SKIP_INPUT=1没有新增出牌证据。16项计数/身份节点xywh与原包全部差值0，记录于player-counter-geometry-subset.json。该轮身份“猜”仍为早期guessing图，不能算图片逐项通过。
- `player-counter-final-build.log`：最终cai映射与padding的完整core/character/card/mode重构建成功。完成后同步编译模块/CSS，`player-counter-compiled-final/runtime.json` 验证8人实际显示“猜”对应cai.png、图片加载、36×28计数、errors=[]、资源失败=[]和完整回退通过；SKIP_INPUT=1不算新人工出牌。
- 正式容器内部HTTP18094的编译适配模块SHA与dist相同：`f86100594cb44d6cf14a9118414b25f1f2065c0b0997f632d74f5263da3b1af2`；CSS SHA=`b7362a008134c41e7e56b578aaef63beae97a70f9774e62bdf93af3f6ee60adf`。

布局子集基于不同随机武将、身份和事件；没有完整同阶段逐像素一致。身份猜测弹框、多扩展身份覆盖与切换、全部人物子元素、特效、菜单/提示/结算仍有缺口。正式HTTP资源一致不等于串流输入，实体手机证据未取得。
