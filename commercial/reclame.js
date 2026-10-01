'use strict';
// Flippo's – de reclame. Eén tijdlijn van 80 seconden: voice-over, muziek, geluidseffecten en veertien korte scènes.

const stage = document.getElementById('stage');
const qs = new URLSearchParams(location.search);
const DEBUG = qs.has('s');                 // ?s=<scène>&p=<ms>: één scène stilzetten op een moment (zonder geluid)
const DEBUG_P = +qs.get('p') || 0;

const IMG = '../img/';
const f1 = (n) => `${IMG}flippo-1/${String(n).padStart(3, '0')}.webp`;
const f2 = (n) => `${IMG}flippo-2/${String(n).padStart(3, '0')}.webp`;
const fsrc = (n) => (n <= 250 ? f1(n) : f2(n));
const dk = (n) => `${IMG}diskeyz/${String(n).padStart(2, '0')}.jpg`;
const BOUNCE = 'cubic-bezier(.3,1.6,.5,1)';

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const rr = (a, b) => a + rnd() * (b - a);

// ---------- beeld schalen ----------
function fit() { stage.style.transform = `scale(${Math.min(innerWidth / 1600, innerHeight / 900)})`; }
addEventListener('resize', fit); fit();

(function bagMask() {
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M3,0 H97 C97,4 100,8 100,14 V86 C100,92 97,96 97,100 H3 C3,96 0,92 0,86 V14 C0,8 3,4 3,0 Z'/></svg>";
  document.documentElement.style.setProperty('--bagmask', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
})();

// ---------- bouwstenen ----------
function mk(parent, cls, css, html) {
  const e = document.createElement('div');
  if (cls) e.className = cls;
  if (css) e.style.cssText = css;
  if (html) e.innerHTML = html;
  parent.appendChild(e);
  return e;
}
function img(parent, src, cls, css) {
  const e = document.createElement('img');
  e.src = src; e.alt = ''; e.draggable = false; e.decoding = 'sync';
  if (cls) e.className = cls;
  if (css) e.style.cssText = css;
  parent.appendChild(e);
  return e;
}
// flippo met middelpunt (x, y)
const fl = (parent, src, size, x, y, extra = '') =>
  img(parent, src, 'fl' + (src.endsWith('.jpg') ? ' round' : ''), `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;${extra}`);

// animatie; in de testmodus onthouden we wanneer hij begon zodat we hem kunnen stilzetten
let vt = 0;
const recorded = [];
function A(el, frames, o = {}) {
  const an = el.animate(frames, { duration: 400, fill: 'both', easing: 'ease-out', ...o });
  if (DEBUG) recorded.push([an, vt]);
  return an;
}

let audio = null;       // { ctx, t0, bufs }
let sceneWall = 0;      // wandkloktijd waarop de lopende scène begon
let pending = [];       // testmodus: uitgestelde acties
// voert fn uit op ms na het begin van de scène (ook als je at() vanuit een latere actie aanroept)
function at(ms, fn) {
  if (DEBUG) pending.push([ms, fn]);
  else setTimeout(fn, Math.max(0, ms - (performance.now() - sceneWall)));
}

// stripwoord dat in beeld knalt
function word(root, text, x, y, size, rot = -4, o = {}) {
  const tf = (r, s) => `translate(-50%,-50%) rotate(${r}deg) scale(${s})`;
  if (o.burst) {
    const b = mk(root, 'burst', `left:${x}px;top:${y}px;width:${o.burst[0]}px;height:${o.burst[1]}px;--col:${o.burstCol || '#e8212b'}`);
    A(b, [{ transform: tf(-30, 0) }, { transform: tf(rot * -1.5, 1.12), offset: .7 }, { transform: tf(rot * -1.5, 1) }], { duration: 330 });
    A(b, [{ transform: tf(rot * -1.5, 1) }, { transform: tf(rot * -1.5 + 5, 1.05) }], { duration: 500, delay: 330, iterations: Infinity, direction: 'alternate', fill: 'forwards', easing: 'ease-in-out' });
  }
  const w = mk(root, 'word', `left:${x}px;top:${y}px;font-size:${size}px;--st:${o.stroke || Math.max(8, size * .07)}px;--col:${o.col || '#ffe100'}`, text);
  A(w, [{ transform: tf(rot - 14, 4.2), opacity: 0 }, { transform: tf(rot + 3, .88), opacity: 1, offset: .6 }, { transform: tf(rot - 1, 1.07), offset: .82 }, { transform: tf(rot, 1) }], { duration: 330, easing: 'ease-in' });
  A(w, [{ transform: tf(rot - 1.4, 1) }, { transform: tf(rot + 1.4, 1.035) }], { duration: 300, delay: 330, iterations: Infinity, direction: 'alternate', fill: 'forwards', easing: 'ease-in-out' });
  if (!o.quiet) sfx('slam');
  return w;
}
function wordOut(w) { if (!w) return; if (DEBUG) return w.remove(); w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }); setTimeout(() => w.remove(), 150); }

function sticker(root, text, x, y, size, rot = 8, col = '#e8212b') {
  const s = mk(root, 'sticker', `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;font-size:${size * (text.length > 4 ? .2 : .34)}px;white-space:nowrap;background:${col}`, text);
  A(s, [{ transform: `rotate(${rot - 60}deg) scale(0)` }, { transform: `rotate(${rot + 6}deg) scale(1.2)`, offset: .7 }, { transform: `rotate(${rot}deg) scale(1)` }], { duration: 300 });
  return s;
}

function rays(root, c1, speed = 9000) {
  const r = mk(root, 'rays', c1 ? `--c1:${c1}` : '');
  A(r, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: speed, iterations: Infinity, easing: 'linear', fill: 'none' });
  return r;
}
function shake(cam, power = 16, dur = 320) {
  const k = [];
  for (let i = 0; i < 8; i++) k.push({ transform: `translate(${rr(-power, power) * (1 - i / 8)}px, ${rr(-power, power) * (1 - i / 8)}px)` });
  k.push({ transform: 'translate(0,0)' });
  A(cam, k, { duration: dur, easing: 'linear', fill: 'none' });
}
function flash(root, o = .85) { const f = mk(root, 'flash'); A(f, [{ opacity: o }, { opacity: 0 }], { duration: 260 }); }

// dichte map
function book(root, cover, w, x, y, cls = '') {
  const h = w * 1.475;
  const b = mk(root, 'book ' + cls, `width:${w}px;height:${h}px;left:${x - w / 2}px;top:${y - h / 2}px`);
  img(b, cover);
  return b;
}

// insteekblad met 4 x 5 hoesjes
const SER = [[75, '#d7263d', 'Flippo'], [100, '#f08a24', 'Cheetos Flippo'], [120, '#7b2cbf', 'Mega Flippo'], [140, '#1b9aaa', 'Techno Flippo'], [240, '#2a9d4b', 'World Flippo']];
function sheet(w, h, from, side, filled) {
  const p = document.createElement('div');
  p.className = 'pg';
  p.style.cssText = `width:${w}px;height:${h}px`;
  const s = w * .2, gap = (w * .84 - 4 * s) / 3, x0 = side ? w * .115 : w * .045, y0 = h * .115, pitch = h * .172;
  const [, col, name] = SER.find((r) => from <= r[0]);
  mk(p, 'ringholes', side ? 'left:0' : 'right:0', '<i></i><i></i><i></i><i></i>');
  mk(p, 'ttl', side ? 'right:4%' : 'left:4%', `${name} · ${from}–${from + 19}`);
  for (let i = 0; i < 20; i++) {
    const id = from + i;
    const k = mk(p, 'pocket', `left:${x0 + (i % 4) * (s + gap)}px;top:${y0 + Math.floor(i / 4) * pitch}px;width:${s}px;height:${s}px;--c:${col}`, `<b>${id}</b>`);
    img(k, fsrc(id), 'ghost');
    if (filled(id)) img(k, fsrc(id), 'in');
  }
  return p;
}
const most = (id) => id % 3 !== 1;

// flippo met dikte voor de 3D-scènes
function d3(parent, size, front, back, T = 8) {
  const d = mk(parent, 'd3', `width:${size}px;height:${size}px;left:${-size / 2}px;top:${-size / 2}px`);
  for (let z = -T / 2 + .75; z < T / 2; z += 1.5) img(d, front, 'e', `transform:translateZ(${z}px)`);
  img(d, front, '', `transform:translateZ(${T / 2}px)`);
  img(d, back, '', `transform:rotateY(180deg) translateZ(${T / 2}px)`);
  return d;
}

// nieuwe scène: vorige weg, flits en een zwiep
function scene(bg = 'table') {
  stage.innerHTML = '';
  const root = mk(stage, 'scene');
  const cam = mk(root, 'cam');
  mk(cam, bg);
  A(cam, [{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'none' });
  flash(root, .7);
  sfx('whoosh');
  return cam;
}

// ---------- de scènes ----------
const SCENES = [];
const add = (t, vo, fn) => SCENES.push({ t, vo, fn });

// 1 · HÉ! KEN JE ZE NOG? FLIPPO'S!
add(0, ['01', .5], () => {
  const c = scene();
  rays(c);
  const ids = [1, 6, 3, 12, 14, 9, 22, 30, 41, 47, 52, 60, 5, 33];
  ids.forEach((id, i) => {
    const a = i / ids.length * Math.PI * 2, x = 800 + Math.cos(a) * 640, y = 450 + Math.sin(a) * 350, size = rr(130, 190);
    const e = fl(c, f1(id), size, x, y);
    A(e, [{ transform: `translate(${Math.cos(a) * 900}px,${Math.sin(a) * 900}px) rotate(${rr(-400, 400)}deg) scale(.4)` }, { transform: `translate(0,0) rotate(${rr(-20, 20)}deg) scale(1)` }], { duration: 520, delay: i * 55, easing: BOUNCE });
    A(e, [{ translate: '0 0' }, { translate: `0 ${rr(-22, -10)}px` }], { duration: rr(260, 380), delay: 600 + i * 55, iterations: Infinity, direction: 'alternate', fill: 'none', easing: 'ease-in-out' });
  });
  sfx('boing', 100); sfx('boing', 400);
  let w;
  at(500, () => { w = word(c, 'HÉ!', 800, 430, 330, -7); });
  at(1500, () => { wordOut(w); w = word(c, 'KEN JE ZE NOG?', 800, 440, 170, -4); });
  at(2900, () => {
    wordOut(w);
    word(c, "FLIPPO'S!", 800, 450, 250, -5, { burst: [1560, 800] });
    shake(c, 26, 420); flash(c.parentNode); sfx('sparkle');
  });
});

// 2 · DRIE MAPPEN – WELKE PAK JIJ?
add(5, ['02', .3], () => {
  const c = scene();
  const covers = [[`${IMG}flippo-1/cover.jpg`, '1995', ''], [`${IMG}flippo-2/cover.jpg`, '1996', ''], [`${IMG}diskeyz/cover.jpg`, '2026', 'dk']];
  const books = covers.map(([src, year, cls], i) => {
    const x = 400 + i * 400, rot = [-5, 3, -2][i];
    const b = book(c, src, 300, x, 500, cls);
    A(b, [{ transform: `translateY(-900px) rotate(${rot + 25}deg) scale(1.4)` }, { transform: `translateY(0) rotate(${rot}deg) scale(1)` }], { duration: 480, delay: 100 + i * 190, easing: BOUNCE });
    at(380 + i * 190, () => { sfx('thud'); b._s = sticker(c, year, x + 130, 300, 120, 10); });
    return b;
  });
  let w;
  at(450, () => { w = word(c, 'DRIE MAPPEN!', 800, 120, 150, -3); });
  at(2500, () => { wordOut(w); w = word(c, 'WELKE PAK JIJ?', 800, 120, 150, 3); books.forEach((b, i) => A(b, [{ translate: '0 0' }, { translate: '0 -40px' }, { translate: '0 0' }], { duration: 330, delay: i * 110, fill: 'none', easing: 'ease-in-out' })); });
  at(3700, () => {
    wordOut(w); sfx('whoosh');
    books.forEach((b) => b._s?.remove());
    A(books[1], [{ transform: 'rotate(3deg)' }, { transform: 'translate(300px,1100px) rotate(80deg)' }], { duration: 420, easing: 'ease-in' });
    A(books[2], [{ transform: 'rotate(-2deg)' }, { transform: 'translate(900px,-300px) rotate(-70deg)' }], { duration: 420, easing: 'ease-in' });
    A(books[0], [{ transform: 'rotate(-5deg) scale(1)' }, { transform: 'translate(590px,-50px) rotate(0deg) scale(1.38)' }], { duration: 480, easing: 'cubic-bezier(.4,0,.2,1.3)' });
  });
  at(4250, () => {
    books[0].remove();
    // de kaft slaat open: voorkant = kaft, achterkant = binnenkant
    const W = 400, H = 590, sp = mk(c, 'spread', `left:800px;top:${450 - H / 2}px;width:${W}px;height:${H}px;perspective:2400px`);
    sp.appendChild(sheet(W, H, 1, 1, () => false));
    const leaf = mk(sp, 'leaf', `width:${W}px;height:${H}px;transform-origin:0 50%`);
    mk(leaf, 'pg img', `width:${W}px;height:${H}px;background-image:url(${IMG}flippo-1/cover.jpg)`);
    mk(leaf, 'pg img bk', `width:${W}px;height:${H}px;background-image:url(${IMG}flippo-1/inside.jpg)`);
    A(leaf, [{ transform: 'translateZ(2px) rotateY(0deg)' }, { transform: 'translateZ(2px) rotateY(-180deg)' }], { duration: 750, easing: 'cubic-bezier(.4,0,.2,1)' });
    sfx('page', 150); sfx('thud', 700);
    at(4950, () => { word(c, 'OPEN!', 800, 86, 150, -5); shake(c, 10); });
  });
});

// 3 · DE ZAK CHIPS: KNIJP… POP!
add(11, ['03', .3], () => {
  const c = scene();
  rays(c, 'rgba(255,255,255,.2)');
  const W = 330, H = 550, bx = 800, by = 420;
  const bag = mk(c, 'bag', `width:${W}px;height:${H}px;left:${bx - W / 2}px;top:${by - H / 2}px`);
  const pts = [];
  for (let i = 0; i <= 14; i++) pts.push(`${(i / 14 * 100).toFixed(1)}% ${(88 + (i % 2 ? 1.6 : -1.2)).toFixed(1)}%`);
  const wrap = mk(bag, '', 'position:absolute;inset:0');
  mk(wrap, 'p', `clip-path:polygon(0 0,100% 0,${[...pts].reverse().join(',')})`);
  const fL = mk(wrap, 'p', `clip-path:polygon(${pts.slice(0, 8).join(',')},50% 100%,0 100%);transform-origin:0 88%`);
  const fR = mk(wrap, 'p', `clip-path:polygon(${pts.slice(7).join(',')},100% 100%,50% 100%);transform-origin:100% 88%`);
  A(bag, [{ transform: 'translateY(-900px) rotate(-30deg)' }, { transform: 'translateY(0) rotate(0deg)' }], { duration: 520, easing: BOUNCE });
  A(bag, [{ rotate: '-3deg' }, { rotate: '3deg' }], { duration: 420, delay: 520, iterations: Infinity, direction: 'alternate', fill: 'none', easing: 'ease-in-out' });
  sfx('thud', 380);
  let w;
  at(350, () => { w = word(c, 'PAK EEN ZAK CHIPS!', 800, 78, 104, -2); });
  at(2300, () => {
    wordOut(w); w = word(c, 'KNIJP!', 350, 430, 170, -12);
    A(wrap, [{ transform: 'scale(1,1)' }, { transform: 'scale(.8,1.07)' }, { transform: 'scale(1,1)' }, { transform: 'scale(.76,1.09)' }, { transform: 'scale(1,1)' }, { transform: 'scale(.7,1.12)' }], { duration: 1500, easing: 'ease-in-out' });
    sfx('squeak'); sfx('squeak', 500); sfx('squeak', 1000);
  });
  at(3800, () => {
    wordOut(w);
    A(wrap, [{ transform: 'scale(.7,1.12)' }, { transform: 'scale(1.16,.94)', offset: .35 }, { transform: 'scale(1,1)' }], { duration: 380 });
    A(fL, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(80deg)' }], { duration: 200, easing: BOUNCE });
    A(fR, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-80deg)' }], { duration: 200, easing: BOUNCE });
    flash(c.parentNode); shake(c, 30, 450); sfx('pop'); sfx('crunch', 80); sfx('crunch', 420);
    word(c, 'POP!', 1200, 290, 250, 9, { burst: [720, 520] });
    for (let i = 0; i < 38; i++) {
      const s = rr(54, 96), dx = rr(-760, 760), up = rr(120, 420), dy = rr(60, 230);
      const ch = img(c, `${IMG}flippo-1/chip-${1 + (i % 5)}.webp`, 'chip', `width:${s}px;left:${bx - s / 2}px;top:${by + H * .4}px`);
      A(ch, [{ transform: 'translate(0,0) scale(.3)', easing: 'cubic-bezier(.2,.8,.4,1)' }, { transform: `translate(${dx * .6}px,${-up}px) rotate(${rr(-300, 300)}deg) scale(1)`, offset: .42, easing: 'ease-in' }, { transform: `translate(${dx}px,${dy}px) rotate(${rr(-700, 700)}deg) scale(1)` }], { duration: rr(650, 1000), delay: i * 9 });
    }
    [1, 6, 3, 12, 14].forEach((id, i) => {
      const e = fl(c, f1(id), 170, bx, by + H * .42);
      const tx = (i - 2) * 250, r = rr(-30, 30);
      A(e, [{ transform: 'translate(0,0) scale(.2)', easing: 'cubic-bezier(.2,.8,.4,1)' }, { transform: `translate(${tx * .6}px,-330px) rotate(${r * 8}deg) scale(1.1)`, offset: .45, easing: 'ease-in' }, { transform: `translate(${tx}px,150px) rotate(${r}deg) scale(1)` }], { duration: 900, delay: 120 + i * 90 });
    });
  });
});

// 4 · VIJF FLIPPO'S! WELKE HEB JIJ AL?
add(17.5, ['04', .3], () => {
  const c = scene();
  for (let i = 0; i < 12; i++) { const s = rr(50, 90); img(c, `${IMG}flippo-1/chip-${1 + (i % 5)}.webp`, 'chip', `width:${s}px;left:${rr(40, 1500)}px;top:${rr(700, 840)}px;transform:rotate(${rr(0, 360)}deg)`); }
  const els = [1, 6, 3, 12, 14].map((id, i) => {
    const x = 260 + i * 270, e = fl(c, f1(id), 250, x, 500);
    A(e, [{ transform: 'translateY(-800px) rotate(-200deg)' }, { transform: 'translateY(0) rotate(0deg)' }], { duration: 430, delay: i * 130, easing: BOUNCE });
    at(250 + i * 130, () => { sticker(c, String(i + 1), x + 86, 370, 92, 8, '#1b63c9'); sfx('ding' + i); });
    return e;
  });
  let w;
  at(250, () => { w = word(c, "VIJF FLIPPO'S!", 800, 170, 170, -4); });
  at(1600, () => {
    wordOut(w); word(c, 'WELKE HEB JIJ AL?', 800, 170, 140, 3);
    els.forEach((e, i) => A(e, [{ translate: '0 0', rotate: '0deg' }, { translate: '0 -90px', rotate: '20deg' }, { translate: '0 0', rotate: '0deg' }], { duration: 380, delay: i * 90, iterations: 3, fill: 'none', easing: 'ease-in-out' }));
    sfx('boing'); sfx('boing', 400);
  });
});

// 5 · SCHUIF ZE IN JE MAP
add(21.5, ['05', .3], () => {
  const c = scene();
  const pg = mk(c, 'pg', 'left:310px;top:185px;width:980px;height:690px');
  mk(pg, 'ttl', 'left:4%;font-size:22px', 'Flippo · 1–8');
  const P = [];
  for (let i = 0; i < 8; i++) {
    const x = 70 + (i % 4) * 220, y = 120 + Math.floor(i / 4) * 290;
    const k = mk(pg, 'pocket', `left:${x}px;top:${y}px;width:190px;height:190px;--c:#d7263d`, `<b style="font-size:20px;line-height:28px">${i + 1}</b>`);
    img(k, f1(i + 1), 'ghost');
    P.push([310 + x + 95, 185 + y + 95]);
  }
  A(pg, [{ transform: 'translateY(800px) rotate(6deg)' }, { transform: 'translateY(0) rotate(0deg)' }], { duration: 420, easing: BOUNCE });
  at(300, () => word(c, 'SCHUIF ZE IN JE MAP!', 800, 86, 112, -2));
  [[1, 800], [2, 1650], [3, 2500]].forEach(([id, t], i) => at(t, () => {
    const [x, y] = P[id - 1], e = fl(c, f1(id), 190, x, y, 'z-index:5');
    A(e, [{ transform: `translate(${i % 2 ? 700 : -700}px,-420px) rotate(${i % 2 ? 200 : -200}deg) scale(1.5)`, easing: 'cubic-bezier(.2,.8,.3,1)' }, { transform: 'translate(0,-215px) rotate(0deg) scale(1.08)', offset: .45, easing: 'ease-in' }, { transform: 'translate(0,-215px) scale(1.08)', offset: .6, easing: 'cubic-bezier(.5,0,.6,1)' }, { transform: 'translate(0,0) scale(1)' }], { duration: 760 });
    sfx('zip', 330); sfx('thud', 730);
    at(t + 420, () => { const z = word(c, 'ZOEF!', x + (i % 2 ? 190 : -190), y - 190, 86, i % 2 ? 12 : -12, { quiet: true }); at(t + 1000, () => wordOut(z)); });
  }));
  at(3500, () => { sticker(c, '3 / 250', 1380, 720, 200, -10, '#1b63c9'); sfx('ding4'); });
});

// 6 · SLA ZELF DE BLADZIJDE OM – MEER DAN VIJFHONDERD
add(27, ['06', .3], () => {
  const c = scene();
  const W = 430, H = 634, top = 150;
  const sp = mk(c, 'spread', `left:${800 - W}px;top:${top}px;width:${W * 2}px;height:${H}px;perspective:2600px`);
  const L = sheet(W, H, 21, 0, most); L.style.left = '0'; sp.appendChild(L);
  const R = sheet(W, H, 121, 1, most); R.style.left = W + 'px'; sp.appendChild(R);
  const leaf = (front, back, z0, z1, t) => {
    const lf = mk(sp, 'leaf', `left:${W}px;width:${W}px;height:${H}px;transform-origin:0 50%;transform:translateZ(${z0}px)`);
    lf.appendChild(sheet(W, H, front, 1, most));
    const b = sheet(W, H, back, 0, most); b.classList.add('bk'); lf.appendChild(b);
    at(t, () => { A(lf, [{ transform: `translateZ(${z0}px) rotateY(0deg)` }, { transform: `translateZ(30px) rotateY(-90deg) skewY(-4deg)`, offset: .5 }, { transform: `translateZ(${z1}px) rotateY(-180deg)` }], { duration: 720, easing: 'cubic-bezier(.45,.05,.4,1)' }); sfx('page'); });
  };
  leaf(81, 101, 1, 3, 1500);
  leaf(41, 61, 2, 2, 600);
  A(sp, [{ transform: 'scale(.6) rotate(-8deg)' }, { transform: 'scale(1) rotate(0deg)' }], { duration: 380, easing: BOUNCE });
  let w;
  at(300, () => { w = word(c, 'SLA OM!', 800, 78, 120, -4); });
  at(2400, () => {
    wordOut(w); rays(c);
    word(c, "545 FLIPPO'S!", 800, 460, 176, -5, { burst: [1500, 640] });
    shake(c, 22, 400); flash(c.parentNode, .6); sfx('sparkle');
  });
});

// 7 · KLIK! KLIK! KLIK!
add(33.5, ['07', .3], () => {
  const c = scene();
  const R = 140, D = R * 1.68, cx = 800, cy = 560;
  const grp = mk(c, '', 'position:absolute;inset:0');
  const mid = fl(grp, f2(255), R * 2, cx, cy);
  A(mid, [{ transform: 'translateY(-800px) rotate(300deg)' }, { transform: 'translateY(0) rotate(0deg)' }], { duration: 480, easing: BOUNCE });
  sfx('thud', 380);
  let w;
  at(300, () => { w = word(c, 'EN DEZE?', 800, 110, 150, -4); });
  at(1700, () => { wordOut(w); w = word(c, 'KLIK ZE IN ELKAAR!', 800, 110, 124, 3); });
  [[251, -1, 0, 3600, 300, 330, -12], [262, 1, 0, 4200, 1300, 330, 10], [274, 0, -1, 4800, 1250, 760, -6]].forEach(([id, dx, dy, t, wx, wy, wr]) => at(t - 260, () => {
    const e = fl(grp, f2(id), R * 2, cx + dx * D, cy + dy * D);
    A(e, [{ transform: `translate(${dx * 900}px,${dy * 700}px) rotate(${rr(-300, 300)}deg)` }, { transform: 'translate(0,0) rotate(0deg)' }], { duration: 260, easing: 'cubic-bezier(.5,0,.9,.5)' });
    at(t, () => {
      sfx('click'); shake(c, 12, 200);
      const k = word(c, 'KLIK!', wx, wy, 150, wr, { quiet: true, burst: [420, 300], burstCol: '#1b63c9' });
      A(mid, [{ scale: '1' }, { scale: '1.08' }, { scale: '1' }], { duration: 180, fill: 'none' });
      void k;
    });
  }));
  at(5500, () => A(grp, [{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(-60px) rotate(-6deg)' }, { transform: 'translateY(0) rotate(0deg)' }], { duration: 360, iterations: 2, fill: 'none', easing: 'ease-in-out' }));
});

// 8 · WAUW! IN 3D
add(40, ['08', .3], () => {
  const c = scene('blue');
  rays(c, 'rgba(255,255,255,.13)', 7000);
  const holder = mk(c, '', 'position:absolute;inset:0;perspective:1500px');
  const world = mk(holder, 'world', 'top:61%');
  const R = 150, D = R * 1.68, back = f2(0).replace('000.webp', 'back-07.webp');
  [[255, ''], [251, `translateX(${-D}px) rotateX(90deg)`], [262, `translateX(${D}px) rotateX(90deg)`], [274, `translateY(${-D}px) rotateY(90deg)`], [283, `translateY(${D}px) rotateY(90deg)`]].forEach(([id, tf]) => {
    const d = d3(world, R * 2, f2(id), back, 9);
    d.style.transform = tf;
  });
  A(world, [{ transform: 'scale(.1) rotateX(-24deg) rotateY(-200deg)' }, { transform: 'scale(1) rotateX(-24deg) rotateY(0deg)' }], { duration: 600, easing: BOUNCE });
  A(world, [{ transform: 'rotateX(-24deg) rotateY(0deg)' }, { transform: 'rotateX(-24deg) rotateY(360deg)' }], { duration: 3000, delay: 600, iterations: Infinity, easing: 'linear', fill: 'forwards' });
  at(300, () => { word(c, 'WAUW!', 800, 118, 190, -5); sfx('sparkle'); shake(c, 14); });
  at(1700, () => sticker(c, '3D!', 1380, 300, 200, 12));
  at(2000, () => sfx('whoosh'));
  at(3500, () => sfx('whoosh'));
});

// 9 · VAN DICHTBIJ: VOORKANT… ACHTERKANT!
add(45, ['09', .3], () => {
  const c = scene('blue');
  rays(c, 'rgba(255,225,0,.16)', 12000);
  const holder = mk(c, '', 'position:absolute;inset:0;perspective:1600px');
  const world = mk(holder, 'world', 'top:52%');
  d3(world, 500, 'held-voor.webp', 'held-achter.webp', 14);
  A(world, [{ transform: 'scale(.05) rotateY(-720deg)' }, { transform: 'scale(1) rotateY(0deg)' }], { duration: 700, easing: 'cubic-bezier(.2,1.2,.4,1)' });
  A(world, [{ transform: 'rotateX(8deg) rotateY(-32deg)' }, { transform: 'rotateX(-8deg) rotateY(32deg)' }], { duration: 900, delay: 700, iterations: 3, direction: 'alternate', easing: 'ease-in-out', fill: 'forwards' });
  A(world, [{ transform: 'rotateX(-8deg) rotateY(32deg)' }, { transform: 'rotateY(0deg)' }], { duration: 300, delay: 3400, fill: 'forwards' });
  let w;
  at(350, () => { w = word(c, 'VAN DICHTBIJ!', 800, 96, 120, -3); });
  at(3700, () => { word(c, 'VOORKANT!', 330, 770, 92, -8); sfx('ding2'); });
  at(5000, () => {
    A(world, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }], { duration: 480, easing: 'cubic-bezier(.4,0,.2,1.4)', fill: 'forwards' });
    A(world, [{ transform: 'rotateX(6deg) rotateY(160deg)' }, { transform: 'rotateX(-6deg) rotateY(200deg)' }], { duration: 800, delay: 480, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', fill: 'forwards' });
    sfx('whoosh');
  });
  at(5300, () => { word(c, 'ACHTERKANT!', 1240, 770, 92, 8); sfx('ding4'); });
  void w;
});

// 10 · OOK DE DISKEYZ DOEN MEE
add(52.5, ['10', .35], () => {
  const c = scene();
  rays(c, 'rgba(27,99,201,.2)');
  const b = book(c, `${IMG}diskeyz/cover.jpg`, 330, 400, 510, 'dk');
  A(b, [{ transform: 'translateX(-900px) rotate(-40deg)' }, { transform: 'translateX(0) rotate(-5deg)' }], { duration: 450, easing: BOUNCE });
  at(420, () => { sticker(c, '2026', 560, 290, 130, 12); sfx('thud'); });
  [2, 25, 21, 17, 1, 12, 15, 30, 9, 22, 6, 28].forEach((id, i) => {
    const x = 800 + (i % 4) * 185, y = 330 + Math.floor(i / 4) * 185, e = fl(c, dk(id), 160, x, y);
    A(e, [{ transform: `translateY(-900px) rotate(${rr(-300, 300)}deg)` }, { transform: `translateY(0) rotate(${rr(-12, 12)}deg)` }], { duration: 480, delay: 150 + i * 70, easing: BOUNCE });
    A(e, [{ translate: '0 0' }, { translate: '0 -18px' }], { duration: rr(240, 340), delay: 800 + i * 70, iterations: Infinity, direction: 'alternate', fill: 'none', easing: 'ease-in-out' });
  });
  sfx('boing', 300); sfx('boing', 700);
  at(400, () => word(c, 'DISKEYZ DOEN MEE!', 800, 110, 132, -3));
});

// 11 · KLAP DICHT EN DRAAI OM
add(56.5, ['11', .3], () => {
  const c = scene();
  const W = 400, H = 590;
  const sp = mk(c, 'spread', `left:800px;top:${470 - H / 2}px;width:${W}px;height:${H}px;perspective:2400px`);
  const bookEl = mk(sp, '', `position:absolute;inset:0;transform-style:preserve-3d`);
  const right = sheet(W, H, 1, 1, most); right.style.backfaceVisibility = 'hidden'; bookEl.appendChild(right);
  mk(bookEl, 'pg backface', `width:${W}px;height:${H}px;transform:rotateY(180deg) translateZ(3px);backface-visibility:hidden`,
    `<div class="word" style="position:static;font-size:92px;--st:9px;transform:rotate(-6deg)">Flippo's</div><div style="font-size:30px;font-weight:800;color:#3a3216">Spaar ze allemaal!</div>`);
  const leaf = mk(bookEl, 'leaf', `width:${W}px;height:${H}px;transform-origin:0 50%;transform:translateZ(3px) rotateY(-180deg)`);
  mk(leaf, 'pg img', `width:${W}px;height:${H}px;background-image:url(${IMG}flippo-1/cover.jpg)`);
  mk(leaf, 'pg img bk', `width:${W}px;height:${H}px;background-image:url(${IMG}flippo-1/inside.jpg)`);
  let w;
  at(300, () => { w = word(c, 'KLAAR?', 800, 100, 150, -4); });
  at(1500, () => {
    A(leaf, [{ transform: 'translateZ(3px) rotateY(-180deg)' }, { transform: 'translateZ(3px) rotateY(0deg)' }], { duration: 520, easing: 'cubic-bezier(.5,0,.8,.6)' });
    A(sp, [{ transform: 'translateX(0)' }, { transform: `translateX(${-W / 2}px)` }], { duration: 520, easing: 'ease-in-out' });
    sfx('page');
  });
  at(2020, () => { wordOut(w); w = word(c, 'KLAP!', 300, 470, 160, -12, { burst: [470, 340] }); shake(c, 24, 380); sfx('thud'); });
  at(3200, () => {
    A(bookEl, [{ transform: 'rotateY(0deg) scale(1)' }, { transform: 'rotateY(90deg) scale(1.15)', offset: .5 }, { transform: 'rotateY(180deg) scale(1)' }], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)' });
    sfx('whoosh');
  });
  at(3500, () => word(c, 'DRAAI!', 1300, 470, 150, 10, { burst: [500, 340], burstCol: '#1b63c9' }));
});

// 12 · FLIPPO'S! NET ALS IN 1995 – MAAR NU IN JE BROWSER
add(62.5, ['12', .3], () => {
  const c = scene();
  rays(c);
  [1, 6, 3, 12, 14, 9, 22, 47, 52, 60, 255, 262].forEach((id, i, a) => {
    const ang = i / a.length * 360, e = fl(c, fsrc(id), 140, 800, 450);
    A(e, [{ transform: `rotate(${ang}deg) translate(0,-80px) scale(.2)` }, { transform: `rotate(${ang + 40}deg) translate(700px,0) scale(1)` }], { duration: 600, easing: 'ease-out' });
    A(e, [{ transform: `rotate(${ang + 40}deg) translate(700px,0) rotate(${-ang - 40}deg)` }, { transform: `rotate(${ang + 400}deg) translate(700px,0) rotate(${-ang - 400}deg)` }], { duration: 14000, delay: 600, iterations: Infinity, easing: 'linear', fill: 'forwards' });
  });
  at(250, () => { word(c, "FLIPPO'S!", 800, 290, 290, -5, { burst: [1400, 640] }); shake(c, 22, 400); flash(c.parentNode, .6); });
  at(1500, () => { word(c, 'NET ALS IN 1995…', 800, 590, 120, 3, { col: '#fff' }); });
  at(3500, () => { word(c, '…MAAR NU IN JE BROWSER!', 800, 760, 104, -2); sfx('sparkle'); });
});

// 13 · SPAAR ZE ALLEMAAL!
add(69.5, ['13', .45], () => {
  const c = scene();
  rays(c, 'rgba(232,33,43,.3)', 5000);
  for (let i = 0; i < 44; i++) {
    const id = [1, 6, 3, 12, 14, 9, 22, 47, 52, 60, 255, 262, 274, 130, 77, 300][i % 16], s = rr(90, 170), x = rr(0, 1600);
    const e = fl(c, fsrc(id), s, x, -120);
    A(e, [{ transform: `translateY(0) rotate(${rr(-200, 200)}deg)` }, { transform: `translateY(${rr(1100, 1300)}px) rotate(${rr(-600, 600)}deg)` }], { duration: rr(900, 1700), delay: rr(0, 2300), easing: 'ease-in', iterations: 2 });
  }
  at(450, () => { word(c, 'SPAAR ZE', 800, 300, 250, -5); shake(c, 18); });
  at(900, () => { word(c, 'ALLEMAAL!', 800, 590, 270, -5, { burst: [1500, 520] }); shake(c, 30, 450); flash(c.parentNode); sfx('sparkle'); });
});

// 14 · EINDKAART
add(73, null, () => {
  const c = scene();
  rays(c, 'rgba(255,225,0,.22)', 16000);
  [[`${IMG}flippo-1/cover.jpg`, '1995', ''], [`${IMG}flippo-2/cover.jpg`, '1996', ''], [`${IMG}diskeyz/cover.jpg`, '2026', 'dk']].forEach(([src, year, cls], i) => {
    const x = 400 + i * 400, rot = [-5, 3, -3][i], b = book(c, src, 262, x, 455, cls);
    A(b, [{ transform: `translateY(900px) rotate(${rot - 30}deg)` }, { transform: `translateY(0) rotate(${rot}deg)` }], { duration: 480, delay: 250 + i * 150, easing: BOUNCE });
    A(b, [{ translate: '0 0' }, { translate: '0 -12px' }], { duration: 520 + i * 60, delay: 900, iterations: Infinity, direction: 'alternate', fill: 'none', easing: 'ease-in-out' });
    at(600 + i * 150, () => { sticker(c, year, x + 118, 290, 104, 10); sfx('thud'); });
  });
  [[1, 120, 230], [6, 1480, 250], [255, 150, 640], [12, 1470, 620], [3, 215, 440], [14, 1400, 440]].forEach(([id, x, y], i) => {
    const e = fl(c, fsrc(id), 130, x, y);
    A(e, [{ transform: 'scale(0) rotate(-200deg)' }, { transform: `scale(1) rotate(${rr(-20, 20)}deg)` }], { duration: 420, delay: 500 + i * 80, easing: BOUNCE });
  });
  at(150, () => word(c, "FLIPPO'S", 800, 110, 170, -4));
  at(1250, () => {
    const u = mk(c, 'url', 'left:800px;top:756px', 'flippos.bramdehart.nl');
    A(u, [{ transform: 'translate(-50%,-50%) scale(0) rotate(-12deg)' }, { transform: 'translate(-50%,-50%) scale(1.12) rotate(2deg)', offset: .7 }, { transform: 'translate(-50%,-50%) scale(1) rotate(-1.5deg)' }], { duration: 380 });
    A(u, [{ scale: '1' }, { scale: '1.04' }], { duration: 420, delay: 380, iterations: Infinity, direction: 'alternate', fill: 'none', easing: 'ease-in-out' });
    sfx('sparkle');
  });
  at(1700, () => {
    const d = mk(c, 'small', '', 'Dit is een hobbyproject en geen officieel product van Smiths, Albert Heijn, Disney, Pixar of Warner Bros.');
    A(d, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
  });
});
const TOTAL = 80.6;

// ---------- geluid ----------
function sfx(name, ms = 0) {
  if (!audio) return;
  const { ctx, out } = audio, t = ctx.currentTime + ms / 1000;
  const osc = (type, f0, f1, dur, vol, when = t) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, when); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), when + dur);
    g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(.001, when + dur);
    o.connect(g).connect(out); o.start(when); o.stop(when + dur + .02);
  };
  const noise = (dur, vol, type, fa, fb, when = t, q = 1) => {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = audio.noise; f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(fa, when); f.frequency.exponentialRampToValueAtTime(fb, when + dur);
    g.gain.setValueAtTime(.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + dur * .25); g.gain.exponentialRampToValueAtTime(.001, when + dur);
    s.connect(f).connect(g).connect(out); s.start(when, rnd() * 1.5, dur + .05);
  };
  if (name === 'whoosh') noise(.36, .5, 'bandpass', 350, 4200, t, .8);
  else if (name === 'slam') { osc('sine', 170, 45, .2, .8); noise(.07, .35, 'lowpass', 2500, 400); }
  else if (name === 'thud') { osc('sine', 120, 50, .16, .7); noise(.05, .2, 'lowpass', 900, 300); }
  else if (name === 'pop') { osc('sine', 520, 50, .26, 1); osc('square', 900, 120, .1, .25); noise(.16, .7, 'highpass', 600, 2500); }
  else if (name === 'click') { osc('square', 2100, 900, .045, .35); osc('triangle', 520, 260, .09, .5, t + .02); noise(.03, .3, 'highpass', 3000, 5000); }
  else if (name === 'crunch') for (let i = 0; i < 9; i++) noise(.05, .32, 'highpass', rr(1800, 4000), rr(900, 2000), t + i * .045 + rnd() * .02, 2);
  else if (name === 'boing') { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(560, t + .12); o.frequency.exponentialRampToValueAtTime(240, t + .3); g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .32); o.connect(g).connect(out); o.start(t); o.stop(t + .34); }
  else if (name === 'squeak') osc('sine', 700, 1500, .14, .22);
  else if (name === 'zip') osc('sawtooth', 320, 1500, .16, .16);
  else if (name === 'sparkle') [1047, 1319, 1568, 2093, 2637].forEach((f, i) => osc('sine', f, f, .22, .2, t + i * .055));
  else if (name.startsWith('ding')) { const f = [784, 880, 988, 1047, 1175][+name[4] || 0]; osc('sine', f, f, .3, .32); osc('sine', f * 2, f * 2, .18, .12); }
  else if (name === 'page' && audio.bufs.page) { const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = audio.bufs.page; g.gain.value = 2.6; s.connect(g).connect(out); s.start(t); }
}

async function loadAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const get = async (url) => ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
  const names = SCENES.filter((s) => s.vo).map((s) => s.vo[0]);
  const [music, page, ...vo] = await Promise.all([get('muziek.mp3'), get('../snd/page.mp3'), ...names.map((n) => get(`vo/${n}.mp3`))]);
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), ch = noise.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  const out = ctx.createGain(); out.gain.value = .5; out.connect(ctx.destination);
  return { ctx, music, noise, out, bufs: { page, ...Object.fromEntries(names.map((n, i) => [n, vo[i]])) } };
}

// ---------- afspelen ----------
function play() {
  const { ctx } = audio;
  ctx.resume();
  const t0 = audio.t0 = ctx.currentTime + .15;
  const mg = ctx.createGain(); mg.gain.value = .3; mg.connect(ctx.destination);
  const ms = ctx.createBufferSource(); ms.buffer = audio.music; ms.connect(mg); ms.start(t0);
  // muziek zakt iets weg onder de stem
  const vg = ctx.createGain(); vg.gain.value = 1.25; vg.connect(ctx.destination);
  for (const s of SCENES) {
    if (!s.vo) continue;
    const b = audio.bufs[s.vo[0]], st = t0 + s.t + s.vo[1];
    const src = ctx.createBufferSource(); src.buffer = b; src.connect(vg); src.start(st);
    mg.gain.setTargetAtTime(.17, st - .05, .05);
    mg.gain.setTargetAtTime(.3, st + b.duration, .15);
  }
  mg.gain.setTargetAtTime(.42, t0 + 73, .3);
  const wall0 = performance.now() + 150;
  SCENES.forEach((s) => setTimeout(() => { sceneWall = performance.now(); s.fn(); }, wall0 - performance.now() + s.t * 1000));
  setTimeout(() => {
    ms.stop();
    // eindkaart blijft staan; alleen een knopje om opnieuw te kijken
    const st = document.getElementById('start');
    st.classList.add('again');
    st.hidden = false;
    document.getElementById('play').textContent = '↻ Nog een keer!';
  }, wall0 - performance.now() + TOTAL * 1000);
}

if (DEBUG) {
  document.getElementById('start').hidden = true;
  const s = SCENES[+qs.get('s')];
  s.fn();
  // uitgestelde acties in volgorde uitvoeren tot het gevraagde moment
  for (;;) {
    pending.sort((a, b) => a[0] - b[0]);
    const i = pending.findIndex((p) => p[0] <= DEBUG_P);
    if (i < 0) break;
    const [ms, fn] = pending.splice(i, 1)[0];
    vt = ms; fn();
  }
  for (const [an, start] of recorded) { try { an.pause(); an.currentTime = Math.max(0, DEBUG_P - start); } catch { /* al klaar */ } }
} else {
  const btn = document.getElementById('play');
  loadAudio().then((a) => {
    audio = a;
    btn.disabled = false;
    btn.textContent = '▶ Speel de reclame af';
    document.title = "Flippo's – de reclame";
    if (qs.has('auto')) btn.click();
  }).catch(() => { btn.textContent = 'Laden mislukt – herlaad de pagina'; });
  btn.onclick = () => { document.getElementById('start').hidden = true; play(); };
}
