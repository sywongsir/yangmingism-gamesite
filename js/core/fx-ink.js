/* 墨滴暈開（0–2 秒）轉場、墨煙消散（27 秒）、水面漣漪（63–65 秒） */
(function () {
  var XC = window.XC; XC.fx = XC.fx || {};
  var cv = null, cx = null, busy = false;
  XC.fx.reduced = function () { return document.documentElement.classList.contains('rm'); };
  function canvas() {
    if (!cv) {
      cv = document.createElement('canvas'); cv.id = 'ink-canvas'; cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv); cx = cv.getContext('2d');
    }
    var dpr = Math.min(1.5, window.devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return cx;
  }
  function blob(c, x, y, r, seed, t) {
    var n = 80; c.beginPath();
    for (var i = 0; i <= n; i++) {
      var a = i / n * Math.PI * 2;
      var k = 1 + 0.13 * Math.sin(a * 3 + seed) + 0.08 * Math.sin(a * 7 + seed * 2.3 + t * 2) + 0.045 * Math.sin(a * 13 + seed * 5.1);
      var px = x + Math.cos(a) * r * k, py = y + Math.sin(a) * r * k;
      if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.closePath(); c.fill();
  }
  /* 墨暈覆蓋：由 (x,y) 不規則擴散至全屏，回傳 Promise */
  XC.fx.inkCover = function (x, y, opt) {
    opt = opt || {};
    var color = opt.color || '#0C0B0B';
    if (x == null) { x = innerWidth / 2; y = innerHeight / 2; }
    return new Promise(function (res) {
      var c = canvas(); busy = true;
      cv.style.transition = 'none'; cv.style.transform = 'none'; cv.style.display = 'block';
      if (XC.fx.reduced()) {
        cv.style.opacity = 0; c.fillStyle = color; c.fillRect(0, 0, innerWidth, innerHeight);
        requestAnimationFrame(function () { cv.style.transition = 'opacity .3s ease-in-out'; cv.style.opacity = 1; setTimeout(res, 320); });
        return;
      }
      cv.style.opacity = 1;
      XC.audio && XC.audio.play('drop');
      var W = innerWidth, H = innerHeight;
      var R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) * 1.2;
      var dur = opt.dur || 1000, seed = Math.random() * 10, t0 = performance.now();
      var sats = []; for (var i = 0; i < 7; i++) sats.push({ a: Math.random() * 6.283, d: 0.35 + Math.random() * 0.5, r: 0.05 + Math.random() * 0.08 });
      function fr(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        c.clearRect(0, 0, W, H); c.fillStyle = color; c.shadowColor = color; c.shadowBlur = 36;
        c.globalAlpha = 0.35; blob(c, x, y, R * e * 1.1 + 10, seed + 1.7, p);
        c.globalAlpha = 1; blob(c, x, y, R * e + 4, seed, p);
        sats.forEach(function (s) { var rr = R * e * s.d * 1.35 + 8; blob(c, x + Math.cos(s.a) * rr, y + Math.sin(s.a) * rr, R * s.r * Math.min(1, e * 1.5) + 2, seed + s.a, p); });
        if (p < 1) requestAnimationFrame(fr);
        else { c.shadowBlur = 0; c.globalAlpha = 1; c.fillRect(0, 0, W, H); res(); }
      }
      requestAnimationFrame(fr);
    });
  };
  /* 墨煙消散：淡出並微微擴散 */
  XC.fx.inkReveal = function (opt) {
    opt = opt || {};
    return new Promise(function (res) {
      if (!cv || cv.style.display === 'none') { busy = false; res(); return; }
      var d = XC.fx.reduced() ? 300 : (opt.dur || 800);
      cv.style.transition = 'opacity ' + d + 'ms ease-in-out, transform ' + d + 'ms ease-in-out';
      requestAnimationFrame(function () { cv.style.opacity = 0; if (!XC.fx.reduced()) cv.style.transform = 'scale(1.06)'; });
      setTimeout(function () { cv.style.display = 'none'; busy = false; res(); }, d + 40);
    });
  };
  XC.fx.inkBusy = function () { return busy; };
  /* 水面漣漪：同心墨圈擴散淡出 */
  XC.fx.ripple = function (x, y, opt) {
    if (XC.fx.reduced()) return;
    opt = opt || {};
    var host = opt.host || document.body;
    for (var i = 0; i < (opt.rings || 2); i++) {
      var r = document.createElement('span'); r.className = 'fx-ripple' + (opt.gold ? ' gold' : '');
      r.style.left = x + 'px'; r.style.top = y + 'px'; r.style.animationDelay = (i * 0.18) + 's';
      if (opt.size) r.style.setProperty('--rs', opt.size + 'px');
      host.appendChild(r);
      (function (el) { setTimeout(function () { el.remove(); }, 1700); })(r);
    }
  };
  /* 按下按鈕時的墨點漣漪 */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn, .chip, .card-pick');
    if (!b || XC.fx.reduced()) return;
    var rc = b.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'ink-dot'; s.style.left = (e.clientX - rc.left) + 'px'; s.style.top = (e.clientY - rc.top) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 650);
  });
})();
