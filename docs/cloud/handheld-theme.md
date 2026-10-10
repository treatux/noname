# Optional handheld-inspired cloud theme

## Implementation

Current engine remains upstream **1.11.7**. Select `选项 → 外观 → 主题 → 手杀风·云端` (`handheld`). Switch back to `简约`, `木纹` or `音乐` using the existing native theme handler. Existing default remains `simple`; no saved preferences are forcibly rewritten.

Files:
- `apps/core/theme/handheld/style.css`: independent CSS only.
- `apps/core/game/package.js`: theme label in native registry.
- `apps/core/game/config.json`: stock theme list.
- `scripts/handheld-probe.mjs`: local browser checks against upstream runtime.

Visual treatment: slate/green battlefield, restrained gold frames, cream readable handcard base, green selected outlines, shared menu/character-selection/result dialog styling and controls. It keeps upstream eight-seat positioning, handcard transforms, avatar/card images, identities, HP, skills and rule state. There are no replacement engine functions, game.import extensions, network updaters, fonts, Pixi/Spine/GSAP or background animation loops. No third-party reference assets were copied. Phone remains a streaming/input client, not a game engine.

## Reference evidence

Both authorized archives are fully downloaded and CRC validated under `/root/noname-cloud/reference/quark-handheld/`. Their advertised MD5 values mismatch actual delivered bytes; exact hashes and independently fetched byte evidence are documented there, not falsified as passing.

Base package `game/update.js` reports 1.12.7.0711_β and modified beautification APIs. 手杀ui rewrites native methods and depends on xplayer/xdialog DOM and image frames; original author permission is explicitly unresolved in its config. 十周年UI replaces getBoundingClientRect on new Chromium. 如真似幻 2.0 replaces lib.init.onload and requires legacy animation runtimes. Therefore none is installed into upstream 1.11.7. Root MIT text does not prove redistribution rights for extracted proprietary art/fonts or upstream GPL code. This theme uses independently written CSS only.

## Validation boundaries

`handheld-probe.mjs` defaults to identity (eight seats); `TEST_MODES` enables additional isolated mode probes. It captures selection/battle/control/fallback at 1280×720, 960×540 and 1560×720, compares native player coordinates with CSS enabled/disabled, checks selected class outlines, and invokes the actual theme-switch handler for fallback. AI `getAllHistory('useCard')` is counted separately from style tests. Synthetic selected-class probes establish presentation, **not human touch/card action success**.

Evidence files: `/root/noname-cloud/evidence/handheld-runtime.json`, `handheld-runtime.log`, `handheld-*-selection.png`, `handheld-*-battle.png`, `handheld-*-fallback.png`, `handheld-build.log`.

Pending beyond asset recovery/first implementation: actual streamed human card/target/confirm actions, skills, natural end-of-game result interaction, encoding/rendering CPU comparison and physical-phone readability. Dialog styling covers native result dialogs, but this alone is not a gameplay end-to-end acceptance claim. Deployment/default activation is not implied by a local preview or build.

## Actual first-pass results

- Build completed and built theme is served HTTP200 from the existing local game server; source and built CSS byte-identical.
- Eight-player identity local runtime: theme loaded, selected card/player outlines 3px, exact native player rectangles unchanged on CSS removal, actual native switch restored simple with theme link removed; no page errors. Latest identity presentation test passed with 2 AI useCard history events (not a human input claim). Screenshots include character selection and battlefield.
- Extra mode probes are not accepted as passed: doudizhu produced a blank page / undefined lib.config while gathering evidence; guozhan produced no retained AI useCard history in this probe. These are open harness/runtime issues, not proven theme regressions. No deployment or complete mode acceptance claimed.
- Natural results, human streamed actions and encoding/render cost remain pending.
