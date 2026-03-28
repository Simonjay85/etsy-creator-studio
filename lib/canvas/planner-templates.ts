// Digital Planner thumbnail generators
import {
  SIZE, roundRect, fillRoundRect, drawDotGrid, drawWrappedText, drawBadge,
} from './helpers';
import type { PlannerMetadata } from '../etsy/types';

/** Thumbnail 1 — Cover Slide with feature badges */
export function drawPlannerCover(canvas: HTMLCanvasElement, opts: PlannerMetadata) {
  const ctx = canvas.getContext('2d')!; canvas.width = SIZE; canvas.height = SIZE;
  const pc = opts.primaryColor || '#8B5CF6';

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, '#FF6FD8'); grad.addColorStop(0.5, pc); grad.addColorStop(1, '#3813C2');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle inner border
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3;
  roundRect(ctx, 60, 60, SIZE - 120, SIZE - 120, 40); ctx.stroke();

  // White header card
  fillRoundRect(ctx, 120, 120, SIZE - 240, 220, 24, 'rgba(255,255,255,0.95)');
  ctx.font = 'bold 96px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = pc; ctx.textAlign = 'center';
  const nameText = (opts.name || 'ALL-IN-ONE DIGITAL PLANNER').toUpperCase();
  // fit name
  let nameSize = 96;
  while (nameSize > 48) {
    ctx.font = `bold ${nameSize}px "Helvetica Neue", Arial, sans-serif`;
    if (ctx.measureText(nameText).width < SIZE - 280) break;
    nameSize -= 6;
  }
  ctx.fillText(nameText, SIZE / 2, 280);

  // Compatibility tagline
  ctx.font = 'bold 40px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center';
  const compat = opts.compatibility || 'GoodNotes · Notability · PDF Apps';
  ctx.fillText(compat, SIZE / 2, 395);

  // Feature badges row
  const badges = [
    { val: opts.pages || '120', label: 'PAGES', icon: '📋' },
    { val: opts.templates || '35', label: 'TEMPLATES', icon: '📄' },
    { val: opts.covers || '12', label: 'COVERS', icon: '🎨' },
    { val: opts.theme || 'Minimal', label: 'THEME', icon: '🎯' },
  ];
  const bW = 380, bH = 130, bG = 22;
  const bTW = badges.length * bW + (badges.length - 1) * bG;
  let bx = (SIZE - bTW) / 2;
  for (const b of badges) {
    fillRoundRect(ctx, bx, 490, bW, bH, 18, 'rgba(255,255,255,0.9)');
    ctx.font = 'bold 44px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = pc; ctx.textAlign = 'center';
    ctx.fillText(`${b.icon} ${b.val}`, bx + bW / 2, 550);
    ctx.font = 'bold 26px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(b.label, bx + bW / 2, 588);
    bx += bW + bG;
  }

  // Planner page mockup — left white card
  fillRoundRect(ctx, 160, 670, 880, 1100, 20, 'rgba(255,255,255,0.93)');
  ctx.font = 'bold 46px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = pc; ctx.textAlign = 'left';
  ctx.fillText('Daily Planner', 210, 740);
  const tasks = ['☀️ Morning Routine', '📋 Top 3 Tasks', '⏰ Schedule', '🎯 Goals', '💧 Water Tracker', '📝 Notes & Thoughts', '🌙 Evening Reflection', '⭐ Gratitude'];
  tasks.forEach((task, i) => {
    ctx.fillStyle = '#eee'; ctx.fillRect(210, 770 + i * 90, 780, 2);
    ctx.font = '34px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#aaa'; ctx.textAlign = 'left';
    ctx.fillText(task, 210, 800 + i * 90);
  });

  // Year cards — right side
  const yearsText = opts.years || '2026, 2027, 2028';
  const yearList = yearsText.split(',').map(y => y.trim()).slice(0, 3);
  let yy = 670;
  for (const yr of yearList) {
    fillRoundRect(ctx, 1100, yy, 740, 240, 20, 'rgba(255,255,255,0.93)');
    ctx.font = 'bold 120px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = pc; ctx.textAlign = 'center';
    ctx.fillText(yr, 1470, yy + 165);
    yy += 285;
  }

  // Bottom feature pills
  const perks = ['✓ Hyperlinked Navigation', '✓ Instant Download', '✓ Undated — Any Year', '✓ Sunday & Monday Start'];
  ctx.font = 'bold 34px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'left';
  let fx = 200, fy = 1830;
  for (const p of perks) {
    ctx.fillText(p, fx, fy); fx += 460;
    if (fx > 1500) { fx = 200; fy += 52; }
  }
}

/** Thumbnail 2 — Inside Page Mockup */
export function drawPlannerInside(canvas: HTMLCanvasElement, opts: PlannerMetadata) {
  const ctx = canvas.getContext('2d')!; canvas.width = SIZE; canvas.height = SIZE;
  const pc = opts.primaryColor || '#8B5CF6';

  ctx.fillStyle = '#F8F5FF'; ctx.fillRect(0, 0, SIZE, SIZE);

  // Title
  ctx.font = 'bold 88px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#333'; ctx.textAlign = 'center';
  ctx.fillText("WHAT'S INSIDE", SIZE / 2, 130);
  ctx.fillStyle = pc; ctx.fillRect(800, 150, 400, 5);

  // 4 section cards
  const sections = [
    { title: 'Daily Planner', color: '#C084FC', items: ['Task list', 'Schedule', 'Goals', 'Notes', 'Water tracker', 'Habit tracker'] },
    { title: 'Weekly Planner', color: '#34D399', items: ['Week overview', 'Priorities', 'Shopping list', 'Meal plan', 'Budget', 'Reflection'] },
    { title: 'Monthly Calendar', color: '#60A5FA', items: ['Full calendar', 'Goal setting', 'Review sheet', 'Finance', 'Self-care', 'Bucket list'] },
    { title: 'Note Pages', color: '#F59E0B', items: ['Lined notes', 'Dot grid', 'Blank canvas', 'Mind map', 'Project plan', 'Vision board'] },
  ];

  const cW = 840, cH = 700, gX = 80, gY = 60;
  const sX = (SIZE - (2 * cW + gX)) / 2;
  let idx = 0;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
    const s = sections[idx++];
    const cx = sX + c * (cW + gX), cy = 220 + r * (cH + gY);
    fillRoundRect(ctx, cx, cy, cW, cH, 24, `${s.color}22`);
    ctx.strokeStyle = `${s.color}55`; ctx.lineWidth = 2;
    roundRect(ctx, cx, cy, cW, cH, 24); ctx.stroke();
    ctx.font = 'bold 56px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = s.color; ctx.textAlign = 'left';
    ctx.fillText(s.title, cx + 40, cy + 78);
    s.items.forEach((item, i) => {
      ctx.font = '36px "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = '#555';
      ctx.fillText('• ' + item, cx + 50, cy + 155 + i * 82);
    });
  }

  // Footer
  ctx.font = 'bold 42px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#888'; ctx.textAlign = 'center';
  ctx.fillText(`Compatible with ${opts.compatibility || 'GoodNotes · Notability · iPad · PDF Apps'}`, SIZE / 2, 1940);
}

/** Thumbnail 3 — Feature Highlight (compatibility + perks) */
export function drawPlannerFeatures(canvas: HTMLCanvasElement, opts: PlannerMetadata) {
  const ctx = canvas.getContext('2d')!; canvas.width = SIZE; canvas.height = SIZE;
  const pc = opts.primaryColor || '#8B5CF6';

  // Dark gradient
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, '#0F0A1A'); grad.addColorStop(1, '#1A0E2E');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SIZE, SIZE);

  // Purple glow
  const glow = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, 800);
  glow.addColorStop(0, 'rgba(192,132,252,0.2)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, SIZE, SIZE);

  // Title
  ctx.font = 'bold 88px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
  ctx.fillText('COMPATIBLE WITH', SIZE / 2, 150);
  ctx.fillStyle = pc; ctx.fillRect(700, 175, 600, 5);

  // App compatibility cards (2 rows × 3)
  const apps = [
    { name: 'GoodNotes 5', icon: '📓', desc: 'Full support' },
    { name: 'Notability', icon: '🗒️', desc: 'Works perfectly' },
    { name: 'Xodo PDF', icon: '📱', desc: 'Android & Windows' },
    { name: 'Noteshelf', icon: '📔', desc: 'iPad & iPhone' },
    { name: 'PDF Expert', icon: '📑', desc: 'Professional edit' },
    { name: 'Penly', icon: '✒️', desc: 'Stylus support' },
  ];

  const cW = 560, cH = 230, gap = 50, sX = (SIZE - (3 * cW + 2 * gap)) / 2;
  for (let i = 0; i < apps.length; i++) {
    const a = apps[i], col = i % 3, row = Math.floor(i / 3);
    const x = sX + col * (cW + gap), y = 250 + row * (cH + gap);
    fillRoundRect(ctx, x, y, cW, cH, 20, 'rgba(255,255,255,0.07)');
    ctx.strokeStyle = `${pc}44`; ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, cW, cH, 20); ctx.stroke();
    ctx.font = '70px Arial'; ctx.textAlign = 'center'; ctx.fillText(a.icon, x + cW / 2, y + 95);
    ctx.font = 'bold 44px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = '#FFF';
    ctx.fillText(a.name, x + cW / 2, y + 160);
    ctx.font = '32px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(a.desc, x + cW / 2, y + 202);
  }

  // Theme display
  ctx.font = 'bold 72px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
  ctx.fillText(opts.name || 'Digital Planner', SIZE / 2, 1080);
  ctx.font = 'bold 48px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = pc;
  ctx.fillText(`Theme: ${opts.theme || 'Minimal Neutral'}`, SIZE / 2, 1160);

  // 6 feature perks
  const perks = ['Instant PDF Download', 'Works on iPad & Android', 'Hyperlinked Navigation', 'Undated — Any Year', 'Lifetime Access', '24/7 Support'];
  perks.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    ctx.font = '44px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center';
    ctx.fillText('✓ ' + p, 450 + col * 1100, 1270 + row * 130);
  });

  // Footer
  ctx.font = 'bold 44px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = pc; ctx.textAlign = 'center';
  ctx.fillText('★ Instant Download · No Subscription · Commercial Use ★', SIZE / 2, 1900);
}

/** Thumbnail 4 — Year / Availability Slide */
export function drawPlannerYears(canvas: HTMLCanvasElement, opts: PlannerMetadata) {
  const ctx = canvas.getContext('2d')!; canvas.width = SIZE; canvas.height = SIZE;
  const pc = opts.primaryColor || '#8B5CF6';

  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, `${pc}EE`); grad.addColorStop(1, '#4776E6');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SIZE, SIZE);

  // Decorative circles
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.arc(1800, 200, 400, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(200, 1800, 350, 0, Math.PI * 2); ctx.fill();

  ctx.font = 'bold 96px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
  ctx.fillText((opts.name || 'DIGITAL PLANNER').toUpperCase(), SIZE / 2, 180);
  ctx.font = 'bold 50px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('WORKS FOR ANY YEAR — UNDATED & READY', SIZE / 2, 270);

  // Year cards
  const yearsText = opts.years || '2026, 2027, 2028';
  const yearList = yearsText.split(',').map(y => y.trim()).slice(0, 4);
  const yW = yearList.length <= 3 ? 480 : 380;
  const yH = 280, yGap = 30;
  const yTotal = yearList.length * yW + (yearList.length - 1) * yGap;
  let yx = (SIZE - yTotal) / 2;
  for (const yr of yearList) {
    fillRoundRect(ctx, yx, 360, yW, yH, 24, 'rgba(255,255,255,0.18)');
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
    roundRect(ctx, yx, 360, yW, yH, 24); ctx.stroke();
    ctx.font = 'bold 140px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
    ctx.fillText(yr, yx + yW / 2, 360 + 200);
    yx += yW + yGap;
  }

  // Feature boxes grid
  const boxes = [
    { emoji: '📅', title: 'Undated Planner', desc: 'Works for any year' },
    { emoji: '🎨', title: `${opts.covers || '12'}+ Covers`, desc: 'Beautiful designs' },
    { emoji: '📲', title: 'Hyperlinked', desc: 'One-tap navigation' },
    { emoji: '⚡', title: 'Instant Download', desc: 'Delivered instantly' },
    { emoji: '🌈', title: opts.theme || 'Minimal Theme', desc: 'Elegant & calm' },
    { emoji: '♾️', title: 'Lifetime Updates', desc: 'Free updates always' },
  ];

  const bW = 560, bH = 290, bGap = 50, bSX = (SIZE - (3 * bW + 2 * bGap)) / 2;
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i], col = i % 3, row = Math.floor(i / 3);
    const x = bSX + col * (bW + bGap), y = 720 + row * (bH + bGap);
    fillRoundRect(ctx, x, y, bW, bH, 24, 'rgba(255,255,255,0.15)');
    ctx.font = '80px Arial'; ctx.textAlign = 'center'; ctx.fillText(b.emoji, x + bW / 2, y + 105);
    ctx.font = 'bold 44px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = '#FFF'; ctx.fillText(b.title, x + bW / 2, y + 175);
    ctx.font = '32px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText(b.desc, x + bW / 2, y + 228);
  }

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(200, 1470, 1600, 3);
  ctx.font = 'bold 50px "Helvetica Neue", Arial, sans-serif'; ctx.fillStyle = '#FFF'; ctx.textAlign = 'center';
  ctx.fillText('📦 PDF delivered instantly · 100% Satisfaction Guarantee', SIZE / 2, 1820);
  ctx.font = 'bold 42px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(`Compatible with ${opts.compatibility || 'GoodNotes · Notability · PDF Apps'}`, SIZE / 2, 1900);
}
