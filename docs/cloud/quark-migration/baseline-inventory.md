# 夸克 UI 移植：只读基准盘点

## 边界与结论

本次仅 Inventory，不修改引擎、扩展、HTML、用户配置或既有会话。最终目标严格为 **GitHub 1.11.7 规则与 AI + 夸克完整 UI/美化贡献移植**，不能以夸克引擎交付；handheld 原创主题不算还原。未下载静皮/骨骼，龙框、按钮、牌面、字体在范围。

历史 `CONTINUATION.md`、美化计划及 ASSET-FINDINGS 已读。其“直接使用夸克包”建议与本次命令冲突，作废；其旧端口、完成状态不代替本次实测。未使用 workflow 报告作为验收。记忆/REA 工具在本任务工具集不可用，采用实际文件、ZIP 成员和被动 CDP 检查，没有安装工具或修改注册。

**目前没有完整美化的战场基准。** 参考容器确实显示如真似幻首页，但不是正在进行的战场；旧录像只启四个扩展。正式页面仍为原创 handheld。

证据根：`/root/noname-cloud/evidence/quark-migration/`。安全 JSON 仅输出白名单 UI 配置、扩展开关/顺序、本地资源路径及哈希，不导出账号、用户记录、原始配置、凭据或签名链接。

## 1. 原始数据备份与顺序

`baseline-static.json` 对 `runtime/无名杀 - 数据 - 2025.7.21 16.06.26` 只读 base64→JSON 解析，972424 字节，结构为 config/data，未执行任何配置代码。备份内容与 ZIP 对应成员一致。

备份为 1.12.7.0711_β；nova/simple；牌面 ol，牌背 ol，HP glass；背景 cdv_cdv_ol_bg；name/identity/cardtext/global 字体均 shousha；ui_zoom normal。

扩展名单顺序：

十周年UI → 手杀ui → 皮肤切换 → 指示线 → 手杀MVP → 千幻聆音 → 手杀全扩 → EpicFX → 手杀结算 → AIoptimize → 特效测试 → 无名补丁 → 缘之空 → 标记补充 → 笨蛋插件 → 全能搜索 → Thunder → 无名扩展 → 神华佗 → 可爱的四月G_E → 名称重置 → 谋关羽 → 神鲁肃 → 如真似幻 → 假装无敌 → 萌新包++ → 淋淋雨 → 极略 → 斗转星移 → 语音整理 → 选将美化 → 曹髦滴圣剑 → 太虚幻境。

33 项中 26 项主 enable=true；备份禁用：手杀MVP、千幻聆音、手杀全扩、手杀结算、标记补充、无名扩展、太虚幻境。精确布尔值以 JSON 为准，不能将所有名单成员当成有效扩展。包含规则/武将类扩展，名单不是“所有项无条件移植规则”的授权；须逐项辨认其美化贡献。

实际旧引擎 loader 在 `runtime/game/game.js` 的 init 中按 lib.config.extensions 顺序提交 extension.js 加载，样式门槛后加载扩展，扩展回调齐后加载牌/武将包。**这是请求枚举顺序，不保证并发完成/覆盖顺序。** 禁用扩展仍可能被请求/import；enable 与 HTTP 加载成功、执行成功、UI 激活是不同证据。还需关注扩展队列和 precontent/content/onload 的覆盖。

## 2. ZIP、补丁与被修改的 index

直接检查 ZIP 中央目录：**没有根 `index.html`**，仅 `extension/假装无敌/dist/index.html`。因此不存在可以冒称“ZIP 原根 index”的文件，也不能给根 index 提供原包一致哈希。`runtime/index.html` 是后加的自定义 loader，当前哈希与大小已写 JSON；含嵌入配置、文件读取 HTTP 桥、skill-control 定时兼容节点、offline session 标记等。

当前 loader 脚本顺序为 update.js → config.js → package.js → game.js。嵌入配置只列十周年UI / AIoptimize / 假装无敌 / 选将美化（均 true）；它与原备份 33 项名单不一致。当前参考首页 localStorage 又是第三种配置（见下一节），不能用 loader 字面量断言首页当前配置。

本次逐项比较 39 个有限成员：四个 game 文件、identity.js、原备份、33 个扩展 entry。ZIP 与 runtime 唯一已存在成员差异为 `extension/如真似幻/extension.js`；它与本地补丁 7z 的 extension.js 完全一致。其余已存在成员字节相同；33 个扩展 entry 中只有 13 个在 ZIP/runtime 存在，另 20 个两侧都缺失（包括原备份 enable=true 的指示线、特效测试、Thunder 等）。这直接说明备份名单并非纯净包实际扩展库存，不能仅通过开启保存开关取得全部贡献；缺失成员和确切覆盖边界见 comparisons。**没有重新全量哈希/CRC 整个 ZIP，也没有证明全资源树零修改。** 归档全量 CRC、广告 MD5 不符的历史事实保留，不重新声称 publisher authenticity。

Git HEAD 本次为 a16f79d；初始 git status 干净。`apps/core/game/update.js` 与 `dist/game/update.js` 均写 1.11.7；CDP 正式页面也读到 1.11.7。没有将夸克 game/game.js 复制进 source。

## 3. 实际容器与页面（被动 CDP）

`baseline-{stream,quark,record}.json` 与对应 PNG 是本次实际采集。容器均 running/healthy：

| 服务/CDP | 挂载 | 实测状态 |
|---|---|---|
| noname-stream / 19223 | source/dist → /srv/game，只读；保留 deploy_profile | 主 `/` 页面 1.11.7，handheld/mobile；8 座位、3 存活+5 死亡；round 8、over=true、auto=true，截图为战斗失败原生统计面板。另一个 index.html target evaluate 超时，未重载/关闭它。|
| noname-quark / 19227 | reference runtime → /srv/game，只读；保留 noname-quark_profile | 当前页面 `/extension/如真似幻/html/rzsh.html`，如真似幻首页；update 文件 1.12.7.0711_β、截图左上同版本。无 lib/game 战场 globals、无玩家 DOM、2 canvas。不能当作开局/战场完整 UI 成功。|
| noname-record / 19226 | source/dist → /srv/game，只读 | 当前 `/` 页面 1.11.7、simple/mobile；round 7、4 存活+4 死亡、over=true、auto=true。不是旧夸克录像运行环境。|

1.11.7 为 ES module，不存在 window.lib；probe 仅在页面已经加载 `/noname.js` 时复用该已缓存模块，读 lib/game/_status，不导入未加载模块。最初只查 window._status 导致错误的 over/auto，已修正并重采，以最新 JSON 为准。

参考首页只能读到 **saved localStorage**，不能冒称 lib.config 有效激活。当前名单 13 项：十周年UI、手杀ui、皮肤切换、EpicFX、AIoptimize、无名补丁、缘之空、如真似幻、假装无敌、斗转星移、选将美化、曹髦滴圣剑为 true，太虚幻境 false。这比原备份少指示线等，亦不同于四项 loader。

首页本次观察 101 条 retained performance 资源；38 条如真似幻、16 十周年UI、10 手杀ui、9 EpicFX 等资源路径，shousha 字体 loaded。其请求包含 fetch/XMLHttpRequest，表明首页确实涉及多个扩展资源，不证明战场 content 成功或无错误；没有开启 Network/Runtime 日志、没有历史错误捕获。正式页面没有已启用扩展名单，仍为 handheld；performance 只有最近 250 项记录，不是完整网络 HAR，也不代表图像资源不存在。

`baseline-summary.json` 补充本地扩展文件/后缀计数与补丁 entry 比对。资源存在≠资源加载成功≠完整美化验收。

## 4. 旧 reference 录像实际产物核验

读取了 `evidence/quark-record/RECORDING.md`、`verification/VERIFICATION.md`、record.mjs、实际 result/ffprobe/比较产物。本次重新哈希最终 MP4：

- `/root/noname-cloud/quark-noname-full-game.mp4`
- SHA-256 `36a22072641154ded34f4779c14e41eacf672c1896a66a9e8383d7f47cc53b42`
- 4027485 字节；已有 ffprobe 记录 225.636267 秒、1280×720 H264、467 帧、无音轨。

本次直接查看实际 `verification/frame-223.png`：夸克龙框/绿血珠/原包牌面及李丰技术分 146 的结算面板。旧 script 使用 Android screenrecord，选将辅助后原引擎 AI auto-play；不证明人工出牌。历史录制 target 在 19225，不是本次 19226 的 Chromium。

实际 effective-boot-config 的 enable=true 只有 **十周年UI、AIoptimize、假装无敌、选将美化**。手杀ui、如真似幻、皮肤切换缺席；两段录制有边界间隙且低帧率，无音轨。历史 128 loaded source 比对与 engine 成员相同仅是其限定集合结论。本次未重新解码全视频或重新观察历史执行，不将旧 verify “PASS”扩大为全美化移植/基准 PASS。

## 5. 基准缺口与后续消费要求

1. 缺原备份全部美化贡献同时启用的首页→选将→八人战场→卡牌/技能/提示→结算连续基准。首页可作为首页证据，四扩展录像可作为局部 battle/结算证据，不能彼此拼成“全贡献成功”。
2. 原备份、runtime loader、当前参考 profile 三种配置不同；须明确每个贡献由哪个扩展及参数实际产生，保留其他无关规则/账号数据不动。
3. 参考当前只到首页，正式页面仍原创主题。移植完成前必须证明正式 1.11.7 页面真实激活相同 UI，不能以版本标签替换或运行夸克引擎验收。
4. 单页请求中有外部更新资源；JSON 省略外部 URL，不提供下载授权或签名链接。未请求新外部资源、未下载静皮/骨骼。
5. 列表中的 AIoptimize/规则扩展、美化对 player/event/选择方法的覆盖必须拆分。后续若确需触及规则/AI，先记录具体 UI 依赖及原因，不能整体换引擎。本次完全没有规则/AI改动。
6. 首页和录像参数/环境不同（desktop 1280×720 vs Android WebView），不能给像素一致、触摸、FPS或全模式结论。CDP 超时 target 保留为未核验。

## 重跑与变更边界

在读取 Node 环境后运行 `node /root/noname-cloud/evidence/quark-migration/baseline-probe.mjs`，静态成员核对运行同目录 `baseline-static-probe.py`。仅写该独立证据目录；不导航、刷新、启用扩展、重置 profile、点击、处理弹窗或关闭既有 target。截图/JSON 重跑会覆盖本次同名快照；需要保留新旧对比时先选择新的输出目录。

只读探测并非零 CPU 开销，但没有有意改变游戏或存储。未创建 goal、预算、嵌套 workflow，未提交大资源或账号数据。本分工仅新增本报告及独立 evidence 文件。
