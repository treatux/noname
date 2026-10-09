# 云端主持验证进度

## 已验证

- GitHub Fork：treatux/noname；分支 cloud-host-validation。
- 上游提交 c2c9ae0be72e4284416f122a220f9c6081ddd768，版本 1.11.7（上游当前测试通道）。
- 服务器 Chromium 房主经 WebSocket 大厅主持八人身份局，玩家浏览器加入、选将、出牌、AI 行动及自然结算成功两次。
- `evidence/identity-complete.json` 和 `evidence/identity-stable-room.json` 保存云端与客户端结束状态、统计和胜负文本。
- Android 完整 debug 构建成功，APK 1,310,050,758 bytes；模拟器因空间不足未安装成功。
- debug 客户端调整为加载 APK 内置资源，不再固定访问模拟器 8080；开启 WebView 调试用于验证。
- 无音频测试包通过 NONAME_TEST_SILENT=1 可选构建，保留规则、模式和图片，正在重新打包。

## 进行中

- 斗地主、单挑、国战、对决 1v1 均已进入回合，等待自然结算；未把进入回合当成完成一局。
- 同时运行多个模式的 CPU/RSS 采样保存于 evidence/concurrent-processes.jsonl；当前测试含玩家浏览器与模拟器背景负载，不能直接推断单房间纯服务开销。

## 必须补充

1. 安装最终精简 APK，完成 SAF 目录授权，通过 WebView CDP 连接云端主持。
2. 玩家退出/重连验证：脚本 TEST_DISCONNECT=1 可用，但尚未执行验证。主持端必须在手机退出后继续运行。
3. 各联机模式至少一个代表性完整结算，失败需要记录具体错误和修复。
4. 挑战、战棋、塔防、炉石、乱斗本地代表性运行与云端限制证据。
5. 单房间及三个并行房间受控测量，分离主持 Chromium 与测试玩家 Chromium，采集网络、操作延迟、AI 耗时、动画时间。
6. 提供公网测试入口或可复现的安全连接方式，APK 安装与实机验证步骤。
7. 真实手机流畅性需要小主实测；模拟器不能替代实机结论。

## 经验

- 当前执行工具环境没有 HOME，Node 不在默认 PATH。使用 /root/noname-cloud/env.sh；GitHub push 使用 gh 提供的 auth header 子进程环境，不能打印凭据。
- 默认 NODE_ENV=production 会使 Vite 开发导入武将路径错误，开发启动显式 NODE_ENV=development。
- 上游 JIT service worker 启动会重载，测试配置在独立同源 seed.html 写入 IndexedDB 后加载游戏。
- 进入大厅/onlineID 赋值早于客户端完整初始化；开始游戏需等待 connectPlayers，切托管需等待 game.me。
- 完整 pnpm build 结束前不能同步 Android 素材；APK packageDebug 完成前文件大小并非最终值。
- 当前上游有 /vue、mode/*/index.js、部分头像/音频 404，需区分可回退请求与实际缺失资源。

## 当前本地服务

18081 Vite、18089 开发文件服务、18082 WS 大厅、18091 正式构建文件服务。尚未配置公网反向代理。
