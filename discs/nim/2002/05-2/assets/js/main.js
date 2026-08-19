(function () {
    const APP_W = 1600, APP_H = 1200;
    const app = document.getElementById('app');
    const treeEl = document.getElementById('tree');
    const contentEl = document.getElementById('content');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxWrap = document.getElementById('lightbox-wrap');
    const lightboxHit = document.getElementById('lightbox-hit');

    function fit() {
      const scale = Math.min(window.innerWidth / APP_W, window.innerHeight / APP_H);
      app.style.transform = `scale(${scale})`;
    }
    fit();
    window.addEventListener('resize', fit);

    const buttons = Array.from(document.querySelectorAll('.btn-slot'));
    let selected = 'fp';
    let pressTimer = null;
    const clickSound = new Audio('assets/sound/click.wav');
    const click2Sound = new Audio('assets/sound/click2.wav');

    const dataCache = {};
    let currentData = null;
    let lbImages = [];
    let lbIndex = 0;

    function imgPath(prefix, state) {
      return `assets/img/ui/${prefix}${state}.webp`;
    }
    function setState(btn, state) {
      btn.querySelector('img').src = imgPath(btn.dataset.prefix, state);
    }
    function applyVisuals() {
      buttons.forEach(btn => {
        setState(btn, btn.dataset.prefix === selected ? 4 : 1);
      });
    }
    applyVisuals();

    buttons.forEach(btn => {
      const prefix = btn.dataset.prefix;
      btn.addEventListener('mouseenter', () => { if (prefix !== selected) setState(btn, 2); });
      btn.addEventListener('mouseleave', () => { if (prefix !== selected) setState(btn, 1); });
      btn.addEventListener('mousedown', () => setState(btn, 3));
      btn.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = setTimeout(() => {
          selected = prefix;
          applyVisuals();
          loadGame(prefix);
          pressTimer = null;
        }, 80);
      });
    });

    async function loadGame(id) {
      if (dataCache[id]) {
        currentData = dataCache[id];
        renderTree();
        renderContent(currentData.root, false);
        return;
      }
      try {
        const res = await fetch(`assets/data/${id}.json`);
        if (!res.ok) throw new Error('no data');
        const data = await res.json();
        dataCache[id] = data;
        currentData = data;
        renderTree();
        renderContent(data.root, false);
      } catch (e) {
        currentData = null;
        treeEl.innerHTML = '';
        contentEl.innerHTML = `<div class="content-text">Данные для «${id}» пока не загружены.</div>`;
      }
    }

    function renderTree() {
      if (!currentData) { treeEl.innerHTML = ''; return; }
      treeEl.innerHTML = '';
      currentData.tree.forEach(node => treeEl.appendChild(createTreeItem(node, 0)));
    }

    function createTreeItem(node, depth) {
      const li = document.createElement('li');
      li.className = 'tree-item';
      li.dataset.id = node.id;

      const row = document.createElement('div');
      row.className = 'tree-row';
      row._node = node;
      row._li = li;

      const toggle = document.createElement('span');
      toggle.className = 'tree-toggle';
      toggle.textContent = node.expandable ? '▶' : '';

      const label = document.createElement('span');
      label.className = 'tree-label';
      label.textContent = node.label;

      row.appendChild(toggle);
      row.appendChild(label);
      li.appendChild(row);

      if (node.children && node.children.length) {
        const ul = document.createElement('ul');
        ul.className = 'tree-children';
        node.children.forEach(child => ul.appendChild(createTreeItem(child, depth + 1)));
        li.appendChild(ul);
      }

      row.addEventListener('click', (e) => {
        e.stopPropagation();
        selectTreeRow(row, true);
      });

      return li;
    }

    function selectTreeRow(row, toggleExpand) {
      if (!row || !row._node) return;
      const node = row._node;
      const li = row._li;
      if (toggleExpand && node.expandable) {
        li.classList.toggle('expanded');
        const toggle = row.querySelector('.tree-toggle');
        if (toggle) toggle.textContent = li.classList.contains('expanded') ? '▼' : '▶';
      }
      document.querySelectorAll('.tree-row').forEach(el => el.classList.remove('active'));
      row.classList.add('active');
      row.scrollIntoView({ block: 'nearest' });
      if (node.content) renderContent(node.content, !!node.install);
    }

    function getVisibleTreeRows() {
      const rows = [];
      function walk(ul) {
        Array.from(ul.children).forEach(li => {
          if (!li.classList.contains('tree-item')) return;
          const row = li.querySelector(':scope > .tree-row');
          if (row) rows.push(row);
          const childUl = li.querySelector(':scope > .tree-children');
          if (childUl && li.classList.contains('expanded')) walk(childUl);
        });
      }
      walk(treeEl);
      return rows;
    }

    function moveTreeSelection(delta) {
      const rows = getVisibleTreeRows();
      if (!rows.length) return;
      let idx = rows.findIndex(r => r.classList.contains('active'));
      if (idx < 0) idx = delta > 0 ? -1 : 0;
      const next = Math.max(0, Math.min(rows.length - 1, idx + delta));
      selectTreeRow(rows[next], false);
    }

    function renderContent(data, showInstall) {
      if (!data) { contentEl.innerHTML = ''; return; }

      let html = '<div class="content-top">';
      if (showInstall) {
        html += `<div class="btn-install" id="btn-install"><img src="assets/img/ui/inst1.webp" alt="Install"></div>`;
      }
      html += '</div>';

      if (data.title) {
        html += `<div class="content-title">${esc(data.title)}</div>`;
      }

      if (data.info && data.info.length) {
        html += '<div class="info-table">';
        data.info.forEach(row => {
          html += `<div class="info-label">${esc(row.label)}</div>`;
          html += `<div class="info-value">${esc(row.value)}</div>`;
        });
        html += '</div>';
      }

      if (data.text) {
        html += `<div class="content-text">${esc(data.text)}</div>`;
      }

      if (data.images && data.images.length) {
        const cls = data.images.length === 1 ? 'single' : 'multi';
        html += `<div class="content-images ${cls}">`;
        data.images.forEach((img, idx) => {
          const src = typeof img === 'string' ? img : (img.src || '');
          html += `<div class="content-image-wrap" data-idx="${idx}">`;
          html += `<img src="${esc(src)}" alt="" draggable="false">`;
          html += `<div class="content-image-hit"></div>`;
          html += '</div>';
        });
        html += '</div>';
      }

      contentEl.innerHTML = html;

      const instBtn = document.getElementById('btn-install');
      if (instBtn) {
        const instImg = instBtn.querySelector('img');
        let instTimer = null;
        instBtn.addEventListener('mouseenter', () => { instImg.src = 'assets/img/ui/inst2.webp'; });
        instBtn.addEventListener('mouseleave', () => { instImg.src = 'assets/img/ui/inst1.webp'; });
        instBtn.addEventListener('mousedown', () => { instImg.src = 'assets/img/ui/inst3.webp'; });
        instBtn.addEventListener('mouseup', () => { instImg.src = 'assets/img/ui/inst1.webp'; });
        instBtn.addEventListener('click', () => {
          click2Sound.currentTime = 0;
          click2Sound.play().catch(() => {});
          if (instTimer) clearTimeout(instTimer);
          instImg.src = 'assets/img/ui/inst3.webp';
          instTimer = setTimeout(() => { instImg.src = 'assets/img/ui/inst1.webp'; instTimer = null; }, 100);
        });
      }

      if (data.images && data.images.length) {
        lbImages = data.images;
        contentEl.querySelectorAll('.content-image-wrap').forEach(wrap => {
          const hit = wrap.querySelector('.content-image-hit');
          hit.addEventListener('contextmenu', e => e.preventDefault());
          hit.addEventListener('click', () => openLightbox(+wrap.dataset.idx));
        });
      } else {
        lbImages = [];
      }
    }

    function openLightbox(idx) {
      if (!lbImages.length) return;
      lbIndex = idx;
      showLbImage();
      lightbox.classList.add('open');
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
    }
    function showLbImage() {
      const img = lbImages[lbIndex];
      const src = typeof img === 'string' ? img : (img.src || '');
      lightboxImg.alt = '';
      // Reset size while loading
      lightboxImg.style.width = '';
      lightboxImg.style.height = '';
      lightboxImg.style.maxWidth = '';
      lightboxImg.style.maxHeight = '';

      const applySize = () => {
        const nw = lightboxImg.naturalWidth;
        const nh = lightboxImg.naturalHeight;
        if (!nw || !nh) return;
        const MAX_W = 1024, MAX_H = 768;
        // Upscale only if the image fits strictly inside 1024×768
        const scale = Math.min(MAX_W / nw, MAX_H / nh);
        if (scale > 1) {
          lightboxImg.style.width = Math.round(nw * scale) + 'px';
          lightboxImg.style.height = Math.round(nh * scale) + 'px';
          lightboxImg.style.maxWidth = 'none';
          lightboxImg.style.maxHeight = 'none';
        } else {
          // Larger (or equal): keep natural size, no forced downscale
          lightboxImg.style.width = nw + 'px';
          lightboxImg.style.height = nh + 'px';
          lightboxImg.style.maxWidth = 'none';
          lightboxImg.style.maxHeight = 'none';
        }
      };

      if (lightboxImg.src === src && lightboxImg.complete && lightboxImg.naturalWidth) {
        applySize();
      } else {
        lightboxImg.onload = applySize;
        lightboxImg.src = src;
      }
    }
    function lbPrev() {
      if (lbImages.length < 2) return;
      lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
      showLbImage();
    }
    function lbNext() {
      if (lbImages.length < 2) return;
      lbIndex = (lbIndex + 1) % lbImages.length;
      showLbImage();
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    lightboxHit.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
    lightboxHit.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('keydown', (e) => {
      if (lightbox.classList.contains('open')) {
        if (e.key === 'Escape') { closeLightbox(); return; }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); lbPrev(); }
        if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); lbNext(); }
        return;
      }
      if (e.key === 'ArrowUp') { e.preventDefault(); moveTreeSelection(-1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveTreeSelection(1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const active = document.querySelector('.tree-row.active');
        if (!active || !active._node || !active._node.expandable) return;
        e.preventDefault();
        const li = active._li;
        const wantExpand = e.key === 'ArrowRight';
        const isExpanded = li.classList.contains('expanded');
        if (wantExpand === isExpanded) return;
        li.classList.toggle('expanded', wantExpand);
        const toggle = active.querySelector('.tree-toggle');
        if (toggle) toggle.textContent = wantExpand ? '▼' : '▶';
      }
    });

    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.content-image-wrap') || e.target.closest('.lightbox')) {
        e.preventDefault();
      }
    });

    function esc(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    loadGame('fp');
  })();

/* ===== Intro Video Logic ===== */
(function() {
  const introModal = document.getElementById('intro-modal');
  const introIframe = document.getElementById('intro-iframe');
  const btnIntroClose = document.getElementById('btn-intro-close');

  // Ссылка на встраиваемое видео (с автозапуском &autoplay=1)
  const INTRO_URL = "https://vkvideo.ru/video_ext.php?oid=-240437459&id=456239018&hash=5d2b7c3f6b926a15&hd=2&autoplay=1";

  function openIntroModal() {
    if (introModal && introIframe) {
      introIframe.src = INTRO_URL;
      introModal.classList.add('active');
    }
  }

  function closeIntroModal() {
    if (!introModal) return;
    introModal.classList.remove('active');
    if (introIframe) introIframe.src = 'about:blank';
  }

  function checkAndShowIntro() {
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.has('intro');
    if (!sessionStorage.getItem('intro_shown') || forceShow) {
      openIntroModal();
      sessionStorage.setItem('intro_shown', 'true');
    }
  }

  if (btnIntroClose) {
    btnIntroClose.addEventListener('click', closeIntroModal);
  }

  if (introModal) {
    introModal.addEventListener('click', (e) => {
      if (e.target === introModal) closeIntroModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && introModal && introModal.classList.contains('active')) {
      closeIntroModal();
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-open-intro')) {
      e.preventDefault();
      openIntroModal();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndShowIntro);
  } else {
    checkAndShowIntro();
  }
})();
