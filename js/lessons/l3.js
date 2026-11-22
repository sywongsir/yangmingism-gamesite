/* 第3節《知行橋工程隊》修復知行裂縫 ── 遊戲邏輯（文字全部取自 js/content/l3.js） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state, K = XC.kit;
  var C = function () { return XC.content.l3; };
  var L = XC.lessons.l3 = {};
  var V = {};
  var IMG = 'assets/img/l3/';
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- 橋：圖片＋SVG 疊加（裂紋、橋板、知／行大字、人物） ---------- */
  var CR = [[380, 498, -32], [560, 408, -20], [800, 364, 0], [1040, 408, 20], [1220, 498, 32]];
  function railY(x) { return 344 + 0.00078 * (x - 800) * (x - 800); }
  /* o: {states:[faint|glow|seam|none ×5], widths:[], planks:[idx...], labels:{idx:text}, banks:true, walker:'mid'|'start'|'end'|false, cls} */
  function bridge(o) {
    o = o || {};
    var box = h('div.bridge-box' + (o.cls ? '.' + o.cls : ''));
    box.appendChild(h('img.bb-img', { src: IMG + (o.walker === 'mid' ? 'l3-river-bridge.webp' : 'l3-bridge-empty.webp'), alt: o.alt || '宣紙上的河與石拱橋', loading: 'lazy' }));
    var s = '<svg class="bb-svg" viewBox="0 0 1600 900" aria-hidden="true"><defs><linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a55"/><stop offset=".55" stop-color="#8a6036"/><stop offset="1" stop-color="#5e3f22"/></linearGradient>' +
      '<filter id="gglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs>';
    if (o.banks !== false) s += '<text class="bank zhi" x="190" y="330">知</text><text class="bank xing" x="1410" y="330">行</text>';
    C().bridgeCracks.forEach(function (d, i) {
      var st = (o.states || [])[i] || 'faint'; if (st === 'none') return;
      var w = (o.widths || [])[i];
      s += '<g class="crack c' + i + ' ' + st + '"' + (w != null ? ' style="--cw:' + w.toFixed(2) + '"' : '') + '><path class="cr-glow" d="' + d + '"/><path class="cr-line" d="' + d + '"/></g>';
    });
    (o.planks || []).forEach(function (ci, k) {
      var c = CR[ci];
      s += '<g class="plank-g" style="--d:' + (k * 0.12) + 's" transform="translate(' + c[0] + ' ' + (c[1] - 4) + ') rotate(' + c[2] + ')"><g class="plank-in"><rect x="-44" y="-15" width="88" height="26" rx="3" fill="url(#wood)"/><path d="M-38 -7h76M-30 3h60" class="grain"/></g></g>';
    });
    Object.keys(o.labels || {}).forEach(function (ci) {
      var c = CR[ci], up = ci == 2 ? 150 : 120;
      s += '<g class="cr-label"><line x1="' + c[0] + '" y1="' + (c[1] + 20) + '" x2="' + c[0] + '" y2="' + (c[1] + up) + '"/><text x="' + c[0] + '" y="' + (c[1] + up + 44) + '">' + ui.esc(o.labels[ci]) + '</text></g>';
    });
    if (o.walker && o.walker !== 'mid') {
      var x0 = o.walker === 'end' ? 1270 : 330;
      s += '<image class="walker" href="' + IMG + 'l3-walker.png" width="80" height="116" x="' + (x0 - 40) + '" y="' + (railY(x0) - 110) + '"/>';
    }
    s += '</svg>';
    box.insertAdjacentHTML('beforeend', s);
    return box;
  }
  function walk(box, done) {
    var im = box.querySelector('.walker'); if (!im) { if (done) done(); return; }
    if (XC.fx.reduced()) { im.setAttribute('x', 1230); im.setAttribute('y', railY(1270) - 110); if (done) done(); return; }
    var t0 = performance.now(), dur = 4200;
    (function step(t) {
      var f = Math.min(1, (t - t0) / dur), e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      var x = 330 + (1270 - 330) * e, bob = Math.abs(Math.sin(f * Math.PI * 14)) * 3;
      im.setAttribute('x', (x - 40).toFixed(1)); im.setAttribute('y', (railY(x) - 110 - bob).toFixed(1));
      if (f < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }

  /* ---------- 資料 ---------- */
  function scOf(R, gid) {
    if (R.isClass()) { gid = gid || R.sel; var m = R.data('scOf') || {}; var idx = St.groups().map(function (g) { return g.id; }).indexOf(gid); return m[gid] || 'ABC'[Math.max(0, idx) % 3]; }
    return K.st(R, 'sc').me.sc || null;
  }
  function scById(id) { return C().scenarios.filter(function (s) { return s.id === id; })[0]; }
  function gdata(R, gid) { var all = R.data('eng') || {}; return all[gid || R.cur()] || {}; }
  function planksOf(R, gid) { var all = R.data('pk') || {}; var p = all[gid || R.cur()] || {}; return ['p1', 'p2', 'p3'].filter(function (k) { return p[k]; }).length; }
  function stamps(R, gid) { var all = R.data('stamp') || {}; var s = all[gid || R.cur()] || {}; return Object.keys(s).filter(function (k) { return s[k]; }).length; }
  /* 一組的橋：被選的裂縫發光；每塊橋板封住一條裂縫（先封被選中的，再封其餘） */
  function groupBridgeState(R, gid) {
    var c = C(), d = gdata(R, gid), ks = d.k || [], n = planksOf(R, gid);
    var chosen = ks.map(function (id) { return c.crackCards.filter(function (k) { return k.id === id; })[0].crack; });
    var order = chosen.concat([2, 1, 3, 0, 4].filter(function (i) { return chosen.indexOf(i) < 0; }));
    var states = [0, 1, 2, 3, 4].map(function (i) { return chosen.indexOf(i) >= 0 ? 'glow' : 'faint'; });
    var planks = [];
    if (n >= 1) { states[order[0]] = 'seam'; planks.push(order[0]); }
    if (n >= 2) { states[order[1]] = 'seam'; planks.push(order[1]); }
    if (n >= 3) { order.slice(2).forEach(function (i) { states[i] = 'seam'; }); planks.push(order[2]); }
    var labels = {}; ks.forEach(function (id) { var k = c.crackCards.filter(function (x) { return x.id === id; })[0]; if (states[k.crack] === 'glow') labels[k.crack] = k.name; });
    return { states: states, planks: planks, labels: labels };
  }
  function poster(R) {
    var t = R.isClass() ? R.target() : 3, p = R.isClass() ? R.total() + (R.data('extraPk') || []).length : planksOf(R, 'me');
    return { p: p, t: t, f: Math.min(1, p / Math.max(1, t)) };
  }
  function posterStates(f) {
    var order = [2, 1, 3, 0, 4], n = f >= 1 ? 5 : Math.floor(f * 5), st = ['glow', 'glow', 'glow', 'glow', 'glow'], pl = [];
    order.slice(0, n).forEach(function (i) { st[i] = 'seam'; pl.push(i); });
    return { states: st, planks: pl };
  }
  function hintRow(R, key) { return R.isClass() ? null : K.hintRow(R, key); }

  /* ---------- 引擎掛鈎 ---------- */
  L.setup = function (R) { R.layer.classList.add('l3'); };
  L.stripItem = function (R, gid, el) {
    var n = planksOf(R, gid), s = stamps(R, gid);
    el.innerHTML = '<span class="g-planks" aria-hidden="true">' + [0, 1, 2].map(function (i) { return '<i class="' + (i < n ? 'on' : '') + '"></i>'; }).join('') + '</span><span class="g-info"><span class="g-name">' + ui.esc(R.gname(gid)) + '</span>' +
      '<span class="g-sub">橋板 ' + n + '／3' + (s ? '　<span class="g-stamp" title="真知章">' + ui.icon('seal') + '×' + s + '</span>' : '') + '</span></span>';
    el.setAttribute('aria-label', R.gname(gid) + '：橋板 ' + n + ' 塊，真知章 ' + s + ' 枚');
  };
  L.totalView = function (R, el) {
    var P = poster(R);
    el.innerHTML = '<span class="tv-l">橋海報</span><span class="tv-bridge" aria-hidden="true"><i style="width:' + (P.f * 100).toFixed(0) + '%"></i></span><b class="tv-n">' + P.p + '／' + P.t + '</b>';
    el.setAttribute('aria-label', '全班橋海報：已貼橋板 ' + P.p + ' 塊，目標 ' + P.t + ' 塊');
  };
  L.onScore = function (R, gid, d) {
    var t = document.querySelector('.ls-groups .grp[data-gid="' + gid + '"] .g-planks'); if (!t) return;
    if (d > 0) XC.fx.fly(R.stage.querySelector('.plank-src') || R.stage, t, 'plank').then(function () { XC.fx.bloom(t); });
    else if (d < 0) XC.fx.dim(t);
  };
  L.onUndo = K.onUndo;
  L.onSelect = function (R) { var ph = R.phase(); if (ph.layout === 'task' || ph.id === 'badges') R.rerender(); };
  L.leave = K.leave;
  L.onLine = function (R, line) { if (line.fx === 'write') { XC.audio.play('flip'); XC.fx.burst(R.stageWrap); } };
  L.render = function (R, sc, ph, stage) {
    var fn = V[sc.id + '.' + ph.id];
    if (fn) fn(R, sc, ph, stage);
    else if (ph.id === 'discuss') { var w = K.discuss(R, sc, stage); if (sc.id === 's2') w.appendChild(h('div.task-acts', null, K.challengeBtn(R))); }
  };
  L.teacherTools = function (R, sc, ph, el) {
    var c = C();
    if (sc.id === 's0' && ph.id === 'announce') el.appendChild(h('div.t-row', null, K.sbtn(c.ui.randomRoles, function () { K.randomRoles(R); }, { icon: 'dice', cls: 'sm' })));
    if (sc.id === 's2' && ph.id === 'scen') el.appendChild(h('div.t-row', null, K.sbtn(c.ui.assign, function () { assign(R); }, { icon: 'dice', cls: 'sm' })));
    if (sc.id === 's2' && (ph.id === 'diag' || ph.id === 'plank')) el.appendChild(h('p.fine', null, c.crackNote));
    if (sc.id === 's1' && ph.id === 'quiz') el.appendChild(h('p.fine', null, '答對的組別：在畫面點選組名即蓋真知章（再點可取消）。真知章不計入橋板。'));
    if (sc.id === 's4' && ph.id === 'bridge') el.appendChild(h('div.t-row', null, K.sbtn('觸發「' + c.resource.goalDone + '」動畫', function () { bridgeOpen(R, true); }, { icon: 'bridge', cls: 'sm' })));
  };

  /* ================= 環節一：知行投票 ================= */
  V['s0.open'] = function (R, sc, ph, stage) { K.home(R, stage); };
  function voteRatios(R) {
    var c = C(), self = !R.isClass();
    if (self) { var a = K.st(R, 'vt').me.a || {}; return c.vote.items.map(function (_, i) { return a[i] ? (a[i] === 'o' ? 0.12 : a[i] === 's' ? 0.6 : 1) : null; }); }
    var v = R.data('vote') || {};
    return c.vote.items.map(function (_, i) { var x = v[i] || {}, t = (x.o || 0) + (x.s || 0) + (x.r || 0); return t ? ((x.s || 0) + (x.r || 0)) / t : null; });
  }
  V['s0.vote'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.vote-v');
    w.appendChild(h('div.task-head', null, h('h2', null, '知行投票'), h('p.who', null, self ? c.ui.voteSelf : c.vote.anon)));
    var tb = h('div.vote-tb', { role: 'table', 'aria-label': '知行投票' });
    tb.appendChild(h('div.vt-row.vt-h', { role: 'row' }, h('span', { role: 'columnheader' }, '我知道……'), c.vote.options.map(function (o) { return h('span', { role: 'columnheader' }, o.name); })));
    var S = self ? K.st(R, 'vt') : null; if (S) S.me.a = S.me.a || {};
    var v = R.data('vote') || {};
    c.vote.items.forEach(function (it, i) {
      var row = h('div.vt-row', { role: 'row' }, h('span.vt-q', { role: 'cell' }, h('b', null, '①②③④⑤'[i]), it));
      c.vote.options.forEach(function (o) {
        if (self) {
          var on = S.me.a[i] === o.id;
          row.appendChild(h('span', { role: 'cell' }, h('button.vt-pick' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), 'aria-label': it + '：' + o.name, on: { click: function () { S.me.a[i] = o.id; S.save(); XC.audio.play('click'); R.rerender(); } } }, on ? ui.icon('check') : '')));
        } else {
          var x = v[i] || {};
          row.appendChild(h('span.vt-cnt', { role: 'cell' }, K.stepper(x[o.id] || 0, function (n) { var m = R.data('vote') || {}; m[i] = m[i] || {}; m[i][o.id] = n; R.data('vote', m); }, it + '：' + o.name + '人數', 60)));
        }
      });
      tb.appendChild(row);
    });
    w.appendChild(tb);
    w.appendChild(h('div.task-acts', null, K.sbtn('看裂縫地圖', function () { R.toPhase('map'); }, { icon: 'bridge', primary: true })));
    stage.appendChild(w);
  };
  V['s0.map'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), r = voteRatios(R);
    var ranked = r.map(function (x, i) { return [x == null ? -1 : x, i]; }).sort(function (a, b) { return b[0] - a[0]; });
    var top = ranked.filter(function (x) { return x[0] > 0; }).slice(0, 2).map(function (x) { return x[1]; });
    var w = h('div.map-v');
    w.appendChild(h('div.task-head', null, h('h2', null, self ? '我的裂縫地圖' : '全班裂縫地圖'), h('p.who', null, self ? '只存本機' : c.vote.anon)));
    var states = r.map(function (x) { return x == null ? 'faint' : (x >= 0.5 ? 'glow' : 'faint'); });
    var labels = {}; top.forEach(function (i) { labels[i] = '落差最大'; });
    w.appendChild(bridge({ states: states, widths: r.map(function (x) { return x == null ? 0.15 : 0.2 + x * 1.6; }), labels: labels, cls: 'map', alt: '裂縫地圖：分五段的橋，裂縫寬度表示落差' }));
    var lg = h('ol.map-legend');
    c.vote.items.forEach(function (it, i) {
      var x = r[i];
      lg.appendChild(h('li' + (top.indexOf(i) >= 0 ? '.top' : ''), null, h('b', null, '①②③④⑤'[i]), h('span', null, c.vote.short[i]),
        h('span.ml-bar', { 'aria-hidden': 'true' }, h('i', { style: { width: ((x || 0) * 100).toFixed(0) + '%' } })),
        h('small', null, x == null ? '未有數據' : (self ? ({ 0.12: '常常做到', 0.6: '有時做到', 1: '很少做到' })[x] : '落差 ' + Math.round(x * 100) + '%')),
        top.indexOf(i) >= 0 ? h('span.ml-top', null, '落差最大') : null));
    });
    w.appendChild(lg);
    w.appendChild(h('p.fine.center', null, c.vote.mapNote));
    stage.appendChild(w);
  };
  V['s0.announce'] = function (R, sc, ph, stage) {
    var c = C();
    var bag = h('div.kit-bag', null, h('span.kb-ico', { html: ui.icon('bridge') }), h('b', null, '工程隊任務袋'),
      h('p', null, '角色牌 4 張・情境卡 1 張・裂縫卡 4 張・橋板便利貼至少 3 張・穩度牌・真知／未真知牌各 1 張'));
    stage.appendChild(bag);
    K.roles(R, stage);
  };

  /* ================= 環節二：真假知行 ================= */
  function cdRing(sec, left) {
    var f = Math.max(0, left / sec), r = 26, L2 = 2 * Math.PI * r;
    return '<svg viewBox="0 0 64 64" class="cd-ring" aria-hidden="true"><circle cx="32" cy="32" r="' + r + '" class="cd-bg"/><circle cx="32" cy="32" r="' + r + '" class="cd-fg" stroke-dasharray="' + L2.toFixed(1) + '" stroke-dashoffset="' + (L2 * (1 - f)).toFixed(1) + '"/></svg>';
  }
  V['s1.quiz'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var Q = self ? K.st(R, 'qz') : null; if (Q) Q.me.a = Q.me.a || {};
    var qi = self ? (Q.me.i || 0) : (R.data('qi') || 0), q = c.quiz[qi];
    var shown = self ? !!Q.me.a[qi] : !!(R.data('qShown') || {})[qi];
    var w = h('div.quiz-v');
    w.appendChild(h('div.task-head', null, h('h2', null, '真假知行'), self ? null : h('p.who', null, '逐句：商量 10 秒 → 同時亮牌 → 揭曉'), hintRow(R, 'quiz')));
    var dots = h('ol.q-dots', { 'aria-label': '六句案例' });
    c.quiz.forEach(function (x, i) {
      var st = self ? (Q.me.a[i] ? (x.answer === 'd' ? 'dd' : (Q.me.a[i] === x.answer ? 'ok' : 'no')) : '') : ((R.data('qShown') || {})[i] ? 'ok' : '');
      dots.appendChild(h('li', null, h('button.q-dot' + (i === qi ? '.cur' : '') + (st ? '.' + st : ''), { type: 'button', 'aria-label': '第' + (i + 1) + '句', on: { click: function () { goQ(i); } } }, String(i + 1))));
    });
    w.appendChild(dots);
    var card = h('div.q-card.card' + (shown ? '.shown' : ''), null, h('span.q-no', null, '案例 ' + '①②③④⑤⑥'[qi] + (q.answer === 'd' ? '（討論題）' : '')), h('p.q-text', null, q.text));
    var ansLab = c.quizNames[q.answer];
    if (shown) card.appendChild(h('div.q-ans.' + q.answer, null, h('span.q-seal', null, ansLab), self || q.answer === 'd' ? h('p', null, q.why) : null));
    w.appendChild(card);
    if (self) {
      var mine = Q.me.a[qi];
      var row = h('div.q-picks');
      if (q.answer === 'd') {
        row.appendChild(h('p.ask', null, '討論題（不計分）：這是「做不到」，還是「不去做」？'));
        row.appendChild(K.sbtn(shown ? '已看解說' : '看解說', function () { Q.me.a[qi] = 'd'; Q.save(); R.rerender(); }, { icon: 'eye', primary: !shown }));
      } else ['t', 'f'].forEach(function (k) {
        row.appendChild(h('button.q-pick.card.' + k + (mine === k ? '.chosen' : ''), { type: 'button', disabled: (mine && mine !== k) || null, 'aria-pressed': String(mine === k), on: { click: function () {
          if (Q.me.a[qi]) return; Q.me.a[qi] = k; Q.save();
          var ok = k === q.answer; XC.audio.play(ok ? 'stamp' : 'flip');
          if (ok) { var stp = h('span.q-stamp-fx', { html: ui.icon('seal') }); w.appendChild(stp); setTimeout(function () { stp.remove(); }, 1200); }
          checkSelfBadge(R); R.rerender();
        } } }, h('b', null, c.quizNames[k]), mine === k ? h('small', null, k === q.answer ? '答對：得真知章' : '再想想：看看解說') : null));
      });
      w.appendChild(row);
      var sc5 = selfScore(R);
      w.appendChild(h('p.fine.center', null, '計分題答對 ' + sc5.ok + '／5' + (sc5.ok >= 4 ? '：已得「真知者」' : '（答對 4 題或以上得「真知者」）') + '。' + c.quizWhyNote));
    } else {
      var mt = K.miniT(R, 'q' + qi, c.quizSec, '商量');
      var acts = h('div.task-acts.q-acts', null, mt, K.sbtn(shown ? '已揭曉' : c.ui.show, function () { var m = R.data('qShown') || {}; m[qi] = true; R.data('qShown', m); XC.audio.play('flip'); R.rerender(); }, { icon: 'eye', primary: !shown, disabled: shown }));
      w.appendChild(acts);
      if (shown && q.answer !== 'd') {
        var all = R.data('stamp') || {};
        var grid = h('div.q-groups', null, h('span.qg-l', null, c.ui.right));
        St.groups().forEach(function (g) {
          var on = !!(all[g.id] || {})['q' + qi];
          grid.appendChild(h('button.gchip' + (on ? '.cur' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () {
            var m = R.data('stamp') || {}; m[g.id] = m[g.id] || {}; m[g.id]['q' + qi] = !on; R.data('stamp', m);
            if (!on) { XC.audio.play('stamp'); ui.announce(g.name + ' 得真知章'); }
            R.refreshStrip(); R.rerender();
          } } }, on ? h('span', { html: ui.icon('seal') }) : null, g.name));
        });
        w.appendChild(grid);
      } else if (shown) w.appendChild(h('p.notice', null, '討論題，不計分：這是做不到，不一定是不去做。'));
    }
    w.appendChild(h('div.task-acts', null, qi > 0 ? K.sbtn(c.ui.prevQ, function () { goQ(qi - 1); }, { icon: 'prev', cls: 'sm' }) : null, qi < c.quiz.length - 1 ? K.sbtn(c.ui.nextQ, function () { goQ(qi + 1); }, { icon: 'play', cls: 'sm', primary: shown }) : null));
    stage.appendChild(w);
    function goQ(i) { if (self) { Q.me.i = i; Q.save(); } else R.data('qi', i); R.rerender(); }
  };
  function selfScore(R) { var c = C(), a = K.st(R, 'qz').me.a || {}, ok = 0; c.quiz.forEach(function (q, i) { if (q.answer !== 'd' && a[i] === q.answer) ok++; }); return { ok: ok }; }
  function checkSelfBadge(R) { if (selfScore(R).ok >= 4 && R.rec('me').badges.indexOf('zhenzhi') < 0) R.award('me', 'zhenzhi'); }
  V['s1.write'] = function (R, sc, ph, stage) {
    var c = C();
    var w = h('div.zx-v');
    var big = h('div.zx-big', { lang: 'zh-HK', 'aria-label': '知行合一' });
    '知行合一'.split('').forEach(function (ch, i) { big.appendChild(h('span', { style: { animationDelay: (0.2 + i * 0.7) + 's' } }, ch)); });
    w.appendChild(big);
    w.appendChild(h('p.zx-sub', null, '知而不行，只是未知', h('small', null, '（白話濃縮）')));
    w.appendChild(h('div.zx-links', null, c.revealLinks.map(function (l, i) { return h('div.zx-link.card', { style: { animationDelay: (3.2 + i * 0.4) + 's' } }, h('b', null, l.k), h('span', null, l.v)); })));
    w.appendChild(h('p.notice.zx-note', null, c.revealNote));
    w.appendChild(K.sbtn('重播書寫', function () { R.rerender(); }, { icon: 'brush', cls: 'sm' }));
    stage.appendChild(w);
    if (!XC.fx.reduced()) [0, 1, 2, 3].forEach(function (i) { setTimeout(function () { XC.audio.play('flip'); }, 200 + i * 700); });
  };

  /* ================= 環節三：知行橋工程 ================= */
  function assign(R) { var m = {}; St.groups().forEach(function (g, i) { m[g.id] = 'ABC'[i % 3]; }); R.data('scOf', m); XC.audio.play('flip'); R.rerender(); ui.announce('已平均分配情境 A、B、C'); }
  function scArt(look) {
    if (look === 'phone') return '<svg viewBox="0 0 120 90" class="sc-art" aria-hidden="true"><rect x="38" y="6" width="44" height="78" rx="7" class="ink"/><rect x="42" y="16" width="36" height="56" class="paper"/><rect x="45" y="22" width="26" height="9" rx="3" class="bub"/><rect x="45" y="35" width="30" height="13" rx="3" class="bub warn"/><rect x="51" y="52" width="24" height="7" rx="3" class="bub me"/><circle cx="60" cy="78" r="2.5" class="ink"/><path d="M84 60c8-2 14 2 16 8l-10 6" class="hand"/></svg>';
    if (look === 'corridor') return '<svg viewBox="0 0 120 90" class="sc-art" aria-hidden="true"><path d="M8 84L40 20h40l32 64" class="line"/><path d="M40 20v52M80 20v52" class="line thin"/><g class="ink"><circle cx="52" cy="40" r="4"/><path d="M47 62c0-12 2-17 5-18 3 1 5 6 5 18z"/><circle cx="66" cy="38" r="4"/><path d="M61 60c0-12 2-17 5-18 3 1 5 6 5 18z"/></g><g class="lone"><circle cx="90" cy="50" r="5"/><path d="M84 78c0-15 3-21 6-22 3 1 6 7 6 22z"/></g></svg>';
    return '<svg viewBox="0 0 120 90" class="sc-art" aria-hidden="true"><rect x="10" y="12" width="56" height="66" rx="3" class="paper ink-s"/><path d="M10 26h56" class="line"/>' + [0, 1, 2, 3, 4].map(function (i) { return '<rect x="' + (14 + i * 10.5) + '" y="34" width="8" height="8" class="cell' + (i === 3 ? ' thu' : '') + '"/>'; }).join('') + '<circle cx="51.5" cy="38" r="8" class="circ"/><rect x="74" y="30" width="38" height="48" class="paper ink-s"/><path d="M80 40h26M80 48h18" class="line thin"/><path d="M80 56h8" class="line thin dash"/></svg>';
  }
  function scFig(s, mini) {
    return h('figure.sc-fig.card' + (mini ? '.mini' : ''), { 'data-sc': s.id }, h('div.sc-art-w', { role: 'img', 'aria-label': s.alt, html: scArt(s.look) }),
      s.bubble && !mini ? h('p.sc-bub', null, '「' + s.bubble + '」') : null,
      h('figcaption', null, h('span.case-id', null, '情境 ' + s.id), h('b', null, '「' + s.name + '」'), h('p', null, s.text), h('small.fine', null, '（情境均為虛構）')));
  }
  function needSc(R, stage) {
    if (R.isClass() || scOf(R)) return false;
    stage.appendChild(h('div.panel.panel-paper.center', null, h('p', null, '先在「情境卡」選一個情境，再做這一步。'), K.sbtn('前往情境卡', function () { R.toPhase('scen'); }, { icon: 'prev', primary: true })));
    return true;
  }
  function scStrip(R) { var s = scById(scOf(R)); return s ? h('div.case-strip', null, h('span.case-id', null, '情境 ' + s.id + '「' + s.name + '」'), h('span', null, s.text)) : null; }
  V['s2.scen'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.cases-v');
    w.appendChild(K.head(R, '情境卡'));
    var row = h('div.case-row3');
    c.scenarios.forEach(function (s) {
      var fig = scFig(s);
      if (self) {
        var on = scOf(R) === s.id; if (on) fig.classList.add('chosen');
        fig.appendChild(K.sbtn(on ? '我選了這一個' : c.ui.pick, function () { var S = K.st(R, 'sc'); S.me.sc = s.id; S.save(); XC.audio.play('flip'); R.rerender(); }, { icon: on ? 'check' : 'bridge', primary: on, cls: 'sm' }));
      } else {
        var gs = St.groups().filter(function (g) { return scOf(R, g.id) === s.id; });
        fig.appendChild(h('div.cf-groups', null, h('small', null, '負責組別（' + gs.length + '）：'), gs.map(function (g) {
          return h('button.gchip' + (g.id === R.sel ? '.cur' : ''), { type: 'button', title: '點一下改派到下一個情境', on: { click: function () { var m = R.data('scOf') || {}; St.groups().forEach(function (x) { if (!m[x.id]) m[x.id] = scOf(R, x.id); }); m[g.id] = 'ABC'[('ABC'.indexOf(m[g.id]) + 1) % 3]; R.data('scOf', m); R.rerender(); } } }, g.name);
        })));
      }
      row.appendChild(fig);
    });
    w.appendChild(row);
    if (!self) w.appendChild(h('div.task-acts', null, K.sbtn(c.ui.assign, function () { assign(R); }, { icon: 'dice' }), h('span.fine', null, '點組別可改派；確保每個情境有 2 至 3 組負責。')));
    else w.appendChild(h('p.fine.center', null, '自學模式：選一個情境，完成診斷、橋板和一句架橋版對白。'));
    stage.appendChild(w);
  };
  V['s2.diag'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    if (needSc(R, stage)) return;
    var all = R.data('eng') || {}, g = R.cur(); all[g] = all[g] || {}; var me = all[g]; me.k = me.k || [];
    var save = function () { R.data('eng', all); };
    var w = h('div.diag-v');
    w.appendChild(h('div.step-head', null, K.head(R, '①診斷裂縫', null, hintRow(R, 'crack')), h('div.step-bar', null, h('span.fine', null, '選出最大的兩條（' + me.k.length + '／2）'), K.miniT(R, 'diag', 120, '診斷倒數')), scStrip(R)));
    var body = h('div.cs-body');
    var cards = h('div.crack-cards');
    c.crackCards.forEach(function (k) {
      var on = me.k.indexOf(k.id) >= 0;
      cards.appendChild(h('button.crack-card.card' + (on ? '.chosen' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () {
        var i = me.k.indexOf(k.id);
        if (i >= 0) me.k.splice(i, 1); else { if (me.k.length >= 2) { ui.toast('只選兩條：先取消一張'); return; } me.k.push(k.id); }
        save(); XC.audio.play('flip'); R.rerender();
      } } }, h('span.cc-art', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 60 40"><path d="M30 2l-5 9 7 7-6 9 5 11" /></svg>' }), h('b', null, k.name), k.note ? h('small', null, '（' + k.note + '）') : null));
    });
    var gs = groupBridgeState(R, g);
    body.appendChild(h('div.diag-left', null, h('p.fine', null, '裂縫卡：被選中的裂縫在橋上透出金光。'), cards));
    body.appendChild(h('div.diag-right', null, bridge({ states: gs.states, planks: gs.planks, labels: gs.labels, cls: 'grp', walker: false })));
    w.appendChild(body);
    if (self) w.appendChild(ui.field({ label: c.ui.crackReason, value: me.reason || '', rows: 2, minHint: true, chips: R.support ? ['我怕……，所以……', '我跟自己說……，所以一直拖', '我不知道第一步要……'] : null, onInput: function (v) { me.reason = v; save(); } }));
    else w.appendChild(h('p.fine.center', null, '為 ' + R.gname() + ' 點選兩張裂縫卡（記錄員同時記在筆記上）。'));
    stage.appendChild(w);
  };
  function testerTips(text, idx) {
    var T = C().tester, t = text || '', out = [];
    if (!t.trim()) return out;
    var vg = K.vague(t, T.vague); if (vg.length) out.push('含「' + vg.join('、') + '」：' + T.vagueTip);
    if (idx === 1 && !T.people.some(function (p) { return t.indexOf(p) >= 0; })) out.push(T.peopleTip);
    if (idx === 2 && !T.marks.some(function (p) { return t.indexOf(p) >= 0; })) out.push(T.marksTip);
    return out;
  }
  V['s2.plank'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    if (needSc(R, stage)) return;
    var g = R.cur(), P = K.st(R, 'pk'), pk = P.me;
    var T = K.st(R, 'pt'), tx = T.me;
    var w = h('div.plank-v');
    w.appendChild(h('div.step-head', null, K.head(R, '②橋板與排練', null, hintRow(R, 'plank')), h('div.step-bar', null, h('span.fine', null, '橋板 ' + planksOf(R, g) + '／3'), K.miniT(R, 'plank', 240, '設計倒數')), scStrip(R)));
    var body = h('div.cs-body');
    var left = h('div.plank-left');
    c.planks.forEach(function (p, i) {
      var done = !!pk[p.id];
      var row = h('div.plank-row' + (done ? '.done' : ''), null, h('span.pl-wood.plank-src', { 'aria-hidden': 'true' }, '①②③'[i]));
      var tipBox = h('p.tester-tip', { 'aria-live': 'polite' });
      function showTips(v) { var tp = testerTips(v, i); tipBox.textContent = tp.length ? '測試員：' + tp.join(' ') : (v && v.trim() ? c.tester.ok : ''); tipBox.classList.toggle('ok', !tp.length && !!(v && v.trim())); }
      var fl = ui.field({ label: p.name + '（' + p.help + '）', value: tx[p.id] || '', rows: 2, max: 80, placeholder: p.ph, chips: R.support ? [p.ph.replace(/^例：/, '')] : null, onInput: function (v) { tx[p.id] = v; T.save(); showTips(v); } });
      row.appendChild(h('div.pl-body', null, fl, tipBox));
      showTips(tx[p.id]);
      row.appendChild(K.sbtn(done ? c.ui.plankDone : c.ui.plankPut, function () {
        if (pk[p.id]) return;
        if (self && !K.has(tx[p.id], 2)) { ui.toast('先寫好這塊橋板：' + p.help); return; }
        K.award(R, 'pk', p.id, 1, '橋板：' + p.name);
        XC.audio.play('drop'); R.rerender();
      }, { icon: done ? 'check' : 'plus', primary: !done, disabled: done, cls: 'sm' }));
      left.appendChild(row);
    });
    left.appendChild(h('p.fine', null, c.tester.note));
    var gs = groupBridgeState(R, g);
    var right = h('div.plank-right', null, bridge({ states: gs.states, planks: gs.planks, labels: gs.labels, cls: 'grp', walker: false }));
    if (!self) {
      var reh = h('div.rehearse', null, h('b', null, '排練計時'));
      c.rehearse.forEach(function (r, i) { reh.appendChild(h('div.rh-row', null, K.miniT(R, 'reh' + i, r.sec, r.name))); });
      right.appendChild(reh);
    }
    body.appendChild(left); body.appendChild(right); w.appendChild(body);
    stage.appendChild(w);
  };
  function starRow(avg) {
    var s = h('span.ink-stars', { 'aria-label': '穩度 ' + (avg ? avg.toFixed(1) : '—') + ' 星' });
    for (var i = 1; i <= 3; i++) { var f = avg ? Math.max(0, Math.min(1, avg - i + 1)) : 0; s.appendChild(h('i', { style: { '--f': f.toFixed(2) }, html: ui.icon('star') })); }
    return s;
  }
  V['s2.stage'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.stage-v');
    if (self) {
      if (needSc(R, stage)) return;
      var S = K.st(R, 'pt'), me = S.me; me.rate = me.rate || {};
      w.appendChild(h('div.task-head', null, h('h2', null, '③架橋版對白'), scStrip(R)));
      var box = K.panel('dlg-box', true);
      box.appendChild(ui.field({ label: c.dialogueLabel, value: me.dlg || '', rows: 2, max: 120, placeholder: '「……」', onInput: function (v) { me.dlg = v; S.save(); } }));
      box.appendChild(h('p', null, h('b', null, '自評穩度牌（只存本機）：')));
      c.stars.criteria.forEach(function (cr, i) {
        var row = h('div.sr-row', null, h('span', null, cr));
        [1, 2, 3].forEach(function (n) { row.appendChild(h('button.star-b' + ((me.rate[i] || 0) >= n ? '.on' : ''), { type: 'button', 'aria-label': cr + ' ' + n + ' 星', 'aria-pressed': String(me.rate[i] === n), on: { click: function () { me.rate[i] = n; S.save(); R.rerender(); } }, html: ui.icon('star') })); });
        box.appendChild(row);
      });
      var vals = Object.keys(me.rate).map(function (k) { return me.rate[k]; });
      if (vals.length) box.appendChild(h('p.center', null, '我的橋穩度：', starRow(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length)));
      box.appendChild(h('p.fine', null, c.stars.note));
      w.appendChild(box);
      stage.appendChild(w); return;
    }
    w.appendChild(h('div.task-head', null, h('h2', null, '③演出與穩度牌'), h('p.who', null, c.stars.note)));
    w.appendChild(h('ol.crit', null, c.stars.criteria.map(function (cr) { return h('li', null, cr); })));
    var stars = R.data('stars') || {};
    var cols = h('div.rep-cols');
    c.scenarios.forEach(function (s) {
      var d = stars[s.id] = stars[s.id] || {}, gs = St.groups().filter(function (g) { return scOf(R, g.id) === s.id; });
      var n1 = d.n1 || 0, n2 = d.n2 || 0, n3 = d.n3 || 0, tot = n1 + n2 + n3, avg = tot ? (n1 + 2 * n2 + 3 * n3) / tot : 0;
      var col = h('div.rep-col.card', null, h('span.case-id', null, '情境 ' + s.id), h('b', null, '「' + s.name + '」'), K.miniT(R, 'perf' + s.id, 120, '演出'),
        h('div.cf-groups', null, h('small', null, c.ui.perfGroup + '：'), gs.map(function (g) { return h('button.gchip' + (d.g === g.id ? '.cur' : ''), { type: 'button', 'aria-pressed': String(d.g === g.id), on: { click: function () { d.g = g.id; R.data('stars', stars); R.rerender(); } } }, g.name); })),
        h('p.fine', null, c.ui.starsIn));
      var ins = h('div.st-ins'); col.appendChild(ins);
      [1, 2, 3].forEach(function (n) { ins.appendChild(h('div.st-in', null, h('span', null, Array(n + 1).join('★')), K.stepper(d['n' + n] || 0, function (v) { d['n' + n] = v; R.data('stars', stars); R.rerender(); }, s.name + n + '星組數', 30))); });
      col.appendChild(h('div.stab', null, h('span', null, '穩度'), starRow(avg), h('b', null, tot ? avg.toFixed(1) : '—')));
      cols.appendChild(col);
    });
    w.appendChild(cols);
    stage.appendChild(w);
  };
  V['s2.sum'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.report-v');
    w.appendChild(h('div.scene-quote', null, h('span.sq-tag', null, '教師歸納'), h('p', null, '橋板越小越具體，越容易走過去。')));
    if (self) {
      var tx = K.st(R, 'pt').me, d = gdata(R, 'me'), s = scById(scOf(R) || 'A');
      w.appendChild(h('dl.recap.card', null,
        h('dt', null, '情境'), h('dd', null, s ? '「' + s.name + '」' : '—'),
        h('dt', null, '最大的兩條裂縫'), h('dd', null, (d.k || []).map(function (id) { return c.crackCards.filter(function (k) { return k.id === id; })[0].name; }).join('、') || '—'),
        c.planks.map(function (p) { return [h('dt', null, p.name), h('dd', null, tx[p.id] || '—')]; }),
        h('dt', null, '架橋版對白'), h('dd', null, tx.dlg || '—')));
    } else {
      var ex = R.data('extraPk') || [];
      var inp = h('input.inp', { type: 'text', maxlength: 40, placeholder: '其他組補充的橋板', 'aria-label': '其他組補充的橋板' });
      w.appendChild(h('div.panel.panel-paper', null, h('h3', null, c.ui.addPlank), h('ul.rep-add', null, ex.map(function (t) { return h('li', null, t); })),
        h('div.t-row', null, inp, K.sbtn('貼上', function () { var v = inp.value.trim(); if (!v) return; ex.push(v); R.data('extraPk', ex); R.refreshStrip(); XC.audio.play('drop'); R.rerender(); }, { icon: 'plus', cls: 'sm' })),
        h('p.fine', null, '補充的橋板計入全班橋海報（不計入任何一組）。')));
    }
    stage.appendChild(w);
  };

  /* ================= 環節四：承諾挑戰 ================= */
  function tableOpts(R) {
    var t = C().table;
    return { key: 'tb', boxKey: 'table', title: t.title, en: t.en, savedMsg: '知行對照表已存入回顧盒',
      fields: [{ id: 'l1', label: t.left + '（一）' }, { id: 'r1', label: t.right + '（一）' }, { id: 'l2', label: t.left + '（二）' }, { id: 'r2', label: t.right + '（二）' }],
      extra: [{ id: 'gap', label: '圈出的落差', value: function (me) { return me.v.gap ? '第' + (me.v.gap === '1' ? '一' : '二') + '行' : ''; } }, { id: 'exit', label: C().exit }] };
  }
  V['s3.explain'] = function (R, sc, ph, stage) {
    var c = C(), t = c.table, w = h('div.explain');
    w.appendChild(h('h2.center', null, t.title, h('small.en', { lang: 'en' }, ' ' + t.en), '　＋　', c.promise.envelope));
    var cols = h('div.ex-cols.four');
    [['①', t.left, '寫 2 條'], ['②', t.right, '老實寫'], ['③', '圈出一項落差', '只圈給自己看'], ['④', '承諾', '小到做得到：做什麼、第一步、完成標記']].forEach(function (x) { cols.appendChild(h('div.ex-col.card', null, h('span.ex-n', null, x[0]), h('b', null, x[1]), h('p', null, x[2]))); });
    w.appendChild(cols);
    w.appendChild(h('div.ex-sc', null, h('b', null, '句式支架：'), t.scaffolds.map(function (s) { return h('span.chip.static', null, s); })));
    w.appendChild(h('p.fine.center', null, c.promise.privacy));
    stage.appendChild(w);
  };
  function envState(R) { return (St.box().l3 || {}).envelope || null; }
  V['s3.table'] = function (R, sc, ph, stage) {
    var c = C(), t = c.table, pr = c.promise, self = !R.isClass();
    var S = K.st(R, 'tb'), me = S.me; me.v = me.v || {};
    var w = h('div.tb-v');
    w.appendChild(h('div.task-head', null, h('h2', null, t.title), h('p.who', null, self ? t.gapHint : '課堂上同學填寫實體知行對照表；此畫面可作示範。'), hintRow(R, 'table')));
    var nm = h('input.inp', { type: 'text', maxlength: 20, placeholder: XC.content.common.ui.namePH, 'aria-label': '名字：' + XC.content.common.ui.namePH, value: me.name || '' });
    nm.oninput = function () { me.name = nm.value; S.save(); };
    w.appendChild(h('label.fld.inline', null, h('span.fld-l', null, '名字'), nm));
    var grid = h('div.kd-grid', { role: 'table', 'aria-label': t.title });
    grid.appendChild(h('div.kd-row.kd-h', { role: 'row' }, h('span', { role: 'columnheader' }, t.left), h('span', { role: 'columnheader' }, t.right), h('span', { role: 'columnheader' }, '落差')));
    ['1', '2'].forEach(function (n, i) {
      var circ = me.v.gap === n;
      var row = h('div.kd-row' + (circ ? '.circled' : ''), { role: 'row' });
      row.appendChild(h('div', { role: 'cell' }, ui.field({ label: t.left + '（' + '一二'[i] + '）', value: me.v['l' + n] || '', rows: 2, max: 80, placeholder: t.leftPH[i], onInput: function (v) { me.v['l' + n] = v; S.save(); } })));
      row.appendChild(h('div', { role: 'cell' }, ui.field({ label: t.right + '（' + '一二'[i] + '）', value: me.v['r' + n] || '', rows: 2, max: 80, placeholder: t.rightPH[i], onInput: function (v) { me.v['r' + n] = v; S.save(); } })));
      row.appendChild(h('div.kd-c', { role: 'cell' }, h('button.ink-circle-b' + (circ ? '.on' : ''), { type: 'button', 'aria-pressed': String(circ), 'aria-label': '圈出第' + '一二'[i] + '行的落差', on: { click: function () { me.v.gap = circ ? '' : n; S.save(); XC.audio.play('flip'); R.rerender(); } } },
        h('span', { html: '<svg viewBox="0 0 60 40" aria-hidden="true"><path class="ic-path" d="M30 4c16 0 27 6 26 15S42 36 27 36 3 30 4 20 16 3 34 5"/></svg>' }), circ ? '已圈' : '圈出')));
      grid.appendChild(row);
    });
    w.appendChild(grid);
    var env = envState(R);
    var pbox = K.panel('promise-box');
    pbox.appendChild(h('h3', null, h('span', { html: ui.icon('envelope') }), '承諾（將放進信封）'));
    if (env && env.sealed && !me.rewrite) {
      pbox.appendChild(h('p.notice', null, pr.sealed));
      pbox.appendChild(K.sbtn(pr.rewrite, function () { ui.confirm('寫新的承諾會取代已封存的信封。確定？', '重寫').then(function (ok) { if (ok) { me.rewrite = true; me.p = {}; S.save(); R.rerender(); } }); }, { icon: 'reset', cls: 'sm' }));
    } else {
      me.p = me.p || {};
      pr.fields.forEach(function (f, i) {
        var tip = h('p.tester-tip', { 'aria-live': 'polite' });
        var fl = ui.field({ label: f.label, value: me.p[f.id] || '', rows: 2, max: 100, placeholder: f.ph, chips: R.support ? [f.ph] : null, onInput: function (v) { me.p[f.id] = v; S.save(); tips(v); } });
        function tips(v) { var o = []; if (i === 0 && K.vague(v, pr.bigWords).length) o.push(pr.bigTip); if (!o.length) o = o.concat(testerTips(v, i === 2 ? 2 : (i === 1 ? 0 : -1)).filter(function (x) { return x !== C().tester.peopleTip; })); tip.textContent = o.join(' '); }
        tips(me.p[f.id]);
        pbox.appendChild(fl); pbox.appendChild(tip);
      });
    }
    w.appendChild(pbox);
    w.appendChild(K.cardActs(R, tableOpts(R)));
    if (self) w.appendChild(K.safety());
    stage.appendChild(w);
  };
  V['s3.check'] = function (R, sc, ph, stage) {
    var c = C(), pr = c.promise, self = !R.isClass();
    var S = K.st(R, 'tb'), me = S.me; me.ck = me.ck || {};
    var w = h('div.check-v');
    w.appendChild(h('h2.center', null, '橋板三問互檢'));
    var cards = h('div.three-q');
    pr.checks.forEach(function (q, i) {
      var on = !!me.ck[i];
      cards.appendChild(h('button.tq-card.card' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { me.ck[i] = !on; S.save(); XC.audio.play(on ? 'click' : 'stamp'); R.rerender(); } } },
        h('span.tq-ico', { html: ui.icon(['hourglass', 'support', 'check'][i]) }), h('b', null, q), h('small', null, on ? '通過' : '點一下表示通過')));
    });
    w.appendChild(cards);
    if (self) {
      var p = me.p || {};
      w.appendChild(h('dl.recap.card', null, pr.fields.map(function (f) { return [h('dt', null, f.label), h('dd', null, p[f.id] || '—')]; })));
      w.appendChild(ui.field({ label: pr.witness, multi: false, max: 20, noCount: true, value: me.witness || '', onInput: function (v) { me.witness = v; S.save(); } }));
      w.appendChild(h('p.fine.center', null, '自學時可請家人或朋友當見證人，也可以留空。'));
    } else w.appendChild(h('p.fine.center', null, '兩人互相檢查；三問都通過後，見證人在承諾上簽名（化名或縮寫）。'));
    stage.appendChild(w);
  };
  function innerCard(R, blank) {
    var pr = C().promise, me = K.st(R, 'tb').me, p = blank ? {} : (me.p || {});
    return { kicker: '第3節《知行橋工程隊》承諾信封內頁', title: pr.envelope, en: pr.envelopeEn, lit: true,
      fields: pr.fields.map(function (f) { return { label: f.label, value: p[f.id] || '' }; }).concat([{ label: pr.witness, value: blank ? '' : (me.witness || '') }, { label: '第4節回報：完成／部分完成／未完成；原因', value: '' }]),
      footer: XC.content.common.siteTitle + (!blank && me.name ? '｜' + me.name : '') };
  }
  function envelopeEl(name, sealed) {
    return h('div.envelope' + (sealed ? '.sealed' : ''), { role: 'img', 'aria-label': sealed ? '已封存的承諾信封' : '承諾信封' },
      h('div.env-back'), h('div.env-letter', null, h('i'), h('i'), h('i')), h('div.env-front'), h('div.env-flap'),
      h('div.env-seal', { html: ui.icon('seal') }), h('div.env-name', null, name || ''));
  }
  V['s3.seal'] = function (R, sc, ph, stage) {
    var c = C(), pr = c.promise, self = !R.isClass();
    var S = K.st(R, 'tb'), me = S.me; me.p = me.p || {};
    var env = envState(R), sealed = self && env && env.sealed && !me.rewrite;
    var w = h('div.seal-v');
    var el = envelopeEl(sealed ? env.name : (me.name || ''), sealed);
    w.appendChild(el);
    var p = K.panel('seal-box', true);
    if (self) {
      if (sealed) {
        p.appendChild(h('p.big', null, pr.sealed));
        p.appendChild(h('p.fine', null, '封存時間：' + new Date(env.sealedAt).toLocaleString('zh-HK') + '。可在回顧盒看到這封信封（內容不顯示）。'));
      } else {
        var nm = h('input.inp', { type: 'text', maxlength: 20, placeholder: XC.content.common.ui.namePH, 'aria-label': '信封上的名字：' + XC.content.common.ui.namePH, value: me.name || '' });
        nm.oninput = function () { me.name = nm.value; S.save(); el.querySelector('.env-name').textContent = nm.value; };
        p.appendChild(h('label.fld.inline', null, h('span.fld-l', null, '信封上的名字'), nm));
        p.appendChild(h('div.task-acts', null,
          K.sbtn(pr.sealBtn, function () {
            if (!K.has(me.p.what, 2) || !K.has(me.p.step, 2)) { ui.toast('先在「知行對照表」寫好承諾和第一步，再封存。', 3600); return; }
            seal(R, el);
          }, { icon: 'envelope', primary: true }),
          K.sbtn(pr.printInner, function () { XC.export.printCard(innerCard(R)); }, { icon: 'print' })));
      }
      p.appendChild(h('p.fine', null, pr.privacy));
    } else {
      p.appendChild(h('p.big', null, '把承諾放進信封、封口、寫上名字（化名可），交給老師。'));
      p.appendChild(h('div.task-acts', null, K.sbtn('示範封存動畫', function () { el.classList.remove('sealed'); void el.offsetWidth; el.classList.add('sealing'); XC.audio.play('stamp'); setTimeout(function () { el.classList.add('sealed'); }, 1600); }, { icon: 'envelope', primary: true }),
        K.sbtn('列印信封內頁（空白）', function () { XC.export.printCard(innerCard(R, true)); }, { icon: 'print' })));
      p.appendChild(h('p.fine', null, pr.privacy + ' ' + c.badgeNext));
    }
    w.appendChild(p);
    stage.appendChild(w);
  };
  function seal(R, el) {
    var pr = C().promise, S = K.st(R, 'tb'), me = S.me;
    var fields = pr.fields.map(function (f) { return { label: f.label, value: me.p[f.id] || '' }; }).concat([{ label: pr.witness, value: me.witness || '' }]);
    St.saveBoxItem('l3', 'envelope', { type: 'envelope', title: pr.envelope, sealed: true, openVia: 'l4', card: false, name: me.name || '', sealedAt: Date.now(), fields: fields, footer: me.name || '' });
    /* 封存後，草稿中的承諾內容一併移除：第4節開封才看得到 */
    me.p = {}; me.witness = ''; me.ck = {}; me.rewrite = false; S.save();
    el.classList.add('sealing'); XC.audio.play('flip');
    setTimeout(function () { XC.audio.play('stamp'); }, 1100);
    setTimeout(function () { el.classList.add('sealed'); XC.fx.burst(R.stageWrap); ui.announce('承諾已封存，第4節開封'); }, 1500);
    setTimeout(function () { R.rerender(); }, 2600);
  }

  /* ================= 環節五：橋通結算 ================= */
  V['s4.bridge'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), P = poster(R), open = P.f >= 1 && R.data('open');
    var w = h('div.poster-v' + (open ? '.open' : ''));
    w.appendChild(h('h2.center', null, self ? '我的知行橋' : '全班橋海報', h('small', null, '　橋板 ' + P.p + '／' + P.t)));
    var ps = posterStates(P.f);
    var b = bridge({ states: ps.states, planks: ps.planks, walker: open ? 'end' : 'start', cls: 'poster', alt: '全班橋海報：知岸與行岸之間的石拱橋' });
    b.classList.add('plank-target');
    w.appendChild(b);
    if (!self) {
      var row = h('div.poster-groups');
      St.groups().forEach(function (g) { var n = planksOf(R, g.id); row.appendChild(h('span.pg' + (n >= 3 ? '.full' : ''), null, h('b', null, g.name), h('span.g-planks', null, [0, 1, 2].map(function (i) { return h('i' + (i < n ? '.on' : '')); })))); });
      var ex = (R.data('extraPk') || []).length; if (ex) row.appendChild(h('span.pg', null, h('b', null, '補充'), h('small', null, ex + ' 塊')));
      w.appendChild(row);
    }
    if (open) w.appendChild(h('p.mv-line', null, sc.bridgeLine.zh, St.settings.englishSubs ? h('small.en', { lang: 'en' }, sc.bridgeLine.en) : null));
    w.appendChild(h('div.task-acts', null, K.sbtn(c.ui.goalBtn, function () { bridgeOpen(R); }, { icon: 'bridge', primary: true }),
      open ? K.sbtn('再走一次', function () { var bx = R.stage.querySelector('.bridge-box.poster'); var im = bx && bx.querySelector('.walker'); if (im) { im.setAttribute('x', 290); walk(bx); } }, { icon: 'play', cls: 'sm' }) : null));
    if (P.f < 1) w.appendChild(h('p.fine.center', null, self ? '三塊橋板貼好，橋就通了：可以回到「橋板與排練」完成。' : '仍欠 ' + (P.t - P.p) + ' 塊橋板（目標可在教師控制台修改；老師也可在教師面板手動觸發動畫）。'));
    stage.appendChild(w);
  };
  function bridgeOpen(R, force) {
    var P = poster(R);
    if (P.f < 1 && !force) { ui.toast('橋板已貼上海報；還欠 ' + (P.t - P.p) + ' 塊，橋就通了。'); XC.audio.play('drop'); return; }
    R.data('open', true);
    if (R.phase().id !== 'bridge') { XC.app.goalFx('l3'); return; }
    R.rerender();
    var bx = R.stage.querySelector('.bridge-box.poster');
    if (bx) { var im = bx.querySelector('.walker'); if (im) { im.setAttribute('x', 290); im.setAttribute('y', railY(330) - 110); } }
    XC.audio.play('chime');
    setTimeout(function () { walk(bx, function () { XC.fx.burst(R.stageWrap); if (R.isClass()) XC.app.goalFx('l3'); else ui.toast('知行橋貫通：由知岸走到行岸。'); }); }, 400);
  }
  V['s4.badges'] = function (R, sc, ph, stage) {
    var c = C();
    K.badges(R, stage, function (b) {
      if (b.id === 'zhenzhi' && selfScore(R).ok < 4) return '真假知行的計分題答對 4 題或以上，就會得到「真知者」。';
      if (b.id === 'zhuqiao' && planksOf(R, 'me') < 3) return '先在「橋板與排練」貼好三塊具體的橋板，就能得到「築橋者」。';
      return null;
    });
    if (R.isClass()) {
      var sug = St.groups().filter(function (g) { return stamps(R, g.id) >= 4; }).map(function (g) { return g.name; });
      stage.appendChild(h('p.fine.center', null, '參考：真知章 4 枚或以上的組別——' + (sug.length ? sug.join('、') : '暫未有') + '。' + c.badgeNext));
    } else stage.appendChild(h('p.fine.center', null, c.badgeNext));
  };
  V['s4.summary'] = function (R, sc, ph, stage) { K.summary(R, stage, sc.summary, '三句總結'); };
  V['s4.exit'] = function (R, sc, ph, stage) {
    var c = C();
    K.exit(R, stage, { key: 'tb', label: c.exit, chips: ['我今天發現我最大的裂縫是……'], preview: sc.nextPreview, quote: '知而必行，是為知行合一', classLead: '在知行對照表背面寫一句：',
      save: function () { K.saveCard(R, tableOpts(R)); }, saveLabel: '連同知行對照表存入回顧盒' });
  };
})();
