/* 聲音：全部以 Web Audio API 程序合成（無版權問題）；預設靜音 */
(function () {
  var XC = window.XC, ctx = null, master = null;
  var A = XC.audio = {
    on: XC.storage.get('sound', false),
    bgm: null, bgmOn: false,
    ensure: function () {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    },
    toggle: function (v) {
      A.on = (v === undefined) ? !A.on : !!v;
      XC.storage.set('sound', A.on);
      if (A.on) { A.ensure(); A.play('click'); }
      if (!A.on && A.bgm) { A.bgm.pause(); A.bgmOn = false; }
      XC.bus.emit('sound', A.on);
    },
    toggleBgm: function () {
      if (!A.bgm) return;
      if (A.bgmOn) { A.bgm.pause(); A.bgmOn = false; } else { A.bgm.volume = 0.35; A.bgm.play().catch(function () {}); A.bgmOn = true; }
      XC.bus.emit('bgm', A.bgmOn);
    },
    play: function (name) {
      if (!A.on) return;
      var c = A.ensure(); if (!c) return;
      try { (SFX[name] || SFX.click)(c, c.currentTime + 0.01); } catch (e) {}
    },
    initBgm: function () {
      var src = XC.config.bgm; if (!src) return;
      var a = new Audio(); a.loop = true; a.preload = 'metadata';
      a.addEventListener('loadedmetadata', function () { A.bgm = a; XC.bus.emit('bgm-available'); });
      a.src = src;
    },
    stopAll: function () { if (A.bgm && A.bgmOn) { A.bgm.pause(); A.bgmOn = false; XC.bus.emit('bgm', false); } }
  };
  function noise(c, dur) {
    var b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(); s.buffer = b; return s;
  }
  function env(c, t, a, peak, dec) {
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
    return g;
  }
  function tone(c, t, f, type, peak, dec, f2) {
    var o = c.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dec * 0.6);
    var g = env(c, t, 0.005, peak, dec); o.connect(g); g.connect(master); o.start(t); o.stop(t + dec + 0.1);
  }
  var SFX = {
    /* 燈火點亮：濾波噪聲「呼」一聲 */
    lamp: function (c, t) {
      var n = noise(c, 1.1), f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9;
      f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(1500, t + 0.55);
      var g = env(c, t, 0.18, 0.45, 0.7); n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 1.1);
    },
    /* 揭曉／時間到：柔和磬聲（正弦波＋長衰減） */
    chime: function (c, t) {
      [[1, 0.32, 3.6], [2.76, 0.1, 2.2], [5.4, 0.04, 1.2]].forEach(function (p) { tone(c, t, 392 * p[0], 'sine', p[1], p[2]); });
    },
    /* 點擊：輕木魚 */
    click: function (c, t) { tone(c, t, 880, 'sine', 0.22, 0.12, 380); },
    /* 翻卡：紙聲 */
    flip: function (c, t) {
      var n = noise(c, 0.3), f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800;
      var g = env(c, t, 0.02, 0.22, 0.2); n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.3);
    },
    /* 墨滴：低沉水滴 */
    drop: function (c, t) { tone(c, t, 420, 'sine', 0.32, 0.45, 110); },
    /* 燈火變暗：低沉氣聲（不用警告音） */
    dim: function (c, t) {
      var n = noise(c, 0.8), f = c.createBiquadFilter(); f.type = 'lowpass';
      f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(180, t + 0.6);
      var g = env(c, t, 0.05, 0.2, 0.6); n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.8);
    },
    /* 印章蓋下 */
    stamp: function (c, t) { tone(c, t, 140, 'sine', 0.4, 0.25, 60); SFX.chime(c, t + 0.12); },
    timeup: function (c, t) { SFX.chime(c, t); }
  };
})();
