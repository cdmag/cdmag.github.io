let demos = [];
let currentDemo = null;
let viewMode = 'screens';

function showScene(id) {
  document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
  document.getElementById('scene-' + id).classList.add('active');
}

function showMsg(overlayId, text) {
  const ov = document.getElementById(overlayId);
  if (!ov) return;
  const box = ov.querySelector('.msg-box');
  if (box && text) box.textContent = text;
  ov.style.display = 'flex';
  const hide = () => { ov.style.display = 'none'; ov.removeEventListener('click', hide); };
  ov.addEventListener('click', hide);
  setTimeout(hide, 1000);
}

document.querySelectorAll('.signpost[data-click]').forEach(sp => {
  sp.addEventListener('click', () => showScene(sp.dataset.click));
});

document.querySelectorAll('.music-tracks div').forEach(tr => {
  tr.addEventListener('click', () => {
    showMsg('msg-overlay-music', 'Музыка включается в плеере слева от оболочки');
  });
});

function fitBalloonText(bal) {
  const t = bal.querySelector('.text');
  if (!t) return;
  t.style.fontSize = ''; // reset to CSS clamp
  let size = parseFloat(getComputedStyle(t).fontSize);
  const min = 8;
  while (size > min && (t.scrollHeight > t.clientHeight + 1 || t.scrollWidth > t.clientWidth + 1)) {
    size -= 0.5;
    t.style.fontSize = size + 'px';
  }
}

function setupHotspots(scene) {
  scene.querySelectorAll('.hotspot').forEach(hs => {
    const id = hs.dataset.id;
    const bal = document.getElementById('b' + id);
    if (bal) {
      hs.addEventListener('mouseenter', () => {
        bal.style.display = 'block';
        requestAnimationFrame(() => fitBalloonText(bal));
      });
      hs.addEventListener('mouseleave', () => bal.style.display = 'none');
    }
    const go = hs.dataset.click;
    if (go) hs.addEventListener('click', () => showScene(go));
  });
}

function renderList() {
  const list = document.getElementById('demo-list');
  list.innerHTML = '';
  demos.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'item' + (i === 0 ? ' selected' : '');
    el.textContent = d.title;
    el.dataset.idx = i;
    el.addEventListener('click', () => selectDemo(i));
    list.appendChild(el);
  });
  if (demos.length) selectDemo(0);
}

function selectDemo(idx) {
  currentDemo = demos[idx];
  document.querySelectorAll('.demo-list .item').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  viewMode = 'screens';
  updateDemoView();
}

function updateDemoView() {
  const screens = document.getElementById('demo-screens');
  const desc = document.getElementById('demo-desc');
  const full = document.getElementById('demo-full');
  const btns = document.getElementById('demo-btns');
  const btnText = document.getElementById('btn-text');

  screens.style.display = 'none';
  desc.style.display = 'none';
  full.style.display = 'none';
  btns.style.display = currentDemo ? 'flex' : 'none';

  if (!currentDemo) return;

  if (viewMode === 'screens') {
    screens.style.display = 'grid';
    screens.innerHTML = '';
    (currentDemo.screens || []).slice(0, 9).forEach(src => {
      const img = document.createElement('img');
      img.src = 'assets/img/content/' + src;
      img.alt = '';
      img.addEventListener('click', () => {
        document.getElementById('demo-full-img').src = img.src;
        viewMode = 'full';
        updateDemoView();
      });
      screens.appendChild(img);
    });
    btnText.textContent = 'Текст';
  } else if (viewMode === 'text') {
    desc.style.display = 'block';
    desc.textContent = currentDemo.text;
    desc.scrollTop = 0;
    btnText.textContent = 'Картинки';
  } else if (viewMode === 'full') {
    full.style.display = 'flex';
  }
}

document.getElementById('btn-text').addEventListener('click', () => {
  viewMode = (viewMode === 'text') ? 'screens' : 'text';
  updateDemoView();
});

document.getElementById('demo-full').addEventListener('click', () => {
  viewMode = 'screens';
  updateDemoView();
});

document.getElementById('btn-install').addEventListener('click', () => {
  const ov = document.getElementById('msg-overlay');
  ov.style.display = 'flex';
  const hide = () => { ov.style.display = 'none'; ov.removeEventListener('click', hide); };
  ov.addEventListener('click', hide);
  setTimeout(hide, 1000);
});

setupHotspots(document.getElementById('scene-main'));
setupHotspots(document.getElementById('scene-about'));
setupHotspots(document.getElementById('scene-park'));
setupHotspots(document.getElementById('scene-demo'));
setupHotspots(document.getElementById('scene-patches'));
setupHotspots(document.getElementById('scene-util'));
setupHotspots(document.getElementById('scene-music'));

window.addEventListener('resize', () => {
  document.querySelectorAll('.balloon').forEach(bal => {
    if (bal.style.display === 'block') fitBalloonText(bal);
  });
});

let patches = [];
let currentPatch = null;

function renderPatchList() {
  const list = document.getElementById('patch-list');
  list.innerHTML = '';
  patches.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.textContent = p.file;
    el.dataset.idx = i;
    el.addEventListener('click', () => selectPatch(i));
    list.appendChild(el);
  });
}

function selectPatch(idx) {
  currentPatch = patches[idx];
  document.querySelectorAll('#patch-list .item').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  const desc = document.getElementById('patch-desc');
  const btns = document.getElementById('patch-btns');
  desc.style.display = 'block';
  desc.textContent = currentPatch.text;
  desc.scrollTop = 0;
  btns.style.display = 'flex';
}

document.getElementById('btn-patch-write').addEventListener('click', () => {
  const ov = document.getElementById('msg-overlay-patch');
  ov.style.display = 'flex';
  const hide = () => { ov.style.display = 'none'; ov.removeEventListener('click', hide); };
  ov.addEventListener('click', hide);
  setTimeout(hide, 1000);
});

fetch('assets/data/demos.json')
  .then(r => r.json())
  .then(data => { demos = data; renderList(); })
  .catch(e => console.error(e));

fetch('assets/data/patches.json')
  .then(r => r.json())
  .then(data => { patches = data; renderPatchList(); })
  .catch(e => console.error(e));

let utils = [];
let currentUtil = null;

function renderUtilList() {
  const list = document.getElementById('util-list');
  list.innerHTML = '';
  utils.forEach((u, i) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.textContent = u.file;
    el.dataset.idx = i;
    el.addEventListener('click', () => selectUtil(i));
    list.appendChild(el);
  });
}

function selectUtil(idx) {
  currentUtil = utils[idx];
  document.querySelectorAll('#util-list .item').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  const desc = document.getElementById('util-desc');
  const btns = document.getElementById('util-btns');
  desc.style.display = 'block';
  desc.textContent = currentUtil.text;
  desc.scrollTop = 0;
  btns.style.display = 'flex';
}

document.getElementById('btn-util-write').addEventListener('click', () => {
  const ov = document.getElementById('msg-overlay-util');
  ov.style.display = 'flex';
  const hide = () => { ov.style.display = 'none'; ov.removeEventListener('click', hide); };
  ov.addEventListener('click', hide);
  setTimeout(hide, 1000);
});

fetch('assets/data/utils.json')
  .then(r => r.json())
  .then(data => { utils = data; renderUtilList(); })
  .catch(e => console.error(e));

document.getElementById('music-text').textContent =
`Идею облагораживать грубый игровой софт сладкозвучной музыкой, как нам кажется, можно назвать самым выдающимся достижением Game.EXE за последние полтора века. У нас наполеоновские планы: октябрьский “компакт” будет украшать эксклюзивная запись с московского концерта “Роллинг Стоунз”, сделанная Колей Радовским при помощи карманного CD-рекордера собственного изготовления (ISDN-качество гарантировано); ноябрьский диск порадует вас новым альбомом БГ (Борис Борисыч никому не дал, а вот нам — легко), декабрьский... Впрочем, что далеко заглядывать! Перед вами — сентябрьский .EXE-диск с очередным бонус-треком: зпивает Эдуард Хиль... то есть, пардон, у рояля... то есть на “Ямахе” наяривает сам...  КранК. Как говорится, не ждали? А кто, по-вашему, сочинил и исполнил всю музыку к нашим любимым “Вангерам”? То-то. Читайте объяснительную Самого. И — слушайте музыку! Все 9 вангеровских треков!..


Объяснительная

Читателям Game.УЧУ
от главного вангера КранКа

Все авторские права на музыку, используемую в “Вангерах”, принадлежат Андрею “КранКу” Кузьмину и Виктору “Руберу” Краснокутскому.
...А началось все это очень давно — когда КранКа еще не было и в помине, а его протоноситель учился в средней школе... В один прекрасный день он (протоноситель) отчетливо ощутил присутствие в мире странного завораживающего прибора — Пианины. Малыш-десятиклассник часами мог стукать по клавише и долго слушать струящийся звук... И закрутилось. Скоро оказалось, что комбинации звуков трогали суть происходящего, и уже через несколько месяцев возникла некая странноватая группа “Красный Квадрат”, снискавшая в своем андерграунде немало поклонников, — о, это был романтичный век!
А потом случились компьютеры, родился КранК, сгустилась K-D Lab, специально съездили в Варшаву за редкой тогда “Ямахой” DB50XG, и вскоре по дорогам Униванга заколесили ОНИ. За год до релиза “Вангеров” в K-D Lab пришел Рубер и объявил, что он есть по сути своей музыкант и композитор. КранК же как раз фатально не успевал заниматься еще и музыкой — и судьба решила эту проблему. Рубер принял в себя музыкальные темы КранКа (кроме последней — эта добавилась в самом конце проекта из собственных сочинений самого Виктора), многие из которых были заморожены еще в ту самую романтичную эпоху, и начал их думать, работать, обогащать и развивать. Результат этого симбиоза перед вами. У разработчиков, к сожалению, не было под рукой дорогой аппаратуры, но вдумчивый слушатель наверняка уловит среди этих звуков то, что хотели передать авторы. Это только начало их творческого пути...`;
