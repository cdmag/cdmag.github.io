(function () {
      const STAGE_W = 1600, STAGE_H = 1200;
      const MUSIC_BASE = 'https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/music/sbg-gem/1995/02-03/';
      let musicVol = 0.10;  // session music volume 0..1
      let sfxVol = 0.10;    // session sfx volume 0..1
      const MUSIC_VOLUME = 0.10; // legacy default
      const SCROLL_SPEED = 5.85;
      const EDGE_ZONE = 0.10;

      const stage = document.getElementById('stage');
      const viewMenu = document.getElementById('view-menu');
      const viewViewer = document.getElementById('view-viewer');
      const menuScroll = document.getElementById('menuScroll');
      const pageImage = document.getElementById('pageImage');
      const edgeTop = document.getElementById('edgeTop');
      const edgeBottom = document.getElementById('edgeBottom');
      const tallScroll = document.getElementById('tallScroll');
      const tallContent = document.getElementById('tallContent');
      const tallImage = document.getElementById('tallImage');
      let savedListScroll = 0;
      const popupOverlay = document.getElementById('popupOverlay');
      const popupImage = document.getElementById('popupImage');

      let article = null;
      let pageHotspotEls = [];
      let listHotspotEls = [];
      let currentPage = 0;
      let isScrollMode = false;
      let isListMode = false;
      let viewerSubView = 'page'; // 'list' | 'page'
      let currentView = 'menu'; // 'menu' | 'viewer'

      // ========== MUSIC (never destroyed) ==========
      const music = new Audio();
      music.loop = true;
      music.volume = musicVol;
      let currentTrack = null;

      function playMusic(trackName) {
        if (!trackName) return;
        const fullUrl = MUSIC_BASE + trackName;
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


      // ========== TRANSITIONS ==========
      const SOUND_BASE = 'assets/sound/';
      const TX_DURATION = 1000; // ms
      const MENU_FULL_H = 4350;
      const sfxCache = {};
      let txBusy = false;
      const txOverlay = document.getElementById('tx-overlay');

      function playSfx(name) {
        if (!name) return;
        try {
          // fresh Audio each time so overlapping SFX work
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
          return makeSnap('assets/img/ui/main-menu.webp', MENU_FULL_H, menuScroll.scrollTop);
        }
        if (!article) return null;
        if (isListMode && viewerSubView === 'list') {
          const h = Math.round((article.listHeight || 900) * 2.5);
          return makeSnap(article.listImage, h, tallScroll.scrollTop);
        }
        if (isScrollMode && article.pages && article.pages[currentPage]) {
          const pg = article.pages[currentPage];
          const h = Math.round((pg.height || 1500) * 2.5);
          return makeSnap(pg.image, h, tallScroll.scrollTop);
        }
        if (article.pages && article.pages[currentPage]) {
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
        const types = [0, 1, 2, 3, 4, 5];
        const t = types[Math.floor(Math.random() * types.length)];
        return { type: t, dir: dir || 'next' };
      }

      function runTransition(oldSnap, newSnap, dir, onDone) {
        if (txBusy) { if (onDone) onDone(); return; }
        if (!oldSnap || !newSnap || !oldSnap.url || !newSnap.url) { if (onDone) onDone(); return; }
        // same visible frame — skip
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
          // anim1: halves of NEW slide from left & right
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
          // anim2: old compress vertical, then new expand
          playSfx('anim2.wav');
          const oldEl = document.createElement('div');
          oldEl.className = 'tx-layer';
          applySnap(oldEl, oldSnap);
          oldEl.style.transformOrigin = 'center center';
          const newEl = document.createElement('div');
          newEl.className = 'tx-layer';
          applySnap(newEl, newSnap);
          newEl.style.transformOrigin = 'center center';
          newEl.style.transform = 'scaleY(0)';
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
          // anim3: new from top (prev) or bottom (next)
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
          // anim4: new slides up from bottom
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
          // anim5: both slide left
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
        } else {
          // fade silent
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

      // ========== STAGE FIT ==========
      function fitStage() {
        const ww = window.innerWidth, hh = window.innerHeight;
        const scale = Math.min(ww / STAGE_W, hh / STAGE_H);
        stage.style.transform = 'scale(' + scale + ')';
        stage.style.left = ((ww - STAGE_W * scale) / 2) + 'px';
        stage.style.top  = ((hh - STAGE_H * scale) / 2) + 'px';
        updateCursorScale(ww, hh);
      }

      // --- Cursor size: full at ≥2K, half below (nearest-neighbor) ---
      const CURSOR_DEFS = {
        red:   { src: 'assets/img/ui/cursor-red.webp',   hx: 2,  hy: 16 },
        green: { src: 'assets/img/ui/cursor-green.webp', hx: 2,  hy: 16 },
        zoom:  { src: 'assets/img/ui/cursor-zoom.webp',  hx: 16, hy: 14 },
        prev:  { src: 'assets/img/ui/page-prev.webp',    hx: 46, hy: 8  },
        next:  { src: 'assets/img/ui/page-next.webp',    hx: 46, hy: 44 }
      };
      const cursorImgs = {};
      const cursorBlobUrls = { full: {}, half: {} };
      let cursorScaleMode = null; // 'full' | 'half'
      let cursorsReady = false;

      function loadCursorImages() {
        const keys = Object.keys(CURSOR_DEFS);
        let left = keys.length;
        keys.forEach(function (k) {
          const img = new Image();
          img.onload = function () {
            cursorImgs[k] = img;
            // full-size blob (original)
            cursorBlobUrls.full[k] = CURSOR_DEFS[k].src;
            // half-size nearest-neighbor
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
        // Use physical pixels so OS display scaling (e.g. 200% on 4K) is not mistaken for 1080p.
        // CSS innerWidth/height shrink under DPI scaling; multiply by devicePixelRatio.
        const dpr = window.devicePixelRatio || 1;
        const physW = Math.max(window.screen.width || 0, ww) * dpr;
        const physH = Math.max(window.screen.height || 0, hh) * dpr;
        // Below 2K physical (2560×1440) → half-size cursors
        const mode = (physW < 2560 && physH < 1440) ? 'half' : 'full';
        if (mode === cursorScaleMode && cursorsReady) return;
        if (!cursorsReady && mode === 'full') {
          // defaults already in CSS
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
        setCur('prev', 'prev');
        setCur('next', 'next');
      }

      loadCursorImages();
      fitStage();
      window.addEventListener('resize', fitStage);

      // ========== MENU ==========
      const HOTSPOTS = [
        { id: 'ot-redakcii',          label: 'От редакции',                          x: 220, y: 255,  w: 1160, h: 40 },
        { id: 'hotite-zarabotat',     label: 'Хотите заработать?',                   x: 220, y: 310,  w: 1160, h: 40 },
        { id: 'email',                label: 'E-mail',                               x: 220, y: 367,  w: 1160, h: 40 },
        { id: 'anigraf-95',           label: "Аниграф'95",                           x: 220, y: 425,  w: 1160, h: 40 },
        { id: 'wanted-gamemakers',    label: 'Wanted: Gamemakers',                   x: 220, y: 487,  w: 1160, h: 40 },
        { id: 'doom-championship',    label: 'II-й Российский чемпионат по DOOM',    x: 220, y: 547,  w: 1160, h: 40 },
        { id: 'dist-sites',           label: 'Dist sites',                           x: 220, y: 610,  w: 1160, h: 40 },
        { id: 'credits',              label: 'Credits',                              x: 220, y: 670,  w: 1160, h: 40 },
        { id: 'reklama',              label: 'Реклама',                              x: 220, y: 726,  w: 1160, h: 40 },
        { id: 'korotko-o-novom',      label: 'Коротко о новом',                      x: 220, y: 864,  w: 1160, h: 40 },
        { id: 'obzor-250-igr',        label: 'Обзор 250 игр',                        x: 220, y: 996,  w: 1160, h: 74 },
        { id: 'rating-populyarnosti', label: 'Рейтинг популярности игр',             x: 220, y: 1161, w: 1160, h: 41 },
        { id: 'interview-hopper',     label: 'Интервью с Деннисом Хоппером: HELL',   x: 220, y: 1303, w: 1160, h: 40 },
        { id: 'obzor-45-manipulyatorov', label: 'Обзор 45 игровых манипуляторов',    x: 220, y: 1438, w: 1160, h: 77 },
        { id: 'mortal-kombat-3',      label: 'Mortal Kombat III',                    x: 220, y: 1613, w: 1160, h: 77 },
        { id: 'heretic-3',            label: 'Heretic III',                          x: 220, y: 1723, w: 1160, h: 77 },
        { id: 'hi-octane',            label: 'HI-OCTANE',                            x: 220, y: 1843, w: 1160, h: 42 },
        { id: 'mechwarrior-2',        label: 'MechWarrior II',                       x: 220, y: 1920, w: 1160, h: 40 },
        { id: 'fx-fighter',           label: 'FX Fighter',                           x: 220, y: 1993, w: 1160, h: 42 },
        { id: 'fade-to-black',        label: 'Fade to Black',                        x: 220, y: 2060, w: 1160, h: 40 },
        { id: 'quake-fight',          label: 'Quake: Fight for justice',             x: 220, y: 2136, w: 1160, h: 41 },
        { id: 'terminal-velocity',    label: 'Terminal Velocity',                    x: 220, y: 2201, w: 1160, h: 40 },
        { id: 'tank-commander',       label: 'Tank Commander',                       x: 220, y: 2268, w: 1160, h: 40 },
        { id: 'overdrive',            label: 'Overdrive',                            x: 220, y: 2423, w: 1160, h: 74 },
        { id: 'death-gate',           label: 'Death Gate',                           x: 220, y: 2613, w: 1160, h: 40 },
        { id: 'teenagent',            label: 'TeenAgent',                            x: 220, y: 2681, w: 1160, h: 84 },
        { id: 'kyrandia-3',           label: 'Kyrandia III',                         x: 220, y: 2796, w: 1160, h: 41 },
        { id: 'daggerfall',           label: 'Daggerfall',                           x: 220, y: 2943, w: 1160, h: 71 },
        { id: 'dungeon-master-2',     label: 'Dungeon Master II',                    x: 220, y: 3048, w: 1160, h: 41 },
        { id: 'biprolex',             label: 'BIPROLEX',                             x: 220, y: 3193, w: 1160, h: 71 },
        { id: 'simtower',             label: 'SimTower',                             x: 220, y: 3365, w: 1160, h: 72 },
        { id: 'warcraft-2',           label: 'Warcraft II',                          x: 220, y: 3540, w: 1160, h: 40 },
        { id: 'command-conquer',      label: 'Command & Conquer',                    x: 220, y: 3607, w: 1160, h: 40 },
        { id: 'metal-lords',          label: 'Metal Lords',                          x: 220, y: 3677, w: 1160, h: 40 },
        { id: 'ufo-2',                label: 'UFO II',                               x: 220, y: 3743, w: 1160, h: 76 },
        { id: 'nba-live-95',          label: "NBA Live'95",                          x: 220, y: 3925, w: 1160, h: 42 },
        { id: 'nhl-hockey-95',        label: 'NHL Hockey 95',                        x: 220, y: 3985, w: 1160, h: 40 },
        { id: 'vdoomatsya',           label: 'вDOOMаться',                           x: 220, y: 4120, w: 1160, h: 77 },
        { id: 'star-control-2',       label: 'Star Control 2',                       x: 220, y: 4292, w: 1160, h: 40 }
      ];

      const READY = [
        'ot-redakcii','hotite-zarabotat','email','anigraf-95',
        'wanted-gamemakers','doom-championship','dist-sites','credits','reklama','korotko-o-novom',
        'obzor-250-igr','rating-populyarnosti','interview-hopper','obzor-45-manipulyatorov',
        'mortal-kombat-3','heretic-3','hi-octane','mechwarrior-2','fx-fighter','fade-to-black','quake-fight','terminal-velocity','tank-commander','overdrive','death-gate','teenagent','kyrandia-3','daggerfall','dungeon-master-2','biprolex','simtower','warcraft-2','command-conquer','metal-lords','ufo-2','nba-live-95','nhl-hockey-95','vdoomatsya','star-control-2'
      ];

      const menuImage = document.getElementById('menuImage');
      HOTSPOTS.forEach(function (hs) {
        const el = document.createElement('div');
        el.className = 'hotspot';
        el.dataset.id = hs.id;
        el.style.cssText = 'left:'+hs.x+'px;top:'+hs.y+'px;width:'+hs.w+'px;height:'+hs.h+'px';
        el.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          if (READY.indexOf(hs.id) !== -1) openArticle(hs.id);
          else console.log('No content yet:', hs.id);
        });
        menuImage.appendChild(el);
      });

      // Menu edge auto-scroll
      let menuRaf = null, menuDir = 0;
      function menuScrollStep() {
        if (menuDir === 0) { menuRaf = null; return; }
        menuScroll.scrollTop += menuDir * SCROLL_SPEED;
        if (menuScroll.scrollTop < 0) menuScroll.scrollTop = 0;
        const max = menuScroll.scrollHeight - menuScroll.clientHeight;
        if (menuScroll.scrollTop > max) menuScroll.scrollTop = max;
        menuRaf = requestAnimationFrame(menuScrollStep);
      }
      menuScroll.addEventListener('mousemove', function (e) {
        if (currentView !== 'menu') return;
        const rect = menuScroll.getBoundingClientRect();
        const y = e.clientY - rect.top, h = rect.height, edge = h * EDGE_ZONE;
        if (y <= edge) {
          if (menuDir !== -1) { menuDir = -1; if (!menuRaf) menuRaf = requestAnimationFrame(menuScrollStep); }
          menuScroll.classList.add('edge-active');
        } else if (y >= h - edge) {
          if (menuDir !== 1) { menuDir = 1; if (!menuRaf) menuRaf = requestAnimationFrame(menuScrollStep); }
          menuScroll.classList.add('edge-active');
        } else {
          menuDir = 0;
          menuScroll.classList.remove('edge-active');
        }
      });
      menuScroll.addEventListener('mouseleave', function () {
        menuDir = 0;
        menuScroll.classList.remove('edge-active');
      });

      // ========== VIEWER ==========
      async function openArticle(id) {
        if (txBusy) return;
        try {
          const resp = await fetch('assets/data/articles/' + id + '.json');
          if (!resp.ok) throw new Error('not found');
          const data = await resp.json();
          const oldSnap = currentSnapshot();

          article = data;
          currentPage = 0;
          isScrollMode = article.mode === 'scroll';
          isListMode = article.mode === 'list';
          viewerSubView = isListMode ? 'list' : 'page';
          savedListScroll = 0;
          viewMenu.style.display = 'none';
          viewViewer.style.display = 'block';
          currentView = 'viewer';
          if (isListMode) showList();
          else { setupViewerMode(); showPage(0); }
          if (article.music) playMusic(article.music);

          const newSnap = currentSnapshot();
          if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
        } catch (err) {
          console.error(err);
        }
      }

      function clearListHotspots() {
        listHotspotEls.forEach(function (el) { el.remove(); });
        listHotspotEls = [];
      }

      function showList() {
        // Show the tall list image with item hotspots
        isScrollMode = true;
        viewerSubView = 'list';
        pageImage.style.display = 'none';
        edgeTop.style.display = 'none';
        edgeBottom.style.display = 'none';
        tallScroll.style.display = 'block';
        clearPageHotspots();
        clearListHotspots();
        closePopup();

        const origW = article.listWidth || 640;
        const origH = article.listHeight || 900;
        const dispW = Math.round(origW * 2.5);
        const dispH = Math.round(origH * 2.5);
        tallContent.style.width = dispW + 'px';
        tallContent.style.height = dispH + 'px';
        tallImage.style.width = dispW + 'px';
        tallImage.style.height = dispH + 'px';
        tallImage.style.backgroundImage = 'url("' + article.listImage + '")';
        tallImage.style.backgroundSize = dispW + 'px ' + dispH + 'px';

        // Restore scroll position (or 0 on first open)
        tallScroll.scrollTop = savedListScroll;

        // Item hotspots — inside tallContent so they scroll with the image
        (article.items || []).forEach(function (item) {
          const el = document.createElement('div');
          el.className = 'page-hotspot';
          el.style.cssText = 'left:'+item.x+'px;top:'+item.y+'px;width:'+item.w+'px;height:'+item.h+'px';
          el.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openListItem(item.pageIndex);
          });
          tallContent.appendChild(el);
          listHotspotEls.push(el);
        });
      }

      function openListItem(pageIndex) {
        if (txBusy) return;
        const oldSnap = currentSnapshot();
        savedListScroll = tallScroll.scrollTop;
        clearListHotspots();
        isScrollMode = false;
        viewerSubView = 'page';
        setupViewerMode();
        showPage(pageIndex);
        const newSnap = currentSnapshot();
        if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
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

      function showPage(idx) {
        if (!article || !article.pages || !article.pages[idx]) return;
        currentPage = idx;
        const page = article.pages[idx];
        clearPageHotspots();
        closePopup();

        if (isScrollMode && !isListMode) {
          // classic scroll mode (dist-sites)
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
          const canPrev = currentPage > 0;
          const canNext = currentPage < article.pages.length - 1;
          edgeTop.classList.toggle('active', canPrev);
          edgeTop.classList.toggle('inactive', !canPrev);
          edgeBottom.classList.toggle('active', canNext);
          edgeBottom.classList.toggle('inactive', !canNext);

          (page.hotspots || []).forEach(function (hs) {
            const el = document.createElement('div');
            el.className = hs.popup ? 'page-hotspot zoom' : 'page-hotspot';
            el.style.cssText = 'left:'+hs.x+'px;top:'+hs.y+'px;width:'+hs.w+'px;height:'+hs.h+'px';
            el.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              if (hs.popup) openPopup(hs.popup);
            });
            viewViewer.appendChild(el);
            pageHotspotEls.push(el);
          });
        }
      }

      function openPopup(src) {
        closePanel();
        popupImage.style.backgroundImage = 'url("' + src + '")';
        popupOverlay.classList.add('visible');
      }
      function closePopup() {
        popupOverlay.classList.remove('visible');
        popupImage.style.backgroundImage = 'none';
      }

      function goPrev() {
        if (txBusy || !article || currentPage <= 0) return;
        const oldSnap = currentSnapshot();
        showPage(currentPage - 1);
        const newSnap = currentSnapshot();
        if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'prev', null);
      }
      function goNext() {
        if (txBusy || !article || currentPage >= article.pages.length - 1) return;
        const oldSnap = currentSnapshot();
        showPage(currentPage + 1);
        const newSnap = currentSnapshot();
        if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'next', null);
      }

      edgeTop.addEventListener('click', function (e) { e.preventDefault(); goPrev(); });
      edgeBottom.addEventListener('click', function (e) { e.preventDefault(); goNext(); });

      // Tall scroll edge auto-scroll
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
          tallScroll.classList.add('edge-active');
        } else if (y >= h - edge) {
          if (tallDir !== 1) { tallDir = 1; if (!tallRaf) tallRaf = requestAnimationFrame(tallScrollStep); }
          tallScroll.classList.add('edge-active');
        } else {
          tallDir = 0;
          tallScroll.classList.remove('edge-active');
        }
      });
      tallScroll.addEventListener('mouseleave', function () {
        tallDir = 0;
        tallScroll.classList.remove('edge-active');
      });

      // ========== BACK NAVIGATION ==========
      function backToMenu() {
        if (txBusy) return;
        const oldSnap = currentSnapshot();
        closePopup();
        clearPageHotspots();
        clearListHotspots();
        viewViewer.style.display = 'none';
        viewMenu.style.display = 'block';
        currentView = 'menu';
        isListMode = false;
        isScrollMode = false;
        viewerSubView = 'page';
        article = null;
        const newSnap = currentSnapshot(); // uses preserved menuScroll.scrollTop
        if (oldSnap && newSnap) runTransition(oldSnap, newSnap, 'prev', null);
      }

      function backFromViewer() {
        if (txBusy) return;
        // Hierarchy: popup → page → list → menu
        if (popupOverlay.classList.contains('visible')) {
          closePopup();
          return;
        }
        if (isListMode && viewerSubView === 'page') {
          // return to list menu — no animation
          showList();
          return;
        }
        backToMenu();
      }

      popupOverlay.addEventListener('click', function (e) {
        e.preventDefault();
        closePopup();
      });



      // ========== SPLASH ==========
      const SPLASH_KEY = 'sbg-gem-1995-02-03-splash';
      const viewSplash = document.getElementById('view-splash');
      const splashImage = document.getElementById('splash-image');
      let splashStep = 0; // 0=idle, 1=splash1, 2=splash2
      let splashBusy = false;

      function setSplashBg(url) {
        splashImage.style.backgroundImage = url ? 'url("' + url + '")' : 'none';
      }

      function fadeSplashTo(url, then) {
        splashBusy = true;
        splashImage.style.opacity = '0';
        setTimeout(function () {
          setSplashBg(url);
          // reflow
          void splashImage.offsetWidth;
          splashImage.style.opacity = '1';
          setTimeout(function () {
            splashBusy = false;
            if (then) then();
          }, 450);
        }, 450);
      }

      function enterMenuFromSplash() {
        splashStep = 0;
        viewSplash.classList.remove('visible');
        viewSplash.style.display = 'none';
        viewMenu.style.display = 'block';
        currentView = 'menu';
        // one-shot splash.wav
        playSfx('splash.wav');
        try { sessionStorage.setItem(SPLASH_KEY, '1'); } catch (e) {}
      }

      function startSplashSequence() {
        // hide everything else
        closePanel();
        closePopup();
        viewViewer.style.display = 'none';
        viewMenu.style.display = 'none';
        currentView = 'splash';
        article = null;
        splashStep = 1;
        splashBusy = false;
        setSplashBg('assets/img/content/splash1.webp');
        splashImage.style.opacity = '1';
        viewSplash.style.display = 'block';
        viewSplash.classList.add('visible');
        // intro music
        playMusic('intro.opus');
      }

      function advanceSplash() {
        if (splashBusy || splashStep === 0) return;
        if (splashStep === 1) {
          splashStep = 2;
          fadeSplashTo('assets/img/content/splash2.webp', null);
        } else if (splashStep === 2) {
          splashBusy = true;
          splashImage.style.opacity = '0';
          setTimeout(function () {
            enterMenuFromSplash();
            splashBusy = false;
          }, 450);
        }
      }

      const splashHit = document.getElementById('splash-hit');
      splashHit.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        advanceSplash();
      });
      // block browser image UI / drag on splash
      viewSplash.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      viewSplash.addEventListener('dragstart', function (e) { e.preventDefault(); });
      splashHit.addEventListener('mousedown', function (e) { e.preventDefault(); });

      // ========== LEFT / RIGHT PANELS ==========
      const PANEL_W = 235;
      const RIGHT_PANEL_W = 248;
      const SLIDER_TOP = 261;   // center Y at 100%
      const SLIDER_BOT = 774;   // center Y at 0%
      const SLIDER_H = 14;
      const SLIDER_W = 40;
      const leftPanel = document.getElementById('left-panel');
      const rightPanel = document.getElementById('right-panel');
      const leftEdgeZone = document.getElementById('left-edge-zone');
      const sliderSfx = document.getElementById('sliderSfx');
      const sliderMusic = document.getElementById('sliderMusic');
      const overlayScreen = document.getElementById('overlay-screen');
      let leftPanelOpen = false;
      let rightPanelOpen = false;
      let overlayMode = null; // null | 'help' | 'boss' | 'exit'
      let draggingSlider = null; // 'sfx' | 'music'

      function cursorHidden() {
        return popupOverlay.classList.contains('visible') || overlayMode !== null || txBusy || splashStep !== 0;
      }

      function volToY(vol) {
        // vol 1 → top, vol 0 → bottom
        return SLIDER_TOP + (1 - vol) * (SLIDER_BOT - SLIDER_TOP);
      }
      function yToVol(y) {
        const t = (y - SLIDER_TOP) / (SLIDER_BOT - SLIDER_TOP);
        return Math.max(0, Math.min(1, 1 - t));
      }
      function placeSlider(el, centerX, vol) {
        const cy = volToY(vol);
        el.style.left = (centerX - SLIDER_W / 2) + 'px';
        el.style.top = (cy - SLIDER_H / 2) + 'px';
      }
      function updateSliderPositions() {
        placeSlider(sliderSfx, 120, sfxVol);
        placeSlider(sliderMusic, 175, musicVol);
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
      // alias used by other code
      function openPanel() { openLeftPanel(); }
      function closePanel() { closeLeftPanel(); closeRightPanel(); }

      function openRightPanel() {
        // only on article pages (viewer), not main menu, and not when cursor hidden
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

      // Page number buttons on right panel
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
      let pgMulti = false;      // two-digit mode (minus pressed)
      let pgFirstDigit = null;  // first digit string or null

      function pageCount() {
        if (!article || !article.pages) return 0;
        return article.pages.length;
      }

      function setPgBtnState(key, on) {
        const el = pgBtnEls[key];
        if (!el) return;
        const name = (key === '-') ? 'btn-' : ('btn' + key);
        el.style.backgroundImage = 'url("assets/img/ui/' + name + (on ? '_on' : '_off') + '.webp")';
      }

      function resetPgBtns() {
        pgMulti = false;
        pgFirstDigit = null;
        Object.keys(pgBtnEls).forEach(function (k) { setPgBtnState(k, false); });
      }

      function clearPgBtns() {
        Object.keys(pgBtnEls).forEach(function (k) {
          pgBtnEls[k].remove();
        });
        pgBtnEls = {};
        pgMulti = false;
        pgFirstDigit = null;
      }

      function buildPgBtns() {
        clearPgBtns();
        const n = pageCount();
        if (n < 1) return;
        const multi = n >= 10;
        // which digit keys to show
        let keys = [];
        if (multi) {
          keys = ['1','2','3','4','5','6','7','8','9','0','-'];
        } else {
          // one button per page: 1..n (n < 10)
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
          el.style.backgroundImage = 'url("assets/img/ui/' + name + '_off.webp")';
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
        if (idx === currentPage && viewerSubView === 'page') {
          resetPgBtns();
          return;
        }
        const oldSnap = currentSnapshot();
        const oldIdx = currentPage;
        if (isListMode && viewerSubView === 'list') {
          savedListScroll = tallScroll.scrollTop;
          clearListHotspots();
          isScrollMode = false;
          viewerSubView = 'page';
          setupViewerMode();
        }
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
          // direct jump
          if (key === '-' || key === '0') return;
          const num = parseInt(key, 10);
          jumpToPageNum(num);
          return;
        }

        // n >= 10
        if (key === '-') {
          if (pgMulti) {
            // toggle off
            resetPgBtns();
            return;
          }
          pgMulti = true;
          pgFirstDigit = null;
          setPgBtnState('-', true);
          return;
        }

        if (!pgMulti) {
          // single-digit / ten: 1-9 → page, 0 → page 10
          const num = (key === '0') ? 10 : parseInt(key, 10);
          if (num <= n) jumpToPageNum(num);
          else resetPgBtns();
          return;
        }

        // two-digit mode
        if (pgFirstDigit === null) {
          pgFirstDigit = key;
          setPgBtnState(key, true);
          return;
        }
        // second digit
        const num = parseInt(pgFirstDigit + key, 10);
        jumpToPageNum(num);
      }



      // Track mouse in stage coords for panel show/hide
      stage.addEventListener('mousemove', function (e) {
        if (cursorHidden()) { closeLeftPanel(); closeRightPanel(); return; }
        if (draggingSlider) return; // keep left open while dragging
        const rect = stage.getBoundingClientRect();
        const scale = rect.width / STAGE_W;
        const x = (e.clientX - rect.left) / scale;

        // Left panel — any screen
        if (!leftPanelOpen) {
          if (x <= STAGE_W * 0.05) openLeftPanel();
        } else {
          if (x > PANEL_W + STAGE_W * 0.05) closeLeftPanel();
        }

        // Right panel — article pages only
        if (currentView === 'viewer') {
          if (!rightPanelOpen) {
            if (x >= STAGE_W * (1 - 0.05)) openRightPanel();
          } else {
            // close when mouse is more than 5% left of panel left edge
            if (x < STAGE_W - RIGHT_PANEL_W - STAGE_W * 0.05) closeRightPanel();
          }
        } else {
          closeRightPanel();
        }
      });

      // Slider drag
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
        // clamp to track
        const cy = Math.max(SLIDER_TOP, Math.min(SLIDER_BOT, y));
        const vol = yToVol(cy);
        if (draggingSlider === 'sfx') {
          setSfxVolume(vol);
          placeSlider(sliderSfx, 120, sfxVol);
        } else {
          setMusicVolume(vol);
          placeSlider(sliderMusic, 175, musicVol);
        }
      });
      document.addEventListener('mouseup', function () {
        draggingSlider = null;
      });

      // Overlay screens (help / boss / exit)
      function showOverlay(url, mode, onHidden) {
        closePanel();
        overlayMode = mode;
        overlayScreen.style.backgroundImage = 'url("' + url + '")';
        overlayScreen.style.display = 'block';
        overlayScreen.style.opacity = '0';
        // force reflow
        void overlayScreen.offsetWidth;
        overlayScreen.classList.add('visible');
        overlayScreen.style.opacity = '1';
        overlayScreen._onHidden = onHidden || null;
      }
      function hideOverlay() {
        if (!overlayMode) return;
        const cb = overlayScreen._onHidden;
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
          if (cb) cb();
        }, 400);
      }
      overlayScreen.addEventListener('click', function (e) {
        e.preventDefault();
        if (overlayMode === 'exit') return; // exit sequence handles itself
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

      function doExitSequence() {
        if (overlayMode === 'exit' || txBusy || splashStep !== 0) return;
        closePanel();
        playSfx('exit.wav');
        showOverlay('assets/img/content/01-9-marketing7.webp', 'exit', null);
        setTimeout(function () {
          hideOverlay();
          closePopup();
          clearPageHotspots();
          clearListHotspots();
          viewViewer.style.display = 'none';
          isListMode = false;
          isScrollMode = false;
          viewerSubView = 'page';
          article = null;
          // full restart: clear session splash flag and replay intro
          try { sessionStorage.removeItem(SPLASH_KEY); } catch (e) {}
          startSplashSequence();
        }, 2500);
      }
      document.getElementById('btnOs').addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        doExitSequence();
      });

      document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (currentView === 'viewer') backFromViewer();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'F1') {
          e.preventDefault();
          openHelp();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          // On cursor-hidden screens ESC only closes help/boss (not exit seq while already exiting)
          if (overlayMode === 'help' || overlayMode === 'boss') {
            hideOverlay();
            return;
          }
          if (popupOverlay.classList.contains('visible')) {
            closePopup();
            return;
          }
          if (cursorHidden()) return;
          // ESC = OS exit sequence
          doExitSequence();
        }
      });

      // Prevent browser chrome
      document.addEventListener('dragstart', function (e) { e.preventDefault(); });
      document.addEventListener('mousedown', function (e) {
        if (e.button === 1) e.preventDefault();
      });

      // Resume music on first gesture if blocked
      document.addEventListener('click', function once() {
        if (currentTrack && music.paused) music.play().catch(function () {});
      }, { once: true });

      // Session splash (unique key per disc)
      try {
        if (!sessionStorage.getItem(SPLASH_KEY)) {
          viewMenu.style.display = 'none';
          startSplashSequence();
        }
      } catch (e) {
        startSplashSequence();
      }
    })();
