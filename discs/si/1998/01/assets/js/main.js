(function() {
  // Preload button images (cache for session)
  ['assets/img/ui/button1.webp', 'assets/img/ui/button2.webp'].forEach(src => {
    const img = new Image();
    img.src = src;
  });

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

  // Games layout matches original screenshot order (text from json)
  const gamesHTML = `
    <div class="games-list">
      <a href="#">iM1 A2 Abrams</a>
      <a href="#">Planetary Raiders</a>
      <a href="#">Great Battles of Alexander (alpha)</a>
      <a href="#">WarBirds</a>
      <a href="#">Air Warrior II</a>
      <a href="#">Extreme Assault</a>
      <a href="#">Quake Deathmatch Maker</a>
      <a href="#">X-Wing vs. TIE Fighter</a>
      <a href="#">iF-22 Raptor Simulator</a>
      <a href="#">NHL 98</a>
      <a href="#">Fallen Haven</a>
      <a href="#">Myth: the Fallen Lords</a>
      <a href="#">FIFA 98</a>
      <span></span>
      <a href="#">NBA 98</a>
    </div>
    <div class="games-footer">Демоверсии к играм</div>`;

  const videoHTML = `
    <div class="games-list single">
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239116&hash=3573b02700cfa858&hd=3&autoplay=1">Guardians: agents of Justice</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239120&hash=3df7c8762d2e29d5&hd=3&autoplay=1">Mech Commander</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239119&hash=3cd15fc19410864c&hd=3&autoplay=1">Star Track</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239117&hash=cc750c7389e4196d&hd=3&autoplay=1">Worms 2</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239118&hash=66b55242f25044ed&hd=3&autoplay=1">Вьюга в пустыне</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239121&hash=4b63cda4d26ef8d3&hd=3&autoplay=1">HellFire</a>
    </div>
    <div class="games-footer">Видео ролики к играм</div>`;

  // Soft: combined as in original screenshot
  const softHTML = `
    <div class="games-list single">
      <a href="#">Microsoft Internet Explorer 4.0 English (PanEuro)</a>
      <a href="#">Microsoft Internet Explorer 4.0 (Russian)</a>
      <a href="#">Microsoft DirectX 5.0&nbsp;&nbsp;(Update to Microsoft DirectX 5.0a)</a>
    </div>
    <div class="games-footer">Программное обеспечение</div>`;

  function scaleFonts() {
    const h = screen.clientHeight || 1250;
    const s = h / 1250;
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

  function bindListClicks() {
    textArea.querySelectorAll('.games-list a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const src = a.getAttribute('data-video');
        if (src) {
          openVideo(src);
        } else {
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
    bindListClicks();
    scaleFonts();
  }

  function showVideoList() {
    textArea.className = 'text-area list-mode';
    textArea.style.display = 'block';
    textArea.innerHTML = videoHTML;
    bindListClicks();
    scaleFonts();
  }

  function showSoftList() {
    textArea.className = 'text-area list-mode';
    textArea.style.display = 'block';
    textArea.innerHTML = softHTML;
    bindListClicks();
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
    // mouseleave intentionally does nothing — button and content stay
  });

  window.addEventListener('resize', scaleFonts);
  // initial state: default hint, no button
  showDefaultText();
  scaleFonts();
})();
