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
      <a href="#">BattleZone</a>
      <a href="#">Empiriana&nbsp;&nbsp;(Empiriania Upgrage)</a>
      <a href="#">Metal Knights 98</a>
      <a href="#">TalkWorld</a>
      <a href="#">Quake 2 Add-ons</a>
      <a href="#">Interactive-fiction</a>
    </div>
    <div class="games-footer">Демоверсии к играм</div>`;

  const videoHTML = `
    <div class="games-list single">
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239146&hash=e5e86588216857e0&hd=3&autoplay=1">Allods</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239147&hash=b9f956fe97065570&hd=3&autoplay=1">Black Legion</a>
    </div>
    <div class="games-footer">Видео ролики к играм</div>`;

  const softHTML = `
    <div class="games-list single">
      <a href="#">Microsoft Internet Explorer 4.0 English (PanEuro)</a>
      <a href="#">Microsoft Internet Explorer 4.0 (Russian)</a>
    </div>
    <div class="games-footer">Программное обеспечение</div>`;

  function scaleFonts() {
    const h = screen.clientHeight || 1250;
    const s = h / 1250;
    if (textArea.classList.contains('list-mode')) {
      textArea.style.fontSize = (39 * s) + 'px';
    } else {
      textArea.style.fontSize = (41 * s) + 'px';
    }
    const msg = popup.querySelector('.popup-msg');
    if (msg) msg.style.fontSize = (39 * s) + 'px';
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
