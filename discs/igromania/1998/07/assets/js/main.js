(function () {
  const appWindow = document.getElementById('appWindow');
  const screenMain = document.getElementById('screenMain');
  const screenSection = document.getElementById('screenSection');
  const sectionTitle = document.getElementById('sectionTitle');
  const listItems = document.getElementById('listItems');
  const detailImage = document.getElementById('detailImage');
  const detailDesc = document.getElementById('detailDesc');
  const connectorLine = document.getElementById('connectorLine');
  const connectorLineV = document.getElementById('connectorLineV');
  const softDetail = document.getElementById('softDetail');
  const softListLeft = document.getElementById('softListLeft');
  const softListRightTop = document.getElementById('softListRightTop');
  const softListZone = document.getElementById('softListZone');
  const patchesDetail = document.getElementById('patchesDetail');
  const patchesList1 = document.getElementById('patchesList1');
  const patchesList2 = document.getElementById('patchesList2');
  const patchesList3 = document.getElementById('patchesList3');

  const SECTION_META = {
    demos: {
      title: 'ДЕМО и SHAREWARE ВЕРСИИ ИГР',
      json: 'assets/data/demos.json',
      layout: 'demos'
    },
    soft: {
      title: 'ПРОГРАММЫ',
      json: 'assets/data/soft.json',
      layout: 'soft'
    },
    patches: {
      title: 'ПАТЧИ и ДОПОЛНЕНИЯ для ИГР',
      json: 'assets/data/patches.json',
      layout: 'patches'
    }
  };

  const cache = {};
  let currentSection = null;
  let selectedId = null;
  let selectedEl = null;
  let currentLayout = 'demos';

  /* ---- scale ---- */
  function fit() {
    const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 1200);
    appWindow.style.transform = 'scale(' + scale + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---- main license scrollbar ---- */
  (function initScrollbar() {
    const scrollEl = document.getElementById('licenseScroll');
    const thumb = document.getElementById('sbThumb');
    const track = document.getElementById('sbTrack');
    const btnUp = document.getElementById('sbUp');
    const btnDown = document.getElementById('sbDown');

    function updateThumb() {
      const sh = scrollEl.scrollHeight;
      const ch = scrollEl.clientHeight;
      const st = scrollEl.scrollTop;
      if (sh <= ch) { thumb.style.display = 'none'; return; }
      thumb.style.display = 'block';
      const trackH = track.clientHeight;
      const thumbH = Math.max(40, Math.floor(trackH * (ch / sh)));
      thumb.style.height = thumbH + 'px';
      const maxTop = trackH - thumbH;
      thumb.style.top = Math.round((st / (sh - ch)) * maxTop) + 'px';
    }
    scrollEl.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);
    setTimeout(updateThumb, 80);
    btnUp.addEventListener('click', function () { scrollEl.scrollTop -= 40; });
    btnDown.addEventListener('click', function () { scrollEl.scrollTop += 40; });

    var dragging = false, startY = 0, startScroll = 0;
    thumb.addEventListener('mousedown', function (e) {
      dragging = true; startY = e.clientY; startScroll = scrollEl.scrollTop; e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var trackH = track.clientHeight - thumb.clientHeight;
      if (trackH <= 0) return;
      scrollEl.scrollTop = startScroll + ((e.clientY - startY) / trackH) * (scrollEl.scrollHeight - scrollEl.clientHeight);
    });
    document.addEventListener('mouseup', function () { dragging = false; });
  })();

  /* ---- description markup: <b>…</b> and <red>…</red> ---- */
  function renderDesc(raw) {
    if (!raw) return '';
    var html = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html
      .replace(/&lt;b&gt;/g, '<b>')
      .replace(/&lt;\/b&gt;/g, '</b>')
      .replace(/&lt;red&gt;/g, '<span class="red">')
      .replace(/&lt;\/red&gt;/g, '</span>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function hideConnectors() {
    connectorLine.style.display = 'none';
    connectorLineV.style.display = 'none';
  }

  /* ---- connector: demos = horizontal to right panel; soft = L to bottom panel ---- */
  function updateConnector() {
    if (!selectedEl) { hideConnectors(); return; }

    var scale = Math.min(window.innerWidth / 1600, window.innerHeight / 1200);
    if (scale <= 0) scale = 1;
    var winRect = appWindow.getBoundingClientRect();
    var label = selectedEl.querySelector('.label') || selectedEl;
    var labRect = label.getBoundingClientRect();

    var x1 = (labRect.right - winRect.left) / scale;
    var y1 = (labRect.top + labRect.height / 2 - winRect.top) / scale;

    if (currentLayout === 'soft' || currentLayout === 'patches') {
      var detailEl = currentLayout === 'patches' ? patchesDetail : softDetail;
      var detailRect = detailEl.getBoundingClientRect();
      var y2 = (detailRect.top - winRect.top) / scale;
      var line = 6;

      var xv;
      if (currentLayout === 'soft') {
        var isRight = selectedEl.closest('#softColRight') != null;
        var detailRight = (detailRect.right - winRect.left) / scale;
        xv = isRight ? (detailRight - 24) : (x1 + 20);
      } else {
        // patches: short stub from highlight edge (all columns)
        xv = x1 + 20;
      }
      if (xv < x1 + 12) xv = x1 + 12;

      // overlap 2px into the highlight so no black gap at the join
      var hLeft = Math.round(x1) - 2;
      connectorLine.style.display = 'block';
      connectorLine.style.left = hLeft + 'px';
      connectorLine.style.top = Math.round(y1 - line / 2) + 'px';
      connectorLine.style.width = Math.round(xv - x1 + line / 2) + 2 + 'px';
      connectorLine.style.height = line + 'px';

      connectorLineV.style.display = 'block';
      connectorLineV.style.left = Math.round(xv - line / 2) + 'px';
      connectorLineV.style.top = Math.round(y1 - line / 2) + 'px';
      connectorLineV.style.width = line + 'px';
      connectorLineV.style.height = Math.max(0, Math.round(y2 - y1 + line / 2)) + 'px';
    } else {
      var detailRect = document.getElementById('detailPanel').getBoundingClientRect();
      var x2 = (detailRect.left - winRect.left) / scale;
      if (x2 <= x1) { hideConnectors(); return; }
      connectorLineV.style.display = 'none';
      connectorLine.style.display = 'block';
      connectorLine.style.left = x1 + 'px';
      connectorLine.style.top = (y1 - 3) + 'px';
      connectorLine.style.width = (x2 - x1) + 'px';
      connectorLine.style.height = '6px';
    }
  }

  function clearSelection() {
    document.querySelectorAll('.list-item.selected').forEach(function (el) {
      el.classList.remove('selected');
    });
    selectedEl = null;
    selectedId = null;
  }

  function selectItem(el, data) {
    clearSelection();
    el.classList.add('selected');
    selectedEl = el;
    selectedId = data.id;

    if (currentLayout === 'soft') {
      softDetail.innerHTML = renderDesc(data.description || '');
    } else if (currentLayout === 'patches') {
      patchesDetail.innerHTML = renderDesc(data.description || '');
    } else {
      // demos: image + desc
      if (data.image) {
        detailImage.innerHTML = '';
        var img = document.createElement('img');
        img.alt = '';
        img.onload = function () {
          img.style.width = (img.naturalWidth * 2) + 'px';
          img.style.height = (img.naturalHeight * 2) + 'px';
        };
        img.onerror = function () {
          detailImage.innerHTML = '<div class="placeholder">нет изображения</div>';
        };
        img.src = 'assets/img/content/' + data.image;
        detailImage.appendChild(img);
      } else {
        detailImage.innerHTML = '<div class="placeholder">нет изображения</div>';
      }
      detailDesc.innerHTML = renderDesc(data.description || '');
    }

    requestAnimationFrame(updateConnector);
  }

  var installToastTimer = null;
  function showInstallToast() {
    var toast = document.getElementById('installToast');
    if (!toast) return;
    toast.hidden = false;
    toast.setAttribute('aria-hidden', 'false');
    if (installToastTimer) clearTimeout(installToastTimer);
    installToastTimer = setTimeout(function () {
      toast.hidden = true;
      toast.setAttribute('aria-hidden', 'true');
      installToastTimer = null;
    }, 1000);
  }

  function makeListItem(data) {
    var li = document.createElement('li');
    li.className = 'list-item';
    li.dataset.id = data.id;
    var lab = document.createElement('span');
    lab.className = 'label';
    lab.textContent = data.title;
    li.appendChild(lab);
    li.addEventListener('mouseenter', function () {
      selectItem(li, data);
    });
    li.addEventListener('click', function () {
      showInstallToast();
    });
    return li;
  }

  async function openSection(key) {
    var meta = SECTION_META[key];
    if (!meta) return;
    if (dissolveBusy) return;

    // Prefetch JSON before capture so switch is instant
    var items = cache[key];
    if (!items) {
      try {
        var res = await fetch(meta.json);
        items = await res.json();
        cache[key] = items;
      } catch (e) {
        console.error(e);
        items = [];
        cache[key] = items;
      }
    }

    withDissolve(function () {
      currentSection = key;
      currentLayout = meta.layout || 'demos';
      sectionTitle.textContent = meta.title;
      selectedId = null;
      selectedEl = null;
      hideConnectors();

      screenSection.classList.remove('layout-demos', 'layout-soft', 'layout-patches');
      screenSection.classList.add('layout-' + currentLayout);
      clearSelection();
      hideConnectors();

      if (currentLayout === 'soft') {
        softListLeft.innerHTML = '';
        softListRightTop.innerHTML = '';
        softListZone.innerHTML = '';
        softDetail.innerHTML = '';
        items.forEach(function (data) {
          var li = makeListItem(data);
          if (data.zone) {
            softListZone.appendChild(li);
          } else if (data.column === 'right') {
            softListRightTop.appendChild(li);
          } else {
            softListLeft.appendChild(li);
          }
        });
      } else if (currentLayout === 'patches') {
        patchesList1.innerHTML = '';
        patchesList2.innerHTML = '';
        patchesList3.innerHTML = '';
        patchesDetail.innerHTML = '';
        var lists = {1: patchesList1, 2: patchesList2, 3: patchesList3};
        items.forEach(function (data) {
          var li = makeListItem(data);
          var col = data.column || 1;
          (lists[col] || patchesList1).appendChild(li);
        });
      } else {
        detailImage.innerHTML = '<div class="placeholder">нет изображения</div>';
        detailDesc.innerHTML = '';
        listItems.innerHTML = '';
        items.forEach(function (data) {
          listItems.appendChild(makeListItem(data));
        });
      }

      screenMain.classList.remove('active');
      screenSection.classList.add('active');
    });
  }

  function goMain() {
    if (dissolveBusy) return;
    withDissolve(function () {
      screenSection.classList.remove('active');
      screenSection.classList.remove('layout-demos', 'layout-soft', 'layout-patches');
      screenMain.classList.add('active');
      currentSection = null;
      currentLayout = 'demos';
      clearSelection();
      hideConnectors();
    });
  }

  /* menu hover sound */
  var menuSound = null;
  try {
    menuSound = new Audio('assets/sound/menu.wav');
    menuSound.preload = 'auto';
  } catch (e) {}

  function playMenuSound() {
    if (!menuSound) return;
    try {
      menuSound.pause();
      menuSound.currentTime = 0;
      menuSound.play();
    } catch (e) {}
  }

  document.querySelectorAll('.menu-item').forEach(function (el) {
    el.addEventListener('mouseenter', playMenuSound);
    el.addEventListener('click', function () {
      var sec = el.getAttribute('data-section');
      if (sec) openSection(sec);
    });
  });

  window.__openSection = openSection;
  window.__goMain = goMain;

  document.getElementById('btnMainMenu').addEventListener('click', goMain);

  var exitSound = null;
  try {
    exitSound = new Audio('assets/sound/exit.wav');
    exitSound.preload = 'auto';
  } catch (e) {}
  function playExitSound() {
    if (!exitSound) return;
    try {
      exitSound.pause();
      exitSound.currentTime = 0;
      exitSound.play();
    } catch (e) {}
  }
  document.getElementById('btnExitMain').addEventListener('click', playExitSound);
  document.getElementById('btnExitSection').addEventListener('click', playExitSound);

  window.addEventListener('resize', function () {
    if (currentSection) updateConnector();
  });

  /* ========== PIXEL DISSOLVE (shared) ========== */
  var dissolveBusy = false;
  var DISSOLVE_MS = 480;
  var W = 1600, H = 1200;

  function getDissolveEls() {
    return {
      overlay: document.getElementById('splashOverlay'),
      canvas: document.getElementById('splashCanvas')
    };
  }

  function hideDissolveOverlay() {
    var els = getDissolveEls();
    if (!els.overlay) return;
    els.overlay.classList.add('done');
    els.overlay.style.display = 'none';
    els.overlay.style.pointerEvents = 'none';
  }

  function showDissolveOverlay() {
    var els = getDissolveEls();
    if (!els.overlay) return;
    els.overlay.classList.remove('done');
    els.overlay.style.display = 'block';
    els.overlay.style.pointerEvents = 'auto';
  }

  function animatePixelDissolve(ctx, duration, onDone) {
    var imgData = ctx.getImageData(0, 0, W, H);
    var data = imgData.data;
    var total = W * H;
    var order = new Uint32Array(total);
    var i, j, tmp;
    for (i = 0; i < total; i++) order[i] = i;
    for (i = total - 1; i > 0; i--) {
      j = (Math.random() * (i + 1)) | 0;
      tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    var start = performance.now();
    var cursor = 0;
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var target = Math.floor(total * t * t);
      while (cursor < target) {
        var p = order[cursor++] * 4;
        data[p + 3] = 0;
      }
      ctx.putImageData(imgData, 0, 0);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else if (onDone) {
        onDone();
      }
    }
    requestAnimationFrame(frame);
  }

  /** Capture app-window to canvas (SVG foreignObject). */
  function captureAppToCanvas(canvas) {
    return new Promise(function (resolve) {
      var app = document.getElementById('appWindow');
      if (!app) { resolve(false); return; }

      var clone = app.cloneNode(true);
      var sp = clone.querySelector('#splashOverlay');
      if (sp) sp.remove();

      var cssText = '';
      try {
        for (var si = 0; si < document.styleSheets.length; si++) {
          var sheet = document.styleSheets[si];
          try {
            var rules = sheet.cssRules;
            for (var ri = 0; ri < rules.length; ri++) {
              cssText += rules[ri].cssText + '\n';
            }
          } catch (e1) {}
        }
      } catch (e2) {}

      var base = location.href.replace(/[^\/]*$/, '');
      cssText = cssText.replace(/url\(['"]?assets\//g, "url('" + base + "assets/");

      var styleEl = document.createElement('style');
      styleEl.textContent = cssText;

      var wrapper = document.createElement('div');
      wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      wrapper.style.cssText = 'width:' + W + 'px;height:' + H + 'px;overflow:hidden;background:#000;';
      wrapper.appendChild(styleEl);
      wrapper.appendChild(clone);

      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">' +
        '<foreignObject width="100%" height="100%">' +
        new XMLSerializer().serializeToString(wrapper) +
        '</foreignObject></svg>';

      var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      var img = new Image();
      img.onload = function () {
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(img, 0, 0, W, H);
        resolve(true);
      };
      img.onerror = function () { resolve(false); };
      // small delay helps fonts settle in some browsers
      img.src = url;
    });
  }

  /** Capture current view → show overlay → switch DOM → dissolve. */
  function withDissolve(onSwitch) {
    if (dissolveBusy) return;
    dissolveBusy = true;
    var els = getDissolveEls();
    if (!els.overlay || !els.canvas) {
      onSwitch();
      dissolveBusy = false;
      return;
    }

    captureAppToCanvas(els.canvas).then(function (ok) {
      if (!ok) {
        onSwitch();
        dissolveBusy = false;
        return;
      }
      showDissolveOverlay();
      onSwitch();
      var ctx = els.canvas.getContext('2d', { willReadFrequently: true });
      animatePixelDissolve(ctx, DISSOLVE_MS, function () {
        hideDissolveOverlay();
        dissolveBusy = false;
      });
    });
  }

  /* ========== SPLASH (once per session, unique key) ========== */
  (function runSplash() {
    var KEY = 'igromania-1998-07-splash';
    var els = getDissolveEls();
    if (!els.overlay || !els.canvas) return;

    try {
      if (sessionStorage.getItem(KEY)) {
        hideDissolveOverlay();
        return;
      }
    } catch (e) {}

    var ctx = els.canvas.getContext('2d', { willReadFrequently: true });
    var img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, W, H);
      var scale = Math.max(W / img.width, H / img.height);
      var dw = img.width * scale;
      var dh = img.height * scale;
      var dx = (W - dw) / 2;
      var dy = (H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);

      try {
        var s = new Audio('assets/sound/splash.wav');
        s.play().catch(function () {});
      } catch (e) {}

      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

      showDissolveOverlay();
      dissolveBusy = true;
      animatePixelDissolve(ctx, 2000, function () {
        hideDissolveOverlay();
        dissolveBusy = false;
      });
    };
    img.onerror = function () {
      hideDissolveOverlay();
    };
    img.src = 'assets/img/ui/splash.webp';
  })();
})();
