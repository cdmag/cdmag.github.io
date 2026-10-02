const leftData = {
      demos: { num: '17', text: 'полностью<br>играбель-<br>ных демо-<br>версий от<br>российских<br>и ведущих<br>зарубеж-<br>ных раз-<br>работчиков' },
      soft: { num: '12', pre: 'Полезные<br>программы', text: 'лучших из<br>лучших:<br>архиваторы<br>графичес-<br>кие пакеты,<br>броузеры и<br>другие' },
      themes: { num: '65', pre: 'Темы для<br>Windows95<br>чтобы<br>украсить<br>десктоп.<br>Более', text: 'тем на<br>любой<br>вкус –<br>любимые<br>фильмы,<br>игры и т.д.' },
      bonus: { num: '', text: 'Лучшая<br>игра всех<br>времен и<br>народов.<br>Какая?<br>Смотрите<br>сами.<br>Надеемся,<br>что она<br>вам<br>понравится' },
      video: { num: '9', pre: 'Ролики из<br>игр,<br>которые<br>мы все<br>ждем.<br>Это будут<br>настоящие<br>шедевры.', text: 'новинок' }
    };

    const games = {
      astrorock: {
        img: 'astrorock2000.webp',
        desc: '<b>Разработчик:</b> Logicware Inc.<br><b>Издатель:</b> Logicware Inc.<br><b>Требования:</b> 486/66, 8 MB RAM<br>Продолжая традиции ставшей уже классикой Asteroids, AstroRock 2000 повествует о сражении великого героя Zed Nepher с армией пришельцев. "Чужие" из сектора Bee-Gee захотели уничтожить то, что было свято для Зеда, а именно – рок музыку! Вполне стандартная космическая стрелялка, и, конечно же, под звуки рок-н-ролла!'
      },
      balls: {
        img: 'ballsofsteel.webp',
        desc: '<b>Разработчик:</b> Wildfire Studios<br><b>Издатель:</b> Pinball Wizards / GT Interactive<br><b>Требования:</b> Pentium-90, 16 MB RAM, DirectX 5.0<br>Очередной вариант пинбола, правда, очень качественный. Полное соблюдение всех законов гравитации и физики + неплохая графика позволяют отдохнуть голове от стратегий, а пальцам от еще одной 3D-стрелялки.'
      },
      battlezone: {
        img: 'battlezone0085.webp',
        desc: '<b>Разработчик:</b> Activision<br><b>Издатель:</b> Activision<br><b>Требования:</b> Pentium-90, 16 MB RAM, SVGA, DirectX 5.0<br>Одна из лучших попыток совмещения стратегии в реальном времени с 3D-стрелялкой. Сюжет, достойный "Секретных материалов" и потрясающая графика делают процесс прохождения игры действительно захватывающим.'
      },
      cart: {
        img: 'cartprecisionracing.webp',
        desc: '<b>Разработчик:</b> Terminal Reality<br><b>Издатель:</b> Microsoft<br><b>Требования:</b> Pentium-60, 16 MB RAM, SVGA, DirectX 5.0<br>Максимально реалистичный автосимулятор гонок класса CART, поддерживающий разнообразные игровые манипуляторы с обратной связью и другие устройства. В этой последней демо-версии открыты еще несколько трасс, а также улучшено быстродействие.'
      },
      gex: {
        img: 'gex0123.webp',
        desc: '<b>Разработчик:</b> Crystal Dynamics<br><b>Издатель:</b> Crystal Dynamics<br><b>Требования:</b> Pentium-166, 32 MB RAM, 3D-ускоритель (3Dfx)<br>Приятная 3D-аркада, повествующая о продолжении приключений Gex’а. На этот раз главный враг по имени Rez захватил телевизионную станцию и нашему герою ничего не оставалось делать, как отправиться в мир Телевидения и сразиться с разнообразными монстрами в красочном 3D-окружении.'
      },
      kknd1: {
        img: 'kknd1.webp',
        desc: '<b>Разработчик:</b> Beam Software<br><b>Издатель:</b> Melbourne House<br><b>Требования:</b> Pentium-133, 16 MB RAM, SVGA, DirectX 5.0<br>Долгожданное продолжение одной из лучших стратегий в реальном времени. Выжившие и Мутанты продолжают сражаться, но в битву вступает третья, никому не известная прежде сила, армия андроидов.<br><span class="special">Миссия за людей</span>.'
      },
      kknd2: {
        img: 'kknd2.webp',
        desc: '<b>Разработчик:</b> Beam Software<br><b>Издатель:</b> Melbourne House<br><b>Требования:</b> Pentium-133, 16 MB RAM, SVGA, DirectX 5.0<br>Долгожданное продолжение одной из лучших стратегий в реальном времени. Выжившие и Мутанты продолжают сражаться, но в битву вступает третья, никому не известная прежде сила, армия андроидов.<br><span class="special">Миссия за мутантов</span>.'
      },
      shanghai: {
        img: 'shanghai_dynasty.webp',
        desc: '<b>Разработчик:</b> Activision<br><b>Издатель:</b> Activision<br><b>Требования:</b> Pentium-90, 16 MB RAM, SVGA<br>Шестая по счету версия мах-джонга (mah-jongg), достаточно популярной логической игры. Потрясающе красивая игра.'
      },
      quake2: {
        img: 'quake2-0055.webp',
        desc: '<b>Разработчик:</b> id software<br><b>Издатель:</b> Activision<br><b>Требования:</b> Pentium-133, 16 MB RAM, SVGA (2 MB), DirectX 5.0<br>Официальная демо-версия Quake II, содержащая ряд играбельных уровней. Дальнейшие комментарии излишни.'
      },
      petka: {
        img: 'buka.webp',
        desc: '<b>Разработчик:</b> SBG Publishing<br><b>Издатель:</b> Бука<br><b>Требования:</b> Windows 95, Pentium-133, 16 MB RAM<br>Юмористический квест о самых знаменитых героях гражданской войны.<br><span class="special">Неиграбельная демоверсия</span>.'
      },
      apache: {
        img: 'team_apache.webp',
        desc: '<b>Разработчик:</b> Simis<br><b>Издатель:</b> Mindscape<br><b>Требования:</b> Pentium-133, 16 MB RAM, SVGA (2 MB), DirectX 5.0<br>Симулятор вертолета, который, благодаря обширным настройкам и хорошей графике будет интересен не только любителям серьезных имитаторов, но и приверженцам стрелялок. Реализм наносимых повреждений и эффектов сочетается с детально проработанной моделью полета, одновременно не перегружая игрока и не давая ему забыть, что это всего лишь игра.'
      },
      terra: {
        img: 'terravictus.webp',
        desc: '<b>Разработчик:</b> WaveQuest<br><b>Издатель:</b> Ripcord Games<br><b>Требования:</b> Pentium-133, 16 MB RAM, DirectX 5.0<br>Достойное совмещение стрелялки и стратегии в реальном времени. Борьба Сопротивления против тирании. Вам отводится роль отважного героя, которому предстоит возглавить небольшой отряд повстанцев и начать тяжелую борьбу за свободу своей родины.'
      },
      warbreeds: {
        img: 'warbreeds.webp',
        desc: '<b>Разработчик:</b> Red Orb Entertainment<br><b>Издатель:</b> Broderbund<br><b>Требования:</b> Pentium-90, 16 MB RAM, SVGA, DirectX 5.0<br>Стратегия в реальном времени, повествующая о борьбе четырех кланов за владение какой-то особо ценной планетой. Демо-версия включает тренировочную кампанию и несколько карт для многопользовательской игры.'
      },
      warlords: {
        img: 'warlords3.webp',
        desc: '<b>Разработчик:</b> Red Orb Entertainment<br><b>Издатель:</b> Red Orb Entertainment<br><b>Требования:</b> Pentium-90, 16 MB RAM, SVGA<br>Продолжение знаменитых Warlords, на этот раз игроману предстоит стать героем не одной легенды этого мрачного мира, на его пути к тому, чтобы достичь ранга Рыцарей Сириана.'
      },
      super: {
        img: 'supertouringcar.webp',
        desc: '<b>Разработчик:</b> Elite Systems Ltd.<br><b>Требования:</b> Pentium-200, 32 MB RAM, 3D-акселератор, DirectX 5.0<br>Качественный автосимулятор от создателей Test Drive: Offroad, совмещающий реалистичность управления с аркадностью стиля. Приемлемая графика, но несколько завышенные системные требования.'
      },
      robo: {
        img: 'rrdemo.webp',
        desc: '<b>Разработчик:</b> Metropolis Software House<br><b>Издатель:</b> TopWare / Snowball Productions<br><b>Требования:</b> Pentium-133, 16 MB RAM, SVGA, рекомендуется 3D акселератор<br>Очень неплохая тактическая стрелялка с элементами стратегии. С помощью небольшого отряда роботов необходимо в очередной раз спасти мир от катастрофы путем изничтожения всех встречных тварей. Игру отличает потрясающая графика и спецэффекты.'
      },
      heavy: {
        img: 'heavygear130.webp',
        desc: '<b>Разработчик:</b> Activision<br><b>Издатель:</b> Activision<br><b>Требования:</b> Pentium-133, 16 MB RAM, 3D-ускоритель (3Dfx или Rendition)<br>Представитель популярного и любимого жанра сражений на роботах, особо не нуждающийся в представлении. Продолжая традиции классического MechWarrior\'a, Heavy Gear переносит нас на планету Терра Нова, за которую нам и предстоит сражаться.'
      }
    };

    const panel = document.getElementById('leftPanel');
    const items = document.querySelectorAll('#menuList .menu-item');
    function showLeft(id) {
      const d = leftData[id];
      if (!d) { panel.innerHTML = ''; return; }
      let html = '';
      if (d.pre) html += `<div class="left-text">${d.pre}</div>`;
      if (d.num) html += `<span class="big-num">${d.num}</span>`;
      if (d.text) html += `<div class="left-text${d.num ? '' : ' no-num'}">${d.text}</div>`;
      panel.innerHTML = html;
    }
    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        showLeft(item.dataset.id);
      });
      item.addEventListener('mouseleave', () => {
        item.classList.remove('active');
        panel.innerHTML = '';
      });
      item.addEventListener('click', () => {
        if (item.dataset.id === 'demos' || item.dataset.screen === 'demos') {
          showScreen('screenDemos');
          selectGame('astrorock');
        } else if (item.dataset.id === 'soft') {
          showScreen('screenPrograms');
        } else if (item.dataset.id === 'themes') {
          showScreen('screenThemes');
        } else if (item.dataset.id === 'bonus') {
          showScreen('screenBonus');
        } else if (item.dataset.id === 'video') {
          showScreen('screenVideo');
        }
      });
    });

    const gameEls = document.querySelectorAll('#gamesList .game');
    const shot = document.getElementById('gameShot');
    const descEl = document.getElementById('gameDesc');
    function selectGame(id) {
      gameEls.forEach(g => g.classList.remove('active'));
      const el = document.querySelector(`#gamesList .game[data-game="${id}"]`);
      if (el) el.classList.add('active');
      const g = games[id];
      if (g) {
        shot.src = 'assets/img/content/' + g.img;
        descEl.innerHTML = g.desc;
      }
    }
    gameEls.forEach(g => {
      g.addEventListener('mouseenter', () => selectGame(g.dataset.game));
      g.addEventListener('click', () => selectGame(g.dataset.game));
    });

    // Navigation helpers

    const SCREEN_SEC = {
      screenDemos: 'demos',
      screenPrograms: 'soft',
      screenThemes: 'themes',
      screenBonus: 'bonus',
      screenVideo: 'video'
    };
    const clickSound = new Audio('assets/sound/click.wav');
    function playClick() {
      try { clickSound.currentTime = 0; clickSound.play(); } catch(e) {}
    }

    function showScreen(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
      // sync left sec-menu active state on all menus
      const sec = SCREEN_SEC[id];
      document.querySelectorAll('.sec-menu').forEach(menu => {
        menu.querySelectorAll('div').forEach(d => {
          d.classList.toggle('active', sec && d.dataset.sec === sec);
        });
      });
      if (id === 'screenDemos') selectGame('astrorock');
    }

    // Arrow buttons
    document.getElementById('btnNextMain')?.addEventListener('click', () => { playClick(); showScreen('screenDemos'); });
    document.getElementById('btnPrev')?.addEventListener('click', () => { playClick(); showScreen('screenMain'); });
    document.getElementById('btnNext')?.addEventListener('click', () => { playClick(); showScreen('screenPrograms'); });
    document.getElementById('btnPrevProg')?.addEventListener('click', () => { playClick(); showScreen('screenDemos'); });
    document.getElementById('btnNextProg')?.addEventListener('click', () => { playClick(); showScreen('screenThemes'); });
    document.getElementById('btnPrevThemes')?.addEventListener('click', () => { playClick(); showScreen('screenPrograms'); });
    document.getElementById('btnNextThemes')?.addEventListener('click', () => { playClick(); showScreen('screenBonus'); });
    document.getElementById('btnPrevBonus')?.addEventListener('click', () => { playClick(); showScreen('screenThemes'); });
    document.getElementById('btnNextBonus')?.addEventListener('click', () => { playClick(); showScreen('screenVideo'); });
    document.getElementById('btnPrevVideo')?.addEventListener('click', () => { playClick(); showScreen('screenBonus'); });

    // Left sec-menus
    function setupSecMenu(menuId) {
      document.querySelectorAll('#' + menuId + ' div').forEach(el => {
        el.addEventListener('click', () => {
          playClick();
          const sec = el.dataset.sec;
          if (sec === 'demos') showScreen('screenDemos');
          else if (sec === 'soft') showScreen('screenPrograms');
          else if (sec === 'themes') showScreen('screenThemes');
          else if (sec === 'bonus') showScreen('screenBonus');
          else if (sec === 'video') showScreen('screenVideo');
        });
      });
    }
    setupSecMenu('secMenu');
    setupSecMenu('secMenuProg');
    setupSecMenu('secMenuThemes');
    setupSecMenu('secMenuBonus');
    setupSecMenu('secMenuVideo');

    // Logo
    document.getElementById('logoHit')?.addEventListener('click', () => { playClick(); showScreen('screenMain'); });

    // Toast for sections 2-5 interactive items
    const toastOverlay = document.getElementById('toastOverlay');
    let toastTimer = null;
    function showToast() {
      playClick();
      toastOverlay.classList.add('visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastOverlay.classList.remove('visible'), 1000);
    }
    toastOverlay.addEventListener('click', () => {
      toastOverlay.classList.remove('visible');
      clearTimeout(toastTimer);
    });

    // Games list click -> toast
    document.querySelectorAll('#gamesList .game').forEach(el => {
      el.addEventListener('click', showToast);
    });
    // Programs items
    document.querySelectorAll('#progList .prog-item').forEach(el => {
      el.addEventListener('click', showToast);
    });
    // Themes icons
    document.querySelectorAll('.themes-icon').forEach(el => {
      el.addEventListener('click', showToast);
    });
    // Bonus install links / image
    document.querySelectorAll('.bonus-img-wrap, .bonus-link').forEach(el => {
      el.addEventListener('click', showToast);
    });

    // Video modal
    const videoOverlay = document.getElementById('videoOverlay');
    const videoModal = document.getElementById('videoModal');
    function openVideo(src) {
      playClick();
      videoModal.innerHTML = '<iframe src="' + src + '" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen referrerpolicy="no-referrer"></iframe>';
      videoOverlay.classList.add('visible');
    }
    function closeVideo() {
      videoOverlay.classList.remove('visible');
      videoModal.innerHTML = '';
    }
    videoOverlay.addEventListener('click', e => {
      if (e.target === videoOverlay) closeVideo();
    });
    document.querySelectorAll('#videoList .video-item').forEach(el => {
      el.addEventListener('click', () => {
        const src = el.dataset.src;
        if (src) openVideo(src);
      });
    });

    // Click sound on main menu items (already navigates)
    document.querySelectorAll('#menuList .menu-item').forEach(item => {
      item.addEventListener('click', () => playClick());
    });

    

    // Themes scrollbar
    (function() {
      const scroll = document.getElementById('themesScroll');
      const thumb = document.getElementById('themesThumb');
      const track = document.getElementById('themesTrack');
      if (!scroll || !thumb || !track) return;
      function updateThumb() {
        const ratio = scroll.clientHeight / scroll.scrollHeight;
        const th = Math.max(30, track.clientHeight * ratio);
        thumb.style.height = th + 'px';
        const maxTop = track.clientHeight - th;
        const top = (scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight || 1)) * maxTop;
        thumb.style.top = top + 'px';
      }
      scroll.addEventListener('scroll', updateThumb);
      window.addEventListener('resize', updateThumb);
      setTimeout(updateThumb, 100);
      document.getElementById('themesUp').addEventListener('click', () => { scroll.scrollBy({top: -40, behavior: 'smooth'}); });
      document.getElementById('themesDown').addEventListener('click', () => { scroll.scrollBy({top: 40, behavior: 'smooth'}); });
      // drag thumb
      let dragging = false, startY, startTop;
      thumb.addEventListener('mousedown', e => {
        dragging = true; startY = e.clientY; startTop = thumb.offsetTop;
        e.preventDefault();
      });
      window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const dy = e.clientY - startY;
        const th = thumb.offsetHeight;
        const maxTop = track.clientHeight - th;
        let top = Math.max(0, Math.min(maxTop, startTop + dy));
        thumb.style.top = top + 'px';
        scroll.scrollTop = (top / maxTop) * (scroll.scrollHeight - scroll.clientHeight);
      });
      window.addEventListener('mouseup', () => dragging = false);
    })();

    

    // Superbonus scrollbar (reuse logic)
    (function() {
      const scroll = document.getElementById('bonusScroll');
      const thumb = document.getElementById('bonusThumb');
      const track = document.getElementById('bonusTrack');
      if (!scroll || !thumb || !track) return;
      function updateThumb() {
        const ratio = scroll.clientHeight / scroll.scrollHeight;
        const th = Math.max(30, track.clientHeight * ratio);
        thumb.style.height = th + 'px';
        const maxTop = track.clientHeight - th;
        const top = (scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight || 1)) * maxTop;
        thumb.style.top = (isFinite(top) ? top : 0) + 'px';
      }
      scroll.addEventListener('scroll', updateThumb);
      window.addEventListener('resize', updateThumb);
      setTimeout(updateThumb, 150);
      document.getElementById('bonusUp').addEventListener('click', () => scroll.scrollBy({top: -50, behavior: 'smooth'}));
      document.getElementById('bonusDown').addEventListener('click', () => scroll.scrollBy({top: 50, behavior: 'smooth'}));
      let dragging = false, startY, startTop;
      thumb.addEventListener('mousedown', e => { dragging = true; startY = e.clientY; startTop = thumb.offsetTop; e.preventDefault(); });
      window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const dy = e.clientY - startY;
        const th = thumb.offsetHeight;
        const maxTop = track.clientHeight - th;
        let top = Math.max(0, Math.min(maxTop, startTop + dy));
        thumb.style.top = top + 'px';
        scroll.scrollTop = (top / (maxTop || 1)) * (scroll.scrollHeight - scroll.clientHeight);
      });
      window.addEventListener('mouseup', () => dragging = false);
    })();
