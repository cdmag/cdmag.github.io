(function () {
  const caption = document.getElementById('caption');
  const credits = document.getElementById('credits');
  const videoModal = document.getElementById('video-modal');
  const videoFrame = document.getElementById('video-frame');
  const shotModal = document.getElementById('shot-modal');
  const shotModalImg = document.getElementById('shot-modal-img');
  const viewMain = document.getElementById('view-main');
  const viewMovies = document.getElementById('view-movies');
  const viewFiles = document.getElementById('view-files');
  const viewDemos = document.getElementById('view-demos');
  const viewNfs = document.getElementById('view-nfs');
  const layers = document.querySelectorAll('.bg-layer');
  const nfsListHotspot = document.getElementById('nfs-list-hotspot');
  const nfsList = document.getElementById('nfs-list');
  const nfsInfo = document.getElementById('nfs-info');
  const nfsInfoDesc = document.getElementById('nfs-info-desc');
  const nfsShot = document.getElementById('nfs-shot');
  const nfsShotCanvas = document.getElementById('nfs-shot-canvas');
  const nfsDavay = document.getElementById('nfs-davay');
  const afishaHotspot = document.getElementById('afisha-hotspot');
  const afishaList = document.getElementById('afisha-list');
  const filesListHotspot = document.getElementById('files-list-hotspot');
  const filesList = document.getElementById('files-list');
  const filesInfo = document.getElementById('files-info');
  const filesInfoTitle = document.getElementById('files-info-title');
  const filesInfoDesc = document.getElementById('files-info-desc');
  const filesDavay = document.getElementById('files-davay');
  const demosListHotspot = document.getElementById('demos-list-hotspot');
  const demosList = document.getElementById('demos-list');
  const demosInfo = document.getElementById('demos-info');
  const demosInfoTitle = document.getElementById('demos-info-title');
  const demosInfoMeta = document.getElementById('demos-info-meta');
  const demosInfoDesc = document.getElementById('demos-info-desc');
  const demosPreviews = document.getElementById('demos-previews');
  const demosDavay = document.getElementById('demos-davay');
  const toast = document.getElementById('toast');

  const videos = [
    { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239122&hash=68dca1ccdcbea028&hd=3&autoplay=1' },
    { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239125&hash=1bcd25053e3585a5&hd=3&autoplay=1' },
    { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239126&hash=2336106174d3b0c2&hd=3&autoplay=1' },
    { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239127&hash=77fa797348403c28&hd=3&autoplay=1' },
    { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239123&hash=dfa86ce81d0b0afc&hd=3&autoplay=1' },
    { src: 'https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239124&hash=c6584cc317038f88&hd=3&autoplay=1' }
  ];

  const filesData = [
    { title: 'AntiViral Toolkit Pro 98', desc: 'Один из лучших резидентных сканеров и антивирусов Antiviral Toolkit Pro позволит вам защитить свой компьютер от более 10 тысяч вирусов. Причем база данных по вирусам постоянно обновляется. Данная демоверсия позволяет использовать некоторые возможности AVP в течение месяца.' },
    { title: 'AVP Inspector 95', desc: 'Резидентный монитор, наблюдающий за всеми файлами на компьютере и сканирующий все запускаемые приложения. Позволяет эффективно предотвратить заражение компьютера.' },
    { title: 'AVP Вирусная Энциклопедия', desc: 'Одна из самых полных энциклопедий по вирусам. Свежая информация и описание всех врагов компьютерного здоровья.' },
    { title: 'CD Wizard', desc: 'Популярный shareware проигрыватель аудио-дисков от BFM Software для Windows 95,NT. Достойная замена стандартному плееру - удобный настраиваемый интерфейс, возможность ведения базы данных по музыкальным CD (онлайновый поиск информации по компактам в базе на 150.000 дисков - больше не понадобится заносить информацию о диске вручную).' },
    { title: 'Delta Force Update', desc: 'Данный патч адресован, в первую очередь, любителям сетевых баталий на сервере Nova Logic. Он позволяет соединяться с сервером, использующим более позднюю версию программного обеспечения.' },
    { title: 'Fix Uninstall', desc: 'Данная утилита, несмотря на свой малый размер, способна творить чудеса. Вам приходилось когда-нибудь наблюдать программу, неспособную деинсталлироваться стандартными средствами панели "Add / Remove Programs"? Fix Uninstall удаляет все данные о ненужной программе из Registry.' },
    { title: 'Heroes of Might & Magic III', desc: 'Патч к русифицированной версии HoMM 3 от компании Бука. Исправляет ряд мелких багов, в частности устраняет проблемы с большим шрифтом в заставке и ландшафтом карт.' },
    { title: 'ICQ 99a', desc: 'Очередная бета популярного On-line пейджера от компании Mirabilis. Призыв к тем, кто еще пользует ICQ 98: Народ! Одумайтесь. В новой ICQ множество мелких полезностей, значительно облегчающих жизнь. Ставьте немедленно.' },
    { title: 'Neo Planet', desc: 'Стремительно набирающий популярность freeware браузер от Bigfoot для Windows 95/98,NT, являющийся своего рода оболочкой для Internet Explorer версии 3.01 и выше. Преимущества NeoPlanet по сравнению с IE - в существенно улучшенном интерфейсе, который к тому же можно изменять с помощью библиотеки скинов.' },
    { title: 'Netscape Communicator 4.51', desc: 'Последняя версия популярного браузера Netscape Communicator. И хотя в поставку Windows 98 включен пятый Internet Explorer, мы думаем, что среди читателей найдется немало приверженцев этого браузера.' },
    { title: 'Quick Time 3.0', desc: 'Проигрыватель и редактор файлов формата Apple Quick Time. В последнее время в Интернет все чаще встречается мультимедийная информация в этом формате. Плеер также играет AVI файлы и MPEG данные.' }
  ];

  const demosData = [
    { title: 'BeatDown', developer: 'HOT-b USA', publisher: 'Soar Software', genre: 'Strategy', requirements: 'P-166, 32 Mb RAM, 35 Mb HDD', desc: 'Очередная поделка на тему гангстерских разборок 30-х годов. По мнению разработчиков, игрок должен получить массу удовольствия, разгуливая по большой карте и выколачивая деньги из прохожих. Все бы ничего, только вот реализация какая-то схематичная: догнал, настучал, деньги забрал, убежал.', shots: ['beat1.webp','beat2.webp','beat3.webp'] },
    { title: 'Daikatana', developer: 'Ion Storm', publisher: 'Eidos Interactive', genre: 'FPS', requirements: 'P-200, 32 Mb RAM, 40 Mb HDD, 3Dfx', desc: 'Долгострой жанра 3-D Action - первая FPS игра, созданная Ромеро после ухода из id Software. Данная демо-версия позволяет вам освоить два уровня для одиночной игры, либо поучаствовать в сетевых баталиях через Mplayer. Для того, чтобы сыграть в Deathmatch по сетке, требуется поставить специальный патч.', shots: ['daik1.webp','daik2.webp','daik3.webp'] },
    { title: 'Kingpin: Life of a Crime', developer: 'Interplay / Xatrix', publisher: 'Interplay', genre: 'FPS', requirements: 'P-200, 64 Mb RAM, 200 Mb HDD', desc: '"Новое слово в жанре 3D-Action". Это громкое заявление полностью подходит к демо-версии нового FPS от Xatrix и Interplay. Kingpin - больше чем 3D-Action, это еще и RPG и Quest в одном флаконе. Гремучая и жутко интересная смесь.', shots: ['king1.webp','king2.webp','king3.webp'] },
    { title: 'Malkari', developer: 'Interactive Magic', publisher: 'Interactive Magic', genre: 'Strategy', requirements: 'P-90, 16 Mb RAM, 25 Mb HDD', desc: 'Глобальная галактическая стратегия наподобие Master of Orion. Убогое графическое оформление и отсутствие каких-либо спецэффектов с лихвой компенсируются стратегической начинкой и стабильной поддержкой многопользовательской игры.', shots: ['malk1.webp','malk2.webp','malk3.webp'] },
    { title: 'MechWarrior 3', developer: 'Fasa Corp / Microprose', publisher: 'Microprose', genre: '3D Action', requirements: 'P-200, 32 Mb RAM, 45 Mb HDD, 3Dfx', desc: 'Третья часть известного роботосимулятора. Отличия от предыдущих двух носят исключительно косметический характер. Современная графика, оригинальный сюжет, новое оружие, а так - все тот же старый добрый MechWarrior.', shots: ['mesh1.webp','mesh2.webp','mesh3.webp'] },
    { title: 'North Vs. South', developer: 'Erudite Software', publisher: 'Interactive Magic', genre: 'Wargame', requirements: 'P-90, 16 Mb RAM, 30 Mb HDD', desc: 'Еще один wargame, посвященный войне Севера и Юга. Неплохая графика (хотя требовать от данного жанра чудес графического гения бесполезно), оригинальная система отдачи команд и неплохая тактическая модель. Любителям wargame\'ов - "Давай", остальным - skip.', shots: ['nvs1.webp','nvs2.webp','nvs3.webp'] },
    { title: 'Requiem', developer: 'Cyclone Studios', publisher: '3DO', genre: 'FPS', requirements: 'P-200, 32 Mb RAM, 55 Mb HDD, 3Dfx', desc: 'Вторая демо-версия FPS от Cyclone Studios. В данной демке доступна сетевая игра, а также несколько одиночных уровней. Появилась возможность использовать различные магические заклинания, что сразу сделало игру на порядок интересней.', shots: ['requ1.webp','requ2.webp','requ3.webp'] },
    { title: 'Tanktics', developer: 'DMA Design', publisher: 'Не объявлен', genre: 'Strategy', requirements: 'P-200, 32 Mb RAM, 15 Mb HDD, 3Dfx', desc: 'Оригинальная стратегия, выделяющаяся на фоне серых и скучных клонов. Забавные и смешные юниты, масса нововведений и приколов - нет, это надо видеть. Рекомендуется посмотреть всем, даже лютым ненавистникам жанра RTS в целом.', shots: ['tank1.webp','tank2.webp','tank3.webp'] },
    { title: 'The Guardian of Darkness', developer: 'Cryo', publisher: 'Cryo', genre: 'Quest', requirements: 'P-166, 32 Mb RAM, 50 Mb HDD', desc: 'Quest или 3D-Action? Рыба или мясо? Ни то и ни другое. Сие творение фирмы Cryo производит впечатление сборной солянки. Для FPS - графика слабовата, для квестов - слишком далеко отошли от создавшегося стереотипа.', shots: ['guar1.webp','guar2.webp','guar3.webp'] },
    { title: 'Wild Metal Country', developer: 'DMA Design', publisher: 'Не объявлен', genre: '3D Action', requirements: 'P-200, 32 Mb RAM, 25 Mb HDD, 3Dfx', desc: '"Башмак видели? Совсем не похоже." Хотя как посмотреть. С одной стороны - банальная 3D-аркада вид сверху, с другой - много различного оружия, бонусов. Результат - играть интересно и даже очень.', shots: ['wmc1.webp','wmc2.webp','wmc3.webp'] },
    { title: 'X - Beyond the Frontier', developer: 'Egosoft', publisher: 'Egosoft', genre: '3D Action', requirements: 'P-200, 32 Mb RAM, 40 Mb HDD, 3Dfx', desc: 'Очередная леталка в космосе. Только вот на немецком языке. В демоверсии присутствует три миссии и тренировочное задание. Графическое исполнение оставляет желать лучшего. Всем, кто найдет хотя бы одного противника - приз зрительских симпатий.', shots: ['x1.webp','x2.webp','x3.webp'] }
  ];

  const nfsDesc = 'В этом разделе собраны двадцать наиболее интересных, на наш взгляд, машин из гигантской коллекции, доступной на сайте www.nfs3.com. Для установки нового "средства передвижения, а не роскоши", достаточно указать архиватору путь к каталогу с проинсталлированной игрой. После этого в меню Player Car появится новая модель.';
  const nfsShots = ['bmwm.webp','bmwm5.webp','dtop.webp','berl.webp','ff40.webp','coss.webp','canto.webp','lgt1.webp','mase.webp','demon.webp','mitsub.webp','306.webp','bans.webp','911t.webp','pors.webp','skoda.webp','sub.webp','wrx.webp','vect.webp','vgts.webp'];

  [
    'assets/img/ui/bg-main.webp','assets/img/ui/bg-main-movies.webp','assets/img/ui/bg-main-files.webp',
    'assets/img/ui/bg-main-demos.webp','assets/img/ui/bg-main-nfs.webp','assets/img/ui/credits.webp',
    'assets/img/ui/bg_movies.webp','assets/img/ui/bg_files.webp','assets/img/ui/bg_demos.webp','assets/img/ui/bg_nfs.webp'
  ].forEach(src => { const i = new Image(); i.src = src; });

  if (document.fonts) {
    document.fonts.load('16px NavigatorCutout', 'Aa');
    document.fonts.load('16px "PT Sans"', 'Aa');
    document.fonts.load('700 16px "PT Sans"', 'Aa');
  }

  // prevent Yandex/browser image toolbar on all images
  document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
  document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });


  function hideAllLayers() { layers.forEach(l => l.classList.remove('is-active')); }
  function showCaption(t) { caption.textContent = t; caption.style.display = 'flex'; }
  function hideCaption() { caption.style.display = 'none'; caption.textContent = ''; }

  function hideAllViews() {
    viewMain.classList.add('view--hidden');
    viewMovies.classList.add('view--hidden');
    viewFiles.classList.add('view--hidden');
    viewDemos.classList.add('view--hidden');
    viewNfs.classList.add('view--hidden');
    afishaList.classList.remove('is-visible');
    filesList.classList.remove('is-visible');
    filesInfo.classList.remove('is-visible');
    filesDavay.classList.remove('is-visible');
    demosList.classList.remove('is-visible');
    demosInfo.classList.remove('is-visible');
    demosPreviews.classList.remove('is-visible');
    demosDavay.classList.remove('is-visible');
    nfsList.classList.remove('is-visible');
    nfsInfo.classList.remove('is-visible');
    nfsShot.classList.remove('is-visible');
    nfsDavay.classList.remove('is-visible');
    if (nfsShotCanvas) {
      const ctx = nfsShotCanvas.getContext('2d');
      ctx.clearRect(0, 0, nfsShotCanvas.width, nfsShotCanvas.height);
    }

    filesKeep = false;
    demosKeep = false;
    nfsKeep = false;
    filesList.querySelectorAll('.files-list__item').forEach(i => i.classList.remove('is-active'));
    demosList.querySelectorAll('.demos-list__item').forEach(i => i.classList.remove('is-active'));
    nfsList.querySelectorAll('.nfs-list__item').forEach(i => i.classList.remove('is-active'));
    hideCaption(); hideAllLayers();
  }

  function openVideo(idx) {
    const v = videos[idx]; if (!v) return;
    videoFrame.innerHTML = `<iframe src="${v.src}" referrerpolicy="no-referrer" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>`;
    videoModal.classList.add('is-open');
  }
  function closeVideo() { videoModal.classList.remove('is-open'); videoFrame.innerHTML = ''; }

  function openShot(src) {
    const img = new Image();
    img.onload = () => {
      const ctx = shotModalImg.getContext('2d');
      shotModalImg.width = img.naturalWidth * 2;
      shotModalImg.height = img.naturalHeight * 2;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, shotModalImg.width, shotModalImg.height);
      shotModal.classList.add('is-open');
    };
    img.src = src;
  }
  function closeShot() {
    shotModal.classList.remove('is-open');
    const ctx = shotModalImg.getContext('2d');
    ctx.clearRect(0, 0, shotModalImg.width, shotModalImg.height);
  }

  let filesKeep = false;
  let demosKeep = false;
  let nfsKeep = false;
  let toastTimer = null;
  function showToast() {
    toast.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-open'), 1000);
  }

  document.querySelectorAll('.hotspot').forEach(hs => {
    if (['afisha-hotspot','files-list-hotspot','demos-list-hotspot','nfs-list-hotspot'].includes(hs.id)) return;
    hs.addEventListener('mouseenter', () => {
      hideAllLayers();
      if (hs.dataset.layer) {
        const layer = document.querySelector(`.bg-layer[data-layer="${hs.dataset.layer}"]`);
        if (layer) layer.classList.add('is-active');
      }
      if (hs.dataset.title) showCaption(hs.dataset.title);
    });
    hs.addEventListener('mouseleave', () => { hideAllLayers(); hideCaption(); });
    hs.addEventListener('click', () => {
      const act = hs.dataset.action;
      if (act === 'credits') credits.classList.add('is-open');
      else if (act === 'chat') window.open('https://web.archive.org/web/199903/http://195.2.82.5/chat', '_blank');
      else if (act === 'open-movies') { hideAllViews(); viewMovies.classList.remove('view--hidden'); }
      else if (act === 'open-files') { hideAllViews(); viewFiles.classList.remove('view--hidden'); }
      else if (act === 'open-demos') { hideAllViews(); viewDemos.classList.remove('view--hidden'); }
      else if (act === 'open-nfs') { hideAllViews(); viewNfs.classList.remove('view--hidden'); }
      else if (act === 'back-main') { hideAllViews(); viewMain.classList.remove('view--hidden'); }
    });
  });

  afishaHotspot.addEventListener('mouseenter', () => { afishaList.classList.add('is-visible'); showCaption('Афиша'); });
  afishaHotspot.addEventListener('mouseleave', e => { if (!afishaList.contains(e.relatedTarget)) { afishaList.classList.remove('is-visible'); hideCaption(); } });
  afishaList.addEventListener('mouseleave', e => { if (!afishaHotspot.contains(e.relatedTarget)) { afishaList.classList.remove('is-visible'); hideCaption(); } });
  afishaList.querySelectorAll('.afisha-list__item').forEach(item => {
    item.addEventListener('click', e => { e.stopPropagation(); openVideo(+item.dataset.vid); });
  });

  function showFilesList() { filesList.classList.add('is-visible'); showCaption('Списочек'); }
  function tryHideFilesList(e) {
    if (filesKeep) return;
    const t = e.relatedTarget;
    if (filesList.contains(t) || filesInfo.contains(t) || t === filesDavay || filesListHotspot.contains(t)) return;
    filesList.classList.remove('is-visible');
    if (!filesInfo.classList.contains('is-visible')) hideCaption();
  }
  filesListHotspot.addEventListener('mouseenter', showFilesList);
  filesListHotspot.addEventListener('mouseleave', tryHideFilesList);
  filesList.addEventListener('mouseleave', tryHideFilesList);
  filesList.querySelectorAll('.files-list__item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const idx = +item.dataset.idx;
      const data = filesData[idx]; if (!data) return;
      filesList.querySelectorAll('.files-list__item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      filesInfoTitle.textContent = data.title;
      filesInfoDesc.textContent = data.desc;
      filesInfo.classList.add('is-visible');
      filesDavay.classList.add('is-visible');
      filesKeep = true;
      showCaption('Списочек');
    });
  });
  filesDavay.addEventListener('click', e => { e.stopPropagation(); showToast(); });

  function showDemosList() { demosList.classList.add('is-visible'); showCaption('Списочек'); }
  function tryHideDemosList(e) {
    if (demosKeep) return;
    const t = e.relatedTarget;
    if (demosList.contains(t) || demosInfo.contains(t) || demosPreviews.contains(t) || t === demosDavay || demosListHotspot.contains(t)) return;
    demosList.classList.remove('is-visible');
    if (!demosInfo.classList.contains('is-visible')) hideCaption();
  }
  demosListHotspot.addEventListener('mouseenter', showDemosList);
  demosListHotspot.addEventListener('mouseleave', tryHideDemosList);
  demosList.addEventListener('mouseleave', tryHideDemosList);

  demosList.querySelectorAll('.demos-list__item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const idx = +item.dataset.idx;
      const data = demosData[idx]; if (!data) return;
      demosList.querySelectorAll('.demos-list__item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');

      demosInfoTitle.textContent = data.title;
      demosInfoMeta.innerHTML = `Разработчик: ${data.developer}<br>Издатель: ${data.publisher}<br>Жанр: ${data.genre}<br>Системные требования: ${data.requirements}`;
      demosInfoDesc.textContent = data.desc;
      demosInfo.classList.add('is-visible');
      demosDavay.classList.add('is-visible');

      const shots = demosPreviews.querySelectorAll('.shot');
      data.shots.forEach((s, i) => {
        const url = 'assets/img/content/' + s;
        shots[i].style.backgroundImage = `url('${url}')`;
        shots[i].dataset.full = url;
      });
      demosPreviews.classList.add('is-visible');
      demosKeep = true;
      showCaption('Списочек');
    });
  });

  demosPreviews.querySelectorAll('.shot').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (el.dataset.full) openShot(el.dataset.full);
    });
  });

  demosDavay.addEventListener('click', e => { e.stopPropagation(); showToast(); });

  // NFS
  function showNfsList() { nfsList.classList.add('is-visible'); showCaption('Тачки'); }
  function tryHideNfsList(e) {
    if (nfsKeep) return;
    const t = e.relatedTarget;
    if (nfsList.contains(t) || nfsInfo.contains(t) || nfsShot.contains(t) || t === nfsDavay || nfsListHotspot.contains(t)) return;
    nfsList.classList.remove('is-visible');
    if (!nfsInfo.classList.contains('is-visible')) hideCaption();
  }
  nfsListHotspot.addEventListener('mouseenter', showNfsList);
  nfsListHotspot.addEventListener('mouseleave', tryHideNfsList);
  nfsList.addEventListener('mouseleave', tryHideNfsList);

  nfsList.querySelectorAll('.nfs-list__item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      const idx = +item.dataset.idx;
      nfsList.querySelectorAll('.nfs-list__item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      nfsInfoDesc.textContent = nfsDesc;
      nfsInfo.classList.add('is-visible');
      const url = 'assets/img/content/' + nfsShots[idx];
      nfsShot.dataset.full = url;
      const img = new Image();
      img.onload = () => {
        nfsShotCanvas.width = img.naturalWidth;
        nfsShotCanvas.height = img.naturalHeight;
        const ctx = nfsShotCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        nfsShot.classList.add('is-visible');
      };
      img.src = url;
      nfsDavay.classList.add('is-visible');
      nfsKeep = true;
      showCaption('Тачки');
    });
  });

  nfsShot.addEventListener('click', e => {
    e.stopPropagation();
    if (nfsShot.dataset.full) openShot(nfsShot.dataset.full);
  });
  nfsDavay.addEventListener('click', e => { e.stopPropagation(); showToast(); });

  credits.addEventListener('click', () => credits.classList.remove('is-open'));
  videoModal.addEventListener('click', e => { if (e.target === videoModal) closeVideo(); });
  shotModal.addEventListener('click', () => closeShot());
  toast.addEventListener('click', () => { toast.classList.remove('is-open'); clearTimeout(toastTimer); });

  const SPLASH_KEY = 'nim-1999-03-splash';
  const splash = document.getElementById('splash');
  const splashLogo = document.getElementById('splash-logo');
  const splashText1 = document.getElementById('splash-text-1');
  const splashText2 = document.getElementById('splash-text-2');
  const stageEl = document.getElementById('stage');
  let splashTimers = [];
  let splashActive = false;

  function endSplash() {
    if (!splashActive) return;
    splashActive = false;
    splashTimers.forEach(clearTimeout);
    splashTimers = [];
    splash.classList.remove('is-active');
    stageEl.classList.remove('splash-active');
    splashLogo.classList.remove('is-visible');
    splashText1.classList.remove('is-visible');
    splashText2.classList.remove('is-visible');
    try { sessionStorage.setItem(SPLASH_KEY, '1'); } catch (e) {}
  }

  function runSplash() {
    splashActive = true;
    splash.classList.add('is-active');
    stageEl.classList.add('splash-active');

    // logo: fade in 1s, hold 2s, fade out 1s
    splashTimers.push(setTimeout(() => splashLogo.classList.add('is-visible'), 50));
    splashTimers.push(setTimeout(() => splashLogo.classList.remove('is-visible'), 3000));

    // text1: fade in at 4s, hold 2s, fade out
    splashTimers.push(setTimeout(() => splashText1.classList.add('is-visible'), 4000));
    splashTimers.push(setTimeout(() => splashText1.classList.remove('is-visible'), 7000));

    // text2: fade in at 8s, hold 2s, fade out
    splashTimers.push(setTimeout(() => splashText2.classList.add('is-visible'), 8000));
    splashTimers.push(setTimeout(() => splashText2.classList.remove('is-visible'), 11000));

    splashTimers.push(setTimeout(() => endSplash(), 12000));
  }

  splash.addEventListener('click', endSplash);

  fetch('../../shared/img/navigator_logo.svg')
    .then(r => r.text())
    .then(svg => {
      splashLogo.innerHTML = svg;
      const s = splashLogo.querySelector('svg');
      if (s) {
        s.removeAttribute('width');
        s.removeAttribute('height');
        s.style.width = '100%';
        s.style.height = 'auto';
      }
      try {
        if (!sessionStorage.getItem(SPLASH_KEY)) runSplash();
      } catch (e) {
        runSplash();
      }
    })
    .catch(() => {
      try {
        if (!sessionStorage.getItem(SPLASH_KEY)) runSplash();
      } catch (e) {
        runSplash();
      }
    });
})();
