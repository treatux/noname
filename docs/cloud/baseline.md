# 源码基线

- 上游：`https://github.com/libnoname/noname`
- Fork：`https://github.com/treatux/noname`（GitHub API 验证 isFork=true）。
- 固定提交：`c2c9ae0be72e4284416f122a220f9c6081ddd768`。
- 版本：1.11.7；分支：cloud-host-validation。
- 工作目录：`/root/noname-cloud/source`。
- 环境：Node 22.23.3、pnpm 10.34.6、JDK 21、Android SDK 36。

## 复现

```bash
source /root/noname-cloud/env.sh
cd /root/noname-cloud/source
pnpm install
NODE_ENV=development pnpm -F noname exec vite --host 127.0.0.1 --port 18081
pnpm -F @noname/fs dev --debug --dirname=../../apps/core --port=18089
pnpm -F @noname/server dev -- --port 18082
pnpm build
pnpm -F @noname/fs dev --debug --dirname=../../dist --port=18091
pnpm -F @noname/mobile build:android -- --variant=debug --skip-web-build
```

Android 构建必须在 `pnpm build` 完整结束后执行，防止静态素材尚未复制完。

## 模式盘点

源代码 `apps/core/game/package.js` 声明 11 个菜单项，其中 connect 是联机入口，其余 10 个是游戏模式；另有 realtime.js，但未声明为默认菜单模式。

`apps/core/noname/library/index.js` 的 `mode` 配置声明身份、国战、对决、斗地主、单挑具有 connect 配置；挑战、战棋、塔防、炉石、乱斗未声明 connect 配置。乱斗存在借用其他模式规则的场景，不能仅依据配置判断每个场景的可用性。

详细初始清单：`mode-inventory.json`。此处为源码能力盘点，所有模式的实际运行结果仍待验证。

## 独立服务

- 18081：本地开发页面。
- 18089：本地开发文件服务。
- 18082：联机大厅 WebSocket。
- 18091：本地正式构建页面与文件服务。

尚未增加公网入口。已有服务未修改。云端 Chromium 用现有 Playwright，Android 自动化使用现有 emulator-5554。
