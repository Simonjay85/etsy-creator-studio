/* FontCanvas.ts – Font showcase thumbnails, 2000×2000px */

export interface FontCanvasOptions {
  fontName: string;
  fontStyle: string;
  quoteText: string;
  bgStyle: 'pastel-pink' | 'cream' | 'dark' | 'pastel-green' | 'pastel-blue';
  fontFamilyName: string;
}

export type MockupType = 'mug' | 'tote' | 'sweater' | 'journal';

const S = 2000;

// ─── Helpers ────────────────────────────────────────────────────────────────

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function bgGrad(ctx: CanvasRenderingContext2D, c1: string, c2: string, angle = 135) {
  const rad = (angle * Math.PI) / 180;
  const x1 = S / 2 - Math.cos(rad) * S;
  const y1 = S / 2 - Math.sin(rad) * S;
  const x2 = S / 2 + Math.cos(rad) * S;
  const y2 = S / 2 + Math.sin(rad) * S;
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
}

/** Fit font text to maxWidth, returns actual used font-size. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  ff: string,
  maxWidth: number,
  maxSize: number,
  weight = 'normal',
  minSize = 30
): number {
  let sz = maxSize;
  while (sz > minSize) {
    ctx.font = `${weight} ${sz}px "${ff}", "Georgia", serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    sz -= 4;
  }
  return sz;
}

/** Draw text centered, return actual baseline y used. */
function drawCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  color: string,
  font: string
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, S / 2, y);
}

function palette(bgStyle: FontCanvasOptions['bgStyle']) {
  switch (bgStyle) {
    case 'cream':        return { bg1: '#FFF8EE', bg2: '#FFFDF5', text: '#2A1A0E', accent: '#B05A10', sub: '#C47830', muted: '#B09070' };
    case 'dark':         return { bg1: '#100820', bg2: '#0A0514', text: '#F5EEFF', accent: '#C084FC', sub: '#F472B6', muted: '#7755AA' };
    case 'pastel-green': return { bg1: '#E8F8F0', bg2: '#F4FFF8', text: '#0E2A1A', accent: '#1A7A50', sub: '#278A5B', muted: '#70A890' };
    case 'pastel-blue':  return { bg1: '#E8EEF8', bg2: '#F4F8FF', text: '#0E1A2A', accent: '#2050A0', sub: '#3D72C4', muted: '#7090C0' };
    default:             return { bg1: '#FDE8EE', bg2: '#FFF4F7', text: '#2A0E1A', accent: '#C0276A', sub: '#D4559E', muted: '#C090A8' };
  }
}

function petalRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, petals = 8) {
  ctx.fillStyle = color;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const px = cx + Math.cos(a) * size * 0.55;
    const py = cy + Math.sin(a) * size * 0.55;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.32, size * 0.18, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = color + 'AA';
  ctx.fill();
}

// ─── Slide 1 — INTRODUCING (Hero banner) ────────────────────────────────────
export function drawIntroThumbnail(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = S; canvas.height = S;
  const p = palette(opts.bgStyle);
  bgGrad(ctx, p.bg1, p.bg2, 135);

  // Corner flowers
  const fc = p.accent + '55';
  petalRing(ctx, 140, 140, 110, fc);
  petalRing(ctx, S - 140, 140, 110, fc);
  petalRing(ctx, 140, S - 140, 110, fc);
  petalRing(ctx, S - 140, S - 140, 110, fc);

  // Accent dots
  ctx.fillStyle = p.accent + '22';
  [[420, 110],[1580, 280],[300, 1720],[1700, 1600]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI*2); ctx.fill();
  });

  // White card
  ctx.save();
  ctx.shadowBlur = 80; ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowOffsetY = 20;
  ctx.fillStyle = opts.bgStyle === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.88)';
  rr(ctx, 140, 520, S - 280, 900, 60);
  ctx.fill();
  ctx.restore();

  // "INTRODUCING" label above card
  ctx.font = '700 52px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.accent;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '8px';
  ctx.fillText('✦  INTRODUCING  ✦', S / 2, 490);
  ctx.letterSpacing = '0px';

  // Font name — HUGE, inside card
  const displayName = opts.fontName || 'Font Name';
  const sz = fitFont(ctx, displayName, opts.fontFamilyName, S - 360, 420, 'normal', 60);
  ctx.font = `${sz}px "${opts.fontFamilyName}", "Georgia", serif`;
  ctx.fillStyle = p.text;
  ctx.textAlign = 'center';
  ctx.fillText(displayName, S / 2, 1020);

  // Decorative rule
  const ruleGrad = ctx.createLinearGradient(300, 0, S - 300, 0);
  ruleGrad.addColorStop(0, 'transparent');
  ruleGrad.addColorStop(0.5, p.accent + 'AA');
  ruleGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = ruleGrad as unknown as string;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(300, 1085); ctx.lineTo(S - 300, 1085); ctx.stroke();

  // Style subtitle
  const subtitle = opts.fontStyle ? `A ${opts.fontStyle.toUpperCase()} FONT` : 'A DISPLAY FONT';
  ctx.font = '600 56px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.accent;
  ctx.letterSpacing = '6px';
  ctx.fillText(subtitle, S / 2, 1160);
  ctx.letterSpacing = '0px';

  // Features row
  const feats = ['OTF / TTF', 'Commercial License', 'Instant Download'];
  feats.forEach((f, i) => {
    const x = 500 + i * 500;
    ctx.fillStyle = p.accent + '18';
    rr(ctx, x - 180, 1380, 360, 72, 36);
    ctx.fill();
    ctx.font = '500 36px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = p.accent;
    ctx.fillText(f, x, 1425);
  });

  // Bottom watermark in font
  ctx.font = `120px "${opts.fontFamilyName}", "Georgia", serif`;
  ctx.fillStyle = p.accent + '12';
  ctx.fillText(displayName, S / 2, 1860);
}

// ─── Slide 2 — CHARACTER SHEET ───────────────────────────────────────────────
export function drawCharSheetThumbnail(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = S; canvas.height = S;
  const p = palette(opts.bgStyle === 'dark' ? 'cream' : opts.bgStyle);
  bgGrad(ctx, p.bg1, p.bg2, 160);

  const ff = `"${opts.fontFamilyName}", "Georgia", serif`;

  // Header
  ctx.textAlign = 'center';
  ctx.font = '700 76px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.text;
  ctx.fillText('FULL CHARACTER SET', S / 2, 120);

  // Accent rule
  ctx.fillStyle = p.accent;
  ctx.fillRect(S / 2 - 220, 142, 440, 5);

  // Alphabet rows — large
  const rows: {text: string; size: number; y: number}[] = [
    { text: 'AaBbCcDdEeFfGgHh', size: 105, y: 330 },
    { text: 'IiJjKkLlMmNnOoPp', size: 105, y: 480 },
    { text: 'QqRrSsTtUuVvWwXx', size: 105, y: 630 },
    { text: 'YyZz  0 1 2 3 4 5 6 7 8 9', size: 100, y: 780 },
    { text: '! ? @ # & * . , ; : " \'', size: 95, y: 920 },
  ];

  for (const row of rows) {
    ctx.font = `${row.size}px ${ff}`;
    const mw = ctx.measureText(row.text).width;
    const scale = mw > S - 120 ? (S - 120) / mw : 1;
    const actualSize = Math.floor(row.size * scale);
    ctx.font = `${actualSize}px ${ff}`;
    ctx.fillStyle = p.text;
    ctx.textAlign = 'center';
    ctx.fillText(row.text, S / 2, row.y);
  }

  // Divider line
  ctx.strokeStyle = p.accent + '44';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(100,  990); ctx.lineTo(S - 100, 990); ctx.stroke();

  // Big font name showcase
  const bigName = opts.fontName || 'Sample';
  const bigSz = fitFont(ctx, bigName, opts.fontFamilyName, S - 160, 340, 'normal', 80);
  ctx.font = `${bigSz}px ${ff}`;
  ctx.fillStyle = p.text;
  ctx.textAlign = 'center';
  ctx.fillText(bigName, S / 2, 1260);

  // Stylistic alternates row
  const alts = 'ABCDEFGHIJKLM';
  const altSz = fitFont(ctx, alts, opts.fontFamilyName, S - 160, 160, 'normal', 40);
  ctx.font = `${altSz}px ${ff}`;
  ctx.fillStyle = p.accent;
  ctx.fillText(alts, S / 2, 1450);

  const alts2 = 'NOPQRSTUVWXYZ';
  ctx.fillStyle = p.sub;
  ctx.fillText(alts2, S / 2, 1620);

  // Footer
  ctx.font = '42px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.muted;
  ctx.fillText(`${opts.fontName || 'Font Name'}  ·  OTF & TTF  ·  Commercial License Included`, S / 2, 1900);
}

// ─── Slide 3 — BIG QUOTE ─────────────────────────────────────────────────────
export function drawQuoteThumbnail(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = S; canvas.height = S;
  const p = palette(opts.bgStyle);
  bgGrad(ctx, p.bg1, p.bg2, 155);

  // Subtle dot grid
  ctx.fillStyle = p.accent + '15';
  for (let x = 60; x < S; x += 90)
    for (let y = 60; y < S; y += 90) {
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }

  // Decorative large quote mark in font
  ctx.font = `500px "${opts.fontFamilyName}", "Georgia", serif`;
  ctx.fillStyle = p.accent + '18';
  ctx.textAlign = 'left';
  ctx.fillText('\u201C', -40, 600);

  // Quote text — MAXIMIZE font size
  const rawQuote = opts.quoteText || 'Hello Beautiful World';
  const words = rawQuote.split(' ');

  ctx.textAlign = 'center';
  const ff = `"${opts.fontFamilyName}", "Georgia", serif`;

  // Smart line wrap at 1800px
  const maxLineW = S - 200;
  let lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    ctx.font = `360px ${ff}`;
    if (ctx.measureText(test).width > maxLineW && cur) {
      lines.push(cur); cur = w;
    } else { cur = test; }
  }
  if (cur) lines.push(cur);

  // Find font size that fits all lines
  let fontSize = lines.length <= 2 ? 380 : lines.length === 3 ? 280 : 210;
  for (const line of lines) {
    ctx.font = `${fontSize}px ${ff}`;
    while (ctx.measureText(line).width > maxLineW && fontSize > 60) fontSize -= 6;
  }

  const lh = fontSize * 1.15;
  const totalH = lines.length * lh;
  let ty = (S - totalH) / 2 + fontSize * 0.9;

  for (const line of lines) {
    ctx.save();
    if (opts.bgStyle === 'dark') {
      ctx.shadowColor = p.accent; ctx.shadowBlur = 60;
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.08)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    }
    ctx.font = `${fontSize}px ${ff}`;
    ctx.fillStyle = p.text;
    ctx.fillText(line, S / 2, ty);
    ctx.restore();
    ty += lh;
  }

  // Closing quote mark
  ctx.font = `500px "${opts.fontFamilyName}", "Georgia", serif`;
  ctx.fillStyle = p.accent + '18';
  ctx.textAlign = 'right';
  ctx.fillText('\u201D', S + 40, S - 100);

  // Font attribution
  ctx.font = '700 52px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.accent;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText(`\u2014 ${opts.fontName || 'Font Name'} Font \u2014`, S / 2, S - 100);
  ctx.letterSpacing = '0px';
}

// ─── Slide 4 — ALPHABET SHOWCASE (A–Z large) ─────────────────────────────────
export function drawAlphabetShowcase(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = S; canvas.height = S;
  const p = palette(opts.bgStyle);
  bgGrad(ctx, p.bg1, p.bg2, 145);

  const ff = `"${opts.fontFamilyName}", "Georgia", serif`;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const cols = 6; const rows = 5;
  const cellW = S / cols; const cellH = (S - 220) / rows;
  const fontSize = Math.min(cellW, cellH) * 0.7;

  // Header
  ctx.textAlign = 'center';
  ctx.font = '700 60px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.text;
  ctx.fillText('A – Z', S / 2, 80);
  ctx.fillStyle = p.accent;
  ctx.fillRect(S / 2 - 80, 98, 160, 4);

  // Alternating color letters
  letters.forEach((letter, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = 160 + row * cellH + cellH * 0.65;

    // Subtle cell bg
    ctx.fillStyle = i % 2 === 0 ? p.accent + '08' : 'transparent';
    rr(ctx, col * cellW + 20, 160 + row * cellH + 10, cellW - 40, cellH - 20, 16);
    ctx.fill();

    ctx.font = `${fontSize}px ${ff}`;
    ctx.fillStyle = i % 3 === 0 ? p.accent : i % 3 === 1 ? p.sub : p.text;
    ctx.textAlign = 'center';
    ctx.fillText(letter, cx, cy);
  });

  // Bottom: font name in the font itself, huge
  const nameText = opts.fontName || 'Font Name';
  const nameSz = fitFont(ctx, nameText, opts.fontFamilyName, S - 160, 200, 'normal', 60);
  ctx.font = `${nameSz}px ${ff}`;
  ctx.fillStyle = p.text;
  ctx.textAlign = 'center';
  ctx.fillText(nameText, S / 2, 1920);
}

// ─── Slide 5 — WORD PAIRING (font on phrases ) ───────────────────────────────
export function drawWordPairingSlide(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = S; canvas.height = S;
  const p = palette(opts.bgStyle === 'dark' ? 'cream' : opts.bgStyle);
  bgGrad(ctx, p.bg1, p.bg2, 120);

  const ff = `"${opts.fontFamilyName}", "Georgia", serif`;

  // Header
  ctx.textAlign = 'center';
  ctx.font = '700 68px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.text;
  ctx.fillText('FONT IN USE', S / 2, 110);
  ctx.fillStyle = p.accent;
  ctx.fillRect(S / 2 - 160, 130, 320, 5);

  // Showcase phrases — each in the actual font, very large
  const phrases = [
    opts.fontName || 'Beautiful',
    opts.quoteText?.split(' ')[0] || 'Creative',
    'Hello World',
    'Love & Joy',
    opts.fontName ? opts.fontName.toUpperCase() : 'ELEGANT',
  ];

  const yPositions = [300, 600, 900, 1200, 1520];
  const sizes =      [280, 240, 220, 320, 180];
  const colors =     [p.text, p.accent, p.sub, p.text, p.accent];

  phrases.forEach((phrase, i) => {
    const maxSz = sizes[i];
    const sz = fitFont(ctx, phrase, opts.fontFamilyName, S - 120, maxSz, 'normal', 40);
    ctx.font = `${sz}px ${ff}`;
    ctx.fillStyle = colors[i];
    ctx.textAlign = 'center';
    ctx.fillText(phrase, S / 2, yPositions[i]);

    // Subtle rule between
    if (i < phrases.length - 1) {
      ctx.strokeStyle = p.accent + '28';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(200, yPositions[i] + 50);
      ctx.lineTo(S - 200, yPositions[i] + 50);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  ctx.font = '42px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.muted;
  ctx.textAlign = 'center';
  ctx.fillText(`${opts.fontName || 'Font Name'}  ✦  Available in OTF & TTF`, S / 2, 1920);
}

// ─── Slide 6 — LOWERCASE BEAUTY ───────────────────────────────────────────────
export function drawLowercaseSlide(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = S; canvas.height = S;
  const p = palette(opts.bgStyle);
  bgGrad(ctx, p.bg1, p.bg2, 170);

  const ff = `"${opts.fontFamilyName}", "Georgia", serif`;

  // Large decorative BG letter
  ctx.font = `900px ${ff}`;
  ctx.fillStyle = p.accent + '10';
  ctx.textAlign = 'center';
  ctx.fillText((opts.fontName?.[0] || 'A').toLowerCase(), S / 2, 1100);

  // "lowercase beauty" header
  ctx.font = '700 62px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.text;
  ctx.textAlign = 'center';
  ctx.fillText('Lowercase Letters', S / 2, 120);
  ctx.fillStyle = p.accent;
  ctx.fillRect(S / 2 - 200, 141, 400, 5);

  // a–z in three rows
  const rows = [
    'a b c d e f g h i',
    'j k l m n o p q r',
    's t u v w x y z',
  ];
  const rowSizes = [240, 240, 240];
  const rowYs =   [420, 780, 1120];

  rows.forEach((row, i) => {
    const sz = fitFont(ctx, row, opts.fontFamilyName, S - 120, rowSizes[i], 'normal', 60);
    ctx.font = `${sz}px ${ff}`;
    ctx.fillStyle = i === 1 ? p.accent : p.text;
    ctx.textAlign = 'center';
    ctx.fillText(row, S / 2, rowYs[i]);
  });

  // Decorative divider
  ctx.strokeStyle = p.accent + '40';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(200, 1260); ctx.lineTo(S - 200, 1260); ctx.stroke();

  // Font name big
  const nameSz = fitFont(ctx, opts.fontName || 'Font Name', opts.fontFamilyName, S - 200, 260, 'normal', 60);
  ctx.font = `${nameSz}px ${ff}`;
  ctx.fillStyle = p.text;
  ctx.textAlign = 'center';
  ctx.fillText(opts.fontName || 'Font Name', S / 2, 1560);

  // Style tag
  const tag = opts.fontStyle ? `A ${opts.fontStyle} Font` : 'A Display Font';
  ctx.font = '600 52px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.accent;
  ctx.fillText(tag, S / 2, 1680);

  // Commercial info
  ctx.font = '40px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.muted;
  ctx.fillText('OTF · TTF · WOFF · Commercial License', S / 2, 1900);
}

// ─── Slide 7 — BRAND PAIRINGS (font at different sizes) ──────────────────────
export function drawSizingSlide(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = S; canvas.height = S;
  const p = palette(opts.bgStyle === 'dark' ? 'pastel-pink' : opts.bgStyle);
  bgGrad(ctx, p.bg2, p.bg1, 100);

  const ff = `"${opts.fontFamilyName}", "Georgia", serif`;
  const sample = opts.fontName || 'Beautiful';

  // Top badge
  ctx.font = '700 58px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.text;
  ctx.textAlign = 'center';
  ctx.fillText('SCALE & VERSATILITY', S / 2, 100);
  ctx.fillStyle = p.accent;
  ctx.fillRect(S / 2 - 260, 120, 520, 5);

  // Font name at descending sizes, stacked
  const sizes = [360, 260, 190, 140, 100, 72];
  const labels = ['Display', 'Heading', 'Subhead', 'Caption', 'Body', 'Small'];
  let y = 280;

  sizes.forEach((maxSz, i) => {
    const sz = fitFont(ctx, sample, opts.fontFamilyName, S - 300, maxSz, 'normal', 30);
    ctx.font = `${sz}px ${ff}`;
    ctx.fillStyle = p.text;
    ctx.textAlign = 'left';
    ctx.fillText(sample, 140, y);

    // Size label on the right
    ctx.font = '700 30px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = p.accent + 'BB';
    ctx.textAlign = 'right';
    ctx.fillText(labels[i], S - 100, y);

    y += sz * 1.35;
    if (y > 1800) return;
  });

  // Footer
  ctx.font = '42px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = p.muted;
  ctx.textAlign = 'center';
  ctx.fillText(`${opts.fontName || 'Font Name'}  ·  Readable at any size`, S / 2, 1920);
}

// ─── Slide 8 — WHAT'S INCLUDED (info card) ───────────────────────────────────
export function drawInfoThumbnail(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = S; canvas.height = S;

  // Dark gradient
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, '#12082A');
  g.addColorStop(1, '#0A0514');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
  for (let x = 0; x < S; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, S); ctx.stroke(); }
  for (let y = 0; y < S; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y); ctx.stroke(); }

  // Glow
  const glow = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, 800);
  glow.addColorStop(0, 'rgba(192,132,252,0.18)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, S, S);

  const acc = '#C084FC';
  const ff = `"${opts.fontFamilyName}", "Georgia", serif`;

  // Font name — very large in the actual font
  const nameDisplay = opts.fontName || 'Font Name';
  const nameSz = fitFont(ctx, nameDisplay, opts.fontFamilyName, S - 200, 260, 'normal', 60);
  ctx.font = `${nameSz}px ${ff}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(nameDisplay, S / 2, 260);

  // Subline in font
  const sub = opts.fontStyle ? opts.fontStyle.toUpperCase() + ' FONT' : 'DISPLAY FONT';
  ctx.font = '600 52px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = acc;
  ctx.letterSpacing = '6px';
  ctx.fillText(sub, S / 2, 360);
  ctx.letterSpacing = '0px';

  // Divider
  ctx.strokeStyle = acc + '60'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(S/2 - 300, 400); ctx.lineTo(S/2 + 300, 400); ctx.stroke();

  // Alphabet preview in font big
  ctx.font = `140px ${ff}`;
  ctx.fillStyle = '#FFFFFF88';
  ctx.fillText('A B C D E F G H I J', S / 2, 560);
  ctx.fillStyle = acc + 'AA';
  ctx.font = `130px ${ff}`;
  ctx.fillText('K L M N O P Q R S T', S / 2, 720);
  ctx.fillStyle = '#FFFFFF66';
  ctx.font = `130px ${ff}`;
  ctx.fillText('U V W X Y Z', S / 2, 870);

  // Divider 2
  ctx.strokeStyle = acc + '40'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(100, 940); ctx.lineTo(S - 100, 940); ctx.stroke();

  // Feature boxes
  const features = [
    { icon: '📁', title: 'OTF File', desc: 'OpenType Format' },
    { icon: '📁', title: 'TTF File', desc: 'TrueType Format' },
    { icon: '🌐', title: 'WOFF Files', desc: 'Web Fonts' },
    { icon: '📄', title: 'License', desc: 'Commercial Use OK' },
    { icon: '📦', title: 'ZIP Bundle', desc: 'All Files Included' },
    { icon: '♾️', title: 'Lifetime', desc: 'Instant Download' },
  ];

  const cols = 3; const boxW = 520; const boxH = 190; const gx = 60; const gy = 36;
  const sX = (S - (cols * boxW + (cols - 1) * gx)) / 2;
  const sY = 980;

  features.forEach((f, i) => {
    const col = i % cols; const row = Math.floor(i / cols);
    const bx = sX + col * (boxW + gx); const by = sY + row * (boxH + gy);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = acc + '35'; ctx.lineWidth = 2;
    rr(ctx, bx, by, boxW, boxH, 20);
    ctx.fill(); ctx.stroke(); ctx.restore();

    ctx.font = '66px Arial'; ctx.textAlign = 'left';
    ctx.fillText(f.icon, bx + 24, by + 72);

    ctx.font = '700 42px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(f.title, bx + 108, by + 68);
    ctx.font = '34px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText(f.desc, bx + 108, by + 116);
  });

  // Compat note
  ctx.font = '700 46px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center';
  ctx.fillText('Works in Illustrator · Photoshop · Canva · Cricut', S / 2, 1830);
  ctx.font = '36px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('& all major design software', S / 2, 1900);
}

// ─── Kept for compatibility (mockup type) — renders styled canvas fallback ───
export async function drawMockupThumbnail(
  canvas: HTMLCanvasElement,
  opts: FontCanvasOptions,
  mockupType: MockupType
): Promise<void> {
  // Route to the appropriate new slide based on mockup type
  if (mockupType === 'journal')  drawWordPairingSlide(canvas, opts);
  else if (mockupType === 'mug') drawAlphabetShowcase(canvas, opts);
  else if (mockupType === 'tote') drawLowercaseSlide(canvas, opts);
  else drawSizingSlide(canvas, opts);
}
