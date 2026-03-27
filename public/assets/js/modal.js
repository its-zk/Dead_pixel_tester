/**
 * modal.js
 * Themed modal dialogs — replaces all native alert / confirm / prompt calls.
 * All methods return Promises so they can be awaited.
 */

const Modal = (() => {
  // ── DOM scaffold ────────────────────────────────────────────────────────────
  function createBackdrop() {
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop';
    // Mount inside the fullscreen element so the browser never exits fullscreen
    // when a modal is shown during the pixel test.
    const root = document.fullscreenElement ?? document.body;
    root.appendChild(bd);
    // Animate in
    requestAnimationFrame(() => bd.classList.add('modal-backdrop--visible'));
    return bd;
  }

  function createBox(content) {
    const box = document.createElement('div');
    box.className = 'modal-box';
    box.innerHTML = content;
    return box;
  }

  function mount(backdropEl, boxEl) {
    backdropEl.appendChild(boxEl);
  }

  function dismiss(backdropEl) {
    backdropEl.classList.remove('modal-backdrop--visible');
    backdropEl.addEventListener('transitionend', () => backdropEl.remove(), { once: true });
  }

  // ── Toast (non-blocking) ────────────────────────────────────────────────────
  function toast(message, type = 'info') {
    const t = document.createElement('div');
    t.className = `modal-toast modal-toast--${type}`;
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('modal-toast--visible'));
    setTimeout(() => {
      t.classList.remove('modal-toast--visible');
      t.addEventListener('transitionend', () => t.remove(), { once: true });
    }, 3000);
  }

  // ── Alert ───────────────────────────────────────────────────────────────────
  function alert(message, type = 'info') {
    return new Promise((resolve) => {
      const bd = createBackdrop();
      const icon = type === 'error' ? '✕' : 'ℹ';
      const box = createBox(`
        <div class="modal-icon modal-icon--${type}">${icon}</div>
        <p class="modal-body-text">${message}</p>
        <div class="modal-actions">
          <button class="btn btn-primary modal-ok-btn">OK</button>
        </div>
      `);
      mount(bd, box);
      box.querySelector('.modal-ok-btn').addEventListener('click', () => {
        dismiss(bd);
        resolve();
      });
    });
  }

  // ── Confirm ─────────────────────────────────────────────────────────────────
  function confirm({ title, bullets = [], confirmLabel = 'Start', cancelLabel = 'Cancel' }) {
    return new Promise((resolve) => {
      const bd = createBackdrop();
      const bulletHtml = bullets.length
        ? `<ul class="modal-bullets">${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
        : '';
      const box = createBox(`
        <h3 class="modal-title">${title}</h3>
        ${bulletHtml}
        <div class="modal-actions">
          <button class="btn btn-ghost modal-cancel-btn">${cancelLabel}</button>
          <button class="btn btn-primary modal-confirm-btn">${confirmLabel}</button>
        </div>
      `);
      mount(bd, box);
      box.querySelector('.modal-confirm-btn').addEventListener('click', () => { dismiss(bd); resolve(true); });
      box.querySelector('.modal-cancel-btn').addEventListener('click', () => { dismiss(bd); resolve(false); });
    });
  }

  // ── Defect picker ────────────────────────────────────────────────────────────
  function defectPicker(x, y) {
    return new Promise((resolve) => {
      const bd = createBackdrop();
      const box = createBox(`
        <h3 class="modal-title">Defect at <span class="modal-coords">(${x}, ${y})</span></h3>

        <p class="modal-section-label">Scope</p>
        <div class="scope-toggle">
          <button class="scope-btn scope-btn--active" data-scope="specific">
            This colour only
          </button>
          <button class="scope-btn" data-scope="common">
            All colours &nbsp;<span class="scope-common-dot"></span>
          </button>
        </div>
        <p class="modal-scope-hint" id="scope-hint">
          Defect is only visible on the current test colour.
        </p>

        <p class="modal-section-label">Type</p>
        <div class="modal-defect-options">
          <button class="defect-btn defect-btn--dead" data-type="dead">
            <span class="defect-icon">&#9632;</span>
            <strong>Dead</strong>
            <small>Always black — no light</small>
          </button>
          <button class="defect-btn defect-btn--stuck" data-type="stuck">
            <span class="defect-icon" style="color:#f00;">&#9632;</span>
            <strong>Stuck</strong>
            <small>Locked to one colour</small>
          </button>
          <button class="defect-btn defect-btn--hot" data-type="hot">
            <span class="defect-icon" style="color:#fff;">&#9632;</span>
            <strong>Hot</strong>
            <small>Always bright / white</small>
          </button>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost modal-cancel-btn">Cancel</button>
        </div>
      `);
      mount(bd, box);

      // Scope toggle behaviour
      let isCommon = false;
      box.querySelectorAll('.scope-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          box.querySelectorAll('.scope-btn').forEach((b) => b.classList.remove('scope-btn--active'));
          btn.classList.add('scope-btn--active');
          isCommon = btn.dataset.scope === 'common';
          box.querySelector('#scope-hint').textContent = isCommon
            ? 'Defect is visible on every colour screen — logged as a common defect.'
            : 'Defect is only visible on the current test colour.';
        });
      });

      // Type selection resolves the picker
      box.querySelectorAll('.defect-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          dismiss(bd);
          resolve({ type: btn.dataset.type, isCommon });
        });
      });
      box.querySelector('.modal-cancel-btn').addEventListener('click', () => {
        dismiss(bd);
        resolve(null);
      });
    });
  }

  return { alert, confirm, defectPicker, toast };
})();
