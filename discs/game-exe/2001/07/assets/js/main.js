let sectionsData = {};
let playerState = 'stopped';
let activePlayingSource = null;
let remainingSeconds = 0;
let timerInterval = null;

let currentSectionKey = 'igry';
let currentItemIndex = 0;
let currentTrackIndex = 0;
let isExpandedMode = false;

const TOTAL_LEFT_MEDIA = 6;
const TOTAL_CENTER_MEDIA = 11;
let mediaTickCounter = 0;

// Переменные состояния модалок
let pendingUrl = '';
let currentViewerScreens = [];
let currentViewerIndex = 0;
let currentViewerItemTitle = '';

async function loadAppData() {
    try {
        const response = await fetch('assets/data/data.json');
        sectionsData = await response.json();
        loadSection(currentSectionKey);
    } catch (error) {
        console.error("Ошибка загрузки data.json:", error);
    }
}

function parseDuration(durStr) {
    const parts = durStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const sStr = s < 10 ? `0${s}` : `${s}`;
    return `${m}:${sStr}`;
}

function padZero(num) {
    return num < 10 ? `0${num}` : `${num}`;
}

function scaleApp() {
    const app = document.getElementById('app-window');
    if (!app) return;
    const scaleX = window.innerWidth / 1620;
    const scaleY = window.innerHeight / 1278;
    // Небольшое перекрытие (1.001), чтобы не было субпиксельных полос по краям
    const scale = Math.min(scaleX, scaleY) * 1.001;
    app.style.transform = `scale(${scale}) translateZ(0)`;
}

function loadSection(sectionKey) {
    const data = sectionsData[sectionKey];
    if (!data) return;

    currentSectionKey = sectionKey;
    currentItemIndex = 0;
    isExpandedMode = false;

    const wrapper = document.getElementById('content-wrapper');
    const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
    const currentBg = activeTab.bg || data.bg;
    
    wrapper.style.backgroundImage = `url('assets/img/ui/${currentBg}')`;

    const headerContainer = document.getElementById('content-header');
    headerContainer.innerHTML = '';

    data.tabs.forEach((tab, index) => {
        const img = document.createElement('img');
        const stateSuffix = tab.active ? '_3' : '';
        img.src = `assets/img/ui/${tab.base}${stateSuffix}.webp`;
        img.className = `header-btn header-btn-${index + 1} ${tab.active ? 'active' : ''}`;
        img.setAttribute('data-base', tab.base);
        
        if (tab.static) img.style.cursor = 'default';

        img.addEventListener('click', () => {
            if (data.tabs.length > 1) {
                data.tabs.forEach(t => t.active = false);
                tab.active = true;
                currentItemIndex = 0;
                currentTrackIndex = 0;
                isExpandedMode = false;
                loadSection(sectionKey);
            }
        });

        headerContainer.appendChild(img);
    });

    bindHeaderEvents();
    renderControlsBar();

    if (sectionKey === 'muzyka') {
        renderMusicView(activeTab.tracks || []);
    } else {
        renderStandardItemList(activeTab.items || []);
    }
}

function renderStandardItemList(items) {
    const wrapper = document.getElementById('content-wrapper');

    if (isExpandedMode && items[currentItemIndex]) {
        renderExpandedView(wrapper, items[currentItemIndex]);
        return;
    }

    wrapper.innerHTML = `
        <div class="pane-left" id="pane-left"></div>
        <div class="pane-right" id="pane-right"></div>
    `;

    const paneLeft = document.getElementById('pane-left');
    const paneRight = document.getElementById('pane-right');

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `list-item ${index === currentItemIndex ? 'active' : ''}`;
        div.textContent = item.title;

        div.addEventListener('click', () => {
            if (index === currentItemIndex && !isExpandedMode) return;

            playSound('grid.wav');

            currentItemIndex = index;
            isExpandedMode = false;
            
            document.querySelectorAll('.list-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            renderCompactRightPane(paneRight, item);
        });

        paneLeft.appendChild(div);
    });

    if (items.length > 0) {
        renderCompactRightPane(paneRight, items[currentItemIndex]);
    }
}

function renderCompactRightPane(container, item) {
    if (!item) {
        container.innerHTML = '';
        return;
    }

    const firstScreenshot = (item.screenshots && item.screenshots.length > 0) 
        ? `<div class="screenshot-wrapper"><img src="${item.screenshots[0]}" class="preview-screenshot screenshot-img" data-index="0" alt="Screen"></div>` 
        : '';

    const descText = item.description || (Array.isArray(item.info) ? item.info.join('\n') : item.info) || '';
    const showDescription = (currentSectionKey === 'patchi') && descText;

    container.innerHTML = `
        <h2>${item.title}</h2>
        <p>
            ${item.type ? `<strong>${item.type}</strong><br>` : ''}
            ${item.genre ? `<strong>Жанр:</strong> ${item.genre}<br>` : ''}
            ${item.developer ? `<strong>Разработчик:</strong> ${item.developer}<br>` : ''}
            ${item.publisher ? `<strong>Издатель:</strong> ${item.publisher}<br>` : ''}
            ${item.size ? `<strong>Размер:</strong> ${item.size}<br>` : ''}
            ${showDescription ? `<strong>Описание:</strong> ${descText}` : ''}
        </p>
        ${firstScreenshot}
    `;

    container.onclick = null;
    container.onclick = (e) => {
        if (e.target.closest('.screenshot-wrapper')) {
            openImageViewer(item, 0);
            return;
        }
        isExpandedMode = true;
        const data = sectionsData[currentSectionKey];
        const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
        renderStandardItemList(activeTab.items || []);
    };
}

function renderExpandedView(container, item) {
    const screenshots = (item.screenshots && Array.isArray(item.screenshots)) 
        ? item.screenshots.slice(0, 2) 
        : [];

    const screenshotsHTML = screenshots.map((src, idx) => 
        `<div class="screenshot-wrapper" data-index="${idx}"><img src="${src}" class="expanded-screenshot screenshot-img" alt="Screenshot"></div>`
    ).join('');

    const infoText = item.description || (Array.isArray(item.info) ? item.info.join('<br>') : item.info) || '';
    const infoTitle = item.info ? 'Дополнительная информация' : 'Описание';

    container.innerHTML = `
        <div class="pane-expanded" id="pane-expanded-content">
            <div class="expanded-header-title">${item.title}</div>
            <div class="expanded-header-type">${item.type || ''}</div>
            
            <div class="expanded-body">
                <div class="expanded-info-col">
                    
                    <div class="expanded-block expanded-props-table">
                        ${item.size ? `<div class="expanded-prop-row"><div class="expanded-prop-label">Размер</div><div class="expanded-prop-val">${item.size}</div></div>` : ''}
                        ${item.genre ? `<div class="expanded-prop-row"><div class="expanded-prop-label">Жанр</div><div class="expanded-prop-val">${item.genre}</div></div>` : ''}
                        ${item.developer ? `<div class="expanded-prop-row"><div class="expanded-prop-label">Разработчик</div><div class="expanded-prop-val">${item.developer}</div></div>` : ''}
                        ${item.publisher ? `<div class="expanded-prop-row"><div class="expanded-prop-label">Издатель</div><div class="expanded-prop-val">${item.publisher}</div></div>` : ''}
                        ${item.website ? `<div class="expanded-prop-row"><div class="expanded-prop-label">Веб-страница</div><div class="expanded-prop-val"><span class="expanded-link" data-url="${item.website}">${item.website}</span></div></div>` : ''}
                    </div>

                    ${item.sys_reqs ? `
                        <div class="expanded-block">
                            <div class="expanded-section-title">Минимальные системные требования</div>
                            <div>${item.sys_reqs}</div>
                        </div>
                    ` : ''}

                    ${infoText ? `
                        <div class="expanded-block">
                            <div class="expanded-section-title">${infoTitle}</div>
                            <div class="expanded-info-text">${infoText}</div>
                        </div>
                    ` : ''}
                </div>

                ${screenshotsHTML ? `<div class="expanded-media-col">${screenshotsHTML}</div>` : ''}
            </div>
        </div>
    `;

    const cardEl = document.getElementById('pane-expanded-content');
    if (cardEl) {
        cardEl.addEventListener('click', (e) => {
            const linkEl = e.target.closest('.expanded-link');
            if (linkEl) {
                e.stopPropagation();
                openConfirmModal(linkEl.getAttribute('data-url'));
                return;
            }

            const wrapperEl = e.target.closest('.screenshot-wrapper');
            if (wrapperEl) {
                e.stopPropagation();
                const clickedIdx = parseInt(wrapperEl.getAttribute('data-index'), 10) || 0;
                openImageViewer(item, clickedIdx);
                return;
            }

            isExpandedMode = false;
            const data = sectionsData[currentSectionKey];
            const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
            renderStandardItemList(activeTab.items || []);
        });
    }
}

function openConfirmModal(url) {
    playSound('link.wav');

    pendingUrl = url;
    document.getElementById('confirm-url-text').textContent = url;
    document.getElementById('confirm-modal').classList.add('active');
}

function closeConfirmModal() {
    pendingUrl = '';
    document.getElementById('confirm-modal').classList.remove('active');
}

function openImageViewer(item, startIndex) {
    currentViewerItemTitle = item.title.replace(/[\\/:*?"<>|]/g, '');
    currentViewerScreens = item.screenshots || [];
    currentViewerIndex = startIndex;

    if (currentViewerScreens.length === 0) return;

    playSound('picture.wav');

    updateViewerDisplay();
    document.getElementById('viewer-modal').classList.add('active');
}

function updateViewerDisplay() {
    const total = currentViewerScreens.length;
    const currentNum = padZero(currentViewerIndex + 1);
    const titleText = `pics\\${currentViewerItemTitle}\\${currentNum}.jpg (${currentViewerIndex + 1}/${total})`;

    document.getElementById('viewer-title').textContent = titleText;
    
    const img = document.getElementById('viewer-img');
    img.style.width = '';
    img.style.height = '';
    img.src = currentViewerScreens[currentViewerIndex];

    const applySize = () => {
        if (img.naturalWidth < 1024 || img.naturalHeight < 768) {
            img.style.width = '1024px';
            img.style.height = '768px';
        }
    };

    if (img.complete) {
        applySize();
    } else {
        img.onload = applySize;
    }
}

function closeImageViewer() {
    document.getElementById('viewer-modal').classList.remove('active');
}

function renderMusicView(tracks) {
    const wrapper = document.getElementById('content-wrapper');
    
    wrapper.innerHTML = `
        <div class="music-title-overlay" id="music-title-overlay"></div>
        <div class="music-list-box" id="music-list-box"></div>
        <div class="music-data-display" id="music-data"></div>
    `;

    const listBox = document.getElementById('music-list-box');

    tracks.forEach((track, index) => {
        const div = document.createElement('div');
        const trackNum = track.id < 10 ? `0${track.id}` : track.id;
        div.className = `music-track-item ${index === currentTrackIndex ? 'active' : ''}`;
        div.textContent = `track ${trackNum} ${track.duration}`;
        div.setAttribute('data-index', index);

        div.addEventListener('click', () => {
            selectMusicTrack(index);
        });

        listBox.appendChild(div);
    });

    selectMusicTrack(currentTrackIndex);
    updateGreenDisplay();
}

function selectMusicTrack(index) {
    const data = sectionsData.muzyka;
    if (!data) return;
    const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
    const tracks = activeTab.tracks || [];

    if (index < 0 || index >= tracks.length) return;

    currentTrackIndex = index;

    const titleEl = document.getElementById('music-title-overlay');
    if (titleEl) {
        titleEl.textContent = tracks[currentTrackIndex].title;
    }

    const trackItems = document.querySelectorAll('.music-track-item');
    trackItems.forEach((item, idx) => {
        if (idx === currentTrackIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

function updateGreenDisplay() {
    const greenBox = document.getElementById('music-data');
    if (!greenBox) return;

    if (playerState === 'stopped' || !activePlayingSource) {
        greenBox.style.display = 'none';
        return;
    }

    greenBox.style.display = 'flex';
    const track = activePlayingSource.tracks[activePlayingSource.trackIndex];
    const trackNum = track.id < 10 ? `0${track.id}` : track.id;
    greenBox.textContent = `track ${trackNum} ${formatTime(remainingSeconds)}`;
}

function startPlaybackTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (playerState === 'playing') {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updateGreenDisplay();
            } else {
                if (activePlayingSource.trackIndex + 1 < activePlayingSource.tracks.length) {
                    activePlayingSource.trackIndex++;
                    const nextTrack = activePlayingSource.tracks[activePlayingSource.trackIndex];
                    remainingSeconds = parseDuration(nextTrack.duration);
                    
                    syncPlayingViewWithCurrentTab();
                    updateGreenDisplay();
                } else {
                    stopPlayback();
                }
            }
        }
    }, 1000);
}

function stopPlayback() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    playerState = 'stopped';
    activePlayingSource = null;
    remainingSeconds = 0;
    
    updateGreenDisplay();
    updateControlsUI();
}

function syncPlayingViewWithCurrentTab() {
    if (currentSectionKey !== 'muzyka') return;
    const data = sectionsData.muzyka;
    const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
    const activeTabIndex = data.tabs.indexOf(activeTab);

    if (activePlayingSource && activeTabIndex === activePlayingSource.tabIndex) {
        selectMusicTrack(activePlayingSource.trackIndex);
    }
}

function updateControlsUI() {
    if (currentSectionKey !== 'muzyka') return;

    const playBtn = document.getElementById('mus-play-btn');
    const stopBtn = document.getElementById('mus-stop-btn');

    if (!playBtn || !stopBtn) return;

    if (playerState === 'stopped') {
        playBtn.src = 'assets/img/ui/mus_play.webp';
        stopBtn.src = 'assets/img/ui/mus_stop_3.webp';
    } else {
        playBtn.src = 'assets/img/ui/mus_pause.webp';
        stopBtn.src = 'assets/img/ui/mus_stop.webp';
    }
}

function renderControlsBar() {
    const bar = document.getElementById('controls-bar');
    bar.innerHTML = '';

    if (currentSectionKey === 'muzyka') {
        bar.innerHTML = `
            <img src="assets/img/ui/mus_prev.webp" alt="Prev" class="ctrl-btn mus-btn btn-momentary" id="mus-prev-btn" data-base="mus_prev">
            <img src="assets/img/ui/mus_play.webp" alt="Play/Pause" class="ctrl-btn mus-btn" id="mus-play-btn">
            <img src="assets/img/ui/mus_stop_3.webp" alt="Stop" class="ctrl-btn mus-btn" id="mus-stop-btn">
            <img src="assets/img/ui/mus_next.webp" alt="Next" class="ctrl-btn mus-btn btn-momentary" id="mus-next-btn" data-base="mus_next">
            <img src="assets/img/ui/mus_opt.webp" alt="Options" class="ctrl-btn mus-btn btn-momentary" data-base="mus_opt">
        `;
        bindMusicControls();
        updateControlsUI();
    } else {
        bar.innerHTML = `
            <img src="assets/img/ui/arrow_left.webp" alt="Left" class="ctrl-btn arrow-left-img btn-momentary" id="btn-arrow-left" data-base="arrow_left">
            <img src="assets/img/ui/sep_1.webp" alt="" class="sep-1-img">
            <img src="assets/img/ui/btn_install.webp" alt="Установить" class="ctrl-btn btn-install-img btn-momentary" id="btn-install" data-base="btn_install">
            <img src="assets/img/ui/sep_2.webp" alt="" class="sep-2-img">
            <img src="assets/img/ui/btn_options.webp" alt="Опции" class="ctrl-btn btn-options-img btn-momentary" data-base="btn_options">
            <img src="assets/img/ui/sep_3.webp" alt="" class="sep-3-img">
            <img src="assets/img/ui/arrow_right.webp" alt="Right" class="ctrl-btn arrow-right-img btn-momentary" id="btn-arrow-right" data-base="arrow_right">
        `;
        bindStandardControls();
    }

    bindMomentaryEvents();
}

function bindStandardControls() {
    const leftBtn = document.getElementById('btn-arrow-left');
    const rightBtn = document.getElementById('btn-arrow-right');
    const installBtn = document.getElementById('btn-install');

    const optionsBtn = document.querySelector('.btn-options-img');
    if (optionsBtn) {
        optionsBtn.addEventListener('click', openOptionsModal);
    }

    if (leftBtn) {
        leftBtn.addEventListener('click', () => {
            const data = sectionsData[currentSectionKey];
            if (!data) return;
            const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
            const items = activeTab.items || [];

            if (items.length > 0 && currentItemIndex > 0) {
                playSound('grid.wav');
                currentItemIndex--;
                renderStandardItemList(items);
            }
        });
    }

    if (rightBtn) {
        rightBtn.addEventListener('click', () => {
            const data = sectionsData[currentSectionKey];
            if (!data) return;
            const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
            const items = activeTab.items || [];

            if (items.length > 0 && currentItemIndex < items.length - 1) {
                playSound('grid.wav');
                currentItemIndex++;
                renderStandardItemList(items);
            }
        });
    }

    if (installBtn) {
        installBtn.addEventListener('click', () => {
            const data = sectionsData[currentSectionKey];
            if (!data) return;
            const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
            const items = activeTab.items || [];
            const currentItem = items[currentItemIndex];

            if (currentItem && currentItem.url && currentItem.url.trim() !== '') {
                playSound('setup.wav');
                openDirectUrl(currentItem.url);
            }
        });
    }
}

function bindMusicControls() {
    const playBtn = document.getElementById('mus-play-btn');
    const stopBtn = document.getElementById('mus-stop-btn');
    const prevBtn = document.getElementById('mus-prev-btn');
    const nextBtn = document.getElementById('mus-next-btn');

    const musOptBtn = document.querySelector('[data-base="mus_opt"]');
    if (musOptBtn) {
        musOptBtn.addEventListener('click', openOptionsModal);
    }

    if (!playBtn || !stopBtn) return;

    playBtn.addEventListener('click', () => {
        const data = sectionsData.muzyka;
        const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
        const activeTabIndex = data.tabs.indexOf(activeTab);

        if (playerState === 'stopped' || !activePlayingSource || activePlayingSource.tabIndex !== activeTabIndex) {
            activePlayingSource = {
                tabIndex: activeTabIndex,
                trackIndex: currentTrackIndex,
                tracks: activeTab.tracks
            };
            const track = activePlayingSource.tracks[currentTrackIndex];
            remainingSeconds = parseDuration(track.duration);
            playerState = 'playing';

            startPlaybackTimer();
            updateGreenDisplay();
            updateControlsUI();
        } else if (playerState === 'playing') {
            playerState = 'paused';
        } else if (playerState === 'paused') {
            playerState = 'playing';
        }
    });

    stopBtn.addEventListener('click', () => {
        stopPlayback();
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (playerState !== 'stopped' && activePlayingSource) {
                if (activePlayingSource.trackIndex > 0) {
                    activePlayingSource.trackIndex--;
                    const newTrack = activePlayingSource.tracks[activePlayingSource.trackIndex];
                    remainingSeconds = parseDuration(newTrack.duration);
                    syncPlayingViewWithCurrentTab();
                    updateGreenDisplay();
                }
            } else {
                if (currentTrackIndex > 0) {
                    selectMusicTrack(currentTrackIndex - 1);
                }
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (playerState !== 'stopped' && activePlayingSource) {
                if (activePlayingSource.trackIndex < activePlayingSource.tracks.length - 1) {
                    activePlayingSource.trackIndex++;
                    const newTrack = activePlayingSource.tracks[activePlayingSource.trackIndex];
                    remainingSeconds = parseDuration(newTrack.duration);
                    syncPlayingViewWithCurrentTab();
                    updateGreenDisplay();
                }
            } else {
                const data = sectionsData.muzyka;
                const activeTab = data.tabs.find(t => t.active) || data.tabs[0];
                if (currentTrackIndex < activeTab.tracks.length - 1) {
                    selectMusicTrack(currentTrackIndex + 1);
                }
            }
        });
    }
}

function update3StateSrc(btn, state) {
    const base = btn.getAttribute('data-base');
    if (!base) return;

    // Поддержка обёртки (logo-wrapper): меняем src у вложенного img
    const target = (btn.tagName === 'IMG') ? btn : (btn.querySelector('img') || btn);

    if (state === 'active') {
        target.src = `assets/img/ui/${base}_3.webp`;
    } else if (state === 'hover') {
        target.src = `assets/img/ui/${base}_2.webp`;
    } else {
        target.src = `assets/img/ui/${base}.webp`;
    }
}

function bindHeaderEvents() {
    const headerButtons = document.querySelectorAll('.header-btn');
    if (headerButtons.length <= 1) return;

    headerButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if (!btn.classList.contains('active')) update3StateSrc(btn, 'hover');
        });
        btn.addEventListener('mouseleave', () => {
            if (!btn.classList.contains('active')) update3StateSrc(btn, 'default');
        });
    });
}

function bindMomentaryEvents() {
    const momentaryBtns = document.querySelectorAll('.btn-momentary');
    momentaryBtns.forEach(btn => {
        let isHovered = false;

        btn.addEventListener('mouseenter', () => {
            isHovered = true;
            if (!btn.classList.contains('pressing')) update3StateSrc(btn, 'hover');
        });

        btn.addEventListener('mouseleave', () => {
            isHovered = false;
            btn.classList.remove('pressing');
            update3StateSrc(btn, 'default');
        });

        btn.addEventListener('mousedown', () => {
            btn.classList.add('pressing');
            update3StateSrc(btn, 'active');
        });

        btn.addEventListener('mouseup', () => {
            btn.classList.remove('pressing');
            if (isHovered) update3StateSrc(btn, 'hover');
            else update3StateSrc(btn, 'default');
        });
    });
}

function startMediaRotator() {
    const sideImg = document.getElementById('side-media-img');
    const mainImg = document.getElementById('main-media-img');

    if (!sideImg || !mainImg) return;

    setInterval(() => {
        mediaTickCounter++;

        const leftIndex = (mediaTickCounter % TOTAL_LEFT_MEDIA) + 1;
        const centerIndex = (mediaTickCounter % TOTAL_CENTER_MEDIA) + 1;

        sideImg.src = `assets/img/ui/media_left${padZero(leftIndex)}.webp`;
        mainImg.src = `assets/img/ui/media_center${padZero(centerIndex)}.webp`;
    }, 8000);
}

function showSplashScreen() {
    const splashOverlay = document.createElement('div');
    splashOverlay.id = 'splash-overlay';
    splashOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        cursor: pointer;
    `;

    const splashImg = document.createElement('img');
    splashImg.src = 'assets/img/ui/splash.webp';
    splashImg.alt = 'Splash';
    splashImg.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        user-select: none;
        pointer-events: none;
    `;

    splashOverlay.appendChild(splashImg);
    document.body.appendChild(splashOverlay);

    const closeSplash = () => {
        clearTimeout(timer);
        splashOverlay.removeEventListener('click', closeSplash);
        if (splashOverlay.parentNode) {
            splashOverlay.parentNode.removeChild(splashOverlay);
        }
    };

    const timer = setTimeout(closeSplash, 5000);
    splashOverlay.addEventListener('click', closeSplash);
}

// Состояние опций
let optionsState = {
    soundOff: false,
    wallpapersOff: false,
    wallpaperSelect: 'black'
};

function setCustomSelectValue(sel, value) {
    if (!sel) return;
    const option = sel.querySelector(`.win95-custom-select-option[data-value="${value}"]`)
        || sel.querySelector('.win95-custom-select-option');
    if (!option) return;

    sel.dataset.value = option.dataset.value;
    const display = sel.querySelector('.win95-custom-select-display');
    if (display) display.textContent = option.textContent;

    sel.querySelectorAll('.win95-custom-select-option').forEach(opt => {
        opt.classList.toggle('active', opt === option);
    });
}

function closeCustomSelect(sel) {
    if (!sel) return;
    const list = sel.querySelector('.win95-custom-select-list');
    if (list) list.hidden = true;
}

function openOptionsModal() {
    playSound('options.wav');

    const soundCb = document.getElementById('opt-sound-off');
    const wallCb = document.getElementById('opt-wallpapers-off');
    const wallSel = document.getElementById('opt-wallpapers-select');

    if (soundCb) soundCb.checked = optionsState.soundOff;
    if (wallCb) wallCb.checked = optionsState.wallpapersOff;
    if (wallSel) {
        setCustomSelectValue(wallSel, optionsState.wallpaperSelect);
        closeCustomSelect(wallSel);
    }

    document.getElementById('options-modal').classList.add('active');
}

function closeOptionsModal() {
    const wallSel = document.getElementById('opt-wallpapers-select');
    closeCustomSelect(wallSel);
    document.getElementById('options-modal').classList.remove('active');
}

function saveOptionsModal() {
    playSound('ding.wav');

    const soundCb = document.getElementById('opt-sound-off');
    const wallCb = document.getElementById('opt-wallpapers-off');
    const wallSel = document.getElementById('opt-wallpapers-select');

    if (soundCb) optionsState.soundOff = soundCb.checked;
    if (wallCb) optionsState.wallpapersOff = wallCb.checked;
    if (wallSel) optionsState.wallpaperSelect = wallSel.dataset.value || 'black';

    closeOptionsModal();
}

function initCustomSelects() {
    const wallSel = document.getElementById('opt-wallpapers-select');
    if (!wallSel) return;

    const display = wallSel.querySelector('.win95-custom-select-display');
    const list = wallSel.querySelector('.win95-custom-select-list');
    if (!display || !list) return;

    display.addEventListener('click', (e) => {
        e.stopPropagation();
        list.hidden = !list.hidden;
    });

    list.querySelectorAll('.win95-custom-select-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            setCustomSelectValue(wallSel, opt.dataset.value);
            closeCustomSelect(wallSel);
        });
    });

    document.addEventListener('click', (e) => {
        if (!wallSel.contains(e.target)) {
            closeCustomSelect(wallSel);
        }
    });
}

// Воспроизведение UI-звуков с поддержкой опции "Отключить звук"
function playSound(filename) {
    if (optionsState.soundOff) return;
    
    const audio = new Audio(`assets/sound/${filename}`);
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

// Единый главный блок инициализации
window.addEventListener('resize', scaleApp);

document.addEventListener('DOMContentLoaded', () => {
    showSplashScreen();
    scaleApp();
    loadAppData();
    startMediaRotator();

    // События модального окна Опций
    initCustomSelects();
    document.getElementById('options-ok-btn').addEventListener('click', saveOptionsModal);
    document.getElementById('options-cancel-btn').addEventListener('click', closeOptionsModal);
    
    // Клик по логотипу Game.EXE (обёртка — img без pointer-events, чтобы Яндекс не показывал тулбар)
    const logoEl = document.getElementById('exe-logo') || document.querySelector('.logo-wrapper');
    if (logoEl) {
        logoEl.addEventListener('click', () => {
            openConfirmModal('www.game-exe.ru');
        });
    }

    // Навигационные кнопки слева
    const navButtons = document.querySelectorAll('.nav-btn-img');
    navButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if (!btn.classList.contains('active')) update3StateSrc(btn, 'hover');
        });
        btn.addEventListener('mouseleave', () => {
            if (!btn.classList.contains('active')) update3StateSrc(btn, 'default');
        });
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            playSound('sp_btn.wav');

            navButtons.forEach(b => {
                b.classList.remove('active');
                update3StateSrc(b, 'default');
            });
            btn.classList.add('active');
            update3StateSrc(btn, 'active');

            const sectionKey = btn.getAttribute('data-section');
            loadSection(sectionKey);
        });
    });

    // Кнопки управления окном
    const winButtons = document.querySelectorAll('.win-btn');
    winButtons.forEach(btn => {
        const base = btn.getAttribute('data-base');
        btn.addEventListener('mousedown', () => btn.src = `assets/img/ui/${base}_2.webp`);
        btn.addEventListener('mouseup', () => btn.src = `assets/img/ui/${base}.webp`);
        btn.addEventListener('mouseleave', () => btn.src = `assets/img/ui/${base}.webp`);

        if (base === 'win_close' || btn.classList.contains('win-close-btn')) {
            btn.addEventListener('click', () => {
                playSound('exit.wav');
            });
        }
    });

    // События модального окна ссылки
    document.getElementById('confirm-yes-btn').addEventListener('click', () => {
        if (pendingUrl) {
            openArchivedUrl(pendingUrl);
        }
        closeConfirmModal();
    });

    document.getElementById('confirm-no-btn').addEventListener('click', closeConfirmModal);
    document.getElementById('confirm-close-x').addEventListener('click', closeConfirmModal);

    // События просмотрщика изображений
    const viewerBody = document.getElementById('viewer-body') || document.querySelector('.viewer-body');
    if (viewerBody) {
        viewerBody.addEventListener('click', (e) => {
            e.stopPropagation();
            
            playSound('picture.wav');

            currentViewerIndex++;
            if (currentViewerIndex >= currentViewerScreens.length) {
                closeImageViewer();
            } else {
                updateViewerDisplay();
            }
        });
    }

    document.getElementById('viewer-close-btn').addEventListener('click', closeImageViewer);

    // Инициализация кастомного курсора
    const cursor = document.createElement('img');
    cursor.id = 'app-custom-cursor';
    cursor.src = 'assets/img/ui/cursor.webp';
    cursor.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 999999;
        display: none;
    `;
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', (e) => {
        cursor.style.display = 'block';
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.display = 'none';
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, .expanded-link, .logo-wrapper, #exe-logo')) {
            cursor.src = 'assets/img/ui/cursor_links.webp';
        } else {
            cursor.src = 'assets/img/ui/cursor.webp';
        }
    });
});

// Прямое открытие ссылки (для кнопки «Установить» — url из JSON)
function openDirectUrl(rawUrl) {
    if (!rawUrl || rawUrl.trim() === '') return;

    let cleanUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'http://' + cleanUrl;
    }
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
}

// Вспомогательная функция открытия ссылок через Web Archive
function openArchivedUrl(rawUrl) {
    if (!rawUrl || rawUrl.trim() === '') return;
    
    let cleanUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'http://' + cleanUrl;
    }    
    const archiveUrl = `https://web.archive.org/web/200107/${cleanUrl}`;
    // Третий аргумент 'noopener,noreferrer' — это и есть JS-аналог rel="noopener noreferrer"
    window.open(archiveUrl, '_blank', 'noopener,noreferrer');
}

// Перехватываем клики по стандартным HTML-тегам <a href="...">
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            e.preventDefault();
            openArchivedUrl(href);
        }
    }
});