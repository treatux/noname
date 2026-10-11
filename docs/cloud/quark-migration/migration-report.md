# 夸克 UI 移植阶段报告

## 交付路径

本阶段严格使用 GitHub 1.11.7 作为唯一交付引擎。夸克 1.12.7.0711_β、纯净 ZIP 和如真似幻补丁仅用于本地只读参考；没有复制夸克 `game` 引擎，也没有安装参考扩展整体覆盖上游。

## 已完成的实质实现

- 新增可切换主题 `quark_migration`，入口位于 `apps/core/game/config.json` 和 `apps/core/game/package.js`。
- 新增 `apps/core/theme/quark-migration/`：上游 DOM 选择器适配玩家框、选将按钮、手牌/牌面、控制按钮、菜单、对话框、结算面板和选中/目标状态。
- 保留原生座位几何、牌面背景加载、触摸命中区、选择/确认、事件、规则和 AI；主题关闭后可回退原生主题。
- 主题使用小型原创 SVG fallback 背景/龙框，不带入静态武将皮肤、动态皮肤、Spine/Live2D、`.skel`、`.atlas`、音视频大包或账号数据。
- 正式 `source/dist` 仅同步了配置/名称和五个主题文件，没有删除或覆盖其他 dist 内容；`noname-stream` 继续挂载该 dist，用户 profile 未重置。

## 真实验证

- `pnpm --filter @noname/jit build`：通过。此前核心构建因 JIT `dist/service-worker/index.js` 缺失失败，补建该被忽略的构建产物后恢复。
- `pnpm -F noname build`：通过，完整 Vite 输出成功。
- source、`apps/core/dist`、正式容器 HTTP 返回的主题资源 hash 一致，记录见 `evidence/quark-migration/migration-runtime.json`。
- `game/update.js`、source dist、构建 dist 和正式容器均为 `1.11.7`。
- 规则/AI/模式代码未改动；本阶段没有触及 `game.check`、`game.over`、选择提交、座位计算、AIoptimize 或任何规则扩展。
- 隔离 profile 已建立并只写入白名单 UI 配置；没有复制既有 `noname-quark_profile` 或正式 `deploy_profile` 的 cookie、localStorage、账号、房间、签名字段。

## 未完成且不能虚报

1. 参考原备份的全部相关美化同时启用后，尚未取得完整首页→选将→斗地主 3 人战场→结算的连续基准。
2. 夸克容器当前已有首页/局部证据，但旧录像仅启用十周年 UI、AIoptimize、假装无敌、选将美化，不能作为全部美化基准。
3. 隔离 profile 在当前 devfs 空页面写入白名单配置后没有进入游戏态，未产生有效的 `quark_migration` 运行截图；保留截图仅作失败记录，不作为通过证据。
4. 正式 profile 尚未执行主题切换和真实人工输入验收。选将、手牌目标、确认/取消、技能、菜单、死亡、自然结算、重新开始以及 8 人覆盖仍待真实输入/useCard 事件证据。
5. 真实手机触摸、音频、外网串流和物理设备可读性仍未完成。

## 冲突处理

十周年 UI、手杀 UI、EpicFX、如真似幻和假装无敌的整体 loader、原型 override、Pixi/Spine、远程/动态代码均排除。AIoptimize、缘之空、斗转星移、无名补丁、曹髦技能行为等规则耦合贡献不进入 UI-only 迁移。若未来必须改规则/AI，必须先单独记录具体接口差异、原因、最小补丁和回滚验证。

本报告只宣称“GitHub 1.11.7 上的第一阶段 UI 适配已实现并完成资源部署校验”，不宣称完整夸克 UI 已还原。
