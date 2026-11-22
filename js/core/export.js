/* 匯出：產出卡 PNG（canvas 程序繪製，file:// 亦可用）、JSON 備份、CSV（UTF-8 BOM）、A5 列印 */
(function () {
  var XC = window.XC, ui = XC.ui;
  var E = XC.export = {};
  function download(blob, name) {
    var a = document.createElement('a'), url = URL.createObjectURL(blob);
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }
  E.download = download;
  E.json = function (obj, name) { download(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }), name); };
  E.csv = function (rows, name) {
    var s = rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\r\n');
    download(new Blob(['\uFEFF' + s], { type: 'text/csv;charset=utf-8' }), name);
  };
  E.pickJSON = function () {
    return new Promise(function (res, rej) {
      var i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
      i.onchange = function () {
        var f = i.files[0]; if (!f) return rej();
        var r = new FileReader(); r.onload = function () { try { res(JSON.parse(r.result)); } catch (e) { rej(e); } }; r.readAsText(f);
      };
      i.click();
    });
  };
  E.stamp = function () { var d = new Date(); return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); };

  /* ---- 卡片繪製 ---- */
  function wrap(c, text, maxW) {
    var lines = [], paras = String(text || '').split('\n');
    paras.forEach(function (p) {
      var line = '';
      for (var i = 0; i < p.length; i++) {
        var t = line + p[i];
        if (c.measureText(t).width > maxW && line) { lines.push(line); line = p[i]; } else line = t;
      }
      lines.push(line);
    });
    return lines;
  }
  function paper(c, W, H) {
    c.fillStyle = '#E5DDCB'; c.fillRect(0, 0, W, H);
    var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < 2600; i++) { c.fillStyle = 'rgba(60,50,40,' + (rnd() * 0.05) + ')'; c.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2); }
    c.strokeStyle = 'rgba(90,80,70,.07)'; c.lineWidth = 1;
    for (var j = 0; j < 260; j++) { var x = rnd() * W, y = rnd() * H, a = rnd() * 6.28, l = 10 + rnd() * 40; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l / 2 + 4, y + Math.sin(a) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    var g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(36,35,34,.28)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  function inkFrame(c, x, y, w, h) {
    c.save(); c.strokeStyle = 'rgba(36,35,34,.55)'; c.lineCap = 'round';
    for (var k = 0; k < 2; k++) {
      c.lineWidth = k ? 1.5 : 4; var o = k * 12;
      c.beginPath(); c.moveTo(x + o, y + o + 3); c.lineTo(x + w - o - 2, y + o); c.lineTo(x + w - o, y + h - o - 4); c.lineTo(x + o + 3, y + h - o); c.closePath(); c.stroke();
    }
    c.restore();
  }
  function lamp(c, x, y, s, lit) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (lit) { var g = c.createRadialGradient(0, -22, 2, 0, -22, 60); g.addColorStop(0, 'rgba(244,203,153,.85)'); g.addColorStop(1, 'rgba(244,203,153,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -22, 60, 0, 6.28); c.fill(); }
    c.fillStyle = '#242322'; c.beginPath(); c.moveTo(-34, 0); c.quadraticCurveTo(0, 26, 34, 0); c.closePath(); c.fill();
    c.fillRect(-4, 10, 8, 22); c.fillRect(-18, 30, 36, 6);
    if (lit) { c.fillStyle = '#EDC089'; c.beginPath(); c.moveTo(0, -48); c.quadraticCurveTo(14, -24, 0, -4); c.quadraticCurveTo(-14, -24, 0, -48); c.fill(); c.fillStyle = '#FD7108'; c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(6, -16, 0, -6); c.quadraticCurveTo(-6, -16, 0, -30); c.fill(); }
    c.restore();
  }
  function fontsReady() {
    var p = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    return Promise.race([p, new Promise(function (r) { setTimeout(r, 1500); })]);
  }
  /* card = {kicker, title, en, fields:[{label, value}], footer, lit} */
  E.renderCard = function (card) {
    var W = 1080, H = 1528, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    var serif = '"Noto Serif HK","Noto Serif TC","PMingLiU",serif', kai = '"LXGW WenKai TC","Noto Serif HK",serif';
    paper(c, W, H); inkFrame(c, 48, 48, W - 96, H - 96);
    lamp(c, W / 2, 210, 1.6, card.lit !== false);
    c.textAlign = 'center'; c.fillStyle = '#585551'; c.font = '30px ' + serif; c.fillText(card.kicker || '', W / 2, 120);
    c.fillStyle = '#0C0B0B'; c.font = 'bold 72px ' + kai; c.fillText(card.title || '', W / 2, 330);
    if (card.en) { c.fillStyle = '#585551'; c.font = 'italic 30px "EB Garamond",Georgia,serif'; c.fillText(card.en, W / 2, 376); }
    c.textAlign = 'left'; var y = 450, x = 120, mw = W - 240;
    (card.fields || []).forEach(function (f) {
      if (y > H - 220) return;
      c.fillStyle = '#765339'; c.font = 'bold 34px ' + kai; c.fillText(f.label, x, y); y += 16;
      c.strokeStyle = 'rgba(36,35,34,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + mw, y); c.stroke(); y += 50;
      c.fillStyle = '#242322'; c.font = '36px ' + serif;
      wrap(c, f.value || '—', mw).slice(0, 7).forEach(function (ln) { c.fillText(ln, x, y); y += 54; });
      y += 30;
    });
    c.textAlign = 'center'; c.fillStyle = '#585551'; c.font = '24px ' + serif;
    c.fillText(card.footer || '心學心傳．古為今用', W / 2, H - 92);
    return cv;
  };
  E.cardPNG = function (card, name) {
    return fontsReady().then(function () {
      var cv = E.renderCard(card);
      return new Promise(function (res) {
        try { cv.toBlob(function (b) { if (b) download(b, name || 'card.png'); res(); }, 'image/png'); }
        catch (e) { ui.toast('此瀏覽器未能輸出圖片，請改用列印'); res(); }
      });
    });
  };
  /* A5 列印單張卡 */
  E.printCard = function (card) {
    var root = document.getElementById('print-root');
    var html = '<article class="print-card"><div class="pc-kicker">' + ui.esc(card.kicker || '') + '</div><h1>' + ui.esc(card.title || '') + '</h1>' +
      (card.en ? '<p class="pc-en">' + ui.esc(card.en) + '</p>' : '') +
      (card.fields || []).map(function (f) { return '<section><h2>' + ui.esc(f.label) + '</h2><p>' + ui.esc(f.value || '　').replace(/\n/g, '<br>') + '</p></section>'; }).join('') +
      '<footer>' + ui.esc(card.footer || '') + '</footer></article>';
    E.printHTML(html, 'card');
  };
  E.printHTML = function (html, kind) {
    var root = document.getElementById('print-root');
    root.innerHTML = html; document.body.classList.add('printing', 'print-' + (kind || 'doc'));
    setTimeout(function () {
      window.print();
      setTimeout(function () { document.body.classList.remove('printing', 'print-' + (kind || 'doc')); root.innerHTML = ''; }, 600);
    }, 120);
  };
})();
