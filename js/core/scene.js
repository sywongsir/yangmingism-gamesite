/* 環節引擎 SceneRunner：六節共用。每節 = 一串環節（scene），每環節 = 數個步驟（phase）。
   版面：頂部（節次、遊戲名、價值觀、40 分鐘進度條、模式切換）／中央（環節畫面）／底部（字幕旁白、上一步／下一步、計時、教師工具） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state;
  XC.lessons = XC.lessons || {};

  function Runner(id, layer, sub) {
    var R = this;
    R.id = id; R.C = XC.content[id]; R.L = XC.lessons[id] || {}; R.layer = layer; R.active = true;
    R.common = XC.content.common;
    R.sel = XC.storage.get('sel_' + id, 'g1');
    if (St.groups().map(function (g) { return g.id; }).indexOf(R.sel) < 0) R.sel = 'g1';
    R.support = false;
    R.ls = St.lesson(id);
    R.scenes = R.C.scenes;
    if (sub && /^s\d+$/.test(sub)) {
      var si = R.scenes.map(function (s) { return s.id; }).indexOf(sub);
      if (si >= 0 && si !== R.ls.scene) { R.ls.scene = si; R.ls.phase = 0; R.ls.line = 0; }
    }
    if (R.ls.scene >= R.scenes.length) R.ls.scene = 0;
    if (R.ls.phase >= R.scenes[R.ls.scene].phases.length) R.ls.phase = 0;
    R.build();
    if (R.L.setup) R.L.setup(R);
    R._onMode = function () { R.syncChrome(); R.buildStrip(); R.render(); };
    R._onSet = function () { R.buildStrip(); R.render(); };
    R._onSound = function () { R.syncChrome(); };
    XC.bus.on('mode', R._onMode); XC.bus.on('settings', R._onSet); XC.bus.on('sound', R._onSound);
    R._key = function (e) { R.onKey(e); };
    document.addEventListener('keydown', R._key);
    R.timer.set(R.sceneSeconds(), false);
    St.setProgress(id, 'active');
    R.render();
  }
  var p = Runner.prototype;

  /* ---------- 模式與資料 ---------- */
  p.isClass = function () { return St.mode === 'class'; };
  p.ds = function () { return this.isClass() ? this.ls : St.self(this.id); };
  p.save = function () { St.saveLesson(this.id); St.saveSelf(this.id); };
  p.data = function (k, v) { var d = this.ds(); d.data = d.data || {}; if (v === undefined) return d.data[k]; d.data[k] = v; this.save(); return v; };
  p.cur = function () { return this.isClass() ? this.sel : 'me'; };
  p.rec = function (gid) {
    var r;
    if (gid === 'me' || !this.isClass()) r = St.self(this.id);
    else { this.ls.groups[gid] = this.ls.groups[gid] || {}; r = this.ls.groups[gid]; }
    if (r.score == null) r.score = this.C.resource.start;
    r.props = r.props || {}; r.badges = r.badges || [];
    return r;
  };
  p.score = function (gid) { return this.rec(gid || this.cur()).score; };
  p.total = function () { var R = this; return St.groups().reduce(function (a, g) { return a + R.rec(g.id).score; }, 0); };
  p.target = function () { return St.settings.targets[this.id] || this.C.resource.classTarget; };
  p.gname = function (gid) { return St.groupName(gid || this.cur()); };

  p.add = function (gid, delta, label, extra) {
    gid = gid || this.cur();
    /* 各節可在加分前調整或拒絕（例：第4節每輪最多 3 分） */
    if (this.L.beforeAdd) { var o = this.L.beforeAdd(this, gid, delta, label, extra); if (!o) return 0; delta = o.delta; label = o.label; extra = o.extra; }
    var r = this.rec(gid), prev = r.score;
    r.score = Math.max(0, r.score + delta);
    var d = r.score - prev, ds = this.ds();
    ds.hist = ds.hist || []; ds.hist.push({ gid: gid, delta: d, label: label || '', extra: extra || null, t: Date.now() });
    if (ds.hist.length > 300) ds.hist.shift();
    this.save();
    this.afterScore(gid, d, label);
    return d;
  };
  p.afterScore = function (gid, d, label) {
    this.refreshStrip();
    if (this.L.onScore) this.L.onScore(this, gid, d, label);
    XC.audio.play(d > 0 ? 'lamp' : d < 0 ? 'dim' : 'click');
    var u = this.C.resource.unit;
    ui.announce(this.gname(gid) + ' ' + u + ' ' + (d > 0 ? '加 ' + d : d < 0 ? '減 ' + (-d) : '不變') + (label ? '（' + label + '）' : '') + '，現有 ' + this.score(gid) + ' 點。' + (this.isClass() ? '全班合計 ' + this.total() + ' 點。' : ''));
    this.updateTeacher(true);
  };
  p.undo = function () {
    var ds = this.ds(), e = (ds.hist || []).pop();
    if (!e) { ui.toast('沒有可撤銷的步驟'); return; }
    var r = this.rec(e.gid); r.score = Math.max(0, r.score - e.delta);
    if (e.extra && e.extra.prop) r.props[e.extra.prop] = false;
    if (this.L.onUndo) this.L.onUndo(this, e);
    this.save(); this.refreshStrip();
    ui.announce('已撤銷：' + this.gname(e.gid) + ' ' + (e.label || '') + '，現有 ' + r.score + ' 點');
    ui.toast('已撤銷上一步：' + this.gname(e.gid) + ' ' + (e.label || ''));
    this.rerender();
  };
  p.propUsed = function (gid, prop) { return !!this.rec(gid || this.cur()).props[prop]; };
  p.useProp = function (gid, prop, v) { this.rec(gid || this.cur()).props[prop] = v !== false; this.save(); this.refreshStrip(); this.updateTeacher(true); };
  p.badge = function (bid) { return (this.C.badges || []).filter(function (b) { return b.id === bid; })[0]; };
  p.award = function (gid, bid) {
    var r = this.rec(gid), b = this.badge(bid); if (!b) return;
    if (r.badges.indexOf(bid) >= 0) { r.badges.splice(r.badges.indexOf(bid), 1); this.save(); this.refreshStrip(); this.updateTeacher(true); ui.toast('已收回徽章：' + b.name); return; }
    r.badges.push(bid); this.save(); this.refreshStrip(); this.updateTeacher(true);
    var fx = h('div.stamp-fx', { 'aria-hidden': 'true' }, ui.seal(b.name, this.C.icon), h('p.stamp-who', null, this.gname(gid)));
    this.layer.appendChild(fx); XC.audio.play('stamp');
    setTimeout(function () { fx.classList.add('out'); setTimeout(function () { fx.remove(); }, 600); }, 1500);
    ui.announce(this.gname(gid) + ' 獲頒徽章：' + b.name);
  };

  /* ---------- 位置 ---------- */
  p.scene = function () { return this.scenes[this.ls.scene]; };
  p.phase = function () { return this.scene().phases[this.ls.phase]; };
  p.narr = function () { return this.phase().narration || []; };
  p.sceneSeconds = function (sc) { sc = sc || this.scene(); return Math.round(((this.ls.short && sc.shortMinutes) || sc.minutes) * 60); };
  p.go = function (si, pi, li) {
    var changed = si !== this.ls.scene;
    if (this.L.leave) try { this.L.leave(this); } catch (e) { console.error(e); }
    this.ls.scene = si; this.ls.phase = pi;
    var n = this.scene().phases[pi].narration || [];
    this.ls.line = li === 'last' ? Math.max(0, n.length - 1) : (li || 0);
    this.save();
    if (changed) { var run = this.timer.running(); this.timer.set(this.sceneSeconds(), true); if (!run) this.timer.pause(); else this.timer.start(); }
    this.render();
  };
  p.next = function () {
    var n = this.narr();
    if (this.ls.line < n.length - 1) { this.setLine(this.ls.line + 1); return; }
    if (this.ls.phase < this.scene().phases.length - 1) { this.go(this.ls.scene, this.ls.phase + 1, 0); return; }
    if (this.ls.scene < this.scenes.length - 1) { this.go(this.ls.scene + 1, 0, 0); return; }
    St.setProgress(this.id, 'done'); ui.toast('已到本節最後一步。按左上角返回山河圖。');
  };
  p.prev = function () {
    if (this.ls.line > 0) { this.setLine(this.ls.line - 1); return; }
    if (this.ls.phase > 0) { this.go(this.ls.scene, this.ls.phase - 1, 'last'); return; }
    if (this.ls.scene > 0) { var s = this.ls.scene - 1; this.go(s, this.scenes[s].phases.length - 1, 'last'); }
  };
  p.toPhase = function (pid) {
    var ps = this.scene().phases.map(function (x) { return x.id; }), i = ps.indexOf(pid);
    if (i >= 0) this.go(this.ls.scene, i, 0);
  };
  p.reveal = function () {
    var ps = this.scene().phases, i = -1;
    ps.forEach(function (x, k) { if (i < 0 && /reveal/.test(x.id)) i = k; });
    if (i >= 0) this.go(this.ls.scene, i, 0); else ui.toast('本環節沒有揭曉步驟');
  };

  /* ---------- 建構版面 ---------- */
  p.build = function () {
    var R = this, C = R.C, L = R.layer;
    L.classList.add('lesson', 'lesson-' + R.id);
    L.innerHTML = '';
    var top = h('header.ls-top');
    top.appendChild(ui.btn('', { icon: 'home', title: '返回長夜山河圖', cls: 'ls-home', onClick: function () { XC.app.closeLayer(); } }));
    top.appendChild(h('div.ls-id', null,
      h('span.ls-no', null, '第' + C.no + '節'),
      h('h1.ls-game', null, '《' + C.game + '》', h('small', null, C.tagline)),
      h('span.tag.tag-value', null, C.value), h('span.tag', null, C.level)));
    R.prog = h('nav.ls-prog', { 'aria-label': '本節 40 分鐘進度（可點選跳到任何環節）' });
    R.scenes.forEach(function (sc, i) {
      var b = h('button.seg', { type: 'button', style: { flexGrow: sc.minutes }, title: sc.name + '（' + sc.minutes + ' 分鐘）', on: { click: function () { R.go(i, 0, 0); } } },
        h('span.seg-fill'), h('span.seg-name', null, sc.short || sc.name), h('span.seg-min', null, sc.minutes + "'"));
      R.prog.appendChild(b);
    });
    R.clock = h('span.ls-clock', { 'aria-live': 'off' });
    top.appendChild(h('div.ls-progwrap', null, R.prog, R.clock));
    var tools = h('div.ls-tools');
    R.modeSw = h('div.mode-sw', { role: 'group', 'aria-label': '模式切換' },
      ui.btn('課堂', { cls: 'm-class', title: '課堂模式（老師投影帶領）', onClick: function () { St.setMode('class'); } }),
      ui.btn('自學', { cls: 'm-self', title: '自學模式（個人／小組平板）', onClick: function () { St.setMode('self'); } }));
    R.supBtn = ui.btn('支援', { icon: 'support', cls: 'sm', title: '差異化支援：顯示句式支架、提示卡、預設選項', onClick: function () { R.support = !R.support; R.syncChrome(); R.rerender(); } });
    R.sndBtn = ui.btn('', { icon: 'mute', cls: 'sm', title: '聲音開關（M）', onClick: function () { XC.audio.toggle(); } });
    tools.appendChild(R.modeSw); tools.appendChild(R.supBtn); tools.appendChild(R.sndBtn);
    tools.appendChild(ui.btn('', { icon: 'full', cls: 'sm', title: '全螢幕（F）', onClick: ui.fullscreen }));
    top.appendChild(tools);
    L.appendChild(top);

    var stageWrap = h('main.ls-stagewrap', { id: 'stage-' + R.id });
    R.bgA = h('div.st-bg'); R.bgB = h('div.st-bg');
    R.pills = h('div.ph-pills', { role: 'group', 'aria-label': '本環節步驟' });
    R.stage = h('div.st-content');
    stageWrap.appendChild(R.bgA); stageWrap.appendChild(R.bgB); stageWrap.appendChild(h('div.st-shade'));
    stageWrap.appendChild(R.stage); stageWrap.appendChild(R.pills);
    L.appendChild(stageWrap);
    R.stageWrap = stageWrap;

    R.strip = h('div.ls-groups', { role: 'group', 'aria-label': '各組（按組號固定排列，不排名）' });
    L.appendChild(R.strip);

    var bot = h('footer.ls-bottom');
    R.prevBtn = ui.btn('上一步', { icon: 'prev', cls: 'nav-prev', title: '上一步（← 或 PageUp）', onClick: function () { R.prev(); } });
    R.nextBtn = ui.btn('下一步', { icon: 'next', cls: 'nav-next', primary: true, title: '下一步（→ 或 PageDown）', onClick: function () { R.next(); } });
    R.sub = h('div.subtitle', { role: 'button', tabindex: '0', 'aria-label': '旁白字幕，點擊推進下一句' },
      h('p.sub-zh', { 'aria-live': 'polite' }), h('p.sub-en.en', { lang: 'en' }), h('span.sub-meta'));
    R.sub.addEventListener('click', function () { R.next(); });
    R.sub.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); R.next(); } });
    R.speakBtn = ui.btn('', { icon: 'voice', cls: 'sm speak', title: '朗讀旁白', onClick: function () { var n = R.narr()[R.ls.line]; if (n) ui.speak(n.zh); } });
    R.tBtn = ui.btn('教師', { icon: 'teacher', cls: 't-btn', title: '教師面板（T）', onClick: function () { R.toggleTeacher(); } });
    bot.appendChild(R.prevBtn); bot.appendChild(R.sub); bot.appendChild(R.speakBtn); bot.appendChild(R.nextBtn); bot.appendChild(R.tBtn);
    L.appendChild(bot);

    R.tPanel = h('aside.t-panel.panel-paper', { 'aria-label': '教師面板', hidden: true });
    L.appendChild(R.tPanel);
    R.timer = new XC.Timer(stageWrap);
    R.timer.onchange = function () { R.updateClock(); };
    R.syncChrome(); R.buildStrip();
  };
  p.syncChrome = function () {
    var c = this.isClass();
    this.modeSw.querySelector('.m-class').setAttribute('aria-pressed', String(c));
    this.modeSw.querySelector('.m-self').setAttribute('aria-pressed', String(!c));
    this.layer.classList.toggle('mode-class', c); this.layer.classList.toggle('mode-self', !c);
    this.supBtn.setAttribute('aria-pressed', String(this.support));
    this.sndBtn.innerHTML = ui.icon(XC.audio.on ? 'sound' : 'mute');
    this.sndBtn.setAttribute('aria-label', XC.audio.on ? '關閉聲音' : '開啟聲音');
    this.speakBtn.hidden = !ui.voice;
  };

  /* ---------- 組別列／個人燈 ---------- */
  p.buildStrip = function () {
    var R = this; R.strip.innerHTML = '';
    if (R.isClass()) {
      St.groups().forEach(function (g) {
        var b = h('button.grp', { type: 'button', 'data-gid': g.id, 'aria-pressed': String(g.id === R.sel), title: g.name + '（按 ' + (g.idx < 9 ? g.idx + 1 : '') + ' 選取）', on: { click: function () { R.select(g.id); } } });
        R.strip.appendChild(b);
      });
      R.totalEl = h('div.grp-total', { 'aria-live': 'polite' });
      R.strip.appendChild(R.totalEl);
    } else {
      R.totalEl = null;
      R.strip.appendChild(h('div.grp.me', { 'data-gid': 'me' }));
    }
    R.refreshStrip();
  };
  p.refreshStrip = function () {
    var R = this;
    ui.$$('.grp', R.strip).forEach(function (el) {
      var gid = el.getAttribute('data-gid'); el.innerHTML = '';
      if (R.L.stripItem) R.L.stripItem(R, gid, el);
      else { el.appendChild(h('span.g-name', null, R.gname(gid))); el.appendChild(h('b.g-score', null, R.score(gid))); }
      var r = R.rec(gid);
      if (r.badges.length) {
        var bw = h('span.g-badges'); r.badges.forEach(function (bid) { var b = R.badge(bid); if (b) bw.appendChild(ui.seal(b.name, R.C.icon, { small: true })); });
        el.appendChild(bw);
      }
      if (gid !== 'me') el.setAttribute('aria-pressed', String(gid === R.sel));
    });
    if (R.totalEl) {
      R.totalEl.innerHTML = '';
      if (R.L.totalView) R.L.totalView(R, R.totalEl);
      else R.totalEl.textContent = R.C.resource.goalName + ' ' + R.total() + '／' + R.target();
    }
  };
  p.select = function (gid) {
    this.sel = gid; XC.storage.set('sel_' + this.id, gid); this.refreshStrip(); this.updateTeacher(true);
    if (this.L.onSelect) this.L.onSelect(this, gid);
    ui.announce('已選取 ' + this.gname(gid));
  };

  /* ---------- 繪畫目前步驟 ---------- */
  p.setBg = function (src, opt) {
    opt = opt || {};
    var a = this.bgA, b = this.bgB, on = a.classList.contains('on') ? a : b, off = on === a ? b : a;
    if (!src) { a.classList.remove('on'); b.classList.remove('on'); this._bg = null; return; }
    if (this._bg === src && !opt.force) return;
    this._bg = src;
    off.style.backgroundImage = 'url("' + src + '")';
    off.style.backgroundPosition = opt.pos || '';
    off.classList.remove('kb'); void off.offsetWidth; off.classList.add('kb');
    /* 第一張背景由圖層墨跡揭幕帶出，不再另行淡入；之後的切換保留交叉淡入 */
    var first = !this._bgShown; this._bgShown = true;
    if (first) { off.style.transition = 'none'; off.classList.add('on'); void off.offsetWidth; off.style.transition = ''; }
    else off.classList.add('on');
    on.classList.remove('on');
  };
  p.render = function () {
    var R = this, sc = R.scene(), ph = R.phase();
    var theme = ph.theme || sc.theme || R.C.theme || 'night';
    R.layer.classList.remove('theme-night', 'theme-paper'); R.layer.classList.add('theme-' + theme);
    R.stageWrap.className = 'ls-stagewrap sc-' + sc.id + ' ph-' + ph.id + (ph.layout ? ' lay-' + ph.layout : '');
    /* 初始背景：如目前旁白句帶圖，直接用該圖，避免「階段圖→旁白圖」一閃 */
    var n0 = R.narr() || [], l0 = n0[Math.max(0, Math.min(R.ls.line || 0, n0.length - 1))];
    if (l0 && l0.img) R.setBg(l0.img, { pos: l0.pos }); else R.setBg(ph.bg || null, { pos: ph.bgPos });
    R.stage.innerHTML = '';
    R.stage.scrollTop = 0;
    R.strip.hidden = ph.strip === false;
    R.layer.classList.toggle('no-strip', ph.strip === false);
    // 步驟小標籤
    R.pills.innerHTML = '';
    sc.phases.forEach(function (x, i) {
      R.pills.appendChild(h('button.pill', { type: 'button', 'aria-current': i === R.ls.phase ? 'step' : null, on: { click: function () { R.go(R.ls.scene, i, 0); } } }, x.label));
    });
    if (R.L.render) try { R.L.render(R, sc, ph, R.stage); } catch (e) { console.error(e); R.stage.appendChild(h('p.err', null, '此步驟載入時出現問題：' + e.message)); }
    R.setLine(R.ls.line, true);
    ui.$$('.seg', R.prog).forEach(function (s, i) { s.classList.toggle('cur', i === R.ls.scene); s.setAttribute('aria-current', i === R.ls.scene ? 'step' : 'false'); });
    R.updateClock();
    R.updateTeacher();
    try { history.replaceState(history.state, '', '#/' + R.id + '/' + sc.id); } catch (e) {}
    if (R.ls.scene === R.scenes.length - 1 && R.ls.phase === sc.phases.length - 1) St.setProgress(R.id, 'done');
    XC.app && XC.app.titleFor && XC.app.titleFor(R.C.game + '｜' + sc.name);
  };
  p.rerender = function () { var keep = this.ls.line; this.render(); this.setLine(keep, true); };
  p.setLine = function (i, quiet) {
    var R = this, n = R.narr(), ph = R.phase(), sc = R.scene();
    i = Math.max(0, Math.min(i, Math.max(0, n.length - 1)));
    R.ls.line = i; R.save();
    var zh = R.sub.querySelector('.sub-zh'), en = R.sub.querySelector('.sub-en'), meta = R.sub.querySelector('.sub-meta');
    var line = n[i];
    if (line) {
      zh.textContent = line.zh; en.textContent = St.settings.englishSubs ? (line.en || '') : '';
      if (line.img) R.setBg(line.img, { pos: line.pos });
      R.sub.classList.remove('caption');
    } else {
      zh.textContent = ph.caption || ''; en.textContent = St.settings.englishSubs && ph.captionEn ? ph.captionEn : '';
      R.sub.classList.add('caption');
    }
    R.sub.classList.toggle('empty', !zh.textContent);
    meta.textContent = sc.name + '｜' + ph.label + (n.length > 1 ? '｜旁白 ' + (i + 1) + '／' + n.length : '');
    if (line && R.L.onLine) try { R.L.onLine(R, line, i, ph); } catch (e) { console.error(e); }
    if (!quiet) XC.audio.play('click');
  };
  p.updateClock = function () {
    var R = this, before = 0;
    for (var i = 0; i < R.ls.scene; i++) before += R.scenes[i].minutes * 60;
    var all = R.scenes.reduce(function (a, s) { return a + s.minutes * 60; }, 0);
    var el = R.timer.elapsed();
    ui.$$('.seg', R.prog).forEach(function (s, i) {
      var f = i < R.ls.scene ? 1 : i > R.ls.scene ? 0 : Math.min(1, el / Math.max(1, R.timer.total()));
      s.firstChild.style.transform = 'scaleX(' + f + ')';
    });
    R.clock.textContent = '已用 ' + ui.fmt(before + Math.min(el, R.scenes[R.ls.scene].minutes * 60)) + '／' + ui.fmt(all);
  };

  /* ---------- 教師面板 ---------- */
  p.toggleTeacher = function (v) {
    var R = this, open = v === undefined ? R.tPanel.hidden : v;
    if (!open) { R.tPanel.hidden = true; R.layer.classList.remove('t-open'); R.tBtn.setAttribute('aria-pressed', 'false'); return; }
    XC.teacher.unlock().then(function (ok) {
      if (!ok) return;
      R.tPanel.hidden = false; R.layer.classList.add('t-open'); R.tBtn.setAttribute('aria-pressed', 'true');
      R.updateTeacher(); var f = R.tPanel.querySelector('button'); if (f) f.focus();
    });
  };
  p.updateTeacher = function (keepScroll) {
    if (!this.tPanel || this.tPanel.hidden) return;
    var st = this.tPanel.scrollTop;
    XC.teacher.panel(this, this.tPanel);
    if (keepScroll) this.tPanel.scrollTop = st;
  };

  /* ---------- 請教卡提示 ---------- */
  p.hintBtn = function (key) {
    var R = this, hint = (R.C.hints || {})[key]; if (!hint) return null;
    var self = !R.isClass(), ds = R.ds();
    var used = self ? !!(ds.hints && ds.hints[key]) : R.propUsed(R.sel, 'ask');
    var b = ui.btn(self ? (used ? '請教卡（已使用，可再看）' : '請教卡') : '請教卡（' + R.gname(R.sel) + (used ? '：已使用' : '') + '）', { icon: 'key', cls: 'sm hint-btn' + (used ? ' used' : ''), onClick: function () {
      var show = function () { ui.modal({ title: '請教卡', cls: 'hint-modal', body: h('div', null, h('p.hint-txt', null, hint), h('p.fine', null, '請教卡＝求助不是弱。提示只指出思考方向，不直接給答案。')) }); };
      if (self) { ds.hints = ds.hints || {}; ds.hints[key] = true; R.save(); show(); R.rerender(); }
      else if (used) show();
      else { R.useProp(R.sel, 'ask'); show(); R.rerender(); }
    } });
    return b;
  };

  /* ---------- 快捷鍵 ---------- */
  p.onKey = function (e) {
    var R = this; if (!R.active) return;
    if (document.querySelector('.modal-back')) return;
    var t = e.target, tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable) return;
    var k = e.key;
    if ((k === ' ' || k === 'Enter') && (tag === 'button' || tag === 'a' || t.getAttribute('role') === 'button')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (k === 'ArrowRight' || k === 'PageDown') { e.preventDefault(); R.next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); R.prev(); }
    else if (k === ' ') { e.preventDefault(); R.timer.toggle(); }
    else if (k === 'r' || k === 'R') R.reveal();
    else if (k === 't' || k === 'T') R.toggleTeacher();
    else if (k === 'f' || k === 'F') ui.fullscreen();
    else if (k === 'm' || k === 'M') XC.audio.toggle();
    else if (/^[1-9]$/.test(k) && R.isClass()) { var g = St.groups()[parseInt(k, 10) - 1]; if (g) R.select(g.id); }
    else if (k === '+' || k === '=') R.add(R.cur(), 1, '教師加分');
    else if (k === '-' || k === '_') R.add(R.cur(), -1, '教師減分');
    else if (k === 'Escape' && !R.tPanel.hidden) R.toggleTeacher(false);
  };

  p.destroy = function () {
    this.active = false;
    if (this.L.leave) try { this.L.leave(this); } catch (e) {}
    this.timer.destroy();
    document.removeEventListener('keydown', this._key);
    XC.bus.off('mode', this._onMode); XC.bus.off('settings', this._onSet); XC.bus.off('sound', this._onSound);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  };
  XC.Runner = Runner;
})();
