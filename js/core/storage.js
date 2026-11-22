/* 本機儲存：localStorage（鍵名前綴 xc_v1_）；不可用時改用記憶體 */
(function () {
  var XC = window.XC = window.XC || {};
  var P = 'xc_' + ((XC.config && XC.config.version) || 'v1') + '_';
  var ok = false, mem = {};
  try { var k = P + '__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); ok = true; } catch (e) { ok = false; }
  var S = XC.storage = {
    available: ok,
    prefix: P,
    get: function (key, def) {
      try {
        var v = ok ? localStorage.getItem(P + key) : mem[key];
        return v == null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set: function (key, val) {
      var s = JSON.stringify(val);
      if (ok) { try { localStorage.setItem(P + key, s); return; } catch (e) { /* 空間不足 */ } }
      mem[key] = s;
    },
    remove: function (key) { if (ok) { try { localStorage.removeItem(P + key); } catch (e) {} } delete mem[key]; },
    keys: function () {
      var out = Object.keys(mem);
      if (ok) for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(P) === 0 && out.indexOf(k.slice(P.length)) < 0) out.push(k.slice(P.length));
      }
      return out;
    },
    dump: function (filter) { var o = {}; S.keys().forEach(function (k) { if (!filter || filter(k)) o[k] = S.get(k); }); return o; },
    load: function (obj) { Object.keys(obj || {}).forEach(function (k) { S.set(k, obj[k]); }); },
    clear: function (filter) { S.keys().forEach(function (k) { if (!filter || filter(k)) S.remove(k); }); }
  };
})();
