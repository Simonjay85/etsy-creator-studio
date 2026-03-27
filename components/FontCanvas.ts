'use client';

export type ThumbStyle = 'intro' | 'charsheet' | 'quote' | 'info';

interface FontCanvasOptions {
  fontName: string;
  fontStyle: string;
  quoteText: string;
  bgStyle: 'pastel-pink' | 'cream' | 'dark' | 'pastel-green' | 'pastel-blue';
  fontFamilyName: string;
}

const SIZE = 2000;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function drawPetal(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const count = 5;
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(angle) * size * 0.5;
    const py = cy + Math.sin(angle) * size * 0.5;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.38, size * 0.22, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE4DD';
  ctx.fill();
}

function drawArcText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, radius: number, startAngle: number) {
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

function getBgColors(bgStyle: FontCanvasOptions['bgStyle']): [string, string] {
  switch (bgStyle) {
    case 'pastel-pink': return ['#FDE8EE', '#FFF4F7'];
    case 'cream': return ['#FFF8EE', '#FFFDF5'];
    case 'dark': return ['#1A1225', '#0F0A1A'];
    case 'pastel-green': return ['#E8F8F0', '#F4FFF8'];
    case 'pastel-blue': return ['#E8EEF8', '#F4F8FF'];
    default: return ['#FDE8EE', '#FFF4F7'];
  }
}

function getTextColor(bgStyle: FontCanvasOptions['bgStyle']): string {
  return bgStyle === 'dark' ? '#F5F0FF' : '#1A1225';
}

function getAccentColor(bgStyle: FontCanvasOptions['bgStyle']): string {
  switch (bgStyle) {
    case 'pastel-pink': return '#D4559E';
    case 'cream': return '#C47830';
    case 'dark': return '#C084FC';
    case 'pastel-green': return '#278A5B';
    case 'pastel-blue': return '#3D72C4';
    default: return '#D4559E';
  }
}

function getFlowerColor(bgStyle: FontCanvasOptions['bgStyle']): string {
  switch (bgStyle) {
    case 'pastel-pink': return '#F4AECB';
    case 'cream': return '#F4D4AE';
    case 'dark': return '#8844CC';
    case 'pastel-green': return '#7ED4A8';
    case 'pastel-blue': return '#7EAED4';
    default: return '#F4AECB';
  }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, fontFamily: string, maxWidth: number, maxFontSize: number, minFontSize = 40): number {
  let size = maxFontSize;
  while (size > minFontSize) {
    ctx.font = `bold ${size}px "${fontFamily}", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 10;
  }
  return size;
}

export function drawIntroThumbnail(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE;
  canvas.height = SIZE;
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

  // Flowers (corners)
  drawPetal(ctx, 160, 160, 110, flowerColor);
  drawPetal(ctx, SIZE - 160, 160, 110, flowerColor);
  drawPetal(ctx, 160, SIZE - 160, 110, flowerColor);
  drawPetal(ctx, SIZE - 160, SIZE - 160, 110, flowerColor);

  // Small accent dots
  ctx.fillStyle = `${accentColor}33`;
  const dots = [[400, 120], [1600, 280], [280, 1700], [1720, 1600]];
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Circular "INTRODUCING" text
  drawArcText(ctx, 'INTRODUCING', 440, 600, 310, -Math.PI * 0.85);

  // White card in center
  ctx.save();
  ctx.shadowBlur = 60;
  ctx.shadowColor = 'rgba(0,0,0,0.14)';
  ctx.shadowOffsetY = 15;
  ctx.fillStyle = opts.bgStyle === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)';
  roundRect(ctx, 160, 580, SIZE - 320, 820, 60);
  ctx.fill();
  ctx.restore();

  // Font name — auto-fit
  const displayName = opts.fontName.toUpperCase() || 'FONT NAME';
  const lines = displayName.split('\n');
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;

  if (lines.length === 1) {
    const fontSize = fitText(ctx, displayName, opts.fontFamilyName, SIZE - 400, 340);
    ctx.font = `bold ${fontSize}px "${opts.fontFamilyName}", Arial, sans-serif`;
    ctx.fillText(displayName, SIZE / 2, 1010);
  } else {
    let y = 850;
    for (const line of lines) {
      const fontSize = fitText(ctx, line, opts.fontFamilyName, SIZE - 400, 280);
      ctx.font = `bold ${fontSize}px "${opts.fontFamilyName}", Arial, sans-serif`;
      ctx.fillText(line, SIZE / 2, y);
      y += fontSize + 30;
    }
  }

  // Subtitle
  ctx.font = 'bold 65px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.letterSpacing = '8px';
  ctx.textAlign = 'center';
  const subtitle = opts.fontStyle ? `A ${opts.fontStyle.toUpperCase()} FONT` : 'A DISPLAY FONT';
  ctx.fillText(subtitle, SIZE / 2, 1500);

  // Bottom credit line
  ctx.font = '38px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = `${textColor}55`;
  ctx.fillText('Commercial License Included · Instant Download', SIZE / 2, 1820);
}

export function drawCharSheetThumbnail(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE;
  canvas.height = SIZE;
  const [c1, c2] = getBgColors(opts.bgStyle === 'dark' ? 'cream' : opts.bgStyle);
  const textColor = getTextColor('cream');
  const accentColor = getAccentColor(opts.bgStyle);

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Title
  ctx.textAlign = 'center';
  ctx.font = 'bold 80px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = textColor;
  ctx.fillText('All Characters', SIZE / 2, 120);

  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 150, 140, 300, 5);

  const fontFamily = `"${opts.fontFamilyName}", Arial, sans-serif`;

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
    const m = ctx.measureText(row.text);
    if (m.width > SIZE - 120) {
      ctx.font = `${row.size * 0.75}px ${fontFamily}`;
    }
    ctx.fillText(row.text, SIZE / 2, row.y);
  }

  // Sample phrase
  ctx.fillStyle = `${textColor}44`;
  ctx.fillRect(80, 1260, SIZE - 160, 2);

  ctx.font = `bold 160px ${fontFamily}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  const sample = opts.fontName || 'Sample Text';
  const sampleFit = fitText(ctx, sample, opts.fontFamilyName, SIZE - 160, 160, 60);
  ctx.font = `bold ${sampleFit}px ${fontFamily}`;
  ctx.fillText(sample, SIZE / 2, 1500);

  // Uppercase showcase
  const upper = (opts.fontName || 'ABCDE').toUpperCase();
  ctx.font = `130px ${fontFamily}`;
  ctx.fillStyle = accentColor;
  const upperFit = fitText(ctx, upper, opts.fontFamilyName, SIZE - 160, 130, 50);
  ctx.font = `${upperFit}px ${fontFamily}`;
  ctx.fillText(upper, SIZE / 2, 1700);

  // Footer
  ctx.font = '45px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = `${textColor}66`;
  ctx.textAlign = 'center';
  ctx.fillText(`${opts.fontName} · OTF & TTF included · Commercial License`, SIZE / 2, 1880);
}

export function drawQuoteThumbnail(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE;
  canvas.height = SIZE;
  const [c1, c2] = getBgColors(opts.bgStyle);
  const textColor = getTextColor(opts.bgStyle);
  const accentColor = getAccentColor(opts.bgStyle);

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle dot pattern
  ctx.fillStyle = `${accentColor}18`;
  for (let x = 60; x < SIZE; x += 80) {
    for (let y = 60; y < SIZE; y += 80) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Quote text
  const rawQuote = opts.quoteText || 'YOU ARE MADE OF MAGIC';
  const words = rawQuote.toUpperCase().split(' ');

  // Smart line breaking for canvas
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    ctx.font = `bold 240px "${opts.fontFamilyName}", Arial, sans-serif`;
    if (ctx.measureText(test).width > SIZE - 200) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  // Choose font size based on line count
  const maxFontSize = lines.length <= 2 ? 300 : lines.length <= 3 ? 240 : 190;
  let fontSize = maxFontSize;
  for (const line of lines) {
    ctx.font = `bold ${fontSize}px "${opts.fontFamilyName}", Arial, sans-serif`;
    while (ctx.measureText(line).width > SIZE - 160 && fontSize > 80) fontSize -= 8;
  }

  const lineHeight = fontSize * 1.1;
  const totalHeight = lines.length * lineHeight;
  let y = (SIZE - totalHeight) / 2 + fontSize * 0.85;

  ctx.textAlign = 'center';

  for (const line of lines) {
    ctx.save();
    if (opts.bgStyle === 'dark') {
      // Glow on dark bg
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 40;
    } else {
      // Shadow for light bgs
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
    }
    ctx.font = `bold ${fontSize}px "${opts.fontFamilyName}", Arial, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.fillText(line, SIZE / 2, y);
    ctx.restore();
    y += lineHeight;
  }

  // Font name label at bottom
  ctx.font = 'bold 55px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.textAlign = 'center';
  ctx.fillText(`— ${opts.fontName} Font —`, SIZE / 2, SIZE - 100);
}

export function drawInfoThumbnail(canvas: HTMLCanvasElement, opts: FontCanvasOptions) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = SIZE;
  canvas.height = SIZE;

  // Dark gradient for info slide
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, '#1A0E2E');
  grad.addColorStop(1, '#0D0A1E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Grid background lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < SIZE; x += 100) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SIZE); ctx.stroke();
  }
  for (let y = 0; y < SIZE; y += 100) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SIZE, y); ctx.stroke();
  }

  // Purple glow circle
  const glow = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, 700);
  glow.addColorStop(0, 'rgba(192,132,252,0.2)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const accentColor = '#C084FC';

  // Font name header
  ctx.textAlign = 'center';
  ctx.font = `bold 80px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(opts.fontName || 'Font Name', SIZE / 2, 160);

  ctx.font = 'bold 45px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.fillText('WHAT\'S INCLUDED', SIZE / 2, 280);

  ctx.fillStyle = accentColor;
  ctx.fillRect(SIZE / 2 - 200, 305, 400, 4);

  // Sample font display
  ctx.font = `bold 200px "${opts.fontFamilyName}", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.textAlign = 'center';
  const displayText = opts.fontName?.toUpperCase() || 'Aa';
  const displayFit = fitText(ctx, displayText, opts.fontFamilyName, SIZE - 200, 200, 60);
  ctx.font = `bold ${displayFit}px "${opts.fontFamilyName}", Arial, sans-serif`;
  ctx.fillText(displayText, SIZE / 2, 600);

  // Feature boxes
  const features = [
    { icon: '📁', title: 'OTF File', desc: 'OpenType Format' },
    { icon: '📁', title: 'TTF File', desc: 'TrueType Format' },
    { icon: '🌐', title: 'WOFF/WOFF2', desc: 'Web Font Formats' },
    { icon: '📄', title: 'License', desc: 'Commercial Use OK' },
    { icon: '📦', title: 'ZIP Bundle', desc: 'All Files Included' },
    { icon: '♾️', title: 'Lifetime', desc: 'Instant Download' },
  ];

  const cols = 3;
  const boxW = 520;
  const boxH = 180;
  const gapX = 60;
  const gapY = 40;
  const startX = (SIZE - (cols * boxW + (cols - 1) * gapX)) / 2;
  const startY = 700;

  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = startX + col * (boxW + gapX);
    const by = startY + row * (boxH + gapY);

    // Box bg
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeStyle = 'rgba(192,132,252,0.25)';
    ctx.lineWidth = 2;
    roundRect(ctx, bx, by, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Icon
    ctx.font = '60px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(f.icon, bx + 24, by + 68);

    ctx.font = 'bold 42px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(f.title, bx + 100, by + 65);

    ctx.font = '32px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(f.desc, bx + 100, by + 110);
  }

  // Compatibility note
  ctx.font = 'bold 48px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('Compatible with all design software', SIZE / 2, 1830);

  ctx.font = '36px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('Illustrator · Photoshop · Canva · Cricut · Silhouette', SIZE / 2, 1900);
}
