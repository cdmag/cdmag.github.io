(function() {
  const textArea = document.getElementById('text-area');
  const screen = document.getElementById('screen');
  const popup = document.getElementById('popup');
  const btns = {
    igry: document.getElementById('btn-igry'),
    soft: document.getElementById('btn-soft'),
    exit: document.getElementById('btn-exit')
  };
  let popupTimer = null;

  const defaultText = 'Для выбора подведите мышку к одному\nиз желтых шариков, для выхода\nнажмите на шарик-выход...';

  const gamesHTML = `
    <div class="games-list">
      <a href="#">Lords of Magic</a>
      <a href="#">Uprising</a>
      <a href="#">Journeyman Project 3</a>
      <a href="#">Розовая Пантера: Право на риск</a>
      <hr class="sep">
      <a href="#">Патчи под 3DFx</a>
      <a href="#">Патчи к различным играм</a>
      <a href="#">Прохождение Myth'a (нужна сама игра)</a>
    </div>
    <div class="games-footer">Демоверсии к играм</div>`;

  const softHTML = `
    <div class="games-list">
      <a href="#">Microsoft Internet Explorer 4.0 English (PanEuro)</a>
      <a href="#">Microsoft Internet Explorer 4.0 (Russian)</a>
      <a href="#">Бесплатно 3 часа Интернета через Гласнет</a>
      <a href="#">Программа для подключения к Гласнету</a>
    </div>
    <div class="games-footer">Программное обеспечение</div>`;

  function scaleFonts() {
    const s = screen.offsetHeight / 1250;
    if (textArea.classList.contains('list-mode')) {
      textArea.style.fontSize = (35 * s) + 'px';
    } else {
      textArea.style.fontSize = (32 * s) + 'px';
    }
    const msg = popup.querySelector('.popup-msg');
    if (msg) msg.style.fontSize = (35 * s) + 'px';
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

  function bindListClicks() {
    textArea.querySelectorAll('.games-list a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showPopup();
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
      else if (name === 'soft') showSoftList();
    });
  });

  window.addEventListener('resize', scaleFonts);
  showDefaultText();
  scaleFonts();
})();
