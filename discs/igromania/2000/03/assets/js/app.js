/* ---------------- КОНФИГУРАЦИЯ РАЗДЕЛОВ И ССЫЛОК НА JSON ---------------- */
const SECTION_CONFIG = {
  demki: {
    subcategories: [
      { name: "ДЕМКИ", json: "assets/data/demos_demos.json" },
      { name: "ПАТЧИ", json: "assets/data/demos_patches.json" }
    ]
  },
  soft: {
    subcategories: [
      { name: "СОФТ", json: "assets/data/soft_soft.json" },
      { name: "УТИЛИТЫ", json: "assets/data/soft_utilities.json" },
      { name: "ТРЕЙНЕРЫ", json: "assets/data/soft_trainers.json" }
    ]
  },
  zone: {
    subcategories: [
      { name: "БУНКЕР", json: "assets/data/zones_bunker.json" },
      { name: "DEATHMATCH", json: "assets/data/zones_deathmatch.json" },
      { name: "РОССИЯ", json: "assets/data/zones_russia.json" }
    ]
  },
  dlh: {
    subcategories: [
      { name: "DLH", json: "assets/data/dlh.json" }
    ]
  }
};

/* ---------------- МУЗЫКАЛЬНЫЙ РАЗДЕЛ ---------------- */
const MUSIC_TRACKS = [
  "Rain Symphony",
  "Lunar 2",
  "Castlevania",
  "Chrono Trigger",
  "Knight of the Round"
];
let currentTrackIdx = 0;

const loadedData = {}; // Кэш подгруженных данных
let activeDownloadUrl = null;

const pageLeft = document.getElementById('pageLeft');
const pageRight = document.getElementById('pageRight');
const btnInstall = document.getElementById('btnInstall');

/* ---------------- ЗАГРУЗКА ЭЛЕМЕНТОВ ИЗ JSON ---------------- */
async function fetchSubcategoryItems(subConfig) {
  const jsonPath = subConfig.json;
  if (loadedData[jsonPath]) return loadedData[jsonPath];

  try {
    const response = await fetch(jsonPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    const items = Array.isArray(data) ? data : (data.items || []);
    loadedData[jsonPath] = items;
    return items;
  } catch (err) {
    console.warn(`Не удалось загрузить ${jsonPath}:`, err);
    return [];
  }
}

function renderFrontRight() {
  pageRight.innerHTML = `
    <div class="front-right-container">
      <h1 class="front-title">ИГРОМАНИЯ</h1>
      <div class="front-subtitle">CD-Book №3</div>
      <img src="assets/img/ui/book-front-right.webp" class="front-nox-img" alt="Nox Character">
      <div class="front-copyright">(c)2000</div>
    </div>
  `;
}

function goHome() {
  activeDownloadUrl = null;
  updateInstallButton();
  document.querySelectorAll('.tab-side-img').forEach(t => t.classList.remove('active'));

  pageLeft.innerHTML = `
    <div class="home-left-container">
      <img src="assets/img/ui/divider.webp" class="divider-img" alt="--">
      
      <div class="home-left-text">
        <p>
          Дамы и господа!<br>
          В этом достопочтенном издании собраны диковинные программы и потешные утилиты с ближнего и дальнего Свету
        </p>
        <p>
          Буде у вас возникнут мысли дельные, по улучшению книги этой, милостиво просим весточку нам оставить, али как по другому известить.
        </p>
      </div>

      <img src="assets/img/ui/divider.webp" class="divider-img" alt="--">
    </div>
  `;

  renderFrontRight();
}

function renderMusicSection() {
  // Общий блок заголовка фиксированной высоты, чтобы разделители были на одной линии
  const headerStyle = 'display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:170px; margin-top:10px;';
  const titleStyle = 'font-size:3.4rem; line-height:1.15; margin:0; text-align:center;';
  const trackStyle = 'font-size:2.8rem; line-height:1.2; margin:8px 0 0 0; color:#1a0f07; font-style:italic; text-align:center;';

  pageLeft.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%;">
      <div style="${headerStyle}">
        <div class="page-title" style="${titleStyle}">
          Старая<br>MP3-шарманка
        </div>
      </div>
      <img src="assets/img/ui/divider.webp" class="divider-img" alt="--" style="margin: 15px 0 25px 0;">
      <ul class="menu-list">
        <li class="menu-item" onclick="void(0)">Тише</li>
        <li class="menu-item" onclick="prevTrack()">Назад</li>
        <li class="menu-item" onclick="void(0)">Не играть</li>
      </ul>
    </div>
  `;

  pageRight.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%;">
      <div style="${headerStyle}">
        <div class="page-title" style="${titleStyle}">
          Сейчас играет:
        </div>
        <div id="musicTrackTitle" class="page-title" style="${trackStyle}">
          ${MUSIC_TRACKS[currentTrackIdx]}
        </div>
      </div>
      <img src="assets/img/ui/divider.webp" class="divider-img" alt="--" style="margin: 15px 0 25px 0;">
      <ul class="menu-list">
        <li class="menu-item" onclick="void(0)">Громче</li>
        <li class="menu-item" onclick="nextTrack()">Вперед</li>
        <li class="menu-item" onclick="void(0)">Играть</li>
      </ul>
    </div>
  `;
}

function prevTrack() {
  currentTrackIdx = (currentTrackIdx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
  updateTrackDisplay();
}

function nextTrack() {
  currentTrackIdx = (currentTrackIdx + 1) % MUSIC_TRACKS.length;
  updateTrackDisplay();
}

function updateTrackDisplay() {
  const trackEl = document.getElementById('musicTrackTitle');
  if (trackEl) {
    trackEl.textContent = MUSIC_TRACKS[currentTrackIdx];
  }
}

async function openSection(secKey) {
  activeDownloadUrl = null;
  updateInstallButton();

  document.querySelectorAll('.tab-side-img').forEach(t => {
    t.classList.toggle('active', t.classList.contains(`tab-${secKey}`));
  });

  if (secKey === 'music') {
    renderMusicSection();
    return;
  }

  renderFrontRight();

  const sec = SECTION_CONFIG[secKey];
  if (!sec || !sec.subcategories) {
    pageLeft.innerHTML = `<h2 class="page-title">Раздел</h2><img src="assets/img/ui/divider.webp" class="divider-img"><p class="page-text" style="font-family:Inter; text-align:center;">Раздел в разработке...</p>`;
    return;
  }

  let leftHtml = `<ul class="menu-list">`;
  sec.subcategories.forEach((sub, idx) => {
    leftHtml += `<li class="menu-item" onclick="selectSubcategory('${secKey}', ${idx})">${sub.name}</li>`;
    if (idx < sec.subcategories.length - 1) {
      leftHtml += `<img src="assets/img/ui/divider.webp" class="divider-img" alt="--">`;
    }
  });
  leftHtml += `</ul>`;
  pageLeft.innerHTML = leftHtml;
}

async function selectSubcategory(secKey, subIdx) {
  activeDownloadUrl = null;
  updateInstallButton();

  const sec = SECTION_CONFIG[secKey];
  if (!sec) return;
  const sub = sec.subcategories[subIdx];

  const itemsElements = pageLeft.querySelectorAll('.menu-item');
  itemsElements.forEach((item, idx) => item.classList.toggle('active', idx === subIdx));

  pageRight.innerHTML = `<p style="font-family: Inter; font-size: 1.6rem; text-align: center; margin-top: 50px;">Загрузка...</p>`;

  const items = await fetchSubcategoryItems(sub);

  if (!items || items.length === 0) {
    pageRight.innerHTML = `<p style="font-family: Inter; font-size: 1.6rem; text-align: center; margin-top: 50px;">В этом подразделе пока нет файлов.</p>`;
    return;
  }

  let rightHtml = `<ul class="file-list">`;
  items.forEach((item, itemIdx) => {
    rightHtml += `<li class="file-item" onclick="openItemDetails('${secKey}', ${subIdx}, ${itemIdx})">${item.title}</li>`;
  });
  rightHtml += `</ul>`;
  pageRight.innerHTML = rightHtml;
}

// Вспомогательная функция для обработки путей к картинкам
function resolveImageUrl(imagePath) {
  if (!imagePath) return '';

  // Если это внешняя ссылка (http/https) или уже указан полный путь (assets/, /, ../)
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('/') ||
    imagePath.startsWith('assets/') ||
    imagePath.startsWith('../')
  ) {
    return imagePath;
  }

  // Если просто имя файла (например, "evil_islands.png")
  return `assets/img/content/${imagePath}`;
}

async function openItemDetails(secKey, subIdx, itemIdx) {
  const sec = SECTION_CONFIG[secKey];
  const sub = sec.subcategories[subIdx];
  const items = await fetchSubcategoryItems(sub);
  const item = items[itemIdx];

  if (!item) return;

  activeDownloadUrl = item.download || item.downloadUrl || null;
  updateInstallButton();

  let metaHtml = '';
  if (item.developer) metaHtml += `<div class="item-meta-row">Разработчик: ${item.developer}</div>`;
  if (item.publisher) metaHtml += `<div class="item-meta-row">Издатель: ${item.publisher}</div>`;
  if (item.genre) metaHtml += `<div class="item-meta-row">Жанр: ${item.genre}</div>`;
  if (item.version) metaHtml += `<div class="item-meta-row">Версия: ${item.version}</div>`;
  if (item.requirements || item.sys_req) metaHtml += `<div class="item-meta-row">Требования: ${item.requirements || item.sys_req}</div>`;
  if (item.size) metaHtml += `<div class="item-meta-row">Размер: ${item.size}</div>`;

  pageRight.innerHTML = `
    <div class="item-card">
      <div class="item-title">${item.title}</div>
      
      ${metaHtml ? `<div class="item-meta-block">${metaHtml}</div>` : ''}
      
      ${item.image ? `
        <div class="item-image-block">
          <img src="${resolveImageUrl(item.image)}" class="item-image" alt="${item.title}">
        </div>
      ` : ''}

      ${item.video ? `
        <div class="item-video-block">
          <iframe src="${item.video}" class="item-video" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms" frameborder="0" allowfullscreen></iframe>
        </div>
      ` : ''}

      ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
    </div>
  `;
}

function updateInstallButton() {
  if (activeDownloadUrl && activeDownloadUrl !== "#" && activeDownloadUrl !== "") {
    btnInstall.src = 'assets/img/ui/menu-bot-install-on.webp';
    btnInstall.classList.remove('disabled');
    btnInstall.classList.add('active-install');
  } else {
    btnInstall.src = 'assets/img/ui/menu-bot-install-off.webp';
    btnInstall.classList.add('disabled');
    btnInstall.classList.remove('active-install');
  }
}

function triggerInstall() {
  if (activeDownloadUrl && activeDownloadUrl !== "#" && activeDownloadUrl !== "") {
    window.open(activeDownloadUrl, '_blank');
  }
}

function resizeApp() {
  const app = document.getElementById('appWindow');
  const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 1200);
  app.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', resizeApp);
resizeApp();

// Инициализация при старте
goHome();