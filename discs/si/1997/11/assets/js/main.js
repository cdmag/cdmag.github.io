(function() {
  const btns = {
    igry:  document.getElementById('btn-igry'),
    video: document.getElementById('btn-video'),
    exit:  document.getElementById('btn-exit')
  };
  const textArea = document.getElementById('text-area');
  const defaultText = `Для выбора подведите мышку к одному
из желтых шариков, для выхода
нажмите на шарик-выход...`;
  let active = null;
  let clickTimer = null;

  const srcNormal = {
    igry:  'assets/img/ui/button1.webp',
    video: 'assets/img/ui/button1.webp',
    exit:  'assets/img/ui/button2.webp'
  };
  const srcClick = {
    igry:  'assets/img/ui/button1-click.webp',
    video: 'assets/img/ui/button1-click.webp',
    exit:  'assets/img/ui/button2-click.webp'
  };

  const gamesHTML = `
    <div class="games-list">
      <a href="#">DirectX 5.0</a>
      <a href="#">Jedi Knight</a>
      <a href="#">Incubation</a>
      <a href="#">Beasts and Bumpkins</a>
      <a href="#">Need for Speed 2 3Dfx</a>
      <a href="#">Imperializm</a>
      <a href="#">Need for Speed 2</a>
      <span></span>
      <a href="#">Test Drive 4</a>
      <span></span>
      <a href="#">Seven Kindoms</a>
      <span></span>
      <a href="#">Netstorm  (Звук к Netstorm)</a>
      <span></span>
      <a href="#">Wing Commander Prophecy 3Dfx</a>
      <span></span>
    </div>
    <div class="games-footer">Демоверсии к играм</div>`;

  const videoHTML = `
    <div class="games-list">
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239069&hash=0e8e260c6398c42f&hd=3&autoplay=1">Auto Destruct</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239065&hash=18c3a7f0922c094b&hd=3&autoplay=1">NBA Live</a>
      <span><a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239076&hash=7f1b7adbae41bd9b&hd=3&autoplay=1">FIFA 98</a> (<a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239047&hash=20ead4209eff160d&hd=3&autoplay=1">FIFA 98 Motion Capture</a>)</span>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239066&hash=666e76c7a4b9f0da&hd=3&autoplay=1">Test Drive 4</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239072&hash=80479ddb07dea955&hd=3&autoplay=1">Sid Meier's Gettysburg</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239070&hash=e2530ad091605c4f&hd=3&autoplay=1">Nuclear Strike</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239074&hash=aede12d124b298c8&hd=3&autoplay=1">Longbow II</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239064&hash=0d50a653cf926fd5&hd=3&autoplay=1">NHL 98</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239075&hash=8552039d7ad0c1a5&hd=3&autoplay=1">Lost World</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239077&hash=2d6e1861b399ab97&hd=3&autoplay=1">Netstorm</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239068&hash=33707aab953657a6&hd=3&autoplay=1">Wing Commander Prophecy</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239048&hash=aba9cb14e1ac2346&hd=3&autoplay=1">Armored Fist 2</a>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239063&hash=82efdcbaaeed98a4&hd=3&autoplay=1">Populovs the Third Coming</a>
      <span></span>
      <a href="#" data-video="https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239046&hash=f91ce78ce45f9b4b&hd=3&autoplay=1">Петька и Василий Иванович</a>
      <span></span>
    </div>
    <div class="games-footer">Видео ролики к играм</div>`;

  function showBtn(name) {
    Object.keys(btns).forEach(k => {
      btns[k].style.display = (k === name) ? 'block' : 'none';
      if (k === name) btns[k].src = srcNormal[k];
    });
    active = name;
  }

  const popup = document.getElementById('popup');
  const screen = document.getElementById('screen');
  let popupTimer = null;

  function scaleFonts() {
    const h = screen.clientHeight || 1250;
    const s = h / 1250;
    textArea.style.fontSize = (textArea.classList.contains('list-mode') ? 32 : 34) * s + 'px';
    const msg = popup.querySelector('.popup-msg');
    if (msg) msg.style.fontSize = (28 * s) + 'px';
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
    textArea.querySelectorAll('.games-list a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showPopup();
      });
    });
    scaleFonts();
  }

  const videoOverlay = document.getElementById('video-overlay');
  const videoFrame = document.getElementById('video-frame');

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

  function showVideoList() {
    textArea.className = 'text-area list-mode';
    textArea.style.display = 'block';
    textArea.innerHTML = videoHTML;
    textArea.querySelectorAll('.games-list a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const src = a.getAttribute('data-video');
        if (src) openVideo(src);
      });
    });
    scaleFonts();
  }

  document.querySelectorAll('.hot').forEach(hot => {
    const name = hot.dataset.btn;

    hot.addEventListener('mouseenter', () => {
      showBtn(name);
      if (name === 'exit') showDefaultText();
      else if (name === 'igry') showGamesList();
      else if (name === 'video') showVideoList();
    });

    hot.addEventListener('click', () => {
      if (clickTimer) clearTimeout(clickTimer);
      const btn = btns[name];
      btn.src = srcClick[name];
      clickTimer = setTimeout(() => {
        if (active === name) btn.src = srcNormal[name];
        clickTimer = null;
      }, 250);
    });
  });

  window.addEventListener('resize', scaleFonts);
  // initial
  showDefaultText();
  scaleFonts();
})();
