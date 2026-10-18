(function () {
const STAGE_W = 1600, STAGE_H = 1200;
const SOUND_BASE = '../../shared/sound/';
const MUSIC_BASE = 'https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/music/sbg-gem/1996/05/';

// In-memory cache for article JSON (lives until page unload/reload)
const articleCache = Object.create(null);

async function loadArticle(id) {
  if (articleCache[id]) return articleCache[id];
  const resp = await fetch('assets/data/articles/' + id + '.json');
  if (!resp.ok) throw new Error('not found: ' + id);
  const data = await resp.json();
  articleCache[id] = data;
  return data;
}

// Warm article cache in background (non-blocking)
function warmArticleCache() {
  if (!READY_ARTICLES || !READY_ARTICLES.length) return;
  let i = 0;
  function next() {
    if (i >= READY_ARTICLES.length) return;
    const id = READY_ARTICLES[i++];
    loadArticle(id).catch(function () {}).finally(function () {
      // yield between requests
      setTimeout(next, 0);
    });
  }
  setTimeout(next, 100);
}



const TX_DURATION = 1000;

let musicVol = 0.15;
let sfxVol = 0.15;

const stage = document.getElementById('stage');
const viewMenu = document.getElementById('view-menu');
const viewSubmenu = document.getElementById('view-submenu');
const viewViewer = document.getElementById('view-viewer');
const menuImage = document.getElementById('menuImage');
const submenuImage = document.getElementById('submenuImage');
const submenuImg = document.getElementById('submenuImg');
const pageImage = document.getElementById('pageImage');
const edgeTop = document.getElementById('edgeTop');
const edgeBottom = document.getElementById('edgeBottom');
const popupOverlay = document.getElementById('popupOverlay');
const popupImage = document.getElementById('popupImage');
const popupHit = document.getElementById('popupHit');
const videoOverlay = document.getElementById('videoOverlay');
const videoFrameWrap = document.getElementById('videoFrameWrap');
const adInterstitial = document.getElementById('adInterstitial');
const adInterstitialImg = document.getElementById('adInterstitialImg');
const adInterstitialVid = document.getElementById('adInterstitialVid');
const splashOverlay = document.getElementById('splashOverlay');
const splashImg = document.getElementById('splashImg');
const tallScroll = document.getElementById('tallScroll');
const tallContent = document.getElementById('tallContent');
const tallImage = document.getElementById('tallImage');
const overlayScreen = document.getElementById('overlay-screen');
const txOverlay = document.getElementById('tx-overlay');

let currentView = 'menu'; // 'menu' | 'submenu' | 'viewer'
let currentSubmenuId = null;
let submenuStack = []; // parent submenu ids for nested back
let article = null;
let currentPage = 0;
let nestedParent = null; // { articleId, page, music } when inside nested article
let pageHotspotEls = [];
let isScrollMode = false;
let overlayMode = null;
let leftPanelOpen = false;
let rightPanelOpen = false;
let draggingSlider = null;
let txBusy = false;

// ========== MUSIC ==========
const music = new Audio();
music.loop = true;
music.volume = musicVol;
let currentTrack = null;

function playMusic(trackName) {
  if (!trackName) return;
  // Absolute URL if starts with http, otherwise MUSIC_BASE + filename
  const fullUrl = (trackName.indexOf('http') === 0) ? trackName : (MUSIC_BASE + trackName);
  if (currentTrack === fullUrl) {
    if (music.paused) music.play().catch(function () {});
    return; // same track already loaded — do not restart
  }
  currentTrack = fullUrl;
  music.src = fullUrl;
  music.volume = musicVol;
  music.play().catch(function () {});
}
function setMusicVolume(v) {
  musicVol = Math.max(0, Math.min(1, v));
  music.volume = musicVol;
}
function setSfxVolume(v) {
  sfxVol = Math.max(0, Math.min(1, v));
}
function playSfx(name) {
  if (!name) return;
  try {
    const a = new Audio(SOUND_BASE + name);
    a.volume = sfxVol;
    a.play().catch(function () {});
  } catch (e) {}
}

// ========== STAGE FIT ==========
function fitStage() {
  const ww = window.innerWidth, hh = window.innerHeight;
  const scale = Math.min(ww / STAGE_W, hh / STAGE_H);
  stage.style.transform = 'scale(' + scale + ')';
  stage.style.left = ((ww - STAGE_W * scale) / 2) + 'px';
  stage.style.top  = ((hh - STAGE_H * scale) / 2) + 'px';
  updateCursorScale(ww, hh);
}

const CURSOR_DEFS = {
  red:   { src: '../../shared/img/cursor-red.webp',   hx: 2,  hy: 8 },
  green: { src: '../../shared/img/cursor-green.webp', hx: 2,  hy: 8 },
  zoom:  { src: '../../shared/img/cursor-zoom.webp',  hx: 16, hy: 14 },
  video: { src: '../../shared/img/cursor-video.webp', hx: 16, hy: 14 },
  prev:  { src: '../../shared/img/page-prev2.webp',   hx: 46, hy: 8  },
  next:  { src: '../../shared/img/page-next2.webp',   hx: 46, hy: 44 }
};
const cursorImgs = {};
const cursorBlobUrls = { full: {}, half: {} };
let cursorScaleMode = null;
let cursorsReady = false;

function loadCursorImages() {
  const keys = Object.keys(CURSOR_DEFS);
  let left = keys.length;
  keys.forEach(function (k) {
    const img = new Image();
    img.onload = function () {
      cursorImgs[k] = img;
      cursorBlobUrls.full[k] = CURSOR_DEFS[k].src;
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width / 2));
      c.height = Math.max(1, Math.round(img.height / 2));
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      cursorBlobUrls.half[k] = c.toDataURL('image/png');
      left--;
      if (left === 0) {
        cursorsReady = true;
        updateCursorScale(window.innerWidth, window.innerHeight);
      }
    };
    img.src = CURSOR_DEFS[k].src;
  });
}

function updateCursorScale(ww, hh) {
  const dpr = window.devicePixelRatio || 1;
  const physW = Math.max(window.screen.width || 0, ww) * dpr;
  const physH = Math.max(window.screen.height || 0, hh) * dpr;
  const mode = (physW < 2560 && physH < 1440) ? 'half' : 'full';
  if (mode === cursorScaleMode && cursorsReady) return;
  if (!cursorsReady && mode === 'full') {
    cursorScaleMode = 'full';
    return;
  }
  if (!cursorsReady) return;
  cursorScaleMode = mode;
  const urls = cursorBlobUrls[mode];
  const scale = (mode === 'half') ? 0.5 : 1;
  const root = document.documentElement;
  function setCur(name, key) {
    const d = CURSOR_DEFS[key];
    const hx = Math.max(0, Math.round(d.hx * scale));
    const hy = Math.max(0, Math.round(d.hy * scale));
    root.style.setProperty('--cur-' + name, 'url("' + urls[key] + '") ' + hx + ' ' + hy + ', auto');
  }
  setCur('red', 'red');
  setCur('green', 'green');
  setCur('zoom', 'zoom');
  setCur('video', 'video');
  setCur('prev', 'prev');
  setCur('next', 'next');
}

loadCursorImages();
fitStage();
window.addEventListener('resize', fitStage);

// ========== SNAPSHOTS & TRANSITIONS ==========
function makeSnap(url, fullH, scrollY) {
  return { url: url, fullH: fullH || STAGE_H, scrollY: scrollY || 0 };
}

function currentSnapshot() {
  if (currentView === 'menu') {
    return makeSnap('assets/img/content/bg.webp', STAGE_H, 0);
  }
  if (currentView === 'submenu' && currentSubmenuId) {
    return makeSnap(SUBMENUS[currentSubmenuId].image, STAGE_H, 0);
  }
  if (currentView === 'viewer' && article && article.pages && article.pages[currentPage]) {
    if (isScrollMode) {
      const pg = article.pages[currentPage];
      const h = Math.round((pg.height || 1500) * 2.5);
      return makeSnap(pg.image, h, tallScroll.scrollTop);
    }
    return makeSnap(article.pages[currentPage].image, STAGE_H, 0);
  }
  return null;
}

function applySnap(el, snap, half) {
  if (!snap || !snap.url) {
    el.style.backgroundImage = 'none';
    return;
  }
  el.style.backgroundImage = 'url("' + snap.url + '")';
  el.style.backgroundSize = STAGE_W + 'px ' + snap.fullH + 'px';
  el.style.backgroundRepeat = 'no-repeat';
  const y = -(snap.scrollY || 0);
  if (half === 'left') el.style.backgroundPosition = '0px ' + y + 'px';
  else if (half === 'right') el.style.backgroundPosition = '-800px ' + y + 'px';
  else el.style.backgroundPosition = '0px ' + y + 'px';
}

function pickAnim(dir) {
  const types = [0, 1, 2, 3, 4, 5, 6];
  const t = types[Math.floor(Math.random() * types.length)];
  return { type: t, dir: dir || 'next' };
}

function runTransition(oldSnap, newSnap, dir, onDone) {
  if (txBusy) { if (onDone) onDone(); return; }
  if (!oldSnap || !newSnap || !oldSnap.url || !newSnap.url) { if (onDone) onDone(); return; }
  if (oldSnap.url === newSnap.url && oldSnap.scrollY === newSnap.scrollY && oldSnap.fullH === newSnap.fullH) {
    if (onDone) onDone();
    return;
  }
  txBusy = true;
  const pick = pickAnim(dir);
  const type = pick.type;
  const duration = TX_DURATION;
  txOverlay.innerHTML = '';
  txOverlay.classList.add('active');

  const finish = function () {
    txOverlay.classList.remove('active');
    txOverlay.innerHTML = '';
    txBusy = false;
    if (onDone) onDone();
  };

  if (type === 0) {
    playSfx('anim1.wav');
    const oldL = document.createElement('div');
    oldL.className = 'tx-layer';
    applySnap(oldL, oldSnap);
    txOverlay.appendChild(oldL);
    const left = document.createElement('div');
    left.className = 'tx-half left';
    applySnap(left, newSnap, 'left');
    left.style.transform = 'translateX(-800px)';
    const right = document.createElement('div');
    right.className = 'tx-half right';
    applySnap(right, newSnap, 'right');
    right.style.transform = 'translateX(800px)';
    txOverlay.appendChild(left);
    txOverlay.appendChild(right);
    left.style.transition = 'transform ' + duration + 'ms ease-in-out';
    right.style.transition = 'transform ' + duration + 'ms ease-in-out';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        left.style.transform = 'translateX(0)';
        right.style.transform = 'translateX(0)';
      });
    });
    setTimeout(finish, duration + 30);
  } else if (type === 1) {
    playSfx('anim2.wav');
    // solid black behind so the already-switched page underneath is not visible
    const black = document.createElement('div');
    black.className = 'tx-layer';
    black.style.background = '#000';
    const oldEl = document.createElement('div');
    oldEl.className = 'tx-layer';
    applySnap(oldEl, oldSnap);
    oldEl.style.transformOrigin = 'center center';
    const newEl = document.createElement('div');
    newEl.className = 'tx-layer';
    applySnap(newEl, newSnap);
    newEl.style.transformOrigin = 'center center';
    newEl.style.transform = 'scaleY(0)';
    txOverlay.appendChild(black);
    txOverlay.appendChild(newEl);
    txOverlay.appendChild(oldEl);
    const half = duration / 2;
    oldEl.style.transition = 'transform ' + half + 'ms ease-in';
    newEl.style.transition = 'transform ' + half + 'ms ease-out';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        oldEl.style.transform = 'scaleY(0)';
      });
    });
    setTimeout(function () {
      oldEl.style.display = 'none';
      newEl.style.transform = 'scaleY(1)';
    }, half);
    setTimeout(finish, duration + 30);
  } else if (type === 2) {
    playSfx('anim3.wav');
    const oldEl = document.createElement('div');
    oldEl.className = 'tx-layer';
    applySnap(oldEl, oldSnap);
    const newEl = document.createElement('div');
    newEl.className = 'tx-layer';
    applySnap(newEl, newSnap);
    const from = (pick.dir === 'prev') ? -1200 : 1200;
    newEl.style.transform = 'translateY(' + from + 'px)';
    txOverlay.appendChild(oldEl);
    txOverlay.appendChild(newEl);
    newEl.style.transition = 'transform ' + duration + 'ms ease-out';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        newEl.style.transform = 'translateY(0)';
      });
    });
    setTimeout(finish, duration + 30);
  } else if (type === 3) {
    playSfx('anim4.wav');
    const oldEl = document.createElement('div');
    oldEl.className = 'tx-layer';
    applySnap(oldEl, oldSnap);
    const newEl = document.createElement('div');
    newEl.className = 'tx-layer';
    applySnap(newEl, newSnap);
    newEl.style.transform = 'translateY(1200px)';
    txOverlay.appendChild(oldEl);
    txOverlay.appendChild(newEl);
    newEl.style.transition = 'transform ' + duration + 'ms ease-in-out';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        newEl.style.transform = 'translateY(0)';
      });
    });
    setTimeout(finish, duration + 30);
  } else if (type === 4) {
    playSfx('anim5.wav');
    const oldEl = document.createElement('div');
    oldEl.className = 'tx-layer';
    applySnap(oldEl, oldSnap);
    const newEl = document.createElement('div');
    newEl.className = 'tx-layer';
    applySnap(newEl, newSnap);
    newEl.style.transform = 'translateX(1600px)';
    txOverlay.appendChild(oldEl);
    txOverlay.appendChild(newEl);
    oldEl.style.transition = 'transform ' + duration + 'ms ease-in-out';
    newEl.style.transition = 'transform ' + duration + 'ms ease-in-out';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        oldEl.style.transform = 'translateX(-1600px)';
        newEl.style.transform = 'translateX(0)';
      });
    });
    setTimeout(finish, duration + 30);
  } else if (type === 6) {
    // halves converge from left/right — same as type 0, sound anim6.wav
    playSfx('anim6.wav');
    const oldL = document.createElement('div');
    oldL.className = 'tx-layer';
    applySnap(oldL, oldSnap);
    txOverlay.appendChild(oldL);
    const left = document.createElement('div');
    left.className = 'tx-half left';
    applySnap(left, newSnap, 'left');
    left.style.transform = 'translateX(-800px)';
    const right = document.createElement('div');
    right.className = 'tx-half right';
    applySnap(right, newSnap, 'right');
    right.style.transform = 'translateX(800px)';
    txOverlay.appendChild(left);
    txOverlay.appendChild(right);
    left.style.transition = 'transform ' + duration + 'ms ease-in-out';
    right.style.transition = 'transform ' + duration + 'ms ease-in-out';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        left.style.transform = 'translateX(0)';
        right.style.transform = 'translateX(0)';
      });
    });
    setTimeout(finish, duration + 30);
  } else {
    // type 5 — fade through black
    const black = document.createElement('div');
    black.className = 'tx-layer';
    black.style.background = '#000';
    black.style.opacity = '0';
    const oldEl = document.createElement('div');
    oldEl.className = 'tx-layer';
    applySnap(oldEl, oldSnap);
    txOverlay.appendChild(oldEl);
    txOverlay.appendChild(black);
    const half = duration / 2;
    black.style.transition = 'opacity ' + half + 'ms linear';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        black.style.opacity = '1';
      });
    });
    setTimeout(function () {
      applySnap(oldEl, newSnap);
      black.style.opacity = '0';
    }, half);
    setTimeout(finish, duration + 30);
  }
}

// ========== MAIN MENU HOTSPOTS ==========
// Original 640×480 coords ×2.5 → stage 1600×1200
const MENU_HOTSPOTS = [
  { id: 'ot-redakcii',   label: 'ОТ РЕДАКЦИИ',   x: 210, y: 30,   w: 695, h: 68 },
  { id: 'novosti',       label: 'НОВОСТИ',       x: 210, y: 128,  w: 695, h: 68 },
  { id: 'v-proekte',     label: 'В ПРОЕКТЕ',     x: 210, y: 225,  w: 695, h: 68 },
  { id: 'obzory',        label: 'ОБЗОРЫ',        x: 210, y: 323,  w: 695, h: 68 },
  { id: 'solutions',     label: 'SOLUTIONS',     x: 210, y: 420,  w: 695, h: 68 },
  { id: 'cheats',        label: 'CHEATS',        x: 210, y: 518,  w: 695, h: 68 },
  { id: 'staroe-dobroe', label: 'СТАРОЕ-ДОБРОЕ', x: 210, y: 615,  w: 695, h: 68 },
  { id: 'hardware',      label: 'HARDWARE',      x: 210, y: 713,  w: 695, h: 68 },
  { id: 'fiction',       label: 'FICTION',       x: 210, y: 810,  w: 695, h: 68 },
  { id: 'reklama',       label: 'РЕКЛАМА',       x: 210, y: 908,  w: 695, h: 68 },
  { id: 'demo-versii',   label: 'ДЕМО-ВЕРСИИ',   x: 210, y: 1005, w: 695, h: 68 },
  { id: 'exit',          label: 'ВЫХОД',         x: 210, y: 1093, w: 695, h: 65 }
];

// Submenus that open from main menu (id → config)
// Coords: original 640×480 ×2.5 → stage 1600×1200
const SUBMENUS = {
  // --- ОТ РЕДАКЦИИ (edit.webp) ---
  // original 640×480: x=184 w=269 h=18, y=217/247/277/307/337/367
  'ot-redakcii': {
    image: 'assets/img/content/edit.webp',
    hotspots: [
      { id: 'ot-redakcii-page',  label: 'От редакции',                    x: 460, y: 543, w: 673, h: 45 },
      { id: 'email',             label: 'E-mail',                         x: 460, y: 618, w: 673, h: 45 },
      { id: 'comtek',            label: "Кровавая резня на ComTek'e!",   x: 460, y: 693, w: 673, h: 45 },
      { id: 'distributors',      label: 'Дистрибьюторы',                  x: 460, y: 768, w: 673, h: 45 },
      { id: 'dist-sites',        label: 'Dist Sites',                     x: 460, y: 843, w: 673, h: 45 },
      { id: 'credits',           label: 'Credits',                        x: 460, y: 918, w: 673, h: 45 }
    ]
  },
  // --- НОВОСТИ (NEWS.png) ---
  'novosti': {
    image: 'assets/img/content/news.webp',
    hotspots: [
      { id: 'game-news',       label: 'News',            x: 460, y: 645, w: 670, h: 45 },
      { id: 'company-news',    label: 'Company News',    x: 460, y: 720, w: 670, h: 45 },
      { id: 'internet-top-100',label: 'INTERNET TOP 100',x: 460, y: 795, w: 670, h: 45 }
    ]
  },
  // --- В ПРОЕКТЕ (PROJ.png) ---
  'v-proekte': {
    image: 'assets/img/content/proj.webp',
    hotspots: [
      // left column x=46*2.5=115, w=263*2.5=657.5
      { id: '7th-legion',          label: '7Th Legion',                          x: 115, y: 350,  w: 658, h: 45 },
      { id: 'cc-red-alert',        label: 'Command & Conquer : Red Alert',       x: 115, y: 420,  w: 658, h: 45 },
      { id: 'crusader-no-regret',  label: 'Crusader : No Regret',                x: 115, y: 490,  w: 658, h: 45 },
      { id: 'diablo',              label: 'Diablo',                              x: 115, y: 560,  w: 658, h: 45 },
      { id: 'granprix-ii',         label: 'GranPrix II',                         x: 115, y: 630,  w: 658, h: 45 },
      { id: 'into-the-void',       label: 'Into The Void',                       x: 115, y: 700,  w: 658, h: 45 },
      { id: 'jagged-alliance-dg',  label: 'Jagged Alliance : Deadly Games',      x: 115, y: 770,  w: 658, h: 45 },
      { id: 'jedi-knight',         label: 'Jedi Knight: Dark Forces II',         x: 115, y: 840,  w: 658, h: 45 },
      { id: 'max',                 label: 'M.A.X.',                              x: 115, y: 910,  w: 658, h: 45 },
      { id: 'master-of-orion-2',   label: 'Master Of Orion II',                  x: 115, y: 980,  w: 658, h: 45 },
      { id: 'mission-force',       label: 'Mission Force: CyberStorm',           x: 115, y: 1050, w: 658, h: 45 },
      { id: 'nemesis-wizardry',    label: 'Nemesis : The Wizardry Adventure',    x: 115, y: 1120, w: 658, h: 45 },
      // right column x=310*2.5=775, w=283*2.5=707.5
      { id: 'pandora-directive',   label: 'Pandora Directive',                   x: 775, y: 350,  w: 708, h: 45 },
      { id: 'prey-shadow-warrior', label: 'Prey & Shadow Warrior vs Quake',      x: 775, y: 420,  w: 708, h: 45 },
      { id: 'red-baron-ii',        label: 'Red Baron II',                        x: 775, y: 490,  w: 708, h: 45 },
      { id: 'simcopter',           label: 'SimCopter',                           x: 775, y: 560,  w: 708, h: 45 },
      { id: 'syndicate-wars',      label: 'Syndicate II : Syndicate Wars',       x: 775, y: 630,  w: 708, h: 45 },
      { id: 'the-darkening',       label: 'The Darkening',                       x: 775, y: 700,  w: 708, h: 45 },
      { id: 'timelapse',           label: 'Timelapse',                           x: 775, y: 770,  w: 708, h: 45 },
      { id: 'titanic',             label: 'Titanic : Adventure Out Of Time',     x: 775, y: 840,  w: 708, h: 45 },
      { id: 'waterworld',          label: 'WaterWorld',                          x: 775, y: 910,  w: 708, h: 45 },
      { id: 'xcom-apocalypse',     label: 'XCOM 3 : Apocalypse',                 x: 775, y: 980,  w: 708, h: 45 },
      { id: 'xwing-vs-tie',        label: 'X-Wing vs TIE Fighter',               x: 775, y: 1050, w: 708, h: 45 },
      { id: 'novosti',             label: 'N E W S',                             x: 775, y: 1128, w: 708, h: 45 }
    ]
  },
  // --- ОБЗОРЫ (obzor.webp) ---
  'obzory': {
    image: 'assets/img/content/obzor.webp',
    hotspots: [
      { id: 'a10-2', label: 'A10-2 Silent Thunder', x: 22, y: 118, w: 580, h: 38 },
      { id: 'ah-64d-longbow', label: 'AH-64D Longbow', x: 22, y: 172, w: 580, h: 40 },
      { id: 'abuse', label: 'Abuse', x: 22, y: 230, w: 580, h: 38 },
      { id: 'afterlife', label: 'AfterLife', x: 22, y: 288, w: 580, h: 38 },
      { id: 'bad-mojo', label: 'Bad Mojo', x: 22, y: 342, w: 580, h: 40 },
      { id: 'batman-forever', label: 'Batman Forever', x: 22, y: 400, w: 580, h: 38 },
      { id: 'toshinden', label: 'Battle Arena: Toshinden', x: 22, y: 455, w: 580, h: 40 },
      { id: 'bermuda-syndrome', label: 'Bermuda Syndrome', x: 22, y: 512, w: 580, h: 38 },
      { id: 'big-red-racing', label: 'Big Red Racing', x: 22, y: 568, w: 580, h: 40 },
      { id: 'wwf-wrestling', label: 'Все тайны WWF Wrestling Mania', x: 22, y: 625, w: 580, h: 38 },
      { id: 'civilization-ii', label: 'Civilization II', x: 22, y: 680, w: 580, h: 40 },
      { id: 'congo', label: 'Congo: Descent Into Zinj', x: 22, y: 738, w: 580, h: 38 },
      { id: 'conquest-new-world', label: 'Conquest Of New World', x: 22, y: 795, w: 580, h: 38 },
      { id: 'crusade', label: 'Crusade: The Fight For Power', x: 22, y: 850, w: 580, h: 40 },
      { id: 'descent-ii', label: 'Descent II', x: 22, y: 908, w: 580, h: 38 },
      { id: 'duke-nukem-3d', label: 'Duke Nukem 3D', x: 22, y: 962, w: 580, h: 40 },
      { id: 'earthsiege-ii', label: 'EarthSiege II', x: 22, y: 1020, w: 580, h: 38 },
      { id: 'fantasy-general', label: 'Fantasy General', x: 22, y: 1075, w: 580, h: 40 },
      { id: 'firestorm', label: 'FireStorm: ThunderHawk II', x: 22, y: 1132, w: 580, h: 40 },
      { id: 'gearheads', label: "GearHeads", x: 625, y: 115, w: 582, h: 40 },
      { id: 'kingdom-omagic', label: "Kingdom O'Magic", x: 625, y: 172, w: 582, h: 40 },
      { id: 'power-slave', label: "Power Slave", x: 625, y: 230, w: 582, h: 38 },
      { id: 'resurrection-rise-ii', label: "Resurrection: Rise of the Robots II", x: 625, y: 288, w: 582, h: 38 },
      { id: 'revolution-x', label: "Revolution X", x: 625, y: 342, w: 582, h: 40 },
      { id: 'seek-destroy', label: "Seek & Destroy", x: 625, y: 400, w: 582, h: 38 },
      { id: 'silent-hunter', label: "Silent Hunter", x: 625, y: 455, w: 582, h: 40 },
      { id: 'space-bucks', label: "Space Bucks", x: 625, y: 512, w: 582, h: 38 },
      { id: 'stonekeep', label: "Stonekeep", x: 625, y: 568, w: 582, h: 40 },
      { id: 'supreme-warrior', label: "Supreme Warrior", x: 625, y: 625, w: 582, h: 38 },
      { id: 'this-means-war', label: "This Means War", x: 625, y: 680, w: 582, h: 40 },
      { id: 'top-gun', label: "Top Gun", x: 625, y: 738, w: 582, h: 40 },
      { id: 'total-mayhem', label: "Total Mayhem", x: 625, y: 795, w: 582, h: 38 },
      { id: 'track-attack', label: "Track Attack Changes Everything", x: 625, y: 850, w: 582, h: 40 },
      { id: 'trophy-bass', label: "Trophy Bass", x: 625, y: 908, w: 582, h: 38 },
      { id: 'warcraft-ii', label: "Warcraft II: Tides Of Darkness", x: 625, y: 962, w: 582, h: 40 },
      { id: 'witchaven-ii', label: "Witchaven II", x: 625, y: 1020, w: 582, h: 38 },
      { id: 'zork-nemesis', label: "Zork Nemesis", x: 625, y: 1075, w: 582, h: 40 },
      { id: 'v-proekte', label: "в проекте", x: 625, y: 1132, w: 582, h: 40 },
      { id: 'action', label: 'ACTION', x: 1240, y: 115, w: 330, h: 95 },
      { id: 'arcade', label: 'ARCADE', x: 1240, y: 255, w: 330, h: 95 },
      { id: 'gearheads', label: 'LOGIC', x: 1240, y: 392, w: 330, h: 95 },
      { id: 'simulations', label: 'SIMULATION', x: 1240, y: 530, w: 330, h: 95 },
      { id: 'adventure', label: 'ADVENTURE', x: 1240, y: 668, w: 330, h: 95 },
      { id: 'strategy', label: 'STRATEGY', x: 1240, y: 805, w: 330, h: 95 },
      { id: 'stonekeep', label: 'RPG', x: 1240, y: 942, w: 330, h: 95 },
      { id: 'solutions', label: 'SOLUTIONS', x: 1240, y: 1080, w: 330, h: 95 }
    ]
  },
  // --- HARDWARE (HARDW.png) ---
  'hardware': {
    image: 'assets/img/content/hardw.webp',
    hotspots: [
      { id: 'accel-3d-video', label: 'Новые тенденции в мире акселераторов: 3D & VIDEO', x: 460, y: 648, w: 670, h: 90 },
      { id: 'memory-hard-soft', label: 'Память: Hard или Soft ?', x: 460, y: 770, w: 670, h: 45 }
    ]
  },
  // --- ACTION (ACTION.png) — will be opened from ОБЗОРЫ later ---
  'action': {
    image: 'assets/img/content/action.webp',
    hotspots: [
      { id: 'abuse',               label: 'Abuse',                          x: 453, y: 433, w: 670, h: 45 },
      { id: 'toshinden',           label: 'Battle Arena: Toshinden',        x: 453, y: 508, w: 670, h: 45 },
      { id: 'bermuda-syndrome',    label: 'Bermuda Syndrome',               x: 453, y: 583, w: 670, h: 45 },
      { id: 'wwf-wrestling',       label: 'Все тайны WWF Wrestling Mania',  x: 453, y: 658, w: 670, h: 45 },
      { id: 'descent-ii',          label: 'Descent II',                     x: 453, y: 733, w: 670, h: 45 },
      { id: 'duke-nukem-3d',       label: 'Duke Nukem 3D',                  x: 453, y: 808, w: 670, h: 45 },
      { id: 'power-slave',         label: 'Power Slave',                    x: 453, y: 883, w: 670, h: 45 },
      { id: 'resurrection-rise-ii',label: 'Resurrection Rise II',           x: 453, y: 958, w: 670, h: 45 },
      { id: 'supreme-warrior',     label: 'Supreme Warrior',                x: 453, y: 1033,w: 670, h: 45 },
      { id: 'witchaven-ii',        label: 'Witchaven II',                   x: 453, y: 1108,w: 670, h: 45 }
    ]
  },
  // --- ADVENTURE (ADVENT.png) ---
  'adventure': {
    image: 'assets/img/content/advent.webp',
    hotspots: [
      { id: 'bad-mojo',            label: 'Bad Mojo',                       x: 458, y: 578, w: 670, h: 45 },
      { id: 'congo',               label: 'Congo : Descent Into Zinj',      x: 458, y: 653, w: 670, h: 45 },
      { id: 'kingdom-omagic',      label: "Kingdom O'Magic",                x: 458, y: 728, w: 670, h: 45 },
      { id: 'zork-nemesis',        label: 'Zork Nemesis',                   x: 458, y: 803, w: 670, h: 45 }
    ]
  },
  // --- ARCADE (ARCADE.png) ---
  'arcade': {
    image: 'assets/img/content/arcade.webp',
    hotspots: [
      { id: 'batman-forever',      label: 'Batman Forever',                 x: 458, y: 633, w: 670, h: 45 },
      { id: 'revolution-x',        label: 'Revolution X',                   x: 458, y: 708, w: 670, h: 45 },
      { id: 'seek-destroy',        label: 'Seek & Destroy',                 x: 458, y: 783, w: 670, h: 45 }
    ]
  },
  // --- SIMULATIONS (SIM.png) ---
  'simulations': {
    image: 'assets/img/content/sim.webp',
    hotspots: [
      { id: 'a10-2',               label: 'A10-2 Silent Thunder',           x: 455, y: 478, w: 670, h: 45 },
      { id: 'ah-64d-longbow',      label: 'AH-64D Longbow',                 x: 455, y: 553, w: 670, h: 45 },
      { id: 'big-red-racing',      label: 'Big Red Racing',                 x: 455, y: 628, w: 670, h: 45 },
      { id: 'earthsiege-ii',       label: 'EarthSiege II',                  x: 455, y: 703, w: 670, h: 45 },
      { id: 'firestorm',           label: 'FireStorm : ThunderHawk II',     x: 455, y: 778, w: 670, h: 45 },
      { id: 'silent-hunter',       label: 'Silent Hunter',                  x: 455, y: 853, w: 670, h: 45 },
      { id: 'top-gun',             label: 'Top Gun',                        x: 455, y: 928, w: 670, h: 45 },
      { id: 'track-attack',        label: 'Track Attack',                   x: 455, y: 1003,w: 670, h: 45 },
      { id: 'trophy-bass',         label: 'Trophy Bass',                    x: 455, y: 1078,w: 670, h: 45 }
    ]
  },
  // --- STRATEGY (STRATEG.png) ---
  'strategy': {
    image: 'assets/img/content/strateg.webp',
    hotspots: [
      { id: 'afterlife',           label: 'AfterLife',                      x: 450, y: 393, w: 670, h: 45 },
      { id: 'civilization-ii',     label: 'Civilization II',                x: 450, y: 468, w: 670, h: 45 },
      { id: 'conquest-new-world',  label: 'Conquest Of New World',          x: 450, y: 543, w: 670, h: 45 },
      { id: 'crusade',             label: 'Crusade : The Fight For Power',  x: 450, y: 618, w: 670, h: 45 },
      { id: 'fantasy-general',     label: 'Fantasy General',                x: 450, y: 693, w: 670, h: 45 },
      { id: 'space-bucks',         label: 'Space Bucks',                    x: 450, y: 768, w: 670, h: 45 },
      { id: 'this-means-war',      label: 'This Means War',                 x: 450, y: 843, w: 670, h: 45 },
      { id: 'total-mayhem',        label: 'Total Mayhem',                   x: 450, y: 918, w: 670, h: 45 },
      { id: 'warcraft-ii',         label: 'Warcraft II : Tides Of Darkness',x: 450, y: 993, w: 670, h: 45 }
    ]
  },
  // --- SOLUTIONS (SOLUTI~1.png) ---
  'solutions': {
    image: 'assets/img/content/solutions.webp',
    hotspots: [
      { id: '11th-hour',           label: '11th Hour',                      x: 453, y: 353, w: 670, h: 45 },
      { id: '7th-guest-ru',        label: '7th Guest Russian Edition',      x: 453, y: 423, w: 670, h: 45 },
      { id: 'aliens-odyssey',      label: 'Aliens Odyssey',                 x: 453, y: 493, w: 670, h: 45 },
      { id: 'aliens-comic',        label: 'Aliens: A Comic Book Adventure', x: 453, y: 563, w: 670, h: 45 },
      { id: 'bad-mojo-sol',        label: 'Bad Mojo',                       x: 453, y: 633, w: 670, h: 45 },
      { id: 'chronicles-sword',    label: 'Chronicles Of The Sword',        x: 453, y: 703, w: 670, h: 45 },
      { id: 'chronomaster',        label: 'Chronomaster',                   x: 453, y: 773, w: 670, h: 45 },
      { id: 'igor',                label: 'IGOR: Objective Uikakohonia',    x: 453, y: 843, w: 670, h: 45 },
      { id: 'shannara',            label: 'Shannara',                       x: 453, y: 913, w: 670, h: 45 },
      { id: 'simon-sorcerer-2',    label: 'Simon The Sorcerer - II',        x: 453, y: 983, w: 670, h: 45 },
      { id: 'timegate',            label: "TimeGate : Knight's Chase",      x: 453, y: 1053,w: 670, h: 45 },
      { id: 'torins-passage-sol',  label: "Torin's Passage",                x: 453, y: 1123,w: 670, h: 45 }
    ]
  },
  // --- CHEATS (CHEATS.png) ---
  'cheats': {
    image: 'assets/img/content/cheats.webp',
    hotspots: [
      { id: 'cheats', label: 'Abuse',                    page: 0, x: 455, y: 363, w: 670, h: 45 },
      { id: 'cheats', label: 'Descent II',               page: 2, x: 455, y: 438, w: 670, h: 45 },
      { id: 'cheats', label: 'Destruction Derby',        page: 2, x: 455, y: 513, w: 670, h: 45 },
      { id: 'cheats', label: 'Johnny Bazookatone',       page: 0, x: 455, y: 588, w: 670, h: 45 },
      { id: 'cheats', label: 'Seek and Destroy',         page: 2, x: 455, y: 663, w: 670, h: 45 },
      { id: 'cheats', label: 'Strife',                   page: 0, x: 455, y: 738, w: 670, h: 45 },
      { id: 'cheats', label: 'Terminator: Future Shock', page: 1, x: 455, y: 813, w: 670, h: 45 },
      { id: 'cheats', label: 'Total Control',            page: 2, x: 455, y: 888, w: 670, h: 45 },
      { id: 'cheats', label: 'Witchaven 2',              page: 4, x: 455, y: 963, w: 670, h: 45 },
      { id: 'cheats', label: 'Wing Commander IV',        page: 1, x: 455, y: 1038, w: 670, h: 45 },
      { id: 'cheats', label: 'Worms Plus',               page: 1, x: 455, y: 1113, w: 670, h: 45 }
    ]
  },
  // --- РЕКЛАМА (ADVERT.png) ---
  'reklama': {
    image: 'assets/img/content/marketing.webp',
    hotspots: [
      { id: 'pc-world',            label: 'Весь Компьютерный Мир',  x: 453, y: 353, w: 670, h: 45 },
      { id: 'compulink',           label: 'CompuLink',              x: 453, y: 423, w: 670, h: 45 },
      { id: 'game-land',           label: 'Game Land',              x: 453, y: 493, w: 670, h: 45 },
      { id: 'tainy-500',           label: 'Тайны 500 игр',          x: 453, y: 563, w: 670, h: 45 },
      { id: 'sbg-magazine',        label: 'SBG Magazine',           x: 453, y: 633, w: 670, h: 45 },
      { id: 'sbg-publishing',      label: 'SBG Publishing',         x: 453, y: 703, w: 670, h: 45 },
      { id: 'kompas',              label: 'КомпАс',                 x: 453, y: 773, w: 670, h: 45 },
      { id: 'krylya',              label: 'Крылья',                 x: 453, y: 843, w: 670, h: 45 },
      { id: 'multimedia-96',       label: "Мультимедиа '96",        x: 453, y: 913, w: 335, h: 45 },
      { id: 'multimedia-96',       label: 'SBG Magazine',           x: 788, y: 913, w: 335, h: 45 },
      { id: 'pulse',               label: 'Пульс',                  x: 453, y: 983, w: 223, h: 45 },
      { id: 'pulse',               label: 'Телетрейд',              x: 676, y: 983, w: 223, h: 45 },
      { id: 'pulse',               label: 'Технология',             x: 899, y: 983, w: 224, h: 45 },
      { id: 'russian-roulette',    label: 'Русская Рулетка',        x: 453, y: 1053, w: 670, h: 45 },
      { id: 'technika-molodezhi',  label: 'Техника-Молодежи',       x: 453, y: 1123, w: 670, h: 45 }
    ]
  },
  'demo-versii': {
    image: 'assets/img/content/demos.webp',
    hotspots: [
      { id: 'demo', label: 'A10-2 Silent Thunder',   x: 118, y: 450,  w: 655, h: 45 },
      { id: 'demo', label: 'Afterlife',              x: 118, y: 520,  w: 655, h: 45 },
      { id: 'demo', label: 'Cyberia II',             x: 118, y: 590,  w: 655, h: 45 },
      { id: 'demo', label: 'Duke Nukem 3D',          x: 118, y: 660,  w: 655, h: 45 },
      { id: 'demo', label: 'Dungeon Keeper',         x: 118, y: 730,  w: 655, h: 45 },
      { id: 'demo', label: 'Earth Worm Jim II',      x: 118, y: 800,  w: 655, h: 45 },
      { id: 'demo', label: 'Pandora Directive',      x: 118, y: 870,  w: 655, h: 45 },
      { id: 'demo', label: 'Power Slave',            x: 118, y: 940,  w: 655, h: 45 },
      { id: 'demo', label: 'Pray for Death',         x: 118, y: 1010, w: 655, h: 45 },
      { id: 'demo', label: 'Quake',                  x: 825, y: 450,  w: 660, h: 45 },
      { id: 'demo', label: 'Seek & Destroy',         x: 825, y: 520,  w: 660, h: 45 },
      { id: 'demo', label: 'Shadows Over Riva',      x: 825, y: 590,  w: 660, h: 45 },
      { id: 'demo', label: 'Shattered Steel',        x: 825, y: 660,  w: 660, h: 45 },
      { id: 'demo', label: 'Syndicate II',           x: 825, y: 730,  w: 660, h: 45 },
      { id: 'demo', label: 'Total Mayhem',           x: 825, y: 800,  w: 660, h: 45 },
      { id: 'demo', label: 'Wooden Ships & Iron Men',x: 825, y: 870,  w: 660, h: 45 },
      { id: 'demo', label: 'Zork Nemesis',           x: 825, y: 940,  w: 660, h: 45 }
    ]
  }
};

// Articles ready to open (empty until pages are added)
const READY_ARTICLES = ['ot-redakcii-page', 'email', 'comtek', 'distributors', 'dist-sites', 'credits', 'game-news', 'company-news', 'internet-top-100', '7th-legion', 'cc-red-alert', 'crusader-no-regret', 'diablo', 'granprix-ii', 'into-the-void', 'jagged-alliance-dg', 'jedi-knight', 'max', 'master-of-orion-2', 'mission-force', 'nemesis-wizardry', 'pandora-directive', 'prey-shadow-warrior', 'red-baron-ii', 'simcopter', 'syndicate-wars', 'the-darkening', 'timelapse', 'titanic', 'waterworld', 'xcom-apocalypse', 'xwing-vs-tie', 'a10-2', 'ah-64d-longbow', 'abuse', 'afterlife', 'bad-mojo', 'batman-forever', 'toshinden', 'bermuda-syndrome', 'big-red-racing', 'wwf-wrestling', 'civilization-ii', 'congo', 'conquest-new-world', 'crusade', 'descent-ii', 'duke-nukem-3d', 'earthsiege-ii', 'fantasy-general', 'firestorm', 'gearheads', 'kingdom-omagic', 'power-slave', 'resurrection-rise-ii', 'revolution-x', 'seek-destroy', 'silent-hunter', 'space-bucks', 'stonekeep', 'supreme-warrior', 'this-means-war', 'top-gun', 'total-mayhem', 'track-attack', 'trophy-bass', 'warcraft-ii', 'witchaven-ii', 'zork-nemesis', '11th-hour', '7th-guest-ru', 'aliens-odyssey', 'aliens-comic', 'bad-mojo-sol', 'chronicles-sword', 'chronomaster', 'igor', 'shannara', 'simon-sorcerer-2', 'timegate', 'torins-passage-sol', 'cheats', 'staroe-dobroe', 'accel-3d-video', 'memory-hard-soft', 'fiction', 'pc-world', 'compulink', 'game-land', 'tainy-500', 'sbg-magazine', 'sbg-publishing', 'kompas', 'krylya', 'multimedia-96', 'pulse', 'russian-roulette', 'technika-molodezhi', 'demo'];

function clearHotspots(container) {
  const hs = container.querySelectorAll('.hotspot');
  hs.forEach(function (el) { el.remove(); });
}

function buildHotspots(container, list, onClick) {
  clearHotspots(container);
  list.forEach(function (hs) {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.style.left = hs.x + 'px';
    el.style.top = hs.y + 'px';
    el.style.width = hs.w + 'px';
    el.style.height = hs.h + 'px';
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      onClick(hs);
    });
    container.appendChild(el);
  });
}

// Main menu clicks
buildHotspots(menuImage, MENU_HOTSPOTS, function (hs) {
  if (txBusy) return;
  if (hs.id === 'exit') {
    playSfx('exit.wav');
    startSplashSequence();
    return;
  }
  if (SUBMENUS[hs.id]) {
    openSubmenu(hs.id);
  } else if (READY_ARTICLES.indexOf(hs.id) !== -1) {
    // direct article from main menu (no submenu)
    currentSubmenuId = null;
    openArticle(hs.id);
  } else {
    console.log('[menu] not ready yet:', hs.id, hs.label);
    playSfx('anim1.wav');
  }
});

// ========== SUBMENU ==========
function openSubmenu(id) {
  if (txBusy) return;
  const conf = SUBMENUS[id];
  if (!conf) return;
  const oldSnap = currentSnapshot();
  // nested: remember parent submenu for hierarchical back
  if (currentView === 'submenu' && currentSubmenuId && currentSubmenuId !== id) {
    submenuStack.push(currentSubmenuId);
  } else if (currentView === 'menu') {
    submenuStack = [];
  }
  currentSubmenuId = id;
  submenuImg.src = conf.image;
  buildHotspots(submenuImage, conf.hotspots, onSubmenuClick);
  viewMenu.style.display = 'none';
  viewViewer.style.display = 'none';
  viewSubmenu.style.display = 'block';
  currentView = 'submenu';
  const newSnap = currentSnapshot();
  if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
}

function onSubmenuClick(hs) {
  if (txBusy) return;
  // CHEATS-style: same id as submenu but with page → open article at page
  if (typeof hs.page === 'number' && READY_ARTICLES.indexOf(hs.id) !== -1) {
    openArticle(hs.id, hs.page);
    return;
  }
  // Nested submenu (genre pages from ОБЗОРЫ, or в проекте from ОБЗОРЫ)
  if (SUBMENUS[hs.id]) {
    openSubmenu(hs.id);
    return;
  }
  if (READY_ARTICLES.indexOf(hs.id) !== -1) {
    openArticle(hs.id, typeof hs.page === 'number' ? hs.page : undefined);
  } else {
    console.log('[submenu] not ready yet:', hs.id, hs.label);
    playSfx('anim1.wav');
  }
}

function fadeBlackBrief(then) {
  if (txBusy) { if (then) then(); return; }
  txBusy = true;
  txOverlay.innerHTML = '';
  const black = document.createElement('div');
  black.className = 'tx-layer';
  black.style.background = '#000';
  black.style.opacity = '0';
  black.style.transition = 'none';
  txOverlay.appendChild(black);
  txOverlay.classList.add('active');
  // force layout so opacity:0 is painted before we animate
  void black.offsetWidth;
  black.style.transition = 'opacity 320ms ease-in-out';
  requestAnimationFrame(function () {
    black.style.opacity = '1';
  });
  setTimeout(function () {
    // fully black — switch view underneath
    if (then) then();
    // brief hold, then fade out revealing destination
    setTimeout(function () {
      black.style.opacity = '0';
      setTimeout(function () {
        txOverlay.classList.remove('active');
        txOverlay.innerHTML = '';
        txBusy = false;
      }, 340);
    }, 80);
  }, 340);
}

function backToMenu() {
  if (txBusy || adBusy) return;
  const pageSnap = currentSnapshot();
  const fromView = currentView;
  // direct article (Fiction etc.) → ad interstitial
  // submenu → short black fade, no ad
  const needAd = (fromView === 'viewer' && article && article.mode !== 'ad' && article.mode !== 'ad-video');
  const fromSubmenu = (fromView === 'submenu');

  function go(adSrc) {
    viewSubmenu.style.display = 'none';
    viewViewer.style.display = 'none';
    viewMenu.style.display = 'block';
    currentView = 'menu';
    currentSubmenuId = null;
    submenuStack = [];
    article = null;
    isScrollMode = false;
    if (adSrc) {
      const newSnap = currentSnapshot();
      const fromSnap = makeSnap(adSrc, STAGE_H, 0);
      if (fromSnap && newSnap) runTransition(fromSnap, newSnap, 'prev', null);
    }
    // submenu path: fadeBlackBrief already covers transition
  }

  if (needAd) {
    showRandomAd(go);
  } else if (fromSubmenu) {
    fadeBlackBrief(function () { go(null); });
  } else {
    go(null);
  }
}

function backToSubmenu() {
  if (txBusy || adBusy) return;
  if (!currentSubmenuId) {
    backToMenu();
    return;
  }
  const pageSnap = currentSnapshot();
  const isAdArticle = article && (article.mode === 'ad' || article.mode === 'ad-video');

  function go(adSrc) {
    clearPageHotspots();
    closePopup();
    closeRightPanel();
    viewViewer.style.display = 'none';
    viewMenu.style.display = 'none';
    viewSubmenu.style.display = 'block';
    currentView = 'submenu';
    article = null;
    isScrollMode = false;
    const newSnap = currentSnapshot();
    const fromSnap = adSrc ? makeSnap(adSrc, STAGE_H, 0) : pageSnap;
    if (fromSnap && newSnap) runTransition(fromSnap, newSnap, 'prev', null);
  }

  if (isAdArticle) {
    // direct, no interstitial (same as working reklama behaviour)
    go(null);
  } else {
    showRandomAd(go);
  }
}

// ========== VIEWER / ARTICLES ==========
async function openNestedArticle(id) {
  if (txBusy || !article) return;
  // remember parent so ESC returns to the grid page
  nestedParent = {
    articleId: article.id,
    page: currentPage,
    music: article.music || null
  };
  try {
    const data = await loadArticle(id);
    const oldSnap = currentSnapshot();
    article = data;
    currentPage = 0;
    isScrollMode = article.mode === 'scroll';
    setupViewerMode();
    showPage(0);
    // same track (mk3.opus) — no restart
    if (article.music) playMusic(article.music);
    const newSnap = currentSnapshot();
    if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
  } catch (err) {
    console.error('[openNestedArticle]', id, err);
    nestedParent = null;
    playSfx('anim1.wav');
  }
}

async function openArticle(id, startPage) {
  nestedParent = null;
  if (txBusy) return;
  try {
    const data = await loadArticle(id);
    const oldSnap = currentSnapshot();

    article = data;
    if (article.mode === 'ad-video' && article.video) {
      viewMenu.style.display = 'none';
      viewSubmenu.style.display = 'none';
      viewViewer.style.display = 'block';
      currentView = 'viewer';
      isScrollMode = false;
      currentPage = 0;
      setupViewerMode();
      clearPageHotspots();
      pageImage.style.backgroundImage = 'none';
      edgeTop.classList.remove('active'); edgeTop.classList.add('inactive');
      edgeBottom.classList.remove('active'); edgeBottom.classList.add('inactive');
      if (article.music) playMusic(article.music);
      openLocalVideo(article.video, function () { backFromAd(); });
      return;
    }
    const start = (typeof startPage === 'number' && startPage >= 0 && startPage < (data.pages || []).length)
      ? startPage : 0;
    currentPage = start;
    isScrollMode = article.mode === 'scroll';
    viewMenu.style.display = 'none';
    viewSubmenu.style.display = 'none';
    viewViewer.style.display = 'block';
    currentView = 'viewer';
    setupViewerMode();
    showPage(start);
    if (article.music) playMusic(article.music);

    const newSnap = currentSnapshot();
    if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
  } catch (err) {
    console.error('[openArticle]', id, err);
    playSfx('anim1.wav');
  }
}

function setupViewerMode() {
  if (isScrollMode) {
    pageImage.style.display = 'none';
    edgeTop.style.display = 'none';
    edgeBottom.style.display = 'none';
    tallScroll.style.display = 'block';
  } else {
    pageImage.style.display = 'block';
    edgeTop.style.display = 'block';
    edgeBottom.style.display = 'block';
    tallScroll.style.display = 'none';
  }
}

function clearPageHotspots() {
  pageHotspotEls.forEach(function (el) { el.remove(); });
  pageHotspotEls = [];
}

let popupBusy = false;

function openPopupZoom(hs) {
  if (popupBusy) return;
  popupBusy = true;
  playSfx('anim1.wav');
  popupImage.style.backgroundImage = 'url("' + hs.popup + '")';
  // start at hotspot rect, animate to full stage
  popupImage.style.transition = 'none';
  popupImage.style.left = hs.x + 'px';
  popupImage.style.top = hs.y + 'px';
  popupImage.style.width = hs.w + 'px';
  popupImage.style.height = hs.h + 'px';
  popupImage.style.backgroundSize = '100% 100%';
  popupOverlay.style.background = 'rgba(0,0,0,0)';
  popupOverlay.classList.add('visible');
  // force reflow
  void popupImage.offsetWidth;
  popupImage.style.transition = 'left 1s ease, top 1s ease, width 1s ease, height 1s ease';
  popupOverlay.style.transition = 'background 1s ease';
  popupImage.style.left = '0px';
  popupImage.style.top = '0px';
  popupImage.style.width = '1600px';
  popupImage.style.height = '1200px';
  popupOverlay.style.background = 'rgba(0,0,0,0.85)';
  setTimeout(function () {
    popupBusy = false;
    popupImage.style.transition = '';
    popupOverlay.style.transition = '';
  }, 1050);
}

function closePopup() {
  if (popupBusy) return;
  popupOverlay.classList.remove('visible');
  popupImage.style.backgroundImage = 'none';
  popupImage.style.left = '0px';
  popupImage.style.top = '0px';
  popupImage.style.width = '1600px';
  popupImage.style.height = '1200px';
  popupImage.style.backgroundSize = '1600px 1200px';
  popupOverlay.style.background = 'rgba(0,0,0,0.85)';
}

function openVideo(srcOrObj) {
  closePanel();
  closePopup();
  var src = srcOrObj;
  var hasSound = true;
  var vw = 960, vh = 540;
  if (srcOrObj && typeof srcOrObj === 'object') {
    src = srcOrObj.src || '';
    hasSound = (srcOrObj.sound !== false);
    if (srcOrObj.width) vw = srcOrObj.width;
    if (srcOrObj.height) vh = srcOrObj.height;
  }
  // pause music only if video has sound (or always if unknown)
  if (hasSound) {
    try { music.pause(); } catch (e) {}
  }
  videoFrameWrap.innerHTML = '';
  // allow full iframe HTML by mistake — extract src
  if (src && typeof src === 'string' && src.indexOf('<iframe') !== -1) {
    const m = src.match(/src=["']([^"']+)["']/);
    if (m) src = m[1];
  }
  if (!src) return;
  // scale iframe to fit stage while preserving aspect
  var maxW = 1280, maxH = 720;
  var scale = Math.min(maxW / vw, maxH / vh, 1);
  var dispW = Math.round(vw * scale);
  var dispH = Math.round(vh * scale);
  videoFrameWrap.style.width = dispW + 'px';
  videoFrameWrap.style.height = dispH + 'px';
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.width = dispW;
  iframe.height = dispH;
  iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'no-referrer');
  videoFrameWrap.appendChild(iframe);
  videoOverlay.classList.add('visible');
}

function closeVideo() {
  if (!videoOverlay || !videoOverlay.classList.contains('visible')) return;
  videoOverlay.classList.remove('visible');
  if (videoFrameWrap) {
    videoFrameWrap.innerHTML = '';
    videoFrameWrap.style.width = '';
    videoFrameWrap.style.height = '';
    videoFrameWrap.style.boxShadow = '';
  }
  const cb = window._adVideoCb;
  window._adVideoCb = null;
  if (currentTrack) {
    music.play().catch(function () {});
  }
  if (cb) cb();
}

function backFromAd() {
  if (txBusy) return;
  const oldSnap = currentSnapshot();
  viewViewer.style.display = 'none';
  article = null;
  isScrollMode = false;
  currentPage = 0;
  clearPageHotspots();
  if (currentSubmenuId && SUBMENUS[currentSubmenuId]) {
    const conf = SUBMENUS[currentSubmenuId];
    submenuImg.src = conf.image;
    buildHotspots(submenuImage, conf.hotspots, onSubmenuClick);
    viewSubmenu.style.display = 'block';
    currentView = 'submenu';
  } else {
    viewMenu.style.display = 'block';
    currentView = 'menu';
    currentSubmenuId = null;
  }
  const newSnap = currentSnapshot();
  if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'prev', null);
}

function openLocalVideo(src, onEnd) {
  closePanel();
  closePopup();
  try { music.pause(); } catch (e) {}
  window._adVideoCb = onEnd || null;
  videoFrameWrap.innerHTML = '';
  // fullscreen for local webm ads
  videoFrameWrap.style.width = '1600px';
  videoFrameWrap.style.height = '1200px';
  videoFrameWrap.style.boxShadow = 'none';
  const vid = document.createElement('video');
  vid.src = src;
  vid.autoplay = true;
  vid.controls = false;
  vid.muted = true;
  vid.style.width = '1600px';
  vid.style.height = '1200px';
  vid.style.objectFit = 'contain';
  vid.style.background = '#000';
  vid.addEventListener('ended', function () {
    closeVideo();
  });
  videoFrameWrap.appendChild(vid);
  videoOverlay.classList.add('visible');
}

function showPage(idx) {
  if (!article || !article.pages || !article.pages[idx]) return;
  currentPage = idx;
  const page = article.pages[idx];
  clearPageHotspots();
  closePopup();
  closeVideo();

  if (isScrollMode) {
    const origW = page.width || 640;
    const origH = page.height || 1500;
    const dispW = Math.round(origW * 2.5);
    const dispH = Math.round(origH * 2.5);
    tallContent.style.width = dispW + 'px';
    tallContent.style.height = dispH + 'px';
    tallImage.style.width = dispW + 'px';
    tallImage.style.height = dispH + 'px';
    tallImage.style.backgroundImage = 'url("' + page.image + '")';
    tallImage.style.backgroundSize = dispW + 'px ' + dispH + 'px';
    tallScroll.scrollTop = 0;
  } else {
    pageImage.style.backgroundImage = 'url("' + page.image + '")';
    const isAd = article.mode === 'ad';
    const canPrev = !isAd && currentPage > 0;
    const canNext = currentPage < article.pages.length - 1;
    // ads: only forward for multi-page (technika); no prev; click returns
    edgeTop.classList.toggle('active', canPrev);
    edgeTop.classList.toggle('inactive', !canPrev);
    edgeBottom.classList.toggle('active', canNext);
    edgeBottom.classList.toggle('inactive', !canNext);

    (page.hotspots || []).forEach(function (hs) {
      const el = document.createElement('div');
      if (hs.video) el.className = 'page-hotspot video';
      else if (hs.popup) el.className = 'page-hotspot zoom';
      else if (hs.article) el.className = 'page-hotspot article';
      else el.className = 'page-hotspot';
      el.style.cssText = 'left:' + hs.x + 'px;top:' + hs.y + 'px;width:' + hs.w + 'px;height:' + hs.h + 'px';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (hs.video) {
          openVideo(hs.video);
        } else if (hs.popup) {
          openPopupZoom(hs);
        } else if (hs.article) {
          openNestedArticle(hs.article);
        }
      });
      viewViewer.appendChild(el);
      pageHotspotEls.push(el);
    });
  }
}

function goPage(dir) {
  if (txBusy || !article) return;
  const next = currentPage + dir;
  if (next < 0 || next >= article.pages.length) return;
  const oldSnap = currentSnapshot();
  showPage(next);
  const newSnap = currentSnapshot();
  if (oldSnap && newSnap) runTransition(oldSnap, newSnap, dir > 0 ? 'next' : 'prev', null);
}

edgeTop.addEventListener('click', function (e) {
  e.preventDefault();
  if (edgeTop.classList.contains('active')) goPage(-1);
});
edgeBottom.addEventListener('click', function (e) {
  e.preventDefault();
  if (edgeBottom.classList.contains('active')) goPage(1);
});

// Ad mode: click on page (not edges/hotspots) returns to submenu after last page,
// or advances multi-page ads
function handleAdClick(e) {
  if (!article || article.mode !== 'ad') return;
  if (currentView !== 'viewer') return;
  e.preventDefault();
  e.stopPropagation();
  if (currentPage < article.pages.length - 1) {
    goPage(1);
  } else {
    backFromAd();
  }
}
pageImage.addEventListener('click', handleAdClick);
viewViewer.addEventListener('click', handleAdClick);

// Tall scroll edge auto-scroll
const SCROLL_SPEED = 5.85;
const EDGE_ZONE = 0.05;
let tallRaf = null, tallDir = 0;
function tallScrollStep() {
  if (tallDir === 0) { tallRaf = null; return; }
  tallScroll.scrollTop += tallDir * SCROLL_SPEED;
  if (tallScroll.scrollTop < 0) tallScroll.scrollTop = 0;
  const max = tallScroll.scrollHeight - tallScroll.clientHeight;
  if (tallScroll.scrollTop > max) tallScroll.scrollTop = max;
  tallRaf = requestAnimationFrame(tallScrollStep);
}
tallScroll.addEventListener('mousemove', function (e) {
  if (currentView !== 'viewer' || !isScrollMode) return;
  const rect = tallScroll.getBoundingClientRect();
  const y = e.clientY - rect.top, h = rect.height, edge = h * EDGE_ZONE;
  if (y <= edge) {
    if (tallDir !== -1) { tallDir = -1; if (!tallRaf) tallRaf = requestAnimationFrame(tallScrollStep); }
  } else if (y >= h - edge) {
    if (tallDir !== 1) { tallDir = 1; if (!tallRaf) tallRaf = requestAnimationFrame(tallScrollStep); }
  } else {
    tallDir = 0;
  }
});
tallScroll.addEventListener('mouseleave', function () {
  tallDir = 0;
});
// Wheel scroll works natively on tallScroll (overflow:auto)

popupHit.addEventListener('click', function (e) {
  e.preventDefault();
  closePopup();
});

videoOverlay.addEventListener('click', function (e) {
  // close only when clicking the dark area, not the iframe itself
  if (e.target === videoOverlay) {
    e.preventDefault();
    closeVideo();
  }
});
// also stop propagation from the frame wrap so clicks on player don't bubble as "outside"
videoFrameWrap.addEventListener('click', function (e) {
  e.stopPropagation();
});

// ========== LEFT / RIGHT PANELS ==========
const PANEL_W = 235;
const RIGHT_PANEL_W = 248;
const SLIDER_TOP = 261;
const SLIDER_BOT = 774;
const SLIDER_W = 40;
const SLIDER_H = 14;
const SLIDER_Y_NUDGE = 6;

const leftPanel = document.getElementById('left-panel');
const rightPanel = document.getElementById('right-panel');
const sliderSfx = document.getElementById('sliderSfx');
const sliderMusic = document.getElementById('sliderMusic');

function cursorHidden() {
  return overlayMode !== null || txBusy || popupOverlay.classList.contains('visible') || videoOverlay.classList.contains('visible');
}

function volToY(vol) {
  return SLIDER_TOP + (1 - vol) * (SLIDER_BOT - SLIDER_TOP);
}
function yToVol(y) {
  const t = (y - SLIDER_TOP) / (SLIDER_BOT - SLIDER_TOP);
  return Math.max(0, Math.min(1, 1 - t));
}
function placeSlider(el, centerX, vol) {
  const cy = volToY(vol) + SLIDER_Y_NUDGE;
  el.style.left = (centerX - SLIDER_W / 2) + 'px';
  el.style.top = (cy - SLIDER_H / 2) + 'px';
  el.style.width = SLIDER_W + 'px';
  el.style.height = SLIDER_H + 'px';
  el.style.backgroundSize = SLIDER_W + 'px 14px';
}
function updateSliderPositions() {
  placeSlider(sliderMusic, 120, musicVol);
  placeSlider(sliderSfx, 175, sfxVol);
}
updateSliderPositions();

function openLeftPanel() {
  if (cursorHidden() || leftPanelOpen) return;
  leftPanel.classList.add('open');
  leftPanelOpen = true;
}
function closeLeftPanel() {
  if (!leftPanelOpen) return;
  leftPanel.classList.remove('open');
  leftPanelOpen = false;
  draggingSlider = null;
}
function openRightPanel() {
  if (cursorHidden() || rightPanelOpen) return;
  if (currentView !== 'viewer') return;
  buildPgBtns();
  rightPanel.classList.add('open');
  rightPanelOpen = true;
}
function closeRightPanel() {
  if (!rightPanelOpen) return;
  rightPanel.classList.remove('open');
  rightPanelOpen = false;
  resetPgBtns();
}
function closePanel() {
  closeLeftPanel();
  closeRightPanel();
}

const PG_BTNS = {
  '1': { x: 40, y: 255, w: 108, h: 63 },
  '2': { x: 41, y: 328, w: 107, h: 73 },
  '3': { x: 41, y: 401, w: 107, h: 73 },
  '4': { x: 41, y: 473, w: 107, h: 73 },
  '5': { x: 41, y: 546, w: 107, h: 73 },
  '6': { x: 41, y: 618, w: 107, h: 73 },
  '7': { x: 41, y: 691, w: 107, h: 73 },
  '8': { x: 41, y: 763, w: 107, h: 73 },
  '9': { x: 41, y: 836, w: 107, h: 73 },
  '0': { x: 41, y: 908, w: 107, h: 73 },
  '-': { x: 41, y: 981, w: 107, h: 73 }
};
let pgBtnEls = {};
let pgMulti = false;
let pgFirstDigit = null;

function pageCount() {
  if (!article || !article.pages) return 0;
  return article.pages.length;
}

function setPgBtnState(key, on) {
  const el = pgBtnEls[key];
  if (!el) return;
  const name = (key === '-') ? 'btn-' : ('btn' + key);
  el.style.backgroundImage = 'url("../../shared/img/' + name + (on ? '_on' : '_off') + '.webp")';
}

function resetPgBtns() {
  pgMulti = false;
  pgFirstDigit = null;
  Object.keys(pgBtnEls).forEach(function (k) { setPgBtnState(k, false); });
}

function clearPgBtns() {
  Object.keys(pgBtnEls).forEach(function (k) { pgBtnEls[k].remove(); });
  pgBtnEls = {};
  pgMulti = false;
  pgFirstDigit = null;
}

function buildPgBtns() {
  clearPgBtns();
  const n = pageCount();
  if (n < 1) return;
  const multi = n >= 10;
  let keys = [];
  if (multi) {
    keys = ['1','2','3','4','5','6','7','8','9','0','-'];
  } else {
    for (let i = 1; i <= n; i++) keys.push(String(i));
  }
  keys.forEach(function (key) {
    const spec = PG_BTNS[key];
    if (!spec) return;
    const el = document.createElement('div');
    el.className = 'pg-btn';
    el.dataset.key = key;
    el.style.left = spec.x + 'px';
    el.style.top = spec.y + 'px';
    el.style.width = spec.w + 'px';
    el.style.height = spec.h + 'px';
    const name = (key === '-') ? 'btn-' : ('btn' + key);
    el.style.backgroundImage = 'url("../../shared/img/' + name + '_off.webp")';
    el.style.backgroundSize = spec.w + 'px ' + spec.h + 'px';
    el.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      onPgBtn(key);
    });
    rightPanel.appendChild(el);
    pgBtnEls[key] = el;
  });
}

function jumpToPageNum(num1based) {
  const n = pageCount();
  if (num1based < 1 || num1based > n) {
    resetPgBtns();
    return;
  }
  const idx = num1based - 1;
  if (idx === currentPage) {
    resetPgBtns();
    return;
  }
  const oldSnap = currentSnapshot();
  const oldIdx = currentPage;
  showPage(idx);
  const newSnap = currentSnapshot();
  resetPgBtns();
  closeRightPanel();
  if (oldSnap && newSnap) runTransition(oldSnap, newSnap, idx > oldIdx ? 'next' : 'prev', null);
}

function onPgBtn(key) {
  const n = pageCount();
  if (n < 1) return;
  if (n < 10) {
    if (key === '-' || key === '0') return;
    jumpToPageNum(parseInt(key, 10));
    return;
  }
  if (key === '-') {
    if (pgMulti) { resetPgBtns(); return; }
    pgMulti = true;
    pgFirstDigit = null;
    setPgBtnState('-', true);
    return;
  }
  if (!pgMulti) {
    const num = (key === '0') ? 10 : parseInt(key, 10);
    if (num <= n) jumpToPageNum(num);
    else resetPgBtns();
    return;
  }
  if (pgFirstDigit === null) {
    pgFirstDigit = key;
    setPgBtnState(key, true);
    return;
  }
  jumpToPageNum(parseInt(pgFirstDigit + key, 10));
}

stage.addEventListener('mousemove', function (e) {
  if (cursorHidden()) { closeLeftPanel(); closeRightPanel(); return; }
  if (draggingSlider) return;
  const rect = stage.getBoundingClientRect();
  const scale = rect.width / STAGE_W;
  const x = (e.clientX - rect.left) / scale;

  if (!leftPanelOpen) {
    if (x <= STAGE_W * 0.05) openLeftPanel();
  } else {
    if (x > PANEL_W + STAGE_W * 0.05) closeLeftPanel();
  }

  if (currentView === 'viewer') {
    if (!rightPanelOpen) {
      if (x >= STAGE_W * (1 - 0.05)) openRightPanel();
    } else {
      if (x < STAGE_W - RIGHT_PANEL_W - STAGE_W * 0.05) closeRightPanel();
    }
  } else {
    closeRightPanel();
  }
});

function onSliderDown(which, e) {
  e.preventDefault(); e.stopPropagation();
  draggingSlider = which;
}
sliderSfx.addEventListener('mousedown', function (e) { onSliderDown('sfx', e); });
sliderMusic.addEventListener('mousedown', function (e) { onSliderDown('music', e); });

document.addEventListener('mousemove', function (e) {
  if (!draggingSlider) return;
  const rect = stage.getBoundingClientRect();
  const scale = rect.height / STAGE_H;
  const y = (e.clientY - rect.top) / scale;
  const cy = Math.max(SLIDER_TOP, Math.min(SLIDER_BOT, y - SLIDER_Y_NUDGE));
  const vol = yToVol(cy);
  if (draggingSlider === 'sfx') {
    setSfxVolume(vol);
    placeSlider(sliderSfx, 175, sfxVol);
  } else {
    setMusicVolume(vol);
    placeSlider(sliderMusic, 120, musicVol);
  }
});
document.addEventListener('mouseup', function () {
  draggingSlider = null;
});

// Overlay screens
function showOverlay(url, mode) {
  closePanel();
  overlayMode = mode;
  overlayScreen.style.backgroundImage = 'url("' + url + '")';
  overlayScreen.setAttribute('draggable', 'false');
  overlayScreen.style.display = 'block';
  overlayScreen.style.opacity = '0';
  void overlayScreen.offsetWidth;
  overlayScreen.classList.add('visible');
  overlayScreen.style.opacity = '1';
}
function hideOverlay() {
  if (!overlayMode) return;
  const wasBoss = (overlayMode === 'boss');
  overlayScreen.style.opacity = '0';
  setTimeout(function () {
    overlayScreen.classList.remove('visible');
    overlayScreen.style.display = 'none';
    overlayScreen.style.backgroundImage = 'none';
    overlayMode = null;
    if (wasBoss && currentTrack) {
      music.play().catch(function () {});
    }
  }, 400);
}
overlayScreen.addEventListener('click', function (e) {
  e.preventDefault();
  if (overlayMode === 'exit') return;
  hideOverlay();
});

function openHelp() {
  if (cursorHidden() && overlayMode !== 'help') return;
  if (overlayMode === 'help') return;
  showOverlay('assets/img/content/help.webp', 'help');
}
document.getElementById('btnHelp').addEventListener('click', function (e) {
  e.preventDefault(); e.stopPropagation();
  openHelp();
});
document.getElementById('btnBoss').addEventListener('click', function (e) {
  e.preventDefault(); e.stopPropagation();
  showOverlay('assets/img/content/boss.webp', 'boss');
  try { music.pause(); } catch (err) {}
});
document.getElementById('btnOs').addEventListener('click', function (e) {
  e.preventDefault(); e.stopPropagation();
  playSfx('exit.wav');
  closePanel();
  startSplashSequence();
});

// Hierarchical back: right-click / ESC

// ========== RANDOM AD INTERSTITIAL ON BACK ==========
const AD_POOL = [
  { type: 'img', src: 'assets/img/content/wcw.webp' },
  { type: 'img', src: 'assets/img/content/compul.webp' },
  { type: 'img', src: 'assets/img/content/gl.webp' },
  { type: 'img', src: 'assets/img/content/adv_sol.webp' },
  { type: 'img', src: 'assets/img/content/adv_podp.webp' },
  { type: 'img', src: 'assets/img/content/adv_publ.webp' },
  { type: 'img', src: 'assets/img/content/compass.webp' },
  { type: 'img', src: 'assets/img/content/wings.webp' },
  { type: 'img', src: 'assets/img/content/mult96.webp' },
  { type: 'img', src: 'assets/img/content/pulse.webp' },
  { type: 'img', src: 'assets/img/content/buka.webp', interactive: true },
  { type: 'img', src: 'assets/img/content/1_tm.webp' },
  { type: 'img', src: 'assets/img/content/2_tm.webp' }
];
const BUKA_AD_HOTSPOTS = [{"x": 882, "y": 2, "w": 358, "h": 258, "popup": "assets/img/content/buka-screen1.webp"}, {"x": 1240, "y": 2, "w": 358, "h": 258, "popup": "assets/img/content/buka-screen2.webp"}, {"x": 882, "y": 255, "w": 358, "h": 258, "popup": "assets/img/content/buka-screen3.webp"}, {"x": 1240, "y": 255, "w": 358, "h": 258, "popup": "assets/img/content/buka-screen4.webp"}, {"x": 882, "y": 508, "w": 358, "h": 258, "popup": "assets/img/content/buka-screen5.webp"}, {"x": 1238, "y": 508, "w": 358, "h": 258, "popup": "assets/img/content/buka-screen6.webp"}];

let adBusy = false;
let adOnDone = null;
let adCurrentSrc = null;

function hideAdInterstitial() {
  if (!adBusy) return;
  const cb = adOnDone;
  adOnDone = null;
  // Keep ad fully visible (covers source). Callback switches to destination
  // underneath and starts transition FROM ad image. Then drop ad overlay.
  const adSrc = adCurrentSrc;
  adCurrentSrc = null;
  adBusy = false;
  adInteractive = false;
  clearAdHotspots();
  if (cb) cb(adSrc);
  // Remove ad only after transition layer is up (or immediately if no tx)
  setTimeout(function () {
    adInterstitial.classList.remove('visible');
    adInterstitial.style.opacity = '';
    adInterstitial.style.transition = '';
    adInterstitialImg.style.display = 'none';
    adInterstitialImg.style.backgroundImage = 'none';
    adInterstitialVid.style.display = 'none';
    try {
      adInterstitialVid.pause();
      adInterstitialVid.removeAttribute('src');
      adInterstitialVid.load();
    } catch (e) {}
  }, 50);
}

let adInteractive = false;

function clearAdHotspots() {
  const nodes = adInterstitial.querySelectorAll('.ad-hotspot');
  nodes.forEach(function (n) { n.remove(); });
}

function buildBukaAdHotspots() {
  clearAdHotspots();
  BUKA_AD_HOTSPOTS.forEach(function (hs) {
    const el = document.createElement('div');
    el.className = 'ad-hotspot page-hotspot zoom';
    el.style.cssText = 'left:' + hs.x + 'px;top:' + hs.y + 'px;width:' + hs.w + 'px;height:' + hs.h + 'px;position:absolute;z-index:10;pointer-events:auto;';
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openPopupZoom(hs);
    });
    adInterstitial.appendChild(el);
  });
}

function showRandomAd(onDone) {
  if (adBusy) { if (onDone) onDone(null); return; }
  adBusy = true;
  adInteractive = false;
  adOnDone = onDone || null;
  const ad = AD_POOL[Math.floor(Math.random() * AD_POOL.length)];
  adCurrentSrc = ad.src;
  clearAdHotspots();

  // Overlay is solid black immediately — source page never shows through
  adInterstitial.style.opacity = '1';
  adInterstitial.style.transition = '';
  adInterstitial.classList.add('visible');
  adInterstitialImg.style.display = 'none';
  adInterstitialVid.style.display = 'none';
  adInterstitialImg.style.opacity = '0';
  adInterstitialImg.style.transition = 'opacity 0.35s ease';

  if (ad.type === 'vid') {
    adInterstitialVid.src = ad.src;
    adInterstitialVid.muted = true;
    adInterstitialVid.loop = false;
    adInterstitialVid.style.opacity = '0';
    adInterstitialVid.style.transition = 'opacity 0.35s ease';
    adInterstitialVid.style.display = 'block';
    adInterstitialVid.style.width = '1600px';
    adInterstitialVid.style.height = '1200px';
    adInterstitialVid.style.objectFit = 'contain';
    requestAnimationFrame(function () {
      adInterstitialVid.style.opacity = '1';
      const p = adInterstitialVid.play();
      if (p && p.catch) p.catch(function () {});
    });
    adInterstitialVid.onended = function () { hideAdInterstitial(); };
  } else {
    adInterstitialImg.style.backgroundImage = 'url("' + ad.src + '")';
    adInterstitialImg.style.display = 'block';
    requestAnimationFrame(function () {
      adInterstitialImg.style.opacity = '1';
    });
    if (ad.interactive) {
      adInteractive = true;
      buildBukaAdHotspots();
      // buka: no auto-close, only ESC / RMB
    } else {
      setTimeout(function () {
        if (adBusy && adCurrentSrc === ad.src && !adInteractive) hideAdInterstitial();
      }, 3500);
    }
  }
}

adInterstitial.addEventListener('click', function (e) {
  e.preventDefault();
  e.stopPropagation();
  if (!adBusy) return;
  // interactive buka: ignore plain clicks (screens handled by hotspots)
  if (adInteractive) return;
  hideAdInterstitial();
});

function hierarchicalBack() {
  if (txBusy) return;
  if (adBusy) {
    hideAdInterstitial();
    return;
  }
  if (videoOverlay.classList.contains('visible')) {
    closeVideo();
    return;
  }
  if (popupOverlay.classList.contains('visible')) {
    closePopup();
    return;
  }
  if (currentView === 'viewer') {
    if (nestedParent) {
      const parent = nestedParent;
      nestedParent = null;
      // reopen parent article at the saved page
      (async function () {
        try {
          const data = await loadArticle(parent.articleId);
          const oldSnap = currentSnapshot();
          article = data;
          currentPage = parent.page;
          isScrollMode = article.mode === 'scroll';
          setupViewerMode();
          showPage(parent.page);
          if (article.music) playMusic(article.music);
          const newSnap = currentSnapshot();
          if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'prev', null);
        } catch (err) {
          console.error('[back nested]', err);
          backToSubmenu();
        }
      })();
      return;
    }
    backToSubmenu();
    return;
  }
  if (currentView === 'submenu') {
    if (submenuStack.length > 0) {
      const parentId = submenuStack.pop();
      // reopen parent without pushing current onto stack
      const conf = SUBMENUS[parentId];
      if (!conf) { backToMenu(); return; }
      const oldSnap = currentSnapshot();
      currentSubmenuId = parentId;
      submenuImg.src = conf.image;
      buildHotspots(submenuImage, conf.hotspots, onSubmenuClick);
      viewMenu.style.display = 'none';
      viewViewer.style.display = 'none';
      viewSubmenu.style.display = 'block';
      currentView = 'submenu';
      const newSnap = currentSnapshot();
      if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'prev', null);
      return;
    }
    backToMenu();
    return;
  }
  playSfx('exit.wav');
  startSplashSequence();
}

document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  hierarchicalBack();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'F1') {
    e.preventDefault();
    openHelp();
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    if (overlayMode === 'help' || overlayMode === 'boss') {
      hideOverlay();
      return;
    }
    hierarchicalBack();
  }
});

document.addEventListener('dragstart', function (e) { e.preventDefault(); });
document.addEventListener('mousedown', function (e) {
  if (e.button === 1) e.preventDefault();
});

document.addEventListener('click', function once() {
  if (currentTrack && music.paused) music.play().catch(function () {});
}, { once: true });

// ========== SPLASH (once per session, unique key) ==========
const SPLASH_KEY = 'sbg-1996-05-splash';
let splashStep = 0; // 0=idle, 1=splash.webp, 2=compul.webp
let splashBusy = false;

function setSplashBg(url) {
  splashImg.style.backgroundImage = url ? 'url("' + url + '")' : 'none';
}

function fadeSplashTo(url, then) {
  splashBusy = true;
  splashImg.style.opacity = '0';
  setTimeout(function () {
    setSplashBg(url);
    void splashImg.offsetWidth;
    splashImg.style.opacity = '1';
    setTimeout(function () {
      splashBusy = false;
      if (then) then();
    }, 450);
  }, 450);
}

function enterMenuFromSplash() {
  splashStep = 0;
  splashOverlay.classList.remove('visible');
  setSplashBg(null);
  splashImg.style.opacity = '1';
  viewMenu.style.display = 'block';
  currentView = 'menu';
  if (!currentTrack) playMusic('intro.opus');
}

function startSplashSequence() {
  viewMenu.style.display = 'none';
  viewSubmenu.style.display = 'none';
  viewViewer.style.display = 'none';
  currentView = 'splash';
  splashStep = 1;
  splashBusy = false;
  setSplashBg('assets/img/content/splash.webp');
  splashImg.style.opacity = '1';
  splashOverlay.classList.add('visible');
  playMusic('intro.opus');
}

function advanceSplash() {
  if (splashBusy || splashStep === 0) return;
  if (splashStep === 1) {
    splashStep = 2;
    fadeSplashTo('assets/img/content/compul.webp', null);
  } else if (splashStep === 2) {
    splashBusy = true;
    splashImg.style.opacity = '0';
    setTimeout(function () {
      enterMenuFromSplash();
      splashBusy = false;
    }, 450);
  }
}

const splashHit = document.getElementById('splashHit');
splashHit.addEventListener('click', function (e) {
  e.preventDefault();
  e.stopPropagation();
  advanceSplash();
});
splashHit.addEventListener('mousedown', function (e) { e.preventDefault(); });
splashOverlay.addEventListener('contextmenu', function (e) { e.preventDefault(); });
splashOverlay.addEventListener('dragstart', function (e) { e.preventDefault(); });
overlayScreen.addEventListener('contextmenu', function (e) { e.preventDefault(); });
overlayScreen.addEventListener('dragstart', function (e) { e.preventDefault(); });
overlayScreen.addEventListener('mousedown', function (e) { e.preventDefault(); });

try {
  if (!sessionStorage.getItem(SPLASH_KEY)) {
    sessionStorage.setItem(SPLASH_KEY, '1');
    startSplashSequence();
  } else {
    if (!currentTrack) playMusic('intro.opus');
  }
} catch (err) {
  startSplashSequence();
}

warmArticleCache();

})();
