/* 第6節《同心圈》由我到天下 ── 遊戲邏輯（文字全部取自 js/content/l6.js）；另提供開封跟進頁 L.openPage（#/l6/open） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state, K = XC.kit;
  var C = function () { return XC.content.l6; };
  var L = XC.lessons.l6 = {};
  var V = {};
  var IMG = 'assets/img/l6/';
  var uid = 0;
  var DAY = 86400000;

  /* ---------- 七圈圖示（24×24 線條） ---------- */
  var ICO = {
    lamp: '<path d="M12 3c2.2 3 3.2 4.6 3.2 6.6a3.2 3.2 0 0 1-6.4 0C8.8 7.6 9.8 6 12 3z"/><path d="M8 14.5h8l-1.2 5.5H9.2z"/>',
    eaves: '<path d="M2 11.5L12 4l10 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    desk: '<path d="M3 10h18"/><path d="M5 10v10M19 10v10M5 15h14"/><path d="M9 5.5h6V10H9z"/>',
    city: '<path d="M2 20.5h20"/><path d="M3.5 20.5v-7h3v7M7.5 20.5V9h3v11.5M11.5 20.5V4.5l3 2.5v13.5M15.5 20.5v-9h3v9"/><path d="M19 20.5v-5h2v5"/>',
    wall: '<path d="M2 15l5-7 4 4 4-6 7 9"/><path d="M3 20.5h18v-3.5h-2v-1.5h-2V17h-2v-1.5h-2V17h-2v-1.5H9V17H7v-1.5H5V17H3z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/>',
    crane: '<path d="M3 13.5c4-.8 6.4-3.6 8.2-7.6 1 3 3.2 5 7 5l2.8-1.8-.9 2.9c-3 3-7 4-11 3.1"/><path d="M11.2 5.9L10 3.8"/><path d="M2 20c4-3 8-3 12 0 2-1.5 5-2 8-1"/>'
  };
  function ico(name, cls) { return '<svg viewBox="0 0 24 24" class="c-ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + (ICO[name] || ICO.lamp) + '</svg>'; }

  /* ---------- 共用 ---------- */
  function hintRow(R, key) { return R.isClass() ? null : K.hintRow(R, key); }
  function circ(id) { return C().circles.filter(function (c) { return c.id === id; })[0]; }
  function isOuter(id) { return C().outer.indexOf(id) >= 0; }
  function ringNames(ids) { return (ids || []).map(function (id) { var c = circ(id); return c ? c.name : ''; }).filter(Boolean).join('、'); }
  function envState() { return (St.box().l6 || {}).promise || null; }
  function srcCard(compact) {
    var s = C().source;
    return h('div.src-card' + (compact ? '.compact' : ''), { role: 'note' },
      h('span.src-ico', { html: ui.icon('eye') }),
      h('div', null, h('b', null, s.title), h('p', null, s.text), !compact && St.settings.englishSubs ? h('p.en.it', { lang: 'en' }, s.textEn) : null));
  }
  function fmtDate(t) { var d = new Date(t); return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
  function isoDate(t) { var d = new Date(t); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dayStart(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function envelopeEl(name, state) {
    return h('div.envelope' + (state ? '.' + state : ''), { role: 'img', 'aria-label': state === 'sealed' ? '已封存的承諾信封' : '承諾信封' },
      h('div.env-back'), h('div.env-letter', null, h('i'), h('i'), h('i')), h('div.env-front'), h('div.env-flap'),
      h('div.env-seal', { html: ui.icon('seal') }), h('div.env-name', null, name || ''));
  }

  /* ---------- 團結值：合作方式最多 3＋化解隔閡最多 2 ---------- */
  function us(R, gid) { var all = R.data('us') || {}; return all[gid || R.cur()] || {}; }
  function cnt(R, gid, k) { var g = us(R, gid), n = 0; for (var i = 1; i <= 3; i++) if (g[k + i]) n++; return n; }
  function uAward(R, gid, k, label) {
    var r = C().resource, cap = k === 'c' ? r.capC : r.capB, g = us(R, gid);
    for (var i = 1; i <= cap; i++) if (!g[k + i]) return K.award(R, 'us', k + i, 1, label, gid);
    ui.toast(r.capMsg, 3200); return 0;
  }

  /* ---------- 小旗與同心圈 ---------- */
  function pl(R) { var S = K.st(R, 'pl'); S.me.v = S.me.v || {}; return S; }
  function myRings(R) { var v = pl(R).me.v; if (v.rings && v.rings.length) return v.rings; var env = envState(); return (env && env.rings) || []; }
  function flagsOf(R) {
    if (R.isClass()) return R.data('flags') || {};
    var m = {}; myRings(R).forEach(function (id) { m[id] = 1; }); return m;
  }
  function pool(R) {
    var f = flagsOf(R), n = 0; Object.keys(f).forEach(function (k) { n += f[k] || 0; });
    if (R.isClass()) { var t = R.target(); return { p: n, t: t, f: Math.min(1, n / Math.max(1, t)) }; }
    var ok = myRings(R).some(isOuter); return { p: n, t: 1, f: ok ? 1 : 0, ok: ok };
  }

  /* 同心圈 SVG：viewBox 400×400；七圈由內至外 */
  var B = [34, 58, 82, 106, 130, 154, 178];
  function mid(i) { return i === 0 ? 0 : (B[i - 1] + B[i]) / 2; }
  function pt(a, r) { return [(200 + r * Math.sin(a)).toFixed(1), (200 - r * Math.cos(a)).toFixed(1)]; }
  function arc(r, a1, a2) { var p1 = pt(a1, r), p2 = pt(a2, r); return 'M' + p1[0] + ' ' + p1[1] + ' A' + r + ' ' + r + ' 0 ' + (a2 - a1 > Math.PI ? 1 : 0) + ' 1 ' + p2[0] + ' ' + p2[1]; }
  function ringsSVG(o) {
    o = o || {}; var cs = C().circles, sel = o.sel || [], id = ++uid;
    var s = '<svg viewBox="0 0 400 400" class="rings-svg' + (o.cls ? ' ' + o.cls : '') + '" aria-hidden="true"><defs>' +
      '<filter id="rgf' + id + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<filter id="fog' + id + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter></defs>';
    for (var i = cs.length - 1; i >= 1; i--) {
      var on = sel.indexOf(cs[i].id) >= 0, lit = o.lit && o.lit > i;
      s += '<circle class="rg-band b' + i + (on ? ' on' : '') + (lit ? ' lit' : '') + '" data-ring="' + cs[i].id + '" cx="200" cy="200" r="' + mid(i) + '" style="--d:' + (i * 0.35) + 's"/>';
      s += '<circle class="rg-line' + (lit ? ' lit' : '') + '" cx="200" cy="200" r="' + B[i] + '" style="--d:' + (i * 0.35) + 's"/>';
      if (lit) s += '<circle class="rg-glow" cx="200" cy="200" r="' + B[i] + '" filter="url(#rgf' + id + ')" style="--d:' + (i * 0.35) + 's"/>';
    }
    var on0 = sel.indexOf('me') >= 0 || o.meOn;
    s += '<circle class="rg-core' + (on0 ? ' on' : '') + (o.lit ? ' lit' : '') + '" data-ring="me" cx="200" cy="200" r="' + B[0] + '"/>';
    s += '<g class="rg-ico" transform="translate(188 172) scale(1)">' + ICO.lamp + '</g>';
    s += '<text class="rg-lab core" x="200" y="214">' + cs[0].name + '</text>';
    for (var j = 1; j < cs.length; j++) {
      var m = mid(j), q = pt(-0.5, m);
      s += '<text class="rg-lab' + (sel.indexOf(cs[j].id) >= 0 ? ' on' : '') + '" x="200" y="' + (200 - m + 4.5).toFixed(1) + '">' + cs[j].name + '</text>';
      s += '<g class="rg-ico" transform="translate(' + (q[0] - 7) + ' ' + (q[1] - 7) + ') scale(.58)">' + ICO[cs[j].icon] + '</g>';
    }
    /* 墨霧牆（隔閡）：在兩圈之間的界線上 */
    (o.fogs || []).forEach(function (f, k) {
      var r = B[Math.max(0, Math.min(5, f.at))], a1 = 0.75 + k * 1.35, a2 = a1 + 1.05;
      s += '<g class="rg-fog' + (f.clear ? ' clear' : '') + '"><path d="' + arc(r, a1, a2) + '" filter="url(#fog' + id + ')"/>' +
        '<path class="fog-core" d="' + arc(r, a1 + 0.06, a2 - 0.06) + '"/>';
      var tp = pt((a1 + a2) / 2, r);
      s += '<text class="fog-lab" x="' + tp[0] + '" y="' + (+tp[1] + 4) + '">' + ui.esc(f.name) + '</text></g>';
      if (f.clear) { var b1 = pt((a1 + a2) / 2 - 0.08, r - 13), b2 = pt((a1 + a2) / 2 + 0.08, r + 13); s += '<path class="rg-plank" d="M' + b1[0] + ' ' + b1[1] + ' L' + b2[0] + ' ' + b2[1] + '"/>'; }
    });
    /* 小旗：只顯示圈層和圖示，不顯示內容 */
    if (o.flags) {
      cs.forEach(function (c, i) {
        var n = o.flags[c.id] || 0; if (!n) return;
        var r = i === 0 ? 20 : mid(i), cap = i === 0 ? 4 : Math.max(5, Math.floor(2 * Math.PI * r / 26)), show = Math.min(n, cap);
        for (var f = 0; f < show; f++) {
          var a = (i === 0 ? 0.8 : 0.62) + f * ((2 * Math.PI - 1.25) / cap), p = pt(a, r);
          s += '<g class="rg-flag" style="--d:' + (0.2 + i * 0.12 + f * 0.03).toFixed(2) + 's" transform="translate(' + p[0] + ' ' + p[1] + ')"><path d="M0 7V-8"/><path class="ff" d="M0 -8l9 3.2L0 -1.6z"/></g>';
        }
        if (n > show) { var pp = pt(0.42, r); s += '<text class="rg-more" x="' + pp[0] + '" y="' + (+pp[1] + 4) + '">×' + n + '</text>'; }
      });
    }
    return s + '</svg>';
  }

  /* ---------- 引擎掛鈎 ---------- */
  L.setup = function (R) { R.layer.classList.add('l6'); };
  L.stripItem = function (R, gid, el) {
    var s = R.score(gid);
    el.innerHTML = '<span class="g-ring' + (s > 0 ? ' on' : '') + '">' + ui.icon('ripple') + '</span><span class="g-info"><span class="g-name">' + ui.esc(R.gname(gid)) + '</span>' +
      '<span class="g-sub">團結值 ' + s + '</span></span>';
    el.setAttribute('aria-label', R.gname(gid) + '：團結值 ' + s);
  };
  L.totalView = function (R, el) {
    var P = pool(R);
    if (R.isClass()) {
      el.innerHTML = '<span class="tv-l">同心圈</span><span class="tv-gold" aria-hidden="true"><i style="width:' + (P.f * 100).toFixed(0) + '%"></i></span><b class="tv-n">' + P.p + '／' + P.t + ' 面小旗</b>';
      el.setAttribute('aria-label', '全班同心圈：' + P.p + ' 面小旗，目標 ' + P.t);
    } else {
      el.innerHTML = '<span class="tv-l">我的同心圈</span><b class="tv-n">' + (P.ok ? '已連結外圈' : '小旗 ' + P.p + ' 面') + '</b>';
      el.setAttribute('aria-label', '我的同心圈：' + (P.ok ? '已連結外圈' : '小旗 ' + P.p + ' 面'));
    }
  };
  L.beforeAdd = function (R, gid, delta, label, extra) {
    if (extra && extra.st) { if (delta > 0 && R.score(gid) >= 5) { ui.toast(C().resource.capMsg, 3200); return null; } return { delta: delta, label: label, extra: extra }; }
    if (delta > 0 && R.score(gid) >= 5) { ui.toast(C().resource.capMsg, 3200); return null; }
    return { delta: delta, label: label, extra: extra };
  };
  L.onScore = function (R, gid, d) {
    var t = document.querySelector('.ls-groups .grp[data-gid="' + gid + '"] .g-ring');
    if (d > 0 && t) XC.fx.bloom(t); else if (d < 0 && t) XC.fx.dim(t);
    var m = R.stage && R.stage.querySelector('.us-meter'); if (m && gid === R.cur()) m.replaceWith(usMeter(R, gid));
    var ph = R.phase().id;
    if (ph === 'sum' || ph === 'report' || (ph === 'task' && R.isClass())) R.rerender();
  };
  L.onUndo = K.onUndo;
  L.onSelect = function (R) { var ph = R.phase(); if (ph.layout === 'task' || ph.id === 'badges' || ph.id === 'sum' || ph.id === 'flags') R.rerender(); };
  L.leave = function (R) { K.leave(R); };
  L.onLine = function (R, line) {
    if (line.fx === 'ripple') { XC.audio.play('drop'); R.stageWrap.classList.remove('flare'); void R.stageWrap.offsetWidth; R.stageWrap.classList.add('flare'); }
  };
  L.render = function (R, sc, ph, stage) {
    var fn = V[sc.id + '.' + ph.id];
    if (fn) fn(R, sc, ph, stage);
    else if (ph.id === 'discuss') { var w = K.discuss(R, sc, stage); if (sc.id === 's1') w.appendChild(h('div.task-acts', null, K.challengeBtn(R))); }
  };
  L.teacherTools = function (R, sc, ph, el) {
    var c = C();
    if (sc.id === 's0' && ph.id === 'ladder') el.appendChild(h('div.t-row', null, K.sbtn('展示全部四張卡', function () { R.data('lv', 4); R.rerender(); }, { icon: 'cards', cls: 'sm' }), K.sbtn('清除不忍度人數', function () { R.data('lad', {}); R.rerender(); }, { icon: 'reset', cls: 'sm' })));
    if (sc.id === 's1') el.appendChild(h('div.t-row', null, K.sbtn('顯示正確排序', function () { var m = { c: {}, r: {} }; c.puzzle.forEach(function (p, i) { m.c[i + 1] = p.id; m.r[i + 1] = p.id; }); R.data('pz', m); XC.audio.play('lamp'); R.rerender(); }, { icon: 'ripple', cls: 'sm' }), K.sbtn('重設拼圖', function () { R.data('pz', { c: {}, r: {} }); R.rerender(); }, { icon: 'reset', cls: 'sm' })));
    if (sc.id === 's2') {
      el.appendChild(h('div.t-row', null, K.sbtn(c.ui.draw, function () { drawAll(R); }, { icon: 'dice', cls: 'sm' })));
      el.appendChild(h('p.fine', null, c.sheet.score + '每組團結值最多 5 分；超出時不再加分。'));
    }
    if (sc.id === 's4' && ph.id === 'flags') el.appendChild(h('div.t-row', null, K.sbtn('觸發「' + c.resource.goalDone + '」動畫', function () { lightUp(R, true); }, { icon: 'ripple', cls: 'sm' })));
    if (sc.id === 's4') el.appendChild(h('div.t-row', null, K.sbtn(c.ui.finale, function () { XC.router.go('finale'); }, { icon: 'film', cls: 'sm' })));
    el.appendChild(h('p.fine', null, c.rolesNote));
  };

  /* ================= 環節一：一體階梯 ================= */
  V['s0.open'] = function (R, sc, ph, stage) {
    K.home(R, stage);
    stage.appendChild(h('p.fine.center.l6-pre', null, C().pre));
  };
  V['s0.recall'] = function (R, sc, ph, stage) {
    var c = C();
    stage.appendChild(h('div.scene-quote.small.l6-recall', null, h('span.sq-tag', null, c.recall.src), h('p', null, '「' + c.recall.text + '」'),
      h('p.fine', null, '第2節：良知是人人本有的「不忍之心」。今天，看看這份不忍可以推到多遠。')));
  };
  function ladderCounts(R, id) { var m = R.data('lad') || {}; return m[id] || {}; }
  V['s0.ladder'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), shown = self ? 4 : Math.max(1, R.data('lv') || 1);
    var S = self ? K.st(R, 'lad') : null;
    var w = h('div.ladder-v');
    w.appendChild(h('div.task-head', null, h('h2', null, '一體階梯'), h('p.who', null, c.ladderAsk), hintRow(R, 'ladder')));
    var row = h('div.ladder', { role: 'list' });
    c.ladder.forEach(function (st, i) {
      var open = i < shown;
      var card = h('div.lad-card' + (open ? '.open' : ''), { role: 'listitem', 'data-lad': st.id, style: { '--i': i } });
      if (!open) { card.appendChild(h('div.lad-back', null, h('b', null, '第' + '一二三四'[i] + '級'), h('span', null, '?'))); row.appendChild(card); return; }
      var art = h('div.lad-art', null, h('img', { src: st.img, alt: st.alt, loading: 'lazy' }));
      var cnts = ladderCounts(R, st.id), dots = h('div.lad-dots', { 'aria-hidden': 'true' });
      if (!self) c.levels.forEach(function (lv) { var n = cnts[lv.n] || 0; if (n) dots.appendChild(K.dots(Math.min(40, n), 'lv' + lv.n)); });
      else if (S.me[st.id]) dots.appendChild(K.dots(1, 'lv' + S.me[st.id]));
      art.appendChild(dots);
      card.appendChild(h('span.lad-no', null, '第' + '一二三四'[i] + '級'));
      card.appendChild(art);
      card.appendChild(h('b.lad-name', null, st.name));
      var ctl = h('div.lad-ctl');
      c.levels.forEach(function (lv) {
        if (self) {
          var on = S.me[st.id] === lv.n;
          ctl.appendChild(h('button.lv-pick.lv' + lv.n + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), 'aria-label': st.name + '：不忍度 ' + lv.n, on: { click: function () { S.me[st.id] = lv.n; S.save(); XC.audio.play('drop'); R.rerender(); } } }, lv.name));
        } else {
          ctl.appendChild(h('span.lv-cnt', null, h('i.lv-tag.lv' + lv.n, null, lv.name), K.stepper(cnts[lv.n] || 0, function (n) { var m = R.data('lad') || {}; m[st.id] = m[st.id] || {}; m[st.id][lv.n] = n; R.data('lad', m); var d = R.stage.querySelector('.lad-card[data-lad="' + st.id + '"] .lad-dots'); if (d) { d.innerHTML = ''; c.levels.forEach(function (l2) { var k = m[st.id][l2.n] || 0; if (k) d.appendChild(K.dots(Math.min(40, k), 'lv' + l2.n)); }); } }, st.name + '不忍度' + lv.n + '人數', 60)));
        }
      });
      card.appendChild(ctl);
      if (self) {
        var far = S.me.far === st.id;
        card.appendChild(h('button.lad-far' + (far ? '.on' : ''), { type: 'button', 'aria-pressed': String(far), on: { click: function () { S.me.far = far ? null : st.id; S.save(); R.rerender(); } } }, far ? '我在這一步開始覺得「與我無關」' : '在這一步開始覺得「與我無關」？'));
      }
      row.appendChild(card);
    });
    w.appendChild(row);
    var acts = h('div.task-acts');
    if (!self && shown < 4) acts.appendChild(K.sbtn('展示下一張', function () { R.data('lv', shown + 1); XC.audio.play('flip'); R.rerender(); }, { icon: 'next', primary: true }));
    acts.appendChild(h('span.fine', null, c.levelsNote));
    w.appendChild(acts);
    w.appendChild(h('p.fine.center', null, c.ladderNote));
    stage.appendChild(w);
  };
  V['s0.explain'] = function (R, sc, ph, stage) {
    var c = C(), e = c.explain;
    var w = h('div.l6-exp');
    var p = K.panel('exp-p', true);
    p.appendChild(h('p.big', null, e.text));
    p.appendChild(h('p.fine', null, e.note));
    w.appendChild(p);
    w.appendChild(h('p.exp-gap-t', null, e.gapIntro));
    w.appendChild(h('div.gap-row', { role: 'list', 'aria-label': '隔閡卡' }, c.gaps.map(function (g, i) { return h('div.gap-card', { role: 'listitem', style: { animationDelay: (0.2 + i * 0.15) + 's' } }, h('span.gc-fog', { 'aria-hidden': 'true' }), h('b', null, g.name)); })));
    w.appendChild(h('div.scene-quote.small.l6-ann', null, h('span.sq-tag', null, c.team), h('p', null, '「' + e.announce + '」')));
    w.appendChild(h('p.fine.center', null, c.rolesNote));
    stage.appendChild(w);
  };

  /* ================= 環節二：脈絡拼圖 ================= */
  V['s1.source'] = function (R, sc, ph, stage) {
    var c = C(), w = h('div.src-v');
    w.appendChild(h('h2.center', null, c.source.title, h('small.en', { lang: 'en' }, ' ' + c.source.en)));
    w.appendChild(srcCard());
    w.appendChild(h('div.src-kinds', null, c.source.kinds.map(function (k) { return h('span.chip.static', null, k); })));
    w.appendChild(h('p.fine.center', null, c.source.note));
    w.appendChild(h('div.task-acts', null, K.sbtn('開始脈絡拼圖', function () { R.toPhase('puzzle'); }, { icon: 'next', primary: true })));
    stage.appendChild(w);
  };
  var PZ_TRAY = ['C', 'A', 'D', 'B'], PZ_RANGE = ['D', 'B', 'A', 'C'];
  function pzState(R) { var m = R.data('pz') || {}; m.c = m.c || {}; m.r = m.r || {}; return m; }
  function pzById(id) { return C().puzzle.filter(function (p) { return p.id === id; })[0]; }
  function pzRight(m) { var n = 0; C().puzzle.forEach(function (p, i) { if (m.c[i + 1] === p.id && m.r[i + 1] === p.id) n++; }); return n; }
  function rippleSVG(n, m) {
    var P = C().puzzle, s = '<svg viewBox="0 0 400 400" class="ripple-svg" aria-hidden="true"><defs><filter id="rpg' + (++uid) + '"><feGaussianBlur stdDeviation="4"/></filter></defs>';
    s += '<circle class="rp-water" cx="200" cy="200" r="196"/>';
    for (var i = 0; i < 4; i++) {
      var r = 52 + i * 38, ok = m.c[i + 1] === P[i].id && m.r[i + 1] === P[i].id;
      s += '<circle class="rp-ring' + (ok ? ' on' : '') + '" cx="200" cy="200" r="' + r + '" style="--d:' + (i * 0.2) + 's"/>';
      if (ok) s += '<circle class="rp-glow" cx="200" cy="200" r="' + r + '" filter="url(#rpg' + uid + ')"/>' + '<text class="rp-lab" x="200" y="' + (200 - r - 5) + '">' + ui.esc(P[i].range) + '</text>';
    }
    s += '<circle class="rp-core" cx="200" cy="200" r="26"/><g transform="translate(188 186)" class="rp-ico">' + ICO.lamp + '</g>';
    s += '<text class="rp-n" x="200" y="388">漣漪 ' + n + '／4</text></svg>';
    return s;
  }
  V['s1.puzzle'] = function (R, sc, ph, stage) {
    var c = C(), m = pzState(R), n = pzRight(m), sup = R.support;
    var w = h('div.pz-v');
    w.appendChild(h('div.task-head', null, h('h2', null, '脈絡拼圖'), h('p.who', null, c.puzzleRule), hintRow(R, 'puzzle')));
    var body = h('div.cs-body.pz-body');
    body.appendChild(h('div.pz-ripple', { role: 'img', 'aria-label': '漣漪：排對 ' + n + '／4 張', html: rippleSVG(n, m) }));
    var right = h('div.pz-right');
    var slots = h('ol.pz-slots', { 'aria-label': '時間排序（由早到今）' });
    var usedC = {}, usedR = {};
    for (var i = 1; i <= 4; i++) {
      var pc = pzById(m.c[i]), pr = pzById(m.r[i]); if (pc) usedC[pc.id] = 1; if (pr) usedR[pr.id] = 1;
      var ok = pc && pr && pc.id === c.puzzle[i - 1].id && pr.id === c.puzzle[i - 1].id;
      slots.appendChild(h('li.pz-slot' + (ok ? '.ok' : ''), null,
        h('span.pz-no', null, i === 1 ? '最早' : i === 4 ? '今日' : String(i)),
        h('div.pz-drop.pz-c', { 'data-drop': 'c' + i, 'aria-label': '第' + i + '格概念卡' + (pc ? '：' + pc.who : '（空）') }, pc ? placed(R, 'c', i, h('span', null, h('b', null, pc.who), h('small', null, pc.era))) : h('span.pz-empty', null, '概念卡')),
        h('span.pz-arrow', { 'aria-hidden': 'true' }, '→'),
        h('div.pz-drop.pz-r', { 'data-drop': 'r' + i, 'aria-label': '第' + i + '格關心的範圍' + (pr ? '：' + pr.range : '（空）') }, pr ? placed(R, 'r', i, h('span', null, pr.range)) : h('span.pz-empty', null, '關心的範圍')),
        ok ? h('span.pz-ok', { html: ui.icon('check'), 'aria-label': '排對了' }) : null));
    }
    right.appendChild(slots);
    var tray = h('div.pz-tray', { role: 'group', 'aria-label': '概念卡' });
    PZ_TRAY.forEach(function (id) {
      if (usedC[id]) return; var p = pzById(id);
      tray.appendChild(h('button.pz-card.pz-tok' + (sup ? '.sup' : ''), { type: 'button', 'data-id': 'c:' + id },
        sup ? h('img', { src: p.img, alt: '', loading: 'lazy' }) : null,
        h('span.pc-t', null, h('b', null, p.who), h('small', null, p.era)), h('span.pc-i', null, p.idea),
        sup ? h('span.pc-k', null, p.key.map(function (k) { return h('i', null, k); })) : null));
    });
    var tray2 = h('div.pz-tray.rng', { role: 'group', 'aria-label': '範圍詞條' });
    PZ_RANGE.forEach(function (id) { if (usedR[id]) return; tray2.appendChild(h('button.pz-rg.pz-tok', { type: 'button', 'data-id': 'r:' + id }, pzById(id).range)); });
    if (tray.children.length) right.appendChild(tray);
    if (tray2.children.length) right.appendChild(tray2);
    if (n === 4) right.appendChild(h('p.notice', null, '四圈漣漪都擴開了：關心的範圍由眼前的人，一直推到各國人民與自然。'));
    right.appendChild(h('p.fine', null, '拖曳卡片或詞條到格子；也可先點卡片，再點格子。點已放好的卡可取回。' + (sup ? '' : '（按「支援」顯示圖像和關鍵詞）')));
    body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
    K.drag(w, { token: '.pz-tok', target: '.pz-drop', onDrop: function (tid, drop) {
      var kind = tid.charAt(0), id = tid.slice(2), slot = drop.slice(1), mm = pzState(R);
      if (kind !== drop.charAt(0)) { ui.toast(kind === 'c' ? '概念卡要放在左邊的「概念卡」格。' : '範圍詞條要放在右邊的「關心的範圍」格。'); return; }
      mm[kind][slot] = id; R.data('pz', mm);
      var before = n, after = pzRight(mm);
      XC.audio.play(after > before ? 'lamp' : 'drop');
      R.rerender();
      if (after > before) { var g = R.stage.querySelector('.pz-ripple'); if (g) XC.fx.bloom(g); ui.announce('排對了，漣漪多擴一圈：' + after + '／4'); }
      if (after === 4 && before < 4) setTimeout(function () { XC.audio.play('chime'); XC.fx.burst(R.stageWrap); }, 300);
    } });
  };
  function placed(R, kind, i, inner) {
    return h('button.pz-placed', { type: 'button', 'aria-label': '取回', on: { click: function (e) {
      if (R.stage.querySelector('.pz-v.picking')) return;
      e.stopPropagation(); var mm = pzState(R); delete mm[kind][i]; R.data('pz', mm); XC.audio.play('click'); R.rerender();
    } } }, inner);
  }
  V['s1.teach'] = function (R, sc, ph, stage) {
    var c = C(), d = c.distinguish;
    var w = h('div.teach-v');
    var left = h('div.teach-l');
    c.teach.forEach(function (t, i) { left.appendChild(h('div.teach-card.card-paper', { style: { animationDelay: (i * 0.15) + 's' } }, h('b', null, t.k), h('p', null, t.t))); });
    left.appendChild(h('p.fine', null, c.wordNote));
    var right = K.panel('dist-p');
    right.appendChild(h('h3', null, '辨析：「相通」不等於「來自」'));
    right.appendChild(h('div.dist-row', null,
      h('figure.dist-fig', null, h('div', { html: '<svg viewBox="0 0 220 120" aria-hidden="true"><circle class="d-a" cx="80" cy="60" r="46"/><circle class="d-b" cx="140" cy="60" r="46"/><text x="58" y="64">傳統</text><text x="162" y="64">今日</text><text class="d-m" x="110" y="64">相通</text></svg>' }),
        h('figcaption', null, h('b', null, d.tong.name), d.tong.desc)),
      h('figure.dist-fig.lai', null, h('div', { html: '<svg viewBox="0 0 220 120" aria-hidden="true"><defs><marker id="dar' + (++uid) + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z"/></marker></defs><text x="16" y="64">陽明</text><path class="d-arr" d="M62 60H150" marker-end="url(#dar' + uid + ')"/><text x="160" y="64">今日</text><text class="d-q" x="106" y="44">需要證據</text></svg>' }),
        h('figcaption', null, h('b', null, d.lai.name), d.lai.desc))));
    right.appendChild(h('p.big', null, d.text));
    w.appendChild(left); w.appendChild(right);
    stage.appendChild(w);
  };

  /* ================= 環節三：同心圈闖關 ================= */
  function caseArt(look) {
    var a = {
      elder: '<path d="M10 82h100"/><path d="M24 82V60h52v22"/><path d="M20 60h60"/><circle cx="50" cy="38" r="7"/><path d="M50 45c-6 4-8 10-8 15h16c0-5-2-11-8-15z"/><path d="M60 60l8-12"/><path d="M90 30v52M84 36h12"/>',
      beach: '<path d="M6 70c10-5 18 5 28 0s18 5 28 0 18 5 28 0 18 5 24 2"/><path d="M6 84c12-4 22 4 34 0s22 4 34 0 22 4 38 0"/><path d="M30 56l8-4 4 8-8 3z"/><path d="M60 58h10l-2 8h-6z"/><path d="M84 50c6-3 12 0 14 5-4 4-11 4-14-5z"/><path d="M92 52l-6 6M95 56l-3 7"/><circle cx="100" cy="22" r="8"/>',
      flood: '<path d="M14 60l18-14 18 14M20 56v14M44 56v14"/><path d="M66 54l16-12 16 12M72 50v20M92 50v20"/><path d="M4 74c10-5 20 5 30 0s20 5 30 0 20 5 30 0 16 4 20 2"/><path d="M4 86c12-4 22 4 34 0s22 4 34 0 22 4 42 0"/><path d="M20 28c4-8 14-8 18 0M46 22c4-8 14-8 18 0"/>'
    };
    return '<svg viewBox="0 0 120 96" class="case-art" aria-hidden="true">' + (a[look] || '') + '</svg>';
  }
  function caseById(id) { return C().cases.filter(function (x) { return x.id === id; })[0]; }
  function gapById(id) { return C().gaps.filter(function (x) { return x.id === id; })[0]; }
  function caseCard(cs, o) {
    o = o || {};
    return h('div.case-card.card-paper' + (o.cls ? '.' + o.cls : ''), { 'aria-label': '案例' + cs.id + '「' + cs.name + '」' },
      h('div.cc-art', { html: caseArt(cs.look) }), h('div.cc-t', null, h('b', null, '案例 ' + cs.id + '「' + cs.name + '」'), o.short ? null : h('p', null, cs.text), !o.short && cs.note ? h('small.fine', null, '（' + cs.note + '）') : null));
  }
  function drawOf(R, gid) { var all = R.data('dw') || {}; return all[gid || R.cur()] || null; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function drawAll(R) {
    var c = C(), all = {}, gs = St.groups(), cs = shuffle(c.cases.map(function (x) { return x.id; }));
    gs.forEach(function (g, i) { all[g.id] = { c: cs[i % 3], g: c.gaps[Math.floor(Math.random() * c.gaps.length)].id }; });
    R.data('dw', all); R._flip = true; XC.audio.play('flip'); R.rerender(); ui.announce('全班已抽卡：案例卡平均分配，隔閡卡隨機');
  }
  function drawOne(R, keepCase) {
    var c = C(), all = R.data('dw') || {}, cur = all[R.cur()] || {};
    var g2 = c.gaps.filter(function (x) { return x.id !== cur.g; });
    all[R.cur()] = { c: keepCase && cur.c ? cur.c : c.cases[Math.floor(Math.random() * 3)].id, g: g2[Math.floor(Math.random() * g2.length)].id };
    R.data('dw', all); R._flip = true; XC.audio.play('flip'); R.rerender();
  }
  V['s2.draw'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), flip = R._flip; R._flip = false;
    var w = h('div.draw-v' + (flip ? '.flipping' : ''));
    w.appendChild(h('div.task-head', null, h('h2', null, '抽卡'), h('p.who', null, c.drawRule + c.caseNote)));
    w.appendChild(h('div.case-row', null, c.cases.map(function (cs) { return caseCard(cs); })));
    if (self) {
      var d = drawOf(R);
      var box = h('div.draw-me');
      if (d) box.appendChild(h('div.draw-res', null, caseCard(caseById(d.c), { short: true, cls: 'flip' }), h('div.gap-card.flip', null, h('span.gc-fog', { 'aria-hidden': 'true' }), h('small', null, '隔閡卡'), h('b', null, gapById(d.g).name))));
      box.appendChild(h('div.task-acts', null, K.sbtn(d ? '重新抽卡' : '抽卡', function () { drawOne(R); }, { icon: 'dice', primary: !d }),
        d ? K.sbtn('開始任務單', function () { R.toPhase('task'); }, { icon: 'next', primary: true }) : null));
      if (!d) box.appendChild(h('div.draw-pick', null, h('p.fine', null, '也可以直接選一個案例：'), h('div.task-acts', null, c.cases.map(function (cs) { return K.sbtn('選案例 ' + cs.id, function () { var all = R.data('dw') || {}; all[R.cur()] = { c: cs.id, g: c.gaps[Math.floor(Math.random() * 4)].id }; R.data('dw', all); R._flip = true; XC.audio.play('flip'); R.rerender(); }, { cls: 'sm' }); }))));
      w.appendChild(box);
    } else {
      var all = R.data('dw');
      w.appendChild(h('div.task-acts', null, K.sbtn(c.ui.draw, function () { drawAll(R); }, { icon: 'dice', primary: !all })));
      if (all) {
        var grid = h('div.draw-grid');
        St.groups().forEach(function (g, gi) {
          var x = all[g.id]; if (!x) return;
          grid.appendChild(h('div.dg-cell' + (g.id === R.sel ? '.cur' : ''), { style: { animationDelay: (gi * 0.08) + 's' } }, h('b', null, g.name), h('span.dg-c', null, '案例 ' + x.c + '「' + caseById(x.c).name + '」'), h('span.dg-g', null, '隔閡：' + gapById(x.g).name)));
        });
        w.appendChild(grid);
      }
    }
    stage.appendChild(w);
    if (flip && !XC.fx.reduced()) XC.audio.play('flip');
  };
  function sheetS(R) { var S = K.st(R, 'sh'); S.me.rings = S.me.rings || []; S.me.coop = S.me.coop || {}; return S; }
  function coopOK(x) { return x && K.has(x.can, 4) && K.has(x['with'], 2); }
  function fogsOf(R, me, d) {
    var rs = C().circles.map(function (c) { return c.id; }), sel = me.rings.map(function (id) { return rs.indexOf(id); }).sort(function (a, b) { return a - b; });
    var at = sel.length >= 2 ? sel[0] : 0;
    var out = []; if (d) out.push({ at: at, name: gapById(d.g).name, clear: K.has(me.fix, 6) });
    if (me.g2) out.push({ at: Math.min(5, sel.length >= 2 ? sel[1] : at + 1), name: gapById(me.g2).name, clear: K.has(me.fix2, 6) });
    return out;
  }
  function myPlanks() {
    var out = [];
    try { var s3 = XC.storage.get('self_l3', null), pt = s3 && s3.data && s3.data.pt && s3.data.pt.me; if (pt) ['p1', 'p2', 'p3'].forEach(function (k) { var v = pt[k]; if (typeof v === 'string' && ui.len(v) >= 2) out.push(v); else if (v && v.t) out.push(v.t); }); } catch (e) {}
    return out;
  }
  function usMeter(R, gid) {
    gid = gid || R.cur();
    var a = cnt(R, gid, 'c'), b = cnt(R, gid, 'b');
    return h('span.us-meter', { 'aria-label': '團結值：合作 ' + a + '／3，化解隔閡 ' + b + '／2' }, '團結值 ', h('b', null, String(a + b)), h('small', null, '（合作 ' + a + '／3・化解 ' + b + '／2）'));
  }
  function syncSelf(R) {
    if (R.isClass()) return;
    var me = sheetS(R).me, n = me.rings.filter(function (id) { return coopOK(me.coop[id]); }).length;
    var have = cnt(R, 'me', 'c');
    for (var i = have; i < Math.min(3, n); i++) uAward(R, 'me', 'c', '具體合作方式（' + (i + 1) + '）');
    if (K.has(me.fix, 6) && cnt(R, 'me', 'b') < 1) uAward(R, 'me', 'b', '化解隔閡');
    if (me.g2 && K.has(me.fix2, 6) && cnt(R, 'me', 'b') < 2) uAward(R, 'me', 'b', '化解第二張隔閡');
  }
  V['s2.task'] = function (R, sc, ph, stage) {
    var c = C(), sh = c.sheet, self = !R.isClass(), d = drawOf(R);
    var S = sheetS(R), me = S.me;
    var w = h('div.task6-v');
    w.appendChild(h('div.step-head', null, K.head(R, sh.title, null, hintRow(R, 'task')), h('div.step-bar', null, d ? h('span.fine', null, '案例 ' + d.c + '「' + caseById(d.c).name + '」・隔閡卡「' + gapById(d.g).name + '」') : h('span.fine', null, '尚未抽卡'), usMeter(R), K.miniT(R, 'task', 300, '任務單倒數'))));
    if (!d) { w.appendChild(h('p.notice', null, '先在「抽卡」抽一張案例卡和一張隔閡卡。')); w.appendChild(h('div.task-acts', null, K.sbtn('抽卡', function () { self ? drawOne(R) : drawAll(R); }, { icon: 'dice', primary: true }))); stage.appendChild(w); return; }
    var body = h('div.cs-body.t6-body');
    var ringBox = h('div.t6-rings', { html: ringsSVG({ sel: me.rings, fogs: fogsOf(R, me, d) }) });
    ringBox.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-ring]'); if (t) toggle(t.getAttribute('data-ring')); });
    function toggle(id) { var i = me.rings.indexOf(id); if (i >= 0) me.rings.splice(i, 1); else me.rings.push(id); S.save(); XC.audio.play(i >= 0 ? 'click' : 'lamp'); syncSelf(R); R.rerender(); }
    var left = h('div.t6-left', null, h('p.t6-q', null, sh.q1), ringBox,
      h('div.ring-chips', { role: 'group', 'aria-label': '受影響的圈層' }, c.circles.map(function (ci) { var on = me.rings.indexOf(ci.id) >= 0; return h('button.ring-chip' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { toggle(ci.id); } } }, h('span', { html: ico(ci.icon) }), ci.name); })));
    body.appendChild(left);
    var right = K.panel('t6-panel');
    right.appendChild(caseCard(caseById(d.c), { cls: 'mini' }));
    right.appendChild(h('p.t6-q', null, sh.q2));
    var list = h('div.coop-list');
    var order = c.circles.filter(function (ci) { return me.rings.indexOf(ci.id) >= 0; });
    if (!order.length) list.appendChild(h('p.fine', null, '先在左邊點選受影響的圈層。'));
    order.forEach(function (ci) {
      var x = me.coop[ci.id] = me.coop[ci.id] || {};
      function inp(k, ph) { var el = h('input.inp', { type: 'text', maxlength: 60, value: x[k] || '', placeholder: ph, 'aria-label': ci.name + '：' + ph }); el.oninput = function () { x[k] = el.value; S.save(); row.classList.toggle('ok', coopOK(x)); syncSelf(R); }; return el; }
      var row = h('div.coop-row' + (coopOK(x) ? '.ok' : ''), null, h('span.cr-n', null, h('span', { html: ico(ci.icon) }), ci.name), inp('can', sh.can), inp('with', sh['with']));
      list.appendChild(row);
    });
    right.appendChild(list);
    right.appendChild(h('p.t6-q', null, sh.q3, h('small.fine', null, ' ' + sh.fog)));
    var planks = self ? myPlanks() : [];
    function fixField(key, gid2) {
      return ui.field({ label: '隔閡卡「' + gapById(gid2).name + '」', value: me[key] || '', rows: 2, max: 120, placeholder: sh.fixPH, chips: planks.length ? planks.map(function (p) { return '我的橋板：' + p; }) : (R.support ? ['我們可以先……', '把「與我無關」換成「我可以先……」'] : null), onInput: function (v) {
        var was = K.has(me[key], 6); me[key] = v; S.save(); syncSelf(R);
        if (was !== K.has(v, 6)) { var nb = h('div.t6-rings', { html: ringsSVG({ sel: me.rings, fogs: fogsOf(R, me, d) }) }); ringBox.innerHTML = nb.innerHTML; if (!was) XC.audio.play('lamp'); }
      } });
    }
    right.appendChild(fixField('fix', d.g));
    if (me.g2) right.appendChild(fixField('fix2', me.g2));
    else right.appendChild(h('div.task-acts', null, K.sbtn(sh.second, function () { var g2 = c.gaps.filter(function (x) { return x.id !== d.g; }); me.g2 = g2[Math.floor(Math.random() * g2.length)].id; S.save(); XC.audio.play('flip'); R.rerender(); }, { icon: 'dice', cls: 'sm' })));
    if (!self) right.appendChild(h('div.task-acts.class-aw', null, h('span.aw-who', null, '為 ' + R.gname() + '：'),
      K.sbtn('具體合作方式 +1', function () { uAward(R, R.sel, 'c', '具體合作方式'); }, { icon: 'plus', primary: cnt(R, R.sel, 'c') < 3, disabled: cnt(R, R.sel, 'c') >= 3 }),
      K.sbtn('化解隔閡 +1', function () { uAward(R, R.sel, 'b', '化解隔閡'); }, { icon: 'plus', primary: cnt(R, R.sel, 'b') < 2, disabled: cnt(R, R.sel, 'b') >= 2 })));
    right.appendChild(h('p.fine', null, sh.score + (self ? '（自學時，寫齊即自動計分）' : '')));
    body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
  };
  function sheetData(R, gid) {
    var all = R.data('sh') || {}, me = all[gid || R.cur()] || {}, d = drawOf(R, gid), c = C();
    var f = [];
    if (d) f.push({ label: '案例', value: '案例 ' + d.c + '「' + caseById(d.c).name + '」' });
    f.push({ label: '①受影響的圈層', value: ringNames(me.rings) });
    c.circles.forEach(function (ci) { var x = (me.coop || {})[ci.id]; if ((me.rings || []).indexOf(ci.id) >= 0 && x && (x.can || x['with'])) f.push({ label: '②' + ci.name, value: '我可以' + (x.can || '……').replace(/^我可以/, '') + '；一起做的人是' + (x['with'] || '……').replace(/^一起做的人是/, '') }); });
    if (d) f.push({ label: '③化解隔閡「' + gapById(d.g).name + '」', value: me.fix || '' });
    if (me.g2) f.push({ label: '③化解隔閡「' + gapById(me.g2).name + '」', value: me.fix2 || '' });
    return { kicker: '第6節《同心圈》由我到天下', title: c.sheet.title, en: c.sheet.en, lit: true, fields: f, footer: XC.content.common.siteTitle };
  }
  V['s2.report'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.rep6-v');
    w.appendChild(h('div.step-bar', null, h('h2', null, '匯報'), h('span.fine', null, c.reportRule), K.miniT(R, 'rep', 60, '匯報倒數')));
    if (self) {
      var d = sheetData(R);
      var card = h('div.out-card.card.sh-card', null, h('div.oc-head', null, h('span.oc-ico', { html: ui.icon('ripple') }), h('div', null, h('h2.oc-title', null, d.title), h('p.en.it', { lang: 'en' }, d.en))),
        h('div.sh-mini', { html: ringsSVG({ sel: sheetS(R).me.rings, fogs: fogsOf(R, sheetS(R).me, drawOf(R)) }) }),
        h('dl', null, d.fields.map(function (f) { return [h('dt', null, f.label), h('dd', null, f.value || '—')]; })));
      w.appendChild(card);
      w.appendChild(h('p.center', null, '自學時：把任務單說給家人或同學聽（1 分鐘）。'));
      w.appendChild(h('div.task-acts', null,
        K.sbtn('存入回顧盒', function () { var dd = sheetData(R); St.saveBoxItem('l6', 'sheet', { type: 'sheet', title: dd.title, en: dd.en, fields: dd.fields, footer: '' }); ui.toast('同心圈任務單已存入回顧盒'); XC.audio.play('chime'); }, { icon: 'box', primary: true }),
        K.sbtn('下載 PNG', function () { XC.export.cardPNG(sheetData(R), '同心圈任務單-' + XC.export.stamp() + '.png'); }, { icon: 'download' }),
        K.sbtn('列印（A5）', function () { XC.export.printCard(sheetData(R)); }, { icon: 'print' })));
      stage.appendChild(w); return;
    }
    var pick = R.data('rpick') || {}, all = R.data('dw') || {};
    var row = h('div.rep-row');
    c.cases.forEach(function (cs) {
      var col = K.panel('rep-col');
      col.appendChild(caseCard(cs, { short: true, cls: 'mini' }));
      var gs = St.groups().filter(function (g) { return all[g.id] && all[g.id].c === cs.id; });
      if (!gs.length) gs = St.groups();
      col.appendChild(h('div.rep-gs', { role: 'group', 'aria-label': '案例 ' + cs.id + ' 匯報組' }, gs.map(function (g) { var on = pick[cs.id] === g.id; return h('button.gchip' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { var m = R.data('rpick') || {}; m[cs.id] = g.id; R.data('rpick', m); R.select(g.id); R.rerender(); } } }, g.name); })));
      var gid = pick[cs.id];
      if (gid) {
        var sd = sheetData(R, gid), shAll = (R.data('sh') || {})[gid] || {};
        col.appendChild(h('div.rep-sum', null, h('b', null, R.gname(gid) + '・團結值 ' + R.score(gid)), h('div.sh-mini', { html: ringsSVG({ sel: shAll.rings || [], fogs: fogsOf(R, { rings: shAll.rings || [], fix: shAll.fix, fix2: shAll.fix2, g2: shAll.g2 }, drawOf(R, gid)) }) }),
          h('p.fine', null, sd.fields.length > 2 ? '' : '（此組未在網站填寫任務單：請口頭匯報紙本任務單）')));
      }
      row.appendChild(col);
    });
    w.appendChild(row);
    stage.appendChild(w);
  };
  V['s2.sum'] = function (R, sc, ph, stage) {
    var c = C();
    var w = h('div.l6-sum');
    w.appendChild(h('div.scene-quote.small', null, h('span.sq-tag', null, '教師歸納'), h('p', null, '「' + c.sumText + '」')));
    if (R.isClass()) {
      var row = h('div.poster-groups');
      St.groups().forEach(function (g) { var s = R.score(g.id); row.appendChild(h('span.pg', null, h('b', null, g.name), h('span.pg-ring' + (s > 0 ? '.on' : ''), { html: ui.icon('ripple') }), h('small', null, '團結值 ' + s))); });
      w.appendChild(row);
      w.appendChild(h('p.fine.center', null, '團結值不設組間排名：每組最多 5 分（合作 3＋化解 2）。'));
    }
    stage.appendChild(w);
  };

  /* ================= 環節四：行動承諾 ================= */
  function stepsBar(R, done) {
    var c = C();
    return h('ol.steps6', { 'aria-label': '我的行動承諾六步驟' }, c.steps.map(function (s, i) {
      var st = i < done ? 'done' : i === done ? 'cur' : i >= 4 ? 'later' : '';
      return h('li' + (st ? '.' + st : ''), null, h('span.s6-n', null, String(i + 1)), h('span.s6-t', null, s), i >= 4 ? h('small', null, '課後') : null);
    }));
  }
  function stepDone(R) {
    var me = pl(R).me, v = me.v, n = 0;
    if (me.sealed) return 4;
    if (K.has(v.eval, 4)) n = 1; else return 0;
    if (K.has(v.zhi, 4)) n = 2; else return n;
    if (K.has(v.act, 4) && (v.rings || []).some(isOuter) && K.has(v.gap, 4)) n = 3; else return n;
    if (me.ck && me.ck[0] && me.ck[1] && me.ck[2]) n = 4;
    return n;
  }
  function l1Zhi() {
    var b = St.box().l1 || {}, out = '';
    Object.keys(b).forEach(function (k) { var it = b[k]; (it.fields || []).forEach(function (f) { if (!out && f.label === '我的志向' && f.value) out = f.value; }); });
    return out;
  }
  function boxLines() {
    var b = St.box(), out = [];
    XC.content.common.lessons.forEach(function (l) {
      if (l.id === 'l6') return;
      var items = b[l.id] || {};
      Object.keys(items).forEach(function (k) {
        var it = items[k]; if (!it || it.sealed) return;
        (it.fields || []).forEach(function (f) { var v = String(f.value || '').trim(); if (ui.len(v) >= 4 && !/簽名|見證人$/.test(f.label)) out.push({ no: l.no, game: l.game, label: f.label, value: v }); });
      });
    });
    myPlanks().forEach(function (p, i) { out.push({ no: 3, game: '知行橋工程隊', label: '我的橋板 ' + (i + 1), value: p }); });
    return out;
  }
  V['s3.self'] = function (R, sc, ph, stage) {
    var c = C(), se = c.selfEval, S = pl(R), me = S.me, v = me.v;
    var w = h('div.self6-v');
    w.appendChild(stepsBar(R, stepDone(R)));
    w.appendChild(h('div.task-head', null, h('h2', null, se.title), h('p.who', null, se.lead)));
    var body = h('div.cs-body.se-body');
    var lines = boxLines(), panel = K.panel('bx-panel');
    if (R.isClass()) panel.appendChild(h('p.notice', null, '課堂投影示範：學生在自己的裝置（自學模式）或紙本回顧盒完成；以下顯示這部裝置上的紀錄。'));
    if (!lines.length) panel.appendChild(h('p.notice', null, se.none));
    var lastNo = 0, list = h('div.bx-lines', { role: 'list' });
    lines.forEach(function (x) {
      if (x.no !== lastNo) { list.appendChild(h('p.bx-h', null, '第' + x.no + '節《' + x.game + '》')); lastNo = x.no; }
      var on = v.eval === x.value;
      list.appendChild(h('button.bx-line' + (on ? '.on' : ''), { type: 'button', role: 'listitem', 'aria-pressed': String(on), on: { click: function () { v.eval = x.value; v.evalSrc = '第' + x.no + '節・' + x.label; S.save(); XC.audio.play('stamp'); R.rerender(); } } }, h('small', null, x.label), h('span', null, x.value)));
    });
    if (lines.length) panel.appendChild(list);
    body.appendChild(panel);
    var right = h('div.se-right');
    var card = h('div.out-card.card.se-card', null, h('div.oc-head', null, h('span.oc-ico', { html: ui.icon('ripple') }), h('div', null, h('h2.oc-title', null, c.promise.title), h('p.en.it', { lang: 'en' }, '第一欄・' + se.label))));
    card.appendChild(ui.field({ label: se.label + (v.evalSrc ? '（' + v.evalSrc + '）' : ''), value: v.eval || '', rows: 3, max: 200, placeholder: se.ph, onInput: function (t) { v.eval = t; v.evalSrc = ''; S.save(); } }));
    right.appendChild(card);
    right.appendChild(h('div.task-acts', null, K.sbtn('下一步：填寫行動承諾卡', function () { R.toPhase('card'); }, { icon: 'next', primary: true })));
    body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
  };
  function pledgeData(R, blank) {
    var c = C(), me = pl(R).me, v = blank ? {} : me.v, f = [];
    f.push({ label: '自我評估（最有感的一句）', value: v.eval || '' });
    c.promise.fields.forEach(function (x) { f.push({ label: x.label, value: x.id === 'ring' ? ringNames(v.rings) : (v[x.id] || '') }); });
    if (!blank && me.adv) f.push({ label: '承諾三問・對方的建議', value: me.adv });
    return { kicker: '第6節《同心圈》由我到天下', title: c.promise.title, en: c.promise.en, lit: true, fields: f, footer: XC.content.common.siteTitle + (!blank && me.name ? '｜' + me.name : '') };
  }
  function lockedNote(R, host) {
    var env = envState(), c = C();
    host.appendChild(h('div.sealed6', null, envelopeEl(env ? env.name : '', 'sealed'), h('div', null, h('p.big', null, c.promise.sealed), env ? h('p', null, c.promise.openLabel + '：' + fmtDate(env.openDate)) : null,
      h('div.task-acts', null, K.sbtn(c.ui.openPage, function () { XC.router.go('l6/open'); }, { icon: 'envelope', primary: true }),
        K.sbtn('重寫一張（取代已封存的信封）', function () { ui.confirm('重寫會在下次封存時取代原來的信封。確定重寫？', '重寫').then(function (ok) { if (!ok) return; var S = pl(R); S.me.sealed = false; S.save(); R.rerender(); }); }, { icon: 'brush', cls: 'sm' })))));
  }
  V['s3.card'] = function (R, sc, ph, stage) {
    var c = C(), pr = c.promise, self = !R.isClass(), S = pl(R), me = S.me, v = me.v;
    var w = h('div.pl6-v');
    w.appendChild(stepsBar(R, stepDone(R)));
    if (self && me.sealed) { lockedNote(R, w); stage.appendChild(w); return; }
    if (!v.zhi) { var z = l1Zhi(); if (z) { v.zhi = z; v.zhiFrom = true; S.save(); } }
    var fields = [{ id: 'eval', label: '自我評估（最有感的一句）', rows: 2, max: 200, ph: c.selfEval.ph }].concat(pr.fields.filter(function (f) { return f.id !== 'ring'; }).map(function (f, i) {
      var chips = { zhi: [pr.scaffolds[0]], act: [pr.scaffolds[1]].concat(pr.examples), gap: [pr.scaffolds[2]].concat(self ? myPlanks().map(function (p) { return '我的橋板是' + p; }) : []), mark: [pr.scaffolds[3]] }[f.id];
      return { id: f.id, label: f.label, ph: f.ph, rows: 2, max: 200, chips: (R.support || f.id === 'act') ? chips : (f.id === 'gap' && self && myPlanks().length ? chips : null), help: f.id === 'zhi' && v.zhiFrom ? '已帶入第1節志向卡；可改寫。' : f.help };
    }));
    var card = K.cardForm(R, { key: 'pl', title: pr.title, en: pr.en, fields: fields, numbered: false, cls: 'pl6-card', classNote: '課堂投影示範：學生在紙本行動承諾卡或自己的裝置（自學模式）填寫。承諾內容不需公開。',
      onField: function () { var b = R.stage.querySelector('.steps6'); if (b) b.replaceWith(stepsBar(R, stepDone(R))); } });
    /* 我的同心圈：插在「我的行動」之後 */
    var rf = pr.fields.filter(function (f) { return f.id === 'ring'; })[0];
    var ringFld = h('div.fld.oc-f.ring-fld', { 'data-f': 'ring' }, h('span.fld-l', null, rf.label), h('small.fld-help', null, rf.help));
    var chips = h('div.ring-chips', { role: 'group', 'aria-label': rf.label });
    v.rings = v.rings || [];
    c.circles.forEach(function (ci) {
      var on = v.rings.indexOf(ci.id) >= 0;
      chips.appendChild(h('button.ring-chip' + (on ? '.on' : '') + (isOuter(ci.id) ? '.outer' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function (e) {
        var i = v.rings.indexOf(ci.id); if (i >= 0) v.rings.splice(i, 1); else v.rings.push(ci.id); S.save();
        e.currentTarget.classList.toggle('on', i < 0); e.currentTarget.setAttribute('aria-pressed', String(i < 0)); XC.audio.play('click'); outerMsg();
        var b = R.stage.querySelector('.steps6'); if (b) b.replaceWith(stepsBar(R, stepDone(R)));
      } } }, h('span', { html: ico(ci.icon) }), ci.name));
    });
    var om = h('p.ring-msg');
    function outerMsg() { var ok = v.rings.some(isOuter); om.className = 'ring-msg ' + (ok ? 'ok' : 'warn'); om.textContent = ok ? '已連結：' + ringNames(v.rings.filter(isOuter)) : c.outerRule; }
    outerMsg();
    ringFld.appendChild(chips); ringFld.appendChild(om);
    var actF = card.querySelector('[data-f="act"]'); if (actF && actF.parentNode) actF.parentNode.insertBefore(ringFld, actF.nextSibling); else card.appendChild(ringFld);
    w.appendChild(card);
    w.appendChild(h('p.fine', null, pr.exNote + ' ' + c.noRanking.replace('設計說明：', '')));
    w.appendChild(h('div.task-acts', null, K.sbtn('下一步：承諾三問', function () { R.toPhase('check'); }, { icon: 'next', primary: true }), K.sbtn('列印行動承諾卡（A5）', function () { XC.export.printCard(pledgeData(R, !self)); }, { icon: 'print' })));
    stage.appendChild(w);
  };
  V['s3.check'] = function (R, sc, ph, stage) {
    var c = C(), pr = c.promise, self = !R.isClass(), S = pl(R), me = S.me, v = me.v;
    me.ck = me.ck || {};
    var w = h('div.ck6-v');
    w.appendChild(stepsBar(R, stepDone(R)));
    if (self && me.sealed) { lockedNote(R, w); stage.appendChild(w); return; }
    w.appendChild(h('div.step-bar', null, h('h2', null, '承諾三問'), h('span.fine', null, pr.threeLead), K.miniT(R, 'three', 180, '互評倒數')));
    var body = h('div.cs-body.ck-body');
    var sum = h('div.card-paper.ck-sum', null, h('b', null, pr.pledge), h('p', null, v.act || (self ? '（先在行動承諾卡寫「我的行動」）' : '（學生的承諾不需公開）')),
      self && v.rings && v.rings.length ? h('p.fine', null, '我的同心圈：' + ringNames(v.rings)) : null, self && v.mark ? h('p.fine', null, '完成標記：' + v.mark) : null);
    body.appendChild(sum);
    var qs = K.panel('ck-qs');
    pr.three.forEach(function (q, i) {
      var on = !!me.ck[i];
      qs.appendChild(h('button.ck-q' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { me.ck[i] = !me.ck[i]; S.save(); XC.audio.play(me.ck[i] ? 'stamp' : 'click'); R.rerender(); } } },
        h('span.ck-n', null, '問' + '一二三'[i]), h('b', null, q), h('span.ck-box', { html: on ? ui.icon('check') : '' })));
    });
    qs.appendChild(ui.field({ label: self ? pr.adviceLabel : pr.adviceLabel + '（示範）', help: self ? pr.adviceSelf : null, value: me.adv || '', rows: 2, max: 150, onInput: function (t) { me.adv = t; S.save(); } }));
    qs.appendChild(h('div.task-acts', null, K.sbtn('回到承諾卡修訂', function () { R.toPhase('card'); }, { icon: 'brush' }), K.sbtn('下一步：簽署', function () { R.toPhase('sign'); }, { icon: 'next', primary: true })));
    body.appendChild(qs);
    w.appendChild(body);
    w.appendChild(h('blockquote.feedback', null, '「' + pr.fb + '」'));
    stage.appendChild(w);
  };
  function sigPad(me, S) {
    var cv = h('canvas.sig-cv', { width: 480, height: 150, 'aria-label': '手寫簽名板' }), ctx = cv.getContext('2d'), down = false, last = null;
    if (me.sig) { var im = new Image(); im.onload = function () { ctx.drawImage(im, 0, 0); }; im.src = me.sig; }
    function p(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) }; }
    cv.addEventListener('pointerdown', function (e) { down = true; last = p(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault(); });
    cv.addEventListener('pointermove', function (e) { if (!down) return; var q = p(e); ctx.strokeStyle = '#242322'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(q.x, q.y); ctx.stroke(); last = q; });
    function up() { if (!down) return; down = false; try { me.sig = cv.toDataURL('image/png'); S.save(); } catch (er) {} }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    return h('div.sig-wrap', null, cv, K.sbtn('清除簽名', function () { ctx.clearRect(0, 0, cv.width, cv.height); me.sig = ''; S.save(); }, { icon: 'reset', cls: 'sm' }));
  }
  V['s3.sign'] = function (R, sc, ph, stage) {
    var c = C(), pr = c.promise, self = !R.isClass(), S = pl(R), me = S.me, v = me.v;
    var w = h('div.sign6-v');
    w.appendChild(stepsBar(R, stepDone(R)));
    if (self && me.sealed) { lockedNote(R, w); stage.appendChild(w); return; }
    var body = h('div.cs-body.sg-body');
    var el = envelopeEl(me.name || '', '');
    body.appendChild(h('div.sg-left', null, el, h('p.sg-pledge', null, pr.pledge.replace('……', ''), h('b', null, self ? (v.act || '……') : '……'))));
    var p = K.panel('sg-panel', true);
    p.appendChild(h('p', null, pr.signLead));
    if (self) {
      var nm = h('input.inp', { type: 'text', maxlength: 20, placeholder: '化名或縮寫', 'aria-label': pr.signName, value: me.name || '' });
      nm.oninput = function () { me.name = nm.value; S.save(); el.querySelector('.env-name').textContent = nm.value; };
      p.appendChild(h('label.fld.inline', null, h('span.fld-l', null, pr.signName), nm));
      p.appendChild(h('details.sig-d' , me.sig ? { open: true } : null, h('summary', null, pr.padLabel), sigPad(me, S)));
      if (!me.openDate) { me.openDate = dayStart(Date.now() + pr.defaultDays * DAY); S.save(); }
      var di = h('input.inp', { type: 'date', value: isoDate(me.openDate), min: isoDate(Date.now() + DAY), 'aria-label': pr.openLabel });
      di.onchange = function () { var t = Date.parse(di.value + 'T00:00:00'); if (!isNaN(t)) { me.openDate = t; S.save(); } };
      p.appendChild(h('label.fld.inline', null, h('span.fld-l', null, pr.openLabel), di, pr.quick.map(function (q) { return K.sbtn(q.name, function () { me.openDate = dayStart(Date.now() + q.d * DAY); S.save(); di.value = isoDate(me.openDate); }, { cls: 'sm' }); })));
      p.appendChild(h('div.task-acts', null, K.sbtn(pr.sealBtn, function () {
        if (!K.has(v.act, 4)) { ui.toast('先在行動承諾卡寫好「我的行動」，再封存。', 3600); return; }
        if (!(v.rings || []).some(isOuter)) { ui.toast(c.outerRule, 4200); return; }
        if (!K.has(me.name, 1)) { ui.toast('請先簽名（化名或縮寫）。'); nm.focus(); return; }
        seal(R, el);
      }, { icon: 'envelope', primary: true }), K.sbtn('列印行動承諾卡（A5）', function () { XC.export.printCard(pledgeData(R)); }, { icon: 'print' })));
    } else {
      p.appendChild(h('div.task-acts', null, K.sbtn('示範封存動畫', function () { el.classList.remove('sealed'); void el.offsetWidth; el.classList.add('sealing'); XC.audio.play('stamp'); setTimeout(function () { el.classList.add('sealed'); }, 1600); }, { icon: 'envelope', primary: true }),
        K.sbtn('列印行動承諾卡（空白）', function () { XC.export.printCard(pledgeData(R, true)); }, { icon: 'print' })));
      p.appendChild(h('p.fine', null, '課堂：學生在紙本卡上簽名、放進承諾信封，寫上開封日期（預設兩至三星期後）。'));
    }
    p.appendChild(h('p.fine', null, pr.privacy));
    body.appendChild(p);
    w.appendChild(body);
    stage.appendChild(w);
  };
  function seal(R, el) {
    var c = C(), S = pl(R), me = S.me, d = pledgeData(R);
    St.saveBoxItem('l6', 'promise', { type: 'envelope', title: '行動承諾信封', sealed: true, openVia: 'l6', openDate: me.openDate, card: false, name: me.name || '', sealedAt: Date.now(), rings: (me.v.rings || []).slice(), sig: me.sig || '', fields: d.fields, footer: me.name || '' });
    /* 封存後，草稿中的承諾內容移除（只保留圈層，供小旗使用）：開封日期才看得到 */
    me.v = { rings: (me.v.rings || []).slice(), exit: me.v.exit || '' }; me.ck = { 0: true, 1: true, 2: true }; me.adv = ''; me.sig = ''; me.sealed = true; S.save();
    el.classList.add('sealing'); XC.audio.play('flip');
    setTimeout(function () { XC.audio.play('stamp'); }, 1100);
    setTimeout(function () { el.classList.add('sealed'); XC.fx.burst(R.stageWrap); ui.announce('行動承諾已封存，開封日期：' + fmtDate(me.openDate)); }, 1500);
    setTimeout(function () { R.rerender(); }, 2700);
  }

  /* ================= 環節五：同心圈結算 ================= */
  V['s4.flags'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), P = pool(R), lit = P.f >= 1 && R.data('lit');
    var w = h('div.flags-v');
    w.appendChild(h('h2.center', null, self ? '我的同心圈' : '全班同心圈', h('small', null, self ? '' : '　小旗 ' + P.p + '／' + P.t)));
    var body = h('div.cs-body.fl-body');
    var box = h('div.fl-box' + (lit ? '.lit' : ''), { role: 'img', 'aria-label': '同心圈：' + P.p + ' 面小旗' + (lit ? '，金色同心圈亮起' : '') },
      h('img.fl-img', { src: IMG + 'l6-rings-glow.webp', alt: '', loading: 'lazy' }),
      h('div.fl-svg', { html: ringsSVG({ flags: flagsOf(R), lit: lit ? 7 : 0, meOn: true, cls: 'big' }) }));
    body.appendChild(box);
    var p = K.panel('fl-panel');
    p.appendChild(h('p', null, c.flags.rule));
    if (!self) {
      p.appendChild(h('p.fine', null, c.flags.classInput));
      var tb = h('div.fl-tb');
      var f = R.data('flags') || {};
      c.circles.forEach(function (ci) {
        tb.appendChild(h('div.fl-row', null, h('span.fl-n', null, h('span', { html: ico(ci.icon) }), ci.name), K.stepper(f[ci.id] || 0, function (n) {
          var m = R.data('flags') || {}; m[ci.id] = n; R.data('flags', m); R.refreshStrip();
          var nb = R.stage.querySelector('.fl-svg'); if (nb) nb.innerHTML = ringsSVG({ flags: m, lit: 0, meOn: true, cls: 'big' });
          var t = R.stage.querySelector('.flags-v h2 small'); if (t) { var Q = pool(R); t.textContent = '　小旗 ' + Q.p + '／' + Q.t; }
        }, ci.name + '小旗數', 99)));
      });
      p.appendChild(tb);
    } else {
      p.appendChild(h('p.fine', null, c.flags.selfNote));
      var rs = myRings(R);
      p.appendChild(h('p', null, rs.length ? '我的小旗：' + ringNames(rs) : '你的承諾卡還未選圈層。'));
      if (!P.ok) { p.appendChild(h('p.notice', null, c.outerRule)); p.appendChild(h('div.task-acts', null, K.sbtn('回到行動承諾卡', function () { R.go(3, 1, 0); }, { icon: 'brush', cls: 'sm' }))); }
    }
    p.appendChild(h('div.task-acts', null, K.sbtn(c.ui.goalBtn, function () { lightUp(R); }, { icon: 'ripple', primary: true }), lit ? K.sbtn('再亮一次', function () { lightUp(R, true); }, { icon: 'play', cls: 'sm' }) : null));
    if (!self && P.f < 1) p.appendChild(h('p.fine', null, '仍欠 ' + (P.t - P.p) + ' 面小旗（目標預設為全班人數的八成，可在教師控制台修改；老師也可在教師面板手動觸發動畫）。'));
    body.appendChild(p);
    w.appendChild(body);
    stage.appendChild(w);
  };
  function lightUp(R, force) {
    var P = pool(R), c = C();
    if (P.f < 1 && !force) { ui.toast(R.isClass() ? '小旗已插上；還欠 ' + (P.t - P.p) + ' 面，同心圈就會亮起。' : c.outerRule, 3600); XC.audio.play('drop'); return; }
    R.data('lit', true);
    if (R.phase().id !== 'flags') { if (R.isClass()) XC.app.goalFx('l6'); return; }
    R.rerender();
    var box = R.stage.querySelector('.fl-box'); if (!box) return;
    if (force && P.f < 1) { box.classList.add('lit'); box.querySelector('.fl-svg').innerHTML = ringsSVG({ flags: flagsOf(R), lit: 7, meOn: true, cls: 'big' }); }
    if (XC.fx.reduced()) { if (R.isClass()) XC.app.goalFx('l6'); return; }
    box.classList.remove('lit'); void box.offsetWidth; box.classList.add('lighting', 'lit'); XC.audio.play('lamp');
    setTimeout(function () { XC.fx.burst(R.stageWrap); XC.audio.play('chime'); }, 2400);
    setTimeout(function () { box.classList.remove('lighting'); if (R.isClass()) XC.app.goalFx('l6'); else ui.toast('仁愛由近及遠，層層推展：你的同心圈亮起了。'); }, 3800);
  }
  V['s4.badges'] = function (R, sc, ph, stage) {
    if (R.isClass()) { K.badges(R, stage, null); stage.appendChild(h('p.fine.center', null, '徽章表揚行為，不比較多少；不評價承諾的「愛國程度」。')); return; }
    K.badges(R, stage, function (b) {
      var sh = sheetS(R).me;
      if (b.id === 'tongxin' && sh.rings.filter(function (id) { return coopOK(sh.coop[id]); }).length < 2) return '在同心圈任務單為至少兩個圈寫齊「我可以……」「一起做的人是……」，就可以為自己蓋「同心者」。';
      if (b.id === 'poge' && cnt(R, 'me', 'b') < 1) return '在任務單寫出化解隔閡的方法，就可以為自己蓋「破隔者」。';
      if (b.id === 'zhumeng') { var me = pl(R).me; if (!me.sealed && !(K.has(me.v.act, 8) && K.has(me.v.mark, 4))) return '行動承諾寫清楚「誰、做什麼、何時」和完成標記（或已封存），就可以為自己蓋「築夢者」。'; }
      return null;
    });
  };
  V['s4.summary'] = function (R, sc, ph, stage) { K.summary(R, stage, sc.summary, '三句總結'); };
  V['s4.exit'] = function (R, sc, ph, stage) {
    var c = C();
    K.exit(R, stage, { key: 'pl', label: c.exit, chips: ['我承諾的第一步是：在（時間）前，……'], preview: sc.nextPreview, quote: '同心同行，文化自信', classLead: '在行動承諾卡背面寫一句：',
      save: function () { var me = pl(R).me; St.saveBoxItem('l6', 'exit', { type: 'exit', title: '離場券', fields: [{ label: c.exit.replace(/^離場券：/, ''), value: me.v.exit || '' }], footer: '' }); ui.toast('離場券已存入回顧盒'); XC.audio.play('chime'); }, saveLabel: '離場券存入回顧盒' });
    var p = stage.querySelector('.exit-p');
    if (p) p.appendChild(h('div.task-acts.fin-acts6', null, K.sbtn(c.ui.finale, function () { XC.router.go('finale'); }, { icon: 'film', primary: true }), K.sbtn(c.ui.openPage, function () { XC.router.go('l6/open'); }, { icon: 'envelope' })));
  };

  /* ================= 開封跟進頁 #/l6/open ================= */
  L.openPage = function (b) {
    var c = C(), o = c.open, timer = 0;
    var DK = 'l6_open_draft';
    function draft() { return XC.storage.get(DK, {}) || {}; }
    function saveDraft(d) { XC.storage.set(DK, d); }
    function render() {
      clearInterval(timer); b.innerHTML = '';
      var env = envState(), w = h('div.page-body.open6');
      w.appendChild(h('section.card.o6-head', null, h('p.lead', null, o.lead), stepsBar({}, 4), h('p.fine', null, c.stepsNote)));
      var now = Date.now();
      if (env && env.sealed && now < env.openDate) {
        var cd = h('p.o6-count', { 'aria-live': 'polite' });
        function tick() { var ms = env.openDate - Date.now(); if (ms <= 0) { render(); return; } var d = Math.floor(ms / DAY), hh = Math.floor(ms % DAY / 3600000), mm = Math.floor(ms % 3600000 / 60000); cd.textContent = o.count + ' ' + d + ' 日 ' + hh + ' 小時 ' + mm + ' 分'; if (!b.isConnected) clearInterval(timer); }
        tick(); timer = setInterval(tick, 30000);
        w.appendChild(h('section.card.o6-lock', null, envelopeEl(env.name, 'sealed'), h('div', null, h('h2', null, o.locked), cd,
          h('p', null, '開封日期：' + fmtDate(env.openDate) + '；封存時間：' + new Date(env.sealedAt).toLocaleString('zh-HK')),
          h('div.c-row', null, ui.btn('提早開封（教師）', { icon: 'teacher', cls: 'sm', onClick: function () { ui.confirm('這是給教師示範或特殊情況用的。確定現在提早開封？', '提早開封').then(function (ok) { if (ok) openEnv(env, true); }); } })),
          h('p.fine', null, o.teacherOpen))));
      } else if (env && env.sealed) {
        var el = envelopeEl(env.name, 'sealed');
        w.appendChild(h('section.card.o6-lock', null, el, h('div', null, h('h2', null, '開封日期到了'), h('p', null, '這是你在第6節封存的行動承諾信封（封存時間：' + new Date(env.sealedAt).toLocaleString('zh-HK') + '）。'),
          h('div.c-row', null, ui.btn('拆開信封', { primary: true, icon: 'envelope', onClick: function () { el.classList.remove('sealed'); el.classList.add('opening'); XC.audio.play('flip'); setTimeout(function () { XC.audio.play('chime'); }, 900); setTimeout(function () { openEnv(env); }, XC.fx.reduced() ? 50 : 1700); } })))));
      } else {
        w.appendChild(form(env));
      }
      w.appendChild(h('p.safety', null, XC.content.common.safetyTip));
      b.appendChild(w);
    }
    function openEnv(env, early) {
      St.saveBoxItem('l6', 'promise', Object.assign({}, env, { sealed: false, opened: true, card: true, openedAt: Date.now(), early: !!early, title: '行動承諾信封（已開封）', promise: env.promise || env.fields || [] }));
      render();
    }
    function form(env) {
      var d = draft(), sec = h('section.card.o6-form');
      if (env) {
        var pf = env.promise || env.fields || [];
        sec.appendChild(h('div.card-paper.o6-pledge', null, h('h2', null, '我的行動承諾'), h('dl', null, pf.map(function (f) { return [h('dt', null, f.label), h('dd', null, f.value || '—')]; })),
          env.sig ? h('img.o6-sig', { src: env.sig, alt: '手寫簽名' }) : null, h('p.fine', null, '簽名：' + (env.name || '—') + '；封存：' + new Date(env.sealedAt).toLocaleDateString('zh-HK') + (env.openedAt ? '；開封：' + new Date(env.openedAt).toLocaleDateString('zh-HK') : ''))));
      } else {
        sec.appendChild(h('h2', null, '我的行動承諾'));
        sec.appendChild(h('p.notice', null, o.none));
        sec.appendChild(ui.field({ label: o.noneLabel, value: d.promise || '', rows: 2, max: 200, onInput: function (v) { d.promise = v; saveDraft(d); } }));
      }
      sec.appendChild(h('h3', null, '自評'));
      sec.appendChild(h('div.c-row.o6-res', { role: 'group', 'aria-label': '自評' }, o.results.map(function (r) { var on = d.result === r.id; return h('button.chip' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { d.result = r.id; saveDraft(d); XC.audio.play('stamp'); render(); } } }, r.name); })));
      sec.appendChild(h('h3', null, o.s5.title));
      sec.appendChild(ui.field({ label: o.s5.label, value: d.did || '', rows: 3, max: 300, placeholder: o.s5.ph, onInput: function (v) { d.did = v; saveDraft(d); } }));
      sec.appendChild(h('h3', null, o.s6.title));
      o.s6.fields.forEach(function (f) { sec.appendChild(ui.field({ label: f.label, value: d[f.id] || '', rows: 2, max: 200, placeholder: f.ph, onInput: function (v) { d[f.id] = v; saveDraft(d); } })); });
      sec.appendChild(h('p.fine', null, o.noScore));
      sec.appendChild(h('div.c-row', null,
        ui.btn(o.save, { primary: true, icon: 'box', onClick: function () { saveFollow(env, draft()); ui.toast(o.saved); XC.audio.play('chime'); } }),
        ui.btn('列印（A5）', { icon: 'print', onClick: function () { var it = followItem(env, draft()); XC.export.printCard({ kicker: '第6節《同心圈》開封跟進', title: it.title, fields: it.fields, footer: XC.content.common.siteTitle + (it.footer ? '｜' + it.footer : '') }); } }),
        ui.btn('打開我的回顧盒', { icon: 'box', onClick: function () { XC.router.go('box'); } })));
      return sec;
    }
    function reportFields(d) {
      var o2 = o, res = o2.results.filter(function (r) { return r.id === d.result; })[0];
      return [{ label: '自評', value: res ? res.name : '' }, { label: o2.s5.title.replace('・', '：') + '（' + o2.s5.label + '）', value: d.did || '' }]
        .concat(o2.s6.fields.map(function (f) { return { label: '步驟六：' + f.label, value: d[f.id] || '' }; }));
    }
    function followItem(env, d) {
      if (!env) return { type: 'followup', title: '開封跟進', fields: [{ label: o.noneLabel, value: d.promise || '' }].concat(reportFields(d)), footer: '' };
      var pf = env.promise || env.fields || [];
      return Object.assign({}, env, { title: '行動承諾信封（已開封・已跟進）', promise: pf, fields: pf.concat(reportFields(d)), report: d, footer: env.name || '' });
    }
    function saveFollow(env, d) { var it = followItem(env, d); St.saveBoxItem('l6', env ? 'promise' : 'followup', it); }
    render();
    return function () { clearInterval(timer); };
  };
})();
