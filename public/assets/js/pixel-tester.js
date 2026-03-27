/**
 * pixel-tester.js
 * Dead / stuck / hot pixel tester using a true full-screen Canvas.
 *
 * Navigation:
 *  ← / →  move between colors
 *  Esc     browser exits fullscreen first (can't be prevented); we catch
 *          fullscreenchange and offer Resume / Quit from there.
 *  End Test button appears on the last color screen.
 */

const PixelTester = (() => {
  const TEST_COLORS = [
    { name: 'Black',   hex: '#000000' },
    { name: 'White',   hex: '#FFFFFF' },
    { name: 'Red',     hex: '#FF0000' },
    { name: 'Green',   hex: '#00FF00' },
    { name: 'Blue',    hex: '#0000FF' },
    { name: 'Cyan',    hex: '#00FFFF' },
    { name: 'Magenta', hex: '#FF00FF' },
    { name: 'Yellow',  hex: '#FFFF00' },
  ];

  let shell, canvas, ctx, hud, progressBar;
  let testId, colorIndex, defects, onDone;
  let isPickerOpen         = false;
  let isTestActive         = false;
  let isExitingIntentionally = false;

  // ── DOM ─────────────────────────────────────────────────────────────────────

  function buildShell() {
    shell = document.createElement('div');
    shell.id = 'test-shell';
    Object.assign(shell.style, {
      position: 'fixed', inset: '0',
      zIndex: '9000',
      background: '#000',
      overflow: 'hidden',
    });

    canvas = document.createElement('canvas');
    canvas.id = 'pixel-test-canvas';
    Object.assign(canvas.style, {
      display: 'block',
      width: '100%', height: '100%',
      cursor: 'crosshair',
    });
    ctx = canvas.getContext('2d');

    hud = document.createElement('div');
    hud.id = 'test-hud';

    const track = document.createElement('div');
    track.id = 'test-progress-bar-track';
    progressBar = document.createElement('div');
    progressBar.id = 'test-progress-bar';
    track.appendChild(progressBar);
    hud.appendChild(track);

    shell.appendChild(canvas);
    shell.appendChild(hud);
    document.body.appendChild(shell);

    canvas.addEventListener('click', onCanvasClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFullscreenChange);
  }

  function tearDown() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    shell?.remove();
    shell = canvas = ctx = hud = progressBar = null;
    isTestActive = false;
    isPickerOpen = false;
    isExitingIntentionally = false;
  }

  // ── Fullscreen & canvas sizing ──────────────────────────────────────────────

  async function enterFullscreen() {
    try {
      await shell.requestFullscreen({ navigationUI: 'hide' });
    } catch (_) {
      resizeCanvas();
    }
  }

  async function onFullscreenChange() {
    if (!document.fullscreenElement) {
      // Fullscreen was lost
      if (isTestActive && !isExitingIntentionally) {
        // User pressed Esc — browser already exited fullscreen; ask what to do
        await handleEscExit();
      }
      return;
    }
    // Fullscreen just became active — resize and repaint
    resizeCanvas();
    if (colorIndex !== undefined) showColor(colorIndex);
  }

  async function handleEscExit() {
    isPickerOpen = true;
    const resume = await Modal.confirm({
      title: 'Test paused',
      bullets: [
        'You pressed Esc — fullscreen was exited.',
        'Quitting will mark the test as incomplete.',
      ],
      confirmLabel: 'Resume test',
      cancelLabel: 'Quit',
    });
    isPickerOpen = false;

    if (resume) {
      await enterFullscreen();
    } else {
      await abandon();
    }
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
  }

  // ── HUD ─────────────────────────────────────────────────────────────────────

  function buildHUDInner() {
    const inner = document.createElement('div');
    inner.className = 'hud-inner';
    hud.appendChild(inner);
  }

  function updateHUD(index) {
    const color  = TEST_COLORS[index];
    const isLast = index === TEST_COLORS.length - 1;
    const isFirst = index === 0;
    const pct    = ((index + 1) / TEST_COLORS.length) * 100;

    const darkBg   = ['#000000', '#FF0000', '#0000FF', '#FF00FF'].includes(color.hex);
    const hudBg    = darkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.55)';
    const hudColor = darkBg ? '#ffffff' : '#111111';
    hud.style.setProperty('--hud-bg',    hudBg);
    hud.style.setProperty('--hud-color', hudColor);
    progressBar.style.width = pct + '%';

    const keysHtml = isLast
      ? (!isFirst ? `<kbd>←</kbd> Back` : '')
      : (!isFirst ? `<kbd>←</kbd> Back &nbsp;` : '') + `<kbd>→</kbd> Next`;

    const endBtnHtml = isLast
      ? `<button class="hud-end-btn" id="hud-end-btn">End Test</button>`
      : '';

    hud.querySelector('.hud-inner').innerHTML =
      `<span class="hud-step">${index + 1} / ${TEST_COLORS.length}</span>` +
      `<span class="hud-color-name">${color.name}</span>` +
      `<span class="hud-defects">${defects.length} defect${defects.length !== 1 ? 's' : ''}</span>` +
      `<span class="hud-keys">${keysHtml}</span>` +
      endBtnHtml;

    if (isLast) {
      document.getElementById('hud-end-btn').addEventListener('click', finish);
    }
  }

  // ── Color rendering ─────────────────────────────────────────────────────────

  function navigateTo(index) {
    fetch(`/api/pixel-test/${testId}/color`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentColorIndex: index }),
    }).catch(console.error);
    showColor(index);
  }

  function showColor(index) {
    colorIndex = index;
    ctx.fillStyle = TEST_COLORS[index].hex;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    redrawMarkers();
    updateHUD(index);
  }

  function redrawMarkers() {
    defects.forEach(drawMarker);
  }

  function drawMarker(defect) {
    // Common defects → vivid orange double-ring so they stand out on every colour
    // Colour-specific → contrasting circle+crosshair relative to the test colour
    const isCommon = defect.isCommon;

    ctx.save();

    if (isCommon) {
      ctx.strokeStyle = '#ff9900';
      ctx.lineWidth = 2;
      const r = 9;
      // Outer ring
      ctx.beginPath();
      ctx.arc(defect.x, defect.y, r, 0, Math.PI * 2);
      ctx.stroke();
      // Inner ring
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(defect.x, defect.y, r - 4, 0, Math.PI * 2);
      ctx.stroke();
      // Crosshair
      ctx.beginPath();
      ctx.moveTo(defect.x - r - 4, defect.y);
      ctx.lineTo(defect.x + r + 4, defect.y);
      ctx.moveTo(defect.x, defect.y - r - 4);
      ctx.lineTo(defect.x, defect.y + r + 4);
      ctx.stroke();
    } else {
      const markerColor = defect.type === 'dead' ? '#ffffff' :
                          defect.type === 'hot'  ? '#ff0000' : '#00ffff';
      ctx.strokeStyle = markerColor;
      ctx.lineWidth = 1.5;
      const r = 8;
      ctx.beginPath();
      ctx.arc(defect.x, defect.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(defect.x - r - 4, defect.y);
      ctx.lineTo(defect.x + r + 4, defect.y);
      ctx.moveTo(defect.x, defect.y - r - 4);
      ctx.lineTo(defect.x, defect.y + r + 4);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  async function onCanvasClick(e) {
    if (isPickerOpen) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    await classifyDefect(x, y);
  }

  async function classifyDefect(x, y) {
    isPickerOpen = true;
    const result = await Modal.defectPicker(x, y);
    isPickerOpen = false;

    if (!result) return;

    const { type, isCommon } = result;

    const defect = {
      x, y, type, isCommon,
      color:               isCommon ? null                         : TEST_COLORS[colorIndex].hex,
      detectedDuringColor: isCommon ? 'All screens'                : TEST_COLORS[colorIndex].name,
    };
    defects.push(defect);
    drawMarker(defect);
    updateHUD(colorIndex);

    // Strip null before sending (backend expects optional, not null)
    const payload = { ...defect };
    if (payload.color === null) delete payload.color;

    fetch(`/api/pixel-test/${testId}/pixels`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixels: [payload], currentColorIndex: colorIndex }),
    }).catch(console.error);

    const label = isCommon ? 'Common' : type.charAt(0).toUpperCase() + type.slice(1);
    Modal.toast(`${label} pixel logged at (${x}, ${y})`, 'info');
  }

  async function onKeyDown(e) {
    if (isPickerOpen) return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (colorIndex < TEST_COLORS.length - 1) {
        navigateTo(colorIndex + 1);
      } else {
        await finish();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (colorIndex > 0) {
        navigateTo(colorIndex - 1);
      }
    }
    // Esc is not intercepted here — the browser exits fullscreen first and
    // fullscreenchange fires, which triggers handleEscExit().
  }

  // ── Finish / abandon ────────────────────────────────────────────────────────

  async function finish() {
    isTestActive           = false;
    isExitingIntentionally = true;
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch (_) {}
    }
    tearDown();
    await fetch(`/api/pixel-test/${testId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: '' }),
    });
    onDone?.({ testId, defects, status: 'completed' });
  }

  async function abandon() {
    isTestActive           = false;
    isExitingIntentionally = true;
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch (_) {}
    }
    tearDown();
    await fetch(`/api/pixel-test/${testId}/abandon`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    onDone?.({ testId, defects, status: 'abandoned' });
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  async function start(pixelTestId, doneCallback) {
    testId     = pixelTestId;
    defects    = [];
    onDone     = doneCallback;
    colorIndex = 0;
    isTestActive           = true;
    isExitingIntentionally = false;

    buildShell();
    buildHUDInner();
    resizeCanvas();
    showColor(0);
    await enterFullscreen();
  }

  return { start, TEST_COLORS };
})();
