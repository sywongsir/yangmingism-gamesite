/* 計時器：一炷燃香逐漸燒短；最後 10 秒輕微脈動；時間到響一下磬聲，不自動跳頁；可拖到畫面四角 */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h;
  var wake = null;
  function wakeOn() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(function (w) { wake = w; w.addEventListener('release', function () { wake = null; }); }).catch(function () {}); } catch (e) {} }
  function wakeOff() { try { if (wake) { wake.release(); wake = null; } } catch (e) {} }

  function incense() {
    return '<svg class="incense" viewBox="0 0 40 120" aria-hidden="true">' +
      '<path class="smoke" d="M20 10c-6 8 6 12 0 20s6 12 0 18"/>' +
      '<rect class="stick" x="18.5" y="22" width="3" height="80" rx="1.5"/>' +
      '<circle class="ember" cx="20" cy="22" r="3.2"/>' +
      '<path class="holder" d="M6 104h28l-4 10H10z"/></svg>';
  }

  XC.Timer = function (host, opt) {
    opt = opt || {};
    var T = this, total = 300, remain = 300, running = false, iv = 0, lastT = 0, chimed = false;
    var pos = XC.storage.get('timerPos', 'tr');
    var el = h('div.timer.pos-' + pos, { role: 'timer', 'aria-label': '環節計時器' });
    el.innerHTML = '<button type="button" class="tm-grip" title="拖動計時器到畫面四角" aria-label="拖動計時器">' + incense() + '</button>' +
      '<div class="tm-main"><div class="tm-time" aria-live="off">5:00</div><div class="tm-state"></div></div>' +
      '<div class="tm-ctl">' +
      '<button type="button" class="btn btn-icon tm-play" title="開始／暫停（空白鍵）" aria-label="開始或暫停計時">' + ui.icon('play') + '</button>' +
      '<button type="button" class="btn btn-icon tm-m" title="減 1 分鐘" aria-label="減一分鐘">' + ui.icon('minus') + '</button>' +
      '<button type="button" class="btn btn-icon tm-p" title="加 1 分鐘" aria-label="加一分鐘">' + ui.icon('plus') + '</button>' +
      '<button type="button" class="btn btn-icon tm-r" title="重設" aria-label="重設計時">' + ui.icon('reset') + '</button></div>';
    host.appendChild(el);
    var tEl = el.querySelector('.tm-time'), sEl = el.querySelector('.tm-state'), stick = el.querySelector('.stick'), ember = el.querySelector('.ember'), smoke = el.querySelector('.smoke'), play = el.querySelector('.tm-play');
    function draw() {
      tEl.textContent = ui.fmt(remain);
      var f = total > 0 ? remain / total : 0, len = 80 * f;
      stick.setAttribute('y', 102 - len); stick.setAttribute('height', Math.max(0.5, len));
      ember.setAttribute('cy', 102 - len); smoke.setAttribute('transform', 'translate(0,' + (80 - len) + ')');
      el.classList.toggle('running', running); el.classList.toggle('last', running && remain > 0 && remain <= 10);
      el.classList.toggle('up', remain <= 0);
      sEl.textContent = remain <= 0 ? '時間到' : (running ? '' : '暫停');
      play.innerHTML = ui.icon(running ? 'pause' : 'play');
      T.onchange && T.onchange(T);
    }
    function tick() {
      var now = Date.now(), d = (now - lastT) / 1000; lastT = now;
      remain = Math.max(0, remain - d);
      if (remain <= 0 && !chimed) { chimed = true; XC.audio.play('timeup'); ui.announce('時間到'); running = false; clearInterval(iv); wakeOff(); }
      draw();
    }
    T.set = function (sec, keep) { total = sec; remain = sec; chimed = false; if (!keep) T.pause(); draw(); };
    T.start = function () { if (remain <= 0) return; running = true; lastT = Date.now(); clearInterval(iv); iv = setInterval(tick, 250); wakeOn(); draw(); };
    T.pause = function () { running = false; clearInterval(iv); wakeOff(); draw(); };
    T.toggle = function () { running ? T.pause() : T.start(); };
    T.add = function (s) { remain = Math.max(0, remain + s); total = Math.max(total, remain); if (remain > 0) chimed = false; draw(); };
    T.reset = function () { remain = total; chimed = false; draw(); };
    T.running = function () { return running; };
    T.elapsed = function () { return Math.max(0, total - remain); };
    T.total = function () { return total; };
    T.el = el;
    T.destroy = function () { clearInterval(iv); wakeOff(); el.remove(); };
    play.onclick = T.toggle;
    el.querySelector('.tm-m').onclick = function () { T.add(-60); };
    el.querySelector('.tm-p').onclick = function () { T.add(60); };
    el.querySelector('.tm-r').onclick = T.reset;
    /* 拖動到四角 */
    var grip = el.querySelector('.tm-grip'), drag = null;
    grip.addEventListener('pointerdown', function (e) {
      var r = el.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      grip.setPointerCapture(e.pointerId); el.classList.add('dragging');
      el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
    });
    grip.addEventListener('pointermove', function (e) { if (!drag) return; el.style.left = (e.clientX - drag.dx) + 'px'; el.style.top = (e.clientY - drag.dy) + 'px'; });
    grip.addEventListener('pointerup', function (e) {
      if (!drag) return; drag = null; el.classList.remove('dragging');
      var hostR = host.getBoundingClientRect();
      var cxp = e.clientX < hostR.left + hostR.width / 2 ? 'l' : 'r', cyp = e.clientY < hostR.top + hostR.height / 2 ? 't' : 'b';
      el.style.left = el.style.top = el.style.right = el.style.bottom = '';
      el.className = el.className.replace(/pos-\w\w/, 'pos-' + cyp + cxp); pos = cyp + cxp; XC.storage.set('timerPos', pos);
    });
    grip.addEventListener('keydown', function (e) {
      var order = ['tl', 'tr', 'br', 'bl'];
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pos = order[(order.indexOf(pos) + 1) % 4]; el.className = el.className.replace(/pos-\w\w/, 'pos-' + pos); XC.storage.set('timerPos', pos); }
    });
    draw();
  };

  /* 小步驟獨立倒數（例如「每輪 1.5 分鐘」） */
  XC.miniTimer = function (sec, label) {
    var remain = sec, iv = 0, run = false, last = 0;
    var w = h('div.mini-timer', { role: 'timer', 'aria-label': (label || '小計時') });
    var t = h('span.mt-t', null, ui.fmt(sec));
    var b = ui.btn('開始', { icon: 'play', cls: 'sm' });
    var r = ui.btn('', { icon: 'reset', title: '重設', cls: 'sm' });
    w.appendChild(h('span.mt-l', null, label || '倒數')); w.appendChild(t); w.appendChild(b); w.appendChild(r);
    function draw() { t.textContent = ui.fmt(remain); w.classList.toggle('last', run && remain <= 10 && remain > 0); w.classList.toggle('up', remain <= 0); b.innerHTML = ui.icon(run ? 'pause' : 'play') + '<span>' + (run ? '暫停' : '開始') + '</span>'; }
    function tick() { var n = Date.now(); remain = Math.max(0, remain - (n - last) / 1000); last = n; if (remain <= 0) { run = false; clearInterval(iv); XC.audio.play('timeup'); ui.announce((label || '') + '時間到'); } draw(); }
    b.onclick = function () { if (run) { run = false; clearInterval(iv); } else if (remain > 0) { run = true; last = Date.now(); iv = setInterval(tick, 250); } draw(); };
    r.onclick = function () { run = false; clearInterval(iv); remain = sec; draw(); };
    w.stop = function () { run = false; clearInterval(iv); };
    draw();
    return w;
  };
})();
