/**
 * main.js
 * Orchestrates the display detection + dead-pixel test flow.
 * All user-facing dialogs go through Modal — no native alert/confirm/prompt.
 */

const API = '/api';
let state = {
  sessionId:     null,
  displayInfoId: null,
  pixelTestId:   null,
  report:        null,   // stored after showReport() for PDF export
};

// ── Utility ──────────────────────────────────────────────────────────────────

function el(id) { return document.getElementById(id); }
function show(id) { el(id).classList.remove('hidden'); }

function generateSessionId() {
  return 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

async function apiPost(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return (await res.json()).data;
}

// ── Step 1: Display Detection ─────────────────────────────────────────────────

async function runDisplayDetection() {
  const btn = el('detect-btn');
  btn.disabled = true;
  btn.textContent = 'Detecting…';
  Anim.startScan('step1', 'detect-btn');

  try {
    state.sessionId = generateSessionId();
    const info = await DisplayDetector.detect();
    renderDisplayInfo(info);

    const saved = await apiPost('/display', { ...info, sessionId: state.sessionId });
    state.displayInfoId = saved.id;

    show('display-result');
    Anim.staggerRows('display-table');

    Anim.revealCard('step2');
    Anim.revealSwatches();

    btn.textContent = 'Re-detect';
  } catch (err) {
    await Modal.alert('Detection failed: ' + err.message, 'error');
    console.error(err);
    btn.textContent = 'Detect My Display';
  } finally {
    btn.disabled = false;
    Anim.stopScan('step1', 'detect-btn');
  }
}

function renderDisplayInfo(info) {
  const r = info.resolution;
  const rows = [
    ['Logical resolution',    `${r.logicalWidth} × ${r.logicalHeight}`],
    ['Physical resolution',   `${r.physicalWidth} × ${r.physicalHeight}`],
    ['Device pixel ratio',    r.devicePixelRatio.toFixed(2)],
    ['Available area',        `${info.availableResolution.width} × ${info.availableResolution.height}`],
    ['Color depth',           `${info.colorDepth}-bit`],
    ['Pixel depth',           `${info.pixelDepth}-bit`],
    ['Orientation',           info.orientation],
    ['Refresh rate (est.)',   info.refreshRate ? `${info.refreshRate} Hz` : 'N/A'],
    ['HDR',                   info.capabilities.hdr ? '✔ Yes' : '✘ No'],
    ['Touch',                 info.capabilities.touchSupport ? '✔ Yes' : '✘ No'],
    ['Color gamut — sRGB',    info.capabilities.colorGamut.srgb ? '✔' : '✘'],
    ['Color gamut — P3',      info.capabilities.colorGamut.p3 ? '✔' : '✘'],
    ['Color gamut — Rec2020', info.capabilities.colorGamut.rec2020 ? '✔' : '✘'],
  ];

  el('display-table').innerHTML = rows
    .map(([k, v]) => `<tr><td class="label">${k}</td><td>${v}</td></tr>`)
    .join('');
}

// ── Step 2: Pixel Test ────────────────────────────────────────────────────────

async function startPixelTest() {
  if (!state.displayInfoId) {
    await Modal.alert('Please run display detection first.');
    return;
  }

  const btn = el('test-btn');
  btn.disabled = true;
  btn.textContent = 'Starting…';

  try {
    const testSession = await apiPost('/pixel-test/start', {
      sessionId: state.sessionId,
      displayInfoId: state.displayInfoId,
      screenWidth: screen.width,
      screenHeight: screen.height,
    });
    state.pixelTestId = testSession.id;

    const go = await Modal.confirm({
      title: 'Dead Pixel Test',
      bullets: [
        'The screen will fill with 8 solid test colors.',
        'Click any pixel that looks wrong, then classify it.',
        'Press <kbd>→</kbd> or <kbd>Space</kbd> to advance to the next color.',
        'Press <kbd>Esc</kbd> to quit early.',
      ],
      confirmLabel: 'Start Test',
      cancelLabel: 'Cancel',
    });

    if (!go) {
      btn.disabled = false;
      btn.textContent = 'Start Dead Pixel Test';
      return;
    }

    await PixelTester.start(state.pixelTestId, onTestDone);
  } catch (err) {
    await Modal.alert('Could not start test: ' + err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Start Dead Pixel Test';
  }
}

async function onTestDone({ testId, defects, status }) {
  const btn = el('test-btn');
  btn.disabled = false;
  btn.textContent = 'Run Test Again';

  if (status === 'abandoned') {
    el('result-verdict').textContent = 'Abandoned';
    el('result-verdict').className = 'verdict incomplete';
    el('result-reason').textContent = 'Test was quit before all colors were checked — no final verdict.';
    show('step3');
    return;
  }

  await showReport();
}

// ── Step 3: Report ─────────────────────────────────────────────────────────────

async function showReport() {
  try {
    const report = await apiPost('/reports', {
      pixelTestId: state.pixelTestId,
      displayInfoId: state.displayInfoId,
    });
    renderReport(report);
    Anim.revealCard('step3');
  } catch (err) {
    console.error(err);
    el('result-verdict').textContent = 'Error';
    el('result-verdict').className = 'verdict incomplete';
    el('result-reason').textContent = 'Failed to generate report. Check the console.';
    Anim.revealCard('step3');
  }
}

function renderReport(report) {
  state.report = report;

  const verdictEl = el('result-verdict');
  verdictEl.textContent = report.verdict;
  verdictEl.className = 'verdict ' + report.verdict.toLowerCase();
  el('result-reason').textContent = report.verdictReason;

  const s = report.summary;
  el('result-summary').innerHTML = `
    <tr><td class="label">Dead pixels</td><td>0</td></tr>
    <tr><td class="label">Stuck pixels</td><td>0</td></tr>
    <tr><td class="label">Hot pixels</td><td>0</td></tr>
    <tr><td class="label">Colors tested</td><td>${s.colorsTestedCount} / 8</td></tr>
  `;

  // Animate rows in then count up the numbers
  Anim.staggerRows('result-summary');
  setTimeout(() => {
    const tds = el('result-summary').querySelectorAll('tr td:last-child');
    [s.totalDeadPixels, s.totalStuckPixels, s.totalHotPixels].forEach((n, i) => {
      if (n > 0) Anim.countUpTable('result-summary');
      tds[i].textContent = n;
    });
  }, 400);

  Anim.animateVerdict(report.verdict);
  el('export-btn').classList.remove('hidden');

  if (report.verdict === 'PASS') setTimeout(Anim.confetti, 300);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  el('detect-btn').addEventListener('click', runDisplayDetection);
  el('test-btn').addEventListener('click', startPixelTest);
  el('export-btn').addEventListener('click', () => {
    if (!state.report) return;
    el('export-btn').textContent = 'Generating…';
    el('export-btn').disabled = true;
    // Yield to the browser so the button state renders before jsPDF blocks the thread
    setTimeout(() => {
      PdfExport.generate(state.report);
      el('export-btn').textContent = 'Export PDF';
      el('export-btn').disabled = false;
    }, 60);
  });
});
