// CV Template thumbnail generators
import { SIZE, roundRect, fillRoundRect, drawWrappedText } from './helpers';
import type { CvMetadata } from '../etsy/types';

/** Thumbnail 1 — Front Page Preview (editorial resume layout) */
export function drawCvFront(canvas: HTMLCanvasElement, opts: CvMetadata) {
  const ctx = canvas.getContext('2d')!; canvas.width = SIZE; canvas.height = SIZE;
  const ac = opts.accentColor || '#1B2A4A';

  ctx.fillStyle = '#F8F8F6'; ctx.fillRect(0, 0, SIZE, SIZE);

  // Header bar
  ctx.fillStyle = ac; ctx.fillRect(0, 0, SIZE, 360);

  // Name
  const name = opts.sampleName || 'Sophia Bennett';
  const role = opts.roleTitle || 'Marketing Specialist';
  ctx.font = 'bold 130px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left';
  ctx.fillText(name.toUpperCase(), 80, 220);
  ctx.font = '60px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(role.toUpperCase(), 80, 308);

  // Contact icons row
  const contacts = ['🌐 yourwebsite.com', '✉️ email@domain.com', '📱 (123) 456-7890', '💼 linkedin.com/in/you'];
  contacts.forEach((c, i) => {
    ctx.font = '32px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(c, 80 + i * 480, 360);
  });

  // Left column
  const colX = 80, colW = 580;
  let y = 440;
  const sectionHead = (title: string, yy: number) => {
    ctx.font = 'bold 48px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = ac; ctx.textAlign = 'left'; ctx.fillText(title.toUpperCase(), colX, yy);
    ctx.fillStyle = ac; ctx.fillRect(colX, yy + 10, colW, 4);
  };

  sectionHead('Contact', y); y += 72;
  ['📍 City, Country 12345', '📞 +00 123-456-789', '✉️ email@example.com', '🌐 www.yourwebsite.com', '💼 linkedin.com/in/you'].forEach(c => {
    ctx.font = '34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#444'; ctx.fillText(c, colX, y); y += 58;
  });

  y += 30; sectionHead('Education', y); y += 72;
  [['DEGREE · CERTIFICATE', '2020 – 2022'], ['DEGREE · CERTIFICATE', '2016 – 2020']].forEach(([deg, yr]) => {
    ctx.font = 'bold 36px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#222'; ctx.fillText(deg, colX, y);
    ctx.font = '30px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#888'; ctx.fillText(yr, colX, y + 46); y += 110;
  });

  y += 30; sectionHead('Skills', y); y += 72;
  const skills = ['Adobe Suite', 'MS Office', 'Social Media', 'Google Analytics', 'Content Strategy'];
  skills.forEach(skill => {
    fillRoundRect(ctx, colX, y - 38, colW, 50, 8, `${ac}15`);
    ctx.font = 'bold 32px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = ac; ctx.fillText(skill, colX + 12, y); y += 67;
  });

  // Right column
  const rX = 720, rW = 1200;
  let ry = 440;
  const rSection = (title: string, yy: number) => {
    ctx.font = 'bold 48px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = ac; ctx.textAlign = 'left'; ctx.fillText(title.toUpperCase(), rX, yy);
    ctx.fillStyle = ac; ctx.fillRect(rX, yy + 10, rW, 4);
  };

  rSection('Professional Profile', ry); ry += 82;
  const profile = `A results-driven ${role} with a proven track record of delivering impactful campaigns. Skilled in brand development, data analytics, and cross-functional team collaboration. Known for turning insights into measurable business growth.`;
  ctx.font = '36px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#555';
  ry = drawWrappedText(ctx, profile, rX, ry, rW, 56);

  ry += 40; rSection('Experience', ry); ry += 82;
  [['SENIOR ' + role.toUpperCase(), 'Creative Agency · 2022 – Present'], [role.toUpperCase(), 'Tech Startup · 2020 – 2022'], ['JUNIOR ' + role.toUpperCase(), 'Marketing Firm · 2018 – 2020']].forEach(([title, co]) => {
    ctx.font = 'bold 40px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#222'; ctx.fillText(title, rX, ry);
    ctx.font = '34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = ac; ctx.fillText(co, rX, ry + 50);
    ctx.font = '30px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#666';
    ['• Developed and executed multi-channel campaigns', '• Increased engagement by 42% in 6 months', '• Managed cross-functional team of 8 specialists'].forEach((b, i) => ctx.fillText(b, rX + 20, ry + 106 + i * 46));
    ry += 330;
  });

  // Footer
  ctx.fillStyle = ac; ctx.fillRect(0, 1920, SIZE, 80);
  ctx.font = '34px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = 'center';
  const badges: string[] = [];
  if (opts.atsOptimized) badges.push('ATS-Friendly');
  if (opts.editable) badges.push('Fully Editable');
  badges.push('Instant Download');
  if (opts.formats) badges.push(opts.formats);
  ctx.fillText(badges.join(' · '), SIZE / 2, 1970);
}

/** Thumbnail 2 — Two-Page Spread */
export function drawCvSpread(canvas: HTMLCanvasElement, opts: CvMetadata) {
  const ctx = canvas.getContext('2d')!; canvas.width = SIZE; canvas.height = SIZE;
  const ac = opts.accentColor || '#1B2A4A';

  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, SIZE, SIZE);

  const pageW = 920, pageH = 1700, gap = 40, startY = 150;
  const pages = [{ x: 60 }, { x: 60 + pageW + gap }];

  pages.forEach((p, pi) => {
    ctx.save(); ctx.shadowBlur = 30; ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowOffsetY = 5;
    fillRoundRect(ctx, p.x, startY, pageW, pageH, 8, '#FAFAFA');
    ctx.restore();
    ctx.fillStyle = ac; ctx.fillRect(p.x, startY, pageW, 200);
    ctx.font = 'bold 55px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'left';
    ctx.fillText((opts.sampleName || 'SOPHIA BENNETT').toUpperCase(), p.x + 30, startY + 90);
    ctx.font = '36px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(opts.roleTitle || 'Marketing Specialist', p.x + 30, startY + 150);

    const sections = pi === 0
      ? [['EXPERIENCE', 4], ['EDUCATION', 3], ['SKILLS', 5]] as [string, number][]
      : [['EXPERTISE', 6], ['INTERESTS', 4], ['AWARDS', 3]] as [string, number][];
    let sy = startY + 240;
    for (const [title, lines] of sections) {
      ctx.font = 'bold 38px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = ac; ctx.textAlign = 'left';
      ctx.fillText(title, p.x + 30, sy); sy += 10;
      ctx.fillStyle = ac; ctx.fillRect(p.x + 30, sy, pageW - 60, 3); sy += 28;
      for (let i = 0; i < (lines as number); i++) {
        const isSub = i % 2 === 1;
        ctx.fillStyle = isSub ? '#BBB' : '#DDD'; ctx.fillRect(p.x + 30, sy, isSub ? (pageW - 80) * 0.65 : (pageW - 80), 22); sy += 38;
      }
      sy += 40;
    }
  });

  // Title above spread
  ctx.font = 'bold 70px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#1A1A1A'; ctx.textAlign = 'center';
  ctx.fillText((opts.productName || 'RESUME TEMPLATE').toUpperCase(), SIZE / 2, 100);
  ctx.font = '40px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#888';
  ctx.fillText((opts.roleTitle || 'Professional').toUpperCase() + ' · PROFESSIONAL CV', SIZE / 2, 148);

  // Bottom badges
  const badgeList: string[] = ['✓ Fully Editable', '✓ ATS Friendly'];
  (opts.formats || 'Canva, Word, PDF').split(',').slice(0, 2).forEach(f => badgeList.push(`✓ ${f.trim()}`));
  badgeList.push('✓ Instant Download');
  badgeList.push('✓ Cover Letter');
  const bW = 290, bH = 90, bGap = 20, totalB = Math.min(badgeList.length, 6);
  const bStartX = (SIZE - (Math.ceil(totalB / 2) * bW + (Math.ceil(totalB / 2) - 1) * bGap)) / 2;
  badgeList.slice(0, 6).forEach((b, i) => {
    const row = Math.floor(i / Math.ceil(totalB / 2));
    const col = i % Math.ceil(totalB / 2);
    const bx = bStartX + col * (bW + bGap), by = startY + pageH + 80 + row * (bH + 12);
    fillRoundRect(ctx, bx, by, bW, bH, 10, `${ac}22`);
    ctx.strokeStyle = `${ac}44`; ctx.lineWidth = 1.5; roundRect(ctx, bx, by, bW, bH, 10); ctx.stroke();
    ctx.font = 'bold 28px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = ac; ctx.textAlign = 'center';
    ctx.fillText(b, bx + bW / 2, by + 58);
  });
}

/** Thumbnail 3 — Feature Callout Slide */
export function drawCvFeatures(canvas: HTMLCanvasElement, opts: CvMetadata) {
  const ctx = canvas.getContext('2d')!; canvas.width = SIZE; canvas.height = SIZE;
  const ac = opts.accentColor || '#1B2A4A';

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, ac); grad.addColorStop(1, '#2D4A8A');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SIZE, SIZE);

  // Decorative circles
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(SIZE + 200, (i + 1) * 400 - 200, 300, 0, Math.PI * 2); ctx.fill(); }

  ctx.font = 'bold 96px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
  ctx.fillText((opts.productName || 'RESUME TEMPLATE').toUpperCase(), SIZE / 2, 150);
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(400, 175, 1200, 4);

  const feats = [
    { e: '📝', t: 'Fully Editable', d: `Every section editable in ${opts.formats || 'Canva, Word, PDF'}` },
    { e: opts.atsOptimized ? '🤖' : '📄', t: opts.atsOptimized ? 'ATS Friendly' : 'Multiple Formats', d: opts.atsOptimized ? 'Passes Applicant Tracking Systems for higher rates' : `Available in ${opts.formats || 'multiple formats'}` },
    { e: '📐', t: 'A4 & US Letter', d: 'Perfectly sized for any region' },
    { e: '📬', t: 'Cover Letter', d: 'Matching cover letter template included' },
    { e: '🎨', t: 'Easy to Customise', d: 'Change colors, fonts & layout in minutes' },
    { e: '⚡', t: 'Instant Download', d: 'Direct delivery immediately after purchase' },
  ];

  // Add custom features from opts
  const customFeats = (opts.features || '').split(',').filter(f => f.trim()).slice(0, 2);

  const fW = 560, fH = 320, fGap = 50, fSX = (SIZE - (3 * fW + 2 * fGap)) / 2;
  feats.forEach((f, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const fx = fSX + col * (fW + fGap), fy = 230 + row * (fH + fGap);
    fillRoundRect(ctx, fx, fy, fW, fH, 24, 'rgba(255,255,255,0.1)');
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; roundRect(ctx, fx, fy, fW, fH, 24); ctx.stroke();
    ctx.font = '75px Arial'; ctx.textAlign = 'center'; ctx.fillText(f.e, fx + fW / 2, fy + 105);
    ctx.font = 'bold 42px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#FFF'; ctx.fillText(f.t, fx + fW / 2, fy + 175);
    ctx.font = '30px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)';
    drawWrappedText(ctx, f.d, fx + fW / 2 - (fW - 40) / 2, fy + 225, fW - 40, 42);
  });

  // Validation badges
  const validBadges: string[] = [];
  if (opts.atsOptimized) validBadges.push('✓ ATS-Friendly');
  if (opts.editable) validBadges.push('✓ Fully Editable');
  validBadges.push('✓ Instant Download');
  (opts.formats || 'Canva, Word, PDF').split(',').slice(0, 2).forEach(f => validBadges.push(`✓ ${f.trim()}`));

  ctx.font = 'bold 60px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
  ctx.fillText('Professional · Clean · Modern · Ready to Send', SIZE / 2, 1840);
  ctx.font = '44px "Helvetica Neue",Arial,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(validBadges.join(' · '), SIZE / 2, 1920);
}
