// Independent, read-only evidence/deployment audit. Does not change game/profile.
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const source = new URL('../', import.meta.url).pathname;
const reference = '/root/noname-cloud/reference/quark-handheld/';
const output = process.env.EVIDENCE_DIR || '/root/noname-cloud/evidence/handheld-validation';
await fs.mkdir(output, { recursive: true });
const readJSON = async path => JSON.parse(await fs.readFile(path, 'utf8'));
const digest = async path => {
 const sha = createHash('sha256'), md5 = createHash('md5'); let bytes = 0;
 for await (const chunk of createReadStream(path)) { bytes += chunk.length; sha.update(chunk); md5.update(chunk); }
 return { bytes, sha256: sha.digest('hex'), md5: md5.digest('hex') };
};
const report = { archives: [], artifacts: [], deployment: [], remote: {}, physicalPhone: false, thermal: 'pending' };
try {
 for (const file of ['如真似幻.7z', '纯净懒人包7.21.zip']) {
  const previous = await readJSON(reference + file + '.validation.json');
  const actual = await digest(reference + file);
  assert.equal(actual.bytes, previous.bytes); assert.equal(actual.sha256, previous.actualSHA256); assert.equal(actual.md5, previous.actualMD5);
  const crc = await new Promise((resolve, reject) => {
   const child = spawn('7z', ['t', reference + file]); let text = '';
   child.stdout.on('data', d => text += d); child.stderr.on('data', d => text += d);
   child.on('error', reject); child.on('close', code => resolve({ code, text }));
  });
  await fs.writeFile(output + '/' + file + '.crc.txt', crc.text);
  assert.equal(crc.code, 0); assert.match(crc.text, /Everything is Ok/);
  report.archives.push({ file, ...actual, crcPassed: true, advertisedMD5: previous.expectedMD5, metadataMD5Matches: actual.md5 === previous.expectedMD5, remainingBytes: 0 });
 }
 const index = await readJSON(source + 'docs/cloud/handheld-evidence.json');
 for (const artifact of index.artifacts) {
  const actual = await digest(artifact.path); assert.equal(actual.sha256, artifact.sha256, artifact.path);
  report.artifacts.push({ path: artifact.path, sha256: actual.sha256, matched: true });
 }
 for (const file of ['style.css', 'dragon-frame.svg', 'battlefield.svg']) {
  const actual = await digest(source + 'apps/core/theme/handheld/' + file);
  const built = await digest(source + 'dist/theme/handheld/' + file);
  assert.equal(actual.sha256, built.sha256);
  // 18094 is container-local, not published on the host. Check the actual
  // dedicated game server rather than a dev server or nonexistent host port.
  const body = execFileSync('docker', ['exec', 'noname-stream', 'curl', '--fail', '--silent', '--show-error', 'http://127.0.0.1:18094/theme/handheld/' + file]);
  const served = createHash('sha256').update(body).digest('hex');
  assert.equal(served, actual.sha256);
  report.deployment.push({ file, sha256: served, server: 'noname-stream:18094', httpSuccess: true, sourceBuiltServedEqual: true });
 }
 for (const mode of ['identity', 'guozhan', 'doudizhu']) {
  const r = await readJSON('/root/noname-cloud/evidence/handheld-' + mode + '-runtime.json');
  assert.equal(r.players, mode === 'doudizhu' ? 3 : 8); assert.equal(r.geometry.unchanged, true);
  assert.equal(r.fallback.theme, 'simple'); assert.equal(r.fallback.originalThemeRemoved, true); assert.deepEqual(r.errors, []);
 }
 const auto = await readJSON('/root/noname-cloud/evidence/handheld-stream-autoconfirm.json');
 const explicit = await readJSON('/root/noname-cloud/evidence/handheld-stream-explicit-confirm.json');
 assert(auto.manualState.history.some(h => h.card === 'sha' && h.targets.includes('guanqiujian')));
 assert(explicit.manualState.history.some(h => h.card === 'shan'));
 for (const r of [auto, explicit]) {
  assert(r.inputs.some(i => i.type === 'mousedown' && i.trusted));
  assert(r.video.rtp.flat().some(s => s.framesDecoded > 0 && s.frameWidth === 1280 && s.frameHeight === 720));
 }
 report.remote = { archivedServerShaTarget: true, archivedServerShan: true, trustedInputs: true, streamDecoded: true, sameAttackExplicitConfirm: false, manualSkill: false, naturalOver: false, note: 'Archived raw manualTargetUseCard=false disagrees with the limited direct history evidence; no full harness pass is asserted. No claim of physical phone or current continuous decoding.' };
 report.passed = true;
} catch (error) { report.passed = false; report.failure = String(error); process.exitCode = 1; }
await fs.writeFile(output + '/audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
