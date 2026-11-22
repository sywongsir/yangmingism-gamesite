/* 主程式：啟動、主頁「長夜山河圖」、分層開關與墨暈轉場、各頁面（序章、總覽、來源、回顧盒、教師控制台、終章） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state;
  var A = XC.app = {};
  var CM = function () { return XC.content.common; };
  var cur = null;            // 目前分層 {kind, id, el, runner}
  var navDepth = 0;          // 站內導航深度（返回鍵逐層返回）
  var firstRoute = true;
  var hub = {}, dust = null;
  var loaded = {};

  A.current = function () { return cur; };
  /* ---------- 動態載入 ---------- */
  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.async = false;
      s.onload = function () { res(); }; s.onerror = function () { delete loaded[src]; rej(new Error('載入失敗：' + src)); };
      document.body.appendChild(s);
    });
    return loaded[src];
  }
  function lessonMeta(id) { return CM().lessons.filter(function (l) { return l.id === id; })[0]; }
  A.loadContent = function (id) {
    var m = lessonMeta(id); if (!m || !m.ready) return Promise.resolve();
    return loadScript('js/content/' + id + '.js');
  };
  /* 內容檔與邏輯檔並行下載；async=false 保證按插入次序執行（內容先於邏輯） */
  A.loadLesson = function (id) { return Promise.all([A.loadContent(id), loadScript('js/lessons/' + id + '.js')]); };

  /* ---------- 設定 ---------- */
  var mqReduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  A.applySettings = function () {
    var s = St.settings, de = document.documentElement;
    de.classList.toggle('zoom', !!s.projectionZoom);
    de.classList.toggle('rm', s.motion === 'reduced' || !!(mqReduce && mqReduce.matches));
    if (dust) { if (XC.fx.reduced() || cur) dust.stop(); else dust.start(); }
    XC.bus.emit('settings', s);
  };
  A.titleFor = function (t) { document.title = (t ? t + '｜' : '') + CM().siteTitle; };

  /* ---------- 頁尾 ---------- */
  function footer(cls) { return h('p.site-foot' + (cls ? '.' + cls : ''), null, CM().footer); }

  /* ---------- 主頁：長夜山河圖 ---------- */
  var PATHS = {
    land: { vb: [1600, 900], start: [30, 880], end: [1590, 70],
      pts: [[205, 712], [478, 612], [700, 470], [968, 548], [1188, 380], [1418, 236]] },
    port: { vb: [900, 1600], start: [450, 1600], end: [470, 30],
      pts: [[262, 1385], [600, 1185], [282, 985], [610, 785], [282, 590], [596, 400]] }
  };
  function catmull(pts) {
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1.map(Math.round).join(' ') + ' ' + c2.map(Math.round).join(' ') + ' ' + p2.join(' ');
    }
    return d;
  }
  function orient() { return innerHeight > innerWidth * 1.05 ? 'port' : 'land'; }

  function buildHub() {
    var root = document.getElementById('hub');
    root.innerHTML = '';
    var cam = h('div.hub-cam');
    var far = h('div.hub-l.hub-far', { 'data-depth': '6' });
    var stars = h('div.hub-l.hub-moonglow', { 'data-depth': '4' });
    var mist2 = h('div.hub-l.hub-mist.m2', { 'data-depth': '10' });
    var pathL = h('div.hub-l.hub-pathl', { 'data-depth': '14' });
    var mist1 = h('div.hub-l.hub-mist.m1', { 'data-depth': '18' });
    var ridge = h('div.hub-l.hub-ridge', { 'data-depth': '26' });
    var dcv = h('canvas.hub-dust', { 'aria-hidden': 'true' });
    [far, stars, mist2, pathL, mist1, ridge, dcv].forEach(function (x) { cam.appendChild(x); });
    root.appendChild(cam);
    hub.cam = cam; hub.pathL = pathL; hub.layers = [far, stars, mist2, pathL, mist1, ridge];

    /* 標題（114 秒排法：米白字、金色外光、一道橫向光線、微塵） */
    var C = CM();
    var title = h('header.hub-title', null,
      h('h1.site-title', null, h('span.st-line', { 'aria-hidden': 'true' }), h('span.st-txt', null, C.siteTitle)),
      h('p.site-en.en', { lang: 'en' }, C.siteTitleEn),
      h('p.site-sub', null, C.siteSub),
      h('p.site-unit', null, C.unitLine));
    root.appendChild(title);
    root.appendChild(h('p.hub-hint', null, C.hubHint));
    root.appendChild(footer('hub-foot'));

    /* 頂部工具列 */
    var tb = h('nav.toolbar', { 'aria-label': '主要功能' },
      h('a.tb-brand', { href: '#/' }, ui.icons ? h('span', { html: ui.icon('lamp') }) : null, h('span', null, C.siteTitle)),
      h('div.tb-btns', null,
        tbBtn('序章', 'film', 'prologue'), tbBtn('單元總覽', 'list', 'overview'), tbBtn('我的回顧盒', 'box', 'box'),
        tbBtn('教師控制台', 'teacher', 'teacher'), tbBtn('來源與說明', 'info', 'about'),
        hub.scr = scriptBtn(),
        hub.snd = ui.btn('', { icon: 'mute', cls: 'tb-b', title: '聲音開關（M）', onClick: function () { XC.audio.toggle(); } }),
        hub.bgm = ui.btn('', { icon: 'music', cls: 'tb-b', title: '背景音樂', onClick: function () { XC.audio.toggleBgm(); } }),
        ui.btn('', { icon: 'full', cls: 'tb-b', title: '全螢幕（F）', onClick: ui.fullscreen })));
    root.appendChild(tb);
    hub.bgm.hidden = !XC.audio.bgm;
    if (!hub.scrBound) { hub.scrBound = true; document.addEventListener('xc:script', function () { syncScript(); }); }
    syncSound();
    drawPath();
    dust = new XC.fx.Dust(dcv, { count: 46 });
    if (!XC.fx.reduced()) dust.start();

    /* 視差 */
    var tx = 0, ty = 0, raf = 0;
    function apply() { raf = 0; hub.layers.forEach(function (l) { var d = +l.getAttribute('data-depth'); l.style.transform = 'translate3d(' + (-tx * d) + 'px,' + (-ty * d * 0.6) + 'px,0)'; }); }
    root.addEventListener('pointermove', function (e) {
      if (cur || XC.fx.reduced() || e.pointerType === 'touch') return;
      tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5);
      if (!raf) raf = requestAnimationFrame(apply);
    });
    window.addEventListener('deviceorientation', function (e) {
      if (cur || XC.fx.reduced() || e.gamma == null) return;
      tx = Math.max(-0.5, Math.min(0.5, e.gamma / 60)); ty = Math.max(-0.5, Math.min(0.5, (e.beta - 40) / 80));
      if (!raf) raf = requestAnimationFrame(apply);
    });
    var lastO = orient();
    window.addEventListener('resize', function () { if (orient() !== lastO) { lastO = orient(); drawPath(); } dust && dust.resize(); });
  }
  function tbBtn(label, icon, route) {
    return ui.btn(label, { icon: icon, cls: 'tb-b', onClick: function (e) { A.nav(route, e.currentTarget); } });
  }
  /* 一鍵繁簡切換：按鈕本身不轉換（data-nohans），顯示「切換後」的字體名稱 */
  function scriptBtn(cls) {
    var b = ui.btn('简体', { cls: (cls || 'tb-b') + ' tb-script', onClick: function () {
      if (!XC.hans) return;
      XC.hans.toggle();
      ui.toast(XC.hans.isOn() ? '已切換為簡體中文顯示' : '已切換為繁體中文顯示');
    } });
    b.setAttribute('data-nohans', '');
    setTimeout(syncScript, 0);
    return b;
  }
  function syncScript() {
    var on = !!(XC.hans && XC.hans.isOn());
    Array.prototype.forEach.call(document.querySelectorAll('.tb-script'), function (b) {
      var sp = b.querySelector('span');
      if (sp) { sp.textContent = on ? '繁體' : '简体'; sp.setAttribute('lang', on ? 'zh-HK' : 'zh-Hans'); }
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? '切換為繁體中文顯示' : '切换为简体中文显示');
      b.title = on ? '切換為繁體中文顯示' : '切换为简体中文显示';
    });
  }
  function syncSound() {
    if (!hub.snd) return;
    hub.snd.innerHTML = ui.icon(XC.audio.on ? 'sound' : 'mute');
    hub.snd.setAttribute('aria-label', XC.audio.on ? '關閉聲音' : '開啟聲音'); hub.snd.setAttribute('aria-pressed', String(XC.audio.on));
    if (hub.bgm) { hub.bgm.setAttribute('aria-pressed', String(!!XC.audio.bgmOn)); hub.bgm.setAttribute('aria-label', '背景音樂'); }
  }
  function drawPath() {
    var o = orient(), P = PATHS[o], W = P.vb[0], H = P.vb[1];
    var all = [P.start].concat(P.pts).concat([P.end]);
    var d = catmull(all);
    var L = hub.pathL; L.innerHTML = '';
    L.classList.toggle('port', o === 'port');
    var svg = '<svg class="hub-path" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><filter id="pblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<linearGradient id="pgrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#F4CB99" stop-opacity=".75"/><stop offset="1" stop-color="#F4D9A2" stop-opacity=".35"/></linearGradient></defs>' +
      '<path d="' + d + '" class="p-glow" filter="url(#pblur)"/><path d="' + d + '" class="p-core"/><path d="' + d + '" class="p-flow"/></svg>';
    L.innerHTML = svg;
    var prog = St.progress(), C = CM();
    C.lessons.forEach(function (l, i) {
      var pt = P.pts[i], state = prog[l.id] || 'none';
      var b = h('button.station.st-' + state + '.st-n' + (i + 1) + ((o === 'land' ? (i % 2 ? '.lab-b' : '.lab-a') : (i % 2 ? '.lab-l' : '.lab-r'))), {
        type: 'button', 'data-id': l.id,
        style: { left: (pt[0] / W * 100) + '%', top: (pt[1] / H * 100) + '%' },
        'aria-label': '第' + l.no + '節《' + l.game + '》' + l.tagline + '，價值觀：' + l.value + '，層次：' + l.level + '，' + C.stationStates[state],
        on: { click: function (e) { A.nav(l.id, b); } }
      });
      b.innerHTML = '<span class="st-ring"><span class="st-img" style="background-image:url(\'' + l.stationImg + '\')" role="img" aria-label="' + ui.esc(l.stationAlt) + '"></span><span class="st-halo"></span><span class="st-flame">' + ui.icon(l.icon) + '</span></span>' +
        '<span class="st-text"><span class="st-no">第' + l.no + '節｜' + ui.esc(l.station) + '</span><b class="st-game">《' + ui.esc(l.game) + '》</b><span class="st-tag">' + ui.esc(l.tagline) + '</span>' +
        '<span class="st-tags"><span class="tag tag-value">' + ui.esc(l.value) + '</span><span class="tag">' + ui.esc(l.level) + '</span></span>' +
        '<span class="st-state">' + C.stationStates[state] + '</span></span>';
      L.appendChild(b);
    });
  }
  function hubPause(v) {
    var root = document.getElementById('hub');
    root.classList.toggle('paused', v);
    if (v) { dust && dust.stop(); } else if (!XC.fx.reduced()) { dust && dust.start(); }
  }
  function camPush(stationEl) {
    return new Promise(function (res) {
      if (!stationEl || !hub.cam || XC.fx.reduced()) { res(); return; }
      var r = stationEl.querySelector('.st-ring') ? stationEl.querySelector('.st-ring').getBoundingClientRect() : stationEl.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2, s = 1.7;
      hub.cam.style.transformOrigin = cx + 'px ' + cy + 'px';
      hub.cam.style.transition = 'transform 900ms ease-in-out';
      hub.cam.style.transform = 'translate(' + (innerWidth / 2 - cx) + 'px,' + (innerHeight / 2 - cy) + 'px) scale(' + s + ')';
      setTimeout(res, 820);
    });
  }
  function camReset(anim) {
    if (!hub.cam) return;
    hub.cam.style.transition = anim && !XC.fx.reduced() ? 'transform 900ms ease-in-out' : 'none';
    hub.cam.style.transform = '';
  }

  /* ---------- 分層 ---------- */
  var layersEl = function () { return document.getElementById('layers'); };
  function center(el) { if (!el || !el.getBoundingClientRect) return [innerWidth / 2, innerHeight / 2]; var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  var busy = false, pendingRoute = null;
  function makeLayer(kind, theme) {
    var el = h('div.layer.layer-' + kind + '.theme-' + (theme || 'paper'), { role: 'region' });
    return el;
  }
  function destroyCur() {
    if (!cur) return;
    if (ui.closeModals) ui.closeModals();
    if (cur.runner) cur.runner.destroy();
    if (cur.cleanup) try { cur.cleanup(); } catch (e) {}
    cur.el.remove(); cur = null;
  }
  /* 開啟分層：build(el) 回傳 Promise 或 undefined */
  function openLayer(spec, origin) {
    var instant = firstRoute;
    var station = origin && origin.classList && origin.classList.contains('station') ? origin : null;
    busy = true;
    var pre = instant ? Promise.resolve() : (station ? camPush(station) : Promise.resolve()).then(function () {
      var c = center(station ? station.querySelector('.st-ring') : origin);
      if (station) c = [innerWidth / 2, innerHeight / 2];
      return XC.fx.inkCover(c[0], c[1], { dur: 1000 });
    });
    return pre.then(function () {
      destroyCur();
      var el = makeLayer(spec.kind, spec.theme);
      layersEl().appendChild(el);
      cur = { kind: spec.kind, id: spec.id, el: el };
      return Promise.resolve(spec.build(el, cur)).catch(function (e) { console.error(e); el.appendChild(h('p.err', null, '載入失敗：' + e.message)); });
    }).then(function () {
      hubPause(true);
      document.getElementById('hub').setAttribute('aria-hidden', 'true');
      document.getElementById('hub').classList.add('covered');
      camReset(false);
      return instant ? null : XC.fx.inkReveal({ dur: 800 });
    }).then(function () {
      busy = false; var f = cur && (cur.el.querySelector('[autofocus]') || cur.el.querySelector('h1') || cur.el.querySelector('h2') || cur.el.querySelector('button')); if (f && f.focus) try { if (/^H/.test(f.tagName)) { f.setAttribute('tabindex', '-1'); f.style.outline = 'none'; } f.focus({ preventScroll: true }); } catch (e) {}
      if (pendingRoute) { var p = pendingRoute; pendingRoute = null; A.route(p); }
    });
  }
  function closeAll(instant) {
    if (!cur) { hubPause(false); return Promise.resolve(); }
    busy = true;
    var station = cur && cur.kind === 'lesson' ? document.querySelector('.station[data-id="' + cur.id + '"]') : null;
    var pre = instant ? Promise.resolve() : XC.fx.inkCover(innerWidth / 2, innerHeight / 2, { dur: 900 });
    return pre.then(function () {
      destroyCur();
      var hb = document.getElementById('hub'); hb.removeAttribute('aria-hidden'); hb.classList.remove('covered');
      drawPath();
      if (station && !instant && !XC.fx.reduced()) {
        station = document.querySelector('.station[data-id="' + station.getAttribute('data-id') + '"]');
        var r = station.querySelector('.st-ring').getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        hub.cam.style.transition = 'none'; hub.cam.style.transformOrigin = cx + 'px ' + cy + 'px';
        hub.cam.style.transform = 'translate(' + (innerWidth / 2 - cx) + 'px,' + (innerHeight / 2 - cy) + 'px) scale(1.7)';
        void hub.cam.offsetWidth;
      }
      hubPause(false);
      A.titleFor('');
      return instant ? null : XC.fx.inkReveal({ dur: 800 });
    }).then(function () {
      if (station) camReset(true);
      busy = false;
      if (station) try { document.querySelector('.station[data-id="' + station.getAttribute('data-id') + '"]').focus({ preventScroll: true }); } catch (e) {}
      checkFinale();
      if (pendingRoute) { var p = pendingRoute; pendingRoute = null; A.route(p); }
    });
  }
  A.nav = function (route, origin) {
    A._origin = origin || null;
    navDepth++;
    XC.router.go(route);
  };
  A.closeLayer = function () {
    if (navDepth > 0) { navDepth--; history.back(); }
    else { try { history.replaceState(null, '', '#/'); } catch (e) { location.hash = '#/'; return; } A.route(XC.router.parse()); }
  };

  /* ---------- 路由 ---------- */
  A.route = function (r) {
    if (busy) { pendingRoute = r; return; }
    var origin = A._origin; A._origin = null;
    var n = r.name;
    if (!n) { closeAll(firstRoute); firstRoute = false; maybeFirstVisit(); return; }
    var lm = lessonMeta(n);
    if (lm) {
      if (r.sub === 'print') return go({ kind: 'page', id: n + '-print', theme: 'paper', build: function (el) { pagePrintStub(el, lm); } }, origin);
      if (r.sub === 'open') return go({ kind: 'page', id: n + '-open', theme: 'paper', build: function (el, c) {
        if (n !== 'l6') return pageStub(el, lm, 'open');
        var b = pageFrame(el, '第6節《同心圈》開封跟進', 'Follow-up: Opening the Pledge Envelope', 'envelope');
        return A.loadLesson('l6').then(function () { c.cleanup = XC.lessons.l6.openPage(b); b.appendChild(footer()); });
      } }, origin);
      if (cur && cur.kind === 'lesson' && cur.id === n && cur.runner) {
        if (r.sub) { var si = cur.runner.scenes.map(function (s) { return s.id; }).indexOf(r.sub); if (si >= 0 && si !== cur.runner.ls.scene) cur.runner.go(si, 0, 0); }
        return;
      }
      if (!lm.ready) return go({ kind: 'page', id: n, theme: 'paper', build: function (el) { pageStub(el, lm); } }, origin);
      return go({ kind: 'lesson', id: n, theme: 'night', build: function (el, c) {
        return A.loadLesson(n).then(function () { c.runner = new XC.Runner(n, el, r.sub); el.appendChild(footer('ls-foot')); });
      } }, origin);
    }
    var pages = {
      prologue: { theme: 'night', build: pagePrologue },
      overview: { theme: 'paper', build: pageOverview },
      about: { theme: 'paper', build: pageAbout },
      box: { theme: 'paper', build: pageBox },
      teacher: { theme: 'paper', build: pageTeacher },
      finale: { theme: 'night', build: pageFinale }
    };
    var p = pages[n];
    if (!p) { try { history.replaceState(null, '', '#/'); } catch (e) {} A.route({ name: '' }); return; }
    if (n === 'teacher' && St.settings.teacherPin && !St.teacherUnlocked) {
      XC.teacher.unlock().then(function (ok) { if (ok) go({ kind: 'page', id: n, theme: p.theme, build: p.build }, origin); else A.closeLayer(); });
      return;
    }
    go({ kind: 'page', id: n, theme: p.theme, build: p.build }, origin);
  };
  function go(spec, origin) {
    if (cur && cur.id === spec.id) return;
    openLayer(spec, origin); firstRoute = false;
  }

  /* ---------- 頁面骨架 ---------- */
  function pageFrame(el, title, en, icon) {
    var head = h('header.pg-head', null,
      ui.btn('', { icon: 'home', title: '返回長夜山河圖', cls: 'pg-home', onClick: A.closeLayer }),
      h('div.pg-t', null, h('h1', { tabindex: '-1' }, title), en ? h('p.en', { lang: 'en' }, en) : null),
      h('div.pg-tools', null,
        ui.btn('', { icon: 'full', cls: 'sm', title: '全螢幕', onClick: ui.fullscreen })));
    var body = h('div.pg-scroll');
    el.appendChild(head); el.appendChild(body);
    A.titleFor(title);
    return body;
  }

  /* ---------- 首次進入 ---------- */
  function maybeFirstVisit() {
    if (XC.storage.get('visited', false) || document.querySelector('.first-visit')) return;
    var C = CM().firstVisit;
    var ov = h('div.first-visit', { role: 'dialog', 'aria-modal': 'true', 'aria-label': C.title },
      h('div.fv-in', null,
        h('h2.site-title', null, h('span.st-line', { 'aria-hidden': 'true' }), h('span.st-txt', null, CM().siteTitle)),
        h('p.site-sub', null, CM().siteSub),
        h('div.fv-acts', null,
          ui.btn(C.watch, { primary: true, icon: 'film', onClick: function () { done(); A.nav('prologue'); } }),
          ui.btn(C.skip, { icon: 'next', onClick: function () { done(); } }),
          scriptBtn('fv-script'))));
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('in'); ov.querySelector('button').focus(); });
    function done() { XC.storage.set('visited', true); ov.classList.remove('in'); setTimeout(function () { ov.remove(); }, 600); }
  }

  /* ---------- 序章 ---------- */
  function pagePrologue(el, c) {
    A.titleFor('序章');
    var v = h('video.pro-video', { src: 'assets/video/prologue-web.mp4', poster: 'assets/video/prologue-poster.webp', preload: 'metadata', playsinline: true, 'webkit-playsinline': true, controls: true, 'aria-label': '序章動畫短片（已燒錄中英字幕）' });
    var big = h('button.pro-play', { type: 'button', 'aria-label': '播放序章' }, h('span', { html: ui.icon('play') }), h('b', null, '播放序章（2分鐘）'));
    var bar = h('div.pro-bar', null,
      ui.btn('返回', { icon: 'home', onClick: A.closeLayer }),
      ui.btn('重播', { icon: 'reset', onClick: function () { v.currentTime = 0; v.play().catch(function () {}); } }),
      ui.btn('略過', { icon: 'next', primary: true, onClick: finish }));
    el.appendChild(v); el.appendChild(big); el.appendChild(bar);
    function play() { big.hidden = true; v.play().then(function () { big.hidden = true; }).catch(function () { big.hidden = false; }); }
    big.onclick = play;
    v.addEventListener('play', function () { big.hidden = true; XC.audio.stopAll(); });
    v.addEventListener('ended', finish);
    var fin = false;
    function finish() { if (fin) return; fin = true; XC.storage.set('visited', true); try { v.pause(); } catch (e) {} A.closeLayer(); }
    c.cleanup = function () { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} };
    setTimeout(play, 300);
  }

  /* ---------- 單元總覽 ---------- */
  function pageOverview(el) {
    var C = CM(), M = C.meta, b = pageFrame(el, '單元總覽', 'Unit Overview');
    var w = h('div.page-body');
    w.appendChild(h('section.card.ov-intro', null, h('h2', null, C.siteTitle), h('p.lead', null, C.siteSub), h('p', null, C.unitLine), h('p', null, C.structure)));
    var tb = h('table.ov-table');
    tb.appendChild(h('thead', null, h('tr', null, ['節', '主標與副標', '價值觀', '層次', '核心提問', '學習產出'].map(function (t) { return h('th', { scope: 'col' }, t); }))));
    var bd = h('tbody');
    C.lessons.forEach(function (l) {
      var m = M[l.id] || {};
      bd.appendChild(h('tr', null, h('th', { scope: 'row' }, '第' + l.no + '節'),
        h('td', null, h('a', { href: '#/' + l.id }, '《' + l.game + '》' + l.tagline), h('br'), h('small', null, l.title)),
        h('td', null, h('span.tag.tag-value', null, l.value)), h('td', null, l.level), h('td', null, m.coreQuestion || ''), h('td', null, l.output)));
    });
    tb.appendChild(bd);
    w.appendChild(h('section.card', null, h('h2', null, '六節一覽'), h('div.tbl-wrap', null, tb)));
    var chain = h('ol.ov-chain');
    C.outputsChain.forEach(function (o, i) { chain.appendChild(h('li', null, h('span.oc-no', null, '第' + o.no + '節'), h('b', null, o.name), o.note ? h('small', null, o.note) : null)); });
    w.appendChild(h('section.card', null, h('h2', null, '學習產出如何一路串連'), chain));
    var vals = h('div.ov-values');
    C.values.forEach(function (v) { vals.appendChild(h('div.ov-v', null, h('b', null, v.name), h('span.tag', null, v.lessons), h('p', null, v.note))); });
    w.appendChild(h('section.card', null, h('h2', null, '四個首要價值觀'), vals,
      h('h3', null, '學習要點'), h('p', null, C.learningPoints.map(function (x) { return x.name + '（' + x.lessons + '）'; }).join('；')),
      h('ul.fine-list', null, C.unitInfo.map(function (t) { return h('li', null, t); }))));
    var fc = h('div.ov-focus');
    C.lessons.forEach(function (l) {
      var m = M[l.id] || {};
      fc.appendChild(h('div.ov-f', null, h('h3', null, '第' + l.no + '節《' + l.game + '》'), h('p.fine', null, l.title), h('ol', null, (m.focus || []).map(function (f) { return h('li', null, f); }))));
    });
    w.appendChild(h('section.card', null, h('h2', null, '各節學習重點'), fc));
    w.appendChild(footer());
    b.appendChild(w);
  }

  /* ---------- 來源與說明 ---------- */
  function pageAbout(el) {
    var C = CM(), M = C.meta, Ab = C.about, b = pageFrame(el, '來源與說明', 'Sources & Notes');
    var w = h('div.page-body');
    w.appendChild(h('section.card', null, h('h2', null, '資料性質說明'), h('ul', null, Ab.natureNotes.map(function (t) { return h('li', null, t); }))));
    var refs = h('div.ab-refs');
    C.lessons.forEach(function (l) {
      var m = M[l.id] || {};
      var items = (l.id === 'l1' && XC.content.l1) ? XC.content.l1.references : (m.refs || []);
      refs.appendChild(h('details.ab-ref', { open: l.no === 1 ? true : null }, h('summary', null, '第' + l.no + '節《' + l.game + '》文獻依據'),
        h('ul', null, items.map(function (t) { return h('li', null, t); }))));
    });
    w.appendChild(h('section.card', null, h('h2', null, '各節文獻依據'), refs));
    w.appendChild(h('section.card', null, h('h2', null, '教學設計說明'),
      h('p', null, '以下全部是本單元的教學設計，不是陽明原話，也不是官方論述：'),
      h('p.design-items', null, C.designItems.map(function (t) { return h('span.tag', null, t); }))));
    w.appendChild(h('section.card', null, h('h2', null, '造型、AI 與字型'),
      h('p', null, h('b', null, '陽明造型：動畫造型，非歷史畫像。'), Ab.character.replace('陽明造型：動畫造型，非歷史畫像。', '')),
      h('p', null, h('b', null, '本網站部分圖像及聲音由 AI 工具輔助製作。'), Ab.ai.replace('本網站部分圖像及聲音由 AI 工具輔助製作：', '')),
      h('h3', null, '字型授權'), h('ul', null, Ab.fonts.map(function (t) { return h('li', null, t); }))));
    w.appendChild(h('section.card', null, h('h2', null, '私隱說明'), h('ul', null, Ab.privacy.map(function (t) { return h('li', null, t); })), h('p', null, Ab.anonymity)));
    w.appendChild(footer());
    b.appendChild(w);
  }

  /* ---------- 我的回顧盒 ---------- */
  function pageBox(el) {
    var C = CM(), b = pageFrame(el, '我的回顧盒', 'My Reflection Box');
    function render() {
      b.innerHTML = '';
      var w = h('div.page-body.box-page');
      if (!XC.storage.available) w.appendChild(h('p.warn', null, C.storageWarn));
      w.appendChild(h('section.card.box-tools', null,
        h('p', null, '這裏按節保存你在自學模式（或課堂示範）完成的個人產出。資料只存在這部裝置的瀏覽器，不會上傳。共用平板的同學，請在離開前「匯出備份檔」帶走，或「清除本機資料」。'),
        h('div.c-row', null,
          ui.btn('匯出備份檔（.json）', { icon: 'download', onClick: function () {
            var self = {}; C.lessons.forEach(function (l) { var s = XC.storage.get('self_' + l.id, null); if (s) self[l.id] = s; });
            XC.export.json({ type: 'xinxue-box', version: XC.config.version, exportedAt: new Date().toISOString(), box: St.box(), self: self }, '我的回顧盒-' + XC.export.stamp() + '.json');
          } }),
          ui.btn('匯入備份檔', { icon: 'upload', onClick: function () {
            XC.export.pickJSON().then(function (o) {
              if (!o || o.type !== 'xinxue-box') { ui.toast('檔案格式不符'); return; }
              var bx = St.box(); Object.keys(o.box || {}).forEach(function (lid) { bx[lid] = Object.assign(bx[lid] || {}, o.box[lid]); });
              XC.storage.set('box', bx);
              Object.keys(o.self || {}).forEach(function (lid) { XC.storage.set('self_' + lid, o.self[lid]); });
              ui.toast('已匯入回顧盒'); setTimeout(function () { location.reload(); }, 600);
            }).catch(function () { ui.toast('未能讀取檔案'); });
          } }),
          ui.btn('清除本機資料', { icon: 'trash', onClick: function () {
            ui.confirm('確定清除這部裝置上的回顧盒與自學紀錄？清除後不能復原，建議先匯出備份檔。', '清除').then(function (ok) {
              if (!ok) return; XC.storage.remove('box'); C.lessons.forEach(function (l) { XC.storage.remove('self_' + l.id); }); location.reload();
            });
          } }))));
      var box = St.box(), any = false;
      C.lessons.forEach(function (l) {
        var items = box[l.id] || {}, keys = Object.keys(items);
        var sec = h('section.card.box-sec', null, h('h2', null, h('span', { html: ui.icon(l.icon) }), '第' + l.no + '節《' + l.game + '》', h('small', null, l.output)));
        if (!keys.length) sec.appendChild(h('p.fine', null, l.ready ? '尚未有產出。完成本節的個人產出後按「存入回顧盒」，就會出現在這裏。' : '本節將於之後的建置階段完成。'));
        keys.forEach(function (k) {
          any = true;
          var it = items[k];
          if (it.sealed) {
            var envc = h('article.box-item.card-paper.box-env', null,
              h('div.envelope.sealed', { role: 'img', 'aria-label': '已封存的承諾信封' }, h('div.env-back'), h('div.env-letter', null, h('i'), h('i'), h('i')), h('div.env-front'), h('div.env-flap'), h('div.env-seal', { html: ui.icon('seal') }), h('div.env-name', null, it.name || '')),
              h('div', null, h('h3', null, (it.title || '承諾信封') + '（已封存）'), h('p', null, '信封內容不在這裏顯示。' + (it.openVia === 'l4' ? '第4節「開封」環節才能打開。' : (it.openDate ? '開封日期：' + new Date(it.openDate).toLocaleDateString('zh-HK') + '；日期前信封鎖著。' : ''))),
                h('p.fine', null, '封存時間：' + new Date(it.sealedAt || it.savedAt).toLocaleString('zh-HK')),
                h('div.c-row', null, it.openVia === 'l6' ? ui.btn(Date.now() >= (it.openDate || 0) ? '開封日期到了：前往開封跟進頁' : '前往開封跟進頁', { icon: 'envelope', cls: 'sm', primary: Date.now() >= (it.openDate || 0), onClick: function () { XC.router.go('l6/open'); } }) : null, ui.btn('刪除', { icon: 'trash', cls: 'sm', onClick: function () { ui.confirm('確定刪除這封未開封的信封？刪除後不能復原。').then(function (ok) { if (ok) { St.removeBoxItem(l.id, k); render(); } }); } }))));
            sec.appendChild(envc); return;
          }
          var card = h('article.box-item.card-paper', null, h('h3', null, it.title || k),
            h('dl', null, (it.fields || []).map(function (f) { return [h('dt', null, f.label), h('dd', null, f.value || '—')]; })),
            it.openedAt ? h('p.fine', null, '封存時間：' + new Date(it.sealedAt).toLocaleString('zh-HK') + '；' + (it.openVia === 'l6' ? (it.early ? '提早開封（教師）' : '開封') : '第4節開封') + '：' + new Date(it.openedAt).toLocaleString('zh-HK')) : null,
            it.sig ? h('img.box-sig', { src: it.sig, alt: '手寫簽名' }) : null,
            h('p.fine', null, '存入時間：' + new Date(it.savedAt).toLocaleString('zh-HK')));
          var acts = h('div.c-row');
          if (it.card !== false) {
            acts.appendChild(ui.btn('下載 PNG', { icon: 'download', cls: 'sm', onClick: function () { XC.export.cardPNG(boxCard(l, it), (it.title || '卡') + '-' + XC.export.stamp() + '.png'); } }));
            acts.appendChild(ui.btn('列印（A5）', { icon: 'print', cls: 'sm', onClick: function () { XC.export.printCard(boxCard(l, it)); } }));
          }
          if (it.openVia === 'l6') acts.appendChild(ui.btn('開封跟進（步驟五、六）', { icon: 'envelope', cls: 'sm', onClick: function () { XC.router.go('l6/open'); } }));
          acts.appendChild(ui.btn('刪除', { icon: 'trash', cls: 'sm', onClick: function () { ui.confirm('確定刪除「' + (it.title || k) + '」？').then(function (ok) { if (ok) { St.removeBoxItem(l.id, k); render(); } }); } }));
          card.appendChild(acts); sec.appendChild(card);
        });
        w.appendChild(sec);
      });
      w.appendChild(h('p.safety', null, C.safetyTip));
      w.appendChild(footer());
      b.appendChild(w);
    }
    render();
  }
  function boxCard(l, it) {
    return { kicker: '第' + l.no + '節《' + l.game + '》' + l.tagline, title: it.title, en: it.en, fields: it.fields, footer: CM().siteTitle + '｜' + (it.footer || '') };
  }
  A.boxCard = boxCard;

  /* ---------- 教師控制台 ---------- */
  function pageTeacher(el) {
    var b = pageFrame(el, '教師控制台', 'Teacher Console');
    XC.teacher.console(b);
    b.appendChild(footer());
  }

  /* ---------- 未建置節次 ---------- */
  function pageStub(el, l, kind) {
    var m = CM().meta[l.id] || {}, b = pageFrame(el, '第' + l.no + '節《' + l.game + '》' + l.tagline);
    var stage = '之後的階段';
    var w = h('div.page-body');
    w.appendChild(h('section.card.stub', null,
      h('div.stub-img', { style: { backgroundImage: 'url("' + l.stationImg + '")' }, role: 'img', 'aria-label': l.stationAlt }),
      h('h2', null, l.title), h('p', null, h('span.tag.tag-value', null, l.value), ' ', h('span.tag', null, l.level), ' ', h('span.tag', null, '學習產出：' + l.output)),
      m.coreQuestion ? h('p.lead', null, '核心提問：' + m.coreQuestion) : null,
      m.storyline ? h('p', null, m.storyline) : null,
      h('ol', null, (m.focus || []).map(function (f) { return h('li', null, f); })),
      h('p.notice', null, kind === 'open' ? '本節沒有開封跟進頁；第6節的行動承諾開封跟進在 #/l6/open。' : '本節互動遊戲將於' + stage + '建置；現時先顯示本節概要。')));
    w.appendChild(footer());
    b.appendChild(w);
  }
  function pagePrintStub(el, l) {
    var b = pageFrame(el, '第' + l.no + '節《' + l.game + '》列印教材', 'Printable Materials');
    var w = h('div.page-body.pr-body');
    b.appendChild(w);
    A.titleFor('第' + l.no + '節列印教材');
    if (!l.ready) return;
    A.loadContent(l.id).then(function () { return Promise.all([loadScript('js/content/print.js'), loadScript('js/lessons/print.js')]); })
      .then(function () { XC.print.render(w, l.id); })
      .catch(function (e) { w.appendChild(h('p.notice', null, String(e && e.message || e))); });
  }

  /* ---------- 終章 ---------- */
  function pageFinale(el, c) {
    A.titleFor('終章');
    var C = CM(), en = St.settings.englishSubs, L6 = 'assets/img/l6/';
    function sub(zh, e) { return h('div.fin-sub', null, h('p.fs-zh', null, zh), en && e ? h('p.fs-en.en', { lang: 'en' }, e) : null); }
    function bg(cls, img, kids) { return h('div.fin-scene.' + cls, { style: { backgroundImage: 'url("' + img + '")' } }, kids || null); }
    /* 白鶴飛越青綠山水至城市（短片 100–103 秒） */
    var sA = bg('fin-kb', L6 + 'l6-jade-landscape.webp');
    var sB = bg('fin-kb', L6 + 'l6-jade-city.webp');
    /* 夜山燈火（104–107 秒） */
    var sC = bg('fin-kb', L6 + 'l6-night-lamps.webp', sub('立志、良知、知行合一、事上磨煉……', 'Aspiration, innate knowing, unity of knowledge and action, tempering through deeds…'));
    /* 學生捧燈（108–109 秒） */
    var sD = bg('fin-kb', L6 + 'l6-student-lamp.webp', sub('這盞燈，如今傳到你手中。', 'This lamp is now in your hands.'));
    /* 燈河（110–112 秒） */
    var sE = bg('fin-river', 'assets/img/hub/hub-river.webp');
    var lamps = h('div.fin-lamps', { 'aria-hidden': 'true' });
    for (var i = 0; i < 26; i++) { var d = h('i'); d.style.left = (8 + i * 3.3 + Math.sin(i) * 2) + '%'; d.style.top = (84 - i * 2.6 + Math.cos(i * 1.3) * 3) + '%'; d.style.animationDelay = (i * 0.12) + 's'; lamps.appendChild(d); }
    sE.appendChild(lamps); sE.appendChild(sub('你的志向是什麼？你將如何踐行？', 'What is your aspiration? How will you live it out?'));
    /* 標題＋金光橫線＋微塵（113–115 秒） */
    var sF = h('div.fin-scene.fin-title', null, h('h1.site-title', null, h('span.st-line', { 'aria-hidden': 'true' }), h('span.st-txt', null, C.siteTitle)), h('p.site-en.en', { lang: 'en' }, C.siteTitleEn), h('p.site-sub', null, C.siteSub));
    var dcv = h('canvas.fin-dust', { 'aria-hidden': 'true' }); sF.appendChild(dcv);
    /* 墨暈收束至一盞燈（116 秒）→ 此心光明 */
    var sG = h('div.fin-scene.fin-lamp', { style: { backgroundImage: 'url("assets/img/hub/hub-lamp-end.webp")' } },
      h('div.fin-quote', null, h('p.q-zh', null, '「此心光明，亦復何言。」'), h('p.q-en.en', { lang: 'en' }, '“My heart is full of light. What more is there to say?”')),
      h('div.fin-acts', null, ui.btn('回到山河圖', { primary: true, icon: 'home', onClick: A.closeLayer }), ui.btn('打開我的回顧盒', { icon: 'box', onClick: function () { XC.router.go('box'); } })));
    var scenes = [sA, sB, sC, sD, sE, sF, sG];
    scenes.forEach(function (s) { el.appendChild(s); });
    var skip = ui.btn('略過', { cls: 'fin-skip sm', icon: 'next', onClick: function () { show(scenes.length - 1); } });
    el.appendChild(skip);
    var fd = new XC.fx.Dust(dcv, { count: 50 }), tm = [];
    function show(i) {
      scenes.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      if (scenes[i] === sF) { fd.start(); XC.audio.play('chime'); } else fd.stop();
      if (scenes[i] === sE || scenes[i] === sD) XC.audio.play('lamp');
      if (i === scenes.length - 1) { XC.audio.play('lamp'); tm.forEach(clearTimeout); skip.hidden = true; var b0 = sG.querySelector('.fin-acts button'); if (b0) setTimeout(function () { try { b0.focus({ preventScroll: true }); } catch (e) {} }, 400); }
      var s0 = scenes[i].querySelector('.fs-zh'); if (s0) ui.announce(s0.textContent);
    }
    var r = XC.fx.reduced(), dur = r ? [2200, 1600, 2600, 2600, 2600, 2600] : [3600, 3200, 4800, 4400, 5200, 5200], t = 0;
    show(0); XC.audio.play('lamp');
    dur.forEach(function (d, k) { t += d; tm.push(setTimeout(function () { show(k + 1); }, t)); });
    XC.storage.set('finaleShown', true);
    c.cleanup = function () { tm.forEach(clearTimeout); fd.stop(); };
  }
  function checkFinale() {
    var p = St.progress();
    var all = CM().lessons.every(function (l) { return p[l.id] === 'done'; });
    if (all && !XC.storage.get('finaleShown', false)) setTimeout(function () { A.nav('finale'); }, 600);
  }

  /* ---------- 目標達成動畫 ---------- */
  A.goalFx = function (id) {
    var l = lessonMeta(id) || CM().lessons[0];
    var ov = h('div.goal-fx', { role: 'dialog', 'aria-modal': 'true', 'aria-label': l.goalDone },
      h('div.gf-bg', { style: { backgroundImage: 'url("' + l.goalImg + '")' } }));
    var dots = h('div.gf-dots', { 'aria-hidden': 'true' });
    var spots = [[14, 70], [22, 62], [30, 74], [37, 58], [44, 66], [50, 52], [57, 63], [63, 48], [70, 57], [76, 44], [82, 52], [88, 40], [18, 80], [41, 78], [60, 76], [79, 70], [92, 60], [8, 60], [26, 48], [54, 40], [68, 36], [86, 30]];
    spots.forEach(function (s, i) { var d = h('i'); d.style.left = s[0] + '%'; d.style.top = s[1] + '%'; d.style.animationDelay = (0.3 + i * 0.14) + 's'; dots.appendChild(d); });
    ov.appendChild(dots);
    ov.appendChild(h('div.gf-title', null, h('h2.site-title', null, h('span.st-line', { 'aria-hidden': 'true' }), h('span.st-txt', null, l.goalDone)), h('p', null, '第' + l.no + '節《' + l.game + '》｜全班合力完成「' + l.goalName + '」')));
    var close = ui.btn('繼續', { primary: true, icon: 'next', cls: 'gf-close', onClick: function () { ov.classList.remove('in'); setTimeout(function () { ov.remove(); }, 700); } });
    ov.appendChild(close);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('in'); close.focus(); });
    XC.audio.play('lamp'); setTimeout(function () { XC.audio.play('chime'); }, 900);
    ui.announce(l.goalDone + '：全班合力完成' + l.goalName);
    ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') close.click(); });
  };

  /* ---------- 示範資料 ---------- */
  A.demo = function (on) {
    if (!on) {
      if (!XC.storage.get('demo', false)) { ui.toast('目前沒有示範資料'); return; }
      XC.storage.remove('lesson_l1'); St.removeBoxItem('l1', 'demo'); XC.storage.remove('demo');
      ui.toast('已清除示範資料'); setTimeout(function () { location.reload(); }, 500); return;
    }
    var ls = St.lesson('l1'), sc = [6, 8, 5, 7, 6, 9, 4, 7];
    St.groups().forEach(function (g, i) { ls.groups[g.id] = { score: sc[i % sc.length], props: { redo: i % 3 === 0, ask: i % 4 === 1 }, badges: i % 3 === 1 ? ['buqu'] : [] }; });
    ls.data = ls.data || {}; ls.data.wall = ['測驗溫習了很久仍然不合格，好想放棄。', '練樂器練了很久，好像沒有進步。'];
    St.saveLesson('l1');
    St.saveBoxItem('l1', 'demo', { type: 'zhi', title: '志向卡（示範）', en: 'My Aspiration Card', fields: [
      { label: '我的志向', value: '我想成為能在社區幫到有需要的人的人，因為我想身邊的人過得安心。我會先學好急救。' },
      { label: '我的長夜', value: '溫習和練習的時間不夠，有時會覺得自己做不到。' },
      { label: '我的燈油', value: '懂得反思調整：我會停下來檢討，換方法再試。' },
      { label: '見證人簽名', value: 'K.Y.' }], footer: '示範資料（虛構）' });
    St.setProgress('l1', 'active');
    XC.storage.set('demo', true);
    ui.toast('已載入示範資料（8 組虛構分數與一張示範志向卡）');
  };

  /* ---------- 全站鍵盤（主頁） ---------- */
  document.addEventListener('keydown', function (e) {
    if (cur && cur.kind === 'lesson') return;
    var t = e.target, tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.querySelector('.modal-back')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'f' || e.key === 'F') ui.fullscreen();
    else if (e.key === 'm' || e.key === 'M') XC.audio.toggle();
  });

  /* ---------- 啟動 ---------- */
  A.boot = function () {
    St.loadSettings();
    A.applySettings();
    if (mqReduce && mqReduce.addEventListener) mqReduce.addEventListener('change', A.applySettings);
    XC.audio.initBgm && XC.audio.initBgm();
    buildHub();
    XC.bus.on('sound', syncSound); XC.bus.on('bgm', syncSound);
    XC.bus.on('progress', function () { if (!cur) drawPath(); });
    if (!XC.storage.available) {
      var w = h('div.storage-warn', { role: 'alert' }, CM().storageWarn, ui.btn('', { icon: 'close', cls: 'sm', title: '關閉', onClick: function () { w.remove(); } }));
      document.body.appendChild(w);
    }
    window.addEventListener('beforeprint', function () { document.body.classList.add('print-any'); });
    window.addEventListener('afterprint', function () { document.body.classList.remove('print-any'); });
    XC.router.start();
    document.documentElement.classList.add('ready');
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', A.boot); else A.boot();
})();
