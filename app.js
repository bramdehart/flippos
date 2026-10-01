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
  flippo1: { title: "Flippo's map 1", year: '1995', kind: 'flippo', from: 1, to: 250, store: 'flippo-state-f1', dir: 'img/flippo-1', cover: 'img/flippo-1/cover.jpg', pack: 'img/flippo-1/chips.jpg', packRatio: 0.6 },
  flippo2: { title: "Flippo's map 2", year: '1996', kind: 'flippo', from: 251, to: 545, store: 'flippo-state-f2', dir: 'img/flippo-2', cover: 'img/flippo-2/cover.jpg', pack: 'img/flippo-2/chips.jpg', packRatio: 0.6 },
  pokemon: { title: 'Pokémon munten', year: '2001', kind: 'pokemon', from: 1, to: 48, store: 'flippo-state-pk', dir: 'img/pokemon', cover: 'img/pokemon/cover.jpg', back: 'img/pokemon/backcover.jpg', pack: 'img/pokemon/pack.webp', packRatio: 810 / 1152, pageH: 980, r: 108 },
  diskeyz: { title: 'AH Diskeyz', year: '2026', kind: 'diskeyz', from: 1, to: 30, store: 'flippo-state-v1', dir: 'img/diskeyz', cover: 'img/diskeyz/cover.jpg', pack: 'img/diskeyz/pack.jpg', packRatio: 420 / 638 },
};
const SET = SETS[location.hash.slice(1)] || null;   // geen keuze = eerst het overzicht
const FLIPPO = !!SET && SET.kind === 'flippo';       // ronde flippo's zonder gleufjes
const POKE = !!SET && SET.kind === 'pokemon';        // metalen munten: groter, glimmende achterkant
const FLAT = FLIPPO || POKE;                         // het plaatje heeft zelf al de vorm van de schijf
const POKEMON = ['Charmander', 'Charizard', 'Blastoise', 'Butterfree', 'Pikachu', 'Meowth', 'Psyduck', 'Primeape', 'Arcanine', 'Poliwrath', 'Gengar', 'Mew',
  'Chikorita', 'Cyndaquil', 'Totodile', 'Sentret', 'Hoothoot', 'Noctowl', 'Ledyba', 'Spinarak', 'Lanturn', 'Pichu', 'Togepi', 'Xatu',
  'Mareep', 'Bellossom', 'Marill', 'Sudowoodo', 'Hoppip', 'Sunflora', 'Wooper', 'Quagsire', 'Slowking', 'Murkrow', 'Wobbuffet', 'Girafarig',
  'Pineco', 'Gligar', 'Snubbull', 'Shuckle', 'Heracross', 'Teddiursa', 'Ursaring', 'Donphan', 'Stantler', 'Elekid', 'Miltank', 'Blissey'];
// per serie een eigen kleur (achterkant en rand van het vakje)
const FCOLORS = ['#d7263d', '#f08a24', '#7b2cbf', '#1b9aaa', '#2a9d4b', '#e63987', '#1f6fd0', '#f0a202',
  '#8f2d56', '#3a7d44', '#8f2d56', '#c1121f', '#5a5a9c', '#0b7a75', '#4a2c6f'];
const SHINY = POKE ? {} : FLIPPO
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
const PAGE_W = 880, SPINE = 40;
const DISC_R = SET?.r || 93;              // straal van een schijf, in map-eenheden
const PAGE_H = SET?.pageH || 1300;       // hoogte van een bladzijde, in map-eenheden
const BOOK_T = 44;                       // dikte van de dichte map, in map-eenheden
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
const label = (id) => (FLAT ? String(id) : pad2(id));
const nameOf = (id) => (POKE ? POKEMON[id - 1] : FLIPPO ? FLIPPOS.names[id] || `Flippo ${id}` : DATA[id - 1][0]);
const imgOf = (id) => (POKE ? `${SET.dir}/${pad2(id)}.webp` : FLIPPO ? `${SET.dir}/${pad3(id)}.webp` : `${SET.dir}/${pad2(id)}.jpg`);
// inkepingen: Diskeyz hebben er altijd acht; bij de flippo's alleen sommige series (Techno, Strip, Flying).
// slitBase = hoeveel graden de acht inkepingen verdraaid staan op het plaatje (undefined = geen inkepingen)
const slitBase = (id) => (POKE ? undefined : FLIPPO ? FLIPPOS.slits[id] : 0);
const hasSlits = (id) => slitBase(id) != null;
// afstand tussen twee vastgeklikte flippo's, in stralen (flippo's hebben ondiepere inkepingen)
const LINKD = FLIPPO ? 1.7 : LINK;
const colorOf = (id) => (POKE ? ['#e8212b', '#1b63c9', '#eeb02c', '#2a9d4b'][Math.floor((id - 1) / 12)] : FLIPPO ? FCOLORS[seriesOf(id)] : COLORS[Math.floor((id - 1) / 5)]);

function backHtml(id) {
  if (POKE) return `<div class="face back imgback coinback"><img src="${SET.dir}/back.webp" alt="" draggable="false"><div class="cshine"></div><div class="cshine two"></div></div>`;
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
  if (POKE) {   // vier bladzijden met 3 x 4 munten
    return [0, 1, 2, 3].map((p) => ({ kind: 'coin', side: p % 2, from: p * 12 + 1, to: p * 12 + 12,
      slots: Array.from({ length: 12 }, (_, i) => ({ id: p * 12 + i + 1, x: 190 + (i % 3) * 250, y: 138 + Math.floor(i / 3) * 236 })) }));
  }
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
    ? { mode: 'p', W: 1000, H: Math.max(1900, Math.round(1000 * vh / vw)), ax: (1000 - PAGE_W * 0.96) / 2, ay: 175, u: 0.96, single: true }   // klein scherm: de bladzijde vult bijna de hele breedte
    : { mode: 'l', W: 1600, H: 1000, ax: 350, ay: 22, u: 0.5 };
  l.R = DISC_R * l.u;
  l.aw = (l.single ? PAGE_W : PAGE_W * 2 + SPINE) * l.u;
  l.ah = PAGE_H * l.u;
  l.k = Math.min(vw / l.W, vh / l.H);
  return l;
}

function applyLayout() {
  const old = L;
  L = computeLayout();
  stage.style.width = L.W + 'px';
  stage.style.height = L.H + 'px';
  applyView();
  sizePackButton();
  stage.style.setProperty('--u', L.u + 'px');
  stage.style.setProperty('--R', L.R + 'px');
  stage.style.setProperty('--ph', PAGE_H);
  stage.style.setProperty('--dr', DISC_R);
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
  // op een bladzijde gepakt: misschien wordt dit omslaan
  if (view.z === 1 && bgPointers.size === 1 && !pageDrag && e.target.closest('.album')) {
    const r = albumEl.getBoundingClientRect();
    pageDrag = { id: e.pointerId, sx: e.clientX, right: e.clientX > r.left + r.width / 2, turn: null, prog: 0 };
  }
});

// ---------- bladzijde vastpakken en zelf omslaan ----------
let pageDrag = null, noClickUntil = 0;
const TURN_MS = 700;

// de dichte map openslaan: van voren op de eerste bladzijden, van achteren op de laatste
function openAlbumFrom(state) {
  const p = state === 'back' ? PAGES.length - 1 - (L.single ? 0 : 1) : 0;
  if (p !== curPage) { curPage = p; setSpread(p - (p % 2)); applyAlbumState(true); void albumEl.offsetWidth; }
  setAlbum('open');
}

// kaft dichtslaan, openslaan of de dichte map omdraaien met een sleepbeweging
function coverGesture(dx) {
  if (Math.abs(dx) < 40) return false;
  const left = dx < 0;
  if (albumState === 'front') { if (left) openAlbumFrom('front'); else setAlbum('back'); }
  else if (albumState === 'back') { if (left) setAlbum('front'); else openAlbumFrom('back'); }
  else setAlbum(left ? 'back' : 'front');      // open: voorbij de laatste of eerste bladzijde = dicht
  if (albumState !== 'open' && !coverGesture.told) {
    coverGesture.told = true;
    toast('Sleep de kaft open, of sleep de andere kant op om de map om te draaien');
  }
  noClickUntil = performance.now() + 400;
  pageDrag = null;
  return true;
}

function pageDragMove(e) {
  const pd = pageDrag;
  if (!pd || pd.id !== e.pointerId) return;
  const dx = e.clientX - pd.sx;
  if (!pd.turn) {
    if (Math.abs(dx) < 8) return;
    if (albumState !== 'open') { coverGesture(dx); return; }
    // rechterblad trek je naar links (vooruit), linkerblad naar rechts (terug); met één blad in beeld telt alleen de richting
    const dir = dx < 0 ? 1 : -1;
    if (!L.single && (dir === 1) !== pd.right) { pageDrag = null; return; }
    // geen bladzijde meer die kant op: dan sla je de kaft dicht
    const next = curPage + dir * (L.single ? 1 : 2);
    if (next < 0 || next >= PAGES.length) { coverGesture(dx); return; }
    pd.turn = startTurn(next, true);
    if (!pd.turn) { pageDrag = null; return; }
    pd.dir = dir;
    pd.anims = pd.turn.anims;
  }
  if (pd.turn !== turn) { pageDrag = null; return; }   // de omslag is intussen al afgerond
  const span = PAGE_W * L.u * L.k * (L.single ? 0.9 : 1.7);
  pd.prog = Math.max(0, Math.min(0.98, (pd.dir === 1 ? -dx : dx) / span));
  pd.anims.forEach((a) => { a.currentTime = pd.prog * TURN_MS; });
}

function pageDragEnd(e) {
  const pd = pageDrag;
  if (!pd || pd.id !== e.pointerId) return;
  pageDrag = null;
  if (!pd.turn) return;
  if (pd.turn !== turn) return;
  if (pd.prog > 0.28) {
    // ver genoeg: het blad valt vanzelf verder om
    turn.ok = true;
    pd.anims.forEach((a) => a.play());
    snd('page');
  } else {
    // losgelaten voor het midden: het blad valt terug
    turn.ok = false;
    if (pd.prog <= 0.001) return turn.finish();
    pd.anims.forEach((a) => { a.playbackRate = -1; a.play(); });
  }
}

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
    pageDragMove(e);
    if (view.z > 1) { view.x += e.clientX - p.x; view.y += e.clientY - p.y; applyView(); }
    p.x = e.clientX; p.y = e.clientY;
  }
});
const bgUp = (e) => {
  const p = bgPointers.get(e.pointerId);
  if (!p) return;
  bgPointers.delete(e.pointerId);
  pageDragEnd(e);
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

// Eén bladzijde als los element, met de flippo's die erin zitten er echt in (zie dock).
// Daardoor draait alles vanzelf mee als een blad of de kaft beweegt.
// Gebouwde bladzijden worden bewaard, zodat omslaan alleen nog elementen verplaatst.
let pageCache = new Map();
function makePage(pi) {
  let page = pageCache.get(pi);
  if (!page) { page = buildPage(pi); pageCache.set(pi, page); }
  for (const sl of PAGES[pi].slots || []) { const d = slots[sl.id].uid != null && byUid(slots[sl.id].uid); if (d) dock(d, true); }
  return page;
}
// plaatjes alvast uitpakken, zodat het eerste beeld waarin ze verschijnen niet hoeft te wachten
const predecode = (el) => el.querySelectorAll('img').forEach((im) => im.decode?.().catch(() => {}));
const coverImgs = [];
// buren alvast klaarzetten als de browser niets te doen heeft
function warmPages() {
  const b = curPage - (curPage % 2);
  const todo = [b + 2, b + 3, b - 2, b - 1, b + 4, b + 5].filter((pi) => PAGES[pi] && !pageCache.has(pi));
  if (!todo.length) return;
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 80));
  idle(() => {
    const pi = todo[0];
    if (!pageCache.has(pi) && PAGES[pi]) {
      const page = buildPage(pi);
      pageCache.set(pi, page);
      for (const sl of PAGES[pi].slots || []) { const d = slots[sl.id].uid != null && byUid(slots[sl.id].uid); if (d) dock(d); }
      predecode(page);
    }
    warmPages();
  });
}
function buildPage(pi) {
  const pg = PAGES[pi];
  const page = document.createElement('div');
  page.className = 'page ' + pg.kind + (pg.side ? ' rightside' : '');
  page.dataset.pi = pi;
  if (pg.kind === 'diskeyz') {
    for (const [e, x, y, size, r] of DECOR[pi % 2]) {
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
      `<div class="pagenum" style="${pi % 2 ? 'right' : 'left'}:calc(var(--u)*18)">${11 + pi}</div>`);
  } else if (pg.kind === 'coin') {
    // muntenmap: ronde uitsparingen met het plaatje van de munt die erin hoort
    for (const { id, x, y } of pg.slots) {
      const el = document.createElement('div');
      el.className = 'slot cpocket';
      el.style.cssText = `left:calc(var(--u)*${x});top:calc(var(--u)*${y});--c:${colorOf(id)}`;
      el.innerHTML = `<div class="hole"><img src="${imgOf(id)}" alt="" draggable="false"></div><div class="num">${id}</div>`;
      page.appendChild(el);
      slots[id].el = el;
    }
    page.insertAdjacentHTML('beforeend', `<div class="pagenum" style="${pi % 2 ? 'right' : 'left'}:calc(var(--u)*24)">${pg.from}–${pg.to}</div>`);
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
      `<div class="pagenum" style="${pi % 2 ? 'right' : 'left'}:calc(var(--u)*30)">${FLIPPOS.series[seriesOf(pg.from)].name} · ${pg.from}–${pg.to}</div>`);
  }
  return page;
}

// bladzijde uit de map halen; hij blijft bewaard (met zijn flippo's erin) voor de volgende keer
function dropPage(el) { el?.remove(); }
const pageLeaf = (side) => albumEl.querySelector(side ? '.leaf.right' : '.leaf.left');
const leafPage = (side) => pageLeaf(side).querySelector(':scope > .page');
// zet de twee bladzijden van een andere spread in de map (zonder de hele map opnieuw te bouwen)
function setSpread(base) {
  for (const side of [0, 1]) {
    const cur = leafPage(side);
    if (cur && +cur.dataset.pi === base + side) continue;
    dropPage(cur);
    pageLeaf(side).prepend(makePage(base + side));
  }
}

// Een flippo die in de map zit wordt een kind van zijn vakje. (Vroeger lag hij los boven de map en
// moest hij bij elke beweging verstopt en weer getoond worden: dat gaf geflikker.)
function dock(d, force) {
  if (d.slot == null) return;
  if (force) d.sliding = false;
  if (d.sliding || (drag && drag.d === d && drag.moved)) return;
  const s = slots[d.slot];
  d.el.classList.remove('anim', 'slidein', 'drag');
  if (s.el) {
    if (d.el.parentNode !== s.el) s.el.appendChild(d.el);
    d.el.classList.add('docked');
  } else d.el.remove();            // zijn bladzijde ligt nu niet in de map
}
const dockAll = (force) => discs.forEach((d) => dock(d, force));
function undock(d) {
  d.el.classList.remove('docked');
  if (d.el.parentNode !== stage) stage.appendChild(d.el);
}

function buildAlbum() {
  turn = null;
  pageCache = new Map();
  stage.querySelectorAll('.albumwrap').forEach((w) => w.remove());
  if (!L.single) curPage -= curPage % 2;
  const wrap = document.createElement('div');
  wrap.className = 'albumwrap';
  wrap.style.left = L.ax + 'px';
  wrap.style.top = L.ay + 'px';
  const album = document.createElement('div');
  album.className = 'album' + (FLIPPO ? ' binder' : POKE ? ' pokebook' : '');
  album.style.setProperty('--inside', `url(${SET.dir}/inside.jpg)`);
  album.addEventListener('click', () => { if (albumState !== 'open' && performance.now() > noClickUntil) openAlbumFrom(albumState); });
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
    // elk blad heeft een binnenkant (de pagina) en een buitenkant (voor- of achterkaft)
    const leaf = document.createElement('div');
    leaf.className = 'leaf ' + (p ? 'right' : 'left');
    leaf.appendChild(makePage(base + p));
    leaf.insertAdjacentHTML('beforeend', p && SET.back
      ? `<div class="cover backcover imgcover" style="background-image:url(${SET.back})"><div class="bc-count"></div></div>`
      : p
      ? `<div class="cover backcover"><div class="bc-logo">${FLIPPO ? "Flippo's" : 'Diskeyz'}</div><div class="bc-text">Spaar ze allemaal!</div><div class="bc-year">${SET.year}</div><div class="bc-count"></div></div>`
      : `<div class="cover frontcover" style="background-image:url(${SET.cover})"></div>`);
    album.appendChild(leaf);
  }
  // omgekrulde hoekjes: hier pak je het blad vast om om te slaan
  album.insertAdjacentHTML('beforeend', '<div class="curl prev"></div><div class="curl next"></div>');
  // tikken op een hoekje slaat ook om (slepen hoeft niet)
  album.querySelector('.curl.prev').addEventListener('click', (e) => { e.stopPropagation(); turnPage(-1); });
  album.querySelector('.curl.next').addEventListener('click', (e) => { e.stopPropagation(); turnPage(1); });
  // dikte van de dichte map: een stapel randjes (het pak bladzijden) tussen achter- en voorkaft
  let slabs = '';
  for (let z = 1.5; z < BOOK_T * L.u; z += 1.5) slabs += `<div class="slab" style="transform:translateZ(${z}px)"></div>`;
  album.insertAdjacentHTML('beforeend', slabs);
  stage.prepend(wrap);
  applyAlbumState(true);
  updateCount();
  setTimeout(() => {
    albumEl.querySelectorAll('.page').forEach(predecode);
    if (!coverImgs.length) for (const src of [SET.cover, SET.back, `${SET.dir}/inside.jpg`]) { if (!src) continue; const im = new Image(); im.src = src; im.decode?.().catch(() => {}); coverImgs.push(im); }
    warmPages();
  }, 200);
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
  el.className = 'disc' + (FLAT ? ' flat' : '') + (POKE ? ' coin' : '') + (SHINY[id] ? ' shiny ' + SHINY[id] : '');
  el.style.setProperty('--c', colorOf(id));
  el.innerHTML =
    `<div class="flip">` +
    `<div class="face front"><img src="${imgOf(id)}" alt="${nameOf(id).replace(/"/g, '')}" draggable="false">` +
    (SHINY[id] ? `<div class="shine"${FLIPPO ? ` style="-webkit-mask:url(${imgOf(id)}) center/100% 100%;mask:url(${imgOf(id)}) center/100% 100%"` : ''}></div>` : '') +
    (POKE ? `<div class="coingloss"></div>` : FLIPPO ? '' : `<div class="gloss"></div>`) + `</div>` +
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
  if (SHINY[d.id] || POKE) s.setProperty('--sh', mod(d.x * 0.28 + d.y * 0.17 + d.rot * 0.6 + pointerShift, 100).toFixed(1));
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
    // niet onder de voorwerpen in de hoeken van het scherm (zakje, stapeltje mappen, knopjes)
    const sr = stage.getBoundingClientRect(), tr = table.getBoundingClientRect();
    const px = sr.left + x * K() - tr.left, py = sr.top + y * K() - tr.top, rr = L.R * K();
    const pb = $('#btn-pack').getBoundingClientRect();
    if ((px - rr < pb.right - tr.left - pb.width * 0.1 && py + rr > pb.top - tr.top + pb.height * 0.08) || (px - rr < 110 && py - rr < 120) || (px + rr > tr.width - 120 && py - rr < 70)) continue;
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
  albumEl.classList.toggle('closing', !open && !instant);   // alleen bij echt dichtslaan, niet bij laden
  if (!instant) albumEl.dataset.from = albumEl.classList.contains('turned') ? 'back' : albumEl.classList.contains('closed') ? 'front' : 'open';
  albumEl.classList.toggle('turned', albumState === 'back');
  albumEl.classList.toggle('single', !!L.single);
  albumEl.classList.toggle('p0', curPage % 2 === 0);
  albumEl.classList.toggle('p1', curPage % 2 === 1);
  const step = L.single ? 1 : 2;
  albumEl.querySelector('.curl.prev').hidden = !open || curPage - step < 0;
  albumEl.querySelector('.curl.next').hidden = !open || curPage + step >= PAGES.length;
  dockAll(!instant);
  if (!instant) {
    // omgekrulde hoekjes pas tonen als de kaft helemaal openligt
    const el = albumEl;
    el.classList.toggle('opening', open);
    clearTimeout(applyAlbumState.o);
    applyAlbumState.o = setTimeout(() => el.classList.remove('opening', 'closing'), 750);
  }
}

function setPage(p) {
  if (albumState !== 'open') return;
  p = Math.max(0, Math.min(PAGES.length - 1, p));
  if (!L.single) p -= p % 2;
  if (turn && turn.to === p) return;
  flushTurn();
  if (p === curPage) return;
  if (startTurn(p, false)) snd('page');
}
const turnPage = (dir) => setPage((turn ? turn.to : curPage) + dir * (L.single ? 1 : 2));

// ---------- bladzijde omslaan ----------
// Het blad dat omslaat bestaat uit de échte bladzijden (geen kopieën): de voorkant is de oude
// bladzijde, de achterkant de nieuwe. Na afloop liggen dezelfde elementen op hun plek in de map,
// dus er hoeft niets gewisseld of opnieuw getekend te worden.
let turn = null;
const flushTurn = () => { if (turn) turn.finish(); };

function startTurn(to, manual) {
  flushTurn();
  if (to < 0 || to >= PAGES.length || to === curPage || albumState !== 'open') return null;
  const from = curPage, fwd = to > from, single = !!L.single;
  const W = PAGE_W * L.u, gap = SPINE * L.u;
  const ob = from - (from % 2), nb = to - (to % 2), same = ob === nb;
  const leafL = pageLeaf(0), leafR = pageLeaf(1), oldL = leafPage(0), oldR = leafPage(1);
  const newL = same ? oldL : makePage(nb), newR = same ? oldR : makePage(nb + 1);
  const sheet = document.createElement('div');
  sheet.className = 'turnsheet';   // (niet 'sheet': zo heet het insteekblad zelf al)
  let frames, commit, rollback;
  const parity = (p) => { albumEl.classList.toggle('p0', p % 2 === 0); albumEl.classList.toggle('p1', p % 2 === 1); };
  curPage = to;
  if (!single && fwd) {
    // rechterblad slaat naar links; eronder ligt de nieuwe rechterbladzijde al klaar
    sheet.style.left = W + gap + 'px';
    sheet.style.transformOrigin = '0 50%';
    leafR.prepend(newR);
    newL.classList.add('flipside');
    sheet.append(oldR, newL);
    frames = [{ transform: 'translateX(0) rotateY(0deg) skewY(0deg)' }, { transform: `translateX(${-gap / 2}px) rotateY(-90deg) skewY(-3.5deg)` }, { transform: `translateX(${-gap}px) rotateY(-180deg) skewY(0deg)` }];
    commit = () => { newL.classList.remove('flipside'); dropPage(oldL); dropPage(oldR); leafL.prepend(newL); };
    rollback = () => { newL.classList.remove('flipside'); leafR.prepend(oldR); dropPage(newL); dropPage(newR); };
  } else if (!single) {
    // linkerblad slaat naar rechts
    sheet.style.left = '0px';
    sheet.style.transformOrigin = '100% 50%';
    leafL.prepend(newL);
    newR.classList.add('flipside');
    sheet.append(oldL, newR);
    frames = [{ transform: 'translateX(0) rotateY(0deg) skewY(0deg)' }, { transform: `translateX(${gap / 2}px) rotateY(90deg) skewY(3.5deg)` }, { transform: `translateX(${gap}px) rotateY(180deg) skewY(0deg)` }];
    commit = () => { newR.classList.remove('flipside'); dropPage(oldL); dropPage(oldR); leafR.prepend(newR); };
    rollback = () => { newR.classList.remove('flipside'); leafL.prepend(oldL); dropPage(newL); dropPage(newR); };
  } else {
    // één bladzijde in beeld: het blad draait om zijn linkerrand weg, of komt daarvandaan terug
    sheet.style.left = '0px';
    sheet.style.transformOrigin = '0 50%';
    const oldEl = from % 2 ? oldR : oldL, oldLeaf = from % 2 ? leafR : leafL;
    const newEl = to % 2 ? newR : newL, newLeaf = to % 2 ? leafR : leafL;
    const away = [{ transform: 'rotateY(0deg) skewY(0deg)', opacity: 1 }, { transform: 'rotateY(-55deg) skewY(-3deg)', opacity: 1, offset: 0.6 }, { transform: 'rotateY(-96deg) skewY(0deg)', opacity: 0 }];
    if (fwd) {
      sheet.append(oldEl);
      if (!same) { dropPage(from % 2 ? oldL : oldR); leafL.prepend(newL); leafR.prepend(newR); }
      parity(to);                       // de nieuwe bladzijde ligt er meteen onder
      frames = away;
      commit = () => { if (same) oldLeaf.prepend(oldEl); else dropPage(oldEl); };
      rollback = () => {
        // alleen de andere bladzijde van de oude spread opnieuw maken; de oude zelf komt terug uit het blad
        if (!same) { dropPage(newL); dropPage(newR); (from % 2 ? leafL : leafR).prepend(makePage(from % 2 ? ob : ob + 1)); }
        oldLeaf.prepend(oldEl);
      };
    } else {
      sheet.append(newEl);              // komt over de oude bladzijde heen te liggen
      frames = [...away].reverse().map((f, k) => ({ ...f, offset: [0, 0.4, 1][k] }));
      commit = () => { if (same) newLeaf.prepend(newEl); else { dropPage(oldL); dropPage(oldR); leafL.prepend(newL); leafR.prepend(newR); } };
      rollback = () => { if (same) newLeaf.prepend(newEl); else { dropPage(newL); dropPage(newR); } };
    }
  }
  // lichte schaduw over het blad terwijl het omhoog komt
  const shades = [...sheet.children].map((pgEl) => { const sh = document.createElement('i'); sh.className = 'shade'; pgEl.appendChild(sh); return sh; });
  albumEl.appendChild(sheet);
  albumEl.classList.add('turning');
  const opt = { duration: TURN_MS, fill: 'both' };
  const anims = [sheet.animate(frames, { ...opt, easing: 'cubic-bezier(.45, .05, .4, 1)' }),
    ...shades.map((sh) => sh.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], opt))];
  const me = turn = {
    from, to, anims, ok: true,
    finish() {
      if (turn !== me) return;
      turn = null;
      anims.forEach((a) => { a.onfinish = null; a.cancel(); });
      shades.forEach((sh) => sh.remove());
      if (me.ok) commit(); else { rollback(); curPage = from; }
      sheet.remove();
      albumEl.classList.remove('turning');
      applyAlbumState(true);
      save();
      setTimeout(warmPages, 60);
    },
  };
  anims[0].onfinish = () => me.finish();
  if (manual) anims.forEach((a) => a.pause());
  return me;
}

// alle losse flippo's of munten vallen stuiterend op tafel, met gekletter
function rainDiscs(wait = 0) {
  const loose = discs.filter((d) => d.slot == null).sort((a, b) => a.y - b.y + (Math.random() - 0.5) * 300);
  if (!loose.length) return;
  const step = Math.min(55, 900 / loose.length);
  loose.forEach((d, i) => {
    const delay = wait + i * step;
    d.el.classList.remove('rain'); void d.el.offsetWidth;
    d.el.style.animationDelay = delay + 'ms';
    d.el.style.setProperty('--spin', Math.round(Math.random() * 500 - 250) + 'deg');
    d.el.classList.add('rain');
    clearTimeout(d.rainT);
    d.rainT = setTimeout(() => { d.el.classList.remove('rain'); d.el.style.animationDelay = ''; }, delay + 950);
  });
  // één strooigeluid voor de hele hoop, vanaf het moment dat de eerste neerkomt
  setTimeout(() => snd('strooi', Math.min(1, 0.35 + loose.length / 20)), wait + 330);
}

function setAlbum(state) {
  if (state === albumState) return;
  flushTurn();
  if (state === 'open') rainDiscs(250);
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
  d.sliding = true;                      // nog onderweg; daarna wordt hij deel van de bladzijde
  const token = d.slideT = (d.slideT || 0) + 1;
  const live = () => d.slideT === token && d.slot === d.id && d.sliding;
  const done = () => { if (!live()) return; d.sliding = false; render(d); dock(d); };
  if (FLIPPO) {
    // eerst boven het hoesje hangen, dan van boven naar beneden erin schuiven
    d.y = s.y - L.R * 2.05;
    animate([d], 170);
    render(d);
    setTimeout(() => {
      if (!live()) return;
      d.el.classList.add('slidein');
      d.y = slots[d.id].y;
      render(d);
      if (!quiet) snd('slot');
      setTimeout(done, 400);
    }, 180);
  } else {
    animate([d]);
    render(d);
    if (!quiet) { snd('slot'); pop(d); }
    setTimeout(done, 320);
  }
  updateCount();
}

function leaveSlot(d) {
  if (d.slot == null) return;
  slots[d.slot].uid = null;
  d.slot = null;
  d.sliding = false;
  d.slideT = (d.slideT || 0) + 1;
  d.el.classList.remove('slidein');
  d.el.classList.remove('stowed');
  undock(d);
  d.z = ++zTop;
  updateCount();
}

function updateCount() {
  const n = discs.filter((d) => d.slot != null).length, total = IDS.length;
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
  // ingedrukt houden zonder te bewegen = deze flippo in het groot bekijken
  drag.hold = setTimeout(() => {
    if (!drag || drag.d !== d || drag.moved) return;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    drag = null;
    if (d.links.length && d.slot == null) { lastBuilt = d.uid; open3d(); }   // zit hij in een bouwwerk: het hele bouwwerk
    else open3d(d);
  }, 480);
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
    clearTimeout(drag.hold);
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
  clearTimeout(drag.hold);
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
    // op een klein scherm hoef je niet te mikken: loslaten ergens op de map is genoeg
    const onAlbum = L.single && d.x > L.ax && d.x < L.ax + L.aw && d.y > L.ay && d.y < L.ay + L.ah;
    if (s.uid == null && slotOpen(d.id) && (onAlbum || Math.hypot(d.x - s.x, d.y - s.y) < L.R * 0.95)) {
      putInSlot(d);
      done = true;
    } else {
      // op een ander vakje gelegd? laat even zien waar hij wel hoort
      const wrong = onAlbum || Object.values(slots).some((o) => o !== s && pageVisible(o.page) && Math.hypot(d.x - o.x, d.y - o.y) < L.R * 0.6);
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
  if (!drag) for (const d of discs) if (SHINY[d.id] || (POKE && d.flipped)) render(d);
});

// ---------- knoppen ----------
// ---------- tafel leegvegen ----------
// Veegt alle losse flippo's (ook bouwwerken) van tafel. Wat in de map zit blijft.
let sweepArmed = -1e9;
$('#btn-sweep').onclick = () => {
  const loose = discs.filter((d) => d.slot == null);
  if (!loose.length) return toast('De tafel is al leeg');
  const now = performance.now();
  if (now - sweepArmed > 3500) {          // eerst vragen: weg is weg
    sweepArmed = now;
    return toast(`Tik nog een keer om ${loose.length} losse ${POKE ? 'munten' : "flippo's"} van tafel te vegen`);
  }
  sweepArmed = -1e9;
  for (const d of loose) {
    d.links = [];
    discs.splice(discs.indexOf(d), 1);
    d.el.classList.add('swept');
    d.x = L.W + L.R * 4 + Math.random() * 200;
    d.y += (Math.random() - 0.5) * 160;
    d.rot += 200 + Math.random() * 300;
    render(d);
    setTimeout(() => d.el.remove(), 650);
  }
  snd('page');
  save();
};

// hoogte van de zak in tafel-eenheden (de zak chips is groter dan een zakje)
const packH = () => (L.mode === 'p' ? 760 : 500) * (FLIPPO ? 1.1 : 1);
// de zak op tafel is even groot als wanneer hij in het midden staat, en steekt een stuk buiten beeld
function sizePackButton() {
  const btn = $('#btn-pack'), h = packH() * L.k * (FLIPPO ? 1 : 0.72);   // de kleine zakjes liggen wat kleiner in de hoek; de zak chips op ware grootte
  btn.style.height = h + 'px';
  btn.style.left = -h * SET.packRatio * 0.2 + 'px';
  btn.style.bottom = -h * 0.3 + 'px';
}

// ---------- zakje openscheuren ----------
let pack = null;
const PACK_N = FLIPPO ? 5 : 3;   // zoveel flippo's per zak

$('#btn-pack').onclick = () => {
  if (pack) return;
  $('#btn-pack').classList.remove('nudge');
  makeRoom(PACK_N);
  const big = L.mode === 'p';
  const h = packH(), w = h * SET.packRatio;
  const cy = L.H * (FLIPPO ? 0.46 : 0.5);   // de zak chips hangt wat hoger, zodat eronder ruimte is voor de chips
  // rafelige rand: het zakje bij de bovenste naad, de zak chips bij de onderste
  const cutY = FLIPPO ? 88 : 13;
  const pts = [];
  for (let i = 0; i <= 14; i++) pts.push(`${(i / 14 * 100).toFixed(1)}% ${(cutY + (i % 2 ? 1.6 : -1.2) + Math.random() * 0.8).toFixed(1)}%`);
  const edge = pts.join(','), edgeRev = [...pts].reverse().join(',');
  const dim = document.createElement('div');
  dim.className = 'packdim';
  const el = document.createElement('div');
  el.className = 'pack';
  el.style.cssText = `width:${w}px;height:${h}px;left:${L.W / 2 - w / 2}px;top:${cy - h / 2}px;--pk:url(${SET.pack})`;
  const hint = (a, b) => `<div class="pk-hint" style="--hs:${big ? 1.8 : 1}">${a}<br><small>${b}</small></div>`;
  if (FLIPPO) {
    // bolle zak chips: je knijpt in het midden, de onderste naad scheurt in twee flapjes open
    el.classList.add('puffy');
    el.innerHTML =
      `<div class="pk-wrap">` +
      `<div class="pk pk-body" style="clip-path:polygon(0 0,100% 0,${edgeRev})"></div>` +
      `<div class="pk pk-flap l" style="clip-path:polygon(${pts.slice(0, 8).join(',')},50% 100%,0 100%)"></div>` +
      `<div class="pk pk-flap r" style="clip-path:polygon(${pts.slice(7).join(',')},100% 100%,50% 100%)"></div>` +
      `</div>` +
      hint('Pop de zak chips open!', 'knijp in het midden van de zak') +
      // losse chips die rond de zak liggen te wiebelen
      [[-34, 12], [-22, 58], [-40, 88], [128, 20], [118, 66], [138, 96], [-12, 104], [108, 108]].map(([x, y], i) =>
        `<i class="pk-deco" style="left:${x}%;top:${y}%;--r:${i * 53 % 80 - 40}deg;animation-delay:${-i * 0.6}s;background-image:url(${SET.dir}/chip-${1 + (i % 5)}.webp)"></i>`).join('');
  } else {
    el.innerHTML =
      `<div class="pk pk-body" style="clip-path:polygon(${edge},100% 100%,0 100%)"></div>` +
      `<div class="pk pk-top" style="clip-path:polygon(0 0,100% 0,${edgeRev})"></div>` +
      hint('Scheur het zakje open!', 'sleep over de bovenkant ↔');
  }
  stage.append(dim, el);
  pack = { el, dim, w, h, min: null, max: null, start: null, done: false, push: FLIPPO, prog: 0, cy };
  dim.addEventListener('click', closePack);   // ernaast tikken = toch niet openmaken
  // het zakje dat op tafel lag vliegt zelf naar het midden
  el.style.animation = 'none';   // eerst meten zonder de binnenkom-animatie
  const btn = $('#btn-pack'), b = btn.getBoundingClientRect(), r = el.getBoundingClientRect();
  btn.style.visibility = 'hidden';
  el.style.animation = 'wiggle 1.6s ease-in-out .55s infinite';
  const dx = (b.left + b.width / 2 - (r.left + r.width / 2)) / K(), dy = (b.top + b.height / 2 - (r.top + r.height / 2)) / K();
  el.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${b.height / r.height}) rotate(-14deg)` },
    { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
  ], { duration: 480, easing: 'cubic-bezier(.3, 1.3, .5, 1)' });
  el.addEventListener('pointerdown', onPackDown);
  snd('put');
};

// na het openmaken ploft er een nieuw zakje op zijn plek op tafel
function newPackOnTable() {
  const btn = $('#btn-pack');
  btn.style.visibility = '';
  btn.animate([{ translate: '0 -60px', scale: '1.5', opacity: 0 }, { translate: '0 0', scale: '1', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.3, 1.5, .5, 1)' });
}

// zakje wegleggen zonder het open te maken
function closePack() {
  if (!pack || pack.done) return;
  pack.el.remove(); pack.dim.remove(); pack = null;
  $('#btn-pack').style.visibility = '';
  snd('put');
}

// ligt de tafel vol, dan verdwijnen de oudste losse (liefst dubbele) flippo's
function makeRoom(n) {
  const loose = discs.filter((d) => d.slot == null);
  const over = loose.length + n - (L.single ? 24 : MAX_DISCS);   // op een klein scherm past er minder op tafel
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

// zak chips: in het midden knijpen (tikken of ingedrukt houden en bewegen) tot de onderkant openscheurt
function pushSet(prog) {
  pack.prog = Math.max(0, Math.min(1, prog));
  pack.el.style.setProperty('--sq', pack.prog.toFixed(3));
  pack.el.querySelector('.pk-flap.l').style.transform = `rotate(${pack.prog * 9}deg)`;
  pack.el.querySelector('.pk-flap.r').style.transform = `rotate(${-pack.prog * 9}deg)`;
  const step = Math.floor(pack.prog * 6);
  if (step !== pack.step) { pack.step = step; snd('rip'); }
  if (pack.prog >= 1) packOpen(true);
}

function onPushDown(e) {
  const r = pack.el.getBoundingClientRect();
  const fy = (e.clientY - r.top) / r.height;
  if (fy < 0.18 || fy > 0.82) return;                       // alleen het midden telt als knijpen
  const x0 = e.clientX, y0 = e.clientY, base = pack.prog + 0.22;   // elke kneep geeft al een zetje
  pushSet(base);
  const move = (ev) => { if (pack && !pack.done) pushSet(base + Math.hypot(ev.clientX - x0, ev.clientY - y0) / (r.height * 0.25)); };
  const end = () => {
    pack?.el.removeEventListener('pointermove', move);
    if (pack && !pack.done) pushSet(pack.prog * 0.75);      // de zak veert een beetje terug
  };
  pack.el.addEventListener('pointermove', move);
  pack.el.addEventListener('pointerup', end, { once: true });
  pack.el.addEventListener('pointercancel', end, { once: true });
}

// chips die uit de zak vallen en even op tafel blijven liggen
function spillChips(x, y, w) {
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('div');
    c.className = 'chip';
    const size = 46 + Math.random() * 34;
    c.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;` +
      `background-image:url(${SET.dir}/chip-${1 + (i % 5)}.webp)`;
    stage.appendChild(c);
    const dx = (Math.random() - 0.5) * w * 2.4;
    const dy = Math.min(L.H - y - 30, 40 + Math.random() * (L.H - y) * 0.9);
    setTimeout(() => {
      c.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 720 - 360}deg)`;
    }, 30 + i * 28);
    setTimeout(() => { c.style.opacity = 0; }, 3200 + i * 40);
    setTimeout(() => c.remove(), 4500);
  }
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
  const { el, dim, h, cy } = pack;
  el.classList.add('open');
  el.style.animation = 'none';   // het wiebelen stopt, anders kan het zakje niet kantelen
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
    // POP: de onderste naad scheurt open, chips en flippo's vallen eruit
    snd('pop');
    el.classList.add('popped');
    el.style.setProperty('--sq', 0);
    el.querySelector('.pk-flap.l').style.transform = 'rotate(78deg)';
    el.querySelector('.pk-flap.r').style.transform = 'rotate(-78deg)';
    spillChips(L.W / 2, cy + h * 0.4, pack.w);
    el.insertAdjacentHTML('beforeend', '<div class="pk-pop">POP!</div>');
  }
  const got = [];
  // meestal zit er een nieuwe in, anders duurt sparen eindeloos
  const have = new Set(discs.map((d) => d.id));
  for (let i = 0; i < PACK_N; i++) {
    const fresh = IDS.filter((x) => !have.has(x));
    const pool = fresh.length && Math.random() < 0.8 ? fresh : IDS;
    const id = pool[Math.floor(Math.random() * pool.length)];
    have.add(id);
    // soms valt er een op zijn kop
    const d = makeDisc(id, { x: L.W / 2, y: L.H / 2, rot: Math.round(Math.random() * 360), flipped: Math.random() < (POKE ? 0.4 : 0.3) });
    d.el.classList.add('stowed');
    got.push(nameOf(id) + (SHINY[id] ? ' ✨' : ''));
    setTimeout(() => {
      d.el.classList.remove('stowed');
      d.y = cy + h * (FLIPPO ? 0.4 : 0.3);
      render(d);
      void d.el.offsetWidth;
      Object.assign(d, tableSpot(), { rot: Math.round(Math.random() * 60 - 30) });
      d.el.classList.add('fall');
      render(d);
      if (i === 0) snd('strooi', 0.6);   // één strooigeluid voor wat er uit de zak valt
      setTimeout(() => d.el.classList.remove('fall'), 700);
      save();
    }, 800 + i * 280);
  }
  setTimeout(() => {
    el.classList.add('gone');
    toast('🎁 ' + got.join(', '));
    setTimeout(() => { el.remove(); dim.remove(); pack = null; newPackOnTable(); }, 500);
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
// zonder argument: het laatst aangeraakte bouwwerk. Met een flippo: alleen die ene, in het groot.
function open3d(single) {
  let parts, size;
  if (single) {
    parts = [{ d: single, X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1], c: [0, 0, 0] }]; size = 1;
  } else {
    let root = byUid(lastBuilt);
    if (!root || !root.links.length || root.slot != null) root = discs.find((d) => d.links.length);
    if (!root) return toast('Zet eerst een paar flippo\'s in elkaar');
    ({ parts, size } = layout3d(root));
  }
  const box = $('#view3d'), world = box.querySelector('.world');
  const R = Math.min(110, Math.min(innerWidth, innerHeight) * 0.36 / size);
  box.style.setProperty('--R', R + 'px');
  world.innerHTML = '';
  for (const o of parts) {
    const el = document.createElement('div');
    el.className = 'd3 ' + (FLAT ? 'flat ' : '') + (POKE ? 'coin ' : '') + (SHINY[o.d.id] ? 'shiny ' + SHINY[o.d.id] : '');
    el.style.setProperty('--c', colorOf(o.d.id));
    el.innerHTML = o.d.el.querySelector('.flip').innerHTML;
    // dikte: een stapeltje laagjes tussen voor- en achterkant vormt de rand
    const T = Math.max(4, Math.round(R * 0.07));
    el.style.setProperty('--t', T + 'px');
    const m = FLAT ? `-webkit-mask:url(${imgOf(o.d.id)}) center/100% 100%;mask:url(${imgOf(o.d.id)}) center/100% 100%;` : '';
    let edge = '';
    for (let z = -T / 2 + 0.5; z < T / 2; z += 1) edge += `<div class="face edge" style="${m}transform:translateZ(${z}px)"></div>`;
    el.insertAdjacentHTML('afterbegin', edge);
    const t = o.c.map((v) => (v * R).toFixed(2));
    el.style.transform = `matrix3d(${o.X.join(',')},0,${o.Y.join(',')},0,${o.Z.join(',')},0,${t.join(',')},1)`;
    world.appendChild(el);
  }
  v3 = { rx: single ? -8 : -22, ry: single ? 0 : 30, zoom: 1, spin: true, ptrs: new Map(), world };
  box.classList.add('show');
  box.querySelector('.v3-title').textContent = single
    ? `${label(single.id)} · ${nameOf(single.id)}`
    : `Bouwwerk van ${parts.length} flippo's`;
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
// ritselend blad: een kort stukje ruis door een filter dat omhoog veegt
function sndPage() {
  const dur = 0.42, n = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, n, ac.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / 55));
  const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
  src.buffer = buf;
  f.type = 'bandpass'; f.Q.value = 0.9;
  f.frequency.setValueAtTime(900, t);
  f.frequency.exponentialRampToValueAtTime(4200, t + dur * 0.55);
  f.frequency.exponentialRampToValueAtTime(1600, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32, t + 0.07);
  g.gain.exponentialRampToValueAtTime(0.12, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(ac.destination);
  src.start(t);
  // tikje als het blad neerkomt
  const o = ac.createOscillator(), og = ac.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(170, t + dur); o.frequency.exponentialRampToValueAtTime(70, t + dur + 0.07);
  og.gain.setValueAtTime(0.16, t + dur); og.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.08);
  o.connect(og).connect(ac.destination); o.start(t + dur); o.stop(t + dur + 0.1);
}

// echte opname van een omslaande bladzijde (Wikimedia Commons, publiek domein); wordt één keer geladen
// het strooigeluid is een opname van rinkelende munten (Wikimedia Commons, publiek domein)
let pageBuf = null, strooiBuf = null, pageBufAsked = false;
function loadPageSound() {
  if (pageBufAsked) return;
  pageBufAsked = true;
  const get = (url) => fetch(url).then((r) => r.arrayBuffer()).then((b) => ac.decodeAudioData(b));
  get('snd/page.mp3?v=2').then((buf) => { pageBuf = buf; }).catch(() => {});
  get('snd/strooi.mp3').then((buf) => { strooiBuf = buf; if (strooiWant) { snd('strooi', strooiWant); strooiWant = 0; } }).catch(() => {});
}
let strooiWant = 0;

function snd(type, vol = 1) {
  if (!soundOn) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    loadPageSound();
    if (type === 'page') {
      if (!pageBuf) return sndPage();      // nog niet geladen: het nagemaakte geluid
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = pageBuf;
      src.playbackRate.value = 0.94 + Math.random() * 0.12;   // elke keer net iets anders
      g.gain.value = 1;
      src.connect(g).connect(ac.destination);
      src.start();
      return;
    }
    if (type === 'strooi') {
      if (!strooiBuf) { strooiWant = vol; return; }      // nog aan het laden: afspelen zodra hij er is
      const src = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = strooiBuf;
      // munten rinkelen helder; plastic flippo's klinken lager en doffer
      src.playbackRate.value = POKE ? 1 : 0.72;
      lp.type = 'lowpass'; lp.frequency.value = POKE ? 16000 : 4200;
      g.gain.value = 0.5 * vol;
      src.connect(lp).connect(g).connect(ac.destination);
      src.start();
      return;
    }
    const [f0, f1, dur, vol0, wave] = {
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
    g.gain.setValueAtTime(vol0, t);
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
let noSave = false;   // tijdens het weggaan naar het overzicht niets meer bewaren
function save() {
  if (noSave) return;
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

// ---------- uitleg ----------
function showHelp() {
  const een = POKE ? 'een munt' : 'een flippo', meer = POKE ? 'munten' : 'flippo\'s';   // hoe de schijfjes in deze map heten
  const rows = [
    ['👆', 'Sleep', L.single ? `${een} naar de map; hij schuift vanzelf in zijn eigen vakje` : `${een} naar zijn vakje in de map`],
    ['🔄', 'Tik', `op ${een} om hem om te draaien`],
    ['🔍', 'Houd vast', POKE ? 'om een munt groot en in 3D te bekijken' : 'om een flippo of bouwwerk groot en in 3D te bekijken'],
    !POKE && ['🧩', 'Sleep tegen elkaar', FLIPPO ? 'om flippo\'s met inkepingen vast te klikken' : 'om twee Diskeyz vast te klikken'],
    !POKE && ['✂️', 'Dubbeltik', 'om een flippo weer los te maken'],
    ['📖', 'Sleep een bladzijde', 'om hem om te slaan, of de kaft om de map dicht te doen'],
    [FLIPPO ? '🍟' : '🎁', FLIPPO ? 'Tik op de zak chips' : 'Tik op het zakje', `linksonder voor nieuwe ${meer}`],
    ['‹', 'Tik op het pijltje', 'linksboven om een andere map te pakken'],
    ['🧹', 'Tik op de bezem', `rechtsonder om alle losse ${meer} van tafel te vegen`],
    ['🤏', 'Knijp', 'met twee vingers (of ctrl + scrollen) om in te zoomen'],
  ];
  const box = $('#help');
  box.querySelector('.help-list').innerHTML = rows.filter(Boolean).map(([e, a, b]) => `<li><span>${e}</span><div><b>${a}</b> ${b}</div></li>`).join('');
  box.hidden = false;
  try { localStorage.setItem('flippo-help-' + SET.kind, '1'); } catch { /* geen opslag */ }
}
const closeHelp = () => {
  if ($('#help').hidden) return;
  $('#help').hidden = true;
  // lege tafel: nu pas de aanwijzing waar je begint, anders stond die achter de uitleg
  if (!discs.length) toast(FLIPPO ? 'Open een zak chips om flippo\'s te krijgen!' : POKE ? 'Open een zakje om munten te krijgen!' : 'Open een zakje om Diskeyz te krijgen!');
};
$('#help').onclick = closeHelp;
// Escape sluit wat er open staat
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#help').hidden) closeHelp();
  else if (v3) $('#view3d .v3-close').click();
  else closePack();
});
// geen contextmenu bij lang indrukken (dat is 'groot bekijken')
window.addEventListener('contextmenu', (e) => { if (e.target.closest('#table, #view3d')) e.preventDefault(); });
$('#btn-help').onclick = showHelp;

// ---------- overzicht: kies een map ----------
let chooserDragged = 0;
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
    card.innerHTML = `<div class="ch-book ${set.kind}"><img src="${set.cover}" alt="" style="aspect-ratio:880/${set.pageH || 1300}"></div><b>${set.title}</b>` +
      `<span>${set.year} · ${set.kind === 'flippo' ? `nr. ${set.from}–${set.to}` : set.kind === 'pokemon' ? '48 munten' : '30 Diskeyz'}</span>` +
      `<u><i style="width:${Math.round(n / total * 100)}%"></i></u>` +
      `<em>${n} / ${total} in de map</em>`;
    card.dataset.key = key;
    // de map in het midden pak je; een map ernaast schuift eerst naar het midden
    card.onclick = () => {
      if (performance.now() - chooserDragged < 300) return;
      if (card.classList.contains('on')) pickSet(key, card);
      else card.parentNode.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - card.parentNode.clientWidth / 2, behavior: 'smooth' });
    };
    box.querySelector('.ch-list').appendChild(card);
  }
  // losse flippo's die rond de mappen op tafel liggen
  const deco = [[6, 14, 'flippo-1/001.webp'], [15, 70, 'flippo-1/006.webp'], [4, 44, 'diskeyz/25.jpg'], [27, 90, 'flippo-2/255.webp'],
    [90, 12, 'diskeyz/02.jpg'], [95, 46, 'flippo-1/044.webp'], [86, 78, 'flippo-1/130.webp'], [72, 93, 'diskeyz/17.jpg'],
    [50, 95, 'flippo-2/341.webp'], [38, 6, 'diskeyz/11.jpg'], [66, 5, 'flippo-1/060.webp'], [12, 92, 'diskeyz/21.jpg'],
    [13, 27, 'pokemon/05.webp'], [86, 29, 'pokemon/02.webp'], [62, 96, 'pokemon/12.webp'], [96, 88, 'pokemon/back.webp'], [3, 72, 'pokemon/23.webp']];
  box.insertAdjacentHTML('afterbegin', '<div class="ch-decos">' + deco.map(([x, y, f], i) =>
    `<img class="ch-deco${f.endsWith('.jpg') ? ' round' : ''}" src="img/${f}" alt="" style="left:${x}%;top:${y}%;--r:${(i * 47) % 70 - 35}deg;animation-delay:${-i * 0.7}s">`).join('') + '</div>');
  // terug uit een map: die kaft komt van de tafel teruggevlogen, de andere mappen verschijnen weer
  let from = null;
  try { from = sessionStorage.getItem('flippo-from'); sessionStorage.removeItem('flippo-from'); } catch { /* geen opslag */ }
  // op een telefoon: bolletjes onder de mappen die laten zien welke in beeld is
  const list = box.querySelector('.ch-list'), cards = [...list.children];
  const dots = document.createElement('div');
  dots.className = 'ch-dots';
  dots.innerHTML = cards.map(() => '<i></i>').join('');
  list.after(dots);
  const mark = () => {
    const mid = list.scrollLeft + list.clientWidth / 2;
    let best = 0;
    cards.forEach((c, i) => { if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i; });
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === best));
    cards.forEach((c, i) => c.classList.toggle('on', i === best));
  };
  const goTo = (c) => list.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - list.clientWidth / 2, behavior: 'smooth' });
  [...dots.children].forEach((d, i) => { d.onclick = () => goTo(cards[i]); });
  // muis: scrollen of slepen schuift de mappen; pijltjestoetsen ook
  list.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); list.scrollLeft += e.deltaY; } }, { passive: false });
  let grab = null;
  list.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') grab = { x: e.clientX, sl: list.scrollLeft, moved: false }; });
  window.addEventListener('pointermove', (e) => {
    if (!grab) return;
    if (Math.abs(e.clientX - grab.x) > 6) { grab.moved = true; list.style.scrollSnapType = 'none'; }
    if (grab.moved) list.scrollLeft = grab.sl - (e.clientX - grab.x);
  });
  window.addEventListener('pointerup', () => {
    if (!grab) return;
    if (grab.moved) { chooserDragged = performance.now(); list.style.scrollSnapType = ''; goTo(cards[[...dots.children].findIndex((d) => d.classList.contains('on'))]); }
    grab = null;
  });
  window.addEventListener('keydown', (e) => {
    const i = cards.findIndex((c) => c.classList.contains('on'));
    if (e.key === 'ArrowRight' && cards[i + 1]) goTo(cards[i + 1]);
    if (e.key === 'ArrowLeft' && cards[i - 1]) goTo(cards[i - 1]);
    if (e.key === 'Enter' && cards[i]) pickSet(cards[i].dataset.key, cards[i]);
  });
  list.addEventListener('scroll', mark, { passive: true });
  mark();
  const card = from && box.querySelector(`.ch-card[data-key="${from}"]`);
  if (card) {
    const book = card.querySelector('.ch-book');
    list.scrollLeft = card.offsetLeft + card.offsetWidth / 2 - list.clientWidth / 2;   // de map waar je vandaan komt in beeld
    const unfreeze = freezeList(list);
    setTimeout(unfreeze, 660);
    card.classList.add('picked');
    box.classList.add('fadeout', 'instant');
    book.style.transform = flyTransform(book, SETS[from]);
    void book.offsetWidth;
    box.classList.remove('instant');
    book.style.transition = 'transform .6s cubic-bezier(.4, 0, .2, 1)';
    book.style.transform = '';
    box.classList.remove('fadeout');
    setTimeout(() => { card.classList.remove('picked'); book.style.transition = ''; }, 650);
  } else box.classList.add('enter');   // gewoon binnenkomen: de mappen ploffen één voor één op tafel
}

// waar ligt de dichte map op tafel? (schermcoördinaten van de voorkaft, inclusief de rug)
function coverRect(set) {
  const l = computeLayout(), tr = table.getBoundingClientRect(), k = l.k;
  const x = (l.single ? l.ax : l.ax + 480 * l.u) - SPINE * l.u;
  return {
    left: tr.left + (tr.width - l.W * k) / 2 + x * k,
    top: tr.top + (tr.height - l.H * k) / 2 + l.ay * k,
    width: (PAGE_W + SPINE) * l.u * k,
    height: (set?.pageH || PAGE_H) * l.u * k,
  };
}
// de veeglijst knipt alles af wat erbuiten komt; tijdens de vlucht van een kaft zetten we hem daarom even vast
function freezeList(list) {
  const sl = list.scrollLeft;
  if (getComputedStyle(list).overflowX === 'visible') return () => {};
  list.style.overflow = 'visible';
  list.style.transform = `translateX(${-sl}px)`;
  return () => { list.style.overflow = ''; list.style.transform = ''; list.scrollLeft = sl; };
}

// verplaatsing en schaal waarmee een kaft uit het overzicht precies op die plek komt
function flyTransform(book, set) {
  // meten zonder de scheve ligging van de kaft in het overzicht
  const keep = [book.style.transition, book.style.transform];
  book.style.transition = 'none'; book.style.transform = 'none';
  const r = book.getBoundingClientRect(), t = coverRect(set);
  [book.style.transition, book.style.transform] = keep;
  void book.offsetWidth;
  return `translate(${t.left - r.left}px, ${t.top - r.top}px) scale(${t.width / r.width}, ${t.height / r.height})`;
}

// een map kiezen: de andere verdwijnen, deze vliegt naar zijn plek op tafel en slaat daar open
function pickSet(key, card) {
  const box = $('#chooser');
  if (box.classList.contains('fadeout')) return;
  box.classList.remove('enter');
  card.classList.add('picked');
  box.classList.add('fadeout');
  const book = card.querySelector('.ch-book');
  freezeList(box.querySelector('.ch-list'));
  book.style.transition = 'transform .6s cubic-bezier(.4, 0, .2, 1)';
  book.style.transform = flyTransform(book, SETS[key]);
  setTimeout(() => {
    try { sessionStorage.setItem('flippo-intro', key); } catch { /* geen opslag */ }
    location.hash = key;
  }, 620);
}

// terug naar het overzicht: de map slaat dicht, de tafel verdwijnt, daarna komen de mappen terug
$('#btn-home').onclick = () => {
  if (!SET || noSave) return;
  save();
  noSave = true;
  const wasFront = albumState === 'front';
  document.body.classList.add('outro');
  if (!wasFront) { albumState = 'front'; applyAlbumState(false); snd('put'); }
  setTimeout(() => {
    try { sessionStorage.setItem('flippo-from', Object.keys(SETS).find((k) => SETS[k] === SET)); } catch { /* geen opslag */ }
    location.hash = '';
  }, wasFront ? 420 : 820);
};
window.addEventListener('hashchange', () => location.reload());
// pijltjestoetsen bladeren ook
window.addEventListener('keydown', (e) => {
  if (!SET || v3 || pack) return;
  if (e.key === 'ArrowRight') turnPage(1);
  if (e.key === 'ArrowLeft') turnPage(-1);
});

// ---------- start ----------
if (!SET) {
  showChooser();
} else {
  document.title = `${SET.title} – Flippo's`;
  // voorwerpen op tafel in plaats van knoppen
  const pk = $('#btn-pack');
  pk.hidden = false;
  pk.innerHTML = `<i class="bagimg" style="background-image:url(${SET.pack})"></i>`;   // plaatje in een eigen laag, zodat de schaduw van de knop heel blijft
  pk.style.aspectRatio = SET.packRatio;
  pk.title = FLIPPO ? `Zak chips: ${PACK_N} flippo's` : POKE ? 'Zakje met 3 munten' : 'Zakje met 3 Diskeyz';
  pk.classList.toggle('chips', FLIPPO);
  const home = $('#btn-home');
  home.hidden = false;
  home.textContent = '‹';
  $('#btn-sound').hidden = false;
  $('#btn-help').hidden = false;
  $('#btn-sweep').hidden = false;
  applyLayout();
  if (!load()) {
    // nieuw spel: lege tafel, je begint met een zak chips of een zakje
    toast(FLIPPO ? 'Open een zak chips om flippo\'s te krijgen!' : POKE ? 'Open een zakje om munten te krijgen!' : 'Open een zakje om Diskeyz te krijgen!');
  }
  updateCount.last = null;
  updateCount();
  window.addEventListener('resize', applyLayout);
  // lege map: het zakje wiebelt om te laten zien waar je begint
  pk.classList.toggle('nudge', !discs.length);
  // de eerste keer: uitleg van de gebaren
  let seen = false;
  try { seen = localStorage.getItem('flippo-help-' + SET.kind); } catch { /* geen opslag */ }
  if (!seen) setTimeout(showHelp, 900);
  // net gekozen in het overzicht: de map ligt eerst dicht op tafel en slaat dan vloeiend open
  let intro = null;
  try { intro = sessionStorage.getItem('flippo-intro'); sessionStorage.removeItem('flippo-intro'); } catch { /* geen opslag */ }
  if (intro) {
    const want = albumState;
    document.body.classList.add('intro');
    albumState = 'front';
    applyAlbumState(true);
    void albumEl.offsetWidth;
    setTimeout(() => {
      document.body.classList.remove('intro');
      if (want !== 'front') { albumState = want; applyAlbumState(false); snd('flip'); }
      rainDiscs(350);
    }, 140);
  } else if (albumState === 'open') rainDiscs(200);
}
