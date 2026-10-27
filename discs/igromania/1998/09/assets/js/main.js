(function () {

  // Preload section backgrounds (stay in browser cache for session)
  (function preloadAssets() {
    var imgs = [
      'assets/img/ui/bg.webp',
      'assets/img/ui/bg_games.webp',
      'assets/img/ui/bg_soft.webp',
      'assets/img/ui/bg_super.webp',
      'assets/img/ui/next.webp',
      'assets/img/ui/prev.webp',
      'assets/img/ui/winamp.webp',
      'assets/img/ui/bc.webp',
      'assets/img/ui/wordmark.svg',
      'assets/img/ui/target.svg'
    ];
    imgs.forEach(function (src) {
      var im = new Image();
      im.src = src;
    });
    // warm audio decode path
    try { new Audio('assets/sound/splash.wav'); } catch (e) {}
  })();

      const GAMES = [{"n": 1, "title": "PANZER COMMANDER", "description": "Почувствуйте себя в танке времен Второй Мировой войны и дайте это почувствовать и своему врагу. А если игра вас всерьез заинтересует – тогда прочтите полное руководство в этом номере нашего журнала.", "info": "Разработчик: Ultimation Inc. \nИздатель: SSI\nЖанр: симулятор танка\nСистемные требования:  Pentium-133, 16 MB RAM, видео SVGA с 2MB, мышь, Windows 95\nНеобходим DirectX 5.0", "page": 4}, {"n": 2, "title": "NIGHTMARE CREATURES", "description": "Ужас бродит по ночным улицам Лондона. Ужас, перед которым трепещут все. Все, кроме двух смельчаков, решивших бросить вызов силам Тьмы. Одним из этих бесстрашных станете вы…", "info": "Разработчик: Kalisto\nИздатель: Activision\nЖанр: 3D action + fighting\nСистемные требования:  Pentium-133, 16 MB RAM, видео SVGA с 1MB, мышь, Windows 95", "page": 5}, {"n": 3, "title": "NEOPHYTE: KOPLIO’S STORY", "description": "Вы – Коплио (Koplio), юный монах, живущий в отдаленном монастыре. Спокойно жить вам не дают слухи о пришествии Вакматио, Великого Злодея (Vacmatio the Grand Malefactor), а также и странные вещи, творящиеся в монастырском подземелье. А тут еще и землетресение, которое завалило вход в зал, где хранится святая реликвия – доспехи Горуса (Armor of Gorus). Доспехи не должны попасть в руки к злодеям, иначе вашу родину ждут великие несчастья. Придется вам разобраться в этом деле лично…", "info": "Разработчик: Alien Software Inc. \nИздатель: Alien Software Inc. \nЖанр: adventure\nСистемные требования:  Pentium-60, 8 MB RAM, Windows 95", "page": 6}, {"n": 4, "title": "ADDICTION PINBALL", "description": "Очередной пинбол, создатели которого постарались соблюсти все законы физики в поведении шариков. Сам же столик для пинбола разрисован забавными рожицами героев другой известнейшей аркадной игры – Worms. В демо-версии Addiction Pinball ваша цель – играя на время победить в режиме \"Wild West\".", "info": "Разработчик: Team17 \nИздатель: MicroProse\nЖанр: пинбол\nСистемные требования:  Pentium-75, 16 MB RAM,\nвидео 1MB, Windows 95.\nНеобходим DirectX 5.0", "page": 7}, {"n": 5, "title": "ULTIM@TE RACE PRO", "description": "Демо-версия очередных гонок, в которой вам предлагаются две модели машин и семь соперников под командованием компьютера. А если хотите обогнать своего приятеля, то сможете это сделать через LAN.\nДемо-версия поддерживает 3Dfx, что должно порадовать обладателей этих \"игрушек\".", "info": "Разработчик: Kalisto \nИздатель: MicroProse\nЖанр: автогонки\nСистемные требования:  Pentium-133, 16 MB RAM,\nвидео SVGA с 1MB, Windows 95\n Необходим DirectX 5.0", "page": 8}, {"n": 6, "title": "SID MEIER’S GETTYSBURG!", "description": "Данное демо известной игры Сида Мейера позволит вам сыграть за северян или южан в трех сценариях, плюс пройти все тренировочные миссии. Также вы сможете играть в эту демо-версию игры по сети в течении полной недели со дня установки.", "info": "Разработчик: Firaxis Games\nИздатель: Origin Systems\nЖанр: real-time wargame\nСистемные требования:  Pentium-90, 16 MB RAM,\nвидео SVGA, мышь, Windows 95\n Необходим DirectX 5.0", "page": 9}, {"n": 7, "title": "BURNOUT: CHAMPIONSHIP DRAG RACING", "description": "Какой же русский не любит быстрой езды? Вот мы и предлагаем вам поучаствовать в очень оригинальных гонках – вам предстоит проехать всего-то несколько сот метров, но… с умопомрачительной скоростью. Думаете, что это просто?  Тогда попробуйте…\nВ данной демо есть два исполнительных файла. Обладатели 3Dfx должны запустить файл \"burnout.exe\", а те, у кого такой роскoши нет – файл \"burnouts.exe\".", "info": "Разработчик: Bethesda Softworks\nИздатель: Bethesda Softworks\nЖанр: автогонки\nСистемные требования:  Pentium-75, 16 MB RAM, видео SVGA с 1MB, DOS или Windows 95\n Необходим DirectX 5.0", "page": 10}, {"n": 8, "title": "SIN", "description": "Игра, которую ждут очень многие. Игра, которая должна стать новым словом в жанре 3D-action, новый Quake-killer, а может даже и Unreal-killer. \nВ демоверсии есть два сбоя, иногда дающие о себе знать, а иногда – не проявляющиеся вовсе. \nПервый сбой – во время стрельбы из пулемета, установленного на вертолете, вам надо уничтожить всех людей на крышах. Если вдруг вы видите, что враги начинают с завидным постоянством вылазить из дверей, то можете смело начинать игру сначала – закончить данный этап вы не сможете, враги будут постоянно восстанавливаться. \nВторой сбой – во время перестрелок в здании банка. Если открыв дверь вы видите сразу за ней врага, не спешите стрелять в него. Дело в том, что враг может упасть прямо в дверном проеме. В этом случае вы не сможете пройти в дверь – труп будет мешать. Поэтому сначала проскочите в дверь и только потом уложите врага.", "info": "Разработчик: Ritual Entertainment\nИздатель: Activision\nЖанр: 3D-action\nСистемные требования:  Pentium-133, 32 Mb RAM, Windows95, рекомендуется 3Dfx", "page": 11}, {"n": 9, "title": "KKnD 2: KROSSFIRE", "description": "100 лет прошло после ядерной войны на Земле. 40 лет прошло после битв, в которых вы принимали участие в первой части KKnD. \nФинальная демо-версия продолжения одной из лучших стратегий прошлого года. Объеди- няет миссии за три стороны: мутантов,  выживших и андроидов. Последняя раса станет сюрпризом для знатоков KKnD - ее не было в первой части. \nПодробное руководство по игре читайте в нашем журнале.", "info": "Разработчик: Beam Software\nИздатель: Melbourne House\nЖанр: real-time strategy\nСистемные требования:  Pentium-133, 16MB RAM, Window95,  DirectX", "page": 12}, {"n": 10, "title": "CROC: LEGEND OF THE GOBBOS", "description": "Попробуйте помочь симпатяге-крокодилу по имени Croc спасти его друзей-Gobbos от злобного Baron Dante. Вам предстоит пройти огонь, воду и медные трубы в полностью трехмерном мире для успешного окончания вашей миссии. Приготовьтесь бегать, прыгать и... шевелить извилинами – без мозгов эту игру вам не одолеть!", "info": "Разработчик: Argonaut Software \nИздатель: Fox Interactive\nЖанр: 3D платформер\nСистемные требования:  Pentium-133, 16 MB RAM,\n видео SVGA с 1MB, Windows 95", "page": 13}, {"n": 11, "title": "MICROSOFT GOLF 1998 EDITION", "description": "Симуляторы гольфа пользуются в США огромной популярностью. Почему? Установите эту дему и попробуйте понять загадочную американскую душу.\nНовый гольф с кардинально измененной графикой. Любителям загнать шар в лузу предоставляется отличная возможность предаться любимому занятию не выходя из дома. В демо-версии задействованы все возможности  игры, однако у вас есть всего лишь три лузы – 2, 17 и 18.", "info": "Разработчик: Friendly Software\nИздатель: Microsoft\nЖанр: спортивный имитатор\nСистемные требования:  Pentium-90, 16 MB RAM, видео SVGA с 2MB, мышь, Windows 95; Windows NT", "page": 14}, {"n": 12, "title": "WORLD CUP 98", "description": "Игра EA Sports' World Cup 98 дарит вам еще одну возможность пережить все волнения и надежды, связанные с недавно прошедшим Чемпионатом мира по футболу. В демо версии вы сможете командовать сборной Англии или Бразилии во время их встречи на стадионе St. Denis.", "info": "Разработчик: EA Sports\nИздатель: EA Sports\nЖанр: спортивный симулятор\nСистемные требования:  Pentium-100, 16 MB RAM,\n видео SVGA с 1MB, Windows 95\nНеобходим DirectX 5.0", "page": 15}, {"n": 13, "title": "ПОЛНАЯ ТРУБА", "description": "Один уровень из необычных приключений необычного существа в каком-то необычном месте. Вашего героя окружают необычные персонажи, которые заняты своими необычными делами.", "info": "Разработчик: Никита\nИздатель: Никита\nЖанр: квест\nСистемные требования:  Pentium-100, 16 MB RAM,\n видео SVGA с 1MB, Windows 95\nНеобходим DirectX 5.0", "page": 16}, {"n": 14, "title": "WARGAMES", "description": "Полностью трехмерная стратегия реального времени. Вы можете вращать карту, приближать или удалять ее. Вы сражаетесь за силы Земли против WOPR (в демо версии, а в полной версии вам будут доступны и миссии за другую сторону). Различные ландшафты от пустыни до городских улиц.", "info": "Разработчик: MGM Interactive\nИздатель: MGM Interactive\nЖанр: real-time strategy\nСистемные требования:  Pentium-133, 16 MB RAM,\n Windows 95, DirectX 5.0, рекомендуется 3Dfx", "page": 17}, {"n": 15, "title": "NHL '98", "description": "Хоккей – игра увлекательная, но вот только на коньках кататься умеют далеко не все. Чтож, эту проблему можно легко решить. В предлагаемой вам демо-версии игры NHL '98 вы можете сыграть за одну из двух известных хоккейных команд – Detroit Red Wings или Philadelphia Flyers.", "info": "Разработчик: EA Sports\nИздатель: EA Sports\nЖанр: спортивный симулятор\nСистемные требования:  Pentium-90, 16 MB RAM, видео SVGA с 1MB, мышь, Windows 95", "page": 18}, {"n": 16, "title": "LONGBOW 2", "description": "Продолжение известной игры Jane's AH-64D Longbow. В новом Longbow 2 вы снова окажетесь за штурвалом современнейшего боевого вертолета. Помимо реалистичного поведения вертолета в небе, игра примечательна еще и возможностью настройки многих опций, благодаря чему любой игроман сможет почувствовать себя на равных в бою с компьютерным противником вне зависимости от своего \"летного опыта\".", "info": "Разработчик: Jane's Combat Simulations \nИздатель: Origin Systems\nЖанр: симулятор вертолета\nСистемные требования:  Pentium-133, 16 MB RAM, видео SVGA с 2MB, мышь, Windows 95\nНеобходим DirectX 5.0", "page": 19}];
      const PATCHES = {"heading": "ПАТЧИ И ОБНОВЛЕНИЯ ИГР", "items": [{"n": 1, "title": "Stonekeep", "description": "Данный патч сменит вашу версию игры на версию 1.2, устраняя некоторые ошибки пре-\nдыдущей версии, в частности, проблемы со сбором камнеметательной машины гномов"}, {"n": 2, "title": "The Summoning", "description": "Это – очень редкий патч для одной из самых лучших ролевых игр прошлых лет. Обладателей этого раритета несомненно порадует возможность сменить версию игры на 1.2, благодаря чему будут устранены некоторые ошибки предыдущей версии."}, {"n": 3, "title": "Fallout", "description": "Этот патч устраняет некоторые сбои в игре и убирает второе ограничение по времени. Теперь, найдя чип управления системой очистки воды, вам можно расслабиться: нападения супермутантов на Vault 13 не будет вообще."}, {"n": 4, "title": "Wetlands", "description": "Данный патч сменит вашу версию игры на версию 1.1. При этом, помимо всего прочего, несколько улучшится управление прицелом при помощи мыши."}, {"n": 5, "title": "Privateer 2: The Darkening", "description": "Этот патч устраняет ошибки предыдущей версии, добавляет клавиши для управления кораблем на клавиатуре и дает вам долгожданную возможность задействовать неуязвимость из меню Spaceflight Options."}, {"n": 6, "title": "Wing Commander: Prophecy", "description": "Данный патч устраняет проблемы при использовании графических ускорителей на чипсетах Voodoo (карточка Diamond Monster 3D) и Voodoo 2."}, {"n": 7, "title": "Wing Commander IV: The Price of Freedom", "description": "Этот патч позволит вам запускать игру Wing Commander IV прямо из Windows95."}, {"n": 8, "title": "Wing Commander IV: The Price of Freedom", "description": "Этот патч поможет вам, если при игре в Wing Commander IV у вас были проблемы с калибровкой джойстика."}, {"n": 9, "title": "Descent 2", "description": "Этот патч позволит игре поддерживать графические ускорители на чипсетах Voodoo (карточка Diamond Monster 3D).\nВнимание! У вас должны быть установлены драйвера Glide 2.31 или выше!"}, {"n": 10, "title": "Descent: Freespace", "description": "Этот патч ускоряет игру по сети за счет перераспределения функций client-server и устраняет проблемы, возникающие иногда при взаимодействии с вспомогательными эскадрильями в бою для одиночной игры. \nДля версии игры, выпущенной в Англии."}, {"n": 11, "title": "Shadows of the Empire", "description": "Данный патч сменит вашу версию игры на версию 1.1, устраняя ошибки предыдущей версии"}, {"n": 12, "title": "Star Wars: Rebellion", "description": "Этот патч устраняет проблемы, возникающие при игре по сети."}, {"n": 13, "title": "Dark Reign: The Future of War", "description": "Этот патч заменит версию игры 1.0 или 1.1 на версию 1.2. Благодаря этому вы получите новые возможности при управлении войсками."}, {"n": 14, "title": "Heavy Gear", "description": "Данный патч устраняет некоторые ошибки предыдущей версии и улучшает графику при работе 3Dfx. Однако учтите, что  при использовании старых драйверов для Diamond Monster 3D (на чипсете Voodoo I)  после смены версии возможны зависания игры или другие неприятные вещи."}, {"n": 15, "title": "The Terminator: Rampage", "description": "Данный патч позволит вам играть в Rampage на современных \"Пентиумах\" без проблем, связанных с излишним ускорением."}, {"n": 16, "title": "The Terminator: Future Shock", "description": "Патч устраняет ошибки первоначальной версии (частые зависания, происходящие при посещении зданий баз роботов или при применении ракетной пусковой установки против Flencers на железных вышках во время задания №6).\nПредназначен для версии игры, выпущенной в Англии."}, {"n": 17, "title": "The Terminator: Future Shock", "description": "Патч устраняет ошибки первоначальной версии (частые зависания, происходящие при посещении зданий баз роботов или при применении ракетной пусковой установки против Flencers на железных вышках во время задания №6).\nПредназначен для версии игры, выпущенной в США."}, {"n": 18, "title": "SKYNET: No Limits", "description": "Данный патч сменит вашу версию игры на версию 1.01, устраняя ошибки предыдущей версии (зависания и проблемы с ракетной установкой)."}, {"n": 19, "title": "Descent: Freespace", "description": "Этот патч ускоряет игру по сети за счет перераспределения функций client-server и устраняет проблемы, возникающие иногда при взаимодействии с вспомогательными эскадрильями в бою для одиночной игры. \nДля версии игры, выпущенной в США."}, {"n": 20, "title": "Jedi Knight: Dark Forces II", "description": "Патч, который решит все проблемы связанные потерей управления при игре джойстиком. У вас должна быть установлена оригинальная версия игры."}, {"n": 21, "title": "Unreal", "description": "Экспериментальный патч версии 1.0b1, который позволит запускать игру непосред- ственно из броузера. Разработчики ждут ваших комментариев и предолжений по ра- боте этого патча, после чего будет выпущена финальная версия."}, {"n": 22, "title": "F-15 Eagle", "description": "Этот патч апгрейдит игру до версии 1.12f, исправляет все известные на настоящий момент ошибки, улучшает AI ваших противников."}, {"n": 23, "title": "M.A.X. 2", "description": "Поднимает версию игры до 1.3, модифицирует условия победы в кампании, изменяет систему вычисления рейтинга, улучшает сетевую и одиночную игру. Для установки патча распакуйте его в директорию с игрой и запустите ЕХЕ-файл."}, {"n": 24, "title": "Battlezone", "description": "Этот патч улучшает графику при использовании AGP и 3Dfx видеокарт и акселераторов. Исправляет все обнаруженные ошибки. Улучшает режим сетевой игры: добавляет пять новых карт, усиливает защиту от читеров."}]};
      const SUPER = {"title": "Battlecruiser 3000 AD", "html": "В свое время эта игра была издана на CD компанией Take 2, но при этом была выпущена недоработанная версия. Сбоев было море разливанное, и все только и делали, что ругали игру. Дерек Смарт (Derek Smart), человек, проделавший львиную часть работы над игрой и отдавший этому делу восемь лет жизни, сильно обиделся за несправедливые наезды на свое детище – ведь почти все ругали не саму игру, а сбои в этой игре. Сбои же были потому, что мистер Смарт попросту не успел закончить работу и довести игру \"до ума\". Поэтому он пошел на смелый и неожиданный шаг – выкупил у Take2 все права на Battlecruiser 3000 и выставил его на своем сайте для свободного скачивания. При этом мистер Смарт устранил все ранние сбои и даже ввел поддержку 3Dfx для своего детища. Зачем он это сделал? Об этом лучше всего скажет сам Смарт, послание от него прочтите ниже. Из уважения к этому человеку, мы приводим текст на языке оригинала. А что касается Battlecruiser, то мы не будем ничего говрить, игра сама все скажет в свою защиту. Однако помните: Battlecruiser – серьезный имитатор, а не аркада. Освоить его управление не так-то и легко. Но у вас получится.<br><br>Игра устанавливается в директорию <b>C:&#92;bc3k</b>, для установки необходимо около 120Мб свободного места на диске. Если вы измените директорию, то вам будет необходимо поправить файл <b>bc3000ad.ini</b>, как сказано в <b>Readme.txt</b>. В папке <b>docs</b> вы найдете руководство к игре в формате <b>.pdf</b>. Чтобы его прочесть вам необходимо установить <b>Adobe Acrobat</b>."};
      const WINAMP = {"note": "ДЛЯ ВНИМАТЕЛЬНОГО ПРОЧТЕНИЯ :", "description": "WinAMP - самая популярная программа для проигрывания файлов в формате МР3 разработана фирмой Nullsoft Inc. МР3 - это прогрессивный формат сжатия звука, который позволяет сохранять музыку с качеством CD при небольших размерах файла. Например, на один компакт диск может поместиться порядка 200 песен в формате МР3. \nКроме простоты и удобства WinAMP, росту его попу- лярности служит то, что любой желающий может соз-\nдать внешнюю панель, так называемый скин (skin), для проигрывателя по собственному вкусу. И многие их создают для себя, а затем дарят всем желающим.\nКроме того существует большое число плагинов для WinAMP, который добавляют в программу различные звуковые и видеоэффекты.\nМы предлагаем вашему вниманию подборку скинов и плагинов для WinAMP, а также программу для создания собственных файлов в формате МР3. \nНо помните: нарушение авторских прав уголовно наказуемо!\nДля просмотра коллекции вам необходимо иметь броузер интернет, так как подборка создана в виде HTML-файла (если на вашем компьютере установлен Windows 95, то он у вас уже есть). Кроме того, вам  будет необходим установленный WinZip, если его еще нет, то загляните в раздел с программами.  Там же вы найдете последние версии популярных броузеров.\nКаждый скин необходимо распаковывать в собствен- ную директорию в папку winamp/skins. Будьте ВНИ- МАТЕЛЬНЫ! Многие архивы содержат путь для рас- па ковки. Плагины надо сваливать в общую кучу в директории winamp/plugins. \nПодключение скинов и плагинов осуществляется че- рез меню или нажатием клавиш Alt+S (для скинов) и Ctrl+K (для плагинов - там надо будет еще выбрать нужный плагин и нажать Start)", "items": [{"title": "УСТАНОВИТЬ WINAMP", "file": "winamp/winamp192.exe"}, {"title": "ПРОГРАММА ДЛЯ СОЗДАНИЯ СОБСТВЕННЫХ МР3 ФАЙЛОВ", "file": "winamp/cdex014.exe"}, {"title": "ВЫБРАТЬ ПЛАГИН", "action": "Explorer.exe winamp\\plugins"}, {"title": "ВЫБРАТЬ СКИН\nзапустите файл _skins.html", "action": "Explorer.exe winamp\\skins"}]};
      const UTILS = [{"name": "ГРАФИКА", "items": [{"title": "ACDSee 2.3", "description": "ACDSee 2.3 - мощный и очень быстрый вьювер для всех основных графических форматов. Быстро показывает превью для всех картинок в директории."}, {"title": "Irfan View32", "description": "Irfan View32 - быстрый просмотрщик/конвертер под Win95/98. Просмотр,  слайд-шоу, настройка печати.  Также поддерживает AVI, WAV и MIDI файлы."}]}, {"name": "АНТИВИРУСЫ", "items": [{"title": "McAfee ViruScan", "description": "McAfee ViruScan - отличный антивирус. Версия 3.19  от 27 июля 1998"}, {"title": "Thunderbyte Anti-Virus", "description": "Thunderbyte Anti-Virus - антивирус c широкими возможностями настройки. Проверка дисков по расписанию, а также всех файлов, скачивающихся из сети."}]}, {"name": "ТЕСТЫ", "items": [{"title": "Nokia Monitor Tester", "description": "Nokia Monitor Tester - тестирование монитора. Просто необходима каждому при покупке нового монитора или настройке уже купленного."}, {"title": "CliBench MK II", "description": "CliBench MK II - программа для тестирования процессора и винчестера"}, {"title": "Wintune 97 for Windows 95/NT", "description": "Wintune 97 for Windows 95/NT - мощная программа всестороннего тестирования и настройки вашего компьютера, поддерживает системы с Pentium II"}]}, {"name": "УТИЛИТЫ", "items": [{"title": "WinZip 6.3", "description": "WinZip 6.3 - самый популярный в мире архиватор"}, {"title": "PowerDesk Utilities 98", "description": "PowerDesk Utilities 98 - набор полезных утилит: новый полностью настраиваемый тулбар для Windows, файл-менеджер, архиваторы и др."}]}, {"name": "ДРАЙВЕРА", "items": [{"title": "DirectX 6.0 rus", "description": "DirectX 6.0 rus - набор мультимедийных драйверов для русской версии Windows 95, добавит новые возможности вашему компьютеру"}, {"title": "DirectX 6.0 eng", "description": "DirectX 6.0 eng - набор мультимедийных драйверов для американской или паневропейской версии Windows 95, добавит новые возможности вашему компьютеру"}]}];
      const INTERNET = {"browsers": [{"n": 1, "title": "Netscape Communicator 4.05 (русская версия)", "description": "Netscape Communicator 4.05 (русская версия)", "file": "soft_int/cc32r405.exe"}, {"n": 2, "title": "Netscape Communicator 4.05 (английская версия)", "description": "Netscape Communicator 4.05 (английская версия)", "file": "soft_int/cc32e405.exe"}, {"n": 3, "title": "Microsoft Internet Explorer 4.01 (русская версия)", "description": "Microsoft Internet Explorer 4.01 (русская версия)", "file": "soft_int/ie401rus/ie4setup.exe"}, {"n": 4, "title": "Microsoft Internet Explorer 4.01 (английская версия)", "description": "Microsoft Internet Explorer 4.01 (английская версия)", "file": "soft_int/ie401eng/ie4setup.exe"}], "utils": [{"n": 5, "title": "ConnectionPal Professional  ", "description": "ConnectionPal Professional - звонилка для выхода в интернет:  несколько линий, проверка почты, статистика, автодозвон, запуск заданных программ", "file": "soft_int/cppro.exe"}, {"n": 6, "title": "Net.Medic", "description": "Net.Medic - диагностика всех параметров вашего интернет-подключения,\nпозволяет своевременно найти и исправить все проблемы со связью", "file": "soft_int/nm.exe"}, {"n": 7, "title": "ICQ98a", "description": "ICQ98a - ваш сетевой пейджер, срочные сообщения и бесконечная болтовня\nпо сети в реальном времени", "file": "soft_int/icq98a.exe"}, {"n": 8, "title": "The Bat!", "description": "The Bat! - один из лучших почтовых клиентов, полная поддержка русского\nязыка – никаких проблем с перекодировками – очень рекомендуем", "file": "soft_int/the_bat.exe"}, {"n": 9, "title": "WinDownload 4.01", "description": "WinDownload 4.01 - докачка файлов в сети, возможна работа по заранее\nзаданному расписанию без вашего участия", "file": "soft_int/windownload.exe"}], "headings": {"1int": "ЛУЧШИЕ ИНТЕРНЕТ-БРОДИЛКИ", "2int": "ПРОГРАММЫ, КОТОРЫЕ ДЕЛАЮТ РАБОТУ\nВ СЕТИ ПРОЩЕ И ПРИЯТНЕЕ"}};
      const VIDEOS = [{"title": "Ultima: Ascension (Origin)", "info": "320х240, 58 сек", "vk": "https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239110&hash=fcdadaec98cc8bf8&hd=3&autoplay=1"}, {"title": "Heretic II (Activision)", "info": "160х120, 2 мин 31 сек", "vk": "https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239114&hash=00f8b91dde3b5241&hd=3&autoplay=1"}, {"title": "Metro City (Melbourne House)", "info": "320х240, 25 сек", "vk": "https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239113&hash=700fb773461b91a4&hd=3&autoplay=1"}, {"title": "Alien Vs Predator (Fox Interactive)", "info": "320х240, 54 сек", "vk": "https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239111&hash=aad76c86730ff67c&hd=3&autoplay=1"}, {"title": "Turok 2 (Acclaim)", "info": "320х240, 32 сек", "vk": "https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239115&hash=99dab1a0d2622487&hd=3&autoplay=1"}, {"title": "Blackstone Chronicles (Mindscape)", "info": "320х240, 11 сек", "vk": "https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239112&hash=7cae75954d51d0cc&hd=3&autoplay=1"}];

      const bgImg = document.getElementById('bgImg');
      const screenMain = document.getElementById('screenMain');
      const screenGames = document.getElementById('screenGames');
      const sidePanel = document.getElementById('sidePanel');
      const gamesList = document.getElementById('gamesList');
      const layoutLines = document.getElementById('layoutLines');
      const detail = document.getElementById('detail');
      const pageNum = document.getElementById('gamesPageNum');
      const modalDim = document.getElementById('modalDim');
      const modalMsg = document.getElementById('modalMsg');

      let busy = false;
      let mode = 'list'; // list | detail
      let curIdx = 0;
      let modalTimer = null;

      // build list
      GAMES.forEach((g, i) => {
        const el = document.createElement('div');
        el.className = 'game';
        el.textContent = g.title;
        el.dataset.idx = i;
        el.addEventListener('click', () => openDetail(i));
        gamesList.appendChild(el);
      });

      function showScreen(el) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
      }

      function resetListAnim() {
        gamesList.querySelectorAll('.game').forEach(g => {
          g.classList.remove('visible', 'from-left', 'from-right');
        });
      }

      function playListAppear() {
        const games = [...gamesList.querySelectorAll('.game')];
        games.forEach((g, i) => {
          g.classList.add(i % 2 === 0 ? 'from-left' : 'from-right');
          void g.offsetWidth;
          setTimeout(() => g.classList.add('visible'), 90 + i * 65);
        });
      }

      function snapGamesListVisible() {
        gamesList.querySelectorAll('.game').forEach(g => {
          g.style.transition = 'none';
          g.classList.remove('from-left', 'from-right');
          g.classList.add('visible');
          g.style.transform = 'translateX(0)';
          void g.offsetWidth;
          // clear inline so next playListAppear can animate again
          g.style.transition = '';
          g.style.transform = '';
        });
      }

      /** Return to demos list WITHOUT touching side panel at all */
      function showDemosListQuiet() {
        busy = false;
        mode = 'list';

        // CRITICAL: kill line transitions BEFORE removing .show
        layoutLines.querySelectorAll('.hline, .vline').forEach(el => {
          el.style.transition = 'none';
          el.style.transform = 'none';
        });
        layoutLines.classList.remove('show');
        layoutLines.style.visibility = 'hidden';

        // PANEL hard freeze — never remove('in')
        sidePanel.style.transition = 'none';
        sidePanel.style.transform = 'translateY(0)';
        sidePanel.classList.add('no-anim', 'in');
        // chrome stays, no re-anim
        const bc = document.getElementById('blueChrome');
        if (bc) {
          bc.style.visibility = 'visible';
          bc.classList.add('on', 'in');
          bc.querySelectorAll('.bc-left,.bc-right').forEach(el => {
            el.style.transition = 'none';
            el.style.transform = 'none';
          });
        }

        // DETAIL force-hide, no exit anim
        detail.style.transition = 'none';
        detail.classList.remove('in', 'active');
        detail.style.display = 'none';
        detail.querySelectorAll('.d-title,.d-desc,.d-info,.d-shot,.d-install').forEach(el => {
          el.style.transition = 'none';
        });

        // LIST snap while hidden, then show
        gamesList.classList.add('hidden');
        snapGamesListVisible();
        gamesList.classList.remove('hidden');

        bgImg.src = 'assets/img/ui/bg_games.webp';
        hidePatches();
        hideVideos();
        pageNum.textContent = '3';
        setSideActive('demos');
        showScreen(screenGames);
      }

      function enterGamesSection(opts) {
        const _gc = document.getElementById('greenChrome');
        if (_gc) { _gc.classList.remove('in', 'on'); _gc.style.visibility = 'hidden'; }
        opts = opts || {};
        const withAnim = !!opts.anim;
        if (!withAnim) {
          showDemosListQuiet();
          return;
        }
        if (busy) return;
        busy = true;
        mode = 'list';
        bgImg.src = 'assets/img/ui/bg_games.webp';
        hideDetail(true);
        hidePatches();
        hideVideos();
        layoutLines.classList.remove('show');
        pageNum.textContent = '3';
        showScreen(screenGames);
        setSideActive('demos');
        gamesList.classList.add('hidden');
        resetListAnim();

        const chrome = document.getElementById('blueChrome');
        const left = chrome && chrome.querySelector('.bc-left');
        const right = chrome && chrome.querySelector('.bc-right');
        // games_section_enter ×2.5: panel up + left line down + right line up
        sidePanel.classList.remove('no-anim', 'in');
        sidePanel.style.transition = 'none';
        sidePanel.style.transform = 'translateY(120%)';
        if (chrome) {
          chrome.classList.remove('in');
          chrome.classList.add('on');
          chrome.style.visibility = 'visible';
          if (left) { left.style.transition = 'none'; left.style.transform = 'translateY(-150%)'; }
          if (right) { right.style.transition = 'none'; right.style.transform = 'translateY(150%)'; }
        }
        void sidePanel.offsetWidth;
        requestAnimationFrame(() => {
          sidePanel.style.transition = 'transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)';
          sidePanel.style.transform = 'translateY(0)';
          sidePanel.classList.add('in');
          if (left) {
            left.style.transition = 'transform 0.4s ease-out';
            left.style.transform = 'translateY(0)';
          }
          if (right) {
            right.style.transition = 'transform 0.5s ease-out 0.12s';
            right.style.transform = 'translateY(0)';
          }
          if (chrome) chrome.classList.add('in');
          setTimeout(() => {
            gamesList.classList.remove('hidden');
            playListAppear();
            busy = false;
          }, 520);
        });
      }

      function setSideActive(which) {
        document.querySelectorAll('#sideMenu .sm-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#sideMenu .sm-main').forEach(el => {
          if (el.dataset.go === 'games') el.classList.add('active');
        });
        const sub = document.querySelector('#sideMenu .sm-sub .sm-item[data-id="' + which + '"]');
        if (sub) sub.classList.add('active');
      }

      function hidePatches() {
        const pv = document.getElementById('patchesView');
        if (!pv) return;
        pv.classList.remove('show');
        document.getElementById('patchesHeading').classList.remove('in');
        document.getElementById('patchDesc').textContent = '';
        document.getElementById('patchesCols').innerHTML = '';
      }

      function hideVideos() {
        const vv = document.getElementById('videosView');
        if (!vv) return;
        vv.classList.remove('show');
        document.getElementById('videosList').innerHTML = '';
        closeVideoModal();
      }

      function closeVideoModal() {
        const dim = document.getElementById('videoModalDim');
        const wrap = document.getElementById('videoFrameWrap');
        const frame = document.getElementById('videoFrame');
        if (dim) dim.classList.remove('show');
        if (wrap) wrap.classList.remove('show');
        if (frame) { frame.src = 'about:blank'; }
      }

      function openVideoModal(src) {
        const dim = document.getElementById('videoModalDim');
        const wrap = document.getElementById('videoFrameWrap');
        const frame = document.getElementById('videoFrame');
        frame.src = src;
        dim.classList.add('show');
        wrap.classList.add('show');
      }

      function showVideos() {
        if (busy) return;
        busy = true;
        mode = 'videos';
        hideDetail();
        hidePatches();
        gamesList.classList.add('hidden');
        layoutLines.classList.remove('show');
        pageNum.textContent = '21';
        setSideActive('video');
        const vv = document.getElementById('videosView');
        const list = document.getElementById('videosList');
        list.innerHTML = '';
        vv.classList.add('show');
        if (!sidePanel.classList.contains('in')) {
          sidePanel.style.transition = 'none';
          sidePanel.classList.add('in');
          void sidePanel.offsetWidth;
          sidePanel.style.transition = '';
        }
        VIDEOS.forEach((it, i) => {
          const el = document.createElement('div');
          el.className = 'vid ' + (i < 3 ? 'from-top' : 'from-bottom');
          el.innerHTML = '<span class="vid-title">' + it.title + '</span><div class="vid-info">' + (it.info || '') + '</div>';
          el.addEventListener('click', () => {
            if (it.vk) openVideoModal(it.vk);
          });
          list.appendChild(el);
        });
        requestAnimationFrame(() => {
          list.querySelectorAll('.vid').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), 40 + i * 50);
          });
          busy = false;
        });
      }

      function showPatches() {
        if (busy) return;
        busy = true;
        mode = 'patches';
        hideDetail();
        hideVideos();
        gamesList.classList.add('hidden');
        layoutLines.classList.remove('show');
        pageNum.textContent = '20';
        setSideActive('patches');
        const pv = document.getElementById('patchesView');
        const heading = document.getElementById('patchesHeading');
        const cols = document.getElementById('patchesCols');
        const pdesc = document.getElementById('patchDesc');
        pdesc.textContent = '';
        cols.innerHTML = '';
        heading.textContent = PATCHES.heading;
        heading.classList.remove('in');
        pv.classList.add('show');

        // ensure side panel visible without re-anim if already in
        if (!sidePanel.classList.contains('in')) {
          sidePanel.classList.add('in');
        }

        // title from bottom first
        requestAnimationFrame(() => {
          heading.classList.add('in');
          setTimeout(() => {
            // uneven columns like original: more on the left, left-align / right-align
            // order close to original screenshot
            const orderTitles = [
              'The Summoning','Fallout','Wetlands','Privateer 2: The Darkening',
              'Descent 2','Descent: Freespace','Descent: Freespace',
              'Shadows of the Empire','Star Wars: Rebellion','Dark Reign: The Future of War',
              'Heavy Gear','The Terminator: Rampage','Wing Commander: Prophecy',
              'Wing Commander IV: The Price of Freedom','Wing Commander IV: The Price of Freedom',
              // right col
              'The Terminator: Future Shock','The Terminator: Future Shock','SKYNET: No Limits',
              'F-15 Eagle','Unreal','M.A.X. 2','Stonekeep','Battlezone'
            ];
            const byTitle = {};
            PATCHES.items.forEach(it => {
              if (!byTitle[it.title]) byTitle[it.title] = [];
              byTitle[it.title].push(it);
            });
            const used = new Set();
            const ordered = [];
            orderTitles.forEach(title => {
              const arr = byTitle[title];
              if (arr && arr.length) {
                const it = arr.shift();
                ordered.push(it);
                used.add(it.n);
              }
            });
            // any leftovers
            PATCHES.items.forEach(it => { if (!used.has(it.n)) ordered.push(it); });
            const leftCount = 15;
            const left = ordered.slice(0, leftCount);
            const right = ordered.slice(leftCount);
            function addCol(items, cls) {
              const col = document.createElement('div');
              col.className = cls;
              items.forEach(it => {
                const el = document.createElement('div');
                el.className = 'patch';
                el.textContent = it.title;
                el.dataset.n = it.n;
                const dirs = [
                  'translateX(-120%)', 'translateX(120%)',
                  'translateY(-120%)', 'translateY(120%)',
                  'translate(-100%,-100%)', 'translate(100%,-100%)',
                  'translate(-100%,100%)', 'translate(100%,100%)'
                ];
                el.style.transform = dirs[Math.floor(Math.random() * dirs.length)];
                el.addEventListener('mouseenter', () => {
                  pdesc.textContent = it.description.replace(/\n/g, ' ');
                });
                el.addEventListener('mouseleave', () => { pdesc.textContent = ''; });
                el.addEventListener('click', showModal);
                col.appendChild(el);
              });
              cols.appendChild(col);
            }
            addCol(left, 'col-left');
            addCol(right, 'col-right');
            // appear together with staggered random
            const nodes = [...cols.querySelectorAll('.patch')];
            nodes.forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), 30 + Math.random() * 280);
            });
            busy = false;
          }, 450);
        });
      }

      
      function showWinamp() {
        const _gc = document.getElementById('greenChrome');
        if (_gc) {
          _gc.style.visibility = 'visible';
          _gc.classList.add('on', 'in');
          _gc.querySelectorAll('.gc-left,.gc-right').forEach(el => {
            el.style.transition = 'none'; el.style.transform = 'none';
          });
        }

        mode = 'winamp';
        document.getElementById('hardView').classList.remove('show');
        document.getElementById('utilsView').classList.remove('show');
        const wv = document.getElementById('winampView');
        wv.classList.remove('lines-in');
        wv.querySelectorAll('.wa-img,.wa-btn,.wa-red,.wa-red-sub,.wa-note,.wa-scroll-wrap').forEach(el => {
          el.classList.remove('anim-top','anim-bottom','anim-left','anim-right','anim-done');
          el.style.animation = 'none';
          el.style.transform = '';
          el.style.opacity = '0';
          el.style.transition = 'none';
        });
        document.getElementById('waNote').textContent = WINAMP.note || 'ДЛЯ ВНИМАТЕЛЬНОГО ПРОЧТЕНИЯ :';
        document.getElementById('waText').innerHTML = "<b>WinAMP</b> - самая популярная программа для проигрывания файлов в формате <b>MP3</b> разработана фирмой Nullsoft Inc. <b>MP3</b> - это прогрессивный формат сжатия звука, который позволяет сохранять музыку с качеством CD при небольших размерах файла. Например, на один компакт диск может поместиться порядка 200 песен в формате <b>MP3</b>. Кроме простоты и удобства <b>WinAMP</b>, росту его популярности служит то, что любой желающий может создать внешнюю панель, так называемый скин (skin), для проигрывателя по собственному вкусу. И многие их создают для себя, а затем дарят всем желающим. Кроме того существует большое число плагинов для <b>WinAMP</b>, который добавляют в программу различные звуковые и видеоэффекты. Мы предлагаем вашему вниманию подборку скинов и плагинов для <b>WinAMP</b>, а также программу для создания собственных файлов в формате <b>MP3</b>.<br>Но помните: <b>нарушение авторских прав уголовно наказуемо!</b><br>Для просмотра коллекции вам необходимо иметь броузер Интернет, так как подборка создана в виде HTML-файла (если на вашем компьютере установлен Windows 95, то он у вас уже есть). Кроме того, вам будет необходим установленный <b>WinZip</b>, если его еще нет, то загляните в раздел с программами. Там же вы найдете последние версии популярных броузеров. Каждый скин необходимо распаковывать в собственную директорию в папку <b>winamp/skins</b>. Будьте ВНИМАТЕЛЬНЫ! Многие архивы содержат путь для распаковки. Плагины надо сваливать в общую кучу в директории <b>winamp/plugins</b>. Подключение скинов и плагинов осуществляется через меню или нажатием клавиш <b>Alt+S</b> (для скинов) и <b>Ctrl+K</b> (для плагинов - там надо будет еще выбрать нужный плагин и нажать <b>Start</b>)";
        document.getElementById('hardPageNum').textContent = '24';
        document.querySelectorAll('#sideMenuHard .sm-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#sideMenuHard .sm-main').forEach(el => {
          if (el.dataset.go === 'hard') el.classList.add('active');
        });
        const sub = document.querySelector('#sideMenuHard [data-id="winamp"]');
        if (sub) sub.classList.add('active');
        wv.classList.add('show');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            wv.classList.add('lines-in');
            setTimeout(() => animateWinamp(), 30);
          });
        });
      }

      function showUtils() {
        const _gc = document.getElementById('greenChrome');
        if (_gc) {
          _gc.style.visibility = 'visible';
          _gc.classList.add('on', 'in');
          _gc.querySelectorAll('.gc-left,.gc-right').forEach(el => {
            el.style.transition = 'none'; el.style.transform = 'none';
          });
        }
        mode = 'utils';
        document.getElementById('hardView').classList.remove('show');
        document.getElementById('winampView').classList.remove('show', 'lines-in');
        const uv = document.getElementById('utilsView');
        uv.classList.remove('lines-in');
        uv.innerHTML = '';
        // hard_subpage_A line tops % (y-1)/480
        const lineYs = [13.75, 27.71, 41.67, 62.29, 76.04];
        // item tops: sit above their group line
        const itemLayout = [
          // items under lines; spacing for hover desc
          { tops: [15.0, 21.5], line: 0 },
          { tops: [29.2, 35.5], line: 1 },
          { tops: [43.2, 49.0, 54.8], line: 2 },
          { tops: [64.0, 70.0], line: 3 },
          { tops: [78.0, 83.5], line: 4 }
        ];
        // Wait - items relative to UTILS groups
        UTILS.forEach((g, gi) => {
          const layout = itemLayout[gi];
          const lineY = lineYs[layout.line];
          const line = document.createElement('div');
          line.className = 'ug-line';
          line.style.top = lineY + '%';
          line.style.transitionDelay = (0.05 + gi * 0.06) + 's';
          uv.appendChild(line);
          const lab = document.createElement('div');
          lab.className = 'ug-label';
          lab.textContent = g.name;
          lab.style.top = lineY + '%'; // under line via CSS margin-top
          lab.style.transitionDelay = (0.1 + gi * 0.06) + 's';
          uv.appendChild(lab);
          g.items.forEach((it, ii) => {
            const el = document.createElement('div');
            el.className = 'ug-item';
            el.style.top = layout.tops[ii] + '%';
            let d = (it.description || '');
            if (d.toLowerCase().startsWith(it.title.toLowerCase())) {
              d = d.slice(it.title.length).replace(/^\s*[–—-]\s*/, '').trim();
            }
            el.innerHTML = '<span class="ug-title">' + it.title + '</span>' +
              '<span class="ug-desc">' + (d ? '— ' + d : '') + '</span>';
            el.addEventListener('click', showModal);
            uv.appendChild(el);
          });
        });
        uv.classList.add('show');
        document.getElementById('hardPageNum').textContent = '23';
        document.querySelectorAll('#sideMenuHard .sm-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#sideMenuHard .sm-main').forEach(el => {
          if (el.dataset.go === 'hard') el.classList.add('active');
        });
        const sub = document.querySelector('#sideMenuHard [data-id="softall"]');
        if (sub) sub.classList.add('active');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            uv.classList.add('lines-in');
            animateUtils();
          });
        });
      }

      
      function showInternet() {
        const _gc = document.getElementById('greenChrome');
        if (_gc) {
          _gc.style.visibility = 'visible';
          _gc.classList.add('on', 'in');
          _gc.querySelectorAll('.gc-left,.gc-right').forEach(el => {
            el.style.transition = 'none'; el.style.transform = 'none';
          });
        }

        mode = 'hard';
        document.getElementById('utilsView').classList.remove('show');
        document.getElementById('winampView').classList.remove('show', 'lines-in');
        document.getElementById('hardView').classList.add('show');
        document.getElementById('hardPageNum').textContent = '22';
        document.querySelectorAll('#sideMenuHard .sm-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('#sideMenuHard .sm-main').forEach(el => {
          if (el.dataset.go === 'hard') el.classList.add('active');
        });
        const sub = document.querySelector('#sideMenuHard [data-id="internet"]');
        if (sub) sub.classList.add('active');
      }

      function enterSuperSection(opts) {
        const _bc = document.getElementById('blueChrome');
        if (_bc) { _bc.classList.remove('in', 'on'); _bc.style.visibility = 'hidden'; }
        const _gc = document.getElementById('greenChrome');
        if (_gc) { _gc.classList.remove('in', 'on'); _gc.style.visibility = 'hidden'; }
        opts = opts || {};
        if (busy) return;
        busy = true;
        mode = 'super';
        hideDetail(true);
        hidePatches();
        hideVideos();
        bgImg.src = 'assets/img/ui/bg_super.webp';
        const sv = document.getElementById('superView');
        // hide ALL content before first paint of this screen
        sv.classList.remove('lines-in');
        sv.querySelectorAll('.su-game-title,.su-shot,.su-text-wrap,.su-btn').forEach(el => {
          el.classList.remove('anim-top','anim-bottom','anim-left','anim-right','anim-done');
          el.style.animation = 'none';
          el.style.transform = '';
          el.style.opacity = '0';
        });
        document.getElementById('suText').innerHTML = SUPER.html;
        showScreen(document.getElementById('screenSuper'));
        const panel = document.getElementById('sidePanelSuper');
        panel.style.left = '0'; panel.style.width = '19.06%';
        panel.style.top = '27.2%'; panel.style.height = '28%';
        const chrome = document.getElementById('magentaChrome');
        if (opts.anim !== false) {
          panel.classList.remove('in');
          panel.style.transition = '';
          panel.style.transform = '';
          if (chrome) {
            chrome.classList.remove('in', 'on');
            chrome.style.visibility = 'hidden';
            chrome.querySelectorAll('.mc-left,.mc-right').forEach(el => {
              el.style.transition = ''; el.style.transform = '';
            });
          }
          void panel.offsetWidth;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              panel.classList.add('in');
              if (chrome) {
                chrome.classList.add('on');
                chrome.style.visibility = 'visible';
                void chrome.offsetWidth;
                chrome.classList.add('in');
              }
              setTimeout(() => {
                sv.classList.add('lines-in');
                requestAnimationFrame(() => animateSuper());
                busy = false;
              }, 450);
            });
          });
        } else {
          panel.classList.add('in');
          if (chrome) {
            chrome.classList.add('on', 'in');
            chrome.style.visibility = 'visible';
          }
          sv.classList.add('lines-in');
          requestAnimationFrame(() => animateSuper());
          busy = false;
        }
      }

      
      function enterHardSection(opts) {
        const _bc = document.getElementById('blueChrome');
        if (_bc) { _bc.classList.remove('in', 'on'); _bc.style.visibility = 'hidden'; }
        opts = opts || {};
        const withAnim = opts.anim !== false;
        const target = opts.target || 'internet'; // internet | softall | winamp
        if (busy) return;
        busy = true;
        mode = target === 'winamp' ? 'winamp' : target === 'softall' ? 'utils' : 'hard';
        bgImg.src = 'assets/img/ui/bg_soft.webp';
        hideDetail(true);
        hidePatches();
        hideVideos();
        showScreen(document.getElementById('screenHard'));
        const panel = document.getElementById('sidePanelHard');
        panel.style.left = '0';
        panel.style.width = '19.06%';
        panel.style.top = '27.2%';
        panel.style.height = '38%';

        // hide all subviews first
        document.getElementById('hardView').classList.remove('show');
        document.getElementById('utilsView').classList.remove('show', 'lines-in');
        const wv = document.getElementById('winampView');
        if (wv) wv.classList.remove('show', 'lines-in');

        // fill internet items if needed
        const hb = document.getElementById('hardBrowsers');
        const hu = document.getElementById('hardUtils');
        if (hb && !hb.children.length) {
          INTERNET.browsers.forEach(it => {
            const el = document.createElement('div');
            el.className = 'h-item';
            el.innerHTML = '<span class="h-name">' + it.title + '</span>';
            el.addEventListener('click', showModal);
            hb.appendChild(el);
          });
          INTERNET.utils.forEach(it => {
            const el = document.createElement('div');
            el.className = 'h-item';
            const desc = (it.description || '').replace(it.title, '').replace(/^\s*[–—-]\s*/, '').trim();
            el.innerHTML = '<span class="h-name">' + it.title.trim() + '</span>' + (desc ? '<span class="h-desc">— ' + desc + '</span>' : '');
            el.addEventListener('click', showModal);
            hu.appendChild(el);
          });
        }

        const chrome = document.getElementById('greenChrome');
        const afterPanel = () => {
          if (target === 'softall') showUtils();
          else if (target === 'winamp') showWinamp();
          else {
            document.getElementById('hardView').classList.add('show');
            document.getElementById('hardPageNum').textContent = '22';
            requestAnimationFrame(() => animateHardInternet());
            document.querySelectorAll('#sideMenuHard .sm-item').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('#sideMenuHard .sm-main').forEach(el => {
              if (el.dataset.go === 'hard') el.classList.add('active');
            });
            const sub = document.querySelector('#sideMenuHard [data-id="internet"]');
            if (sub) sub.classList.add('active');
          }
          busy = false;
        };

        if (withAnim) {
          panel.classList.remove('in');
          panel.style.transition = '';
          panel.style.transform = '';
          if (chrome) {
            chrome.classList.remove('in', 'on');
            chrome.style.visibility = 'hidden';
            chrome.querySelectorAll('.gc-left,.gc-right').forEach(el => {
              el.style.transition = ''; el.style.transform = '';
            });
          }
          void panel.offsetWidth;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              panel.classList.add('in');
              if (chrome) {
                chrome.classList.add('on');
                chrome.style.visibility = 'visible';
                void chrome.offsetWidth;
                chrome.classList.add('in');
              }
              setTimeout(afterPanel, 480);
            });
          });
        } else {
          panel.classList.add('in');
          if (chrome) {
            chrome.classList.add('on', 'in');
            chrome.style.visibility = 'visible';
          }
          afterPanel();
        }
      }

      function backToContents() {
        const bc = document.getElementById('blueChrome');
        if (bc) { bc.classList.remove('in', 'on'); bc.style.visibility = 'hidden'; }

        if (busy) return;
        bgImg.src = 'assets/img/ui/bg.webp';
        /* animateMain after screen shown */
        hideDetail();
        hidePatches();
        hideVideos();
        closeVideoModal();
        sidePanel.classList.remove('in');
        const ph = document.getElementById('sidePanelHard');
        if (ph) ph.classList.remove('in');
        const gc = document.getElementById('greenChrome');
        if (gc) gc.classList.remove('on');
        resetListAnim();
        gamesList.classList.remove('hidden');
        showScreen(screenMain);
        requestAnimationFrame(() => animateMain());
        mode = 'list';
      }

      
      function animateHardInternet() {
        const titles = document.querySelectorAll('#hardView .h-section-title');
        const items = document.querySelectorAll('#hardView .h-item');
        titles.forEach((el, i) => {
          el.classList.remove('anim-top', 'anim-bottom');
          void el.offsetWidth;
          el.classList.add(i === 0 ? 'anim-top' : 'anim-bottom');
        });
        items.forEach((el, i) => {
          el.classList.remove('anim-right');
          void el.offsetWidth;
          el.style.animationDelay = (0.15 + i * 0.04) + 's';
          el.classList.add('anim-right');
        });
      }
      function animateUtils() {
        const uv = document.getElementById('utilsView');
        uv.querySelectorAll('.ug-item').forEach((el, i) => {
          el.classList.remove('anim-bottom');
          void el.offsetWidth;
          el.style.animationDelay = (0.1 + i * 0.04) + 's';
          el.classList.add('anim-bottom');
        });
        uv.querySelectorAll('.ug-label').forEach((el, i) => {
          el.classList.remove('anim-right');
          void el.offsetWidth;
          el.style.animationDelay = (0.15 + i * 0.05) + 's';
          el.classList.add('anim-right');
        });
      }
      function animateWinamp() {
        const wv = document.getElementById('winampView');
        if (!wv) return;
        // disable CSS opacity transition on img to avoid double-anim jerk
        const img = wv.querySelector('.wa-img');
        if (img) { img.style.transition = 'none'; }
        const steps = [
          ['.wa-img', 'anim-top', 0],
          ['.wa-note', 'anim-top', 0.05],
          ['.wa-red', 'anim-left', 0.1],
          ['.wa-btn', 'anim-bottom', 0.12],
          ['.wa-red-sub', 'anim-bottom', 0.18],
          ['.wa-scroll-wrap', 'anim-right', 0.1],
          ['.wa-text', 'anim-right', 0.12]
        ];
        steps.forEach(([sel, cls, delay]) => {
          wv.querySelectorAll(sel).forEach((el, i) => {
            el.classList.remove('anim-top','anim-bottom','anim-left','anim-right');
            el.style.animation = 'none';
            el.style.transform = '';
            void el.offsetWidth;
            el.style.animation = '';
            el.style.animationDelay = (delay + i * 0.05) + 's';
            el.classList.add(cls);
            el.addEventListener('animationend', function onEnd() {
              el.classList.remove(cls);
              el.style.animation = 'none';
              el.style.transform = '';
              el.style.opacity = '1';
              el.removeEventListener('animationend', onEnd);
            }, { once: true });
          });
        });
      }
      function animateSuper() {
        const sv = document.getElementById('superView');
        if (!sv) return;
        const sels = ['.su-game-title', '.su-shot', '.su-text-wrap', '.su-btn'];
        // hard reset — nothing visible until anim
        sels.forEach(sel => {
          sv.querySelectorAll(sel).forEach(el => {
            el.classList.remove('anim-top','anim-bottom','anim-left','anim-right','anim-done');
            el.style.animation = 'none';
            el.style.transform = '';
            el.style.opacity = '0';
          });
        });
        void sv.offsetWidth;
        const map = [
          ['.su-game-title', 'anim-left', 0],
          ['.su-shot', 'anim-top', 0.05],
          ['.su-text-wrap', 'anim-bottom', 0.08],
          ['.su-btn', 'anim-right', 0.12]
        ];
        map.forEach(([sel, cls, delay]) => {
          sv.querySelectorAll(sel).forEach((el, i) => {
            el.style.animation = '';
            el.style.opacity = '';
            el.style.animationDelay = (delay + i * 0.06) + 's';
            el.classList.add(cls);
            el.addEventListener('animationend', function onEnd() {
              el.classList.remove(cls);
              el.classList.add('anim-done');
              el.style.animation = 'none';
              el.style.transform = '';
              el.style.opacity = '1';
              el.removeEventListener('animationend', onEnd);
            }, { once: true });
          });
        });
      }
      function animateMain() {
        const sm = document.getElementById('screenMain');
        if (!sm) return;
        // reset: fully hidden, no leftover transforms
        sm.querySelectorAll('.section .head, .section .item').forEach(el => {
          el.classList.remove('anim-left', 'anim-right', 'main-shown');
          el.style.animation = 'none';
          el.style.transform = '';
          el.style.opacity = '0';
        });
        void sm.offsetWidth;
        sm.querySelectorAll('.section .head').forEach((el, i) => {
          el.style.animation = '';
          el.style.opacity = '';
          el.style.animationDelay = (0.05 + i * 0.08) + 's';
          el.classList.add('anim-left');
          el.addEventListener('animationend', function onEnd() {
            el.classList.remove('anim-left');
            el.classList.add('main-shown');
            el.style.animation = 'none';
            el.style.transform = '';
            el.style.opacity = '1';
            el.removeEventListener('animationend', onEnd);
          }, { once: true });
        });
        setTimeout(() => {
          sm.querySelectorAll('.section .item').forEach((el, i) => {
            el.style.animation = '';
            el.style.opacity = '';
            el.style.animationDelay = (i * 0.05) + 's';
            el.classList.add('anim-right');
            el.addEventListener('animationend', function onEnd() {
              el.classList.remove('anim-right');
              el.classList.add('main-shown');
              el.style.animation = 'none';
              el.style.transform = '';
              el.style.opacity = '1';
              el.removeEventListener('animationend', onEnd);
            }, { once: true });
          });
        }, 400);
      }

      function hideDetail(instant) {
        if (instant) detail.classList.add('instant');
        detail.classList.remove('in', 'active');
        layoutLines.classList.remove('show');
        if (instant) {
          void detail.offsetWidth;
          detail.classList.remove('instant');
        }
        document.getElementById('dTitle').textContent = '';
        document.getElementById('dDesc').textContent = '';
        document.getElementById('dInfo').textContent = '';
        document.getElementById('dShot').removeAttribute('src');
      }

      
      function formatInfo(raw) {
        return raw.split('\n').map(line => {
          line = line.trim();
          if (!line) return '';
          const m = line.match(/^(Разработчик|Издатель|Жанр|Системные требования|Необходим DirectX)(:?)\s*(.*)$/i);
          if (m) {
            const label = m[1] + (m[2] || ':');
            const rest = m[3] || '';
            return '<b>' + label + '</b> ' + rest;
          }
          // lines that continue sysreq without label
          return line;
        }).filter(Boolean).join('<br>');
      }

      function openDetail(idx) {
        if (busy) return;
        busy = true;
        curIdx = idx;
        const g = GAMES[idx];
        mode = 'detail';
        hidePatches();
        hideVideos();
        gamesList.classList.add('hidden');

        // fill content (off-screen)
        detail.classList.remove('in');
        document.getElementById('dTitle').textContent = g.title;
        document.getElementById('dDesc').textContent = g.description.replace(/\s+/g, ' ').trim();
        document.getElementById('dInfo').innerHTML = formatInfo(g.info);
        document.getElementById('dShot').src = 'assets/img/content/scr_' + g.n + '.webp';
        pageNum.textContent = String(g.page);
        detail.classList.add('active');

        // restore detail visibility if was force-hidden
        detail.style.display = '';
        detail.style.transition = '';
        detail.querySelectorAll('.d-title,.d-desc,.d-info,.d-shot,.d-install').forEach(el => {
          el.style.transition = '';
        });
        // games_page_switch: blue lines
        layoutLines.style.visibility = '';
        layoutLines.querySelectorAll('.hline, .vline').forEach(el => {
          el.style.transition = '';
          el.style.transform = '';
        });
        layoutLines.classList.remove('show');
        void layoutLines.offsetWidth;
        layoutLines.classList.add('show');

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            detail.classList.add('in');
            setTimeout(() => { busy = false; }, 550);
          });
        });
      }

      function showModal() {
        const border = (mode === 'super') ? '#e000a0' : (mode === 'hard' || mode === 'utils' || mode === 'winamp') ? '#22b14c' : (mode === 'list' || mode === 'detail' || mode === 'patches' || mode === 'videos') ? '#319cff' : '#888';
        modalMsg.style.borderColor = border;
        modalDim.classList.add('show');
        modalMsg.classList.add('show');
        clearTimeout(modalTimer);
        modalTimer = setTimeout(hideModal, 1000);
      }
      function hideModal() {
        modalDim.classList.remove('show');
        modalMsg.classList.remove('show');
        clearTimeout(modalTimer);
      }
      modalDim.addEventListener('click', hideModal);
      modalMsg.addEventListener('click', hideModal);
      document.getElementById('dInstall').addEventListener('click', showModal);

      // nav
      document.getElementById('btnNextGames').addEventListener('click', () => {
        if (busy) return;
        // page order: list(3) → demos 4..19 → patches(20) → videos(21)
        if (mode === 'list') {
          openDetail(0);
        } else if (mode === 'detail') {
          if (curIdx < GAMES.length - 1) openDetail(curIdx + 1);
          else showPatches();
        } else if (mode === 'patches') {
          showVideos();
        } else if (mode === 'videos') {
          enterHardSection({ anim: true });
        }
      });
      document.getElementById('btnPrevGames').addEventListener('click', () => {
        if (busy) return;
        if (mode === 'videos') {
          showPatches();
        } else if (mode === 'patches') {
          openDetail(GAMES.length - 1);
        } else if (mode === 'detail') {
          if (curIdx > 0) openDetail(curIdx - 1);
          else showDemosListQuiet();
        } else if (mode === 'list') {
          backToContents();
        }
      });

      // side menu
      document.querySelectorAll('[data-go="contents"]').forEach(el => {
        el.addEventListener('click', backToContents);
      });
      // demos: from main with anim; within section without side re-anim
      document.querySelectorAll('#sideMenu [data-id="demos"]').forEach(el => {
        el.addEventListener('click', showDemosListQuiet);
      });
      document.querySelectorAll('#sideMenu [data-id="patches"]').forEach(el => {
        el.addEventListener('click', showPatches);
      });
      document.querySelectorAll('#sideMenu [data-id="video"]').forEach(el => {
        el.addEventListener('click', showVideos);
      });
      document.querySelectorAll('#sideMenu [data-go="hard"], #sideMenuHard [data-go="hard"]').forEach(el => {
        el.addEventListener('click', () => enterHardSection({ anim: true }));
      });
      document.querySelectorAll('[data-go="super"]').forEach(el => {
        el.addEventListener('click', () => enterSuperSection({ anim: true }));
      });
      document.querySelectorAll('#sideMenuSuper [data-go="contents"]').forEach(el => {
        el.addEventListener('click', backToContents);
      });
      document.querySelectorAll('#sideMenuSuper [data-go="games"]').forEach(el => {
        el.addEventListener('click', () => enterGamesSection({ anim: true }));
      });
      document.querySelectorAll('#sideMenuSuper [data-go="hard"]').forEach(el => {
        el.addEventListener('click', () => enterHardSection({ anim: true }));
      });
      document.querySelectorAll('#superView .su-btn').forEach(el => {
        el.addEventListener('click', showModal);
      });
      const suText = document.getElementById('suText');
      if (suText) {
        document.getElementById('suUp').addEventListener('click', () => { suText.scrollTop -= 40; });
        document.getElementById('suDn').addEventListener('click', () => { suText.scrollTop += 40; });
        suText.addEventListener('scroll', () => {
          const th = document.getElementById('suThumb');
          const track = th.parentElement;
          const max = suText.scrollHeight - suText.clientHeight;
          const ratio = max > 0 ? suText.scrollTop / max : 0;
          th.style.top = (ratio * (track.clientHeight - th.offsetHeight)) + 'px';
        });
      }
      document.getElementById('btnPrevSuper').addEventListener('click', () => {
        enterHardSection({ anim: true, target: 'winamp' });
      });
      document.querySelectorAll('#sideMenuHard [data-go="contents"]').forEach(el => {
        el.addEventListener('click', backToContents);
      });
      document.querySelectorAll('#sideMenuHard [data-go="games"]').forEach(el => {
        el.addEventListener('click', () => enterGamesSection({ anim: true }));
      });
      document.querySelectorAll('#sideMenuHard [data-id="softall"]').forEach(el => {
        el.addEventListener('click', showUtils);
      });
      document.querySelectorAll('#sideMenuHard [data-id="internet"]').forEach(el => {
        el.addEventListener('click', showInternet);
      });
      document.querySelectorAll('#sideMenuHard [data-id="winamp"]').forEach(el => {
        el.addEventListener('click', showWinamp);
      });
      document.querySelectorAll('#winampView .wa-btn, #winampView .wa-red-sub').forEach(el => {
        el.addEventListener('click', showModal);
      });
      // winamp scrollbar arrows
      const waText = document.getElementById('waText');
      document.getElementById('waUp').addEventListener('click', () => { waText.scrollTop -= 40; });
      document.getElementById('waDn').addEventListener('click', () => { waText.scrollTop += 40; });
      waText.addEventListener('scroll', () => {
        const th = document.getElementById('waThumb');
        const track = th.parentElement;
        const max = waText.scrollHeight - waText.clientHeight;
        const ratio = max > 0 ? waText.scrollTop / max : 0;
        const range = track.clientHeight - th.offsetHeight;
        th.style.top = (ratio * range) + 'px';
      });
      document.getElementById('btnPrevHard').addEventListener('click', () => {
        if (busy) return;
        // 24→23→22→21
        if (mode === 'winamp') showUtils();
        else if (mode === 'utils') showInternet();
        else if (mode === 'hard') {
          // 22 → 21 videos (blue section, no full enter anim)
          bgImg.src = 'assets/img/ui/bg_games.webp';
          const _gc = document.getElementById('greenChrome');
          if (_gc) { _gc.classList.remove('in', 'on'); _gc.style.visibility = 'hidden'; }
          showScreen(screenGames);
          sidePanel.classList.add('no-anim', 'in');
          sidePanel.style.transition = 'none';
          sidePanel.style.transform = 'translateY(0)';
          const bc = document.getElementById('blueChrome');
          if (bc) { bc.style.visibility = 'visible'; bc.classList.add('on', 'in'); }
          showVideos();
        }
        else enterGamesSection({ anim: true });
      });
      document.getElementById('btnNextHard').addEventListener('click', () => {
        if (busy) return;
        if (mode === 'hard') showUtils();
        else if (mode === 'utils') showWinamp();
        else if (mode === 'winamp') enterSuperSection({ anim: true });
      });
      screenMain.querySelectorAll('[data-id="soft"]').forEach(el => {
        el.addEventListener('click', () => enterHardSection({ anim: true, target: 'softall' }));
      });
      screenMain.querySelectorAll('[data-id="winamp"]').forEach(el => {
        el.addEventListener('click', () => enterHardSection({ anim: true, target: 'winamp' }));
      });
      screenMain.querySelectorAll('[data-id="super"], [data-id="battlecruiser"]').forEach(el => {
        el.addEventListener('click', () => enterSuperSection({ anim: true }));
      });
      document.getElementById('btnNextMain').addEventListener('click', () => enterGamesSection({ anim: true }));
      document.getElementById('videoModalDim').addEventListener('click', closeVideoModal);
      // click outside iframe closes (dim handles it); stop propagation on wrap
      document.getElementById('videoFrameWrap').addEventListener('click', e => e.stopPropagation());
      screenMain.querySelectorAll('[data-id="demos"]').forEach(el => {
        el.addEventListener('click', () => enterGamesSection({ anim: true }));
      });
      screenMain.querySelectorAll('[data-id="patches"]').forEach(el => {
        el.addEventListener('click', () => {
          enterGamesSection({ anim: true });
          setTimeout(showPatches, 600);
        });
      });
      screenMain.querySelectorAll('[data-id="video"]').forEach(el => {
        el.addEventListener('click', () => {
          enterGamesSection({ anim: true });
          setTimeout(showVideos, 600);
        });
      });
      screenMain.querySelectorAll('[data-id="internet"]').forEach(el => {
        el.addEventListener('click', () => enterHardSection({ anim: true }));
      });


      // ===== INTRO (intro_to_contents exact frames) =====
      const INTRO_FRAMES = {"seg0":[[[1,79,195,496,75,36]],[[1,79,195,496,75,36]],[[0,80,195,496,75,0],[1,79,195,496,75,36]],[[0,85,172,496,75,0],[1,79,195,496,75,36]],[[0,90,150,496,75,0],[1,79,195,496,75,36]],[[0,95,127,496,75,0],[1,79,195,496,75,36]],[[0,100,105,496,75,0],[1,79,195,496,75,36]],[[0,105,82,496,75,0],[1,79,195,496,75,36]],[[0,110,60,496,75,0],[2,70,667,80,360,0],[1,79,195,496,75,36]],[[0,115,37,496,75,0],[2,70,607,80,360,0],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,547,80,360,0],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,487,80,360,0],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,427,80,360,0],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,367,80,360,0],[8,-140,67,314,140,39],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,307,80,360,0],[8,-93,67,314,140,39],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,-47,67,314,140,39],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,0,67,314,140,39],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,47,67,314,140,39],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,93,67,314,140,39],[1,79,195,496,75,36]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[1,79,195,496,75,36]]],"pixel":{"ms":500,"steps":12,"cell":12.8,"seed":1},"seg2":[[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,-267,395,504,2,36],[7,903,95,504,2,36],[7,121,-166,2,301,0],[7,624,644,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,-139,395,504,2,36],[7,797,95,504,2,36],[7,121,-84,2,301,0],[7,624,564,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,-11,395,504,2,36],[7,691,95,504,2,36],[7,121,-2,2,301,0],[7,624,484,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,117,395,504,2,36],[7,585,95,504,2,36],[7,121,80,2,301,0],[7,624,404,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,245,395,504,2,36],[7,479,95,504,2,36],[7,121,162,2,301,0],[7,624,324,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,373,395,504,2,36],[7,373,95,504,2,36],[7,121,244,2,301,0],[7,624,244,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,373,395,504,2,36],[7,373,95,504,2,36],[7,121,244,2,301,0],[7,624,244,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,373,395,504,2,36],[7,373,95,504,2,36],[7,121,244,2,301,0],[7,624,244,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,373,395,504,2,36],[7,373,95,504,2,36],[7,121,244,2,301,0],[7,624,244,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0],[7,373,395,504,2,36],[7,373,95,504,2,36],[7,121,244,2,301,0],[7,624,244,2,301,0]],[[0,120,15,496,75,0],[2,70,247,80,360,0],[8,140,67,314,140,39],[3,65,9,130,20,0],[3,15,24,30,50,0],[3,15,460,30,42,39],[3,60,474,80,29,39],[3,95,470,70,41,39],[7,134,455,310,1,39],[3,637,243,5,495,0]]]};
      // type: 0=gray wordmark, 1=black wordmark, 2=gray bar, 3=red chrome, 7=black line, 8=target
      // coords: [type, cx, cy, w, h, ink] in 640×480; CSS % = (c - s/2)/dim

      // Placement matches igro-anim.js player:
      // wordmark(0/1): translate(x-120, y-15) on SVG viewBox 120,15 → img at (x,y) size (w,h)
      // target(8): left=x-188, top=y-70
      // rects(2/3/7): left=x-w/2, top=y-h/2
      function introSpriteBox(sp) {
        const type = sp[0], x = sp[1], y = sp[2], w = sp[3], h = sp[4];
        let left, top, width, height;
        if (type === 0 || type === 1) {
          left = x; top = y; width = w; height = h;
        } else if (type === 8) {
          left = x - 188; top = y - 70; width = 314; height = 140;
        } else {
          const hw = Math.floor(w / 2), hh = Math.floor(h / 2);
          left = x - hw; top = y - hh; width = w; height = h;
        }
        return {
          left: (left / 640) * 100,
          top: (top / 480) * 100,
          width: (width / 640) * 100,
          height: (height / 480) * 100
        };
      }

      function renderIntroFrame(frame) {
        const canvas = document.getElementById('introCanvas');
        canvas.innerHTML = '';
        frame.forEach(sp => {
          const type = sp[0];
          const box = introSpriteBox(sp);
          const el = document.createElement(type === 0 || type === 1 || type === 8 ? 'img' : 'div');
          el.className = 'sp';
          el.style.left = box.left + '%';
          el.style.top = box.top + '%';
          el.style.width = box.width + '%';
          el.style.height = box.height + '%';
          if (type === 0) {
            el.classList.add('sp-wordmark');
            el.src = 'assets/img/ui/wordmark.svg';
            el.alt = '';
          } else if (type === 1) {
            el.classList.add('sp-wordmark', 'black');
            el.src = 'assets/img/ui/wordmark.svg';
            el.alt = '';
          } else if (type === 2) {
            el.classList.add('sp-bar');
          } else if (type === 3) {
            el.classList.add('sp-red');
          } else if (type === 7) {
            el.classList.add('sp-line');
          } else if (type === 8) {
            el.classList.add('sp-target');
            el.src = 'assets/img/ui/target.svg';
            el.alt = '';
          } else {
            return;
          }
          canvas.appendChild(el);
        });
      }

      function playIntroFrames(frames, fps, skipFirst) {
        return new Promise(resolve => {
          const list = skipFirst ? frames.slice(1) : frames.slice();
          if (!list.length) { resolve(); return; }
          let i = 0;
          renderIntroFrame(list[0]);
          if (list.length === 1) {
            // hold one frame duration then done
            setTimeout(resolve, 1000 / fps);
            return;
          }
          const iv = setInterval(() => {
            i++;
            if (i >= list.length) {
              clearInterval(iv);
              // hold last frame one tick so next phase doesn't overlap
              setTimeout(resolve, 1000 / fps);
              return;
            }
            renderIntroFrame(list[i]);
          }, 1000 / fps);
        });
      }


      
      function playLicensePixel() {
        return new Promise(resolve => {
          const ui = document.getElementById('licenseUi');
          const cell = 12.8;
          const steps = 12;
          const ms = 500;
          const seed = 1;

          // SVG clipPath — start EMPTY so nothing is visible
          let svgClip = document.getElementById('licenseClipSvg');
          if (!svgClip) {
            svgClip = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgClip.id = 'licenseClipSvg';
            svgClip.setAttribute('width', '0');
            svgClip.setAttribute('height', '0');
            svgClip.style.position = 'absolute';
            svgClip.innerHTML = '<defs><clipPath id="licenseClip" clipPathUnits="objectBoundingBox"></clipPath></defs>';
            document.body.appendChild(svgClip);
          }
          const cp = svgClip.querySelector('#licenseClip');
          cp.innerHTML = ''; // empty = nothing visible

          // Apply empty clip FIRST, then show UI (still clipped to nothing)
          ui.style.clipPath = 'url(#licenseClip)';
          ui.style.webkitClipPath = 'url(#licenseClip)';
          ui.classList.add('show');
          ui.style.visibility = 'visible';
          ui.style.opacity = '1';

          const regions = [
            [120, 55, 450, 32],
            [121, 95, 503, 300],
            [130, 405, 400, 22],
            [200, 428, 90, 30],
            [380, 428, 90, 30],
            [34, 438, 40, 30],
            [520, 438, 100, 30]
          ];
          const cells = [];
          regions.forEach(r => {
            const c0 = Math.floor(r[0] / cell);
            const c1 = Math.floor((r[0] + r[2] - 0.01) / cell);
            const r0 = Math.floor(r[1] / cell);
            const r1 = Math.floor((r[1] + r[3] - 0.01) / cell);
            for (let row = r0; row <= r1; row++)
              for (let col = c0; col <= c1; col++)
                cells.push([col, row]);
          });
          let s = seed * 1000 + 1;
          function rnd() {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
          }
          for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(rnd() * (i + 1));
            const tmp = cells[i]; cells[i] = cells[j]; cells[j] = tmp;
          }
          cells.forEach((c, i) => { c[2] = Math.floor(i * steps / cells.length) + 1; });

          let step = 0;
          const id = setInterval(() => {
            step++;
            // add all cells for this step (batch)
            cells.forEach(c => {
              if (c[2] === step) {
                const re = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                re.setAttribute('x', (c[0] * cell) / 640);
                re.setAttribute('y', (c[1] * cell) / 480);
                re.setAttribute('width', cell / 640);
                re.setAttribute('height', cell / 480);
                cp.appendChild(re);
              }
            });
            if (step >= steps) {
              clearInterval(id);
              ui.style.clipPath = '';
              ui.style.webkitClipPath = '';
              resolve();
            }
          }, ms / steps);
        });
      }

      async function runIntro() {
        busy = true;
        mode = 'intro';
        bgImg.style.visibility = 'hidden';
        bgImg.style.opacity = '0';
        const bc = document.getElementById('blueChrome');
        if (bc) { bc.classList.remove('in','on'); bc.style.visibility = 'hidden'; }
        const gc = document.getElementById('greenChrome');
        if (gc) { gc.classList.remove('in','on'); gc.style.visibility = 'hidden'; }
        const mc = document.getElementById('magentaChrome');
        if (mc) { mc.classList.remove('in','on'); mc.style.visibility = 'hidden'; }

        const lic0 = document.getElementById('licenseUi');
        lic0.classList.remove('show');
        lic0.style.clipPath = '';
        lic0.style.webkitClipPath = '';
        lic0.style.visibility = '';
        lic0.style.opacity = '';
        const cp0 = document.querySelector('#licenseClip');
        if (cp0) cp0.innerHTML = '';
        const _ip = document.getElementById('introPixel'); if (_ip) _ip.style.display = 'none';
        document.getElementById('introCanvas').innerHTML = '';
        showScreen(document.getElementById('screenIntro'));

        // 1) frames 1-20 fully
        await playIntroFrames(INTRO_FRAMES.seg0, 15, false);
        // 2) seg2: red chrome + rectangle (skipFirst, keepRectangle)
        const seg2 = INTRO_FRAMES.seg2;
        const seg2play = seg2.slice(1, -1);
        await playIntroFrames(seg2play, 15, false);
        renderIntroFrame(seg2[seg2.length - 2]);

        // 3) pixelization ONLY on license text block + controls
        await playLicensePixel();
        busy = false;
      }

      function acceptLicense() {
        if (busy) return;
        bgImg.src = 'assets/img/ui/bg.webp';
        bgImg.style.visibility = 'visible';
        bgImg.style.opacity = '1';
        showScreen(screenMain);
        mode = 'contents';
        requestAnimationFrame(() => animateMain());
      }

      function restartIntro() {
        if (busy) return;
        hideDetail(true);
        hidePatches();
        hideVideos();
        closeVideoModal();
        try { document.getElementById('modalDim').classList.remove('show'); } catch(e) {}
        try { document.getElementById('modalMsg').classList.remove('show'); } catch(e) {}
        const side = document.getElementById('sidePanel');
        if (side) side.classList.remove('in');
        const ph = document.getElementById('sidePanelHard');
        if (ph) ph.classList.remove('in');
        const ps = document.getElementById('sidePanelSuper');
        if (ps) ps.classList.remove('in');

        // full intro UI reset so animation doesn't stack
        const lic = document.getElementById('licenseUi');
        if (lic) {
          lic.classList.remove('show');
          lic.style.clipPath = '';
          lic.style.webkitClipPath = '';
          lic.style.visibility = '';
          lic.style.opacity = '';
        }
        const canvas = document.getElementById('introCanvas');
        if (canvas) canvas.innerHTML = '';
        const pix = document.getElementById('introPixel');
        if (pix) { pix.style.display = 'none'; const c = pix.getContext('2d'); if (c) c.clearRect(0,0,pix.width,pix.height); }
        const cp = document.querySelector('#licenseClip');
        if (cp) cp.innerHTML = '';

        runIntro();
      }


      document.getElementById('btnYes').addEventListener('click', acceptLicense);
      document.getElementById('btnNo').addEventListener('click', () => {});
      document.getElementById('exitIntro').addEventListener('click', restartIntro);
      // all other exit labels → restart intro
      document.querySelectorAll('.exit-label').forEach(el => {
        if (el.id === 'exitIntro') return;
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        el.addEventListener('click', restartIntro);
      });
      // license scroll
      const licText = document.getElementById('licenseText');
      if (licText) {
        document.getElementById('licUp').addEventListener('click', () => { licText.scrollTop -= 40; });
        document.getElementById('licDn').addEventListener('click', () => { licText.scrollTop += 40; });
        licText.addEventListener('scroll', () => {
          const th = document.getElementById('licThumb');
          const track = th.parentElement;
          const max = licText.scrollHeight - licText.clientHeight;
          const ratio = max > 0 ? licText.scrollTop / max : 0;
          th.style.top = (ratio * (track.clientHeight - th.offsetHeight)) + 'px';
        });
      }

      // splash.wav once per browser session
      (function playSplashOnce() {
        var KEY = 'igromania-1998-09-splash';
        try {
          if (sessionStorage.getItem(KEY)) return;
          sessionStorage.setItem(KEY, '1');
        } catch (e) {}
        try {
          var s = new Audio('assets/sound/splash.wav');
          s.volume = 1;
          var p = s.play();
          if (p && p.catch) p.catch(function(){});
        } catch (e) {}
      })();

      // start with intro, not main
      runIntro();
    })();
