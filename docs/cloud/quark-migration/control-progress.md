# 手杀原包控件移植与参考启动诊断

## 实际实现

原素材出处：runtime/extension/手杀ui/lbtn/images/uibutton/{btn.png,confirm-bg-c.png,cbtn.png,QX.png,huanpai2.png,qipai.png}，字体为手杀ui/fonts/HYZLSJ.ttf。本地资源脚本和ui-assets.json扩大为17项，资源Git忽略。

表现样式按手杀ui/lbtn/main1.css:185-229、259-317提取，适配至1.11.7原生Control节点。quark-presentation.js依据ui.confirm、button.link以及原生事件名挂展示类，不覆盖ui.create.confirm/Control类、不移除原监听、不自行计算选择结果。换牌和弃牌使用原素材；其他按钮使用cbtn。

## 实际验证

/root/noname-cloud/evidence/quark-migration/control-dom-check/runtime.json：

- GitHub1.11.7、三人斗地主、原背景和字体/龙框加载成功；errors与failedResources为空。
- 浏览器原生点击记录cancel/card/confirm，game.me useCard历史为jiu -> re_zhanghe，未使用AI托管或直接调用useCard。
- 原生create.confirm('oc')在隔离页面进行仅展示核验：原生ok/cancel的link与文本保留，实际计算样式分别引用btn.png/confirm-bg-c.png。此项不作为真实出牌证明。
- 回退simple后装饰节点清零。
- selectionScreenshotValid=false，不以空白选择截图验收。战场、操作后截图、回退截图可读。
- control-build.log完成核心和角色/卡牌构建，源码构建模块与正式dist对应展示模块同步；没有删除正式dist或重置用户profile。

## 原包参考环境新事实

既有profile不修改。独立Chromium/context，白名单UI配置和包内已有资源运行；七项已识别扩展启用不表示全扩展覆盖。

- 如真似幻首页外部update.js、两张UI图片可使用包内同路径资源映射，字体shousha.TTF/STXINGKA.ttf大小写与现存文件不同，映射现存字节。
- 原首页公告modal挡住离线按钮。使用真实点击公告外部区域关闭，然后触摸离线按钮，成功跳转/app.html。
- /app.html原先未被隔离路由匹配，已添加相同原包部署入口。
- 原包多扩展启动需等待真实arena/玩家事件，而非固定15秒即判死锁。reference-loader-state/runtime.json实际已出现三人、chooseButton、paused=true及七项activeEnable。
- **但截图实际显示十周年UI首次问答遮罩，尚不能判选将基准成功。** 问答源码十周年UI/extension.js:11878的字符串含明确答案提示“以下为答案1：无名杀十周年 2：去fanbook频道”。探测通过真实fill/click完成该本地问答，再继续选将。没有使用账号密码或保存私人profile。
- 多个包内缺失资源、远程更新检查失败仍记录，未用关闭扩展掩盖。

## 保留未完成项

原包全部美化战场/手牌/技能/结算连续基准、重复接管能力与切换关系、原人物DOM和座位布局、手牌折叠与显示、技能区、选将/菜单/首页移植、EpicFX/清瑶渲染、自然结算与重开均未完成。控件素材接入不能称完整原包还原。
