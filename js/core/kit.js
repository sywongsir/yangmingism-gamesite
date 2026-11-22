/* 共用課節工具（第2節起使用）：資料存取、拖放、刮除畫布、計數器、討論、角色、徽章、產出卡、三句總結、離場券。
   各節遊戲邏輯（js/lessons/lN.js）透過 XC.kit 呼叫；所有文字由各節內容檔提供。 */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state;
  var K = XC.kit = {};

  /* ---------- 資料 ---------- */
  K.st = function (R, key) { var all = R.data(key) || {}; var g = R.cur(); all[g] = all[g] || {}; return { all: all, me: all[g], save: function () { R.data(key, all); } }; };
  K.award = function (R, key, field, delta, label, gid) {
    gid = gid || R.cur();
    var all = R.data(key) || {}; all[gid] = all[gid] || {};
    if (all[gid][field]) return 0;
    var prev = {}; prev[field] = all[gid][field];
    all[gid][field] = true; R.data(key, all);
    return R.add(gid, delta, label, { st: key, gid: gid, set: prev });
  };
  K.onUndo = function (R, e) {
    var x = e.extra; if (!x || !x.st) return;
    var all = R.data(x.st) || {}; all[x.gid] = all[x.gid] || {};
    Object.keys(x.set || {}).forEach(function (k) { if (x.set[k] === undefined) delete all[x.gid][k]; else all[x.gid][k] = x.set[k]; });
    R.data(x.st, all);
  };
  K.enough = function (t) { return ui.len(t) >= St.settings.minChars; };
  K.has = function (t, n) { return ui.len(t) >= (n || 2); };

  /* ---------- 小元件 ---------- */
  K.panel = function (cls, night) { return h('div.panel.' + (night ? 'panel-night' : 'panel-paper') + (cls ? '.' + cls : '')); };
  K.who = function (R) { return R.isClass() ? h('p.who', null, '目前組別：', h('b', null, R.gname()), h('small', null, '（點下方組別或按 1–' + Math.min(9, St.groups().length) + ' 切換）')) : null; };
  K.safety = function () { return h('p.safety', null, XC.content.common.safetyTip); };
  K.hintRow = function (R, key) { var b = R.hintBtn(key); return b ? h('div.hint-row', null, b) : null; };
  K.sbtn = function (label, fn, o) { o = o || {}; return ui.btn(label, { icon: o.icon, primary: o.primary, cls: o.cls, disabled: o.disabled, title: o.title, onClick: fn }); };
  K.head = function (R, title, hintKey, extra) { return h('div.task-head', null, h('h2', null, title), K.who(R), extra || null, hintKey ? K.hintRow(R, hintKey) : null); };
  K.dots = function (n, cls) { var w = h('span.ink-dots' + (cls ? '.' + cls : ''), { 'aria-hidden': 'true' }); for (var i = 0; i < n; i++) w.appendChild(h('i', { style: { animationDelay: (i * 0.05) + 's' } })); return w; };
  /* 數字增減器（老師輸入人數等） */
  K.stepper = function (val, onChange, label, max) {
    var v = val || 0, n = h('b.stp-n', { 'aria-live': 'polite' }, String(v));
    function set(x) { v = Math.max(0, Math.min(max || 99, x)); n.textContent = v; onChange(v); }
    return h('span.stepper', { role: 'group', 'aria-label': label },
      h('button.stp-b', { type: 'button', 'aria-label': label + '減一', on: { click: function () { set(v - 1); } } }, '－'), n,
      h('button.stp-b', { type: 'button', 'aria-label': label + '加一', on: { click: function () { set(v + 1); XC.audio.play('click'); } } }, '＋'));
  };
  /* 每個步驟獨立倒數（切換環節時停止） */
  K.miniT = function (R, key, sec, label) {
    R._mts = R._mts || []; R._mtMap = R._mtMap || {};
    if (!R._mtMap[key]) { R._mtMap[key] = XC.miniTimer(sec, label); R._mts.push(R._mtMap[key]); }
    return R._mtMap[key];
  };
  K.leave = function (R) { if (R._mts) R._mts.forEach(function (m) { m.stop(); }); };

  /* ---------- 拖放：指標拖曳；亦可「點選詞條 → 點選目標」（鍵盤可用） ---------- */
  K.drag = function (root, o) {
    var sel = null;
    function setSel(t) { ui.$$(o.token, root).forEach(function (x) { x.classList.toggle('sel', x === t); x.setAttribute('aria-pressed', String(x === t)); }); sel = t; root.classList.toggle('picking', !!t); }
    function hit(ev) { var el = document.elementFromPoint(ev.clientX, ev.clientY); return el && el.closest ? el.closest(o.target) : null; }
    function clearHov() { ui.$$(o.target + '.hover', root).forEach(function (d) { d.classList.remove('hover'); }); }
    ui.$$(o.token, root).forEach(function (t) {
      t.setAttribute('aria-pressed', 'false');
      t.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        var sx = e.clientX, sy = e.clientY, ghost = null;
        try { t.setPointerCapture(e.pointerId); } catch (er) {}
        function mv(ev) {
          if (!ghost && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 8) {
            ghost = t.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.style.width = t.offsetWidth + 'px'; document.body.appendChild(ghost);
          }
          if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; var d = hit(ev); clearHov(); if (d) d.classList.add('hover'); }
        }
        function up(ev) {
          t.removeEventListener('pointermove', mv); t.removeEventListener('pointerup', up); t.removeEventListener('pointercancel', up);
          if (ghost) { ghost.remove(); var d = hit(ev); clearHov(); t._skip = true; setTimeout(function () { t._skip = false; }, 60); if (d) o.onDrop(t.getAttribute('data-id'), d.getAttribute('data-drop'), t, d); }
        }
        t.addEventListener('pointermove', mv); t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
      });
      t.addEventListener('click', function () {
        if (t._skip) return;
        setSel(sel === t ? null : t);
        if (sel) ui.announce('已選取「' + t.textContent.trim() + '」，再選擇要放到哪裏');
      });
    });
    ui.$$(o.target, root).forEach(function (d) {
      if (!d.hasAttribute('tabindex')) d.tabIndex = 0;
      function drop(e) { if (!sel) return; if (e && e.target.closest && e.target.closest(o.token) && e.target.closest(o.token) !== sel && d.contains(e.target.closest(o.token))) { /* 點了目標內另一詞條 */ } var t = sel; setSel(null); o.onDrop(t.getAttribute('data-id'), d.getAttribute('data-drop'), t, d); }
      d.addEventListener('click', function (e) { if (!sel) return; if (e.target.closest(o.token) === sel) return; drop(e); });
      d.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && sel && e.target === d) { e.preventDefault(); drop(e); } });
    });
  };

  /* ---------- 刮除畫布（清塵、拭鏡）：完成時呼叫 onDone ---------- */
  K.wipe = function (host, o) {
    o = o || {};
    var cv = h('canvas.wipe-cv', { 'aria-hidden': 'true' }), done = false, ctx, w, hh, timer = 0;
    host.appendChild(cv);
    function paint() {
      var r = host.getBoundingClientRect(); w = Math.max(10, Math.round(r.width)); hh = Math.max(10, Math.round(r.height));
      cv.width = w; cv.height = hh; ctx = cv.getContext('2d');
      var g = ctx.createRadialGradient(w / 2, hh / 2, 10, w / 2, hh / 2, Math.max(w, hh) / 1.4);
      g.addColorStop(0, 'rgba(120,112,100,.92)'); g.addColorStop(1, 'rgba(80,74,66,.97)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, hh);
      for (var i = 0; i < w * hh / 90; i++) { ctx.fillStyle = 'rgba(' + (150 + Math.random() * 60 | 0) + ',' + (140 + Math.random() * 50 | 0) + ',' + (120 + Math.random() * 40 | 0) + ',' + (Math.random() * 0.35).toFixed(2) + ')'; var s = Math.random() * 3 + 0.5; ctx.fillRect(Math.random() * w, Math.random() * hh, s, s); }
      ctx.globalCompositeOperation = 'destination-out';
    }
    requestAnimationFrame(paint);
    var down = false, last = null;
    function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (hh / r.height) }; }
    function rub(p) {
      var rad = Math.max(18, w / 14);
      ctx.lineWidth = rad * 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(last ? last.x : p.x, last ? last.y : p.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
      if (!timer) timer = setTimeout(check, 260);
    }
    function check() {
      timer = 0; if (done) return;
      var d = ctx.getImageData(0, 0, w, hh).data, n = 0, tot = 0;
      for (var i = 3; i < d.length; i += 64) { tot++; if (d[i] < 40) n++; }
      var f = n / tot; if (o.onProgress) o.onProgress(f);
      if (f > (o.need || 0.55)) finish();
    }
    function finish() { if (done) return; done = true; cv.classList.add('gone'); setTimeout(function () { cv.remove(); }, 900); if (o.onDone) o.onDone(); }
    cv.addEventListener('pointerdown', function (e) { if (o.locked && o.locked()) { ui.toast(o.lockedMsg || '先完成上面的步驟'); return; } down = true; last = null; try { cv.setPointerCapture(e.pointerId); } catch (er) {} rub(pt(e)); });
    cv.addEventListener('pointermove', function (e) { if (down) rub(pt(e)); });
    cv.addEventListener('pointerup', function () { down = false; last = null; });
    cv.addEventListener('pointercancel', function () { down = false; last = null; });
    return { finish: finish, el: cv };
  };

  /* ---------- 討論：提問與參考答案 ---------- */
  K.discuss = function (R, sc, stage, chips) {
    var w = h('div.discuss');
    var self = !R.isClass(), ans = K.st(R, 'ans_' + sc.id);
    (sc.questions || []).forEach(function (q, i) {
      var box = K.panel('q-card');
      box.appendChild(h('p.q-no', null, '提問' + (sc.questions.length > 1 ? '一二三四'[i] : '')));
      box.appendChild(h('h3.q-q', null, q.q));
      if (self) box.appendChild(ui.field({ label: '我的想法（可不寫）', value: ans.me['q' + i] || '', rows: 2, chips: R.support ? chips : null, onInput: function (v) { ans.me['q' + i] = v; ans.save(); } }));
      var ref = h('div.q-ref', { hidden: true }, h('b', null, self ? '參考分析：' : '參考答案：'), q.ref);
      box.appendChild(K.sbtn(self ? '看參考分析' : '顯示參考答案', function (e) { ref.hidden = !ref.hidden; e.currentTarget.setAttribute('aria-pressed', String(!ref.hidden)); if (!ref.hidden) XC.audio.play('flip'); }, { icon: 'eye', cls: 'sm' }));
      box.appendChild(ref);
      w.appendChild(box);
    });
    if (sc.feedback) {
      var fb = h('blockquote.feedback', { hidden: !self || null }, '「' + sc.feedback + '」');
      w.appendChild(h('div.fb-wrap', null, R.isClass() ? K.sbtn('顯示教師回饋', function () { fb.hidden = !fb.hidden; }, { icon: 'brush', cls: 'sm' }) : null, fb));
    }
    stage.appendChild(w);
    return w;
  };

  /* ---------- 本節首頁卡 ---------- */
  K.home = function (R, stage) {
    var c = R.C;
    stage.appendChild(h('div.ls-home', null,
      h('p.lh-no', null, '第' + c.no + '節'),
      h('h2.lh-game', null, '《' + c.game + '》', h('span', null, c.tagline)),
      h('p.lh-title', null, c.title),
      h('p.lh-tags', null, h('span.tag.tag-value', null, '價值觀：' + c.value), h('span.tag', null, '層次：' + c.level), h('span.tag', null, '學習產出：' + c.output)),
      h('div.lh-q', null, h('span', null, '核心提問'), h('p', null, c.coreQuestion)),
      h('details.lh-focus', null, h('summary', null, '學習重點'), h('ol', null, c.focus.map(function (f) { return h('li', null, f); })), h('p.fine', null, c.valueLink), c.noRanking ? h('p.fine', null, c.noRanking) : null)));
  };

  /* ---------- 角色 ---------- */
  K.randomRoles = function (R) {
    var roles = {}, n = R.C.roles.length;
    St.groups().forEach(function (g) { var a = []; for (var k = 0; k < n; k++) a.push(k); for (var i = n - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } roles[g.id] = a; });
    R.data('roles', roles); XC.audio.play('flip'); R.rerender(); ui.announce('已為每組隨機分配角色');
  };
  K.roles = function (R, host) {
    var c = R.C, w = h('div.announce');
    var legend = h('div.role-legend');
    c.roles.forEach(function (r) { legend.appendChild(h('div.role-card.card', null, h('b', null, r.name), h('span', null, r.duty))); });
    w.appendChild(legend);
    if (c.rolesNote) w.appendChild(h('p.fine.center', null, c.rolesNote));
    if (R.isClass()) {
      w.appendChild(h('div.task-acts', null, K.sbtn(c.ui.randomRoles || '隨機分配角色', function () { K.randomRoles(R); }, { icon: 'dice' })));
      var roles = R.data('roles');
      if (roles) {
        var grid = h('div.role-grid');
        St.groups().forEach(function (g, gi) {
          var row = h('div.rg-row', null, h('b.rg-g', null, g.name));
          (roles[g.id] || [0, 1, 2, 3]).forEach(function (ri, m) { var r = c.roles[ri]; if (r) row.appendChild(h('span.rg-c', { style: { animationDelay: (gi * 0.06 + m * 0.05) + 's' } }, h('small', null, '組員' + '一二三四五六'[m]), r.name)); });
          grid.appendChild(row);
        });
        w.appendChild(grid);
      }
    } else w.appendChild(h('p.center', null, '自學時，你一人兼任' + '一二三四五六'[c.roles.length - 1] + '個角色。'));
    host.appendChild(w);
    return w;
  };

  /* ---------- 課堂模式：為目前組別加分的按鈕 ---------- */
  K.classAwards = function (R, key, list, extra) {
    var S = K.st(R, key);
    var row = h('div.task-acts.class-aw', null, h('span.aw-who', null, '為 ' + R.gname() + '：'));
    list.forEach(function (it) {
      var done = !!S.me[it.f];
      row.appendChild(K.sbtn(it.label + (done ? '（已加）' : ''), function () { if (S.me[it.f]) return; K.award(R, key, it.f, it.delta || 1, it.label); if (it.after) it.after(); R.rerender(); }, { icon: it.icon || 'plus', primary: !done, disabled: done }));
    });
    if (extra) row.appendChild(extra);
    return row;
  };

  /* ---------- 挑戰任務（存入回顧盒） ---------- */
  K.challengeBtn = function (R, note) {
    var c = R.C;
    if (!c.challenge) return null;
    return K.sbtn(c.challenge.title, function () {
      var saved = (St.box()[R.id] || {}).challenge;
      var body = h('div', null, h('p', null, c.challenge.text), note ? h('p.fine', null, note) : null);
      var inputs = c.challenge.fields.map(function (f, i) {
        var v = saved && saved.fields[i] ? saved.fields[i].value : '';
        var fl = ui.field({ label: f, value: v, rows: 2 }); body.appendChild(fl); return fl.input;
      });
      ui.modal({ title: c.challenge.title, body: body, actions: [{ label: '關閉' }, { label: '存入回顧盒', primary: true, icon: 'box', onClick: function () {
        St.saveBoxItem(R.id, 'challenge', { type: 'challenge', title: '挑戰任務', fields: c.challenge.fields.map(function (f, i) { return { label: f, value: inputs[i].value }; }), footer: '挑戰任務' });
        ui.toast('已存入回顧盒');
      } }] });
    }, { icon: 'mountain', cls: 'sm' });
  };

  /* ---------- 頒發徽章（表揚行為，不比較多少） ---------- */
  K.badges = function (R, stage, selfCheck, ids) {
    var c = R.C, self = !R.isClass();
    var w = h('div.badges-v');
    w.appendChild(h('h2.center', null, '頒發徽章', h('small', null, '　表揚行為，不比較多少')));
    var legend = h('div.badge-legend');
    c.badges.filter(function (b) { return !ids || ids.indexOf(b.id) >= 0; }).forEach(function (b) {
      var has = R.rec(R.cur()).badges.indexOf(b.id) >= 0;
      legend.appendChild(h('button.badge-btn.card' + (has ? '.has' : ''), { type: 'button', 'aria-pressed': String(has), on: { click: function () {
        if (self && !has && selfCheck) { var msg = selfCheck(b); if (msg) { ui.toast(msg, 3600); return; } }
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

  /* ---------- 個人產出卡（多欄、句式支架、名字、存盒／PNG／列印） ---------- */
  K.cardData = function (R, o) {
    var me = K.st(R, o.key || 'card').me; me.v = me.v || {};
    var fields = o.fields.map(function (f) { return { label: f.label, value: me.v[f.id] || '' }; });
    (o.extra || []).forEach(function (x) { var v = typeof x.value === 'function' ? x.value(me) : me.v[x.id]; if (v || x.always) fields.push({ label: x.label, value: v || '' }); });
    return { kicker: '第' + R.C.no + '節《' + R.C.game + '》' + R.C.tagline, title: o.title, en: o.en, lit: o.lit ? o.lit(me) : true, fields: fields, footer: XC.content.common.siteTitle + (me.name ? '｜' + me.name : '') };
  };
  K.saveCard = function (R, o) {
    var d = K.cardData(R, o);
    St.saveBoxItem(R.id, o.boxKey || 'card', { type: o.boxKey || 'card', title: d.title, en: d.en, fields: d.fields, footer: d.footer.split('｜')[1] || '' });
    ui.toast(o.savedMsg || (d.title + '已存入回顧盒')); XC.audio.play('chime');
  };
  K.cardActs = function (R, o) {
    return h('div.task-acts', null,
      K.sbtn('存入回顧盒', function () { K.saveCard(R, o); }, { icon: 'box', primary: true }),
      K.sbtn('下載 PNG', function () { XC.export.cardPNG(K.cardData(R, o), o.title + '-' + XC.export.stamp() + '.png'); }, { icon: 'download' }),
      K.sbtn('列印（A5）', function () { XC.export.printCard(K.cardData(R, o)); }, { icon: 'print' }));
  };
  /* o: {key, title, en, fields:[{id,label,help,chips}], scaffolds, only:[ids], classNote, onField(id,v,me)} */
  K.cardForm = function (R, o) {
    var S = K.st(R, o.key || 'card'), me = S.me; me.v = me.v || {};
    var card = h('div.out-card.card' + (o.cls ? '.' + o.cls : ''));
    card.appendChild(h('div.oc-head', null, h('span.oc-ico', { html: ui.icon(R.C.icon) }), h('div', null, h('h2.oc-title', null, o.title), o.en ? h('p.en.it', { lang: 'en' }, o.en) : null)));
    if (R.isClass() && o.classNote) card.appendChild(h('p.notice', null, o.classNote));
    if (!o.noName) {
      var nm = h('input.inp', { type: 'text', maxlength: 20, placeholder: XC.content.common.ui.namePH, 'aria-label': '名字：' + XC.content.common.ui.namePH, value: me.name || '' });
      nm.oninput = function () { me.name = nm.value; S.save(); };
      card.appendChild(h('label.fld.inline', null, h('span.fld-l', null, '名字'), nm));
    }
    o.fields.forEach(function (f, i) {
      if (o.only && o.only.indexOf(f.id) < 0) return;
      var fl = ui.field({ label: (o.numbered ? '①②③④⑤⑥'[i] + ' ' : '') + f.label, help: f.help, value: me.v[f.id] || '', rows: f.rows || 2, max: f.max || 200, placeholder: f.ph || '', minHint: !!f.minHint, chips: f.chips || o.scaffolds, onInput: function (v) { me.v[f.id] = v; S.save(); if (o.onField) o.onField(f.id, v, me, fl); } });
      fl.classList.add('oc-f'); fl.setAttribute('data-f', f.id);
      card.appendChild(fl);
    });
    card.S = S;
    return card;
  };

  /* ---------- 三句總結（逐句書寫動畫） ---------- */
  K.summary = function (R, stage, lines, title) {
    var w = h('div.sum3');
    if (title) w.appendChild(h('p.sum-t', null, title));
    lines.forEach(function (t, i) { w.appendChild(h('p.sum-l', { style: { animationDelay: (0.3 + i * 1.1) + 's' } }, h('span.sum-n', null, '一二三'[i]), h('span.sum-txt', null, '「' + t + '」'))); });
    w.appendChild(K.sbtn('重播書寫', function () { R.rerender(); }, { icon: 'brush', cls: 'sm' }));
    stage.appendChild(w);
    if (!XC.fx.reduced()) lines.forEach(function (_, i) { setTimeout(function () { XC.audio.play('flip'); }, 300 + i * 1100); });
  };

  /* ---------- 離場券 ---------- */
  K.exit = function (R, stage, o) {
    var self = !R.isClass(), S = K.st(R, o.key || 'card'), me = S.me; me.v = me.v || {};
    var w = h('div.exit-v');
    if (o.quote) w.appendChild(h('div.vquote', { lang: 'zh-HK' }, o.quote));
    var p = K.panel('exit-p', true);
    p.appendChild(h('h2', null, '離場券'));
    if (self) {
      p.appendChild(ui.field({ label: o.label, value: me.v.exit || '', rows: 2, chips: o.chips, onInput: function (v) { me.v.exit = v; S.save(); } }));
      if (o.save) p.appendChild(h('div.task-acts', null, K.sbtn(o.saveLabel || '連同產出卡存入回顧盒', o.save, { icon: 'box', primary: true })));
    } else {
      p.appendChild(h('p.big', null, o.classLead || '寫一句：'));
      p.appendChild(h('p.exit-line', null, '「' + o.label.replace(/^離場券：/, '') + '」'));
    }
    p.appendChild(h('p.preview', null, o.preview));
    p.appendChild(h('div.task-acts', null, K.sbtn('返回長夜山河圖', function () { XC.app.closeLayer(); }, { icon: 'home' })));
    w.appendChild(p);
    stage.appendChild(w);
  };

  /* ---------- 籠統詞檢查（測試員助手） ---------- */
  K.vague = function (text, words) { return (words || []).filter(function (wd) { return (text || '').indexOf(wd) >= 0; }); };
})();
