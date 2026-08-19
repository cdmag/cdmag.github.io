// Universal helper to open links via Web Archive securely
function openArchivedUrl(rawUrl) {
    if (!rawUrl || rawUrl.trim() === '' || rawUrl === '#') return;
    let cleanUrl = rawUrl.trim();
    if (/^https?:\/\/web\.archive\.org/i.test(cleanUrl)) {
        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
        return;
    }
    if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'http://' + cleanUrl;
    }
    const archiveUrl = 'https://web.archive.org/web/200205/' + cleanUrl;
    window.open(archiveUrl, '_blank', 'noopener,noreferrer');
}

function renderMetaTable(item) {
    const metaTable = document.getElementById('meta-table');
    if (!metaTable) return;
    
    metaTable.innerHTML = '';

    const fields = [
        { keys: ['genre'],                             label: 'Жанр:',             isLink: false },
        { keys: ['publisher'],                         label: 'Издатель:',         isLink: false },
        { keys: ['publisherUrl', 'publisherSite'],     label: 'Сайт издателя:',    isLink: true  },
        { keys: ['developer'],                         label: 'Разработчик:',      isLink: false },
        { keys: ['developerUrl', 'developerSite'],     label: 'Сайт разработчика:', isLink: true  },
        { keys: ['author'],                            label: 'Автор:',            isLink: false },
        { keys: ['requirements'],                      label: 'Требования:',       isLink: false },
        { keys: ['recommendations', 'recommended'],    label: 'Рекомендуем:',      isLink: false },
        { keys: ['releaseDate'],                       label: 'Дата выхода:',      isLink: false },
        { keys: ['gameUrl', 'gameSite'],               label: 'Сайт игры:',        isLink: true  },
        { keys: ['nimUrl', 'ourSite'],                 label: 'Сайт НИМ:',         isLink: true  },
        { keys: ['rating'],                            label: 'Рейтинг:',         isLink: false },
    ];

    let hasData = false;

    fields.forEach(f => {
        let val = null;
        for (let k of f.keys) {
            if (item[k] && typeof item[k] === 'string' && item[k].trim() !== '') {
                val = item[k];
                break;
            }
        }

        if (val) {
            hasData = true;
            const tr = document.createElement('tr');
            
            const tdLabel = document.createElement('td');
            tdLabel.className = 'meta-label';
            tdLabel.textContent = f.label;
            
            const tdVal = document.createElement('td');
            tdVal.className = 'meta-value';

            if (f.isLink) {
                const urls = val.split('\n').map(u => u.trim()).filter(u => u !== '');
                tdVal.innerHTML = urls.map(u => '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>').join('<br>');
            } else {
                tdVal.textContent = val;
            }

            tr.appendChild(tdLabel);
            tr.appendChild(tdVal);
            metaTable.appendChild(tr);
        }
    });

    metaTable.style.display = hasData ? 'table' : 'none';
}

(function () {
    const shell = document.getElementById('shell');
    const BASE_W = 1600, BASE_H = 1200;

    function scaleShell() {
        const scale = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
        shell.style.transform = 'scale(' + scale + ')';
    }
    scaleShell();
    window.addEventListener('resize', scaleShell);

    const btnMap = {
        demos:   { el: document.getElementById('btn-demos'),   base: 'demos' },
        video:   { el: document.getElementById('btn-video'),   base: 'video' },
        files:   { el: document.getElementById('btn-files'),   base: 'files' },
        patches: { el: document.getElementById('btn-patches'), base: 'patches' },
        drivers: { el: document.getElementById('btn-drvs'),    base: 'drvs' },
        free:    { el: document.getElementById('btn-bonus'),   base: 'free' },
        cyber:   { el: document.getElementById('btn-cyber'),   base: 'cyber' },
        bonus:   { el: document.getElementById('btn-free'),    base: 'bonus' }
    };
    const IMG_PATH = 'assets/img/ui/';
    let activeSection = null;
    let sectionsData = null;
    let currentItems = [];
    let selectedItemId = null;
    let clickSound = null;
    let expandedParents = {};

    // Gallery state
    let modalImagesList = [];
    let modalCurrentIndex = 0;

    try {
        clickSound = new Audio('assets/sound/click.wav');
        clickSound.preload = 'auto';
    } catch (e) {}

    function playClickSound() {
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        }
    }

    function setBtnState(key, state) {
        const btn = btnMap[key];
        if (!btn) return;
        btn.el.src = IMG_PATH + btn.base + state + '.webp';
    }

    // Action button logic
    const actionBtn = document.getElementById('btn-action');
    let actionBase = 'install';
    let actionLocked = false;

    function setActionState(state) {
        actionBtn.src = IMG_PATH + actionBase + state + '.webp';
    }

    function setActionType(type) {
        actionBase = type;
        setActionState(1);
    }

    actionBtn.addEventListener('mouseenter', () => { if (!actionLocked) setActionState(2); });
    actionBtn.addEventListener('mouseleave', () => { if (!actionLocked) setActionState(1); });
    actionBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        actionLocked = true;
        setActionState(3);
        playClickSound();
    });
    actionBtn.addEventListener('mouseup', () => {
        setTimeout(() => { actionLocked = false; setActionState(1); }, 150);
    });
    actionBtn.addEventListener('mouseout', () => {
        if (actionLocked) {
            setTimeout(() => { actionLocked = false; setActionState(1); }, 150);
        } else {
            setActionState(1);
        }
    });

    actionBtn.addEventListener('click', () => {
        const item = findItem(selectedItemId);
        if (!item) return;

        if (actionBase === 'view') {
            const pageUrl = item.url || 'assets/html/bonus/cover.html';
            if (pageUrl.startsWith('assets/html/') || pageUrl.endsWith('.html')) {
                openGuidesModal(pageUrl);
            } else {
                window.open(pageUrl, '_blank', 'noopener,noreferrer');
            }
        } else if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    });

    function findItem(id) {
        if (!currentItems) return null;
        for (let item of currentItems) {
            if (item.id === id) return item;
            if (item.children) {
                let child = item.children.find(c => c.id === id);
                if (child) return child;
            }
        }
        return null;
    }

    function showSection(key) {
        if (!sectionsData || !sectionsData[key]) return;
        currentItems = sectionsData[key].items || [];
        selectedItemId = null;

        renderList();
        if (currentItems.length > 0) {
            const first = currentItems[0];
            selectItem(first.id);
        } else {
            showEmpty();
        }
    }

    function renderList() {
        const ul = document.getElementById('item-list');
        ul.innerHTML = '';
        if (!currentItems.length) {
            ul.innerHTML = '<li class="empty-hint" style="padding:16px">Нет элементов</li>';
            return;
        }

        currentItems.forEach(item => {
            if (item.isParent || item.children) {
                if (expandedParents[item.id] === undefined) {
                    expandedParents[item.id] = false;
                }
                const isExpanded = expandedParents[item.id];

                const li = document.createElement('li');
                li.className = 'list-item parent-item' + (item.id === selectedItemId ? ' selected' : '');
                li.textContent = (isExpanded ? '▲' : '►') + ' ' + item.name;
                li.dataset.id = item.id;
                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    expandedParents[item.id] = !expandedParents[item.id];
                    selectItem(item.id);
                });
                ul.appendChild(li);

                if (isExpanded && item.children) {
                    item.children.forEach(child => {
                        const childLi = document.createElement('li');
                        childLi.className = 'list-item child-item' + (child.id === selectedItemId ? ' selected' : '');
                        childLi.textContent = child.name;
                        childLi.dataset.id = child.id;
                        childLi.addEventListener('click', (e) => {
                            e.stopPropagation();
                            selectItem(child.id);
                        });
                        ul.appendChild(childLi);
                    });
                }
            } else {
                const li = document.createElement('li');
                li.className = 'list-item' + (item.id === selectedItemId ? ' selected' : '');
                li.textContent = item.name;
                li.dataset.id = item.id;
                li.addEventListener('click', () => selectItem(item.id));
                ul.appendChild(li);
            }
        });
    }

    function createCard(src, altText, isSingle) {
        const card = document.createElement('div');
        card.className = 'img-card ' + (isSingle ? 'single-card' : 'multi-card');

        const img = document.createElement('img');
        img.src = src;
        img.alt = altText || '';
        img.setAttribute('data-ya-action', 'disable');
        img.setAttribute('data-yandex-image-search', 'disable');

        const overlay = document.createElement('div');
        overlay.className = 'img-overlay';

        card.appendChild(img);
        card.appendChild(overlay);
        return card;
    }

    function selectItem(id) {
        selectedItemId = id;
        renderList();
        const item = findItem(id);
        if (!item) { showEmpty(); return; }

        document.getElementById('empty-hint').style.display = 'none';
        document.getElementById('right-content').classList.add('visible');

        document.getElementById('item-title').textContent = item.name || '';

        if (item.isParent || item.noInstall || (activeSection === 'bonus' && !item.hasViewButton && !item.hasInstallButton && !item.url)) {
            actionBtn.style.display = 'none';
        } else {
            actionBtn.style.display = 'block';

            if (item.hasViewButton) {
                setActionType('view');
            } else if (item.hasInstallButton) {
                setActionType('install');
            } else if (activeSection === 'video' || activeSection === 'bonus') {
                setActionType('view');
            } else {
                setActionType('install');
            }
        }

        renderMetaTable(item);

        const descBox = document.getElementById('item-desc');
        descBox.innerHTML = '';
        if (item.description) {
            const lines = item.description.split('\n');
            lines.forEach(line => {
                if (line.trim() !== '') {
                    const p = document.createElement('p');
                    p.className = 'desc-paragraph';
                    p.textContent = line.trim();
                    descBox.appendChild(p);
                }
            });
        }

        const imagesBox = document.getElementById('item-images');
        imagesBox.innerHTML = '';
        const imgs = item.images || [];

        if (imgs.length === 1) {
            const card = createCard(imgs[0], item.name, true);
            card.addEventListener('click', () => openModal(imgs, 0));
            imagesBox.appendChild(card);
        } else if (imgs.length > 1) {
            imgs.forEach((src, idx) => {
                if (!src) return;
                const card = createCard(src, item.name, false);
                card.addEventListener('click', () => openModal(imgs, idx));
                imagesBox.appendChild(card);
            });
        }

        document.getElementById('panel-right').scrollTop = 0;
    }

    function showEmpty() {
        document.getElementById('right-content').classList.remove('visible');
        document.getElementById('empty-hint').style.display = 'block';
        actionBtn.style.display = 'none';
    }

    /* ===== Modal logic ===== */
    const imgModal = document.getElementById('img-modal');
    const modalImg = document.getElementById('modal-img');

    function openModal(images, index) {
        if (!images || !images.length) return;
        modalImagesList = images;
        modalCurrentIndex = index;
        updateModalImage();
        imgModal.classList.add('active');
    }

    function updateModalImage() {
        modalImg.src = modalImagesList[modalCurrentIndex];
    }

    function closeModal() {
        imgModal.classList.remove('active');
    }

    imgModal.addEventListener('click', (e) => {
        if (e.button === 0) closeModal();
    });

    window.addEventListener('keydown', (e) => {
        if (!imgModal.classList.contains('active')) return;

        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            modalCurrentIndex = (modalCurrentIndex - 1 + modalImagesList.length) % modalImagesList.length;
            updateModalImage();
        } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            e.preventDefault();
            modalCurrentIndex = (modalCurrentIndex + 1) % modalImagesList.length;
            updateModalImage();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    });

    /* ===== Guides Window Modal Logic & Controls ===== */
    const guidesModal = document.getElementById('guides-modal');
    const guideIframe = document.getElementById('guide-iframe');
    const btnGuidePrint = document.getElementById('btn-guide-print');
    const btnGuideClose = document.getElementById('btn-guide-close');

    function openGuidesModal(url) {
        guideIframe.src = url || 'assets/html/bonus/cover.html';
        guidesModal.classList.add('active');
    }

    function closeGuidesModal() {
        guidesModal.classList.remove('active');
        guideIframe.src = 'about:blank';

        const linkStatus = document.getElementById('link-status');
        if (linkStatus) {
            linkStatus.textContent = '';
            linkStatus.style.display = 'none';
        }
    }

    function bindTriStateBtn(el, baseName, onClickAction) {
        let isMouseDown = false;
        el.addEventListener('mouseenter', () => { if (!isMouseDown) el.src = IMG_PATH + baseName + '_2.webp'; });
        el.addEventListener('mouseleave', () => { if (!isMouseDown) el.src = IMG_PATH + baseName + '_1.webp'; });
        el.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isMouseDown = true;
            el.src = IMG_PATH + baseName + '_3.webp';
            playClickSound();
        });
        el.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                el.src = IMG_PATH + baseName + '_2.webp';
                if (onClickAction) onClickAction();
            }
        });
        el.addEventListener('mouseout', () => {
            if (isMouseDown) {
                isMouseDown = false;
                el.src = IMG_PATH + baseName + '_1.webp';
            }
        });
    }

    bindTriStateBtn(btnGuidePrint, 'guides_print', () => {
        try {
            if (guideIframe.contentWindow) {
                guideIframe.contentWindow.focus();
                guideIframe.contentWindow.print();
            } else {
                window.print();
            }
        } catch (e) {
            window.print();
        }
    });

    bindTriStateBtn(btnGuideClose, 'guides_close', () => {
        closeGuidesModal();
    });

    fetch('assets/data/sections.json')
        .then(r => r.json())
        .then(data => {
            sectionsData = data;
            activeSection = 'demos';
            setBtnState('demos', 4);
            showSection('demos');
        })
        .catch(err => console.warn('sections.json load failed', err));

    Object.keys(btnMap).forEach(key => {
        const btn = btnMap[key].el;
        btn.addEventListener('mouseenter', () => { if (activeSection !== key) setBtnState(key, 2); });
        btn.addEventListener('mouseleave', () => { setBtnState(key, activeSection === key ? 4 : 1); });
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            setBtnState(key, 3);
            playClickSound();
        });
        btn.addEventListener('mouseup', () => {
            setTimeout(() => {
                if (activeSection && activeSection !== key) setBtnState(activeSection, 1);
                activeSection = key;
                setBtnState(key, 4);
                showSection(key);
            }, 120);
        });
    });
})();

window.addEventListener('message', function(e) {
    if (!e.data || e.data.type !== 'link-status') return;
    var el = document.getElementById('link-status');
    if (!el) return;
    if (e.data.url) {
        el.textContent = e.data.url;
        el.style.display = 'block';
    } else {
        el.textContent = '';
        el.style.display = 'none';
    }
});

/* archive-links-iframe */
(function(){
    var PREFIX = 'https://web.archive.org/web/200205/';
    function isExternal(href) {
        if (!href) return false;
        href = String(href).trim();
        if (!href || href.charAt(0) === '#') return false;
        if (/^(javascript|mailto|tel):/i.test(href)) return false;
        if (/^(https?:)?\/\//i.test(href)) return true;
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) return true;
        return false;
    }
    function toArchive(href) {
        var url = String(href).trim();
        if (url.indexOf('//') === 0) url = 'http:' + url;
        if (/web\.archive\.org/i.test(url)) return url;
        return PREFIX + url;
    }
    function bindDoc(doc) {
        if (!doc || doc.__archiveLinksBound) return;
        doc.__archiveLinksBound = true;
        doc.addEventListener('click', function(e) {
            var t = e.target;
            var a = null;
            while (t && t !== doc && t !== doc.documentElement) {
                if (t.tagName && t.tagName.toLowerCase() === 'a') { a = t; break; }
                t = t.parentNode;
            }
            if (!a) return;
            var href = a.getAttribute('href');
            if (!isExternal(href)) return;
            e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            var target = a.getAttribute('target') || '_blank';
            window.open(toArchive(href), target);
        }, true);
    }
    document.addEventListener('click', function(e) {
        var t = e.target;
        var a = null;
        while (t && t !== document && t !== document.documentElement) {
            if (t.tagName && t.tagName.toLowerCase() === 'a') { a = t; break; }
            t = t.parentNode;
        }
        if (!a) return;
        var href = a.getAttribute('href');
        if (!isExternal(href)) return;
        e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        var target = a.getAttribute('target') || '_blank';
        window.open(toArchive(href), target);
    }, true);
    function bindAllIframes() {
        var list = document.getElementsByTagName('iframe');
        for (var i = 0; i < list.length; i++) {
            (function(frame) {
                function tryBind() {
                    try { bindDoc(frame.contentDocument); } catch (err) {}
                }
                frame.addEventListener('load', tryBind);
                tryBind();
            })(list[i]);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindAllIframes);
    } else {
        bindAllIframes();
    }
})();

/* ===== Intro Video Logic ===== */
(function() {
    const introModal = document.getElementById('intro-modal');
    const introIframe = document.getElementById('intro-iframe');
    const btnIntroClose = document.getElementById('btn-intro-close');
    
    // Чистая ссылка из кода встраивания VK (без добавочного &autoplay=1)
    const INTRO_URL = "https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239018&hash=5d2b7c3f6b926a15&hd=2&autoplay=1";

    function closeIntroModal() {
        if (!introModal) return;
        introModal.classList.remove('active');
        if (introIframe) introIframe.src = 'about:blank';
    }

    function checkAndShowIntro() {
    // Проверяем запись для текущей сессии вкладки
    if (!sessionStorage.getItem('intro_shown')) {
        if (introModal && introIframe) {
            introIframe.src = INTRO_URL;
            introModal.classList.add('active');
        }
        // Запоминаем, что в этой сессии видео уже было показано
        sessionStorage.setItem('intro_shown', 'true');
    }
}

    if (btnIntroClose) {
        btnIntroClose.addEventListener('click', closeIntroModal);
    }

    if (introModal) {
        introModal.addEventListener('click', (e) => {
            if (e.target === introModal) closeIntroModal();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && introModal && introModal.classList.contains('active')) {
            closeIntroModal();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndShowIntro);
    } else {
        checkAndShowIntro();
    }
})();