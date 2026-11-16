(function() {
  document.fonts.load('400 16px "IBM Plex Mono"', 'Aa');
  document.fonts.load('400 16px "PT Sans"', 'Aa');
  document.fonts.load('italic 400 16px "PT Sans"', 'Aa');

  const btns = {
    igry:  document.getElementById('btn-igry'),
    video: document.getElementById('btn-video'),
    soft:  document.getElementById('btn-soft'),
    exit:  document.getElementById('btn-exit')
  };
  const textArea = document.getElementById('text-area');
  const screen = document.getElementById('screen');
  const popup = document.getElementById('popup');
  const videoOverlay = document.getElementById('video-overlay');
  const videoFrame = document.getElementById('video-frame');
  let popupTimer = null;

  const defaultText = 'Для выбора подведите мышку к одному\nиз желтых шариков,  для выхода\nнажмите на шарик-выход...';

  const gamesHTML = `
    <div class="games-list">
      <a href="#">Armored Fist 2</a>
      <span class="header">Total Annihilation Units:</span>
      <a href="#">Clash</a>
      <a href="#" class="nested">Flakker</a>
      <a href="#">Final Liberation</a>
      <a href="#" class="nested">Toaster</a>
      <a href="#">KK&D: Xtreme</a>
      <a href="#" class="nested">Dominator</a>
      <span></span>
      <a href="#" class="nested">Cobra</a>
      <span></span>
      <a href="#" class="nested">Defender NS</a>
      <span></span>
      <a href="#" class="nested">Metal Maker NS</a>
    </div>
    <div class="games-footer">Демоверсии к играм</div>`;

  const videoHTML = `
    <div class="games-list single">
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239130&hash=cfab32bfe99841c5&hd=3&autoplay=1">Half-Life</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239128&hd=3&autoplay=1">StarCraft</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239131&hash=b43ae4e0e26fae68&hd=3&autoplay=1">Worms 2</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239129&hash=42f9d5da0ad4b5ec&hd=3&autoplay=1">Vseslav the Warlock</a>
    </div>
    <div class="games-footer">Видео ролики к играм</div>`;

  const softHTML = `
    <div class="games-list single">
      <a href="#">Microsoft Internet Explorer 4.0 English (PanEuro)</a>
      <a href="#">Microsoft Internet Explorer 4.0 (Russian)</a>
      <a href="#">Microsoft DirectX 5.0&nbsp;&nbsp;(Update to Microsoft DirectX 5.0a)</a>
    </div>
    <div class="games-footer">Программное обеспечение</div>`;

  function scaleFonts() {
    const h = screen.clientHeight || 1225;
    const s = h / 1225;
    if (textArea.classList.contains('list-mode')) {
      textArea.style.fontSize = (34 * s) + 'px';
    } else {
      textArea.style.fontSize = (41 * s) + 'px';
    }
    const msg = popup.querySelector('.popup-msg');
    if (msg) msg.style.fontSize = (34 * s) + 'px';
  }

  function showBtn(name) {
    Object.keys(btns).forEach(k => {
      btns[k].style.display = (k === name) ? 'block' : 'none';
    });
  }

  function hidePopup() {
    popup.classList.remove('show');
    if (popupTimer) { clearTimeout(popupTimer); popupTimer = null; }
  }

  function showPopup() {
    popup.classList.add('show');
    scaleFonts();
    if (popupTimer) clearTimeout(popupTimer);
    popupTimer = setTimeout(hidePopup, 1000);
  }

  popup.addEventListener('click', hidePopup);

  function closeVideo() {
    videoOverlay.classList.remove('show');
    videoFrame.innerHTML = '';
  }

  function openVideo(src) {
    videoFrame.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = '1280';
    iframe.height = '720';
    iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;';
    iframe.allowFullscreen = true;
    iframe.frameBorder = '0';
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    videoFrame.appendChild(iframe);
    videoOverlay.classList.add('show');
  }

  videoOverlay.addEventListener('click', (e) => {
    if (e.target === videoOverlay) closeVideo();
  });

  function bindListClicks(mode) {
    textArea.querySelectorAll('.games-list a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (mode === 'video') {
          const src = a.getAttribute('data-video');
          if (src) openVideo(src);
        } else if (mode === 'games' || mode === 'soft') {
          showPopup();
        }
      });
    });
  }

  function showDefaultText() {
    textArea.className = 'text-area';
    textArea.style.display = 'flex';
    textArea.textContent = defaultText;
    scaleFonts();
  }

  function showGamesList() {
    textArea.className = 'text-area list-mode';
    textArea.style.display = 'block';
    textArea.innerHTML = gamesHTML;
    bindListClicks('games');
    scaleFonts();
  }

  function showVideoList() {
    textArea.className = 'text-area list-mode';
    textArea.style.display = 'block';
    textArea.innerHTML = videoHTML;
    bindListClicks('video');
    scaleFonts();
  }

  function showSoftList() {
    textArea.className = 'text-area list-mode';
    textArea.style.display = 'block';
    textArea.innerHTML = softHTML;
    bindListClicks('soft');
    scaleFonts();
  }

  document.querySelectorAll('.hot').forEach(hot => {
    const name = hot.dataset.btn;
    hot.addEventListener('mouseenter', () => {
      showBtn(name);
      if (name === 'exit') showDefaultText();
      else if (name === 'igry') showGamesList();
      else if (name === 'video') showVideoList();
      else if (name === 'soft') showSoftList();
    });
  });

  window.addEventListener('resize', scaleFonts);
  showDefaultText();
  scaleFonts();
})();
