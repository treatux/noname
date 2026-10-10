// Read-only active decode probe: no reload/profile/game input or performance claim.
import { chromium } from '/root/pi-web/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const output = process.env.EVIDENCE_DIR || '/root/noname-cloud/evidence/handheld-validation';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/root/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const report = { physicalPhone: false, thermal: 'pending', performanceComparison: false };
try {
 const password = (await fs.readFile('/root/noname-stream/deploy/secrets/selkies-password', 'utf8')).trim();
 const context = await browser.newContext({ httpCredentials: { username: 'cloudplayer', password }, viewport: { width: 1280, height: 780 } });
 await context.addInitScript(() => {
  window.__pcs = []; const PC = window.RTCPeerConnection;
  window.RTCPeerConnection = class extends PC { constructor(...args) { super(...args); window.__pcs.push(this); } };
 });
 const page = await context.newPage();
 await page.goto('https://buzz.webpimy.duckdns.org/cloud-phone/'); await page.locator('#start').click();
 const stats = async () => {
  const frame = page.frames().find(f => f.url().includes('/stream/'));
  if (!frame) return [];
  return frame.evaluate(async () => (await Promise.all((window.__pcs || []).map(async pc => [...await pc.getStats()].map(([,s]) => s).filter(s => s.type === 'inbound-rtp' && s.kind === 'video')))).flat().map(s => ({ id: s.id, framesDecoded: s.framesDecoded, frameWidth: s.frameWidth, frameHeight: s.frameHeight, bytesReceived: s.bytesReceived })));
 };
 for (let i = 0; i < 30; i++) { report.before = await stats(); if (report.before.some(s => s.framesDecoded > 0)) break; await page.waitForTimeout(1000); }
 await page.waitForTimeout(10000); report.after = await stats();
 report.deltas = report.after.map(s => ({ ...s, decodedDelta: s.framesDecoded - (report.before.find(b => b.id === s.id)?.framesDecoded ?? s.framesDecoded) }));
 assert(report.deltas.some(s => s.decodedDelta > 0 && s.frameWidth === 1280 && s.frameHeight === 720));
 await page.screenshot({ path: output + '/active-stream.png' }); report.passed = true;
} catch (error) { report.failure = String(error); report.passed = false; process.exitCode = 1; }
finally { await browser.close(); await fs.writeFile(output + '/active-stream.json', JSON.stringify(report, null, 2)); }
console.log(JSON.stringify(report, null, 2));
