# 云端主持验证进度

## 已验证

- GitHub Fork：treatux/noname；分支 cloud-host-validation。
- 上游提交 c2c9ae0be72e4284416f122a220f9c6081ddd768，版本 1.11.7（上游当前测试通道）。
- 服务器 Chromium 房主经 WebSocket 大厅主持八人身份局，玩家浏览器加入、选将、出牌、AI 行动及自然结算成功两次。
- `evidence/identity-complete.json` 和 `evidence/identity-stable-room.json` 保存云端与客户端结束状态、统计和胜负文本。
- Android 完整 debug 构建成功，APK 1,310,050,758 bytes；模拟器因空间不足未安装成功。
- debug 客户端调整为加载 APK 内置资源，不再固定访问模拟器 8080；开启 WebView 调试用于验证。
- 无音频测试包通过 NONAME_TEST_SILENT=1 可选构建，保留规则、模式和图片，正在重新打包。完整 APK 最终流式安装也因空间不足失败。

## 进行中

- 斗地主、单挑均已自然结算；国战、对决 1v1 已进入回合，等待自然结算。
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

## 本次继续核验（以 evidence 原始记录为准）

- `identity-reconnect4-disconnect.json`：玩家 WebSocket 断开后云端 hosting=true、clients=0、over=false；回合由主持继续推进。页面重新加载不自动连接，点击正常连接按钮恢复原 onlineID=8774083162 / 角色 re_liaohua，随后的样本推进到第三轮。浏览器证明，不等同 Android 已验证。
- 对决1v1自然结算已有双方 over=true；但日志捕获主持 `clients[i].isOnline2 is not a function`。原因：换将的 additionaldead 是纯统计记录，非 Player。已用可选方法调用最小修补；`versus-patched` 回归运行中，不能先宣称无错误通过。
- 本地挑战、炉石、战棋、乱斗代表场景进入真实规则循环，JSON 中玩家与行动事件非空、无 fatal。乱斗选中默认幻化之战并点击「斗」，不是仅打开菜单；不证明乱斗菜单联机可用。
- 塔防首次 gameDraw 崩溃：初期 game.me 为旁观占位节点，不在玩家链。调用改为实际新角色 event.currentPlayers[0]；`local-tafang-patched.json` 到第四轮、无 fatal。仅修最小调用，不重写模式。
- 国战首轮测试意外页面跳转导致采样失败；第二次有效运行 `guozhan3` 继续等待自然结算。不得当作通过。
- 无音频 APK 首次仍约1.309GB，ZIP条目压缩合计约657MB；清理生成的 packageDebug 增量状态后完整构建成功，628MiB。包体支持检查发现默认 SAF 还要求另一份游戏目录，因此增加显式只读内置资源测试开关 NONAME_TEST_PACKAGED=1，默认行为保持不变；最终此变体重新构建中，安装待验证。
- `docs/cloud/android-test.md` 记录测试签名、只读/静音限制、adb reverse / SSH 访问方式、实机验证步骤。尚未配置无线公网 WSS。

### 后续结果

- 国战 `guozhan3-room.json`：双方 over=true、events=[]、36个样本，自然结算。
- 对决修补回归 `versus-patched-room.json`：双方 over=true、events=[]；换将后正常结算。五种声明联机的模式均已有至少一个云端主持+浏览器玩家自然完成代表局（不意味着所有子模式无缺陷）。
- 身份掉线恢复 `identity-reconnect4-room.json`：恢复后双方最终自然结算，11个样本。
- 只读内置静音 APK 最终构建成功（4m38s）；约628MiB；流式安装 `Success`。SHA256 `630ac8aef17862a350cf2cd1f1f88f2b705e3a11a1f407453eaf14453d67c132`。安装证据 `android-packaged-install.log`，应用版本1.0 / versionCode1，minSdk26 / targetSdk36。
- Android 启动实际遇到模拟器系统和应用 ANR，对话框阻塞 CDP，不能据此声称流畅。日志与截图 `android-startup-logcat.txt`、`android-startup*.png` 保存。通过原生点击接受GPL弹窗后进入游戏与新手向导；后续云端玩家测试继续进行。
- Android WebView 不支持 Playwright Browser上下文管理协议；增加直接 page CDP 最小适配 `scripts/android-cdp.mjs`，未修改规则引擎。出现 `Runtime.enable` 超时应先检查原生系统ANR/GPL弹窗，而非当作联机协议失败。

### Android 接入尚未通过

`android-identity4.log` 在实际 APK WebView 中捕获 `Failed to resolve module specifier "vue"`；APK index 确实包含 importmap，仍需核查 WebView 支持、JIT worker 和资源加载。原生系统 ANR 反复遮挡 GPL/错误弹窗并阻塞 CDP。已安装与进入游戏不能替代 Android 接入对局成功，APK 和云端主持职责验收继续保持未完成。

### 当前最新结论（取代上面的历史待验状态）

- WebView113兼容测试变体把已知裸模块名解析为绝对资源URL，仅作用生成APK资源；89个模块改写，源码规则不变。`android-resolved-build.log` BUILD SUCCESSFUL、`android-resolved-install.log` Success；SHA256 `6d5b85bc36ce1ffc6776c6f36ef119d1b80acb7ff1466a90e8e5fe33b0fce437`。
- `android-resolved2-disconnect.json`：Android掉线后云端hosting=true、=0、over=false；点击连接恢复原玩家ID6696715231、角色re_zhanghe。初始化测试清空旧房间配置，防止前一用例的自动重入竞态；实际重连不清空身份。
- `android-touch-room.json`：云端与真实APK WebView双方自然over=true、events=[]，19个样本；证明Android作为玩家可完成八人身份局。
- `android-touch-touch.json`：触摸选将改变角色为ol_xiaoqiao；存在卡牌触摸但未录到目标与成功提交，不能把动作计数当作出牌成功。新增长选择时限的第二次触摸用例继续验证。
- 单房间/三个独立房间性能原始数据已完成，主持与玩家各用独立浏览器进程树。边界JSON、进程JSONL、AI/动画/事件/RTT指标JSON及 `performance-summary.json` 保存。报告 `assessment.md` 含样本量、分位数、资源归属、背景负载与容量范围，不从线性估计承诺最大并发。
- 长期房主进程可用 `HOST_ONLY=1`；`persistent-identity-entry.json` 保存房间入口、PID与配置，玩家进入后开始托管，不是生产账号/崩溃恢复daemon。
- `pnpm exec eslint apps/mobile/afterSync.ts apps/mobile/src/preload.ts` 本次exit0；新增脚本node --check与git diff --check通过。前次eslint超时不计通过。
- 真实手机流畅性仍待小主实测，模拟器系统ANR和秒级应用RTT不能当作实机体验结论。当前目标4/5任务完成，performance-review保留待体验证据。
