# Optional handheld-inspired cloud theme

## Implementation

Current engine remains upstream **1.11.7**. Select `选项 → 外观 → 主题 → 手杀风·云端` (`handheld`). Switch back to `简约`, `木纹` or `音乐` using the existing native theme handler. Existing default remains `simple`; no saved preferences are forcibly rewritten.

Files:
- `apps/core/theme/handheld/style.css`: independent CSS only.
- `apps/core/theme/handheld/dragon-frame.svg`, `battlefield.svg`: original static decorative SVGs, authored for this project under the repository license, not traced/copied package artwork.
- `scripts/handheld-stream.mjs`: opt-in dedicated streaming acceptance harness (changes only the dedicated game profile; do not run concurrently with recording/other stream acceptance).
- `apps/core/game/package.js`: theme label in native registry.
- `apps/core/game/config.json`: stock theme list.
- `scripts/handheld-probe.mjs`: local browser checks against upstream runtime.

Visual treatment: slate/green battlefield, restrained gold frames, cream readable handcard base, green selected outlines, shared menu/character-selection/result dialog styling and controls. It keeps upstream eight-seat positioning, handcard transforms, avatar/card images, identities, HP, skills and rule state. Original dragon-like metal ornaments decorate native avatars with pointer-events:none, within their original rectangles. A static ink landscape adds battlefield depth; native green HP and existing licensed hero/card images remain intact. There are no replacement engine functions, game.import extensions, network updaters, fonts, Pixi/Spine/GSAP or background animation loops. No third-party reference assets were copied. Phone remains a streaming/input client, not a game engine.

## Reference evidence

Both authorized archives are fully downloaded and CRC validated under `/root/noname-cloud/reference/quark-handheld/`. Their advertised MD5 values mismatch actual delivered bytes; exact hashes and independently fetched byte evidence are documented there, not falsified as passing.

Base package `game/update.js` reports 1.12.7.0711_β and modified beautification APIs. 手杀ui rewrites native methods and depends on xplayer/xdialog DOM and image frames; original author permission is explicitly unresolved in its config. 十周年UI replaces getBoundingClientRect on new Chromium. 如真似幻 2.0 replaces lib.init.onload and requires legacy animation runtimes. Therefore none is installed into upstream 1.11.7. Root MIT text does not prove redistribution rights for extracted proprietary art/fonts or upstream GPL code. This theme uses independently written CSS only.

## Validation boundaries

`handheld-probe.mjs` defaults to identity (eight seats); `TEST_MODES` enables additional isolated mode probes. It captures selection/battle/control/fallback at 1280×720, 960×540 and 1560×720, compares native player coordinates with CSS enabled/disabled, checks selected class outlines, and invokes the actual theme-switch handler for fallback. AI `getAllHistory('useCard')` is counted separately from style tests. Synthetic selected-class probes establish presentation, **not human touch/card action success**.

Evidence files: `/root/noname-cloud/evidence/handheld-runtime.json`, `handheld-runtime.log`, `handheld-*-selection.png`, `handheld-*-battle.png`, `handheld-*-fallback.png`, `handheld-build.log`.

Pending beyond asset recovery/first implementation: actual streamed human card/target/confirm actions, skills, natural end-of-game result interaction, encoding/rendering CPU comparison and physical-phone readability. Dialog styling covers native result dialogs, but this alone is not a gameplay end-to-end acceptance claim. Deployment/default activation is not implied by a local preview or build.

## Historical first-pass results

- Build completed and built theme is served HTTP200 from the existing local game server; source and built CSS byte-identical.
- Eight-player identity local runtime: theme loaded, selected card/player outlines 3px, exact native player rectangles unchanged on CSS removal, actual native switch restored simple with theme link removed; no page errors. Latest identity presentation test passed with 2 AI useCard history events (not a human input claim). Screenshots include character selection and battlefield.
- Extra mode probes are not accepted as passed: doudizhu produced a blank page / undefined lib.config while gathering evidence; guozhan produced no retained AI useCard history in this probe. These are open harness/runtime issues, not proven theme regressions. No deployment or complete mode acceptance claimed.
- Natural results, human streamed actions and encoding/render cost remained pending in the first pass.

## Second-pass deployment and actual evidence

Core dependency build `pnpm -F noname... build` completed (`handheld-build-v2.log`), including noname card/core packages. Additive deployment copied the three built theme files to `dist/theme/handheld/`, which is already mounted read-only into the dedicated `noname-stream` container. No container recreation, unrelated service restart, game engine replacement, phone-side engine or global default change. Repository config still defaults to simple. The dedicated test profile selected handheld via normal config/theme handling; normal appearance menu switches back to simple. Do not run simultaneous CDP profile/reload tests against the shared stream desktop.

Endpoint: **https://buzz.webpimy.duckdns.org/cloud-phone/** (existing private Basic Auth; unauthenticated request returns 401). Credentials stay private under `/root/noname-stream/deploy/secrets/`. No secrets are embedded in the harness or evidence.

- Identity 8, guozhan 8 and doudizhu 3 seat **local presentation** probes now passed with empty page errors, exact unchanged player rectangles, responsive captures 1280×720/960×540/1560×720 and native simple fallback. The short runs observed zero AI history. A subsequent 180-second identity run recorded 48 AI useCard events with no page errors, still over=false; neither proves natural completion.
- Actual automated remote video taps selected Xun Yu, a fire attack card and Guanqiu Jian. Server trusted mousedown/up were recorded, and server `getAllHistory('useCard')` contains `sha -> guanqiujian`, then jiu and wugu. Native auto-confirm was enabled; this is successful card/target submission, **not an explicit confirm-button tap on that same attack**.
- Separate run disabled auto-confirm in the dedicated test config, selected Sima Yi and tapped a shan plus the native 确定 control. Server history contains shan; trusted remote inputs recorded. Targeted attack plus explicit confirm in one continuous action remains unverified. Manual skills also remain pending.
- First stream stats: 1280×720, 241 decoded frames, approximately 27 fps; second run 295 decoded frames. This proves stream video reception by an automated host-local Chromium, not real-phone smoothness, external NAT or physical touch acceptance.
- Four paused-scene sampling windows with identical H.264 1280×720/30fps/3Mbps settings captured container CPU medians: simple 32.01%, handheld 41.40%, simple 41.50%, handheld 39.33% (8 samples each, about 17s per window, memory around 1.45GiB). **Decoded-frame deltas were zero in all four windows**, so these are failed encoding-comparison acceptance, not a theme overhead estimate. The container also had a concurrent recording browser; aggregate CPU is not isolated renderer/encoder cost. Additional CDP render comparison failed when its theme link disappeared; failure log retained.
- Natural-completion streaming poll reached round 1 but aborted with Runtime.evaluate timeout. A separate 180-second local identity probe recorded 48 AI useCard events but over=false; no natural result screenshot was produced. No game.over invocation, HP/rule mutation or forced victory was used.

Hashed evidence index and compact results: `docs/cloud/handheld-evidence.json`. Raw JSON/logs/screenshots: `/root/noname-cloud/evidence/handheld-stream-*`, `handheld-*-runtime.json`. Key screenshot `handheld-stream-target.png` shows the actual eight-player battlefield, cream handcards, gold dragon-like ornaments, native HP and attack line. `handheld-stream-confirm.png` shows the native confirm state.

Limitations: natural themed endstate, manual skills, a valid isolated active encoding comparison, all-mode gameplay acceptance and physical-phone checks are still open. Static styling of result dialogs is not natural-result verification. The upstream tracked localhost key was inspected as a development fixture; see `development-certificate.md`. No unrelated rotation/history rewrite was performed.
