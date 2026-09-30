'use client';
import { useEffect, useRef } from 'react';
import { LAND } from '@/data/land';

// Living network backdrop: a slowly turning gold-dot globe, investment hubs,
// deal-flow arcs travelling between them and small activity tags that fade in and out.
const CITIES = {
  singapore: [1.35, 103.8, 'Singapore'], dubai: [25.2, 55.3, 'Dubai'], abudhabi: [24.45, 54.4, 'Abu Dhabi'],
  riyadh: [24.7, 46.7, 'Riyadh'], london: [51.5, -0.1, 'London'], zurich: [47.4, 8.5, 'Zurich'],
  newyork: [40.7, -74, 'New York'], palmbeach: [26.7, -80.0, 'Palm Beach'], hongkong: [22.3, 114.2, 'Hong Kong'],
};
const ROUTES = [['london', 'dubai'], ['dubai', 'singapore'], ['newyork', 'london'], ['zurich', 'riyadh'], ['singapore', 'hongkong'], ['palmbeach', 'newyork'], ['abudhabi', 'london'], ['hongkong', 'dubai'], ['newyork', 'zurich'], ['riyadh', 'singapore']];
const TAGS = [
  ['dubai', 'Deal shared', 'Private credit · $8M'], ['london', 'Co-investment', 'Series B · Fintech'],
  ['singapore', 'Private dinner', '10 investors · 8 October'], ['newyork', 'Capital raised', 'Growth fund · LP close'],
  ['zurich', 'Deal shared', 'Family office · Real estate'], ['riyadh', 'Co-investment', 'Infrastructure · $25M'],
  ['hongkong', 'New member', 'Fund partner · Asia'],
];

const rad = Math.PI / 180;
const toV = (lat, lon) => [Math.cos(lat * rad) * Math.cos(lon * rad), Math.sin(lat * rad), Math.cos(lat * rad) * Math.sin(lon * rad)];
const slerp = (a, b, t) => {
  const d = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])) || 1e-6, s = Math.sin(d);
  const k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
};

export default function Globe() {
  const cvs = useRef(null);
  const tagsRef = useRef(null);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const c = cvs.current, ctx = c.getContext('2d'), tagEls = [...tagsRef.current.children];
    const land = LAND.split(';').map((p) => { const [a, b] = p.split(','); return toV(a / 10, b / 10); });
    const city = Object.fromEntries(Object.entries(CITIES).map(([k, [la, lo]]) => [k, toV(la, lo)]));
    const routes = ROUTES.map(([a, b], i) => ({ a: city[a], b: city[b], off: i * 0.37 }));
    let w, h, dpr, cx, cy, R, raf, rot = 45 * rad;
    const tilt = 30 * rad, st = Math.sin(tilt), ct = Math.cos(tilt);

    let avoid = [];
    const measure = () => { avoid = [...document.querySelectorAll('.g-main > *, .g-pillars, .g-top > *')].map((e) => e.getBoundingClientRect()).map((r) => [r.left - 16, r.top - 12, r.right + 16, r.bottom + 12]); };
    const hits = (x, y, el) => { const bw = el.offsetWidth, bh = el.offsetHeight, l = x - bw / 2, t = y - 22 - bh; return avoid.some(([a, b, c, d]) => l < c && l + bw > a && t < d && t + bh > b); };
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mobile = w < 760;
      R = mobile ? Math.min(w * 0.92, h * 0.46) : Math.min(Math.max(w * 0.36, 460), h * 0.64);
      cx = w / 2; cy = mobile ? h * 0.9 : h * 0.92;
    };
    // rotate around Y by rot, then tilt around X
    const proj = (v, r = R) => {
      const x1 = v[0] * Math.cos(rot) - v[2] * Math.sin(rot);
      const z1 = v[0] * Math.sin(rot) + v[2] * Math.cos(rot);
      const y2 = v[1] * ct - z1 * st, z2 = v[1] * st + z1 * ct;
      return [cx - x1 * r, cy - y2 * r, z2];
    };

    const frame = (t) => {
      ctx.clearRect(0, 0, w, h);
      // atmosphere
      const g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25);
      g.addColorStop(0, 'rgba(212,173,90,0)'); g.addColorStop(0.35, 'rgba(212,173,90,.16)'); g.addColorStop(1, 'rgba(212,173,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, 7); ctx.fill();
      // globe body
      const b = ctx.createRadialGradient(cx, cy - R * 0.6, R * 0.1, cx, cy, R);
      b.addColorStop(0, 'rgba(58,46,29,.55)'); b.addColorStop(1, 'rgba(18,15,11,.9)');
      ctx.fillStyle = b; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(226,190,112,.28)'; ctx.lineWidth = 1; ctx.stroke();
      // land dots
      const ds = Math.max(1.3, R / 300);
      for (const v of land) {
        const [x, y, z] = proj(v);
        if (z <= 0 || y > h + 4) continue;
        ctx.fillStyle = `rgba(232,198,122,${0.18 + z * 0.7})`;
        ctx.fillRect(x - ds / 2, y - ds / 2, ds, ds);
      }
      // arcs
      for (const r of routes) {
        const pts = [];
        if (proj(r.a)[2] < 0.08 || proj(r.b)[2] < 0.08) continue;
        for (let i = 0; i <= 40; i++) { const k = i / 40; pts.push(proj(slerp(r.a, r.b, k), R * (1 + Math.sin(Math.PI * k) * 0.08))); }
        ctx.beginPath(); let on = false;
        for (const [x, y, z] of pts) { if (z > -0.15) { on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } else on = false; }
        ctx.strokeStyle = 'rgba(226,190,112,.22)'; ctx.lineWidth = 1; ctx.stroke();
        const p = ((t / 4200 + r.off) % 1), i = Math.floor(p * 40), q = pts[i];
        if (q[2] > -0.15) {
          const trail = pts.slice(Math.max(0, i - 7), i + 1);
          ctx.beginPath(); trail.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.strokeStyle = 'rgba(255,222,150,.85)'; ctx.lineWidth = 1.6; ctx.stroke();
          ctx.beginPath(); ctx.arc(q[0], q[1], 2.4, 0, 7); ctx.fillStyle = '#ffe6ad'; ctx.fill();
        }
      }
      // cities
      const pos = {};
      for (const [k, v] of Object.entries(city)) {
        const [x, y, z] = proj(v); pos[k] = [x, y, z];
        if (z <= 0.05) continue;
        const pulse = (t / 1600 + k.length * 0.13) % 1;
        ctx.beginPath(); ctx.arc(x, y, 3 + pulse * 14, 0, 7); ctx.strokeStyle = `rgba(226,190,112,${(1 - pulse) * 0.55 * z})`; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fillStyle = `rgba(255,232,180,${0.5 + z * 0.5})`; ctx.fill();
      }
      // activity tags: 3 visible at a time, each lives ~6s, only on the front side
      const slot = 2000, n = TAGS.length;
      tagEls.forEach((el, i) => {
        const phase = ((t - i * slot) % (slot * n) + slot * n) % (slot * n) / (slot * 3);
        const [x, y, z] = pos[TAGS[i][0]];
        const vis = phase < 1 && z > 0.15 && y > 60 && y < h - 30 && !hits(x, y, el) ? Math.min(1, Math.sin(Math.PI * phase) * 2.2) : 0;
        el.style.opacity = vis.toFixed(2);
        el.style.transform = `translate(${x.toFixed(1)}px,${(y - 16 - vis * 6).toFixed(1)}px) translate(-50%,-100%)`;
      });
      if (!reduce) rot = (45 + Math.sin(t / 9000) * 42) * rad; // gentle sway, hubs stay in view
      raf = requestAnimationFrame(frame);
    };
    size(); measure(); setTimeout(measure, 1200); window.addEventListener('resize', () => { size(); measure(); });
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }, []);

  return (
    <div className="gl" aria-hidden="true">
      <div className="gl-glow" />
      <canvas ref={cvs} className="gl-c" />
      <div className="gl-tags" ref={tagsRef}>
        {TAGS.map(([k, a, b], i) => <div key={i} className="gl-tag"><i /><span><b>{a}</b><small>{CITIES[k][2]} · {b}</small></span></div>)}
      </div>
      <div className="gl-grain" />
      <div className="gl-vig" />
    </div>
  );
}
