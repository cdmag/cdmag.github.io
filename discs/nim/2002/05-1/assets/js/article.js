(function(){
  function send(url) {
    try { parent.postMessage({ type: 'link-status', url: url || '' }, '*'); } catch(e) {}
  }
  document.addEventListener('mouseover', function(e) {
    var a = e.target.closest && e.target.closest('a');
    if (a && a.href && a.getAttribute('href') && a.getAttribute('href').charAt(0) !== '#') {
      send(a.href);
    }
  });
  document.addEventListener('mouseout', function(e) {
    var a = e.target.closest && e.target.closest('a');
    if (a) send('');
  });
})();

(function(){
  var PREFIX = 'https://web.archive.org/web/200205/';
  function isExternal(href) {
    if (!href) return false;
    href = String(href).trim();
    if (!href || href.charAt(0) === '#') return false;
    if (/^(javascript|mailto|tel):/i.test(href)) return false;
    // protocol-relative or http(s)
    if (/^(https?:)?\/\//i.test(href)) return true;
    // anything with a scheme that looks like URL
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(href)) return true;
    return false;
  }
  function toArchive(href) {
    var url = String(href).trim();
    if (url.indexOf('//') === 0) url = 'http:' + url;
    if (/web\.archive\.org/i.test(url)) return url;
    return PREFIX + url;
  }
  function handler(e) {
    var t = e.target;
    var a = null;
    while (t && t !== document && t !== document.documentElement) {
      if (t.tagName && t.tagName.toLowerCase() === 'a') { a = t; break; }
      t = t.parentNode;
    }
    if (!a) return;
    var href = a.getAttribute('href');
    if (!isExternal(href)) return;
    e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    var target = a.getAttribute('target') || '_blank';
    window.open(toArchive(href), target);
  }
  document.addEventListener('click', handler, true);
})();
