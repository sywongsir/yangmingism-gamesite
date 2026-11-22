/* 繁簡切換：一鍵把全站顯示文字轉為簡體。
   只改畫面顯示（文字節點、placeholder、aria-label、title、alt、canvas 文字、彈窗訊息），
   不改 localStorage，也不改學生在輸入框內打的字。設定存於 XC.storage 'script'（'hant'／'hans'）。 */
(function () {
  var XC = window.XC = window.XC || {};
  var D = XC.hansDict || { c: '', p: {} };
  var M = {}, P = D.p || {}, arr = Array.from(D.c), i;
  for (i = 0; i + 1 < arr.length; i += 2) M[arr[i]] = arr[i + 1];
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var keys = Object.keys(P).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp((keys.length ? keys.map(esc).join('|') + '|' : '') + '[\\u3400-\\u9fff\\uf900-\\ufaff]|[\\ud840-\\ud87f][\\udc00-\\udfff]', 'g');
  var HAN = /[\u3400-\u9fff\uf900-\ufaff\ud840-\ud87f]/;
  function conv(s) {
    if (typeof s !== 'string' || !HAN.test(s)) return s;
    return s.replace(RE, function (m) { return P[m] || M[m] || m; });
  }

  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'aria-roledescription', 'aria-valuetext'];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, svg: 0 };
  var tOrig = new WeakMap(), tSet = new WeakMap(), aMap = new WeakMap();
  var on = false, mo = null;

  function skipEl(el) {
    return SKIP[el.nodeName] === 1 || el.isContentEditable || (el.hasAttribute && el.hasAttribute('data-nohans'));
  }
  function inSkip(n) {
    for (var p = n.parentNode; p && p.nodeType === 1; p = p.parentNode) if (skipEl(p)) return true;
    return false;
  }
  function doText(n) {
    var v = n.nodeValue;
    if (tSet.get(n) === v) return;
    var c = conv(v);
    tOrig.set(n, v); tSet.set(n, c);
    if (c !== v) n.nodeValue = c;
  }
  function doAttr(el, name) {
    if (!el.hasAttribute(name)) return;
    var v = el.getAttribute(name), m = aMap.get(el);
    if (m && m[name] && m[name][1] === v) return;
    var c = conv(v);
    if (!m) { m = {}; aMap.set(el, m); }
    m[name] = [v, c];
    if (c !== v) el.setAttribute(name, c);
  }
  function walk(root, fn) {
    if (root.nodeType === 3) { fn(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    /* 輸入框：只轉 placeholder 等屬性，不碰內文（學生文字） */
    if (root.nodeType === 1 && skipEl(root)) { if (root.nodeName === 'TEXTAREA' && !root.hasAttribute('data-nohans')) fn(root); return; }
    if (root.nodeType === 1) fn(root);
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeType === 1 && skipEl(n)) { if (n.nodeName === 'TEXTAREA' && !n.hasAttribute('data-nohans')) fn(n); return NodeFilter.FILTER_REJECT; }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = tw.nextNode())) fn(n);
  }
  function apply(n) {
    if (n.nodeType === 3) doText(n);
    else for (var k = 0; k < ATTRS.length; k++) doAttr(n, ATTRS[k]);
  }
  function restore(n) {
    if (n.nodeType === 3) {
      if (tSet.has(n) && tSet.get(n) === n.nodeValue && tOrig.get(n) !== n.nodeValue) n.nodeValue = tOrig.get(n);
      tSet.delete(n); tOrig.delete(n);
    } else {
      var m = aMap.get(n); if (!m) return;
      Object.keys(m).forEach(function (a) { if (n.getAttribute(a) === m[a][1]) n.setAttribute(a, m[a][0]); });
      aMap.delete(n);
    }
  }
  function onMut(list) {
    if (!on) return;
    for (var k = 0; k < list.length; k++) {
      var r = list[k];
      if (r.type === 'childList') {
        for (var j = 0; j < r.addedNodes.length; j++) {
          var a = r.addedNodes[j];
          if (a.nodeType === 3 ? !inSkip(a) : (a.nodeType === 1 && !inSkip(a))) walk(a, apply);
        }
      } else if (r.type === 'characterData') { if (!inSkip(r.target)) doText(r.target); }
      else if (r.type === 'attributes') { if (!inSkip(r.target)) doAttr(r.target, r.attributeName); }
    }
  }
  function setLang() {
    var de = document.documentElement;
    de.setAttribute('lang', on ? 'zh-Hans' : 'zh-HK');
    de.classList.toggle('hans', on);
    if (on && !document.getElementById('font-sc')) {
      /* 簡體後備字型：只在切換簡體後才載入；斷網時用系統字型 */
      var l = document.createElement('link'); l.id = 'font-sc'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400&display=swap';
      document.head.appendChild(l);
    }
  }
  function enable() {
    on = true; setLang();
    walk(document.documentElement, apply);
    if (!mo) {
      mo = new MutationObserver(onMut);
      mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }
  }
  function disable() {
    on = false; setLang();
    if (mo) { mo.disconnect(); mo = null; }
    walk(document.documentElement, restore);
  }

  /* canvas 文字（PNG 匯出、計分圖等） */
  try {
    var CP = CanvasRenderingContext2D.prototype;
    ['fillText', 'strokeText', 'measureText'].forEach(function (fn) {
      var o = CP[fn]; if (!o) return;
      CP[fn] = function (t) { if (on && typeof t === 'string') { var a = Array.prototype.slice.call(arguments); a[0] = conv(t); return o.apply(this, a); } return o.apply(this, arguments); };
    });
  } catch (e) {}
  /* 瀏覽器原生彈窗 */
  ['alert', 'confirm', 'prompt'].forEach(function (fn) {
    var o = window[fn]; if (!o) return;
    window[fn] = function (msg) { var a = Array.prototype.slice.call(arguments); if (on) a[0] = conv(String(msg == null ? '' : msg)); return o.apply(window, a); };
  });

  var H = XC.hans = {
    conv: conv,
    isOn: function () { return on; },
    /* 只轉顯示；學生文字插入輸入框時用（例如點選句式支架） */
    input: function (s) { return on ? conv(s) : s; },
    set: function (v) {
      v = !!v; if (v === on) return;
      try { XC.storage && XC.storage.set('script', v ? 'hans' : 'hant'); } catch (e) {}
      if (v) enable(); else disable();
      document.dispatchEvent(new CustomEvent('xc:script', { detail: { hans: v } }));
    },
    toggle: function () { H.set(!on); }
  };
  var saved = 'hant';
  try { saved = (XC.storage && XC.storage.get('script', 'hant')) || 'hant'; } catch (e) {}
  if (saved === 'hans') enable();
})();
