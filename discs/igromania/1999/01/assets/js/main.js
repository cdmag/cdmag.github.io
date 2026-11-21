const LEGAL_TEXT = [
  'Все представленные на данном компакт-диске программы являются демонстрационными версиями соответствующих продуктов и не предназначены для совершения каких-либо действий, отличных от демонстрационных. Данные программные продукты, являясь собственностью соответствующих компаний, защищены законами об авторских и смежных правах и международными соглашениями.',
  'Конечный пользователь, установивший данные программы, ИМЕЕТ право:',
  '– использовать эти программы на отдельном компьютере;',
  '– использовать программы в локальной сети с обязательным соблюдением наличия у каждого пользователя копии данного лицензионного соглашения, если это не противоречит условиям соответствующей лицензии данного продукта;',
  '– использовать программы на другом компьютере, если на первом они уже не используются;',
  '– копировать программы с целью резервного сохранения с обязательным соблюдением наличия в каждом архиве соответствующей лицензии и данного лицензионного соглашения.',
  'Конечный пользователь, установивший данные программы, НЕ ИМЕЕТ права:',
  '– допускать других пользователей к использованию данных продуктов по основаниям, не предусмотренным данным лицензионным соглашением;',
  '– допускать одновременное использование программ, если иное не предусмотрено условиями соответствующей лицензии данного продукта;',
  '– изменять, преобразовывать, вносить поправки в исходный код, декомпилировать, дисассемблировать или создавать производные продукты на основе данных программ;',
  '– копировать программы по основаниям, не предусмотренным данным лицензионным соглашением;',
  '– продавать, тиражировать или как-либо распространять программы с целью получения прибыли;',
  '– давать напрокат, сдавать в наем или каким-либо иным образом передавать права на использование этих программ;',
  '– удалять любые товарные знаки, торговые марки и лицензионные документы, содержащиеся в данных программах, равно как и уничтожать данное лицензионное соглашение.',
  'Распространение данных программ разрешено только с письменного согласия соответствующих компаний, если иное не предусмотрено условиями соответствующей лицензии данного продукта.',
  'Программы, являющиеся условно-бесплатными (Shareware), разрешено использовать только в течение срока действия лицензии соответствующего продукта (если таковой указан), по истечении данного срока вы обязаны либо приобрести данный продукт, тем самым заключив новое соглашение, либо прекратить его дальнейшее использование, удалить его и не устанавливать вновь. Несоблюдение данного требования будет расцениваться как нарушение авторских и смежных прав соответствующих компаний.',
  'ВНИМАНИЕ! Нарушение данного лицензионного соглашения или его части, равно как и нарушение условий соответствующей лицензии любой из программ, влечет гражданскую и уголовную ответственность.',
  'Если вы не согласны с данным лицензионным соглашением или его частью, то вы должны НЕМЕДЛЕННО прекратить использование любых программных продуктов, представленных на данном компакт-диске.',
  'Все указанные товарные знаки и торговые марки являются зарегистрированной собственностью соответствующих компаний.',
  'Все программы были протестированы, тем не менее пользователь использует их на свой риск. Игромания не несет ответственности за любой ущерб, который может произойти от использования размещенных на диске программ.'
];
document.getElementById('legalText').innerHTML =
  LEGAL_TEXT.map(t => '<p>' + t + '</p>').join('');

const legalScroll = document.getElementById('legalScroll');
const sbThumb = document.getElementById('sbThumb');
const sbTrack = document.getElementById('sbTrack');

function sbUpdate() {
  const maxScroll = legalScroll.scrollHeight - legalScroll.clientHeight;
  if (maxScroll <= 0) { sbThumb.style.display = 'none'; return; }
  sbThumb.style.display = 'block';
  const trackH = sbTrack.clientHeight;

  const thumbH = Math.max(20, Math.round(trackH * legalScroll.clientHeight / legalScroll.scrollHeight));
  const top = Math.round((trackH - thumbH) * legalScroll.scrollTop / maxScroll);
  sbThumb.style.height = thumbH + 'px';
  sbThumb.style.top = top + 'px';
}
legalScroll.addEventListener('scroll', sbUpdate);
window.addEventListener('resize', sbUpdate);

if (document.fonts && document.fonts.ready) document.fonts.ready.then(sbUpdate);

document.getElementById('sbUp').addEventListener('click', () =>
  legalScroll.scrollTop -= Math.round(legalScroll.clientHeight * 0.25));
document.getElementById('sbDown').addEventListener('click', () =>
  legalScroll.scrollTop += Math.round(legalScroll.clientHeight * 0.25));

document.getElementById('sbTrack').addEventListener('click', e => {
  if (e.target === sbThumb) return;
  const rect = sbTrack.getBoundingClientRect();
  const y = (e.clientY - rect.top) / rect.height;
  const maxScroll = legalScroll.scrollHeight - legalScroll.clientHeight;
  legalScroll.scrollTop = y * maxScroll;
});

let sbDrag = null;
sbThumb.addEventListener('mousedown', e => {
  e.preventDefault();
  sbDrag = {
    startY: e.clientY,
    startTop: legalScroll.scrollTop,
    maxScroll: legalScroll.scrollHeight - legalScroll.clientHeight,
    trackH: sbTrack.clientHeight
  };
});
window.addEventListener('mousemove', e => {
  if (!sbDrag) return;
  const dy = e.clientY - sbDrag.startY;
  legalScroll.scrollTop = sbDrag.startTop + dy / (sbDrag.trackH - sbThumb.clientHeight) * sbDrag.maxScroll;
});
window.addEventListener('mouseup', () => { sbDrag = null; });

const splashLayer = document.getElementById('splashLayer');
const splashCanvas = document.getElementById('splashCanvas');
const splashAudio = new Audio('../../shared/sound/splash98.wav');
splashAudio.volume = 0.15;

let splashTimer = null;

let splashSoundPlayed = false;

function splashAudioTryPlay() {
  if (splashSoundPlayed) return;
  splashSoundPlayed = true;
  try {
    const pr = splashAudio.play();
    if (pr && pr.catch) pr.catch(() => {});
  } catch (e) {}
}

function mosaicGrid() {
  const stage = document.getElementById('stage');
  const W = stage.clientWidth, H = stage.clientHeight;
  const cell = Math.max(12, Math.round(W * 0.04));
  const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
  return { W, H, cell, cols, rows };
}

function shuffledOrder(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function runSplash() {
  document.getElementById('screenMain').classList.remove('active', 'entered');
  hideLegalScreen();
  splashLayer.classList.add('active');
  splashAudioTryPlay();

  const img = new Image();
  img.onload = () => drawSplashMosaic(img);
  img.onerror = () => finishSplash();
  img.src = 'assets/img/content/splash.webp';
}

function drawSplashMosaic(img) {
  const { W, H, cell } = mosaicGrid();
  splashCanvas.width = W;
  splashCanvas.height = H;
  const ctx = splashCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  const drawW = Math.round(W * 0.45);
  const drawH = Math.round(drawW * img.height / img.width);
  const logoX = Math.round((W - drawW) / 2), logoY = Math.round((H - drawH) / 2);

  const c0 = Math.floor(logoX / cell), c1 = Math.ceil((logoX + drawW) / cell);
  const r0 = Math.floor(logoY / cell), r1 = Math.ceil((logoY + drawH) / cell);
  const cells = [];
  for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) cells.push([c, r]);

  const order = shuffledOrder(cells.length);

  const total = order.length;
  const stepMs = Math.max(8, Math.round(1400 / total * 4));

  let idx = 0;
  clearInterval(splashTimer);
  ctx.save();
  ctx.beginPath();
  ctx.rect(logoX, logoY, drawW, drawH);
  ctx.clip();
  splashTimer = setInterval(() => {
    for (let k = 0; k < 4 && idx < total; k++, idx++) {
      const [c, r] = cells[order[idx]];
      ctx.drawImage(img,
        (c * cell - logoX) * img.width / drawW, (r * cell - logoY) * img.height / drawH,
        img.width / (drawW / cell), img.height / (drawH / cell),
        c * cell, r * cell, cell, cell);
    }
    if (idx >= total) { clearInterval(splashTimer); ctx.restore(); setTimeout(finishSplash, 1000); }
  }, stepMs);
}

function finishSplash() {
  clearInterval(splashTimer);

  const legal = document.getElementById('screenLegal');
  legal.classList.add('active');
  sbUpdate();
  eraseSplashMosaic();
}

function eraseSplashMosaic() {
  const { W, H, cell, cols, rows } = mosaicGrid();

  if (splashCanvas.width !== W || splashCanvas.height !== H) {
    splashLayer.classList.remove('active');
    return;
  }
  const ctx = splashCanvas.getContext('2d');
  const order = shuffledOrder(cols * rows);

  const total = order.length;
  const stepMs = Math.max(6, Math.round(1400 / total * 3));

  let idx = 0;
  clearInterval(splashTimer);
  splashTimer = setInterval(() => {
    for (let k = 0; k < 3 && idx < total; k++, idx++) {
      const n = order[idx];
      const c = n % cols, r = Math.floor(n / cols);
      ctx.clearRect(c * cell, r * cell, cell, cell);
    }
    if (idx >= total) {
      clearInterval(splashTimer);
      splashLayer.classList.remove('active');
      splashCanvas.width = splashCanvas.height = 0;
    }
  }, stepMs);
}

const legalScreen = document.getElementById('screenLegal');

function hideLegalScreen() {
  clearInterval(splashTimer);
  splashLayer.classList.remove('active');
  legalScreen.classList.remove('active');
  document.getElementById('legalScroll').scrollTop = 0;
}

document.getElementById('legalYes').addEventListener('click', () => {
  hideLegalScreen();
  const main = document.getElementById('screenMain');
  main.classList.add('active');
  requestAnimationFrame(() => requestAnimationFrame(() => main.classList.add('entered')));
});

document.getElementById('legalNo').addEventListener('click', () => {});

document.getElementById('exitLegal').addEventListener('click', () => {
  hideLegalScreen();
  runSplash();
});

runSplash();

const screens = {
  main: document.getElementById('screenMain'),
  demos: document.getElementById('screenDemos'),
  secretops: document.getElementById('screenSecr'),
  patches: document.getElementById('screenPatches'),
  dlh: document.getElementById('screenDlh')
};
const infoPanel = document.getElementById('infoPanel');
const infoTitle = document.getElementById('infoTitle');
const infoBody = document.getElementById('infoBody');

function showScreen(name) {
  Object.values(screens).forEach(s => {
    s.classList.remove('active', 'entered');
  });
  if (screens[name]) {
    const scr = screens[name];
    scr.classList.add('active');

    requestAnimationFrame(() => requestAnimationFrame(() => scr.classList.add('entered')));
  }
  infoPanel.classList.remove('visible');
  document.querySelectorAll('.thumb.hover').forEach(t => t.classList.remove('hover'));
  document.querySelectorAll('#secrShot.hover, #secrInstall.hover').forEach(el => el.classList.remove('hover'));
  document.querySelectorAll('#secrShot.ep-hover').forEach(el => el.classList.remove('ep-hover'));
  document.querySelectorAll('#secrText.hover, #dlhText.hover').forEach(el => el.classList.remove('hover'));
  document.querySelectorAll('#dlhShot.hover').forEach(el => el.classList.remove('hover'));
}

requestAnimationFrame(() => requestAnimationFrame(() =>
  document.getElementById('screenMain').classList.add('entered')
));

document.getElementById('btnDemos').addEventListener('click', () => showScreen('demos'));
document.getElementById('exitDemos').addEventListener('click', () => showScreen('main'));
document.getElementById('exitSecr').addEventListener('click', () => showScreen('main'));
document.getElementById('exitPatches').addEventListener('click', () => showScreen('main'));
document.getElementById('exitDlh').addEventListener('click', () => showScreen('main'));

const popupOverlay = document.getElementById('popupOverlay');
let popupTimer = null;
function showPopup() {
  clearTimeout(popupTimer);
  popupOverlay.classList.add('visible');
  popupTimer = setTimeout(hidePopup, 1000);
}
function hidePopup() {
  clearTimeout(popupTimer);
  popupOverlay.classList.remove('visible');
}
popupOverlay.addEventListener('click', hidePopup);

const secrShot = document.getElementById('secrShot');
const secrInstall = document.getElementById('secrInstall');
const secrText = document.getElementById('secrText');

function secrHover(on) {
  secrShot.classList.toggle('hover', on);
  secrInstall.classList.toggle('hover', on);
}
[secrShot, secrInstall].forEach(el => {
  el.addEventListener('mouseenter', () => secrHover(true));
  el.addEventListener('mouseleave', () => secrHover(false));
  el.addEventListener('click', showPopup);
});
secrText.addEventListener('mouseenter', () => secrText.classList.add('hover'));
secrText.addEventListener('mouseleave', () => secrText.classList.remove('hover'));

document.querySelectorAll('.secr-ep').forEach(ep => {
  ep.addEventListener('mouseenter', () => secrShot.classList.add('ep-hover'));
  ep.addEventListener('mouseleave', () => secrShot.classList.remove('ep-hover'));
  ep.addEventListener('click', showPopup);
});

document.querySelectorAll('.pat-item').forEach(item => {
  item.addEventListener('click', showPopup);
});

const dlhShot = document.getElementById('dlhShot');
const dlhText = document.getElementById('dlhText');
dlhShot.addEventListener('mouseenter', () => dlhShot.classList.add('hover'));
dlhShot.addEventListener('mouseleave', () => dlhShot.classList.remove('hover'));
dlhShot.addEventListener('click', showPopup);
dlhText.addEventListener('mouseenter', () => dlhText.classList.add('hover'));
dlhText.addEventListener('mouseleave', () => dlhText.classList.remove('hover'));

document.querySelectorAll('.nav-label').forEach(lbl => {
  lbl.addEventListener('click', () => {
    const id = lbl.dataset.id;
    if (screens[id]) showScreen(id);
  });
});

document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const id = item.dataset.id;
    if (screens[id]) showScreen(id);
  });
});

document.querySelectorAll('#demosGrid .thumb[data-title]').forEach(thumb => {
  thumb.addEventListener('mouseenter', () => {
    thumb.classList.add('hover');
    infoTitle.textContent = thumb.dataset.title;
    infoBody.innerHTML = thumb.dataset.desc;
    infoPanel.classList.add('visible');
  });
  thumb.addEventListener('mouseleave', () => {
    thumb.classList.remove('hover');
    infoPanel.classList.remove('visible');
  });
  thumb.addEventListener('click', showPopup);
});
