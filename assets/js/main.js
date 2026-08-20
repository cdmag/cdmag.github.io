const DEFAULT_COVER = "assets/img/cover-default.webp";
    const DEFAULT_DISC = "assets/img/disc-default.webp";

    const MEDIA_BASE = "https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/";
    const DEFAULT_PLAYER = "webamp";
    const AUTOPLAY_KEY = "cdmag-autoplay";

    let activePlayer = DEFAULT_PLAYER;
    let webampInstance = null;
    let autoplayEnabled = false;

    // Пропорции текущей оболочки (ширина/высота), fallback 4:3
    let currentDiscAspect = 4 / 3;

    let discsDatabase = [];
    let state = {
      selectedMagazine: null,
      selectedYear: null,
      selectedIssue: null
    };

    function isAutoplayOn() {
      return autoplayEnabled;
    }

    function initAutoplayToggle() {
      const check = document.getElementById("autoplay-check");
      if (!check) return;

      try {
        autoplayEnabled = localStorage.getItem(AUTOPLAY_KEY) === "1";
      } catch (e) {
        autoplayEnabled = false;
      }
      check.checked = autoplayEnabled;

      check.addEventListener("change", () => {
        autoplayEnabled = check.checked;
        try {
          localStorage.setItem(AUTOPLAY_KEY, autoplayEnabled ? "1" : "0");
        } catch (e) {}
      });
    }

    document.addEventListener("DOMContentLoaded", () => {
      const selectBtn = document.getElementById("select-btn");
      const logoBtn = document.getElementById("logo-btn");

      if (selectBtn) selectBtn.addEventListener("click", toggleIssueMenu);
      if (logoBtn) logoBtn.addEventListener("click", showWelcomeScreen);

      initAutoplayToggle();
      initDiscViewportFit();

      document.addEventListener("click", (e) => {
        const menu = document.getElementById("dropdown-menu");
        if (!menu || !selectBtn) return;

        if (!menu.contains(e.target) && !selectBtn.contains(e.target)) {
          menu.classList.remove("show");
          selectBtn.classList.remove("active");
        }
      });

      fetch('assets/data/discs.json')
        .then(response => {
          if (!response.ok) throw new Error("Не удалось загрузить discs.json");
          return response.json();
        })
        .then(data => {
          discsDatabase = data;
          initApp();
        })
        .catch(err => {
          console.error("Ошибка загрузки данных:", err);
          document.getElementById("disc-note").innerText = "Ошибка загрузки файла assets/data/discs.json.";
        });
    });

    function initApp() {
      const urlParams = new URLSearchParams(window.location.search);
      const magParam = urlParams.get('mag');
      const yearParam = parseInt(urlParams.get('year'), 10);
      const issueParam = urlParams.get('issue');

      let loadedFromUrl = false;

      if (magParam && yearParam && issueParam) {
        const discExists = discsDatabase.some(d => 
          d.magazine === magParam && 
          d.year === yearParam && 
          String(d.issue) === String(issueParam)
        );

        if (discExists) {
          state.selectedMagazine = magParam;
          state.selectedYear = yearParam;
          state.selectedIssue = issueParam;
          
          loadSelectedDisc();
          loadedFromUrl = true;
        }
      }

      if (!loadedFromUrl) {
        if (discsDatabase.length > 0) {
          state.selectedMagazine = discsDatabase[0].magazine;
          const magDiscs = discsDatabase.filter(d => d.magazine === state.selectedMagazine);
          state.selectedYear = magDiscs[0].year;
          state.selectedIssue = magDiscs[0].issue;
        }
        showWelcomeScreen();
      }
    }

    function showWelcomeScreen() {
      document.getElementById("welcome-screen").classList.remove("hidden");
      document.getElementById("disc-frame").src = "about:blank";
      
      const menu = document.getElementById("dropdown-menu");
      const selectBtn = document.getElementById("select-btn");
      if (menu) menu.classList.remove("show");
      if (selectBtn) selectBtn.classList.remove("active");
      
      document.getElementById("disc-title").innerText = "Выберите диск";
      document.getElementById("disc-note").innerText = "Нажмите кнопку «Выбрать выпуск» слева сверху, чтобы открыть нужную интерактивную оболочку.";
      
      document.getElementById("cover-img").src = DEFAULT_COVER;
      document.getElementById("disc-img").src = DEFAULT_DISC;
      document.getElementById("magazine-link").style.display = "none";
      document.getElementById("iso-link").style.display = "none";
      
      destroyPlayers();
      window.history.pushState(null, '', window.location.pathname);
    }

    function toggleIssueMenu(event) {
      if (event) event.stopPropagation();
      const menu = document.getElementById('dropdown-menu');
      const selectBtn = document.getElementById('select-btn');

      const isShowing = menu.classList.contains('show');
      if (isShowing) {
        menu.classList.remove('show');
        selectBtn.classList.remove('active');
      } else {
        renderMenuGrids();
        menu.classList.add('show');
        selectBtn.classList.add('active');
      }
    }

    function renderMenuGrids() {
      const magContainer = document.getElementById("magazines-grid");
      const yearsContainer = document.getElementById("years-grid");
      const issuesContainer = document.getElementById("issues-grid");

      if (!discsDatabase || discsDatabase.length === 0) {
        magContainer.innerHTML = '<span style="font-size:0.75rem; color:#f87171;">Файл discs.json не загружен.</span>';
        yearsContainer.innerHTML = '';
        issuesContainer.innerHTML = '';
        return;
      }

      if (!state.selectedMagazine) {
        state.selectedMagazine = discsDatabase[0].magazine;
      }

      const uniqueMags = [...new Set(discsDatabase.map(d => d.magazine))];
      magContainer.innerHTML = uniqueMags.map(magKey => {
        const item = discsDatabase.find(d => d.magazine === magKey);
        const isActive = magKey === state.selectedMagazine ? "active" : "";
        return `<button class="pill-btn ${isActive}" onclick="selectMagazine(event, '${magKey}')">${item.magazine_title}</button>`;
      }).join("");

      const currentMagDiscs = discsDatabase.filter(d => d.magazine === state.selectedMagazine);
      if (!state.selectedYear && currentMagDiscs.length > 0) {
        state.selectedYear = currentMagDiscs[0].year;
      }

      const years = [...new Set(currentMagDiscs.map(d => d.year))].sort((a, b) => a - b);
      yearsContainer.innerHTML = years.map(y => {
        const isActive = y === state.selectedYear ? "active" : "";
        return `<button class="pill-btn ${isActive}" onclick="selectYear(event, ${y})">${y}</button>`;
      }).join("");

      const currentYearDiscs = currentMagDiscs.filter(d => d.year === state.selectedYear);
      if (!state.selectedIssue && currentYearDiscs.length > 0) {
        state.selectedIssue = currentYearDiscs[0].issue;
      }

      issuesContainer.innerHTML = currentYearDiscs.map(d => {
        const isActive = d.issue === state.selectedIssue ? "active" : "";
        return `<button class="pill-btn ${isActive}" onclick="selectIssue('${d.issue}')">№ ${d.issue}</button>`;
      }).join("");
    }

    function selectMagazine(event, magKey) {
      if (event) event.stopPropagation();
      state.selectedMagazine = magKey;
      
      const available = discsDatabase.filter(d => d.magazine === magKey);
      if (available.length > 0) {
        state.selectedYear = available[0].year;
        state.selectedIssue = available[0].issue;
      }
      renderMenuGrids();
    }

    function selectYear(event, year) {
      if (event) event.stopPropagation();
      state.selectedYear = year;
      
      const available = discsDatabase.filter(d => d.magazine === state.selectedMagazine && d.year === year);
      if (available.length > 0) state.selectedIssue = available[0].issue;
      renderMenuGrids();
    }

    function selectIssue(issue) {
      state.selectedIssue = issue;
      renderMenuGrids();
      
      document.getElementById('dropdown-menu').classList.remove('show');
      document.getElementById('select-btn').classList.remove('active');
      loadSelectedDisc();

      const newUrl = `?mag=${state.selectedMagazine}&year=${state.selectedYear}&issue=${state.selectedIssue}`;
      window.history.pushState(null, '', newUrl);
    }

    function loadSelectedDisc() {
      const disc = discsDatabase.find(d => 
        d.magazine === state.selectedMagazine && 
        d.year === state.selectedYear && 
        d.issue === state.selectedIssue
      );

      if (!disc) return;

      document.getElementById("welcome-screen").classList.add("hidden");

      document.getElementById("disc-title").innerText = disc.title;
      document.getElementById("disc-note").innerText = disc.note || "Описание отсутствует.";

      if (disc.width && disc.height) {
        currentDiscAspect = disc.width / disc.height;
        applyViewportSize(currentDiscAspect);
      } else if (disc.aspect) {
        currentDiscAspect = Number(disc.aspect) || (4 / 3);
        applyViewportSize(currentDiscAspect);
      }

      document.getElementById("disc-frame").src = disc.path;

      const coverImg = document.getElementById("cover-img");
      coverImg.src = disc.cover_image && disc.cover_image.trim() !== "" ? disc.cover_image : DEFAULT_COVER;
      
      const magLink = document.getElementById("magazine-link");
      if (disc.magazine_url) {
        magLink.href = disc.magazine_url;
        magLink.style.display = "inline";
      } else {
        magLink.style.display = "none";
      }

      const discImg = document.getElementById("disc-img");
      discImg.src = disc.disc_image && disc.disc_image.trim() !== "" ? disc.disc_image : DEFAULT_DISC;

      const isoLink = document.getElementById("iso-link");
      if (disc.download_iso) {
        isoLink.href = disc.download_iso;
        isoLink.style.display = "inline";
      } else {
        isoLink.style.display = "none";
      }

      renderPlayer(disc);
    }

    function renderVkPlaylist(urlOrCode) {
      const playerDiv = document.getElementById("player-container");
      playerDiv.innerHTML = '<div id="vk_playlist_widget"></div>';

      if (!urlOrCode || !urlOrCode.trim()) return;

      const match = urlOrCode.match(/audio_playlist(-?\d+)_(\d+)/) ||
                    urlOrCode.match(/(-?\d+)[_,\s]+(\d+)/);

      if (match) {
        const ownerId = parseInt(match[1], 10);
        const playlistId = parseInt(match[2], 10);
        // width — единственная опция API; высота = по числу треков
        const width = Math.max(280, Math.floor(playerDiv.clientWidth || 320));

        const initWidget = () => {
          if (window.VK && window.VK.Widgets && window.VK.Widgets.Playlist) {
            window.VK.Widgets.Playlist("vk_playlist_widget", ownerId, playlistId, "", { width: width });
          }
        };

        if (window.VK && window.VK.Widgets) {
          initWidget();
        } else {
          setTimeout(initWidget, 200);
        }
      } else {
        playerDiv.innerHTML = `<div style="color:#9ca3af; font-size:11px; padding:10px;">Неверный формат плейлиста</div>`;
      }
    }

    window.addEventListener('popstate', () => {
      initApp();
    });

    function openImageModal(imgSrc) {
      if (!imgSrc || imgSrc.includes('cover-default.webp') || imgSrc.includes('disc-default.webp')) return;
      const modal = document.getElementById('image-modal');
      const modalImg = document.getElementById('image-modal-img');
      modalImg.src = imgSrc;
      modal.style.display = 'flex';
    }

    function closeImageModal(event) {
      if (event.target.id === 'image-modal' || event.target.classList.contains('image-modal-close')) {
        document.getElementById('image-modal').style.display = 'none';
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('image-modal');
        if (modal) modal.style.display = 'none';
      }
    });

    function destroyPlayers() {
      if (webampInstance) {
        try { webampInstance.dispose(); } catch(e) {}
        webampInstance = null;
      }
      if (contextMenuObserver) {
        try { contextMenuObserver.disconnect(); } catch(e) {}
        contextMenuObserver = null;
      }
      if (marqueeObserver) {
        try { marqueeObserver.disconnect(); } catch(e) {}
        marqueeObserver = null;
      }
      const ctx = document.getElementById("webamp-context-menu");
      if (ctx) {
        try { ctx.remove(); } catch(e) {}
      }
      const orphan = document.getElementById("webamp");
      if (orphan) {
        try { orphan.remove(); } catch(e) {}
      }
      const container = document.getElementById("player-container");
      if (container) {
        container.innerHTML = "";
        container.style.removeProperty('--webamp-scale');
        container.style.removeProperty('--webamp-host-height');
      }
    }

    function switchPlayer(playerType) {
      activePlayer = playerType;
      updateToggleButtons();
      
      const disc = discsDatabase.find(d => 
        d.magazine === state.selectedMagazine && 
        d.year === state.selectedYear && 
        d.issue === state.selectedIssue
      );
      if (disc) renderPlayer(disc);
    }

    function updateToggleButtons() {
      document.getElementById('toggle-webamp').classList.toggle('active', activePlayer === 'webamp');
      document.getElementById('toggle-vk').classList.toggle('active', activePlayer === 'vk');
    }

    function renderPlayer(disc) {
      destroyPlayers();
      updateToggleButtons();

      if (activePlayer === 'webamp') {
        renderWebampPlaylist(disc ? disc.webamp_tracks : null);
      } else {
        renderVkPlaylist(disc ? disc.vk_playlist_url : null);
      }
    }

    function getWebampLayoutMetrics() {
      const container = document.getElementById("player-container");
      if (!container) {
        return {
          scale: 1, playlistHeightPx: 116, extraHeight: 0,
          hostHeight: 246, eqShade: true, eqHeight: 14, playlistTop: 130
        };
      }

      const w = container.clientWidth || 275;
      const h = Math.max(container.clientHeight || 0, 180);

      // Эквалайзер по умолчанию свёрнут (shade) — редко нужен
      const eqShade = true;
      const eqHeight = 14;
      const mainHeight = 116;
      const headerBlock = mainHeight + eqHeight; // 130
      const playlistTop = headerBlock;
      const minPlaylist = 116;
      const minNativeTotal = headerBlock + minPlaylist; // 246

      // Нативная ширина 275px; масштабируем только вниз, если блок уже
      const scaleByWidth = w / 275;
      const scaleByHeight = h / minNativeTotal;
      const scale = Math.max(0.35, Math.min(1, scaleByWidth, scaleByHeight));

      // Плейлист тянется вниз на всё доступное место (шаги по 29px)
      const availableNative = Math.floor(h / scale);
      const roomForPlaylist = Math.max(minPlaylist, availableNative - headerBlock);
      const extraHeight = Math.max(0, Math.floor((roomForPlaylist - minPlaylist) / 29));
      const playlistHeightPx = minPlaylist + 29 * extraHeight;
      const hostHeight = headerBlock + playlistHeightPx;

      return { scale, playlistHeightPx, extraHeight, hostHeight, eqShade, eqHeight, playlistTop };
    }

    function applyWebampScale() {
      const container = document.getElementById("player-container");
      const host = document.getElementById("webamp-host");
      if (!container || !host) return;

      const { scale, hostHeight, extraHeight, eqShade, playlistTop } = getWebampLayoutMetrics();
      container.style.setProperty("--webamp-scale", scale);
      container.style.setProperty("--webamp-host-height", hostHeight + "px");
      host.style.transform = `scale(${scale})`;
      host.style.height = hostHeight + "px";

      if (webampInstance && webampInstance.store) {
        try {
          const state = webampInstance.store.getState();
          const eqWin = state.windows && state.windows.genWindows
            ? state.windows.genWindows.equalizer
            : (state.genWindows && state.genWindows.equalizer);
          const currentlyShaded = !!(eqWin && eqWin.shade);

          // Синхронизируем shade эквалайзера с желаемым состоянием
          if (currentlyShaded !== eqShade) {
            webampInstance.store.dispatch({
              type: "TOGGLE_WINDOW_SHADE_MODE",
              windowId: "equalizer"
            });
          }

          // Позиция плейлиста (под main + eq/shade)
          webampInstance.store.dispatch({
            type: "UPDATE_WINDOW_POSITIONS",
            positions: {
              main: { x: 0, y: 0 },
              equalizer: { x: 0, y: 116 },
              playlist: { x: 0, y: playlistTop }
            }
          });

          webampInstance.store.dispatch({
            type: "WINDOW_SIZE_CHANGED",
            windowId: "playlist",
            size: [0, extraHeight]
          });
        } catch (e) {
          console.warn("Webamp layout update:", e);
        }
      }
    }

    function renderWebampPlaylist(tracks) {
      const container = document.getElementById("player-container");

      if (!tracks || tracks.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); font-size:0.75rem; padding:10px;">Саундтрек Webamp не добавлен.</div>';
        return;
      }

      if (!window.Webamp) {
        container.innerHTML = '<div style="color:var(--text-muted); font-size:0.75rem; padding:10px;">Ошибка загрузки библиотеки Webamp.</div>';
        return;
      }

      const formattedTracks = tracks.map(t => ({
        metaData: t.metaData,
        url: t.url.startsWith('http') ? t.url : MEDIA_BASE + t.url,
        duration: t.duration
      }));

      container.innerHTML = "";
      const host = document.createElement("div");
      host.id = "webamp-host";
      container.appendChild(host);
      container.style.position = "relative";

      const { scale, extraHeight, hostHeight, eqShade, playlistTop } = getWebampLayoutMetrics();
      container.style.setProperty("--webamp-scale", scale);
      container.style.setProperty("--webamp-host-height", hostHeight + "px");
      host.style.transform = `scale(${scale})`;
      host.style.height = hostHeight + "px";

      // Без initialTracks: иначе Webamp сразу делает BUFFER_TRACK → HTTP-запрос,
      // а при 404 шлёт ended и листает весь плейлист, дергая сервер по очереди.
      //
      // Кастомные middleware идут ПОСЛЕ media-слоя, поэтому подменить PLAY нельзя.
      // После PLAY, если трек не выбран — дополнительно диспатчим PLAY_TRACK.
      const playFirstTrackMiddleware = store => next => action => {
        const result = next(action);
        if (action && action.type === "PLAY") {
          try {
            const state = store.getState();
            const pl = state.playlist || {};
            if (pl.currentTrack == null && Array.isArray(pl.trackOrder) && pl.trackOrder.length > 0) {
              store.dispatch({ type: "PLAY_TRACK", id: pl.trackOrder[0] });
            }
          } catch (e) {}
        }
        return result;
      };

      webampInstance = new window.Webamp({
        __customMiddlewares: [playFirstTrackMiddleware],
        windowLayout: {
          main: {
            position: { top: 0, left: 0 }
          },
          equalizer: {
            position: { top: 116, left: 0 },
            shadeMode: eqShade
          },
          playlist: {
            position: { top: playlistTop, left: 0 },
            size: { extraHeight: extraHeight, extraWidth: 0 }
          }
        }
      });

      webampInstance.renderInto(host).then(() => {
        applyWebampScale();
        requestAnimationFrame(applyWebampScale);
        setTimeout(applyWebampScale, 50);
        setTimeout(applyWebampScale, 200);

        if (isAutoplayOn()) {
          // PLAY-режим: один запрос + воспроизведение первого трека
          try {
            webampInstance.setTracksToPlay(formattedTracks);
          } catch (e) {
            console.warn("Webamp autoplay:", e);
          }
        } else {
          // NONE-режим: только список в плейлисте, без сетевых запросов
          try {
            webampInstance.appendTracks(formattedTracks);
          } catch (e) {
            console.warn("Webamp appendTracks:", e);
          }
        }

        // Fallback: перехват клика по Play, если трек ещё не выбран
        bindPlayStartsFirstTrack(host);

        // Контекстное меню Presets выносим в body, иначе overflow/transform его режут
        ensureContextMenuEscapes();
        // Кириллица в бегущей строке
        ensureMarqueeUnicodeFix();
        setTimeout(fixMarqueeUnicode, 100);
        setTimeout(fixMarqueeUnicode, 500);
      }).catch(err => {
        console.error("Webamp renderInto failed:", err);
        webampInstance.renderWhenReady(host).then(() => {
          applyWebampScale();
          try {
            if (isAutoplayOn()) webampInstance.setTracksToPlay(formattedTracks);
            else webampInstance.appendTracks(formattedTracks);
          } catch (e) {}
          bindPlayStartsFirstTrack(host);
          ensureMarqueeUnicodeFix();
        });
      });
    }

    // Клик по Play / кнопке play в плейлисте без выбранного трека → первый трек
    function bindPlayStartsFirstTrack(root) {
      if (!root || root._cdmagPlayBound) return;
      root._cdmagPlayBound = true;

      root.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest
          ? e.target.closest("#play, .playlist-play-button")
          : null;
        if (!btn || !webampInstance || !webampInstance.store) return;

        try {
          const state = webampInstance.store.getState();
          const pl = state.playlist || {};
          if (pl.currentTrack != null) return;
          if (!Array.isArray(pl.trackOrder) || pl.trackOrder.length === 0) return;

          e.preventDefault();
          e.stopPropagation();
          webampInstance.store.dispatch({ type: "PLAY_TRACK", id: pl.trackOrder[0] });
        } catch (err) {}
      }, true);
    }

    // Следим за появлением #webamp-context-menu и поднимаем его в document.body
    let contextMenuObserver = null;
    function ensureContextMenuEscapes() {
      if (contextMenuObserver) return;
      contextMenuObserver = new MutationObserver(() => {
        const menu = document.getElementById("webamp-context-menu");
        if (!menu) return;
        if (menu.parentElement === document.body) return;

        // Сохраняем экранные координаты до переноса
        const rect = menu.getBoundingClientRect();
        document.body.appendChild(menu);
        menu.style.position = "fixed";
        menu.style.top = rect.top + "px";
        menu.style.left = rect.left + "px";
        menu.style.right = "auto";
        menu.style.bottom = "auto";
        menu.style.transform = "none";
        menu.style.zIndex = "100000";
      });
      contextMenuObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Бегущая строка: помечаем non-ASCII символы (кириллица и др.)
    let marqueeObserver = null;
    function fixMarqueeUnicode() {
      const marquee = document.querySelector("#webamp #marquee");
      if (!marquee) return;
      marquee.querySelectorAll(".character").forEach(el => {
        const ch = el.textContent || "";
        // Всё, что вне базовой латиницы/цифр скина TEXT.BMP
        if (ch && /[^\x00-\x7F]/.test(ch)) {
          el.classList.add("cdmag-unicode");
        } else {
          el.classList.remove("cdmag-unicode");
        }
      });
    }

    function ensureMarqueeUnicodeFix() {
      fixMarqueeUnicode();
      if (marqueeObserver) return;
      const root = document.getElementById("webamp-host") || document.body;
      marqueeObserver = new MutationObserver(() => {
        fixMarqueeUnicode();
      });
      marqueeObserver.observe(root, { childList: true, subtree: true, characterData: true });
    }

    window.addEventListener("resize", () => {
      applyViewportSize(currentDiscAspect);
      if (webampInstance && document.getElementById("webamp-host")) {
        applyWebampScale();
      }
    });

    // --- Подгонка viewport под пропорции оболочки ---

    function applyViewportSize(aspect) {
      const a = aspect && aspect > 0.3 && aspect < 5 ? aspect : 4 / 3;
      currentDiscAspect = a;
      const maxH = window.innerHeight;
      const maxW = Math.max(200, window.innerWidth - 360);
      let h = maxH;
      let w = h * a;
      if (w > maxW) {
        w = maxW;
        h = w / a;
      }
      const vp = document.querySelector(".viewport");
      if (!vp) return;
      vp.style.width = Math.round(w) + "px";
      vp.style.height = Math.round(h) + "px";
    }

    function extractBgUrls(styleBg) {
      if (!styleBg || styleBg === "none") return [];
      const urls = [];
      const re = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
      let m;
      while ((m = re.exec(styleBg))) urls.push(m[1]);
      return urls;
    }

    function naturalAspectFromUrl(url, baseHref) {
      return new Promise((resolve) => {
        try {
          const abs = new URL(url, baseHref).href;
          const img = new Image();
          img.onload = () => {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              resolve({ w: img.naturalWidth, h: img.naturalHeight });
            } else resolve(null);
          };
          img.onerror = () => resolve(null);
          img.src = abs;
        } catch (e) {
          resolve(null);
        }
      });
    }

    async function detectAspectFromDoc(doc) {
      if (!doc || !doc.defaultView) return null;
      const base = doc.baseURI || doc.location?.href;
      const candidates = [];

      // Фоновые картинки у html/body и крупных контейнеров
      const els = [doc.documentElement, doc.body, ...Array.from(doc.querySelectorAll("body > *"))].filter(Boolean);
      for (const el of els) {
        try {
          const bg = doc.defaultView.getComputedStyle(el).backgroundImage;
          for (const u of extractBgUrls(bg)) candidates.push(u);
        } catch (e) {}
      }

      // Крупные <img>
      doc.querySelectorAll("img").forEach((img) => {
        if (img.src) candidates.push(img.src);
      });

      let best = null;
      for (const u of candidates) {
        const dim = await naturalAspectFromUrl(u, base);
        if (!dim) continue;
        // Берём самую крупную «подложку» (отсекаем иконки)
        if (dim.w < 400 || dim.h < 300) continue;
        if (!best || dim.w * dim.h > best.w * best.h) best = dim;
      }
      if (best) return best.w / best.h;

      // Фиксированные размеры корневого блока в px
      for (const el of els) {
        try {
          const st = doc.defaultView.getComputedStyle(el);
          const w = parseFloat(st.width);
          const h = parseFloat(st.height);
          if (w >= 640 && h >= 480) {
            const ratio = w / h;
            if (ratio > 0.5 && ratio < 3) return ratio;
          }
        } catch (e) {}
      }
      return null;
    }

    function getCurrentDisc() {
      return discsDatabase.find(
        (d) =>
          d.magazine === state.selectedMagazine &&
          d.year === state.selectedYear &&
          d.issue === state.selectedIssue
      ) || null;
    }

    function initDiscViewportFit() {
      const frame = document.getElementById("disc-frame");
      if (!frame || frame._cdmagFitBound) return;
      frame._cdmagFitBound = true;

      frame.addEventListener("load", async () => {
        if (!frame.src || frame.src === "about:blank" || frame.src.endsWith("about:blank")) {
          applyViewportSize(4 / 3);
          return;
        }

        const disc = getCurrentDisc();
        if (disc && disc.width && disc.height) {
          applyViewportSize(disc.width / disc.height);
          return;
        }
        if (disc && disc.aspect) {
          applyViewportSize(Number(disc.aspect) || 4 / 3);
          return;
        }

        try {
          const doc = frame.contentDocument;
          if (!doc) {
            applyViewportSize(currentDiscAspect || 4 / 3);
            return;
          }
          // Дать оболочке чуть времени отрисовать фоны
          await new Promise((r) => setTimeout(r, 50));
          const detected = await detectAspectFromDoc(doc);
          applyViewportSize(detected || currentDiscAspect || 4 / 3);
        } catch (e) {
          applyViewportSize(currentDiscAspect || 4 / 3);
        }
      });

      applyViewportSize(currentDiscAspect);
    }
