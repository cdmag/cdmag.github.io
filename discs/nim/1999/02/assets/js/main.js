/**
 * Дисковая оболочка «Навигатор Игрового Мира» 1999 #2
 * Основной интерактивный сценарий интерфейса
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Состояние и постоянный кэш данных в оперативной памяти ---
  const state = {
    currentSection: null,
    selectedItems: {
      demos: null,
      movies: null,
      patches: null,
      files: null,
    },
    data: {
      demos: null,
      movies: null,
      patches: null,
      files: null,
    },
    sectionLists: {
      demos: null,
      movies: null,
      patches: null,
      files: null,
    },
    toastTimer: null,
  };

  // --- Определение базового пути к ресурсам ---
  // Работает и при прямом открытии /nim/1999/02/index.html, и при работе через корень
  const getAssetUrl = (relPath) => {
    const clean = relPath.replace(/^\.?\//, '');
    const pathname = window.location.pathname;
    if (pathname.includes('/nim/1999/02')) {
      // Относительный путь от папки /nim/1999/02/
      return 'assets/' + clean.replace(/^assets\//, '');
    }
    return '/nim/1999/02/' + clean;
  };

  // --- DOM Элементы ---
  const shell = document.getElementById('shell');
  const bgImage = document.getElementById('bg-image');
  const sectionsNav = document.getElementById('sections-nav');
  const menuPopup = document.getElementById('menu-popup');
  const menuList = document.getElementById('menu-list');
  const detailsPanel = document.getElementById('details-panel');
  const descText = document.getElementById('desc-text');
  const btnInstall = document.getElementById('btn-install');
  const screenshotsBar = document.getElementById('screenshots-bar');
  const thumbImgs = [
    document.getElementById('thumb-0'),
    document.getElementById('thumb-1'),
    document.getElementById('thumb-2'),
  ];
  const thumbContainers = [
    document.querySelector('.screenshot-thumb[data-index="0"]'),
    document.querySelector('.screenshot-thumb[data-index="1"]'),
    document.querySelector('.screenshot-thumb[data-index="2"]'),
  ];

  // Модальные окна и оверлеи
  const splashOverlay = document.getElementById('splash-overlay');
  const exitCreditsOverlay = document.getElementById('exit-credits-overlay');
  const installToastOverlay = document.getElementById('install-toast-overlay');
  const imageModal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const btnCloseImage = document.getElementById('btn-close-image');
  const videoModalOverlay = document.getElementById('video-modal-overlay');
  const videoModalContainer = document.getElementById('video-modal-container');
  const btnCloseVideo = document.getElementById('btn-close-video');
  const videoFrameWrapper = document.getElementById('video-frame-wrapper');

  // Резервный плейсхолдер для фона
  const placeholder = document.getElementById('placeholder');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');

  // --- Загрузка данных JSON (сохраняются в памяти навсегда) ---
  async function loadSectionData(sectionKey) {
    if (state.data[sectionKey]) {
      return state.data[sectionKey];
    }
    try {
      const url = getAssetUrl(`assets/data/${sectionKey}.json`);
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} while loading ${url}`);
      }
      const json = await resp.json();
      state.data[sectionKey] = json;
      return json;
    } catch (err) {
      console.error(`Ошибка загрузки данных раздела ${sectionKey}:`, err);
      return [];
    }
  }

  // --- Генерация постоянных узлов меню для каждого раздела (хранятся в памяти) ---
  function buildSectionDOM(sectionKey) {
    if (state.sectionLists[sectionKey]) {
      return state.sectionLists[sectionKey];
    }
    const items = state.data[sectionKey];
    if (!items || !items.length) {
      const li = document.createElement('li');
      li.className = 'menu-entry';
      li.textContent = 'Нет данных';
      state.sectionLists[sectionKey] = [li];
      return state.sectionLists[sectionKey];
    }

    const listNodes = items.map((item) => {
      const li = document.createElement('li');
      li.className = 'menu-entry';
      li.textContent = item.menuTitle;
      li.dataset.id = item.id;
      li.addEventListener('click', () => {
        selectItem(sectionKey, item, li);
      });
      return li;
    });

    state.sectionLists[sectionKey] = listNodes;
    if (!state.selectedItems[sectionKey]) {
      state.selectedItems[sectionKey] = items[0];
    }
    return listNodes;
  }

  // --- Предзагрузка всех разделов в память браузера при инициализации ---
  async function preloadAllData() {
    const sections = ['demos', 'movies', 'patches', 'files'];
    await Promise.all(
      sections.map(async (sec) => {
        await loadSectionData(sec);
        buildSectionDOM(sec);
      })
    );
  }

  // --- Закрытие оверлеев ---
  function closeAllModals() {
    closeImageModal();
    closeVideoModal();
    closeToast();
    closeCredits();
  }

  function closeImageModal() {
    if (imageModal) {
      imageModal.classList.remove('open');
      if (modalImg) modalImg.src = '';
    }
  }

  function openImageModal(src) {
    if (imageModal && modalImg) {
      modalImg.src = src;
      imageModal.classList.add('open');
    }
  }

  function closeVideoModal() {
    if (videoModalOverlay) {
      videoModalOverlay.classList.remove('open');
      if (videoFrameWrapper) {
        videoFrameWrapper.innerHTML = '';
      }
    }
  }

  function openVideoModal(videoUrl) {
    if (!videoModalOverlay || !videoFrameWrapper) return;
    videoFrameWrapper.innerHTML = `
      <iframe
        src="${videoUrl}"
        width="100%"
        height="100%"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture;"
        frameborder="0"
        allowfullscreen
        referrerpolicy="no-referrer"
      ></iframe>
    `;
    videoModalOverlay.classList.add('open');
  }

  function showToast() {
    if (!installToastOverlay) return;
    installToastOverlay.classList.add('active');
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      closeToast();
    }, 3500);
  }

  function closeToast() {
    if (!installToastOverlay) return;
    installToastOverlay.classList.remove('active');
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
      state.toastTimer = null;
    }
  }

  function openCredits() {
    if (!exitCreditsOverlay) return;
    exitCreditsOverlay.classList.add('open');
    if (sectionsNav) {
      sectionsNav.classList.add('hidden-for-overlay');
    }
  }

  function closeCredits() {
    if (!exitCreditsOverlay) return;
    exitCreditsOverlay.classList.remove('open');
    if (sectionsNav) {
      sectionsNav.classList.remove('hidden-for-overlay');
    }
  }

  // --- Закрытие открытых панелей разделов меню и деталей (только визуальное сокрытие) ---
  function closeSections() {
    // Внимание: все данные, списки элементов и выбранные состояния остаются в памяти, скрываем только отображение
    if (menuPopup) {
      menuPopup.classList.remove('open');
      menuPopup.classList.remove('section-movies', 'section-patches');
    }
    if (detailsPanel) {
      detailsPanel.classList.remove('open');
      detailsPanel.classList.remove('no-screenshots');
    }
    state.currentSection = null;
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.remove('active');
    });
  }

  // --- Логика выбора элемента в меню ---
  function selectItem(sectionKey, item, entryEl) {
    if (!item) return;
    state.selectedItems[sectionKey] = item;

    // Подсветка выбранного пункта в меню
    menuList.querySelectorAll('.menu-entry').forEach((el) => {
      el.classList.toggle('selected', el.dataset.id === item.id);
    });

    if (sectionKey === 'movies') {
      // Для роликов открытие модального плеера происходит только при клике по пункту
      if (entryEl && item.videoUrl) {
        openVideoModal(item.videoUrl);
      }
      return;
    }

    // Текст описания
    if (descText) {
      descText.textContent = item.description || '';
    }

    // Скриншоты (только в DEMOS)
    if (sectionKey === 'demos') {
      const screenshots = item.screenshots || [];
      thumbContainers.forEach((container, idx) => {
        const img = thumbImgs[idx];
        const screenFile = screenshots[idx];
        if (screenFile && img && container) {
          const imgSrc = getAssetUrl(`assets/img/content/${screenFile}`);
          img.src = imgSrc;
          img.alt = `${item.menuTitle} — скриншот ${idx + 1}`;
          container.style.display = 'flex';
          container.onclick = () => openImageModal(imgSrc);
        } else if (container) {
          container.style.display = 'none';
        }
      });
    }
  }

  // --- Открытие раздела оболочки ---
  async function openSection(sectionKey) {
    if (sectionKey === 'exit') {
      closeSections();
      closeAllModals();
      openCredits();
      return;
    }
    if (sectionKey === 'internet') {
      // Внешняя ссылка, обрабатывается стандартно
      return;
    }

    closeAllModals();
    state.currentSection = sectionKey;

    // Подсветка активной кнопки раздела в нижней панели
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-section') === sectionKey);
    });

    // Настройка модификаторов списка для специфических разделов (стили шрифтов)
    menuPopup.classList.remove('section-movies', 'section-patches');
    if (sectionKey === 'movies') {
      menuPopup.classList.add('section-movies');
    } else if (sectionKey === 'patches') {
      menuPopup.classList.add('section-patches');
    }

    // Если данные раздела еще не построены в памяти — получаем и строим
    if (!state.sectionLists[sectionKey]) {
      await loadSectionData(sectionKey);
      buildSectionDOM(sectionKey);
    }

    // Мгновенно монтируем готовые узлы из памяти без всяких "Загрузка..."
    menuList.replaceChildren(...(state.sectionLists[sectionKey] || []));
    menuPopup.scrollTop = 0;
    menuPopup.classList.add('open');

    // Управление деталями раздела
    if (sectionKey === 'demos') {
      detailsPanel.classList.remove('no-screenshots');
      detailsPanel.classList.add('open');
      const item = state.selectedItems.demos || (state.data.demos && state.data.demos[0]);
      selectItem('demos', item);
    } else if (sectionKey === 'patches' || sectionKey === 'files') {
      detailsPanel.classList.add('no-screenshots');
      detailsPanel.classList.add('open');
      const item = state.selectedItems[sectionKey] || (state.data[sectionKey] && state.data[sectionKey][0]);
      selectItem(sectionKey, item);
    } else if (sectionKey === 'movies') {
      // В роликах правый блок не отображается (только всплывающий список и модальное видео)
      detailsPanel.classList.remove('open');
      const item = state.selectedItems.movies;
      if (item) {
        menuList.querySelectorAll('.menu-entry').forEach((el) => {
          el.classList.toggle('selected', el.dataset.id === item.id);
        });
      }
    }
  }

  // --- Запуск последовательности сплэш-экрана ---
  function runSplashScreen() {
    const splashSeen = sessionStorage.getItem('nim_1999_02_splash_seen');
    if (splashSeen || !splashOverlay) {
      if (splashOverlay) splashOverlay.style.display = 'none';
      if (sectionsNav) {
        sectionsNav.classList.remove('hidden-for-overlay');
      }
      return;
    }

    splashOverlay.classList.add('active');
    if (sectionsNav) {
      sectionsNav.classList.add('hidden-for-overlay');
    }

    const slides = [
      document.getElementById('splash-slide-0'),
      document.getElementById('splash-slide-1'),
      document.getElementById('splash-slide-2'),
      document.getElementById('splash-slide-3'),
    ];

    let currentSlide = 0;
    let slideTimer = null;
    let isFinished = false;

    function finishSplash() {
      if (isFinished) return;
      isFinished = true;
      if (slideTimer) clearTimeout(slideTimer);

      slides.forEach((s) => s && s.classList.remove('visible'));
      splashOverlay.classList.remove('active');
      splashOverlay.style.display = 'none';

      if (sectionsNav) {
        sectionsNav.classList.remove('hidden-for-overlay');
      }
      sessionStorage.setItem('nim_1999_02_splash_seen', 'true');
    }

    // Пропуск сплэша по клику в любом месте
    splashOverlay.addEventListener('click', finishSplash);

    function showSlide(index) {
      if (isFinished) return;
      slides.forEach((s, idx) => {
        if (s) s.classList.toggle('visible', idx === index);
      });

      slideTimer = setTimeout(() => {
        if (currentSlide < slides.length - 1) {
          currentSlide++;
          showSlide(currentSlide);
        } else {
          finishSplash();
        }
      }, 1920);
    }

    // Старт показа первого слайда
    showSlide(0);
  }

  // --- Привязка событий навигации ---
  sectionsNav.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const section = btn.getAttribute('data-section');
      if (section && section !== 'internet') {
        e.preventDefault();
        openSection(section);
      }
    });
  });

  // Кнопка INSTALL
  if (btnInstall) {
    btnInstall.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast();
    });
  }

  // Закрытие тоста по клику
  if (installToastOverlay) {
    installToastOverlay.addEventListener('click', closeToast);
  }

  // Закрытие титров по клику
  if (exitCreditsOverlay) {
    exitCreditsOverlay.addEventListener('click', closeCredits);
  }

  // Закрытие модального окна скриншота по клику
  if (imageModal) {
    imageModal.addEventListener('click', closeImageModal);
  }
  if (btnCloseImage) {
    btnCloseImage.addEventListener('click', (e) => {
      e.stopPropagation();
      closeImageModal();
    });
  }

  // Закрытие видеомодалки
  if (btnCloseVideo) {
    btnCloseVideo.addEventListener('click', (e) => {
      e.stopPropagation();
      closeVideoModal();
    });
  }
  if (videoModalOverlay) {
    videoModalOverlay.addEventListener('click', (e) => {
      if (e.target === videoModalOverlay) {
        closeVideoModal();
      }
    });
  }

  // Закрытие модальных окон по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Обработка возможного сбоя загрузки фонового изображения
  if (bgImage) {
    bgImage.onerror = () => {
      if (placeholder) placeholder.classList.remove('hidden');
    };
    bgImage.onload = () => {
      if (placeholder) placeholder.classList.add('hidden');
    };
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file && bgImage) {
        bgImage.src = URL.createObjectURL(file);
        if (placeholder) placeholder.classList.add('hidden');
      }
    });
  }

  // Предзагрузка всех данных оболочки в оперативную память и запуск
  preloadAllData().finally(() => {
    runSplashScreen();
  });
});
