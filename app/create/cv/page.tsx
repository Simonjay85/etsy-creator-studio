'use client';
import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { Upload, Download, Sparkles, Copy, Check, X, Image as ImageIcon, Plus, FileText } from 'lucide-react';

interface SeoResult { title: string; description: string; tags: string[]; }

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

// Renders a PDF-sourced image onto a 2000x2000 thumbnail with branded frame
function drawPdfThumbnail(canvas: HTMLCanvasElement, pdfImg: HTMLImageElement, o: { name: string; role: string; accentColor: string }) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 2000; canvas.height = 2000;
  const ac = o.accentColor || '#1B2A4A';

  // Background
  ctx.fillStyle = '#F0EEF8';
  ctx.fillRect(0, 0, 2000, 2000);

  // Subtle dot grid
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let x = 0; x < 2000; x += 55) for (let y = 0; y < 2000; y += 55) {
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // Top label bar
  ctx.fillStyle = ac;
  ctx.fillRect(0, 0, 2000, 96);
  ctx.font = 'bold 46px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText((o.name || 'CV TEMPLATE').toUpperCase(), 60, 64);
  ctx.font = '34px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'right';
  ctx.fillText((o.role || 'Professional Resume').toUpperCase(), 1940, 64);

  // PDF page preview — centered with shadow
  const margin = 120;
  const previewX = margin;
  const previewY = 140;
  const previewW = 2000 - margin * 2;
  const previewH = 1640;

  ctx.save();
  ctx.shadowBlur = 60; ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, previewX, previewY, previewW, previewH, 12); ctx.fill();
  ctx.restore();

  // Draw PDF image fit inside preview area
  const imgAspect = pdfImg.naturalWidth / pdfImg.naturalHeight;
  const boxAspect = previewW / previewH;
  let drawW = previewW, drawH = previewH, drawX = previewX, drawY = previewY;
  if (imgAspect > boxAspect) {
    drawH = previewW / imgAspect;
    drawY = previewY + (previewH - drawH) / 2;
  } else {
    drawW = previewH * imgAspect;
    drawX = previewX + (previewW - drawW) / 2;
  }

  ctx.save();
  roundRect(ctx, previewX, previewY, previewW, previewH, 12); ctx.clip();
  ctx.drawImage(pdfImg, drawX, drawY, drawW, drawH);
  ctx.restore();

  // Accent border on preview
  ctx.strokeStyle = `${ac}55`;
  ctx.lineWidth = 4;
  roundRect(ctx, previewX, previewY, previewW, previewH, 12); ctx.stroke();

  // Bottom strip
  ctx.fillStyle = ac;
  ctx.fillRect(0, 1904, 2000, 96);

  const badges = ['✓ Fully Editable', '✓ ATS Friendly', '✓ Instant Download', '✓ Commercial Use'];
  const bW = 400, bGap = 60;
  const bTotal = badges.length * bW + (badges.length - 1) * bGap;
  let bx = (2000 - bTotal) / 2;
  ctx.font = 'bold 34px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center';
  for (const b of badges) {
    ctx.fillText(b, bx + bW / 2, 1960);
    bx += bW + bGap;
  }
}

function drawCvFront(canvas: HTMLCanvasElement, o: { name: string; role: string; accentColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const ac = o.accentColor || '#1B2A4A';
  ctx.fillStyle = '#F8F8F6'; ctx.fillRect(0,0,2000,2000);
  ctx.fillStyle = ac; ctx.fillRect(0,0,2000,360);
  ctx.font = 'bold 130px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left';
  ctx.fillText((o.name || 'DANIEL RICHARD').toUpperCase(), 80, 210);
  ctx.font = '60px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText((o.role || 'PROJECT MANAGER').toUpperCase(), 80, 295);
  const icons = ['🌐', '✉️', '📱', '💼'];
  const labels = ['yourwebsite.com','email@domain.com','(123) 456-7890','linkedin.com/in/you'];
  icons.forEach((icon, i) => {
    const x = 80 + i * 460;
    ctx.font = '36px Arial'; ctx.fillText(icon, x, 355);
    ctx.font = '32px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(labels[i], x+46, 355);
  });
  const colX = 80, colW = 560;
  let y = 440;
  const sectionHead = (title: string, yy: number) => {
    ctx.font = 'bold 48px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = ac; ctx.textAlign = 'left'; ctx.fillText(title.toUpperCase(), colX, yy);
    ctx.fillStyle = ac; ctx.fillRect(colX, yy+10, colW, 4);
  };
  sectionHead('Contact', y); y += 70;
  const contacts = ['📍 City, Country 12345','📞 +00 123-456-789','✉️ email@example.com','🌐 www.yourwebsite.com','💼 linkedin.com/in/you'];
  contacts.forEach(c => { ctx.font='34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#444'; ctx.fillText(c,colX,y); y+=58; });
  y+=30; sectionHead('Education', y); y+=70;
  [['DEGREE · CERTIFICATE','2020 - 2022'],['DEGREE · CERTIFICATE','2016 - 2020']].forEach(([deg,yr]) => {
    ctx.font='bold 36px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#222'; ctx.fillText(deg,colX,y);
    ctx.font='30px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#888'; ctx.fillText(yr,colX,y+46); y+=110;
  });
  y+=30; sectionHead('Language', y); y+=70;
  [['English','Native'],['Spanish','Intermediate'],['French','Basic']].forEach(([lang,lvl]) => {
    ctx.font='bold 34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#222'; ctx.fillText(lang,colX,y);
    ctx.font='30px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#888'; ctx.fillText(lvl,colX,y+40);
    ctx.fillStyle='#EEE'; roundRect(ctx,colX,y+55,colW*0.8,10,5); ctx.fill();
    ctx.fillStyle=ac;
    const pct = lang==='English'?1.0:lang==='Spanish'?0.65:0.35;
    roundRect(ctx,colX,y+55,colW*0.8*pct,10,5); ctx.fill();
    y+=110;
  });
  const rX = 700, rW = 1220;
  let ry = 440;
  const rSection = (title: string, yy: number) => {
    ctx.font='bold 48px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=ac; ctx.textAlign='left'; ctx.fillText(title.toUpperCase(),rX,yy);
    ctx.fillStyle=ac; ctx.fillRect(rX,yy+10,rW,4);
  };
  rSection('Professional Profile', ry); ry+=80;
  const profileText='A highly motivated professional with extensive experience in project management and team leadership. Proven track record of delivering projects on time and within budget across multiple industries. Strong communicator with exceptional analytical skills.';
  ctx.font='36px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#555';
  const words=profileText.split(' '); let line=''; const lineH=56; const maxW=rW;
  for(const w of words){const test=line?`${line} ${w}`:w;if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line,rX,ry);ry+=lineH;line=w;}else{line=test;}}
  if(line){ctx.fillText(line,rX,ry);ry+=lineH;}
  ry+=40; rSection('Experience', ry); ry+=80;
  [['WRITE YOUR JOB TITLE HERE','Company Name · 2021 – Present'],['WRITE YOUR JOB TITLE HERE','Company Name · 2018 – 2021'],['WRITE YOUR JOB TITLE HERE','Company Name · 2015 – 2018']].forEach(([title2,company]) => {
    ctx.font='bold 40px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#222'; ctx.fillText(title2,rX,ry);
    ctx.font='34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=ac; ctx.fillText(company,rX,ry+48);
    ctx.font='30px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#666';
    ['• Describe key achievement and responsibility here','• Another notable accomplishment or key task','• Third bullet showcasing impact and results'].forEach((b,i)=>{ctx.fillText(b,rX+20,ry+100+i*46);});
    ry+=320;
  });
  ctx.fillStyle=ac; ctx.fillRect(0,1920,2000,80);
  ctx.font='34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.textAlign='center';
  ctx.fillText('Fully Editable Template · ATS-Friendly · Instant Download',1000,1968);
}

function drawCvSpread(canvas: HTMLCanvasElement, o: { name: string; role: string; accentColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const ac = o.accentColor || '#1B2A4A';
  ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,2000,2000);
  const pageW=920, pageH=1700, gap=40, startY=150;
  const pages=[{x:60},{x:60+pageW+gap}];
  pages.forEach((p,pi) => {
    ctx.save(); ctx.shadowBlur=30; ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowOffsetY=5;
    ctx.fillStyle='#FAFAFA'; roundRect(ctx,p.x,startY,pageW,pageH,8); ctx.fill();
    ctx.restore();
    ctx.fillStyle=ac; ctx.fillRect(p.x,startY,pageW,200);
    ctx.font='bold 55px "HN",Arial,sans-serif'; ctx.fillStyle='#FFF'; ctx.textAlign='left';
    ctx.fillText((o.name||'DANIEL RICHARD').toUpperCase(),p.x+30,startY+90);
    ctx.font='36px "HN",Arial,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.fillText(o.role||'Project Manager',p.x+30,startY+150);
    const sections=pi===0?[['EXPERIENCE',4],['EDUCATION',3],['SKILLS',5]]:[['EXPERTISE',6],['INTERESTS',4],['AWARDS',3]];
    let sy=startY+240;
    for(const [title,lines] of sections) {
      ctx.font='bold 38px "HN",Arial,sans-serif'; ctx.fillStyle=ac; ctx.textAlign='left';
      ctx.fillText(title as string,p.x+30,sy); sy+=10;
      ctx.fillStyle=ac; ctx.fillRect(p.x+30,sy,pageW-60,3); sy+=28;
      for(let i=0;i<(lines as number);i++){
        const isSub=i%2===1;
        ctx.fillStyle=isSub?'#BBB':'#DDD'; ctx.fillRect(p.x+30,sy,isSub?(pageW-80)*0.65:(pageW-80),22); sy+=38;
      }
      sy+=40;
    }
  });
  ctx.font='bold 70px "HN",Arial,sans-serif'; ctx.fillStyle='#1A1A1A'; ctx.textAlign='center';
  ctx.fillText(o.name?.toUpperCase()||'RESUME TEMPLATE',1000,100);
  ctx.font='40px "HN",Arial,sans-serif'; ctx.fillStyle='#888';
  ctx.fillText(o.role?.toUpperCase()||'PROFESSIONAL CV',1000,155);
  const badges=['✓ Fully Editable','✓ ATS Friendly','✓ MS Word & Google Docs','✓ A4 & US Letter','✓ Instant Download','✓ Cover Letter Included'];
  const bW=290,bH=90,bGap=20,totalB=badges.length;
  const bStartX=(2000-(totalB/2*bW+(totalB/2-1)*bGap))/2;
  badges.forEach((b,i)=>{
    const row=Math.floor(i/(totalB/2));const col=i%(totalB/2);
    const bx=bStartX+col*(bW+bGap); const by=startY+pageH+80+row*(bH+12);
    ctx.fillStyle=`${ac}22`; roundRect(ctx,bx,by,bW,bH,10); ctx.fill();
    ctx.strokeStyle=`${ac}44`; ctx.lineWidth=1.5; roundRect(ctx,bx,by,bW,bH,10); ctx.stroke();
    ctx.font='bold 28px "HN",Arial,sans-serif'; ctx.fillStyle=ac; ctx.textAlign='center';
    ctx.fillText(b,bx+bW/2,by+55);
  });
}

function drawCvFeatures(canvas: HTMLCanvasElement, o: { name: string; accentColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const ac=o.accentColor||'#1B2A4A';
  const grad=ctx.createLinearGradient(0,0,2000,2000);
  grad.addColorStop(0,ac); grad.addColorStop(1,'#2D4A8A');
  ctx.fillStyle=grad; ctx.fillRect(0,0,2000,2000);
  ctx.fillStyle='rgba(255,255,255,0.05)';
  for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(2200,(i+1)*400,300,0,Math.PI*2);ctx.fill();}
  ctx.font='bold 100px "HN",Arial,sans-serif'; ctx.fillStyle='#FFF'; ctx.textAlign='center';
  ctx.fillText((o.name||'RESUME TEMPLATE').toUpperCase(),1000,150);
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(400,175,1200,4);
  const feats=[{e:'📝',t:'Fully Editable',d:'Every section is easy to customise in MS Word & Google Docs'},{e:'🤖',t:'ATS Friendly',d:'Passes Applicant Tracking Systems for higher interview rates'},{e:'📄',t:'Multiple Formats',d:'Includes A4, US Letter, Word, Google Docs & PDF versions'},{e:'📬',t:'Cover Letter',d:'Matching cover letter template included in the package'},{e:'🎨',t:'Easy to Customise',d:'Change colors, fonts & layout with a few simple clicks'},{e:'⚡',t:'Instant Download',d:'Direct PDF/ZIP delivery immediately after purchase'}];
  const fW=560,fH=320,fGap=50,fSX=(2000-(3*fW+2*fGap))/2;
  feats.forEach((f,i)=>{
    const col=i%3; const row=Math.floor(i/3);
    const fx=fSX+col*(fW+fGap); const fy=240+row*(fH+fGap);
    ctx.fillStyle='rgba(255,255,255,0.1)'; roundRect(ctx,fx,fy,fW,fH,24); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5; roundRect(ctx,fx,fy,fW,fH,24); ctx.stroke();
    ctx.font='75px Arial'; ctx.textAlign='center'; ctx.fillText(f.e,fx+fW/2,fy+105);
    ctx.font='bold 42px "HN",Arial,sans-serif'; ctx.fillStyle='#FFF'; ctx.fillText(f.t,fx+fW/2,fy+175);
    ctx.font='30px "HN",Arial,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.65)';
    const wds=f.d.split(' '); let line2=''; let ly=fy+225;
    for(const w of wds){const test=line2?`${line2} ${w}`:w;if(ctx.measureText(test).width>fW-40&&line2){ctx.fillText(line2,fx+fW/2,ly);ly+=42;line2=w;}else line2=test;}
    if(line2)ctx.fillText(line2,fx+fW/2,ly);
  });
  ctx.font='bold 60px "HN",Arial,sans-serif'; ctx.fillStyle='#FFF'; ctx.textAlign='center';
  ctx.fillText('Professional · Clean · Modern · Ready to Send',1000,1830);
  ctx.font='44px "HN",Arial,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.fillText('Compatible with Microsoft Word, Google Docs, Apple Pages',1000,1910);
}

function drawCvMockup(canvas: HTMLCanvasElement, o: { name: string; role: string; accentColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  ctx.fillStyle='#F0EEF8'; ctx.fillRect(0,0,2000,2000);
  ctx.fillStyle='rgba(0,0,0,0.05)';
  for(let x=0;x<2000;x+=60)for(let y=0;y<2000;y+=60){ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();}
  const ac=o.accentColor||'#1B2A4A';
  const pageW=1200, pageH=1700;
  const px=(2000-pageW)/2, py=(2000-pageH)/2;
  ctx.save(); ctx.shadowBlur=80; ctx.shadowColor='rgba(0,0,0,0.25)'; ctx.shadowOffsetY=20;
  ctx.fillStyle='#FAFAFA'; ctx.fillRect(px,py,pageW,pageH); ctx.restore();
  ctx.fillStyle=ac; ctx.fillRect(px,py,pageW,250);
  ctx.font='bold 80px "HN",Arial,sans-serif'; ctx.fillStyle='#FFF'; ctx.textAlign='left';
  ctx.fillText((o.name||'DANIEL RICHARD').toUpperCase(),px+40,py+130);
  ctx.font='48px "HN",Arial,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.75)';
  ctx.fillText(o.role||'Project Manager',px+40,py+200);
  let ly=py+310;
  const sections=['EXPERIENCE','EDUCATION','SKILLS','REFERENCES'];
  sections.forEach(s=>{
    ctx.font='bold 44px "HN",Arial,sans-serif'; ctx.fillStyle=ac; ctx.textAlign='left'; ctx.fillText(s,px+40,ly); ly+=15;
    ctx.fillStyle=ac; ctx.fillRect(px+40,ly,pageW-80,3); ly+=20;
    for(let i=0;i<(s==='SKILLS'?4:3);i++){const w2=s==='SKILLS'?Math.random()*0.5+0.3:(i===0?0.9:0.6);ctx.fillStyle='#E0E0E0';ctx.fillRect(px+40,ly,pageW-80,22);ctx.fillStyle=ac+'88';ctx.fillRect(px+40,ly,(pageW-80)*w2,22);ly+=48;}
    ly+=30;
  });
  ctx.font='bold 56px "HN",Arial,sans-serif'; ctx.fillStyle='#222'; ctx.textAlign='center';
  ctx.fillText(o.name?.toUpperCase()||'RESUME TEMPLATE',1000,py-70);
  ctx.font='38px "HN",Arial,sans-serif'; ctx.fillStyle='#888';
  ctx.fillText('Professional · ATS-Friendly · Fully Editable',1000,py-15);
  const badges2=[{e:'📝',t:'MS Word'},{e:'📊',t:'Google Docs'},{e:'📄',t:'PDF'},{e:'📐',t:'A4 + Letter'}];
  const bW2=350,bH2=100,bGap2=25,bTW=badges2.length*(bW2+bGap2)-bGap2,bSX=(2000-bTW)/2;
  badges2.forEach((b,i)=>{
    const bx=bSX+i*(bW2+bGap2),bY=py+pageH+60;
    ctx.fillStyle='rgba(255,255,255,0.9)'; roundRect(ctx,bx,bY,bW2,bH2,12); ctx.fill();
    ctx.strokeStyle=`${ac}33`; ctx.lineWidth=1.5; roundRect(ctx,bx,bY,bW2,bH2,12); ctx.stroke();
    ctx.font='35px Arial'; ctx.fillText(b.e,bx+40,bY+66);
    ctx.font='bold 34px "HN",Arial,sans-serif'; ctx.fillStyle=ac; ctx.textAlign='left';
    ctx.fillText(b.t,bx+90,bY+66);
  });
}

// ── Features Panel (split: PDF left, bullets right — like listing image 1) ──
function drawCvFeaturesPanel(
  canvas: HTMLCanvasElement,
  o: { name: string; role: string; accentColor: string; features: string },
  pdfImg: HTMLImageElement | null
) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 2000; canvas.height = 2000;
  const ac = o.accentColor || '#1B2A4A';

  // Soft warm background
  ctx.fillStyle = '#F0EEF5';
  ctx.fillRect(0, 0, 2000, 2000);

  // ── LEFT: CV page shadow card ──
  const leftW = 1080;
  ctx.save();
  ctx.shadowBlur = 60; ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowOffsetX = 6; ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(60, 60, leftW - 80, 1880);
  ctx.restore();

  if (pdfImg) {
    ctx.save();
    ctx.beginPath(); ctx.rect(60, 60, leftW - 80, 1880); ctx.clip();
    const imgAspect = pdfImg.naturalWidth / pdfImg.naturalHeight;
    const boxAspect = (leftW - 80) / 1880;
    let dw = leftW - 80, dh = 1880, dx = 60, dy = 60;
    if (imgAspect > boxAspect) { dh = (leftW - 80) / imgAspect; dy = 60 + (1880 - dh) / 2; }
    else { dw = 1880 * imgAspect; dx = 60 + ((leftW - 80) - dw) / 2; }
    ctx.drawImage(pdfImg, dx, dy, dw, dh);
    ctx.restore();
  } else {
    // Placeholder simplified CV
    ctx.fillStyle = ac; ctx.fillRect(60, 60, leftW - 80, 240);
    ctx.font = 'bold 70px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'left';
    ctx.fillText((o.name || 'JOHN EVEREST').toUpperCase(), 100, 200);
    ctx.font = '48px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(o.role || 'Job Title Here', 100, 268);
    // Content line stubs
    let ly2 = 360;
    for (let s = 0; s < 3; s++) {
      ctx.fillStyle = ac; ctx.fillRect(100, ly2, 300, 3); ly2 += 16;
      for (let i = 0; i < 4; i++) { ctx.fillStyle = '#DDD'; ctx.fillRect(100, ly2, i % 2 === 0 ? 280 : 180, 16); ly2 += 30; }
      ly2 += 24;
    }
    for (let s = 0; s < 2; s++) {
      ctx.fillStyle = ac; ctx.fillRect(490, 360 + s * 280, 500, 3);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = '#DDD'; ctx.fillRect(490, 376 + s * 280 + i * 30, i % 3 === 0 ? 460 : 320, 16); }
    }
  }

  // ── RIGHT: Features panel ──
  const rightX = leftW + 40;
  const rightW = 2000 - rightX - 60;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(rightX - 10, 0, 2000 - rightX + 10, 2000);
  // Accent top bar
  ctx.fillStyle = ac;
  ctx.fillRect(rightX - 10, 0, 2000 - rightX + 10, 14);

  // Title (auto-wrap)
  const title = o.name || 'Professional Resume Template';
  ctx.font = 'bold 82px "Helvetica Neue",Arial,sans-serif';
  const titleWords = title.split(' ');
  let tLine = ''; const tLines: string[] = [];
  for (const w of titleWords) {
    const test = tLine ? `${tLine} ${w}` : w;
    if (ctx.measureText(test).width > rightW - 30) { tLines.push(tLine); tLine = w; } else tLine = test;
  }
  if (tLine) tLines.push(tLine);
  let ty = 180;
  ctx.fillStyle = '#1A1A2E'; ctx.textAlign = 'center';
  for (const line of tLines.slice(0, 3)) {
    ctx.font = 'bold 82px "Helvetica Neue",Arial,sans-serif';
    ctx.fillText(line, rightX + rightW / 2, ty);
    ty += 100;
  }

  // Divider
  ty += 30;
  ctx.fillStyle = `${ac}40`; ctx.fillRect(rightX + 20, ty, rightW - 40, 3);
  ty += 55;

  // Feature bullets (parse each line)
  const rawFeatures = (o.features || '1, 2, 3-page\nReference Page\nCover Letter\n400+ icon set')
    .split('\n').map(l => l.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean).slice(0, 9);

  ctx.textAlign = 'left';
  for (const feat of rawFeatures) {
    // Bullet dot
    ctx.fillStyle = ac;
    ctx.beginPath(); ctx.arc(rightX + 36, ty - 18, 13, 0, Math.PI * 2); ctx.fill();
    ctx.font = '58px "Helvetica Neue",Arial,sans-serif';
    ctx.fillStyle = '#2A2A2A';
    ctx.fillText(feat.length > 30 ? feat.substring(0, 28) + '…' : feat, rightX + 68, ty);
    ty += 84;
  }

  // Bottom badge
  const bY = 1760;
  ctx.save();
  ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.08)';
  roundRect(ctx, rightX + 20, bY, rightW - 40, 170, 18); ctx.fillStyle = '#F7F7F7'; ctx.fill();
  ctx.restore();
  ctx.strokeStyle = `${ac}33`; ctx.lineWidth = 2;
  roundRect(ctx, rightX + 20, bY, rightW - 40, 170, 18); ctx.stroke();
  // W icon
  ctx.font = 'bold 80px Arial'; ctx.fillStyle = ac; ctx.textAlign = 'left';
  ctx.fillText('W', rightX + 40, bY + 118);
  ctx.font = '36px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#888';
  ctx.fillText('Made with', rightX + 130, bY + 68);
  ctx.font = 'bold 44px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = ac;
  ctx.fillText('Microsoft Office Word', rightX + 130, bY + 126);
}

// Helper: minimal doc-style icon
function drawDocIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, label: string, ac: string) {
  const x = cx - w / 2, y = cy - h / 2;
  const fold = w * 0.28;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CCCCCC'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + w - fold, y);
  ctx.lineTo(x + w, y + fold);
  ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Fold triangle
  ctx.fillStyle = '#EEEEEE';
  ctx.beginPath();
  ctx.moveTo(x + w - fold, y); ctx.lineTo(x + w, y + fold); ctx.lineTo(x + w - fold, y + fold); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Lines inside
  ctx.fillStyle = `${ac}55`;
  for (let i = 0; i < 3; i++) {
    const lw = i === 0 ? w * 0.55 : w * 0.40;
    ctx.fillRect(x + 10, y + h * 0.38 + i * (h * 0.14), lw, h * 0.07);
  }
  // Label shortcode inside icon
  if (label) {
    ctx.font = `bold ${Math.round(h * 0.22)}px "Helvetica Neue",Arial,sans-serif`;
    ctx.fillStyle = ac; ctx.textAlign = 'center';
    ctx.fillText(label.length > 4 ? label.substring(0, 4) : label, cx, cy + h * 0.1);
  }
}

// ── What You'll Get (like listing image 4) ──
function drawCvWhatYouGet(
  canvas: HTMLCanvasElement,
  o: { name: string; accentColor: string; whatYouGet: string },
  pdfImg: HTMLImageElement | null
) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 2000; canvas.height = 2000;
  const ac = o.accentColor || '#1B2A4A';

  // Warm gray background
  ctx.fillStyle = '#E8E6E3';
  ctx.fillRect(0, 0, 2000, 2000);

  // ── Decorative corner elements ──
  // Top-right: leaf shapes
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(1950 + i * 20, 120 + i * 80);
    ctx.rotate(-0.5 - i * 0.15);
    const lg = ctx.createLinearGradient(-60, -120, 60, 140);
    lg.addColorStop(0, `#5A8A4A`); lg.addColorStop(1, `#3A6A2A`);
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.ellipse(0, 0, 55 + i * 10, 140 + i * 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bottom-left: rotated pages peeking
  if (pdfImg) {
    ctx.save();
    ctx.translate(100, 1920);
    ctx.rotate(-0.14);
    ctx.globalAlpha = 0.55;
    ctx.drawImage(pdfImg, -60, -340, 380, 480);
    ctx.globalAlpha = 1;
    ctx.restore();
    // Second page slightly behind
    ctx.save();
    ctx.translate(140, 1930);
    ctx.rotate(-0.06);
    ctx.globalAlpha = 0.35;
    ctx.drawImage(pdfImg, -60, -320, 380, 480);
    ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    // Placeholder white page stubs
    ctx.save(); ctx.translate(80, 1960); ctx.rotate(-0.14);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-60, -360, 340, 440); ctx.restore();
    ctx.save(); ctx.translate(130, 1970); ctx.rotate(-0.04);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-60, -340, 340, 440); ctx.restore();
  }

  // Center frosted card
  const cX = 160, cY = 140, cW = 1680, cH = 1720;
  ctx.save();
  ctx.shadowBlur = 40; ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowOffsetY = 8;
  roundRect(ctx, cX, cY, cW, cH, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fill();
  ctx.restore();

  // Title
  ctx.font = 'italic 120px Georgia,serif';
  ctx.fillStyle = '#2A2A2A'; ctx.textAlign = 'center';
  ctx.fillText("What you'll get", 1000, 360);

  // Soft underline
  ctx.fillStyle = `${ac}30`;
  ctx.fillRect(cX + 280, 390, cW - 560, 4);

  // Parse items (each line = one item; emoji at start is used as icon)
  const rawItems = (o.whatYouGet || 'DOCX Template Files\nA4 & US Letter\n400+ Icons\nFont Used\nResume Writing Guide\nInstruction')
    .split('\n').map(l => l.trim()).filter(Boolean).slice(0, 6);

  const cols = 3;
  const iW = 460, iH = 480, iGapX = 80, iGapY = 60;
  const gridW = cols * iW + (cols - 1) * iGapX;
  const gridX = (2000 - gridW) / 2;
  const gridY = 460;

  rawItems.forEach((item, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const ix = gridX + col * (iW + iGapX);
    const iy = gridY + row * (iH + iGapY);
    const cx2 = ix + iW / 2;

    // Extract optional emoji prefix
    const emojiRx = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|[\u{1F300}-\u{1FAFF}])\s*/u;
    const m = item.match(emojiRx);
    const emoji = m ? m[0].trim() : '';
    const label = emoji ? item.replace(emojiRx, '').trim() : item;
    const shortCode = label.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase();

    if (emoji) {
      ctx.font = '110px Arial'; ctx.fillStyle = '#555';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, cx2, iy + 140);
    } else {
      drawDocIcon(ctx, cx2, iy + 90, 110, 140, shortCode, ac);
    }

    // Label text (wrap to 2 lines)
    const labelWords = label.split(' ');
    let lLine = ''; const lLines: string[] = [];
    ctx.font = 'bold 44px "Helvetica Neue",Arial,sans-serif';
    for (const w of labelWords) {
      const test = lLine ? `${lLine} ${w}` : w;
      if (ctx.measureText(test).width > iW - 20) { lLines.push(lLine); lLine = w; } else lLine = test;
    }
    if (lLine) lLines.push(lLine);
    let lly = iy + (emoji ? 200 : 210);
    ctx.fillStyle = '#333333'; ctx.textAlign = 'center';
    for (const ll of lLines.slice(0, 2)) {
      ctx.fillText(ll, cx2, lly); lly += 56;
    }
  });

  // Bottom name
  ctx.font = `bold 52px "Helvetica Neue",Arial,sans-serif`;
  ctx.fillStyle = `${ac}99`; ctx.textAlign = 'center';
  ctx.fillText((o.name || 'Professional Resume Template').toUpperCase(), 1000, cY + cH - 60);
}

export default function CvCreatorPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [accentColor, setAccentColor] = useState('#1B2A4A');
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfRendering, setPdfRendering] = useState(false);
  const [features, setFeatures] = useState('');
  const [whatYouGet, setWhatYouGet] = useState('');
  const [seo, setSeo] = useState<SeoResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [rendered, setRendered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const frontRef = useRef<HTMLCanvasElement>(null);
  const spreadRef = useRef<HTMLCanvasElement>(null);
  const featRef = useRef<HTMLCanvasElement>(null);
  const mockRef = useRef<HTMLCanvasElement>(null);
  const featuresPanelRef = useRef<HTMLCanvasElement>(null);
  const whatYouGetRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const pdfImageRef = useRef<HTMLImageElement | null>(null);

  const thumbRefs = [
    { ref: frontRef, label: 'Front Page', key: 'front' },
    { ref: featuresPanelRef, label: 'Features Panel', key: 'features-panel' },
    { ref: whatYouGetRef, label: "What You'll Get", key: 'what-you-get' },
    { ref: spreadRef, label: 'Two Page Spread', key: 'spread' },
    { ref: featRef, label: 'Feature Highlights', key: 'feat' },
    { ref: mockRef, label: 'Mockup', key: 'mock' },
  ];

  // ── PDF to image via PDF.js ──
  const renderPdfToImage = useCallback(async (file: File): Promise<HTMLImageElement | null> => {
    try {
      setPdfRendering(true);
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.5 });

      const offCanvas = document.createElement('canvas');
      offCanvas.width = viewport.width;
      offCanvas.height = viewport.height;
      const offCtx = offCanvas.getContext('2d')!;
      await page.render({ canvasContext: offCtx as unknown as CanvasRenderingContext2D, viewport, canvas: offCanvas }).promise;

      // Convert to image element
      const dataUrl = offCanvas.toDataURL('image/png');
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      pdfImageRef.current = img;
      setUploadedImg(dataUrl); // show preview
      return img;
    } catch (e) {
      console.error('PDF render error:', e);
      showToast('Could not render PDF. Make sure it is a valid PDF file.');
      return null;
    } finally {
      setPdfRendering(false);
    }
  }, []);

  // ── Handle image upload (PNG/JPG) ──
  const handleImageUpload = (file: File) => {
    const r = new FileReader();
    r.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setUploadedImg(dataUrl);
      setPdfFileName(null);
      const img = new Image();
      img.onload = () => { pdfImageRef.current = img; };
      img.src = dataUrl;
    };
    r.readAsDataURL(file);
  };

  // ── Handle PDF upload ──
  const handlePdfUpload = async (file: File) => {
    setPdfFileName(file.name);
    setUploadedImg(null);
    await renderPdfToImage(file);
  };

  // ── Handle any drop / file select ──
  const handleFile = (file: File) => {
    if (file.type === 'application/pdf') {
      handlePdfUpload(file);
    } else if (file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      showToast('Please upload a PDF or image file (PNG, JPG, WEBP)');
    }
  };

  const generate = () => {
    const o = { name, role, accentColor };
    setTimeout(() => {
      if (frontRef.current) {
        if (pdfImageRef.current) drawPdfThumbnail(frontRef.current, pdfImageRef.current, o);
        else drawCvFront(frontRef.current, o);
      }
      if (featuresPanelRef.current) drawCvFeaturesPanel(featuresPanelRef.current, { name, role, accentColor, features }, pdfImageRef.current);
      if (whatYouGetRef.current) drawCvWhatYouGet(whatYouGetRef.current, { name, accentColor, whatYouGet }, pdfImageRef.current);
      if (spreadRef.current) drawCvSpread(spreadRef.current, o);
      if (featRef.current) drawCvFeatures(featRef.current, { name, accentColor });
      if (mockRef.current) drawCvMockup(mockRef.current, o);
      setRendered(true);
    }, 50);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    for (const { ref, label } of thumbRefs) {
      const c = ref.current; if (!c) continue;
      const blob: Blob = await new Promise(res => c.toBlob(b => res(b!), 'image/png'));
      zip.file(`${name || 'cv'}-${label}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(content);
    a.download = `${name || 'cv'}-thumbnails.zip`; a.click(); showToast('Downloaded!');
  };

  const generateSeo = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) { showToast('Set your Gemini API key in Settings'); return; }
    setSeoLoading(true);
    try {
      const res = await fetch('/api/generate-seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productType: 'cv', name: name || 'Professional CV Template', style: 'modern minimal', features: `ATS-friendly, editable, ${role || 'professional'} resume`, apiKey }) });
      const data = await res.json(); if (data.error) throw new Error(data.error);
      setSeo(data); showToast('SEO generated!');
    } catch (e) { showToast(`Error: ${e instanceof Error ? e.message : 'Unknown'}`); }
    finally { setSeoLoading(false); }
  };

  const copyText = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
  const colorOptions = ['#1B2A4A', '#2D4A8A', '#8B2635', '#1B4A2A', '#4A3B1B', '#2A1B4A'];

  const clearUpload = () => {
    setUploadedImg(null);
    setPdfFileName(null);
    pdfImageRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* LEFT */}
      <div style={{ width: 290, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>📄 CV Template Tool</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Create professional listing thumbnails</p>
        </div>
        <div className="scroll-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── PDF / Image Upload ── */}
          <div>
            <label className="label" style={{ marginBottom: 6 }}>Upload CV File</label>

            {/* Drop zone */}
            <div
              className={`dropzone${isDragging ? ' dragging' : ''}`}
              style={{ padding: uploadedImg ? 12 : 20, cursor: 'pointer', transition: 'all 0.2s' }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault(); setIsDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {pdfRendering ? (
                <div style={{ textAlign: 'center', padding: 8 }}>
                  <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rendering PDF…</div>
                </div>
              ) : uploadedImg ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img src={uploadedImg} style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} alt="preview" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {pdfFileName || 'Image uploaded'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>✓ Preview ready</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); clearUpload(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                    <FileText size={22} style={{ color: 'var(--text-muted)' }} />
                    <Upload size={22} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Drop PDF or image here</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>PDF · PNG · JPG · WEBP</div>
                </div>
              )}
            </div>

            {/* Separate PDF button */}
            {!uploadedImg && (
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 8, fontSize: 12 }}
                onClick={e => { e.stopPropagation(); pdfInputRef.current?.click(); }}
              >
                <FileText size={13} /> Upload PDF file
              </button>
            )}
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
            />
          </div>

          <div><label className="label">Your Name / Template Name</label><input className="input" placeholder="e.g. Daniel Richard" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label className="label">Job Role / Target Role</label><input className="input" placeholder="e.g. Project Manager" value={role} onChange={e => setRole(e.target.value)} /></div>
          <div>
            <label className="label">Accent Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {colorOptions.map(c => <button key={c} onClick={() => setAccentColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: accentColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: accentColor === c ? `0 0 0 2px ${c}` : 'none' }} />)}
            </div>
          </div>

          {/* Features textarea */}
          <div>
            <label className="label" style={{ marginBottom: 4 }}>✦ Features List <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(one per line)</span></label>
            <textarea
              className="input"
              rows={5}
              placeholder={`1, 2, 3-page\nReference Page\nCover Letter\n400+ icon set\nInstant Download`}
              value={features}
              onChange={e => setFeatures(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, minHeight: 100 }}
            />
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>→ Generates the <strong>Features Panel</strong> thumbnail</div>
          </div>

          {/* What You'll Get textarea */}
          <div>
            <label className="label" style={{ marginBottom: 4 }}>📦 What You'll Get <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(one item per line)</span></label>
            <textarea
              className="input"
              rows={6}
              placeholder={`DOCX Template Files\nA4 & US Letter\n400+ Icons\nFont Used\nResume Writing Guide\nInstruction`}
              value={whatYouGet}
              onChange={e => setWhatYouGet(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, minHeight: 110 }}
            />
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>→ Generates the <strong>What You'll Get</strong> thumbnail · Max 6 items · Start with emoji for a custom icon</div>
          </div>

          {uploadedImg && (
            <div style={{ padding: '10px 14px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--success)', lineHeight: 1.5 }}>
              ✓ PDF/Image uploaded — used in <strong>Front Page</strong> &amp; <strong>Features Panel</strong>.
            </div>
          )}

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
                <div className="thumbnail-overlay"><button className="btn btn-primary btn-sm" onClick={() => { const c = ref.current; if (!c) return; c.toBlob(b => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${name || 'cv'}-${label}.png`; a.click(); }, 'image/png'); }}><Download size={12} />Download</button></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', padding: '20px 12px 8px', fontSize: 11, color: 'white', fontWeight: 600 }}>{label}{key === 'front' && uploadedImg ? ' (PDF Preview)' : ''}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 12, border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', minHeight: 400 }}>
            <ImageIcon size={48} style={{ opacity: 0.3 }} />
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No thumbnails yet</div><div style={{ fontSize: 13 }}>Upload a PDF or image, fill in details, and click Generate</div></div>
          </div>
        )}
      </div>

      {/* RIGHT: SEO */}
      <div style={{ width: 330, flexShrink: 0, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>✨ SEO Generator</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>AI-powered Etsy listing content</p>
        </div>
        <div className="scroll-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generateSeo} disabled={seoLoading}>
            {seoLoading ? <><div className="spinner" />Generating…</> : <><Sparkles size={15} />Generate Listing Content</>}
          </button>
          {seo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.4s ease' }}>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title</span><div style={{ display: 'flex', gap: 6 }}><span style={{ fontSize: 11, color: seo.title.length > 120 ? 'var(--warning)' : 'var(--success)' }}>{seo.title.length}/140</span><button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.title, 'title')}>{copied === 'title' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}</button></div></div>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>{seo.title}</p>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</span><button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.description, 'desc')}>{copied === 'desc' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}</button></div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line', maxHeight: 180, overflowY: 'auto' }}>{seo.description}</div>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags ({seo.tags.length}/13)</span><button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.tags.join(', '), 'tags')}>{copied === 'tags' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}</button></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{seo.tags.map((tag, i) => <span key={i} className="seo-tag" onClick={() => copyText(tag, `tag-${i}`)}>{tag}</span>)}</div>
              </div>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => copyText(`TITLE:\n${seo.title}\n\nDESCRIPTION:\n${seo.description}\n\nTAGS:\n${seo.tags.join(', ')}`, 'all')}>
                {copied === 'all' ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy All</>}
              </button>
            </div>
          )}
        </div>
      </div>
      {toast && <div className="toast"><span style={{ fontSize: 13 }}>{toast}</span><button onClick={() => setToast('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 8 }}><X size={14} /></button></div>}
    </div>
  );
}
