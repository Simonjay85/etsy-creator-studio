'use client';
import { useState, useRef } from 'react';
import JSZip from 'jszip';
import { Download, Sparkles, Copy, Check, X, Image as ImageIcon, Plus } from 'lucide-react';

interface SeoResult { title: string; description: string; tags: string[]; }

function drawPlannerCover(canvas: HTMLCanvasElement, o: { name: string; pages: string; templates: string; covers: string; stickers: string; primaryColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width = 2000; canvas.height = 2000;
  const pc = o.primaryColor || '#E91E8C';
  const grad = ctx.createLinearGradient(0, 0, 2000, 2000);
  grad.addColorStop(0, '#FF6FD8'); grad.addColorStop(0.5, pc); grad.addColorStop(1, '#3813C2');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 2000, 2000);
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.roundRect(80, 80, 1840, 1840, 40); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.roundRect(120, 120, 1760, 220, 24); ctx.fill();
  ctx.font = 'bold 100px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = pc; ctx.textAlign = 'center';
  ctx.fillText((o.name || 'ALL-IN-ONE DIGITAL PLANNER').toUpperCase(), 1000, 278);
  const badges = [{ val: o.pages||'600+', label:'PAGES',icon:'📋'},{ val:'RAINBOW',label:'THEME',icon:'🌈'},{ val:o.templates||'100+',label:'TEMPLATES',icon:'📄'},{ val:o.covers||'150',label:'COVERS',icon:'🎨'},{ val:o.stickers||'5000+',label:'STICKERS',icon:'⭐'}];
  const bW = 310, bH = 130, bG = 25; const tW = badges.length*bW+(badges.length-1)*bG; let bx = (2000-tW)/2;
  for (const b of badges) {
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.roundRect(bx,390,bW,bH,16); ctx.fill();
    ctx.font='bold 44px "HN",Arial,sans-serif'; ctx.fillStyle=pc; ctx.textAlign='center'; ctx.fillText(b.icon+' '+b.val,bx+bW/2,455);
    ctx.font='bold 26px "HN",Arial,sans-serif'; ctx.fillStyle='#666'; ctx.fillText(b.label,bx+bW/2,494); bx+=bW+bG;
  }
  ctx.fillStyle='rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.roundRect(200,570,900,1100,20); ctx.fill();
  ctx.font='bold 42px "HN",Arial,sans-serif'; ctx.fillStyle=pc; ctx.textAlign='left'; ctx.fillText('Daily Planner',250,640);
  const rowItems=['📋 Morning tasks','📊 Budget','✉️ Emails','🎯 Goals','📚 Reading','🏃 Exercise','🍽️ Meals','💡 Create','👨‍👩‍👧 Family','📝 Journal','🌙 Review','⭐ Thanks'];
  for(let i=0;i<12;i++){ctx.fillStyle='#ddd';ctx.fillRect(250,680+i*80,820,2);ctx.font='32px "HN",Arial,sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='left';ctx.fillText(rowItems[i],250,710+i*80);}
  let yy=570;for(const yr of['2026','2027','2028']){ctx.fillStyle='rgba(255,255,255,0.92)';ctx.beginPath();ctx.roundRect(1180,yy,600,240,20);ctx.fill();ctx.font='bold 110px "HN",Arial,sans-serif';ctx.fillStyle=pc;ctx.textAlign='center';ctx.fillText(yr,1480,yy+160);yy+=280;}
  ctx.font='bold 36px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.9)';ctx.textAlign='left';
  let fy=1750,fx=200;
  for(const f of['✓ Calendar Integrations','✓ Easy to Use','✓ Instant Download','✓ Sunday & Monday Start']){ctx.fillText(f,fx,fy);fx+=440;if(fx>1600){fx=200;fy+=55;}}
  ctx.fillStyle='#FF6B35';ctx.beginPath();ctx.roundRect(1640,1740,280,140,14);ctx.fill();
  ctx.font='bold 30px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.fillText('FREE YEARLY',1780,1798);ctx.fillText('UPDATES!',1780,1846);
}

function drawPlannerInside(canvas: HTMLCanvasElement, o: { primaryColor: string; name: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const pc=o.primaryColor||'#E91E8C';
  ctx.fillStyle='#F8F5FF'; ctx.fillRect(0,0,2000,2000);
  ctx.font='bold 90px "HN",Arial,sans-serif'; ctx.fillStyle='#333'; ctx.textAlign='center'; ctx.fillText("WHAT'S INSIDE",1000,140);
  ctx.fillStyle=pc; ctx.fillRect(800,160,400,5);
  const sections=[{title:'Daily Planner',color:'#FF6FD8',items:['Task list','Schedule','Goals','Notes','Water tracker','Habit tracker']},{title:'Weekly Planner',color:'#43C6AC',items:['Week overview','Priorities','Shopping list','Meal plan','Budget','Reflection']},{title:'Monthly Calendar',color:'#4776E6',items:['Full calendar','Goal setting','Review sheet','Finance','Self-care','Bucket list']},{title:'Note Pages',color:'#F7971E',items:['Lined notes','Dot grid','Blank canvas','Mind map','Project plan','Vision board']}];
  const cW=840,cH=700,gX=80,gY=60,sX=(2000-(2*cW+(2-1)*gX))/2;
  let idx=0;
  for(let r=0;r<2;r++)for(let c=0;c<2;c++){
    const s=sections[idx++];const cx=sX+c*(cW+gX);const cy=220+r*(cH+gY);
    ctx.fillStyle=s.color+'22';ctx.beginPath();ctx.roundRect(cx,cy,cW,cH,24);ctx.fill();
    ctx.strokeStyle=s.color+'55';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(cx,cy,cW,cH,24);ctx.stroke();
    ctx.font='bold 58px "HN",Arial,sans-serif';ctx.fillStyle=s.color;ctx.textAlign='left';ctx.fillText(s.title,cx+40,cy+80);
    s.items.forEach((item,i)=>{ctx.font='38px "HN",Arial,sans-serif';ctx.fillStyle='#555';ctx.fillText('• '+item,cx+50,cy+160+i*82);});
  }
  ctx.font='bold 44px "HN",Arial,sans-serif';ctx.fillStyle='#888';ctx.textAlign='center';
  ctx.fillText('Compatible with GoodNotes · Notability · iPad · Android · PDF',1000,1920);
}

function drawPlannerCompat(canvas: HTMLCanvasElement, o: { primaryColor: string; name: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const grad=ctx.createLinearGradient(0,0,2000,2000);grad.addColorStop(0,'#0F0A1A');grad.addColorStop(1,'#1A0E2E');
  ctx.fillStyle=grad;ctx.fillRect(0,0,2000,2000);
  const glow=ctx.createRadialGradient(1000,1000,0,1000,1000,800);glow.addColorStop(0,'rgba(192,132,252,0.2)');glow.addColorStop(1,'transparent');
  ctx.fillStyle=glow;ctx.fillRect(0,0,2000,2000);
  ctx.font='bold 90px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.fillText('COMPATIBLE WITH',1000,160);
  const pc=o.primaryColor||'#E91E8C';ctx.fillStyle=pc;ctx.fillRect(700,185,600,5);
  const apps=[{name:'GoodNotes 5',icon:'📓',desc:'Full support'},{name:'Notability',icon:'🗒️',desc:'Works perfectly'},{name:'Xodo PDF',icon:'📱',desc:'Android & Windows'},{name:'Noteshelf',icon:'📔',desc:'iPad & iPhone'},{name:'PDF Expert',icon:'📑',desc:'Professional edit'},{name:'Penly',icon:'✒️',desc:'Stylus support'}];
  const cW=560,cH=230,gap=50,sX=(2000-(3*cW+2*gap))/2;
  for(let i=0;i<apps.length;i++){
    const a=apps[i];const col=i%3;const row=Math.floor(i/3);const x=sX+col*(cW+gap);const y=260+row*(cH+gap);
    ctx.fillStyle='rgba(255,255,255,0.07)';ctx.beginPath();ctx.roundRect(x,y,cW,cH,20);ctx.fill();
    ctx.strokeStyle=pc+'44';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x,y,cW,cH,20);ctx.stroke();
    ctx.font='70px Arial';ctx.textAlign='center';ctx.fillText(a.icon,x+cW/2,y+95);
    ctx.font='bold 44px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.fillText(a.name,x+cW/2,y+160);
    ctx.font='32px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fillText(a.desc,x+cW/2,y+202);
  }
  ctx.font='bold 80px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.fillText(o.name||'Digital Planner',1000,1080);
  const perks=['Instant PDF Download','Works on iPad & Android','Hyperlinked Navigation','Undated — Any Year','Lifetime Access','24/7 Support'];
  perks.forEach((p,i)=>{const col=i%2;const row=Math.floor(i/2);ctx.font='44px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.8)';ctx.textAlign='center';ctx.fillText('✓ '+p,350+col*1000,1200+row*140);});
  ctx.font='bold 44px "HN",Arial,sans-serif';ctx.fillStyle=pc;ctx.textAlign='center';ctx.fillText('★ Instant Download · No Subscription · Commercial Use ★',1000,1890);
}

function drawPlannerInfo(canvas: HTMLCanvasElement, o: { name: string; primaryColor: string }) {
  const ctx = canvas.getContext('2d')!; canvas.width=2000; canvas.height=2000;
  const pc=o.primaryColor||'#E91E8C';
  const grad=ctx.createLinearGradient(0,0,2000,2000);grad.addColorStop(0,pc+'EE');grad.addColorStop(1,'#4776E6');
  ctx.fillStyle=grad;ctx.fillRect(0,0,2000,2000);
  ctx.fillStyle='rgba(255,255,255,0.1)';ctx.beginPath();ctx.arc(1800,200,400,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(200,1800,350,0,Math.PI*2);ctx.fill();
  ctx.font='bold 100px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.fillText((o.name||'DIGITAL PLANNER').toUpperCase(),1000,200);
  ctx.font='bold 50px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.8)';ctx.fillText('EVERYTHING YOU NEED TO STAY ORGANIZED',1000,290);
  const boxes=[{emoji:'📅',title:'Undated Planner',desc:'Works for any year'},{emoji:'🎨',title:'150+ Covers',desc:'Beautiful designs'},{emoji:'📲',title:'Hyperlinked',desc:'One-tap navigation'},{emoji:'⚡',title:'Instant Download',desc:'Delivered instantly'},{emoji:'🌈',title:'Color Themes',desc:'Dark, pastel & bright'},{emoji:'♾️',title:'Lifetime Updates',desc:'Free updates always'}];
  const cW=560,cH=300,gap=50,sX=(2000-(3*cW+2*gap))/2;
  for(let i=0;i<boxes.length;i++){
    const b=boxes[i];const col=i%3;const row=Math.floor(i/3);const x=sX+col*(cW+gap);const y=380+row*(cH+gap);
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.roundRect(x,y,cW,cH,24);ctx.fill();
    ctx.font='80px Arial';ctx.textAlign='center';ctx.fillText(b.emoji,x+cW/2,y+105);
    ctx.font='bold 46px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.fillText(b.title,x+cW/2,y+175);
    ctx.font='34px "HN",Arial,sans-serif';ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillText(b.desc,x+cW/2,y+228);
  }
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(200,1450,1600,3);
  ctx.font='bold 55px "HN",Arial,sans-serif';ctx.fillStyle='#FFF';ctx.textAlign='center';ctx.fillText('Personal · Finance · Education · Work · Family · Health · Travel',1000,1590);
  ctx.font='bold 50px "HN",Arial,sans-serif';ctx.fillText('📦 PDF delivered instantly to your inbox',1000,1800);
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='42px "HN",Arial,sans-serif';ctx.fillText('100% satisfaction guarantee · Easy instant download',1000,1880);
}

export default function PlannerCreatorPage() {
  const [name, setName] = useState('');
  const [pages, setPages] = useState('600+');
  const [templates, setTemplates] = useState('100+');
  const [covers, setCovers] = useState('150');
  const [stickers, setStickers] = useState('5000+');
  const [primaryColor, setPrimaryColor] = useState('#E91E8C');
  const [seo, setSeo] = useState<SeoResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [rendered, setRendered] = useState(false);

  const coverRef = useRef<HTMLCanvasElement>(null);
  const insideRef = useRef<HTMLCanvasElement>(null);
  const compatRef = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLCanvasElement>(null);
  const thumbRefs = [
    { ref: coverRef, label: 'Cover Slide', key: 'cover' },
    { ref: insideRef, label: 'Inside Pages', key: 'inside' },
    { ref: compatRef, label: 'Compatibility', key: 'compat' },
    { ref: infoRef, label: 'Features', key: 'info' },
  ];

  const generate = () => {
    const o = { name, pages, templates, covers, stickers, primaryColor };
    setTimeout(() => {
      if (coverRef.current) drawPlannerCover(coverRef.current, o);
      if (insideRef.current) drawPlannerInside(insideRef.current, { primaryColor, name });
      if (compatRef.current) drawPlannerCompat(compatRef.current, { primaryColor, name });
      if (infoRef.current) drawPlannerInfo(infoRef.current, { name, primaryColor });
      setRendered(true);
    }, 50);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    for (const { ref, label } of thumbRefs) {
      const canvas = ref.current; if (!canvas) continue;
      const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/png'));
      zip.file(`${name || 'planner'}-${label}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(content);
    a.download = `${name || 'planner'}-thumbnails.zip`; a.click(); showToast('Downloaded!');
  };

  const generateSeo = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) { showToast('Set your Gemini API key in Settings'); return; }
    setSeoLoading(true);
    try {
      const res = await fetch('/api/generate-seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productType: 'planner', name, features: `${pages} pages, ${templates} templates, ${covers} covers, ${stickers} stickers`, style: 'colorful modern', apiKey }) });
      const data = await res.json(); if (data.error) throw new Error(data.error);
      setSeo(data); showToast('SEO generated!');
    } catch (e) { showToast(`Error: ${e instanceof Error ? e.message : 'Unknown'}`); }
    finally { setSeoLoading(false); }
  };

  const copyText = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const colorOptions = ['#E91E8C', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#FF5722'];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* LEFT */}
      <div style={{ width: 290, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>📅 Planner Tool</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Fill in details & generate slides</p>
        </div>
        <div className="scroll-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="label">Product Name</label><input className="input" placeholder="All-in-One Digital Planner" value={name} onChange={e => setName(e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label className="label">Pages</label><input className="input" placeholder="600+" value={pages} onChange={e => setPages(e.target.value)} /></div>
            <div><label className="label">Templates</label><input className="input" placeholder="100+" value={templates} onChange={e => setTemplates(e.target.value)} /></div>
            <div><label className="label">Covers</label><input className="input" placeholder="150" value={covers} onChange={e => setCovers(e.target.value)} /></div>
            <div><label className="label">Stickers</label><input className="input" placeholder="5000+" value={stickers} onChange={e => setStickers(e.target.value)} /></div>
          </div>
          <div>
            <label className="label">Accent Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {colorOptions.map(c => <button key={c} onClick={() => setPrimaryColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: primaryColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: primaryColor === c ? `0 0 0 2px ${c}` : 'none' }} />)}
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
                <div className="thumbnail-overlay"><button className="btn btn-primary btn-sm" onClick={() => { const c=ref.current;if(!c)return;c.toBlob(b=>{if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`${name}-${label}.png`;a.click();},'image/png'); }}><Download size={12} />Download</button></div>
                <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.7))',padding:'20px 12px 8px',fontSize:11,color:'white',fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',gap:12,border:'2px dashed var(--border)',borderRadius:'var(--radius-lg)',minHeight:400 }}>
            <ImageIcon size={48} style={{ opacity: 0.3 }} />
            <div style={{ textAlign: 'center' }}><div style={{ fontSize:16,fontWeight:600,marginBottom:4 }}>No thumbnails yet</div><div style={{ fontSize:13 }}>Fill in details and click Generate</div></div>
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
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generateSeo} disabled={seoLoading || !name}>
            {seoLoading ? <><div className="spinner" />Generating…</> : <><Sparkles size={15} />Generate Listing Content</>}
          </button>
          {seo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.4s ease' }}>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}><span style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em' }}>Title</span><div style={{ display:'flex',gap:6 }}><span style={{ fontSize:11,color:seo.title.length>120?'var(--warning)':'var(--success)' }}>{seo.title.length}/140</span><button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.title,'title')}>{copied==='title'?<Check size={12} color="var(--success)" />:<Copy size={12} />}</button></div></div>
                <p style={{ fontSize:13,lineHeight:1.6 }}>{seo.title}</p>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}><span style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em' }}>Description</span><button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.description,'desc')}>{copied==='desc'?<Check size={12} color="var(--success)" />:<Copy size={12} />}</button></div>
                <div style={{ fontSize:12,lineHeight:1.7,color:'var(--text-secondary)',whiteSpace:'pre-line',maxHeight:180,overflowY:'auto' }}>{seo.description}</div>
              </div>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:10 }}><span style={{ fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em' }}>Tags ({seo.tags.length}/13)</span><button className="btn btn-ghost btn-icon" onClick={() => copyText(seo.tags.join(', '),'tags')}>{copied==='tags'?<Check size={12} color="var(--success)" />:<Copy size={12} />}</button></div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>{seo.tags.map((tag,i) => <span key={i} className="seo-tag" onClick={() => copyText(tag,`tag-${i}`)}>{tag}</span>)}</div>
              </div>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => copyText(`TITLE:\n${seo.title}\n\nDESCRIPTION:\n${seo.description}\n\nTAGS:\n${seo.tags.join(', ')}`,'all')}>
                {copied==='all'?<><Check size={13} />Copied!</>:<><Copy size={13} />Copy All</>}
              </button>
            </div>
          )}
        </div>
      </div>
      {toast && <div className="toast"><span style={{ fontSize:13 }}>{toast}</span><button onClick={() => setToast('')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',marginLeft:8 }}><X size={14} /></button></div>}
    </div>
  );
}
