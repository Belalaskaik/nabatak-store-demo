/*
 * Nabatak Smart Product Finder (ما نباتك؟): one script for three hosts.
 *   1. On nabatak.sa (GTM Custom HTML tag or a landing-page theme section): reads live products
 *      and stock with window.zid.products.list() and adds to the real cart with zid.cart.addProduct().
 *   2. Locally (report/local preview): pass {catalogue: [...]} and cart actions are simulated.
 * Rules here are a DEMO. Real recommendations need the agronomist-approved planting calendar (finder/data/).
 */
(function () {
  'use strict';

  var CROPS = [
    ['tomato', 'طماطم', /طماطم/],
    ['cucumber', 'خيار', /خيار/],
    ['pepper', 'فلفل', /فلفل/],
    ['eggplant', 'باذنجان', /باذنجان/],
    ['squash', 'كوسا وقرع', /كوس|قرع/],
    ['okra', 'باميا', /باميا/],
    ['melon', 'شمام وبطيخ', /شمام|حبحب|بطيخ/],
    ['cabbage', 'ملفوف وقرنبيط', /ملفوف|قرنبيط|بروكلي/],
    ['leafy', 'خس وجرجير', /خس|جرجير|ملوخية/],
    ['roots', 'جزر ولفت وفجل', /جزر|لفت|فجل|بنجر/],
    ['onion', 'بصل', /بصل/],
    ['beans', 'لوبيا وفاصوليا', /لوبيا|فاصوليا|بازلاء/],
    ['herbs', 'أعشاب (كزبرة، شبت)', /كزبرة|شبت|بقدونس|ريحان/],
    ['flowers', 'زهور', null]
  ];
  var SETTINGS = [
    ['home', 'منزلية', 'بلكونة أو داخل البيت'],
    ['garden', 'حديقة', 'حوض أو فناء'],
    ['farm', 'مزرعة', 'مساحات مفتوحة'],
    ['nursery', 'مشتل', 'إنتاج شتلات']
  ];
  var PACKS = {
    home: ['بذور خضار بكيت', 'بذور خضار 100 جرام و50 جرام'],
    garden: ['بذور خضار 100 جرام و50 جرام', 'بذور خضار بكيت'],
    farm: ['بذورخضار 400 جرام و 1 كيلو', 'بذور خضار هجين'],
    nursery: ['بذور خضار هجين', 'بذورخضار 400 جرام و 1 كيلو']
  };
  var LEVELS = [['beginner', 'مبتدئ'], ['mid', 'لدي بعض الخبرة'], ['expert', 'خبير']];
  var BEGINNER_PICKS = ['beans', 'squash', 'cucumber', 'herbs'];

  var CSS = '.nbf{direction:rtl;font-family:inherit;color:#14231A;max-width:760px;margin:0 auto;padding:16px}' +
    '.nbf h2{font-size:1.6rem;margin:0 0 4px}.nbf .nbf-sub{color:#4D5C52;margin:0 0 16px}' +
    '.nbf-bar{height:6px;background:#F1F4EE;margin:12px 0}.nbf-bar i{display:block;height:6px;background:#2F6B3D;transition:width .3s}' +
    '.nbf-q{font-weight:600;font-size:1.15rem;margin:8px 0 12px}' +
    '.nbf-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}' +
    '.nbf-opt{background:#F1F4EE;border:0;padding:12px 14px;text-align:start;font:inherit;cursor:pointer;min-height:52px}' +
    '.nbf-opt small{display:block;color:#4D5C52;font-size:.8rem}.nbf-opt.on{background:#14231A;color:#fff}.nbf-opt.on small{color:#dfe7e1}' +
    '.nbf-nav{display:flex;gap:8px;margin-top:16px}.nbf-btn{border:0;padding:12px 20px;font:inherit;font-weight:600;cursor:pointer;background:#2F6B3D;color:#fff}' +
    '.nbf-btn.ghost{background:#F1F4EE;color:#14231A}.nbf-btn[disabled]{opacity:.4;cursor:not-allowed}' +
    '.nbf-grp{color:#4D5C52;margin:16px 0 6px;font-weight:500}.nbf-list{list-style:none;margin:0;padding:0}' +
    '.nbf-list li{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #EEF1EC}' +
    '.nbf-list img{width:52px;height:52px;object-fit:cover;flex:none;background:#F2F2EE}.nbf-list a{color:inherit;text-decoration:none;flex:1}' +
    '.nbf-list .why{display:block;color:#4D5C52;font-size:.8rem}.nbf-list .p{white-space:nowrap;font-variant-numeric:tabular-nums}' +
    '.nbf-total{display:flex;justify-content:space-between;font-weight:700;margin:14px 0}' +
    '.nbf-tip{background:#EFE6D4;padding:10px 14px;margin:10px 0;font-size:.9rem}.nbf-note{color:#4D5C52;font-size:.8rem;margin-top:12px}';

  function sar(v) { return Number(v).toFixed(2) + ' ر.س'; }
  function nameOf(p) { return (p.name && p.name.ar) || p.name || ''; }
  function catsOf(p) { return (p.categories || []).map(function (c) { return (c.name && c.name.ar) || c.name || c; }); }
  function imgOf(p) {
    if (p.img) return p.img;
    var im = p.images && p.images[0] && p.images[0].image;
    return im ? (im.medium || im.small || im.full_size || '') : '';
  }
  function urlOf(p) { return window.NB_CART ? 'product.html?id=' + encodeURIComponent(p.id) : (p.url || ('/products/' + p.slug)); }

  function loadCatalogue(opts) {
    if (opts.catalogue) return Promise.resolve(opts.catalogue);
    if (!window.zid || !zid.products) return Promise.reject(new Error('no catalogue'));
    var all = [];
    function page(n) {
      return zid.products.list({ page: n, page_size: 24 }).then(function (r) {
        all = all.concat(r.results || []);
        return r.next && n < 12 ? page(n + 1) : all;
      });
    }
    return page(1);
  }

  function recommend(cat, a) {
    var inStock = cat.filter(function (p) { return p.in_stock !== false; });
    var packs = PACKS[a.setting] || PACKS.home;
    var crops = a.crops.indexOf('suggest') >= 0 ? (a.level === 'beginner' ? BEGINNER_PICKS : ['tomato', 'cucumber', 'pepper']) : a.crops;
    var core = [];
    crops.forEach(function (key) {
      var def = CROPS.filter(function (c) { return c[0] === key; })[0];
      if (!def) return;
      var pool = inStock.filter(function (p) {
        var cs = catsOf(p);
        if (key === 'flowers') return cs.indexOf('بذور زهور') >= 0;
        return def[2].test(nameOf(p)) && cs.some(function (c) { return /بذور خضار|بذورخضار/.test(c); });
      });
      pool.sort(function (x, y) {
        var rx = Math.min.apply(null, catsOf(x).map(function (c) { var i = packs.indexOf(c); return i < 0 ? 9 : i; }));
        var ry = Math.min.apply(null, catsOf(y).map(function (c) { var i = packs.indexOf(c); return i < 0 ? 9 : i; }));
        return rx - ry;
      });
      pool.slice(0, key === 'flowers' ? 3 : 1).forEach(function (p) {
        if (core.indexOf(p) < 0) core.push({ p: p, why: def[1] });
      });
    });
    var tools = inStock.filter(function (p) { return catsOf(p).indexOf('معدات') >= 0; });
    function tool(re, why) { var t = tools.filter(function (p) { return re.test(nameOf(p)); })[0]; return t ? { p: t, why: why } : null; }
    var extra = [];
    if (a.setting === 'home' || a.setting === 'garden') extra.push(tool(/مقص تقليم صغير/, 'لتقليم الأغصان الطرية وقطف الثمار'));
    if (a.setting === 'garden' || a.setting === 'farm') extra.push(tool(/مقص تقليم كبير/, 'للأغصان السميكة'));
    if (a.setting === 'garden') extra.push(tool(/الأسيجة/, 'لتهذيب الأسيجة حول الأحواض'));
    if (crops.indexOf('onion') >= 0) extra.push(tool(a.setting === 'farm' || a.setting === 'nursery' ? /10 كيلو/ : /5 كيلو/, 'لتخزين محصول البصل'));
    extra = extra.filter(Boolean);
    var box = (core.length >= 3 && (a.setting === 'home' || a.setting === 'garden')) ?
      inStock.filter(function (p) { return /كون بوكسك/.test(nameOf(p)); })[0] : null;
    return { core: core, extra: extra, box: box };
  }

  function mount(el, opts) {
    opts = opts || {};
    if (!document.getElementById('nbf-css')) {
      var st = document.createElement('style'); st.id = 'nbf-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    var a = { setting: null, crops: [], level: null }, step = 0, cat = null;
    el.className = (el.className + ' nbf').trim();
    el.innerHTML = '<p class="nbf-sub">جارٍ تحميل منتجات المتجر…</p>';
    loadCatalogue(opts).then(function (c) { cat = c; render(); })
      .catch(function () { el.innerHTML = '<p class="nbf-sub">تعذّر تحميل المنتجات.</p>'; });

    function opt(val, label, sub, on) {
      return '<button type="button" class="nbf-opt' + (on ? ' on' : '') + '" data-v="' + val + '">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
    }
    function render() {
      var h = '<h2>ما نباتك؟</h2><p class="nbf-sub">ثلاثة أسئلة، ونجمع لك من منتجات المتجر المتوفرة ما يناسب زراعتك.</p>';
      h += '<div class="nbf-bar"><i style="width:' + (step * 33.4) + '%"></i></div>';
      if (step === 0) {
        h += '<p class="nbf-q">ما نوع الزراعة؟</p><div class="nbf-opts">' +
          SETTINGS.map(function (s) { return opt(s[0], s[1], s[2], a.setting === s[0]); }).join('') + '</div>';
      } else if (step === 1) {
        h += '<p class="nbf-q">ماذا ترغب في زراعته؟ (اختر أكثر من واحد)</p><div class="nbf-opts">' +
          CROPS.map(function (c) { return opt(c[0], c[1], '', a.crops.indexOf(c[0]) >= 0); }).join('') +
          opt('suggest', 'لا أعرف، اقترح لي', '', a.crops.indexOf('suggest') >= 0) + '</div>';
      } else if (step === 2) {
        h += '<p class="nbf-q">ما مستوى خبرتك؟</p><div class="nbf-opts">' +
          LEVELS.map(function (l) { return opt(l[0], l[1], '', a.level === l[0]); }).join('') + '</div>';
      } else {
        h += result();
      }
      if (step < 3) {
        var ok = step === 0 ? !!a.setting : step === 1 ? a.crops.length > 0 : true;
        h += '<div class="nbf-nav">' + (step ? '<button type="button" class="nbf-btn ghost" data-nav="-1">السابق</button>' : '') +
          '<button type="button" class="nbf-btn" data-nav="1"' + (ok ? '' : ' disabled') + '>' + (step === 2 ? 'اعرض بوكسك' : 'التالي') + '</button></div>';
      }
      el.innerHTML = h;
    }
    function row(x) {
      var p = x.p;
      return '<li><img src="' + imgOf(p) + '" alt="" loading="lazy"><a href="' + urlOf(p) + '">' + nameOf(p) +
        (x.why ? '<span class="why">' + x.why + '</span>' : '') + '</a><span class="p">' + sar(p.sale_price || p.price) + '</span></li>';
    }
    function result() {
      var r = recommend(cat, a), ids = r.core.concat(r.extra);
      var total = ids.reduce(function (s, x) { return s + Number(x.p.sale_price || x.p.price); }, 0);
      var h = '<p class="nbf-q">بوكسك</p>';
      h += r.core.length ? '<p class="nbf-grp">البذور</p><ul class="nbf-list">' + r.core.map(row).join('') + '</ul>'
        : '<p>لم نجد بذورًا متوفرة لهذا الاختيار حاليًا.</p>';
      if (r.extra.length) h += '<p class="nbf-grp">تحتاجه معها</p><ul class="nbf-list">' + r.extra.map(row).join('') + '</ul>';
      if (a.setting === 'farm' || a.setting === 'nursery') h += '<p class="nbf-tip">للمزارع والمشاتل: اخترنا لك عبوات 400 جرام وكيلو والبذور الهجينة.</p>';
      if (r.box) h += '<p class="nbf-tip">وفّر: اجمع بذورك في «<a href="' + urlOf(r.box) + '">' + nameOf(r.box) + '</a>».</p>';
      if (ids.length) h += '<div class="nbf-total"><span>المجموع</span><span>' + sar(total) + '</span></div>' +
        '<button type="button" class="nbf-btn" data-add="1">أضف الكل للسلة</button>';
      h += '<div class="nbf-nav"><button type="button" class="nbf-btn ghost" data-nav="-1">عدّل إجاباتك</button></div>';
      h += '<p class="nbf-note">نموذج أولي: الترشيحات للعرض فقط، والترشيحات الفعلية تُبنى على تقويم زراعي يعتمده مهندس زراعي.</p>';
      el._ids = ids;
      return h;
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !el.contains(b)) return;
      if (b.dataset.nav) { step = Math.max(0, Math.min(3, step + Number(b.dataset.nav))); render(); return; }
      if (b.dataset.add) { addAll(b); return; }
      var v = b.dataset.v; if (!v) return;
      if (step === 0) a.setting = v;
      else if (step === 1) {
        if (v === 'suggest') a.crops = a.crops.indexOf('suggest') >= 0 ? [] : ['suggest'];
        else {
          a.crops = a.crops.filter(function (c) { return c !== 'suggest'; });
          var i = a.crops.indexOf(v); if (i >= 0) a.crops.splice(i, 1); else a.crops.push(v);
        }
      } else if (step === 2) a.level = v;
      render();
    });
    function addAll(b) {
      var ids = el._ids || [];
      b.disabled = true; b.textContent = 'جارٍ الإضافة…';
      var live = !opts.catalogue && window.zid && zid.cart && zid.cart.addProduct;
      var chain = ids.reduce(function (pr, x) {
        return pr.then(function () { return live ? zid.cart.addProduct({ product_id: x.p.id, quantity: 1 }) : null; });
      }, Promise.resolve());
      chain.then(function () {
        b.textContent = (live || opts.onAdd) ? 'أُضيفت ' + ids.length + ' منتجات إلى السلة' : 'معاينة: ستُضاف ' + ids.length + ' منتجات إلى السلة';
        if (opts.onAdd) opts.onAdd(ids);
      }).catch(function () { b.disabled = false; b.textContent = 'تعذّرت الإضافة، حاول مرة أخرى'; });
    }
  }

  window.NabatakFinder = { mount: mount, recommend: recommend };
  var auto = document.getElementById('nb-finder');
  if (auto && !auto.dataset.manual) mount(auto, {});
})();
