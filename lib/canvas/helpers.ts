// Reusable canvas drawing helpers

export const SIZE = 2000;

/**
 * Draw a rounded rectangle path (does not fill/stroke — caller must do that)
 */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
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

/**
 * Fill a rounded rectangle directly
 */
export function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
  fillStyle: string
) {
  ctx.fillStyle = fillStyle;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

/**
 * Wrap text to multiple lines within maxWidth, return array of lines
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Draw wrapped text, returns final y position after last line
 */
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = wrapText(ctx, text, maxWidth);
  let curY = y;
  for (const line of lines) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

/**
 * Fit text font size so it fits in maxWidth
 */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize = 40,
  weight = 'bold'
): number {
  let size = maxFontSize;
  while (size > minFontSize) {
    ctx.font = `${weight} ${size}px "${fontFamily}", Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 8;
  }
  return size;
}

/**
 * Draw a pill-shaped badge with text
 */
export function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  bgColor: string,
  textColor: string,
  fontSize = 34,
  borderColor?: string
) {
  fillRoundRect(ctx, x, y, width, height, height / 2, bgColor);
  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, width, height, height / 2);
    ctx.stroke();
  }
  ctx.font = `bold ${fontSize}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(text, x + width / 2, y + height / 2 + fontSize * 0.36);
}

/**
 * Draw a decorative petal flower
 */
export function drawPetal(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  color: string
) {
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

/**
 * Draw subtle dot grid background
 */
export function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  color: string,
  spacing = 80,
  dotSize = 3
) {
  ctx.fillStyle = color;
  for (let x = spacing / 2; x < SIZE; x += spacing) {
    for (let y = spacing / 2; y < SIZE; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Get background color pair for a bgStyle
 */
export function getBgColors(bgStyle: string): [string, string] {
  switch (bgStyle) {
    case 'pastel-pink':  return ['#FDE8EE', '#FFF4F7'];
    case 'cream':        return ['#FFF8EE', '#FFFDF5'];
    case 'dark':         return ['#1A1225', '#0F0A1A'];
    case 'pastel-green': return ['#E8F8F0', '#F4FFF8'];
    case 'pastel-blue':  return ['#E8EEF8', '#F4F8FF'];
    default:             return ['#FDE8EE', '#FFF4F7'];
  }
}

export function getTextColor(bgStyle: string): string {
  return bgStyle === 'dark' ? '#F5F0FF' : '#1A1225';
}

export function getAccentColor(bgStyle: string): string {
  switch (bgStyle) {
    case 'pastel-pink':  return '#D4559E';
    case 'cream':        return '#C47830';
    case 'dark':         return '#C084FC';
    case 'pastel-green': return '#278A5B';
    case 'pastel-blue':  return '#3D72C4';
    default:             return '#D4559E';
  }
}

export function getFlowerColor(bgStyle: string): string {
  switch (bgStyle) {
    case 'pastel-pink':  return '#F4AECB';
    case 'cream':        return '#F4D4AE';
    case 'dark':         return '#8844CC';
    case 'pastel-green': return '#7ED4A8';
    case 'pastel-blue':  return '#7EAED4';
    default:             return '#F4AECB';
  }
}
