/* boot.js — OGOH MAI diagnostika qatlami (oddiy JS, Babel'siz).
   Maqsad: agar biror .jsx fayl yuklanishda/transpilatsiyada xato bersa yoki
   React render bo'lmasa, bo'sh ("qora") ekran o'rniga aniq xato matnini ko'rsatish.
   Bu hech qachon ishlayotgan sahifani buzmaydi — faqat muammo bo'lsa ishga tushadi. */
(function () {
  var shown = false;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function panel(title, lines) {
    if (shown) {
      // qo'shimcha xatolarni mavjud panelga qo'shamiz
      var body = document.getElementById('__exa_diag_body');
      if (body) body.insertAdjacentHTML('beforeend',
        '<div style="margin-top:12px;padding-top:12px;border-top:1px solid #3f3f46">' + lines.join('') + '</div>');
      return;
    }
    shown = true;
    var host = document.getElementById('root') || document.body;
    host.innerHTML =
      '<div role="alert" style="font:14px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;' +
      'color:#fafafa;background:#09090b;min-height:100vh;padding:40px;box-sizing:border-box">' +
        '<div style="max-width:760px;margin:0 auto">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
            '<span style="display:inline-flex;width:28px;height:28px;align-items:center;justify-content:center;' +
            'border-radius:8px;background:#7f1d1d;color:#fecaca;font-weight:700">!</span>' +
            '<span style="font-size:17px;font-weight:700;color:#fafafa">' + esc(title) + '</span>' +
          '</div>' +
          '<p style="color:#a1a1aa;margin:0 0 18px;font-size:13px">' +
            'Sahifa yuklanmadi. Quyida texnik tafsilot — bu xabarni dasturchiga yuboring.' +
          '</p>' +
          '<div id="__exa_diag_body" style="background:#18181b;border:1px solid #27272a;border-radius:10px;' +
          'padding:16px 18px;white-space:pre-wrap;word-break:break-word">' + lines.join('') + '</div>' +
          '<p style="color:#52525b;margin:18px 0 0;font-size:12px">OGOH MAI diagnostika · sahifani qayta yuklab ko\u2019ring</p>' +
        '</div>' +
      '</div>';
  }

  function row(label, val) {
    return '<div style="margin:2px 0"><span style="color:#a1a1aa">' + esc(label) + ':</span> ' +
      '<span style="color:#fafafa">' + esc(val) + '</span></div>';
  }

  // 1) Yuklanishdagi/runtime xatolarni ushlash
  window.addEventListener('error', function (e) {
    // resurs (img/script src) xatolari uchun e.message bo'lmaydi
    var msg = e.message || (e.error && e.error.message) || 'Skript yuklanmadi';
    var lines = [row('Xato', msg)];
    if (e.filename) lines.push(row('Fayl', e.filename.split('/').pop() + (e.lineno ? ':' + e.lineno : '')));
    if (e.error && e.error.stack) lines.push('<div style="color:#71717a;margin-top:8px;font-size:12px">' + esc(e.error.stack) + '</div>');
    panel('Xatolik yuz berdi', lines);
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    panel('Promise xatosi', [row('Xato', (r && r.message) || r)]);
  });

  // 2) Watchdog: belgilangan vaqt ichida #root to'lmasa, nimasi yetishmayotganini ko'rsatish
  window.__exaBoot = function (expected, timeoutMs) {
    expected = expected || [];
    timeoutMs = timeoutMs || 9000;
    setTimeout(function () {
      var root = document.getElementById('root');
      if (shown) return;
      if (root && root.children.length > 0) return; // muvaffaqiyatli render bo'ldi
      var lines = [row('Holat', 'React render bo\u2019lmadi (#root bo\u2019sh)')];
      lines.push(row('React', typeof React));
      lines.push(row('ReactDOM', typeof ReactDOM));
      lines.push(row('Babel', typeof Babel));
      var missing = expected.filter(function (k) { return typeof window[k] === 'undefined'; });
      if (missing.length) {
        lines.push('<div style="margin-top:10px;color:#fca5a5">Yuklanmagan komponentlar (mos .jsx faylda xato):</div>');
        lines.push(row('Yetishmayapti', missing.join(', ')));
      } else if (expected.length) {
        lines.push('<div style="margin-top:10px;color:#86efac">Barcha komponentlar yuklangan — render bosqichida xato bo\u2019lishi mumkin (konsolni tekshiring).</div>');
      }
      panel('Yuklash tugamadi', lines);
    }, timeoutMs);
  };
})();
