/* hash 路由（GitHub Pages、Netlify 均不需設定）
   #/ 主頁｜#/prologue 序章｜#/overview 單元總覽｜#/box 我的回顧盒｜#/teacher 教師控制台｜#/about 來源與說明｜#/finale 終章
   #/l1–#/l6 各節｜#/l1/s2 直達某環節｜#/l1/print 列印教材｜#/l6/open 承諾開封跟進 */
(function () {
  var XC = window.XC;
  XC.router = {
    parse: function () {
      var raw = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
      var parts = raw.split('/').filter(Boolean);
      return { name: parts[0] || '', sub: parts[1] || '', parts: parts, raw: raw };
    },
    go: function (path) { location.hash = '#/' + (path || ''); },
    start: function () {
      window.addEventListener('hashchange', function () { XC.app.route(XC.router.parse()); });
      XC.app.route(XC.router.parse());
    }
  };
})();
