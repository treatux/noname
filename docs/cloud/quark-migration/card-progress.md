# EpicFX 1000 牌面移植进度

本阶段为部分功能移植，不是完整还原或全部扩展验收。

## 实现与来源

- `apps/core/noname/ui/quark-card-presentation.js`：从原包 EpicFX `extension.js:4318-4418` 的牌名贴图、基本/锦囊/装备分类、牌图和武器/坐骑距离标记进行 DOM 接口适配；未替换 `Card.init`，未修改规则、AI、输入处理或卡牌定义。
- `apps/core/theme/quark_migration/style.css`：依据原包 `extension/EpicFX/asset/skel/cardFace/1000/face.css` 实现花色点数、牌名与牌图、分类和距离层。基础牌标题高度、装备分类 top=42px、锦囊 top=40px 依实际参考修正。
- `scripts/quark-ui-assets.mjs`：复制 904 个实际提供的普通牌面/UI PNG，加既有 29 项共 933 项，35,760,649 bytes。虽然原路径含 `skel`，这些文件都是平面牌面/UI PNG；没有复制武将皮肤、骨骼或下载资源。来源、长度和 SHA256 见 `ui-assets.json`。
- 引擎动画克隆继承装饰时先清理再装配，避免重复 suit/art；隐藏牌同步隐藏装饰；切回 simple 删除本阶段全部装饰，不修改原生节点内容。
- 无对应原图时使用原生翻译/图层，不请求不存在的纹理。fullimage/fullborder 专用展示仍待完整适配。

## 已取得的证据

原始证据均位于 `/root/noname-cloud/evidence/quark-migration/`。

- `reference-card-textures-v2/runtime.json`：原包隔离实际生效七项 UI 扩展，3 玩家/4 手牌，记录牌名、点数花色、PNG src、加载状态及几何。参考自身有如真似幻更新联网失败及其他 404，不能称参考无错误。
- `reference-identity8-cards/runtime.json`：同分辨率 1280×720 原包身份八人实际运行，8 玩家/4 手牌并记录座位几何。随机武将和游戏阶段不保证与目标一致，非完整同阶段对照。
- `epic-card-compiled/runtime.json`：编译产物真实鼠标 `shunshou → re_zhuzhi`，原生 `getAllHistory('useCard')` 证据，errors=[]，无主题资源失败；牌面图/分类/武器距离图片实际加载。
- `epic-card-final/runtime.json`：后续真实鼠标 `sha → zhangzhang`、无重复装饰、CSS 隐藏牌审计、simple 回退全部节点移除。此轮 CSS 部署仍为先前 top=40px 版本，几何比较明确 FAIL（基本/装备分类偏差 2px），不可作为最终几何通过依据。
- `epic-card-final-built/runtime.json`：完整构建结束后重新同步产物，原生鼠标 `jueying` 自装备，errors=[]、资源错误=[]、回退检查通过。`card-geometry-final-subset.json` 的 60 项基本牌图层归一化测量在 0.03px 容差内通过；锦囊缺该轮原包对应类别，明确列为未匹配，装备本轮未覆盖，不能称全类别通过。
- `card-local-assets.json`：933 项在源码资源和服务 dist 两处逐一验 SHA，failures=[]。大资源不进 Git。
- 正式容器 CSS SHA 与最新 dist 相同：`2fc367a6e5c80f76143ddfe75dd204f394b896f94fdcea72b87672f9e2288314`。
- 正式容器内部 HTTP18094 获取编译牌面模块 SHA 与服务 dist 相同：`b3d6b94354223ec132c87581691c807a55246b2e291d6f10490ecc34063b4deb`（该阶段产物）。这里只证明容器资源，不证明串流触摸。

## 验证边界与后续

`scripts/quark-card-compare.mjs` 比较归一化牌内图层几何，仅为子集验证；不同随机牌、武将、事件，未匹配类别单列，不冒充全屏同阶段通过。仍需人物区计数/装备/身份标记、八人布局、技能完整操作、提示/UI 动画和其他扩展切换、结算与正式串流输入。实体手机外网音视频、触摸、温升和电池没有本阶段证据。
