'use strict';

// ---------- gegevens ----------
// [naam, groente/fruit op de achterkant, emoji]
const DATA = [
  ['Sneeuwwitje', 'Appel', '🍎'], ['Minnie Mouse', 'Kersen', '🍒'], ['Donald Duck', 'Rode kool', '🥬'],
  ['Lotso', 'Aardbei', '🍓'], ['Maui', 'Tomaat', '🍅'],
  ['Assepoester', 'Pompoen', '🎃'], ['Vaiana', 'Mandarijn', '🍊'], ['Pumba', 'Bruine bonen', '🫘'],
  ['Simba', 'Zoete aardappel', '🍠'], ['Olaf', 'Wortel', '🥕'],
  ['Goofy', 'Banaan', '🍌'], ['Winnie de Poeh', 'Honingmeloen', '🍈'], ['Woody', 'Maïs', '🌽'],
  ['Timon', 'Aardappel', '🥔'], ['Mickey', 'Paprika', '🫑'],
  ['Mike', 'Broccoli', '🥦'], ['Buzz Lightyear', 'Rucola', '🌿'], ['Rex', 'Doperwten', '🫛'],
  ['Angel', 'Kiwi', '🥝'], ['Ariel', 'Komkommer', '🥒'],
  ['Elsa', 'IJsbergsla', '🥬'], ['Bliksem McQueen', 'Bloemkool', '🥦'], ['Dory', 'Pastinaak', '🥕'],
  ['Geest', 'Blauwe bessen', '🫐'], ['Stitch', 'Druiven', '🍇'],
  ['Remy', 'Aubergine', '🍆'], ['Plezier', 'Framboos', '🍓'], ['Sulley', 'Prei', '🧅'],
  ['Anna', 'Bramen', '🫐'], ['Katrien', 'Radijs', '🌱'],
];
const COLORS = ['#c4215d', '#e8702a', '#eeb02c', '#1f7a4d', '#1e5fc4', '#4b2a9b'];

// ---------- de drie mappen ----------
const SETS = {
  flippo1: { title: "Flippo's map 1", kind: 'flippo', from: 1, to: 250, store: 'flippo-state-f1', dir: 'img/flippo-1', cover: 'img/flippo-1/cover.jpg', pack: 'img/flippo-1/chips.jpg', packRatio: 0.6 },
  flippo2: { title: "Flippo's map 2", kind: 'flippo', from: 251, to: 545, store: 'flippo-state-f2', dir: 'img/flippo-2', cover: 'img/flippo-2/cover.jpg', pack: 'img/flippo-2/chips.jpg', packRatio: 0.6 },
  diskeyz: { title: 'AH Diskeyz', kind: 'diskeyz', from: 1, to: 30, store: 'flippo-state-v1', dir: 'img/diskeyz', cover: 'img/diskeyz/cover.jpg', pack: 'img/diskeyz/pack.jpg', packRatio: 420 / 638 },
};
const SET = SETS[location.hash.slice(1)] || null;   // geen keuze = eerst het overzicht
const FLIPPO = !!SET && SET.kind === 'flippo';       // ronde flippo's zonder gleufjes
// per serie een eigen kleur (achterkant en rand van het vakje)
const FCOLORS = ['#d7263d', '#f08a24', '#7b2cbf', '#1b9aaa', '#2a9d4b', '#e63987', '#1f6fd0', '#f0a202',
  '#8f2d56', '#3a7d44', '#8f2d56', '#c1121f', '#5a5a9c', '#0b7a75', '#4a2c6f'];
const SHINY = FLIPPO
  ? Object.fromEntries(Array.from({ length: 20 }, (_, i) => [121 + i, 'holo']))   // Techno-flippo's glimmen
  : { 2: 'foil', 17: 'laser', 21: 'glitter', 25: 'holo' };

// vakjes op een pagina, in map-eenheden (pagina = 880 x 1300)
const ROWS = [
  [125, [135, 355, 575]],
  [340, [135, 355]],
  [515, [545, 765]],
  [735, [325, 545, 765]],
  [965, [135, 355]],
  [1195, [135, 355, 575]],
];
const DECOR = [
  [['🍎', 760, 230, 170, -12], ['🥕', 190, 560, 150, 20], ['🌽', 760, 1060, 190, 35]],
  [['🥝', 770, 280, 150, 10], ['🥦', 130, 620, 170, -10], ['🥬', 760, 1010, 190, 25]],
];
const PAGE_W = 880, SPINE = 40, DISC_R = 93;
const SLIT_DEPTH = 0.2;                  // deel van de straal
const LINK = 2 - 2 * SLIT_DEPTH + 0.04;  // afstand tussen twee vastgeklikte flippo's (in stralen)
const MAX_DISCS = 60;
const STORE = SET ? SET.store : '';

const $ = (s) => document.querySelector(s);
const stage = $('#stage'), table = $('#table');
const pad2 = (n) => String(n).padStart(2, '0');
const pad3 = (n) => String(n).padStart(3, '0');
const MISSING = new Set(FLIPPO ? FLIPPOS.missing : []);          // nummers waar geen plaatje van is
const IDS = SET ? Array.from({ length: SET.to - SET.from + 1 }, (_, i) => SET.from + i).filter((id) => !MISSING.has(id)) : [];
const IDSET = new Set(IDS);
const seriesOf = (id) => FLIPPOS.series.findIndex((x) => id >= x.from && id <= x.to);
const label = (id) => (FLIPPO ? String(id) : pad2(id));
const nameOf = (id) => (FLIPPO ? FLIPPOS.names[id] || `Flippo ${id}` : DATA[id - 1][0]);
const imgOf = (id) => (FLIPPO ? `${SET.dir}/${pad3(id)}.webp` : `${SET.dir}/${pad2(id)}.jpg`);
// inkepingen: Diskeyz hebben er altijd acht; bij de flippo's alleen sommige series (Techno, Strip, Flying).
// slitBase = hoeveel graden de acht inkepingen verdraaid staan op het plaatje (undefined = geen inkepingen)
const slitBase = (id) => (FLIPPO ? FLIPPOS.slits[id] : 0);
const hasSlits = (id) => slitBase(id) != null;
// afstand tussen twee vastgeklikte flippo's, in stralen (flippo's hebben ondiepere inkepingen)
const LINKD = FLIPPO ? 1.7 : LINK;
const colorOf = (id) => (FLIPPO ? FCOLORS[seriesOf(id)] : COLORS[Math.floor((id - 1) / 5)]);

function backHtml(id) {
  if (!FLIPPO) {
    const [, food, emo] = DATA[id - 1];
    return `<div class="face back"><div class="emo">${emo}</div><div class="food">${food}</div><div class="no">${pad2(id)}</div></div>`;
  }
  const si = seriesOf(id), ser = FLIPPOS.series[si];
  const src = FLIPPOS.ownBack.includes(id) ? `${SET.dir}/b${pad3(id)}.webp` : ser.back ? `${SET.dir}/back-${pad2(si + 1)}.webp` : '';
  return src
    ? `<div class="face back imgback"><img src="${src}" alt="" draggable="false"></div>`
    : `<div class="face back"><div class="emo">🌀</div><div class="food">${ser.name}</div><div class="no">${id}</div></div>`;
}

// bladzijden van de map. Diskeyz: twee vaste pagina's. Flippo's: binnenkant van de kaft,
// daarna insteekbladen met 4 x 5 vakjes.
function buildPages() {
  if (!SET) return [];
  if (!FLIPPO) {
    let id = 1;
    return [0, 1].map((p) => ({ kind: 'diskeyz', p, slots: ROWS.flatMap(([y, xs]) => xs.map((x) => ({ id: id++, x, y }))) }));
  }
  const pages = [{ kind: 'inside' }];
  for (let a = SET.from; a <= SET.to; a += 20) {
    const side = pages.length % 2, b = Math.min(a + 19, SET.to), list = [];
    for (let id = a; id <= b; id++) {
      const i = id - a;
      list.push({ id, x: (side ? 175 : 135) + (i % 4) * 190, y: 205 + Math.floor(i / 4) * 247 });
    }
    pages.push({ kind: 'sheet', side, from: a, to: b, slots: list });
  }
  if (pages.length % 2) pages.push({ kind: 'blank' });
  return pages;
}
const PAGES = buildPages();
// staat deze bladzijde nu open? (liggend: twee tegelijk, staand: één)
const pageVisible = (p) => (L.single ? p === curPage : p - (p % 2) === curPage - (curPage % 2));
const mod = (a, n) => ((a % n) + n) % n;
const rad = (d) => d * Math.PI / 180;

let L = null;          // layout: {mode, W, H, ax, ay, u, R, k}
let discs = [];
let slots = {};        // id -> {x, y, el, uid}
let uidSeq = 1, zTop = 10;
let soundOn = true;
let albumState = 'open', albumEl = null, curPage = 0;

// ---------- masker met 8 gleufjes ----------
(function makeMask() {
  let slits = '';
  for (let a = 0; a < 360; a += 45) {
    slits += `<rect x='48.6' y='-2' width='2.8' height='${2 + 50 * SLIT_DEPTH}' rx='1.2' transform='rotate(${a} 50 50)'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><mask id='m'>` +
    `<circle cx='50' cy='50' r='50' fill='white'/><g fill='black'>${slits}</g></mask></defs>` +
    `<rect width='100' height='100' mask='url(#m)'/></svg>`;
  document.documentElement.style.setProperty('--mask', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
})();

// ---------- layout ----------
function computeLayout() {
  const vw = table.clientWidth, vh = table.clientHeight;
  const portrait = vw / vh < 1.05;
  const l = portrait
    ? { mode: 'p', W: 1000, H: Math.max(1500, Math.round(1000 * vh / vw)), ax: (1000 - PAGE_W * 0.78) / 2, ay: 18, u: 0.78, single: true }
    : { mode: 'l', W: 1600, H: 1000, ax: 350, ay: 22, u: 0.5 };
  l.R = DISC_R * l.u;
  l.aw = (l.single ? PAGE_W : PAGE_W * 2 + SPINE) * l.u;
  l.ah = 1300 * l.u;
  l.k = Math.min(vw / l.W, vh / l.H);
  return l;
}

function applyLayout() {
  const old = L;
  L = computeLayout();
  stage.style.width = L.W + 'px';
  stage.style.height = L.H + 'px';
  applyView();
  stage.style.setProperty('--u', L.u + 'px');
  stage.style.setProperty('--R', L.R + 'px');
  if (!old || old.mode !== L.mode) {
    buildAlbum();
    if (old) remap(old);
  } else if (old.H !== L.H) {
    // tafel is korter of langer geworden: losse flippo's binnenboord houden
    const seen = new Set();
    for (const d of discs) {
      if (d.slot != null || seen.has(d)) continue;
      const g = groupOf(d);
      g.forEach((m) => seen.add(m));
      clamp(...g);
      g.forEach(render);
    }
  }
}

// in- en uitzoomen (knijpen met twee vingers, of ctrl + scrollen)
const view = { z: 1, x: 0, y: 0 };
const K = () => L.k * view.z;

function applyView() {
  const tw = table.clientWidth, th = table.clientHeight;
  const bx = (tw - L.W * L.k) / 2, by = (th - L.H * L.k) / 2;
  view.z = Math.min(4, Math.max(1, view.z));
  if (view.z === 1) { view.x = view.y = 0; }
  // minstens een derde van de tafel blijft in beeld
  view.x = Math.min(tw * 0.66 - bx, Math.max(tw * 0.34 - bx - L.W * K(), view.x));
  view.y = Math.min(th * 0.66 - by, Math.max(th * 0.34 - by - L.H * K(), view.y));
  stage.style.transform = `translate(${bx + view.x}px, ${by + view.y}px) scale(${K()})`;
}

// zoomt met factor f rond schermpunt (cx, cy)
function zoomAt(f, cx, cy) {
  const r = stage.getBoundingClientRect();
  const z0 = view.z, z1 = Math.min(4, Math.max(1, z0 * f));
  view.x += (cx - r.left) * (1 - z1 / z0);
  view.y += (cy - r.top) * (1 - z1 / z0);
  view.z = z1;
  applyView();
}

const bgPointers = new Map();
let bgTap = 0;
table.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.disc, .pack')) return;
  bgPointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
});
window.addEventListener('pointermove', (e) => {
  const p = bgPointers.get(e.pointerId);
  if (!p) return;
  if (bgPointers.size >= 2) {
    const [a, b] = [...bgPointers.values()];
    const d0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const mx0 = (a.x + b.x) / 2, my0 = (a.y + b.y) / 2;
    p.x = e.clientX; p.y = e.clientY;
    const d1 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    view.x += (a.x + b.x) / 2 - mx0;
    view.y += (a.y + b.y) / 2 - my0;
    zoomAt(d1 / d0, (a.x + b.x) / 2, (a.y + b.y) / 2);
  } else {
    if (view.z > 1) { view.x += e.clientX - p.x; view.y += e.clientY - p.y; applyView(); }
    p.x = e.clientX; p.y = e.clientY;
  }
});
const bgUp = (e) => {
  const p = bgPointers.get(e.pointerId);
  if (!p) return;
  bgPointers.delete(e.pointerId);
  // vegen over de map = bladeren
  const sdx = e.clientX - p.sx, sdy = e.clientY - p.sy;
  if (view.z === 1 && !bgPointers.size && e.target.closest?.('.album') &&
      Math.abs(sdx) > 45 && Math.abs(sdx) > Math.abs(sdy) * 1.5) turnPage(sdx < 0 ? 1 : -1);
  // dubbeltik op de tafel = zoom terugzetten
  if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < 8 && !e.target.closest('.album')) {
    const now = performance.now();
    if (now - bgTap < 350 && view.z > 1) { view.z = 1; applyView(); }
    bgTap = now;
  }
};
window.addEventListener('pointerup', bgUp);
window.addEventListener('pointercancel', bgUp);
table.addEventListener('wheel', (e) => {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
}, { passive: false });

function buildAlbum() {
  stage.querySelector('.albumwrap')?.remove();
  if (!L.single) curPage -= curPage % 2;
  const wrap = document.createElement('div');
  wrap.className = 'albumwrap';
  wrap.style.left = L.ax + 'px';
  wrap.style.top = L.ay + 'px';
  const album = document.createElement('div');
  album.className = 'album' + (FLIPPO ? ' binder' : '');
  album.style.setProperty('--inside', `url(${SET.dir}/inside.jpg)`);
  album.addEventListener('click', () => { if (albumState !== 'open') setAlbum(albumState === 'back' ? 'front' : 'open'); });
  wrap.appendChild(album);
  albumEl = album;
  // plek van álle vakjes, ook op bladzijden die nu niet open liggen
  const occupied = Object.fromEntries(Object.entries(slots).map(([id, s]) => [id, s.uid]));
  slots = {};
  PAGES.forEach((pg, pi) => (pg.slots || []).forEach((sl) => {
    slots[sl.id] = {
      x: L.ax + ((L.single ? 0 : (pi % 2) * (PAGE_W + SPINE)) + sl.x) * L.u,
      y: L.ay + sl.y * L.u,
      page: pi, el: null, uid: occupied[sl.id] ?? null,
    };
  }));
  const base = curPage - (curPage % 2);
  for (let p = 0; p < 2; p++) {
    if (p === 1) album.insertAdjacentHTML('beforeend', '<div class="spine"></div>');
    const pg = PAGES[base + p];
    const page = document.createElement('div');
    page.className = 'page ' + pg.kind + (pg.side ? ' rightside' : '');
    if (pg.kind === 'diskeyz') {
      for (const [e, x, y, size, r] of DECOR[p]) {
        page.insertAdjacentHTML('beforeend',
          `<div class="decor" style="left:calc(var(--u)*${x});top:calc(var(--u)*${y});font-size:calc(var(--u)*${size});--r:${r}deg">${e}</div>`);
      }
      for (const { id, x, y } of pg.slots) {
        const el = document.createElement('div');
        el.className = 'slot';
        el.style.cssText = `left:calc(var(--u)*${x});top:calc(var(--u)*${y});--c:${colorOf(id)}`;
        el.innerHTML = `<div class="ear"></div><div class="ring"></div>` +
          `<div class="hole"><img src="${imgOf(id)}" alt="" draggable="false"></div>` +
          `<div class="num">${pad2(id)}</div>` +
          (SHINY[id] ? `<div class="sticker ${SHINY[id]}"></div>` : '');
        page.appendChild(el);
        slots[id].el = el;
      }
      page.insertAdjacentHTML('beforeend',
        `<div class="pagenum" style="${p ? 'right' : 'left'}:calc(var(--u)*18)">${11 + p}</div>`);
    } else if (pg.kind === 'sheet') {
      // doorzichtig insteekblad met vakjes; erachter een vel met de plaatjes
      page.insertAdjacentHTML('beforeend', '<div class="rings"><i></i><i></i><i></i><i></i></div>');
      for (const { id, x, y } of pg.slots) {
        const el = document.createElement('div');
        el.className = 'slot pocket';
        el.style.cssText = `left:calc(var(--u)*${x});top:calc(var(--u)*${y});--c:${colorOf(id)}`;
        el.innerHTML = `<div class="plabel"><b>${id}</b><span>${MISSING.has(id) ? '' : nameOf(id)}</span></div>` +
          (MISSING.has(id)
            ? `<div class="hole none">?</div>`
            : `<div class="hole"><img src="${imgOf(id)}" alt="" draggable="false"></div>`) +
          `<div class="plastic"></div>`;
        page.appendChild(el);
        slots[id].el = el;
      }
      page.insertAdjacentHTML('beforeend',
        `<div class="pagenum" style="${p ? 'right' : 'left'}:calc(var(--u)*30)">${FLIPPOS.series[seriesOf(pg.from)].name} · ${pg.from}–${pg.to}</div>`);
    }
    // elk blad heeft een binnenkant (de pagina) en een buitenkant (voor- of achterkaft)
    const leaf = document.createElement('div');
    leaf.className = 'leaf ' + (p ? 'right' : 'left');
    leaf.appendChild(page);
    leaf.insertAdjacentHTML('beforeend', p
      ? `<div class="cover backcover"><div class="bc-logo">${FLIPPO ? "Flippo's" : 'Diskeyz'}</div><div class="bc-text">Spaar ze allemaal!</div><div class="bc-count"></div></div>`
      : `<div class="cover frontcover" style="background-image:url(${SET.cover})"></div>`);
    album.appendChild(leaf);
  }
  // bladerknoppen
  for (const dir of [-1, 1]) {
    const pg = document.createElement('button');
    pg.className = 'pgbtn ' + (dir < 0 ? 'prev' : 'next');
    pg.textContent = dir < 0 ? '‹' : '›';
    pg.addEventListener('click', () => turnPage(dir));
    wrap.appendChild(pg);
  }
  stage.prepend(wrap);
  applyAlbumState(true);
  updateCount();
}

// na wisselen tussen liggend/staand: losse flippo's meeschalen
function remap(old) {
  const q = L.R / old.R;
  const seen = new Set();
  for (const d of discs) {
    if (d.slot != null) { d.x = slots[d.slot].x; d.y = slots[d.slot].y; continue; }
    if (seen.has(d)) continue;
    const g = groupOf(d);
    const cx = g.reduce((s, m) => s + m.x, 0) / g.length, cy = g.reduce((s, m) => s + m.y, 0) / g.length;
    const nx = cx / old.W * L.W, ny = cy / old.H * L.H;
    for (const m of g) { seen.add(m); m.x = nx + (m.x - cx) * q; m.y = ny + (m.y - cy) * q; }
    // niet bovenop de map laten belanden
    const c = { x: nx, y: ny }, mrg = L.R;
    if (c.x > L.ax - mrg && c.x < L.ax + L.aw + mrg && c.y > L.ay - mrg && c.y < L.ay + L.ah + mrg) {
      const t = tableSpot();
      for (const m of g) { m.x += t.x - nx; m.y += t.y - ny; }
    }
    clamp(...g);
  }
  discs.forEach(render);
}

// ---------- flippo's ----------
function makeDisc(id, props = {}) {
  const d = { uid: uidSeq++, id, x: 0, y: 0, rot: 0, flipped: false, slot: null, links: [], z: ++zTop, ...props };
  uidSeq = Math.max(uidSeq, d.uid + 1);
  const el = document.createElement('div');
  el.className = 'disc' + (FLIPPO ? ' flat' : '') + (SHINY[id] ? ' shiny ' + SHINY[id] : '');
  el.style.setProperty('--c', colorOf(id));
  el.innerHTML =
    `<div class="flip">` +
    `<div class="face front"><img src="${imgOf(id)}" alt="${nameOf(id).replace(/"/g, '')}" draggable="false">` +
    (SHINY[id] ? `<div class="shine"${FLIPPO ? ` style="-webkit-mask:url(${imgOf(id)}) center/100% 100%;mask:url(${imgOf(id)}) center/100% 100%"` : ''}></div>` : '') +
    (FLIPPO ? '' : `<div class="gloss"></div>`) + `</div>` +
    backHtml(id) +
    `</div>` +
    (SHINY[id] ? `<span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✦</span>` : '');
  d.el = el;
  el.addEventListener('pointerdown', (e) => onDown(e, d));
  el.addEventListener('wheel', (e) => onWheel(e, d), { passive: false });
  stage.appendChild(el);
  discs.push(d);
  render(d);
  return d;
}

function render(d) {
  const s = d.el.style;
  s.setProperty('--x', d.x + 'px');
  s.setProperty('--y', d.y + 'px');
  s.setProperty('--rot', d.rot + 'deg');
  s.zIndex = d.slot != null && !d.sliding ? 2 : d.z;
  if (SHINY[d.id]) s.setProperty('--sh', mod(d.x * 0.28 + d.y * 0.17 + d.rot * 0.6 + pointerShift, 100).toFixed(1));
  d.el.classList.toggle('inslot', d.slot != null);
  d.el.classList.toggle('flipped', d.flipped);
}

function animate(list, ms = 300) {
  for (const d of list) {
    d.el.classList.add('anim');
    clearTimeout(d.animT);
    d.animT = setTimeout(() => d.el.classList.remove('anim'), ms);
  }
}

const byUid = (uid) => discs.find((d) => d.uid === uid);

function groupOf(d) {
  const out = [d], seen = new Set([d.uid]);
  for (let i = 0; i < out.length; i++) {
    for (const l of out[i].links) {
      if (!seen.has(l.other)) { seen.add(l.other); out.push(byUid(l.other)); }
    }
  }
  return out;
}

function toFront(group) {
  [...group].sort((a, b) => a.z - b.z).forEach((g) => { g.z = ++zTop; g.el.style.zIndex = g.z; });
}

function detach(d) {
  if (!d.links.length) return false;
  let nx = 0, ny = 0;
  for (const l of d.links) {
    const o = byUid(l.other);
    o.links = o.links.filter((x) => x.other !== d.uid);
    nx += d.x - o.x; ny += d.y - o.y;
  }
  d.links = [];
  const len = Math.hypot(nx, ny) || 1;
  d.x += nx / len * L.R * 0.75;
  d.y += ny / len * L.R * 0.75;
  clamp(d);
  animate([d]);
  render(d);
  return true;
}

// schuift een (groep) flippo('s) als geheel terug op tafel
function clamp(...group) {
  const m = L.R * 0.7;
  const xs = group.map((g) => g.x), ys = group.map((g) => g.y);
  const dx = Math.max(0, m - Math.min(...xs)) + Math.min(0, L.W - m - Math.max(...xs));
  const dy = Math.max(0, m - Math.min(...ys)) + Math.min(0, L.H - m - Math.max(...ys));
  for (const g of group) { g.x += dx; g.y += dy; }
}

function flip(d) {
  d.el.classList.add('flipping');
  setTimeout(() => {
    d.flipped = !d.flipped;
    d.el.classList.toggle('flipped', d.flipped);
    d.el.classList.remove('flipping');
    save();
  }, 130);
}

// vrije plek op tafel (niet op de map)
function tableSpot() {
  let best = null, bestScore = -1;
  for (let i = 0; i < 40; i++) {
    const x = L.R * 1.1 + Math.random() * (L.W - L.R * 2.2);
    const y = L.R * 1.1 + Math.random() * (L.H - L.R * 2.2);
    const m = L.R * 1.15;
    if (x > L.ax - m && x < L.ax + L.aw + m && y > L.ay - m && y < L.ay + L.ah + m) continue;
    let near = Infinity;
    for (const d of discs) if (d.slot == null) near = Math.min(near, Math.hypot(d.x - x, d.y - y));
    if (near > L.R * 2.1) return { x, y };
    if (near > bestScore) { bestScore = near; best = { x, y }; }
  }
  return best || { x: L.R * 1.5, y: L.H - L.R * 1.5 };
}

// ---------- map open, dicht en omdraaien ----------
// 'open' | 'front' (dicht, voorkant boven) | 'back' (dicht, achterkant boven)
// kun je nu bij dit vakje? (map open, en op mobiel: de juiste pagina voor)
const slotOpen = (id) => albumState === 'open' && pageVisible(slots[id].page);

function applyAlbumState(instant) {
  const open = albumState === 'open';
  albumEl.classList.toggle('closed', !open);
  albumEl.classList.toggle('turned', albumState === 'back');
  albumEl.classList.toggle('single', !!L.single);
  albumEl.classList.toggle('p0', curPage % 2 === 0);
  albumEl.classList.toggle('p1', curPage % 2 === 1);
  const step = L.single ? 1 : 2;
  albumEl.parentNode.querySelector('.pgbtn.prev').hidden = !open || curPage - step < 0;
  albumEl.parentNode.querySelector('.pgbtn.next').hidden = !open || curPage + step >= PAGES.length;
  // flippo's in vakjes die je niet ziet zijn verstopt; ze komen pas terug als het blad ligt
  clearTimeout(applyAlbumState.t);
  const set = () => discs.forEach((d) => d.el.classList.toggle('stowed', d.slot != null && !slotOpen(d.slot)));
  if (instant) set();
  else {
    discs.forEach((d) => d.slot != null && d.el.classList.add('stowed'));
    applyAlbumState.t = setTimeout(set, open ? 550 : 0);
  }
  const btn = $('#btn-close');
  btn.firstChild.textContent = open ? '📕 ' : '📖 ';
  btn.querySelector('span').textContent = open ? 'Map dichtklappen' : 'Map openklappen';
  btn.dataset.short = open ? 'Dicht' : 'Open';
}

function setPage(p) {
  if (albumState !== 'open') return;
  p = Math.max(0, Math.min(PAGES.length - 1, p));
  if (!L.single) p -= p % 2;
  if (p === curPage) return;
  const sameSpread = p - (p % 2) === curPage - (curPage % 2);
  curPage = p;
  if (sameSpread) applyAlbumState(false);
  else { buildAlbum(); albumEl.classList.add('turnpage'); }   // andere bladen: opnieuw opbouwen
  snd('flip');
  save();
}
const turnPage = (dir) => setPage(curPage + dir * (L.single ? 1 : 2));

function setAlbum(state) {
  if (state === albumState) return;
  albumState = state;
  applyAlbumState(false);
  snd(state === 'open' ? 'flip' : 'put');
  save();
}

// ---------- map in/uit ----------
function putInSlot(d, quiet) {
  const s = slots[d.id];
  d.slot = d.id; s.uid = d.uid;
  d.x = s.x; d.y = s.y; d.rot = 0;
  if (FLIPPO) {
    // eerst boven het hoesje hangen, dan van boven naar beneden erin schuiven
    d.y = s.y - L.R * 2.05;
    d.sliding = true;
    animate([d], 170);
    render(d);
    setTimeout(() => {
      if (d.slot !== d.id) { d.sliding = false; return; }   // intussen weer opgepakt
      d.el.classList.add('slidein');
      d.y = slots[d.id].y;
      render(d);
      if (!quiet) snd('slot');
      setTimeout(() => { d.el.classList.remove('slidein'); d.sliding = false; render(d); }, 400);
    }, 180);
  } else {
    animate([d]);
    render(d);
    if (!quiet) { snd('slot'); pop(d); }
  }
  if (!slotOpen(d.id)) setTimeout(() => d.slot != null && !slotOpen(d.slot) && d.el.classList.add('stowed'), FLIPPO ? 640 : 320);
  updateCount();
}

function leaveSlot(d) {
  if (d.slot == null) return;
  slots[d.slot].uid = null;
  d.slot = null;
  d.sliding = false;
  d.el.classList.remove('slidein');
  d.el.classList.remove('stowed');
  d.z = ++zTop;
  updateCount();
}

function updateCount() {
  const n = discs.filter((d) => d.slot != null).length, total = IDS.length;
  $('#count').textContent = `${n} / ${total} in de map`;
  const bc = document.querySelector('.bc-count');
  if (bc) bc.textContent = `${n} / ${total}`;
  if (n === total && updateCount.last != null && updateCount.last !== total) toast('🎉 De map is compleet!');
  updateCount.last = n;
}

function pop(d) {
  d.el.classList.remove('pop');
  void d.el.offsetWidth;
  d.el.classList.add('pop');
}

// ---------- in elkaar klikken ----------
const slitUsed = (d, k) => d.links.some((l) => l.slit === k);

function tryConnect(group) {
  const R = L.R, target = LINKD * R, inGroup = new Set(group);
  const cands = [];
  for (const a of group) {
    for (const o of discs) {
      if (inGroup.has(o) || o.slot != null || !hasSlits(a.id) || !hasSlits(o.id)) continue;
      const dist = Math.hypot(a.x - o.x, a.y - o.y);
      if (dist < R * 0.9 || dist > R * 2.2) continue;
      cands.push({ a, o, score: Math.abs(dist - target) });
    }
  }
  cands.sort((p, q) => p.score - q.score);

  for (const { a, o } of cands) {
    const ang = Math.atan2(a.y - o.y, a.x - o.x) * 180 / Math.PI;
    // gleuf k van o wijst naar o.rot + basis + k*45 - 90
    const bo = slitBase(o.id), ba = slitBase(a.id);
    const k = mod(Math.round((ang - o.rot - bo + 90) / 45), 8);
    if (slitUsed(o, k)) continue;
    const slitAng = o.rot + bo + k * 45 - 90;
    const want = slitAng + 270 - a.rot - ba;       // a moet een gleuf terug laten wijzen
    const j = Math.round(want / 45), delta = want - j * 45, jm = mod(j, 8);
    if (slitUsed(a, jm)) continue;

    const tx = o.x + Math.cos(rad(slitAng)) * target, ty = o.y + Math.sin(rad(slitAng)) * target;
    const c = Math.cos(rad(delta)), s = Math.sin(rad(delta));
    const moved = group.map((g) => {
      const dx = g.x - a.x, dy = g.y - a.y;
      return { g, x: tx + dx * c - dy * s, y: ty + dx * s + dy * c, rot: g.rot + delta };
    });
    // mag niet dwars door andere flippo's van het bouwsel heen
    const other = groupOf(o);
    const clash = moved.some((m) => other.some((t) =>
      !(m.g === a && t === o) && Math.hypot(m.x - t.x, m.y - t.y) < R * 1.45));
    if (clash) continue;

    for (const m of moved) { m.g.x = m.x; m.g.y = m.y; m.g.rot = m.rot; }
    o.links.push({ slit: k, other: a.uid });
    a.links.push({ slit: jm, other: o.uid });
    animate(group, 200);
    group.forEach(render);
    pop(a); pop(o);
    lastBuilt = a.uid;
    $('#btn-3d').classList.add('ready');
    snd('snap');
    return true;
  }
  return false;
}

// ---------- slepen ----------
let lastBuilt = 0;
let drag = null, lastTap = { uid: 0, t: 0 }, pointerShift = 0;

function stagePoint(e) {
  const r = stage.getBoundingClientRect();
  return { x: (e.clientX - r.left) / K(), y: (e.clientY - r.top) / K() };
}

function onDown(e, d) {
  if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
  e.preventDefault();
  const p = stagePoint(e);
  const group = d.slot != null ? [d] : groupOf(d);
  drag = {
    d, group, id: e.pointerId, moved: false, sx: e.clientX, sy: e.clientY,
    offs: group.map((g) => ({ g, dx: g.x - p.x, dy: g.y - p.y })),
  };
  if (d.links.length) lastBuilt = d.uid;
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}

function onMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { d, group } = drag;
  if (!drag.moved) {
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
    drag.moved = true;
    leaveSlot(d);
    toFront(group);
    if (e.pointerType === 'touch') for (const o of drag.offs) o.dy -= Math.min(L.R * 0.9, 40 / K());
    group.forEach((g) => { g.el.classList.remove('anim'); g.el.classList.add('drag'); });
    if (albumState === 'open' && group.length === 1 && slots[d.id].uid == null) {
      setPage(slots[d.id].page);   // blader vanzelf naar de pagina waar hij hoort
      slots[d.id].el?.classList.add('target');
    }
  }
  const p = stagePoint(e);
  for (const o of drag.offs) { o.g.x = p.x + o.dx; o.g.y = p.y + o.dy; render(o.g); }
}

function onUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerup', onUp);
  window.removeEventListener('pointercancel', onUp);
  const { d, group, moved } = drag;
  drag = null;

  if (!moved) {
    const now = performance.now();
    if (lastTap.uid === d.uid && now - lastTap.t < 350 && d.slot == null && d.links.length) {
      detach(d);
      snd('flip');
      lastTap.t = 0;
    } else {
      lastTap = { uid: d.uid, t: now };
    }
    flip(d);
    snd('flip');
    return;
  }

  group.forEach((g) => g.el.classList.remove('drag'));
  slots[d.id].el?.classList.remove('target');

  let done = false;
  if (group.length === 1 && albumState === 'open') {
    const s = slots[d.id];
    if (s.uid == null && slotOpen(d.id) && Math.hypot(d.x - s.x, d.y - s.y) < L.R * 0.95) {
      putInSlot(d);
      done = true;
    } else {
      // op een ander vakje gelegd? laat even zien waar hij wel hoort
      const wrong = Object.values(slots).some((o) => o !== s && pageVisible(o.page) && Math.hypot(d.x - o.x, d.y - o.y) < L.R * 0.6);
      if (wrong) {
        toast(s.uid == null ? `${nameOf(d.id)} hoort in vakje ${label(d.id)}` : `Vakje ${label(d.id)} is al vol`);
        if (s.uid == null) {
          const el = s.el;
          el?.classList.add('target');
          setTimeout(() => el?.classList.remove('target'), 1500);
        }
      }
    }
  }
  if (!done) {
    const ok = tryConnect(group);   // lukt alleen bij flippo's met inkepingen
    const all = groupOf(d);
    clamp(...all);
    animate(all, 200);
    all.forEach(render);
    if (!ok) snd('put');
  }
  save();
}

function onWheel(e, d) {
  if (d.slot != null || e.ctrlKey || e.metaKey) return;
  e.preventDefault();
  const now = performance.now();
  if (now - (onWheel.t || 0) < 60) return;
  onWheel.t = now;
  const delta = e.deltaY > 0 ? 15 : -15, c = Math.cos(rad(delta)), s = Math.sin(rad(delta));
  const group = groupOf(d);
  for (const g of group) {
    const dx = g.x - d.x, dy = g.y - d.y;
    g.x = d.x + dx * c - dy * s; g.y = d.y + dx * s + dy * c; g.rot += delta;
    render(g);
  }
  save();
}

// de glans beweegt een beetje mee met de muis
window.addEventListener('pointermove', (e) => {
  pointerShift = (e.clientX / innerWidth) * 60 + (e.clientY / innerHeight) * 25;
  if (!drag) for (const d of discs) if (SHINY[d.id]) render(d);
});

// ---------- knoppen ----------
$('#btn-album').onclick = () => {
  if (albumState !== 'open') setAlbum('open');
  let i = albumState === 'open' ? 0 : 0;
  const wait = discs.some((d) => d.el.classList.contains('stowed')) ? 700 : 0;
  for (const id of IDS) {
    if (slots[id].uid != null) continue;
    const d = discs.find((x) => x.id === id && x.slot == null);
    if (!d) continue;
    setTimeout(() => {
      if (d.slot != null || slots[id].uid != null) return;
      detach(d);
      putInSlot(d, true);
      snd('slot');
      save();
    }, wait + i++ * 45);
  }
  if (!i) toast('Alles zit al in de map');
};

$('#btn-close').onclick = () => setAlbum(albumState === 'open' ? 'front' : 'open');
$('#btn-turn').onclick = () => {
  if (albumState === 'open') return toast('Klap de map eerst dicht');
  setAlbum(albumState === 'front' ? 'back' : 'front');
};

$('#btn-table').onclick = () => {
  if (albumState !== 'open') setAlbum('open');
  const list = discs.filter((d) => d.slot != null && pageVisible(slots[d.slot].page));
  if (!list.length) return toast(PAGES.length > 2 ? 'Deze bladzijden zijn al leeg' : 'De map is al leeg');
  list.forEach((d) => d.el.classList.remove('stowed'));
  for (const d of list) {
    leaveSlot(d);
    Object.assign(d, tableSpot(), { rot: Math.round(Math.random() * 60 - 30) });
    render(d);
  }
  animate(list, 400);
  snd('put');
  save();
};

$('#btn-loose').onclick = () => {
  const linked = discs.filter((d) => d.links.length);
  if (!linked.length) return toast('Er zit niets aan elkaar vast');
  for (const d of linked) {
    const g = groupOf(d);
    d._cx = g.reduce((s, m) => s + m.x, 0) / g.length;
    d._cy = g.reduce((s, m) => s + m.y, 0) / g.length;
  }
  for (const d of linked) {
    d.links = [];
    const dx = d.x - d._cx, dy = d.y - d._cy, len = Math.hypot(dx, dy) || 1;
    d.x += dx / len * L.R * 0.6; d.y += dy / len * L.R * 0.6;
    clamp(d);
    render(d);
  }
  animate(linked);
  snd('flip');
  save();
};

// ---------- zakje openscheuren ----------
let pack = null;
const PACK_N = FLIPPO ? 5 : 3;   // zoveel flippo's per zak

$('#btn-pack').onclick = () => {
  if (pack) return;
  makeRoom(PACK_N);
  const big = L.mode === 'p';
  const h = (big ? 760 : 500) * (FLIPPO ? 1.3 : 1), w = h * SET.packRatio;   // de zak chips is groter dan het zakje
  // rafelige rand bij de bovenste naad
  const cutY = 13;
  const pts = [];
  for (let i = 0; i <= 14; i++) pts.push(`${(i / 14 * 100).toFixed(1)}% ${(cutY + (i % 2 ? 1.6 : -1.2) + Math.random() * 0.8).toFixed(1)}%`);
  const edge = pts.join(','), edgeRev = [...pts].reverse().join(',');
  const dim = document.createElement('div');
  dim.className = 'packdim';
  const el = document.createElement('div');
  el.className = 'pack';
  el.style.cssText = `width:${w}px;height:${h}px;left:${L.W / 2 - w / 2}px;top:${L.H / 2 - h / 2}px;--pk:url(${SET.pack})`;
  const hint = (a, b) => `<div class="pk-hint" style="--hs:${big ? 1.8 : 1}">${a}<br><small>${b}</small></div>`;
  if (FLIPPO) {
    // bolle zak chips: je duwt tegen de onderkant, de bovenste naad popt in twee flapjes open
    el.classList.add('puffy');
    el.innerHTML =
      `<div class="pk-wrap">` +
      `<div class="pk pk-body" style="clip-path:polygon(${edge},100% 100%,0 100%)"></div>` +
      `<div class="pk pk-flap l" style="clip-path:polygon(0 0,50% 0,${pts.slice(0, 8).reverse().join(',')})"></div>` +
      `<div class="pk pk-flap r" style="clip-path:polygon(50% 0,100% 0,${pts.slice(7).reverse().join(',')})"></div>` +
      `</div>` +
      hint('Pop de zak chips open!', 'duw tegen de onderkant ↑');
  } else {
    el.innerHTML =
      `<div class="pk pk-body" style="clip-path:polygon(${edge},100% 100%,0 100%)"></div>` +
      `<div class="pk pk-top" style="clip-path:polygon(0 0,100% 0,${edgeRev})"></div>` +
      hint('Scheur het zakje open!', 'sleep over de bovenkant ↔');
  }
  stage.append(dim, el);
  pack = { el, dim, w, h, min: null, max: null, start: null, done: false, push: FLIPPO, prog: 0 };
  el.addEventListener('pointerdown', onPackDown);
  snd('put');
};

// ligt de tafel vol, dan verdwijnen de oudste losse (liefst dubbele) flippo's
function makeRoom(n) {
  const loose = discs.filter((d) => d.slot == null);
  const over = loose.length + n - MAX_DISCS;
  if (over <= 0) return;
  const count = (id) => discs.filter((d) => d.id === id).length;
  const rank = (d) => (d.links.length ? 2 : 0) + (count(d.id) > 1 ? 0 : 1);
  loose.sort((a, b) => rank(a) - rank(b) || a.uid - b.uid);
  for (const d of loose.slice(0, over)) {
    detach(d);
    discs.splice(discs.indexOf(d), 1);
    d.el.classList.add('stowed');
    setTimeout(() => d.el.remove(), 300);
  }
}

// zak chips: duwen tegen de onderkant (tikken of omhoog slepen) tot de bovenkant popt
function pushSet(prog) {
  pack.prog = Math.max(0, Math.min(1, prog));
  pack.el.style.setProperty('--sq', pack.prog.toFixed(3));
  pack.el.querySelector('.pk-flap.l').style.transform = `rotate(${-pack.prog * 9}deg)`;
  pack.el.querySelector('.pk-flap.r').style.transform = `rotate(${pack.prog * 9}deg)`;
  const step = Math.floor(pack.prog * 6);
  if (step !== pack.step) { pack.step = step; snd('rip'); }
  if (pack.prog >= 1) packOpen(true);
}

function onPushDown(e) {
  const r = pack.el.getBoundingClientRect();
  if ((e.clientY - r.top) / r.height < 0.45) return;       // alleen de onderste helft telt als duwen
  const y0 = e.clientY, base = pack.prog + 0.22;            // elke duw geeft al een zetje
  pushSet(base);
  const move = (ev) => { if (pack && !pack.done) pushSet(base + Math.max(0, y0 - ev.clientY) / (r.height * 0.22)); };
  const end = () => {
    pack?.el.removeEventListener('pointermove', move);
    if (pack && !pack.done) pushSet(pack.prog * 0.75);      // de zak veert een beetje terug
  };
  pack.el.addEventListener('pointermove', move);
  pack.el.addEventListener('pointerup', end, { once: true });
  pack.el.addEventListener('pointercancel', end, { once: true });
}

function onPackDown(e) {
  if (!pack || pack.done) return;
  e.preventDefault();
  pack.el.setPointerCapture(e.pointerId);
  if (pack.push) return onPushDown(e);
  const x = packX(e);
  if (pack.start == null) { pack.start = pack.min = pack.max = x; }
  pack.el.addEventListener('pointermove', onPackMove);
  const end = () => pack?.el.removeEventListener('pointermove', onPackMove);
  pack.el.addEventListener('pointerup', end, { once: true });
  pack.el.addEventListener('pointercancel', end, { once: true });
}

// x binnen het zakje, 0..1
function packX(e) {
  const r = pack.el.getBoundingClientRect();
  return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
}

function onPackMove(e) {
  if (!pack || pack.done) return;
  const x = packX(e);
  pack.min = Math.min(pack.min, x);
  pack.max = Math.max(pack.max, x);
  const prog = pack.max - pack.min;
  const fromLeft = pack.start < 0.5;
  const top = pack.el.querySelector('.pk-top');
  if (top) {
    top.style.transformOrigin = `${fromLeft ? 100 : 0}% 13%`;
    top.style.transform = `rotate(${(fromLeft ? 1 : -1) * prog * 24}deg)`;
  }
  const step = Math.floor(prog * 8);
  if (step !== pack.step) { pack.step = step; snd('rip'); }
  if (prog > 0.8) packOpen(fromLeft);
}

function packOpen(fromLeft) {
  pack.done = true;
  const { el, dim, h } = pack;
  el.classList.add('open');
  const top = el.querySelector('.pk-top');
  dim.classList.add('gone');
  snd('snap');
  if (top) {
    top.style.transition = 'transform .5s ease-in, opacity .5s';
    top.style.transform = `translate(${fromLeft ? 60 : -60}px, -120px) rotate(${fromLeft ? 70 : -70}deg)`;
    top.style.opacity = 0;
    // zakje kantelt, de flippo's vallen uit de opening
    setTimeout(() => el.classList.add('tip'), 250);
  } else {
    // POP: de bovenste naad klapt open, de flippo's springen er aan de bovenkant uit
    snd('pop');
    el.classList.add('popped');
    el.style.setProperty('--sq', 0);
    el.querySelector('.pk-flap.l').style.transform = 'rotate(-80deg)';
    el.querySelector('.pk-flap.r').style.transform = 'rotate(80deg)';
    el.insertAdjacentHTML('beforeend', '<div class="pk-pop">POP!</div>');
  }
  const got = [];
  // bij de flippo's zit er meestal een nieuwe in, anders duurt sparen eindeloos
  const have = new Set(discs.map((d) => d.id));
  for (let i = 0; i < PACK_N; i++) {
    const fresh = IDS.filter((x) => !have.has(x));
    const pool = FLIPPO && fresh.length && Math.random() < 0.8 ? fresh : IDS;
    const id = pool[Math.floor(Math.random() * pool.length)];
    have.add(id);
    const d = makeDisc(id, { x: L.W / 2, y: L.H / 2, rot: Math.round(Math.random() * 360) });
    d.el.classList.add('stowed');
    got.push(nameOf(id) + (SHINY[id] ? ' ✨' : ''));
    setTimeout(() => {
      d.el.classList.remove('stowed');
      d.y = L.H / 2 + h * (FLIPPO ? -0.42 : 0.3);
      render(d);
      void d.el.offsetWidth;
      Object.assign(d, tableSpot(), { rot: Math.round(Math.random() * 60 - 30) });
      d.el.classList.add('fall');
      render(d);
      snd('slot');
      setTimeout(() => d.el.classList.remove('fall'), 700);
      save();
    }, 800 + i * 280);
  }
  setTimeout(() => {
    el.classList.add('gone');
    toast('🎁 ' + got.join(', '));
    setTimeout(() => { el.remove(); dim.remove(); pack = null; }, 500);
  }, 800 + PACK_N * 280 + 500);
}

$('#btn-sound').onclick = () => {
  soundOn = !soundOn;
  $('#btn-sound').firstChild.textContent = soundOn ? '🔊' : '🔇';
  snd('flip');
};

// ---------- bouwwerk in 3D bekijken ----------
// Op tafel liggen de flippo's plat; in 3D staat elke flippo haaks in de gleuf van zijn buur.
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a, b, f = 1) => [a[0] + b[0] * f, a[1] + b[1] * f, a[2] + b[2] * f];
const mix = (a, fa, b, fb) => [a[0] * fa + b[0] * fb, a[1] * fa + b[1] * fb, a[2] * fa + b[2] * fb];
const slitDir = (d, k) => { const a = rad(slitBase(d.id) + k * 45 - 90); return [Math.cos(a), Math.sin(a)]; };

function layout3d(root) {
  const r0 = rad(root.rot);
  const out = [{ d: root, X: [Math.cos(r0), Math.sin(r0), 0], Y: [-Math.sin(r0), Math.cos(r0), 0], Z: [0, 0, 1], c: [0, 0, 0] }];
  const seen = new Set([root.uid]);
  for (let i = 0; i < out.length; i++) {
    const p = out[i];
    for (const l of p.d.links) {
      if (seen.has(l.other)) continue;
      seen.add(l.other);
      const child = byUid(l.other);
      const back = child.links.find((x) => x.other === p.d.uid);
      const [ca, sa] = slitDir(p.d, l.slit), [cb, sb] = slitDir(child, back.slit);
      const D = mix(p.X, ca, p.Y, sa);              // richting van de gleuf van de ouder
      const Z = cross(D, p.Z);                      // kind staat haaks op de ouder
      const U = [-D[0], -D[1], -D[2]], V = cross(Z, U);
      out.push({
        d: child, Z,
        X: mix(U, cb, V, -sb), Y: mix(U, sb, V, cb),
        c: add(p.c, D, FLIPPO ? LINKD : 2 - 2 * SLIT_DEPTH),
      });
    }
  }
  const n = out.length;
  const mid = out.reduce((s, o) => add(s, o.c, 1 / n), [0, 0, 0]);
  let size = 1;
  for (const o of out) { o.c = add(o.c, mid, -1); size = Math.max(size, Math.hypot(...o.c) + 1); }
  return { parts: out, size };
}

let v3 = null;
function open3d() {
  let root = byUid(lastBuilt);
  if (!root || !root.links.length || root.slot != null) root = discs.find((d) => d.links.length);
  if (!root) return toast('Zet eerst een paar flippo\'s in elkaar');
  const { parts, size } = layout3d(root);
  const box = $('#view3d'), world = box.querySelector('.world');
  const R = Math.min(110, Math.min(innerWidth, innerHeight) * 0.36 / size);
  box.style.setProperty('--R', R + 'px');
  world.innerHTML = '';
  for (const o of parts) {
    const el = document.createElement('div');
    el.className = 'd3 ' + (FLIPPO ? 'flat ' : '') + (SHINY[o.d.id] ? 'shiny ' + SHINY[o.d.id] : '');
    el.style.setProperty('--c', colorOf(o.d.id));
    el.innerHTML = o.d.el.querySelector('.flip').innerHTML;
    const t = o.c.map((v) => (v * R).toFixed(2));
    el.style.transform = `matrix3d(${o.X.join(',')},0,${o.Y.join(',')},0,${o.Z.join(',')},0,${t.join(',')},1)`;
    world.appendChild(el);
  }
  v3 = { rx: -22, ry: 30, zoom: 1, spin: true, ptrs: new Map(), world };
  box.classList.add('show');
  $('#btn-3d').classList.remove('ready');
  box.querySelector('.v3-title').textContent = `Bouwwerk van ${parts.length} flippo's`;
  cancelAnimationFrame(open3d.raf);
  const tick = () => {
    if (!v3) return;
    if (v3.spin) v3.ry += 0.35;
    world.style.transform = `scale(${v3.zoom}) rotateX(${v3.rx}deg) rotateY(${v3.ry}deg)`;
    open3d.raf = requestAnimationFrame(tick);
  };
  tick();
}

(function init3d() {
  const box = $('#view3d'), scene = box.querySelector('.scene');
  $('#btn-3d').onclick = open3d;
  box.querySelector('.v3-close').onclick = () => { box.classList.remove('show'); v3 = null; };
  scene.addEventListener('pointerdown', (e) => {
    if (!v3) return;
    scene.setPointerCapture(e.pointerId);
    v3.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    v3.spin = false;
  });
  scene.addEventListener('pointermove', (e) => {
    const p = v3?.ptrs.get(e.pointerId);
    if (!p) return;
    if (v3.ptrs.size >= 2) {
      const [a, b] = [...v3.ptrs.values()];
      const d0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      p.x = e.clientX; p.y = e.clientY;
      v3.zoom = Math.min(3, Math.max(0.4, v3.zoom * Math.hypot(a.x - b.x, a.y - b.y) / d0));
    } else {
      v3.ry += (e.clientX - p.x) * 0.5;
      v3.rx = Math.min(89, Math.max(-89, v3.rx - (e.clientY - p.y) * 0.5));
      p.x = e.clientX; p.y = e.clientY;
    }
  });
  const up = (e) => v3?.ptrs.delete(e.pointerId);
  scene.addEventListener('pointerup', up);
  scene.addEventListener('pointercancel', up);
  scene.addEventListener('wheel', (e) => {
    if (!v3) return;
    e.preventDefault();
    v3.zoom = Math.min(3, Math.max(0.4, v3.zoom * Math.exp(-e.deltaY * 0.002)));
  }, { passive: false });
})();

// ---------- geluid ----------
let ac = null;
function snd(type) {
  if (!soundOn) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const [f0, f1, dur, vol, wave] = {
      snap: [1400, 500, 0.06, 0.25, 'square'],
      slot: [420, 140, 0.1, 0.3, 'triangle'],
      flip: [520, 880, 0.06, 0.12, 'sine'],
      put: [220, 110, 0.06, 0.18, 'triangle'],
      pop: [260, 55, 0.14, 0.55, 'sine'],
      rip: [1800 + Math.random() * 1200, 300, 0.05, 0.12, 'sawtooth'],
    }[type];
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = wave;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* geen geluid beschikbaar */ }
}

let toastT = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2200);
}

// ---------- bewaren ----------
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify({
      mode: L.mode, W: L.W, H: L.H, R: L.R, sound: soundOn, album: albumState, page: curPage,
      discs: discs.map(({ uid, id, x, y, rot, flipped, slot, links, z }) => ({ uid, id, x, y, rot, flipped, slot, links, z })),
    }));
  } catch { /* opslag niet beschikbaar */ }
}

function load() {
  let st = null;
  try { st = JSON.parse(localStorage.getItem(STORE)); } catch { /* geen opslag */ }
  if (!st || !Array.isArray(st.discs)) return false;
  soundOn = st.sound !== false;
  $('#btn-sound').firstChild.textContent = soundOn ? '🔊' : '🔇';
  if (['open', 'front', 'back'].includes(st.album)) albumState = st.album;
  curPage = Math.max(0, Math.min(PAGES.length - 1, st.page | 0));
  buildAlbum();
  for (const p of st.discs) {
    if (!IDSET.has(p.id)) continue;
    const d = makeDisc(p.id, p);
    zTop = Math.max(zTop, d.z);
    if (d.slot != null) slots[d.slot].uid = d.uid;
  }
  // links naar flippo's die niet meer bestaan weghalen
  for (const d of discs) d.links = d.links.filter((l) => byUid(l.other));
  applyAlbumState(true);
  if (st.mode !== L.mode || st.R !== L.R) remap(st);
  else discs.forEach((d) => { if (d.slot != null) { d.x = slots[d.slot].x; d.y = slots[d.slot].y; render(d); } });
  return true;
}

// ---------- overzicht: kies een map ----------
function showChooser() {
  const box = $('#chooser');
  box.hidden = false;
  for (const [key, set] of Object.entries(SETS)) {
    let n = 0;
    try { n = (JSON.parse(localStorage.getItem(set.store))?.discs || []).filter((d) => d.slot != null).length; } catch { /* leeg */ }
    const gaps = set.kind === 'flippo' ? FLIPPOS.missing.filter((m) => m >= set.from && m <= set.to).length : 0;
    const total = set.to - set.from + 1 - gaps;
    const card = document.createElement('button');
    card.className = 'ch-card';
    card.innerHTML = `<div class="ch-book ${set.kind}"><img src="${set.cover}" alt=""></div><b>${set.title}</b>` +
      `<span>${set.kind === 'flippo' ? `nr. ${set.from}–${set.to}` : '30 Diskeyz'}</span>` +
      `<em>${n} / ${total} in de map</em>`;
    card.onclick = () => { location.hash = key; };
    box.querySelector('.ch-list').appendChild(card);
  }
}
$('#btn-home').onclick = () => { location.hash = ''; };
window.addEventListener('hashchange', () => location.reload());

// ---------- start ----------
if (!SET) {
  showChooser();
} else {
  document.title = SET.title;
  $('.logo').textContent = SET.title;
  if (FLIPPO) {
    // alleen de series met inkepingen kun je in elkaar zetten
    const any = IDS.some(hasSlits);
    $('#btn-loose').hidden = !any;
    $('#btn-3d').hidden = !any;
    const pk = $('#btn-pack');
    pk.querySelector('span').textContent = 'Zak chips openen';
    pk.dataset.short = 'Chips';
    pk.title = `Krijg ${PACK_N} flippo's`;
    $('#hint').textContent = 'Sleep een flippo naar zijn vakje  ·  Flippo\'s met inkepingen klik je in elkaar  ·  Tik = omdraaien  ·  Dubbeltik = losmaken  ·  Bladeren met de pijltjes of door te vegen';
  }
  applyLayout();
  if (!load()) {
    if (FLIPPO) toast('Open een zak chips om flippo\'s te krijgen!');
    else for (const id of IDS) makeDisc(id, { ...tableSpot(), rot: Math.round(Math.random() * 50 - 25) });
  }
  updateCount.last = null;
  updateCount();
  window.addEventListener('resize', applyLayout);
}
