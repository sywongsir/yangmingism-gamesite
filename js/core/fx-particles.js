/* 金色微塵（113–114 秒，上限 60）、金光迸發（52–54 秒）、燈火點亮（60–62 秒）、飛入動畫 */
(function () {
  var XC = window.XC; XC.fx = XC.fx || {};
  /* 微塵：canvas，緩慢漂浮；不閃爍 */
  XC.fx.Dust = function (canvas, opt) {
    opt = opt || {};
    var c = canvas.getContext('2d'), parts = [], raf = 0, running = false, last = 0;
    var max = Math.min(60, opt.count || 46);
    function size() {
      var dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(init) {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      return { x: Math.random() * w, y: init ? Math.random() * h : h + 10, r: 0.6 + Math.random() * 1.8,
        vy: -(4 + Math.random() * 10), vx: (Math.random() - 0.5) * 6, ph: Math.random() * 6.28, a: 0.25 + Math.random() * 0.5 };
    }
    function tick(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      var w = canvas.clientWidth, h = canvas.clientHeight;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.y += p.vy * dt; p.x += (p.vx + Math.sin(now / 2400 + p.ph) * 4) * dt;
        if (p.y < -10) parts[i] = spawn(false);
        var al = p.a * (0.7 + 0.3 * Math.sin(now / 1800 + p.ph));
        var g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(244,217,162,' + al + ')'); g.addColorStop(1, 'rgba(237,192,137,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r * 4, 0, 6.283); c.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    this.start = function () {
      if (running || XC.fx.reduced()) return;
      size(); if (!parts.length) for (var i = 0; i < max; i++) parts.push(spawn(true));
      running = true; last = 0; raf = requestAnimationFrame(tick);
    };
    this.stop = function () { running = false; cancelAnimationFrame(raf); c.clearRect(0, 0, canvas.width, canvas.height); };
    this.resize = function () { if (running) size(); };
  };
  /* 金光迸發：放射光線＋微塵，約 1.8 秒，緩入緩出，不閃爍 */
  XC.fx.burst = function (host, x, y, opt) {
    opt = opt || {};
    host = host || document.body;
    var b = document.createElement('div'); b.className = 'fx-burst'; b.setAttribute('aria-hidden', 'true');
    if (x != null) { b.style.left = x + 'px'; b.style.top = y + 'px'; }
    b.innerHTML = '<span class="rays"></span><span class="core"></span>';
    if (!XC.fx.reduced()) {
      for (var i = 0; i < 22; i++) {
        var d = document.createElement('i'), a = Math.random() * 6.283, r = 80 + Math.random() * 220;
        d.style.setProperty('--dx', Math.cos(a) * r + 'px'); d.style.setProperty('--dy', Math.sin(a) * r + 'px');
        d.style.animationDelay = (Math.random() * 0.4) + 's'; b.appendChild(d);
      }
    }
    host.appendChild(b);
    XC.audio && XC.audio.play('chime');
    setTimeout(function () { b.remove(); }, opt.dur || 2000);
  };
  /* 燈火點亮：元素加上 bloom 類別 600ms */
  XC.fx.bloom = function (el) {
    if (!el) return; el.classList.remove('bloom'); void el.offsetWidth; el.classList.add('bloom');
    setTimeout(function () { el.classList.remove('bloom'); }, 700);
  };
  XC.fx.dim = function (el) {
    if (!el) return; el.classList.remove('dimming'); void el.offsetWidth; el.classList.add('dimming');
    setTimeout(function () { el.classList.remove('dimming'); }, 1300);
  };
  /* 由 from 元素飛到 to 元素（燈油滴、火種、紙火焰） */
  XC.fx.fly = function (from, to, cls, delay) {
    return new Promise(function (res) {
      if (!from || !to || XC.fx.reduced()) { res(); return; }
      var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      var t = document.createElement('span'); t.className = 'fly-token ' + (cls || 'oil'); t.setAttribute('aria-hidden', 'true');
      t.style.left = (a.left + a.width / 2) + 'px'; t.style.top = (a.top + a.height / 2) + 'px';
      document.body.appendChild(t);
      setTimeout(function () {
        requestAnimationFrame(function () {
          t.style.transform = 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(.8)';
          t.style.opacity = '0.95';
        });
        setTimeout(function () { t.remove(); res(); }, 820);
      }, delay || 0);
    });
  };
})();
