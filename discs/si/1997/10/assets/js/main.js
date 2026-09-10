/* Страна Игр — 1997 №10: логика оболочки */
(function () {
  var data = null;

  // --- scale stage to fit 100% of available height (and width) ---
  var stage = document.getElementById('stage');
  function fit() {
    var s = Math.min(window.innerWidth / 1500, window.innerHeight / 1250);
    stage.style.transform = 'scale(' + s + ')';
    stage.style.left = ((window.innerWidth - 1500 * s) / 2) + 'px';
    stage.style.top  = ((window.innerHeight - 1250 * s) / 2) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  // --- hover image swap for buttons and exit ---
  document.querySelectorAll('.btn, #exit-btn').forEach(function (el) {
    var img = el.querySelector('img');
    var base = img.getAttribute('src');
    var hover = el.id === 'exit-btn'
      ? base.replace('exit.webp', 'exit1.webp')
      : base.replace(el.dataset.img + '.webp', el.dataset.img + '1.webp');
    el.addEventListener('mouseenter', function () { img.setAttribute('src', hover); });
    el.addEventListener('mouseleave', function () { img.setAttribute('src', base); });
  });

  // --- shell state ---
  // company: null | '1c' | 'buka' | 'doka'. Hovering a company button arms it:
  // its lines turn hot and its item list appears in the big box at once.
  // hoverItemIdx: index of the highlighted list item (drives bottom-left info).
  var state = { company: null, hoverItemIdx: null };
  var HOT_COLORS = { '1c': '#e8ca23', 'buka': '#ff00ff', 'doka': '#00ffff', 'exit': '#ff0000' };

  var toprightText = document.getElementById('topright-text');
  var itemlist = document.getElementById('itemlist');
  var bottomleftText = document.getElementById('bottomleft-text');

  function companyData() {
    if (!data) return null;
    if (state.company === 'exit') return data.exit || null;
    return state.company ? data.companies[state.company] : null;
  }

  function render() {
    // hot lines: active company frame + connector, big box frame, bottom-left box frame
    // (exit arms only its own frame + connector + bottom-left box; big box stays green)
    var gold = state.company ? {} : null;
    if (gold) {
      gold[state.company] = gold['blbox'] = true;
      if (state.company !== 'exit') gold['bigbox'] = true;
    }
    stage.style.setProperty('--hotc', HOT_COLORS[state.company] || '#e8ca23');
    document.querySelectorAll('.ln[data-gold], .lng[data-gold]').forEach(function (el) {
      el.classList.toggle('gold', !!(gold && gold[el.dataset.gold]));
    });

    // big box content: instruction stays visible in the default state and on exit hover
    var cd = companyData();
    var showList = cd && cd.items && cd.items.length;
    toprightText.style.display = (!state.company || state.company === 'exit') ? 'block' : 'none';
    itemlist.style.display = showList ? 'block' : 'none';

    // bottom-left text: item info while hovering an item, company line otherwise
    var info = '';
    if (cd) {
      if (state.hoverItemIdx !== null && cd.items[state.hoverItemIdx]) {
        info = cd.items[state.hoverItemIdx].info || '';
      } else {
        info = cd.hoverText || '';
      }
    }
    bottomleftText.textContent = info;

    // item highlight
    itemlist.querySelectorAll('.item').forEach(function (el, i) {
      el.classList.toggle('hot', state.hoverItemIdx === i);
    });
  }

  function setCompany(c) {
    if (state.company === c) return;
    state.company = c;
    state.hoverItemIdx = null;
    buildList();
    render();
  }

  function buildList() {
    itemlist.innerHTML = '';
    var cd = companyData();
    if (!cd || !cd.items) return;
    cd.items.forEach(function (item, i) {
      var div = document.createElement('div');
      div.className = 'item';
      div.dataset.role = 'item';
      div.dataset.idx = i;
      var sp = document.createElement('span');
      sp.textContent = item.text;
      div.appendChild(sp);
      // link is optional: {type:'video'|'url', src:'...'}; without it a short notice is shown
      div.addEventListener('click', function () {
        if (item.link && item.link.src) handleLink(item.link);
        else showNotice();
      });
      itemlist.appendChild(div);
    });
  }

  // Video popup (dimmed backdrop, click outside or Esc closes) or external link.
  function handleLink(link) {
    if (!link || !link.src) return;
    if (link.type === 'video') {
      openVideo(link.src);
    } else if (link.type === 'url') {
      // external URLs go through Web Archive; local ones open directly
      if (window.openArchivedUrl) window.openArchivedUrl(link.src);
      else window.open(link.src, '_blank', 'noopener,noreferrer');
    }
  }

  // VK player JS API: no URL parameter controls sound, unmute() is the only way.
  var vkApiPromise = null;
  function loadVkApi() {
    if (!vkApiPromise) {
      vkApiPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://vk.ru/js/api/videoplayer.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return vkApiPromise;
  }

  function openVideo(src) {
    closeVideo();
    var ov = document.createElement('div');
    ov.id = 'video-overlay';
    var fr = document.createElement('iframe');
    fr.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'js_api=1';
    fr.referrerPolicy = 'no-referrer';
    fr.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;';
    fr.allowFullscreen = true;
    // the VK player autoplays silently; unmute as soon as it is alive
    fr.addEventListener('load', function () {
      loadVkApi().then(function () {
        var tries = 0;
        (function unmute() {
          try {
            var p = new VK.VideoPlayer(fr);
            p.unmute();
            if (tries++ < 8 && p.isMuted && p.isMuted()) setTimeout(unmute, 400);
          } catch (e) {
            if (tries++ < 8) setTimeout(unmute, 400);
          }
        })();
      }).catch(function () {});
    });
    ov.appendChild(fr);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeVideo(); });
    document.body.appendChild(ov);
    document.addEventListener('keydown', escClose);
  }

  function escClose(e) {
    if (e.key === 'Escape') { closeVideo(); closeNotice(); }
  }

  // unobtrusive notice for items without an assigned action
  var noticeTimer = null;
  function showNotice() {
    closeNotice();
    var ov = document.createElement('div');
    ov.id = 'notice-overlay';
    var bx = document.createElement('div');
    bx.className = 'box';
    bx.textContent = (data && data.notice) || 'Все файлы доступны в образе диска';
    ov.appendChild(bx);
    ov.addEventListener('click', closeNotice);
    document.body.appendChild(ov);
    noticeTimer = setTimeout(closeNotice, 1200);
  }

  function closeNotice() {
    var ov = document.getElementById('notice-overlay');
    if (ov) ov.remove();
    if (noticeTimer) { clearTimeout(noticeTimer); noticeTimer = null; }
  }

  function closeVideo() {
    var ov = document.getElementById('video-overlay');
    if (ov) ov.remove();
    document.removeEventListener('keydown', escClose);
  }

  // Content changes only over active elements (company/exit buttons, list items);
  // moving the mouse into empty space keeps the current state.
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest ? e.target.closest('[data-role]') : null;
    if (!el) return;
    var role = el.dataset.role;
    if (role === 'btn') {
      setCompany(el.dataset.company);
    } else if (role === 'item') {
      var idx = parseInt(el.dataset.idx, 10);
      if (state.hoverItemIdx !== idx) {
        state.hoverItemIdx = idx;
        render();
      }
    }
  });

  // --- texts from JSON ---
  fetch('assets/data/main.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      data = d;
      toprightText.textContent = d.topright || '';
      document.getElementById('url-text').textContent = d.url || '';
      render();
    })
    .catch(function (e) {
      console.error('Cannot load main.json:', e);
    });
})();
