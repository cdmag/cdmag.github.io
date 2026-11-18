(function () {
const STAGE_W = 1600, STAGE_H = 1200;
const SOUND_BASE = '../../shared/sound/';
const MUSIC_BASE = 'https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/music/sbg-gem/1996/06/';
const MUSIC_CREDITS = 'https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/music/sbg-gem/1995/02-03/credits.opus';
const MUSIC_RRULET = 'https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/music/sbg-gem/1996/05/act.opus';

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
const splashHit = document.getElementById('splashHit');
const splashImg = document.getElementById('splashImg');
const tallScroll = document.getElementById('tallScroll');
const tallContent = document.getElementById('tallContent');
const tallImage = document.getElementById('tallImage');
const overlayScreen = document.getElementById('overlay-screen');
const txOverlay = document.getElementById('tx-overlay');

let currentView = 'menu';
let currentSubmenuId = null;
let submenuStack = [];
let article = null;
let currentPage = 0;
let nestedParent = null;
let pageHotspotEls = [];
let isScrollMode = false;
let overlayMode = null;
let leftPanelOpen = false;
let rightPanelOpen = false;
let draggingSlider = null;
let txBusy = false;
let adBusy = false;

const music = new Audio();
music.loop = true;
music.volume = musicVol;
let currentTrack = null;

function resolveTrack(trackName) {
  if (!trackName) return null;
  if (trackName === 'credits') return MUSIC_CREDITS;
  if (trackName === 'rrulet') return MUSIC_RRULET;
  if (trackName.indexOf('http') === 0) return trackName;
  return MUSIC_BASE + trackName + '.opus';
}

function playMusic(trackName) {
  if (!trackName) return;
  const fullUrl = resolveTrack(trackName);
  if (currentTrack === fullUrl) {
    if (music.paused) music.play().catch(function () {});
    return;
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

function makeSnap(url, fullH, scrollY) {
  return { url: url, fullH: fullH || STAGE_H, scrollY: scrollY || 0 };
}
function currentSnapshot() {
  if (currentView === 'menu') {
    return makeSnap('assets/img/content/cont_m_6.webp', STAGE_H, 0);
  }
  if (currentView === 'submenu' && currentSubmenuId && SUBMENUS[currentSubmenuId]) {
    return makeSnap(SUBMENUS[currentSubmenuId].image, STAGE_H, 0);
  }
  if (currentView === 'viewer' && article && article.pages && article.pages.length) {
    if (isScrollMode) {
      const file = article.pages[0] || '';
      const url = file.indexOf('assets/') === 0 ? file : ('assets/img/content/' + file);
      return makeSnap(url, article.height || 3000, tallScroll.scrollTop || 0);
    }
    const file = article.pages[currentPage] || '';
    const url = file.indexOf('assets/') === 0 ? file : ('assets/img/content/' + file);
    return makeSnap(url, STAGE_H, 0);
  }
  return null;
}
function applySnap(el, snap, half) {
  if (!snap || !snap.url) { el.style.backgroundImage = 'none'; return; }
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
  return { type: types[Math.floor(Math.random() * types.length)], dir: dir || 'next' };
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

function fadeBlackBrief(then) {
  if (txBusy) { if (then) then(); return; }
  txBusy = true;
  txOverlay.innerHTML = '';
  const black = document.createElement('div');
  black.className = 'tx-layer'; black.style.background = '#000'; black.style.opacity = '0'; black.style.transition = 'none';
  txOverlay.appendChild(black); txOverlay.classList.add('active');
  void black.offsetWidth;
  black.style.transition = 'opacity 320ms ease-in-out';
  requestAnimationFrame(function () { black.style.opacity = '1'; });
  setTimeout(function () {
    if (then) then();
    setTimeout(function () {
      black.style.opacity = '0';
      setTimeout(function () { txOverlay.classList.remove('active'); txOverlay.innerHTML = ''; txBusy = false; }, 340);
    }, 80);
  }, 340);
}

adBusy = false;
let adOnDone = null;
function showRandomAd(onDone) {
  if (!AD_POOL || !AD_POOL.length) { if (onDone) onDone(null); return; }
  const pool = AD_POOL.filter(function (a) { return a.type === 'img' && !a.special; });
  if (!pool.length) { if (onDone) onDone(null); return; }
  const ad = pool[Math.floor(Math.random() * pool.length)];
  adBusy = true;
  adOnDone = onDone || null;

  if (typeof tallDir !== 'undefined') tallDir = 0;
  if (tallScroll) {
    tallScroll.style.overflow = 'hidden';
    tallScroll.style.pointerEvents = 'none';
  }
  closeLeftPanel();
  closeRightPanel();

  adInterstitial.style.opacity = '1';
  adInterstitial.style.transition = '';
  adInterstitial.classList.add('visible');
  adInterstitialImg.style.display = 'none';
  adInterstitialVid.style.display = 'none';
  adInterstitialImg.style.opacity = '0';
  adInterstitialImg.style.transition = 'opacity 0.35s ease';
  adInterstitialImg.style.backgroundImage = 'url("' + ad.src + '")';
  adInterstitialImg.style.backgroundSize = '1600px 1200px';
  adInterstitialImg.style.backgroundPosition = 'center center';
  adInterstitialImg.style.backgroundRepeat = 'no-repeat';
  adInterstitialImg.style.display = 'block';
  requestAnimationFrame(function () {
    adInterstitialImg.style.opacity = '1';
  });
  setTimeout(function () {
    if (adBusy) hideAdInterstitial();
  }, 3500);
}
function hideAdInterstitial() {
  if (!adBusy) return;
  const cb = adOnDone;
  adOnDone = null;
  adBusy = false;
  const src = adInterstitialImg.style.backgroundImage;
  let adSrc = null;
  const m = src && src.match(/url\(["']?([^"')]+)/);
  if (m) adSrc = m[1];
  adInterstitial.classList.remove('visible');
  adInterstitialImg.style.backgroundImage = 'none';
  adInterstitialImg.style.opacity = '';
  adInterstitialImg.style.display = 'none';
  if (tallScroll) {
    tallScroll.style.overflow = '';
    tallScroll.style.pointerEvents = '';
  }
  if (cb) cb(adSrc);
}
adInterstitial.addEventListener('click', function (e) {
  e.preventDefault(); e.stopPropagation();
  if (adBusy) hideAdInterstitial();
});

function fitStage() {
  const ww = window.innerWidth, hh = window.innerHeight;
  const scale = Math.min(ww / STAGE_W, hh / STAGE_H);
  stage.style.transform = 'scale(' + scale + ')';
  stage.style.left = ((ww - STAGE_W * scale) / 2) + 'px';
  stage.style.top  = ((hh - STAGE_H * scale) / 2) + 'px';
}
window.addEventListener('resize', fitStage);
fitStage();

function clearHotspots(container) {
  const old = container.querySelectorAll('.hotspot');
  for (let i = 0; i < old.length; i++) old[i].remove();
}

function buildHotspots(container, list, onClick) {
  clearHotspots(container);
  if (!list) return;
  list.forEach(function (hs) {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.style.left = hs.x + 'px';
    el.style.top = hs.y + 'px';
    el.style.width = hs.w + 'px';
    el.style.height = hs.h + 'px';
    el.dataset.id = hs.id || '';
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      onClick(hs);
    });
    container.appendChild(el);
  });
}

function showView(name) {
  viewMenu.style.display = name === 'menu' ? 'block' : 'none';
  viewSubmenu.style.display = name === 'submenu' ? 'block' : 'none';
  viewViewer.style.display = name === 'viewer' ? 'block' : 'none';
  currentView = name;
}

const MAIN_HOTSPOTS = [
  { id: 'edit_6',     label: 'От редакции',     x:225, y:72,  w:680, h:80, kind:'menu',   music: null },
  { id: 'news_6',     label: 'Новости',         x:225, y:172, w:680, h:58, kind:'menu',   music: null },
  { id: 'obzor_6',    label: 'Обзоры',          x:225, y:272, w:680, h:75, kind:'menu',   music: null },
  { id: 'soluti_6',   label: 'Solutions',       x:225, y:365, w:680, h:80, kind:'menu',   music: null },
  { id: 'cheats_6',   label: 'Cheats',          x:225, y:465, w:680, h:78, kind:'menu',   music: null },
  { id: 'larry11',    label: 'Старое-доброе',   x:225, y:560, w:680, h:80, kind:'article', music: 'larry' },
  { id: '01',         label: 'Hardware',        x:225, y:658, w:680, h:82, kind:'article', music: 'hardw' },
  { id: 'fiction1',   label: 'Fiction',         x:225, y:758, w:680, h:80, kind:'article', music: 'fiction' },
  { id: 'reklam_6',   label: 'Реклама',         x:225, y:862, w:680, h:68, kind:'menu',   music: null },
  { id: 'demos_6',    label: 'Демо-версии',     x:225, y:950, w:680, h:82, kind:'menu',   music: 'intro' },
  { id: 'exit',       label: 'Выход',           x:225, y:1048,w:680, h:62, kind:'exit',   music: null }
];

const SUBMENUS = {
  'edit_6': {
    image: 'assets/img/content/edit_6.webp',
    hotspots: [
      { id: 'otred1',    label: 'От редакции',     x:460, y:465, w:668, h:50, kind:'article', music:'edit' },
      { id: 'letter1',   label: 'E-mail',          x:460, y:540, w:668, h:50, kind:'article', music:'edit' },
      { id: 'work1',     label: 'Вирус в Quake!',  x:460, y:615, w:668, h:50, kind:'article', music:'edit' },
      { id: 'editors1',  label: 'Русская Версия',  x:460, y:690, w:668, h:50, kind:'article', music:'edit' },
      { id: 'magasin',   label: 'Дистрибьюторы',   x:460, y:765, w:668, h:50, kind:'article', music:'edit' },
      { id: 'credits',   label: 'Credits',         x:460, y:842, w:668, h:50, kind:'article', music:'credits' },
      { id: 'dissites',  label: 'Dist Sites',      x:460, y:922, w:668, h:50, kind:'menu',    music:'edit' }
    ]
  },
  'news_6': {
    image: 'assets/img/content/news_6.webp',
    hotspots: [
      { id: 'news1',     label: 'News',            x:458, y:642, w:670, h:48, kind:'article', music:'news' },
      { id: 'cnew1',     label: 'Company News',    x:458, y:720, w:670, h:42, kind:'article', music:'news' },
      { id: 'top100_6',  label: 'INTERNET TOP 100',x:458, y:795, w:670, h:45, kind:'menu',    music:'news' }
    ]
  },
  'obzor_6': {
    image: 'assets/img/content/obzor_6.webp',
    hotspots: [

      { id: 'dearth-1',  label: 'Dark Earth',                    x:22,  y:115, w:582, h:50, kind:'article', music:'action' },
      { id: 'deadlk01',  label: 'Deadlock',                      x:22,  y:188, w:582, h:50, kind:'article', music:'strat' },
      { id: 'dderby-1',  label: 'Destruction Derby II',          x:22,  y:258, w:582, h:72, kind:'article', music:'sim' },
      { id: 'ecstat01',  label: 'Ecstatica II',                  x:22,  y:335, w:582, h:50, kind:'article', music:'adv' },
      { id: 'enemy-1',   label: 'Enemy Nations',                 x:22,  y:408, w:582, h:50, kind:'article', music:'strat' },
      { id: 'eradic01',  label: 'Eradicator',                    x:22,  y:482, w:582, h:50, kind:'article', music:'action' },
      { id: 'falcon-1',  label: 'Falcon 4.0',                    x:22,  y:552, w:582, h:75, kind:'article', music:'sim' },
      { id: 'firef-1',   label: 'Firefight',                     x:22,  y:628, w:582, h:50, kind:'article', music:'arcade' },
      { id: 'gender-1',  label: 'Gender Wars',                   x:22,  y:700, w:582, h:50, kind:'article', music:'strat' },
      { id: 'genewrs1',  label: 'Gene Wars',                     x:22,  y:775, w:582, h:50, kind:'article', music:'strat' },
      { id: 'hunter-1',  label: 'Hunter Haunted',                x:22,  y:848, w:582, h:50, kind:'article', music:'arcade' },
      { id: 'inter-1',   label: "Interstate '76",                x:22,  y:920, w:582, h:50, kind:'article', music:'sim' },
      { id: 'lol-1',     label: 'Lands Of Lore II',              x:22,  y:995, w:582, h:50, kind:'article', music:'adv' },
      { id: 'larry1',    label: 'Leisure Suit Larry VII',        x:22,  y:1065,w:582, h:75, kind:'article', music:'larry' },
      { id: 'mechwr1',   label: 'Mechwarrior III & Mercenaries', x:22,  y:1138,w:582, h:50, kind:'article', music:'sim' },

      { id: 'montez-1',  label: "Montezuma's Return",            x:628, y:115, w:608, h:50, kind:'article', music:'adv' },
      { id: 'mortim01',  label: 'Mortimer and The Riddles',      x:628, y:185, w:608, h:50, kind:'article', music:'logic' },
      { id: 'mdk-1',     label: 'Murder. Death. Kill',           x:628, y:260, w:608, h:50, kind:'article', music:'action' },
      { id: 'outlaw-1',  label: 'Outlaws',                       x:628, y:335, w:608, h:50, kind:'article', music:'outl' },
      { id: 'phant-1',   label: 'Phantasmagoria II',             x:628, y:410, w:608, h:50, kind:'article', music:'adv' },
      { id: 'quaqe1',    label: 'Quake II',                      x:628, y:480, w:608, h:50, kind:'article', music:'action' },
      { id: 'roullt1',   label: 'Русская Рулетка',               x:628, y:552, w:608, h:50, kind:'article', music:'rrulet' },
      { id: 'settlr-1',  label: 'Settlers2',                     x:628, y:628, w:608, h:50, kind:'article', music:'strat' },
      { id: 'starcrf1',  label: 'Starcraft',                     x:628, y:702, w:608, h:50, kind:'article', music:'strat' },
      { id: 'termin-1',  label: 'Terminus',                      x:628, y:775, w:608, h:50, kind:'article', music:'action' },
      { id: 'timecom1',  label: 'Time Commando',                 x:628, y:848, w:608, h:50, kind:'article', music:'action' },
      { id: 'unreal-1',  label: 'Unreal',                        x:628, y:922, w:608, h:50, kind:'article', music:'action' },
      { id: 'vfightr1',  label: 'Virtua Fighter',                x:628, y:995, w:608, h:50, kind:'article', music:'action' },
      { id: 'z01',       label: 'Z',                             x:628, y:1065,w:608, h:50, kind:'article', music:'strat' },
      { id: 'news_6',    label: 'NEWS',                          x:628, y:1138,w:608, h:50, kind:'menu',    music: null },

      { id: 'action_6',  label: 'ACTION',     x:1240, y:115,  w:342, h:100, kind:'menu',    music: null },
      { id: 'arcade_6',  label: 'ARCADE',     x:1240, y:255,  w:342, h:100, kind:'menu',    music: null },
      { id: 'mortim01',  label: 'LOGIC',      x:1240, y:392,  w:342, h:100, kind:'article', music: 'logic' },
      { id: 'simul_6',   label: 'SIMULATION', x:1240, y:530,  w:342, h:100, kind:'menu',    music: null },
      { id: 'advent_6',  label: 'ADVENTURE',  x:1240, y:668,  w:342, h:100, kind:'menu',    music: null },
      { id: 'stratg_6',  label: 'STRATEGY',   x:1240, y:805,  w:342, h:100, kind:'menu',    music: null },
      { id: 'soluti_6',  label: 'SOLUTIONS',  x:1240, y:942,  w:342, h:100, kind:'menu',    music: null },
      { id: 'lol-1',     label: 'RPG',        x:1240, y:1080, w:342, h:100, kind:'article', music: 'adv' }
    ]
  },
  'soluti_6': {
    image: 'assets/img/content/soluti_6.webp',
    hotspots: [
      { id: 'al_in1',    label: 'Alien Incident',             x:452, y:478, w:672, h:42, kind:'article', music:'sol' },
      { id: 'alien-01',  label: 'Alien Virus',                x:452, y:548, w:672, h:42, kind:'article', music:'sol' },
      { id: 'cyber01',   label: 'Cyberia II: Resurrection',   x:452, y:618, w:672, h:45, kind:'article', music:'sol' },
      { id: 'd01',       label: 'D',                          x:452, y:688, w:672, h:45, kind:'article', music:'sol' },
      { id: 'norma-01',  label: 'Normality',                  x:452, y:758, w:672, h:42, kind:'article', music:'sol' },
      { id: 'zorkn-01',  label: 'Zork Nemesis',               x:452, y:828, w:672, h:42, kind:'article', music:'sol' }
    ]
  },
  'action_6': {
    image: 'assets/img/content/action_6.webp',
    hotspots: [
      { id: 'dearth-1',  label: 'Dark Earth',          x:450, y:430, w:672, h:45, kind:'article', music:'action' },
      { id: 'eradic01',  label: 'Eradicator',          x:450, y:508, w:672, h:42, kind:'article', music:'action' },
      { id: 'mdk-1',     label: 'Murder. Death. Kill', x:450, y:580, w:672, h:48, kind:'article', music:'action' },
      { id: 'outlaw-1',  label: 'Outlaws',             x:450, y:658, w:672, h:45, kind:'article', music:'outl' },
      { id: 'quaqe1',    label: 'Quake II',            x:450, y:732, w:672, h:45, kind:'article', music:'action' },
      { id: 'termin-1',  label: 'Terminus',            x:450, y:805, w:672, h:45, kind:'article', music:'action' },
      { id: 'timecom1',  label: 'Time Commando',       x:450, y:880, w:672, h:48, kind:'article', music:'action' },
      { id: 'unreal-1',  label: 'Unreal',              x:450, y:955, w:672, h:45, kind:'article', music:'action' },
      { id: 'vfightr1',  label: 'Virtua Fighter',      x:450, y:1030,w:672, h:48, kind:'article', music:'action' }
    ]
  },
  'advent_6': {
    image: 'assets/img/content/advent_6.webp',
    hotspots: [
      { id: 'ecstat01',  label: 'Ecstatica II',             x:458, y:505, w:670, h:50, kind:'article', music:'adv' },
      { id: 'larry1',    label: 'Leisure Suit Larry VII',   x:458, y:580, w:670, h:50, kind:'article', music:'larry' },
      { id: 'montez-1',  label: "Montezuma's Return",       x:458, y:655, w:670, h:50, kind:'article', music:'adv' },
      { id: 'phant-1',   label: 'Phantasmagoria II',        x:458, y:730, w:670, h:50, kind:'article', music:'adv' }
    ]
  },
  'arcade_6': {
    image: 'assets/img/content/arcade_6.webp',
    hotspots: [
      { id: 'firef-1',   label: 'Fire Fight',      x:455, y:475, w:670, h:202, kind:'article', music:'arcade' },
      { id: 'hunter-1',  label: 'Hunter Haunted',  x:455, y:708, w:670, h:45,  kind:'article', music:'arcade' }
    ]
  },
  'simul_6': {
    image: 'assets/img/content/simul_6.webp',
    hotspots: [
      { id: 'dderby-1',  label: 'Destruction Derby II',                x:452, y:475, w:672, h:48, kind:'article', music:'sim' },
      { id: 'falcon-1',  label: 'Falcon 4.0',                          x:452, y:552, w:672, h:40, kind:'article', music:'sim' },
      { id: 'inter-1',   label: "Interstate '76",                      x:452, y:625, w:672, h:48, kind:'article', music:'sim' },
      { id: 'mechwr1',   label: 'Mechwarrior III & Mercenaries',       x:452, y:700, w:672, h:45, kind:'article', music:'sim' },
      { id: 'roullt1',   label: 'Русская Рулетка',                     x:452, y:775, w:672, h:48, kind:'article', music:'rrulet' }
    ]
  },
  'stratg_6': {
    image: 'assets/img/content/stratg_6.webp',
    hotspots: [
      { id: 'deadlk01',  label: 'Deadlock',        x:450, y:468, w:672, h:50, kind:'article', music:'strat' },
      { id: 'enemy-1',   label: 'Enemy Nations',   x:450, y:542, w:672, h:50, kind:'article', music:'strat' },
      { id: 'gender-1',  label: 'Gender Wars',     x:450, y:618, w:672, h:50, kind:'article', music:'strat' },
      { id: 'genewrs1',  label: 'Gene Wars',       x:450, y:692, w:672, h:50, kind:'article', music:'strat' },
      { id: 'settlr-1',  label: 'Settlers2',       x:450, y:768, w:672, h:50, kind:'article', music:'strat' },
      { id: 'starcrf1',  label: 'Starcraft',       x:450, y:842, w:672, h:50, kind:'article', music:'strat' },
      { id: 'z01',       label: 'Z',               x:450, y:918, w:672, h:50, kind:'article', music:'strat' }
    ]
  },
  'cheats_6': {
    image: 'assets/img/content/cheats_6.webp',
    hotspots: [
      { id: 'cheats1', label: 'Afterlife',          x:455, y:438, w:675, h:58, kind:'article', music:'cheats', startPage: 0 },
      { id: 'cheats1', label: 'Batman Forever',     x:455, y:512, w:675, h:58, kind:'article', music:'cheats', startPage: 0 },
      { id: 'cheats3', label: 'Battle Beast',       x:455, y:588, w:675, h:58, kind:'article', music:'cheats', startPage: 2 },
      { id: 'cheats1', label: 'Eradicator',         x:455, y:662, w:675, h:58, kind:'article', music:'cheats', startPage: 0 },
      { id: 'cheats2', label: 'In Pursuit of Greed',x:455, y:738, w:675, h:58, kind:'article', music:'cheats', startPage: 1 },
      { id: 'cheats3', label: 'Superfrog',          x:455, y:812, w:675, h:58, kind:'article', music:'cheats', startPage: 2 },
      { id: 'cheats2', label: 'The Hive',           x:455, y:888, w:675, h:58, kind:'article', music:'cheats', startPage: 1 }
    ]
  },
  'reklam_6': {
    image: 'assets/img/content/reklam_6.webp',
    hotspots: [
      { id: 'ad0', label: 'CompuLink',                    x:452, y:378, w:675, h:58, kind:'advert', advert_id: 0 },
      { id: 'ad1', label: 'Game Land',                    x:452, y:448, w:675, h:58, kind:'advert', advert_id: 1 },
      { id: 'ad9', label: 'Kami',                         x:452, y:518, w:675, h:58, kind:'advert', advert_id: 9 },
      { id: 'ad2', label: "Мультимедиа'96 | SBG Magazine",x:452, y:588, w:675, h:58, kind:'advert', advert_id: 2 },
      { id: 'ad4', label: 'Пульс | Телетрейд | Технология',x:452, y:658, w:675, h:58, kind:'advert', advert_id: 4 },
      { id: 'ad7', label: 'SBG Magazine',                 x:452, y:728, w:675, h:58, kind:'advert', advert_id: 7 },
      { id: 'ad3', label: 'SBG Publishing',               x:452, y:798, w:675, h:58, kind:'advert', advert_id: 3 },
      { id: 'ad5', label: 'Тайны 500 игр',                x:452, y:868, w:675, h:58, kind:'advert', advert_id: 5 },
      { id: 'ad6', label: 'Техника-Молодёжи',             x:452, y:938, w:675, h:58, kind:'advert', advert_id: 6 },
      { id: 'ad8', label: 'Требуются авторы',             x:452, y:1008,w:675, h:58, kind:'advert', advert_id: 8 }
    ]
  },
  'demos_6': {
    image: 'assets/img/content/demos_6.webp',
    music_on_open: 'intro',
    hotspots: [
      { id: 'demo0',  label: '11 Hour Russian', x:115, y:448, w:668, h:50, kind:'demo', demo_slide: 0 },
      { id: 'demo1',  label: 'Ace Ventura',     x:115, y:518, w:668, h:50, kind:'demo', demo_slide: 1 },
      { id: 'demo2',  label: 'Alien Trilogy',   x:115, y:588, w:668, h:50, kind:'demo', demo_slide: 2 },
      { id: 'demo3',  label: 'Bug!',            x:115, y:658, w:668, h:50, kind:'demo', demo_slide: 3 },
      { id: 'demo4',  label: 'Catz',            x:115, y:728, w:668, h:50, kind:'demo', demo_slide: 4 },
      { id: 'demo5',  label: 'Deadlock',        x:115, y:800, w:668, h:50, kind:'demo', demo_slide: 5 },
      { id: 'demo6',  label: 'Gubble',          x:115, y:868, w:668, h:50, kind:'demo', demo_slide: 6 },
      { id: 'demo7',  label: 'M1A2 Abrams',     x:115, y:938, w:668, h:50, kind:'demo', demo_slide: 7 },
      { id: 'demo8',  label: 'Megarace II',     x:812, y:448, w:750, h:50, kind:'demo', demo_slide: 8 },
      { id: 'demo9',  label: 'NecroDome',       x:812, y:518, w:750, h:50, kind:'demo', demo_slide: 9 },
      { id: 'demo10', label: 'Rally Challenge', x:812, y:588, w:750, h:50, kind:'demo', demo_slide: 10 },
      { id: 'demo11', label: 'Star Fighter PC', x:812, y:658, w:750, h:50, kind:'demo', demo_slide: 11 },
      { id: 'demo12', label: 'TimeLapse',       x:812, y:728, w:750, h:50, kind:'demo', demo_slide: 12 },
      { id: 'demo13', label: 'Tomb Raiders',    x:812, y:800, w:750, h:50, kind:'demo', demo_slide: 13 },
      { id: 'demo14', label: 'Tracer',          x:812, y:868, w:750, h:50, kind:'demo', demo_slide: 14 },
      { id: 'demo15', label: 'Z',               x:812, y:938, w:750, h:50, kind:'demo', demo_slide: 15 }
    ]
  },
  'top100_6': {
    image: 'assets/img/content/top100_6.webp',
    music_on_open: 'news',
    mode: 'scroll',
    height: 1850 * 2.5,
    hotspots: []
  },
  'dissites': {
    image: 'assets/img/content/dissites.webp',
    music_on_open: 'edit',
    mode: 'scroll',
    height: 1500 * 2.5,
    hotspots: []
  }
};

const PAGE_HOTSPOTS = {
  '48': [{"kind": "video", "x": 1150, "y": 430, "w": 388, "h": 250, "video": "mpc.anm"}],
  'adv_pdp1': [{"kind": "article_link", "x": 235, "y": 1092, "w": 1115, "h": 68}],
  'alien-01': [{"kind": "screenshot", "x": 1115, "y": 630, "w": 388, "h": 250, "src": "alie_s01.webp"}],
  'alien-02': [{"kind": "screenshot", "x": 100, "y": 372, "w": 388, "h": 250, "src": "alie_s02.webp"}, {"kind": "screenshot", "x": 1118, "y": 562, "w": 388, "h": 250, "src": "alie_s03.webp"}],
  'alien-03': [{"kind": "screenshot", "x": 1118, "y": 250, "w": 388, "h": 250, "src": "alie_s05.webp"}, {"kind": "screenshot", "x": 100, "y": 495, "w": 388, "h": 250, "src": "alie_s04.webp"}],
  'alien-04': [{"kind": "screenshot", "x": 100, "y": 275, "w": 388, "h": 250, "src": "alie_s06.webp"}, {"kind": "screenshot", "x": 605, "y": 718, "w": 388, "h": 250, "src": "alie_s07.webp"}],
  'alien-05': [{"kind": "screenshot", "x": 608, "y": 428, "w": 388, "h": 250, "src": "alie_s08.webp"}],
  'alien-06': [{"kind": "screenshot", "x": 1112, "y": 265, "w": 388, "h": 250, "src": "alie_s10.webp"}, {"kind": "screenshot", "x": 100, "y": 312, "w": 388, "h": 250, "src": "alie_s09.webp"}],
  'alien-07': [{"kind": "screenshot", "x": 608, "y": 488, "w": 388, "h": 250, "src": "alie_s11.webp"}],
  'alien-08': [{"kind": "screenshot", "x": 98, "y": 638, "w": 388, "h": 250, "src": "alie_s12.webp"}],
  'alien-09': [{"kind": "screenshot", "x": 1112, "y": 430, "w": 388, "h": 250, "src": "alie_s14.webp"}, {"kind": "screenshot", "x": 100, "y": 640, "w": 388, "h": 250, "src": "alie_s13.webp"}],
  'alien-10': [{"kind": "screenshot", "x": 605, "y": 600, "w": 388, "h": 250, "src": "alie_s15.webp"}],
  'al_in3': [{"kind": "screenshot", "x": 1095, "y": 288, "w": 388, "h": 250, "src": "al_in_s1.webp"}],
  'al_in4': [{"kind": "screenshot", "x": 100, "y": 482, "w": 388, "h": 250, "src": "al_in_s2.webp"}],
  'al_in5': [{"kind": "screenshot", "x": 102, "y": 358, "w": 388, "h": 250, "src": "al_in_s3.webp"}, {"kind": "screenshot", "x": 105, "y": 810, "w": 388, "h": 250, "src": "al_in_s4.webp"}],
  'al_in6': [{"kind": "screenshot", "x": 1115, "y": 262, "w": 388, "h": 250, "src": "al_in_s5.webp"}],
  'al_in7': [{"kind": "screenshot", "x": 98, "y": 320, "w": 388, "h": 250, "src": "al_in_s6.webp"}, {"kind": "screenshot", "x": 1118, "y": 785, "w": 388, "h": 250, "src": "al_in_s7.webp"}],
  'cyber05': [{"kind": "screenshot", "x": 875, "y": 780, "w": 388, "h": 250, "src": "cyber_s1.webp"}],
  'cyber06': [{"kind": "screenshot", "x": 325, "y": 195, "w": 388, "h": 250, "src": "cyber_s2.webp"}, {"kind": "screenshot", "x": 875, "y": 780, "w": 388, "h": 250, "src": "cyber_s3.webp"}],
  'cyber07': [{"kind": "screenshot", "x": 1100, "y": 172, "w": 388, "h": 250, "src": "cyber_s4.webp"}, {"kind": "screenshot", "x": 120, "y": 788, "w": 388, "h": 250, "src": "cyber_s5.webp"}],
  'cyber08': [{"kind": "screenshot", "x": 332, "y": 445, "w": 388, "h": 250, "src": "cyber_s6.webp"}, {"kind": "screenshot", "x": 878, "y": 625, "w": 388, "h": 250, "src": "cyber_s7.webp"}],
  'cyber09': [{"kind": "screenshot", "x": 332, "y": 162, "w": 388, "h": 250, "src": "cyber_s8.webp"}],
  'd01': [{"kind": "screenshot", "x": 608, "y": 450, "w": 388, "h": 250, "src": "d_s1.webp"}],
  'd10': [{"kind": "screenshot", "x": 605, "y": 385, "w": 388, "h": 250, "src": "d_s2.webp"}, {"kind": "screenshot", "x": 1115, "y": 732, "w": 388, "h": 250, "src": "d_s3.webp"}],
  'dderby-1': [{"kind": "screenshot", "x": 1122, "y": 422, "w": 388, "h": 250, "src": "dderb_s1.webp"}],
  'dderby-2': [{"kind": "screenshot", "x": 98, "y": 428, "w": 388, "h": 250, "src": "dderb_s2.webp"}],
  'dderby-3': [{"kind": "screenshot", "x": 110, "y": 395, "w": 388, "h": 250, "src": "dderb_s3.webp"}],
  'deadlk02': [{"kind": "screenshot", "x": 1108, "y": 365, "w": 388, "h": 250, "src": "deadl_s2.webp"}, {"kind": "screenshot", "x": 95, "y": 675, "w": 388, "h": 250, "src": "deadl_s1.webp"}],
  'deadlk03': [{"kind": "screenshot", "x": 605, "y": 278, "w": 388, "h": 250, "src": "deadl_s4.webp"}, {"kind": "screenshot", "x": 92, "y": 802, "w": 388, "h": 250, "src": "deadl_s3.webp"}],
  'deadlk04': [{"kind": "screenshot", "x": 600, "y": 455, "w": 388, "h": 250, "src": "deadl_s5.webp"}],
  'deadlk06': [{"kind": "screenshot", "x": 605, "y": 515, "w": 388, "h": 250, "src": "deadl_s6.webp"}],
  'deadlk07': [{"kind": "screenshot", "x": 600, "y": 332, "w": 388, "h": 250, "src": "deadl_s7.webp"}],
  'dearth-1': [{"kind": "screenshot", "x": 1115, "y": 245, "w": 388, "h": 250, "src": "death_s1.webp"}],
  'dearth-2': [{"kind": "screenshot", "x": 605, "y": 235, "w": 388, "h": 250, "src": "death_s3.webp"}, {"kind": "screenshot", "x": 1115, "y": 682, "w": 388, "h": 250, "src": "death_s4.webp"}, {"kind": "screenshot", "x": 100, "y": 800, "w": 388, "h": 250, "src": "death_s2.webp"}],
  'dearth-3': [{"kind": "screenshot", "x": 100, "y": 802, "w": 388, "h": 250, "src": "death_s5.webp"}],
  'ecstat01': [{"kind": "screenshot", "x": 1115, "y": 432, "w": 388, "h": 250, "src": "ecst_s1.webp"}],
  'ecstat02': [{"kind": "screenshot", "x": 102, "y": 255, "w": 388, "h": 250, "src": "ecst_s2.webp"}, {"kind": "screenshot", "x": 1115, "y": 648, "w": 388, "h": 250, "src": "ecst_s3.webp"}],
  'ecstat03': [{"kind": "screenshot", "x": 95, "y": 268, "w": 388, "h": 250, "src": "ecst_s4.webp"}, {"kind": "screenshot", "x": 1115, "y": 508, "w": 388, "h": 250, "src": "ecst_s5.webp"}],
  'ecstat04': [{"kind": "screenshot", "x": 605, "y": 398, "w": 388, "h": 250, "src": "ecst_s6.webp"}],
  'enemy-1': [{"kind": "screenshot", "x": 1118, "y": 568, "w": 388, "h": 250, "src": "enemy_s1.webp"}],
  'enemy-2': [{"kind": "screenshot", "x": 95, "y": 765, "w": 388, "h": 250, "src": "enemy_s2.webp"}],
  'enemy-3': [{"kind": "screenshot", "x": 1115, "y": 340, "w": 388, "h": 250, "src": "enemy_s3.webp"}],
  'eradic01': [{"kind": "screenshot", "x": 1110, "y": 582, "w": 388, "h": 250, "src": "eradi_s1.webp"}],
  'eradic02': [{"kind": "screenshot", "x": 92, "y": 152, "w": 388, "h": 250, "src": "eradi_s2.webp"}, {"kind": "screenshot", "x": 92, "y": 490, "w": 388, "h": 250, "src": "eradi_s3.webp"}, {"kind": "screenshot", "x": 92, "y": 828, "w": 388, "h": 250, "src": "eradi_s4.webp"}],
  'eradic04': [{"kind": "screenshot", "x": 618, "y": 180, "w": 388, "h": 250, "src": "eradi_s5.webp"}, {"kind": "screenshot", "x": 1110, "y": 180, "w": 388, "h": 250, "src": "eradi_s6.webp"}],
  'falcon-1': [{"kind": "screenshot", "x": 1112, "y": 288, "w": 388, "h": 250, "src": "falcn_s2.webp"}, {"kind": "screenshot", "x": 602, "y": 592, "w": 388, "h": 250, "src": "falcn_s1.webp"}],
  'falcon-2': [{"kind": "screenshot", "x": 95, "y": 285, "w": 388, "h": 250, "src": "falcn_s3.webp"}],
  'falcon-3': [{"kind": "screenshot", "x": 98, "y": 802, "w": 388, "h": 250, "src": "falcn_s4.webp"}],
  'firef-1': [{"kind": "screenshot", "x": 1115, "y": 460, "w": 388, "h": 250, "src": "firef_s1.webp"}],
  'firef-2': [{"kind": "screenshot", "x": 1115, "y": 652, "w": 388, "h": 250, "src": "firef_s2.webp"}],
  'firef-4': [{"kind": "screenshot", "x": 100, "y": 315, "w": 388, "h": 250, "src": "firef_s3.webp"}, {"kind": "screenshot", "x": 1118, "y": 620, "w": 388, "h": 250, "src": "firef_s4.webp"}],
  'firef-5': [{"kind": "screenshot", "x": 1110, "y": 295, "w": 388, "h": 250, "src": "firef_s6.webp"}, {"kind": "screenshot", "x": 98, "y": 655, "w": 388, "h": 250, "src": "firef_s5.webp"}],
  'firef-6': [{"kind": "screenshot", "x": 98, "y": 468, "w": 388, "h": 250, "src": "firef_s7.webp"}],
  'gender-1': [{"kind": "video", "x": 1112, "y": 682, "w": 388, "h": 250, "video": "matriarc.anm"}],
  'gender-2': [{"kind": "screenshot", "x": 95, "y": 340, "w": 388, "h": 250, "src": "gend_s02.webp"}, {"kind": "video", "x": 1112, "y": 775, "w": 388, "h": 250, "video": "patriarc.anm"}],
  'gender-3': [{"kind": "screenshot", "x": 605, "y": 162, "w": 388, "h": 250, "src": "gend_s04.webp"}, {"kind": "screenshot", "x": 1112, "y": 682, "w": 388, "h": 250, "src": "gend_s05.webp"}],
  'gender-4': [{"kind": "screenshot", "x": 1088, "y": 265, "w": 388, "h": 250, "src": "gend_s08.webp"}, {"kind": "screenshot", "x": 98, "y": 400, "w": 388, "h": 250, "src": "gend_s06.webp"}, {"kind": "screenshot", "x": 642, "y": 730, "w": 388, "h": 250, "src": "gend_s07.webp"}],
  'gender-5': [{"kind": "screenshot", "x": 98, "y": 248, "w": 388, "h": 250, "src": "gend_s09.webp"}, {"kind": "screenshot", "x": 1115, "y": 355, "w": 388, "h": 250, "src": "gend_s11.webp"}, {"kind": "screenshot", "x": 605, "y": 678, "w": 388, "h": 250, "src": "gend_s10.webp"}],
  'gender-6': [{"kind": "screenshot", "x": 605, "y": 312, "w": 388, "h": 250, "src": "gend_s12.webp"}],
  'genewrs1': [{"kind": "screenshot", "x": 605, "y": 812, "w": 388, "h": 250, "src": "gene_s1.webp"}],
  'genewrs2': [{"kind": "screenshot", "x": 605, "y": 372, "w": 388, "h": 250, "src": "gene_s2.webp"}],
  'genewrs3': [{"kind": "screenshot", "x": 1112, "y": 295, "w": 388, "h": 250, "src": "gene_s4.webp"}, {"kind": "screenshot", "x": 100, "y": 490, "w": 388, "h": 250, "src": "gene_s3.webp"}],
  'genewrs4': [{"kind": "screenshot", "x": 1112, "y": 140, "w": 388, "h": 250, "src": "gene_s6.webp"}, {"kind": "screenshot", "x": 100, "y": 515, "w": 388, "h": 250, "src": "gene_s5.webp"}],
  'hunter-1': [{"kind": "screenshot", "x": 1115, "y": 448, "w": 388, "h": 250, "src": "huntr_s1.webp"}],
  'hunter-2': [{"kind": "screenshot", "x": 100, "y": 172, "w": 388, "h": 250, "src": "huntr_s2.webp"}],
  'hunter-3': [{"kind": "screenshot", "x": 95, "y": 398, "w": 388, "h": 250, "src": "huntr_s3.webp"}],
  'inter-3': [{"kind": "video", "x": 1108, "y": 258, "w": 388, "h": 250, "video": "in_st76.anm"}],
  'larry11': [{"kind": "screenshot", "x": 1115, "y": 625, "w": 388, "h": 250, "src": "larry1s1.webp"}],
  'larry12': [{"kind": "screenshot", "x": 1112, "y": 145, "w": 388, "h": 250, "src": "larry1s3.webp"}, {"kind": "screenshot", "x": 100, "y": 805, "w": 388, "h": 250, "src": "larry1s2.webp"}],
  'larry13': [{"kind": "screenshot", "x": 602, "y": 145, "w": 388, "h": 250, "src": "larry1s4.webp"}, {"kind": "screenshot", "x": 602, "y": 810, "w": 388, "h": 250, "src": "larry1s5.webp"}],
  'larry15': [{"kind": "screenshot", "x": 98, "y": 495, "w": 388, "h": 250, "src": "larry1s6.webp"}],
  'larry2': [{"kind": "screenshot", "x": 92, "y": 768, "w": 388, "h": 250, "src": "larry_s1.webp"}],
  'larry3': [{"kind": "screenshot", "x": 350, "y": 308, "w": 388, "h": 250, "src": "larry_s2.webp"}, {"kind": "screenshot", "x": 1118, "y": 585, "w": 388, "h": 250, "src": "larry_s3.webp"}],
  'larry4': [{"kind": "screenshot", "x": 1112, "y": 142, "w": 388, "h": 250, "src": "larry_s5.webp"}, {"kind": "screenshot", "x": 95, "y": 322, "w": 388, "h": 250, "src": "larry_s4.webp"}, {"kind": "screenshot", "x": 1108, "y": 805, "w": 388, "h": 250, "src": "larry_s6.webp"}],
  'larry5': [{"kind": "screenshot", "x": 102, "y": 185, "w": 388, "h": 250, "src": "larry_s7.webp"}, {"kind": "screenshot", "x": 112, "y": 812, "w": 388, "h": 250, "src": "larry_s8.webp"}],
  'lol-1': [{"kind": "screenshot", "x": 1115, "y": 580, "w": 388, "h": 250, "src": "lol_s1.webp"}],
  'lol-2': [{"kind": "screenshot", "x": 98, "y": 222, "w": 388, "h": 250, "src": "lol_s2.webp"}, {"kind": "screenshot", "x": 1115, "y": 230, "w": 388, "h": 250, "src": "lol_s4.webp"}, {"kind": "screenshot", "x": 605, "y": 668, "w": 388, "h": 250, "src": "lol_s3.webp"}],
  'mdk-1': [{"kind": "screenshot", "x": 1118, "y": 555, "w": 388, "h": 250, "src": "mdk_s1.webp"}],
  'mdk-2': [{"kind": "screenshot", "x": 120, "y": 770, "w": 388, "h": 250, "src": "mdk_s2.webp"}],
  'mdk-3': [{"kind": "screenshot", "x": 98, "y": 150, "w": 388, "h": 250, "src": "mdk_s3.webp"}, {"kind": "screenshot", "x": 600, "y": 598, "w": 388, "h": 250, "src": "mdk_s4.webp"}],
  'mdk-4': [{"kind": "screenshot", "x": 592, "y": 468, "w": 388, "h": 250, "src": "mdk_s5.webp"}],
  'mechwr1': [{"kind": "screenshot", "x": 1112, "y": 442, "w": 388, "h": 250, "src": "mech_s1.webp"}],
  'mechwr2': [{"kind": "video", "x": 1110, "y": 338, "w": 388, "h": 250, "video": "m2_2merc.anm"}, {"kind": "screenshot", "x": 95, "y": 555, "w": 388, "h": 250, "src": "mech_s2.webp"}],
  'mechwr4': [{"kind": "screenshot", "x": 1110, "y": 235, "w": 388, "h": 250, "src": "mech_s5.webp"}, {"kind": "screenshot", "x": 92, "y": 292, "w": 388, "h": 250, "src": "mech_s4.webp"}, {"kind": "screenshot", "x": 1110, "y": 662, "w": 388, "h": 250, "src": "mech_s6.webp"}],
  'mechwr5': [{"kind": "screenshot", "x": 605, "y": 482, "w": 388, "h": 250, "src": "mech_s7.webp"}],
  'montez-1': [{"kind": "screenshot", "x": 1120, "y": 292, "w": 388, "h": 250, "src": "mntzm_s2.webp"}, {"kind": "screenshot", "x": 608, "y": 600, "w": 388, "h": 250, "src": "mntzm_s1.webp"}],
  'montez-2': [{"kind": "screenshot", "x": 610, "y": 250, "w": 388, "h": 250, "src": "mntzm_s4.webp"}, {"kind": "screenshot", "x": 1120, "y": 600, "w": 388, "h": 250, "src": "mntzm_s5.webp"}, {"kind": "screenshot", "x": 102, "y": 605, "w": 388, "h": 250, "src": "mntzm_s3.webp"}],
  'montez-3': [{"kind": "screenshot", "x": 1115, "y": 232, "w": 388, "h": 250, "src": "mntzm_s8.webp"}, {"kind": "screenshot", "x": 100, "y": 408, "w": 388, "h": 250, "src": "mntzm_s6.webp"}, {"kind": "screenshot", "x": 608, "y": 560, "w": 388, "h": 250, "src": "mntzm_s7.webp"}],
  'mortim05': [{"kind": "screenshot", "x": 588, "y": 620, "w": 388, "h": 250, "src": "mortims1.webp"}],
  'news1': [{"kind": "screenshot", "x": 1112, "y": 370, "w": 388, "h": 250, "src": "news_s02.webp"}, {"kind": "screenshot", "x": 100, "y": 472, "w": 388, "h": 250, "src": "news_s01.webp"}],
  'news2': [{"kind": "screenshot", "x": 100, "y": 695, "w": 388, "h": 250, "src": "news_s03.webp"}],
  'news3': [{"kind": "screenshot", "x": 100, "y": 798, "w": 388, "h": 250, "src": "news_s04.webp"}],
  'news4': [{"kind": "screenshot", "x": 102, "y": 565, "w": 388, "h": 250, "src": "news_s05.webp"}, {"kind": "screenshot", "x": 1102, "y": 600, "w": 388, "h": 250, "src": "news_s06.webp"}],
  'news5': [{"kind": "screenshot", "x": 98, "y": 582, "w": 388, "h": 250, "src": "news_s07.webp"}],
  'news6': [{"kind": "screenshot", "x": 100, "y": 270, "w": 388, "h": 250, "src": "news_s08.webp"}, {"kind": "screenshot", "x": 1118, "y": 388, "w": 388, "h": 250, "src": "news_s09.webp"}],
  'news7': [{"kind": "screenshot", "x": 1118, "y": 270, "w": 388, "h": 250, "src": "news_s11.webp"}, {"kind": "screenshot", "x": 100, "y": 500, "w": 388, "h": 250, "src": "news_s10.webp"}],
  'norma-02': [{"kind": "screenshot", "x": 100, "y": 618, "w": 388, "h": 250, "src": "norm__s1.webp"}],
  'norma-04': [{"kind": "screenshot", "x": 95, "y": 518, "w": 388, "h": 250, "src": "norm__s2.webp"}],
  'norma-05': [{"kind": "screenshot", "x": 95, "y": 800, "w": 388, "h": 250, "src": "norm__s3.webp"}, {"kind": "screenshot", "x": 1108, "y": 770, "w": 388, "h": 250, "src": "norm__s4.webp"}],
  'norma-07': [{"kind": "screenshot", "x": 98, "y": 168, "w": 388, "h": 250, "src": "norm__s5.webp"}, {"kind": "screenshot", "x": 1115, "y": 340, "w": 388, "h": 250, "src": "norm__s6.webp"}],
  'norma-08': [{"kind": "screenshot", "x": 98, "y": 802, "w": 388, "h": 250, "src": "norm__s7.webp"}],
  'norma-09': [{"kind": "screenshot", "x": 350, "y": 640, "w": 388, "h": 250, "src": "norm__s8.webp"}],
  'norma-10': [{"kind": "screenshot", "x": 1115, "y": 218, "w": 388, "h": 250, "src": "norm_s10.webp"}, {"kind": "screenshot", "x": 605, "y": 628, "w": 388, "h": 250, "src": "norm__s9.webp"}],
  'norma-11': [{"kind": "screenshot", "x": 602, "y": 140, "w": 388, "h": 250, "src": "norm_s12.webp"}, {"kind": "screenshot", "x": 1110, "y": 800, "w": 388, "h": 250, "src": "norm_s13.webp"}, {"kind": "screenshot", "x": 98, "y": 802, "w": 388, "h": 250, "src": "norm_s11.webp"}],
  'norma-12': [{"kind": "screenshot", "x": 605, "y": 525, "w": 388, "h": 250, "src": "norm_s15.webp"}, {"kind": "screenshot", "x": 98, "y": 802, "w": 388, "h": 250, "src": "norm_s14.webp"}],
  'outlaw-2': [{"kind": "screenshot", "x": 98, "y": 255, "w": 388, "h": 250, "src": "outlw_s1.webp"}, {"kind": "screenshot", "x": 98, "y": 702, "w": 388, "h": 250, "src": "outlw_s2.webp"}],
  'outlaw-4': [{"kind": "screenshot", "x": 98, "y": 390, "w": 388, "h": 250, "src": "outlw_s3.webp"}],
  'phant-2': [{"kind": "video", "x": 1115, "y": 285, "w": 388, "h": 250, "video": "phantasm.anm"}],
  'phant-3': [{"kind": "screenshot", "x": 100, "y": 260, "w": 388, "h": 250, "src": "phant_s2.webp"}, {"kind": "screenshot", "x": 1110, "y": 262, "w": 388, "h": 250, "src": "phant_s3.webp"}],
  'quaqe1': [{"kind": "video", "x": 608, "y": 478, "w": 388, "h": 250, "video": "quake.anm"}],
  'quaqe2': [{"kind": "screenshot", "x": 952, "y": 410, "w": 388, "h": 250, "src": "quaqe_s2.webp"}],
  'quaqe3': [{"kind": "screenshot", "x": 272, "y": 202, "w": 388, "h": 250, "src": "quaqe_s3.webp"}, {"kind": "screenshot", "x": 942, "y": 578, "w": 388, "h": 250, "src": "quaqe_s4.webp"}],
  'quaqe4': [{"kind": "screenshot", "x": 600, "y": 458, "w": 388, "h": 250, "src": "quaqe_s5.webp"}],
  'quaqe5': [{"kind": "screenshot", "x": 278, "y": 202, "w": 388, "h": 250, "src": "quaqe_s6.webp"}],
  'quaqe7': [{"kind": "screenshot", "x": 1018, "y": 468, "w": 388, "h": 250, "src": "quaqe_s7.webp"}],
  'roullt1': [{"kind": "video", "x": 1112, "y": 570, "w": 388, "h": 250, "video": "russrul.flc"}],
  'roullt2': [{"kind": "screenshot", "x": 975, "y": 228, "w": 388, "h": 250, "src": "roult_s3.webp"}, {"kind": "screenshot", "x": 245, "y": 700, "w": 388, "h": 250, "src": "roult_s2.webp"}],
  'roullt3': [{"kind": "screenshot", "x": 602, "y": 445, "w": 388, "h": 250, "src": "roult_s4.webp"}],
  'roullt4': [{"kind": "screenshot", "x": 242, "y": 235, "w": 388, "h": 250, "src": "roult_s5.webp"}, {"kind": "screenshot", "x": 960, "y": 718, "w": 388, "h": 250, "src": "roult_s6.webp"}],
  'roullt5': [{"kind": "screenshot", "x": 248, "y": 465, "w": 388, "h": 250, "src": "roult_s7.webp"}],
  'roullt6': [{"kind": "screenshot", "x": 245, "y": 710, "w": 388, "h": 250, "src": "roult_s8.webp"}],
  'roullt7': [{"kind": "screenshot", "x": 602, "y": 702, "w": 388, "h": 250, "src": "roult_s9.webp"}],
  'settlr-1': [{"kind": "video", "x": 1112, "y": 440, "w": 388, "h": 250, "video": "settler2.anm"}],
  'settlr-2': [{"kind": "screenshot", "x": 1128, "y": 142, "w": 388, "h": 250, "src": "setlr_s3.webp"}, {"kind": "screenshot", "x": 98, "y": 740, "w": 388, "h": 250, "src": "setlr_s2.webp"}],
  'settlr-3': [{"kind": "screenshot", "x": 98, "y": 175, "w": 388, "h": 250, "src": "setlr_s4.webp"}],
  'settlr-4': [{"kind": "screenshot", "x": 98, "y": 180, "w": 388, "h": 250, "src": "setlr_s5.webp"}, {"kind": "screenshot", "x": 95, "y": 532, "w": 388, "h": 250, "src": "setlr_s6.webp"}],
  'settlr-5': [{"kind": "screenshot", "x": 610, "y": 400, "w": 388, "h": 250, "src": "setlr_s7.webp"}],
  'settlr-6': [{"kind": "screenshot", "x": 615, "y": 545, "w": 388, "h": 250, "src": "setlr_s8.webp"}],
  'starcrf3': [{"kind": "screenshot", "x": 602, "y": 232, "w": 388, "h": 250, "src": "starc_s1.webp"}, {"kind": "screenshot", "x": 1110, "y": 660, "w": 388, "h": 250, "src": "starc_s2.webp"}],
  'starcrf4': [{"kind": "screenshot", "x": 605, "y": 135, "w": 388, "h": 250, "src": "starc_s3.webp"}, {"kind": "screenshot", "x": 1115, "y": 478, "w": 388, "h": 250, "src": "starc_s4.webp"}],
  'starcrf5': [{"kind": "screenshot", "x": 98, "y": 812, "w": 388, "h": 250, "src": "starc_s5.webp"}],
  'timecom2': [{"kind": "screenshot", "x": 1128, "y": 300, "w": 388, "h": 250, "src": "timec_s1.webp"}],
  'timecom3': [{"kind": "video", "x": 95, "y": 190, "w": 388, "h": 250, "video": "tc.anm"}, {"kind": "screenshot", "x": 1118, "y": 422, "w": 388, "h": 250, "src": "timec_s3.webp"}],
  'timecom4': [{"kind": "screenshot", "x": 598, "y": 500, "w": 388, "h": 250, "src": "timec_s4.webp"}],
  'timecom5': [{"kind": "screenshot", "x": 1110, "y": 600, "w": 388, "h": 250, "src": "timec_s5.webp"}],
  'timecom6': [{"kind": "screenshot", "x": 100, "y": 322, "w": 388, "h": 250, "src": "timec_s6.webp"}, {"kind": "screenshot", "x": 1112, "y": 602, "w": 388, "h": 250, "src": "timec_s7.webp"}],
  'unreal-1': [{"kind": "screenshot", "x": 1108, "y": 518, "w": 388, "h": 250, "src": "unrea_s1.webp"}],
  'unreal-2': [{"kind": "screenshot", "x": 1110, "y": 312, "w": 388, "h": 250, "src": "unrea_s3.webp"}, {"kind": "screenshot", "x": 100, "y": 552, "w": 388, "h": 250, "src": "unrea_s2.webp"}],
  'unreal-3': [{"kind": "screenshot", "x": 1118, "y": 455, "w": 388, "h": 250, "src": "unrea_s5.webp"}, {"kind": "screenshot", "x": 95, "y": 592, "w": 388, "h": 250, "src": "unrea_s4.webp"}],
  'unreal-4': [{"kind": "screenshot", "x": 95, "y": 160, "w": 388, "h": 250, "src": "unrea_s6.webp"}],
  'unreal-6': [{"kind": "screenshot", "x": 605, "y": 335, "w": 388, "h": 250, "src": "unrea_s7.webp"}],
  'z01': [{"kind": "screenshot", "x": 1110, "y": 472, "w": 388, "h": 250, "src": "z_s01.webp"}],
  'z02': [{"kind": "screenshot", "x": 855, "y": 435, "w": 388, "h": 250, "src": "z_s02.webp"}],
  'z03': [{"kind": "screenshot", "x": 92, "y": 355, "w": 388, "h": 250, "src": "z_s03.webp"}, {"kind": "screenshot", "x": 1120, "y": 598, "w": 388, "h": 250, "src": "z_s04.webp"}],
  'z04': [{"kind": "screenshot", "x": 95, "y": 502, "w": 388, "h": 250, "src": "z_s05.webp"}],
  'z05': [{"kind": "screenshot", "x": 605, "y": 268, "w": 388, "h": 250, "src": "z_s07.webp"}],
  'z06': [{"kind": "screenshot", "x": 1110, "y": 472, "w": 388, "h": 250, "src": "z_s08.webp"}, {"kind": "screenshot", "x": 95, "y": 482, "w": 388, "h": 250, "src": "z_s06.webp"}],
  'z07': [{"kind": "screenshot", "x": 598, "y": 548, "w": 388, "h": 250, "src": "z_s09.webp"}],
  'z08': [{"kind": "screenshot", "x": 605, "y": 375, "w": 388, "h": 250, "src": "z_s10.webp"}],
  'z10': [{"kind": "screenshot", "x": 430, "y": 245, "w": 388, "h": 250, "src": "z_s11.webp"}],
  'zorkn-01': [{"kind": "screenshot", "x": 1115, "y": 405, "w": 388, "h": 250, "src": "zork_s01.webp"}],
  'zorkn-02': [{"kind": "screenshot", "x": 100, "y": 622, "w": 388, "h": 250, "src": "zork_s02.webp"}],
  'zorkn-03': [{"kind": "screenshot", "x": 1108, "y": 140, "w": 388, "h": 250, "src": "zork_s05.webp"}, {"kind": "screenshot", "x": 98, "y": 320, "w": 388, "h": 250, "src": "zork_s03.webp"}, {"kind": "screenshot", "x": 600, "y": 802, "w": 388, "h": 250, "src": "zork_s04.webp"}],
  'zorkn-04': [{"kind": "screenshot", "x": 95, "y": 160, "w": 388, "h": 250, "src": "zork_s06.webp"}],
  'zorkn-05': [{"kind": "screenshot", "x": 98, "y": 462, "w": 388, "h": 250, "src": "zork_s07.webp"}, {"kind": "screenshot", "x": 1110, "y": 750, "w": 388, "h": 250, "src": "zork_s08.webp"}],
  'zorkn-06': [{"kind": "screenshot", "x": 100, "y": 562, "w": 388, "h": 250, "src": "zork_s09.webp"}],
  'zorkn-07': [{"kind": "screenshot", "x": 1115, "y": 308, "w": 388, "h": 250, "src": "zork_s10.webp"}],
  'zorkn-08': [{"kind": "screenshot", "x": 1115, "y": 328, "w": 388, "h": 250, "src": "zork_s11.webp"}],
  'zorkn-09': [{"kind": "screenshot", "x": 615, "y": 470, "w": 388, "h": 250, "src": "zork_s12.webp"}],
  'zorkn-10': [{"kind": "screenshot", "x": 605, "y": 398, "w": 388, "h": 250, "src": "zork_s13.webp"}],
};

const ARTICLES = {
  '01': { pages: ["01.webp", "02.webp", "03.webp", "04.webp", "05.webp", "06.webp", "07.webp", "08.webp", "09.webp", "10.webp", "11.webp", "12.webp", "13.webp", "14.webp", "15.webp", "16.webp", "17.webp", "18.webp", "19.webp", "20.webp", "21.webp", "22.webp", "23.webp", "24.webp", "25.webp", "26.webp", "27.webp", "28.webp", "29.webp", "30.webp", "31.webp", "32.webp", "33.webp", "34.webp", "35.webp", "36.webp", "37.webp", "38.webp", "39.webp", "40.webp", "41.webp", "42.webp", "43.webp", "44.webp", "45.webp", "46.webp", "47.webp", "48.webp", "49.webp", "50.webp"], music: "hardw" },
  'al_in1': { pages: ["al_in1.webp", "al_in2.webp", "al_in3.webp", "al_in4.webp", "al_in5.webp", "al_in6.webp", "al_in7.webp", "al_in8.webp"], music: "sol" },
  'alien-01': { pages: ["alien-01.webp", "alien-02.webp", "alien-03.webp", "alien-04.webp", "alien-05.webp", "alien-06.webp", "alien-07.webp", "alien-08.webp", "alien-09.webp", "alien-10.webp"], music: "sol" },
  'cheats1': { pages: ["cheats1.webp", "cheats2.webp", "cheats3.webp"], music: "cheats" },
  'cheats2': { pages: ["cheats1.webp", "cheats2.webp", "cheats3.webp"], music: "cheats" },
  'cheats3': { pages: ["cheats1.webp", "cheats2.webp", "cheats3.webp"], music: "cheats" },
  'cnew1': { pages: ["cnew1.webp", "cnew2.webp", "cnew3.webp", "cnew4.webp", "cnew5.webp", "cnew6.webp"], music: "news" },
  'credits': { pages: ["credits.webp"], music: "credits" },
  'cyber01': { pages: ["cyber01.webp", "cyber02.webp", "cyber03.webp", "cyber04.webp", "cyber05.webp", "cyber06.webp", "cyber07.webp", "cyber08.webp", "cyber09.webp", "cyber10.webp", "cyber11.webp", "cyber12.webp", "cyber13.webp", "cyber14.webp", "cyber15.webp", "cyber16.webp", "cyber17.webp", "cyber18.webp", "cyber19.webp"], music: "sol" },
  'd01': { pages: ["d01.webp", "d02.webp", "d03.webp", "d04.webp", "d05.webp", "d06.webp", "d07.webp", "d08.webp", "d09.webp", "d10.webp", "d11.webp", "d12.webp", "d13.webp", "d14.webp", "d15.webp", "d16.webp", "d17.webp", "d18.webp", "d19.webp"], music: "sol" },
  'dderby-1': { pages: ["dderby-1.webp", "dderby-2.webp", "dderby-3.webp"], music: "sim" },
  'deadlk01': { pages: ["deadlk01.webp", "deadlk02.webp", "deadlk03.webp", "deadlk04.webp", "deadlk05.webp", "deadlk06.webp", "deadlk07.webp", "deadlk08.webp", "deadlk09.webp", "deadlk10.webp"], music: "strat" },
  'dearth-1': { pages: ["dearth-1.webp", "dearth-2.webp", "dearth-3.webp"], music: "action" },
  'ecstat01': { pages: ["ecstat01.webp", "ecstat02.webp", "ecstat03.webp", "ecstat04.webp"], music: "adv" },
  'editors1': { pages: ["editors1.webp", "editors2.webp", "editors3.webp", "editors4.webp"], music: "edit" },
  'enemy-1': { pages: ["enemy-1.webp", "enemy-2.webp", "enemy-3.webp"], music: "strat" },
  'eradic01': { pages: ["eradic01.webp", "eradic02.webp", "eradic03.webp", "eradic04.webp"], music: "action" },
  'falcon-1': { pages: ["falcon-1.webp", "falcon-2.webp", "falcon-3.webp", "falcon-4.webp"], music: "sim" },
  'fiction1': { pages: ["fiction1.webp", "fiction2.webp", "fiction3.webp", "fiction4.webp", "fiction5.webp", "fiction6.webp"], music: "fiction" },
  'firef-1': { pages: ["firef-1.webp", "firef-2.webp", "firef-3.webp", "firef-4.webp", "firef-5.webp", "firef-6.webp"], music: "arcade" },
  'gender-1': { pages: ["gender-1.webp", "gender-2.webp", "gender-3.webp", "gender-4.webp", "gender-5.webp", "gender-6.webp"], music: "strat" },
  'genewrs1': { pages: ["genewrs1.webp", "genewrs2.webp", "genewrs3.webp", "genewrs4.webp"], music: "strat" },
  'hunter-1': { pages: ["hunter-1.webp", "hunter-2.webp", "hunter-3.webp"], music: "arcade" },
  'inter-1': { pages: ["inter-1.webp", "inter-2.webp", "inter-3.webp"], music: "sim" },
  'larry1': { pages: ["larry1.webp", "larry2.webp", "larry3.webp", "larry4.webp", "larry5.webp"], music: "larry" },
  'larry11': { pages: ["larry11.webp", "larry12.webp", "larry13.webp", "larry14.webp", "larry15.webp"], music: "larry" },
  'letter1': { pages: ["letter1.webp", "letter2.webp", "letter3.webp", "letter4.webp", "letter5.webp"], music: "edit" },
  'lol-1': { pages: ["lol-1.webp", "lol-2.webp"], music: "adv" },
  'magasin': { pages: ["magasin.webp"], music: "edit" },
  'mdk-1': { pages: ["mdk-1.webp", "mdk-2.webp", "mdk-3.webp", "mdk-4.webp", "mdk-5.webp"], music: "action" },
  'mechwr1': { pages: ["mechwr1.webp", "mechwr2.webp", "mechwr3.webp", "mechwr4.webp", "mechwr5.webp", "mechwr6.webp", "mechwr7.webp"], music: "sim" },
  'montez-1': { pages: ["montez-1.webp", "montez-2.webp", "montez-3.webp"], music: "adv" },
  'mortim01': { pages: ["mortim01.webp", "mortim02.webp", "mortim03.webp", "mortim04.webp", "mortim05.webp"], music: "logic" },
  'news1': { pages: ["news1.webp", "news2.webp", "news3.webp", "news4.webp", "news5.webp", "news6.webp", "news7.webp"], music: "news" },
  'norma-01': { pages: ["norma-01.webp", "norma-02.webp", "norma-03.webp", "norma-04.webp", "norma-05.webp", "norma-06.webp", "norma-07.webp", "norma-08.webp", "norma-09.webp", "norma-10.webp", "norma-11.webp", "norma-12.webp"], music: "sol" },
  'otred1': { pages: ["otred1.webp", "otred2.webp", "otred3.webp", "otred4.webp"], music: "edit" },
  'outlaw-1': { pages: ["outlaw-1.webp", "outlaw-2.webp", "outlaw-3.webp", "outlaw-4.webp"], music: "outl" },
  'phant-1': { pages: ["phant-1.webp", "phant-2.webp", "phant-3.webp"], music: "adv" },
  'quaqe1': { pages: ["quaqe1.webp", "quaqe2.webp", "quaqe3.webp", "quaqe4.webp", "quaqe5.webp", "quaqe6.webp", "quaqe7.webp"], music: "action" },
  'roullt1': { pages: ["roullt1.webp", "roullt2.webp", "roullt3.webp", "roullt4.webp", "roullt5.webp", "roullt6.webp", "roullt7.webp"], music: "rrulet" },
  'settlr-1': { pages: ["settlr-1.webp", "settlr-2.webp", "settlr-3.webp", "settlr-4.webp", "settlr-5.webp", "settlr-6.webp"], music: "strat" },
  'starcrf1': { pages: ["starcrf1.webp", "starcrf2.webp", "starcrf3.webp", "starcrf4.webp", "starcrf5.webp", "starcrf6.webp"], music: "strat" },
  'termin-1': { pages: ["termin-1.webp", "termin-2.webp", "termin-3.webp", "termin-4.webp"], music: "action" },
  'timecom1': { pages: ["timecom1.webp", "timecom2.webp", "timecom3.webp", "timecom4.webp", "timecom5.webp", "timecom6.webp", "timecom7.webp"], music: "action" },
  'unreal-1': { pages: ["unreal-1.webp", "unreal-2.webp", "unreal-3.webp", "unreal-4.webp", "unreal-5.webp", "unreal-6.webp"], music: "action" },
  'vfightr1': { pages: ["vfightr1.webp", "vfightr2.webp", "vfightr3.webp", "vfightr4.webp", "vfightr5.webp", "vfightr6.webp", "vfightr7.webp"], music: "action" },
  'work1': { pages: ["work0.webp", "work1.webp", "work2.webp"], music: "edit" },
  'z01': { pages: ["z01.webp", "z02.webp", "z03.webp", "z04.webp", "z05.webp", "z06.webp", "z07.webp", "z08.webp", "z09.webp", "z10.webp", "z11.webp"], music: "strat" },
  'zorkn-01': { pages: ["zorkn-01.webp", "zorkn-02.webp", "zorkn-03.webp", "zorkn-04.webp", "zorkn-05.webp", "zorkn-06.webp", "zorkn-07.webp", "zorkn-08.webp", "zorkn-09.webp", "zorkn-10.webp"], music: "sol" },
};

function onMainClick(hs) {
  if (hs.kind === 'exit') {
    playSfx('exit.wav');
    startSplashSequence();
    return;
  }
  if (hs.kind === 'menu') {
    openSubmenu(hs.id, hs.music);
    return;
  }
  if (hs.kind === 'article') {
    openArticle(hs.id, hs.music, hs.startPage || 0);
    return;
  }
}

function openSubmenu(id, musicTrack) {
  const conf = SUBMENUS[id];
  if (!conf) {
    return;
  }

  if (conf.mode === 'scroll') {

    const oldSnap = currentSnapshot();
    article = { id: id, pages: [conf.image.replace('assets/img/content/','')], music: musicTrack || conf.music_on_open, mode: 'scroll', height: conf.height || 3000 };
    currentPage = 0;
    isScrollMode = true;
    if (article.music) playMusic(article.music);
    showView('viewer');
    showScrollPage();
    const newSnap = currentSnapshot();
    if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
    else playSfx('anim1.wav');
    return;
  }
  if (currentView === 'submenu' && currentSubmenuId) {
    submenuStack.push(currentSubmenuId);
  } else {
    submenuStack = [];
  }
  const oldSnap = currentSnapshot();
  currentSubmenuId = id;
  submenuImg.src = conf.image;
  buildHotspots(submenuImage, conf.hotspots, onSubmenuClick);
  showView('submenu');
  if (musicTrack || conf.music_on_open) {
    playMusic(musicTrack || conf.music_on_open);
  }
  const newSnap = currentSnapshot();
  if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
  else playSfx('anim1.wav');
}

function showScrollPage() {
  pageImage.style.display = 'none';
  edgeTop.style.display = 'none';
  edgeBottom.style.display = 'none';
  tallScroll.style.display = 'block';
  const url = 'assets/img/content/' + (article.pages[0] || '');
  const h = article.height || 3000;

  tallContent.style.width = '1600px';
  tallContent.style.height = h + 'px';
  tallImage.style.width = '1600px';
  tallImage.style.height = h + 'px';
  tallImage.style.backgroundImage = 'url("' + url + '")';
  tallImage.style.backgroundSize = '1600px ' + h + 'px';
  tallContent.style.transform = '';
  tallScroll.scrollTop = 0;
  clearHotspots(viewViewer);
}

const SCROLL_SPEED = 5.85;
const EDGE_ZONE = 0.05;
let tallRaf = null, tallDir = 0;
function tallScrollStep() {
  if (tallDir === 0 || !isScrollMode) { tallRaf = null; return; }
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
tallScroll.addEventListener('mouseleave', function () { tallDir = 0; });

tallScroll.addEventListener('wheel', function (e) {
  if (!isScrollMode) return;
  e.stopPropagation();
}, { passive: true });
document.addEventListener('wheel', function (e) {
  if (isScrollMode || currentView === 'viewer') {

    if (e.target === document.body || e.target === document.documentElement) {
      e.preventDefault();
    }
  }
}, { passive: false });

function onSubmenuClick(hs) {
  if (hs.kind === 'menu') {
    openSubmenu(hs.id, hs.music);
    return;
  }
  if (hs.kind === 'article') {
    openArticle(hs.id, hs.music, hs.startPage || 0);
    return;
  }
  if (hs.kind === 'advert') {
    openAdvert(hs.advert_id);
    return;
  }
  if (hs.kind === 'demo') {
    openDemoPlaceholder();
    return;
  }
}

const AD_DEFS = {
  0: { pages: ['compulin.webp'], mode: 'ad' },
  1: { pages: ['gl.webp'], mode: 'ad' },
  2: { pages: ['multimed.webp'], mode: 'ad' },
  3: { pages: ['publishi.webp'], mode: 'ad' },
  4: { pages: ['pulse.webp'], mode: 'ad' },
  5: { pages: ['sec500.webp'], mode: 'ad' },
  6: { pages: ['tm1.webp', 'tm2.webp'], mode: 'ad-pages' },
  7: { pages: ['adv_pdp1.webp', 'adv_pdp2.webp'], mode: 'ad-pdp' },
  8: { pages: ['sbg_adv.webp'], mode: 'ad' },
  9: { pages: ['multexp2.webp'], mode: 'ad' }
};

const AD_POOL = [
  { type: 'img', src: 'assets/img/content/compulin.webp' },
  { type: 'img', src: 'assets/img/content/gl.webp' },
  { type: 'img', src: 'assets/img/content/multimed.webp' },
  { type: 'img', src: 'assets/img/content/publishi.webp' },
  { type: 'img', src: 'assets/img/content/pulse.webp' },
  { type: 'img', src: 'assets/img/content/sec500.webp' },
  { type: 'img', src: 'assets/img/content/tm1.webp' },
  { type: 'img', src: 'assets/img/content/tm2.webp' },
  { type: 'img', src: 'assets/img/content/adv_pdp1.webp', special: 'pdp' },
  { type: 'img', src: 'assets/img/content/adv_pdp2.webp' },
  { type: 'img', src: 'assets/img/content/sbg_adv.webp' },
  { type: 'img', src: 'assets/img/content/multexp2.webp' }
];

function openAdvert(aid) {
  const def = AD_DEFS[aid];
  if (!def) { return; }
  article = {
    id: 'ad' + aid,
    pages: def.pages.slice(),
    music: null,
    mode: def.mode
  };
  currentPage = 0;
  isScrollMode = false;
  showView('viewer');
  showPage(0);
}

function openDemoPlaceholder() {
  article = { id: 'demo', pages: [], music: null, mode: 'demo' };
  currentPage = 0;
  isScrollMode = false;
  showView('viewer');
  pageImage.style.display = 'block';
  tallScroll.style.display = 'none';
  pageImage.style.backgroundImage = 'url(../../shared/img/demo.webp)';
  edgeTop.className = 'edge-zone top inactive';
  edgeBottom.className = 'edge-zone bottom inactive';
  clearHotspots(viewViewer);
}

pageImage.addEventListener('click', function (e) {
  if (!article) return;
  if (article.mode === 'ad' || article.mode === 'demo') {
    e.preventDefault();
    e.stopPropagation();
    goBack();
  }

});

function openArticle(id, musicTrack, startPage) {
  startPage = startPage || 0;
  const conf = ARTICLES[id];
  if (!conf) {
    return;
  }
  if (txBusy || adBusy) return;
  const oldSnap = currentSnapshot();
  article = {
    id: id,
    pages: conf.pages,
    music: musicTrack || conf.music
  };
  currentPage = Math.max(0, Math.min(startPage, article.pages.length - 1));
  nestedParent = null;
  isScrollMode = false;
  if (article.music) playMusic(article.music);
  showView('viewer');
  showPage(currentPage);
  const newSnap = currentSnapshot();
  if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
  else playSfx('anim1.wav');
}

function showPage(n) {
  if (!article || !article.pages.length) return;
  currentPage = n;
  isScrollMode = false;
  const file = article.pages[n];
  const stem = file.replace(/\.webp$/i, '');
  const url = 'assets/img/content/' + file;
  pageImage.style.display = 'block';
  tallScroll.style.display = 'none';
  edgeTop.style.display = 'block';
  edgeBottom.style.display = 'block';
  pageImage.style.backgroundImage = 'url(' + url + ')';
  const mode = article.mode || '';
  const canPage = (mode === '' || mode === 'ad-pages');
  edgeTop.className = 'edge-zone top' + (canPage && n > 0 ? ' active' : ' inactive');
  edgeBottom.className = 'edge-zone bottom' + (canPage && n < article.pages.length - 1 ? ' active' : ' inactive');
  clearHotspots(viewViewer);

  if (mode === 'ad-pdp' && n === 0) {
    const el = document.createElement('div');
    el.className = 'hotspot';

    el.style.left = '235px';
    el.style.top = '1090px';
    el.style.width = '1123px';
    el.style.height = '73px';
    el.style.cursor = 'url("../../shared/img/cursor-green.webp") 2 8, auto';
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      if (currentPage < article.pages.length - 1) showPage(currentPage + 1);
    });
    viewViewer.appendChild(el);
    return;
  }
  if (mode === 'ad' || mode === 'ad-pages' || mode === 'ad-pdp' || mode === 'demo') {
    return;
  }

  const list = PAGE_HOTSPOTS[stem] || [];
  list.forEach(function (hs) {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.style.left = hs.x + 'px';
    el.style.top = hs.y + 'px';
    el.style.width = hs.w + 'px';
    el.style.height = hs.h + 'px';
    if (hs.kind === 'screenshot') {
      el.style.cursor = 'url("../../shared/img/cursor-zoom.webp") 16 14, auto';
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        openScreenshotPopup(hs);
      });
    } else if (hs.kind === 'video') {
      el.style.cursor = 'url("../../shared/img/cursor-video.webp") 16 14, auto';
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        const info = VIDEO_BY_PAGE[stem];
        if (info) openVkVideo(info);
      });
    } else if (hs.kind === 'article_link') {
      el.style.cursor = 'url("../../shared/img/cursor-green.webp") 2 8, auto';
      el.addEventListener('click', function (e) {
        e.stopPropagation();

        if (stem === 'adv_pdp1' && article.pages.length > 1) showPage(1);
      });
    }
    viewViewer.appendChild(el);
  });
}

let popupBusy = false;
function openScreenshotPopup(hs) {
  if (!hs || !hs.src || popupBusy) return;
  popupBusy = true;
  playSfx('anim1.wav');
  const src = 'assets/img/content/' + hs.src;
  popupImage.style.backgroundImage = 'url("' + src + '")';
  popupImage.style.backgroundSize = '100% 100%';
  popupImage.style.backgroundRepeat = 'no-repeat';
  popupImage.style.backgroundPosition = 'center center';

  popupImage.style.transition = 'none';
  popupImage.style.left = (hs.x || 0) + 'px';
  popupImage.style.top = (hs.y || 0) + 'px';
  popupImage.style.width = (hs.w || 400) + 'px';
  popupImage.style.height = (hs.h || 250) + 'px';
  popupOverlay.style.background = 'rgba(0,0,0,0)';
  popupOverlay.classList.add('visible');
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
    popupImage.style.backgroundSize = '1600px 1200px';
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
popupHit.addEventListener('click', function (e) {
  e.preventDefault();
  closePopup();
});

function goPage(dir) {
  if (txBusy || !article) return;
  const next = currentPage + dir;
  if (next < 0 || next >= article.pages.length) return;
  const oldSnap = currentSnapshot();
  showPage(next);
  const newSnap = currentSnapshot();
  if (oldSnap && newSnap) runTransition(oldSnap, newSnap, dir > 0 ? 'next' : 'prev', null);
  else playSfx('anim1.wav');
}
function pagePrev() { goPage(-1); }
function pageNext() { goPage(1); }

edgeTop.addEventListener('click', function () {
  if (edgeTop.classList.contains('active')) pagePrev();
});
edgeBottom.addEventListener('click', function () {
  if (edgeBottom.classList.contains('active')) pageNext();
});

document.addEventListener('keydown', function (e) {
  if (currentView !== 'viewer') return;
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); pagePrev(); }
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); pageNext(); }
});

function goBack() {
  if (txBusy) return;
  if (currentView === 'splash') { advanceSplash(); return; }
  if (adBusy) { hideAdInterstitial(); return; }
  if (popupOverlay.classList.contains('visible')) { closePopup(); return; }
  if (videoOverlay.classList.contains('visible')) { closeVideo(); return; }
  if (overlayMode) { closeOverlay(); return; }

  if (currentView === 'viewer') {
    if (nestedParent) { nestedParent = null; return; }
    const isAdArticle = article && (article.mode === 'ad' || article.mode === 'ad-pages' || article.mode === 'ad-pdp' || article.mode === 'demo');
    const pageSnap = currentSnapshot();

    function clearViewer() {
      isScrollMode = false;
      tallDir = 0;
      pageImage.style.display = 'block';
      pageImage.style.backgroundImage = '';
      tallScroll.style.display = 'none';
      tallImage.style.backgroundImage = '';
      tallImage.style.height = '';
      edgeTop.style.display = 'block';
      edgeBottom.style.display = 'block';
      article = null;
      clearHotspots(viewViewer);
      closeRightPanel();
    }

    if (currentSubmenuId && SUBMENUS[currentSubmenuId] && SUBMENUS[currentSubmenuId].mode !== 'scroll') {

      function goSub(adSrc) {
        clearViewer();
        showView('submenu');
        const conf = SUBMENUS[currentSubmenuId];
        submenuImg.src = conf.image;
        buildHotspots(submenuImage, conf.hotspots, onSubmenuClick);
        const newSnap = currentSnapshot();
        const fromSnap = adSrc ? makeSnap(adSrc, STAGE_H, 0) : pageSnap;
        if (fromSnap && newSnap) runTransition(fromSnap, newSnap, 'prev', null);
      }
      if (isAdArticle) goSub(null);
      else showRandomAd(goSub);
    } else {

      function goMenu(adSrc) {
        clearViewer();
        currentSubmenuId = null;
        submenuStack = [];
        showView('menu');
        buildHotspots(menuImage, MAIN_HOTSPOTS, onMainClick);
        const newSnap = currentSnapshot();
        if (adSrc) {
          const fromSnap = makeSnap(adSrc, STAGE_H, 0);
          if (fromSnap && newSnap) runTransition(fromSnap, newSnap, 'prev', null);
        }
      }
      if (isAdArticle) goMenu(null);
      else showRandomAd(goMenu);
    }
    return;
  }

  if (currentView === 'submenu') {

    if (submenuStack.length) {
      const parent = submenuStack.pop();
      const oldSnap = currentSnapshot();
      currentSubmenuId = parent;
      const conf = SUBMENUS[parent];
      function applyParent() {
        if (conf) {
          submenuImg.src = conf.image;
          buildHotspots(submenuImage, conf.hotspots, onSubmenuClick);
          showView('submenu');
        }
      }
      fadeBlackBrief(function () {
        applyParent();
      });
    } else {
      fadeBlackBrief(function () {
        currentSubmenuId = null;
        showView('menu');
        buildHotspots(menuImage, MAIN_HOTSPOTS, onMainClick);
      });
    }
    return;
  }
}

function closeOverlay() {
  hideOverlay();
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    goBack();
  }
});
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  goBack();
});

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
  if (currentView !== 'viewer' || isScrollMode) return;
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
  return (article && article.pages) ? article.pages.length : 0;
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
  let keys = multi ? ['1','2','3','4','5','6','7','8','9','0','-'] : [];
  if (!multi) for (let i = 1; i <= n; i++) keys.push(String(i));
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
  if (num1based < 1 || num1based > n) { resetPgBtns(); return; }
  const idx = num1based - 1;
  if (idx === currentPage) { resetPgBtns(); return; }
  showPage(idx);
  resetPgBtns();
  closeRightPanel();
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
  if (currentView === 'viewer' && !isScrollMode) {
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
document.addEventListener('mouseup', function () { draggingSlider = null; });

function showOverlay(url, mode) {
  closeLeftPanel();
  closeRightPanel();
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
    overlayScreen.style.backgroundImage = '';
    overlayMode = null;
    if (wasBoss && currentTrack) {
      try { music.play().catch(function(){}); } catch (e) {}
    }
  }, 400);
}
document.getElementById('btnHelp').addEventListener('click', function (e) {
  e.preventDefault(); e.stopPropagation();
  showOverlay('assets/img/content/help.webp', 'help');
});
document.getElementById('btnBoss').addEventListener('click', function (e) {
  e.preventDefault(); e.stopPropagation();
  showOverlay('assets/img/content/boss.webp', 'boss');
  try { music.pause(); } catch (err) {}
});
document.getElementById('btnOs').addEventListener('click', function (e) {
  e.preventDefault(); e.stopPropagation();
  closeLeftPanel();
  playSfx('exit.wav');
  startSplashSequence();
});
document.getElementById('overlayHit').addEventListener('click', function (e) {
  e.preventDefault();
  hideOverlay();
});

const VIDEO_BY_PAGE = {
  'gender-2': { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239138&hash=74c732e0c37d8354&hd=3&autoplay=1', w: 1280, h: 720 },
  'inter-3':  { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239133&hash=e57bcbc15fa31358&hd=3&autoplay=1', w: 1280, h: 720 },
  'phant-2':  { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239135&hash=c0b18a266d394893&hd=3&autoplay=1', w: 1280, h: 720 },
  'settlr-1': { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239136&hash=5e166154eb1b3d5a&hd=3&autoplay=1', w: 1280, h: 720 },
  'timecom3': { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239141&hash=774074eaa73ab89a&hd=3&autoplay=1', w: 1280, h: 720 },
  'mechwr2':  { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239134&hash=d6b26fb279ff0353&hd=3&autoplay=1', w: 1280, h: 720 },
  'quaqe1':   { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239132&hash=a5a9b49e5f99a853&hd=3&autoplay=1', w: 1280, h: 720 },
  'roullt1':  { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239140&hash=7e5e9289f5db716e&hd=3&autoplay=1', w: 1280, h: 720 },
  '48':       { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239137&hash=887ad5c13fb54b49&hd=3&autoplay=1', w: 1280, h: 720 },
  'gender-1': { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239139&hash=7fba8e98d32005c7&hd=3&autoplay=1', w: 1280, h: 720 }
};

function openVkVideo(info) {
  if (!info || !info.src) return;
  closeRightPanel();
  closePopup();
  try { music.pause(); } catch (e) {}
  const vw = info.w || 1280, vh = info.h || 720;
  const maxW = 1500, maxH = 1100;
  const scale = Math.min(maxW / vw, maxH / vh, 1);
  const dispW = Math.round(vw * scale);
  const dispH = Math.round(vh * scale);
  videoFrameWrap.style.width = dispW + 'px';
  videoFrameWrap.style.height = dispH + 'px';
  videoFrameWrap.style.left = '50%';
  videoFrameWrap.style.top = '50%';
  videoFrameWrap.style.transform = 'translate(-50%, -50%)';
  videoFrameWrap.style.position = 'absolute';
  videoFrameWrap.style.boxShadow = '0 0 40px #000';
  videoFrameWrap.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.src = info.src;
  iframe.width = String(dispW);
  iframe.height = String(dispH);
  iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('referrerpolicy', 'no-referrer');
  iframe.style.border = '0';
  iframe.style.width = dispW + 'px';
  iframe.style.height = dispH + 'px';
  iframe.style.background = '#000';
  videoFrameWrap.appendChild(iframe);
  videoOverlay.classList.add('visible');
}
function closeVideo() {
  videoOverlay.classList.remove('visible');
  videoFrameWrap.innerHTML = '';
  if (music.paused && currentTrack) music.play().catch(function () {});
}
videoOverlay.addEventListener('click', function (e) {
  if (e.target === videoOverlay) {
    e.preventDefault();
    closeVideo();
  }
});
videoFrameWrap.addEventListener('click', function (e) { e.stopPropagation(); });

const SPLASH_KEY = 'sbg-1996-06-splash';
let splashStep = 0;
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
  buildHotspots(menuImage, MAIN_HOTSPOTS, onMainClick);
  if (!currentTrack) playMusic('intro');
}
function startSplashSequence() {
  viewMenu.style.display = 'none';
  viewSubmenu.style.display = 'none';
  viewViewer.style.display = 'none';
  currentView = 'splash';
  splashStep = 1;
  splashBusy = false;
  setSplashBg('assets/img/content/title_6.webp');
  splashImg.style.opacity = '1';
  splashOverlay.classList.add('visible');
  playMusic('intro');
}
function advanceSplash() {
  if (splashBusy || splashStep === 0) return;
  if (splashStep === 1) {
    splashStep = 2;
    fadeSplashTo('assets/img/content/compulin.webp', null);
  } else if (splashStep === 2) {
    splashBusy = true;
    splashImg.style.opacity = '0';
    setTimeout(function () {
      enterMenuFromSplash();
      splashBusy = false;
    }, 450);
  }
}
if (splashHit) {
  splashHit.addEventListener('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    advanceSplash();
  });
  splashHit.addEventListener('mousedown', function (e) { e.preventDefault(); });
}
if (splashOverlay) {
  splashOverlay.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  splashOverlay.addEventListener('dragstart', function (e) { e.preventDefault(); });
}

buildHotspots(menuImage, MAIN_HOTSPOTS, onMainClick);
try {
  if (!sessionStorage.getItem(SPLASH_KEY)) {
    sessionStorage.setItem(SPLASH_KEY, '1');
    startSplashSequence();
  } else {
    showView('menu');
    if (!currentTrack) playMusic('intro');
  }
} catch (err) {
  startSplashSequence();
}

})();
