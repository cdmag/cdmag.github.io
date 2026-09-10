/* Popup: files are on the disc image (shared with the main shell notice). */
(function () {
  'use strict';
  var STYLE = '#disk-notice-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);' +
    'display:flex;align-items:center;justify-content:center;z-index:998}' +
    '#disk-notice-overlay .box{background:#000;border:2px solid #008000;padding:16px 26px;' +
    'color:#00ff00;font-family:"PT Mono",monospace;font-size:24px;white-space:nowrap}';
  var timer = null;
  function close() {
    var ov = document.getElementById('disk-notice-overlay');
    if (ov) ov.remove();
    var st = document.getElementById('disk-notice-style');
    if (st) st.remove();
    if (timer) { clearTimeout(timer); timer = null; }
  }
  window.showDiskNotice = function (text) {
    close();
    var st = document.createElement('style');
    st.id = 'disk-notice-style';
    st.textContent = STYLE;
    document.head.appendChild(st);
    var ov = document.createElement('div');
    ov.id = 'disk-notice-overlay';
    var bx = document.createElement('div');
    bx.className = 'box';
    bx.textContent = text || '\u0412\u0441\u0435 \u0444\u0430\u0439\u043b\u044b \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u0432 \u043e\u0431\u0440\u0430\u0437\u0435 \u0434\u0438\u0441\u043a\u0430';
    ov.appendChild(bx);
    ov.addEventListener('click', close);
    document.body.appendChild(ov);
    timer = setTimeout(close, 1200);
  };
})();
