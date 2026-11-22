/* 教師模式：分層內教師面板（T）＋教師控制台頁（#/teacher） */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state;
  var LV = ['—', '需提示', '部分達到', '獨立達到'];
  var T = XC.teacher = {};

  T.unlock = function () {
    var pin = St.settings.teacherPin;
    if (!pin || St.teacherUnlocked) return Promise.resolve(true);
    return ui.prompt('教師密碼', '請輸入 4 位數字教師密碼', { type: 'password', inputmode: 'numeric', max: 4 }).then(function (v) {
      if (v === pin) { St.teacherUnlocked = true; return true; }
      if (v != null) ui.toast('密碼不正確');
      return false;
    });
  };

  function sec(title, open) {
    var d = h('details.t-sec', { open: open ? true : null });
    d.appendChild(h('summary', null, title));
    return d;
  }
  function list(arr, cls) { var u = h('ul' + (cls ? '.' + cls : '')); (arr || []).forEach(function (x) { u.appendChild(h('li', { html: ui.esc(x).replace(/【([^】]+)】/g, '<mark class="verify">【$1】</mark>') })); }); return u; }

  /* ---------- 分層內教師面板 ---------- */
  T.panel = function (R, el) {
    var sc = R.scene(), ph = R.phase(), C = R.C;
    el.innerHTML = '';
    el.appendChild(h('div.t-head', null, h('h2', null, '教師面板'), ui.btn('', { icon: 'close', title: '關閉教師面板（T）', onClick: function () { R.toggleTeacher(false); } })));
    el.appendChild(h('p.t-where', null, '第' + C.no + '節｜' + sc.name + '（' + sc.minutes + ' 分鐘）｜' + ph.label));

    /* 本環節 */
    var s1 = sec('本環節：參考答案與備註', true);
    if (sc.goal) s1.appendChild(h('p', null, h('b', null, '目的：'), sc.goal));
    if (sc.mechanic) s1.appendChild(h('p', null, h('b', null, '遊戲機制：'), sc.mechanic));
    if (ph.teacher) s1.appendChild(h('p.t-ph', null, h('b', null, '此步驟：'), ph.teacher));
    (sc.questions || []).forEach(function (q, i) {
      s1.appendChild(h('div.t-q', null, h('p.t-qq', null, '提問' + (sc.questions.length > 1 ? '一二三四'[i] : '') + '：' + q.q), h('p.t-ref', null, h('b', null, '參考答案：'), q.ref)));
    });
    if (sc.feedback) s1.appendChild(h('p.t-fb', null, h('b', null, '教師回饋：'), '「' + sc.feedback + '」'));
    if (sc.teacherNotes && sc.teacherNotes.length) { s1.appendChild(h('p', null, h('b', null, '教師備註'))); s1.appendChild(list(sc.teacherNotes)); }
    if (sc.cautions && sc.cautions.length) { s1.appendChild(h('p', null, h('b', null, '注意事項'))); s1.appendChild(list(sc.cautions)); }
    if (sc.timeTips) s1.appendChild(h('p.t-time', null, h('b', null, '時間不足建議：'), sc.timeTips));
    el.appendChild(s1);

    /* 計分與道具 */
    var s2 = sec(R.isClass() ? '計分與道具（按組號固定排列）' : '計分（自學模式：只屬自己）', true);
    if (R.isClass()) {
      var gp = h('div.t-groups', { role: 'group', 'aria-label': '選擇組別' });
      St.groups().forEach(function (g) {
        gp.appendChild(h('button.btn.btn-line.sm', { type: 'button', 'aria-pressed': String(g.id === R.sel), on: { click: function () { R.select(g.id); } } }, g.name + ' ' + R.score(g.id)));
      });
      s2.appendChild(gp);
    }
    var row = h('div.t-row');
    row.appendChild(ui.btn('+1', { icon: 'plus', cls: 'sm', title: '加 1（＋）', onClick: function () { R.add(R.cur(), 1, '教師加分'); } }));
    row.appendChild(ui.btn('−1', { icon: 'minus', cls: 'sm', title: '減 1（－）', onClick: function () { R.add(R.cur(), -1, '教師減分'); } }));
    row.appendChild(ui.btn('撤銷上一步', { icon: 'undo', cls: 'sm', onClick: function () { R.undo(); } }));
    s2.appendChild(row);
    if (R.L.teacherTools) { var tt = h('div.t-tools'); R.L.teacherTools(R, sc, ph, tt); if (tt.childNodes.length) s2.appendChild(tt); }
    var props = C.props || [];
    if (props.length) {
      var pr = h('div.t-row');
      props.forEach(function (p) {
        var used = R.propUsed(R.cur(), p.id);
        pr.appendChild(ui.btn(p.name + '：' + (used ? '已用' : '未用'), { cls: 'sm prop' + (used ? ' used' : ''), title: '點擊切換「已用／未用」', onClick: function () { R.useProp(R.cur(), p.id, !used); } }));
      });
      s2.appendChild(h('p.fine', null, R.gname(R.cur()) + ' 的道具卡（一次性）：'));
      s2.appendChild(pr);
    }
    s2.appendChild(h('div.t-row', null, ui.btn('觸發「' + (C.resource.goalDone || '目標達成') + '」動畫', { icon: 'lamp', cls: 'sm', onClick: function () { XC.app.goalFx(R.id); } })));
    el.appendChild(s2);

    /* 徽章 */
    var s3 = sec('頒發徽章（' + R.gname(R.cur()) + '）', false);
    s3.appendChild(h('p.fine', null, '徽章表揚行為，不比較多少；再按一次可收回。'));
    var br = h('div.t-badges');
    (C.badges || []).forEach(function (b) {
      var has = R.rec(R.cur()).badges.indexOf(b.id) >= 0;
      br.appendChild(h('button.btn.btn-line.t-badge', { type: 'button', 'aria-pressed': String(has), on: { click: function () { R.award(R.cur(), b.id); } } }, ui.seal(b.name, C.icon, { small: true }), h('span', null, h('b', null, b.name), h('small', null, b.desc))));
    });
    s3.appendChild(br); el.appendChild(s3);

    /* 流程與差異化 */
    var s4 = sec('流程與差異化', false);
    s4.appendChild(h('div.t-row', null,
      ui.btn(R.ls.short ? '精簡版流程：已套用' : '一鍵套用精簡版流程', { cls: 'sm', pressed: !!R.ls.short, onClick: function () { R.ls.short = !R.ls.short; R.save(); R.timer.set(R.sceneSeconds(), false); R.rerender(); ui.toast(R.ls.short ? '已套用精簡版：縮短討論，保留揭曉' : '已回復完整流程'); } }),
      ui.btn(R.support ? '支援：開' : '支援：關', { cls: 'sm', pressed: R.support, onClick: function () { R.support = !R.support; R.syncChrome(); R.rerender(); } }),
      ui.btn('跳到揭曉（R）', { cls: 'sm', onClick: function () { R.reveal(); } })));
    var D = C.differentiation || {};
    if (D.support) { s4.appendChild(h('p', null, h('b', null, '較需支援：'))); s4.appendChild(list(D.support)); }
    if (D.challenge) { s4.appendChild(h('p', null, h('b', null, '能力較高：'))); s4.appendChild(list(D.challenge)); }
    if (D.crossSubject) s4.appendChild(h('p', null, h('b', null, '跨科連結：'), D.crossSubject));
    el.appendChild(s4);

    /* 觀察表 */
    var s5 = sec('教師觀察表（點一下輪換三級）', false);
    T.obsTable(R.id, s5, C);
    el.appendChild(s5);
    el.appendChild(h('div.t-row', null, h('a.btn.btn-line.sm', { href: '#/' + R.id + '/print' }, '本節列印教材（A4 卡牌、A5 產出卡、A3 海報）')));
    el.appendChild(h('p.fine', null, '更多設定：', h('a', { href: '#/teacher' }, '教師控制台')));
  };

  /* ---------- 觀察表 ---------- */
  T.obsTable = function (lid, host, C) {
    var obs = St.obs()[lid] || {}, ind = C.observation || [];
    var tb = h('table.obs');
    var hr = h('tr', null, h('th', { scope: 'col' }, '組別'));
    ind.forEach(function (o, i) { hr.appendChild(h('th', { scope: 'col', title: o.standard + '（' + o.scene + '｜' + o.record + '）' }, o.indicator, h('small', null, o.scene))); });
    hr.appendChild(h('th', { scope: 'col' }, '備註'));
    tb.appendChild(h('thead', null, hr));
    var body = h('tbody');
    St.groups().forEach(function (g) {
      var r = h('tr', null, h('th', { scope: 'row' }, g.name)), go = obs[g.id] || {};
      ind.forEach(function (o, i) {
        var v = go[i] || 0;
        var b = h('button.obs-c.lv' + v, { type: 'button', 'aria-label': g.name + ' ' + o.indicator + '：' + LV[v], on: { click: function () {
          v = (v + 1) % 4; St.setObs(lid, g.id, i, v); b.className = 'obs-c lv' + v; b.textContent = LV[v]; b.setAttribute('aria-label', g.name + ' ' + o.indicator + '：' + LV[v]);
        } } }, LV[v]);
        r.appendChild(h('td', null, b));
      });
      var note = h('input.inp.obs-note', { type: 'text', maxlength: 60, 'aria-label': g.name + ' 備註', placeholder: '簡短備註' });
      note.value = go.note || '';
      note.addEventListener('change', function () { St.setObs(lid, g.id, 'note', note.value); });
      r.appendChild(h('td', null, note));
      body.appendChild(r);
    });
    tb.appendChild(body);
    host.appendChild(h('div.obs-wrap', null, tb));
    host.appendChild(h('p.fine', null, '三級：需提示／部分達到／獨立達到。達標表現：' + ind.map(function (o) { return o.indicator + '＝' + o.standard; }).join('；')));
    host.appendChild(h('div.t-row', null,
      ui.btn('匯出 CSV', { icon: 'download', cls: 'sm', onClick: function () { T.exportCSV([lid]); } }),
      ui.btn('列印觀察表', { icon: 'print', cls: 'sm', onClick: function () { T.printObs(lid, C); } })));
  };
  T.obsRows = function (lid, C) {
    var obs = St.obs()[lid] || {}, ind = C.observation || [], rows = [];
    St.groups().forEach(function (g) {
      var go = obs[g.id] || {};
      rows.push(['第' + C.no + '節 ' + C.game, g.name].concat(ind.map(function (o, i) { return LV[go[i] || 0]; })).concat([go.note || '']));
    });
    return rows;
  };
  T.exportCSV = function (ids) {
    var rows = [];
    ids.forEach(function (lid) {
      var C = XC.content[lid]; if (!C) return;
      rows.push(['節', '組別'].concat((C.observation || []).map(function (o) { return o.indicator; })).concat(['備註']));
      rows = rows.concat(T.obsRows(lid, C)); rows.push([]);
    });
    XC.export.csv(rows, '教師觀察表-' + XC.export.stamp() + '.csv');
  };
  T.printObs = function (lid, C) {
    var ind = C.observation || [];
    var html = '<section class="print-obs"><h1>教師觀察表｜第' + C.no + '節《' + ui.esc(C.game) + '》' + ui.esc(C.tagline) + '</h1>' +
      '<p>三級：需提示／部分達到／獨立達到（請勾選）</p><table><thead><tr><th>組別</th>' +
      ind.map(function (o) { return '<th>' + ui.esc(o.indicator) + '<br><small>' + ui.esc(o.standard) + '｜' + ui.esc(o.scene) + '</small></th>'; }).join('') + '<th>備註</th></tr></thead><tbody>' +
      T.obsRows(lid, C).map(function (r) { return '<tr><th>' + ui.esc(r[1]) + '</th>' + r.slice(2).map(function (c) { return '<td>' + ui.esc(c === '—' ? '' : c) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table><p class="pf">心學心傳．古為今用｜教師觀察表</p></section>';
    XC.export.printHTML(html, 'doc');
  };

  /* ---------- 教師控制台 #/teacher ---------- */
  T.console = function (host) {
    var s = St.settings, Lc = XC.content.common.lessons;
    host.innerHTML = '';
    var wrap = h('div.page-body.t-console');
    /* 班級設定 */
    var f = h('section.card.c-sec', null, h('h2', null, '班級設定'));
    function num(label, key, min, max, sub) {
      var i = h('input.inp', { type: 'number', min: min, max: max, value: sub ? (s[sub][key] == null ? '' : s[sub][key]) : s[key], 'aria-label': label });
      i.addEventListener('change', function () { var v = parseInt(i.value, 10); if (isNaN(v)) return; v = Math.max(min, Math.min(max, v)); if (sub) s[sub][key] = v; else s[key] = v; i.value = v; });
      return h('label.fld.inline', null, h('span.fld-l', null, label), i);
    }
    function chk(label, key, after) {
      var i = h('input', { type: 'checkbox' }); i.checked = !!s[key];
      i.addEventListener('change', function () { s[key] = i.checked; after && after(); });
      return h('label.chk', null, i, h('span', null, label));
    }
    function sel(label, key, opts) {
      var i = h('select.inp', { 'aria-label': label }); opts.forEach(function (o) { var op = h('option', { value: o[0] }, o[1]); if (s[key] === o[0]) op.selected = true; i.appendChild(op); });
      i.addEventListener('change', function () { s[key] = i.value; });
      return h('label.fld.inline', null, h('span.fld-l', null, label), i);
    }
    f.appendChild(h('div.c-grid', null, num('全班人數', 'classSize', 1, 60), num('組數（2–12）', 'groupCount', 2, 12), num('字數提示門檻', 'minChars', 0, 60),
      sel('預設模式', 'defaultMode', [['class', '課堂模式'], ['self', '自學模式']]), sel('動畫強度', 'motion', [['full', '完整'], ['reduced', '減少（淡入淡出）']])));
    var gn = h('div.c-names'); f.appendChild(h('p.fld-l', null, '組名（不可用學生姓名）'));
    for (var i = 0; i < s.groupCount; i++) (function (i) {
      var inp = h('input.inp', { type: 'text', maxlength: 8, value: s.groupNames[i] || '', 'aria-label': '第' + (i + 1) + '組組名' });
      inp.addEventListener('change', function () { s.groupNames[i] = inp.value.trim() || XC.config.groupNames[i]; });
      gn.appendChild(inp);
    })(i);
    f.appendChild(gn);
    var tg = h('div.c-grid'); f.appendChild(h('p.fld-l', null, '各節全班共同目標值'));
    Lc.forEach(function (l) { tg.appendChild(num('第' + l.no + '節 ' + l.goalName, l.id, 0, 999, 'targets')); });
    f.appendChild(tg);
    var pin = h('input.inp', { type: 'password', inputmode: 'numeric', maxlength: 4, value: s.teacherPin || '', placeholder: '留空＝不設', 'aria-label': '教師密碼' });
    pin.addEventListener('change', function () { var v = pin.value.trim(); if (v && !/^\d{4}$/.test(v)) { ui.toast('密碼須為 4 位數字'); pin.value = s.teacherPin || ''; return; } s.teacherPin = v; });
    f.appendChild(h('div.c-grid', null, h('label.fld.inline', null, h('span.fld-l', null, '教師密碼（4 位數字）'), pin)));
    f.appendChild(h('div.c-row', null, chk('投影放大（全站字級 ×1.25）', 'projectionZoom'), chk('英文副字幕', 'englishSubs'), chk('自學模式依次解鎖', 'sequentialUnlock')));
    f.appendChild(h('div.c-row', null, ui.btn('儲存設定', { primary: true, icon: 'check', onClick: function () { St.saveSettings(); XC.app.applySettings(); ui.toast('設定已儲存（只存在本機）'); T.console(host); } }),
      ui.btn('還原為 config.js 預設', { icon: 'reset', onClick: function () { ui.confirm('確定還原所有班級設定為 config.js 的預設值？').then(function (ok) { if (!ok) return; XC.storage.remove('settings'); St.loadSettings(); XC.app.applySettings(); T.console(host); }); } })));
    wrap.appendChild(f);

    /* 進度 */
    var pg = h('section.card.c-sec', null, h('h2', null, '進度'));
    var prog = St.progress();
    var ptb = h('div.c-prog');
    Lc.forEach(function (l) {
      var sl = h('select.inp', { 'aria-label': '第' + l.no + '節狀態' });
      [['', '未點亮'], ['active', '進行中'], ['done', '已完成']].forEach(function (o) { var op = h('option', { value: o[0] }, o[1]); if ((prog[l.id] || '') === o[0]) op.selected = true; sl.appendChild(op); });
      sl.addEventListener('change', function () { St.setProgress(l.id, sl.value || null); ui.toast('已更新第' + l.no + '節狀態'); });
      ptb.appendChild(h('div.c-prow', null, h('span', null, '第' + l.no + '節《' + l.game + '》'), sl,
        ui.btn('重設本節數據', { cls: 'sm', icon: 'trash', onClick: function () { ui.confirm('確定重設第' + l.no + '節的分數、道具、徽章與位置？（回顧盒的個人產出不受影響）').then(function (ok) { if (ok) { St.resetLesson(l.id); T.console(host); ui.toast('已重設'); } }); } })));
    });
    pg.appendChild(ptb);
    pg.appendChild(h('div.c-row', null, ui.btn('重設全部數據', { icon: 'trash', onClick: function () {
      ui.confirm('確定重設全部六節的課堂數據、觀察表與進度？（班級設定保留；學生回顧盒亦會清除）', '全部重設').then(function (ok) {
        if (!ok) return; XC.storage.clear(function (k) { return k !== 'settings' && k !== 'sound' && k !== 'visited'; }); location.reload();
      });
    } })));
    wrap.appendChild(pg);
    /* 列印教材 */
    var prs = h('section.card.c-sec', null, h('h2', null, '列印教材'), h('p.fine', null, '按大綱「教材製作清單」排版的 A4 卡牌、A5 產出卡及 A3 海報；建議用 Chrome 或 Edge 列印並勾選「背景圖形」。'));
    var prr = h('div.c-row');
    Lc.forEach(function (l) { prr.appendChild(h('a.btn.btn-line.sm', { href: '#/' + l.id + '/print' }, '第' + l.no + '節《' + l.game + '》')); });
    prs.appendChild(prr); wrap.appendChild(prs);
    /* 觀察表 */
    var ob = h('section.card.c-sec', null, h('h2', null, '教師觀察表'));
    var tabs = h('div.c-tabs', { role: 'tablist' }), obHost = h('div.c-obs');
    function showObs(l) {
      ui.$$('button', tabs).forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.l === l.id)); });
      obHost.innerHTML = '';
      if (!l.ready) { obHost.appendChild(h('p.fine', null, '第' + l.no + '節將於之後的建置階段完成，屆時這裏會顯示該節的四項觀察指標。')); return; }
      XC.app.loadContent(l.id).then(function () { T.obsTable(l.id, obHost, XC.content[l.id]); });
    }
    Lc.forEach(function (l) { tabs.appendChild(h('button.btn.btn-line.sm', { type: 'button', role: 'tab', 'data-l': l.id, on: { click: function () { showObs(l); } } }, '第' + l.no + '節')); });
    ob.appendChild(tabs); ob.appendChild(obHost);
    ob.appendChild(h('div.c-row', null, ui.btn('匯出全部已建置節次 CSV', { icon: 'download', cls: 'sm', onClick: function () {
      var ids = Lc.filter(function (l) { return l.ready; }).map(function (l) { return l.id; });
      Promise.all(ids.map(XC.app.loadContent)).then(function () { T.exportCSV(ids); });
    } })));
    wrap.appendChild(ob); setTimeout(function () { showObs(Lc[0]); }, 0);

    /* 匯出入、動畫、示範 */
    var ex = h('section.card.c-sec', null, h('h2', null, '設定匯出／匯入、動畫與示範'));
    ex.appendChild(h('div.c-row', null,
      ui.btn('匯出設定（.json）', { icon: 'download', onClick: function () { XC.export.json({ type: 'xinxue-settings', version: XC.config.version, settings: St.settings, obs: St.obs() }, '班級設定-' + XC.export.stamp() + '.json'); } }),
      ui.btn('匯入設定', { icon: 'upload', onClick: function () {
        XC.export.pickJSON().then(function (o) {
          if (!o || o.type !== 'xinxue-settings') { ui.toast('檔案格式不符'); return; }
          XC.storage.set('settings', o.settings); if (o.obs) XC.storage.set('obs', o.obs); St.loadSettings(); XC.app.applySettings(); T.console(host); ui.toast('已匯入設定');
        }).catch(function () { ui.toast('未能讀取檔案'); });
      } })));
    var an = h('div.c-row', null, ui.btn('播放終章', { icon: 'film', onClick: function () { XC.router.go('finale'); } }));
    Lc.forEach(function (l) { if (l.ready) an.appendChild(ui.btn('第' + l.no + '節「' + l.goalDone + '」動畫', { icon: 'lamp', cls: 'sm', onClick: function () { XC.app.goalFx(l.id); } })); });
    ex.appendChild(an);
    ex.appendChild(h('div.c-row', null,
      ui.btn('載入示範資料', { icon: 'star', cls: 'sm', onClick: function () { XC.app.demo(true); T.console(host); } }),
      ui.btn('清除示範資料', { icon: 'trash', cls: 'sm', onClick: function () { XC.app.demo(false); T.console(host); } })));
    ex.appendChild(h('p.fine', null, '示範資料：8 組虛構分數與一張示範志向卡，供評審或同事看效果。網站沒有後端，不同裝置之間不會同步；所有資料只存在本機。'));
    wrap.appendChild(ex);
    host.appendChild(wrap);
  };
})();
