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

document.querySelectorAll('.btn').forEach(b => {
  const n = b.dataset.icon;
  new Image().src = S + n + '_anim.webp';
  b.src = S + n + '.webp';
  b.addEventListener('mouseenter', () => { b.src = S + n + '_anim.webp'; hint.textContent = b.dataset.hint || ''; });
  b.addEventListener('mouseleave', () => { b.src = S + n + '.webp'; hint.textContent = ''; });
});

document.querySelectorAll('.ban').forEach(b => {
  b.addEventListener('mouseenter', () => { hint.textContent = b.dataset.hint; });
  b.addEventListener('mouseleave', () => { hint.textContent = ''; });
  b.addEventListener('click', () => { window.open(b.dataset.url, '_blank', 'noopener'); });
});

const VID = [
  {"title": "Lands of Lore III", "img": "lol3", "vk": "oid=-240437459&id=456239109&hash=d31d7452a108f242", "desc": "Lands of Lore III\nWestwood\nwww.westwood.com\nТретья часть эпохальной саги была обещана в лучших традициях части первой… Что ж, посмотрим. В следующем номере у нас обзор Lands of Lore III, а пока посмотрите на фильмик."},
  {"title": "Shogun", "img": "shogun", "vk": "oid=-240437459&id=456239107&hash=3df2e2407eb46fdb", "desc": "Shogun\nElectronic Arts\nwww.ea.com\nК сожалению, эта историческая стратегическая игра про китайских императоров с выходом решила задержаться. Но зато уже сейчас можно посмотреть на то, какова она будет в действии."},
  {"title": "Rainbow 6: Eagle Watch", "img": "r6", "vk": "oid=-240437459&id=456239088&hash=bacb0180af1c9e91", "desc": "Rainbow 6: Eagle Watch\nRed Storm Entertainment\nwww.redstorm.com\nMission-pack известной игрушки от Тома Клэнси описан в нашей обойме, а зджесь вы сможете посмотреть, как это выглядит в игре. Сам же pack обещает очень сильно порадовать поклонников игрушки про спецназ."},
  {"title": "Star Trek: Starfleet Command", "img": "st", "vk": "oid=-240437459&id=456239108&hash=991f9a618720c4bf", "desc": "Star Trek: Starfleet Command\nInterplay\nwww.interplay.com\nДо сих пор вселенная Star Trek не имела ни одной real-time стратегии. А скоро будет иметь. Прилагаемый видеоролик служит наглядной иллюстрацией к публикуемой в \"Предварительном просмотре\" статье."}
];
const main = document.getElementById('main');
const vid = document.getElementById('video');
const back = document.getElementById('back');
const list = document.getElementById('list');
const det = document.getElementById('det');
const vbg = document.getElementById('vbg');
let cur = -1;
new Image().src = 'assets/img/ui/bg_video2.webp';
document.getElementById('shotcap').addEventListener('contextmenu', e => e.preventDefault());
let busy = false;
const KF = [{transform:'scale(0.5)', opacity:0}, {transform:'scale(1)', opacity:1}];
const OPT = {duration:600, easing:'ease-out'};

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
  items.forEach((e, j) => e.classList.toggle('sel', j === i));
  document.getElementById('dtitle').textContent = L[0];
  document.getElementById('dpub').textContent = L[1];
  document.getElementById('durl').textContent = L[2];
  document.getElementById('ddesc').textContent = L.slice(3).join('\n');
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
    document.querySelector('[data-icon="video"]').src = S + 'video.webp';
    items.forEach(e => e.classList.remove('sel'));
    det.classList.remove('on');
    busy = false;
  };
}
const DEM = [
  {"title": "Descent 3", "img": "descent", "desc": "Descent 3\nInterplay\nwww.interplay.com\nDescent 3, как и \"предыдущие серии\", состоит в основном из бесконечных коридоров и взбесившихся роботов и не более того. Разве что для кратковременного отдыха и лечения регулярных приступов клаустрофобии в игру добавлены открытые пространства - в деме мы пролетаем небольшой котлован со здоровенным, плюющимся огнем луноходом…"},
  {"title": "Kingpin", "img": "kingpin", "desc": "Kingpin\nInterplay\nwww.interplay.com\nГде-то, незнамо где, простирается мир \"Кингпин\". Здесь не стыдно быть нищим, не стыдно входить в шайку головорезов, не стыдно убивать направо и налево. Но нищим быть никто не хочет, лучше быть настоящим паханом, который сам уже никого не убивает, а зашибает баксы, управляя своей бандой."},
  {"title": "Aliens vs Predator: Marine", "img": "marine", "desc": "Aliens vs Predator: Marine\nFox Interactive\nwww.foxinteractive.com\nОчень непросто передать ту атмосферу, которой наполнена игра, где вы выступаете в роли пехотинца. Дело в том, что там взаправду страшно, иногда даже сердце колоть начинает от особо недобрых моментов… Демоверсия находится на нашем CD-ROM (Data\\Demo\\avp_marine.zip)."},
  {"title": "Aliens vs Predator: Predator", "img": "predator", "desc": "Aliens vs Predator: Predator\nFox Interactive\nwww.foxinteractive.com\nИграя за пехотинца, вы все-таки больше похожи на кролика, который стремится к себе в норку, - там тепло, спокойно, а главное - сухо. Будучи же хищником, вы в полной мере понимаете, что такое охотник, выслеживающий свою жертву. Причем жертва намного слабее вас самих, хотя и не всегда. Демоверсия находится на нашем CD-ROM (Data\\Demo\\avp.zip)."},
  {"title": "Aliens vs Predator: Alien", "img": "alien", "desc": "Aliens vs Predator: Alien\nFox Interactive\nwww.foxinteractive.com\nКроме лазанья по стенам, Чужие также обладают весьма интересной способностью прыгать на очень длинные расстояния - можно в два прыжка пересечь весьма больших размеров зал, веселое занятие, знаете ли. Если бы Чужие могли участвовать в соревнованиях по прыжкам в длину, нетрудно догадаться, кто был бы первым."},
  {"title": "X-Wing: Alliance", "img": "xwing", "desc": "X-Wing: Alliance\nLucas Arts\nwww.lucasarts.com\nВот и вышла очередная игра, продолжающая погружать фанатов в мир Звездных Войн. Называется этот очередной шедевр от компании LucasArts - StarWars: X-Wing Alliance. Ожидали эту игру давно и с нетерпением, и, в принципе, фанаты не разочарованы. Игрушка получилась просто превосходная! Теперь это не просто война между Империей и Повстанцами: в Х-Wing Alliance впервые вы начинаете на стороне рядовых обывателей. Демоверсия находится на нашем CD-ROM (Data\\Demo\\xwademo.exe)"},
  {"title": "Redline", "img": "redline", "desc": "Redline\nAccolade\nwww.accolade.com\nМысль взять курс на новые технологии зародилась в лучших умах Accolade пару лет назад, и они решили немедленно развернуть работы над первым проектом, поддерживающим 3D-ускорители. Честь стать \"первым блином\" выпала на долю Redline, симулятора автомобильно-пешеходных войн, сочетающего в себе Interstate-76, Carmageddon и Death Track (правда, только убеленные сединами игроки вспомнят эту античную игру от Activision), с одной стороны, и Quake - с другой. Демка предоставляет возможность сетевой игры."},
  {"title": "Tanktics", "img": "tanctics", "desc": "Tanktics\nGremlin\nwww.gremlin.co.uk\nГремлины называют ЭТО стратегией. Что ж, можно сказать и так. Игрушка нарисована, именно нарисована, в лучших традициях мультиков. Все дело (все дела) происходит на странных пространствах, более всего напоминающих красочные столы для пинбола. По пространствам, как нетрудно догадаться из названия, ездят танки. Но какие! Танки из далекого детства, похожие на красочные пирамидки из гладкой цветной пластмассы. Так что, Tanktiks - стратегия танковых пирамидок. Демоверсия находится на нашем CD-ROM (Data\\Demo\\tankticsdemo.zip)."},
  {"title": "Worms Armageddon", "img": "worms", "desc": "Worms Armageddon\nMicroProse\nwww.microprose.com\n\"Черви\" - это культово. Армагеддон - последняя их \"плоская\" серия, ибо третьи обещают быть полностью 3D. По сравнению с \"Червями\" вторыми добавилось оружия, пейзажей, музыки и озвучки. Теперь черви ругаются по-русски…"},
  {"title": "North vs South", "img": "north", "desc": "North vs South\nInteractive Magic\nwww.imagicgames.co.uk\nЕще одна возможность переписать историю войны Севера и Юга, на сей раз в исполнении Interactive Magic. Любители исторических варгеймов, это для вас."},
  {"title": "Roller Coaster Tycoon", "img": "roller", "desc": "Roller Coaster Tycoon\nMicroProse\nwww.microprose.com\nХотите построить свой собственный ЦПКиО им. Горького? Тогда Roller Coaster Tycoon - игрушка для вас! Путем строительства американских (\"русских\") горок, аттракционов, детских железных дорог и каруселей вам предстоит заработать кучу денег и стать главным магнатом парков развлечений."}
];
const $ = id => document.getElementById(id);
const demo = $('demo'), dback = $('dback'), dlist = $('dlist'), ddet = $('ddet'), dbg = $('dbg');
const dshot2 = $('dshot2'), dshot = $('dshot'), dshotcap = $('dshotcap'), fs = $('fs'), fsimg = $('fsimg'), pm = $('pm');
let dcur = -1, pmT = 0;
new Image().src = 'assets/img/ui/bg_demo2.webp';
[dshotcap, fs].forEach(e => e.addEventListener('contextmenu', ev => ev.preventDefault()));

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
  ditems.forEach((e, j) => e.classList.toggle('sel', j === i));
  $('dtext').textContent = DEM[i].desc;
  dshot.style.backgroundImage = dshot2.style.backgroundImage = 'url(assets/img/content/' + DEM[i].img + '.webp)';
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
    document.querySelector('[data-icon="demo"]').src = S + 'demo.webp';
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
dshotcap.addEventListener('click', async () => {
  hlOff();
  const url = 'url(assets/img/content/' + DEM[dcur].img + '.webp)';
  fsimg.style.backgroundImage = url;
  try { const im = new Image(); im.src = url.slice(4, -1); await im.decode(); } catch (e) {}
  fs.style.display = 'block';
});
fs.addEventListener('click', e => {
  noHl = true; hlX = e.clientX; hlY = e.clientY;
  fs.style.display = 'none';
});
function hideMsg(){ clearTimeout(pmT); pm.classList.remove('on'); }
$('inst').addEventListener('click', () => {
  hint.textContent = '';
  pm.classList.add('on');
  clearTimeout(pmT);
  pmT = setTimeout(hideMsg, 1000);
});
pm.addEventListener('click', hideMsg);

const PAT = [
  {"ver": "v3.0b", "title": "Close Combat III", "desc": "Патч в основном решает проблемы многопользовательской игры, а также несколько увеличивает скорость. В частности, соединение по сети теперь более стабильно."},
  {"ver": "v1.1", "title": "Heroes of Might and Magic III", "desc": "Патч совершенствует игру в соответствии с пожеланиями геймеров. Как водится, исправлены все (или почти все) баги режима multiplayer и произведены некоторые незначительные доработки singl'a."},
  {"ver": "v1.0.0.9", "title": "Half-Life", "desc": "Патч увеличивает версию игры с 1.0.0.4 до 1.0.0.9. Он содержит новые возможности для multiplayer. В частности карты, модели и многое другое."},
  {"ver": "v1.01", "title": "Sin", "desc": "Патч версии 1.04 увеличивает версию игры с 1.01 до 1.04. Основная его цель - добавить в игру возможность CTF (Capture The Flag). Перед тем, как запускать этот патч у вас должна быть установлена версия 1.01. Если это не так, сначала установите патч версии 1.01."},
  {"ver": "v1.04", "title": "Sin", "desc": "Патч версии 1.04 увеличивает версию игры с 1.01 до 1.04. Основная его цель - добавить в игру возможность CTF (Capture The Flag). Перед тем, как запускать этот патч у вас должна быть установлена версия 1.01. Если это не так, сначала установите патч версии 1.01."},
  {"ver": "v1.1", "title": "Requiem", "desc": "Патч вносит некоторые изменения в игру с использованием Direct3D (улучшается графика) и отменяет такую функцию, как auto-mipmapping, после чего улучшается прорисовка текстур."},
  {"ver": "v2.1", "title": "Blood II", "desc": "Если у вас установлена версия Blood 2: Nightmares, вам не нужен этот патч. Он исправляет многие баги, и после его установки вы не сможете поиграть в сохраненные игры."},
  {"ver": "v1.02", "title": "Imperialism II", "desc": "Просто увеличивает версию игры Inperialism II: Age of Exploration до v1.02. Более никаких подробностей не сообщается."},
  {"ver": "v1.2.1", "title": "Myth 2", "desc": "Исправлены проблемы с 3D-акселлераторами, добавлена возможность использовать в игре правую кнопку мышки и многое другое."},
  {"ver": "v3.0", "title": "Alpha Centauri", "desc": "Версия 3.0 включает некоторые новые возможности из которых стоит отметить режимы multiplayer'a Hotseat и игру по e-mail'y, а также здесь исправлены некоторые незначительные баги."}
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
    document.querySelector('[data-icon="patches"]').src = S + 'patches.webp';
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
  {"title": "Direct X 6.1", "desc": "32-битные игровые драйверы для Windows. Если вы не знаете что это такое - вам они не нужны."},
  {"title": "ICQ 99a Beta v.2.15 Build #1701", "desc": "Найдите себе друзей в сети Internet."},
  {"title": "Quick Time 3.0.2", "desc": "Видео-проигрыватель многих графических форматов."},
  {"title": "Winamp 2.10", "desc": "Проигрыватель музыкальных файлов многих форматов. В том числе MP3, Wav и т.д."},
  {"title": "Winzip 7.0 SR-1", "desc": "Популярный архиватор для Windows. Позволяет с легкостью оперировать архивами ZIP."},
  {"title": "FTP Voyager 6.1", "desc": "Позволяет с легкостью загружать и скачивать файлы из Internet."},
  {"title": "Audio CD MP3 Studio 1.1b", "desc": "Запишите собственный аудио-CD поместив на него записи в формате MP3. Программа находится на нашем CD-ROM (Data\\Soft\\acd11b.zip)"},
  {"title": "Windows Blinds 0.80", "desc": "Изменяет то, как выглядит и ведет себя ваша операционная система. Программа находится на нашем CD-ROM (Data\\Soft\\wblind80.zip)"},
  {"title": "Paint Shop Pro (Demo) 5.01", "desc": "Просмотр, редактирование и конвертация картинок любого формата. Программа находится на нашем CD-ROM (Data\\Soft\\psp501ev.zip)"},
  {"title": "ICQ Plus 1.02", "desc": "Изменяет вид вашей ICQ на рабочем столе. Программа находится на нашем CD-ROM (Data\\Soft\\iplus102.zip)"},
  {"title": "ACDSee 2.4", "desc": "Одна из самых популярных программ, позволяющих просматривать картинки любых форматов."}
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
    document.querySelector('[data-icon="utils"]').src = S + 'utils.webp';
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
new Image().src = 'assets/img/ui/bg_our2.webp';
oimgcap.addEventListener('contextmenu', e => e.preventDefault());
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
    [oimg, oimgcap].forEach(e => {
      e.style.display = 'block';
      e.style.left = 'calc(' + v.r[0] + ' * var(--u))';
      e.style.top = 'calc(' + v.r[1] + ' * var(--u))';
      e.style.width = 'calc(' + v.r[2] + ' * var(--u))';
      e.style.height = 'calc(' + v.r[3] + ' * var(--u))';
    });
    oimg.style.backgroundImage = 'url(assets/img/ui/' + v.img + '.webp)';
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

document.querySelector('[data-icon="demo"]').addEventListener('click', openDemo);
document.querySelector('[data-icon="patches"]').addEventListener('click', openPatch);
document.querySelector('[data-icon="utils"]').addEventListener('click', openUtil);
document.querySelector('[data-icon="our"]').addEventListener('click', openOur);
document.querySelector('[data-icon="about"]').addEventListener('click', openAbout);

const SND = '../../shared/sound/';
const MUS = 'https://pub-458fa612ee1e4b929955e64ec40245a2.r2.dev/music/mega/1999/05/';
const VOLUME = 0.35;
const actx = new (window.AudioContext || window.webkitAudioContext)();
const master = actx.createGain();
master.gain.value = VOLUME;
master.connect(actx.destination);
const bufs = new Map(), pend = new Map();
const cacheP = window.caches ? caches.open('mega-1999-05-audio').catch(() => null) : Promise.resolve(null);
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
  if (!pend.has(url)) pend.set(url, (async () => {
    let b;
    try { b = await fetchDecode(url); }
    catch (e) { if (/\.opus$/.test(url)) b = await fetchDecode(url.replace(/\.opus$/, '.m4a')); else throw e; }
    bufs.set(url, b);
    return b;
  })().finally(() => pend.delete(url)));
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

const WARM_UI = ['bg', 'bg_video1', 'bg_video2', 'bg_demo1', 'bg_demo2', 'bg_patches', 'bg_utils', 'bg_our1', 'bg_our2', 'bg_about'];
const WARM_SH = ['music_on', 'music_on_anim', 'music_off', 'music_off_anim', 'exit', 'exit_anim', 'our', 'our_anim', 'about', 'about_anim',
  'video', 'video_anim', 'demo', 'demo_anim', 'patches', 'patches_anim', 'utils', 'utils_anim', 'back', 'back_anim',
  'play_video', 'play_video_anim', 'install_demo', 'install_demo_anim', 'install_patch', 'install_patch_anim',
  'install_util', 'install_util_anim', 'bn1', 'bn2'];
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
  if (!root.classList.contains('splash')){ setTimeout(warm, 800); return; }
  try { sessionStorage.setItem('mega-1999-05-splash', '1'); } catch (e) {}
  $('spl').addEventListener('contextmenu', e => e.preventDefault());
  let total = 0;
  try {
    const r = await fetch('assets/img/ui/splash.webp');
    if (!r.ok) throw new Error(r.status);
    const buf = await r.arrayBuffer(), dv = new DataView(buf);
    for (let i = 12; i + 8 <= buf.byteLength;){
      const tag = String.fromCharCode(dv.getUint8(i), dv.getUint8(i + 1), dv.getUint8(i + 2), dv.getUint8(i + 3)), n = dv.getUint32(i + 4, true);
      if (tag === 'ANIM') dv.setUint16(i + 12, 1, true);
      else if (tag === 'ANMF') total += dv.getUint8(i + 20) | (dv.getUint8(i + 21) << 8) | (dv.getUint8(i + 22) << 16);
      i += 8 + n + (n & 1);
    }
    const url = URL.createObjectURL(new Blob([buf], {type: 'image/webp'}));
    const im = new Image();
    im.src = url;
    await im.decode();
    $('splimg').style.backgroundImage = 'url(' + url + ')';
  } catch (e) { total = -1000; }
  setTimeout(() => { root.classList.remove('splash'); splashDone = true; applyMusic(); setTimeout(warm, 800); }, total + 1000);
})();

renderMusic();
renderExit();
hint.textContent = '';
