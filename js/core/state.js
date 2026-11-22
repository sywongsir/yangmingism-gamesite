/* 全站狀態：設定、分組、各節進度、回顧盒、觀察表；事件匯流 XC.bus */
(function () {
  var XC = window.XC, S = XC.storage;
  var ev = {};
  XC.bus = {
    on: function (e, f) { (ev[e] = ev[e] || []).push(f); },
    off: function (e, f) { ev[e] = (ev[e] || []).filter(function (x) { return x !== f; }); },
    emit: function (e, d) { (ev[e] || []).slice().forEach(function (f) { try { f(d); } catch (err) { console.error(err); } }); }
  };
  var cache = {}, selfCache = {};
  var keysSettings = ['classSize', 'groupCount', 'groupNames', 'teacherPin', 'projectionZoom', 'motion',
    'englishSubs', 'defaultMode', 'sequentialUnlock', 'minChars'];

  var st = XC.state = {
    settings: null,
    mode: 'class',
    loadSettings: function () {
      var c = XC.config, saved = S.get('settings', {}), s = {};
      keysSettings.forEach(function (k) { s[k] = saved[k] !== undefined ? saved[k] : JSON.parse(JSON.stringify(c[k])); });
      s.targets = Object.assign({}, c.targets, saved.targets || {});
      s.l1 = Object.assign({}, c.l1, saved.l1 || {});
      s.groupCount = Math.max(2, Math.min(12, parseInt(s.groupCount, 10) || 8));
      st.settings = s;
      var q = st.queryMode();
      st.mode = q || S.get('mode', s.defaultMode) || 'class';
      return s;
    },
    saveSettings: function () { S.set('settings', st.settings); XC.bus.emit('settings', st.settings); },
    queryMode: function () {
      var m = null;
      try { m = new URLSearchParams(location.search).get('mode'); } catch (e) {}
      if (!m) { var mm = /[?&]mode=(class|self)/.exec(location.hash); if (mm) m = mm[1]; }
      return (m === 'class' || m === 'self') ? m : null;
    },
    setMode: function (m) { st.mode = m; S.set('mode', m); XC.bus.emit('mode', m); },
    groups: function () {
      var n = st.settings.groupCount, out = [];
      for (var i = 0; i < n; i++) out.push({ id: 'g' + (i + 1), idx: i, name: st.settings.groupNames[i] || ('第' + (i + 1) + '組') });
      return out;
    },
    groupName: function (gid) {
      if (gid === 'me') return '我';
      var i = parseInt(String(gid).slice(1), 10) - 1;
      return st.settings.groupNames[i] || ('第' + (i + 1) + '組');
    },
    /* 課堂模式（全班）各節資料 */
    lesson: function (id) {
      if (!cache[id]) cache[id] = S.get('lesson_' + id, null) || { scene: 0, phase: 0, line: 0, groups: {}, hist: [], data: {}, short: false };
      return cache[id];
    },
    saveLesson: function (id) { if (cache[id]) S.set('lesson_' + id, cache[id]); },
    /* 自學模式（個人）各節資料 */
    self: function (id) {
      if (!selfCache[id]) selfCache[id] = S.get('self_' + id, null) || { scene: 0, phase: 0, line: 0, score: null, hist: [], data: {}, props: {}, hints: {}, badges: [] };
      return selfCache[id];
    },
    saveSelf: function (id) { if (selfCache[id]) S.set('self_' + id, selfCache[id]); },
    resetLesson: function (id) {
      delete cache[id]; delete selfCache[id];
      S.remove('lesson_' + id); S.remove('self_' + id);
      var p = st.progress(); delete p[id]; S.set('progress', p);
      XC.bus.emit('progress', p);
    },
    progress: function () { return S.get('progress', {}); },
    setProgress: function (id, v) {
      var p = st.progress();
      if (v === 'active' && p[id] === 'done') return;
      if (v) p[id] = v; else delete p[id];
      S.set('progress', p); XC.bus.emit('progress', p);
    },
    /* 我的回顧盒 */
    box: function () { return S.get('box', {}); },
    saveBoxItem: function (lesson, key, item) {
      var b = st.box(); b[lesson] = b[lesson] || {};
      b[lesson][key] = Object.assign({}, item, { savedAt: new Date().toISOString() });
      S.set('box', b); XC.bus.emit('box', b);
    },
    removeBoxItem: function (lesson, key) {
      var b = st.box(); if (b[lesson]) { delete b[lesson][key]; if (!Object.keys(b[lesson]).length) delete b[lesson]; }
      S.set('box', b); XC.bus.emit('box', b);
    },
    /* 教師觀察表 obs[lesson][gid][i] = 0 未記／1 需提示／2 部分達到／3 獨立達到；note */
    obs: function () { return S.get('obs', {}); },
    setObs: function (lesson, gid, idx, val) {
      var o = st.obs(); o[lesson] = o[lesson] || {}; o[lesson][gid] = o[lesson][gid] || {};
      o[lesson][gid][idx] = val; S.set('obs', o);
    },
    teacherUnlocked: false
  };
})();
