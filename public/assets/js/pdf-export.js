/**
 * pdf-export.js
 * Generates a multi-page PDF report using jsPDF (loaded via CDN).
 *
 * Design rules:
 *  - Content pages use white backgrounds with dark ink — PDF-appropriate.
 *  - The cover page is the only dark-background page.
 *  - Accent / pass / fail colours appear ONLY in decorative bars and small
 *    badges with white text inside. They are never used as body text colour.
 *  - Font sizes: 11pt section headers · 8pt body & table · 7pt captions/footer.
 */

const PdfExport = (() => {

  // ── A4 geometry (mm) ─────────────────────────────────────────────────────────
  const W = 210, H = 297, M = 16, CW = W - M * 2;

  // ── Ink palette (all RGB arrays) ─────────────────────────────────────────────
  // Content pages — light background
  const INK = {
    // Text
    heading:   [18,  18,  36],   // near-black for titles
    body:      [44,  44,  62],   // dark charcoal for body
    secondary: [88,  88, 108],   // medium grey for labels
    faint:     [148, 148, 165],  // light grey for footers / captions

    // Surfaces
    white:     [255, 255, 255],
    row:       [247, 247, 251],  // zebra-stripe fill
    surface:   [240, 240, 246],  // card / code block fill
    border:    [208, 208, 220],  // rules and dividers

    // Accent (used ONLY for decorative bars / badge fills, white text on top)
    accent:    [82,  75, 188],   // muted indigo

    // Status (used ONLY for badge fills + thin indicator dots, white text)
    pass:      [36, 138,  74],   // calm green
    fail:      [172,  42,  32],  // calm red
    warn:      [158, 100,  12],  // amber

    // Status backgrounds (for text-based callout boxes)
    passBg:    [232, 249, 240],
    failBg:    [252, 234, 232],
    warnBg:    [255, 245, 222],
  };

  // Cover page — dark background only
  const COVER = {
    bg:      [14,  16,  38],
    surface: [28,  30,  56],
    text:    [218, 220, 238],
    muted:   [128, 130, 155],
    accent:  [100,  92, 220],
    white:   [255, 255, 255],
  };

  // ── Per-color metadata ────────────────────────────────────────────────────────
  const COLOR_META = {
    '#000000': {
      name: 'Black',
      description:
        'A fully black screen reveals hot pixels and stuck bright sub-pixels. ' +
        'Any pixel that glows, shows colour, or appears brighter than its neighbours ' +
        'against this background is a defect.',
    },
    '#FFFFFF': {
      name: 'White',
      description:
        'A fully white screen is the most effective test for dead pixels. ' +
        'Any pixel that remains dark, black, or discoloured against the white ' +
        'background is not receiving power and is considered dead.',
    },
    '#FF0000': {
      name: 'Red',
      description:
        'A fully red screen isolates stuck green or blue sub-pixels. ' +
        'Look for non-red specks — any pixel showing green, blue, cyan, or dark ' +
        'colouring indicates a sub-pixel locked in the wrong state.',
    },
    '#00FF00': {
      name: 'Green',
      description:
        'A fully green screen isolates stuck red or blue sub-pixels. ' +
        'Look for non-green specks — any pixel showing red, blue, magenta, or dark ' +
        'colouring indicates a sub-pixel locked in the wrong state.',
    },
    '#0000FF': {
      name: 'Blue',
      description:
        'A fully blue screen isolates stuck red or green sub-pixels. ' +
        'Look for non-blue specks — any pixel showing red, green, yellow, or dark ' +
        'colouring indicates a sub-pixel locked in the wrong state.',
    },
    '#00FFFF': {
      name: 'Cyan',
      description:
        'Cyan (green + blue) isolates stuck red sub-pixels. Since the red channel ' +
        'should be completely off, any red tinge, pink dot, or unexpectedly dark ' +
        'spot on this screen is a red sub-pixel defect.',
    },
    '#FF00FF': {
      name: 'Magenta',
      description:
        'Magenta (red + blue) isolates stuck green sub-pixels. Since the green ' +
        'channel should be completely off, any green tinge, lime dot, or ' +
        'unexpectedly dark spot on this screen is a green sub-pixel defect.',
    },
    '#FFFF00': {
      name: 'Yellow',
      description:
        'Yellow (red + green) isolates stuck blue sub-pixels. Since the blue ' +
        'channel should be completely off, any blue tinge, indigo dot, or ' +
        'unexpectedly dark spot on this screen is a blue sub-pixel defect.',
    },
  };

  // ── Low-level helpers ────────────────────────────────────────────────────────

  function hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }

  // Returns white or black based on luminance — for text on a coloured rect
  function contrastRgb(hex) {
    const [r, g, b] = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 145 ? [30, 30, 30] : [255, 255, 255];
  }

  function statusRgb(verdict) {
    return verdict === 'PASS' ? INK.pass : verdict === 'FAIL' ? INK.fail : INK.warn;
  }

  function statusBgRgb(verdict) {
    return verdict === 'PASS' ? INK.passBg : verdict === 'FAIL' ? INK.failBg : INK.warnBg;
  }

  // Setters (rgb = 3-element array)
  function fill(doc, rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
  function draw(doc, rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
  function ink(doc, rgb)  { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }

  // ── Shared components ────────────────────────────────────────────────────────

  // Thin footer rule + page number
  function pageFooter(doc, pageNum, total) {
    draw(doc, INK.border);
    doc.setLineWidth(0.2);
    doc.line(M, H - 11, W - M, H - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    ink(doc, INK.faint);
    doc.text('Display Tester — Test Report', M, H - 7);
    doc.text(`${pageNum} / ${total}`, W - M, H - 7, { align: 'right' });
  }

  // Accent-bar section heading; returns next Y
  function sectionHeading(doc, title, y) {
    fill(doc, INK.accent);
    doc.rect(M, y, 3, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    ink(doc, INK.heading);
    doc.text(title, M + 7, y + 6.2);

    draw(doc, INK.border);
    doc.setLineWidth(0.2);
    doc.line(M, y + 10, W - M, y + 10);

    return y + 14;
  }

  // Two-column zebra table; returns next Y
  function twoColTable(doc, rows, y) {
    rows.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        fill(doc, INK.row);
        doc.rect(M, y, CW, 7, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      ink(doc, INK.secondary);
      doc.text(String(label), M + 3, y + 4.8);

      doc.setFont('helvetica', 'bold');
      ink(doc, INK.body);
      doc.text(String(value ?? '—'), W - M - 3, y + 4.8, { align: 'right' });

      y += 7;
    });
    return y;
  }

  // Small uppercase label
  function label(doc, text, x, y) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    ink(doc, INK.faint);
    doc.text(text.toUpperCase(), x, y);
  }

  // ── Page 1: Cover (dark) ─────────────────────────────────────────────────────

  function addCoverPage(doc, report) {
    const di = report.displayInfo;

    // Background
    fill(doc, COVER.bg);
    doc.rect(0, 0, W, H, 'F');

    // Top accent strip
    fill(doc, COVER.accent);
    doc.rect(0, 0, W, 3, 'F');

    // Title block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    ink(doc, COVER.text);
    doc.text('Display', W / 2, 86, { align: 'center' });

    ink(doc, COVER.accent);
    doc.text('Tester', W / 2, 104, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    ink(doc, COVER.muted);
    doc.text('Dead Pixel Test Report', W / 2, 113, { align: 'center' });

    // Verdict pill
    const vc = statusRgb(report.verdict);
    fill(doc, vc);
    doc.roundedRect(W / 2 - 28, 124, 56, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    ink(doc, COVER.white);
    doc.text(report.verdict, W / 2, 135, { align: 'center' });

    // Verdict reason
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, COVER.muted);
    const lines = doc.splitTextToSize(report.verdictReason, CW - 16);
    doc.text(lines, W / 2, 150, { align: 'center' });

    // Info cards grid  (2 × 3)
    const cardItems = [
      ['Resolution',  `${di.resolution.logicalWidth} × ${di.resolution.logicalHeight}`],
      ['Physical',    `${di.resolution.physicalWidth} × ${di.resolution.physicalHeight}`],
      ['DPR',         `${di.resolution.devicePixelRatio}×`],
      ['Color depth', `${di.colorDepth}-bit`],
      ['HDR',         di.capabilities.hdr ? 'Supported' : 'Not supported'],
      ['Refresh',     di.refreshRate ? `${di.refreshRate} Hz` : 'N/A'],
    ];

    const cw = (CW - 5) / 2;
    let gy = 174;
    cardItems.forEach(([lbl, val], i) => {
      const cx = M + (i % 2) * (cw + 5);
      const cy = gy + Math.floor(i / 2) * 20;

      fill(doc, COVER.surface);
      doc.roundedRect(cx, cy, cw, 16, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      ink(doc, COVER.muted);
      doc.text(lbl.toUpperCase(), cx + 5, cy + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      ink(doc, COVER.text);
      doc.text(String(val), cx + 5, cy + 12.5);
    });

    // Date + branding footer
    const dateStr = new Date(report.generatedAt).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    ink(doc, COVER.muted);
    doc.text(`Generated ${dateStr}`, W / 2, H - 13, { align: 'center' });
    doc.text('Display Tester', W / 2, H - 7, { align: 'center' });
  }

  // ── Page 2: Display Information ───────────────────────────────────────────────

  function addDisplayInfoPage(doc, report, pageNum, total) {
    const di = report.displayInfo;
    let y = M + 2;

    y = sectionHeading(doc, 'Display Information', y);

    const rows = [
      ['Logical resolution',     `${di.resolution.logicalWidth} × ${di.resolution.logicalHeight} px`],
      ['Physical resolution',    `${di.resolution.physicalWidth} × ${di.resolution.physicalHeight} px`],
      ['Device pixel ratio',     `${di.resolution.devicePixelRatio}×`],
      ['Available area',         `${di.availableResolution.width} × ${di.availableResolution.height} px`],
      ['Color depth',            `${di.colorDepth}-bit`],
      ['Pixel depth',            `${di.pixelDepth}-bit`],
      ['Orientation',            di.orientation],
      ['Estimated refresh rate', di.refreshRate ? `${di.refreshRate} Hz` : 'N/A'],
      ['HDR',                    di.capabilities.hdr ? 'Yes' : 'No'],
      ['Touch support',          di.capabilities.touchSupport ? 'Yes' : 'No'],
      ['Orientation API',        di.capabilities.orientationSupport ? 'Yes' : 'No'],
      ['Color gamut — sRGB',     di.capabilities.colorGamut.srgb ? 'Yes' : 'No'],
      ['Color gamut — P3',       di.capabilities.colorGamut.p3 ? 'Yes' : 'No'],
      ['Color gamut — Rec.2020', di.capabilities.colorGamut.rec2020 ? 'Yes' : 'No'],
    ];

    y = twoColTable(doc, rows, y);
    y += 10;

    // User-agent block
    label(doc, 'User Agent', M, y);
    y += 4;

    fill(doc, INK.surface);
    doc.roundedRect(M, y, CW, 13, 2, 2, 'F');

    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    ink(doc, INK.secondary);
    const uaLines = doc.splitTextToSize(di.userAgent || 'N/A', CW - 6);
    doc.text(uaLines.slice(0, 2), M + 4, y + 5);

    pageFooter(doc, pageNum, total);
  }

  // ── Page 3: Test Summary ──────────────────────────────────────────────────────

  function addSummaryPage(doc, report, pageNum, total) {
    const s  = report.summary;
    const pt = report.pixelTest;
    let y = M + 2;

    y = sectionHeading(doc, 'Test Results', y);

    // ── Verdict callout box
    const vc   = statusRgb(report.verdict);
    const vcBg = statusBgRgb(report.verdict);

    fill(doc, vcBg);
    doc.roundedRect(M, y, CW, 22, 2, 2, 'F');

    // Left coloured bar
    fill(doc, vc);
    doc.roundedRect(M, y, 3, 22, 1, 1, 'F');
    doc.rect(M + 1, y, 2, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    ink(doc, vc);
    doc.text(report.verdict, M + 8, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, INK.body);
    const rLines = doc.splitTextToSize(report.verdictReason, CW - 52);
    doc.text(rLines, W - M - 3, y + 9, { align: 'right' });

    y += 28;

    // ── Stat cards
    const stats = [
      { label: 'Dead pixels',   value: s.totalDeadPixels,   status: s.totalDeadPixels  > 0 ? 'fail' : 'pass' },
      { label: 'Stuck pixels',  value: s.totalStuckPixels,  status: s.totalStuckPixels > 0 ? 'fail' : 'pass' },
      { label: 'Hot pixels',    value: s.totalHotPixels,    status: s.totalHotPixels   > 0 ? 'fail' : 'pass' },
      { label: 'Colors tested', value: `${s.colorsTestedCount} / 8`, status: 'accent' },
    ];

    const cw4 = (CW - 4.5) / 4;
    stats.forEach((stat, i) => {
      const cx  = M + i * (cw4 + 1.5);
      const col = stat.status === 'accent' ? INK.accent :
                  stat.status === 'pass'   ? INK.pass   : INK.fail;

      fill(doc, INK.surface);
      doc.roundedRect(cx, y, cw4, 22, 2, 2, 'F');

      // Coloured top strip
      fill(doc, col);
      doc.rect(cx, y, cw4, 2.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      ink(doc, INK.heading);
      doc.text(String(stat.value), cx + cw4 / 2, y + 15, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      ink(doc, INK.secondary);
      doc.text(stat.label, cx + cw4 / 2, y + 20, { align: 'center' });
    });
    y += 28;

    // ── Session details table
    const duration = pt.durationMs ? `${(pt.durationMs / 1000).toFixed(1)} s` : 'N/A';
    y = twoColTable(doc, [
      ['Test status',    pt.status.charAt(0).toUpperCase() + pt.status.slice(1)],
      ['Started',        new Date(pt.startedAt).toLocaleString()],
      ['Completed',      pt.completedAt ? new Date(pt.completedAt).toLocaleString() : 'N/A'],
      ['Duration',       duration],
      ['Screen tested',  `${pt.screenWidth} × ${pt.screenHeight} px`],
      ['Total defects',  String(s.totalDeadPixels + s.totalStuckPixels + s.totalHotPixels)],
    ], y);

    y += 10;

    // ── All defects table (if any)
    if (pt.reportedDeadPixels.length === 0) {
      fill(doc, INK.passBg);
      doc.roundedRect(M, y, CW, 12, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      ink(doc, INK.pass);
      doc.text('No defects were logged during the test.', W / 2, y + 7.5, { align: 'center' });
    } else {
      label(doc, 'All Logged Defects', M, y);
      y += 5;

      // Header row
      const cols = [M, M + 12, M + 26, M + 46, M + 78, M + 130];
      fill(doc, INK.surface);
      doc.rect(M, y, CW, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      ink(doc, INK.secondary);
      ['#', 'X', 'Y', 'Type', 'Colour screen', 'Scope'].forEach((h, i) =>
        doc.text(h, cols[i] + 2, y + 4.8),
      );
      y += 7;

      draw(doc, INK.border);
      doc.setLineWidth(0.2);
      doc.line(M, y, W - M, y);

      const maxRows = Math.floor((H - y - 18) / 6.5);
      const visible = pt.reportedDeadPixels.slice(0, maxRows);
      const overflow = pt.reportedDeadPixels.length - visible.length;

      visible.forEach((d, idx) => {
        if (idx % 2 === 0) {
          fill(doc, INK.row);
          doc.rect(M, y, CW, 6.5, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        ink(doc, INK.secondary);
        doc.text(String(idx + 1), cols[0] + 2, y + 4.5);

        ink(doc, INK.body);
        doc.text(String(d.x), cols[1] + 2, y + 4.5);
        doc.text(String(d.y), cols[2] + 2, y + 4.5);

        const dotCol = d.isCommon ? [200, 110, 0] :
                       d.type === 'dead' ? INK.fail :
                       d.type === 'hot'  ? INK.warn : [160, 90, 20];
        fill(doc, dotCol);
        doc.circle(cols[3] + 3.5, y + 3.2, 1.3, 'F');

        ink(doc, INK.body);
        doc.text(d.type.charAt(0).toUpperCase() + d.type.slice(1), cols[3] + 7, y + 4.5);

        ink(doc, INK.secondary);
        doc.text(d.detectedDuringColor || '—', cols[4] + 2, y + 4.5);

        // Scope column — "COMMON" pill or "Specific"
        if (d.isCommon) {
          fill(doc, [200, 110, 0]);
          doc.roundedRect(cols[5] + 2, y + 1.2, 16, 4.2, 1, 1, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.5);
          ink(doc, INK.white);
          doc.text('COMMON', cols[5] + 10, y + 4.5, { align: 'center' });
        } else {
          ink(doc, INK.faint);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.text('Specific', cols[5] + 2, y + 4.5);
        }

        y += 6.5;
      });

      if (overflow > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        ink(doc, INK.faint);
        doc.text(`… and ${overflow} more — see individual colour pages.`, M + 3, y + 5);
      }
    }

    pageFooter(doc, pageNum, total);
  }

  // ── Pages 4+: Color Screens ───────────────────────────────────────────────────

  function addColorPage(doc, colorHex, stepNumber, report, pageNum, total) {
    const meta    = COLOR_META[colorHex] || { name: colorHex, description: '' };
    const [cr, cg, cb] = hexToRgb(colorHex);
    const onColor = contrastRgb(colorHex);       // text/marker colour on the rect
    const pt      = report.pixelTest;
    // Common defects appear on every colour page; colour-specific only on their own page
    const defects = pt.reportedDeadPixels.filter((d) => d.isCommon || d.color === colorHex);
    const sw      = pt.screenWidth  || 1920;
    const sh      = pt.screenHeight || 1080;

    let y = M + 2;

    y = sectionHeading(doc, `Colour Screen ${stepNumber} of 8 — ${meta.name}`, y);

    // ── Coloured test rectangle
    const rectY = y, rectH = 110;
    fill(doc, [cr, cg, cb]);
    doc.rect(M, rectY, CW, rectH, 'F');

    // Colour name centred on the rectangle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    ink(doc, onColor);
    doc.text(meta.name.toUpperCase(), M + CW / 2, rectY + rectH / 2 - 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, onColor);
    doc.text(
      `${colorHex}  ·  rgb(${cr}, ${cg}, ${cb})`,
      M + CW / 2, rectY + rectH / 2 + 6, { align: 'center' },
    );

    // ── Defect markers
    // Common defects → orange double-ring; colour-specific → contrasting circle
    defects.forEach((defect) => {
      const px = M      + (defect.x / sw) * CW;
      const py = rectY  + (defect.y / sh) * rectH;

      if (defect.isCommon) {
        draw(doc, [220, 120, 0]);   // orange
        doc.setLineWidth(0.55);
        doc.circle(px, py, 2.4, 'S');   // outer ring
        doc.setLineWidth(0.3);
        doc.circle(px, py, 1.2, 'S');   // inner ring
        doc.line(px - 4.5, py, px + 4.5, py);
        doc.line(px, py - 4.5, px, py + 4.5);
      } else {
        draw(doc, onColor);
        doc.setLineWidth(0.45);
        doc.circle(px, py, 2, 'S');
        doc.line(px - 4, py, px + 4, py);
        doc.line(px, py - 4, px, py + 4);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      ink(doc, defect.isCommon ? [220, 120, 0] : onColor);
      doc.text(`(${defect.x}, ${defect.y})`, px + 2.8, py - 0.5);
    });

    // ── Status badge (top-right of rectangle)
    const badgeW = defects.length === 0 ? 18 : 30;
    const bx = M + CW - badgeW - 2;

    fill(doc, defects.length === 0 ? INK.pass : INK.fail);
    doc.roundedRect(bx, rectY + 3, badgeW, 7.5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    ink(doc, [255, 255, 255]);
    const badgeText = defects.length === 0 ? 'CLEAR' :
      `${defects.length} DEFECT${defects.length !== 1 ? 'S' : ''}`;
    doc.text(badgeText, bx + badgeW / 2, rectY + 8, { align: 'center' });

    y = rectY + rectH + 5;

    // ── Description box
    fill(doc, INK.surface);
    doc.roundedRect(M, y, CW, 22, 2, 2, 'F');

    // Left strip matching the test colour (not a bright block — kept thin)
    fill(doc, [cr, cg, cb]);
    doc.rect(M, y, 3, 22, 'F');

    label(doc, 'What to look for', M + 7, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    ink(doc, INK.body);
    const descLines = doc.splitTextToSize(meta.description, CW - 11);
    doc.text(descLines.slice(0, 3), M + 7, y + 11);

    y += 26;

    // ── Defects on this screen
    if (defects.length === 0) {
      fill(doc, INK.passBg);
      doc.roundedRect(M, y, CW, 11, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      ink(doc, INK.pass);
      doc.text('No defects recorded on this colour screen.', W / 2, y + 7, { align: 'center' });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      ink(doc, INK.heading);
      doc.text(
        `${defects.length} defect${defects.length !== 1 ? 's' : ''} found on this screen:`,
        M, y + 5,
      );
      y += 10;

      defects.forEach((d, idx) => {
        if (y > H - 20) return;

        if (idx % 2 === 0) {
          fill(doc, INK.row);
          doc.rect(M, y, CW, 7, 'F');
        }

        // Indicator dot — orange for common, type-coloured for specific
        const dotCol = d.isCommon ? [200, 110, 0] :
                       d.type === 'dead' ? INK.fail :
                       d.type === 'hot'  ? INK.warn : [160, 90, 20];
        fill(doc, dotCol);
        doc.circle(M + 4.5, y + 3.5, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        ink(doc, INK.body);
        doc.text(d.type.charAt(0).toUpperCase() + d.type.slice(1), M + 9, y + 4.8);

        doc.setFont('helvetica', 'normal');
        ink(doc, INK.body);
        doc.text(`at (${d.x}, ${d.y})`, M + 30, y + 4.8);

        ink(doc, INK.secondary);
        doc.text(
          `${(d.x / sw * 100).toFixed(1)}% left · ${(d.y / sh * 100).toFixed(1)}% top`,
          M + 68, y + 4.8,
        );

        // "COMMON" pill at right edge
        if (d.isCommon) {
          fill(doc, [200, 110, 0]);
          doc.roundedRect(W - M - 18, y + 1.5, 16, 4.5, 1, 1, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.5);
          ink(doc, INK.white);
          doc.text('COMMON', W - M - 10, y + 4.8, { align: 'center' });
        }

        y += 7;
      });
    }

    pageFooter(doc, pageNum, total);
  }

  // ── Entry point ───────────────────────────────────────────────────────────────

  function generate(report) {
    if (!window.jspdf) {
      Modal.alert('PDF library not loaded. Please refresh and try again.', 'error');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const colors     = report.pixelTest.colorsToTest;
    const totalPages = 3 + colors.length;

    addCoverPage(doc, report);

    doc.addPage();
    addDisplayInfoPage(doc, report, 2, totalPages);

    doc.addPage();
    addSummaryPage(doc, report, 3, totalPages);

    colors.forEach((hex, i) => {
      doc.addPage();
      addColorPage(doc, hex, i + 1, report, 4 + i, totalPages);
    });

    doc.save(`display-test-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return { generate };
})();
