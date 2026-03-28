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
    default: { // star
      const s=5;const or=40;const ir=18;ctx.beginPath();
      for(let i=0;i<s*2;i++){const a=i*Math.PI/s-Math.PI/2;const r=i%2===0?or:ir;ctx.lineTo(50+r*Math.cos(a),50+r*Math.sin(a));}
      ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();
}

function drawSilhouetteCover(canvas: HTMLCanvasElement, o: { name: string; count: string; primaryColor: string; bgColor: string; silhouetteType: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const pc=o.primaryColor||'#1A1A1A'; const bg=o.bgColor||'#FFFFFF';

  ctx.fillStyle=bg; ctx.fillRect(0,0,2000,2000);

  // Subtle pattern bg
  ctx.fillStyle=`${pc}08`;
  for(let x=0;x<2000;x+=80)for(let y=0;y<2000;y+=80){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}

  // Large featured silhouette
  const ss = o.silhouetteType || 'butterfly';
  drawSilhouette(ctx,ss,400,250,1200,1200,`${pc}18`);

  // Foreground smaller ones
  const positions=[[80,100],[1700,150],[60,1650],[1720,1700],[900,1600]];
  for(const [sx,sy] of positions) drawSilhouette(ctx,ss,sx,sy,220,220,`${pc}22`);

  // Title block
  ctx.save(); ctx.fillStyle=pc; ctx.shadowBlur=0;
  roundRect(ctx,100,800,1800,500,40); ctx.fill();
  ctx.restore();

  ctx.font='bold 130px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=bg; ctx.textAlign='center';
  ctx.fillText((o.name||'SILHOUETTE BUNDLE').toUpperCase(),1000,960);
  ctx.font='bold 70px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=`${bg}BB`;
  ctx.fillText(`${o.count||'50'}+ SVG Cut Files · Commercial License`,1000,1080);
  ctx.font='55px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=`${bg}77`;
  ctx.fillText('SVG · DXF · PNG · EPS · PDF Formats Included',1000,1160);

  // Tags
  const tags=['Cricut Ready','Silhouette Cameo','Commercial Use','Instant Download'];
  const tW=380,tH=80,tGap=20;const tTotal=tags.length*(tW+tGap)-tGap; let tx=(2000-tTotal)/2;
  for(const t of tags){
    ctx.fillStyle=`${pc}15`;roundRect(ctx,tx,1380,tW,tH,tH/2);ctx.fill();
    ctx.strokeStyle=`${pc}44`;ctx.lineWidth=2;roundRect(ctx,tx,1380,tW,tH,tH/2);ctx.stroke();
    ctx.font='bold 32px "HN",Arial,sans-serif';ctx.fillStyle=pc;ctx.textAlign='center';ctx.fillText(t,tx+tW/2,1428);
    tx+=tW+tGap;
  }
}

function drawSilhouetteGrid(canvas: HTMLCanvasElement, o: { name: string; primaryColor: string; bgColor: string; silhouetteType: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const pc=o.primaryColor||'#1A1A1A'; const bg=o.bgColor||'#FFFFFF';

  ctx.fillStyle=bg; ctx.fillRect(0,0,2000,2000);

  ctx.font='bold 90px "HN",Arial,sans-serif'; ctx.fillStyle=pc; ctx.textAlign='center';
  ctx.fillText('PREVIEW — ALL DESIGNS',1000,130);
  ctx.fillStyle=`${pc}33`; ctx.fillRect(200,155,1600,5);

  // 4x4 grid of silhouettes
  const types=['butterfly','bird','tree','flower','deer','cat','star','butterfly','bird','tree','flower','deer','cat','star','butterfly','bird'];
  const cols=4, rows=4, cellW=420, cellH=420, gX=40, gY=30;
  const sX=(2000-(cols*cellW+(cols-1)*gX))/2;
  const sY=200;

  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const i=r*cols+c;
    const x=sX+c*(cellW+gX); const y=sY+r*(cellH+gY);
    ctx.fillStyle=`${pc}0A`; roundRect(ctx,x,y,cellW,cellH,16); ctx.fill();
    ctx.strokeStyle=`${pc}22`; ctx.lineWidth=2; roundRect(ctx,x,y,cellW,cellH,16); ctx.stroke();
    drawSilhouette(ctx,types[i]||o.silhouetteType,x+40,y+40,cellW-80,cellH-80,pc);
  }

  ctx.font='bold 55px "HN",Arial,sans-serif'; ctx.fillStyle=pc; ctx.textAlign='center';
  ctx.fillText(o.name||'Silhouette Bundle',1000,1900);
  ctx.font='38px "HN",Arial,sans-serif'; ctx.fillStyle=`${pc}88`;
  ctx.fillText('SVG · DXF · PNG · EPS · PDF · Cricut · Silhouette Cameo',1000,1960);
}

function drawSilhouetteUsage(canvas: HTMLCanvasElement, o: { name: string; primaryColor: string; bgColor: string; silhouetteType: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const pc=o.primaryColor||'#1A1A1A'; const bg=o.bgColor||'#FFFFFF';

  const grad=ctx.createLinearGradient(0,0,2000,2000);
  grad.addColorStop(0,bg==='#FFFFFF'?'#F0F0F0':bg); grad.addColorStop(1,bg==='#FFFFFF'?'#E8E8E8':'#111');
  ctx.fillStyle=grad; ctx.fillRect(0,0,2000,2000);

  ctx.font='bold 100px "HN",Arial,sans-serif'; ctx.fillStyle=pc; ctx.textAlign='center';
  ctx.fillText('PERFECT FOR',1000,150);
  ctx.fillStyle=`${pc}33`; ctx.fillRect(400,175,1200,5);

  const usages=[{icon:'🖨️',title:'Cricut & Silhouette',desc:'Cut machine ready — simply upload & cut'},{icon:'👕',title:'T-Shirts & Apparel',desc:'Screen printing & heat transfer designs'},{icon:'🎀',title:'Cards & Invitations',desc:'Wedding, birthday & party stationery'},{icon:'☕',title:'Mugs & Decals',desc:'Sublimation and vinyl projects'},{icon:'📦',title:'Product Packaging',desc:'Labels, boxes & sticker designs'},{icon:'🪟',title:'Wall Art & Decor',desc:'Home decor prints and wall stickers'}];

  const uW=560,uH=350,uG=50,uSX=(2000-(3*uW+2*uG))/2;
  usages.forEach((u,i)=>{
    const col=i%3; const row=Math.floor(i/3);
    const ux=uSX+col*(uW+uG); const uy=230+row*(uH+uG);
    ctx.fillStyle=bg==='#FFFFFF'?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.08)';
    roundRect(ctx,ux,uy,uW,uH,24);ctx.fill();
    ctx.strokeStyle=`${pc}22`;ctx.lineWidth=2;roundRect(ctx,ux,uy,uW,uH,24);ctx.stroke();
    ctx.font='80px Arial';ctx.textAlign='center';ctx.fillText(u.icon,ux+uW/2,uy+110);
    ctx.font='bold 44px "HN",Arial,sans-serif';ctx.fillStyle=pc;ctx.fillText(u.title,ux+uW/2,uy+182);
    ctx.font='30px "HN",Arial,sans-serif';ctx.fillStyle=`${pc}88`;ctx.fillText(u.desc,ux+uW/2,uy+230);

    // Mini silhouette
    drawSilhouette(ctx,o.silhouetteType||'butterfly',ux+uW/2-30,uy+248,60,60,`${pc}44`);
  });

  ctx.font='bold 65px "HN",Arial,sans-serif';ctx.fillStyle=pc;ctx.textAlign='center';
  ctx.fillText('Commercial License Included — Use in Client Projects',1000,1860);
  ctx.font='44px "HN",Arial,sans-serif';ctx.fillStyle=`${pc}66`;
  ctx.fillText('Personal & Commercial use permitted · No attribution required',1000,1930);
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

      // Card background with subtle shadow effect
      ctx.fillStyle = `${pc}0A`;
      roundRect(ctx, cx - 4, cy - 4, cellW + 8, cellH + 8, 20); ctx.fill();

      // Draw image — cover fit
      ctx.save();
      roundRect(ctx, cx, cy, cellW, cellH, 16);
      ctx.clip();

      const img = imgs[i];
      const iAspect = img.naturalWidth / img.naturalHeight;
      const cAspect = cellW / cellH;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (iAspect > cAspect) {
        // Image is wider — fit height
        drawH = cellH; drawW = drawH * iAspect;
        drawX = cx + (cellW - drawW) / 2; drawY = cy;
      } else {
        // Image is taller — fit width
        drawW = cellW; drawH = drawW / iAspect;
        drawX = cx; drawY = cy + (cellH - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Accent border
      ctx.strokeStyle = `${pc}33`; ctx.lineWidth = 3;
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

export default function SilhouetteCreatorPage() {

  const [name, setName] = useState('');
  const [count, setCount] = useState('50');
  const [primaryColor, setPrimaryColor] = useState('#1A1A1A');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [silhouetteType, setSilhouetteType] = useState('butterfly');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [seo, setSeo] = useState<SeoResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [rendered, setRendered] = useState(false);

  const coverRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const usageRef = useRef<HTMLCanvasElement>(null);
  const fmtRef = useRef<HTMLCanvasElement>(null);
  const uploadsRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const thumbRefs = [
    { ref: coverRef, label: 'Bundle Cover', key: 'cover' },
    { ref: gridRef, label: 'Preview Grid', key: 'grid' },
    { ref: usageRef, label: 'Usage Ideas', key: 'usage' },
    { ref: fmtRef, label: 'File Formats', key: 'formats' },
    { ref: uploadsRef, label: 'Your Designs', key: 'uploads' },
  ];

  // Store the last generate options so useEffect can draw after canvases mount
  const drawOptsRef = useRef<{ name: string; count: string; primaryColor: string; bgColor: string; silhouetteType: string; images: string[] } | null>(null);

  const generate = useCallback(() => {
    const opts = { name, count, primaryColor, bgColor, silhouetteType, images: uploadedImages };
    drawOptsRef.current = opts;
    // Mount canvases first — draw in useEffect below
    setRendered(true);
  }, [name, count, primaryColor, bgColor, silhouetteType, uploadedImages]);

  // Draw when canvases are mounted (after rendered becomes true or options change)
  useEffect(() => {
    if (!rendered || !drawOptsRef.current) return;
    const o = drawOptsRef.current;
    const doRender = async () => {
      if (coverRef.current)  drawSilhouetteCover(coverRef.current, o);
      if (gridRef.current)   drawSilhouetteGrid(gridRef.current, o);
      if (usageRef.current)  drawSilhouetteUsage(usageRef.current, o);
      if (fmtRef.current)    drawSilhouetteFormats(fmtRef.current, o);
      if (uploadsRef.current) await drawUploadedGrid(uploadsRef.current, o.images, o);
    };
    // Small delay to ensure canvas elements are in the DOM
    const t = setTimeout(doRender, 30);
    return () => clearTimeout(t);
  }, [rendered]);

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

  const shapeTypes = ['butterfly','bird','tree','flower','deer','cat','star'];

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

          {/* Shape type */}
          <div>
            <label className="label">Main Shape Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {shapeTypes.map(t => (
                <button key={t} onClick={() => setSilhouetteType(t)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: silhouetteType===t ? '2px solid var(--accent)' : '1px solid var(--border)', background: silhouetteType===t ? 'rgba(192,132,252,0.15)' : 'var(--bg-card)', color: silhouetteType===t ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {t}
                </button>
              ))}
            </div>
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

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generate}><Plus size={14} />Generate Thumbnails</button>
          <div className="divider" style={{ margin: 0 }} />
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={downloadAll} disabled={!rendered}><Download size={14} />Download All (ZIP)</button>
        </div>
      </div>

      {/* CENTER */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><h3 style={{ fontSize: 16, fontWeight: 700 }}>Thumbnails</h3><p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>2000 × 2000px · Etsy standard</p></div>
        {rendered ? (
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
