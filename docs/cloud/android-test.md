# Android 云端主持测试包

## 用途与限制

这是 GPL-3.0 上游无名杀 1.11.7 二开测试包，不是正式发行版本。应用 ID 为 `com.libnoname.noname`，使用本机 Android debug keystore 测试签名；不替代另一项目 `com.sgsoffline.game`。仅在可信测试服务器使用，开启 WebView 调试。默认构建保留上游 SAF 资源目录机制。

资源受限设备可启用两个明确的测试开关：

- `NONAME_TEST_SILENT=1`：省略 APK 内置音频，游戏规则、模式与图片不删减。声音体验不能据此评价。
- `NONAME_TEST_PACKAGED=1`：直接使用内置只读资源，不要求再通过 SAF 复制全套资源；扩展安装、写文件与导出不属于此测试包支持能力。默认上游行为不变。

构建切换资源集时清理生成的 APK 增量 ZIP 状态，避免已删除资源的旧字节仍占用文件空间。先前无音频增量包 1.309GB，而 ZIP 当前条目压缩合计仅约657MB；清理后仍需等 Gradle 成功，不能安装中间文件。

## 构建

```bash
source /root/noname-cloud/env.sh
cd /root/noname-cloud/source
pnpm build
NONAME_TEST_SILENT=1 NONAME_TEST_PACKAGED=1 \
  pnpm -F @noname/mobile build:android -- --variant=debug --skip-web-build
```

产物：`apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`。
必须以 `BUILD SUCCESSFUL` 为准；最终大小、SHA256、安装结果记录在 `evidence/`。APK 不提交 Git（大体积生成文件）。

## 自动化连接

当前服务仅监听本机：静态游戏18091、WebSocket大厅18082。模拟器通过 adb reverse 使用同样地址，无需开放不受保护的文件管理服务。

```bash
adb install --streaming -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:18082 tcp:18082
adb shell am start -n com.libnoname.noname/.MainActivity
adb shell cat /proc/net/unix | grep webview_devtools_remote
# 使用上一步实际 socket（通常附带进程 PID）
adb forward tcp:19222 localabstract:webview_devtools_remote_<PID>
curl http://127.0.0.1:19222/json/list
ANDROID_CDP=http://127.0.0.1:19222 TEST_MODE=identity \
  TEST_SECONDS=300 RUN_NAME=android-identity node scripts/cloud-room.mjs
```

脚本在服务器 Chromium 创建房间，在 Android WebView 加入。APK 不创建房间、不承担主持；自动完整游戏暂使用托管，后续还须实际触摸选将与出牌证据。`TEST_DISCONNECT=1` 记录玩家断开、主持继续运行与重连恢复。

## 真实手机安装和操作步骤

1. 只安装最终成功构建并校验摘要的 APK；按系统提示允许本次来源安装。与已有同 ID 应用的签名不一致时，不应为测试直接删除用户数据，先备份或使用独立设备。
2. 用 USB adb reverse 可测试同服务器经 SSH 隧道转发的大厅端口：电脑 `ssh -N -L 18082:127.0.0.1:18082 <服务器>`，手机 `adb reverse tcp:18082 tcp:18082`。这不是已部署公网入口；无线直连需另行配置可信 WSS 入口。
3. 游戏进入「联机」，输入 `ws://127.0.0.1:18082`，点击连接，选择云端主持房间。
4. 手动选将、选牌、选目标、确认出牌；观察拖动手牌、菜单滚动与动画。记录手机型号、Android/WebView版本、网络、帧率或录屏、操作到反馈延迟及是否卡顿。
5. 关闭或切换应用后确认服务器日志中的对局仍推进；返回页面重新点击连接，检查能否恢复原角色。上游页面重载不会自动连接，点击连接后才恢复保存的 onlineID。
6. 至少完成一局八人身份局并确认客户端胜负结算。测试音频被省略时明确记录，不评价完整音效体验。

**真实手机流畅性待小主实测；模拟器自动化不能替代真实设备结论。**

## 当前验证产物与长期测试房主

最近兼容测试APK SHA256：`6d5b85bc36ce1ffc6776c6f36ef119d1b80acb7ff1466a90e8e5fe33b0fce437`，约628MiB；重新构建可能改变摘要，应以 `evidence/android-resolved-sha256.txt` 为准。安装Success，Android玩家完整自然结算证据 `android-touch-room.json`；掉线恢复证据 `android-resolved2-disconnect.json`。

```bash
HOST_ONLY=1 TEST_MODE=identity RUN_NAME=persistent-identity \
  node scripts/cloud-room.mjs > /root/noname-cloud/evidence/persistent-identity.log 2>&1
```

另开终端查看 `evidence/persistent-identity-entry.json`，取得房间ID。进入大厅后选该房间；脚本在检测到玩家接入后开始游戏，云端托管自身和AI，保持运行直至SIGINT/SIGTERM。对局结束页面保留，但不自动为下一局重建：重启此命令获得新房间。它是验证用长期宿主，不是带持久化/崩溃恢复的生产daemon。

在此服务器环境中使用 `scripts/android-cdp.mjs` 直连 `/json/list` 返回的page websocket，避免WebView不支持Browser上下文协议导致Playwright连接失败。原生ANR/GPL模态框需要先实际接受/处理；这些阻塞应保存失败记录，不能隐去。
