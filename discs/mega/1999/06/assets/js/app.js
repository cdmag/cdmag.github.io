['400 16px Arimo', '700 16px Arimo', 'italic 400 16px Arimo', 'italic 700 16px Arimo'].forEach(f => document.fonts.load(f, 'Aa'));
/* ===== CONFIG: менять для каждого нового выпуска (id также дублируется в head-скрипте заставки) ===== */
const DISC = {
  id: 'mega-1999-06',
  musicBase: 'https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/music/mega/1999/05/'
};
/* ===== /CONFIG ===== */
const S = '../../shared/img/';
const hint = document.getElementById('hint');
const music = document.getElementById('music');
const exit = document.getElementById('exit');
let musicOn = true, musicHover = false, exitHover = false;

['music_on','music_on_anim','music_off','music_off_anim','exit','exit_anim']
  .forEach(n => { new Image().src = S + n + '.webp'; });

function renderMusic(){
  music.src = S + 'music_' + (musicOn ? 'on' : 'off') + (musicHover ? '_anim' : '') + '.webp';
  hint.textContent = musicHover ? (musicOn ? 'Отключение музыки' : 'Включение музыки') : '';
}
function renderExit(){
  exit.src = S + 'exit' + (exitHover ? '_anim' : '') + '.webp';
  hint.textContent = exitHover ? 'Выход' : '';
}

music.addEventListener('mouseenter', () => { musicHover = true; renderMusic(); });
music.addEventListener('mouseleave', () => { musicHover = false; renderMusic(); });
music.addEventListener('click', () => toggleMusic());
exit.addEventListener('click', () => sfx('click_exit.opus'));
exit.addEventListener('mouseenter', () => { exitHover = true; renderExit(); });
exit.addEventListener('mouseleave', () => { exitHover = false; renderExit(); });

const UI = 'assets/img/ui/';
document.querySelectorAll('.btn').forEach(b => {
  const n = b.dataset.icon, D = b.dataset.dir === 'ui' ? UI : S;
  new Image().src = D + n + '_anim.webp';
  b.src = D + n + '.webp';
  b.addEventListener('mouseenter', () => { b.src = D + n + '_anim.webp'; hint.textContent = b.dataset.hint || ''; });
  b.addEventListener('mouseleave', () => { b.src = D + n + '.webp'; hint.textContent = ''; });
});

document.querySelectorAll('.ban').forEach(b => {
  b.addEventListener('mouseenter', () => { hint.textContent = b.dataset.hint; });
  b.addEventListener('mouseleave', () => { hint.textContent = ''; });
  b.addEventListener('click', () => { window.open(b.dataset.url, '_blank', 'noopener'); });
});

const $ = id => document.getElementById(id);
const main = $('main');

let busy = false;
const KF = [{transform:'scale(0.5)', opacity:0}, {transform:'scale(1)', opacity:1}];
const OPT = {duration:600, easing:'ease-out'};
const BN = [
  {img: 'bn1', url: 'https://web.archive.org/web/199906/www.submarine.ru', hint: 'Перейти на сайт www.submarine.ru'},
  {img: 'bn2', url: 'https://web.archive.org/web/199906/www.gamecenter.ru', hint: 'Перейти на сайт www.gamecenter.ru'}
];
let bnI = 0;
function showBanner(){
  const b = BN[bnI++ % BN.length], el = $('bnr');
  el.src = S + b.img + '.webp';
  el.dataset.url = b.url;
  el.dataset.hint = b.hint;
}
showBanner();

const NEWS = [
 "Компания Electronic Arts объявила, что сейчас в стадии разработки находится новая игра под названием FA Premier League STARS, которая должна появиться на прилавках магазинов в августе. В данном проекте EA решила объединить свою торговую марку FA Premier League с популярной серией FIFA.",
 "Четвертая версия игрушки Dodz and Catz выйдет осенью этого года, как сообщила компания Mindscape Entertainment. В новую версию должна быть добавлена технология распознавания речи, что позволит геймерам разговаривать со своими животными.",
 "Игрушка Battlezone II производства компании Activision появится этим летом. В ней будут представлены восемь миров и две кампании, где геймеры смогут сыграть за Людей или Чужих (Aliens). Также будут танки, самолеты, пехота и более 25 различных видов оружия.",
 "Президент компании Irrational Games Кен Левайн (Ken Levine) объявил, что будущие проекты в серии игр System Shock более чем просто возможны. Сейчас совместно с Looking Glas компания разрабатывает System Shock 2 для фирмы Electronic Arts, а в ее недрах уже вырисовывается третья часть System Shoсk.",
 "Фирма S3 опубликовала финансовые результаты за I квартал этого года. Прогресс очевиден: 2,8 млн. долларов по сравнению с IV кварталом 1998 года, однако за тот же период прошлого года прибыль фирмы уменьшилась на 46%.",
 "По сообщению компании Next Generation Software, игра Dark Secrets of Africa практически готова.",
 "Компания PopTop Software и группа Gathering of Developers объявили о выходе продукта Railroad Tycoon II: The Second Century. Игра эта представляет собой expansion второй части игры Railroad Tycoon, действия в которой происходят в период с 1939 по 2030 годы.",
 "Фирма Mindscape заявила, что она выступит в качестве издателя нового проекта Close Combat 4. Напомню, что предыдущую версию, которую, как и эту, разрабатывала компания Atomic Games, издавала корпорация Microsoft. Выход игры намечен на IV квартал этого года.",
 "Компания Sega Japan объявила об издании ограниченного тиража игры Sakura Wars для платформы РС. Игра объединяет жанры стратегии и RPG, выйдет она на трех компакт-дисках.",
 "Компания Sega подписала соглашение, по которому она будет спонсировать английский футбольный клуб Arsenal FC. Договор заключен на три года, за всю историю Premiere League он стал рекордным (имеется в виду сумма, которую Sega передаст \"Арсеналу\" за эти три года)."
];
const TICK_W = 1167, TICK_SPEED = 130;
let tickStarted = false, ni = 0;
function tickNext(){
  const t = $('tickt');
  t.textContent = NEWS[ni];
  const tw = t.offsetWidth / ($('tick').clientWidth / TICK_W);
  const a = t.animate([
    {transform: 'translateX(calc(' + TICK_W + ' * var(--u)))'},
    {transform: 'translateX(calc(' + (-tw) + ' * var(--u)))'}
  ], {duration: (TICK_W + tw) / TICK_SPEED * 1000, easing: 'linear', fill: 'forwards'});
  a.onfinish = () => { ni = (ni + 1) % NEWS.length; tickNext(); };
}
function startTicker(){
  if (tickStarted) return;
  tickStarted = true;
  const go = () => tickNext();
  if (document.fonts && document.fonts.load) Promise.race([document.fonts.load('31px Arimo'), new Promise(r => setTimeout(r, 1500))]).then(go, go);
  else go();
}

const VID = [
 {
  "title": "Fleet Command",
  "img": "fleet",
  "vk": "oid=-240437459&id=456239145&hash=2e1ebb2b4f27839e",
  "desc": "Fleet Command\nЖанр: стратегия\nРазработчик: Sonalysts\nИздатель: Electronic Arts\nwww.janes.ea.com\nSonalysts всю свою сознательную жизнь, а это несколько десятилетий, клепали акваланги и водолазные костюмы для расположенной за соседним забором большой базы подводных лодок ВМФ США, а в свободное время делали сонары, радары и другие высокоточные и чувствительные приборы для Министерства Обороны. А теперь вот решили сделать военно-морскую real-time стратегию…"
 },
 {
  "title": "Giants",
  "img": "giants",
  "vk": "oid=-240437459&id=456239144&hash=79c2025cef19f128",
  "desc": "Giants\nЖанр: экшн\nРазработчик: Interplay\nИздатель: Interplay\nhttp://www.interplay.com\nИх трое. Но этого слишком много, так как они ГИГАНТЫ. Большие и страшные. Кто из них станет главным - решать надо будет вам."
 },
 {
  "title": "The Longest Journey",
  "img": "longest",
  "vk": "oid=-240437459&id=456239143&hash=7e0e59ffef988efb",
  "desc": "The Longest Journey\nЖанр: квест\nРазработчик и издатель: FunCom\nwww.funcom.com\nСамыми сильными сторонами TLJ являются не встречавшийся ранее сюжет, сложная система двух миров, графика и девушка в главной роли. Еще один большой плюс в том, что игра делается в Старом Свете, а в нем, как правило, появляются более качественные продукты. За остальными подробностями обращайтесь внутрь журнала."
 },
 {
  "title": "Dungeon Keeper 2: Reaper Interview",
  "img": "dk2",
  "vk": "oid=-240437459&id=456239142&hash=9bbe6c866c819c7d",
  "desc": "Dungeon Keeper 2: Reaper Interview\nЖанр: RTS про плохих дядек\nРазработчик: Bullfrog\nИздатель: Electronic Arts\nhttp://www.bullfrog.ea.com\nПервый DK вписал страницу в историю компьютерных игр, продемонстрировав всю тяжесть существования представителей Сил Зла и повелителей мрачных подземелий. Публика приняла игру \"на ура\" и немедленно пошли разговоры \nо необходимости второй серии, тем более, что в первой части и баги были, \nи много чего требовалось усовершенствовать. Но генеральная линия \nна исправление общественного мнения в пользу темных сил осталась."
 }
];
const vid = document.getElementById('video');
const back = document.getElementById('back');
const list = document.getElementById('list');
const det = document.getElementById('det');
const vbg = document.getElementById('vbg');
let cur = -1;
new Image().src = 'assets/img/ui/bg_video2.webp';
document.getElementById('shotcap').addEventListener('contextmenu', e => e.preventDefault());
const items = VID.map((v, i) => {
  const d = document.createElement('div');
  d.className = 'item';
  d.textContent = v.title;
  d.addEventListener('mouseenter', () => { hint.textContent = 'Выбрать видеофрагмент'; });
  d.addEventListener('mouseleave', () => { hint.textContent = ''; });
  d.addEventListener('click', () => selectItem(i));
  list.appendChild(d);
  return d;
});

function selectItem(i){
  const L = VID[i].desc.split('\n');
  let k = L.findIndex(s => /^(https?:\/\/|www\.)/.test(s));
  if (k < 0) k = 0;
  const box = document.getElementById('dtxt');
  box.textContent = '';
  L.slice(0, k + 1).forEach(t => { const e = document.createElement('div'); e.className = 'dh'; e.textContent = t; box.appendChild(e); });
  const dd = document.createElement('div'); dd.className = 'dd'; dd.textContent = L.slice(k + 1).join('\n'); box.appendChild(dd);
  items.forEach((e, j) => e.classList.toggle('sel', j === i));
  document.getElementById('shot').style.backgroundImage = 'url(assets/img/content/' + VID[i].img + '.webp)';
  vbg.classList.add('b2');
  cur = i;
  det.classList.add('on');
}
function openVideo(){
  if (busy) return;
  busy = true;
  setMusic('music_video.opus');
  hint.textContent = '';
  vid.style.display = 'block';
  vid.animate(KF, OPT).onfinish = () => { busy = false; };
}
function closeVideo(){
  if (busy) return;
  busy = true;
  sfx('click_back.wav');
  leaveMusic();
  revealStart();
  showBanner();
  hint.textContent = '';
  back.style.visibility = 'hidden';
  main.style.zIndex = 3;
  main.animate(KF, OPT).onfinish = () => {
    main.style.zIndex = '';
    revealEnd();
    enterMusic();
    vid.style.display = 'none';
    back.src = S + 'back.webp';
    back.style.visibility = '';
    vbg.classList.remove('b2');
    cur = -1;
    document.querySelector('[data-icon="video"]').src = UI + 'video.webp';
    items.forEach(e => e.classList.remove('sel'));
    det.classList.remove('on');
    busy = false;
  };
}
const pl = document.getElementById('pl');
function openPlayer(){
  if (cur < 0) return;
  hint.textContent = '';
  pauseAudio();
  const f = document.createElement('iframe');
  f.src = 'https://vkvideo.ru/video_ext.php?' + VID[cur].vk + '&hd=3&autoplay=1';
  f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;';
  f.referrerPolicy = 'no-referrer';
  f.setAttribute('referrerpolicy', 'no-referrer');
  f.setAttribute('frameborder', '0');
  f.allowFullscreen = true;
  pl.appendChild(f);
  pl.classList.add('on');
}
function closePlayer(){ pl.classList.remove('on'); pl.innerHTML = ''; resumeAudio(); }
document.getElementById('play').addEventListener('click', openPlayer);
pl.addEventListener('click', e => { if (e.target === pl) closePlayer(); });
document.querySelector('[data-icon="video"]').addEventListener('click', openVideo);
back.addEventListener('click', closeVideo);
document.getElementById('play').addEventListener('click', openPlayer);

const DEM = [
 {
  "title": "MechWarrior 3",
  "shots": [
   "mw3_1",
   "mw3_2",
   "mw3_3",
   "mw3_4",
   "mw3_5",
   "mw3_6",
   "mw3_7",
   "mw3_8",
   "mw3_9"
  ],
  "desc": "MechWarrior 3\nЖанр: симулятор боевых роботов\nРазработчики: Zipper Interactive и FASA Corporation\nИздатель: Microprose\nhttp://www.microprose.com\n3058 год. Государства Внутренней Сферы временно отложили старые обиды и начали объединяться для сопротивления нашествию Кланов. В центре сюжета MW3 лежит Ямаровка - бывшая планета Куриты, в настоящее время оккупированная Кланом Дымчатого Ягуара, не имеющая никакого стратегического значения и изредка мелькавшая в сетевых миссиях  предыдущих серий. Вас зовут Zachery Hardcastle, \nвы только что закончили Mech-Academy на Бристоле…"
 },
 {
  "title": "Star Wars Episode 1: Gungan Frontier",
  "shots": [
   "swe1gf_1",
   "swe1gf_2",
   "swe1gf_3",
   "swe1gf_4",
   "swe1gf_5",
   "swe1gf_6"
  ],
  "desc": "Star Wars Episode 1: Gungan Frontier\nЖанр: жизненная стратегия\nИздатель и разработчик: Lucas Learning\nwww.lucasarts.com\nВ этой чудной игрушке вам надо растить город Гунганов. Кто такие Гунганы, мы \nне знаем, но это что-то из области \"Звездных Войн\". А вообще, LucasArts порадовала народ аж тремя игрушками по мотивам нового фильма, и это, возможно, еще не конец."
 },
 {
  "title": "HellCopter",
  "shots": [
   "heelcop_1",
   "heelcop_2"
  ],
  "desc": "HellCopter\nЖанр: аркадная стрелялка\nРазработчик: Drago Entertainment\nИздатель: Ubi Soft\nwww.ubisoft.com\nПредставьте себе \"симулятор военного вертолета\", но с видом сверху, возможностью чинить броню прямо во время боя, поднимать оружие из взорвавшихся грузовиков, \nа также возможностью стрейфа - короче, аркада с ног до головы. Вот это и есть \nHell Copter."
 },
 {
  "title": "Starsiege",
  "shots": [
   "starsiege_1",
   "starsiege_2",
   "starsiege_3",
   "starsiege_4",
   "starsiege_5",
   "starsiege_6",
   "starsiege_7",
   "starsiege_8",
   "starsiege_9",
   "starsiege_10"
  ],
  "desc": "Starsiege\nЖанр: роботы\nИздатель: Sierra\nРазработчик: Dynamix\nhttp://www.sierra.com\nРоботы - они и есть роботы, что с них взять. Ходят железные по просторам \nи стреляют во все стороны. В Starsiege понять, кто куда стреляет, сложно. Но зато легко добиться сообщения про \"успешно пройденную миссию\". Хорошая игрушка, одним словом."
 },
 {
  "title": "Slave Zero",
  "shots": [
   "slave_1",
   "slave_2",
   "slave_3",
   "slave_4",
   "slave_5"
  ],
  "desc": "Slave Zero\nЖанр: экшн\nРазработчик: Accolade\nИздатель: Accolade\nhttp://www.accolade.com\nУра! Нам предстоит очередная встреча со старым, добрым, хорошо прожаренным жанром third person shooter. На сей раз на нашу долю выпала роль могучего металлизированного гиганта из далекого XXII столетия, промышляющего охотой \nна таких же, как он, бронированных монстров, жаждущих испить смазки, струящейся \nпо маслоприводам Слейва (название робота). Демка сырая, потому тормозная. Демоверсия находится на нашем CD-ROM (Data\\Demo\\slavezero.zip)."
 },
 {
  "title": "Shattered Light",
  "shots": [
   "shatter_1",
   "shatter_2"
  ],
  "desc": "Shattered Light\nЖанр: RPG\nИздатель и разработчик: Catware\nwww.catware.com\nТеоретически-онлайновая RPG про походы по фэнтезийным землям. В деме мультиплейера нет, но вы сможете оценить графику и идею. Вокруг полно народу, \nи вообще все весело. Главное - не нужен 3Dfx."
 },
 {
  "title": "Expendable",
  "shots": [
   "expen_1",
   "expen_2",
   "expen_3",
   "expen_4"
  ],
  "desc": "Expendable\nЖанр: аркада 3D\nИздатель и разработчик: Rage\nwww.rage.co.uk\nЧистой воды аркада про походы дядьки с различными разрушительными приспособлениями по улицам. Навстречу едут трамваи и бегут враги. А мы их всех стреляем и стреляем. Демоверсия находится на нашем CD-ROM (Data\\Demo\\expendable.zip)."
 },
 {
  "title": "Mars Maniacs",
  "shots": [
   "mars_1",
   "mars_2",
   "mars_3",
   "mars_4",
   "mars_5",
   "mars_6"
  ],
  "desc": "Mars Maniacs\nЖанр: аркадный автосимулятор\nРазработчик: COEE, Издатель: COEE\nhttp://www.demigods.com\nПодозрительно много нынче аркадных симуляторов автогонок. Прут, как грибы после дождя: деваться от них некуда. И ладно бы было среди них хоть два-три хороших: сидели бы мы да играли в эти самые, что ни на есть лучшие и были бы вполне довольны житием своим. Так нет же, все, как на подбор, хорошие - аж глаза разбегаются. Прямо-таки не знаешь, за что и взяться. А мы вам поможем. Возьмитесь за \"Марсианских маньяков\" - чума, честное слово. Самая играбельная дема на этом диске. Демоверсия находится на нашем CD-ROM (Data\\Demo\\marsmaniacs99.zip)."
 },
 {
  "title": "Sports Car GT",
  "shots": [
   "cargt_1",
   "cargt_2",
   "cargt_3",
   "cargt_4"
  ],
  "desc": "Sports Car GT\nЖанр: автогонки\nРазработчик: Image Space Incorporated\nИздатель: Electronic Arts\nwww.ea.com\nЕще одни соревнования из серии Grand Touring, на сей раз лицензированные самой Electronic Arts. В демоверсии вы сможете погонять на трех машинах одной-единственной трассе."
 },
 {
  "title": "Xtom 3D",
  "shots": [
   "xtom_1",
   "xtom_2",
   "xtom_3",
   "xtom_4",
   "xtom_5"
  ],
  "desc": "Xtom 3D\nЖанр: 3D-шутер\nИздатель: нет пока\nРазработчик: Jamie System Development\nhttp://www.jamie.co.kr\nУраганная аркада про полеты и врагов. Помните \"Ксенон 2\"? Так вот, \nЭкс-Том-Три-Дэ - не \"Ксенон 2\". Это нечто словами неописуемое. Попробуйте сами \nи поймете. Демоверсия находится на нашем CD-ROM (Data\\Demo\\XtomDemo.zip)."
 },
 {
  "title": "Shadow Company",
  "shots": [
   "shadow_1",
   "shadow_2",
   "shadow_3",
   "shadow_4"
  ],
  "desc": "Shadow Company: Left for Dead\nРазработчик: Sinister Games, Издатель: Interactive Magic\nЖанр: real-time стратегия\nhttp://www.imagicgames.com\n...На дворе 2010 год. Мировой проблемой номер один стал терроризм, направленный как против стран, так и против корпораций. Война с терроризмом настолько истощила бюджеты развитых стран, что они больше не в состоянии обеспечивать хоть какую-то безопасность крупным коммерческим структурам, и у последних остался единственный шанс на спасение создание собственных мобильных подразделений, \"карманных\" армий, и объявление джихада терроризму…. Демоверсия находится \nна нашем CD-ROM (Data\\Demo\\shadow.zip)."
 },
 {
  "title": "Road Wars",
  "shots": [
   "road_1",
   "road_2",
   "road_3",
   "road_4",
   "road_5"
  ],
  "desc": "Road Wars\nЖанр: гонки со стрельбой\nРазработчик и издатель: Intense Games\nwww.intense-games.com\nМашины ездят по дорогам и стреляют друг в друга (в деме, правда, стрелять нельзя). Не Need for Speed, конечно, но немного погонять можно. И даже машину расколотить. Демоверсия находится на нашем CD-ROM (Data\\Demo\\roadwars.zip)."
 }
];
const demo = $('demo'), dback = $('dback'), dlist = $('dlist'), ddet = $('ddet'), dbg = $('dbg');
const dshot2 = $('dshot2'), dshot = $('dshot'), dshotcap = $('dshotcap'), pm = $('pm');
let dcur = -1, pmT = 0;
new Image().src = 'assets/img/ui/bg_demo2.webp';
const CT = 'assets/img/content/';
dshotcap.addEventListener('contextmenu', ev => ev.preventDefault());

const ditems = DEM.map((v, i) => {
  const d = document.createElement('div');
  d.className = 'item';
  d.textContent = v.title;
  d.addEventListener('mouseenter', () => { hint.textContent = 'Выбрать демоверсию'; });
  d.addEventListener('mouseleave', () => { hint.textContent = ''; });
  d.addEventListener('click', () => dSelect(i));
  dlist.appendChild(d);
  return d;
});
function dSelect(i){
  const L = DEM[i].desc.split('\n');
  let k = L.findIndex(s => /^(https?:\/\/|www\.)/.test(s));
  if (k < 0) k = 0;
  const box = $('dtext');
  box.textContent = '';
  L.slice(0, k + 1).forEach(t => { const e = document.createElement('div'); e.className = 'dh'; e.textContent = t; box.appendChild(e); });
  const dd = document.createElement('div'); dd.className = 'dd'; dd.textContent = L.slice(k + 1).join('\n'); box.appendChild(dd);
  ditems.forEach((e, j) => e.classList.toggle('sel', j === i));
  dshot.style.backgroundImage = dshot2.style.backgroundImage = 'url(' + CT + DEM[i].shots[0] + '.webp)';
  dbg.classList.add('b2');
  ddet.classList.add('on');
  dcur = i;
}
function openDemo(){
  if (busy) return;
  busy = true;
  setMusic('music_demo.opus');
  hint.textContent = '';
  demo.style.display = 'block';
  demo.animate(KF, OPT).onfinish = () => { busy = false; };
}
function closeDemo(){
  if (busy) return;
  busy = true;
  sfx('click_back.wav');
  leaveMusic();
  revealStart();
  showBanner();
  hint.textContent = '';
  dback.style.visibility = 'hidden';
  main.style.zIndex = 3;
  main.animate(KF, OPT).onfinish = () => {
    main.style.zIndex = '';
    revealEnd();
    enterMusic();
    demo.style.display = 'none';
    dback.src = S + 'back.webp';
    dback.style.visibility = '';
    $('inst').src = S + 'install_demo.webp';
    document.querySelector('[data-icon="demo"]').src = UI + 'demo.webp';
    dbg.classList.remove('b2');
    ditems.forEach(e => e.classList.remove('sel'));
    ddet.classList.remove('on');
    dshot2.style.display = 'none';
    dcur = -1;
    busy = false;
  };
}
dback.addEventListener('click', closeDemo);
let noHl = false, hlX = 0, hlY = 0;
function hlOn(){ dshot2.style.display = 'block'; hint.textContent = 'Увеличить картинку'; }
function hlOff(){ dshot2.style.display = 'none'; hint.textContent = ''; }
dshotcap.addEventListener('mouseenter', () => { if (!noHl) hlOn(); });
dshotcap.addEventListener('mouseleave', () => { noHl = false; hlOff(); });
dshotcap.addEventListener('mousemove', e => {
  if (noHl && Math.hypot(e.clientX - hlX, e.clientY - hlY) > 3){ noHl = false; hlOn(); }
});
dshotcap.addEventListener('pointerdown', hlOff);

const sv = $('sv'), svimg = $('svimg'), svpan = $('svpan'), svcap = $('svcap');
let svList = [], svI = 0, svHid = false, svTok = 0;
const SVH = {hide: 'Скрыть', back: 'Предыдущий', next: 'Следующий', close: 'Возврат'};
function svLoad(k, first){
  svI = (k + svList.length) % svList.length;
  const tok = ++svTok, im = new Image();
  im.onload = () => {
    if (tok !== svTok) return;
    svimg.width = im.naturalWidth;
    svimg.height = im.naturalHeight;
    svimg.getContext('2d').drawImage(im, 0, 0);
    svimg.style.width = 'calc(' + im.naturalWidth * 2 + ' * var(--u))';
    svimg.style.height = 'calc(' + im.naturalHeight * 2 + ' * var(--u))';
    if (first) sv.style.display = 'block';
  };
  im.src = CT + svList[svI] + '.webp';
}
function svOpen(list){
  svList = list; svHid = false;
  svpan.style.display = 'block'; svcap.textContent = '';
  hlOff();
  svLoad(0, true);
}
function svClose(e){
  sv.style.display = 'none';
  svTok++;
  noHl = true; hlX = e.clientX; hlY = e.clientY;
}
dshotcap.addEventListener('click', () => svOpen(DEM[dcur].shots));
sv.addEventListener('contextmenu', ev => ev.preventDefault());
sv.addEventListener('click', () => { if (svHid){ svHid = false; svpan.style.display = 'block'; } });
svpan.addEventListener('click', ev => ev.stopPropagation());
svpan.querySelectorAll('.svb').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('mouseenter', () => { svcap.textContent = SVH[k]; });
  b.addEventListener('mouseleave', () => { svcap.textContent = ''; });
  b.addEventListener('click', ev => {
    ev.stopPropagation();
    if (k === 'hide'){ svHid = true; svpan.style.display = 'none'; svcap.textContent = ''; }
    else if (k === 'back') svLoad(svI - 1, false);
    else if (k === 'next') svLoad(svI + 1, false);
    else svClose(ev);
  });
});

function hideMsg(){ clearTimeout(pmT); pm.classList.remove('on'); }
$('inst').addEventListener('click', () => {
  hint.textContent = '';
  pm.classList.add('on');
  clearTimeout(pmT);
  pmT = setTimeout(hideMsg, 1000);
});
pm.addEventListener('click', hideMsg);
document.querySelector('[data-icon="demo"]').addEventListener('click', openDemo);

const PAT = [
 {
  "ver": "v1.02",
  "title": "Warzone 2100",
  "desc": "Добавлена самая большая карта для одновременной игры 8 игроков. Ее размер - 250х250. В патче есть карта и поменьше - 96х96 - для 4 игроков."
 },
 {
  "ver": "v1.06",
  "title": "Heretic II",
  "desc": "Добавлены несколько новых уровней, новый вид оружия, а также много новых скинов и моделей."
 },
 {
  "ver": "v1.06j",
  "title": "Lands of Lore III",
  "desc": "Патч в основном исправляет всякие баги, в частности больше не будет проблем с Direct 3D. Patch находится на нашем CD-ROM (Data\\Patches\\Lol3106j.zip)."
 },
 {
  "ver": "patch",
  "title": "Redline",
  "desc": "Патч добавляет 4 карты для deathmatch'a и один новый уровень для CTF (Capture the Flag). Он также значительно повышает стабильность игры в режиме клиент/сервер и исправляет некоторые незначительные глюки."
 },
 {
  "ver": "v224",
  "title": "Unreal",
  "desc": "Если вы до сих пор испытываете проблемы при игре в Unreal, то новый патч за номером 224 наверняка вам поможет."
 },
 {
  "ver": "v1.1d",
  "title": "Apache Havoc",
  "desc": "Исправлены проблемы совместимости со многими графическими акселераторами, а также (ВНИМАНИЕ!!) наконец-то исправлен баг с раскладкой японской клавиатуры!!!"
 },
 {
  "ver": "v1.04",
  "title": "Resident Evil 2",
  "desc": "Патч добавляет поддержку карточки RIVA от компании nVidia. Не используйте его, если у вас установлена какая-нибудь другая карта. Patch находится на нашем CD-ROM (Data\\Patches\\res2_104.zip)."
 },
 {
  "ver": "patch4",
  "title": "Gangsters: Organized Crime",
  "desc": "По заявлению разработчиков патч исправляет все известные баги в игре. Patch находится на нашем CD-ROM (Data\\Patches\\Gangsters_Update_4_USAENG.zip)."
 },
 {
  "ver": "v1.02",
  "title": "NASCAR Revolution",
  "desc": "Улучшает поддержку Force Feedback и исправляет много других глюков."
 },
 {
  "ver": "v1.41",
  "title": "Starsiege: TRIBES",
  "desc": "Исправляет клиент/серверские проблемы, что очень важно для сетевой игры."
 }
];
const patch = $('patch'), pback = $('pback'), plist = $('plist'), pdet = $('pdet');
$('pver').textContent = PAT.map(v => v.ver).join('\n');
const pitems = PAT.map((v, i) => {
  const d = document.createElement('div');
  d.className = 'item';
  d.textContent = v.title;
  d.addEventListener('mouseenter', () => { hint.textContent = 'Выбрать patch'; });
  d.addEventListener('mouseleave', () => { hint.textContent = ''; });
  d.addEventListener('click', () => {
    pitems.forEach((e, j) => e.classList.toggle('sel', j === i));
    $('ptext').textContent = v.desc;
    pdet.classList.add('on');
  });
  plist.appendChild(d);
  return d;
});
function openPatch(){
  if (busy) return;
  busy = true;
  setMusic('music_patches.opus');
  hint.textContent = '';
  patch.style.display = 'block';
  patch.animate(KF, OPT).onfinish = () => { busy = false; };
}
function closePatch(){
  if (busy) return;
  busy = true;
  sfx('click_back.wav');
  leaveMusic();
  revealStart();
  showBanner();
  hint.textContent = '';
  pback.style.visibility = 'hidden';
  main.style.zIndex = 3;
  main.animate(KF, OPT).onfinish = () => {
    main.style.zIndex = '';
    revealEnd();
    enterMusic();
    patch.style.display = 'none';
    pback.src = S + 'back.webp';
    pback.style.visibility = '';
    $('pinst').src = S + 'install_patch.webp';
    document.querySelector('[data-icon="patches"]').src = UI + 'patches.webp';
    pitems.forEach(e => e.classList.remove('sel'));
    pdet.classList.remove('on');
    busy = false;
  };
}
pback.addEventListener('click', closePatch);
$('pinst').addEventListener('click', () => {
  hint.textContent = '';
  pm.classList.add('on');
  clearTimeout(pmT);
  pmT = setTimeout(hideMsg, 1000);
});
const UTL = [
 {
  "title": "BattleCom v1.2",
  "desc": "Утилита, которая позволяет геймерам общаться голосом \nво время игры в режиме multiplayer."
 },
 {
  "title": "Cute FTP v2.8",
  "desc": "Удобный FTP-клиент, с помощью которого можно легко производить трансфер файлов в любом направлении."
 },
 {
  "title": "GoZilla Free v3.3",
  "desc": "Программа позволяет управлять скачиванием файлов \nиз Internet'а и производить его в удобное для вас время."
 },
 {
  "title": "GetRight v3.3.3",
  "desc": "Утилита позволяет после обрыва связи с Internet'ом продолжить скачивание файлов с того места, где произошел обрыв."
 },
 {
  "title": "Net Sonic v1.02",
  "desc": "Утилита позволяет очень быстро загружать ваши любимые сайты Internet'a."
 },
 {
  "title": "WinRAR v2.50",
  "desc": "Последняя версия популярного архиватора RAR для \nWindows 95/98/NT, которая также позволяет работать \nс архивами ZIP."
 },
 {
  "title": "CheetaChat v5.6q",
  "desc": "Это полный клиент для Yahoo Chat и ichat от компании \nMercur Technologies."
 },
 {
  "title": "CleanCIH v1.5",
  "desc": "Небольшой антивирус, который убивает вирус CIH из вашей операционной системы Windows 95/98/NT."
 },
 {
  "title": "NeoPlanet v2.1",
  "desc": "Небольшой (1.7Мбайт), простой в использовании и настройке \nи совершенно бесплатный Web-браузер."
 }
];
const util = $('util'), uback = $('uback'), ulist = $('ulist'), udet = $('udet');
const uitems = UTL.map((v, i) => {
  const d = document.createElement('div');
  d.className = 'item';
  d.textContent = v.title;
  d.addEventListener('mouseenter', () => { hint.textContent = 'Описание программы'; });
  d.addEventListener('mouseleave', () => { hint.textContent = ''; });
  d.addEventListener('click', () => {
    uitems.forEach((e, j) => e.classList.toggle('sel', j === i));
    $('utext').textContent = v.desc;
    udet.classList.add('on');
  });
  ulist.appendChild(d);
  return d;
});
function openUtil(){
  if (busy) return;
  busy = true;
  setMusic('music_soft.opus');
  hint.textContent = '';
  util.style.display = 'block';
  util.animate(KF, OPT).onfinish = () => { busy = false; };
}
function closeUtil(){
  if (busy) return;
  busy = true;
  sfx('click_back.wav');
  leaveMusic();
  revealStart();
  showBanner();
  hint.textContent = '';
  uback.style.visibility = 'hidden';
  main.style.zIndex = 3;
  main.animate(KF, OPT).onfinish = () => {
    main.style.zIndex = '';
    revealEnd();
    enterMusic();
    util.style.display = 'none';
    uback.src = S + 'back.webp';
    uback.style.visibility = '';
    $('uinst').src = S + 'install_util.webp';
    document.querySelector('[data-icon="utils"]').src = UI + 'utils.webp';
    uitems.forEach(e => e.classList.remove('sel'));
    udet.classList.remove('on');
    busy = false;
  };
}
uback.addEventListener('click', closeUtil);
$('uinst').addEventListener('click', () => {
  hint.textContent = '';
  pm.classList.add('on');
  clearTimeout(pmT);
  pmT = setTimeout(hideMsg, 1000);
});
document.querySelector('[data-icon="patches"]').addEventListener('click', openPatch);
document.querySelector('[data-icon="utils"]').addEventListener('click', openUtil);

const OUR_INTRO = "Рекламно-издательская группа \"Фантазия\" - успешно развивающаяся структура на рынке компьютерной и научно-популярной прессы. \n\n   В настоящее время \"Фантазия\" выпускает четыре ежемесячных издания:\n\n*\nнаучно-популярный журнал о компьютерах \"Подводная лодка\"\n\n*\nинформационно-аналитический дайджест о программном обеспечении \"F1\"\n\n*\nжурнал о компьютерных играх \"MegaGame\"\n\n*\nгазета \"ComputeReview\"";
const OUR = [
  {"title": "\"Подводная лодка\"", "desc": "\tНаучно-популярный журнал о компьютерах, в доступной форме освещающий все аспекты развития компьютерной техники, программного обеспечения. Особое внимание уделяется практическим рекомендациям. \n\t«ПЛ» занимает индивидуальную «нишу» на российском рынке компьютерной прессы. По результатам анализа  редакционной почты и 15000 анкет, заполненных на 52 выставках\nв городах России и СНГ в 1998 г. 75% читательской аудитории «ПЛ» — не профессионалы в области информационных технологий, но обычные пользователи, владеющие компьютером или собирающиеся его купить.\n\t«Подводную лодку» получают около 70 представительств иностранных компьютерных компаний в Москве, а также технические вузы и библиотеки. \n\t«ПЛ» выходит в комплекте с CD-ROM.\n\nПериодичность – раз в месяц\nФормат – А4\nОбъем – 120 страниц,\nТекущий тираж – 30000 экз.", "img": "pl", "r": [873, 171, 596, 844]},
  {"title": "\"F1\"", "desc": "\tИнформационно-аналитический дайджест, посвященный программному обеспечению. Это специальное издание содержит полезные сведения о программных продуктах, выпускаемых ведущими представителями отечественного рынка программного обеспечения.\n\t«F1» адресован прежде всего продавцам и разработчикам ПО. Здесь содержатся материалы, посвященные успешному опыту маркетинга отечественных разработок. Журнал актуален и для пользователей компьютера, включая специалистов различных профессий, эффективность труда которых заметно повышается при грамотном выборе профессиональных рабочих программ.\n\tЖурнал распространяется бесплатно среди государственных, общественных и коммерческих структур.\n\nПериодичность — раз в месяц\nФормат — А4\nОбъем — 60 страниц\nТираж — 15000 экз", "img": "f1", "r": [864, 170, 616, 844]},
  {"title": "\"Mega Game\"", "desc": "\tИллюстрированный журнал о компьютерных играх. Это новый широкоформатный журнал,  создание которого ведется по мировым стандартам дизайна и полиграфии. Каждый номер будет содержать материалы более чем о 200 компьютерных играх. \n\tИнформация в журнал предоставляется непосредственно российскими и зарубежными разработчиками и издателями игровых программ. Обязательная часть каждого номера — последние новости мирового игрового рынка, интервью с производителями, а также специальный раздел, посвященный игровому «железу». \n\tВ ближайшее время журнал начнет выходить с компакт-диском.\n\nПериодичность — раз в месяц\nФормат — 238x290 мм\nобъем — 200 страниц\nТираж — 10 000 экз.", "img": "mega", "r": [838, 173, 666, 840]},
  {"title": "\"ComputeReview\"", "desc": "\tГазета ComputeReview рассчитана на специалистов в области информационных технологий и корпоративных пользователей.\n\tМы намерены снабжать читателя полной и свежей информацией о новых продуктах в различных секторах корпоративного рынка, об экономических результатах деятельности крупнейших зарубежных и отечественных компьютерных компаний, организационных переменах в фирмах, будем публиковать материалы о реализованных проектах по внедрению информационных технологий, управленческих систем на российских и западных предприятиях-заказчиках, а также технологические обзоры по широкой тематике.\n\tГазета распространяется прямой рассылкой ограниченного количества экземпляров по компьютерным компаниям и предприятиям-потребителям информационных технологий, а также продается в розницу.\n\nПериодичность - один раз в две недели\nФормат - 275x370 мм\nОбъем - 32 страницы\nТираж первого номера - 10000 экз.", "img": "cr", "r": [858, 172, 626, 842]}
];
const our = $('our'), oback = $('oback'), obg = $('obg'), ointro = $('ointro'), otext = $('otext'), oimg = $('oimg'), oimgcap = $('oimgcap');
(function(){
  const i = OUR_INTRO.indexOf('\n\n   В настоящее'), j = OUR_INTRO.lastIndexOf('газета');
  [[0, i, true], [i, j, false], [j, OUR_INTRO.length, true]].forEach(([a, b, y]) => {
    const s = document.createElement('span');
    if (y) s.className = 'y';
    s.textContent = OUR_INTRO.slice(a, b);
    ointro.appendChild(s);
  });
})();
new Image().src = S + 'bg_our2.webp';
oimgcap.addEventListener('contextmenu', e => e.preventDefault());
let oTok = 0;
const oitems = OUR.map((v, i) => {
  const d = document.createElement('div');
  d.id = 'ol' + i;
  d.className = 'item olink';
  d.textContent = v.title;
  d.addEventListener('mouseenter', () => { hint.textContent = 'Описание издания'; });
  d.addEventListener('mouseleave', () => { hint.textContent = ''; });
  d.addEventListener('click', () => {
    oitems.forEach((e, j) => e.classList.toggle('sel', j === i));
    obg.classList.add('b2');
    ointro.style.display = 'none';
    otext.style.display = 'block';
    otext.textContent = v.desc;
    const tok = ++oTok, src = (v.img === 'f1' ? S : UI) + v.img + '.webp', im = new Image();
    im.onload = () => {
      if (tok !== oTok) return;
      const w = im.naturalWidth * 2, h = im.naturalHeight * 2;
      [oimg, oimgcap].forEach(e => {
        e.style.display = 'block';
        e.style.left = 'calc(' + Math.round(v.r[0] + (v.r[2] - w) / 2) + ' * var(--u))';
        e.style.top = 'calc(' + Math.round(v.r[1] + (v.r[3] - h) / 2) + ' * var(--u))';
        e.style.width = 'calc(' + w + ' * var(--u))';
        e.style.height = 'calc(' + h + ' * var(--u))';
      });
      oimg.style.backgroundImage = 'url(' + src + ')';
    };
    im.src = src;
  });
  our.appendChild(d);
  return d;
});
function openOur(){
  if (busy) return;
  busy = true;
  sfx('click_our.opus');
  setMusic('music_fantasy.opus');
  hint.textContent = '';
  our.style.display = 'block';
  our.animate(KF, OPT).onfinish = () => { busy = false; };
}
function closeOur(){
  if (busy) return;
  busy = true;
  sfx('click_back.wav');
  leaveMusic();
  revealStart();
  showBanner();
  hint.textContent = '';
  oback.style.visibility = 'hidden';
  main.style.zIndex = 3;
  main.animate(KF, OPT).onfinish = () => {
    main.style.zIndex = '';
    revealEnd();
    enterMusic();
    our.style.display = 'none';
    oback.src = S + 'back.webp';
    oback.style.visibility = '';
    document.querySelector('[data-icon="our"]').src = S + 'our.webp';
    oitems.forEach(e => e.classList.remove('sel'));
    obg.classList.remove('b2');
    ointro.style.display = '';
    otext.style.display = 'none';
    oTok++;
  oimg.style.display = oimgcap.style.display = 'none';
    busy = false;
  };
}
oback.addEventListener('click', closeOur);

const about = $('about');
[['acl', "Главный редактор\nВ. Зайковский\n\nПостановщики\nД. Еремин\nД. Русаков\n\nДизайн\nС. Тимонов\n\nПрограммирование\nА. Левов"], ['acr', "Редакционная коллегия\nА. Котко\nИ. Шаров\n\n\nЗвуковое оформление\nА. Романов\n\n\nРекламная служба\nС. Биневская\n(095) 273-6549"]].forEach(([id, txt]) => {
  const el = $(id), L = txt.split('\n');
  L.forEach((s, i) => {
    if (s && (i === 0 || !L[i - 1])) { const b = document.createElement('b'); b.textContent = s; el.appendChild(b); }
    else el.appendChild(document.createTextNode(s));
    el.appendChild(document.createTextNode('\n'));
  });
});
$('amm').textContent = "Мультимедиа-лаборатория РИГ \"Фантазия\": mmlab@submarine.ru";
$('ath').textContent = "Выражаем благодарность группе \"Токсик\" за помощь в создании звукового оформления диска.";
$('atr').textContent = "Тираж компакт-дисков изготовлен ООО \"Уральский электронный завод\".\nПредставительство в Москве: г. Москва, 3-й проезд Марьиной рощи, д.40, офис 711.\nтел.: (095) 289-96-85, тел./факс: (095) 289-41-80";
function openAbout(){
  if (busy) return;
  busy = true;
  sfx('click_about.opus');
  hint.textContent = '';
  about.style.display = 'block';
  about.animate(KF, OPT).onfinish = () => { busy = false; };
}
function closeAbout(){
  if (busy) return;
  busy = true;
  revealStart();
  showBanner();
  main.style.zIndex = 11;
  main.animate(KF, OPT).onfinish = () => {
    main.style.zIndex = '';
    revealEnd();
    about.style.display = 'none';
    document.querySelector('[data-icon="about"]').src = S + 'about.webp';
    busy = false;
  };
}
about.addEventListener('click', closeAbout);
document.querySelector('[data-icon="our"]').addEventListener('click', openOur);
document.querySelector('[data-icon="about"]').addEventListener('click', openAbout);

const SND = '../../shared/sound/';
const MUS = DISC.musicBase;
const VOLUME = 0.35;
const actx = new (window.AudioContext || window.webkitAudioContext)();
const master = actx.createGain();
master.gain.value = VOLUME;
master.connect(actx.destination);
const bufs = new Map(), pend = new Map();
const cacheP = window.caches ? caches.open(DISC.id + '-audio').catch(() => null) : Promise.resolve(null);
let musicHold = false, vPause = false, splashDone = !document.documentElement.classList.contains('splash');
let want = 'music_main.opus', curName = null, mcur = null, fb = null;

async function fetchAB(url){
  const c = await cacheP;
  let r = c ? await c.match(url) : null;
  if (!r){
    r = await fetch(url, {mode: 'cors'});
    if (!r.ok) throw new Error(r.status);
    if (c) c.put(url, r.clone()).catch(() => {});
  }
  return r.arrayBuffer();
}
async function fetchDecode(url){ return actx.decodeAudioData(await fetchAB(url)); }
function load(url){
  if (bufs.has(url)) return Promise.resolve(bufs.get(url));
  if (!pend.has(url)) pend.set(url, fetchDecode(url).then(b => { bufs.set(url, b); return b; }).finally(() => pend.delete(url)));
  return pend.get(url);
}
function sfx(name, force){
  if (!musicOn && !force) return;
  Promise.all([actx.resume(), load(SND + name)]).then(([, b]) => {
    const s = actx.createBufferSource();
    s.buffer = b;
    s.connect(master);
    s.start();
  }).catch(() => {});
}
function stopMusic(){
  if (mcur){
    const c = mcur;
    c.g.gain.setTargetAtTime(0, actx.currentTime, 0.05);
    setTimeout(() => c.s.stop(), 400);
    mcur = null;
  }
  if (fb) fb.pause();
  curName = null;
}
async function applyMusic(){
  if (!splashDone || vPause || musicHold || !musicOn || actx.state !== 'running' || curName === want) return;
  const name = want;
  let b = null;
  try { b = await load(MUS + name); } catch (e) {}
  if (want !== name || !musicOn || actx.state !== 'running') return;
  stopMusic();
  if (b){
    const g = actx.createGain();
    g.gain.value = 0;
    g.connect(master);
    const s = actx.createBufferSource();
    s.buffer = b;
    s.loop = true;
    s.connect(g);
    s.start();
    g.gain.setTargetAtTime(1, actx.currentTime, 0.1);
    mcur = {s, g};
    curName = name;
  } else {
    if (!fb){ fb = new Audio(); fb.loop = true; fb.volume = VOLUME; }
    fb.src = MUS + name;
    fb.play().then(() => { if (want === name && musicOn) curName = name; else fb.pause(); }).catch(() => {});
  }
}
function pauseAudio(){
  vPause = true;
  actx.suspend().catch(() => {});
  if (fb) fb.pause();
}
function resumeAudio(){
  vPause = false;
  actx.resume().then(applyMusic).catch(() => {});
  if (fb && curName && musicOn) fb.play().catch(() => {});
}
function leaveMusic(){ want = 'music_main.opus'; stopMusic(); musicHold = true; }
function enterMusic(){ musicHold = false; applyMusic(); }
function revealStart(){
  main.style.willChange = 'transform, opacity';
  document.querySelectorAll('.ban').forEach(b => { b.style.visibility = 'hidden'; });
}
function revealEnd(){
  main.style.willChange = '';
  document.querySelectorAll('.ban').forEach(b => { b.style.visibility = ''; });
}
function setMusic(name){ want = name; applyMusic(); }
function toggleMusic(){
  musicOn = !musicOn;
  renderMusic();
  sfx('click_music.wav', true);
  if (musicOn) applyMusic(); else stopMusic();
}
['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => {
  if (vPause) return;
  actx.resume().then(applyMusic);
}, {passive: true}));
actx.resume().then(applyMusic).catch(() => {});
['click_music.wav', 'click_back.wav'].forEach(n => load(SND + n).catch(() => {}));
setTimeout(() => ['click_our.opus', 'click_exit.opus', 'click_about.opus'].forEach(n => load(SND + n).catch(() => {})), 1500);

const WARM_UI = ['bg', 'video', 'video_anim', 'demo', 'demo_anim', 'patches', 'patches_anim', 'utils', 'utils_anim', 'bg_video1', 'bg_video2', 'bg_demo1', 'bg_demo2'];
const WARM_SH = ['music_on', 'music_on_anim', 'music_off', 'music_off_anim', 'exit', 'exit_anim', 'our', 'our_anim', 'about', 'about_anim', 'back', 'back_anim', 'install_demo', 'install_demo_anim', 'sv_panel', 'sv_hide_anim', 'sv_back_anim', 'sv_next_anim', 'sv_close_anim', 'bg_patches', 'bg_utils', 'install_patch', 'install_patch_anim', 'install_util', 'install_util_anim', 'play_video', 'play_video_anim', 'bn1', 'bn2'];
const warmKeep = [];
function warm(){
  const urls = WARM_UI.map(n => 'assets/img/ui/' + n + '.webp').concat(WARM_SH.map(n => S + n + '.webp'));
  let i = 0, active = 0;
  const next = () => {
    while (active < 3 && i < urls.length){
      const im = new Image();
      warmKeep.push(im);
      active++;
      im.src = urls[i++];
      (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).finally(() => { active--; next(); });
    }
  };
  next();
}

(async function(){
  const root = document.documentElement;
  if (!root.classList.contains('splash')){ startTicker(); setTimeout(warm, 800); return; }
  try { sessionStorage.setItem(DISC.id + '-splash', '1'); } catch (e) {}
  const spl = $('spl'), v = $('splv');
  spl.addEventListener('contextmenu', e => e.preventDefault());
  let ended = false, started = false;
  const leave = () => {
    root.classList.remove('splash');
    splashDone = true;
    v.pause();
    applyMusic();
    startTicker();
    setTimeout(warm, 800);
  };
  const finish = delay => {
    if (ended) return;
    ended = true;
    setTimeout(leave, delay);
  };
  v.addEventListener('ended', () => finish(1000));
  v.addEventListener('error', () => finish(0));
  v.addEventListener('playing', () => { started = true; });
  setTimeout(() => { if (!started) finish(0); }, 8000);
  v.src = 'assets/img/ui/splash.webm';
  v.volume = 0.5;
  v.muted = false;
  v.play().catch(() => {
    v.muted = true;
    v.play().catch(() => finish(0));
    const unmute = () => { v.muted = false; };
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, unmute, {once: true, passive: true}));
  });
})();

renderMusic();
renderExit();
hint.textContent = '';