'use client';
import { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Upload, Download, Sparkles, Copy, Check, X, Image as ImageIcon, Plus } from 'lucide-react';

interface SeoResult { title: string; description: string; tags: string[]; }

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

function drawCvFront(canvas: HTMLCanvasElement, o: { name: string; role: string; accentColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const ac = o.accentColor || '#1B2A4A';
  ctx.fillStyle = '#F8F8F6'; ctx.fillRect(0,0,2000,2000);

  // Header bar
  ctx.fillStyle = ac; ctx.fillRect(0,0,2000,360);

  // Name
  ctx.font = 'bold 130px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left';
  ctx.fillText((o.name || 'DANIEL RICHARD').toUpperCase(), 80, 210);
  ctx.font = '60px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText((o.role || 'PROJECT MANAGER').toUpperCase(), 80, 295);

  // Social icons row
  const icons = ['🌐', '✉️', '📱', '💼'];
  const labels = ['yourwebsite.com','email@domain.com','(123) 456-7890','linkedin.com/in/you'];
  icons.forEach((icon, i) => {
    const x = 80 + i * 460;
    ctx.font = '36px Arial'; ctx.fillText(icon, x, 355);
    ctx.font = '32px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(labels[i], x+46, 355);
  });

  // Left column
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
    // Level bar
    ctx.fillStyle='#EEE'; roundRect(ctx,colX,y+55,colW*0.8,10,5); ctx.fill();
    ctx.fillStyle=ac;
    const pct = lang==='English'?1.0:lang==='Spanish'?0.65:0.35;
    roundRect(ctx,colX,y+55,colW*0.8*pct,10,5); ctx.fill();
    y+=110;
  });

  // Right column
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
  [['WRITE YOUR JOB TITLE HERE','Company Name · 2021 – Present'],['WRITE YOUR JOB TITLE HERE','Company Name · 2018 – 2021'],['WRITE YOUR JOB TITLE HERE','Company Name · 2015 – 2018']].forEach(([title,company]) => {
    ctx.font='bold 40px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#222'; ctx.fillText(title,rX,ry);
    ctx.font='34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle=ac; ctx.fillText(company,rX,ry+48);
    ctx.font='30px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='#666';
    ['• Describe key achievement and responsibility here','• Another notable accomplishment or key task', '• Third bullet showcasing impact and results'].forEach((b,i)=>{ctx.fillText(b,rX+20,ry+100+i*46);});
    ry+=320;
  });

  // Footer
  ctx.fillStyle=ac; ctx.fillRect(0,1920,2000,80);
  ctx.font='34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.textAlign='center';
  ctx.fillText('Fully Editable Template · ATS-Friendly · Instant Download',1000,1968);
}

function drawCvSpread(canvas: HTMLCanvasElement, o: { name: string; role: string; accentColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const ac = o.accentColor || '#1B2A4A';
  ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,2000,2000);

  // Two pages side by side
  const pageW=920, pageH=1700, gap=40, startY=150;
  const pages=[{x:60},{x:60+pageW+gap}];

  pages.forEach((p,pi) => {
    // Page shadow
    ctx.save(); ctx.shadowBlur=30; ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowOffsetY=5;
    ctx.fillStyle='#FAFAFA'; roundRect(ctx,p.x,startY,pageW,pageH,8); ctx.fill();
    ctx.restore();

    // Header
    ctx.fillStyle=ac; ctx.fillRect(p.x,startY,pageW,200);
    ctx.font='bold 55px "HN",Arial,sans-serif'; ctx.fillStyle='#FFF'; ctx.textAlign='left';
    ctx.fillText((o.name||'DANIEL RICHARD').toUpperCase(),p.x+30,startY+90);
    ctx.font='36px "HN",Arial,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.fillText(o.role||'Project Manager',p.x+30,startY+150);

    // Content lines
    const sections=pi===0
      ?[['EXPERIENCE',4],['EDUCATION',3],['SKILLS',5]]
      :[ ['EXPERTISE',6],['INTERESTS',4],['AWARDS',3]];
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

  // Title
  ctx.font='bold 70px "HN",Arial,sans-serif'; ctx.fillStyle='#1A1A1A'; ctx.textAlign='center';
  ctx.fillText(o.name?.toUpperCase()||'RESUME TEMPLATE',1000,100);
  ctx.font='40px "HN",Arial,sans-serif'; ctx.fillStyle='#888';
  ctx.fillText(o.role?.toUpperCase()||'PROFESSIONAL CV',1000,155);

  // Bottom badges
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
    const words=f.d.split(' '); let line=''; let ly=fy+225;
    for(const w of words){const test=line?`${line} ${w}`:w;if(ctx.measureText(test).width>fW-40&&line){ctx.fillText(line,fx+fW/2,ly);ly+=42;line=w;}else line=test;}
    if(line)ctx.fillText(line,fx+fW/2,ly);
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
    for(let i=0;i<(s==='SKILLS'?4:3);i++){const w=s==='SKILLS'?Math.random()*0.5+0.3:(i===0?0.9:0.6);ctx.fillStyle='#E0E0E0';ctx.fillRect(px+40,ly,pageW-80,22);ctx.fillStyle=ac+'88';ctx.fillRect(px+40,ly,(pageW-80)*w,22);ly+=48;}
    ly+=30;
  });

  ctx.font='bold 56px "HN",Arial,sans-serif'; ctx.fillStyle='#222'; ctx.textAlign='center';
  ctx.fillText(o.name?.toUpperCase()||'RESUME TEMPLATE',1000,py-70);
  ctx.font='38px "HN",Arial,sans-serif'; ctx.fillStyle='#888';
  ctx.fillText('Professional · ATS-Friendly · Fully Editable',1000,py-15);

  const badges=[{e:'📝',t:'MS Word'},{e:'📊',t:'Google Docs'},{e:'📄',t:'PDF'},{e:'📐',t:'A4 + Letter'}];
  const bW=350,bH=100,bGap=25,bTW=badges.length*(bW+bGap)-bGap,bSX=(2000-bTW)/2;
  badges.forEach((b,i)=>{
    const bx=bSX+i*(bW+bGap),bY=py+pageH+60;
    ctx.fillStyle='rgba(255,255,255,0.9)'; roundRect(ctx,bx,bY,bW,bH,12); ctx.fill();
    ctx.strokeStyle=`${ac}33`; ctx.lineWidth=1.5; roundRect(ctx,bx,bY,bW,bH,12); ctx.stroke();
    ctx.font='35px Arial'; ctx.fillText(b.e,bx+40,bY+66);
    ctx.font='bold 34px "HN",Arial,sans-serif'; ctx.fillStyle=ac; ctx.textAlign='left';
    ctx.fillText(b.t,bx+90,bY+66);
  });
}

export default function CvCreatorPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [accentColor, setAccentColor] = useState('#1B2A4A');
  const [uploadedImg, setUploadedImg] = useState<string|null>(null);
  const [seo, setSeo] = useState<SeoResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [rendered, setRendered] = useState(false);

  const frontRef = useRef<HTMLCanvasElement>(null);
  const spreadRef = useRef<HTMLCanvasElement>(null);
  const featRef = useRef<HTMLCanvasElement>(null);
  const mockRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbRefs = [
    { ref: frontRef, label: 'Front Page', key: 'front' },
    { ref: spreadRef, label: 'Two Page Spread', key: 'spread' },
    { ref: featRef, label: 'Features', key: 'feat' },
    { ref: mockRef, label: 'Mockup', key: 'mock' },
  ];

  const generate = () => {
    const o = { name, role, accentColor };
    setTimeout(() => {
      if (frontRef.current) drawCvFront(frontRef.current, o);
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
      zip.file(`${name||'cv'}-${label}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(content);
    a.download = `${name||'cv'}-thumbnails.zip`; a.click(); showToast('Downloaded!');
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
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const colorOptions = ['#1B2A4A','#2D4A8A','#8B2635','#1B4A2A','#4A3B1B','#2A1B4A'];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* LEFT */}
      <div style={{ width: 290, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>📄 CV Template Tool</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Create professional listing thumbnails</p>
        </div>
        <div className="scroll-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Upload CV Preview (Optional)</label>
            <div className="dropzone" style={{ padding: 16 }} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { const f=e.target.files?.[0]; if(f){const r=new FileReader();r.onload=ev=>setUploadedImg(ev.target?.result as string);r.readAsDataURL(f);}}} style={{ display:'none' }} />
              {uploadedImg ? <div style={{ display:'flex',gap:10,alignItems:'center' }}><img src={uploadedImg} style={{ width:50,height:50,objectFit:'cover',borderRadius:6 }} alt="preview"/><div style={{ fontSize:12 }}>Image uploaded ✓</div><button onClick={e=>{e.stopPropagation();setUploadedImg(null);}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',marginLeft:'auto'}}><X size={14}/></button></div> :
              <div style={{ textAlign:'center' }}><Upload size={22} style={{ display:'block',margin:'0 auto 6px',color:'var(--text-muted)' }}/><div style={{ fontSize:13,color:'var(--text-secondary)' }}>Upload CV preview image</div><div style={{ fontSize:11,color:'var(--text-muted)',marginTop:3 }}>PNG · JPG · WEBP</div></div>}
            </div>
          </div>
          <div><label className="label">Your Name / Template Name</label><input className="input" placeholder="e.g. Daniel Richard" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><label className="label">Job Role / Target Role</label><input className="input" placeholder="e.g. Project Manager" value={role} onChange={e=>setRole(e.target.value)}/></div>
          <div>
            <label className="label">Accent Color</label>
            <div style={{ display:'flex',gap:8 }}>
              {colorOptions.map(c => <button key={c} onClick={()=>setAccentColor(c)} style={{ width:32,height:32,borderRadius:'50%',background:c,border:accentColor===c?'3px solid white':'2px solid transparent',cursor:'pointer',boxShadow:accentColor===c?`0 0 0 2px ${c}`:'none' }}/>)}
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
                <div className="thumbnail-overlay"><button className="btn btn-primary btn-sm" onClick={()=>{const c=ref.current;if(!c)return;c.toBlob(b=>{if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`${name||'cv'}-${label}.png`;a.click();},'image/png');}}><Download size={12}/>Download</button></div>
                <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.7))',padding:'20px 12px 8px',fontSize:11,color:'white',fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',gap:12,border:'2px dashed var(--border)',borderRadius:'var(--radius-lg)',minHeight:400 }}>
            <ImageIcon size={48} style={{ opacity:0.3 }}/>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:16,fontWeight:600,marginBottom:4 }}>No thumbnails yet</div><div style={{ fontSize:13 }}>Fill in details and click Generate</div></div>
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
