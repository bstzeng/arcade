#!/usr/bin/env node
'use strict';
// A scoped presentation gate. Published reports/manifests stay immutable; only
// disposable verification metadata is overlaid for the corrected runtime bytes.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = __dirname;
process.chdir(root);
const manifestPath = 'frontier120-presentation-correction.json';
const baselinePath = 'frontier120-presentation-baseline.json';
const reportPath = 'frontier120-presentation-verification-report.json';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sha = file => digest(fs.readFileSync(file));
const gitBlob = bytes => crypto.createHash('sha1').update(Buffer.from('blob ' + bytes.length + '\0')).update(bytes).digest('hex');
const m = read(manifestPath), b = read(baselinePath);
assert.equal(m.baseCommit, 'ead782e1e4d8ac11ab1361e74724030db957951b');
assert.equal(b.baseCommit, m.baseCommit);
assert.equal(b.baselineBlobCount, 3612);
assert.equal(Object.keys(b.gitBlobs).length, 3612);
assert.equal(m.baselineSHA256, sha(baselinePath));
// Only confirmed presentation findings and verification entry/documentation may
// change. Adding another finding requires an explicit reviewed gate edit.
const approvedPaths = new Map([
  ['games/survival120-common/render.js', 'svg-presentation'],
  ['games/gravity-shelter/art.svg', 'svg-asset'],
  ['games/war120-common/ui.js', 'ui-labels'],
  ['games/war120-common/style.css', 'presentation-css'],
  ['games/story120-common/ui.js', 'ui-labels'],
  ['games/physics120-common/render.js', 'canvas-presentation'],
  ['games/friction-playground/art.svg', 'svg-asset'],
  ['README.md', 'verification-documentation'],
  ['verify-all.cjs', 'verification-dispatch']
]);
function safe(file) {
  assert(typeof file === 'string' && file && !path.isAbsolute(file) && !file.split(/[\\/]/).includes('..'), 'Unsafe relative file ' + file);
  return file;
}
function bindings() {
  const changed = Object.keys(m.changedFiles).sort();
  assert(changed.length >= 3, 'Correction must identify its runtime and verification changes');
  for (const file of changed) {
    assert(approvedPaths.has(file), 'Unreviewed correction path ' + file);
    assert.equal(m.changedFiles[file].kind, approvedPaths.get(file), 'Wrong correction type ' + file);
  }
  assert(m.changedFiles['verify-all.cjs'], 'Current verification dispatch is required');
  assert(m.changedFiles['README.md'], 'Accurate verification documentation is required');
  const observed = [];
  for (const [file, before] of Object.entries(b.gitBlobs)) {
    safe(file);
    assert(fs.existsSync(file), 'Published path missing: ' + file);
    const bytes = fs.readFileSync(file), actual = gitBlob(bytes), change = m.changedFiles[file];
    if (!change) {
      assert.equal(actual, before, 'Unexpected modification to published file: ' + file);
      continue;
    }
    assert.equal(change.beforeGitBlob, before, 'Wrong historical source ' + file);
    assert.equal(change.beforeSHA256, b.sha256Files[file], 'Wrong historical SHA256 ' + file);
    assert.equal(actual, change.afterGitBlob, 'Unbound correction bytes: ' + file);
    assert.equal(sha(file), change.afterSHA256, 'Correction SHA256 mismatch: ' + file);
    assert(Array.isArray(change.exactTextReplacements) && change.exactTextReplacements.length, 'Reviewed exact replacements missing: ' + file);
    let reversed = bytes.toString('utf8');
    for (const edit of [...change.exactTextReplacements].reverse()) {
      assert(edit.before !== edit.after && edit.after, 'Invalid correction replacement ' + file);
      assert.equal(reversed.split(edit.after).length - 1, 1, 'Reviewed after-text must occur exactly once: ' + file);
      reversed = reversed.replace(edit.after, edit.before);
    }
    assert.equal(gitBlob(Buffer.from(reversed)), before, 'Change exceeds reviewed presentation replacements: ' + file);
    observed.push(file);
  }
  assert.deepEqual(observed.sort(), changed);
  for (const [file, hash] of Object.entries(m.supportFiles)) {
    safe(file);
    assert(!b.gitBlobs[file], 'Support addition overlaps published path ' + file);
    assert.equal(sha(file), hash, 'Changed correction support: ' + file);
  }
  for (const [file, hash] of Object.entries(b.frozenReportFiles)) assert.equal(sha(file), hash, 'Original release evidence changed: ' + file);
  return {
    historicalPaths: 3612,
    unchangedPublishedBlobs: 3612 - changed.length,
    reviewedChanges: changed,
    engineCorpusAndWitnessBytesUnchanged: true,
    originalReleaseReportsAndManifestsUnchanged: true
  };
}
const initialBindings = bindings();
if (process.argv.includes('--bindings')) {
  console.log(JSON.stringify({ passed: true, ...initialBindings }, null, 2));
  process.exit(0);
}
if (process.argv.includes('--prepare')) {
  const output = process.argv[process.argv.indexOf('--prepare') + 1];
  assert(output, 'Supply output directory');
  assert.equal(m.qaScopeSettled, true, 'Wait for all QA findings before freezing');
  const report = read(reportPath);
  assert.equal(report.passed, true, 'Correction checks must pass');
  assert.equal(report.qaScopeSettled, true, 'Rerun the settled-scope gate before preparing');
  for (const [file, hash] of Object.entries(report.sourceFiles)) assert.equal(sha(file), hash, 'Correction evidence stale: ' + file);
  const files = [...Object.keys(m.changedFiles), ...Object.keys(m.supportFiles), manifestPath, reportPath].sort();
  assert.equal(new Set(files).size, files.length, 'Duplicate correction upload');
  const expected = { ...b.gitBlobs }, uploads = [];
  for (const file of files) {
    safe(file);
    assert(!/(?:^|\/)(?:__pycache__|screenshots|node_modules|\.git)(?:\/|$)|\.(?:log|pyc|tmp|zip)$/.test(file), 'Non-release artifact ' + file);
    const bytes = fs.readFileSync(file);
    expected[file] = gitBlob(bytes);
    uploads.push({ path: file, localPath: path.join(root, file), gitBlobSHA: expected[file], sha256: digest(bytes), size: bytes.length, action: b.gitBlobs[file] ? 'modify' : 'add' });
  }
  fs.mkdirSync(output, { recursive: true });
  const upload = { schemaVersion: 1, baseCommit: m.baseCommit, baselineBlobCount: 3612, expectedBlobCount: Object.keys(expected).length, registryCount: 390, uploadFileCount: uploads.length, totalUploadBytes: uploads.reduce((n, f) => n + f.size, 0), deletedFiles: [], files: uploads, claims: { uploaded: false, merged: false, originalEvidencePreserved: true, engineCorpusAndWitnessBytesUnchanged: true, hostedPostFixVerified: false } };
  fs.writeFileSync(path.join(output, 'upload-manifest.json'), JSON.stringify(upload, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'expected-final-tree.json'), JSON.stringify({ schemaVersion: 1, baseCommit: m.baseCommit, files: expected }, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'release-allowlist.json'), JSON.stringify(files, null, 2) + '\n');
  console.log(JSON.stringify({ files: uploads.length, bytes: upload.totalUploadBytes, expectedBlobs: Object.keys(expected).length, deleted: 0, publicationPerformed: false }, null, 2));
  process.exit(0);
}
const report = {
  schemaVersion: 1, passed: false, baseCommit: m.baseCommit, qaScopeSettled: m.qaScopeSettled,
  scope: 'Scoped presentation correction: fresh affected-family and targeted presentation checks plus390-lobby regression. Original complete release proofs are retained and carried forward by exact published-byte preservation.',
  before: initialBindings,
  knownNonBlockingLimitations: m.knownNonBlockingLimitations || [],
  sourceFiles: Object.fromEntries([manifestPath, baselinePath, ...Object.keys(m.changedFiles), ...Object.keys(m.supportFiles)].map(file => [file, sha(file)])),
  commands: [], freshReports: {}, metadataOverlay: [], generatedVerificationArtifacts: [],
  reusedEvidence: ['frontier120-aggregate-verification-report.json', 'frontier120-engine-audit-receipt.json', 'frontier120-independent-review.json', 'frontier120-historical-verification-report.json'],
  claims: { originalEvidenceRewritten: false, allGameEngineProofsFreshlyRerun: false, affectedFamilyEngineAndControllerRerun: true, browserGeometryProvedByThisCommand: false, hostedPostFixVerified: false }
};
const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'arcade390-presentation-'));
const spec = read('frontier120-spec.json');
const affected = m.affectedFamilies.map(id => {
  const family = spec.families.find(f => f.id === id);
  assert(family, 'Unknown affected family ' + id);
  const published = read(family.releaseManifestPath);
  return { ...family, commands: published.commands, freshReports: published.freshReports };
});
const generatedPaths = new Set(affected.flatMap(f => [f.releaseManifestPath, ...f.freshReports]));
for (const file of ['frontier120-manifest.json', 'frontier120-integration-verification-report.json', 'frontier120-lobby-verification-report.json']) generatedPaths.add(file);
function run(argv) {
  assert(Array.isArray(argv) && ['node', 'python3'].includes(argv[0]));
  const start = Date.now();
  const result = spawnSync(argv[0] === 'node' ? process.execPath : argv[0], argv.slice(1), { cwd: copy, encoding: 'utf8', maxBuffer: 96 * 1024 * 1024, env: { ...process.env, ARCADE_ROOT: copy, PYTHONDONTWRITEBYTECODE: '1' } });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  report.commands.push({ argv, exitCode: result.status, seconds: +((Date.now() - start) / 1000).toFixed(3), stdoutSHA256: digest(result.stdout || ''), stderrSHA256: digest(result.stderr || ''), tail: ((result.stdout || '') + (result.stderr || '')).slice(-2200) });
  assert.ifError(result.error);
  assert.equal(result.status, 0, 'Correction command failed: ' + argv.join(' '));
}
function overlay(file, mutator) {
  const target = path.join(copy, file), before = fs.readFileSync(target), data = JSON.parse(before);
  mutator(data);
  const after = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(target, after);
  report.metadataOverlay.push({ file, publishedSHA256: digest(before), isolatedSHA256: digest(after), reason: 'Disposable source-hash overlay for explicitly reviewed presentation bytes/current family verification output; published metadata stays immutable.' });
}
function captureFresh(file, kind) {
  const target = path.join(copy, file);
  assert(fs.existsSync(target), 'Missing fresh report ' + file);
  const data = read(target);
  assert(data.passed === true || ['passed', 'pass'].includes(data.status) || data.result === 'pass', 'Fresh report failed ' + file);
  for (const key of ['sourceFiles', 'sourceHashes', 'sourceHashesBefore', 'sourceHashesAfter']) {
    for (const [source, hash] of Object.entries(data[key] || {})) {
      if (typeof hash !== 'string') continue;
      safe(source);
      assert.equal(sha(path.join(copy, source)), hash, 'Fresh report source mismatch ' + source);
    }
  }
  report.freshReports[file] = { sha256: sha(target), kind, data };
}
try {
  for (const file of [...Object.keys(b.gitBlobs), ...Object.keys(m.supportFiles), manifestPath]) {
    safe(file);
    fs.mkdirSync(path.dirname(path.join(copy, file)), { recursive: true });
    fs.copyFileSync(path.join(root, file), path.join(copy, file));
  }
  const testedSources = Object.fromEntries([...new Set([...Object.keys(b.gitBlobs), ...Object.keys(m.supportFiles), manifestPath])].filter(file => !generatedPaths.has(file)).map(file => [file, sha(path.join(copy, file))]));
  for (const file of m.targetedFreshReports || []) fs.rmSync(path.join(copy, file), { force: true });
  for (const argv of m.targetedCommands || []) run(argv);
  for (const file of m.targetedFreshReports || []) captureFresh(file, 'fresh-targeted-presentation-regression-not-real-browser');
  for (const family of affected) {
    // Preserve substantive original tests. Only source metadata acknowledges the
    // reviewed runtime changes before tests regenerate their disposable reports.
    overlay(family.releaseManifestPath, data => {
      for (const file of Object.keys(data.sourceFiles || data.sourceHashes || {})) (data.sourceFiles || data.sourceHashes)[file] = sha(path.join(copy, file));
    });
    for (const file of family.freshReports) fs.rmSync(path.join(copy, file), { force: true });
    for (const argv of family.commands) run(argv);
    for (const file of family.freshReports) captureFresh(file, 'fresh-affected-family-engine-and-controller');
    report.generatedVerificationArtifacts.push({ file: family.releaseManifestPath, publishedSHA256: sha(family.releaseManifestPath), temporarySHA256: sha(path.join(copy, family.releaseManifestPath)), reason: 'Original verifier regenerated this manifest in the disposable copy only.' });
  }
  overlay('frontier120-manifest.json', data => { for (const file of Object.keys(data.sourceFiles)) data.sourceFiles[file] = sha(path.join(copy, file)); });
  for (const file of ['frontier120-integration-verification-report.json', 'frontier120-lobby-verification-report.json']) fs.rmSync(path.join(copy, file), { force: true });
  run(['node', 'verify-frontier120-lobby.cjs']);
  for (const file of ['frontier120-integration-verification-report.json', 'frontier120-lobby-verification-report.json']) captureFresh(file, 'fresh390-lobby-with-declared-disposable-metadata-overlay');
  for (const [file, hash] of Object.entries(testedSources)) assert.equal(sha(path.join(copy, file)), hash, 'Tests mutated a runtime/historical source ' + file);
  // Restore published metadata before corruption probes exercise the actual
  // gate against expected production bytes, never a convenient overlay.
  for (const file of generatedPaths) fs.copyFileSync(path.join(root, file), path.join(copy, file));
  report.negativeBindingChecks = [];
  for (const [file, expected] of [
    ['games/survival120-common/engine.js', 'Unexpected modification to published file'],
    ['games/gravity-shelter/levels.json', 'Unexpected modification to published file'],
    ['frontier120-aggregate-verification-report.json', 'Unexpected modification to published file'],
    [Object.keys(m.changedFiles).find(f => f.startsWith('games/')), 'Unbound correction bytes']
  ]) {
    const target = path.join(copy, file), bytes = fs.readFileSync(target);
    try {
      fs.writeFileSync(target, Buffer.concat([bytes, Buffer.from('\n/* intentional correction gate corruption */\n')]));
      const result = spawnSync(process.execPath, ['verify-frontier120-presentation.cjs', '--bindings'], { cwd: copy, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
      assert.notEqual(result.status, 0, 'Gate accepted corruption ' + file);
      assert(((result.stdout || '') + (result.stderr || '')).includes(expected), 'Wrong corruption rejection ' + file);
      report.negativeBindingChecks.push({ file, passed: true, expectedRejection: expected });
    } finally { fs.writeFileSync(target, bytes); }
  }
  report.after = bindings();
  for (const [file, hash] of Object.entries(report.sourceFiles)) assert.equal(sha(file), hash, 'Correction source changed during checks ' + file);
  report.passed = true;
} catch (error) {
  report.error = String(error.stack || error);
  process.exitCode = 1;
  console.error(error.stack || error);
} finally {
  fs.rmSync(copy, { recursive: true, force: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}
console.log((report.passed ? 'PASS' : 'FAIL') + ': scoped390 presentation correction; original proof/evidence bytes retained. Actual browser and hosted post-fix checks remain separate.');
