(function () {
const STAGE_W = 1600, STAGE_H = 1200;
const SOUND_BASE = '../../shared/sound/';
const MUSIC_BASE = 'https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/music/sbg-gem/1996/04/';
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
    return makeSnap('assets/img/content/contmine.webp', STAGE_H, 0);
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
const MENU_HOTSPOTS = [
  { id: 'ot-redakcii',      label: 'ОТ РЕДАКЦИИ',           x: 225, y: 20,   w: 650, h: 40 },
  { id: 'internet-top-100', label: 'INTERNET TOP 100',      x: 225, y: 78,   w: 650, h: 38 },
  { id: 'novosti',          label: 'НОВОСТИ',               x: 225, y: 138,  w: 650, h: 40 },
  { id: 'v-proekte',        label: 'В ПРОЕКТЕ',             x: 225, y: 192,  w: 650, h: 38 },
  { id: 'tema-nomera',      label: 'ТЕМА НОМЕРА',           x: 225, y: 252,  w: 650, h: 40 },
  { id: 'hardware',         label: 'HARDWARE',              x: 225, y: 310,  w: 650, h: 40 },
  { id: 'action',           label: 'ACTION',                x: 225, y: 368,  w: 650, h: 40 },
  { id: 'arcade',           label: 'ARCADE',                x: 225, y: 425,  w: 650, h: 38 },
  { id: 'adventure',        label: 'ADVENTURE',             x: 225, y: 482,  w: 650, h: 38 },
  { id: 'rpg',              label: 'RPG',                   x: 225, y: 542,  w: 650, h: 40 },
  { id: 'logic',            label: 'LOGIC',                 x: 225, y: 600,  w: 650, h: 38 },
  { id: 'simulations',      label: 'SIMULATIONS',           x: 225, y: 660,  w: 650, h: 40 },
  { id: 'strategy',         label: 'STRATEGY',              x: 225, y: 718,  w: 650, h: 40 },
  { id: 'sports',           label: 'SPORTS',                x: 225, y: 775,  w: 650, h: 38 },
  { id: 'education',        label: 'EDUCATION',             x: 225, y: 835,  w: 650, h: 40 },
  { id: 'staroe-dobroe',    label: 'СТАРОЕ-ДОБРОЕ',         x: 225, y: 895,  w: 650, h: 38 },
  { id: 'cheats',           label: 'CHEATS',                x: 225, y: 952,  w: 650, h: 38 },
  { id: 'fiction',          label: 'FICTION',               x: 225, y: 1012, w: 650, h: 40 },
  { id: 'goroskop',         label: 'ГОРОСКОП',              x: 225, y: 1070, w: 650, h: 38 },
  { id: 'reklama',          label: 'РЕКЛАМА',               x: 225, y: 1130, w: 650, h: 40 }
];

// Submenus that open from main menu (id → config)
const SUBMENUS = {
  'ot-redakcii': {
    image: 'assets/img/content/edit.webp',
    hotspots: [
      { id: 'ot-redakcii',      label: 'От редакции',                                      x: 580, y: 408, w: 428,  h: 58  },
      { id: 'email',            label: 'E-mail: Открытое письмо к редактору',              x: 150, y: 520, w: 1290, h: 58  },
      { id: 'stop-rpg-suicide', label: 'Остановите самоубийства любителей RPG!',           x: 65,  y: 630, w: 1455, h: 58  },
      { id: 'credits',          label: 'Credits',                                          x: 678, y: 745, w: 232,  h: 45  },
      { id: 'dist-sites',       label: 'Dist Sites',                                       x: 635, y: 858, w: 315,  h: 45  },
      { id: 'where-to-buy',     label: 'Список фирм, в которых можно приобрести SBG Magazine', x: 242, y: 972, w: 1102, h: 122 }
    ]
  },
  'novosti': {
    image: 'assets/img/content/news.webp',
    hotspots: [
      { id: 'game-news',    label: 'Game News',    x: 565, y: 612, w: 448, h: 55 },
      { id: 'company-news', label: 'Company News', x: 492, y: 750, w: 592, h: 70 }
    ]
  },
  'v-proekte': {
    image: 'assets/img/content/proj.webp',
    hotspots: [
      { id: 'wing-commander-4', label: 'Wing Commander IV - почем фунт свободы?', x: 95,  y: 580, w: 1405, h: 58 },
      { id: 'star-control-3',   label: 'Star Control 3',                         x: 578, y: 692, w: 440,  h: 45 },
      { id: 'terra-nova',       label: 'Terra Nova: Strike Force Centauri',      x: 275, y: 805, w: 1048, h: 45 }
    ]
  },
  'tema-nomera': {
    image: 'assets/img/content/nomer.webp',
    hotspots: [
      { id: 'zone-raiders',     label: 'Zone Raiders', x: 575, y: 455, w: 450,  h: 55 },
      { id: 'indycar-racing-2', label: 'IndyCar Racing II', x: 140, y: 575, w: 1308, h: 110 },
      { id: 'destruction-derby', label: 'Destruction Derby', x: 545, y: 748, w: 498, h: 48 },
      { id: 'need-for-speed',   label: 'Need for Speed', x: 172, y: 858, w: 1240, h: 50 },
      { id: 'fatal-racing',     label: 'Fatal Racing', x: 155, y: 970, w: 1275, h: 50 }
    ]
  },
  'hardware': {
    image: 'assets/img/content/hardw.webp',
    hotspots: [
      { id: 'advanced-gravis', label: 'Advanced Gravis', x: 235, y: 548, w: 1100, h: 118 },
      { id: 'vr-systems',      label: 'Обзор систем виртуальной реальности', x: 245, y: 808, w: 1082, h: 118 }
    ]
  },
  'action': {
    image: 'assets/img/content/action.webp',
    hotspots: [
      { id: 'crusader',    label: 'Crusader: No Remorse', x: 418, y: 462, w: 748,  h: 48 },
      { id: 'tekwar',      label: 'TekWar', x: 670, y: 575, w: 245,  h: 48 },
      { id: 'terminator',  label: 'Terminator: Future Shock', x: 362, y: 688, w: 855, h: 48 },
      { id: 'wetlands',    label: 'WetLands', x: 632, y: 800, w: 315, h: 48 },
      { id: 'mk3-guide',   label: 'НЕ краткое руководство Mortal Kombat 3', x: 272, y: 922, w: 1035, h: 115 }
    ]
  },
  'arcade': {
    image: 'assets/img/content/arcade.webp',
    hotspots: [
      { id: 'ultra-pinball', label: 'Ultra Pinball', x: 155, y: 498, w: 1302, h: 60 },
      { id: 'brain-dead-13', label: 'Brain Dead 13', x: 100, y: 628, w: 1425, h: 120 },
      { id: 'hellfire',      label: 'Hellfire', x: 165, y: 818, w: 1278, h: 50 },
      { id: 'earthworm-jim', label: 'EarthWorm Jim', x: 242, y: 930, w: 1128, h: 58 }
    ]
  },
  'adventure': {
    image: 'assets/img/content/advent.webp',
    hotspots: [
      { id: 'the-dig', label: 'The Dig', x: 228, y: 432, w: 1132, h: 48 },
      { id: 'dust', label: 'Dust: A Tale of the Wired West', x: 80, y: 520, w: 1428, h: 48 },
      { id: 'torins-passage', label: "Torin's Passage", x: 180, y: 608, w: 1228, h: 48 },
      { id: 'touche', label: 'Touche', x: 225, y: 695, w: 1138, h: 38 },
      { id: 'the-dig-solution', label: 'The Dig - solution', x: 572, y: 782, w: 442, h: 48 },
      { id: 'phantasmagoria-solution', label: 'Phantasmagoria - solution', x: 470, y: 870, w: 645, h: 48 },
      { id: 'no-mouth-solution', label: 'I Have No Mouth - solution', x: 215, y: 958, w: 1158, h: 38 },
      { id: 'teenagent-solution', label: 'TeenAgent - solution', x: 538, y: 1045, w: 510, h: 48 }
    ]
  },
  'rpg': {
    image: 'assets/img/content/rpg.webp',
    hotspots: [
      { id: 'homm-intro', label: 'Знакомтесь - Heroes of Might and Magic', x: 125, y: 570, w: 1358, h: 58 },
      { id: 'homm-guide', label: 'Heroes of Might and Magic - Путь к победе', x: 80, y: 682, w: 1448, h: 58 },
      { id: 'celtic-tales', label: 'Celtic Tales: Balor of Evil Eye', x: 312, y: 795, w: 982, h: 55 }
    ]
  },
  'logic': {
    image: 'assets/img/content/logic.webp',
    hotspots: [
      { id: 'draks', label: 'Draks', x: 158, y: 565, w: 1282, h: 58 },
      { id: 'tim3', label: 'The Incredible Machine 3', x: 378, y: 678, w: 838, h: 45 },
      { id: 'worms', label: 'Worms', x: 110, y: 790, w: 1378, h: 58 }
    ]
  },
  'simulations': {
    image: 'assets/img/content/simulat.webp',
    hotspots: [
      { id: 'comanche', label: 'Commanche против Werewolf', x: 208, y: 608, w: 1178, h: 70 },
      { id: 'air-power', label: 'Air Power', x: 600, y: 748, w: 388, h: 52 }
    ]
  },
  'strategy': {
    image: 'assets/img/content/strateg.webp',
    hotspots: [
      { id: 'aiv-network', label: 'A-IV Network$', x: 400, y: 500, w: 800, h: 50 },
      { id: 'power-house', label: 'Power House', x: 420, y: 612, w: 760, h: 50 },
      { id: 'caesar-ii', label: 'Caesar II', x: 450, y: 725, w: 700, h: 50 },
      { id: 'motor-city', label: 'Motor City', x: 430, y: 838, w: 740, h: 50 }
    ]
  },
  'cheats': {
    image: 'assets/img/content/cheats.webp',
    hotspots: [
      { id: 'cheats', label: 'Rebel Assault II',     page: 0, x: 600, y: 388, w: 365, h: 35 },
      { id: 'cheats', label: 'Crusader: No Remorse', page: 1, x: 515, y: 452, w: 530, h: 35 },
      { id: 'cheats', label: 'Hexen',                page: 1, x: 710, y: 518, w: 142, h: 35 },
      { id: 'cheats', label: 'Tyrian',               page: 2, x: 708, y: 582, w: 145, h: 42 },
      { id: 'cheats', label: 'Witchaven',            page: 3, x: 660, y: 648, w: 240, h: 35 },
      { id: 'cheats', label: 'Mechwarrior 2',        page: 4, x: 610, y: 712, w: 340, h: 35 },
      { id: 'cheats', label: 'Magic Carpet 2',       page: 6, x: 600, y: 778, w: 360, h: 45 },
      { id: 'cheats', label: 'TekWar',               page: 6, x: 692, y: 842, w: 178, h: 35 },
      { id: 'cheats', label: 'WarCraft II',          page: 7, x: 652, y: 908, w: 258, h: 35 },
      { id: 'cheats', label: 'Need for Speed',       page: 8, x: 600, y: 972, w: 362, h: 42 },
      { id: 'cheats', label: 'Hi Octane',            page: 8, x: 665, y: 1038, w: 232, h: 35 },
      { id: 'cheats', label: 'Duke Nukem 3D',        page: 9, x: 588, y: 1102, w: 388, h: 35 }
    ]
  },
  'reklama': {
    image: 'assets/img/content/marketing.webp',
    hotspots: [
      { id: 'anigraf-96', label: "Аниграф'96", x: 635, y: 375, w: 285, h: 40 },
      { id: 'pc-world', label: 'Весь Компьютерный Мир', x: 490, y: 458, w: 585, h: 40 },
      { id: 'compulink', label: 'COMPULINK', x: 635, y: 550, w: 288, h: 32 },
      { id: 'game-land', label: 'Game Land', x: 652, y: 630, w: 248, h: 32 },
      { id: 'hard-n-soft', label: "HARD 'n' SOFT", x: 605, y: 708, w: 348, h: 32 },
      { id: 'kompas', label: 'КомпАс', x: 690, y: 778, w: 172, h: 32 },
      { id: 'redwave', label: 'Красная Волна', x: 600, y: 848, w: 348, h: 40 },
      { id: 'tecnology', label: 'Технология, АТЛАНТИС, TELETRADE', x: 495, y: 918, w: 560, h: 82 },
      { id: 'technika-molodezhi', label: 'Техника - Молодежи', x: 542, y: 1038, w: 468, h: 35 },
      { id: 'sbg-magazine', label: 'SBG Magazine', x: 618, y: 1110, w: 320, h: 40 }
    ]
  }
};

// Articles ready to open from submenu (or directly)
const READY_ARTICLES = ['ot-redakcii', 'email', 'stop-rpg-suicide', 'credits', 'dist-sites', 'where-to-buy', 'internet-top-100', 'game-news', 'company-news', 'wing-commander-4', 'star-control-3', 'terra-nova', 'zone-raiders', 'indycar-racing-2', 'destruction-derby', 'need-for-speed', 'fatal-racing', 'advanced-gravis', 'vr-systems', 'crusader', 'tekwar', 'terminator', 'wetlands', 'mk3-guide', 'ultra-pinball', 'brain-dead-13', 'hellfire', 'earthworm-jim', 'the-dig', 'dust', 'torins-passage', 'touche', 'the-dig-solution', 'phantasmagoria-solution', 'no-mouth-solution', 'teenagent-solution', 'homm-intro', 'homm-guide', 'celtic-tales', 'draks', 'tim3', 'worms', 'comanche', 'air-power', 'aiv-network', 'power-house', 'caesar-ii', 'motor-city', 'sports', 'education', 'staroe-dobroe', 'cheats', 'fiction', 'goroskop', 'anigraf-96', 'pc-world', 'compulink', 'game-land', 'hard-n-soft', 'kompas', 'redwave', 'tecnology', 'technika-molodezhi', 'sbg-magazine'];

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
    const resp = await fetch('assets/data/articles/' + id + '.json');
    if (!resp.ok) throw new Error('not found: ' + id);
    const data = await resp.json();
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
    const resp = await fetch('assets/data/articles/' + id + '.json');
    if (!resp.ok) throw new Error('not found: ' + id);
    const data = await resp.json();
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

function closePopup() {
  popupOverlay.classList.remove('visible');
  popupImage.style.backgroundImage = 'none';
}

function openVideo(src) {
  closePanel();
  closePopup();
  // pause music while video plays
  try { music.pause(); } catch (e) {}
  videoFrameWrap.innerHTML = '';
  // allow full iframe HTML by mistake — extract src
  if (src && src.indexOf('<iframe') !== -1) {
    const m = src.match(/src=["']([^"']+)["']/);
    if (m) src = m[1];
  }
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.width = 960;
  iframe.height = 540;
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
          popupImage.style.backgroundImage = 'url("' + hs.popup + '")';
          popupOverlay.classList.add('visible');
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
  console.log('[os] exit sequence (placeholder)');
});

// Hierarchical back: right-click / ESC

// ========== RANDOM AD INTERSTITIAL ON BACK ==========
const AD_POOL = [
  { type: 'img', src: 'assets/img/content/anigr.webp' },
  { type: 'img', src: 'assets/img/content/pcworld.webp' },
  { type: 'img', src: 'assets/img/content/recl_gm1.webp' },
  { type: 'img', src: 'assets/img/content/h_s.webp' },
  { type: 'img', src: 'assets/img/content/compass.webp' },
  { type: 'vid', src: 'assets/img/content/redwave.webm' },
  { type: 'img', src: 'assets/img/content/tecnology.webp' },
  { type: 'img', src: 'assets/img/content/1_tm.webp' },
  { type: 'img', src: 'assets/img/content/2_tm.webp' },
  { type: 'img', src: 'assets/img/content/lotery.webp' },
  { type: 'img', src: 'assets/img/content/sbg_rec.webp' }
];
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

function showRandomAd(onDone) {
  if (adBusy) { if (onDone) onDone(null); return; }
  adBusy = true;
  adOnDone = onDone || null;
  const ad = AD_POOL[Math.floor(Math.random() * AD_POOL.length)];
  adCurrentSrc = ad.src;

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
    setTimeout(function () {
      if (adBusy && adCurrentSrc === ad.src) hideAdInterstitial();
    }, 3500);
  }
}

adInterstitial.addEventListener('click', function (e) {
  e.preventDefault();
  e.stopPropagation();
  if (adBusy) hideAdInterstitial();
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
          const resp = await fetch('assets/data/articles/' + parent.articleId + '.json');
          if (!resp.ok) throw new Error('not found');
          const data = await resp.json();
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
    backToMenu();
    return;
  }
  playSfx('exit.wav');
  console.log('[esc] exit sequence (placeholder)');
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
const SPLASH_KEY = 'sbg-1996-04-splash';
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
  if (!currentTrack) playMusic('educatio.opus');
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
  playMusic('educatio.opus');
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
    if (!currentTrack) playMusic('educatio.opus');
  }
} catch (err) {
  startSplashSequence();
}

})();
