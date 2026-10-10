// Local upstream runtime checks; never loads reference package code.
import { chromium } from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const evidence = process.env.EVIDENCE_DIR || '/root/noname-cloud/evidence';
await fs.mkdir(evidence, { recursive: true });
const browser = await chromium.launch({
 executablePath: '/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
 headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const modes = (process.env.TEST_MODES || 'identity').split(',');
const reports = [];
try {
 for (const mode of modes) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', async d => d.dismiss());
  await page.route('**/preload.js', r => r.fulfill({ status: 404, body: '' }));
  await page.route('**/theme/handheld/style.css', r => r.fulfill({
   contentType: 'text/css', path: '/root/noname-cloud/source/apps/core/theme/handheld/style.css',
  }));
  await page.route('**/cloud-seed.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>seed</title>' }));
  await page.goto('http://127.0.0.1:18091/cloud-seed.html');
  await page.evaluate(async mode => {
   localStorage.setItem('gplv3_noname_alerted', 'true');
   localStorage.setItem('noname_0.9_loadtime', '120000');
   sessionStorage.setItem('isJITReloaded', 'true');
   sessionStorage.setItem('canUseTs', 'true');
   await new Promise((resolve, reject) => {
    const request = indexedDB.open('noname_0.9_data', 4);
    request.onupgradeneeded = () => {
     for (const n of ['config', 'data', 'image', 'audio']) {
      if (!request.result.objectStoreNames.contains(n)) request.result.createObjectStore(n);
     }
     if (!request.result.objectStoreNames.contains('video')) request.result.createObjectStore('video', { keyPath: 'time' });
    };
    request.onerror = reject;
    request.onsuccess = () => {
     const db = request.result;
     const tx = db.transaction('config', 'readwrite');
     const settings = {
      mode, theme: 'handheld', layout: 'mobile', player_number: 8,
      new_tutorial: true, show_splash: 'off', version: '1.11.7',
      characters: ['standard', 'shenhua', 'refresh'], cards: ['standard', 'extra'],
      extensions: [], totouched: true, touchscreen: false, game_speed: 'fast',
      connect_read_clipboard: false, background_music: 'music_off', volumn_audio: 0, volumn_background: 0,
     };
     for (const [k, v] of Object.entries(settings)) tx.objectStore('config').put(v, k);
     tx.oncomplete = () => { db.close(); resolve(); };
     tx.onerror = reject;
    };
   });
  }, mode);
  await page.goto('http://127.0.0.1:18091/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(async () => {
   const { lib, game } = await import('/noname.js');
   return Object.keys(lib.character).length > 10 && game.players.length > 0;
  }, null, { timeout: 60000 });
  await page.waitForFunction(async () => {
   const { ui, _status } = await import('/noname.js');
   return ui.auto && ui.arena?.getBoundingClientRect().width > 0 && _status.imchoosing && _status.paused;
  }, null, { timeout: 90000 });
  await page.screenshot({ path: `${evidence}/handheld-${mode}-selection.png` });
  // Toggle only after the native chooser exists, not during engine startup.
  // Native trusted clicks also handle choosers that cannot switch to auto.
  for (let attempt = 0; attempt < 60; attempt++) {
   if (await page.locator('.handcards > .card').count()) break;
   const character = page.locator('.button.character.selectable:not(.selected)').first();
   if (await character.isVisible()) await character.click();
   const confirm = page.locator('.control > div').filter({ hasText: /^确定$/ }).first();
   if (await confirm.isVisible()) await confirm.click();
   await page.waitForTimeout(500);
  }
  await page.waitForFunction(() => document.querySelector('.handcards > .card'), null, { timeout: 30000 });
  await page.evaluate(async () => {
   const { ui, _status } = await import('/noname.js');
   if (!_status.auto) ui.click.auto('forced');
  });
  await page.waitForTimeout(500);
  const naturalSeconds = Number(process.env.TEST_NATURAL_SECONDS || 0);
  if (naturalSeconds) {
   const deadline = Date.now() + naturalSeconds * 1000;
   while (Date.now() < deadline) {
    const over = await page.evaluate(async () => {
     const { ui, game, _status } = await import('/noname.js');
     if (!_status.auto && !_status.paused2) ui.click.auto('forced');
     return !!_status.over;
    });
    if (over) {
     await page.screenshot({ path: `${evidence}/handheld-${mode}-natural-result.png` });
     break;
    }
    await page.waitForTimeout(1000);
   }
  }
  await page.screenshot({ path: `${evidence}/handheld-${mode}-battle.png` });
  const report = await page.evaluate(async () => {
   const { lib, game, ui, _status } = await import('/noname.js');
   const all = [...game.players, ...game.dead];
   return {
    version: lib.version, mode: lib.config.mode, theme: lib.config.theme,
    players: all.length, themeHref: ui.css.theme?.href,
    useCardHistory: all.reduce((sum, p) => sum + p.getAllHistory('useCard').length, 0),
    over: !!_status.over,
    themeLoaded: [...document.styleSheets].some(s => s.href?.includes('/theme/handheld/')),
   };
  });
  // Freeze game and compare the SAME layout before/after theme removal.
  // This proves CSS fallback and seat geometry, not human card-input correctness.
  await page.evaluate(async () => { const { game } = await import('/noname.js'); game.pause(); });
  const geometry = await page.evaluate(() => {
   const nodes = [...document.querySelectorAll('#arena > .player')];
   const rects = () => nodes.map(n => {
    const r = n.getBoundingClientRect(); return [r.x, r.y, r.width, r.height];
   });
   const sheet = [...document.querySelectorAll('link[rel=stylesheet]')].find(n => n.href.includes('/theme/handheld/'));
   const before = rects(); const on = getComputedStyle(document.documentElement).getPropertyValue('--hh-gold');
   sheet.disabled = true; const fallback = rects();
   const off = getComputedStyle(document.documentElement).getPropertyValue('--hh-gold');
   sheet.disabled = false;
   return { before, fallback, unchanged: JSON.stringify(before) === JSON.stringify(fallback), themePresent: on.trim() === '#c6a365', themeRemoved: !off.trim() };
  });
  report.geometry = geometry;
  // Verify runtime state selectors on actual native nodes. Synthetic classes
  // test presentation only, not a simulated rules event or touch action.
  report.stateStyles = await page.evaluate(() => {
   const card = document.querySelector('.handcards > .card');
   const player = document.querySelector('#arena > .player');
   const probe = node => {
    if (!node) return null;
    const prior = node.className;
    node.classList.add('selected');
    const outline = getComputedStyle(node).outlineWidth;
    node.className = prior;
    return { selectedOutline: outline, restored: node.className === prior };
   };
   return { card: probe(card), player: probe(player) };
  });
  await page.locator('#system').screenshot({ path: `${evidence}/handheld-${mode}-controls.png` });
  // Responsive screenshots retain upstream scale/seat positioning.
  for (const [width, height] of [[960, 540], [1560, 720]]) {
   await page.setViewportSize({ width, height });
   await page.waitForTimeout(400);
   await page.screenshot({ path: `${evidence}/handheld-${mode}-${width}x${height}.png` });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  // Real theme-switch handler removes current CSS and restores native simple.
  report.fallback = await page.evaluate(async () => {
   const { lib, ui } = await import('/noname.js');
   await lib.configMenu.appearence.config.theme.onclick('simple');
   return { theme: lib.config.theme, href: ui.css.theme?.href, originalThemeRemoved: !document.querySelector('link[href*="/theme/handheld/"]') };
  });
  await page.screenshot({ path: `${evidence}/handheld-${mode}-fallback.png` });
  report.errors = errors;
  const expectedSeats = { identity: 8, guozhan: 8, doudizhu: 3 }[mode];
  report.expectedSeats = expectedSeats;
  report.presentationPassed = report.themeLoaded && geometry.unchanged && geometry.themePresent && geometry.themeRemoved && report.fallback.originalThemeRemoved && report.fallback.theme === 'simple' && report.fallback.href?.includes('/theme/simple/') && report.stateStyles.card?.selectedOutline === '3px' && report.stateStyles.player?.selectedOutline === '3px' && errors.length === 0 && (!expectedSeats || report.players === expectedSeats);
  report.aiUseCardObserved = report.useCardHistory > 0;
  report.passed = report.presentationPassed;
  // Style acceptance is separate from AI/human action acceptance.
  reports.push(report);
  await fs.writeFile(`${evidence}/handheld-${mode}-runtime.json`, JSON.stringify(report, null, 2));
  await fs.writeFile(`${evidence}/handheld-runtime.json`, JSON.stringify(reports, null, 2));
  console.log(mode, 'players=', report.players, 'useCard=', report.useCardHistory, 'passed=', report.passed);
  if (!report.passed) process.exitCode = 1;
  await context.close();
 }
} catch (error) {
 await fs.writeFile(`${evidence}/handheld-probe-failure.json`, JSON.stringify({ passed: false, completedModes: reports.map(r => r.mode), failure: String(error), physicalPhone: false }, null, 2));
 throw error;
} finally { await browser.close(); }
