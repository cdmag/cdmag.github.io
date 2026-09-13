var CONTENT_SECTIONS = { 'btn-demos': 'demos', 'btn-files': 'files', 'btn-movies': 'movies', 'btn-cracks': 'cracks' };

document.querySelectorAll('.hotspot').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var wasActive = btn.classList.contains('active');

    document.querySelectorAll('.hotspot.active').forEach(function (other) {
      other.classList.remove('active');
    });

    if (wasActive) {
      if (CONTENT_SECTIONS[btn.id]) closeContentPanel();
      return;
    }

    btn.classList.add('active');

    if (btn.id === 'btn-internet') {
      window.open('https://web.archive.org/web/199901/http://www.gamenavigator.ru', '_blank');
    }

    var sectionKey = CONTENT_SECTIONS[btn.id];
    if (sectionKey) {
      openContentPanel(sectionKey);
    } else {
      closeContentPanel();
    }
  });
});

var contentPanel = document.getElementById('content-panel');
var columnsEl = document.getElementById('content-columns');
var detailBox = document.getElementById('content-detail-box');
var detailThumb = document.getElementById('content-detail-thumb');
var detailText = document.getElementById('content-detail-text');
var installBtn = document.getElementById('btn-install');
var allData = null;
var builtSections = {};

function buildColumns(sectionData) {
  columnsEl.innerHTML = '';
  (sectionData.columns || []).forEach(function (columnItems) {
    var ul = document.createElement('ul');
    ul.className = 'content-column';

    columnItems.forEach(function (entry) {
      var li = document.createElement('li');

      if (entry.type === 'spacer') {
        li.className = 'content-spacer';
      } else if (entry.type === 'heading') {
        li.className = 'content-item content-heading';
        li.textContent = entry.title;
      } else {
        li.className = 'content-item';

        if (!entry.video) {
          var marker = document.createElement('img');
          marker.className = 'marker';
          marker.src = 'assets/img/ui/selected.webp';
          marker.alt = '';
          li.appendChild(marker);
        }
        li.appendChild(document.createTextNode(entry.title));

        li.addEventListener('click', function () {
          if (entry.video) {
            playVideo(entry.video);
          } else {
            selectItem(entry, li);
          }
        });
      }

      ul.appendChild(li);
    });

    columnsEl.appendChild(ul);
  });
}

function selectItem(item, li) {
  document.querySelectorAll('.content-column li.selected').forEach(function (el) {
    el.classList.remove('selected');
  });
  li.classList.add('selected');

  if (item.image) {
    detailThumb.src = item.image;
    detailThumb.style.display = '';
  } else {
    detailThumb.src = '';
    detailThumb.style.display = 'none';
  }
  detailText.textContent = item.description;

  detailBox.classList.add('visible');
  installBtn.classList.add('visible');
}

function resetSelection() {
  detailBox.classList.remove('visible');
  installBtn.classList.remove('visible');
  document.querySelectorAll('.content-column li.selected').forEach(function (el) {
    el.classList.remove('selected');
  });
}

function openContentPanel(sectionKey) {
  if (builtSections[sectionKey]) {
    buildColumns(builtSections[sectionKey]);
    resetSelection();
    contentPanel.classList.add('visible');
    return;
  }

  if (allData) {
    builtSections[sectionKey] = allData[sectionKey];
    buildColumns(builtSections[sectionKey]);
    resetSelection();
    contentPanel.classList.add('visible');
    return;
  }

  fetch('assets/data/descriptions.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      allData = data;
      builtSections[sectionKey] = data[sectionKey];
      buildColumns(builtSections[sectionKey]);
      resetSelection();
      contentPanel.classList.add('visible');
    })
    .catch(function (err) {
      console.error('Не удалось загрузить assets/data/descriptions.json', err);
    });
}

function closeContentPanel() {
  contentPanel.classList.remove('visible');
  resetSelection();
}

var installModal = document.getElementById('install-modal');
installBtn.addEventListener('click', function () {
  installModal.classList.add('visible');
  setTimeout(function () {
    installModal.classList.remove('visible');
  }, 1000);
});

var VK_OID = -240437459;
var videoModal = document.getElementById('video-modal');
var videoFrame = document.getElementById('video-frame');

function playVideo(video) {
  var src = 'https://vkvideo.ru/video_ext.php?oid=' + VK_OID +
            '&id=' + video.id + '&hash=' + video.hash + '&hd=1&autoplay=1';

  var iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('frameborder', '0');
  iframe.referrerPolicy = 'no-referrer';

  videoFrame.innerHTML = '';
  videoFrame.appendChild(iframe);
  videoModal.classList.add('visible');
}

function closeVideoModal() {
  videoModal.classList.remove('visible');
  videoFrame.innerHTML = '';
}

videoModal.addEventListener('click', closeVideoModal);
videoFrame.addEventListener('click', function (e) {
  e.stopPropagation();
});

var eggHotspot = document.getElementById('egg-hotspot');
var weSplash = document.getElementById('we-splash');

eggHotspot.addEventListener('click', function (e) {
  e.stopPropagation();
  weSplash.classList.add('visible');
});
weSplash.addEventListener('click', function () {
  weSplash.classList.remove('visible');
});
weSplash.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

var SESSION_SPLASH_KEY = 'nim-1999-01-splash';
var sessionSplash = document.getElementById('session-splash');

if (!sessionStorage.getItem(SESSION_SPLASH_KEY)) {
  sessionStorage.setItem(SESSION_SPLASH_KEY, '1');
  sessionSplash.classList.add('visible');
}

sessionSplash.addEventListener('click', function () {
  sessionSplash.classList.remove('visible');
});
sessionSplash.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});
