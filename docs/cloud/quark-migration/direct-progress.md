# 直接实施：真实资源第一批

此前 workflow 的结束不等于完成：两次实现结果为 null；72eda4d 仅有原创 CSS/SVG，不满足完整夸克 UI 移植。独立复核未通过结论保留。

本次直接修正：

- 原生加载器以配置值拼接 theme 路径，旧目录 quark-migration 与配置 quark_migration 不符。目录统一为 quark_migration。
- 移除该主题原创 battlefield.svg、dragon-frame.svg 及风格借鉴 CSS。
- 从已有本地 runtime 复制真实战场背景、shousha.ttf、OL 牌面/牌背及 xinon 稀有度龙框；资源本地管理且 gitignore，来源/字节/SHA-256 见 ui-assets.json。脚本 scripts/quark-ui-assets.mjs 可重建，无联网下载。
- 新增 noname/ui/quark-presentation.js，通过原生启动样式加载及主题切换公告驱动展示。只增加 pointer-events:none 的 img，不注册规则技能，不替换 Player/Card/Event 类或规则/AI。
- 龙框按原包 extension/十周年UI/extension.js:228 的 xinon 几何及原生 game.getRarity 决定资源，保留国战与 junk 分支。此项不意味着完整人物 DOM 或布局已迁移。
- 恢复 game/config.json 原格式，只保留主题枚举新增，减少之前无关格式变更。

首次真实运行证据位于 /root/noname-cloud/evidence/quark-migration/direct/：

- 隔离 Chromium，读取正式 dist 的现有 18091 文件服务；未写正式用户 profile。
- runtime-first.json（首次日志留存）：GitHub 1.11.7、斗地主三人、quark_migration，真实四张手牌；原包背景 URL 正确，字体已加载，三个龙框图像 naturalWidth>0，pointer-events:none；资源失败列表与 pageerror 均空。后续运行独立存放，失败保留。
- battle.png 为实际运行截图。simple 原生菜单 handler 回退后装饰数为零，见 fallback.png。
- 第一次 selection.png 取图过早为空，不作选将验收；脚本现已增加等待原生选择事件条件。
- 第二次输入探测因原生选将按钮消失时 locator.click 超时失败，见 direct-probe-second.log，不算通过。
- 第三次独立运行：direct-third/runtime.json、battle.png、input-state.png、fallback.png。原生三人局有七张手牌，无页面错误、主题资源错误；浏览器原生点击手牌/确认后 game.me.getAllHistory('useCard') 记录 zhuge -> re_sunxiu。测试未调用 player.useCard、未开启AI。此项仅证明装备牌提交成功，不证明手机触摸或攻击目标/技能操作。
- direct/deployment.json：正式 noname-stream 容器 HTTP 返回的十项资源 SHA-256 全部与原包清单相同。
- 第一批资源/展示回退和一次装备牌提交通过，不证明全美化功能或完整还原。

原包隔离核验补充：full-reference/home-or-start.png 已取得如真似幻真实首页。七项可用 UI 扩展在配置层开启（十周年UI、手杀ui、皮肤切换、EpicFX、如真似幻、假装无敌、选将美化），不表示战场 content 生效。捕获 Failed to fetch；离线游戏按钮原生点击超时，未进入战场。full-reference/runtime.json 与 full-reference-offline.log 保留失败，不判基准通过。跨库缺失扩展及其他扩展UI贡献仍需覆盖，七项不等于全扩展。

仍未完成：原包全部美化同时启用基准与冲突适配；人物面板/camp/hp 完整 DOM；原包布局与手牌排列；按钮/技能/选将/菜单/启动/提示/结算；EpicFX、如真似幻、清瑶运行时的 UI 渲染及功能切换；死亡、自然结算及重新开始的连续验收；手机音视频外网与物理设备体验。

EpicFX/Pixi/Spine/清瑶运行时不能因包含动态渲染而整体排除。排除的是武将皮肤与额外骨骼包下载，不是 UI 特效库和已有 UI 功能。旧 migration-checklist.md / migration-report.md 中整体排除运行时代码和只迁移表现层意图的方向不作为本次执行依据。
