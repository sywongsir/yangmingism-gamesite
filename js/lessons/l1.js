/* 第1節《龍場闖關》點亮志燈 ── 遊戲邏輯（文字全部取自 js/content/l1.js） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state;
  var C = function () { return XC.content.l1; };
  var CFG = function () { return St.settings.l1 || XC.config.l1; };
  var L = XC.lessons.l1 = {};

  /* ---------- 意象：油燈、紙火焰、燈油瓶 ---------- */
  function lampSVG(score, big) {
    var f = Math.max(0, Math.min(1.35, score / 8));
    var lit = score > 0;
    return '<svg class="lamp' + (big ? ' big' : '') + (lit ? '' : ' out') + '" viewBox="0 0 60 72" aria-hidden="true">' +
      '<circle class="l-halo" cx="30" cy="30" r="27" style="opacity:' + (lit ? (0.25 + f * 0.55).toFixed(2) : 0) + '"/>' +
      '<g transform="translate(30 41) scale(' + (lit ? (0.35 + f * 0.65).toFixed(2) : 0.12) + ') translate(-30 -41)"><g class="flick">' +
      '<path class="f-out" d="M30 4C41 18 42 31 30 41C18 31 19 18 30 4Z"/><path class="f-in" d="M30 19C35 27 35 34 30 41C25 34 25 27 30 19Z"/></g></g>' +
      '<path class="l-bowl" d="M9 41C15 55 45 55 51 41Z"/><path class="l-stem" d="M27 52h6v9h-6zM17 61h26v5H17z"/></svg>';
  }
  function flameSVG() { return '<svg viewBox="0 0 24 32" aria-hidden="true"><path class="pf-o" d="M12 2C19 11 20 19 12 30C4 19 5 11 12 2Z"/><path class="pf-i" d="M12 13C15 18 15 23 12 30C9 23 9 18 12 13Z"/></svg>'; }
  function jarSVG(fill) {
    var y = 70 - 46 * Math.min(1, fill);
    return '<svg class="jar" viewBox="0 0 60 80" aria-hidden="true"><defs><clipPath id="jc' + Math.round(fill * 100) + Math.random().toString(36).slice(2, 5) + '"></clipPath></defs>' +
      '<path class="j-oil" d="M12 ' + y + 'H48V66C48 72 44 74 30 74S12 72 12 66Z" style="opacity:' + (fill > 0 ? 1 : 0) + '"/>' +
      '<path class="j-glass" d="M22 6h16v8c10 4 14 10 14 20v32c0 7-6 10-22 10S8 73 8 66V34c0-10 4-16 14-20z"/><path class="j-cap" d="M20 4h20v6H20z"/></svg>';
  }

  /* ---------- 小工具 ---------- */
  function st(R, key) { var all = R.data(key) || {}; var g = R.cur(); all[g] = all[g] || {}; return { all: all, me: all[g], save: function () { R.data(key, all); } }; }
  function award(R, key, field, delta, label, gid) {
    gid = gid || R.cur();
    var all = R.data(key) || {}; all[gid] = all[gid] || {};
    var prev = {}; prev[field] = all[gid][field];
    all[gid][field] = true; R.data(key, all);
    R.add(gid, delta, label, { st: key, gid: gid, set: prev });
  }
  function enough(t) { return ui.len(t) >= St.settings.minChars; }
  function panel(cls, night) { return h('div.panel.' + (night ? 'panel-night' : 'panel-paper') + (cls ? '.' + cls : '')); }
  function who(R) { return R.isClass() ? h('p.who', null, '目前組別：', h('b', null, R.gname()), h('small', null, '（點下方組別或按 1–' + Math.min(9, St.groups().length) + ' 切換）')) : null; }
  function safety() { return h('p.safety', null, XC.content.common.safetyTip); }
  function hintRow(R, key) { var b = R.hintBtn(key); return b ? h('div.hint-row', null, b) : null; }
  function sbtn(label, fn, o) { o = o || {}; return ui.btn(label, { icon: o.icon, primary: o.primary, cls: o.cls, disabled: o.disabled, onClick: fn }); }
  function lampOf(gid) { return document.querySelector('.ls-groups .grp[data-gid="' + gid + '"] .lamp'); }

  L.setup = function (R) { R.layer.classList.add('l1'); };

  /* ---------- 組別列：每組一盞燈 ---------- */
  L.stripItem = function (R, gid, el) {
    var r = R.rec(gid);
    el.innerHTML = '<span class="g-lamp">' + lampSVG(r.score) + '</span><span class="g-info"><span class="g-name">' + ui.esc(R.gname(gid)) + '</span>' +
      '<b class="g-score">' + r.score + '<small> 燈油</small></b><span class="g-props">' +
      (C().props.map(function (p) { return '<span class="g-prop' + (r.props[p.id] ? ' used' : '') + '" title="' + p.name + (r.props[p.id] ? '（已用）' : '（未用）') + '">' + ui.icon(p.id === 'redo' ? 'reset' : 'key') + '</span>'; }).join('')) + '</span></span>';
    el.setAttribute('aria-label', R.gname(gid) + '：燈油 ' + r.score + ' 點');
  };
  L.totalView = function (R, el) {
    var t = R.total(), tg = R.target(), n = Math.min(t, tg);
    el.innerHTML = '<span class="tv-l">志燈牆</span><span class="tv-dots" aria-hidden="true">' + Array.apply(null, Array(Math.min(tg, 48))).map(function (_, i) { return '<i class="' + (i < n ? 'on' : '') + '"></i>'; }).join('') +
      '</span><b class="tv-n">' + t + '<small>／' + tg + '</small></b>';
    el.setAttribute('aria-label', '全班合計燈油 ' + t + ' 點，志燈牆目標 ' + tg + ' 枚');
  };
  L.onScore = function (R, gid, d) {
    var lp = lampOf(gid); if (!lp) return;
    if (d > 0) { XC.fx.bloom(lp.parentNode); var src = R.stage.querySelector('.oil-src') || R.stage; XC.fx.fly(src, lp, 'oil'); }
    else if (d < 0) XC.fx.dim(lp.parentNode);
  };
  L.onUndo = function (R, e) {
    var x = e.extra; if (!x || !x.st) return;
    var all = R.data(x.st) || {}; all[x.gid] = all[x.gid] || {};
    Object.keys(x.set || {}).forEach(function (k) { if (x.set[k] === undefined) delete all[x.gid][k]; else all[x.gid][k] = x.set[k]; });
    R.data(x.st, all);
  };
  L.onSelect = function (R) { var ph = R.phase(); if (ph.layout === 'task' || ph.id === 'badges') R.rerender(); };
  L.leave = function (R) { if (R._mts) R._mts.forEach(function (m) { m.stop(); }); };

  /* ---------- 旁白特效 ---------- */
  L.onLine = function (R, line, i, ph) {
    ui.$$('.fx-tmp', R.stage).forEach(function (n) { n.remove(); });
    if (line.fx === 'brushFlame') brushFx(R.stage);
    if (line.fx === 'burst') XC.fx.burst(R.stageWrap);
    if (line.fx === 'title') titleFx(R.stage, line.zh, line.en);
    if (R.scene().id === 's3' && ph.id === 'reveal') {
      var card = R.stage.querySelector('.rv-final');
      if (card) card.classList.toggle('show', i >= (ph.narration.length - 1));
    }
  };
  function brushFx(host) {
    var w = h('div.fx-tmp.fx-brush', { 'aria-hidden': 'true' });
    w.innerHTML = '<svg viewBox="0 0 600 220"><path class="bs" d="M40 150C140 120 260 108 360 112S520 128 560 120"/><g class="bf" transform="translate(560 120)"><path class="f-out" d="M0-96C30-56 32-20 0 6C-32-20-30-56 0-96Z"/><path class="f-in" d="M0-50C14-30 14-12 0 6C-14-12-14-30 0-50Z"/></g></svg>';
    host.appendChild(w); XC.audio.play('lamp');
  }
  function titleFx(host, zh, en) {
    var w = h('div.fx-tmp.fx-title', null, h('h2.cal-title', null, h('span.st-line', { 'aria-hidden': 'true' }), h('span', null, zh)), St.settings.englishSubs && en ? h('p.en.it', { lang: 'en' }, en) : null);
    host.appendChild(w);
  }

  /* ---------- 討論：提問與參考答案 ---------- */
  function discuss(R, sc, stage) {
    var w = h('div.discuss');
    var self = !R.isClass(), ans = st(R, 'ans_' + sc.id);
    (sc.questions || []).forEach(function (q, i) {
      var box = panel('q-card');
      box.appendChild(h('p.q-no', null, '提問' + (sc.questions.length > 1 ? '一二三'[i] : '')));
      box.appendChild(h('h3.q-q', null, q.q));
      if (self) {
        var f = ui.field({ label: '我的想法（可不寫）', value: ans.me['q' + i] || '', rows: 2, chips: R.support ? C().reasonChips : null, onInput: function (v) { ans.me['q' + i] = v; ans.save(); } });
        box.appendChild(f);
      }
      var ref = h('div.q-ref', { hidden: true }, h('b', null, self ? '參考分析：' : '參考答案：'), q.ref);
      box.appendChild(sbtn(self ? '看參考分析' : '顯示參考答案', function (e) { ref.hidden = !ref.hidden; e.currentTarget.setAttribute('aria-pressed', String(!ref.hidden)); if (!ref.hidden) XC.audio.play('flip'); }, { icon: 'eye', cls: 'sm' }));
      box.appendChild(ref);
      w.appendChild(box);
    });
    if (sc.feedback) {
      var fb = h('blockquote.feedback', { hidden: !self || null }, '「' + sc.feedback + '」');
      w.appendChild(h('div.fb-wrap', null, R.isClass() ? sbtn('顯示教師回饋', function () { fb.hidden = !fb.hidden; }, { icon: 'brush', cls: 'sm' }) : null, fb));
    }
    stage.appendChild(w);
  }

  /* ---------- 主繪畫 ---------- */
  L.render = function (R, sc, ph, stage) {
    var k = sc.id + '.' + ph.id, fn = V[k];
    if (fn) fn(R, sc, ph, stage);
    else if (ph.id === 'discuss') discuss(R, sc, stage);
  };
  var V = {};

  /* 環節一：夜行令 */
  V['s0.open'] = function (R, sc, ph, stage) {
    var c = C();
    stage.appendChild(h('div.ls-home', null,
      h('p.lh-no', null, '第' + c.no + '節'),
      h('h2.lh-game', null, '《' + c.game + '》', h('span', null, c.tagline)),
      h('p.lh-title', null, c.title),
      h('p.lh-tags', null, h('span.tag.tag-value', null, '價值觀：' + c.value), h('span.tag', null, '層次：' + c.level), h('span.tag', null, '學習產出：' + c.output)),
      h('div.lh-q', null, h('span', null, '核心提問'), h('p', null, c.coreQuestion)),
      h('details.lh-focus', null, h('summary', null, '學習重點'), h('ol', null, c.focus.map(function (f) { return h('li', null, f); })), h('p.fine', null, c.valueLink))));
  };
  V['s0.wall'] = function (R, sc, ph, stage) {
    var c = C();
    var wrap = h('div.night-wall');
    wrap.appendChild(h('h2.nw-title', null, c.ui.wallTitle));
    if (R.isClass()) {
      var notes = R.data('wall') || [];
      var board = h('div.nw-board', { 'aria-live': 'polite' });
      if (!notes.length) board.appendChild(h('p.nw-empty', null, c.ui.wallEmpty));
      notes.forEach(function (t, i) { board.appendChild(h('div.sticky', { style: { '--rot': ((i % 2 ? 1 : -1) * (1.5 + i % 3)) + 'deg', animationDelay: (i * 0.25) + 's' } }, t)); });
      wrap.appendChild(board);
    } else {
      var me = st(R, 'note');
      wrap.appendChild(panel('nw-self', true));
      var p = wrap.lastChild;
      p.appendChild(ui.field({ label: c.ui.selfNote, value: me.me.text || '', rows: 3, max: 200, onInput: function (v) { me.me.text = v; me.save(); } }));
      p.appendChild(h('p.fine', null, '不用署名，不要寫別人的名字。這張便條只存在這部裝置。'));
      p.appendChild(safety());
    }
    var q = sc.questions[0];
    wrap.appendChild(h('div.nw-q', null, h('span', null, '提問'), h('p', null, q.q)));
    stage.appendChild(wrap);
  };
  V['s0.announce'] = function (R, sc, ph, stage) {
    var c = C(), w = h('div.announce');
    var legend = h('div.role-legend');
    c.roles.forEach(function (r) { legend.appendChild(h('div.role-card.card', null, h('b', null, r.name), h('span', null, r.duty))); });
    w.appendChild(legend);
    w.appendChild(h('p.fine.center', null, c.rolesNote));
    var src = h('div.oil-src', { 'aria-hidden': 'true' }, h('span', { html: flameSVG() }));
    w.appendChild(src);
    var acts = h('div.task-acts');
    acts.appendChild(sbtn(c.ui.fillOil, function () { fillOil(R); }, { icon: 'lamp', primary: true }));
    if (R.isClass()) acts.appendChild(sbtn(c.ui.randomRoles, function () { randomRoles(R); }, { icon: 'dice' }));
    w.appendChild(acts);
    if (R.isClass()) {
      var roles = R.data('roles');
      if (roles) {
        var grid = h('div.role-grid');
        St.groups().forEach(function (g, gi) {
          var row = h('div.rg-row', null, h('b.rg-g', null, g.name));
          (roles[g.id] || [0, 1, 2, 3]).forEach(function (ri, m) {
            var r = c.roles[ri];
            row.appendChild(h('span.rg-c', { style: { animationDelay: (gi * 0.06 + m * 0.05) + 's' } }, h('small', null, '組員' + '一二三四'[m]), r.name));
          });
          grid.appendChild(row);
        });
        w.appendChild(grid);
      }
    } else {
      w.appendChild(h('p.center', null, '自學時，你一人兼任四個角色；你的燈有 ' + c.resource.start + ' 點燈油。'));
    }
    stage.appendChild(w);
  };
  function fillOil(R) {
    var src = R.stage.querySelector('.oil-src');
    var ids = R.isClass() ? St.groups().map(function (g) { return g.id; }) : ['me'];
    ids.forEach(function (gid, i) {
      var lp = lampOf(gid);
      for (var k = 0; k < 5; k++) XC.fx.fly(src, lp, 'oil', i * 90 + k * 140);
      setTimeout(function () { if (lp) XC.fx.bloom(lp.parentNode); XC.audio.play('lamp'); }, i * 90 + 900);
    });
    R.data('filled', true);
    ui.announce((R.isClass() ? '每組' : '你的燈') + '注入 ' + C().resource.start + ' 點燈油');
  }
  function randomRoles(R) {
    var roles = {};
    St.groups().forEach(function (g) { var a = [0, 1, 2, 3]; for (var i = 3; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } roles[g.id] = a; });
    R.data('roles', roles); XC.audio.play('flip'); R.rerender(); ui.announce('已為每組隨機分配角色');
  }

  /* 環節二：志向試金石 */
  V['s1.task'] = function (R, sc, ph, stage) {
    var c = C(), S = st(R, 'tq'), me = S.me, self = !R.isClass();
    me.stars = me.stars || {};
    var w = h('div.touch');
    w.appendChild(h('div.task-head', null, h('h2', null, '志向試金石'), who(R), hintRow(R, 'touchstone')));
    if (R.support) w.appendChild(threeQAid());
    var tray = h('div.star-tray', null, h('span', null, c.ui.starTray), h('button.star-src', { type: 'button', 'aria-label': '星星（拖到格子上；或直接點選格子）', html: ui.icon('star') }));
    w.appendChild(tray);
    var cards = h('div.case-row');
    c.cases.forEach(function (cs) {
      var stars = me.stars[cs.id] = me.stars[cs.id] || {};
      var card = h('div.case-card.card', { 'data-case': cs.id }, h('span.case-id', null, '案例卡 ' + cs.id), h('p.case-t', null, cs.text));
      var slots = h('div.slots');
      c.threeQ.forEach(function (q) {
        var on = !!stars[q.id];
        var s = h('button.slot' + (on ? '.on' : ''), { type: 'button', 'data-q': q.id, 'aria-pressed': String(on), 'aria-label': '案例卡' + cs.id + '：' + q.text + (on ? '，已貼星' : '，未貼星'), on: { click: function () { toggle(); } } },
          h('span.slot-star', { html: ui.icon('star') }), h('small', null, q.short));
        function toggle(v) { stars[q.id] = v === undefined ? !stars[q.id] : v; S.save(); s.classList.toggle('on', !!stars[q.id]); s.setAttribute('aria-pressed', String(!!stars[q.id])); XC.audio.play(stars[q.id] ? 'lamp' : 'click'); if (stars[q.id]) XC.fx.bloom(s); }
        s._toggle = toggle;
        slots.appendChild(s);
      });
      card.appendChild(slots);
      if (me.submitted && self) {
        var cmp = h('div.cmp');
        c.threeQ.forEach(function (q) {
          var mine = !!stars[q.id], ref = cs.ref.indexOf(q.id) >= 0;
          cmp.appendChild(h('span.cmp-i' + (mine === ref ? '.same' : '.diff'), null, q.short + '：' + (mine === ref ? c.ui.same : c.ui.diff)));
        });
        card.appendChild(h('div.ref-box', null, h('p', null, h('b', null, c.ui.yourStars + ' ／ ' + c.ui.refStars)), cmp, h('p.fine', null, '參考分析：' + cs.refNote)));
      }
      cards.appendChild(card);
    });
    w.appendChild(cards);
    starDrag(tray.querySelector('.star-src'), cards);

    if (self) {
      var form = h('div.task-form');
      var pick = h('select.inp', { 'aria-label': c.ui.bestPick }, h('option', { value: '' }, '請選擇'), c.cases.map(function (cs) { return h('option', { value: cs.id, selected: me.best === cs.id || null }, '案例卡 ' + cs.id); }));
      pick.onchange = function () { me.best = pick.value; S.save(); };
      form.appendChild(h('label.fld.inline', null, h('span.fld-l', null, c.ui.bestPick), pick));
      form.appendChild(ui.field({ label: c.ui.bestReason, value: me.reason || '', rows: 2, minHint: true, chips: R.support ? c.taskChips : null, onInput: function (v) { me.reason = v; S.save(); } }));
      var miss = h('select.inp', { 'aria-label': c.ui.missPick }, h('option', { value: '' }, '請選擇'), c.cases.map(function (cs) { return h('option', { value: cs.id, selected: me.missCase === cs.id || null }, '案例卡 ' + cs.id); }));
      miss.onchange = function () { me.missCase = miss.value; S.save(); };
      var mq = h('select.inp', { 'aria-label': '缺了哪一問' }, h('option', { value: '' }, '缺了哪一問'), c.threeQ.map(function (q) { return h('option', { value: q.id, selected: me.missQ === q.id || null }, q.text); }));
      mq.onchange = function () { me.missQ = mq.value; S.save(); };
      form.appendChild(h('div.fld.inline', null, h('span.fld-l', null, c.ui.missPick), miss, mq));
      form.appendChild(ui.field({ label: c.ui.improve, value: me.improve || '', rows: 2, minHint: true, onInput: function (v) { me.improve = v; S.save(); } }));
      form.appendChild(h('div.task-acts', null, sbtn(c.ui.submit, function () {
        me.submitted = true; S.save();
        var kw = c.clueKeywords.some(function (k) { return (me.reason || '').indexOf(k) >= 0; });
        if (!me.reasonOk && me.best && enough(me.reason) && kw) award(R, 'tq', 'reasonOk', 1, c.ui.reasonOk);
        if (!me.improveOk && me.missCase && me.missQ && enough(me.improve)) award(R, 'tq', 'improveOk', 1, c.ui.improveOk);
        if (!(me.best && enough(me.reason) && kw)) ui.toast('追問：你的理由用了志向三問的哪一問？試試補上「為了什麼／做什麼／願意放下什麼」。', 4200);
        R.rerender(); XC.fx.burst(R.stageWrap);
      }, { primary: true, icon: 'check' }), challengeBtn(R)));
      w.appendChild(form);
    } else {
      w.appendChild(classAwards(R, 'tq', [{ f: 'reasonOk', label: c.ui.reasonOk }, { f: 'improveOk', label: c.ui.improveOk }], challengeBtn(R)));
    }
    stage.appendChild(w);
  };
  function threeQAid() {
    var c = C(), icons = ['lamp', 'brush', 'hourglass'];
    return h('div.aid-3q', { role: 'note', 'aria-label': '志向三問提示卡' }, c.threeQ.map(function (q, i) { return h('div.aid-q', null, h('span', { html: ui.icon(icons[i]) }), h('b', null, '①②③'[i] + ' ' + q.text)); }));
  }
  function classAwards(R, key, list, extra) {
    var S = st(R, key);
    var row = h('div.task-acts.class-aw', null, h('span.aw-who', null, '為 ' + R.gname() + '：'));
    list.forEach(function (it) {
      var done = !!S.me[it.f];
      row.appendChild(sbtn(it.label + (done ? '（已加）' : ''), function () { if (S.me[it.f]) return; award(R, key, it.f, 1, it.label); R.rerender(); }, { icon: 'lamp', primary: !done, disabled: done }));
    });
    if (extra) row.appendChild(extra);
    return row;
  }
  function challengeBtn(R) {
    var c = C();
    return sbtn(c.challenge.title, function () {
      var saved = (St.box().l1 || {}).challenge, vals = {};
      var body = h('div', null, h('p', null, c.challenge.text), h('p.fine', null, '案例卡 A：' + c.cases[0].text));
      var inputs = c.challenge.fields.map(function (f, i) {
        var v = saved && saved.fields[i] ? saved.fields[i].value : '';
        var fl = ui.field({ label: f, value: v, rows: i ? 1 : 2, noCount: i > 0 }); body.appendChild(fl); return fl.input;
      });
      ui.modal({ title: c.challenge.title, body: body, actions: [{ label: '關閉' }, { label: '存入回顧盒', primary: true, icon: 'box', onClick: function () {
        St.saveBoxItem('l1', 'challenge', { type: 'challenge', title: '挑戰任務：改寫案例卡 A', fields: c.challenge.fields.map(function (f, i) { return { label: f, value: inputs[i].value }; }), footer: '挑戰任務' });
        ui.toast('已存入回顧盒');
      } }] });
    }, { icon: 'mountain', cls: 'sm' });
  }
  /* 星星拖放（指標）；格子亦可直接點選（鍵盤） */
  function starDrag(src, area) {
    var ghost = null;
    src.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      ghost = h('span.star-ghost', { html: ui.icon('star'), 'aria-hidden': 'true' }); document.body.appendChild(ghost);
      move(e); src.setPointerCapture(e.pointerId);
    });
    function move(e) { if (!ghost) return; ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; var t = hit(e); ui.$$('.slot.hover', area).forEach(function (s) { if (s !== t) s.classList.remove('hover'); }); if (t) t.classList.add('hover'); }
    function hit(e) { var el = document.elementFromPoint(e.clientX, e.clientY); return el && el.closest ? el.closest('.slot') : null; }
    src.addEventListener('pointermove', move);
    src.addEventListener('pointerup', function (e) { if (!ghost) return; ghost.remove(); ghost = null; var t = hit(e); ui.$$('.slot.hover', area).forEach(function (s) { s.classList.remove('hover'); }); if (t && t._toggle) t._toggle(true); });
    src.addEventListener('click', function () { ui.toast('把星星拖到案例卡的格子上；也可以直接點選格子。'); });
  }
  V['s1.reveal'] = function (R, sc, ph, stage) {
    var c = C();
    var row = h('div.case-row.sweep');
    c.cases.forEach(function (cs, i) { row.appendChild(h('div.case-card.card.mini', { style: { animationDelay: (i * 0.35) + 's' } }, h('span.case-id', null, '案例卡 ' + cs.id), h('p.case-t', null, cs.text))); });
    stage.appendChild(h('div.reveal-wrap', null, row, h('div.reveal-card', null, h('p.rv-1', null, sc.reveal.text), h('p.rv-2', null, sc.reveal.text2))));
    setTimeout(function () { XC.fx.burst(R.stageWrap); }, 900);
  };

  /* 環節三：失敗事件卡 */
  V['s2.task'] = function (R, sc, ph, stage) {
    var c = C(), S = st(R, 'ev'), me = S.me, self = !R.isClass();
    var w = h('div.events');
    w.appendChild(h('div.task-head', null, h('h2', null, '失敗事件卡'), who(R), hintRow(R, 'event')));
    var deck = h('div.ev-deck');
    c.events.forEach(function (ev, i) {
      var mine = me.event === ev.id;
      var fc = ui.flipCard(h('div.ev-front', null, h('span.ev-no', null, '事件卡 ' + '①②③④'[i]), h('p', null, ev.text)), h('div.ev-back', null, h('span', { html: ui.icon('bamboo') }), h('small', null, '事件卡')), { cls: 'ev-card' + (mine ? '.mine' : ''), backCls: 'back-bamboo' });
      if (mine) fc.classList.add('flipped');
      var b = h('button.ev-hit', { type: 'button', 'aria-label': mine ? '已抽：' + ev.text : '翻開事件卡' + '①②③④'[i], on: { click: function () { if (self && me.event && me.event !== ev.id) { ui.toast('自學模式已抽出一張事件卡'); return; } draw(ev.id); } } });
      fc.appendChild(b);
      deck.appendChild(fc);
    });
    w.appendChild(deck);
    function draw(id) { var prev = me.event; me.event = id; S.save(); R.rerender(); XC.audio.play('flip'); ui.announce(R.gname() + ' 抽到：' + c.events.filter(function (e) { return e.id === id; })[0].text); }
    var acts = h('div.task-acts');
    if (!me.event || !self) acts.appendChild(sbtn(c.ui.drawEvent + '（隨機）', function () { if (self && me.event) return; draw(c.events[Math.floor(Math.random() * c.events.length)].id); }, { icon: 'dice', cls: 'sm' }));
    w.appendChild(acts);
    if (me.event) {
      var rx = h('div.rx-row');
      c.reactions.forEach(function (r) {
        var chosen = me.reaction === r.id;
        rx.appendChild(h('button.rx-card.card' + (chosen ? '.chosen' : '') + (me.reaction && !chosen ? '.faded' : ''), { type: 'button', 'aria-pressed': String(chosen), disabled: (me.reaction && !chosen) || null, on: { click: function () { if (me.reaction) return; react(r.id); } } },
          h('span.rx-id', null, '反應牌 ' + r.id), h('p', null, '「' + r.text + '」')));
      });
      w.appendChild(rx);
      if (me.reaction && me.reaction !== 'C') {
        var used = R.propUsed(R.cur(), 'redo');
        var box = panel('rx-follow');
        if (self) box.appendChild(h('p.ask', null, h('b', null, '追問：'), c.reflectAsk[me.reaction]));
        box.appendChild(h('p', null, used ? '重來卡已經用過。' : c.ui.redoHint));
        if (!used) box.appendChild(sbtn(c.ui.redoUse, function () { useRedo(R, S); }, { icon: 'reset', primary: true }));
        w.appendChild(box);
      }
      if (self) {
        w.appendChild(ui.field({ label: c.ui.reasonLabel, value: me.reasonText || '', rows: 2, minHint: true, chips: R.support ? c.reasonChips : null, onInput: function (v) { me.reasonText = v; S.save(); } }));
        w.appendChild(h('div.task-acts', null, sbtn(me.reasonOk ? '理由已提交（+1）' : '提交理由', function () {
          if (me.reasonOk) return;
          if (!me.reaction) { ui.toast('先選一張反應牌'); return; }
          if (!enough(me.reasonText)) { ui.toast('追問：可以多說一點嗎？你為什麼這樣選？（建議最少 ' + St.settings.minChars + ' 字）', 3600); return; }
          award(R, 'ev', 'reasonOk', 1, c.ui.reasonOk); R.rerender();
        }, { icon: 'check', primary: !me.reasonOk, disabled: !!me.reasonOk })));
      } else {
        w.appendChild(classAwards(R, 'ev', [{ f: 'reasonOk', label: c.ui.reasonOk }]));
      }
    }
    stage.appendChild(w);
    function react(id) {
      var d = CFG().reaction[id];
      var all = R.data('ev') || {}; var g = R.cur(); all[g] = all[g] || {};
      var prev = { reaction: all[g].reaction, delta: all[g].delta };
      all[g].reaction = id; R.data('ev', all);
      var real = R.add(g, d, '反應牌 ' + id + '（' + (d > 0 ? '+' : '') + d + '）', { st: 'ev', gid: g, set: prev });
      all = R.data('ev'); all[g].delta = real; R.data('ev', all);
      if (id === 'C' && !R.isClass()) { var b = R.rec('me'); if (b.badges.indexOf('buqu') < 0) { /* 自學：不屈者 */ R.award('me', 'buqu'); } }
      R.rerender();
    }
  };
  function useRedo(R, S) {
    var g = R.cur(), all = R.data('ev') || {}, me = all[g] || {};
    var back = -(me.delta || 0);
    var prev = { reaction: me.reaction, delta: me.delta };
    me.reaction = undefined; me.delta = undefined; delete me.reaction; delete me.delta; all[g] = me; R.data('ev', all);
    R.useProp(g, 'redo', true);
    R.add(g, back, '重來卡抵銷', { st: 'ev', gid: g, set: prev, prop: 'redo' });
    var lp = lampOf(g); if (lp) { lp.parentNode.classList.add('restore'); setTimeout(function () { lp && lp.parentNode.classList.remove('restore'); }, 1200); }
    R.stageWrap.classList.add('ink-rewind'); setTimeout(function () { R.stageWrap.classList.remove('ink-rewind'); }, 1000);
    ui.toast('重來卡：燈火回復，可以重新選擇。'); R.rerender();
  }
  V['s2.reveal'] = function (R, sc, ph, stage) {
    stage.appendChild(h('div.reveal-wrap', null,
      h('div.redo-card.card', null, h('span', { html: ui.icon('reset') }), h('b', null, '重來卡'), h('small', null, '失敗可以重來')),
      h('div.reveal-card', null, h('p.rv-1', null, sc.reveal.text), h('p.rv-2', null, sc.reveal.text2))));
    setTimeout(function () { XC.fx.burst(R.stageWrap); }, 700);
  };

  /* 環節四：長夜三抉擇 */
  V['s3.nights'] = function (R, sc, ph, stage) {
    var c = C(), S = st(R, 'nt'), me = S.me, self = !R.isClass();
    var ni = me._cur || 0; if (R.isClass()) ni = R.data('ntCur') || 0;
    var night = c.nights[ni];
    var w = h('div.nights');
    var tabs = h('div.n-tabs', { role: 'tablist', 'aria-label': '三夜' });
    c.nights.forEach(function (n, i) {
      var done = !!(me[n.id] && me[n.id].opt);
      tabs.appendChild(h('button.n-tab', { type: 'button', role: 'tab', 'aria-selected': String(i === ni), on: { click: function () { if (R.isClass()) R.data('ntCur', i); else { me._cur = i; S.save(); } R.rerender(); } } }, n.name, done ? h('span.n-done', { html: ui.icon('check') }) : null));
    });
    w.appendChild(h('div.task-head', null, h('h2', null, '長夜三抉擇'), who(R), hintRow(R, 'nights')));
    w.appendChild(tabs);
    R._mts = R._mts || [];
    R._mtMap = R._mtMap || {};
    if (!R._mtMap[night.id]) { R._mtMap[night.id] = XC.miniTimer(90, night.name.replace(/「.*」/, '') + '倒數'); R._mts.push(R._mtMap[night.id]); }
    var body = h('div.n-body');
    body.appendChild(h('figure.n-card.card', null, h('img', { src: night.img, alt: night.alt, loading: 'lazy' }), h('figcaption', null, h('b', null, night.name), h('p', null, night.situation))));
    var right = h('div.n-right');
    right.appendChild(R._mtMap[night.id]);
    var rec = me[night.id] = me[night.id] || {};
    var acts = CFG().actionChoices[night.id] || [];
    var opts = h('div.n-opts');
    var counts = {};
    if (R.isClass()) { var all = R.data('nt') || {}; Object.keys(all).forEach(function (g) { var o = all[g][night.id] && all[g][night.id].opt; if (o) counts[o] = (counts[o] || 0) + 1; }); }
    night.options.forEach(function (o) {
      var chosen = rec.opt === o.id;
      var b = h('button.n-opt.card' + (chosen ? '.chosen' : ''), { type: 'button', 'aria-pressed': String(chosen), on: { click: function () { choose(o.id); } } },
        h('span.n-oid', null, o.id), h('span.n-ot', null, o.text),
        R.isClass() && counts[o.id] ? h('span.n-cnt', { title: '選了這項的組數（不顯示組名）' }, Array(counts[o.id] + 1).join('●')) : null);
      opts.appendChild(b);
    });
    right.appendChild(opts);
    function choose(id) {
      if (self && rec.submitted) { ui.toast('這一夜已提交'); return; }
      rec.opt = id; S.save(); XC.audio.play('click'); R.rerender();
    }
    if (self) {
      right.appendChild(ui.field({ label: '理由', value: rec.reason || '', rows: 2, minHint: true, chips: R.support ? c.reasonChips : null, onInput: function (v) { rec.reason = v; S.save(); } }));
      right.appendChild(h('div.task-acts', null, sbtn(rec.submitted ? '已提交' : '提交這一夜的抉擇', function () {
        if (rec.submitted) return;
        if (!rec.opt) { ui.toast('先選一個行動'); return; }
        var prevSub = rec.submitted; rec.submitted = true; S.save();
        if (acts.indexOf(rec.opt) >= 0) award(R, 'nt', '_' + night.id + 'a', 1, c.ui.actionOk + '（' + night.name + '）');
        else ui.toast('追問：這個選擇之後，你下一步可以做的是什麼？', 3600);
        if (enough(rec.reason)) award(R, 'nt', '_' + night.id + 'r', 1, c.ui.reasonOk + '（' + night.name + '）');
        if (ni < 2) { me._cur = ni + 1; S.save(); }
        R.rerender();
      }, { primary: !rec.submitted, icon: 'check', disabled: !!rec.submitted })));
      if (c.nights.every(function (n) { return me[n.id] && me[n.id].submitted; })) right.appendChild(h('p.notice', null, '三夜已完成。按「下一步」看揭曉卡，比較你的決定與陽明的做法。'));
    } else {
      var aw = h('div.task-acts.class-aw', null, h('span.aw-who', null, '為 ' + R.gname() + '（' + night.name + '）：'));
      var fa = '_' + night.id + 'a', fr = '_' + night.id + 'r';
      var isAct = rec.opt && acts.indexOf(rec.opt) >= 0;
      aw.appendChild(sbtn(c.ui.actionOk + (me[fa] ? '（已加）' : ''), function () { if (me[fa]) return; award(R, 'nt', fa, 1, c.ui.actionOk + '（' + night.name + '）'); R.rerender(); }, { icon: 'lamp', primary: !me[fa] && isAct, disabled: !!me[fa] }));
      aw.appendChild(sbtn(c.ui.reasonOk + (me[fr] ? '（已加）' : ''), function () { if (me[fr]) return; award(R, 'nt', fr, 1, c.ui.reasonOk + '（' + night.name + '）'); R.rerender(); }, { icon: 'lamp', primary: !me[fr], disabled: !!me[fr] }));
      right.appendChild(aw);
      right.appendChild(h('p.fine', null, '預設判定（老師按理由最後決定）：' + night.name + ' 採取行動＝' + acts.join('、') + (rec.opt ? '｜' + R.gname() + ' 選了 ' + rec.opt : '')));
    }
    body.appendChild(right);
    w.appendChild(body);
    stage.appendChild(w);
  };
  V['s3.reveal'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var card = h('div.rv-final.reveal-card', null, h('h3', null, '揭曉卡'), h('p.rv-1', null, c.revealCard), h('p.rv-2', null, c.revealAfter));
    if (self) {
      var me = st(R, 'nt').me, ul = h('ul.rv-mine');
      c.nights.forEach(function (n) { var r = me[n.id] || {}; var o = n.options.filter(function (x) { return x.id === r.opt; })[0]; ul.appendChild(h('li', null, n.name + '：' + (o ? o.id + '「' + o.text + '」' : '（未選）'))); });
      card.appendChild(h('div.rv-cmp', null, h('b', null, '比較：你的三夜決定'), ul));
    }
    stage.appendChild(card);
  };
  V['s3.clues'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var data = R.data('jars') || { c1: [], c2: [], c3: [] };
    var cap = self ? 1 : Math.max(2, Math.ceil(St.groups().length / 3));
    var full = c.clues.every(function (cl) { return (data[cl.id] || []).length >= cap; });
    var w = h('div.clues' + (full ? '.all-full' : ''));
    w.appendChild(h('div.task-head', null, h('h2', null, '燈油線索'), self ? null : who(R), hintRow(R, 'clues')));
    w.appendChild(h('div.big-lamp', { html: lampSVG(full ? 12 : 3 + Object.keys(data).reduce(function (a, k) { return a + (data[k] || []).length; }, 0), true) }));
    var jars = h('div.jars');
    var pending = null;
    c.clues.forEach(function (cl, i) {
      var list = data[cl.id] || [];
      var jar = h('div.jar-box', { 'data-jar': cl.id },
        h('div.jar-fig', { html: jarSVG(list.length / cap) }),
        h('b', null, '①②③'[i] + ' ' + cl.name), h('small', null, '（' + cl.note + '）'),
        h('ul.jar-list', null, list.map(function (t) { return h('li', null, t); })));
      jar.appendChild(sbtn(self ? '放入這瓶' : '放入（' + R.gname() + '）', function () { put(cl.id); }, { icon: 'plus', cls: 'sm' }));
      jars.appendChild(jar);
    });
    w.appendChild(jars);
    var inp = ui.field({ label: c.ui.clueInput, multi: false, max: 40, noCount: true, value: '' });
    w.insertBefore(h('div.clue-in', null, inp), jars);
    w.appendChild(h('p.fine.center', null, c.cluesNote));
    stage.appendChild(w);
    function put(id) {
      var t = inp.input.value.trim();
      var label = self ? (t || '我的線索') : (R.gname() + (t ? '：' + t : ''));
      data[id] = data[id] || [];
      if (self && data[id].length >= 1) { ui.toast('這一瓶已有你的線索'); return; }
      data[id].push(label); R.data('jars', data);
      XC.audio.play('lamp');
      R.rerender();
      var nowFull = c.clues.every(function (cl) { return (data[cl.id] || []).length >= cap; });
      if (nowFull && !full) setTimeout(function () { XC.fx.burst(R.stageWrap); ui.announce('三瓶注滿，燈火更亮'); }, 200);
    }
  };
  L.teacherTools = function (R, sc, ph, el) {
    var c = C();
    if (sc.id === 's0' && ph.id === 'wall') {
      var notes = R.data('wall') || [];
      var inp = h('input.inp', { type: 'text', maxlength: 60, placeholder: c.ui.wallInput, 'aria-label': c.ui.wallInput });
      el.appendChild(h('p', null, h('b', null, '長夜牆便利貼（已過目，2 至 3 張）')));
      el.appendChild(h('div.t-row', null, inp, sbtn('加到長夜牆', function () { var v = inp.value.trim(); if (!v) return; notes.push(v); R.data('wall', notes); R.rerender(); }, { icon: 'plus', cls: 'sm' })));
      notes.forEach(function (t, i) { el.appendChild(h('div.t-row', null, h('span.t-note', null, t), sbtn('移除', function () { notes.splice(i, 1); R.data('wall', notes); R.rerender(); }, { icon: 'trash', cls: 'sm' }))); });
      el.appendChild(h('p.fine', null, '課堂模式不在投影顯示學生個人輸入；只顯示老師在此輸入、已過目的便利貼。'));
    }
    if (sc.id === 's0' && ph.id === 'announce') {
      el.appendChild(h('div.t-row', null, sbtn(c.ui.fillOil, function () { fillOil(R); }, { icon: 'lamp', cls: 'sm' }), sbtn(c.ui.randomRoles, function () { randomRoles(R); }, { icon: 'dice', cls: 'sm' })));
    }
    if (sc.id === 's3' && ph.id === 'nights') el.appendChild(h('p.fine', null, c.nightsNote));
    if (sc.id === 's5' && ph.id === 'wall') el.appendChild(h('div.t-row', null, sbtn(c.ui.goalBtn, function () { flyWall(R); }, { icon: 'lamp', cls: 'sm' })));
  };

  /* 環節五：煉燈 */
  V['s4.explain'] = function (R, sc, ph, stage) {
    var c = C(), cd = c.card;
    var w = h('div.explain');
    w.appendChild(h('h2.center', null, cd.title, h('small.en', { lang: 'en' }, ' ' + cd.en)));
    var cols = h('div.ex-cols');
    cd.fields.forEach(function (f, i) { cols.appendChild(h('div.ex-col.card', null, h('span.ex-n', null, '第' + '一二三'[i] + '欄'), h('b', null, f.label), h('p', null, f.help))); });
    w.appendChild(cols);
    w.appendChild(h('div.ex-sc', null, h('b', null, '句式支架：'), cd.scaffolds.map(function (s) { return h('span.chip.static', null, s); })));
    w.appendChild(h('p.fine.center', null, cd.keepNote));
    stage.appendChild(w);
  };
  V['s4.forge'] = function (R, sc, ph, stage) {
    var c = C(), cd = c.card, S = st(R, 'card'), me = S.me, self = !R.isClass();
    me.v = me.v || {}; me.chk = me.chk || {};
    var w = h('div.forge');
    var card = h('div.zhi-card.card' + (me.lit ? '.lit' : ''));
    var head = h('div.zc-head', null, h('div.zc-lamp', { html: lampSVG(me.lit ? 10 : countDone() * 2) }), h('div', null, h('h2.zc-title', null, cd.title), h('p.en.it', { lang: 'en' }, cd.en)),
      h('div.sparks', { 'aria-label': '火種 ' + countDone() + '／3' }, [0, 1, 2].map(function (i) { return h('span.spark' + (i < countDone() ? '.on' : ''), { html: flameSVG() }); })));
    card.appendChild(head);
    if (!self) card.appendChild(h('p.notice', null, '課堂上同學填寫實體志向卡（A5）；此畫面可作示範，守燈人每完成一欄向老師換一枚火種貼紙。'));
    var nm = h('input.inp', { type: 'text', maxlength: 20, placeholder: XC.content.common.ui.namePH, 'aria-label': '名字：' + XC.content.common.ui.namePH, value: me.name || '' });
    nm.oninput = function () { me.name = nm.value; S.save(); };
    card.appendChild(h('label.fld.inline', null, h('span.fld-l', null, '名字'), nm));
    cd.fields.forEach(function (f) {
      var fl = ui.field({ label: f.label, help: f.help, value: me.v[f.id] || '', rows: 3, max: 160, minHint: true, chips: f.clueChips ? cd.clueChips : cd.scaffolds, onInput: function (v) {
        var was = done(f.id); me.v[f.id] = v; S.save(); var now = done(f.id);
        if (now && !was) spark(f.id); else if (!now && was) refreshSparks();
      } });
      if (f.check) {
        var chk = h('div.zc-3q', { role: 'group', 'aria-label': '志向三問檢查' }, h('small', null, '志向三問：'));
        c.threeQ.forEach(function (q) {
          var cb = h('input', { type: 'checkbox' }); cb.checked = !!me.chk[q.id];
          cb.onchange = function () { me.chk[q.id] = cb.checked; S.save(); };
          chk.appendChild(h('label.chk', null, cb, h('span', null, q.text)));
        });
        fl.appendChild(chk);
      }
      card.appendChild(fl);
    });
    card.appendChild(h('p.zc-ask', null, h('span', { html: ui.icon('lamp') }), cd.teacherAsk));
    w.appendChild(h('div.forge-top', null, hintRow(R, 'card')));
    w.appendChild(card);
    w.appendChild(h('div.task-acts', null,
      sbtn(c.ui.save, function () { saveCard(R); }, { icon: 'box', primary: true }),
      sbtn(c.ui.png, function () { XC.export.cardPNG(cardData(R), '志向卡-' + XC.export.stamp() + '.png'); }, { icon: 'download' }),
      sbtn(c.ui.print, function () { XC.export.printCard(cardData(R)); }, { icon: 'print' })));
    if (self) w.appendChild(safety());
    stage.appendChild(w);
    function done(id) { return ui.len(me.v[id]) >= Math.min(4, St.settings.minChars || 4); }
    function countDone() { return cd.fields.filter(function (f) { return ui.len(me.v[f.id]) >= Math.min(4, St.settings.minChars || 4); }).length; }
    function refreshSparks() { ui.$$('.spark', card).forEach(function (s, i) { s.classList.toggle('on', i < countDone()); }); }
    function spark(id) {
      var target = ui.$$('.spark', card)[countDone() - 1];
      XC.fx.fly(R.stage.querySelector('.forge-top') || stage, target, 'spark').then(function () { refreshSparks(); XC.fx.bloom(target); XC.audio.play('lamp'); });
      if (countDone() === 3 && !me.lit) {
        me.lit = true; S.save();
        setTimeout(function () { card.classList.add('lit'); var t = card.querySelector('.zc-title'); brushFx(t.parentNode); card.querySelector('.zc-lamp').innerHTML = lampSVG(10); XC.fx.bloom(card.querySelector('.zc-lamp')); ui.announce(c.ui.lit); ui.toast(c.ui.lit); }, 700);
      }
    }
  };
  function cardData(R) {
    var c = C(), cd = c.card, me = st(R, 'card').me; me.v = me.v || {};
    var chk = c.threeQ.filter(function (q) { return me.chk && me.chk[q.id]; }).map(function (q) { return q.short; });
    var fields = cd.fields.map(function (f) { return { label: f.label, value: me.v[f.id] || '' }; });
    if (chk.length) fields[0].value += (fields[0].value ? '\n' : '') + '（已用志向三問檢查：' + chk.join('、') + '）';
    fields.push({ label: cd.witness, value: me.witness || '' });
    if (me.exit) fields.push({ label: cd.exit, value: me.exit });
    return { kicker: '第1節《龍場闖關》點亮志燈', title: cd.title, en: cd.en, lit: !!me.lit, fields: fields, footer: XC.content.common.siteTitle + (me.name ? '｜' + me.name : '') };
  }
  function saveCard(R) {
    var d = cardData(R);
    St.saveBoxItem('l1', 'zhi', { type: 'zhi', title: d.title, en: d.en, fields: d.fields, footer: d.footer.split('｜')[1] || '' });
    ui.toast('志向卡已存入回顧盒（第6節會再用）'); XC.audio.play('chime');
  }
  V['s4.duel'] = function (R, sc, ph, stage) {
    var c = C(), S = st(R, 'card'), me = S.me, self = !R.isClass();
    var q = R.data('duelQ');
    var w = h('div.duel');
    w.appendChild(h('ol.duel-steps', null, h('li', null, '兩人一組'), h('li', null, '隨機抽出志向三問其中一問，雙方互問'), h('li', null, '聽完回答後，在「見證人」欄簽名（化名或縮寫）')));
    var qc = q ? c.threeQ.filter(function (x) { return x.id === q; })[0] : null;
    var fc = ui.flipCard(h('div.duel-q', null, h('small', null, c.ui.duelQ), h('b', null, qc ? qc.text : '')), h('div.ev-back', null, h('span', { html: ui.icon('magnifier') }), h('small', null, '志向三問')), { cls: 'duel-card', backCls: 'back-cloud' });
    if (qc) fc.classList.add('flipped');
    w.appendChild(fc);
    w.appendChild(h('div.task-acts', null, sbtn(c.ui.duelDraw, function () {
      var ids = c.threeQ.map(function (x) { return x.id; }).filter(function (x) { return x !== q; });
      R.data('duelQ', ids[Math.floor(Math.random() * ids.length)]); R.rerender();
      setTimeout(function () { XC.audio.play('flip'); }, 50);
    }, { icon: 'dice', primary: true })));
    if (self) {
      var wi = h('input.inp', { type: 'text', maxlength: 12, value: me.witness || '', placeholder: '化名或縮寫', 'aria-label': c.card.witness });
      wi.oninput = function () { me.witness = wi.value; S.save(); };
      w.appendChild(h('label.fld.inline.center', null, h('span.fld-l', null, c.card.witness), wi));
      w.appendChild(h('p.fine.center', null, '自學時可請家人或同學擔任見證人；也可以先自問自答。'));
    }
    stage.appendChild(w);
  };

  /* 環節六：志燈牆結算 */
  V['s5.wall'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var tg = self ? Math.max(5, R.score('me')) : R.target(), lit = R.data('wallLit') || 0;
    var w = h('div.lampwall');
    w.appendChild(h('h2.center', null, self ? '我的志燈' : c.resource.goalName, h('small', null, self ? '' : '　全班合計 ' + R.total() + '／目標 ' + tg)));
    var grid = h('div.lw-grid', { 'aria-label': (self ? '我的志燈' : '志燈牆') + '：已點亮 ' + Math.min(lit, tg) + ' 枚' });
    for (var i = 0; i < tg; i++) grid.appendChild(h('span.pflame' + (i < lit ? '.on' : ''), { html: flameSVG() }));
    w.appendChild(grid);
    if (lit > tg) w.appendChild(h('p.center.lw-extra', null, '另有 ' + (lit - tg) + ' 枚紙火焰'));
    w.appendChild(h('div.task-acts', null, sbtn(c.ui.goalBtn, function () { flyWall(R); }, { icon: 'lamp', primary: true }),
      !self ? sbtn('觸發「' + c.resource.goalDone + '」動畫', function () { XC.app.goalFx('l1'); }, { icon: 'star' }) : null));
    stage.appendChild(w);
  };
  function flyWall(R) {
    var self = !R.isClass(), ids = self ? ['me'] : St.groups().map(function (g) { return g.id; });
    var slots = ui.$$('.lw-grid .pflame', R.stage), n = 0, delay = 0, total = self ? R.score('me') : R.total();
    R.data('wallLit', 0); slots.forEach(function (s) { s.classList.remove('on'); });
    ids.forEach(function (gid) {
      var sc = R.score(gid), lp = lampOf(gid);
      for (var k = 0; k < sc; k++) (function (idx, d) {
        var t = slots[Math.min(idx, slots.length - 1)];
        XC.fx.fly(lp, t, 'pf', d).then(function () { if (t && idx < slots.length) { t.classList.add('on'); XC.fx.bloom(t); } });
      })(n++, delay += XC.fx.reduced() ? 0 : 70);
    });
    setTimeout(function () {
      R.data('wallLit', total);
      if (!self && total >= R.target()) XC.app.goalFx('l1');
      else if (self) ui.toast('你的燈油化作 ' + total + ' 枚紙火焰。');
      else ui.toast('全班合計 ' + total + ' 枚；老師也可以手動觸發「長夜點亮」。');
      R.rerender();
    }, delay + 1000);
  }
  V['s5.badges'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass();
    var w = h('div.badges-v');
    w.appendChild(h('h2.center', null, '頒發徽章', h('small', null, '　表揚行為，不比較多少')));
    var legend = h('div.badge-legend');
    c.badges.forEach(function (b) {
      var has = R.rec(R.cur()).badges.indexOf(b.id) >= 0;
      legend.appendChild(h('button.badge-btn.card' + (has ? '.has' : ''), { type: 'button', 'aria-pressed': String(has), on: { click: function () {
        if (self && b.id === 'lizhi' && !st(R, 'card').me.lit) { ui.toast('先完成志向卡三欄，就能得到「立志者」。'); return; }
        R.award(R.cur(), b.id); R.rerender();
      } } }, ui.seal(b.name, c.icon), h('b', null, b.name), h('small', null, b.desc)));
    });
    w.appendChild(h('p.center', null, self ? '自我檢視：你做到了哪一項？點一下為自己蓋印（再按可收回）。' : '為 ' + R.gname() + ' 頒發（依觀察表）：'));
    w.appendChild(legend);
    if (!self) {
      var grid = h('div.badge-grid');
      St.groups().forEach(function (g) {
        var bs = R.rec(g.id).badges;
        grid.appendChild(h('div.bg-cell' + (g.id === R.sel ? '.cur' : ''), null, h('b', null, g.name), h('span', null, bs.map(function (id) { var b = R.badge(id); return b ? ui.seal(b.name, c.icon, { small: true }) : null; }))));
      });
      w.appendChild(grid);
    }
    stage.appendChild(w);
  };
  V['s5.exit'] = function (R, sc, ph, stage) {
    var c = C(), self = !R.isClass(), S = st(R, 'card'), me = S.me;
    var w = h('div.exit-v');
    w.appendChild(h('div.vquote', { lang: 'zh-HK' }, sc.endQuote));
    var p = panel('exit-p', true);
    p.appendChild(h('h2', null, c.ui.exitTitle));
    if (self) {
      p.appendChild(ui.field({ label: c.card.exit, value: me.exit || '', rows: 2, chips: c.card.clueChips, onInput: function (v) { me.exit = v; S.save(); } }));
      p.appendChild(h('div.task-acts', null, sbtn('連同志向卡存入回顧盒', function () { saveCard(R); }, { icon: 'box', primary: true })));
    } else {
      p.appendChild(h('p.big', null, '在志向卡背面寫一句：'));
      p.appendChild(h('p.exit-line', null, '「我的燈油是……」'));
    }
    p.appendChild(h('p.preview', null, sc.nextPreview));
    p.appendChild(h('div.task-acts', null, sbtn('返回長夜山河圖', function () { XC.app.closeLayer(); }, { icon: 'home' })));
    w.appendChild(p);
    stage.appendChild(w);
  };
})();
