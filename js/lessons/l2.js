/* 第2節《良知偵探社》破解不忍案件 ── 遊戲邏輯（文字全部取自 js/content/l2.js） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state, K = XC.kit;
  var C = function () { return XC.content.l2; };
  var L = XC.lessons.l2 = {};
  var V = {};

  /* ---------- 意象：良知鏡（三塊碎片） ---------- */
  var ANG = [[-150, -30], [-30, 90], [90, 210]];
  function sector(cx, cy, r, a0, a1) {
    var p = function (a) { return [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)]; }, s = p(a0), e = p(a1);
    return 'M' + cx + ' ' + cy + 'L' + s[0] + ' ' + s[1] + 'A' + r + ' ' + r + ' 0 0 1 ' + e[0] + ' ' + e[1] + 'Z';
  }
  function mirrorSVG(lv, cls, lit) {
    var s = '<svg class="mirror' + (cls ? ' ' + cls : '') + (lit ? ' lit' : '') + '" viewBox="0 0 120 120" aria-hidden="true"><circle class="m-rim" cx="60" cy="60" r="55"/>';
    ANG.forEach(function (a, i) { var v = lv[i] || 0; s += '<path class="m-shard s' + (i + 1) + (v ? ' on' : '') + '" style="--lv:' + Math.min(1, v).toFixed(2) + '" d="' + sector(60, 60, 50, a[0] * Math.PI / 180 + 0.035, a[1] * Math.PI / 180 - 0.035) + '"/>'; });
    return s + '<circle class="m-glow" cx="60" cy="60" r="50"/></svg>';
  }
  function frags(R, gid) { var all = R.data('frag') || {}; return all[gid || R.cur()] || {}; }
  function kindCounts(R) {
    var all = R.data('frag') || {}, n = { f1: 0, f2: 0, f3: 0 };
    var ids = R.isClass() ? St.groups().map(function (g) { return g.id; }) : ['me'];
    ids.forEach(function (g) { var f = all[g] || {}; ['f1', 'f2', 'f3'].forEach(function (k) { if (f[k]) n[k]++; }); });
    return n;
  }
  function need(R) { return R.isClass() ? Math.max(1, R.target()) : 1; }
  function mirrorLit(R) { var n = kindCounts(R), t = need(R); return n.f1 >= t && n.f2 >= t && n.f3 >= t; }
  function gotFrag(R, fid) {
    var fr = C().fragments.filter(function (f) { return f.id === fid; })[0];
    var d = K.award(R, 'frag', fid, 1, '良知碎片' + fr.no + '：' + fr.name);
    if (d) { ui.toast('取得「良知碎片' + fr.no + '：' + fr.name + '」'); XC.audio.play('chime'); }
    return d;
  }

  /* ---------- 小工具 ---------- */
  function caseOf(R, gid) {
    if (R.isClass()) { gid = gid || R.sel; var m = R.data('caseOf') || {}; var idx = St.groups().map(function (g) { return g.id; }).indexOf(gid); return m[gid] || 'ABC'[Math.max(0, idx) % 3]; }
    return K.st(R, 'cs').me.case || null;
  }
  function caseById(id) { return C().cases.filter(function (c) { return c.id === id; })[0]; }
  function stickerSVG(k) {
    if (k === 'point') return '<svg viewBox="0 0 64 64" class="stk" aria-hidden="true"><path d="M10 40c6-2 10-2 14 0l18-4c4-1 6 4 2 6l-12 3 16-2c4 0 4 5 0 6l-16 2c-6 3-14 3-20 0z"/><path d="M40 20l8-8M46 24l10-3M36 16l2-10"/></svg>';
    return '<svg viewBox="0 0 64 64" class="stk" aria-hidden="true"><circle cx="32" cy="32" r="22"/><path d="M20 28c2-3 6-3 8 0M36 28c2-3 6-3 8 0"/><path d="M20 37c4 9 20 9 24 0z"/><path d="M50 14l4-4M54 20l5-1"/></svg>';
  }
  function chatMock() {
    var c = C().chat, w = h('div.chat-mock', { role: 'img', 'aria-label': caseById('B').alt });
    w.appendChild(h('div.cm-top', null, h('span.cm-av'), h('b', null, c.title)));
    var body = h('div.cm-body');
    c.msgs.forEach(function (m, i) {
      var b = h('div.cm-msg', { style: { animationDelay: (0.2 + i * 0.35) + 's' } }, h('small', null, m.who));
      if (m.sticker) b.appendChild(h('span.cm-stk', { html: stickerSVG(m.sticker) }));
      else b.appendChild(h('p.cm-b' + (m.shot ? '.shot' : ''), null, m.shot ? h('span.cm-shot', null, h('i'), h('i'), h('i')) : null, m.text));
      body.appendChild(b);
    });
    w.appendChild(body);
    w.appendChild(h('p.cm-me', null, c.me));
    return w;
  }
  function caseFig(cs, mini) {
    var art = cs.chat ? chatMock() : h('img', { src: cs.img, alt: cs.alt, loading: 'lazy' });
    return h('figure.case-fig.card' + (mini ? '.mini' : ''), { 'data-case': cs.id }, h('div.cf-art', null, art),
      h('figcaption', null, h('span.case-id', null, '案件 ' + cs.id), h('b', null, '「' + cs.name + '」'), h('p', null, cs.text), h('small.fine', null, '（人物均為虛構）')));
  }
  function stepHead(R, step, hintKey) {
    var c = C(), cid = caseOf(R), cs = cid ? caseById(cid) : null;
    var mt = K.miniT(R, 'cs_' + step.id + (R.isClass() ? '' : cid), step.sec, step.name + '倒數');
    var bar = h('div.step-bar', null,
      h('ol.step-dots', { 'aria-label': '五個步驟' }, c.caseSteps.map(function (s, i) { return h('li' + (s.id === step.id ? '.cur' : ''), null, '①②③④⑤'[i] + s.name); })),
      mt);
    return h('div.step-head', null, K.head(R, step.name, hintKey), bar, cs ? h('div.case-strip', null, h('span.case-id', null, '案件 ' + cs.id + '「' + cs.name + '」'), h('span', null, cs.text)) : null);
  }
  function needCase(R, stage) {
    if (R.isClass() || caseOf(R)) return false;
    stage.appendChild(h('div.panel.panel-paper.center', null, h('p', null, '先在「案件卡」選一宗案件，再做這一步。'), K.sbtn('前往案件卡', function () { R.toPhase('cases'); }, { icon: 'prev', primary: true })));
    return true;
  }

  /* ---------- 引擎掛鈎 ---------- */
  L.setup = function (R) { R.layer.classList.add('l2'); };
  L.stripItem = function (R, gid, el) {
    var f = frags(R, gid), r = R.rec(gid);
    el.innerHTML = '<span class="g-mirror">' + mirrorSVG([f.f1 ? 1 : 0, f.f2 ? 1 : 0, f.f3 ? 1 : 0]) + '</span><span class="g-info"><span class="g-name">' + ui.esc(R.gname(gid)) + '</span>' +
      '<span class="g-frs">' + C().fragments.map(function (fr) { return '<span class="g-fr' + (f[fr.id] ? ' on' : '') + '">' + fr.name + '</span>'; }).join('') + '</span>' +
      '<span class="g-props">' + C().props.map(function (p) { return '<span class="g-prop' + (r.props[p.id] ? ' used' : '') + '" title="' + p.name + (r.props[p.id] ? '（已用）' : '（未用）') + '">' + ui.icon('key') + '</span>'; }).join('') + '</span></span>';
    el.setAttribute('aria-label', R.gname(gid) + '：良知碎片 ' + C().fragments.filter(function (fr) { return f[fr.id]; }).map(function (fr) { return fr.name; }).join('、') + (r.score ? '' : '（未有）'));
  };
  L.totalView = function (R, el) {
    var n = kindCounts(R), t = need(R);
    el.innerHTML = '<span class="tv-l">良知鏡</span><span class="tv-mirror">' + mirrorSVG([n.f1 / t, n.f2 / t, n.f3 / t], '', mirrorLit(R)) + '</span><b class="tv-n tv-frs">惻隱 ' + n.f1 + '・是非 ' + n.f2 + '・羞惡 ' + n.f3 + '</b>';
    el.setAttribute('aria-label', '全班良知鏡：惻隱 ' + n.f1 + ' 塊，是非 ' + n.f2 + ' 塊，羞惡 ' + n.f3 + ' 塊' + (mirrorLit(R) ? '，三種齊全' : ''));
  };
  L.onScore = function (R, gid, d) {
    var t = document.querySelector('.ls-groups .grp[data-gid="' + gid + '"] .g-mirror'); if (!t) return;
    if (d > 0) XC.fx.fly(R.stage.querySelector('.frag-src') || R.stage, t, 'shard').then(function () { XC.fx.bloom(t); });
    else if (d < 0) XC.fx.dim(t);
  };
  L.onUndo = K.onUndo;
  L.onSelect = function (R) { var ph = R.phase(); if (ph.layout === 'task' || ph.id === 'badges' || ph.id === 'mirror') R.rerender(); };
  L.leave = K.leave;
  L.onLine = function (R, line) {
    if (line.fx === 'ripple') { var r = R.stageWrap.getBoundingClientRect(); XC.fx.ripple(r.left + r.width / 2, r.top + r.height * 0.42, { rings: 3, size: Math.min(r.width, 900) * 0.6 }); XC.audio.play('drop'); }
    if (line.fx === 'moon') { XC.fx.burst(R.stageWrap); XC.audio.play('chime'); }
  };
  L.render = function (R, sc, ph, stage) {
    var fn = V[sc.id + '.' + ph.id];
    if (fn) fn(R, sc, ph, stage);
    else if (ph.id === 'discuss') { var w = K.discuss(R, sc, stage); if (sc.id === 's2') w.appendChild(h('div.task-acts', null, K.challengeBtn(R))); }
  };

  /* ================= 環節一：第一反應 ================= */
  V['s0.open'] = function (R, sc, ph, stage) { K.home(R, stage); };
  V['s0.scene'] = function (R, sc, ph, stage) {
    var c = C();
    stage.appendChild(h('div.scene-quote', null, h('span.sq-tag', null, '情境'), h('p', null, c.fallScene), h('small.fine', null, '（畫面只用淡墨意境）')));
  };
  function reactCounts(R, host, compact) {
    var c = C(), cnt = R.data('react') || {};
    c.reactions.forEach(function (r) {
      host.appendChild(h('div.t-row', null, h('span.t-lab', null, r.text), K.stepper(cnt[r.id] || 0, function (v) { var m = R.data('react') || {}; m[r.id] = v; R.data('react', m); if (!compact) return; R.rerender(); }, r.text + '人數', 60)));
    });
  }
  V['s0.react'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.react-v');
    if (self) {
      var S = K.st(R, 'rx'), me = S.me;
      w.appendChild(h('h2.center', null, '反應牌', h('small', null, '　' + c.ui.reactSelfNote)));
      var row = h('div.rx-row');
      c.reactions.forEach(function (r) {
        var on = me.pick === r.id;
        row.appendChild(h('button.rx-card.card' + (on ? '.chosen' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { me.pick = r.id; S.save(); XC.audio.play('flip'); R.rerender(); } } }, h('p', null, r.text)));
      });
      w.appendChild(row);
      w.appendChild(ui.field({ label: c.ui.feelLabel, value: me.feel || '', rows: 2, max: 120, onInput: function (v) { me.feel = v; S.save(); } }));
      w.appendChild(h('p.fine.center', null, '這一步不記分、不評論；你的選擇只存在這部裝置。'));
    } else {
      var cnt = R.data('react') || {}, tot = c.reactions.reduce(function (a, r) { return a + (cnt[r.id] || 0); }, 0);
      w.appendChild(h('h2.center', null, '全班反應牌', h('small', null, '　共 ' + tot + ' 人')));
      var cols = h('div.react-cols');
      c.reactions.forEach(function (r) {
        var n = cnt[r.id] || 0;
        cols.appendChild(h('div.rc-col.card', null, h('p.rc-t', null, r.text), h('div.rc-dots', null, K.dots(n)), h('b.rc-n', null, n + ' 人'),
          K.stepper(n, function (v) { var m = R.data('react') || {}; m[r.id] = v; R.data('react', m); R.rerender(); }, r.text + '人數', 60)));
      });
      w.appendChild(cols);
      w.appendChild(h('p.fine.center', null, c.ui.dotsNote));
    }
    stage.appendChild(w);
  };
  V['s0.ask'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.ask-v', null, h('div.scene-quote.ask', null, h('span.sq-tag', null, '追問'), h('p', null, c.firstAsk)));
    if (self) { var S = K.st(R, 'rx'), me = S.me; w.appendChild(ui.field({ label: c.ui.feelLabel, value: me.feel || '', rows: 2, max: 120, onInput: function (v) { me.feel = v; S.save(); } })); }
    stage.appendChild(w);
    K.discuss(R, sc, w);
  };
  V['s0.announce'] = function (R, sc, ph, stage) {
    var c = C();
    var file = h('div.dossier', null,
      h('div.ds-cover', null, h('span.ds-seal', null, '良知'), h('b', null, '良知偵探社'), h('small', null, '卷宗')),
      h('div.ds-in', null, h('p', null, h('b', null, '古案一宗：'), '孺子入井'), h('p', null, h('b', null, '現代案件三宗：'), c.cases.map(function (x) { return '「' + x.name + '」'; }).join('')),
        h('div.ds-frs', null, h('span.frag-src', { html: mirrorSVG([1, 1, 1], 'sm') }), h('span', null, '待尋回的良知碎片：' + c.fragments.map(function (f) { return f.name; }).join('、')))));
    stage.appendChild(file);
    setTimeout(function () { file.classList.add('open'); XC.audio.play('flip'); }, 350);
    K.roles(R, stage);
  };
  L.teacherTools = function (R, sc, ph, el) {
    var c = C();
    if (sc.id === 's0' && ph.id === 'react') { el.appendChild(h('p', null, h('b', null, '反應牌人數（只點數，不評論）'))); reactCounts(R, el, true); }
    if (sc.id === 's2' && ph.id === 'cases') el.appendChild(h('div.t-row', null, K.sbtn(c.ui.assignCases, function () { assignCases(R); }, { icon: 'dice', cls: 'sm' })));
    if (sc.id === 's2' && ph.id === 'radar') {
      var inp = h('input.inp', { type: 'text', maxlength: 16, placeholder: '輸入一組匯報的第一念詞條', 'aria-label': '輸入一組匯報的第一念詞條' });
      el.appendChild(h('p', null, h('b', null, '加入第一念詞條（各組匯報）')));
      el.appendChild(h('div.t-row', null, inp, K.sbtn('加入', function () { var v = inp.value.trim(); if (!v) return; var x = R.data('chipsX') || []; x.push(v); R.data('chipsX', x); R.rerender(); }, { icon: 'plus', cls: 'sm' })));
      el.appendChild(h('p.fine', null, c.radarNote));
    }
    if (sc.id === 's2' && ph.id === 'dust') el.appendChild(h('p.fine', null, c.dustNote));
    if (sc.id === 's1' && ph.id === 'task') el.appendChild(h('p.fine', null, c.motiveNote));
    if (sc.id === 's4' && ph.id === 'mirror') el.appendChild(h('div.t-row', null, K.sbtn(c.ui.goalBtn, function () { flyMirror(R); }, { icon: 'mirror', cls: 'sm' })));
  };

  /* ================= 環節二：動機鑑定 ================= */
  V['s1.task'] = function (R, sc, ph, stage) {
    var c = C(), S = K.st(R, 'mt'), me = S.me, self = !R.isClass();
    me.place = me.place || {};
    var f = frags(R);
    var w = h('div.motive');
    w.appendChild(K.head(R, '動機鑑定', 'motive', h('span.frag-src.frag-chip' + (f.f1 ? '.on' : ''), { title: '良知碎片一：惻隱', html: mirrorSVG([f.f1 ? 1 : 0.15, 0, 0], 'sm') })));
    var board = h('div.mt-board');
    var tray = h('div.clue-tray.drop', { 'data-drop': 'tray', 'aria-label': c.ui.clueTray + '（未放的線索）' }, h('span.tray-l', null, c.ui.clueTray));
    function tok(k) { return h('button.tok.clue-tok', { type: 'button', 'data-id': k.id }, h('span', { html: ui.icon('magnifier') }), k.text); }
    c.clues.forEach(function (k) { if (!me.place[k.id]) tray.appendChild(tok(k)); });
    board.appendChild(tray);
    var row = h('div.sus-row');
    c.suspects.forEach(function (m, i) {
      var card = h('div.sus-card.card.drop', { 'data-drop': m.id, role: 'button', 'aria-label': '動機嫌疑卡' + '①②③'[i] + '：' + m.text + '（放到這裏）' },
        h('span.sus-no', null, '嫌疑卡 ' + '①②③'[i]), h('p.sus-t', null, m.text));
      var slot = h('div.sus-slot');
      c.clues.forEach(function (k) { if (me.place[k.id] === m.id) slot.appendChild(tok(k)); });
      card.appendChild(slot);
      if (self && m.id !== 'm3' && slot.childNodes.length && c.motiveAsk[m.id]) card.appendChild(h('p.ask.sus-ask', null, h('b', null, '追問：'), c.motiveAsk[m.id]));
      row.appendChild(card);
    });
    board.appendChild(row);
    w.appendChild(board);
    K.drag(board, { token: '.tok', target: '.drop', onDrop: function (kid, did) {
      if (did === 'tray') delete me.place[kid]; else me.place[kid] = did;
      S.save(); XC.audio.play('drop'); R.rerender();
    } });
    w.appendChild(h('p.fine.center', null, '拖動線索卡；或先點選線索卡，再點選嫌疑卡。'));
    if (self) {
      w.appendChild(ui.field({ label: c.ui.motiveReason, value: me.reason || '', rows: 2, minHint: true, chips: R.support ? ['因為事發在一瞬間，所以……', '因為附近沒有人看見，所以……', '因為孩子與我素不相識，所以……'] : null, onInput: function (v) { me.reason = v; S.save(); } }));
      w.appendChild(h('div.task-acts', null, K.sbtn(f.f1 ? '已取得碎片一（惻隱）' : c.ui.motiveSubmit, function () {
        if (f.f1) return;
        var placed = c.clues.filter(function (k) { return me.place[k.id]; }).length;
        if (placed < 3) { ui.toast('還有 ' + (3 - placed) + ' 張線索卡未放好。逐張想一想：它最支持哪一個動機？', 3800); return; }
        if (!K.enough(me.reason)) { ui.toast('追問：可以多說一點嗎？哪一條線索令你這樣判斷？（建議最少 ' + St.settings.minChars + ' 字）', 3800); return; }
        gotFrag(R, 'f1'); R.rerender(); XC.fx.burst(R.stageWrap);
      }, { icon: 'check', primary: !f.f1, disabled: !!f.f1 })));
    } else {
      w.appendChild(K.classAwards(R, 'frag', [{ f: 'f1', label: '推理有線索支持：取得碎片一（惻隱）', icon: 'mirror' }]));
    }
    stage.appendChild(w);
  };

  /* ================= 環節三：現代三案 ================= */
  function assignCases(R) {
    var m = {}; St.groups().forEach(function (g, i) { m[g.id] = 'ABC'[i % 3]; });
    R.data('caseOf', m); XC.audio.play('flip'); R.rerender(); ui.announce('已平均分配案件 A、B、C');
  }
  V['s2.cases'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.cases-v');
    w.appendChild(K.head(R, '案件卡'));
    var row = h('div.case-row3');
    c.cases.forEach(function (cs) {
      var fig = caseFig(cs);
      if (self) {
        var on = caseOf(R) === cs.id; if (on) fig.classList.add('chosen');
        fig.appendChild(K.sbtn(on ? '我負責這一宗' : c.ui.pickCase, function () { var S = K.st(R, 'cs'); S.me.case = cs.id; S.save(); XC.audio.play('flip'); R.rerender(); }, { icon: on ? 'check' : 'magnifier', primary: on, cls: 'sm' }));
      } else {
        var gs = St.groups().filter(function (g) { return caseOf(R, g.id) === cs.id; });
        fig.appendChild(h('div.cf-groups', null, h('small', null, '負責組別（' + gs.length + '）：'), gs.map(function (g) {
          return h('button.gchip' + (g.id === R.sel ? '.cur' : ''), { type: 'button', title: '點一下改派到下一宗案件', on: { click: function () { var m = R.data('caseOf') || {}; St.groups().forEach(function (x) { if (!m[x.id]) m[x.id] = caseOf(R, x.id); }); m[g.id] = 'ABC'['ABC'.indexOf(m[g.id]) === 2 ? 0 : 'ABC'.indexOf(m[g.id]) + 1]; R.data('caseOf', m); R.rerender(); } } }, g.name);
        })));
      }
      row.appendChild(fig);
    });
    w.appendChild(row);
    if (!self) w.appendChild(h('div.task-acts', null, K.sbtn(c.ui.assignCases, function () { assignCases(R); }, { icon: 'dice' }), h('span.fine', null, '點組別可改派；確保每宗案件有 2 至 3 組負責。')));
    else w.appendChild(h('p.fine.center', null, '自學模式：選一宗案件做完整五步。'));
    stage.appendChild(w);
  };
  V['s2.first'] = function (R, sc, ph, stage) {
    var c = C(), step = c.caseSteps[0];
    if (needCase(R, stage)) return;
    var w = h('div.case-step', null, stepHead(R, step));
    var cs = caseById(caseOf(R));
    var body = h('div.cs-body', null, caseFig(cs, true));
    var right = h('div.cs-right');
    if (!R.isClass()) {
      var S = K.st(R, 'cs'), me = S.me;
      right.appendChild(ui.field({ label: c.ui.firstLabel, value: me.first || '', rows: 3, max: 120, placeholder: '第一下，我覺得……', onInput: function (v) { me.first = v; S.save(); } }));
      right.appendChild(h('p.fine', null, '不是「應該」怎樣做，而是第一下的感覺。'));
    } else right.appendChild(h('div.scene-quote.small', null, h('span.sq-tag', null, '偵探筆記'), h('p', null, '看完案件，寫一句第一下的感覺。'), h('small.fine', null, c.firstAsk)));
    body.appendChild(right); w.appendChild(body);
    stage.appendChild(w);
  };
  function radarSVG(counts) {
    var mx = Math.max(3, Math.max.apply(null, counts)), pts = [], ax = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    var s = '<svg class="radar" viewBox="-60 -60 120 120" aria-hidden="true">';
    [16, 32, 48].forEach(function (r) { s += '<polygon class="rd-ring" points="0,' + (-r) + ' ' + r + ',0 0,' + r + ' ' + (-r) + ',0"/>'; });
    ax.forEach(function (a) { s += '<line class="rd-ax" x1="0" y1="0" x2="' + a[0] * 50 + '" y2="' + a[1] * 50 + '"/>'; });
    counts.forEach(function (n, i) { var r = 6 + 42 * Math.min(1, n / mx); pts.push((ax[i][0] * r).toFixed(1) + ',' + (ax[i][1] * r).toFixed(1)); });
    s += '<polygon class="rd-fill" points="' + pts.join(' ') + '"/>';
    counts.forEach(function (n, i) { var r = 6 + 42 * Math.min(1, n / mx); s += '<circle class="rd-pt z' + (i + 1) + '" cx="' + (ax[i][0] * r).toFixed(1) + '" cy="' + (ax[i][1] * r).toFixed(1) + '" r="2.6"/>'; });
    return s + '</svg>';
  }
  V['s2.radar'] = function (R, sc, ph, stage) {
    var c = C(), step = c.caseSteps[1], self = !R.isClass();
    if (needCase(R, stage)) return;
    var S = K.st(R, self ? 'cs' : 'rd'), me = S.me; me.th = me.th || [];
    if (self && me.first && !me.th.some(function (t) { return t.id === 't0'; })) { me.th.unshift({ id: 't0', t: me.first }); S.save(); }
    if (!self) {
      var pool = c.thoughtChips.concat(R.data('chipsX') || []);
      pool.forEach(function (t, i) { if (!me.th.some(function (x) { return x.t === t; })) me.th.push({ id: 'c' + i + '_' + t.length, t: t }); });
    }
    var f = frags(R);
    var w = h('div.case-step.radar-v', null, stepHead(R, step, 'radar'));
    var board = h('div.rd-board');
    var tray = h('div.clue-tray.drop.th-tray', { 'data-drop': 'tray' }, h('span.tray-l', null, self ? '我的念頭' : '第一念詞條'));
    function tok(t) { return h('button.tok.th-tok', { type: 'button', 'data-id': t.id }, t.t); }
    me.th.forEach(function (t) { if (!t.z) tray.appendChild(tok(t)); });
    var grid = h('div.rd-grid');
    var counts = c.radarZones.map(function (z) { return me.th.filter(function (t) { return t.z === z.id; }).length; });
    c.radarZones.forEach(function (z, i) {
      var zone = h('div.rd-zone.drop.zn' + (i + 1), { 'data-drop': z.id, role: 'button', 'aria-label': '雷達區：' + z.name + '（' + z.note + '）' },
        h('div.rz-h', null, h('span', { html: ui.icon(z.icon) }), h('b', null, z.name), h('small', null, z.note)), R.support ? h('p.rz-eg', null, z.eg) : null);
      me.th.forEach(function (t) { if (t.z === z.id) zone.appendChild(tok(t)); });
      grid.appendChild(zone);
    });
    grid.appendChild(h('div.rd-center', { html: radarSVG(counts) }));
    board.appendChild(tray); board.appendChild(grid);
    w.appendChild(board);
    K.drag(board, { token: '.tok', target: '.drop', onDrop: function (tid, did) {
      var t = me.th.filter(function (x) { return x.id === tid; })[0]; if (!t) return;
      if (did === 'tray') delete t.z; else t.z = did;
      S.save(); XC.audio.play('drop'); R.rerender();
    } });
    if (self) {
      var add = h('input.inp', { type: 'text', maxlength: 30, placeholder: c.ui.thoughtPH, 'aria-label': c.ui.thoughtPH });
      w.appendChild(h('div.t-row.add-th', null, add, K.sbtn(c.ui.addThought, function () { var v = add.value.trim(); if (!v) return; me.th.push({ id: 't' + Date.now().toString(36), t: v }); S.save(); R.rerender(); }, { icon: 'plus', cls: 'sm' }),
        R.support ? h('span.chips', null, c.thoughtChips.slice(0, 6).map(function (t) { return h('button.chip', { type: 'button', on: { click: function () { me.th.push({ id: 't' + Date.now().toString(36), t: t }); S.save(); R.rerender(); } } }, t); })) : null));
      var cs = caseById(caseOf(R));
      w.appendChild(ui.field({ label: c.ui.whereWrong, value: me.wrong || '', rows: 2, minHint: true, chips: R.support ? ['我覺得不對的是……，因為……'] : null, onInput: function (v) { me.wrong = v; S.save(); } }));
      w.appendChild(h('div.task-acts', null, K.sbtn(f.f2 ? '已取得碎片二（是非）' : '完成良知雷達', function () {
        if (f.f2) return;
        if (me.th.length < 2) { ui.toast('再想一想：除了第一念，你心裡還有沒有別的念頭？例如顧慮自己的念頭，也可以寫下來。', 4200); return; }
        if (me.th.some(function (t) { return !t.z; })) { ui.toast('還有念頭未放進雷達。它比較像哪一區？', 3200); return; }
        if (!K.enough(me.wrong)) { ui.toast('追問：在「' + cs.name + '」中，你覺得哪裡不對？試用一句說出來。', 3800); return; }
        gotFrag(R, 'f2'); R.rerender(); XC.fx.burst(R.stageWrap);
      }, { icon: 'check', primary: !f.f2, disabled: !!f.f2 }), h('span.frag-src', { html: mirrorSVG([0, f.f2 ? 1 : 0.15, 0], 'sm') })));
    } else {
      w.appendChild(h('p.fine.center', null, '把各組匯報的第一念拖入四區（老師可在教師面板加入詞條）。各組再說出案件中哪裡不對。'));
      w.appendChild(h('div.task-acts', null, h('span.frag-src', { html: mirrorSVG([0, f.f2 ? 1 : 0.15, 0], 'sm') }), K.classAwards(R, 'frag', [{ f: 'f2', label: '說出哪裡不對並完成雷達：取得碎片二（是非）', icon: 'mirror' }])));
    }
    w.appendChild(h('p.fine.center', null, c.radarNote + (R.support ? ' ' + c.radarEgNote : '')));
    stage.appendChild(w);
  };
  function dustArt(look) {
    var m = {
      dust: '<svg viewBox="0 0 80 60" aria-hidden="true"><g class="da">' + [12, 26, 40, 55, 66, 20, 48, 34, 60].map(function (x, i) { return '<circle cx="' + x + '" cy="' + (14 + (i * 13) % 34) + '" r="' + (2 + i % 3) + '"/>'; }).join('') + '</g><path class="db" d="M4 50c14-6 26 4 40-2s24-2 32 2"/></svg>',
      crowd: '<svg viewBox="0 0 80 60" aria-hidden="true"><g class="da">' + [10, 24, 38, 52, 66].map(function (x, i) { return '<circle cx="' + x + '" cy="' + (18 + i % 2 * 3) + '" r="6"/><path d="M' + (x - 9) + ' 58c0-16 4-24 9-26 5 2 9 10 9 26z"/>'; }).join('') + '</g></svg>',
      finger: '<svg viewBox="0 0 80 60" aria-hidden="true"><rect class="db2" x="0" y="0" width="80" height="60"/><path class="da" d="M8 38c8-2 14-2 20 0l30-6c5-1 7 5 2 7l-18 4c-8 4-22 5-34 1z"/></svg>',
      fog: '<svg viewBox="0 0 80 60" aria-hidden="true"><g class="dfog"><path d="M0 20c14-6 26 6 40 0s26-6 40 0"/><path d="M0 34c14-6 26 6 40 0s26-6 40 0"/><path d="M0 48c14-6 26 6 40 0s26-6 40 0"/></g></svg>'
    };
    return m[look] || m.dust;
  }
  function moonMirror(cls) { return h('div.moon-mirror' + (cls ? '.' + cls : ''), null, h('img', { src: 'assets/img/l2/l2-moon-lake.webp', alt: '', 'aria-hidden': 'true' }), h('span.mm-rim')); }
  V['s2.dust'] = function (R, sc, ph, stage) {
    var c = C(), step = c.caseSteps[2], self = !R.isClass();
    if (needCase(R, stage)) return;
    var S = K.st(R, self ? 'cs' : 'du'), me = S.me; me.dust = me.dust || [];
    var f = frags(R);
    var w = h('div.case-step.dust-v', null, stepHead(R, step, 'dust'));
    var body = h('div.cs-body');
    var cards = h('div.dust-cards');
    c.dust.forEach(function (d) {
      var on = me.dust.indexOf(d.id) >= 0;
      cards.appendChild(h('button.dust-card.card' + (on ? '.chosen' : ''), { type: 'button', 'aria-pressed': String(on), 'data-look': d.look, on: { click: function () {
        var i = me.dust.indexOf(d.id);
        if (i >= 0) me.dust.splice(i, 1); else { if (me.dust.length >= 2) { ui.toast('只選兩張：先取消一張'); return; } me.dust.push(d.id); }
        S.save(); XC.audio.play('flip'); R.rerender();
      } } }, h('span.dc-art', { html: dustArt(d.look), title: d.alt }), h('b', null, d.name), on ? h('span.dc-on', null, '已選') : null));
    });
    var mm = moonMirror('dusty');
    me.dust.forEach(function (id) { var d = c.dust.filter(function (x) { return x.id === id; })[0]; mm.appendChild(h('span.dust-layer.dl-' + d.look, { html: dustArt(d.look) })); });
    body.appendChild(h('div.dust-left', null, h('p.fine', null, '每案 4 張塵埃卡：選出最可能阻止行動的兩張（' + me.dust.length + '／2）。'), cards));
    body.appendChild(h('div.dust-right', null, mm, h('p.fine.center', null, '塵埃覆蓋在鏡面上')));
    w.appendChild(body);
    if (self) {
      w.appendChild(ui.field({ label: c.ui.dustReason, value: me.dustReason || '', rows: 2, minHint: true, chips: R.support ? ['大家都在看手機，所以……', '我怕自己也被取笑，所以……', '我想幫，但不知道……'] : null, onInput: function (v) { me.dustReason = v; S.save(); } }));
      var pv = K.panel('private-box');
      pv.appendChild(h('p', null, h('b', null, c.ui.dustPrivate)));
      pv.appendChild(h('p', null, c.dustPrivate));
      var sel = h('select.inp', { 'aria-label': c.dustPrivate }, h('option', { value: '' }, '請選擇（只存本機）'), c.dust.map(function (d) { return h('option', { value: d.id, selected: me.priv === d.id || null }, d.name); }));
      sel.onchange = function () { me.priv = sel.value; S.save(); };
      pv.appendChild(sel);
      pv.appendChild(ui.field({ label: '想補充的話（可不寫）', value: me.privNote || '', rows: 1, max: 120, noCount: true, onInput: function (v) { me.privNote = v; S.save(); } }));
      w.appendChild(pv);
      w.appendChild(h('div.task-acts', null, K.sbtn(f.f3 ? '已取得碎片三（羞惡）' : '完成塵埃卡分析', function () {
        if (f.f3) return;
        if (me.dust.length < 2) { ui.toast('先選出兩張最可能阻止行動的塵埃卡。'); return; }
        if (!K.enough(me.dustReason)) { ui.toast('追問：這兩張塵埃，怎樣擋住了旁觀者？試多說一點。', 3600); return; }
        if (!me.priv) { ui.toast('最後一步：私下選出你最可能被哪一張擋住（只存本機，不會顯示給別人）。', 4000); return; }
        gotFrag(R, 'f3'); R.rerender(); XC.fx.burst(R.stageWrap);
      }, { icon: 'check', primary: !f.f3, disabled: !!f.f3 }), h('span.frag-src', { html: mirrorSVG([0, 0, f.f3 ? 1 : 0.15], 'sm') })));
    } else {
      w.appendChild(h('p.notice', null, '自願私下作答：「' + c.dustPrivate + '」請寫在偵探筆記上，可寫不讀；此欄不在投影顯示，不強迫。'));
      w.appendChild(h('div.task-acts', null, h('span.frag-src', { html: mirrorSVG([0, 0, f.f3 ? 1 : 0.15], 'sm') }), K.classAwards(R, 'frag', [{ f: 'f3', label: '完成塵埃卡分析：取得碎片三（羞惡）', icon: 'mirror' }])));
    }
    stage.appendChild(w);
  };
  V['s2.swap'] = function (R, sc, ph, stage) {
    var c = C(), step = c.caseSteps[3], self = !R.isClass();
    if (needCase(R, stage)) return;
    var cs = caseById(caseOf(R));
    var w = h('div.case-step.swap-v', null, stepHead(R, step));
    var body = h('div.cs-body', null, caseFig(cs, true));
    var bub = h('div.brush-bubble', null, h('span.bb-who', null, cs.ignored + '心裡想：'));
    if (self) {
      var S = K.st(R, 'cs'), me = S.me;
      var fl = ui.field({ label: c.ui.swapLabel, value: me.swap || '', rows: 3, max: 120, placeholder: '我……', chips: R.support ? ['我好想……', '我其實很怕……', '如果有人……就好了'] : null, onInput: function (v) { me.swap = v; S.save(); } });
      bub.appendChild(fl);
    } else bub.appendChild(h('p.bb-t', null, '「我……」'), h('small.fine', null, '用第一身，寫在換位卡上'));
    body.appendChild(bub); w.appendChild(body);
    stage.appendChild(w);
  };
  V['s2.clean'] = function (R, sc, ph, stage) {
    var c = C(), step = c.caseSteps[4], self = !R.isClass();
    if (needCase(R, stage)) return;
    var S = K.st(R, self ? 'cs' : 'cl'), me = S.me;
    var dS = K.st(R, self ? 'cs' : 'du').me.dust || [];
    var w = h('div.case-step.clean-v', null, stepHead(R, step, 'clean'));
    var body = h('div.cs-body');
    var left = h('div.clean-left');
    left.appendChild(h('div.torn-row', null, dS.map(function (id) { var d = c.dust.filter(function (x) { return x.id === id; })[0]; return h('span.torn-card.card' + (me.wiped ? '.torn' : ''), null, d.name); })));
    if (self) left.appendChild(ui.field({ label: c.ui.cleanLabel, value: me.help || '', rows: 3, max: 140, minHint: true, chips: R.support ? c.helpExamples : null, onInput: function (v) { me.help = v; S.save(); } }));
    else left.appendChild(h('div.scene-quote.small', null, h('span.sq-tag', null, '清塵卡'), h('p', null, '為塵埃卡想一個「最小援手」：今天就做得到的小事。')));
    left.appendChild(h('p.fine', null, '例子：' + c.helpExamples.join('；')));
    var mirror = moonMirror('wipe' + (me.wiped ? '.clean' : ''));
    var wp = null;
    if (!me.wiped) {
      wp = K.wipe(mirror, { locked: function () { return self && !K.has(me.help, 2); }, lockedMsg: '先在清塵卡寫下你的最小援手，再擦去塵埃。', onDone: function () {
        me.wiped = true; S.save(); mirror.classList.add('clean'); XC.fx.burst(R.stageWrap); XC.audio.play('chime'); ui.announce('鏡面清亮了');
        ui.$$('.torn-card', w).forEach(function (t, i) { setTimeout(function () { t.classList.add('torn'); }, i * 200); });
        setTimeout(function () { R.rerender(); }, 1400);
      } });
    }
    var right = h('div.clean-right', null, mirror, h('p.fine.center', null, me.wiped ? '鏡面清亮：良知沒有消失，只是有時被蓋住了。' : c.ui.wipeHint),
      !me.wiped ? K.sbtn('一鍵清塵（鍵盤可用）', function () { if (self && !K.has(me.help, 2)) { ui.toast('先在清塵卡寫下你的最小援手。'); return; } wp.finish(); }, { icon: 'brush', cls: 'sm' }) : K.sbtn('再示範一次', function () { me.wiped = false; S.save(); R.rerender(); }, { icon: 'reset', cls: 'sm' }));
    body.appendChild(left); body.appendChild(right); w.appendChild(body);
    stage.appendChild(w);
  };
  V['s2.report'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.report-v');
    w.appendChild(K.head(R, self ? '我的案件小結' : '匯報'));
    if (self) {
      var me = K.st(R, 'cs').me, cs = caseById(caseOf(R) || 'A');
      var dn = (me.dust || []).map(function (id) { return c.dust.filter(function (d) { return d.id === id; })[0].name; }).join('、');
      w.appendChild(h('dl.recap.card', null,
        h('dt', null, '案件'), h('dd', null, cs ? '「' + cs.name + '」' : '—'),
        h('dt', null, '我的第一念'), h('dd', null, me.first || '—'),
        h('dt', null, '良知雷達'), h('dd', null, c.radarZones.map(function (z) { return z.name + ' ' + (me.th || []).filter(function (t) { return t.z === z.id; }).length; }).join('｜')),
        h('dt', null, '最大的兩張塵埃'), h('dd', null, dn || '—'),
        h('dt', null, '換位一句'), h('dd', null, me.swap || '—'),
        h('dt', null, '我的最小援手'), h('dd', null, me.help || '—')));
    } else {
      var rep = R.data('reporter') || {}, add = R.data('addClues') || {};
      var cols = h('div.rep-cols');
      c.cases.forEach(function (cs) {
        var gs = St.groups().filter(function (g) { return caseOf(R, g.id) === cs.id; });
        var col = h('div.rep-col.card', null, h('span.case-id', null, '案件 ' + cs.id), h('b', null, '「' + cs.name + '」'), K.miniT(R, 'rep' + cs.id, 90, '匯報倒數'),
          h('div.cf-groups', null, h('small', null, '匯報組別：'), gs.map(function (g) { return h('button.gchip' + (rep[cs.id] === g.id ? '.cur' : ''), { type: 'button', 'aria-pressed': String(rep[cs.id] === g.id), on: { click: function () { rep[cs.id] = g.id; R.data('reporter', rep); R.rerender(); } } }, g.name); })));
        var ul = h('ul.rep-add', null, (add[cs.id] || []).map(function (t) { return h('li', null, t); }));
        var inp = h('input.inp', { type: 'text', maxlength: 40, placeholder: '其他組補充一條線索', 'aria-label': '案件' + cs.id + '：其他組補充一條線索' });
        col.appendChild(ul);
        col.appendChild(h('div.t-row', null, inp, K.sbtn('補充', function () { var v = inp.value.trim(); if (!v) return; add[cs.id] = add[cs.id] || []; add[cs.id].push(v); R.data('addClues', add); R.rerender(); }, { icon: 'plus', cls: 'sm' })));
        cols.appendChild(col);
      });
      w.appendChild(cols);
    }
    var shown = self ? 3 : (R.data('sumShown') || 0);
    var sum = h('div.sum-box.panel.panel-paper', null, h('h3', null, '教師歸納'), h('ol', null, c.summary3.slice(0, shown).map(function (t, i) { return h('li.sum-in', { style: { animationDelay: (i * 0.1) + 's' } }, t); })));
    if (!self && shown < 3) sum.appendChild(K.sbtn(c.ui.showSum + '（' + (shown + 1) + '／3）', function () { R.data('sumShown', shown + 1); XC.audio.play('flip'); R.rerender(); }, { icon: 'brush', cls: 'sm', primary: true }));
    if (!self && shown >= 3) sum.appendChild(K.sbtn('收起', function () { R.data('sumShown', 0); R.rerender(); }, { cls: 'sm' }));
    w.appendChild(sum);
    stage.appendChild(w);
  };

  /* ================= 環節四：良知時刻卡 ================= */
  function cardOpts() {
    var cd = C().card;
    return { key: 'card', boxKey: 'moment', title: cd.title, en: cd.en, fields: cd.fields, scaffolds: cd.scaffolds,
      extra: [{ id: 'partner', label: cd.partner }, { id: 'exit', label: cd.exit }],
      classNote: '課堂上同學填寫實體良知時刻卡；此畫面可作示範。分享完全自願。', savedMsg: '良知時刻卡已存入回顧盒' };
  }
  V['s3.explain'] = function (R, sc, ph, stage) {
    var cd = C().card, w = h('div.explain');
    w.appendChild(h('h2.center', null, cd.title, h('small.en', { lang: 'en' }, ' ' + cd.en)));
    var cols = h('div.ex-cols.four');
    cd.fields.forEach(function (f, i) { cols.appendChild(h('div.ex-col.card', null, h('span.ex-n', null, '①②③④'[i]), h('b', null, f.label), f.help ? h('p', null, f.help) : null)); });
    w.appendChild(cols);
    w.appendChild(h('div.ex-sc', null, h('b', null, '句式支架：'), cd.scaffolds.map(function (s) { return h('span.chip.static', null, s); })));
    w.appendChild(h('p.fine.center', null, '分享完全自願，不要求披露私隱；可以寫見聞或電影情節代替親身經歷。'));
    stage.appendChild(w);
  };
  V['s3.fill'] = function (R, sc, ph, stage) {
    var o = cardOpts(), w = h('div.forge');
    w.appendChild(h('div.forge-top', null, K.hintRow(R, 'moment')));
    var card = K.cardForm(R, Object.assign({}, o, { numbered: true }));
    w.appendChild(card); w.appendChild(K.cardActs(R, o));
    if (!R.isClass()) w.appendChild(K.safety());
    stage.appendChild(w);
  };
  V['s3.pair'] = function (R, sc, ph, stage) {
    var cd = C().card, o = cardOpts(), self = !R.isClass();
    var w = h('div.duel');
    w.appendChild(h('ol.duel-steps', null, h('li', null, '兩人自願交換卡片'), h('li', null, '讀對方的卡'), h('li', null, '在「' + cd.partner + '」欄寫一句：' + cd.partnerPH)));
    if (self) {
      var S = K.st(R, 'card'), me = S.me; me.v = me.v || {};
      var box = K.panel('pair-box');
      box.appendChild(h('p.fine', null, cd.partnerNote));
      box.appendChild(ui.field({ label: cd.partner + '（由同伴填寫）', value: me.v.partner || '', rows: 2, max: 120, placeholder: cd.partnerPH, chips: [cd.partnerPH], onInput: function (v) { me.v.partner = v; S.save(); } }));
      w.appendChild(box);
      w.appendChild(K.cardActs(R, o));
    } else w.appendChild(h('p.notice', null, cd.partnerNote));
    stage.appendChild(w);
  };

  /* ================= 環節五：良知鏡結算 ================= */
  V['s4.mirror'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), n = kindCounts(R), t = need(R), lit = mirrorLit(R) && R.data('mirrorDone');
    var w = h('div.mirror-v' + (lit ? '.lit' : ''));
    w.appendChild(h('h2.center', null, self ? '我的良知鏡' : c.resource.goalName, h('small', null, self ? '' : '　三種碎片齊全，鏡子亮起')));
    var big = h('div.big-mirror', { html: mirrorSVG([n.f1 / t, n.f2 / t, n.f3 / t], 'xl', lit) });
    w.appendChild(big);
    w.appendChild(h('div.mv-legend', null, c.fragments.map(function (fr) { return h('span.mv-k' + (n[fr.id] >= t ? '.on' : ''), null, h('b', null, '碎片' + fr.no + '：' + fr.name), h('small', null, (self ? (n[fr.id] ? '已取得' : '未取得') : n[fr.id] + ' 塊')), K.dots(Math.min(12, n[fr.id]))); })));
    if (lit) w.appendChild(h('p.mv-line', null, sc.mirrorLine.zh, St.settings.englishSubs ? h('small.en', { lang: 'en' }, sc.mirrorLine.en) : null));
    w.appendChild(h('div.task-acts', null, K.sbtn(c.ui.goalBtn, function () { flyMirror(R); }, { icon: 'mirror', primary: true }),
      !self ? K.sbtn('觸發「' + c.resource.goalDone + '」動畫', function () { XC.app.goalFx('l2'); }, { icon: 'star' }) : null));
    if (!mirrorLit(R)) w.appendChild(h('p.fine.center', null, self ? '還有碎片未取得：可以回到相關環節完成。' : '仍欠的碎片：' + c.fragments.filter(function (fr) { return n[fr.id] < t; }).map(function (fr) { return fr.name; }).join('、') + '（老師可回到該環節補發，或手動觸發動畫）'));
    stage.appendChild(w);
    if (lit) R.setBg('assets/img/l2/l2-moon-lake.webp');
  };
  function flyMirror(R) {
    var self = !R.isClass(), ids = self ? ['me'] : St.groups().map(function (g) { return g.id; }), all = R.data('frag') || {}, delay = 0;
    var target = R.stage.querySelector('.big-mirror');
    ids.forEach(function (gid) {
      var f = all[gid] || {}, src = document.querySelector('.ls-groups .grp[data-gid="' + gid + '"] .g-mirror');
      ['f1', 'f2', 'f3'].forEach(function (k, i) {
        if (!f[k]) return;
        var shard = target && target.querySelectorAll('.m-shard')[i];
        XC.fx.fly(src, shard || target, 'shard', delay += XC.fx.reduced() ? 0 : 90);
      });
    });
    setTimeout(function () {
      R.data('mirrorDone', true);
      if (mirrorLit(R)) { XC.audio.play('chime'); if (!self) XC.app.goalFx('l2'); else ui.toast('三塊碎片齊全：你的良知鏡亮起來了。'); }
      else ui.toast('碎片已拼上；還欠的碎片可以回到相關環節完成。');
      R.rerender();
    }, delay + 1000);
  }
  V['s4.badges'] = function (R, sc, ph, stage) {
    K.badges(R, stage, function (b) {
      var f = frags(R), cs = K.st(R, 'cs').me, card = (K.st(R, 'card').me.v || {});
      if (b.id === 'minrui' && !f.f1) return '先在「動機鑑定」用線索完成推理，就能得到「敏銳偵探」。';
      if (b.id === 'nuanxin' && !K.has(cs.help) && !K.has(card.help)) return '先寫下一個具體的最小援手（清塵卡或良知時刻卡），就能得到「暖心偵探」。';
      if (b.id === 'qingchen' && !cs.wiped) return '先完成「清塵行動」，擦去鏡上的塵埃，就能得到「清塵偵探」。';
      return null;
    });
  };
  V['s4.summary'] = function (R, sc, ph, stage) { K.summary(R, stage, sc.summary, '三句總結'); };
  V['s4.exit'] = function (R, sc, ph, stage) {
    var cd = C().card;
    K.exit(R, stage, { key: 'card', label: cd.exit, chips: ['我的最小援手是……'], preview: sc.nextPreview, quote: '人人本有良知，如明鏡一般', classLead: '在良知時刻卡背面寫一句：',
      save: function () { K.saveCard(R, cardOpts()); }, saveLabel: '連同良知時刻卡存入回顧盒' });
  };
})();
