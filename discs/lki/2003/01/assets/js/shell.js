    const shell = document.getElementById('shell');
    const bgImg = document.getElementById('bg');
    const content = document.getElementById('content');
    const listEl = document.getElementById('list');
    const docView = document.getElementById('doc-view');
    const docHeader = document.getElementById('doc-header');
    const docBody = document.getElementById('doc-body');
    const docScroll = document.getElementById('doc-scroll');

    // Текущее активное верхнее меню (guides / best / ...)
    let activeMenu = null;
    // Стек навигации внутри меню: ['guides', 'age-of-mythology', ...]
    let navStack = [];
    // Режим: 'list' | 'doc'
    let viewMode = 'list';
    // Заголовок открытого документа (для шапки)
    let currentDocTitle = '';
    // Нужна ли кнопка «Распаковать» у текущего документа
    let currentDocUnpack = false;

    // Кнопки, у которых есть действие (меню)
    const actionButtons = ['guides', 'best', 'programs', 'patches', 'demos', 'about'];

    // ========== Масштабирование ==========
    function scaleShell() {
      const ww = window.innerWidth;
      const wh = window.innerHeight;
      const scale = Math.min(ww / 1600, wh / 1200);
      shell.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    window.addEventListener('resize', () => {
      scaleShell();
      updateScrollbar();
    });
    scaleShell();

    // ========== Фон ==========
    function setBackground(useBg0) {
      bgImg.src = useBg0
        ? 'assets/img/ui/bg0.webp'
        : 'assets/img/ui/bg.webp';
    }

    // ========== Управление видимостью кнопок ==========
    function hideAllButtons() {
      document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.remove('visible', 'active');
      });
    }

    function showActiveButton(id) {
      hideAllButtons();
      if (id) {
        const btn = document.getElementById('btn-' + id);
        if (btn) btn.classList.add('active');
      }
    }

    // ========== Путь к JSON ==========
    // Корневое меню: assets/data/guides.json
    // Подменю:      assets/data/guides/age-of-mythology.json
    function getJsonPath(stack) {
      if (stack.length === 1) {
        return `assets/data/${stack[0]}.json`;
      }
      // stack = ['guides', 'age-of-mythology'] → assets/data/guides/age-of-mythology.json
      return `assets/data/${stack[0]}/${stack.slice(1).join('/')}.json`;
    }

    // ========== Загрузка и отрисовка списка ==========
    async function loadCurrentList() {
      if (navStack.length === 0) {
        clearContent();
        return;
      }
      const path = getJsonPath(navStack);
      try {
        const resp = await fetch(path);
        if (!resp.ok) throw new Error('JSON not found: ' + path);
        const data = await resp.json();
        renderList(data.items || []);
        showList();
      } catch (e) {
        console.warn('Не удалось загрузить список:', path, e);
        listEl.innerHTML = '';
        content.classList.remove('visible');
      }
    }

    function getItemImage(type) {
      if (type === 'folder') return 'assets/img/ui/list_folder.webp';
      if (type === 'back')   return 'assets/img/ui/list_back.webp';
      return 'assets/img/ui/list_file.webp';
    }

    function renderList(items) {
      listEl.innerHTML = '';
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.dataset.id = item.id || '';
        div.dataset.type = item.type || 'file';

        const img = document.createElement('img');
        img.src = getItemImage(item.type);
        img.alt = '';
        img.draggable = false;

        const span = document.createElement('span');
        span.textContent = item.label || '';

        div.appendChild(img);
        div.appendChild(span);

        div.addEventListener('click', () => handleListClick(item));

        listEl.appendChild(div);
      });
      requestAnimationFrame(() => {
        if (viewMode !== 'list') return;
        const overflows = listEl.scrollHeight > content.clientHeight - 8;
        content.classList.toggle('list-centered', !overflows);
        content.classList.toggle('list-scroll', overflows);
        if (overflows) content.scrollTop = 0;
      });
    }

    function handleListClick(item) {
      if (item.type === 'back') {
        // Вернуться на уровень выше
        if (navStack.length > 1) {
          navStack.pop();
          showList();
          loadCurrentList();
        }
        return;
      }

      if (item.type === 'folder') {
        // Зайти в подменю
        navStack.push(item.id);
        showList();
        loadCurrentList();
        return;
      }

      // type === 'file' — открыть документ
      if (item.src) {
        openDocument(item);
      } else {
        console.log('Нет src у файла:', item.id, item.label);
      }
    }

    async function openDocument(item) {
      const path = 'assets/data/' + item.src;
      try {
        const resp = await fetch(path);
        if (!resp.ok) throw new Error('not found');
        const html = await resp.text();
        // Вытаскиваем только <article class="doc">...</article>
        const m = html.match(/<article class="doc">([\s\S]*?)<\/article>/i);
        const inner = m ? m[1] : html;
        docBody.innerHTML = inner;
        docHeader.textContent = item.label || '';
        currentDocTitle = item.label || '';
        // unpack: true — явно нужна; unpack: false — явно нет;
        // иначе — по разделу (best/programs/patches/demos)
        if (item.unpack === true) currentDocUnpack = true;
        else if (item.unpack === false) currentDocUnpack = false;
        else currentDocUnpack = unpackMenus.includes(activeMenu);
        bindDocImages();
        showDoc();
        docScroll.scrollTop = 0;
        updateScrollbar();
      } catch (e) {
        console.warn('Не удалось открыть документ:', path, e);
      }
    }

    // ========== Кастомный скроллбар ==========
    const sbRoot = document.getElementById('doc-scrollbar');
    const sbUp = document.getElementById('sb-up');
    const sbDown = document.getElementById('sb-down');
    const sbTrack = document.getElementById('sb-track');
    const sbThumb = document.getElementById('sb-thumb');
    const THUMB_H = 132;
    let sbDragging = false;
    let sbDragStartY = 0;
    let sbDragStartTop = 0;

    function updateScrollbar() {
      if (!docScroll || viewMode !== 'doc') return;
      const scrollH = docScroll.scrollHeight;
      const clientH = docScroll.clientHeight;
      if (scrollH <= clientH + 2) {
        sbRoot.classList.add('hidden');
        return;
      }
      sbRoot.classList.remove('hidden');
      const trackH = sbTrack.clientHeight;
      const maxTop = Math.max(0, trackH - THUMB_H);
      const ratio = docScroll.scrollTop / (scrollH - clientH);
      sbThumb.style.top = (ratio * maxTop) + 'px';
    }

    docScroll.addEventListener('scroll', updateScrollbar);

    sbUp.addEventListener('mousedown', e => {
      e.preventDefault();
      docScroll.scrollBy({ top: -80, behavior: 'smooth' });
    });
    sbDown.addEventListener('mousedown', e => {
      e.preventDefault();
      docScroll.scrollBy({ top: 80, behavior: 'smooth' });
    });

    sbThumb.addEventListener('mousedown', e => {
      e.preventDefault();
      sbDragging = true;
      sbDragStartY = e.clientY;
      sbDragStartTop = parseFloat(sbThumb.style.top) || 0;
    });
    window.addEventListener('mousemove', e => {
      if (!sbDragging) return;
      const trackH = sbTrack.clientHeight;
      const maxTop = Math.max(0, trackH - THUMB_H);
      // Учитываем масштаб шелла
      const shellScale = Math.min(window.innerWidth / 1600, window.innerHeight / 1200);
      const dy = (e.clientY - sbDragStartY) / (shellScale || 1);
      const newTop = Math.max(0, Math.min(maxTop, sbDragStartTop + dy));
      sbThumb.style.top = newTop + 'px';
      const scrollH = docScroll.scrollHeight - docScroll.clientHeight;
      docScroll.scrollTop = (maxTop > 0 ? newTop / maxTop : 0) * scrollH;
    });
    window.addEventListener('mouseup', () => { sbDragging = false; });

    // Клик по треку — прыжок
    sbTrack.addEventListener('mousedown', e => {
      if (e.target === sbThumb) return;
      e.preventDefault();
      const trackH = sbTrack.clientHeight;
      const maxTop = Math.max(0, trackH - THUMB_H);
      const rect = sbTrack.getBoundingClientRect();
      const shellScale = Math.min(window.innerWidth / 1600, window.innerHeight / 1200);
      const y = (e.clientY - rect.top) / (shellScale || 1) - THUMB_H / 2;
      const newTop = Math.max(0, Math.min(maxTop, y));
      const scrollH = docScroll.scrollHeight - docScroll.clientHeight;
      docScroll.scrollTop = (maxTop > 0 ? newTop / maxTop : 0) * scrollH;
      updateScrollbar();
    });

    // Полноразмерный просмотр: зажали ЛКМ — увеличить, отпустили — вернуть
    const lightbox = document.getElementById('img-lightbox');
    const lightboxImg = lightbox.querySelector('img');

    function bindDocImages() {
      docBody.querySelectorAll('.doc-img').forEach(figure => {
        const img = figure.querySelector('img');
        if (!img) return;
        img.setAttribute('draggable', 'false');
        figure.addEventListener('mousedown', e => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          showLightbox(img);
        });
        figure.addEventListener('dragstart', e => e.preventDefault());
        figure.addEventListener('contextmenu', e => e.preventDefault());
      });
    }

    function showLightbox(imgEl) {
      const src = imgEl.currentSrc || imgEl.src;

      // Реальный размер файла (не CSS-превью на странице)
      const probe = new Image();
      probe.onload = () => {
        const nw = probe.naturalWidth;
        const nh = probe.naturalHeight;
        // ×2 от файла, но не больше шелла 1600×1200
        // 800×600 → 1600×1200 (ровно весь экран)
        let w = nw * 2;
        let h = nh * 2;
        const fit = Math.min(1, 1600 / w, 1200 / h);
        w = Math.round(w * fit);
        h = Math.round(h * fit);

        lightboxImg.src = src;
        lightboxImg.style.width = w + 'px';
        lightboxImg.style.height = h + 'px';

        // Старт анимации: scale(0.5) → scale(1).
        // Инлайн-transform обязательно доводим до scale(1),
        // иначе он перебивает CSS и картинка остаётся в 50% размера.
        lightbox.classList.remove('visible');
        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = 'scale(0.5)';
        void lightboxImg.offsetWidth; // reflow
        lightboxImg.style.transition = 'transform 0.4s ease-out';
        requestAnimationFrame(() => {
          lightbox.classList.add('visible');
          lightboxImg.style.transform = 'scale(1)';
        });
      };
      probe.onerror = () => {
        lightboxImg.src = src;
        lightboxImg.style.width = '1600px';
        lightboxImg.style.height = '1200px';
        lightboxImg.style.transform = 'scale(1)';
        lightbox.classList.add('visible');
      };
      probe.src = src;
    }

    function hideLightbox() {
      lightbox.classList.remove('visible');
    }

    window.addEventListener('mouseup', hideLightbox);
    window.addEventListener('blur', hideLightbox);
    lightbox.addEventListener('mouseup', hideLightbox);
    lightbox.addEventListener('mouseleave', hideLightbox);

    const btnDocBack = document.getElementById('btn-docback');
    const btnUnpack = document.getElementById('btn-unpack');
    const unpackDialog = document.getElementById('unpack-dialog');

    // Разделы, где у file-документов по умолчанию показывается «Распаковать»
    // (для about — только у сохранёнок через item.unpack: true)
    const unpackMenus = ['best', 'programs', 'patches', 'demos'];

    function showUnpackBtn() {
      if (currentDocUnpack) {
        btnUnpack.classList.add('visible');
      } else {
        btnUnpack.classList.remove('visible');
      }
    }

    function hideUnpackBtn() {
      btnUnpack.classList.remove('visible');
      unpackDialog.classList.remove('visible');
      currentDocUnpack = false;
    }

    function showList() {
      viewMode = 'list';
      listEl.classList.remove('hidden');
      docView.classList.remove('visible');
      content.classList.remove('mode-doc');
      content.classList.add('mode-list');
      content.classList.add('visible');
      btnDocBack.classList.remove('visible');
      hideUnpackBtn();
      hideLightbox();
      requestAnimationFrame(() => {
        const overflows = listEl.scrollHeight > content.clientHeight - 8;
        content.classList.toggle('list-centered', !overflows);
        content.classList.toggle('list-scroll', overflows);
        if (overflows) content.scrollTop = 0;
      });
    }

    function showDoc() {
      viewMode = 'doc';
      listEl.classList.add('hidden');
      docView.classList.add('visible');
      content.classList.remove('mode-list', 'list-centered', 'list-scroll');
      content.classList.add('mode-doc');
      content.classList.add('visible');
      btnDocBack.classList.add('visible');
      showUnpackBtn();
      requestAnimationFrame(() => updateScrollbar());
      // после подгрузки картинок пересчитать скролл
      setTimeout(updateScrollbar, 300);
    }

    function clearContent() {
      listEl.innerHTML = '';
      docBody.innerHTML = '';
      docHeader.textContent = '';
      listEl.classList.remove('hidden');
      docView.classList.remove('visible');
      content.classList.remove('visible', 'mode-doc', 'mode-list', 'list-centered', 'list-scroll');
      btnDocBack.classList.remove('visible');
      hideUnpackBtn();
      hideLightbox();
      viewMode = 'list';
    }

    // ========== Обработка кликов по кнопкам ==========
    function activateMenu(menuId) {
      activeMenu = menuId;
      navStack = [menuId];           // сброс стека на корень меню
      setBackground(false);          // bg.webp
      showActiveButton(menuId);      // кнопка остаётся видимой
      hideUnpackBtn();
      loadCurrentList();
    }

    function goToStart() {
      activeMenu = null;
      navStack = [];
      setBackground(true);           // bg0.webp
      hideAllButtons();
      clearContent();
    }

    // ========== Наведение (hover) ==========
    const hits = document.querySelectorAll('.hit');

    hits.forEach(hit => {
      const id = hit.dataset.btn;
      const btn = document.getElementById('btn-' + id);

      // Показывать кнопку при наведении, если она не активна
      const showOnHover = () => {
        if (activeMenu !== id) {
          btn.classList.add('visible');
        }
      };
      const hideOnLeave = () => {
        if (activeMenu !== id) {
          btn.classList.remove('visible');
        }
      };

      hit.addEventListener('mouseenter', showOnHover);
      hit.addEventListener('mouseleave', hideOnLeave);
      btn.addEventListener('mouseenter', showOnHover);
      btn.addEventListener('mouseleave', hideOnLeave);

      // Клик
      const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Три кнопки окна слева внизу — возврат на стартовый экран
        if (id === 'maximize' || id === 'minimize' || id === 'close') {
          goToStart();
          return;
        }

        // Кнопка с действием (меню)
        if (actionButtons.includes(id)) {
          // Повторный клик по уже открытому разделу —
          // снова открываем его корень (сброс вложенности)
          activateMenu(id);
        }
      };

      hit.addEventListener('click', handleClick);
      btn.addEventListener('click', handleClick);
    });

    // Кнопка «Назад» в режиме документа — вернуться к предыдущему списку
    btnDocBack.addEventListener('click', () => {
      if (viewMode === 'doc') {
        showList();
        loadCurrentList();
      }
    });

    // Кнопка «Распаковать»: клик открывает диалог unpack3
    btnUnpack.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!btnUnpack.classList.contains('visible')) return;
      unpackDialog.classList.add('visible');
    });

    // Закрытие диалога — клик в любую область (включая сам диалог)
    unpackDialog.addEventListener('click', () => {
      unpackDialog.classList.remove('visible');
    });

    // Стартовое состояние
    goToStart();

    // Сплэш-логотип: один раз за сессию браузера
    (function showSplashOnce() {
      const splash = document.getElementById('splash');
      if (!splash) return;
      try {
        if (sessionStorage.getItem('lki_splash_shown') === '1') {
          splash.classList.add('hidden');
          splash.style.display = 'none';
          return;
        }
        sessionStorage.setItem('lki_splash_shown', '1');
      } catch (e) {
        // sessionStorage недоступен — всё равно показать один раз в этой загрузке
      }
      // Показать ~2 сек, затем плавно скрыть
      setTimeout(() => {
        splash.classList.add('hidden');
        setTimeout(() => { splash.style.display = 'none'; }, 650);
      }, 2000);
    })();
