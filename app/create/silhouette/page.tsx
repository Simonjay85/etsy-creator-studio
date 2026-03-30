'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { Upload, Download, Sparkles, Copy, Check, X, Layers, Plus, Trash2 } from 'lucide-react';

interface SeoResult { title: string; description: string; tags: string[]; }

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

// Draw a simple silhouette shape on canvas
function drawSilhouette(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(x, y);
  const sx = w / 100, sy = h / 100;
  ctx.scale(sx, sy);

  switch (type) {
    case 'bird': {
      ctx.beginPath(); ctx.ellipse(50,60,20,12,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(38,50,8,5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(50,50); ctx.bezierCurveTo(30,30,10,40,5,55); ctx.bezierCurveTo(20,45,35,48,50,50); ctx.fill();
      ctx.beginPath(); ctx.moveTo(50,50); ctx.bezierCurveTo(70,30,90,40,95,55); ctx.bezierCurveTo(80,45,65,48,50,50); ctx.fill();
      break;
    }
    case 'tree': {
      ctx.beginPath(); ctx.moveTo(50,5); ctx.lineTo(90,70); ctx.lineTo(65,70); ctx.lineTo(65,95); ctx.lineTo(35,95); ctx.lineTo(35,70); ctx.lineTo(10,70); ctx.closePath(); ctx.fill();
      break;
    }
    case 'butterfly': {
      ctx.beginPath(); ctx.ellipse(30,42,28,20,Math.PI*0.3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(70,42,28,20,-Math.PI*0.3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(30,62,18,14,Math.PI*0.15,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(70,62,18,14,-Math.PI*0.15,0,Math.PI*2); ctx.fill();
      ctx.fillRect(47,30,6,45);
      break;
    }
    case 'flower': {
      for(let i=0;i<6;i++){ctx.save();ctx.translate(50,50);ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.ellipse(0,-24,10,18,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      ctx.beginPath();ctx.arc(50,50,14,0,Math.PI*2);ctx.fill();
      break;
    }
    case 'deer': {
      ctx.beginPath();ctx.ellipse(50,70,18,24,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(50,40,12,16,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(50,28,8,9,0,0,Math.PI*2);ctx.fill();
      // Antlers
      ctx.lineWidth=4/sx; ctx.strokeStyle=color; ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(44,22);ctx.lineTo(30,5);ctx.moveTo(30,5);ctx.lineTo(22,12);ctx.moveTo(30,5);ctx.lineTo(35,12);ctx.stroke();
      ctx.beginPath();ctx.moveTo(56,22);ctx.lineTo(70,5);ctx.moveTo(70,5);ctx.lineTo(78,12);ctx.moveTo(70,5);ctx.lineTo(65,12);ctx.stroke();
      ctx.fillRect(40,86,8,14);ctx.fillRect(52,86,8,14);
      break;
    }
    case 'cat': {
      ctx.beginPath();ctx.ellipse(50,65,22,18,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(50,38,16,18,0,0,Math.PI*2);ctx.fill();
      // Ears
      ctx.beginPath();ctx.moveTo(36,24);ctx.lineTo(30,10);ctx.lineTo(44,20);ctx.fill();
      ctx.beginPath();ctx.moveTo(64,24);ctx.lineTo(70,10);ctx.lineTo(56,20);ctx.fill();
      // Tail
      ctx.beginPath();ctx.moveTo(72,70);ctx.bezierCurveTo(90,60,95,40,80,30);ctx.lineWidth=6/sx;ctx.strokeStyle=color;ctx.stroke();
      ctx.fillRect(40,82,8,14);ctx.fillRect(52,82,8,14);
      break;
    }
    case 'heart': {
      ctx.beginPath();
      ctx.moveTo(50,30);
      ctx.bezierCurveTo(50,22,38,15,28,25);
      ctx.bezierCurveTo(15,35,15,52,50,75);
      ctx.bezierCurveTo(85,52,85,35,72,25);
      ctx.bezierCurveTo(62,15,50,22,50,30);
      ctx.fill();
      break;
    }
    case 'crown': {
      ctx.beginPath();
      ctx.moveTo(8,75); ctx.lineTo(8,35); ctx.lineTo(25,55); ctx.lineTo(50,20);
      ctx.lineTo(75,55); ctx.lineTo(92,35); ctx.lineTo(92,75); ctx.closePath(); ctx.fill();
      // Gems
      ctx.beginPath();ctx.arc(50,20,6,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(25,55,5,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(75,55,5,0,Math.PI*2);ctx.fill();
      break;
    }
    case 'rose': {
      // Petals
      for(let i=0;i<5;i++){ctx.save();ctx.translate(50,45);ctx.rotate(i*Math.PI*2/5);ctx.beginPath();ctx.ellipse(0,-18,9,15,0,0,Math.PI*2);ctx.fill();ctx.restore();}
      ctx.beginPath();ctx.arc(50,45,13,0,Math.PI*2);ctx.fill();
      // Stem
      ctx.lineWidth=5/sx;ctx.strokeStyle=color;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(50,58);ctx.bezierCurveTo(55,72,45,80,48,95);ctx.stroke();
      // Leaf
      ctx.beginPath();ctx.ellipse(40,76,10,6,Math.PI*0.4,0,Math.PI*2);ctx.fill();
      break;
    }
    case 'pumpkin': {
      ctx.beginPath();ctx.ellipse(50,62,22,22,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(30,62,14,20,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(70,62,14,20,0,0,Math.PI*2);ctx.fill();
      // Stem
      ctx.fillRect(46,36,8,12);
      // Leaf
      ctx.beginPath();ctx.ellipse(38,36,10,6,Math.PI*0.3,0,Math.PI*2);ctx.fill();
      // Face
      const bg2='rgba(255,255,255,0.0)';
      ctx.fillStyle=bg2;
      break;
    }
    case 'skull': {
      ctx.beginPath();ctx.arc(50,42,28,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(22,68);ctx.lineTo(22,58);ctx.lineTo(78,58);ctx.lineTo(78,68);ctx.closePath();ctx.fill();
      // Teeth
      for(let i=0;i<4;i++){ctx.clearRect(22+i*14+2,62,12,8);}
      // Jaw
      ctx.beginPath();ctx.arc(50,72,28,0,Math.PI);ctx.fill();
      break;
    }
    case 'dragonfly': {
      // Wings
      ctx.beginPath();ctx.ellipse(30,45,24,10,Math.PI*0.2,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(70,45,24,10,-Math.PI*0.2,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(28,62,18,8,Math.PI*0.3,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(72,62,18,8,-Math.PI*0.3,0,Math.PI*2);ctx.fill();
      // Body
      ctx.beginPath();ctx.ellipse(50,30,6,14,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(50,55,4,18,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(50,78,3,8,0,0,Math.PI*2);ctx.fill();
      break;
    }
    case 'angel': {
      // Wings
      ctx.beginPath();ctx.ellipse(22,55,20,28,Math.PI*0.2,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(78,55,20,28,-Math.PI*0.2,0,Math.PI*2);ctx.fill();
      // Body
      ctx.beginPath();ctx.moveTo(34,72);ctx.lineTo(66,72);ctx.lineTo(60,95);ctx.lineTo(40,95);ctx.closePath();ctx.fill();
      // Head
      ctx.beginPath();ctx.arc(50,48,15,0,Math.PI*2);ctx.fill();
      // Halo
      ctx.lineWidth=4/sx;ctx.strokeStyle=color;
      ctx.beginPath();ctx.ellipse(50,30,14,5,0,0,Math.PI*2);ctx.stroke();
      break;
    }
    case 'witch': {
      // Hat
      ctx.beginPath();ctx.moveTo(20,55);ctx.lineTo(80,55);ctx.lineTo(65,22);ctx.lineTo(35,22);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.ellipse(50,55,32,8,0,0,Math.PI*2);ctx.fill();
      // Head
      ctx.beginPath();ctx.ellipse(50,70,16,18,0,0,Math.PI*2);ctx.fill();
      // Body with cape
      ctx.beginPath();ctx.moveTo(34,85);ctx.lineTo(15,98);ctx.lineTo(50,90);ctx.lineTo(85,98);ctx.lineTo(66,85);ctx.lineTo(50,88);ctx.closePath();ctx.fill();
      break;
    }
    default: { // star
      const s=5;const or=40;const ir=18;ctx.beginPath();
      for(let i=0;i<s*2;i++){const a=i*Math.PI/s-Math.PI/2;const r=i%2===0?or:ir;ctx.lineTo(50+r*Math.cos(a),50+r*Math.sin(a));}
      ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();
}

/** Draw either a user-uploaded image or fallback silhouette at the given position */
function drawShapeOrImage(
  ctx: CanvasRenderingContext2D,
  imgEl: HTMLImageElement | null,
  type: string,
  x: number, y: number, w: number, h: number,
  color: string,
  alpha = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (imgEl) {
    // Contain-fit the uploaded image
    const iA = imgEl.naturalWidth / imgEl.naturalHeight;
    let dw = w, dh = h;
    if (iA > 1) { dh = w / iA; } else { dw = h * iA; }
    const dx2 = x + (w - dw) / 2;
    const dy2 = y + (h - dh) / 2;
    ctx.drawImage(imgEl, dx2, dy2, dw, dh);
  } else {
    ctx.globalAlpha = 1; // reset before calling drawSilhouette which sets its own fill
    drawSilhouette(ctx, type, x, y, w, h, `${color}`);
    ctx.globalAlpha = alpha; // note: already saved
  }
  ctx.restore();
}

async function drawSilhouetteCover(
  canvas: HTMLCanvasElement,
  o: { name: string; count: string; primaryColor: string; bgColor: string; silhouetteType: string },
  images: string[],
  shapeImg: HTMLImageElement | null = null
) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const pc=o.primaryColor||'#1A1A1A'; const bg=o.bgColor||'#FFFFFF';

  ctx.fillStyle=bg; ctx.fillRect(0,0,2000,2000);

  if (images.length > 0) {
    // ── Use uploaded images as a collage background ──
    const loaded = await Promise.allSettled(images.map(src => loadImage(src)));
    const imgs = loaded.filter(r => r.status==='fulfilled').map(r => (r as PromiseFulfilledResult<HTMLImageElement>).value);

    if (imgs.length > 0) {
      // Tile images in a grid to fill the whole canvas
      const tileN = Math.max(imgs.length, 4);
      const cols2 = Math.ceil(Math.sqrt(tileN));
      const rows2 = Math.ceil(tileN / cols2);
      const tW2 = Math.ceil(2000 / cols2);
      const tH2 = Math.ceil(2000 / rows2);

      for (let r = 0; r < rows2; r++) {
        for (let c = 0; c < cols2; c++) {
          const img = imgs[(r * cols2 + c) % imgs.length];
          const tx = c * tW2; const ty = r * tH2;
          const iA = img.naturalWidth / img.naturalHeight;
          const cA = tW2 / tH2;
          let dw, dh, dx, dy;
          if (iA > cA) { dh=tH2; dw=dh*iA; dx=tx-(dw-tW2)/2; dy=ty; }
          else { dw=tW2; dh=dw/iA; dx=tx; dy=ty-(dh-tH2)/2; }
          ctx.drawImage(img, dx, dy, dw, dh);
        }
      }
      // Vignette/overlay to make text readable
      ctx.fillStyle = `${pc}CC`;
      ctx.fillRect(0, 0, 2000, 2000);
    }
  } else {
    // Subtle dot pattern fallback
    ctx.fillStyle=`${pc}08`;
    for(let x=0;x<2000;x+=80)for(let y=0;y<2000;y+=80){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}
    const ss = o.silhouetteType || 'butterfly';
    // Large center shape
    drawShapeOrImage(ctx, shapeImg, ss, 400, 250, 1200, 1200, `${pc}18`, 0.18);
    // Corner decorators
    const positions=[[80,100],[1700,150],[60,1650],[1720,1700],[900,1600]];
    for(const [sx,sy] of positions) drawShapeOrImage(ctx, shapeImg, ss, sx, sy, 220, 220, `${pc}22`, 0.22);
  }

  // ── Title block ──
  const titleBg = images.length > 0 ? bg : pc;
  const titleFg = images.length > 0 ? pc : bg;
  ctx.save(); ctx.fillStyle=titleBg;
  ctx.shadowBlur = images.length > 0 ? 0 : 0;
  roundRect(ctx,100,780,1800,520,40); ctx.fill();
  ctx.restore();

  ctx.font='bold 130px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=titleFg; ctx.textAlign='center';
  ctx.fillText((o.name||'SILHOUETTE BUNDLE').toUpperCase(),1000,950);
  ctx.font='bold 68px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=`${titleFg}BB`;
  ctx.fillText(`${o.count||'50'}+ SVG Cut Files · Commercial License`,1000,1068);
  ctx.font='52px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=`${titleFg}77`;
  ctx.fillText('SVG · DXF · PNG · EPS · PDF Formats Included',1000,1150);

  // Tags
  const tags=['Cricut Ready','Silhouette Cameo','Commercial Use','Instant Download'];
  const tW=380,tH=80,tGap=20;const tTotal=tags.length*(tW+tGap)-tGap; let tx=(2000-tTotal)/2;
  for(const t of tags){
    ctx.fillStyle=images.length>0?`${pc}22`:`${pc}15`;roundRect(ctx,tx,1370,tW,tH,tH/2);ctx.fill();
    ctx.strokeStyle=images.length>0?`${pc}66`:`${pc}44`;ctx.lineWidth=2;roundRect(ctx,tx,1370,tW,tH,tH/2);ctx.stroke();
    ctx.font='bold 32px "HN",Arial,sans-serif';ctx.fillStyle=titleFg;ctx.textAlign='center';ctx.fillText(t,tx+tW/2,1418);
    tx+=tW+tGap;
  }
}

/** Draw the user's design (contain-fit) inside a print area on a product */
function drawDesignOnProduct(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, maxW: number, maxH: number,
  alpha = 0.9
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const iA = img.naturalWidth / img.naturalHeight;
  const cA = maxW / maxH;
  let dw: number, dh: number;
  if (iA > cA) { dw = maxW; dh = maxW / iA; } else { dh = maxH; dw = maxH * iA; }
  ctx.drawImage(img, x + (maxW - dw) / 2, y + (maxH - dh) / 2, dw, dh);
  ctx.restore();
}

/** Photo-based print areas: [printX%, printY%, printW%, printH%] relative to the drawn mockup image bounds.
 *  These values position the print area ON the visible product in the photo.
 *  Adjust these if the product photo changes. */
const MOCKUP_PRINT_AREAS: Record<string, [number, number, number, number]> = {
  tshirt:  [0.30, 0.32, 0.40, 0.37], // center chest of t-shirt
  totebag: [0.22, 0.45, 0.56, 0.38], // center of tote bag body
  mug:     [0.07, 0.18, 0.50, 0.56], // mug face (left body, exclude handle right side)
  sticker: [0.22, 0.22, 0.56, 0.56], // sticker circle center
  card:    [0.07, 0.09, 0.84, 0.76], // front face of card
  frame:   [0.17, 0.15, 0.66, 0.70], // inner mat opening
};

/** Draw a product mockup using a real photo from /mockups/ with design overlay */
async function drawProductMock(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number, y: number, w: number, h: number,
  _color: string,
  designImg: HTMLImageElement | null,
  mockupScale = 0.85,
  mockupOffsetY = 0.0
) {
  const mockupSrc = `/mockups/${type}.png`;
  try {
    const mockImg = await loadImage(mockupSrc);

    // Draw mockup photo — contain fit within the card cell
    const iA = mockImg.naturalWidth / mockImg.naturalHeight;
    const cA = w / h;
    let dw: number, dh: number, dx: number, dy: number;
    if (iA > cA) { dw = w; dh = w / iA; dx = x; dy = y + (h - dh) / 2; }
    else { dh = h; dw = h * iA; dx = x + (w - dw) / 2; dy = y; }
    ctx.drawImage(mockImg, dx, dy, dw, dh);

    // Overlay design — CLIPPED to print area so it never overflows
    if (designImg) {
      const [px, py, pw, ph] = MOCKUP_PRINT_AREAS[type] ?? [0.25, 0.25, 0.50, 0.50];
      const printX = dx + dw * px;
      const printY = dy + dh * py;
      const printW = dw * pw;
      const printH = dh * ph;

      ctx.save();
      ctx.beginPath();
      ctx.rect(printX, printY, printW, printH);
      ctx.clip();

      // Apply scale factor from slider
      const scaledW = printW * mockupScale;
      const scaledH = printH * mockupScale;
      // Apply vertical offset from slider (shift within print area)
      const offsetPx = printH * mockupOffsetY;

      // Draw design centered & contained with scale applied
      const iA2 = designImg.naturalWidth / designImg.naturalHeight;
      const cA2 = scaledW / scaledH;
      let ddw: number, ddh: number;
      if (iA2 > cA2) { ddw = scaledW; ddh = scaledW / iA2; }
      else { ddh = scaledH; ddw = scaledH * iA2; }
      const ddx = printX + (printW - ddw) / 2;
      const ddy = printY + offsetPx + (printH - ddh) / 2;

      ctx.globalAlpha = 0.88;
      ctx.drawImage(designImg, ddx, ddy, ddw, ddh);
      ctx.restore();
    }
  } catch {
    // Fallback: plain card with design centered
    ctx.fillStyle = '#F8F8F8';
    roundRect(ctx, x, y, w, h, 16); ctx.fill();
    ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 16); ctx.stroke();
    if (designImg) {
      ctx.save();
      ctx.beginPath(); ctx.rect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.8); ctx.clip();
      ctx.globalAlpha = 0.85;
      ctx.drawImage(designImg, x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.8);
      ctx.restore();
    }
  }
}


async function drawSilhouetteUsage(
  canvas: HTMLCanvasElement,
  o: { name: string; primaryColor: string; bgColor: string; silhouetteType: string },
  shapeImg: HTMLImageElement | null = null,
  images: string[] = [],
  mockupScale = 0.85,
  mockupOffsetY = 0.0
) {
  const ctx = canvas.getContext('2d')!; canvas.width = 2000; canvas.height = 2000;
  const pc = o.primaryColor || '#1A1A1A';
  const bg = o.bgColor || '#FFFFFF';

  // Load design image: prefer selected shape image, else first upload
  let designImg: HTMLImageElement | null = shapeImg;
  if (!designImg && images.length > 0) {
    try { designImg = await loadImage(images[0]); } catch { /* ok */ }
  }

  // Background
  const grad = ctx.createLinearGradient(0, 0, 2000, 2000);
  grad.addColorStop(0, bg === '#FFFFFF' ? '#F5F5F5' : bg);
  grad.addColorStop(1, bg === '#FFFFFF' ? '#EBEBEB' : '#111');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 2000, 2000);

  // Header
  ctx.font = 'bold 105px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = pc; ctx.textAlign = 'center';
  ctx.fillText('PERFECT FOR', 1000, 145);
  ctx.fillStyle = `${pc}33`; ctx.fillRect(400, 170, 1200, 5);

  // 6 product cards in 3×2 grid
  const products = [
    { title: 'T-Shirts & Apparel', type: 'tshirt', color: '#4A90D9' },
    { title: 'Tote Bags', type: 'totebag', color: '#6BBF59' },
    { title: 'Mugs & Cups', type: 'mug', color: pc },
    { title: 'Stickers & Decals', type: 'sticker', color: '#F5A623' },
    { title: 'Cards & Invitations', type: 'card', color: '#9B59B6' },
    { title: 'Wall Art & Frames', type: 'frame', color: '#2980B9' },
  ];

  const cols3 = 3, rows3 = 2;
  const uG = 48;
  const uW = Math.floor((2000 - 120 - (cols3 - 1) * uG) / cols3);
  const uH = Math.floor((2000 - 260 - 140 - (rows3 - 1) * uG) / rows3); // 260 header, 140 footer
  const startX = 60, startY = 210;

  for (let i = 0; i < products.length; i++) {
    const col = i % cols3; const row = Math.floor(i / cols3);
    const ux = startX + col * (uW + uG);
    const uy = startY + row * (uH + uG);
    const prod = products[i];

    // Card bg
    ctx.fillStyle = bg === '#FFFFFF' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.08)';
    roundRect(ctx, ux, uy, uW, uH, 24); ctx.fill();
    ctx.strokeStyle = `${pc}1A`; ctx.lineWidth = 2;
    roundRect(ctx, ux, uy, uW, uH, 24); ctx.stroke();

    // Product mockup (top 75% of card)
    const mockPad = 28;
    const mockH = Math.floor(uH * 0.72);
    await drawProductMock(ctx, prod.type, ux + mockPad, uy + mockPad, uW - mockPad * 2, mockH - mockPad, prod.color, designImg, mockupScale, mockupOffsetY);

    // Product label
    ctx.font = `bold 42px "Helvetica Neue",Arial,sans-serif`; ctx.fillStyle = pc; ctx.textAlign = 'center';
    ctx.fillText(prod.title, ux + uW / 2, uy + uH - 38);
  }

  // Footer
  ctx.font = 'bold 62px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = pc; ctx.textAlign = 'center';
  ctx.fillText('Commercial License — Use in Client Projects', 1000, 1875);
  ctx.font = '42px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = `${pc}66`;
  ctx.fillText('Personal & Commercial use permitted · No attribution required', 1000, 1942);
}


function drawSilhouetteFormats(canvas: HTMLCanvasElement, o: { name: string; primaryColor: string; bgColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const pc=o.primaryColor||'#1A1A1A';

  const grad=ctx.createLinearGradient(0,0,2000,2000);
  grad.addColorStop(0,pc); grad.addColorStop(0.6,'#2D2D5E'); grad.addColorStop(1,'#1A1A3A');
  ctx.fillStyle=grad; ctx.fillRect(0,0,2000,2000);
  ctx.fillStyle='rgba(255,255,255,0.04)';
  ctx.beginPath();ctx.arc(1900,100,600,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(100,1900,400,0,Math.PI*2);ctx.fill();

  ctx.font='bold 110px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.textAlign='center';
  ctx.fillText((o.name||'SVG BUNDLE').toUpperCase(),1000,180);
  ctx.font='60px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.fillText('WHAT\'S INCLUDED IN YOUR DOWNLOAD',1000,270);

  const formats=[{ext:'SVG',desc:'Scalable Vector · Cricut & Silhouette',color:'#FF6B6B'},{ext:'DXF',desc:'Drawing Exchange · All Cutting Machines',color:'#4ECDC4'},{ext:'PNG',desc:'Transparent Background · 300 DPI',color:'#45B7D1'},{ext:'EPS',desc:'Illustrator & CorelDRAW',color:'#96CEB4'},{ext:'PDF',desc:'Print Ready · High Resolution',color:'#FFEAA7'}];
  const fW=340,fH=300,fG=30,tFW=formats.length*(fW+fG)-fG,fSX=(2000-tFW)/2;

  formats.forEach((f,i)=>{
    const fx=fSX+i*(fW+fG); const fy=360;
    ctx.fillStyle='rgba(255,255,255,0.1)';roundRect(ctx,fx,fy,fW,fH,24);ctx.fill();
    ctx.strokeStyle=f.color+'AA';ctx.lineWidth=2;roundRect(ctx,fx,fy,fW,fH,24);ctx.stroke();
    ctx.fillStyle=f.color;roundRect(ctx,fx,fy,fW,70,24);ctx.fill();
    roundRect(ctx,fx,fy+50,fW,20,0);ctx.fill();
    ctx.font='bold 55px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.fillText('.'+f.ext,fx+fW/2,fy+56);
    ctx.font='28px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.7)';
    const dw=f.desc.split(' · ');dw.forEach((d,di)=>ctx.fillText(d,fx+fW/2,fy+130+di*44));
  });

  // Feature list
  const features=[['🔓','Commercial License','Use in paid client projects'],['📲','Cut Machine Ready','Cricut & Silhouette Cameo'],['🖨️','High Resolution','300 DPI PNG files included'],['⚡','Instant Download','Delivered right after purchase'],['📁','Organized ZIP','Neatly sorted by format'],['🔄','Lifetime Updates','Re-download any time']];
  const lW=840,lH=160,lG=20,lSX=(2000-(2*lW+lG))/2;
  features.forEach((f,i)=>{
    const col=i%2; const row=Math.floor(i/2);
    const lx=lSX+col*(lW+lG); const ly=780+row*(lH+lG);
    ctx.fillStyle='rgba(255,255,255,0.06)';roundRect(ctx,lx,ly,lW,lH,16);ctx.fill();
    ctx.font='60px Arial';ctx.textAlign='left';ctx.fillText(f[0],lx+20,ly+100);
    ctx.font='bold 44px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.fillText(f[1],lx+100,ly+75);
    ctx.font='30px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillText(f[2],lx+100,ly+120);
  });

  ctx.font='bold 55px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.textAlign='center';
  ctx.fillText('★ 100% Cut Machine Compatible ★',1000,1860);
  ctx.font='44px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.5)';
  ctx.fillText('Tested with Cricut Design Space · Silhouette Studio · Inkscape',1000,1930);
}

// ── Wrap text helper ──
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Thumbnail 6 — Product Description slide */
function drawSilhouetteDescription(
  canvas: HTMLCanvasElement,
  o: { name: string; primaryColor: string; bgColor: string; silhouetteType: string; description: string }
) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 2000; canvas.height = 2000;
  const pc = o.primaryColor || '#1A1A1A';
  const bg = o.bgColor || '#FFFFFF';
  const desc = o.description || '';

  // ── Background ──
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2000, 2000);

  // Subtle diagonal stripe texture
  ctx.save();
  ctx.strokeStyle = `${pc}06`;
  ctx.lineWidth = 2;
  for (let d = -2000; d < 4000; d += 60) {
    ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + 2000, 2000); ctx.stroke();
  }
  ctx.restore();

  // ── Decorative large silhouette watermark ──
  ctx.globalAlpha = 0.04;
  drawSilhouette(ctx, o.silhouetteType || 'butterfly', 800, 300, 1200, 1200, pc);
  ctx.globalAlpha = 1;

  // ── Top accent bar ──
  ctx.fillStyle = pc;
  ctx.fillRect(0, 0, 2000, 16);

  // ── Header section ──
  const headerY = 160;
  // Small decorative silhouettes flanking the title
  ctx.globalAlpha = 0.25;
  drawSilhouette(ctx, o.silhouetteType || 'butterfly', 80, headerY - 80, 160, 160, pc);
  drawSilhouette(ctx, o.silhouetteType || 'butterfly', 1760, headerY - 80, 160, 160, pc);
  ctx.globalAlpha = 1;

  // Section label
  ctx.font = 'bold 42px "Helvetica Neue",Arial,sans-serif';
  ctx.fillStyle = `${pc}60`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('✦  ABOUT THIS DESIGN  ✦', 1000, headerY - 20);
  ctx.letterSpacing = '0px';

  // Title
  ctx.font = 'bold 110px "Helvetica Neue",Arial,sans-serif';
  ctx.fillStyle = pc;
  const nameLines = wrapText(ctx, (o.name || 'SVG BUNDLE').toUpperCase(), 1760);
  let ty = headerY + 80;
  for (const line of nameLines.slice(0, 2)) {
    ctx.fillText(line, 1000, ty);
    ty += 130;
  }

  // Divider
  ty += 20;
  ctx.fillStyle = pc;
  ctx.fillRect(200, ty, 1600, 4);
  ctx.fillStyle = `${pc}30`;
  ctx.fillRect(200, ty + 8, 1600, 2);
  ty += 60;

  // ── Description text ──
  if (desc.trim()) {
    const paragraphs = desc.split('\n').map(p => p.trim()).filter(Boolean);
    ctx.font = '52px "Helvetica Neue",Arial,sans-serif';
    ctx.fillStyle = pc;
    ctx.textAlign = 'center';
    const lineH = 76;
    const maxW = 1640;
    let textY = ty;

    for (const para of paragraphs) {
      const wrappedLines = wrapText(ctx, para, maxW);
      for (const line of wrappedLines) {
        if (textY > 1800) break;
        ctx.fillText(line, 1000, textY);
        textY += lineH;
      }
      textY += 36; // paragraph gap
    }
  } else {
    // Placeholder hint lines
    ctx.fillStyle = `${pc}20`;
    for (let i = 0; i < 8; i++) {
      const w = i % 3 === 0 ? 1400 : i % 3 === 1 ? 1100 : 800;
      roundRect(ctx, (2000 - w) / 2, ty + i * 80, w, 28, 14);
      ctx.fill();
    }
  }

  // ── Bottom section: keyword chips ──
  const chips = ['SVG · DXF · PNG · EPS', 'Commercial License', 'Cricut Ready', 'Instant Download', 'Silhouette Cameo'];
  const chipY = 1840;
  let chipX = 1000 - (chips.length * 320) / 2;
  for (const chip of chips) {
    const cW = ctx.measureText(chip).width + 60;
    roundRect(ctx, chipX, chipY, cW, 70, 35);
    ctx.fillStyle = `${pc}12`; ctx.fill();
    ctx.strokeStyle = `${pc}44`; ctx.lineWidth = 2;
    roundRect(ctx, chipX, chipY, cW, 70, 35); ctx.stroke();
    ctx.font = 'bold 32px "Helvetica Neue",Arial,sans-serif';
    ctx.fillStyle = pc; ctx.textAlign = 'left';
    ctx.fillText(chip, chipX + 30, chipY + 46);
    chipX += cW + 20;
  }

  // ── Bottom accent bar ──
  ctx.fillStyle = pc;
  ctx.fillRect(0, 1984, 2000, 16);
}

// ── Justify-aligned text renderer for canvas ──
function fillJustifiedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ').filter(Boolean);
  const lines: string[][] = [];
  let current: string[] = [];

  for (const word of words) {
    const test = [...current, word].join(' ');
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = [word];
    } else {
      current.push(word);
    }
  }
  if (current.length) lines.push(current);

  let curY = y;
  for (let li = 0; li < lines.length; li++) {
    const lineWords = lines[li];
    const isLast = li === lines.length - 1;
    if (isLast || lineWords.length === 1) {
      // Last line or single word: left-aligned
      ctx.textAlign = 'left';
      ctx.fillText(lineWords.join(' '), x, curY);
    } else {
      // Justify: distribute extra space between words
      const totalWordWidth = lineWords.reduce((sum, w) => sum + ctx.measureText(w).width, 0);
      const gap = (maxWidth - totalWordWidth) / (lineWords.length - 1);
      let wx = x;
      for (const w of lineWords) {
        ctx.textAlign = 'left';
        ctx.fillText(w, wx, curY);
        wx += ctx.measureText(w).width + gap;
      }
    }
    curY += lineHeight;
  }
  return curY; // returns Y position after last line
}

/** Thumbnail — You Will Get slide */
function drawYouWillGet(
  canvas: HTMLCanvasElement,
  o: { name: string; primaryColor: string; bgColor: string; silhouetteType: string; youWillGet: string }
) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 2000; canvas.height = 2000;
  const pc = o.primaryColor || '#1A1A1A';
  const bg = o.bgColor || '#FFFFFF';
  const content = o.youWillGet || '';

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, 2000);
  grad.addColorStop(0, bg === '#FFFFFF' ? '#FAFAFA' : bg);
  grad.addColorStop(1, bg === '#FFFFFF' ? '#F0F0F0' : bg);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 2000, 2000);

  // Top accent band
  ctx.fillStyle = pc;
  ctx.fillRect(0, 0, 2000, 18);

  // Decorative right watermark
  ctx.globalAlpha = 0.04;
  drawSilhouette(ctx, o.silhouetteType || 'star', 1300, 400, 700, 700, pc);
  ctx.globalAlpha = 1;

  // ── Header ──
  ctx.font = 'bold 46px "Helvetica Neue",Arial,sans-serif';
  ctx.fillStyle = `${pc}55`;
  ctx.textAlign = 'center';
  ctx.fillText('✦  WHAT YOU WILL GET  ✦', 1000, 160);

  ctx.font = 'bold 118px "Helvetica Neue",Arial,sans-serif';
  ctx.fillStyle = pc;
  ctx.fillText((o.name || 'SVG BUNDLE').toUpperCase(), 1000, 310);

  // Divider
  ctx.fillStyle = pc;
  ctx.fillRect(140, 350, 1720, 5);
  ctx.fillStyle = `${pc}25`;
  ctx.fillRect(140, 360, 1720, 2);

  // ── Content lines ──
  const listY = 430;
  const lineH = 90;
  const textX = 180;
  const maxW = 1640;

  if (content.trim()) {
    const lines = content.split('\n').map(l => l.trim());
    ctx.font = '58px "Helvetica Neue",Arial,sans-serif';
    ctx.fillStyle = pc;
    ctx.textAlign = 'left';
    let curY = listY;

    for (const line of lines) {
      if (curY > 1800) break;
      if (!line) { curY += lineH * 0.5; continue; } // blank line = half gap

      // Detect if it's a numbered item  e.g. "10 – SVG file" or "1 – AI file"
      const numMatch = line.match(/^(\d+)\s*[–\-—]\s*(.+)$/);
      // Detect if it's a bullet / emoji line
      const isBullet = /^[•\-\*–]/.test(line);

      if (numMatch) {
        // Number badge + format label
        const num = numMatch[1];
        const label = numMatch[2];

        // Number badge
        const badgeW = 120;
        roundRect(ctx, textX, curY - 60, badgeW, 74, 12);
        ctx.fillStyle = pc; ctx.fill();
        ctx.font = 'bold 46px "Helvetica Neue",Arial,sans-serif';
        ctx.fillStyle = bg === '#1A1A1A' ? '#222' : bg;
        ctx.textAlign = 'center';
        ctx.fillText(num, textX + badgeW / 2, curY - 3);

        // Label
        ctx.font = '58px "Helvetica Neue",Arial,sans-serif';
        ctx.fillStyle = pc;
        ctx.textAlign = 'left';
        ctx.fillText(label, textX + badgeW + 28, curY);

        // Subtle row line
        ctx.fillStyle = `${pc}12`;
        ctx.fillRect(textX, curY + 20, maxW, 2);
        ctx.fillStyle = pc;
      } else if (isBullet) {
        // Bullet dot
        ctx.beginPath(); ctx.arc(textX + 18, curY - 18, 13, 0, Math.PI * 2);
        ctx.fillStyle = pc; ctx.fill();
        ctx.font = '58px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = pc; ctx.textAlign = 'left';
        ctx.fillText(line.replace(/^[•\-\*–]\s*/, ''), textX + 50, curY);
      } else {
        // Plain line — slightly smaller/lighter for intro text
        ctx.font = '52px "Helvetica Neue",Arial,sans-serif';
        ctx.fillStyle = `${pc}CC`;
        ctx.textAlign = 'left';
        // Wrap if needed
        const words = line.split(' '); let cur2 = ''; let ly = curY;
        for (const w of words) {
          const test = cur2 ? `${cur2} ${w}` : w;
          if (ctx.measureText(test).width > maxW) {
            ctx.fillText(cur2, textX, ly); ly += lineH * 0.85; cur2 = w;
          } else cur2 = test;
        }
        if (cur2) ctx.fillText(cur2, textX, ly);
        if (ly > curY) curY = ly;
        ctx.fillStyle = pc;
      }
      curY += lineH;
    }
  } else {
    // Placeholder rows
    ctx.fillStyle = `${pc}18`;
    const items = ['1 – AI file', '1 – EPS file', '10 – DXF file', '10 – PDF file', '10 – SVG file', '10 – JPEG file', '10 – PNG file with transparent background'];
    items.forEach((item, i) => {
      const iy = listY + i * lineH;
      roundRect(ctx, textX, iy - 55, 1640, 70, 12); ctx.fill();
      ctx.font = '52px "Helvetica Neue",Arial,sans-serif';
      ctx.fillStyle = `${pc}55`; ctx.textAlign = 'left';
      ctx.fillText(item, textX + 20, iy);
      ctx.fillStyle = `${pc}18`;
    });
  }

  // Bottom accent
  ctx.fillStyle = pc;
  ctx.fillRect(0, 1984, 2000, 16);

  // Bottom label
  ctx.font = 'bold 46px "Helvetica Neue",Arial,sans-serif';
  ctx.fillStyle = `${pc}60`; ctx.textAlign = 'center';
  ctx.fillText('Instant Download · Commercial License Included', 1000, 1950);
}

/** Load an image src into an HTMLImageElement, waiting for it to be ready */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Thumbnail 5 — Uploaded designs in a premium mosaic grid */
async function drawUploadedGrid(
  canvas: HTMLCanvasElement,
  images: string[],
  o: { name: string; primaryColor: string; bgColor: string; silhouetteType: string; count: string }
) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 2000; canvas.height = 2000;
  const pc = o.primaryColor || '#1A1A1A';
  const bg = o.bgColor || '#FFFFFF';

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2000, 2000);

  // Subtle dot texture
  ctx.fillStyle = `${pc}08`;
  for (let x = 0; x < 2000; x += 70) {
    for (let y = 0; y < 2000; y += 70) {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── HEADER ──
  ctx.fillStyle = pc;
  roundRect(ctx, 60, 60, 1880, 120, 16); ctx.fill();
  ctx.font = 'bold 76px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = bg; ctx.textAlign = 'center';
  ctx.fillText((o.name || 'SVG BUNDLE').toUpperCase() + ' — DESIGN PREVIEW', 1000, 143);

  if (images.length === 0) {
    // No uploads: show silhouette placeholder grid
    ctx.font = 'bold 60px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = `${pc}55`; ctx.textAlign = 'center';
    ctx.fillText('Upload your design previews to see them here', 1000, 1000);
    ctx.font = '40px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = `${pc}33`;
    ctx.fillText('Use the upload panel on the left →', 1000, 1080);

    // Show placeholder silhouettes as demo
    const types = ['butterfly','bird','tree','flower','deer','cat','star','butterfly','butterfly','bird','tree','flower'];
    const cols = 4, gap = 30, cellW = (2000 - 120 - (cols - 1) * gap) / cols;
    const cellH = cellW;
    for (let i = 0; i < Math.min(types.length, 12); i++) {
      const col = i % cols; const row = Math.floor(i / cols);
      const cx = 60 + col * (cellW + gap); const cy = 230 + row * (cellH + gap);
      ctx.fillStyle = `${pc}0A`; roundRect(ctx, cx, cy, cellW, cellH, 16); ctx.fill();
      ctx.strokeStyle = `${pc}22`; ctx.lineWidth = 2; roundRect(ctx, cx, cy, cellW, cellH, 16); ctx.stroke();
      drawSilhouette(ctx, types[i], cx + 40, cy + 40, cellW - 80, cellH - 80, `${pc}66`);
    }
  } else {
    // Load all images in parallel
    const loaded = await Promise.allSettled(images.map(src => loadImage(src)));
    const imgs = loaded.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<HTMLImageElement>).value);

    // Determine grid layout based on image count
    const count = imgs.length;
    const cols = count <= 2 ? count : count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    const gap = 24;
    const totalW = 2000 - 120;
    const totalH = 2000 - 280; // space for header + footer
    const cellW = (totalW - (cols - 1) * gap) / cols;
    const cellH = Math.min((totalH - (rows - 1) * gap) / rows, cellW); // square-ish

    const gridStartX = 60;
    const gridStartY = 220;

    for (let i = 0; i < imgs.length; i++) {
      const col = i % cols; const row = Math.floor(i / cols);
      const cx = gridStartX + col * (cellW + gap);
      const cy = gridStartY + row * (cellH + gap);

      // White card background (so contain padding looks clean)
      ctx.fillStyle = bg === '#1A1A1A' ? '#2a2a2a' : '#FFFFFF';
      roundRect(ctx, cx, cy, cellW, cellH, 16); ctx.fill();

      // Subtle shadow outer ring
      ctx.fillStyle = `${pc}0A`;
      roundRect(ctx, cx - 4, cy - 4, cellW + 8, cellH + 8, 20); ctx.fill();

      // Draw image — CONTAIN fit (full image visible, no crop)
      const img = imgs[i];
      const iAspect = img.naturalWidth / img.naturalHeight;
      const cAspect = cellW / cellH;
      const padding2 = 18; // inner padding so image doesn't touch card edge
      const innerW = cellW - padding2 * 2;
      const innerH = cellH - padding2 * 2;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (iAspect > cAspect) {
        // Image is wider — fit to inner width
        drawW = innerW; drawH = drawW / iAspect;
        drawX = cx + padding2;
        drawY = cy + padding2 + (innerH - drawH) / 2;
      } else {
        // Image is taller (or same) — fit to inner height
        drawH = innerH; drawW = drawH * iAspect;
        drawX = cx + padding2 + (innerW - drawW) / 2;
        drawY = cy + padding2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Accent border
      ctx.strokeStyle = `${pc}22`; ctx.lineWidth = 2;
      roundRect(ctx, cx, cy, cellW, cellH, 16); ctx.stroke();
    }

    // If fewer cells than expected, fill remaining with silhouettes
    for (let i = imgs.length; i < cols * rows; i++) {
      const col = i % cols; const row = Math.floor(i / cols);
      const cx = gridStartX + col * (cellW + gap);
      const cy = gridStartY + row * (cellH + gap);
      ctx.fillStyle = `${pc}08`; roundRect(ctx, cx, cy, cellW, cellH, 16); ctx.fill();
      ctx.strokeStyle = `${pc}18`; ctx.lineWidth = 2; roundRect(ctx, cx, cy, cellW, cellH, 16); ctx.stroke();
      drawSilhouette(ctx, o.silhouetteType || 'butterfly', cx + 30, cy + 30, cellW - 60, cellH - 60, `${pc}22`);
    }
  }

  // ── FOOTER ──
  const footerY = 1900;
  ctx.font = 'bold 52px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = pc; ctx.textAlign = 'center';
  ctx.fillText(`${o.count || '50'}+ Premium SVG Designs · ${o.name || 'SVG Bundle'}`, 1000, footerY);
  ctx.font = '38px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = `${pc}77`;
  ctx.fillText('Commercial License · Cricut Ready · Instant Download', 1000, footerY + 55);
}

/** Thumbnail 7 — Collage scatter + vertical format list (like reference image) */
async function drawCollageFormats(
  canvas: HTMLCanvasElement,
  images: string[],
  o: { name: string; primaryColor: string; bgColor: string; silhouetteType: string; count: string }
) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 2000; canvas.height = 2000;
  const pc = o.primaryColor || '#1A1A1A';
  const bg = o.bgColor || '#FFFFFF';

  // ── Full background ──
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2000, 2000);

  // Wood-plank horizontal texture
  for (let y = 0; y < 2000; y += 55) {
    ctx.fillStyle = y % 110 === 0 ? `${pc}06` : `${pc}03`;
    ctx.fillRect(0, y, 2000, 52);
  }

  // Subtle hex-dot watermark across collage area
  ctx.fillStyle = `${pc}07`;
  const hexR = 38;
  for (let row = 0; row < 18; row++) {
    for (let col = 0; col < 11; col++) {
      const hx = col * hexR * 2 + (row % 2 ? hexR : 0) + 60;
      const hy = row * hexR * 1.7 + 80;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](hx + hexR * Math.cos(a), hy + hexR * Math.sin(a));
      }
      ctx.closePath(); ctx.fill();
    }
  }

  // ── RIGHT panel ──
  const panelX = 1580;
  const panelW = 2000 - panelX;
  ctx.fillStyle = pc;
  ctx.fillRect(panelX, 0, panelW, 2000);

  // Slight texture on panel
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let y = 0; y < 2000; y += 80) ctx.fillRect(panelX, y, panelW, 38);

  // Format list
  const formats = ['AI', 'EPS', 'SVG', 'JPG', 'PDF', 'DXF', 'PNG'];
  const fStartY = 200;
  const fStepY = (2000 - fStartY - 80) / formats.length;
  ctx.font = `bold 130px "Helvetica Neue",Arial,sans-serif`;
  ctx.fillStyle = bg === '#1A1A1A' ? '#222' : bg;
  ctx.textAlign = 'center';
  for (let i = 0; i < formats.length; i++) {
    const fy = fStartY + i * fStepY + fStepY * 0.55;
    ctx.fillText(formats[i], panelX + panelW / 2, fy);
    // Thin divider between items
    if (i < formats.length - 1) {
      ctx.fillStyle = `${bg === '#1A1A1A' ? '#333' : bg}44`;
      ctx.fillRect(panelX + 30, fy + 20, panelW - 60, 3);
      ctx.fillStyle = bg === '#1A1A1A' ? '#222' : bg;
    }
  }

  // ── LEFT collage area ──
  const colW = panelX - 20; // leave a small gap before panel

  if (images.length === 0) {
    // Placeholder silhouettes scattered
    const types = ['butterfly','bird','tree','flower','deer','cat','star','butterfly','bird'];
    const seed = [{ x:80,y:80,r:-0.08,s:340 },{ x:460,y:60,r:0.05,s:300 },{ x:820,y:100,r:-0.04,s:360 },
      { x:1100,y:60,r:0.07,s:320 },{ x:60,y:480,r:0.06,s:360 },{ x:440,y:500,r:-0.06,s:320 },
      { x:830,y:460,r:0.04,s:300 },{ x:80,y:900,r:-0.05,s:340 },{ x:500,y:920,r:0.08,s:320 }];
    for (let i = 0; i < Math.min(types.length, seed.length); i++) {
      const { x, y, r, s } = seed[i];
      ctx.save(); ctx.translate(x + s/2, y + s/2); ctx.rotate(r);
      ctx.fillStyle = `${pc}0C`; ctx.fillRect(-s/2, -s/2, s, s);
      drawSilhouette(ctx, types[i], -s/2 + 20, -s/2 + 20, s - 40, s - 40, `${pc}55`);
      ctx.restore();
    }
    ctx.font = 'bold 60px "Helvetica Neue",Arial,sans-serif';
    ctx.fillStyle = `${pc}44`; ctx.textAlign = 'center';
    ctx.fillText('Upload images to fill this area', colW / 2, 1700);
  } else {
    const loaded = await Promise.allSettled(images.map(src => loadImage(src)));
    const imgs = loaded.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<HTMLImageElement>).value);

    // Deterministic pseudo-random scatter (seeded with index so it's stable)
    const pseudoRand = (seed2: number) => { let x = Math.sin(seed2 + 1) * 10000; return x - Math.floor(x); };

    // Figure out cell size based on count
    const n = imgs.length;
    const cols = n <= 2 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
    const rows = Math.ceil(n / cols);
    const padding = 30;
    const cellW2 = (colW - padding * (cols + 1)) / cols;
    const cellH2 = Math.min((2000 - padding * (rows + 1)) / rows, cellW2);
    const gridW = cols * cellW2 + (cols - 1) * padding;
    const gridX = (colW - gridW) / 2;
    const gridH = rows * cellH2 + (rows - 1) * padding;
    const gridY = (2000 - gridH) / 2;

    for (let i = 0; i < imgs.length; i++) {
      const col = i % cols; const row = Math.floor(i / cols);
      const baseX = gridX + col * (cellW2 + padding);
      const baseY = gridY + row * (cellH2 + padding);

      // Slight random offset + rotation for scattered feel
      const maxOffset = 18;
      const ox = (pseudoRand(i * 3) - 0.5) * maxOffset * 2;
      const oy = (pseudoRand(i * 3 + 1) - 0.5) * maxOffset * 2;
      const angle = (pseudoRand(i * 3 + 2) - 0.5) * 0.12; // ±~7°

      const cx = baseX + cellW2 / 2 + ox;
      const cy = baseY + cellH2 / 2 + oy;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Shadow
      ctx.shadowBlur = 24; ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6;
      // White card
      ctx.fillStyle = bg === '#1A1A1A' ? '#2a2a2a' : '#FFFFFF';
      ctx.fillRect(-cellW2/2, -cellH2/2, cellW2, cellH2);
      ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

      // Clip and draw image
      ctx.save();
      ctx.beginPath(); ctx.rect(-cellW2/2, -cellH2/2, cellW2, cellH2); ctx.clip();
      const img = imgs[i];
      const iA = img.naturalWidth / img.naturalHeight;
      const cA = cellW2 / cellH2;
      let dw, dh, dx, dy;
      if (iA > cA) { dh = cellH2; dw = dh * iA; dx = -dw/2; dy = -cellH2/2; }
      else { dw = cellW2; dh = dw / iA; dx = -cellW2/2; dy = -dh/2; }
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      // Border
      ctx.strokeStyle = `${pc}22`; ctx.lineWidth = 3;
      ctx.strokeRect(-cellW2/2, -cellH2/2, cellW2, cellH2);

      ctx.restore();
    }
  }

  // ── Tiny bottom label on left area ──
  ctx.font = 'bold 44px "Helvetica Neue",Arial,sans-serif';
  ctx.fillStyle = `${pc}55`; ctx.textAlign = 'center';
  ctx.fillText(`${o.count || '50'}+ ${(o.name || 'SVG Bundle').toUpperCase()} · Commercial License Included`, colW / 2, 1960);
}

export default function SilhouetteCreatorPage() {

  const [name, setName] = useState('');
  const [count, setCount] = useState('50');
  const [primaryColor, setPrimaryColor] = useState('#1A1A1A');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [silhouetteType, setSilhouetteType] = useState('butterfly');
  const [description, setDescription] = useState('');
  const [youWillGet, setYouWillGet] = useState('');
  const [customShapeType, setCustomShapeType] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [seo, setSeo] = useState<SeoResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [renderTick, setRenderTick] = useState(0);
  const [mockupScale, setMockupScale] = useState(0.85);   // 0.3–1.0: design size on product
  const [mockupOffsetY, setMockupOffsetY] = useState(0.0); // -0.2–0.2: shift design up/down
  const [shapeImgSrc, setShapeImgSrc] = useState<string | null>(null);
  const shapeImgRef = useRef<HTMLImageElement | null>(null);

  // Preload selected shape image whenever it changes
  useEffect(() => {
    if (!shapeImgSrc) { shapeImgRef.current = null; return; }
    const img = new Image();
    img.onload = () => { shapeImgRef.current = img; };
    img.src = shapeImgSrc;
  }, [shapeImgSrc]);

  // Actual shape type: custom text if filled, else preset selection
  const activeShapeType = customShapeType.trim() || silhouetteType;

  const coverRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const usageRef = useRef<HTMLCanvasElement>(null);
  const fmtRef = useRef<HTMLCanvasElement>(null);
  const uploadsRef = useRef<HTMLCanvasElement>(null);
  const descRef = useRef<HTMLCanvasElement>(null);
  const collageRef = useRef<HTMLCanvasElement>(null);
  const willGetRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const thumbRefs = [
    { ref: coverRef, label: 'Bundle Cover', key: 'cover' },
    { ref: collageRef, label: 'Collage & Formats', key: 'collage' },
    { ref: willGetRef, label: 'You Will Get', key: 'will-get' },
    { ref: usageRef, label: 'Usage Ideas', key: 'usage' },
    { ref: fmtRef, label: 'File Formats', key: 'formats' },
    { ref: uploadsRef, label: 'Your Designs', key: 'uploads' },
    { ref: descRef, label: 'Description', key: 'desc' },
  ];

  // Store the last generate options so useEffect can draw after canvases mount
  const drawOptsRef = useRef<{ name: string; count: string; primaryColor: string; bgColor: string; silhouetteType: string; images: string[] } | null>(null);

  const generate = useCallback(() => {
    const opts = { name, count, primaryColor, bgColor, silhouetteType: activeShapeType, images: uploadedImages };
    drawOptsRef.current = opts;
    setRenderTick(t => t + 1); // always increment so re-clicks always re-draw
  }, [name, count, primaryColor, bgColor, activeShapeType, uploadedImages]);

  // Draw when canvases mount or any option changes (renderTick always changes on Generate click)
  useEffect(() => {
    if (renderTick === 0) return;
    const o = { name, count, primaryColor, bgColor, silhouetteType: activeShapeType, images: uploadedImages, description, youWillGet };
    drawOptsRef.current = o as never;
    const doRender = async () => {
      const si = shapeImgRef.current;
      if (coverRef.current)   await drawSilhouetteCover(coverRef.current, o, o.images, si);
      if (usageRef.current)   await drawSilhouetteUsage(usageRef.current, o, si, o.images, mockupScale, mockupOffsetY);
      if (fmtRef.current)     drawSilhouetteFormats(fmtRef.current, o);
      if (uploadsRef.current) await drawUploadedGrid(uploadsRef.current, o.images, o);
      if (descRef.current)    drawSilhouetteDescription(descRef.current, o);
      if (collageRef.current) await drawCollageFormats(collageRef.current, o.images, o);
      if (willGetRef.current) drawYouWillGet(willGetRef.current, o);
    };
    const t = setTimeout(doRender, 30);
    return () => clearTimeout(t);
  }, [renderTick, name, count, primaryColor, bgColor, activeShapeType, uploadedImages, description, youWillGet, customShapeType, shapeImgSrc, mockupScale, mockupOffsetY]);

  const downloadAll = async () => {
    const zip = new JSZip();
    for (const { ref, label } of thumbRefs) {
      const c = ref.current; if (!c) continue;
      const blob: Blob = await new Promise(res => c.toBlob(b => res(b!), 'image/png'));
      zip.file(`${name||'silhouette'}-${label}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(content);
    a.download = `${name||'silhouette'}-thumbnails.zip`; a.click(); showToast('Downloaded!');
  };

  const generateSeo = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) { showToast('Set your Gemini API key in Settings'); return; }
    setSeoLoading(true);
    try {
      const res = await fetch('/api/generate-seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productType: 'silhouette', name: name||'Silhouette SVG Bundle', features: `${count}+ designs, ${silhouetteType} theme, SVG DXF PNG EPS PDF formats, commercial license`, style: silhouetteType, apiKey }) });
      const data = await res.json(); if (data.error) throw new Error(data.error);
      setSeo(data); showToast('SEO generated!');
    } catch (e) { showToast(`Error: ${e instanceof Error ? e.message : 'Unknown'}`); }
    finally { setSeoLoading(false); }
  };

  const copyText = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const colorPresets = [
    { label:'Black', fg:'#1A1A1A', bg:'#FFFFFF' },
    { label:'Navy', fg:'#1B2A4A', bg:'#F8F8FF' },
    { label:'Forest', fg:'#1B4A2A', bg:'#F5FFF5' },
    { label:'Burgundy', fg:'#6B1A1A', bg:'#FFF8F8' },
    { label:'Black on Kraft', fg:'#1A1A1A', bg:'#F5E8C0' },
    { label:'White on Black', fg:'#FFFFFF', bg:'#1A1A1A' },
  ];

  const shapePresets = [
    { value: 'butterfly', icon: '🦋' },
    { value: 'bird',      icon: '🐦' },
    { value: 'tree',      icon: '🌲' },
    { value: 'flower',   icon: '🌸' },
    { value: 'deer',     icon: '🦌' },
    { value: 'cat',      icon: '🐱' },
    { value: 'star',     icon: '⭐' },
    { value: 'heart',    icon: '❤️' },
    { value: 'crown',    icon: '👑' },
    { value: 'rose',     icon: '🌹' },
    { value: 'pumpkin',  icon: '🎃' },
    { value: 'skull',    icon: '💀' },
    { value: 'dragonfly',icon: '🪲' },
    { value: 'angel',    icon: '👼' },
    { value: 'witch',    icon: '🧙' },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* LEFT */}
      <div style={{ width: 290, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>🪄 Silhouette SVG Tool</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Create SVG bundle listing slides</p>
        </div>
        <div className="scroll-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Upload images */}
          <div>
            <label className="label">Upload SVG/Image Previews</label>
            <div className="dropzone" style={{ padding: 14 }} onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*,image/svg+xml" multiple onChange={e => {
                const files = Array.from(e.target.files||[]);
                files.forEach(f => { const r=new FileReader(); r.onload=ev=>setUploadedImages(prev=>[...prev,(ev.target?.result as string)]); r.readAsDataURL(f); });
              }} style={{ display: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <Upload size={18} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add design previews (optional)</span>
              </div>
            </div>
            {uploadedImages.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {uploadedImages.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={img} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} alt="" />
                    <button onClick={() => setUploadedImages(prev => prev.filter((_,j)=>j!==i))} style={{ position:'absolute',top:-6,right:-6,background:'var(--danger)',border:'none',borderRadius:'50%',width:18,height:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={10} color="white"/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div><label className="label">Bundle Name</label><input className="input" placeholder="Butterfly SVG Bundle" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><label className="label">Number of Designs</label><input className="input" placeholder="50" value={count} onChange={e=>setCount(e.target.value)}/></div>

          {/* You Will Get */}
          <div>
            <label className="label">📦 You Will Get <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea
              className="input"
              rows={7}
              placeholder={`e.g. You will get a ZIP archive that includes:\n\n1 – AI file\n1 – EPS file\n10 – DXF file\n10 – PDF file\n10 – SVG file\n10 – JPEG file\n10 – PNG file with transparent background`}
              value={youWillGet}
              onChange={e => setYouWillGet(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, minHeight: 130 }}
            />
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>→ Generates a <strong>You Will Get</strong> thumbnail · Numbered lines get styled badges</div>
          </div>

          {/* Product description */}
          <div>
            <label className="label">Product Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea
              className="input"
              rows={5}
              placeholder={`e.g. Set of Digital Download Halloween Witch & Elements SVG Cut Files for your creative DIY projects...\n\nPerfect for vinyl, personalized T-shirts, apparel, cups, stickers, and other DIY projects.`}
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, minHeight: 110 }}
            />
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>→ Generates a <strong>Description</strong> thumbnail slide</div>
          </div>

          {/* Shape type */}
          <div>
            <label className="label">Main Shape Type</label>

            {/* ── Uploaded images as shape source ── */}
            {uploadedImages.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  🖼️ Use Your Uploaded Image
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {uploadedImages.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setShapeImgSrc(shapeImgSrc === src ? null : src)}
                      title={`Use image ${i + 1} as shape`}
                      style={{
                        width: 52, height: 52, padding: 2, borderRadius: 8, cursor: 'pointer',
                        border: shapeImgSrc === src ? '2px solid var(--accent)' : '1px solid var(--border)',
                        background: 'var(--bg-card)', overflow: 'hidden', position: 'relative',
                        boxShadow: shapeImgSrc === src ? '0 0 0 2px rgba(139,92,246,0.3)' : 'none',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={src}
                        alt={`shape source ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      />
                      {shapeImgSrc === src && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 16 }}>✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                  {shapeImgSrc && (
                    <button
                      onClick={() => setShapeImgSrc(null)}
                      title="Clear shape image"
                      style={{ width: 52, height: 52, borderRadius: 8, border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}
                    >✕</button>
                  )}
                </div>
                {shapeImgSrc && (
                  <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 5, fontWeight: 600 }}>
                    ✓ Using uploaded image as shape watermark
                  </div>
                )}
                <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>Or pick a preset:</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
              {shapePresets.map(({ value, icon }) => (
                <button
                  key={value}
                  onClick={() => { setSilhouetteType(value); setCustomShapeType(''); }}
                  style={{
                    padding: '7px 4px', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', textAlign: 'center',
                    border: activeShapeType === value && !customShapeType ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: activeShapeType === value && !customShapeType ? 'rgba(192,132,252,0.15)' : 'var(--bg-card)',
                    color: activeShapeType === value && !customShapeType ? 'var(--accent)' : 'var(--text-secondary)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ textTransform: 'capitalize' }}>{value}</span>
                </button>
              ))}
            </div>
            {/* Custom type input */}
            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                className="input"
                style={{ flex: 1, fontSize: 12 }}
                placeholder="Or type custom: halloween, wolf…"
                value={customShapeType}
                onChange={e => setCustomShapeType(e.target.value)}
              />
              {customShapeType && (
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setCustomShapeType('')}
                  title="Clear custom"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {customShapeType && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>✓ Using custom label: <strong>{customShapeType}</strong> (watermark = star shape)</div>
            )}
          </div>

          {/* Color schemes */}
          <div>
            <label className="label">Color Scheme</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {colorPresets.map(p => (
                <button key={p.label} onClick={() => { setPrimaryColor(p.fg); setBgColor(p.bg); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 'var(--radius-md)', border: primaryColor===p.fg&&bgColor===p.bg ? '1px solid var(--accent)' : '1px solid var(--border)', background: primaryColor===p.fg&&bgColor===p.bg ? 'rgba(192,132,252,0.1)' : 'var(--bg-card)', cursor: 'pointer' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: p.bg, border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', inset: 4, background: p.fg, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mockup design adjustments */}
          <div>
            <label className="label" style={{ marginBottom: 8, display: 'block' }}>🎯 Design on Mockup</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Size</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{Math.round(mockupScale * 100)}%</span>
                </div>
                <input
                  type="range" min={20} max={100} step={1}
                  value={Math.round(mockupScale * 100)}
                  onChange={e => setMockupScale(Number(e.target.value) / 100)}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Vertical Position</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{mockupOffsetY > 0 ? '+' : ''}{Math.round(mockupOffsetY * 100)}%</span>
                </div>
                <input
                  type="range" min={-30} max={30} step={1}
                  value={Math.round(mockupOffsetY * 100)}
                  onChange={e => setMockupOffsetY(Number(e.target.value) / 100)}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  <span>↑ Move Up</span><span>↓ Move Down</span>
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generate}><Plus size={14} />Generate Thumbnails</button>
          <div className="divider" style={{ margin: 0 }} />
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={downloadAll} disabled={renderTick === 0}><Download size={14} />Download All (ZIP)</button>
        </div>
      </div>

      {/* CENTER */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><h3 style={{ fontSize: 16, fontWeight: 700 }}>Thumbnails</h3><p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>2000 × 2000px · Etsy standard</p></div>
        {renderTick > 0 ? (
          <div className="thumbnail-grid">
            {thumbRefs.map(({ ref, label, key }) => (
              <div key={key} className="thumbnail-item">
                <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
                <div className="thumbnail-overlay"><button className="btn btn-primary btn-sm" onClick={()=>{const c=ref.current;if(!c)return;c.toBlob(b=>{if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`${name||'silhouette'}-${label}.png`;a.click();},'image/png');}}><Download size={12}/>Download</button></div>
                <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.7))',padding:'20px 12px 8px',fontSize:11,color:'white',fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',gap:12,border:'2px dashed var(--border)',borderRadius:'var(--radius-lg)',minHeight:400 }}>
            <Layers size={48} style={{ opacity:0.3 }}/>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:16,fontWeight:600,marginBottom:4 }}>No thumbnails yet</div><div style={{ fontSize:13 }}>Configure your bundle and click Generate</div></div>
          </div>
        )}
      </div>

      {/* RIGHT: SEO */}
      <div style={{ width: 330, flexShrink:0, background:'var(--bg-surface)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize:18,fontWeight:700 }}>✨ SEO Generator</h2>
          <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:2 }}>AI-powered Etsy listing content</p>
        </div>
        <div className="scroll-panel" style={{ padding:16,display:'flex',flexDirection:'column',gap:14 }}>
          <button className="btn btn-primary" style={{ width:'100%' }} onClick={generateSeo} disabled={seoLoading}>
            {seoLoading?<><div className="spinner"/>Generating…</>:<><Sparkles size={15}/>Generate Listing Content</>}
          </button>
          {seo && (
            <div style={{ display:'flex',flexDirection:'column',gap:12,animation:'fadeIn 0.4s ease' }}>
              <div className="card" style={{ padding:14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}><span style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em' }}>Title</span><div style={{ display:'flex',gap:6 }}><span style={{ fontSize:11,color:seo.title.length>120?'var(--warning)':'var(--success)' }}>{seo.title.length}/140</span><button className="btn btn-ghost btn-icon" onClick={()=>copyText(seo.title,'title')}>{copied==='title'?<Check size={12} color="var(--success)"/>:<Copy size={12}/>}</button></div></div>
                <p style={{ fontSize:13,lineHeight:1.6 }}>{seo.title}</p>
              </div>
              <div className="card" style={{ padding:14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}><span style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em' }}>Description</span><button className="btn btn-ghost btn-icon" onClick={()=>copyText(seo.description,'desc')}>{copied==='desc'?<Check size={12} color="var(--success)"/>:<Copy size={12}/>}</button></div>
                <div style={{ fontSize:12,lineHeight:1.7,color:'var(--text-secondary)',whiteSpace:'pre-line',maxHeight:180,overflowY:'auto' }}>{seo.description}</div>
              </div>
              <div className="card" style={{ padding:14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:10 }}><span style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em' }}>Tags ({seo.tags.length}/13)</span><button className="btn btn-ghost btn-icon" onClick={()=>copyText(seo.tags.join(', '),'tags')}>{copied==='tags'?<Check size={12} color="var(--success)"/>:<Copy size={12}/>}</button></div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>{seo.tags.map((tag,i)=><span key={i} className="seo-tag" onClick={()=>copyText(tag,`tag-${i}`)}>{tag}</span>)}</div>
              </div>
              <button className="btn btn-secondary" style={{ width:'100%' }} onClick={()=>copyText(`TITLE:\n${seo.title}\n\nDESCRIPTION:\n${seo.description}\n\nTAGS:\n${seo.tags.join(', ')}`,'all')}>
                {copied==='all'?<><Check size={13}/>Copied!</>:<><Copy size={13}/>Copy All</>}
              </button>
            </div>
          )}
        </div>
      </div>
      {toast && <div className="toast"><span style={{ fontSize:13 }}>{toast}</span><button onClick={()=>setToast('')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',marginLeft:8 }}><X size={14}/></button></div>}
    </div>
  );
}
