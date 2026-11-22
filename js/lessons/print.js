/* 列印教材頁 #/lN/print：按大綱「教材製作清單」把卡牌排成 A4（每頁 8 或 4 張，虛線為裁切線）、
   A5 產出卡、A3 海報、貼紙與工作紙。文字全部取自 js/content/lN.js 與 js/content/print.js。 */
(function () {
  var XC = window.XC, ui = XC.ui, h = ui.h, St = XC.state;
  var PR = XC.print = {};
  function Q() { return XC.content.print; }
  function U() { return Q().ui; }
  function esc(s) { return ui.esc(s == null ? '' : String(s)); }
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  function chunk(a, n) { var o = []; for (var i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; }
  function rep(a, n) { var o = []; for (var i = 0; i < n; i++) o = o.concat(a); return o; }
  function ico(name) { return ui.icon(ui.icons && ui.icons[name] ? name : 'lamp'); }
  function phaseText(sc, id) {
    var p = (sc.phases || []).filter(function (x) { return x.id === id; })[0];
    return p && p.narration ? p.narration.map(function (n) { return n.zh; }).join('') : '';
  }

  /* ---------- 版面元件 ---------- */
  function page(size, cls, inner) { return '<section class="pp-page pp-' + size + (cls ? ' ' + cls : '') + '">' + inner + '</section>'; }
  function foot(ctx, extra) { return '<p class="pp-pf">' + esc(U().foot + '｜' + ctx.lesson + (extra ? '｜' + extra : '')) + '</p>'; }
  function head(o, ctx) {
    return '<header class="pp-h"><div class="pp-hk">' + ico(ctx.icon) + '<span>' + esc(ctx.lesson) + '</span></div><h1>' + esc(o.title) + '</h1>' +
      (o.en ? '<p class="pp-hen" lang="en">' + esc(o.en) + '</p>' : '') +
      (o.noName ? '' : '<p class="pp-name">' + esc(U().nameLine) + '</p>') +
      (o.lead ? '<p class="pp-lead">' + esc(o.lead) + '</p>' : '') + '</header>';
  }
  function lines(n) { var s = ''; for (var i = 0; i < n; i++) s += '<i class="pp-ln"></i>'; return '<div class="pp-lns">' + s + '</div>'; }
  function list(a) { return '<ul>' + a.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'; }
  function block(b) {
    var s = '<div class="pp-blk' + (b.cls ? ' ' + b.cls : '') + '">';
    if (b.h) s += '<h2>' + esc(b.h) + '</h2>';
    if (b.help) s += '<p class="pp-help">' + esc(b.help) + '</p>';
    if (b.p) s += '<p class="pp-p' + (b.big ? ' big' : '') + '">' + esc(b.p) + '</p>';
    if (b.list) s += list(b.list);
    if (b.chips) s += '<p class="pp-chips">' + b.chips.map(function (t) { return '<span>□ ' + esc(t) + '</span>'; }).join('') + '</p>';
    if (b.box) s += '<div class="pp-box"><b>' + esc(b.box.title) + '</b>' + list(b.box.items) + '</div>';
    if (b.table) {
      var t = b.table, rows = t.rows || (t.first || []).map(function (f) { return [].concat(f); });
      s += '<table class="pp-tb" style="--rh:' + (t.rh || '14mm') + '">' + (t.cols ? '<thead><tr>' + t.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead>' : '') +
        '<tbody>' + rows.map(function (r) {
          var cells = r.slice(); while (t.cols && cells.length < t.cols.length) cells.push('');
          return '<tr>' + cells.map(function (c, i) { return i < (t.headCols || 1) && c ? '<th>' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
    }
    if (b.svg) s += b.svg;
    if (b.lines) s += lines(b.lines);
    return s + '</div>';
  }

  /* 卡牌 */
  function cardHTML(c, ctx) {
    var s = '<div class="pp-cell"><div class="pp-card' + (c.big ? ' has-big' : '') + '">' +
      '<div class="pp-k">' + ico(ctx.icon) + '<span>' + esc(c.k) + '</span>' + (c.no ? '<b>' + esc(c.no) + '</b>' : '') + '</div>';
    if (c.seal) s += '<div class="pp-seal">' + ico(ctx.icon) + '</div>';
    if (c.t) s += '<div class="pp-t">' + esc(c.t) + '</div>';
    if (c.en) s += '<div class="pp-en" lang="en">' + esc(c.en) + '</div>';
    if (c.big) s += '<div class="pp-big">' + esc(c.big) + '</div>';
    if (c.b) s += '<p>' + esc(c.b) + '</p>';
    if (c.l) s += list(c.l);
    if (c.p2) s += '<p class="pp-p2">' + esc(c.p2) + '</p>';
    if (c.fl) s += c.fl.map(function (f) { return '<div class="pp-fl"><span>' + esc(f) + '</span><i></i>' + (c.lines ? '<i></i>' : '') + '</div>'; }).join('');
    else if (c.lines) s += lines(c.lines);
    return s + '<div class="pp-f">' + esc(U().foot + '｜' + ctx.short) + '</div></div></div>';
  }
  function cardPages(it, ctx) {
    var per = it.fmt === 'c4' ? 4 : 8, cards = it.group ? rep(it.cards, ctx.groups) : it.cards;
    return chunk(cards, per).map(function (pg) {
      return page('a4', 'pp-cards', '<div class="pp-grid pp-g' + per + '">' + pg.map(function (c) { return cardHTML(c, ctx); }).join('') + '</div><p class="pp-cutn">✂ ' + esc(U().cutNote) + '</p>');
    });
  }

  /* 貼紙／籌碼 */
  var SHAPE = {
    circle: { per: 24, svg: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="cut" cx="50" cy="50" r="48"/><circle class="ink" cx="50" cy="50" r="41"/></svg>' },
    seal: { per: 24, svg: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="cut" cx="50" cy="50" r="48"/><circle class="ink" cx="50" cy="50" r="41"/><circle class="ink2" cx="50" cy="50" r="35"/></svg>' },
    flame: { per: 12, svg: '<svg viewBox="0 0 100 120" aria-hidden="true"><path class="cut" d="M50 2C66 26 92 46 90 78C88 104 70 118 50 118C30 118 12 104 10 78C8 50 34 34 50 2Z"/><path class="ink" d="M50 12C63 33 83 50 81 77C79 98 66 109 50 109C34 109 21 98 19 77C17 54 38 40 50 12Z"/></svg>' },
    leaf: { per: 20, svg: '<svg viewBox="0 0 100 100" aria-hidden="true"><path class="cut" d="M6 94C4 42 42 6 94 6C96 58 60 96 6 94Z"/><path class="ink" d="M14 86C13 46 45 15 86 14C86 55 56 87 14 86Z"/><path class="vein" d="M16 84L70 30"/></svg>' },
    flag: { per: 12, svg: '<svg viewBox="0 0 100 120" aria-hidden="true"><rect class="cut" x="2" y="2" width="96" height="116" rx="3"/><path class="pole" d="M16 10V112"/><path class="ink" d="M17 12H86L76 34L86 56H17Z"/></svg>' }
  };
  function stkPages(it, ctx) {
    var sh = SHAPE[it.shape] || SHAPE.circle, total = it.total ? it.total(ctx) : sh.per, all = [];
    for (var i = 0; i < total; i++) all.push(it.labels[i % it.labels.length]);
    return chunk(all, sh.per).map(function (pg) {
      return page('a4', 'pp-stks', '<div class="pp-sg s-' + (it.shape || 'circle') + '">' + pg.map(function (l) {
        return '<div class="pp-stk">' + sh.svg + '<span class="pp-sl">' + esc(l) + '</span>' + (it.help ? '<small>' + esc(it.help) + '</small>' : '') + '</div>';
      }).join('') + '</div><p class="pp-cutn">✂ ' + esc(U().cutNote) + '</p>');
    });
  }

  /* 工作紙（A4）與產出卡（A5） */
  function sheetPages(it, ctx) {
    return (it.sheets || [it.sheet]).map(function (o) { return page(o.land ? 'a4l' : 'a4', 'pp-sheet', head(o, ctx) + o.blocks.map(block).join('') + foot(ctx)); });
  }
  function a5Pages(it, ctx) {
    var o = it.a5;
    var inner = head(o, ctx) + (o.fields || []).map(function (f) { return block({ h: f.label, help: f.help, lines: f.lines || 3, table: f.table }); }).join('') +
      (o.scaffolds && o.scaffolds.length ? block({ box: { title: U().scaffold, items: o.scaffolds } }) : '') +
      (o.after || []).map(block).join('') + foot(ctx);
    return [page('a5', 'pp-a5c' + (o.cls ? ' ' + o.cls : ''), inner)];
  }

  /* 海報（A3，SVG） */
  function T(x, y, s, txt, cls, anchor) { return '<text x="' + x + '" y="' + y + '" font-size="' + s + '"' + (cls ? ' class="' + cls + '"' : '') + ' text-anchor="' + (anchor || 'middle') + '">' + esc(txt) + '</text>'; }
  var RIDGE = '<path class="ridge" d="M0 420V372Q30 352 58 366T118 360T176 368T236 350T297 364V420Z"/><path class="ridge" d="M0 420V392Q40 378 84 388T170 384T246 390T297 384V420Z"/>';
  function posterFrame(o, ctx, body) {
    return '<svg class="pp-psvg" viewBox="0 0 297 420" role="img" aria-label="' + esc(o.title) + '">' + RIDGE +
      '<rect class="fr" x="8" y="8" width="281" height="404" rx="4"/><rect class="fr2" x="11.5" y="11.5" width="274" height="397" rx="3"/>' +
      T(148.5, 26, 5.5, ctx.lesson, 'kick') + T(148.5, 46, 20, o.title, 'ttl') + (o.sub ? T(148.5, 58, 6.5, o.sub, 'sub') : '') +
      body + (o.done ? T(148.5, 402, 6, '— ' + o.done + ' —', 'done') : '') + '</svg>';
  }
  var LAMP = 'M0 -9C4 -4 6 -1 5 3C4 6 2 7 0 7C-2 7 -4 6 -5 3C-6 -1 -4 -4 0 -9Z';
  function poster(kind, o, ctx) {
    var s = '', i, x, y;
    if (kind === 'wall') {
      var n = o.n || 32, cols = 6, rows = Math.ceil(n / cols), cw = 237 / cols, rh = Math.min(50, 300 / rows);
      for (i = 0; i < n; i++) {
        x = 30 + (i % cols) * cw; y = 74 + Math.floor(i / cols) * rh;
        s += '<path class="slot" d="M' + (x + 4) + ' ' + (y + rh - 6) + 'V' + (y + 14) + 'Q' + (x + 4) + ' ' + (y + 4) + ' ' + (x + cw / 2) + ' ' + (y + 4) + 'Q' + (x + cw - 4) + ' ' + (y + 4) + ' ' + (x + cw - 4) + ' ' + (y + 14) + 'V' + (y + rh - 6) + 'Z"/>' +
          '<path class="lampf" transform="translate(' + (x + cw / 2) + ' ' + (y + rh / 2 - 2) + ')" d="' + LAMP + '"/>' + T(x + cw / 2, y + rh - 9, 4, o.slot + ' ' + (i + 1), 'sm');
      }
    } else if (kind === 'mirror') {
      var cx = 148.5, cy = 228, r = 104, parts = o.parts || [];
      s += '<circle class="ring" cx="' + cx + '" cy="' + cy + '" r="' + (r + 9) + '"/><circle class="glass" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
      parts.forEach(function (p, k) {
        var a0 = (-90 + k * 120) * Math.PI / 180, a1 = (-90 + (k + 1) * 120) * Math.PI / 180, am = (a0 + a1) / 2;
        s += '<path class="slot" d="M' + cx + ' ' + cy + 'L' + (cx + r * Math.cos(a0)).toFixed(1) + ' ' + (cy + r * Math.sin(a0)).toFixed(1) + 'A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.cos(a1)).toFixed(1) + ' ' + (cy + r * Math.sin(a1)).toFixed(1) + 'Z"/>';
        x = cx + r * 0.56 * Math.cos(am); y = cy + r * 0.56 * Math.sin(am);
        s += T(x, y - 4, 6, p.no, 'sm') + T(x, y + 10, 15, p.name, 'big');
      });
    } else if (kind === 'bridge') {
      var g = ctx.groups, top = 92, bot = 372, gh = (bot - top) / g;
      s += '<path class="river" d="M70 120Q110 112 150 122T228 118M70 200Q110 192 150 202T228 198M70 280Q110 272 150 282T228 278M70 350Q110 342 150 352T228 348"/>';
      s += '<rect class="bank" x="20" y="' + (top - 16) + '" width="46" height="' + (bot - top + 26) + '" rx="3"/><rect class="bank" x="231" y="' + (top - 16) + '" width="46" height="' + (bot - top + 26) + '" rx="3"/>';
      s += T(43, top + 40, 16, o.left, 'big vert') + T(43, top + 120, 5, o.leftSub, 'sm') + T(254, top + 40, 16, o.right, 'big vert') + T(254, top + 120, 5, o.rightSub, 'sm');
      (o.planks || []).forEach(function (p, k) { s += T(92 + k * 47 + 20, top - 4, 5, p, 'sm'); });
      for (i = 0; i < g; i++) {
        y = top + i * gh;
        s += T(70, y + gh / 2 + 1.5, 4.2, ctx.groupNames[i], 'sm', 'start');
        for (var k = 0; k < 3; k++) s += '<rect class="slot" x="' + (92 + k * 47) + '" y="' + (y + 3) + '" width="42" height="' + (gh - 6) + '" rx="1.5"/>';
      }
    } else if (kind === 'furnace') {
      var gs = ctx.groups, cw2 = 225 / gs, per = o.per || 9, ch = 220 / per, base = 330;
      for (i = 0; i < gs; i++) {
        x = 40 + i * cw2;
        for (var c = 0; c < per; c++) s += '<rect class="slot' + (c % (o.perRound || 3) === (o.perRound || 3) - 1 ? ' strong' : '') + '" x="' + (x + 2) + '" y="' + (base - (c + 1) * ch) + '" width="' + (cw2 - 4) + '" height="' + (ch - 1.5) + '" rx="1"/>';
        s += T(x + cw2 / 2, base + 8, 4.2, ctx.groupNames[i], 'sm');
      }
      (o.rounds || []).forEach(function (rn, k) { s += T(30, base - (k * 3 + 1.5) * ch + 2, 4.5, rn, 'sm'); });
      s += '<path class="top" d="M36 ' + (base - per * ch - 4) + 'H268"/>';
      s += '<path class="pot" d="M40 ' + (base + 14) + 'H265L252 ' + (base + 40) + 'H53Z"/>';
      for (i = 0; i < 7; i++) s += '<path class="lampf" transform="translate(' + (64 + i * 29) + ' ' + (base + 52) + ') scale(1.4)" d="' + LAMP + '"/>';
    } else if (kind === 'tree') {
      s += '<path class="trunk" d="M138 330C140 290 136 250 128 214L148 226L170 210C160 250 158 290 160 330Z"/>';
      s += '<ellipse class="crown" cx="148.5" cy="150" rx="118" ry="82"/>';
      var roots = o.roots || [], rw = 237 / Math.max(1, roots.length);
      roots.forEach(function (rt, k) {
        x = 30 + k * rw + rw / 2;
        s += '<path class="root" d="M149 330C149 350 ' + x + ' 344 ' + x + ' 366"/>' + '<rect class="slot" x="' + (x - rw / 2 + 4) + '" y="366" width="' + (rw - 8) + '" height="22" rx="2"/>' + T(x, 376, 7, rt.name, 'big') + T(x, 384, 3.8, rt.lesson || '', 'sm');
      });
      for (i = 0; i < 24; i++) {
        var a = i / 24 * Math.PI * 2, rr = i % 2 ? 0.55 : 0.85;
        x = 148.5 + 118 * rr * Math.cos(a); y = 150 + 82 * rr * Math.sin(a);
        s += '<path class="slot" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (i * 37 % 360) + ')" d="M-9 7C-10 -3 -2 -10 9 -9C9 2 2 9 -9 7Z"/>';
      }
      if (o.top) s += T(148.5, 156, 9, o.top, 'big');
    } else if (kind === 'circles') {
      var names = o.names || [], cy2 = 232, r0 = 16, dr = (130 - r0) / Math.max(1, names.length - 1);
      for (i = names.length - 1; i >= 0; i--) {
        var rr2 = r0 + i * dr;
        s += '<circle class="' + (i ? 'ring2' : 'core') + '" cx="148.5" cy="' + cy2 + '" r="' + rr2.toFixed(1) + '"/>';
      }
      names.forEach(function (nm, k) { var rr3 = r0 + k * dr; s += T(148.5, (k ? cy2 - rr3 + 8 : cy2 + 2.5), k ? 6 : 8, nm, 'big'); });
    }
    return [page('a3', 'pp-poster', posterFrame(o, ctx, s))];
  }

  /* 承諾信封（A4 摺紙） */
  function envPages(it, ctx) {
    var E = U().envelope;
    var svg = '<svg class="pp-env" viewBox="0 0 190 277" role="img" aria-label="' + esc(E.title) + '">' +
      '<path class="cutl" d="M25 92L45 40H145L165 92H186V188H165L150 246H40L25 188H4V92Z"/>' +
      '<path class="fold" d="M25 92H165M25 188H165M25 92V188M165 92V188"/>' +
      '<rect class="face" x="27" y="94" width="136" height="92" rx="2"/>' +
      T(95, 64, 6, E.lock, 'sm2') + '<path class="lampf" transform="translate(95 76) scale(.9)" d="' + LAMP + '"/>' +
      T(95, 112, 12, E.title, 'ttl') + T(95, 120, 4.6, E.en, 'en') +
      T(38, 140, 4.6, E.who + '：', 'lab', 'start') + '<path class="ul" d="M76 141H152"/>' +
      T(38, 156, 4.6, E.witness + '：', 'lab', 'start') + '<path class="ul" d="M92 157H152"/>' +
      T(38, 172, 4.6, E.open + '：', 'lab', 'start') + '<path class="ul" d="M62 173H152"/>' +
      T(95, 262, 4.2, '✂ ' + E.how, 'sm2') + '</svg>';
    return [page('a4', 'pp-sheet pp-envp', svg + foot(ctx))];
  }
  /* 單元回顧盒標籤 */
  function lblPages(it, ctx) {
    var B = U().boxLabel, one = '<div class="pp-lbl"><div class="pp-lt">' + ico('box') + '<b>' + esc(B.title) + '</b></div><p class="pp-len" lang="en">' + esc(B.en) + '</p>' +
      '<div class="pp-fl"><span>' + esc(B.name) + '</span><i></i></div><div class="pp-fl"><span>' + esc(B.cls) + '</span><i></i></div><p class="pp-ln2">' + esc(B.note + '｜' + U().foot) + '</p></div>';
    return [page('a4', 'pp-labels', '<div class="pp-lg">' + rep([one], 10).join('') + '</div><p class="pp-cutn">✂ ' + esc(U().cutNote) + '</p>')];
  }
  /* 教師觀察表（A4 橫向，留空手寫） */
  function obsPages(it, ctx) {
    var C = ctx.C, ind = C.observation || [], u = U();
    var cell = '<span class="pp-ck">□需提示　□部分達到　□獨立達到</span>';
    var html = head({ title: u.obsTitle, lead: u.obsLead, noName: true }, ctx) +
      '<table class="pp-tb pp-obs"><thead><tr><th>' + esc(u.obsGroup) + '</th>' + ind.map(function (o) { return '<th>' + esc(o.indicator) + '<small>' + esc(o.standard) + '｜' + esc(o.scene) + '</small></th>'; }).join('') + '<th>' + esc(u.obsNote) + '</th></tr></thead><tbody>' +
      ctx.groupNames.map(function (g) { return '<tr><th>' + esc(g) + '</th>' + ind.map(function () { return '<td>' + cell + '</td>'; }).join('') + '<td></td></tr>'; }).join('') + '</tbody></table>' + foot(ctx);
    return [page('a4l', 'pp-sheet', html)];
  }

  function pagesOf(it, ctx) {
    switch (it.fmt) {
      case 'c8': case 'c4': return cardPages(it, ctx);
      case 'stk': return stkPages(it, ctx);
      case 'sheet': return sheetPages(it, ctx);
      case 'a5': return a5Pages(it, ctx);
      case 'a3': return poster(it.kind, it.o, ctx);
      case 'env': return envPages(it, ctx);
      case 'lbl': return lblPages(it, ctx);
      case 'obs': return obsPages(it, ctx);
    }
    return [];
  }

  /* ---------- 各節教材清單（按提示詞 #/lN/print 條目次序） ---------- */
  function cards(id, q, list, f) { return { id: id, name: q.name, qty: q.qty, fmt: f || 'c8', group: q.qty === 'perGroupSet', cards: list }; }
  function stk(id, q, labels, shape, o) { o = o || {}; return { id: id, name: q.name, fmt: 'stk', shape: shape, labels: labels, help: o.help, total: o.total, qtyText: o.qtyText }; }
  function sheet(id, q, s) { return { id: id, name: q.name, qty: q.qty, fmt: 'sheet', sheet: s.length ? null : s, sheets: s.length ? s : null }; }
  function a5(id, q, o) { return { id: id, name: q.name, qty: q.qty, fmt: 'a5', a5: o }; }
  function a3(id, q, kind, o) { return { id: id, name: q.name, qty: 'perClass', fmt: 'a3', kind: kind, o: o }; }
  function badges(q, C, extra) {
    var b = C.badges.map(function (x) { return { k: q.k, t: x.name, b: x.desc, seal: true }; });
    if (extra) b.push({ k: q.k, t: extra.name, b: extra.desc, seal: true });
    return { id: 'badges', name: q.name, qty: 'perClass', fmt: 'c8', cards: b };
  }
  function roleCards(q, C) { return C.roles.map(function (r) { return { k: q.k, t: r.name, b: r.duty }; }); }

  var B = {};
  B.l1 = function (C, P) {
    return [
      cards('order', P.order, [{ k: P.order.k, t: P.order.t, b: phaseText(C.scenes[0], 'announce'), l: C.scenes.slice(1).map(function (s) { return s.name; }) }], 'c4'),
      cards('roles', P.roles, roleCards(P.roles, C)),
      stk('tokens', P.tokens, [P.tokens.label], 'circle', { total: function (ctx) { return P.tokens.per * ctx.groups; }, qtyText: fmt(U().perGroup, { n: P.tokens.per }) }),
      a3('wall', P.wall, 'wall', { title: C.resource.goalName, sub: P.wall.sub, n: C.resource.classTarget, slot: P.wall.slot, done: C.resource.goalDone }),
      stk('flames', P.flames, [P.flames.label], 'flame', { help: P.flames.help }),
      cards('cases', P.cases, C.cases.map(function (c) { return { k: P.cases.k, no: c.id, b: c.text }; })),
      cards('threeQ', P.threeQ, [{ k: P.threeQ.k, t: P.threeQ.t, l: C.threeQ.map(function (q) { return q.text; }) }]),
      cards('events', P.events, C.events.map(function (e, i) { return { k: P.events.k, no: String(i + 1), b: e.text }; })),
      cards('reactions', P.reactions, C.reactions.map(function (r) { return { k: P.reactions.k, big: r.id, b: r.text }; })),
      cards('props', P.props, C.props.map(function (p) { return { k: P.props.k, t: p.name, b: p.meaning }; })),
      cards('nights', P.nights, C.nights.map(function (n, i) { return { k: P.nights.k, no: String(i + 1), t: n.name, b: n.situation, l: n.options.map(function (o) { return o.id + '　' + o.text; }) }; }), 'c4'),
      sheet('choice', P.choice, { title: P.choice.title, blocks: [{ table: { cols: P.choice.cols, first: C.nights.map(function (n) { return n.name; }), rh: '46mm' } }] }),
      cards('reveal', P.reveal, [{ k: P.reveal.k, t: P.reveal.t, b: C.revealCard, p2: C.revealAfter }], 'c4'),
      sheet('booklet', P.booklet, { title: P.booklet.title, lead: P.booklet.lead, blocks: [{ table: { cols: P.booklet.cols, first: C.scenes.slice(1).map(function (s) { return s.name; }), rh: '38mm' } }] }),
      a5('card', P.card, { title: C.card.title, en: C.card.en, fields: C.card.fields.map(function (f) { return { label: f.label, help: f.help, lines: 3 }; }), scaffolds: C.card.scaffolds, after: [{ h: C.card.witness, lines: 1 }] }),
      stk('sparks', P.sparks, [P.sparks.label], 'circle'),
      badges(P.badges, C)
    ];
  };
  B.l2 = function (C, P) {
    var steps = C.caseSteps.map(function (s) { return s.name; });
    return [
      cards('reactions', P.reactions, C.reactions.map(function (r) { return { k: P.reactions.k, big: r.id, b: r.text }; })),
      sheet('notes', P.notes, { title: P.notes.title, lead: C.firstAsk, blocks: [{ table: { cols: [''].concat(steps), first: C.cases.map(function (c) { return c.id + '　' + c.name; }), rh: '62mm' } }] }),
      cards('suspects', P.suspects, C.suspects.map(function (s, i) { return { k: P.suspects.k, no: String(i + 1), b: s.text }; })),
      cards('clues', P.clues, C.clues.map(function (s, i) { return { k: P.clues.k, no: String(i + 1), b: s.text }; })),
      cards('cases', P.cases, C.cases.map(function (c) { return { k: P.cases.k, no: c.id, t: c.name, b: c.text }; }), 'c4'),
      sheet('radar', P.radar, { title: P.radar.title, lead: P.radar.lead, blocks: [{ svg: radarSVG(C.radarZones) }, { p: C.radarNote }] }),
      stk('radarStk', P.radarStk, C.radarZones.map(function (z) { return z.name; }), 'circle'),
      cards('dust', P.dust, [].concat.apply([], C.cases.map(function (c) { return C.dust.map(function (d) { return { k: P.dust.k, no: c.id, t: d.name }; }); }))),
      cards('clean', P.clean, P.clean.cards.map(function (c) { return { k: c.k, t: c.t, l: c.b, lines: 1 }; })),
      stk('frags', P.frags, C.fragments.map(function (f) { return f.name; }), 'circle', { help: P.frags.label }),
      a3('mirror', P.mirror, 'mirror', { title: C.resource.goalName, sub: P.mirror.sub, parts: C.fragments, done: C.resource.goalDone }),
      cards('props', P.props, C.props.map(function (p) { return { k: p.name, t: p.name, b: p.meaning }; }).concat(roleCards(P.props, C))),
      a5('card', P.card, { title: C.card.title, en: C.card.en, fields: C.card.fields.map(function (f) { return { label: f.label, help: f.help, lines: 2 }; }), scaffolds: C.card.scaffolds, after: [{ h: C.card.partner, help: C.card.partnerPH, lines: 1 }] }),
      badges(P.badges, C)
    ];
  };
  function radarSVG(z) {
    var s = '<svg class="pp-radar" viewBox="0 0 190 170" aria-hidden="true">', cx = 95, cy = 85;
    [78, 56, 34].forEach(function (r) { s += '<circle class="rg" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>'; });
    s += '<path class="rg" d="M' + (cx - 82) + ' ' + cy + 'H' + (cx + 82) + 'M' + cx + ' ' + (cy - 82) + 'V' + (cy + 82) + '"/>';
    var pos = [[cx - 44, cy - 44], [cx + 44, cy - 44], [cx - 44, cy + 50], [cx + 44, cy + 50]];
    z.forEach(function (q, i) { var p = pos[i] || pos[0]; s += T(p[0], p[1], 9, q.name, 'big') + T(p[0], p[1] + 7, 4.2, q.note || '', 'sm'); });
    return s + '<circle class="dot" cx="' + cx + '" cy="' + cy + '" r="2.4"/></svg>';
  }
  B.l3 = function (C, P) {
    var N = C.quizNames;
    return [
      cards('vote', P.vote, C.vote.options.map(function (o) { return { k: P.vote.k, big: o.name }; })),
      cards('tf', P.tf, [{ k: P.tf.k, big: N.t }, { k: P.tf.k, big: N.f }]),
      cards('quiz', P.quiz, C.quiz.map(function (q, i) { return { k: P.quiz.k, no: String(i + 1), b: q.text }; })),
      stk('seal', P.seal, [P.seal.label], 'seal'),
      cards('scen', P.scen, C.scenarios.map(function (c) { return { k: P.scen.k, no: c.id, t: c.name, b: c.text }; }), 'c4'),
      cards('cracks', P.cracks, C.crackCards.map(function (c) { return { k: P.cracks.k, t: c.name, b: c.crack }; })),
      cards('planks', P.planks, C.planks.map(function (p) { return { k: P.planks.k, t: p.name, b: p.help, lines: 2 }; })),
      cards('stars', P.stars, ['★', '★★', '★★★'].map(function (s) { return { k: P.stars.k, big: s, l: C.stars.criteria }; })),
      a3('bridge', P.bridge, 'bridge', { title: C.resource.goalName, sub: P.bridge.sub, left: P.bridge.left, leftSub: P.bridge.leftSub, right: P.bridge.right, rightSub: P.bridge.rightSub, planks: C.planks.map(function (p) { return p.name; }), done: C.resource.goalDone }),
      a5('table', P.table, { title: C.table.title, en: C.table.en, fields: [{ label: C.table.gapHint, lines: 0, table: { cols: [C.table.left, C.table.right], rows: [['', ''], ['', ''], ['', '']], rh: '20mm', headCols: 0 } }], scaffolds: C.table.scaffolds }),
      { id: 'env', name: P.env.name, qty: P.env.qty, fmt: 'env' },
      badges(P.badges, C, P.badges.extra)
    ];
  };
  B.l4 = function (C, P) {
    var R = C.rounds;
    return [
      sheet('recv', P.recv, { title: P.recv.title, lead: P.recv.lead, noName: true, blocks: [{ table: { cols: [U().obsGroup].concat(C.unseal.results.map(function (r) { return r.name; })), first: XC.state.groups().map(function (g) { return g.name; }), rh: '13mm' } }] }),
      cards('compare', P.compare, C.compare.map(function (c) { return { k: P.compare.k, t: c.name, b: c.text, p2: C.compareQ }; }), 'c4'),
      cards('tasks', P.tasks, C.tasks.map(function (t) { return { k: P.tasks.k, no: t.id, t: t.name, b: t.text }; }).concat([{ k: C.budget.label, big: C.budget.start + ' ' + C.budget.unit }]), 'c4'),
      cards('roles', P.roles, roleCards(P.roles, C)),
      cards('events', P.events, R.map(function (r) { return { k: P.events.k, no: r.no, t: r.card, b: r.text }; }).concat(P.events.stance), 'c4'),
      sheet('sheet', P.sheet, { title: P.sheet.title, blocks: R.filter(function (r) { return r.sheet; }).map(function (r) { return { h: r.no + '｜' + r.card + '｜' + r.sheet.title, list: r.sheet.fields, lines: 3 }; }) }),
      sheet('obs', P.obs, { title: P.obs.title, lead: P.obs.lead, blocks: [{ table: { cols: P.obs.cols, headCols: 2, rows: [].concat.apply([], R.map(function (r) { return C.indicatorShort.map(function (s, i) { return [i ? '' : r.no, s, '']; }); })), rh: '19mm' } }] }),
      cards('redo', P.redo, [{ k: P.redo.k, t: C.redo.name, b: C.redo.text }]),
      a3('furnace', P.furnace, 'furnace', { title: C.resource.goalName, sub: P.furnace.sub, per: C.resource.perGroup, perRound: C.resource.perRound, rounds: R.map(function (r) { return r.no; }), done: C.resource.goalDone }),
      stk('steel', P.steel, [P.steel.label], 'circle'),
      a5('journal', P.journal, { title: C.journal.title, en: C.journal.en, fields: C.journal.fields.map(function (f) { return { label: f.label, help: f.ph, lines: 2 }; }), scaffolds: C.journal.scaffolds }),
      cards('praise', P.praise, [{ k: P.praise.k, t: C.praise.title, en: C.praise.en, fl: [C.praise.to, C.praise.saw, C.praise.felt], p2: C.praise.rule }], 'c4'),
      badges(P.badges, C)
    ];
  };
  B.l5 = function (C, P) {
    var D = P.docs;
    return [
      cards('source', P.source, [{ k: P.source.k, t: C.source.title, en: C.source.en, b: C.source.text }], 'c4'),
      a3('tree', P.tree, 'tree', { title: C.resource.goalName, sub: P.tree.sub, roots: C.tree.roots, top: C.treeTitle && C.treeTitle.zh, done: C.resource.goalDone }),
      cards('roots', P.roots, C.tree.roots.map(function (r) { return { k: P.roots.k, t: r.name, b: r.lesson }; })),
      stk('leaves', P.leaves, [P.leaves.label], 'leaf'),
      sheet('docs', D, C.docs.map(function (d) {
        return { title: d.no + '｜' + d.name, lead: D.lead, noName: true, blocks: [{ p: d.text, big: true }, { h: D.keyLabel, list: d.key }, { h: D.natLabel, p: d.nature }, { h: D.srcLabel, p: d.src },
          { h: D.glossLabel, list: C.glossary.map(function (g) { return g.w + '：' + g.d; }) }] };
      })),
      cards('decode', P.decode, [{ k: P.decode.k, t: C.decode.title, en: C.decode.en, fl: [C.decode.label], lines: 3 }], 'c4'),
      cards('pairs', P.pairs, C.pairs.map(function (p) { return { k: P.pairs.k, no: p.no, l: [P.pairs.oldL + '：' + p.old, P.pairs.nowL + '：' + p.now] }; })),
      cards('pdata', { name: P.pairs.dataK, qty: P.pairs.qty }, C.pairs.map(function (p) { return { k: P.pairs.dataK, no: p.no, t: p.old + '／' + p.now, b: p.data }; }), 'c4'),
      cards('threeQ', P.threeQ, [{ k: P.threeQ.k, t: P.threeQ.t, l: C.threeQ }]),
      sheet('report', P.report, { title: C.report.title, en: C.report.en, blocks: C.report.fields.map(function (f) { return { h: f.label + '（' + C.threeQ[f.q] + '）', help: f.ph, lines: 3 }; }).concat([{ h: C.report.starsLabel, chips: ['★', '★★', '★★★'] }, { h: C.report.opinion.label, help: C.report.opinion.ph, lines: 2 }, { box: { title: U().scaffold, items: [C.report.scaffold] } }]) }),
      stk('station', P.station, C.station.stickers.map(function (s) { return s.name; }), 'circle'),
      cards('doubt', P.doubt, [{ k: P.doubt.k, t: C.doubt.title, en: C.doubt.en, fl: [C.doubt.label], lines: 3 }], 'c4'),
      cards('stance', { name: P.doubt.stanceK, qty: 'perStudent' }, C.stances.map(function (s) { return { k: P.doubt.stanceK, big: s.name }; })),
      badges(P.badges, C)
    ];
  };
  B.l6 = function (C, P) {
    var S = C.sheet, pr = C.promise;
    return [
      cards('source', P.source, [{ k: P.source.k, t: C.source.title, en: C.source.en, b: C.source.text, l: C.source.kinds }], 'c4'),
      a3('circles', P.circles, 'circles', { title: C.resource.goalName, sub: P.circles.sub, names: C.circles.map(function (c) { return c.name; }), done: C.resource.goalDone }),
      stk('flags', P.flags, [P.flags.label], 'flag', { help: P.flags.help }),
      cards('ladder', P.ladder, C.ladder.map(function (l, i) { return { k: P.ladder.k, no: String(i + 1), t: l.name }; }).concat(C.levels.map(function (l) { return { k: P.ladder.levelK, big: l.name, b: C.levelsNote }; }))),
      cards('puzzle', P.puzzle, C.puzzle.map(function (p) { return { k: P.puzzle.k, no: p.era, t: p.who, l: [P.puzzle.ideaL + '：' + p.idea, P.puzzle.rangeL + '：' + p.range] }; })),
      cards('pdata', { name: P.puzzle.dataK, qty: P.puzzle.qty }, C.teach.map(function (t) { return { k: P.puzzle.dataK, t: t.k, b: t.t }; }), 'c4'),
      cards('cases', P.cases, C.cases.map(function (c) { return { k: P.cases.k, no: c.id, t: c.name, b: c.text }; }), 'c4'),
      cards('gaps', P.gaps, C.gaps.map(function (g) { return { k: P.gaps.k, t: g.name, lines: 2 }; })),
      sheet('sheet', P.sheet, { title: S.title, en: S.en, blocks: [{ h: S.q1, chips: C.circles.map(function (c) { return c.name; }) },
        { h: S.q2, table: { cols: ['', S.can, S.with], rows: [['1', '', ''], ['2', '', ''], ['3', '', '']], rh: '24mm' } },
        { h: S.q3, help: S.fog, lines: 4 }, { p: S.score }] }),
      a5('promise', P.promise, { cls: 'tight', title: pr.title, en: pr.en, fields: pr.fields.map(function (f) { return { label: f.label, help: f.help, lines: 2 }; }), scaffolds: pr.scaffolds, after: [{ h: P.promise.stepsL, help: String(C.stepsNote || '').split('。')[0] + '。', p: C.steps.map(function (s, i) { return (i + 1) + ' ' + s; }).join(' → ') }] }),
      cards('three', P.three, [{ k: P.three.k, t: P.three.t, l: pr.three }]),
      { id: 'env', name: P.env.name, qty: P.env.qty, fmt: 'env' },
      { id: 'box', name: P.box.name, qty: P.box.qty, fmt: 'lbl' },
      badges(P.badges, C)
    ];
  };

  /* ---------- 畫面 ---------- */
  PR.items = function (lid) {
    var C = XC.content[lid], P = Q()[lid];
    var list = B[lid](C, P);
    list.push({ id: 'obs', name: U().obsTitle, qty: 'perClass', fmt: 'obs' });
    return list;
  };
  PR.ctx = function (lid, groups) {
    var C = XC.content[lid], names = [];
    for (var i = 0; i < groups; i++) names.push(St.settings.groupNames[i] || ('第' + (i + 1) + '組'));
    return { C: C, icon: C.icon, groups: groups, groupNames: names,
      lesson: fmt(U().lessonFoot, { n: C.no, game: C.game }), short: fmt(U().lessonFoot, { n: C.no, game: C.game }) };
  };
  PR.pages = function (lid, groups, ids) {
    var ctx = PR.ctx(lid, groups), out = [];
    PR.items(lid).forEach(function (it) { if (!ids || ids.indexOf(it.id) >= 0) out = out.concat(pagesOf(it, ctx)); });
    return out;
  };
  PR.render = function (w, lid) {
    var u = U(), C = XC.content[lid], items = PR.items(lid), sel = {};
    var groups = St.settings.groupCount || 8;
    items.forEach(function (it) { sel[it.id] = true; });
    var gSel = h('select.inp.pr-gsel', { 'aria-label': u.groups, on: { change: function () { groups = parseInt(gSel.value, 10) || 8; draw(); } } });
    for (var g = 2; g <= 12; g++) gSel.appendChild(h('option', { value: String(g), selected: g === groups ? true : null }, String(g)));
    function doPrint(ids) {
      if (!ids.length) { ui.toast(u.empty); return; }
      XC.export.printHTML(PR.pages(lid, groups, ids).join(''), 'mat');
    }
    var head = h('section.card.pr-head', null,
      h('p', null, u.intro), h('ul.pr-tips', null, u.tips.map(function (t) { return h('li', null, t); })),
      h('div.pr-bar', null,
        h('label.pr-g', null, h('span', null, u.groups), gSel),
        ui.btn(u.selAll, { cls: 'sm', onClick: function () { items.forEach(function (it) { sel[it.id] = true; }); draw(); } }),
        ui.btn(u.selNone, { cls: 'sm', onClick: function () { items.forEach(function (it) { sel[it.id] = false; }); draw(); } }),
        ui.btn(u.printSel, { primary: true, icon: 'print', onClick: function () { doPrint(items.filter(function (it) { return sel[it.id]; }).map(function (it) { return it.id; })); } }),
        ui.btn(u.back, { cls: 'sm', icon: 'prev', onClick: function () { location.hash = '#/' + lid; } })));
    var listEl = h('div.pr-list');
    w.appendChild(head); w.appendChild(listEl);
    function qtyText(it) {
      if (it.qtyText) return it.qtyText;
      var k = it.qty || 'perClass'; return u[k] || '';
    }
    function draw() {
      listEl.innerHTML = '';
      var ctx = PR.ctx(lid, groups);
      items.forEach(function (it, i) {
        var pgs = pagesOf(it, ctx);
        var cb = h('input', { type: 'checkbox', checked: sel[it.id] ? true : null, 'aria-label': it.name, on: { change: function () { sel[it.id] = cb.checked; } } });
        var prev = h('div.pr-prev');
        pgs.slice(0, 2).forEach(function (p) { var t = h('div.pr-thumb', { html: p, 'aria-hidden': 'true' }); prev.appendChild(t); });
        listEl.appendChild(h('article.pr-item', null,
          h('div.pr-top', null, h('label.pr-cb', null, cb, h('b', null, (i + 1) + '．' + it.name)),
            h('span.chip.static', null, u.fmt[it.fmt] || ''), h('span.chip.static', null, qtyText(it)),
            h('span.pr-n', null, fmt(u.pageOf, { n: pgs.length })),
            ui.btn(u.printOne, { cls: 'sm', icon: 'print', onClick: function () { doPrint([it.id]); } })),
          prev));
      });
    }
    draw();
  };
})();
