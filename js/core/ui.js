/* 介面元件：DOM 小工具、手繪墨線圖示、對話框、提示、字幕，以及環節引擎 SceneRunner */
(function () {
  var XC = window.XC;
  var ui = XC.ui = {};

  /* ---------- DOM 建構 ---------- */
  function h(sel, attrs) {
    var m = sel.split('.'), tag = m[0] || 'div', el = document.createElement(tag);
    if (m.length > 1) el.className = m.slice(1).join(' ');
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'on') Object.keys(v).forEach(function (e) { el.addEventListener(e, v[e]); });
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'cls') el.className += ' ' + v;
      else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(function (sk) { if (sk.indexOf('--') === 0) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; });
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, k) {
    if (k == null || k === false) return;
    if (Array.isArray(k)) k.forEach(function (x) { add(el, x); });
    else if (k.nodeType) el.appendChild(k);
    else el.appendChild(document.createTextNode(String(k)));
  }
  ui.h = h;
  ui.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  ui.$ = function (s, r) { return (r || document).querySelector(s); };
  ui.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  ui.fmt = function (sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; };
  ui.len = function (s) { return String(s || '').replace(/\s/g, '').length; };
  ui.T = function (k) { var u = XC.content.common && XC.content.common.ui; return (u && u[k]) || k; };

  /* ---------- 手繪墨線圖示（SVG，線寬一致） ---------- */
  var P = {
    lamp: '<path d="M8 28c5 7 27 7 32 0z"/><path d="M24 35v6M16 42h16"/><path d="M24 25c-5-4-3-10 0-15 3 5 5 11 0 15z"/>',
    mirror: '<circle cx="24" cy="20" r="12"/><path d="M17 16c2-3 6-5 10-4"/><path d="M24 32v9M16 42h16"/>',
    bridge: '<path d="M4 31h40"/><path d="M8 31c4-13 28-13 32 0"/><path d="M15 31v-6M33 31v-6M24 31v-9"/><path d="M4 38c6 2 10-2 16 0s10 2 16 0 8-1 8-1"/>',
    ding: '<path d="M9 18h30l-4 15H13z"/><path d="M14 33l-3 9M34 33l3 9M24 33v9"/><path d="M15 18c-1-3 1-6 1-6M33 18c1-3-1-6-1-6"/><path d="M24 14c-3-3-1-7 0-10 2 3 3 7 0 10z"/>',
    roots: '<path d="M24 4v18"/><path d="M24 22c-2 6-8 8-15 10M24 22c2 6 8 8 15 10M24 22v20M18 28c-2 5-1 10-4 14M30 28c2 5 1 10 4 14"/>',
    ripple: '<ellipse cx="24" cy="26" rx="5" ry="2.5"/><ellipse cx="24" cy="26" rx="12" ry="6"/><ellipse cx="24" cy="26" rx="20" ry="10"/>',
    scroll: '<path d="M12 10h24v26"/><path d="M12 10a4 4 0 0 0 0 8h4v-8M16 38a4 4 0 1 1 0-8h24v8z"/><path d="M20 17h11M20 23h11"/>',
    brush: '<path d="M33 5l9 9-17 17-9-9z"/><path d="M16 24c-6 0-9 5-9 9s-2 6-4 8c7 1 15-1 18-6 2-3 1-6 0-7"/>',
    bamboo: '<path d="M20 4v40"/><path d="M17 14h6M17 26h6M17 38h6"/><path d="M20 12c6-4 12-4 18-2-6 3-12 4-18 2zM20 23c-6-3-11-3-16-1 5 3 11 3 16 1z"/>',
    envelope: '<rect x="6" y="12" width="36" height="25" rx="2"/><path d="M6 14l18 13 18-13"/>',
    seal: '<rect x="11" y="21" width="26" height="19" rx="2"/><path d="M18 21v-6a6 6 0 0 1 12 0v6"/><path d="M18 31h12"/>',
    hourglass: '<path d="M13 6h22M13 42h22M16 6c0 10 16 10 16 18s-16 8-16 18M32 6c0 10-16 10-16 18s16 8 16 18"/>',
    magnifier: '<circle cx="20" cy="20" r="11"/><path d="M28 28l13 13"/>',
    key: '<circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v7M42 24v5"/>',
    flame: '<path d="M24 43c-8 0-12-6-12-12 0-8 8-12 8-23 6 4 14 12 14 23 0 6-4 12-10 12z"/><path d="M24 43c-3 0-5-3-5-6 0-4 5-7 5-10 2 2 5 6 5 10 0 3-2 6-5 6z"/>',
    sound: '<path d="M7 19h8l10-8v26l-10-8H7z"/><path d="M31 18c3 3 3 9 0 12M36 14c5 5 5 15 0 20"/>',
    mute: '<path d="M7 19h8l10-8v26l-10-8H7z"/><path d="M32 19l9 10M41 19l-9 10"/>',
    music: '<path d="M18 36V10l20-4v26"/><circle cx="13" cy="36" r="5"/><circle cx="33" cy="32" r="5"/>',
    full: '<path d="M6 16V6h10M32 6h10v10M42 32v10H32M16 42H6V32"/>',
    close: '<path d="M12 12l24 24M36 12L12 36"/>',
    prev: '<path d="M30 9L15 24l15 15"/>', next: '<path d="M18 9l15 15-15 15"/>',
    teacher: '<path d="M4 18l20-9 20 9-20 9z"/><path d="M12 22v9c4 4 20 4 24 0v-9"/><path d="M44 18v10"/>',
    box: '<path d="M6 16l18-8 18 8v18l-18 8-18-8z"/><path d="M6 16l18 8 18-8M24 24v18"/>',
    info: '<circle cx="24" cy="24" r="18"/><path d="M24 22v12M24 15v1"/>',
    list: '<path d="M16 12h25M16 24h25M16 36h25"/><path d="M7 12h1M7 24h1M7 36h1"/>',
    play: '<path d="M16 10l22 14-22 14z"/>', pause: '<path d="M17 10v28M31 10v28"/>',
    reset: '<path d="M10 24a14 14 0 1 0 4-10"/><path d="M10 8v7h7"/>',
    undo: '<path d="M14 18h17a10 10 0 0 1 0 20H20"/><path d="M20 10l-8 8 8 8"/>',
    plus: '<path d="M24 10v28M10 24h28"/>', minus: '<path d="M10 24h28"/>',
    dice: '<rect x="8" y="8" width="32" height="32" rx="5"/><path d="M17 17h.1M31 31h.1M24 24h.1M31 17h.1M17 31h.1" stroke-width="5"/>',
    print: '<path d="M14 18V6h20v12"/><rect x="6" y="18" width="36" height="15" rx="2"/><path d="M14 27h20v15H14z"/>',
    download: '<path d="M24 6v24M14 20l10 10 10-10M8 40h32"/>', upload: '<path d="M24 30V6M14 16l10-10 10 10M8 40h32"/>',
    check: '<path d="M10 25l9 9 19-20"/>',
    star: '<path d="M24 6l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z"/>',
    film: '<rect x="6" y="10" width="36" height="28" rx="2"/><path d="M20 18l10 6-10 6z"/>',
    home: '<path d="M6 24L24 8l18 16"/><path d="M12 20v20h24V20"/>',
    eye: '<path d="M4 24c8-12 32-12 40 0-8 12-32 12-40 0z"/><circle cx="24" cy="24" r="5"/>',
    trash: '<path d="M8 12h32M18 12V7h12v5M12 12l2 30h20l2-30"/>',
    voice: '<path d="M24 6a6 6 0 0 1 6 6v10a6 6 0 0 1-12 0V12a6 6 0 0 1 6-6z"/><path d="M12 22a12 12 0 0 0 24 0M24 34v8"/>',
    cards: '<rect x="6" y="12" width="22" height="30" rx="2"/><path d="M14 8l22 4-4 28"/>',
    support: '<path d="M24 42c-10-6-18-12-18-21a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 9-8 15-18 21z"/>',
    mountain: '<path d="M3 40l14-22 8 12 6-8 14 18z"/><path d="M14 23l3 3 3-3"/>'
  };
  ui.icon = function (n, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' + (P[n] || P.info) + '</svg>';
  };
  ui.icons = P;

  /* 按鈕 */
  ui.btn = function (label, o) {
    o = o || {};
    var cls = 'button.btn' + (o.primary ? '.btn-brush' : o.icon && !label ? '.btn-icon' : '.btn-line') + (o.cls ? '.' + o.cls.split(' ').join('.') : '');
    var b = h(cls, { type: 'button', title: o.title || null, 'aria-label': o.aria || (label ? null : o.title), on: o.onClick ? { click: o.onClick } : null, 'aria-pressed': o.pressed == null ? null : String(!!o.pressed), disabled: o.disabled || null });
    b.innerHTML = (o.icon ? ui.icon(o.icon) : '') + (label ? '<span>' + ui.esc(label) + '</span>' : '');
    return b;
  };

  /* aria-live 讀出 */
  ui.announce = function (msg) {
    var r = document.getElementById('live'); if (!r) return;
    r.textContent = ''; setTimeout(function () { r.textContent = msg; }, 40);
  };
  /* 輕提示 */
  ui.toast = function (msg, ms) {
    var t = h('div.toast', { role: 'status' }, msg); document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('in'); });
    setTimeout(function () { t.classList.remove('in'); setTimeout(function () { t.remove(); }, 500); }, ms || 2600);
  };

  /* 對話框（可鍵盤操作，Esc 關閉） */
  ui.modal = function (o) {
    o = o || {};
    var prev = document.activeElement;
    var back = h('div.modal-back' + (o.night ? '.night' : ''));
    var box = h('div.modal.panel' + (o.night ? '.panel-night' : '.panel-paper') + (o.cls ? '.' + o.cls : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || '' });
    var x = ui.btn('', { icon: 'close', title: '關閉', cls: 'modal-x', onClick: function () { close(); } });
    if (o.title) box.appendChild(h('h2.modal-title', null, o.title));
    var body = h('div.modal-body');
    if (typeof o.body === 'string') body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
    box.appendChild(body);
    var acts = h('div.modal-acts');
    (o.actions || [{ label: '關閉' }]).forEach(function (a) {
      acts.appendChild(ui.btn(a.label, { primary: a.primary, icon: a.icon, onClick: function () { var r = a.onClick && a.onClick(body); if (r !== false) close(a.value); } }));
    });
    box.appendChild(acts); if (o.closable !== false) box.appendChild(x);
    back.appendChild(box); (o.host || document.body).appendChild(back);
    function key(e) {
      if (e.key === 'Escape' && o.closable !== false) { e.stopPropagation(); close(); }
      if (e.key === 'Tab') {
        var f = ui.$$('button, input, textarea, select, [tabindex="0"], a[href]', box).filter(function (n) { return !n.disabled && n.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    back.addEventListener('keydown', key);
    back.addEventListener('click', function (e) { if (e.target === back && o.closable !== false && !o.sticky) close(); });
    requestAnimationFrame(function () {
      back.classList.add('in');
      var first = box.querySelector('input, textarea, select') || acts.querySelector('button');
      if (first) first.focus();
    });
    var done = false, handle;
    function close(v) {
      if (done) return; done = true;
      var k = openModals.indexOf(handle); if (k >= 0) openModals.splice(k, 1);
      back.classList.remove('in'); setTimeout(function () { back.remove(); }, 300);
      if (prev && prev.focus) try { prev.focus(); } catch (e) {}
      o.onClose && o.onClose(v);
    }
    handle = { close: close, el: box, body: body }; openModals.push(handle);
    return handle;
  };
  /* 換頁（離開圖層）時關閉仍開著的對話框，免得殘留在其他頁面上 */
  var openModals = [];
  ui.closeModals = function () { openModals.slice().forEach(function (m) { try { m.close(); } catch (e) {} }); };
  ui.confirm = function (msg, okLabel) {
    return new Promise(function (res) {
      var r = false;
      ui.modal({ title: '請確認', body: h('p', null, msg), actions: [
        { label: '取消' },
        { label: okLabel || '確定', primary: true, onClick: function () { r = true; } }
      ], onClose: function () { res(r); } });
    });
  };
  ui.prompt = function (title, label, opt) {
    opt = opt || {};
    return new Promise(function (res) {
      var inp = h('input.inp', { type: opt.type || 'text', inputmode: opt.inputmode || null, maxlength: opt.max || null, 'aria-label': label, autocomplete: 'off' });
      var val = null;
      ui.modal({ title: title, body: h('label.fld', null, h('span.fld-l', null, label), inp), actions: [
        { label: '取消' }, { label: '確定', primary: true, onClick: function () { val = inp.value; } }
      ], onClose: function () { res(val); } });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { val = inp.value; e.target.closest('.modal-back').querySelector('.btn-brush').click(); } });
    });
  };

  /* 詞條：點一下插入輸入框游標處 */
  ui.insertAtCursor = function (ta, text) {
    if (!ta) return;
    if (XC.hans) text = XC.hans.input(text);
    var s = ta.selectionStart != null ? ta.selectionStart : ta.value.length, e = ta.selectionEnd != null ? ta.selectionEnd : s;
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
    var p = s + text.length; ta.focus();
    try { ta.setSelectionRange(p, p); } catch (er) {}
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  };
  ui.chips = function (list, getTarget, cls) {
    var w = h('div.chips' + (cls ? '.' + cls : ''), { role: 'group', 'aria-label': '句式支架詞條' });
    (list || []).forEach(function (c) {
      w.appendChild(h('button.chip', { type: 'button', on: { click: function () { ui.insertAtCursor(getTarget(), c); } } }, c));
    });
    return w;
  };
  /* 文字輸入欄（含字數提示） */
  ui.field = function (o) {
    var id = 'f' + Math.random().toString(36).slice(2, 8);
    var ta = h(o.multi === false ? 'input.inp' : 'textarea.inp', { id: id, rows: o.rows || 2, placeholder: o.placeholder || '', maxlength: o.max || 300, 'aria-describedby': id + 'c' });
    ta.value = o.value || '';
    var cnt = h('span.fld-c', { id: id + 'c', 'aria-live': 'off' });
    function upd() {
      var n = ui.len(ta.value), min = XC.state.settings.minChars;
      cnt.textContent = o.noCount ? '' : (n + ' 字' + (o.minHint && n < min ? '（建議最少 ' + min + ' 字）' : ''));
      o.onInput && o.onInput(ta.value, ta);
    }
    ta.addEventListener('input', upd);
    var wrap = h('div.fld' + (o.cls ? '.' + o.cls : ''), null, h('label.fld-l', { for: id }, o.label), o.help ? h('p.fld-h', null, o.help) : null, ta,
      o.chips ? ui.chips(o.chips, function () { return ta; }) : null, cnt);
    setTimeout(upd, 0);
    wrap.input = ta;
    return wrap;
  };

  /* 全螢幕 */
  ui.fullscreen = function () {
    var d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else ui.toast('此瀏覽器不支援全螢幕');
  };

  /* 朗讀（P2）：優先 zh-HK 粵語，其次 zh-TW */
  ui.voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    var vs = speechSynthesis.getVoices();
    ui.voice = vs.filter(function (v) { return /zh[-_]HK|yue/i.test(v.lang); })[0] || vs.filter(function (v) { return /zh[-_]TW/i.test(v.lang); })[0] || null;
    XC.bus.emit('voices');
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  ui.speak = function (text) {
    if (!ui.voice) return; speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.voice = ui.voice; u.lang = ui.voice.lang; u.rate = 0.95; speechSynthesis.speak(u);
  };

  /* 印章徽章（字用網頁字型疊加） */
  ui.seal = function (name, icon, opt) {
    opt = opt || {};
    var s = h('span.seal' + (opt.small ? '.small' : '') + (opt.cls ? '.' + opt.cls : ''), { title: name, role: 'img', 'aria-label': '徽章：' + name });
    s.innerHTML = '<span class="seal-ring"></span><span class="seal-ico">' + ui.icon(icon || 'lamp') + '</span><span class="seal-name">' + ui.esc(name) + '</span>';
    return s;
  };

  /* 卡牌（宣紙卡、可 3D 翻轉） */
  ui.flipCard = function (front, back, o) {
    o = o || {};
    var c = h('div.flip' + (o.cls ? '.' + o.cls : ''), { tabindex: o.tab ? '0' : null });
    var inner = h('div.flip-in', null, h('div.flip-face.flip-back.card' + (o.backCls ? '.' + o.backCls : '.back-cloud'), null, back || ''), h('div.flip-face.flip-front.card', null, front));
    c.appendChild(inner);
    c.flip = function (v) { c.classList.toggle('flipped', v === undefined ? !c.classList.contains('flipped') : v); XC.audio.play('flip'); };
    return c;
  };
})();
