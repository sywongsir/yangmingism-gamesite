/* 第4節《煉鋼爐》百煉成鋼的團隊挑戰 ── 遊戲邏輯（文字全部取自 js/content/l4.js） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state, K = XC.kit;
  var C = function () { return XC.content.l4; };
  var L = XC.lessons.l4 = {};
  var V = {};
  var RK = ['r1', 'r2', 'r3'];

  /* ---------- 鋼條色階：暗灰 → 暗紅 → 橙 → 金 → 金白；百煉成鋼後冷卻成青鋼 ---------- */
  var HEAT = [[0, [86, 83, 79]], [0.33, [128, 40, 22]], [0.56, [214, 98, 30]], [0.78, [240, 178, 66]], [1, [255, 244, 210]]];
  var COOL = '#5f8f94';
  function heatRGB(f) {
    f = Math.max(0, Math.min(1, f || 0));
    for (var i = 1; i < HEAT.length; i++) {
      if (f <= HEAT[i][0]) {
        var a = HEAT[i - 1], b = HEAT[i], t = (f - a[0]) / (b[0] - a[0]);
        return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[1][k] + (b[1][k] - a[1][k]) * t); }).join(',') + ')';
      }
    }
    return 'rgb(255,244,210)';
  }
  function heatName(f) { return f >= 0.95 ? '金白' : f >= 0.7 ? '金' : f >= 0.5 ? '橙' : f >= 0.25 ? '暗紅' : '暗灰'; }
  /* 鐵砧＋鋼條＋錘（viewBox 400×200；錘的支點 362,77） */
  function steelSVG(f, o) {
    o = o || {};
    var col = heatRGB(f), glow = Math.max(0, (f - 0.12) / 0.88);
    return '<svg class="steel-svg" viewBox="0 0 400 200" aria-hidden="true" style="--steel:' + col + ';--glow:' + glow.toFixed(2) + '">' +
      '<defs><filter id="sglow" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="9"/></filter>' +
      '<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>' +
      '<path class="anvil" d="M96 112 L304 112 Q330 104 358 99 Q346 116 312 124 L290 126 L268 146 L142 146 L120 126 L102 124 Q90 120 96 112 Z"/>' +
      '<path class="anvil" d="M150 146 L258 146 L266 170 L290 186 L118 186 L142 170 Z"/>' +
      '<path class="anvil-hl" d="M104 113 L300 113"/>' +
      '<rect class="bar-glow" x="120" y="88" width="192" height="28" rx="10" filter="url(#sglow)"/>' +
      '<rect class="bar" x="126" y="94" width="180" height="17" rx="4"/>' +
      '<rect class="bar-sheen" x="126" y="94" width="180" height="17" rx="4" fill="url(#sheen)"/>' +
      (o.hammer === false ? '' : '<g class="hammer"><rect class="h-handle" x="234" y="72" width="132" height="10" rx="4"/><rect class="h-head" x="190" y="62" width="46" height="32" rx="3"/><path class="h-hl" d="M194 66h38"/></g>') +
      '</svg>';
  }
  function forgeBox(R, gid, f, o) {
    o = o || {};
    var b = h('div.forge-box' + (o.cls ? '.' + o.cls : ''), { 'data-gid': gid || '', role: 'img', 'aria-label': (o.label || '鋼條') + '：' + heatName(f) + '色' });
    b.innerHTML = steelSVG(f, o) + '<span class="fb-flames" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
    return b;
  }
  function sparks(box) {
    if (!box || XC.fx.reduced()) return;
    var w = h('span.sparks', { 'aria-hidden': 'true' });
    for (var i = 0; i < 18; i++) {
      var a = -Math.PI * (0.08 + Math.random() * 0.84), r = 40 + Math.random() * 120;
      var s = h('i'); s.style.setProperty('--dx', (Math.cos(a) * r * (Math.random() < 0.5 ? -1 : 1)).toFixed(0) + 'px'); s.style.setProperty('--dy', (Math.sin(a) * r).toFixed(0) + 'px');
      s.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's'; w.appendChild(s);
    }
    box.appendChild(w); setTimeout(function () { w.remove(); }, 1300);
  }
  function strike(R, gid) {
    var box = R.stage.querySelector('.forge-box[data-gid="' + gid + '"]');
    if (!box) return;
    box.classList.remove('strike'); void box.offsetWidth; box.classList.add('strike');
    setTimeout(function () { sparks(box); XC.audio.play('stamp'); }, 180);
  }

  /* ---------- 輪次與鋼度 ---------- */
  function rmode(R) { return (R.isClass() && R.data('rmode')) || 'full'; }
  function activeRounds(R) { var m = rmode(R); return m === 'skip2' ? ['r1', 'r3'] : m === 'merge' ? ['r1', 'r2'] : RK.slice(); }
  function maxOf(R) { return activeRounds(R).length * C().resource.perRound; }
  function roundOf(rk) { return C().rounds.filter(function (r) { return r.id === rk; })[0]; }
  function obsOf(R, gid) { var all = R.data('obs') || {}; return all[gid || R.cur()] || {}; }
  function ticks(R, gid, rk) { var g = obsOf(R, gid); return [0, 1, 2].filter(function (i) { return g[rk + 'i' + i]; }).length; }
  function heatOf(R, gid) { return Math.min(1, R.score(gid) / Math.max(1, maxOf(R))); }
  function toggleTick(R, gid, rk, i) {
    var c = C(), f = rk + 'i' + i, all = R.data('obs') || {}, g = all[gid] = all[gid] || {};
    var lab = roundOf(rk).no + '：' + c.indicatorShort[i];
    if (!g[f]) { K.award(R, 'obs', f, 1, lab, gid); return; }
    delete g[f]; R.data('obs', all);
    var set = {}; set[f] = true;
    R.add(gid, -1, '取消 ' + lab, { st: 'obs', gid: gid, set: set });
  }
  function pool(R) {
    if (R.isClass()) { var t = R.target(), p = R.total(); return { p: p, t: t, f: Math.min(1, p / Math.max(1, t)) }; }
    var t2 = Math.ceil(9 * C().resource.ratio), p2 = R.score('me');
    return { p: p2, t: t2, f: Math.min(1, p2 / t2) };
  }
  function hintRow(R, key) { return R.isClass() ? null : K.hintRow(R, key); }

  /* ---------- 任務、角色、觀察員 ---------- */
  function taskOf(R, gid) {
    if (R.isClass()) { gid = gid || R.sel; var m = R.data('taskOf') || {}; var idx = St.groups().map(function (g) { return g.id; }).indexOf(gid); return m[gid] || 'ABC'[Math.max(0, idx) % 3]; }
    return K.st(R, 'tk').me.t || null;
  }
  function taskById(id) { return C().tasks.filter(function (t) { return t.id === id; })[0]; }
  function assign(R) { var m = {}; St.groups().forEach(function (g, i) { m[g.id] = 'ABC'[i % 3]; }); R.data('taskOf', m); XC.audio.play('flip'); R.rerender(); ui.announce('已平均分配任務 A、B、C'); }
  function drawObs(R) {
    var m = {};
    St.groups().forEach(function (g) { var a = [0, 1, 2, 3]; for (var i = 3; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } m[g.id] = a.slice(0, 3); });
    R.data('obsDraw', m); XC.audio.play('flip'); R.rerender(); ui.announce('已抽出各輪觀察員（每輪不同組員）');
  }
  function memberName(i) { return '組員' + '一二三四'[i]; }
  function roleOfMember(R, gid, mi) { var roles = R.data('roles'); if (!roles || !roles[gid]) return null; var r = C().roles[roles[gid][mi]]; return r ? r.name : null; }
  function observerLine(R, gid, rk) {
    var d = R.data('obsDraw'); if (!d || !d[gid]) return null;
    var mi = d[gid][RK.indexOf(rk)], role = roleOfMember(R, gid, mi);
    return '觀察員：' + memberName(mi) + (role ? '（' + role + '）' : '') + (rk === 'r1' ? (role ? '；其角色「' + role + '」臨時缺席' : '；其角色臨時缺席') : '');
  }
  function taskStrip(R) { var t = taskById(taskOf(R) || ''); return t ? h('div.case-strip', null, h('span.case-id', null, '任務 ' + t.id + '「' + t.name + '」'), h('span', null, t.text)) : null; }

  /* ---------- 物件插畫（SVG） ---------- */
  function art(look) {
    var A = {
      read: '<rect x="14" y="44" width="46" height="30" rx="2" class="paper ink-s"/><path d="M37 44v30M18 50h15M18 56h15M41 50h15M41 56h15" class="line thin"/><path d="M70 82h40M78 82l4-34h16l4 34" class="line"/><rect x="80" y="40" width="20" height="8" class="ink"/><circle cx="90" cy="22" r="6" class="ink"/><path d="M84 40c0-8 3-11 6-11s6 3 6 11" class="ink"/>',
      eco: '<path d="M18 36h40l-5 46H23z" class="paper ink-s"/><path d="M14 32h48" class="line"/><path d="M30 52l8-8 8 8M38 44v22" class="line thin"/><path d="M76 78c-4-26 10-46 34-52-2 26-14 46-34 52z" class="jade"/><path d="M76 78c8-16 16-28 28-40" class="line thin"/>',
      care: '<rect x="12" y="30" width="44" height="48" rx="2" class="paper ink-s"/><path d="M34 46c-4-6-12-2-8 5l8 8 8-8c4-7-4-11-8-5z" class="red"/><path d="M18 70h32" class="line thin"/><path d="M68 84V34l22-12 22 12v50" class="line"/><rect x="82" y="56" width="16" height="28" class="ink"/><path d="M74 44h32" class="line thin"/>',
      chair: '<path d="M26 22v62M26 50h34v34M60 50V22" class="line"/><path d="M26 22h34" class="line"/><path d="M22 50h42" class="line"/><path d="M78 84V54a14 14 0 0 1 28 0v30z" class="ink"/><path d="M84 84V62a8 8 0 0 1 16 0v22" class="ember"/><path d="M92 46c-4-8 4-12 0-20M98 44c-3-6 3-9 0-15" class="smoke"/>',
      clash: '<path d="M8 66C30 58 46 50 60 40" class="stroke-ink"/><path d="M112 66C90 58 74 50 60 40" class="stroke-red"/><path d="M56 34l-4-8M62 32l2-9M66 36l7-6M54 40l-8-3" class="line thin"/>',
      coin: '<rect x="10" y="14" width="46" height="62" rx="2" class="paper ink-s"/><path d="M16 26h34M16 34h26" class="line thin"/><text x="33" y="56" class="txt">日期</text><path d="M16 62l34-10" class="redline"/><g class="coin-l"><path d="M90 26a22 22 0 0 0 0 44l-4-10 6-8-5-9 5-9z" class="gold"/></g><g class="coin-r"><path d="M90 26a22 22 0 0 1 0 44l-4-10 6-8-5-9 5-9z" class="gold"/></g>',
      think: '<path d="M14 84h60" class="line"/><rect x="20" y="58" width="40" height="6" class="ink"/><circle cx="40" cy="34" r="7" class="ink"/><path d="M30 58c0-12 4-16 10-16s10 4 10 16" class="ink"/><circle cx="66" cy="26" r="3" class="paper ink-s"/><circle cx="76" cy="18" r="5" class="paper ink-s"/><ellipse cx="96" cy="14" rx="16" ry="10" class="paper ink-s"/><path d="M90 14h12" class="line thin"/>',
      act: '<path d="M60 30v54M60 56h30v28M90 30v26" class="line dash"/><circle cx="34" cy="26" r="7" class="ink"/><path d="M25 52c0-12 4-17 9-17s9 5 9 17z" class="ink"/><path d="M28 52l-2 32M40 52l2 32" class="line"/><path d="M42 40l16-16" class="line"/><path d="M62 18l4-6M68 22l6-2" class="gold-l"/>',
      swim: '<rect x="10" y="20" width="36" height="46" rx="2" class="paper ink-s"/><path d="M28 20v46M14 30h10M14 36h10M32 30h10" class="line thin"/><path d="M58 60c8-6 14 6 22 0s14 6 22 0 10 4 12 2" class="water"/><path d="M58 72c8-6 14 6 22 0s14 6 22 0 10 4 12 2" class="water"/><circle cx="84" cy="44" r="6" class="ink"/><path d="M70 54c8-6 18-6 28-2" class="line"/>'
    };
    return '<svg viewBox="0 0 120 90" class="sc-art l4-art" aria-hidden="true">' + (A[look] || '') + '</svg>';
  }

  /* ---------- 引擎掛鈎 ---------- */
  L.setup = function (R) { R.layer.classList.add('l4'); };
  L.stripItem = function (R, gid, el) {
    var s = R.score(gid), mx = R.isClass() ? maxOf(R) : 9, f = Math.min(1, s / mx), used = R.propUsed(gid, 'redo');
    el.innerHTML = '<span class="g-steel" aria-hidden="true" style="--c:' + heatRGB(f) + ';--g:' + Math.max(0, f - 0.2).toFixed(2) + '"></span><span class="g-info"><span class="g-name">' + ui.esc(R.gname(gid)) + '</span>' +
      '<span class="g-sub">鋼度 ' + s + '／' + mx + (used ? '　<span class="g-redo" title="回爐卡已使用">回爐</span>' : '') + '</span></span>';
    el.setAttribute('aria-label', R.gname(gid) + '：鋼度 ' + s + '／' + mx + '，鋼條' + heatName(f) + '色' + (used ? '，回爐卡已使用' : ''));
  };
  L.totalView = function (R, el) {
    var P = pool(R);
    el.innerHTML = '<span class="tv-l">煉鋼爐溫度計</span><span class="tv-thermo" aria-hidden="true"><i style="width:' + (P.f * 100).toFixed(0) + '%"></i></span><b class="tv-n">' + P.p + '／' + P.t + '</b>';
    el.setAttribute('aria-label', '全班煉鋼爐溫度計：鋼度 ' + P.p + '，目標 ' + P.t);
  };
  /* 教師 +1／−1（或鍵盤 ＋／－）：歸入目前這一輪的下一個承擔指標；每輪最多 3 分 */
  L.beforeAdd = function (R, gid, delta, label, extra) {
    if (extra && extra.st) return { delta: delta, label: label, extra: extra };
    var rs = activeRounds(R), ph = R.phase().id, cur = rs.indexOf(ph) >= 0 ? ph : null, c = C();
    var all = R.data('obs') || {}, g = all[gid] = all[gid] || {}, set = {};
    if (delta > 0) {
      var order = cur ? [cur] : rs;
      for (var a = 0; a < order.length; a++) for (var i = 0; i < 3; i++) {
        var f = order[a] + 'i' + i;
        if (!g[f]) { g[f] = true; R.data('obs', all); set[f] = undefined; return { delta: 1, label: roundOf(order[a]).no + '：' + c.indicatorShort[i] + '（教師加分）', extra: { st: 'obs', gid: gid, set: set } }; }
      }
      ui.toast(cur ? '每輪最多 3 分：' + R.gname(gid) + roundOf(cur).no + '已滿 3 分' : '每輪最多 3 分：' + R.gname(gid) + '的鋼度已達上限', 3200);
      return null;
    }
    if (delta < 0) {
      var order2 = cur ? [cur] : rs.slice().reverse();
      for (var b = 0; b < order2.length; b++) for (var j = 2; j >= 0; j--) {
        var f2 = order2[b] + 'i' + j;
        if (g[f2]) { delete g[f2]; R.data('obs', all); set[f2] = true; return { delta: -1, label: roundOf(order2[b]).no + '：取消' + c.indicatorShort[j] + '（教師減分）', extra: { st: 'obs', gid: gid, set: set } }; }
      }
      return null;
    }
    return { delta: delta, label: label, extra: extra };
  };
  L.onScore = function (R, gid, d) {
    var t = document.querySelector('.ls-groups .grp[data-gid="' + gid + '"] .g-steel');
    if (d > 0 && t) XC.fx.bloom(t); else if (d < 0 && t) XC.fx.dim(t);
    var ph = R.phase().id;
    if (/^r\d$/.test(ph) || ph === 'share' || ph === 'furnace') { R.rerender(); if (d > 0) strike(R, gid); }
  };
  L.onUndo = K.onUndo;
  L.onSelect = function (R) { var ph = R.phase(); if (ph.layout === 'task' || ph.id === 'badges' || ph.id === 'furnace') R.rerender(); };
  L.leave = function (R) { K.leave(R); };
  L.onLine = function (R, line) { if (line.fx === 'fire') { XC.audio.play('lamp'); R.stageWrap.classList.remove('flare'); void R.stageWrap.offsetWidth; R.stageWrap.classList.add('flare'); } };
  L.render = function (R, sc, ph, stage) {
    var fn = V[sc.id + '.' + ph.id];
    if (fn) fn(R, sc, ph, stage);
    else if (ph.id === 'discuss') { var w = K.discuss(R, sc, stage); if (sc.id === 's2') w.appendChild(h('div.task-acts', null, K.challengeBtn(R))); }
  };
  L.teacherTools = function (R, sc, ph, el) {
    var c = C();
    if (sc.id === 's2') {
      var m = rmode(R), row = h('div.t-row', null, h('span.fine', null, '時間不足：'));
      c.rmodes.forEach(function (x) { row.appendChild(ui.btn(x.name, { cls: 'sm', pressed: m === x.id, onClick: function () { R.data('rmode', x.id); R.refreshStrip(); R.rerender(); R.updateTeacher(true); ui.toast('已選：' + x.name + '（全班目標 ' + R.target() + '）'); } })); });
      el.appendChild(row);
      el.appendChild(h('div.t-row', null, K.sbtn(c.observerDraw.btn, function () { drawObs(R); }, { icon: 'dice', cls: 'sm' }), K.sbtn(c.ui.assign, function () { assign(R); }, { icon: 'dice', cls: 'sm' }), K.sbtn(c.ui.randomRoles, function () { K.randomRoles(R); }, { icon: 'dice', cls: 'sm' })));
      el.appendChild(h('p.fine', null, '＋1／−1 會歸入目前這一輪的承擔指標（每輪最多 3 分）。' + c.obsNote));
    }
    if (sc.id === 's4' && ph.id === 'furnace') el.appendChild(h('div.t-row', null, K.sbtn('觸發「' + c.resource.goalDone + '」動畫', function () { forge(R, true); }, { icon: 'flame', cls: 'sm' })));
  };

  /* ================= 環節一：開封 ================= */
  V['s0.open'] = function (R, sc, ph, stage) { K.home(R, stage); };
  function envState() { return (St.box().l3 || {}).envelope || null; }
  function envelopeEl(name, state) {
    return h('div.envelope' + (state ? '.' + state : ''), { role: 'img', 'aria-label': state === 'sealed' ? '已封存的承諾信封' : '已打開的承諾信封' },
      h('div.env-back'), h('div.env-letter', null, h('i'), h('i'), h('i')), h('div.env-front'), h('div.env-flap'),
      h('div.env-seal', { html: ui.icon('seal') }), h('div.env-name', null, name || ''));
  }
  function reportFields(me) {
    var u = C().unseal, res = u.results.filter(function (x) { return x.id === me.result; })[0];
    var out = [{ label: '第4節回報', value: res ? res.name : '' }, { label: u.reasonLabel, value: me.reason || '' }];
    if (me.result && me.result !== 'done') out.push({ label: u.fixLabel, value: me.fix || '' });
    return out;
  }
  function writeEnv(R) {
    var env = envState(), me = K.st(R, 'un').me;
    if (!env) { St.saveBoxItem('l4', 'report', { type: 'report', title: '承諾回報', fields: [{ label: C().unseal.noneLabel, value: me.promise || '' }].concat(reportFields(me)), footer: '' }); return; }
    var promise = env.promise || env.fields || [];
    St.saveBoxItem('l3', 'envelope', Object.assign({}, env, { sealed: false, opened: true, card: true, openedAt: env.openedAt || Date.now(), title: '承諾信封（第4節已開封）', promise: promise, fields: promise.concat(reportFields(me)), report: { result: me.result || '', reason: me.reason || '', fix: me.fix || '' } }));
  }
  V['s0.unseal'] = function (R, sc, ph, stage) {
    var c = C(), u = c.unseal, self = !R.isClass();
    var w = h('div.unseal-v');
    w.appendChild(h('div.task-head', null, h('h2', null, '開封：承諾回報'), h('p.who', null, u.privacy), hintRow(R, 'unseal')));
    var body = h('div.cs-body.un-body');
    if (!self) {
      var el = envelopeEl('', 'sealed');
      body.appendChild(h('div.un-left', null, el, h('div.task-acts', null, K.sbtn('示範拆信', function () { el.classList.remove('sealed', 'opening'); void el.offsetWidth; el.classList.add('opening'); XC.audio.play('flip'); }, { icon: 'envelope', cls: 'sm' }))));
      var k = R.data('keepers') || 0;
      var p = K.panel('un-panel');
      p.appendChild(h('ol.un-steps', null,
        h('li', null, h('b', null, '自評（1 分鐘）'), '在信封內的紙上圈選：', u.results.map(function (r) { return h('span.chip.static', null, r.name); }), '並寫一句原因。'),
        h('li', null, h('b', null, '分享（1 分鐘）'), u.share),
        h('li', null, h('b', null, '守約章（1 分鐘）'), '完成者蓋上「守約章」，得守約者徽章；未完成者不扣分，在紙上寫「橋哪裡要加固」。')));
      var stampBox = h('div.keepers', null, ui.seal(u.stamp, 'ding'), h('div', null, h('p.fine', null, u.keepers), K.stepper(k, function (n) { R.data('keepers', n); var b = stampBox.querySelector('.kp-n'); if (b) b.textContent = '守約者 ' + n + ' 人'; }, '守約人數', 60), h('p.kp-n', null, '守約者 ' + k + ' 人')));
      p.appendChild(stampBox);
      p.appendChild(h('div.task-acts', null, K.sbtn('蓋守約章（動畫）', function () { stampFx(R, '守約者 ' + (R.data('keepers') || 0) + ' 人'); }, { icon: 'seal', primary: true })));
      p.appendChild(h('p.fine', null, u.noScore + ' 課堂模式只輸入守約人數，不記名字。'));
      body.appendChild(p);
      w.appendChild(body);
      stage.appendChild(w);
      return;
    }
    var env = envState(), S = K.st(R, 'un'), me = S.me;
    var opened = env && !env.sealed;
    if (env && env.sealed) {
      var el2 = envelopeEl(env.name, 'sealed');
      body.appendChild(h('div.un-left', null, el2, h('p.fine.center', null, '封存時間：' + new Date(env.sealedAt).toLocaleString('zh-HK'))));
      var p2 = K.panel('un-panel');
      p2.appendChild(h('p.big', null, '這是你在第3節封存的承諾信封。'));
      p2.appendChild(h('div.task-acts', null, K.sbtn(u.openBtn, function () {
        el2.classList.remove('sealed'); el2.classList.add('opening'); XC.audio.play('flip');
        setTimeout(function () { XC.audio.play('chime'); }, 900);
        setTimeout(function () { writeEnv(R); R.rerender(); }, XC.fx.reduced() ? 50 : 1700);
      }, { icon: 'envelope', primary: true })));
      p2.appendChild(h('p.fine', null, u.privacy));
      body.appendChild(p2);
      w.appendChild(body); stage.appendChild(w); return;
    }
    /* 已開封（或沒有信封）：顯示承諾＋自評 */
    var left = h('div.un-left');
    if (opened) {
      var promise = env.promise || env.fields || [];
      var letter = h('div.letter.card-paper', null, h('p.lt-k', null, '第3節《知行橋工程隊》承諾信封' + (env.name ? '｜' + env.name : '')),
        h('dl.recap', null, promise.map(function (f) { return [h('dt', null, f.label), h('dd', null, f.value || '—')]; })));
      if (me.result === 'done') letter.appendChild(h('div.lt-stamp', { 'aria-label': '已蓋守約章' }, ui.seal(u.stamp, 'ding')));
      left.appendChild(letter);
    } else {
      left.appendChild(h('p.notice', null, u.none));
      left.appendChild(ui.field({ label: u.noneLabel, value: me.promise || '', rows: 3, max: 120, onInput: function (v) { me.promise = v; S.save(); } }));
    }
    body.appendChild(left);
    var p3 = K.panel('un-panel');
    p3.appendChild(h('p', null, h('b', null, '圈選：')));
    var picks = h('div.un-picks', { role: 'group', 'aria-label': '完成情況' });
    u.results.forEach(function (r) {
      var on = me.result === r.id;
      picks.appendChild(h('button.un-pick.card' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () {
        var was = me.result; me.result = r.id; S.save();
        var has = R.rec('me').badges.indexOf('shouyue') >= 0;
        if (r.id === 'done' && !has) R.award('me', 'shouyue');
        if (r.id !== 'done' && has && was === 'done') R.award('me', 'shouyue');
        XC.audio.play(r.id === 'done' ? 'stamp' : 'flip');
        if (opened || envState()) writeEnv(R);
        R.rerender();
      } } }, h('span.un-ring', { html: on ? '<svg viewBox="0 0 60 40" aria-hidden="true"><path d="M30 4c16 0 27 6 26 15S42 36 27 36 3 30 4 20 16 3 34 5"/></svg>' : '' }), h('b', null, r.name)));
    });
    p3.appendChild(picks);
    p3.appendChild(ui.field({ label: u.reasonLabel, value: me.reason || '', rows: 2, max: 80, placeholder: u.reasonPH, chips: R.support ? ['因為我忘記了', '因為遇到突發事情', '因為沒有完成標記', '因為承諾太大'] : null, onInput: function (v) { me.reason = v; S.save(); } }));
    if (me.result && me.result !== 'done') p3.appendChild(ui.field({ label: u.fixLabel, value: me.fix || '', rows: 2, max: 80, placeholder: u.fixPH, onInput: function (v) { me.fix = v; S.save(); } }));
    if (me.result === 'done') p3.appendChild(h('p.notice', null, '已蓋「守約章」，得「守約者」徽章。'));
    else if (me.result) p3.appendChild(h('p.notice', null, u.noScore + '未完成不扣分：想想橋哪裡要加固。'));
    p3.appendChild(h('div.task-acts', null, K.sbtn(u.saveBtn, function () { writeEnv(R); ui.toast(opened ? '開封回報已存回回顧盒' : '承諾回報已存入回顧盒'); XC.audio.play('chime'); }, { icon: 'box', primary: true })));
    p3.appendChild(h('p.fine', null, u.privacy));
    body.appendChild(p3);
    w.appendChild(body);
    stage.appendChild(w);
  };
  function stampFx(R, who) {
    var fx = h('div.stamp-fx', { 'aria-hidden': 'true' }, ui.seal(C().unseal.stamp, 'ding'), h('p.stamp-who', null, who));
    R.layer.appendChild(fx); XC.audio.play('stamp');
    setTimeout(function () { fx.classList.add('out'); setTimeout(function () { fx.remove(); }, 600); }, 1500);
  }

  /* ================= 環節二：事上磨煉是什麼 ================= */
  V['s1.compare'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var S = K.st(R, 'cmp'), me = S.me, shown = self ? !!me.pick : !!R.data('cmpShown');
    var w = h('div.cmp-v');
    w.appendChild(h('h2.center', null, c.compareQ));
    var row = h('div.cmp-row');
    c.compare.forEach(function (x) {
      var cls = (shown && x.id === 'mei' ? '.hl' : '') + (self && me.pick === x.id ? '.chosen' : '');
      var card = h('figure.cmp-card.card' + cls, null, h('div.sc-art-w', { html: art(x.look) }), h('figcaption', null, h('b', null, x.name), h('p', null, '「' + x.text + '」')));
      if (self) card.appendChild(K.sbtn(me.pick === x.id ? '我選了' + x.name : '選' + x.name, function () { me.pick = x.id; S.save(); XC.audio.play('flip'); R.rerender(); }, { icon: me.pick === x.id ? 'check' : 'eye', cls: 'sm', primary: me.pick === x.id }));
      row.appendChild(card);
    });
    w.appendChild(row);
    if (shown) w.appendChild(h('p.notice.center', null, c.compareNote));
    else if (!self) w.appendChild(h('div.task-acts', null, K.sbtn('舉手表決後・揭曉提示', function () { R.data('cmpShown', true); XC.audio.play('flip'); R.rerender(); }, { icon: 'eye', primary: true })));
    stage.appendChild(w);
  };
  V['s1.explain'] = function (R, sc, ph, stage) {
    var c = C(), e = c.explain;
    var w = h('div.scene-quote.l4-ex');
    w.appendChild(h('span.sq-tag', null, '事上磨煉'));
    w.appendChild(h('p', null, e.text));
    w.appendChild(h('div.ex-swim', null, h('div.sc-art-w', { html: art('swim') }), h('p', null, e.metaphor)));
    w.appendChild(h('p.fine', null, e.note));
    stage.appendChild(w);
  };
  V['s1.three'] = function (R, sc, ph, stage) {
    var c = C();
    var w = h('div.three-v');
    w.appendChild(h('h2.center', null, '煉鋼三問'));
    w.appendChild(h('div.three-q', null, c.threeQ.map(function (q, i) { return h('div.tq-card.card', { style: { animationDelay: (0.15 + i * 0.25) + 's' } }, h('span.tq-ico', { html: ui.icon(['flame', 'brush', 'ding'][i]) }), h('b', null, q)); })));
    w.appendChild(h('p.fine.center', null, c.threeNote));
    w.appendChild(h('div.rules.card', null, h('b', null, '遊戲規則'), h('ol', null, c.rules.map(function (r) { return h('li', null, r); }))));
    stage.appendChild(w);
  };

  /* ================= 環節三：煉鋼挑戰 ================= */
  V['s2.task'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.task-v');
    w.appendChild(K.head(R, '領任務與初步分工', null, h('div.step-bar', null, h('span.fine', null, c.taskNote), K.miniT(R, 'task', 180, '分工倒數'))));
    var row = h('div.case-row3.task-row');
    c.tasks.forEach(function (t) {
      var fig = h('figure.task-card.card', { 'data-t': t.id }, h('div.sc-art-w', { role: 'img', 'aria-label': t.alt, html: art(t.look) }),
        h('figcaption', null, h('span.case-id', null, '任務 ' + t.id), h('b', null, '「' + t.name + '」'), h('p', null, t.text)));
      if (self) {
        var on = taskOf(R) === t.id; if (on) fig.classList.add('chosen');
        fig.appendChild(K.sbtn(on ? '我選了這一個' : c.ui.pick, function () { var S = K.st(R, 'tk'); S.me.t = t.id; S.save(); XC.audio.play('flip'); R.rerender(); }, { icon: on ? 'check' : 'ding', primary: on, cls: 'sm' }));
      } else {
        var gs = St.groups().filter(function (g) { return taskOf(R, g.id) === t.id; });
        fig.appendChild(h('div.cf-groups', null, h('small', null, '負責組別（' + gs.length + '）：'), gs.map(function (g) {
          return h('button.gchip' + (g.id === R.sel ? '.cur' : ''), { type: 'button', title: '點一下改派到下一張任務卡', on: { click: function () { var m = R.data('taskOf') || {}; St.groups().forEach(function (x) { if (!m[x.id]) m[x.id] = taskOf(R, x.id); }); m[g.id] = 'ABC'[('ABC'.indexOf(m[g.id]) + 1) % 3]; R.data('taskOf', m); R.rerender(); } } }, g.name);
        })));
      }
      row.appendChild(fig);
    });
    w.appendChild(row);
    var body = h('div.cs-body');
    var plan = K.panel('plan-box');
    plan.appendChild(h('h3', null, '初步計劃', h('small.budget', null, c.budget.label + '：' + c.budget.start + ' ' + c.budget.unit)));
    if (self) {
      var P = K.st(R, 'plan'), pm = P.me;
      plan.appendChild(h('p.fine', null, c.solo.intro));
      var grid = h('div.plan-grid');
      c.plan.forEach(function (f, i) { grid.appendChild(ui.field({ label: f, value: pm['f' + i] || '', rows: 1, max: 60, onInput: function (v) { pm['f' + i] = v; P.save(); } })); });
      plan.appendChild(grid);
    } else {
      plan.appendChild(h('p.fine', null, c.planNote));
      plan.appendChild(h('ol.plan-list', null, c.plan.map(function (f) { return h('li', null, f); })));
      plan.appendChild(h('div.role-mini', null, c.roles.map(function (r) { return h('span.chip.static', null, h('b', null, r.name), '・' + r.duty); })));
    }
    body.appendChild(plan);
    var right = K.panel('draw-box');
    if (self) {
      right.appendChild(h('h3', null, '你是統籌'));
      right.appendChild(h('div.role-mini', null, c.roles.map(function (r) { return h('span.chip.static' + (r.id === 'lead' ? '.on' : ''), null, h('b', null, r.name), '・' + r.duty); })));
      right.appendChild(h('p.fine', null, '三輪突發事件：缺席卡、分歧卡、失誤卡。每輪按三個承擔指標自我檢查得分（每輪最高 3 分）。'));
    } else {
      right.appendChild(h('h3', null, c.observerDraw.title));
      var d = R.data('obsDraw');
      if (d) {
        var tb = h('div.draw-tb', { role: 'table', 'aria-label': '各輪觀察員' });
        tb.appendChild(h('div.dt-row.dt-h', { role: 'row' }, h('span', { role: 'columnheader' }, '組別'), c.rounds.map(function (r) { return h('span', { role: 'columnheader' }, r.no); })));
        St.groups().forEach(function (g) { tb.appendChild(h('div.dt-row' + (g.id === R.sel ? '.cur' : ''), { role: 'row' }, h('b', { role: 'cell' }, g.name), (d[g.id] || []).map(function (mi) { var rn = roleOfMember(R, g.id, mi); return h('span', { role: 'cell' }, memberName(mi), rn ? h('small', null, rn) : null); }))); });
        right.appendChild(tb);
      } else right.appendChild(h('p.fine', null, '未抽籤。'));
      right.appendChild(h('div.task-acts', null, K.sbtn(c.observerDraw.btn, function () { drawObs(R); }, { icon: 'dice', cls: 'sm', primary: !d }), K.sbtn(c.ui.assign, function () { assign(R); }, { icon: 'dice', cls: 'sm' }), K.sbtn(c.ui.randomRoles, function () { K.randomRoles(R); }, { icon: 'dice', cls: 'sm' })));
      right.appendChild(h('p.fine', null, c.observerDraw.note));
    }
    body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
  };
  function obsForm(R, rk, gid) {
    var c = C(), self = !R.isClass(), g = obsOf(R, gid);
    var box = h('div.obs-form.card');
    box.appendChild(h('div.of-head', null, h('b', null, self ? '承擔指標自我檢查' : '觀察員記錄表'), h('small', null, self ? c.solo.checkNote : c.obsNote)));
    if (!self) { var ol = observerLine(R, gid, rk); if (ol) box.appendChild(h('p.of-who', null, ol)); }
    c.indicators.forEach(function (t, i) {
      var on = !!g[rk + 'i' + i];
      box.appendChild(h('button.of-tick' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { toggleTick(R, gid, rk, i); } } },
        h('span.of-box', { html: on ? ui.icon('check') : '' }), h('span.of-t', null, t), h('em', null, '1 分')));
    });
    var notes = R.data('obsNote') || {}, nk = gid + '_' + rk;
    box.appendChild(ui.field({ label: self ? '一行記錄：我做了什麼（可不寫）' : '一行具體行為記錄', multi: false, max: 80, noCount: true, value: notes[nk] || '', placeholder: c.obsPH, onInput: function (v) { var n = R.data('obsNote') || {}; n[nk] = v; R.data('obsNote', n); } }));
    box.appendChild(h('p.of-sum', null, roundOf(rk).no + ' 鋼度 ', h('b', null, ticks(R, gid, rk) + '／3'), '　每勾一格，錘打鋼條一下'));
    return box;
  }
  function eventCard(rk, merged) {
    var r = roundOf(rk);
    return h('figure.event-card.card.ev-' + rk, null, h('div.sc-art-w', { role: 'img', 'aria-label': r.card, html: art(r.look) }),
      h('figcaption', null, h('span.case-id', null, r.no + '・突發事件卡'), h('b', null, '「' + r.card + '」')));
  }
  function stanceCards(R) {
    var r = roundOf('r2'), wrap = h('div.stances', null, h('p.fine', null, '立場卡（' + r.holdTip + '）'));
    r.stances.forEach(function (s) {
      var face = h('span.st-face', null, h('b', null, s.role), h('span', null, s.text));
      var b = h('button.stance.card', { type: 'button', 'aria-label': '立場卡：' + s.role + '（按住顯示）' }, h('span.st-back', null, '立場卡', h('small', null, c4(s.role))), face);
      function show(e) { if (e) e.preventDefault(); b.classList.add('show'); ui.announce(s.role + '：' + s.text); }
      function hide() { b.classList.remove('show'); }
      b.addEventListener('pointerdown', show); b.addEventListener('pointerup', hide); b.addEventListener('pointerleave', hide); b.addEventListener('pointercancel', hide);
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') show(e); });
      b.addEventListener('keyup', hide); b.addEventListener('blur', hide);
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      wrap.appendChild(b);
    });
    return wrap;
    function c4(role) { return '給「' + role + '」'; }
  }
  function tuoPanel(R) {
    var r = roundOf('r2'), self = !R.isClass(), gid = R.cur(), all = R.data('tuo') || {}, me = all[gid] = all[gid] || {};
    var n = self ? 1 : 4, done = 0; for (var i = 0; i < n; i++) if (me[i]) done++;
    var p = h('div.tuo.card', null, h('b', null, '脫角'), h('p.tuo-line', null, '「' + r.tuo + '」'));
    var row = h('div.tuo-row');
    for (var k = 0; k < n; k++) (function (k) {
      var on = !!me[k];
      row.appendChild(h('button.tuo-b' + (on ? '.on' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { me[k] = !on; R.data('tuo', all); XC.audio.play(on ? 'click' : 'flip'); R.rerender(); } } }, on ? h('span', { html: ui.icon('check') }) : null, self ? '我已脫角' : memberName(k)));
    })(k);
    p.appendChild(row);
    p.appendChild(h('p.fine', null, done >= n ? '全部已脫角：剛才只是演角色。' : (self ? '點一下確認。' : '每人點一下確認（' + done + '／4）。')));
    return p;
  }
  function coinCut(R) {
    var b = C().budget;
    return h('div.coin-cut', { 'aria-label': '預算減半：' + b.start + ' 元變成 ' + b.cut + ' 元' }, h('span.cc-old', null, b.start), h('span.cc-ar', null, '→'), h('b.cc-new', null, b.cut + ' ' + b.unit));
  }
  function redoBtn(R) {
    var c = C(), gid = R.cur(), used = R.propUsed(gid, 'redo');
    var mt = K.miniT(R, 'redo_' + gid, c.redo.sec, c.redo.name + '重做');
    var box = h('div.redo.card' + (used ? '.used' : ''), null, h('span.redo-ico', { html: ui.icon('flame') }), h('div', null, h('b', null, c.redo.name), h('small', null, c.redo.text)));
    box.appendChild(K.sbtn(used ? c.redo.used : c.redo.use, function () {
      if (used) return;
      R.useProp(gid, 'redo', true);
      if (!R.isClass()) { var S = K.st(R, 'solo'); S.me.r3 = {}; S.save(); }
      XC.audio.play('lamp'); R.rerender();
      var m = R.stage.querySelector('.redo .mini-timer button'); if (m) m.click();
    }, { icon: used ? 'check' : 'reset', cls: 'sm', primary: !used, disabled: used }));
    if (used) box.appendChild(mt);
    return box;
  }
  function soloQ(R, rk) {
    var c = C(), q = c.solo.qs[RK.indexOf(rk)], S = K.st(R, 'solo'), me = S.me, a = me[rk] = me[rk] || {};
    var box = h('div.solo-q');
    box.appendChild(h('p.ask', null, q.ask));
    var opts = h('div.solo-opts');
    q.opts.forEach(function (o, i) {
      var on = a.pick === i;
      opts.appendChild(h('button.solo-opt' + (on ? '.on' : '') + (a.pick != null && o.best ? '.best' : ''), { type: 'button', 'aria-pressed': String(on), on: { click: function () { a.pick = i; S.save(); XC.audio.play('flip'); R.rerender(); } } }, h('span.so-n', null, 'ABCD'[i]), h('span', null, o.t)));
    });
    box.appendChild(opts);
    if (a.pick != null) box.appendChild(h('p.notice', null, q.opts[a.pick].fb, q.opts[a.pick].best ? '' : '　（參考：' + q.opts.filter(function (o) { return o.best; })[0].t + '）'));
    box.appendChild(ui.field({ label: q.short, value: a.txt || '', rows: 2, max: 120, chips: R.support && rk === 'r1' ? c.supportTips.sheet : null, onInput: function (v) { a.txt = v; S.save(); } }));
    box.appendChild(h('p.fine', null, '選項及解說為網站自撰，只作提示；計分只看右邊的承擔指標自我檢查。'));
    return box;
  }
  function roundView(R, sc, ph, stage) {
    var c = C(), rk = ph.id, r = roundOf(rk), self = !R.isClass(), m = rmode(R), gid = R.cur();
    var w = h('div.round-v.rv-' + rk);
    var skipped = (m === 'merge' && rk === 'r3') || (m === 'skip2' && rk === 'r2');
    if (skipped) {
      w.appendChild(h('div.scene-quote.small', null, h('span.sq-tag', null, r.no + '・' + r.card), h('p', null, m === 'merge' ? c.mergedText : c.skippedText),
        h('div.task-acts', null, K.sbtn(m === 'merge' ? '前往分享與歸納' : '前往輪三', function () { R.toPhase(m === 'merge' ? 'share' : 'r3'); }, { icon: 'next', primary: true }))));
      stage.appendChild(w); return;
    }
    var merged = m === 'merge' && rk === 'r2';
    var title = merged ? '輪二「分歧卡」＋「失誤卡」（合併）' : r.no + '「' + r.card + '」';
    w.appendChild(h('div.step-head', null, K.head(R, title, null, hintRow(R, rk)), h('div.step-bar', null, h('span.fine', null, self ? '單人決策版：你是統籌' : '模擬情境，輪後脫角'), K.miniT(R, rk, r.sec, r.no + '倒數')), taskStrip(R)));
    var body = h('div.cs-body.rv-body');
    var left = h('div.rv-left');
    var evs = h('div.ev-row', null, eventCard(rk, merged));
    if (merged) evs.appendChild(eventCard('r3', true));
    left.appendChild(evs);
    if (merged) left.appendChild(h('p.ev-text', null, c.mergedText));
    else left.appendChild(h('p.ev-text', null, r.text));
    if (rk === 'r2' && !self) left.appendChild(stanceCards(R));
    if (rk === 'r3' || merged) left.appendChild(h('div.ev-extra', null, coinCut(R), redoBtn(R)));
    if (self) left.appendChild(soloQ(R, rk));
    else {
      var sh = merged ? { title: '方案與補救', fields: roundOf('r2').sheet.fields.concat(roundOf('r3').sheet.fields) } : r.sheet;
      left.appendChild(h('div.sheet.card', null, h('b', null, sh.title), h('ol', null, sh.fields.map(function (f) { return h('li', null, f); })),
        R.support && rk === 'r1' ? h('div.sheet-sc', null, c.supportTips.sheet.map(function (s) { return h('span.chip.static', null, s); })) : null));
    }
    var right = h('div.rv-right');
    right.appendChild(forgeBox(R, gid, heatOf(R, gid), { label: R.gname(gid) + '的鋼條' }));
    right.appendChild(h('p.rv-score', null, R.gname(gid) + '　鋼度 ', h('b', null, R.score(gid) + '／' + (self ? 9 : maxOf(R))), '　', h('span.heat-name', null, heatName(heatOf(R, gid)) + '色')));
    right.appendChild(obsForm(R, rk, gid));
    if (rk === 'r2' || merged) right.appendChild(tuoPanel(R));
    if (self && rk === 'r3') right.appendChild(h('p.notice', null, c.solo.end));
    body.appendChild(left); body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
  }
  V['s2.r1'] = roundView; V['s2.r2'] = roundView; V['s2.r3'] = roundView;
  V['s2.share'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.share-v');
    if (self) {
      var me = K.st(R, 'solo').me;
      w.appendChild(h('h2.center', null, '我的煉鋼紀錄', h('small', null, '　鋼度 ' + R.score('me') + '／9')));
      var row = h('div.rep-cols');
      RK.forEach(function (rk, i) {
        var r = roundOf(rk), a = me[rk] || {}, q = c.solo.qs[i];
        row.appendChild(h('div.rep-col.card', null, h('span.case-id', null, r.no), h('b', null, '「' + r.card + '」'), h('p.fine', null, a.pick != null ? 'ABCD'[a.pick] + '．' + q.opts[a.pick].t : '未作答'), h('p', null, a.txt || '—'), h('p.of-sum', null, '鋼度 ', h('b', null, ticks(R, 'me', rk) + '／3'))));
      });
      w.appendChild(row);
      w.appendChild(forgeBox(R, 'me', heatOf(R, 'me'), { cls: 'mid', label: '我的鋼條', hammer: false }));
      w.appendChild(h('p.notice.center', null, c.solo.end));
      stage.appendChild(w); return;
    }
    w.appendChild(h('h2.center', null, '各組鋼度', h('small', null, '　按組號固定排列，不排序')));
    var grid = h('div.share-grid');
    var rs = activeRounds(R);
    St.groups().forEach(function (g) {
      var f = heatOf(R, g.id), t = taskById(taskOf(R, g.id));
      grid.appendChild(h('button.sh-card.card' + (g.id === R.sel ? '.cur' : ''), { type: 'button', on: { click: function () { R.select(g.id); } } },
        h('b', null, g.name), h('small', null, t ? '任務 ' + t.id : ''),
        h('span.steel-mini', { 'aria-hidden': 'true', style: { '--c': heatRGB(f), '--g': Math.max(0, f - 0.2).toFixed(2) } }),
        h('span.sh-n', null, '鋼度 ' + R.score(g.id) + '／' + maxOf(R)),
        h('span.sh-dots', { 'aria-label': rs.map(function (rk) { return roundOf(rk).no + ' ' + ticks(R, g.id, rk) + ' 分'; }).join('，') }, rs.map(function (rk) { return h('span.shd', null, h('small', null, roundOf(rk).no.slice(1)), [0, 1, 2].map(function (i) { return h('i' + (obsOf(R, g.id)[rk + 'i' + i] ? '.on' : '')); })); })),
        R.propUsed(g.id, 'redo') ? h('span.g-redo', null, '回爐') : null));
    });
    w.appendChild(grid);
    var P = pool(R);
    w.appendChild(h('p.center.sh-total', null, '全班鋼度 ', h('b', null, P.p), '　目標 ' + P.t + '（全班滿分的七成）'));
    w.appendChild(h('p.fine.center', null, c.noRanking));
    stage.appendChild(w);
  };

  /* ================= 環節四：磨煉日誌 ================= */
  function journalOpts() {
    var j = C().journal;
    return { key: 'jr', boxKey: 'journal', title: j.title, en: j.en, savedMsg: '磨煉日誌已存入回顧盒',
      fields: j.fields.map(function (f) { return { id: f.id, label: f.label }; }), extra: [{ id: 'exit', label: C().exit }] };
  }
  V['s3.explain'] = function (R, sc, ph, stage) {
    var c = C(), j = c.journal, w = h('div.explain');
    w.appendChild(h('h2.center', null, j.title, h('small.en', { lang: 'en' }, ' ' + j.en)));
    var cols = h('div.ex-cols.four');
    j.fields.forEach(function (f, i) { cols.appendChild(h('div.ex-col.card', null, h('span.ex-n', null, '①②③④'[i]), h('b', null, f.label))); });
    w.appendChild(cols);
    w.appendChild(h('p.center.jr-flow', null, j.flow.join('　→　')));
    w.appendChild(h('div.ex-sc', null, h('b', null, '句式支架：'), j.scaffolds.map(function (s) { return h('span.chip.static', null, s); })));
    stage.appendChild(w);
  };
  V['s3.journal'] = function (R, sc, ph, stage) {
    var c = C(), j = c.journal, self = !R.isClass();
    var w = h('div.jr-v');
    var card = K.cardForm(R, { key: 'jr', title: j.title, en: j.en, numbered: true, classNote: '課堂上同學填寫紙本磨煉日誌；此畫面可作示範。', fields: j.fields.map(function (f) { return { id: f.id, label: f.label, ph: f.ph, rows: 2, max: 160 }; }), scaffolds: j.scaffolds });
    var hr = hintRow(R, 'journal'); if (hr) card.insertBefore(hr, card.children[1]);
    w.appendChild(card);
    w.appendChild(K.cardActs(R, journalOpts()));
    if (self) w.appendChild(K.safety());
    stage.appendChild(w);
  };
  function praiseOpts() {
    var p = C().praise;
    return { key: 'pr', boxKey: 'praise', title: p.title, en: p.en, savedMsg: '讚賞卡已存入回顧盒（可下載 PNG 或列印送給對方）',
      fields: [{ id: 'to', label: p.to }, { id: 'saw', label: p.saw }, { id: 'felt', label: p.felt }] };
  }
  function vagueTip(text) {
    var p = C().praise, t = text || '';
    if (!t.trim()) return '';
    var hit = K.vague(t, p.vague); if (!hit.length) return '';
    var rest = t; p.vague.forEach(function (v) { rest = rest.split(v).join(''); });
    return ui.len(rest.replace(/[\s，。！？、,.!?「」…]/g, '')) < 8 ? p.vagueTip : '';
  }
  V['s3.praise'] = function (R, sc, ph, stage) {
    var c = C(), p = c.praise, self = !R.isClass();
    var w = h('div.pr-v');
    var tips = {};
    var card = K.cardForm(R, { key: 'pr', title: p.title, en: p.en, cls: 'praise-card', classNote: '課堂上每人為一位組員寫紙本讚賞卡，傳給對方。', fields: [
      { id: 'to', label: p.to, rows: 1, max: 20 }, { id: 'saw', label: p.saw, ph: p.sawPH, rows: 2, max: 120 }, { id: 'felt', label: p.felt, ph: p.feltPH, rows: 2, max: 80 }],
      onField: function (id, v) { if (tips[id]) tips[id].textContent = vagueTip(v); } });
    ['saw', 'felt'].forEach(function (id) {
      var fl = card.querySelector('[data-f="' + id + '"]'); if (!fl) return;
      tips[id] = h('p.tester-tip', { 'aria-live': 'polite' }, vagueTip((card.S.me.v || {})[id]));
      fl.appendChild(tips[id]);
    });
    card.appendChild(h('p.fine', null, p.rule));
    w.appendChild(card);
    w.appendChild(K.cardActs(R, praiseOpts()));
    w.appendChild(h('p.fine.center', null, '溫和提示只供參考，不會擋住儲存；籠統詞表放在內容檔 praise.vague。'));
    stage.appendChild(w);
  };

  /* ================= 環節五：煉鋼爐結算 ================= */
  function thermo(P) {
    var pct = (P.f * 100).toFixed(0);
    return h('div.thermo', { role: 'img', 'aria-label': '煉鋼爐溫度計：' + P.p + '／' + P.t },
      h('span.th-tube', null, h('i.th-fill', { style: { height: pct + '%' } }), [0.25, 0.5, 0.75].map(function (x) { return h('span.th-tick', { style: { bottom: (x * 100) + '%' } }); })),
      h('span.th-bulb'), h('span.th-top', null, '百煉成鋼'), h('b.th-n', null, P.p + '／' + P.t));
  }
  V['s4.furnace'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), P = pool(R), forged = P.f >= 1 && R.data('forged');
    var w = h('div.furnace-v' + (forged ? '.forged' : ''));
    w.appendChild(h('h2.center', null, self ? '我的煉鋼爐' : '全班煉鋼爐溫度計', h('small', null, '　鋼度 ' + P.p + '／' + P.t)));
    var body = h('div.fv-body');
    body.appendChild(thermo(P));
    body.appendChild(forgeBox(R, 'pool', P.f, { cls: 'big', hammer: false, label: '全班鋼條' }));
    w.appendChild(body);
    if (!self) {
      var row = h('div.poster-groups');
      St.groups().forEach(function (g) { var f = heatOf(R, g.id); row.appendChild(h('span.pg', null, h('b', null, g.name), h('span.steel-mini.sm', { 'aria-hidden': 'true', style: { '--c': heatRGB(f), '--g': Math.max(0, f - 0.2).toFixed(2) } }), h('small', null, R.score(g.id)))); });
      w.appendChild(row);
    }
    if (forged) w.appendChild(h('p.mv-line', null, c.furnaceLine.zh, St.settings.englishSubs ? h('small.en', { lang: 'en' }, c.furnaceLine.en) : null, h('small.fine', null, '（' + c.furnaceLine.src + '）')));
    w.appendChild(h('div.task-acts', null, K.sbtn(c.ui.goalBtn, function () { forge(R); }, { icon: 'flame', primary: true }),
      forged ? K.sbtn('再煉一次', function () { forge(R, true); }, { icon: 'play', cls: 'sm' }) : null));
    if (P.f < 1) w.appendChild(h('p.fine.center', null, self ? '自我檢查鋼度達 ' + P.t + '（滿分 9 的七成），鋼條就會百煉成鋼。' : '仍欠 ' + (P.t - P.p) + ' 鋼度（目標預設為全班滿分的七成，可在教師控制台修改；老師也可在教師面板手動觸發動畫）。'));
    if (self) w.appendChild(h('p.notice.center', null, c.solo.end));
    stage.appendChild(w);
  };
  function forge(R, force) {
    var P = pool(R);
    if (P.f < 1 && !force) { ui.toast('鋼度已注入煉鋼爐；還欠 ' + (P.t - P.p) + '，就百煉成鋼。'); XC.audio.play('drop'); return; }
    R.data('forged', true);
    if (R.phase().id !== 'furnace') { if (R.isClass()) XC.app.goalFx('l4'); return; }
    R.rerender();
    var v = R.stage.querySelector('.furnace-v'); if (!v) return;
    if (XC.fx.reduced()) { v.classList.add('forged'); if (R.isClass()) XC.app.goalFx('l4'); return; }
    v.classList.remove('forged'); v.classList.add('forging'); XC.audio.play('lamp');
    setTimeout(function () { XC.fx.burst(R.stageWrap); }, 900);
    setTimeout(function () { v.classList.remove('forging'); v.classList.add('forged', 'cooling'); XC.audio.play('chime'); }, 2600);
    setTimeout(function () { if (R.isClass()) XC.app.goalFx('l4'); else ui.toast('百煉成鋼：鋼條冷卻成青鋼。'); }, 4400);
  }
  V['s4.badges'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    if (self) {
      K.badges(R, stage, function (b) {
        var o = obsOf(R, 'me');
        if (b.id === 'shouyue' && K.st(R, 'un').me.result !== 'done') return '在「開封自評」圈選「完成」，就會得到「守約者」。';
        if (b.id === 'buwei' && !o.r1i0) return '輪一勾選了「主動說「我來」」，就可以為自己蓋「補位者」。';
        if (b.id === 'tiaojie' && !o.r2i1) return '輪二勾選了「聽完不同意見」，就可以為自己蓋「調解者」。';
        if (b.id === 'shouwei' && !o.r3i2) return '輪三勾選了「全組跟進執行」，就可以為自己蓋「收尾者」。';
        return null;
      });
      return;
    }
    K.badges(R, stage, null, ['buwei', 'tiaojie', 'shouwei']);
    var last = activeRounds(R).slice(-1)[0];
    var sug = function (fn) { var a = St.groups().filter(function (g) { return fn(obsOf(R, g.id)); }).map(function (g) { return g.name; }); return a.length ? a.join('、') : '暫未有'; };
    stage.appendChild(h('div.badge-sug.fine', null,
      h('p', null, '參考（依觀察員記錄表）：補位者——輪一有人主動說「我來」：' + sug(function (o) { return o.r1i0; }) + '。'),
      rmode(R) !== 'skip2' ? h('p', null, '調解者——輪二聽完不同意見並跟進：' + sug(function (o) { return o.r2i1 && o.r2i2; }) + '。') : null,
      h('p', null, '收尾者——' + roundOf(last).no + '全組跟進執行：' + sug(function (o) { return o[last + 'i2']; }) + '。'),
      h('p', null, '守約者已在環節一頒發（守約者 ' + (R.data('keepers') || 0) + ' 人，只記人數）。')));
  };
  V['s4.summary'] = function (R, sc, ph, stage) { K.summary(R, stage, sc.summary, '三句總結'); };
  V['s4.exit'] = function (R, sc, ph, stage) {
    var c = C();
    K.exit(R, stage, { key: 'jr', label: c.exit, chips: ['下次團隊遇到困難，我會先……'], preview: sc.nextPreview, quote: '承擔不是說出來的，是做出來的', classLead: '在日誌背面寫一句：',
      save: function () { K.saveCard(R, journalOpts()); }, saveLabel: '連同磨煉日誌存入回顧盒' });
  };
})();
