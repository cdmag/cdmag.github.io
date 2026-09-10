/* Archive link interceptor for the 1997 local sites.
   External http/https/www links open through Web Archive; local links open as-is. */
(function () {
  'use strict';
  var ARCHIVE_PREFIX = 'https://web.archive.org/web/199710/'; // <- change archive snapshot here

  function isExternal(u) {
    var low = u.toLowerCase();
    return low.indexOf('http://') === 0 || low.indexOf('https://') === 0 || low.indexOf('www.') === 0;
  }

  window.openArchivedUrl = function (rawUrl) {
    if (!rawUrl) return;
    var url = String(rawUrl).trim();
    if (!isExternal(url)) {
      // local document/file: open directly, untouched
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
    window.open(ARCHIVE_PREFIX + url, '_blank', 'noopener,noreferrer');
  };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = (a.getAttribute('href') || '').trim();
    if (isExternal(href)) {
      e.preventDefault();
      window.openArchivedUrl(href);
    }
  });
})();
