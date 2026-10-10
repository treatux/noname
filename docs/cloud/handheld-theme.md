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

Historical first-pass pending items (superseded by the dated validation sections below): actual streamed human card/target/confirm actions, skills, natural end-of-game result interaction, encoding/rendering CPU comparison and physical-phone readability. Dialog styling covers native result dialogs, but this alone is not a gameplay end-to-end acceptance claim. Deployment/default activation is not implied by a local preview or build.

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

## Independent Validate phase (2026-10-10)

Read-only audit script: `scripts/handheld-validate.mjs`. Active decode-only probe: `scripts/handheld-stream-readonly.mjs`. Both keep credentials out of reports. `EVIDENCE_DIR` gives each run a separate evidence directory; existing indexed evidence was not overwritten. Audit reads the **container-local** game server on port 18094 through `docker exec`, not an unbound host port.

### Concrete test fixes and fresh outcomes

The local probe previously toggled auto before the native character chooser was ready and accepted a battlefield with no handcards. Its acceptance boolean did not require selected-card presentation, native simple href or the positive theme token. These were validation-harness defects, not demonstrated CSS/rule defects. It now waits for the native chooser, uses native character/confirm clicks, requires a real handcard, checks 3px selected outlines for both player and card, and records failures separately.

Fresh identity eight-seat and doudizhu three-seat runs pass the stricter predicate, with exact unchanged seat rectangles, native simple fallback, responsive screenshots and no page errors. Each observed one AI useCard event; these are not remote user input claims. Fresh guozhan eight-seat startup DOM was reached, but the retained selection screenshot is blank and the new handcard wait timed out. Its **current stricter acceptance remains unresolved**; old coordinate/fallback evidence is retained as historical presentation evidence, not silently upgraded. Failed runs/logs are retained in `handheld-validation-local*`.

The existing eleven evidence-index SHA-256 entries are checked against real files, not merely copied into a new report. Archived remote history still contains sha→guanqiujian and shan with trusted input, and decoded-video evidence. The raw `manualTargetUseCard=false` must not be presented as a passing harness outcome: history proves the limited actions independently; the flag is not used to assert full interaction acceptance.

A fresh read-only stream probe observed 1280×720 inbound decoded frames **5→102 (delta 97 over 10 seconds)**. This establishes active host-local WebRTC decoding now, not comparative performance or real-phone experience. It made no game/profile changes.

The live stream unexpectedly already displayed the native **战斗失败** result dialog. A direct read-only page CDP snapshot confirms handheld, identity, upstream 1.11.7, round 8, over=true, 3 alive + 5 dead and 130 useCard history events. Screenshot: `handheld-validation/active-stream.png`; server state: `live-endstate.json`. This is **observed themed endstate**, not a continuously witnessed natural-completion sequence or restart-button interaction. No game.over/HP/rule mutation was issued by this validation phase.

### Reference fidelity, not a replica claim

Direct visual comparison with the saved preview image shows the same design vocabulary: battlefield landscape, vertical native hero illustrations, gold/dragon-like trim, green HP, cream handcards and metal controls. Important differences remain: polygonal static mountains rather than painted war-camp art; thin original ornament rather than sculpted/dynamic reference dragons; upstream left-side self avatar rather than the reference right-side enlarged skill panel; stock card labels/images and upstream eight-seat system/record controls. No pixel fidelity, identical art, enlarged reference touch targets or reference-layout equivalence is claimed. Eight-seat geometry preservation is deliberate, not proof of phone usability.

Service remains online at https://buzz.webpimy.duckdns.org/cloud-phone/ with existing private authentication; noname-stream healthy, unauthenticated endpoint 401. No unrelated restarts, certificate edits or history rewrite. Full workflow acceptance remains open: same-attack explicit confirmation, manual skills, continuously observed natural finish/result interaction, fresh guozhan gameplay, isolated rendering/encoding comparison, physical phone readability/touch/audio/external network and **thermal/battery** testing.

### Independently rechecked archive integrity

Both actual archive files were streamed again for size/SHA-256/MD5 and tested again with `7z t`; both report Everything is Ok (base 33952 files, patch 1032 files). Base: 5,726,639,341 bytes, SHA-256 `8edaf3c62c743cb541ab59a57cdfa68e3b0a45bee0854091e8fbd1b082098eb5`, MD5 `7b86539537860d2c71a0beeda8e60e62`. Patch: 237,789,261 bytes, SHA-256 `e693aa3dad37abd45a5fd5a7859a6dbadb33925b98df36249b356af9c1bf0164`, MD5 `a695720b053b356bc9af241f31a48b03`. Both still mismatch advertised MD5; that fact is recorded, not made a new user-approval gate. Remaining download bytes for these two authorized archives: **0**. The resumable downloader already finished normally; there is no incomplete transfer to keep active. Optional APK/static-skin/skeleton branches remain not downloaded and are not prerequisites for this independent theme.

Audit outcome: `handheld-validation/audit.json` passed archive/hash/deployment/archived-action checks. All eleven historical evidence hashes match. CSS and both SVGs are byte-identical between source, dist and responses from the dedicated game server. Final hashed validation index: `docs/cloud/handheld-validation.json`. These bounded audit passes do not set overall UX acceptance to complete.
