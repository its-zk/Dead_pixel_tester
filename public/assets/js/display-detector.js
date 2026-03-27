/**
 * display-detector.js
 * Collects display capabilities from browser APIs:
 *  - window.screen (resolution, colorDepth, orientation)
 *  - window.devicePixelRatio (DPR / physical pixel density)
 *  - CSS media queries (HDR, color gamut, forced-colors)
 *  - Screen Orientation API
 *  - requestAnimationFrame timing (refresh rate estimation)
 */

const DisplayDetector = (() => {
  // ── Refresh rate estimation via rAF ────────────────────────────────────────
  function estimateRefreshRate() {
    return new Promise((resolve) => {
      const samples = [];
      let last = null;
      let frame = 0;

      function tick(ts) {
        if (last !== null) samples.push(ts - last);
        last = ts;
        frame++;
        if (frame < 60) {
          requestAnimationFrame(tick);
        } else {
          const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
          resolve(Math.round(1000 / avg));
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // ── CSS media query probe ──────────────────────────────────────────────────
  function mq(query) {
    return window.matchMedia(query).matches;
  }

  function detectColorGamut() {
    return {
      srgb: mq('(color-gamut: srgb)'),
      p3: mq('(color-gamut: p3)'),
      rec2020: mq('(color-gamut: rec2020)'),
    };
  }

  function detectHDR() {
    return (
      mq('(dynamic-range: high)') ||
      mq('(video-dynamic-range: high)')
    );
  }

  function detectOrientation() {
    if (screen.orientation) {
      return screen.orientation.type; // e.g. "landscape-primary"
    }
    return window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary';
  }

  // ── Main detection ─────────────────────────────────────────────────────────
  async function detect() {
    const dpr = window.devicePixelRatio || 1;

    const logicalW = screen.width;
    const logicalH = screen.height;
    const physicalW = Math.round(logicalW * dpr);
    const physicalH = Math.round(logicalH * dpr);

    const refreshRate = await estimateRefreshRate();

    return {
      resolution: {
        logicalWidth: logicalW,
        logicalHeight: logicalH,
        physicalWidth: physicalW,
        physicalHeight: physicalH,
        devicePixelRatio: dpr,
      },
      availableResolution: {
        width: screen.availWidth,
        height: screen.availHeight,
      },
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      orientation: detectOrientation(),
      refreshRate,
      capabilities: {
        hdr: detectHDR(),
        colorGamut: detectColorGamut(),
        colorDepth: screen.colorDepth,
        touchSupport: navigator.maxTouchPoints > 0,
        orientationSupport: !!screen.orientation,
      },
      userAgent: navigator.userAgent,
    };
  }

  return { detect };
})();
