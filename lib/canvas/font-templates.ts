// Font product thumbnail generators
import {
  SIZE, roundRect, fillRoundRect, drawPetal, drawDotGrid, drawWrappedText,
  getBgColors, getTextColor, getAccentColor, getFlowerColor, fitText,
} from './helpers';
import type { FontMetadata } from '../etsy/types';

function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number, cy: number,
  radius: number,
  startAngle: number
) {
  ctx.save();
  ctx.font = 'bold 55px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#443344';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = text.split('');
  const totalAngle = (chars.length - 1) * 0.175;
  let a = startAngle - totalAngle / 2;
  for (const ch of chars) {
    ctx.save();
    ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    a += 0.175;
  }
  ctx.restore();
}

/** Thumbnail 1 — Intro / Introducing slide */
export function drawFontIntro(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const [c1, c2] = getBgColors(opts.bgStyle);
  const textColor = getTextColor(opts.bgStyle);
  const accentColor = getAccentColor(opts.bgStyle);
  const flowerColor = getFlowerColor(opts.bgStyle);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Corner flowers
  drawPetal(ctx, 160, 160, 110, flowerColor);
  drawPetal(ctx, SIZE - 160, 160, 110, flowerColor);
  drawPetal(ctx, 160, SIZE - 160, 110, flowerColor);
  drawPetal(ctx, SIZE - 160, SIZE - 160, 110, flowerColor);

  // Accent dots
  ctx.fillStyle = `${accentColor}33`;
  for (const [dx, dy] of [[400, 120], [1600, 280], [280, 1700], [1720, 1600]] as [number, number][]) {
    ctx.beginPath(); ctx.arc(dx, dy, 18, 0, Math.PI * 2); ctx.fill();
  }

  // Arced "INTRODUCING" text
  drawArcText(ctx, 'INTRODUCING', 440, 600, 310, -Math.PI * 0.85);

  // White backer card
  ctx.save();
  ctx.shadowBlur = 60; ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowOffsetY = 15;
  ctx.fillStyle = opts.bgStyle === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)';
  roundRect(ctx, 160, 520, SIZE - 320, 940, 60); ctx.fill();
  ctx.restore();

  // Font name — auto-fit
  const displayName = (opts.fontName || 'Font Name').toUpperCase();
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  const fontFamily = opts.fontFamilyName || 'Georgia';
  const fontSize = fitText(ctx, displayName, fontFamily, SIZE - 400, 340);
  ctx.font = `bold ${fontSize}px "${fontFamily}", Georgia, serif`;
  ctx.fillText(displayName, SIZE / 2, 960);

  // Tagline
  ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  const tagline = opts.tagline || (opts.fontStyle ? `A ${opts.fontStyle.toUpperCase()} FONT` : 'A DISPLAY FONT');
  ctx.fillText(tagline.length > 50 ? tagline.substring(0, 47) + '…' : tagline, SIZE / 2, 1110);

  // Preview phrase
  if (opts.previewPhrase) {
    ctx.font = `italic 80px "${fontFamily}", Georgia, serif`;
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.45;
    const phraseFit = fitText(ctx, opts.previewPhrase, fontFamily, SIZE - 400, 80, 30, 'italic');
    ctx.font = `italic ${phraseFit}px "${fontFamily}", Georgia, serif`;
    ctx.fillText(opts.previewPhrase, SIZE / 2, 1310);
    ctx.globalAlpha = 1;
  }

  // Decorative line
  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 120, 1370, 240, 4);

  // Subtitle style tag
  ctx.font = 'bold 58px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.fillText(opts.fontStyle ? `A ${opts.fontStyle.toUpperCase()} FONT` : 'A DISPLAY FONT', SIZE / 2, 1500);

  // Footer
  ctx.font = '38px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = `${textColor}55`;
  ctx.fillText('Commercial License Included · Instant Download', SIZE / 2, 1820);
}

/** Thumbnail 2 — Character Sheet (A–Z, 0–9, punctuation) */
export function drawFontCharSheet(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const [c1, c2] = getBgColors(opts.bgStyle === 'dark' ? 'cream' : opts.bgStyle);
  const textColor = getTextColor('cream');
  const accentColor = getAccentColor(opts.bgStyle);

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SIZE, SIZE);

  // Title
  ctx.textAlign = 'center';
  ctx.font = 'bold 80px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = textColor;
  ctx.fillText('All Characters', SIZE / 2, 120);
  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 150, 140, 300, 5);

  const ff = opts.fontFamilyName || 'Georgia';
  const fontFamily = `"${ff}", Georgia, serif`;

  const rows = [
    { text: 'Aa Bb Cc Dd Ee Ff Gg Hh', size: 95, y: 280 },
    { text: 'Ii Jj Kk Ll Mm Nn Oo Pp', size: 95, y: 420 },
    { text: 'Qq Rr Ss Tt Uu Vv Ww', size: 95, y: 560 },
    { text: 'Xx Yy Zz', size: 95, y: 700 },
    { text: '0 1 2 3 4 5 6 7 8 9', size: 110, y: 870 },
    { text: '! ? @ # $ % & * ( )', size: 90, y: 1020 },
    { text: '. , ; : \' " - _ + = / \\', size: 90, y: 1160 },
  ];

  for (const row of rows) {
    ctx.font = `${row.size}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    if (ctx.measureText(row.text).width > SIZE - 120) {
      ctx.font = `${row.size * 0.75}px ${fontFamily}`;
    }
    ctx.fillText(row.text, SIZE / 2, row.y);
  }

  ctx.fillStyle = `${textColor}44`;
  ctx.fillRect(80, 1260, SIZE - 160, 2);

  // Big sample
  const sample = opts.fontName || 'Sample Text';
  const sampleFit = fitText(ctx, sample, ff, SIZE - 160, 160, 60);
  ctx.font = `bold ${sampleFit}px ${fontFamily}`;
  ctx.fillStyle = textColor; ctx.textAlign = 'center';
  ctx.fillText(sample, SIZE / 2, 1500);

  // Uppercase showcase in accent
  const upper = (opts.fontName || 'ABCDE').toUpperCase();
  const upperFit = fitText(ctx, upper, ff, SIZE - 160, 130, 50);
  ctx.font = `${upperFit}px ${fontFamily}`;
  ctx.fillStyle = accentColor;
  ctx.fillText(upper, SIZE / 2, 1700);

  // Footer
  ctx.font = '45px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = `${textColor}66`;
  ctx.fillText(`${opts.fontName || 'Font'} · OTF & TTF · Commercial License`, SIZE / 2, 1880);
}

/** Thumbnail 3 — Quote / Text Mockup */
export function drawFontQuote(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const [c1, c2] = getBgColors(opts.bgStyle);
  const textColor = getTextColor(opts.bgStyle);
  const accentColor = getAccentColor(opts.bgStyle);

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SIZE, SIZE);

  // Dot pattern
  drawDotGrid(ctx, `${accentColor}18`, 80, 4);

  const rawQuote = (opts.previewPhrase || 'Create Something Beautiful').toUpperCase();
  const ff = opts.fontFamilyName || 'Georgia';
  const words = rawQuote.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    ctx.font = `bold 240px "${ff}", Georgia, serif`;
    if (ctx.measureText(test).width > SIZE - 200) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const maxFontSize = lines.length <= 2 ? 300 : lines.length <= 3 ? 240 : 190;
  let fontSize = maxFontSize;
  for (const line of lines) {
    ctx.font = `bold ${fontSize}px "${ff}", Georgia, serif`;
    while (ctx.measureText(line).width > SIZE - 160 && fontSize > 80) fontSize -= 8;
  }

  const lineHeight = fontSize * 1.12;
  const totalHeight = lines.length * lineHeight;
  let y = (SIZE - totalHeight) / 2 + fontSize * 0.85;

  ctx.textAlign = 'center';
  for (const line of lines) {
    ctx.save();
    if (opts.bgStyle === 'dark') {
      ctx.shadowColor = accentColor; ctx.shadowBlur = 40;
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    }
    ctx.font = `bold ${fontSize}px "${ff}", Georgia, serif`;
    ctx.fillStyle = textColor;
    ctx.fillText(line, SIZE / 2, y);
    ctx.restore();
    y += lineHeight;
  }

  // Font name label at bottom
  ctx.font = 'bold 55px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.fillText(`— ${opts.fontName || 'Font Name'} Font —`, SIZE / 2, SIZE - 100);
}

/** Thumbnail 4 — Product Mockup (poster/tote style) */
export function drawFontMockup(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const [c1, c2] = getBgColors(opts.bgStyle);
  const textColor = getTextColor(opts.bgStyle);
  const accentColor = getAccentColor(opts.bgStyle);
  const ff = opts.fontFamilyName || 'Georgia';

  // Background
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, opts.bgStyle === 'dark' ? '#1a1025' : '#F5F0FA');
  grad.addColorStop(1, opts.bgStyle === 'dark' ? '#0d0a18' : '#EDE8F5');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SIZE, SIZE);

  // Dot grid subtle
  drawDotGrid(ctx, `${accentColor}12`, 60, 2);

  // ── POSTER MOCKUP ──
  // Outer frame shadow
  ctx.save();
  ctx.shadowBlur = 80; ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowOffsetY = 20;
  fillRoundRect(ctx, 300, 180, 1400, 1420, 16, opts.bgStyle === 'dark' ? '#2A1F3D' : '#FEFEFE');
  ctx.restore();

  const posterX = 300, posterY = 180, posterW = 1400, posterH = 1420;

  // Inner poster content
  // Top accent bar
  ctx.fillStyle = accentColor;
  ctx.fillRect(posterX, posterY, posterW, 12);

  // Label at top
  ctx.font = 'bold 38px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = opts.bgStyle === 'dark' ? '#AAAACC' : '#888899';
  ctx.textAlign = 'center';
  ctx.fillText('STUDIO MOCKUP PREVIEW', SIZE / 2, posterY + 80);

  // Divider
  ctx.fillStyle = `${accentColor}44`;
  ctx.fillRect(posterX + 80, posterY + 100, posterW - 160, 2);

  // Big font name center
  const displayName = opts.fontName || 'Font Name';
  const bigFontSize = fitText(ctx, displayName, ff, posterW - 160, 280, 80);
  ctx.font = `bold ${bigFontSize}px "${ff}", Georgia, serif`;
  ctx.fillStyle = opts.bgStyle === 'dark' ? '#F0ECFF' : textColor;
  ctx.textAlign = 'center';
  ctx.fillText(displayName, SIZE / 2, posterY + 450);

  // Script preview phrase
  const phrase = opts.previewPhrase || 'Create something beautiful';
  const phraseFit = fitText(ctx, phrase, ff, posterW - 200, 140, 50, 'italic');
  ctx.font = `italic ${phraseFit}px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor;
  ctx.fillText(phrase, SIZE / 2, posterY + 680);

  // Decorative lines
  ctx.fillStyle = `${accentColor}55`;
  ctx.fillRect(posterX + 200, posterY + 720, posterW - 400, 3);

  // Pangram text sample
  ctx.font = `52px "${ff}", Georgia, serif`;
  ctx.fillStyle = opts.bgStyle === 'dark' ? '#C0B8D8' : '#555566';
  ctx.fillText('The quick brown fox jumps over the lazy dog', SIZE / 2, posterY + 840);

  // Tagline
  ctx.font = 'bold 44px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = opts.bgStyle === 'dark' ? '#A090C8' : '#8877AA';
  const tagText = opts.tagline || (opts.fontStyle ? `A ${opts.fontStyle} font` : 'A beautiful display font');
  const tagFit = fitText(ctx, tagText, 'Helvetica Neue', posterW - 200, 44, 28);
  ctx.font = `bold ${tagFit}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText(tagText.length > 60 ? tagText.substring(0, 57) + '…' : tagText, SIZE / 2, posterY + 980);

  // Font usage examples row
  const usages = ['LOGOS', 'BRANDING', 'PACKAGING', 'SOCIAL MEDIA'];
  const uW = 280, uH = 80, uGap = 20;
  const uTotal = usages.length * uW + (usages.length - 1) * uGap;
  let ux = (SIZE - uTotal) / 2;
  for (const usage of usages) {
    fillRoundRect(ctx, ux, posterY + 1080, uW, uH, 40, `${accentColor}22`);
    ctx.strokeStyle = `${accentColor}55`; ctx.lineWidth = 2;
    roundRect(ctx, ux, posterY + 1080, uW, uH, 40); ctx.stroke();
    ctx.font = 'bold 28px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = accentColor; ctx.textAlign = 'center';
    ctx.fillText(usage, ux + uW / 2, posterY + 1080 + 52);
    ux += uW + uGap;
  }

  // Bottom accent bar
  ctx.fillStyle = accentColor;
  ctx.fillRect(posterX, posterY + posterH - 12, posterW, 12);

  // Bottom caption
  ctx.font = 'bold 44px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = opts.bgStyle === 'dark' ? '#9090B8' : '#777788';
  ctx.textAlign = 'center';
  ctx.fillText('OTF · TTF · WOFF · Commercial License', SIZE / 2, 1870);
}

/** Thumbnail 5 — Apparel Mockup (hoodie / t-shirt print) */
export function drawFontApparel(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const accentColor = getAccentColor(opts.bgStyle);
  const flowerColor = getFlowerColor(opts.bgStyle);

  // Warm off-white background
  ctx.fillStyle = '#F8F4EF';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle texture dots
  drawDotGrid(ctx, 'rgba(0,0,0,0.04)', 50, 3);

  // ── HOODIE SILHOUETTE ──
  const hx = SIZE / 2, hy = 980;
  const hoodieFill = '#E8E0F0';
  const hoodieShadow = '#C8BBD8';

  // Hoodie body
  ctx.beginPath();
  ctx.moveTo(hx - 520, hy + 600);
  ctx.lineTo(hx - 560, hy - 200);
  ctx.lineTo(hx - 480, hy - 380);
  ctx.quadraticCurveTo(hx - 200, hy - 500, hx, hy - 460);
  ctx.quadraticCurveTo(hx + 200, hy - 500, hx + 480, hy - 380);
  ctx.lineTo(hx + 560, hy - 200);
  ctx.lineTo(hx + 520, hy + 600);
  ctx.closePath();
  ctx.fillStyle = hoodieFill;
  ctx.fill();

  // Hood shape
  ctx.beginPath();
  ctx.moveTo(hx - 480, hy - 380);
  ctx.quadraticCurveTo(hx - 260, hy - 620, hx - 80, hy - 640);
  ctx.quadraticCurveTo(hx, hy - 560, hx, hy - 460);
  ctx.quadraticCurveTo(hx, hy - 560, hx + 80, hy - 640);
  ctx.quadraticCurveTo(hx + 260, hy - 620, hx + 480, hy - 380);
  ctx.quadraticCurveTo(hx + 200, hy - 500, hx, hy - 460);
  ctx.quadraticCurveTo(hx - 200, hy - 500, hx - 480, hy - 380);
  ctx.closePath();
  ctx.fillStyle = hoodieShadow;
  ctx.fill();

  // Pocket
  ctx.fillStyle = hoodieShadow;
  roundRect(ctx, hx - 180, hy + 80, 360, 140, 20);
  ctx.fill();

  // ── FONT TEXT ON HOODIE ──
  const ff = opts.fontFamilyName || 'Georgia';
  const phrase = opts.previewPhrase || 'Create Something';
  const words = phrase.split(' ');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#2D1F3D';

  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    const fs1 = fitText(ctx, line1, ff, 800, 160, 60);
    const fs2 = fitText(ctx, line2, ff, 800, 160, 60);
    ctx.font = `bold ${fs1}px "${ff}", Georgia, serif`;
    ctx.fillText(line1, hx, hy - 100);
    ctx.font = `bold ${fs2}px "${ff}", Georgia, serif`;
    ctx.fillText(line2, hx, hy + 70);
  } else {
    const fs = fitText(ctx, phrase, ff, 900, 200, 70);
    ctx.font = `bold ${fs}px "${ff}", Georgia, serif`;
    ctx.fillText(phrase, hx, hy - 20);
  }

  // Little star accents on hoodie
  for (const [sx, sy] of [[hx - 220, hy - 160], [hx + 220, hy - 160]] as [number, number][]) {
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    for (let p = 0; p < 5; p++) {
      const a = (p * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = p % 2 === 0 ? 22 : 10;
      if (p === 0) ctx.moveTo(sx + r * Math.cos(a), sy + r * Math.sin(a));
      else ctx.lineTo(sx + r * Math.cos(a), sy + r * Math.sin(a));
    }
    ctx.closePath(); ctx.fill();
  }

  // ── TAGS / LABELS ──
  // Top label
  ctx.font = 'bold 58px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#443355';
  ctx.textAlign = 'center';
  ctx.fillText('PERFECT FOR', SIZE / 2, 120);

  // Decorative line
  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 200, 148, 400, 5);

  // Use-case pills
  const useCases = ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Tote Bags', 'Caps'];
  const pillW = 300, pillH = 76, pillGap = 24;
  const totalW = useCases.length * pillW + (useCases.length - 1) * pillGap;
  let px = (SIZE - totalW) / 2;
  for (const uc of useCases) {
    fillRoundRect(ctx, px, 180, pillW, pillH, 38, `${accentColor}22`);
    ctx.strokeStyle = accentColor; ctx.lineWidth = 2.5;
    roundRect(ctx, px, 180, pillW, pillH, 38); ctx.stroke();
    ctx.font = 'bold 36px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#443355'; ctx.textAlign = 'center';
    ctx.fillText(uc, px + pillW / 2, 180 + 50);
    px += pillW + pillGap;
  }

  // Bottom — font name
  ctx.font = `bold 72px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.fillText(opts.fontName || 'Font Name', SIZE / 2, 1840);

  // Decorative flowers
  drawPetal(ctx, 120, SIZE - 120, 80, flowerColor);
  drawPetal(ctx, SIZE - 120, SIZE - 120, 80, flowerColor);
}

/** Thumbnail 6 — Bags & Accessories Mockup (tote bag, mug, sticker) */
export function drawFontBagMockup(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const [c1, c2] = getBgColors(opts.bgStyle);
  const accentColor = getAccentColor(opts.bgStyle);
  const textColor = getTextColor(opts.bgStyle);
  const flowerColor = getFlowerColor(opts.bgStyle);

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SIZE, SIZE);

  drawDotGrid(ctx, `${accentColor}15`, 70, 3);

  const ff = opts.fontFamilyName || 'Georgia';
  const fontName = opts.fontName || 'Font Name';

  // ── BANNER ──
  ctx.font = 'bold 72px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText('FONT IN USE', SIZE / 2, 110);
  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 220, 132, 440, 6);

  // ── TOTE BAG (left, large) ──
  const bagX = 180, bagY = 250, bagW = 680, bagH = 820;
  ctx.save();
  ctx.shadowBlur = 40; ctx.shadowColor = 'rgba(0,0,0,0.2)';
  fillRoundRect(ctx, bagX, bagY, bagW, bagH, 30, opts.bgStyle === 'dark' ? '#2A2040' : '#FEFEFE');
  ctx.restore();
  ctx.strokeStyle = `${accentColor}55`; ctx.lineWidth = 3;
  roundRect(ctx, bagX, bagY, bagW, bagH, 30); ctx.stroke();

  // Bag handles
  ctx.strokeStyle = textColor; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bagX + 180, bagY); ctx.quadraticCurveTo(bagX + 180, bagY - 140, bagX + 280, bagY - 140);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bagX + 500, bagY); ctx.quadraticCurveTo(bagX + 500, bagY - 140, bagX + 400, bagY - 140);
  ctx.stroke();

  // Text on bag
  const bagPhrase = opts.previewPhrase || 'Create Something Beautiful';
  const words = bagPhrase.toUpperCase().split(' ');
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2D1F3D';
  const fs1 = fitText(ctx, line1, ff, bagW - 100, 130, 50);
  ctx.font = `bold ${fs1}px "${ff}", Georgia, serif`;
  ctx.fillText(line1, bagX + bagW / 2, bagY + 380);
  if (line2) {
    const fs2 = fitText(ctx, line2, ff, bagW - 100, 130, 50);
    ctx.font = `bold ${fs2}px "${ff}", Georgia, serif`;
    ctx.fillText(line2, bagX + bagW / 2, bagY + 540);
  }
  // Flower accent on bag
  drawPetal(ctx, bagX + 110, bagY + 130, 70, `${accentColor}88`);
  drawPetal(ctx, bagX + bagW - 110, bagY + bagH - 130, 70, `${accentColor}88`);

  // ── MUG (top right) ──
  const mugX = 1020, mugY = 260, mugW = 540, mugH = 440;
  ctx.save();
  ctx.shadowBlur = 30; ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(mugX + mugW / 2, mugY + mugH + 30, mugW / 2, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = `${accentColor}55`; ctx.fill();
  ctx.restore();

  ctx.fillStyle = opts.bgStyle === 'dark' ? '#2A2040' : '#FEFEFE';
  roundRect(ctx, mugX, mugY, mugW, mugH, 20); ctx.fill();
  ctx.strokeStyle = `${accentColor}44`; ctx.lineWidth = 3;
  roundRect(ctx, mugX, mugY, mugW, mugH, 20); ctx.stroke();

  // Mug handle
  ctx.strokeStyle = opts.bgStyle === 'dark' ? '#3A3055' : '#E0D8F0'; ctx.lineWidth = 30;
  ctx.beginPath();
  ctx.arc(mugX + mugW + 40, mugY + mugH / 2, 80, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  // Text on mug — short font name
  const mugText = fontName.split(' ')[0].toUpperCase();
  const mugFs = fitText(ctx, mugText, ff, mugW - 60, 120, 50);
  ctx.font = `bold ${mugFs}px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.fillText(mugText, mugX + mugW / 2, mugY + mugH / 2 + 30);

  ctx.font = '34px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = `${textColor}88`;
  ctx.fillText(opts.fontStyle || 'Script Font', mugX + mugW / 2, mugY + mugH - 50);

  // ── STICKER (bottom right) ──
  const stkX = 1060, stkY = 810, stkR = 280;
  ctx.save();
  ctx.shadowBlur = 30; ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.arc(stkX, stkY, stkR, 0, Math.PI * 2);
  ctx.fillStyle = opts.bgStyle === 'dark' ? '#2A2040' : '#FFFCF8'; ctx.fill();
  ctx.restore();

  ctx.strokeStyle = accentColor; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(stkX, stkY, stkR - 4, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = `${accentColor}55`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(stkX, stkY, stkR - 26, 0, Math.PI * 2); ctx.stroke();

  // Sticker text
  const stickerLine1 = opts.previewPhrase?.split(' ').slice(0, 2).join(' ') || 'Create';
  const stickerLine2 = opts.previewPhrase?.split(' ').slice(2).join(' ') || 'Something';
  const sfS1 = fitText(ctx, stickerLine1, ff, stkR * 1.4, 100, 40);
  ctx.font = `italic ${sfS1}px "${ff}", Georgia, serif`;
  ctx.fillStyle = textColor; ctx.textAlign = 'center';
  ctx.fillText(stickerLine1, stkX, stkY - 30);
  const sfS2 = fitText(ctx, stickerLine2, ff, stkR * 1.4, 90, 36);
  ctx.font = `italic ${sfS2}px "${ff}", Georgia, serif`;
  ctx.fillText(stickerLine2, stkX, stkY + 70);

  // ── LABEL TAGS ──
  const tags = [
    { label: '🎒 TOTE BAG', x: bagX + bagW / 2 - 60, y: bagY + bagH + 60 },
    { label: '☕ MUG', x: mugX + mugW / 2, y: mugY + mugH + 100 },
    { label: '🌟 STICKER', x: stkX, y: stkY + stkR + 70 },
  ];
  for (const t of tags) {
    ctx.font = 'bold 42px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = `${textColor}88`; ctx.textAlign = 'center';
    ctx.fillText(t.label, t.x, t.y);
  }

  // Bottom
  const bfs = fitText(ctx, `— ${fontName} —`, ff, SIZE - 200, 70, 30);
  ctx.font = `italic ${bfs}px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor; ctx.textAlign = 'center';
  ctx.fillText(`— ${fontName} —`, SIZE / 2, 1900);

  drawPetal(ctx, 90, SIZE - 90, 75, flowerColor);
  drawPetal(ctx, SIZE - 90, SIZE - 90, 75, flowerColor);
}

/** Thumbnail 7 — Signage & Branding (storefront, logo, package) */
export function drawFontSignage(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const accentColor = getAccentColor(opts.bgStyle);
  const flowerColor = getFlowerColor(opts.bgStyle);
  const ff = opts.fontFamilyName || 'Georgia';
  const fontName = opts.fontName || 'Font Name';

  // Dark elegant background
  const bgGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bgGrad.addColorStop(0, opts.bgStyle === 'dark' ? '#0F0A1A' : '#1C1228');
  bgGrad.addColorStop(1, opts.bgStyle === 'dark' ? '#1A0F2E' : '#2D1B45');
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, SIZE, SIZE);

  drawDotGrid(ctx, 'rgba(255,255,255,0.04)', 60, 2.5);

  // ── TOP HEADER ──
  ctx.font = 'bold 68px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('PROFESSIONAL BRANDING USE', SIZE / 2, 110);
  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 350, 135, 700, 5);

  // ── STOREFRONT SIGN (main center) ──
  const signX = 200, signY = 200, signW = 1600, signH = 480;
  ctx.save();
  ctx.shadowBlur = 60; ctx.shadowColor = accentColor + '66';
  fillRoundRect(ctx, signX, signY, signW, signH, 24, '#FEFCF8');
  ctx.restore();

  // Sign border
  ctx.strokeStyle = accentColor; ctx.lineWidth = 10;
  roundRect(ctx, signX + 16, signY + 16, signW - 32, signH - 32, 16); ctx.stroke();

  // Sign content
  const signName = fontName.toUpperCase();
  const signFs = fitText(ctx, signName, ff, signW - 160, 220, 80);
  ctx.font = `bold ${signFs}px "${ff}", Georgia, serif`;
  ctx.fillStyle = '#1C1228'; ctx.textAlign = 'center';
  ctx.fillText(signName, SIZE / 2, signY + 280);

  ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.fillText(opts.tagline?.substring(0, 45) || 'Premium Script Font', SIZE / 2, signY + 400);

  // Corner decorations on sign
  drawPetal(ctx, signX + 100, signY + 100, 70, `${accentColor}55`);
  drawPetal(ctx, signX + signW - 100, signY + 100, 70, `${accentColor}55`);
  drawPetal(ctx, signX + 100, signY + signH - 100, 70, `${accentColor}55`);
  drawPetal(ctx, signX + signW - 100, signY + signH - 100, 70, `${accentColor}55`);

  // ── LOGO MOCKUP (left) ──
  const logoX = 140, logoY = 760, logoW = 780, logoH = 600;
  fillRoundRect(ctx, logoX, logoY, logoW, logoH, 20, 'rgba(255,255,255,0.06)');
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
  roundRect(ctx, logoX, logoY, logoW, logoH, 20); ctx.stroke();

  ctx.font = '38px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.textAlign = 'center';
  ctx.fillText('LOGO / BRANDING', logoX + logoW / 2, logoY + 60);

  // Logo circle emblem
  ctx.beginPath();
  ctx.arc(logoX + logoW / 2, logoY + 240, 120, 0, Math.PI * 2);
  ctx.fillStyle = accentColor + '33'; ctx.fill();
  ctx.strokeStyle = accentColor; ctx.lineWidth = 3;
  ctx.stroke();

  const logoChar = fontName.charAt(0).toUpperCase();
  ctx.font = `bold 180px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor; ctx.textAlign = 'center';
  ctx.fillText(logoChar, logoX + logoW / 2, logoY + 300);

  const brandFs = fitText(ctx, fontName, ff, logoW - 80, 80, 30);
  ctx.font = `${brandFs}px "${ff}", Georgia, serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(fontName, logoX + logoW / 2, logoY + 440);

  ctx.font = '34px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(opts.fontStyle || 'Script Font', logoX + logoW / 2, logoY + 520);

  // ── LABEL / PACKAGING (right) ──
  const labX = 1080, labY = 760, labW = 780, labH = 600;
  fillRoundRect(ctx, labX, labY, labW, labH, 20, 'rgba(255,255,255,0.06)');
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2;
  roundRect(ctx, labX, labY, labW, labH, 20); ctx.stroke();

  ctx.font = '38px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.textAlign = 'center';
  ctx.fillText('PRODUCT LABEL', labX + labW / 2, labY + 60);

  // Label card
  ctx.save();
  ctx.shadowBlur = 30; ctx.shadowColor = 'rgba(0,0,0,0.4)';
  fillRoundRect(ctx, labX + 80, labY + 100, labW - 160, labH - 140, 16, '#FEFCF8');
  ctx.restore();

  ctx.fillStyle = accentColor;
  ctx.fillRect(labX + 80, labY + 100, labW - 160, 12);
  ctx.fillRect(labX + 80, labY + labH - 140 + 100 - 12, labW - 160, 12);

  const labBrand = fontName;
  const labBFs = fitText(ctx, labBrand, ff, labW - 260, 130, 50);
  ctx.font = `bold ${labBFs}px "${ff}", Georgia, serif`;
  ctx.fillStyle = '#1C1228'; ctx.textAlign = 'center';
  ctx.fillText(labBrand, labX + labW / 2, labY + 300);

  ctx.font = '36px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#555566';
  ctx.fillText(opts.fontStyle || 'Elegant Script', labX + labW / 2, labY + 380);
  ctx.fillStyle = accentColor;
  ctx.fillRect(labX + labW / 2 - 80, labY + 400, 160, 3);
  ctx.font = '32px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#888899';
  ctx.fillText(opts.tagline?.substring(0, 28) || 'Premium Quality', labX + labW / 2, labY + 460);

  // ── BOTTOM ITEMS: WEDDING / BUSINESS CARDS / CAFE SIGN ──
  const items = [
    { label: '🏪 STORE SIGN', ic: '◈' },
    { label: '💒 WEDDING', ic: '♡' },
    { label: '☕ CAFÉ', ic: '◎' },
    { label: '📦 PACKAGING', ic: '◇' },
  ];
  const iW = 380, iGap = 30;
  const iTotal = items.length * iW + (items.length - 1) * iGap;
  let ix = (SIZE - iTotal) / 2;
  for (const item of items) {
    fillRoundRect(ctx, ix, 1440, iW, 160, 16, 'rgba(255,255,255,0.08)');
    ctx.font = `bold 64px "${ff}", Georgia, serif`;
    ctx.fillStyle = accentColor; ctx.textAlign = 'center';
    ctx.fillText(item.ic, ix + iW / 2, 1535);
    ctx.font = '32px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(item.label, ix + iW / 2, 1575);
    ix += iW + iGap;
  }

  // Bottom bar
  ctx.font = `bold 60px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor; ctx.textAlign = 'center';
  ctx.fillText(`${fontName} — Professional Branding`, SIZE / 2, 1880);

  drawPetal(ctx, 100, SIZE - 100, 75, flowerColor + '88');
  drawPetal(ctx, SIZE - 100, SIZE - 100, 75, flowerColor + '88');
}

/** Thumbnail 8 — Website & Social Media Mockup */
export function drawFontWebsite(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const [c1, c2] = getBgColors(opts.bgStyle);
  const accentColor = getAccentColor(opts.bgStyle);
  const textColor = getTextColor(opts.bgStyle);
  const flowerColor = getFlowerColor(opts.bgStyle);
  const ff = opts.fontFamilyName || 'Georgia';
  const fontName = opts.fontName || 'Font Name';

  const bgGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bgGrad.addColorStop(0, c1); bgGrad.addColorStop(1, c2);
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, SIZE, SIZE);
  drawDotGrid(ctx, `${accentColor}12`, 65, 3);

  // ── HEADER ──
  ctx.font = 'bold 68px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = textColor; ctx.textAlign = 'center';
  ctx.fillText('DIGITAL & SOCIAL USE', SIZE / 2, 110);
  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 280, 136, 560, 5);

  // ── WEBSITE BROWSER MOCKUP ──
  const bX = 140, bY = 180, bW = 1720, bH = 600;
  ctx.save();
  ctx.shadowBlur = 50; ctx.shadowColor = 'rgba(0,0,0,0.25)';
  fillRoundRect(ctx, bX, bY, bW, bH, 20, opts.bgStyle === 'dark' ? '#1E1530' : '#FFFFFF');
  ctx.restore();

  // Browser chrome
  fillRoundRect(ctx, bX, bY, bW, 70, 12, opts.bgStyle === 'dark' ? '#2A1F40' : '#F0EBF8');
  // Traffic lights
  for (const [bclr, boff] of [['#FF5F57', 50], ['#FEBC2E', 110], ['#28C840', 170]] as [string, number][]) {
    ctx.beginPath(); ctx.arc(bX + (boff as number), bY + 35, 16, 0, Math.PI * 2);
    ctx.fillStyle = bclr; ctx.fill();
  }
  // URL bar
  fillRoundRect(ctx, bX + 220, bY + 12, bW - 280, 46, 8, opts.bgStyle === 'dark' ? '#3A2A55' : '#E8E0F8');
  ctx.font = '32px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = `${textColor}88`; ctx.textAlign = 'left';
  ctx.fillText(`www.${fontName.toLowerCase().replace(/\s/g, '')}font.com`, bX + 260, bY + 44);

  // Website hero content
  const heroFont = fitText(ctx, fontName, ff, bW - 200, 240, 80);
  ctx.font = `bold ${heroFont}px "${ff}", Georgia, serif`;
  ctx.fillStyle = textColor; ctx.textAlign = 'center';
  ctx.fillText(fontName, bX + bW / 2, bY + 330);

  ctx.font = '44px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.fillText(opts.tagline?.substring(0, 55) || 'A beautiful script font', bX + bW / 2, bY + 420);

  // CTA button
  fillRoundRect(ctx, bX + bW / 2 - 180, bY + 460, 360, 90, 45, accentColor);
  ctx.font = 'bold 40px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center';
  ctx.fillText('Download Now', bX + bW / 2, bY + 516);

  // ── 3 SOCIAL POSTS (Instagram mockups) ──
  const posts = [
    { ph: opts.previewPhrase || 'Create Something Beautiful', caption: `New Font Drop 🔥\n${fontName}` },
    { ph: opts.fontName || 'Aesthetic', caption: `Perfect for\nbusiness logos ✨` },
    { ph: opts.tagline?.split(' ').slice(0, 4).join(' ') || 'Elegant Script', caption: `Now available\non #Etsy 🛒` },
  ];

  const postW = 520, postH = 540, postGap = 50;
  const postTotalW = posts.length * postW + (posts.length - 1) * postGap;
  let postX = (SIZE - postTotalW) / 2;
  const postY = 840;

  for (const post of posts) {
    // Card shadow
    ctx.save();
    ctx.shadowBlur = 30; ctx.shadowColor = 'rgba(0,0,0,0.2)';
    fillRoundRect(ctx, postX, postY, postW, postH, 16, opts.bgStyle === 'dark' ? '#1E1530' : '#FFFFFF');
    ctx.restore();

    // Instagram top bar
    fillRoundRect(ctx, postX, postY, postW, 60, 8, opts.bgStyle === 'dark' ? '#2A1F40' : '#F8F4FF');
    ctx.beginPath(); ctx.arc(postX + 36, postY + 30, 22, 0, Math.PI * 2);
    ctx.fillStyle = accentColor; ctx.fill();
    ctx.font = 'bold 26px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = textColor; ctx.textAlign = 'left';
    ctx.fillText('fontshop', postX + 70, postY + 38);
    ctx.font = '22px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = `${textColor}66`;
    ctx.fillText('Just now', postX + postW - 120, postY + 38);

    // Post image area — gradient background with font text
    const imgGrad = ctx.createLinearGradient(postX, postY + 60, postX + postW, postY + 340);
    imgGrad.addColorStop(0, c1); imgGrad.addColorStop(1, c2);
    ctx.fillStyle = imgGrad;
    ctx.fillRect(postX, postY + 60, postW, 280);

    const pfs = fitText(ctx, post.ph, ff, postW - 60, 110, 40);
    ctx.font = `bold ${pfs}px "${ff}", Georgia, serif`;
    ctx.fillStyle = textColor; ctx.textAlign = 'center';
    ctx.fillText(post.ph.length > 20 ? post.ph.substring(0, 18) + '…' : post.ph, postX + postW / 2, postY + 210);

    // Like/comment bar
    fillRoundRect(ctx, postX, postY + 340, postW, 50, 4, opts.bgStyle === 'dark' ? '#2A1F40' : '#F5F0FF');
    ctx.font = 'bold 26px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = accentColor; ctx.textAlign = 'left';
    ctx.fillText('♥  348   💬  27   ➤', postX + 20, postY + 373);

    // Caption
    const capLines = post.caption.split('\n');
    ctx.font = '28px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = textColor;
    for (let ci = 0; ci < capLines.length; ci++) {
      ctx.fillText(capLines[ci], postX + 20, postY + 420 + ci * 44);
    }

    postX += postW + postGap;
  }

  // ── BOTTOM USE CASES ──
  const webUsages = ['📱 Mobile App', '🌐 Website Hero', '📸 Instagram', '📧 Email Header', '🎬 YouTube'];
  const wuW = 320, wuGap = 22;
  const wuTotal = webUsages.length * wuW + (webUsages.length - 1) * wuGap;
  let wux = (SIZE - wuTotal) / 2;
  for (const wu of webUsages) {
    fillRoundRect(ctx, wux, 1440, wuW, 90, 45, `${accentColor}22`);
    ctx.strokeStyle = `${accentColor}66`; ctx.lineWidth = 2;
    roundRect(ctx, wux, 1440, wuW, 90, 45); ctx.stroke();
    ctx.font = 'bold 30px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = textColor; ctx.textAlign = 'center';
    ctx.fillText(wu, wux + wuW / 2, 1493);
    wux += wuW + wuGap;
  }

  // Bottom font name
  const bfs = fitText(ctx, fontName, ff, SIZE - 300, 90, 36);
  ctx.font = `bold ${bfs}px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor; ctx.textAlign = 'center';
  ctx.fillText(fontName, SIZE / 2, 1870);

  ctx.font = '40px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = `${textColor}66`;
  ctx.fillText('Commercial License · OTF · TTF · WOFF', SIZE / 2, 1930);

  drawPetal(ctx, 100, SIZE - 60, 70, flowerColor);
  drawPetal(ctx, SIZE - 100, SIZE - 60, 70, flowerColor);
}

/** Thumbnail 9 — Font Benefits / Why Choose This Font */
export function drawFontBenefits(canvas: HTMLCanvasElement, opts: FontMetadata) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE; canvas.height = SIZE;
  const accentColor = getAccentColor(opts.bgStyle);
  const flowerColor = getFlowerColor(opts.bgStyle);
  const ff = opts.fontFamilyName || 'Georgia';
  const fontName = opts.fontName || 'Font Name';

  // Dark premium background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, SIZE);
  bgGrad.addColorStop(0, opts.bgStyle === 'dark' ? '#0A0614' : '#1A1028');
  bgGrad.addColorStop(0.5, opts.bgStyle === 'dark' ? '#150E25' : '#221538');
  bgGrad.addColorStop(1, opts.bgStyle === 'dark' ? '#0A0614' : '#1A1028');
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, SIZE, SIZE);
  drawDotGrid(ctx, 'rgba(255,255,255,0.03)', 55, 2.5);

  // Glow effect behind center
  const glow = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, 700);
  glow.addColorStop(0, `${accentColor}22`); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, SIZE, SIZE);

  // ── HEADER ──
  ctx.font = 'bold 78px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center';
  ctx.fillText('WHY CHOOSE THIS FONT?', SIZE / 2, 140);
  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 400, 170, 800, 6);

  // ── LARGE FONT NAME DISPLAY ──
  const dispFs = fitText(ctx, fontName, ff, SIZE - 200, 260, 90);
  ctx.font = `bold ${dispFs}px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor; ctx.textAlign = 'center';
  ctx.save();
  ctx.shadowBlur = 50; ctx.shadowColor = accentColor + '88';
  ctx.fillText(fontName, SIZE / 2, 500);
  ctx.restore();

  ctx.font = `italic 70px "${ff}", Georgia, serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(opts.previewPhrase || 'Create something beautiful', SIZE / 2, 600);

  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 250, 636, 500, 4);

  // ── BENEFITS GRID (2×3 grid of hexagon-style cards) ──
  const benefits = [
    { icon: '✦', title: 'Commercial License', desc: 'Use freely in client work & products for sale' },
    { icon: '◈', title: 'Multi-Format', desc: 'OTF, TTF & WOFF files included for all apps' },
    { icon: '✿', title: 'Elegant Script', desc: 'Hand-crafted curves with natural flow' },
    { icon: '◎', title: 'Wide Language', desc: 'Extended Latin characters & accents' },
    { icon: '♡', title: 'Perfect Pairing', desc: 'Pairs beautifully with sans-serif fonts' },
    { icon: '★', title: 'Instant Download', desc: 'Ready to use immediately after purchase' },
  ];

  const cols = 3, rows = 2;
  const cardW = 580, cardH = 280, cardGapX = 40, cardGapY = 36;
  const gridW = cols * cardW + (cols - 1) * cardGapX;
  const gridH = rows * cardH + (rows - 1) * cardGapY;
  const gridX = (SIZE - gridW) / 2;
  const gridY = 700;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const b = benefits[r * cols + c];
      if (!b) continue;
      const cx = gridX + c * (cardW + cardGapX);
      const cy = gridY + r * (cardH + cardGapY);

      // Card
      ctx.save();
      ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.4)';
      fillRoundRect(ctx, cx, cy, cardW, cardH, 20, 'rgba(255,255,255,0.06)');
      ctx.restore();
      ctx.strokeStyle = `${accentColor}55`; ctx.lineWidth = 2;
      roundRect(ctx, cx, cy, cardW, cardH, 20); ctx.stroke();

      // Left accent bar
      ctx.fillStyle = accentColor;
      fillRoundRect(ctx, cx, cy + 30, 8, cardH - 60, 4, accentColor);

      // Icon
      ctx.font = `bold 80px "${ff}", Georgia, serif`;
      ctx.fillStyle = accentColor; ctx.textAlign = 'left';
      ctx.fillText(b.icon, cx + 40, cy + 118);

      // Title
      ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(b.title, cx + 150, cy + 100);

      // Desc
      ctx.font = '36px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      const dfs = fitText(ctx, b.desc, 'Helvetica Neue', cardW - 170, 36, 24);
      ctx.font = `${dfs}px "Helvetica Neue", Arial, sans-serif`;
      drawWrappedText(ctx, b.desc, cx + 150, cy + 155, cardW - 180, dfs * 1.35);
    }
  }

  // ── COMPATIBILITY ROW ──
  const apps = ['Adobe Illustrator', 'Photoshop', 'Canva', 'Procreate', 'Word', 'Cricut / Silhouette'];
  const appW = 290, appH = 72, appGapX = 24;
  const appTotal = apps.length * appW + (apps.length - 1) * appGapX;
  let appX = (SIZE - appTotal) / 2;
  const appY = 1720;

  ctx.font = 'bold 44px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.textAlign = 'center';
  ctx.fillText('WORKS WITH', SIZE / 2, appY - 30);

  for (const app of apps) {
    fillRoundRect(ctx, appX, appY, appW, appH, 36, 'rgba(255,255,255,0.08)');
    ctx.strokeStyle = `${accentColor}44`; ctx.lineWidth = 1.5;
    roundRect(ctx, appX, appY, appW, appH, 36); ctx.stroke();
    ctx.font = 'bold 28px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'center';
    ctx.fillText(app, appX + appW / 2, appY + 48);
    appX += appW + appGapX;
  }

  // ── BOTTOM ──
  ctx.font = `italic 56px "${ff}", Georgia, serif`;
  ctx.fillStyle = accentColor; ctx.textAlign = 'center';
  ctx.fillText(`${fontName} — Available on Etsy`, SIZE / 2, 1900);

  drawPetal(ctx, 110, SIZE - 90, 75, flowerColor + 'aa');
  drawPetal(ctx, SIZE - 110, SIZE - 90, 75, flowerColor + 'aa');
}
