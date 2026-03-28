/**
 * animations.js
 * All JS-driven animation helpers. Exposed as the global `Anim` object.
 */

const Anim = (() => {

  // ── Button ripple ─────────────────────────────────────────────────────────────
  function initRipples() {
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.btn-primary');
      if (!btn) return;

      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      Object.assign(ripple.style, {
        width:  `${size}px`,
        height: `${size}px`,
        left:   `${e.clientX - rect.left  - size / 2}px`,
        top:    `${e.clientY - rect.top   - size / 2}px`,
      });
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  }

  // ── Card reveal ───────────────────────────────────────────────────────────────
  function revealCard(id) {
    const card = document.getElementById(id);
    if (!card) return;
    card.classList.remove('hidden');
    card.classList.add('card--enter');
    card.addEventListener('animationend', () => card.classList.remove('card--enter'), { once: true });
  }

  // ── Stagger table rows ────────────────────────────────────────────────────────
  function staggerRows(tableId) {
    const rows = document.querySelectorAll(`#${tableId} tr`);
    rows.forEach((row, i) => {
      row.style.animationDelay = `${i * 45}ms`;
      row.classList.remove('row-in');
      // Force reflow so removing+re-adding the class restarts the animation
      void row.offsetWidth;
      row.classList.add('row-in');
    });
  }

  // ── Swatch pop stagger ────────────────────────────────────────────────────────
  function revealSwatches() {
    document.querySelectorAll('.swatch').forEach((s, i) => {
      s.style.animationDelay = `${300 + i * 70}ms`;
      s.classList.remove('swatch--pop');
      void s.offsetWidth;
      s.classList.add('swatch--pop');
    });
  }

  // ── Count-up numbers ─────────────────────────────────────────────────────────
  function countUp(el, target, duration = 800) {
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function countUpTable(tableId) {
    document.querySelectorAll(`#${tableId} td:last-child`).forEach((td) => {
      const raw = parseInt(td.textContent, 10);
      if (!isNaN(raw) && raw > 0) countUp(td, raw);
    });
  }

  // ── Detect scanning state ────────────────────────────────────────────────────
  function startScan(cardId, btnId) {
    document.getElementById(cardId)?.classList.add('card--scanning');
    document.getElementById(btnId)?.classList.add('btn--loading');
  }
  function stopScan(cardId, btnId) {
    document.getElementById(cardId)?.classList.remove('card--scanning');
    document.getElementById(btnId)?.classList.remove('btn--loading');
  }

  // ── Verdict glow class ────────────────────────────────────────────────────────
  function animateVerdict(verdict) {
    const el = document.getElementById('result-verdict');
    el.classList.add('verdict--reveal');
    el.addEventListener('animationend', () => el.classList.remove('verdict--reveal'), { once: true });
  }

  // ── Confetti ──────────────────────────────────────────────────────────────────
  function confetti() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx    = canvas.getContext('2d');
    const colors = ['#6c63ff','#a855f7','#2ecc71','#f59e0b','#ec4899','#06b6d4','#ffffff','#ffdd57'];
    const total  = 130;
    const maxFrames = 220;
    let   frame  = 0;

    const particles = Array.from({ length: total }, () => ({
      x:     Math.random() * canvas.width,
      y:     -10 - Math.random() * 120,
      w:     5  + Math.random() * 9,
      h:     3  + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx:    -2.5 + Math.random() * 5,
      vy:    2    + Math.random() * 5,
      angle: Math.random() * Math.PI * 2,
      spin:  -0.12 + Math.random() * 0.24,
      alpha: 1,
    }));

    (function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particles.forEach((p) => {
        p.x     += p.vx;
        p.y     += p.vy;
        p.vy    += 0.08;       // gravity
        p.angle += p.spin;
        p.alpha  = frame > 170 ? Math.max(0, 1 - (frame - 170) / 50) : 1;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (frame < maxFrames) requestAnimationFrame(draw);
      else canvas.remove();
    })();
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', initRipples);

  return { revealCard, staggerRows, revealSwatches, countUpTable, startScan, stopScan, animateVerdict, confetti };
})();
