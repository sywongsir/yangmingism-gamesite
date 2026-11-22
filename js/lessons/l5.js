/* 第5節《根脈解碼局》古今契合大測試 ── 遊戲邏輯（文字全部取自 js/content/l5.js） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state, K = XC.kit;
  var C = function () { return XC.content.l5; };
  var L = XC.lessons.l5 = {};
  var V = {};
  var IMG = 'assets/img/l5/';
  var uid = 0;

  /* ---------- 共用 ---------- */
  function hintRow(R, key) { return R.isClass() ? null : K.hintRow(R, key); }
  function pool(R) {
    if (R.isClass()) { var t = R.target(), p = R.total(); return { p: p, t: t, f: Math.min(1, p / Math.max(1, t)) }; }
    var t2 = C().resource.selfTarget || 3, p2 = R.score('me');
    return { p: p2, t: t2, f: Math.min(1, p2 / t2) };
  }
  function leafIco(on) { return '<svg viewBox="0 0 24 24" class="leaf-ico' + (on ? ' on' : '') + '" aria-hidden="true"><path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"/><path d="M4 20L15 9" class="lv"/></svg>'; }
  function pairById(id) { return C().pairs.filter(function (p) { return p.id === id; })[0]; }
  function pairOf(R, gid) {
    if (R.isClass()) { gid = gid || R.sel; var m = R.data('pairOf') || {}; var idx = St.groups().map(function (g) { return g.id; }).indexOf(gid); return m[gid] || C().pairs[Math.max(0, idx) % 3].id; }
    return K.st(R, 'pk').me.p || null;
  }
  function assignPairs(R) { var m = {}; St.groups().forEach(function (g, i) { m[g.id] = C().pairs[i % 3].id; }); R.data('pairOf', m); XC.audio.play('flip'); R.rerender(); ui.announce('已平均分配三組配對'); }
  function srcCard(compact) {
    var s = C().source;
    return h('div.src-card' + (compact ? '.compact' : ''), { role: 'note' },
      h('span.src-ico', { html: ui.icon('eye') }),
      h('div', null, h('b', null, s.title), h('p', null, s.text), !compact && St.settings.englishSubs ? h('p.en.it', { lang: 'en' }, s.textEn) : null));
  }
  function showSourceModal(R) {
    var s = C().source;
    ui.modal({ title: s.title, cls: 'src-modal', body: h('div', null, srcCard(), h('p.fine', null, '（第5節《根脈解碼局》・進入本節時顯示；環節二另設來源說明頁）')), actions: [{ label: s.ok, primary: true, icon: 'check' }] });
  }

  /* ---------- 引擎掛鈎 ---------- */
  L.setup = function (R) { R.layer.classList.add('l5'); };
  L.stripItem = function (R, gid, el) {
    var s = R.score(gid);
    el.innerHTML = '<span class="g-leaf">' + leafIco(s > 0) + '</span><span class="g-info"><span class="g-name">' + ui.esc(R.gname(gid)) + '</span>' +
      '<span class="g-sub">解碼點 ' + s + '</span></span>';
    el.setAttribute('aria-label', R.gname(gid) + '：解碼點 ' + s);
  };
  L.totalView = function (R, el) {
    var P = pool(R);
    el.innerHTML = '<span class="tv-l">根脈樹</span><span class="tv-leaves" aria-hidden="true"><i style="width:' + (P.f * 100).toFixed(0) + '%"></i></span><b class="tv-n">' + P.p + '／' + P.t + ' 片葉</b>';
    el.setAttribute('aria-label', '全班根脈樹：' + P.p + ' 片葉，目標 ' + P.t);
  };
  L.beforeAdd = function (R, gid, delta, label, extra) { return { delta: delta, label: label, extra: extra }; };
  L.onScore = function (R, gid, d) {
    var t = document.querySelector('.ls-groups .grp[data-gid="' + gid + '"] .g-leaf');
    if (d > 0 && t) XC.fx.bloom(t); else if (d < 0 && t) XC.fx.dim(t);
    var ph = R.phase().id;
    if (ph === 'station' || ph === 'tree' || ph === 'report' || ph === 'card') R.rerender();
  };
  L.onUndo = K.onUndo;
  L.onSelect = function (R) { var ph = R.phase(); if (ph.layout === 'task' || ph.id === 'badges' || ph.id === 'tree' || ph.id === 'sum') R.rerender(); };
  L.leave = function (R) { K.leave(R); };
  L.onLine = function (R, line) {
    if (line.fx === 'roots') { XC.audio.play('lamp'); R.stageWrap.classList.remove('flare'); void R.stageWrap.offsetWidth; R.stageWrap.classList.add('flare'); }
    if (line.fx === 'lamp') { XC.audio.play('lamp'); R.stageWrap.classList.remove('flare'); void R.stageWrap.offsetWidth; R.stageWrap.classList.add('flare'); }
  };
  L.render = function (R, sc, ph, stage) {
    if (!R._srcShown) {
      R._srcShown = true;
      var k = 'xc_l5_src_' + (R.isClass() ? 'c' : 's');
      var seen = false; try { seen = sessionStorage.getItem(k) === '1'; sessionStorage.setItem(k, '1'); } catch (e) {}
      if (!seen) setTimeout(function () { showSourceModal(R); }, 450);
    }
    var fn = V[sc.id + '.' + ph.id];
    if (fn) fn(R, sc, ph, stage);
    else if (ph.id === 'discuss') { var w = K.discuss(R, sc, stage); if (sc.id === 's2') w.appendChild(h('div.task-acts', null, K.challengeBtn(R))); }
  };
  L.teacherTools = function (R, sc, ph, el) {
    var c = C();
    el.appendChild(h('div.t-row', null, K.sbtn('顯示來源說明', function () { showSourceModal(R); }, { icon: 'eye', cls: 'sm' })));
    if (sc.id === 's0') el.appendChild(h('div.t-row', null, K.sbtn('四條樹根全部亮起', function () { var r = {}; ['a', 'b', 'c', 'd'].forEach(function (k, i) { r[k] = c.tree.roots[i].id; }); R.data('roots', r); XC.audio.play('lamp'); R.rerender(); }, { icon: 'roots', cls: 'sm' }), K.sbtn(c.ui.randomRoles, function () { K.randomRoles(R); }, { icon: 'dice', cls: 'sm' })));
    if (sc.id === 's2') {
      el.appendChild(h('div.t-row', null, K.sbtn(c.ui.assign, function () { assignPairs(R); }, { icon: 'dice', cls: 'sm' })));
      el.appendChild(h('p.fine', null, '計分：完成契合報告 +1；每收到一張「補充」貼紙 +1。' + c.station.short));
    }
    if (sc.id === 's4' && ph.id === 'tree') el.appendChild(h('div.t-row', null, K.sbtn('觸發「' + c.resource.goalDone + '」動畫', function () { grow(R, true); }, { icon: 'roots', cls: 'sm' })));
    el.appendChild(h('p.fine', null, c.pairNote));
  };

  /* ================= 環節一：根脈樹 ================= */
  V['s0.open'] = function (R, sc, ph, stage) { K.home(R, stage); };
  /* 樹根 SVG：viewBox 400×300，樹幹在上，四條根往下伸 */
  var ROOTS = [
    'M196 150 C188 186 150 214 74 262', 'M198 152 C194 196 176 236 150 284',
    'M204 152 C208 196 226 236 252 284', 'M206 150 C214 186 252 214 328 262'
  ];
  var SLOTS = [[16, 86], [37, 93], [63, 93], [84, 86]];
  function rootById(id) { return C().tree.roots.filter(function (r) { return r.id === id; })[0]; }
  function rootTree(lit, o) {
    o = o || {};
    var s = '<svg viewBox="0 0 400 300" class="root-svg" aria-hidden="true"><defs><filter id="rglow' + (++uid) + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs>' +
      '<path class="rt-ground" d="M20 150 C120 144 280 156 380 148"/>' +
      '<path class="rt-trunk" d="M188 152 C190 120 184 96 192 60 C196 44 194 30 198 14 L206 14 C206 34 210 50 208 68 C204 100 214 124 212 152 Z"/>' +
      '<path class="rt-branch" d="M196 70 C176 56 156 50 132 30 M204 92 C226 76 248 70 272 46 M200 46 C214 36 222 26 236 12 M194 108 C174 98 160 94 140 84"/>' +
      '<text x="200" y="138" class="rt-lab">今天</text>';
    ROOTS.forEach(function (d, i) {
      var on = !!lit[i];
      s += '<path class="rt-root' + (on ? ' on' : '') + '" d="' + d + '"/>';
      if (on) s += '<path class="rt-glow" d="' + d + '" filter="url(#rglow' + uid + ')"/>';
    });
    s += '<text x="200" y="176" class="rt-lab sm">傳統</text></svg>';
    return s;
  }
  V['s0.tree'] = function (R, sc, ph, stage) {
    var c = C(), t = c.tree, self = !R.isClass();
    var lit = R.data('roots') || {};
    var w = h('div.rtree-v');
    w.appendChild(h('div.task-head', null, h('h2', null, '根脈樹'), h('p.who', null, t.show), hintRow(R, 'tree')));
    var body = h('div.cs-body.rt-body');
    var box = h('div.rt-box', { role: 'group', 'aria-label': '根脈樹：把樹根卡放到樹根位置' });
    var slotIds = ['a', 'b', 'c', 'd'], used = {};
    slotIds.forEach(function (sid) { if (lit[sid]) used[lit[sid]] = true; });
    box.innerHTML = rootTree(slotIds.map(function (sid) { return !!lit[sid]; }));
    slotIds.forEach(function (sid, i) {
      var r = rootById(lit[sid]), on = !!r;
      box.appendChild(h('div.rt-slot' + (on ? '.on' : ''), { 'data-drop': sid, style: { left: SLOTS[i][0] + '%', top: SLOTS[i][1] + '%' }, 'aria-label': '樹根位置' + (i + 1) + (on ? '：' + r.name : '') },
        on ? h('span.rt-card.placed', null, h('b', null, r.name), h('small', null, r.lesson)) : h('span.rt-empty', null, '樹根 ' + (i + 1))));
    });
    body.appendChild(box);
    var right = K.panel('rt-panel');
    right.appendChild(h('p', null, t.paste));
    var tray = h('div.rt-tray', { role: 'group', 'aria-label': '樹根卡' });
    t.roots.forEach(function (r) {
      if (used[r.id]) return;
      tray.appendChild(h('button.rt-card.tok', { type: 'button', 'data-id': r.id }, h('b', null, r.name), h('small', null, r.lesson)));
    });
    if (!tray.children.length) tray.appendChild(h('p.notice', null, '四條樹根都亮起了：傳統是這棵樹的根。'));
    right.appendChild(tray);
    right.appendChild(h('p.fine', null, '拖曳樹根卡到樹根位置；也可先點樹根卡，再點樹根位置。'));
    if (self) {
      var S = K.st(R, 'seen');
      right.appendChild(ui.field({ label: t.seenLabel, value: S.me.t || '', rows: 2, max: 100, placeholder: t.seenPH, onInput: function (v) { S.me.t = v; S.save(); } }));
    }
    right.appendChild(h('div.task-acts', null, K.sbtn('重設樹根', function () { R.data('roots', {}); R.rerender(); }, { icon: 'reset', cls: 'sm' })));
    body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
    K.drag(w, { token: '.rt-card.tok', target: '.rt-slot', onDrop: function (id, drop) {
      var m = R.data('roots') || {};
      if (m[drop]) { ui.toast('這條樹根已有卡；放到另一條。'); return; }
      m[drop] = id; R.data('roots', m); XC.audio.play('lamp'); R.rerender();
      var g = R.stage.querySelector('.rt-slot[data-drop="' + drop + '"]'); if (g) XC.fx.bloom(g);
    } });
  };
  V['s0.announce'] = function (R, sc, ph, stage) {
    var c = C();
    var w = h('div.scene-quote.small.l5-ann', null, h('span.sq-tag', null, '文化解碼員'), h('p', null, '「' + c.tree.announce + '」'));
    stage.appendChild(w);
    K.roles(R, stage);
  };

  /* ================= 環節二：解碼任務 ================= */
  V['s1.source'] = function (R, sc, ph, stage) {
    var c = C(), w = h('div.src-v');
    w.appendChild(h('h2.center', null, c.source.title, h('small.en', { lang: 'en' }, ' ' + c.source.en)));
    w.appendChild(srcCard());
    w.appendChild(h('div.src-kinds', null, c.docs.map(function (d) { return h('span.chip.static', null, d.no + '：' + d.nature); })));
    w.appendChild(h('p.fine.center', null, c.docsNote));
    w.appendChild(h('div.task-acts', null, K.sbtn('開始拼圖閱讀', function () { R.toPhase('docs'); }, { icon: 'next', primary: true })));
    stage.appendChild(w);
  };
  function scrollArt(look) {
    var A = {
      time: '<circle cx="30" cy="30" r="18" class="sa-ring"/><path d="M30 18v12l8 6" class="sa-line"/><text x="68" y="26" class="sa-t">2021</text><text x="68" y="46" class="sa-t">2023</text><path d="M60 30h-8M60 42h-8" class="sa-line"/>',
      jade: '<path d="M30 12a18 18 0 0 0 0 36l-3-7 5-6-4-6 4-6-4-6z" class="sa-jade"/><path d="M46 12a18 18 0 0 1 0 36l-3-7 5-6-4-6 4-6-4-6z" class="sa-jade"/><path d="M60 30c10-10 20 10 30 0" class="sa-line"/>',
      root: '<path d="M38 8v22" class="sa-trunk"/><path d="M38 30c-4 8-12 12-22 18M38 30c0 8 2 14 6 20M38 30c6 6 14 10 26 12" class="sa-root"/><path d="M38 8c-6-2-10-1-14 2M38 8c6-3 12-2 16 2" class="sa-line"/>'
    };
    return '<svg viewBox="0 0 100 60" class="scroll-art" aria-hidden="true">' + (A[look] || '') + '</svg>';
  }
  V['s1.docs'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var op = R.data('open') || {};
    var w = h('div.docs-v');
    w.appendChild(K.head(R, '拼圖閱讀：三份解碼文件', null, h('div.step-bar', null, h('span.fine', null, self ? '自學：三份都讀。' : c.jigsaw), K.miniT(R, 'docs', 180, '閱讀倒數'))));
    var row = h('div.scroll-row');
    c.docs.forEach(function (d, i) {
      var on = !!op[d.id];
      var sc2 = h('article.scroll' + (on ? '.open' : ''), { 'aria-label': d.no + '：' + d.name });
      sc2.appendChild(h('div.scr-rod.top', { 'aria-hidden': 'true' }));
      var head = h('header.scr-head', null, h('span.case-id', null, d.no), h('b', null, d.name), h('span.scr-nat', null, d.nature));
      sc2.appendChild(head);
      if (!on) {
        sc2.appendChild(h('div.scr-pre', null, srcCard(true), h('p.scr-src', null, '出處：' + d.src),
          K.sbtn('看過來源說明・展開卷軸', function () { var m = R.data('open') || {}; m[d.id] = true; R.data('open', m); XC.audio.play('flip'); R.rerender(); var el = R.stage.querySelectorAll('.scroll')[i]; if (el) el.classList.add('unroll'); }, { icon: 'eye', primary: true, cls: 'sm' })));
      } else {
        var paper = h('div.scr-paper', null,
          R.support ? h('div.scr-art', null, h('span', { html: scrollArt(d.look) }), h('div.scr-keys', null, h('small', null, '圖像重點'), d.key.map(function (k) { return h('span.chip.static', null, k); }))) : null,
          h('p.scr-text', null, d.text),
          h('p.scr-src', null, '出處：' + d.src),
          h('p.scr-note', null, '撮要・教師按文獻淺白改寫（' + d.nature + '）'));
        sc2.appendChild(paper);
      }
      sc2.appendChild(h('div.scr-rod.bot', { 'aria-hidden': 'true' }));
      row.appendChild(sc2);
    });
    w.appendChild(row);
    if (R.support) {
      w.appendChild(h('div.gloss.card', null, h('b', null, '詞彙表'), h('dl', null, c.glossary.map(function (g) { return [h('dt', null, g.w), h('dd', null, g.d)]; })), h('p.fine', null, c.glossaryNote)));
    } else w.appendChild(h('p.fine.center', null, '按右上角「支援」可顯示圖像重點和詞彙表（魂脈、根脈、契合、互相成就）。'));
    w.appendChild(h('div.task-acts', null, K.sbtn('全部展開', function () { var m = {}; c.docs.forEach(function (d) { m[d.id] = true; }); R.data('open', m); R.rerender(); }, { icon: 'eye', cls: 'sm' }), K.sbtn('前往解碼卡', function () { R.toPhase('card'); }, { icon: 'next', primary: true })));
    stage.appendChild(w);
  };
  function decodeOK(t) {
    var d = C().decode; t = t || '';
    return d.must.every(function (k) { return t.indexOf(k) >= 0; }) && d.any.some(function (k) { return t.indexOf(k) >= 0; });
  }
  function decodeOpts() {
    var c = C();
    return { key: 'dc', boxKey: 'decode', title: c.decode.title, en: c.decode.en, savedMsg: '解碼卡已存入回顧盒',
      fields: [{ id: 'dec', label: c.decode.label }],
      extra: [{ id: 'doubt', label: c.doubt.title + '：' + c.doubt.label }, { id: 'exit', label: c.exit.replace(/^離場券：/, '離場券・') }] };
  }
  function stampFx(R, text) {
    var fx = h('div.stamp-fx', { 'aria-hidden': 'true' }, ui.seal(text, 'roots'));
    R.layer.appendChild(fx); XC.audio.play('stamp');
    setTimeout(function () { fx.classList.add('out'); setTimeout(function () { fx.remove(); }, 600); }, 1400);
  }
  V['s1.card'] = function (R, sc, ph, stage) {
    var c = C(), d = c.decode, self = !R.isClass();
    var w = h('div.dc-v');
    var card = K.cardForm(R, { key: 'dc', title: d.title, en: d.en, classNote: d.classNote, fields: [{ id: 'dec', label: d.label, ph: d.ph, rows: 3, max: 160, chips: R.support ? ['兩個結合就是……', '前提是……', '結果是……'] : null }] });
    var hr = hintRow(R, 'card'); if (hr) card.insertBefore(hr, card.children[1]);
    var me = card.S.me, ok = !!(K.st(R, 'dcok').me.ok);
    if (ok) card.appendChild(h('div.dc-stamp', { 'aria-label': '已蓋「解碼成功」印' }, ui.seal(d.ok, 'roots')));
    var msg = h('p.tester-tip', { 'aria-live': 'polite' }, ok ? d.okMsg : '');
    card.appendChild(msg);
    w.appendChild(card);
    if (self) {
      w.appendChild(h('div.task-acts', null, K.sbtn(ok ? '已解碼成功' : '提交解碼卡', function () {
        var t = (me.v || {}).dec || '';
        if (!K.has(t, 6)) { msg.textContent = '先寫一句：「兩個結合就是……」'; return; }
        if (decodeOK(t)) {
          var S2 = K.st(R, 'dcok'); S2.me.ok = true; S2.save();
          stampFx(R, d.ok);
          K.award(R, 'dcp', 'ok', 1, '解碼卡：' + d.ok);
          setTimeout(function () { R.rerender(); }, 300);
        } else { msg.textContent = d.retry; XC.audio.play('drop'); }
      }, { icon: ok ? 'check' : 'seal', primary: !ok, disabled: ok }), K.sbtn('重讀文件', function () { R.toPhase('docs'); }, { icon: 'prev', cls: 'sm' })));
      w.appendChild(K.cardActs(R, decodeOpts()));
    } else {
      var conf = h('p.notice.center', { hidden: !R.data('confShown') || null }, d.confirm);
      w.appendChild(h('div.task-acts', null, K.sbtn('確認重點', function () { R.data('confShown', true); conf.hidden = false; XC.audio.play('flip'); }, { icon: 'eye', primary: true })));
      w.appendChild(conf);
      w.appendChild(h('p.fine.center', null, '課堂模式：解碼卡不計分；計分來自契合報告和「補充」貼紙。'));
    }
    stage.appendChild(w);
  };

  /* ================= 環節三：契合測試 ================= */
  function pairCard(R, p, o) {
    o = o || {};
    return h('figure.pair-card.card' + (o.cls ? '.' + o.cls : ''), { 'data-p': p.id },
      h('div.pc-top', null, h('span.case-id', null, p.no), h('div.pc-pair', null, h('span.pc-old', null, h('small', null, '傳統'), h('b', null, p.old)), h('span.pc-x', { 'aria-hidden': 'true' }, '⟷'), h('span.pc-now', null, h('small', null, '今日論述'), h('b', null, p.now)))),
      o.data === false ? null : o.fold ? h('details.pc-more', null, h('summary', null, '資料卡'), h('div.pc-data', null, h('p', null, p.data))) : h('figcaption.pc-data', null, h('small', null, '資料卡'), h('p', null, p.data)));
  }
  V['s2.pairs'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.pairs-v');
    w.appendChild(K.head(R, '配對卡與契合三問', null, h('div.step-bar', null, h('span.fine', null, c.threeNote))));
    w.appendChild(h('div.three-q.sm', null, c.threeQ.map(function (q, i) { return h('div.tq-card.card', { style: { animationDelay: (0.1 + i * 0.2) + 's' } }, h('span.tq-ico', null, '①②③'[i]), h('b', null, q)); })));
    var row = h('div.case-row3.pair-row');
    c.pairs.forEach(function (p) {
      var fig = pairCard(R, p);
      if (self) {
        var on = pairOf(R) === p.id; if (on) fig.classList.add('chosen');
        fig.appendChild(K.sbtn(on ? '我選了這一組' : c.ui.pick, function () { var S = K.st(R, 'pk'); S.me.p = p.id; S.save(); XC.audio.play('flip'); R.rerender(); }, { icon: on ? 'check' : 'roots', primary: on, cls: 'sm' }));
      } else {
        var gs = St.groups().filter(function (g) { return pairOf(R, g.id) === p.id; });
        fig.appendChild(h('div.cf-groups', null, h('small', null, '負責組別（' + gs.length + '）：'), gs.map(function (g) {
          return h('button.gchip' + (g.id === R.sel ? '.cur' : ''), { type: 'button', title: '點一下改派到下一組配對', on: { click: function () { var m = R.data('pairOf') || {}; St.groups().forEach(function (x) { if (!m[x.id]) m[x.id] = pairOf(R, x.id); }); var ids = c.pairs.map(function (x) { return x.id; }); m[g.id] = ids[(ids.indexOf(m[g.id]) + 1) % 3]; R.data('pairOf', m); R.rerender(); } } }, g.name);
        })));
      }
      row.appendChild(fig);
    });
    w.appendChild(row);
    w.appendChild(h('p.fine.center', null, c.pairNote));
    var acts = h('div.task-acts');
    if (!self) acts.appendChild(K.sbtn(c.ui.assign, function () { assignPairs(R); }, { icon: 'dice', cls: 'sm' }));
    acts.appendChild(K.sbtn('前往契合測試儀', function () { R.toPhase('report'); }, { icon: 'next', primary: true, disabled: self && !pairOf(R) }));
    w.appendChild(acts);
    stage.appendChild(w);
  };

  /* ---------- 玉符契合測試儀（viewBox 400×230；兩半沿鋸齒接縫對合） ---------- */
  var SEAM = 'M200 22 L191 50 L208 78 L193 106 L207 134 L194 160 L200 178';
  function jadeState(v, stars) {
    v = v || {};
    var same = K.has(v.same, 4), diff = K.has(v.diff, 4), cond = K.has(v.cond, 4);
    var gap = same ? ({ 1: 16, 2: 9, 3: 4 }[stars] || 20) : 40;
    return { same: same, diff: diff, cond: cond, gap: gap, stars: stars || 0 };
  }
  function jadeSVG(st, p, o) {
    o = o || {};
    var id = 'j' + (++uid);
    var disc = 'M200 20 A80 80 0 1 0 200 180 A80 80 0 1 0 200 20 Z M200 76 A24 24 0 1 1 200 124 A24 24 0 1 1 200 76 Z';
    var carve = '<path class="jd-carve" d="M200 34 A66 66 0 0 0 134 100 M200 166 A66 66 0 0 1 266 100 M266 100 A66 66 0 0 0 200 34 M134 100 A66 66 0 0 0 200 166"/>' +
      '<path class="jd-cloud" d="M150 70c6-8 16-6 16 2M146 128c8 6 18 2 16-6M250 70c-6-8-16-6-16 2M254 128c-8 6-18 2-16-6"/>';
    var half = function (side) {
      return '<g class="jd-half jd-' + side + '" style="transform:translateX(' + (side === 'l' ? -st.gap : st.gap) + 'px)"><g clip-path="url(#' + id + side + ')">' +
        '<path class="jd-disc" fill-rule="evenodd" d="' + disc + '"/>' + carve + '<path class="jd-sheen" d="M150 52 A70 70 0 0 1 196 30"/></g></g>';
    };
    var s = '<svg viewBox="0 0 400 230" class="jade-svg' + (st.diff ? ' has-seam' : '') + (st.cond ? ' has-cord' : '') + '" role="img" aria-label="' +
      ui.esc('玉符契合測試儀：' + (st.same ? '兩半靠近' : '兩半分開') + (st.diff ? '，接合處有一道縫' : '') + (st.cond ? '，有絲繩繫住' : '') + (st.stars ? '，契合度 ' + st.stars + ' 星' : '')) + '">' +
      '<defs><clipPath id="' + id + 'l"><path d="M0 0 L200 0 L200 22 L191 50 L208 78 L193 106 L207 134 L194 160 L200 178 L200 230 L0 230 Z"/></clipPath>' +
      '<clipPath id="' + id + 'r"><path d="M400 0 L200 0 L200 22 L191 50 L208 78 L193 106 L207 134 L194 160 L200 178 L200 230 L400 230 Z"/></clipPath>' +
      '<filter id="' + id + 'g" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>' +
      half('l') + half('r');
    if (st.diff) s += '<path class="jd-seam-glow" d="' + SEAM + '" filter="url(#' + id + 'g)"/><path class="jd-seam" d="' + SEAM + '"/>';
    if (st.cond) s += '<path class="jd-cord" d="M150 30 C170 4 230 4 250 30"/><path class="jd-cord" d="M200 12 C196 24 204 30 200 44"/><circle class="jd-knot" cx="200" cy="12" r="5"/><path class="jd-tassel" d="M197 44 l-4 16 M200 44 v18 M203 44 l4 16"/>';
    if (p) s += '<text x="110" y="214" class="jd-lab">' + ui.esc(p.old) + '</text><text x="290" y="214" class="jd-lab">' + ui.esc(p.now) + '</text>';
    s += '</svg>';
    return s;
  }
  function jadeBox(st, p, o) {
    o = o || {};
    var b = h('div.jade-box' + (o.cls ? '.' + o.cls : ''));
    b.innerHTML = jadeSVG(st, p, o);
    if (o.steps !== false) b.appendChild(h('ul.jd-steps', null,
      h('li' + (st.same ? '.on' : ''), null, '寫一句相同點：兩半靠近一點'),
      h('li' + (st.diff ? '.on' : ''), null, '寫不同點：接合處留下一道縫'),
      h('li' + (st.cond ? '.on' : ''), null, '寫條件：出現一條繫住兩半的絲繩')));
    return b;
  }
  function starRow(R, val, onPick) {
    var row = h('div.stars', { role: 'radiogroup', 'aria-label': C().report.starsLabel });
    [1, 2, 3].forEach(function (n) {
      var on = val >= n;
      row.appendChild(h('button.star' + (on ? '.on' : ''), { type: 'button', role: 'radio', 'aria-checked': String(val === n), 'aria-label': n + ' 星', on: { click: function () { onPick(n); } } }, '★'));
    });
    return row;
  }
  function repState(R, gid) { var all = R.data('rp') || {}; return all[gid || R.cur()] || {}; }
  function reportOpts(R) {
    var c = C(), rp = c.report, p = pairById(pairOf(R)) || c.pairs[0];
    return { key: 'rp', boxKey: 'report', title: rp.title, en: rp.en, savedMsg: '契合報告已存入回顧盒',
      fields: [{ id: 'pair', label: '配對' }].concat(rp.fields.map(function (f) { return { id: f.id, label: f.label }; })).concat([{ id: 'view', label: rp.opinion.label.replace(/（可不寫）/, '') }]),
      extra: [{ label: '契合度', value: function (me) { return me.stars ? me.stars + ' 星' : ''; } }],
      _pair: p };
  }
  V['s2.report'] = function (R, sc, ph, stage) {
    var c = C(), rp = c.report, self = !R.isClass(), gid = R.cur();
    var p = pairById(pairOf(R)) || c.pairs[0];
    var S = K.st(R, 'rp'), me = S.me; me.v = me.v || {}; me.v.pair = p.old + ' ⟷ ' + p.now;
    S.save();
    var w = h('div.report-v.l5-rep');
    w.appendChild(h('div.step-head', null, K.head(R, '契合測試儀：' + p.old + ' ⟷ ' + p.now, null, hintRow(R, 'report')), h('div.step-bar', null, h('span.fine', null, '分析 4 分鐘＋契合報告 3 分鐘'), K.miniT(R, 'rep', 420, '契合測試倒數'))));
    var body = h('div.cs-body.rp-body');
    var left = h('div.rp-left');
    var jb = jadeBox(jadeState(me.v, me.stars), p);
    left.appendChild(jb);
    var starsW = h('div.stars-w', null, h('b', null, rp.starsLabel), starRow(R, me.stars || 0, function (n) { me.stars = n; S.save(); XC.audio.play('click'); refreshJade(); starTip.textContent = rp.starsNote[n - 1]; ui.$$('.star', starsW).forEach(function (b, i) { b.classList.toggle('on', i < n); b.setAttribute('aria-checked', String(i + 1 === n)); }); }));
    var starTip = h('p.fine', { 'aria-live': 'polite' }, me.stars ? rp.starsNote[me.stars - 1] : '');
    starsW.appendChild(starTip);
    left.appendChild(starsW);
    left.appendChild(h('details.jd-note', null, h('summary', null, '玉符怎樣運作？'), h('p.fine', null, rp.jadeNote)));
    function refreshJade() {
      var st = jadeState(me.v, me.stars), svg = jb.querySelector('svg');
      var tmp = h('div'); tmp.innerHTML = jadeSVG(st, p);
      var nsvg = tmp.firstChild;
      /* 保留過渡：先放舊位置，再在下一幀套用新位置 */
      var old = svg ? [].map.call(svg.querySelectorAll('.jd-half'), function (g) { return g.style.transform; }) : [];
      [].forEach.call(nsvg.querySelectorAll('.jd-half'), function (g, i) { if (old[i]) { var tgt = g.style.transform; g.style.transform = old[i]; requestAnimationFrame(function () { requestAnimationFrame(function () { g.style.transform = tgt; }); }); } });
      if (svg) jb.replaceChild(nsvg, svg); else jb.insertBefore(nsvg, jb.firstChild);
      ui.$$('.jd-steps li', jb).forEach(function (li, i) { li.classList.toggle('on', [st.same, st.diff, st.cond][i]); });
    }
    body.appendChild(left);
    var right = h('div.rp-right');
    right.appendChild(h('details.pc-more.card', null, h('summary', null, p.no + '資料卡：' + p.old + ' ⟷ ' + p.now), h('p', null, p.data)));
    var card = K.cardForm(R, { key: 'rp', title: rp.title, en: rp.en, noName: !self, classNote: '各組在紙本契合報告上寫；老師可在此輸入一組的要點作示範（玉符會即時變化）。',
      fields: rp.fields.map(function (f) { return { id: f.id, label: '①②③'[f.q] + ' ' + c.threeQ[f.q] + '｜' + f.label, ph: f.ph, rows: self ? 2 : 1, max: 120 }; }).concat([{ id: rp.opinion.id, label: rp.opinion.label, ph: rp.opinion.ph, rows: self ? 2 : 1, max: 100 }]),
      scaffolds: R.support ? [rp.scaffold] : null,
      onField: function () { refreshJade(); } });
    right.appendChild(card);
    var done = !!repState(R, gid).done;
    if (self) {
      right.appendChild(h('div.task-acts', null, K.sbtn(done ? '契合報告已完成' : rp.done, function () {
        var v = me.v || {};
        if (!(K.has(v.same, 4) && K.has(v.diff, 4) && K.has(v.cond, 4))) { ui.toast('三句都要寫：相同點、不同點、條件。', 3200); return; }
        if (!me.stars) { ui.toast('為你的配對評契合度（1 至 3 星）。'); return; }
        K.award(R, 'rp', 'done', 1, '契合報告完成');
        XC.audio.play('chime'); R.rerender();
      }, { icon: done ? 'check' : 'plus', primary: !done, disabled: done })));
      right.appendChild(K.cardActs(R, reportOpts(R)));
    } else {
      right.appendChild(K.classAwards(R, 'rp', [{ f: 'done', label: '契合報告完成 +1', icon: 'plus' }]));
    }
    body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
  };

  /* ---------- 驗證站 ---------- */
  function stk(R, gid) { var all = R.data('stk') || {}; return all[gid] || {}; }
  function setStk(R, gid, k, n) {
    var all = R.data('stk') || {}; all[gid] = all[gid] || {};
    var prev = all[gid][k] || 0;
    if (k !== 's') { all[gid][k] = n; R.data('stk', all); return; }
    if (n === prev) return;
    all[gid].s = n; R.data('stk', all);
    var set = { s: prev };
    R.add(gid, n - prev, (n > prev ? '收到補充貼紙' : '取消補充貼紙') + '（' + n + ' 張）', { st: 'stk', gid: gid, set: set });
  }
  V['s2.station'] = function (R, sc, ph, stage) {
    var c = C(), s = c.station, self = !R.isClass();
    var w = h('div.station-v');
    w.appendChild(h('div.step-head', null, K.head(R, '驗證站', null, null), h('div.step-bar', null, h('span.fine', null, s.rule), K.miniT(R, 'stn', 300, '驗證站倒數'))));
    if (!self) {
      w.appendChild(h('p.fine', null, s.classInput + '　' + s.short));
      var tb = h('div.stk-tb', { role: 'table', 'aria-label': '各組收到的貼紙' });
      tb.appendChild(h('div.stk-row.stk-h', { role: 'row' }, h('span', { role: 'columnheader' }, '組別・配對'), s.stickers.map(function (x) { return h('span', { role: 'columnheader' }, h('i.stk-dot.' + x.look), x.name); }), h('span', { role: 'columnheader' }, '解碼點')));
      St.groups().forEach(function (g) {
        var p = pairById(pairOf(R, g.id)), v = stk(R, g.id);
        tb.appendChild(h('div.stk-row' + (g.id === R.sel ? '.cur' : ''), { role: 'row' },
          h('span.stk-g', { role: 'cell' }, h('b', null, g.name), h('small', null, p ? p.old + '⟷' + p.now : '')),
          s.stickers.map(function (x) { return h('span', { role: 'cell' }, K.stepper(v[x.id] || 0, function (n) { setStk(R, g.id, x.id, n); }, g.name + '「' + x.name + '」貼紙', 30)); }),
          h('b.stk-n', { role: 'cell' }, String(R.score(g.id)))));
      });
      w.appendChild(tb);
      w.appendChild(h('p.fine.center', null, '「補充」貼紙每張 +1 解碼點（可按教師面板「撤銷」還原）；「同意」「質疑」只作記錄，不計分。'));
      stage.appendChild(w); return;
    }
    /* 自學：三份示範契合報告 */
    var S = K.st(R, 'stn'), me = S.me;
    w.appendChild(h('p.fine', null, s.selfIntro));
    var row = h('div.demo-row');
    s.demos.forEach(function (d) {
      var p = pairById(d.pair), a = me[d.id] = me[d.id] || {};
      var got = !!(K.st(R, 'stp').me[d.id]);
      var box = h('div.demo.card' + (got ? '.got' : ''));
      box.appendChild(h('div.demo-head', null, h('span.case-id', null, d.who), h('b', null, p.old + ' ⟷ ' + p.now), h('span.demo-stars', { 'aria-label': '契合度 ' + d.stars + ' 星' }, '★★★'.slice(0, d.stars) + '☆☆☆'.slice(0, 3 - d.stars))));
      box.appendChild(h('dl.demo-dl', null, h('dt', null, '相同點'), h('dd', null, d.same), h('dt', null, '不同點'), h('dd', null, d.diff), h('dt', null, '條件'), h('dd', null, d.cond)));
      var picks = h('div.demo-picks', { role: 'group', 'aria-label': '貼紙' });
      s.stickers.forEach(function (x) {
        var on = a.k === x.id;
        picks.appendChild(h('button.stk-b.' + x.look + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { a.k = x.id; S.save(); XC.audio.play('flip'); R.rerender(); } } }, h('i.stk-dot.' + x.look), x.name));
      });
      box.appendChild(picks);
      if (a.k) {
        var fl = ui.field({ label: '寫一句', value: a.t || '', rows: 2, max: 100, placeholder: s.stickerPH[a.k], onInput: function (v) { a.t = v; S.save(); } });
        box.appendChild(fl);
        box.appendChild(h('div.task-acts', null, K.sbtn(got ? '已貼上（+1）' : '貼上貼紙', function () {
          if (!K.has(a.t, 2)) { ui.toast('先寫一句。'); return; }
          if (a.k === 's') {
            if (!K.enough(a.t)) { ui.toast('補充至少寫 ' + St.settings.minChars + ' 個字，才可得解碼點。', 3200); return; }
            K.award(R, 'stp', d.id, 1, '補充貼紙：' + d.who);
          } else ui.toast('已貼上「' + (a.k === 'a' ? '同意' : '質疑') + '」貼紙（只有「補充」計分）。');
          a.posted = true; S.save(); XC.audio.play('stamp'); R.rerender();
        }, { icon: got ? 'check' : 'seal', cls: 'sm', primary: !got, disabled: got })));
        box.appendChild(h('details.demo-tip', null, h('summary', null, '參考評語'), h('p.fine', null, d.tip)));
      }
      row.appendChild(box);
    });
    w.appendChild(row);
    w.appendChild(h('p.fine.center', null, s.demoNote));
    stage.appendChild(w);
  };
  V['s2.sum'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.sum-v');
    w.appendChild(h('h2.center', null, '教師歸納', h('small', null, '　' + c.sumLine)));
    if (self) {
      var me = K.st(R, 'rp').me, v = me.v || {}, p = pairById(pairOf(R)) || c.pairs[0];
      var b = h('div.cs-body');
      b.appendChild(jadeBox(jadeState(v, me.stars), p, { steps: false }));
      b.appendChild(h('div.letter.card-paper', null, h('p.lt-k', null, c.report.title + '｜' + p.old + ' ⟷ ' + p.now),
        h('dl.recap', null, c.report.fields.map(function (f) { return [h('dt', null, f.label), h('dd', null, v[f.id] || '—')]; }), h('dt', null, '契合度'), h('dd', null, me.stars ? me.stars + ' 星' : '—'))));
      w.appendChild(b);
      w.appendChild(h('p.notice.center', null, '有人覺得契合，有人覺得勉強，兩種意見都有價值。重點是你能說出理由。'));
      stage.appendChild(w); return;
    }
    var grid = h('div.sum-grid');
    c.pairs.forEach(function (p) {
      var gs = St.groups().filter(function (g) { return pairOf(R, g.id) === p.id; });
      var col = h('div.sum-col.card', null, h('span.case-id', null, p.no), h('b', null, p.old + ' ⟷ ' + p.now));
      var row = h('div.sum-jades');
      gs.forEach(function (g) {
        var me = (R.data('rp') || {})[g.id] || {};
        var jb = jadeBox(jadeState(me.v, me.stars), null, { steps: false, cls: 'mini' });
        row.appendChild(h('button.sj' + (g.id === R.sel ? '.cur' : ''), { type: 'button', on: { click: function () { R.select(g.id); } } }, jb, h('small', null, g.name + (me.stars ? '・' + me.stars + '星' : '')), h('span.sj-stk', null, s3(stk(R, g.id)))));
      });
      col.appendChild(row);
      col.appendChild(h('div.sum-in', null, ui.field({ label: '共通點／不同點（教師歸納，可不寫）', rows: 2, max: 160, value: (R.data('sumTxt') || {})[p.id] || '', onInput: function (v) { var m = R.data('sumTxt') || {}; m[p.id] = v; R.data('sumTxt', m); } })));
      grid.appendChild(col);
    });
    w.appendChild(grid);
    w.appendChild(h('p.fine.center', null, '玉符只顯示各組填寫的程度與自評星數；按組號固定排列，不排序。'));
    stage.appendChild(w);
    function s3(v) { return '同意 ' + (v.a || 0) + '・補充 ' + (v.s || 0) + '・質疑 ' + (v.q || 0); }
  };

  /* ================= 環節四：質疑與思辨 ================= */
  function goodQ(t) { var d = C().doubt; t = t || ''; return K.has(t, 6) && d.qWords.some(function (k) { return t.indexOf(k) >= 0; }); }
  function doubtList(R) { return (R.data('doubtTxt') || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  V['s3.doubt'] = function (R, sc, ph, stage) {
    var c = C(), d = c.doubt, self = !R.isClass();
    var w = h('div.doubt-v');
    if (self) {
      var S = K.st(R, 'dc'), me = S.me; me.v = me.v || {};
      var card = h('div.out-card.card.doubt-card');
      card.appendChild(h('div.oc-head', null, h('span.oc-ico', { html: ui.icon('mirror') }), h('div', null, h('h2.oc-title', null, d.title), h('p.en.it', { lang: 'en' }, d.en))));
      var hr = hintRow(R, 'doubt'); if (hr) card.appendChild(hr);
      var tip = h('p.tester-tip', { 'aria-live': 'polite' }, me.v.doubt ? (goodQ(me.v.doubt) ? d.goodTip : d.weakTip) : '');
      card.appendChild(ui.field({ label: d.label, value: me.v.doubt || '', rows: 3, max: 120, placeholder: d.ph, chips: R.support ? ['為什麼……？', '怎樣才算……？', '誰來決定……？'] : null, onInput: function (v) { me.v.doubt = v; S.save(); tip.textContent = v.trim() ? (goodQ(v) ? d.goodTip : d.weakTip) : ''; } }));
      card.appendChild(tip);
      w.appendChild(card);
      w.appendChild(h('p.fine.center', null, '質疑卡會連同解碼卡存入回顧盒；溫和提示只供參考，不會擋住儲存。'));
      w.appendChild(K.cardActs(R, decodeOpts()));
      stage.appendChild(w); return;
    }
    w.appendChild(K.head(R, d.title + '：每組 1 張', null, h('div.step-bar', null, h('span.fine', null, '寫下最想追問的一個問題，可關於契合、結合，或今日論述。'), K.miniT(R, 'doubt', 120, '質疑卡倒數'))));
    var body = h('div.cs-body');
    var p = K.panel('dq-in');
    p.appendChild(h('p.fine', null, d.classNote));
    p.appendChild(ui.field({ label: '收回的質疑卡（每行一張，不記組別）', value: R.data('doubtTxt') || '', rows: 6, max: 1200, noCount: true, onInput: function (v) { R.data('doubtTxt', v); } }));
    p.appendChild(h('div.task-acts', null, K.sbtn('隨機抽 2 至 3 張', function () {
      var a = doubtList(R); if (!a.length) { ui.toast('先輸入收回的質疑卡（每行一張）。'); return; }
      var idx = a.map(function (_, i) { return i; }); for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      R.data('drawn', idx.slice(0, Math.min(a.length, a.length >= 3 ? 3 : 2))); XC.audio.play('flip'); R.rerender();
    }, { icon: 'dice', primary: true })));
    body.appendChild(p);
    var right = h('div.dq-drawn');
    var a2 = doubtList(R), dr = R.data('drawn') || [];
    if (dr.length) dr.forEach(function (i, k) { if (a2[i]) right.appendChild(h('div.dq-card.card', { style: { animationDelay: (k * 0.2) + 's' } }, h('span.case-id', null, '質疑卡'), h('p', null, a2[i]))); });
    else right.appendChild(h('p.fine', null, '抽出的質疑卡會在這裏顯示，連同預設思辨問題帶到思辨圈。'));
    body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
  };
  function circleQs(R) {
    var c = C(), out = c.debate.map(function (d) { return { q: d.q, ref: d.ref, preset: true }; });
    if (R.isClass()) { var a = doubtList(R); (R.data('drawn') || []).forEach(function (i) { if (a[i]) out.push({ q: a[i], ref: '', preset: false }); }); }
    else { var me = K.st(R, 'dc').me; if (me.v && me.v.doubt) out.push({ q: me.v.doubt, ref: '', preset: false, mine: true }); }
    return out;
  }
  V['s3.circle'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), qs = circleQs(R);
    var qi = Math.min(R.data('cq') || 0, qs.length - 1), q = qs[qi];
    var w = h('div.circle-v');
    w.appendChild(h('div.step-head', null, K.head(R, '思辨圈', null, null), h('div.step-bar', null, h('span.fine', null, c.stanceNote), K.miniT(R, 'circle', 240, '思辨圈倒數'))));
    var tabs = h('div.cq-tabs', { role: 'tablist' });
    qs.forEach(function (x, i) {
      tabs.appendChild(h('button.cq-tab' + (i === qi ? '.on' : ''), { type: 'button', role: 'tab', 'aria-selected': String(i === qi), on: { click: function () { R.data('cq', i); R.rerender(); } } }, x.preset ? '預設問題' + '一二三'[i] : (x.mine ? '我的質疑卡' : '質疑卡')));
    });
    w.appendChild(tabs);
    var qb = K.panel('cq-q');
    qb.appendChild(h('h3.q-q', null, q.q));
    if (q.ref) {
      var ref = h('div.q-ref', { hidden: true }, h('b', null, self ? '參考分析：' : '參考答案：'), q.ref);
      qb.appendChild(K.sbtn(self ? '看參考分析' : '顯示參考答案', function (e) { ref.hidden = !ref.hidden; e.currentTarget.setAttribute('aria-pressed', String(!ref.hidden)); }, { icon: 'eye', cls: 'sm' }));
      qb.appendChild(ref);
    }
    w.appendChild(qb);
    var all = R.data('stance') || {}, cur = all[qi] = all[qi] || {};
    var board = h('div.stance-board', { role: 'group', 'aria-label': '立場牌分佈（匿名墨點）' });
    c.stances.forEach(function (s) {
      var n = self ? (cur.me === s.id ? 1 : 0) : (cur[s.id] || 0);
      var col = h('div.sb-col' + (self && cur.me === s.id ? '.on' : ''), null, h('div.sb-dots', null, K.dots(Math.min(n, 60))), h('b', null, s.name));
      if (self) col.appendChild(K.sbtn(cur.me === s.id ? '我舉了這張' : '舉這張牌', function () { cur.me = s.id; R.data('stance', all); XC.audio.play('click'); R.rerender(); }, { cls: 'sm', primary: cur.me === s.id }));
      else col.appendChild(K.stepper(n, function (v) { cur[s.id] = v; R.data('stance', all); var d = col.querySelector('.sb-dots'); d.innerHTML = ''; d.appendChild(K.dots(Math.min(v, 60))); }, s.name + '人數', 60));
      board.appendChild(col);
    });
    w.appendChild(board);
    if (self) {
      var S = K.st(R, 'why'); S.me[qi] = S.me[qi] || '';
      w.appendChild(ui.field({ label: '我的理由（可不寫）', value: S.me[qi], rows: 2, max: 120, chips: R.support ? ['我同意，因為……', '我部分同意：……但……', '我不同意，因為……'] : null, onInput: function (v) { S.me[qi] = v; S.save(); } }));
    }
    w.appendChild(h('p.fine.center', null, c.stanceTeacher + '　墨點只顯示分佈，不顯示對錯，不計分。'));
    stage.appendChild(w);
  };
  V['s3.close'] = function (R, sc, ph, stage) {
    stage.appendChild(h('div.l5-close', null, h('span.sq-tag', null, '教師總結・不作立場宣示'), h('p.fine', null, '裂紋透光的陶罐化為燈：創造性轉化、創新性發展。')));
  };

  /* ================= 環節五：根脈樹結算 ================= */
  /* 葉子位置（樹幹圖的百分比座標；圖右三成為空白宣紙） */
  var LEAF = [[24, 14], [31, 22], [38, 9], [45, 18], [53, 8], [60, 16], [64, 28], [57, 34], [49, 27], [40, 31], [30, 36], [21, 30], [15, 22], [18, 44], [27, 50], [36, 44], [47, 41], [58, 46], [66, 40], [62, 54], [52, 56], [41, 54], [12, 34], [34, 16], [44, 6], [68, 22], [56, 24], [26, 26], [16, 54], [64, 8]];
  function treeBox(R, P, grown) {
    var n = Math.min(LEAF.length, P.t <= LEAF.length ? P.p : Math.round(LEAF.length * P.f));
    var box = h('div.lt-box' + (grown ? '.grown' : ''), { role: 'img', 'aria-label': '根脈樹：' + P.p + '／' + P.t + ' 片葉' + (grown ? '，滿樹綠葉' : '') },
      h('img.lt-trunk', { src: IMG + 'l5-tree-trunk.webp', alt: '', loading: 'lazy' }),
      h('img.lt-full', { src: IMG + 'l5-tree-leaves.webp', alt: '', loading: 'lazy' }));
    var lv = h('div.lt-leaves', { 'aria-hidden': 'true' });
    for (var i = 0; i < Math.min(n, LEAF.length); i++) {
      var s = LEAF[i];
      lv.appendChild(h('i.lt-leaf', { style: { left: s[0] + '%', top: s[1] + '%', '--r': ((i * 47) % 120 - 60) + 'deg', animationDelay: (i * 0.04) + 's' }, html: leafIco(true) }));
    }
    box.appendChild(lv);
    if (grown) box.appendChild(h('div.lt-title', null, h('b', null, C().treeTitle.zh), St.settings.englishSubs ? h('small.en', { lang: 'en' }, C().treeTitle.en) : null));
    return box;
  }
  V['s4.tree'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), P = pool(R), grown = P.f >= 1 && R.data('grown');
    var w = h('div.ltree-v');
    w.appendChild(h('h2.center', null, self ? '我的根脈樹' : '全班根脈樹', h('small', null, '　葉子 ' + P.p + '／' + P.t)));
    w.appendChild(treeBox(R, P, grown));
    if (!self) {
      var row = h('div.poster-groups');
      St.groups().forEach(function (g) { row.appendChild(h('span.pg', null, h('b', null, g.name), h('span.pg-leaf', { html: leafIco(R.score(g.id) > 0) }), h('small', null, R.score(g.id)))); });
      w.appendChild(row);
    }
    w.appendChild(h('div.task-acts', null, K.sbtn(c.ui.goalBtn, function () { grow(R); }, { icon: 'roots', primary: true }), grown ? K.sbtn('再長一次', function () { grow(R, true); }, { icon: 'play', cls: 'sm' }) : null));
    if (P.f < 1) w.appendChild(h('p.fine.center', null, self ? '解碼點達 ' + P.t + ' 片葉，根脈樹就會長滿葉子（解碼卡、契合報告、補充貼紙都可得葉）。' : '仍欠 ' + (P.t - P.p) + ' 片葉（目標預設為組數 × 3，可在教師控制台修改；老師也可在教師面板手動觸發動畫）。'));
    stage.appendChild(w);
  };
  function grow(R, force) {
    var P = pool(R);
    if (P.f < 1 && !force) { ui.toast('葉子已長上根脈樹；還欠 ' + (P.t - P.p) + ' 片，就滿樹綠葉。'); XC.audio.play('drop'); return; }
    R.data('grown', true);
    if (R.phase().id !== 'tree') { if (R.isClass()) XC.app.goalFx('l5'); return; }
    R.rerender();
    var box = R.stage.querySelector('.lt-box');
    if (force && P.f < 1 && box) { box.classList.add('grown'); box.appendChild(h('div.lt-title', null, h('b', null, C().treeTitle.zh), St.settings.englishSubs ? h('small.en', { lang: 'en' }, C().treeTitle.en) : null)); }
    if (!box) return;
    if (XC.fx.reduced()) { if (R.isClass()) XC.app.goalFx('l5'); return; }
    box.classList.remove('grown'); box.classList.add('growing'); XC.audio.play('lamp');
    setTimeout(function () { XC.fx.burst(R.stageWrap); }, 700);
    setTimeout(function () { box.classList.remove('growing'); box.classList.add('grown'); XC.audio.play('chime'); }, 1800);
    setTimeout(function () { if (R.isClass()) XC.app.goalFx('l5'); else ui.toast('根深才能葉茂：你的根脈樹長滿葉子。'); }, 3600);
  }
  V['s4.badges'] = function (R, sc, ph, stage) {
    if (R.isClass()) { K.badges(R, stage, null); stage.appendChild(h('p.fine.center', null, '徽章表揚理解、分析與提問，不以立場頒發。')); return; }
    K.badges(R, stage, function (b) {
      if (b.id === 'jiema' && !K.st(R, 'dcok').me.ok) return '在「解碼卡」提交並蓋上「解碼成功」印，就可以為自己蓋「解碼員」。';
      if (b.id === 'qihe') { var v = (K.st(R, 'rp').me.v) || {}; if (!(K.has(v.same, 4) && K.has(v.diff, 4))) return '契合報告寫齊相同點和不同點，就可以為自己蓋「契合分析師」。'; }
      if (b.id === 'tiwen' && !goodQ((K.st(R, 'dc').me.v || {}).doubt)) return '在「質疑卡」寫一個值得追問的問題，就可以為自己蓋「提問勇士」。';
      return null;
    });
  };
  V['s4.summary'] = function (R, sc, ph, stage) { K.summary(R, stage, sc.summary, '三句總結'); };
  V['s4.exit'] = function (R, sc, ph, stage) {
    var c = C();
    K.exit(R, stage, { key: 'dc', label: c.exit, chips: ['我今天最想追問的是：……為什麼……？'], preview: sc.nextPreview, quote: '理解了，才談得上自信', classLead: '在解碼卡背面寫一句：',
      save: function () { K.saveCard(R, decodeOpts()); var me = K.st(R, 'rp').me; if (me.v && (me.v.same || me.v.diff || me.v.cond)) St.saveBoxItem('l5', 'report', boxReport(R)); }, saveLabel: '連同解碼卡、契合報告存入回顧盒' });
  };
  function boxReport(R) { var d = K.cardData(R, reportOpts(R)); return { type: 'report', title: d.title, en: d.en, fields: d.fields, footer: d.footer.split('｜')[1] || '' }; }
})();
