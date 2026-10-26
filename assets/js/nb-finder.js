/*
 * Nabatak Smart Product Finder (ما نباتك؟): one script for three hosts.
 *   1. On nabatak.sa (GTM Custom HTML tag or a landing-page theme section): reads live products
 *      and stock with window.zid.products.list() (names come back in the visitor's Zid language)
 *      and adds to the real cart with zid.cart.addProduct().
 *   2. Locally / design demo: pass {catalogue: [...], onAdd: fn} and the host handles the cart.
 * opts.lang: 'ar' (default) or 'en'. Products and categories are matched in both languages.
 * Rules here are a DEMO. Real recommendations need the agronomist-approved planting calendar (finder/data/).
 */
(function () {
  'use strict';

  // [key, Arabic label, English label, matcher over Arabic + English product names]
  var CROPS = [
    ['tomato', 'طماطم', 'Tomato', /طماطم|tomato/i],
    ['cucumber', 'خيار', 'Cucumber', /خيار|cucumber/i],
    ['pepper', 'فلفل', 'Peppers', /فلفل|pepper|capsicum|chil+i|cayenne/i],
    ['eggplant', 'باذنجان', 'Eggplant', /باذنجان|eggplant/i],
    ['squash', 'كوسا وقرع', 'Zucchini & squash', /كوس|قرع|zucchini|squash|pumpkin/i],
    ['okra', 'باميا', 'Okra', /باميا|okra/i],
    ['melon', 'شمام وبطيخ', 'Melon & watermelon', /شمام|حبحب|بطيخ|melon/i],
    ['cabbage', 'ملفوف وقرنبيط', 'Cabbage & cauliflower', /ملفوف|قرنبيط|بروكلي|cabbage|cauliflower|broccoli/i],
    ['leafy', 'خس وجرجير', 'Lettuce & greens', /خس|جرجير|ملوخية|سبانخ|lettuce|arugula|molokhia|spinach|watercress/i],
    ['roots', 'جزر ولفت وفجل', 'Carrot, turnip & radish', /جزر|لفت|فجل|بنجر|carrot|turnip|radish|beet/i],
    ['onion', 'بصل', 'Onion', /بصل|onion|leek/i],
    ['beans', 'لوبيا وفاصوليا', 'Beans & peas', /لوبيا|فاصوليا|بازلاء|\bbeans?\b|lobia|\bpeas?\b/i],
    ['herbs', 'أعشاب (كزبرة، شبت)', 'Herbs (coriander, dill)', /كزبرة|شبت|بقدونس|ريحان|نعناع|coriander|dill|parsley|basil|mint/i],
    ['flowers', 'زهور', 'Flowers', null]
  ];
  var SETTINGS = [
    ['home', 'منزلية', 'بلكونة أو داخل البيت', 'Home', 'Balcony or indoors'],
    ['garden', 'حديقة', 'حوض أو فناء', 'Garden', 'Bed or yard'],
    ['farm', 'مزرعة', 'مساحات مفتوحة', 'Farm', 'Open fields'],
    ['nursery', 'مشتل', 'إنتاج شتلات', 'Nursery', 'Seedling production']
  ];
  var LEVELS = [['beginner', 'مبتدئ', 'Beginner'], ['mid', 'لدي بعض الخبرة', 'Some experience'], ['expert', 'خبير', 'Expert']];
  // Store categories in both languages -> one key
  var CAT_KEYS = {
    'بذور خضار بكيت': 'packet', 'vegetable seeds packet': 'packet',
    'بذور خضار 100 جرام و50 جرام': 'small', 'vegetable seeds 100g and 50g': 'small',
    'بذورخضار 400 جرام و 1 كيلو': 'bulk', 'vegetable seeds 400 grams and 1 kilo': 'bulk',
    'بذور خضار هجين': 'hybrid', 'hybrid vegetable seeds': 'hybrid',
    'بذور زهور': 'flowers', 'flower seeds': 'flowers',
    'معدات': 'tools', 'equipment': 'tools',
    'باقات التوفير': 'boxes', 'savings packages': 'boxes'
  };
  var PACKS = { home: ['packet', 'small'], garden: ['small', 'packet'], farm: ['bulk', 'hybrid'], nursery: ['hybrid', 'bulk'] };
  var VEG = ['packet', 'small', 'bulk', 'hybrid'];
  var BEGINNER_PICKS = ['beans', 'squash', 'cucumber', 'herbs'];

  var T = {
    ar: {
      title: 'ما نباتك؟', intro: 'ثلاثة أسئلة، ونجمع لك من منتجات المتجر المتوفرة ما يناسب زراعتك.',
      loading: 'جارٍ تحميل منتجات المتجر…', failed: 'تعذّر تحميل المنتجات.',
      q1: 'ما نوع الزراعة؟', q2: 'ماذا ترغب في زراعته؟ (اختر أكثر من واحد)', q3: 'ما مستوى خبرتك؟',
      suggest: 'لا أعرف، اقترح لي', back: 'السابق', next: 'التالي', show: 'اعرض بوكسك',
      box: 'بوكسك', seeds: 'البذور', extras: 'تحتاجه معها', none: 'لم نجد بذورًا متوفرة لهذا الاختيار حاليًا.',
      farmTip: 'للمزارع والمشاتل: اخترنا لك عبوات 400 جرام وكيلو والبذور الهجينة.',
      boxTip: 'وفّر: اجمع بذورك في «%s».', total: 'المجموع', addAll: 'أضف الكل للسلة', add: 'أضف', added: 'أُضيف ✓',
      adding: 'جارٍ الإضافة…', addedAll: 'أُضيفت %n منتجات إلى السلة', previewAll: 'معاينة: ستُضاف %n منتجات إلى السلة',
      retry: 'تعذّرت الإضافة، حاول مرة أخرى', edit: 'عدّل إجاباتك', cur: 'ر.س',
      note: 'نموذج أولي: الترشيحات للعرض فقط، والترشيحات الفعلية تُبنى على تقويم زراعي يعتمده مهندس زراعي.',
      why: { small: 'لتقليم الأغصان الطرية وقطف الثمار', large: 'للأغصان السميكة', hedge: 'لتهذيب الأسيجة حول الأحواض', bags: 'لتخزين محصول البصل' }
    },
    en: {
      title: 'What will you grow?', intro: 'Three quick questions, and we put together what fits from the products in stock.',
      loading: 'Loading store products…', failed: 'Could not load products.',
      q1: 'Where will you grow?', q2: 'What would you like to grow? (pick one or more)', q3: 'How experienced are you?',
      suggest: "I'm not sure, suggest for me", back: 'Back', next: 'Next', show: 'Show my box',
      box: 'Your box', seeds: 'Seeds', extras: "You'll also need", none: 'No seeds in stock for this choice right now.',
      farmTip: 'For farms and nurseries we picked 400 g and 1 kg packs and hybrid seeds.',
      boxTip: 'Save: put your seeds together in “%s”.', total: 'Total', addAll: 'Add all to cart', add: 'Add', added: 'Added ✓',
      adding: 'Adding…', addedAll: '%n products added to your cart', previewAll: 'Preview: %n products would be added',
      retry: 'Could not add, please try again', edit: 'Change answers', cur: 'SAR',
      note: 'Prototype: these suggestions are for demonstration; the real ones will follow a planting calendar approved by an agronomist.',
      why: { small: 'For soft stems and picking', large: 'For thick branches', hedge: 'For trimming hedges around beds', bags: 'For storing your onion harvest' }
    }
  };

  var CSS = '.nbf{font-family:inherit;color:#14231A;max-width:760px;margin:0 auto;padding:16px}' +
    '.nbf h2{font-size:1.6rem;margin:0 0 4px}.nbf .nbf-sub{color:#4D5C52;margin:0 0 16px}' +
    '.nbf-bar{height:6px;background:#F1F4EE;margin:12px 0}.nbf-bar i{display:block;height:6px;background:#2F6B3D;transition:width .3s}' +
    '.nbf-q{font-weight:600;font-size:1.15rem;margin:8px 0 12px}' +
    '.nbf-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}' +
    '.nbf-opt{background:#F1F4EE;border:0;padding:12px 14px;text-align:start;font:inherit;cursor:pointer;min-height:52px}' +
    '.nbf-opt small{display:block;color:#4D5C52;font-size:.8rem}.nbf-opt.on{background:#14231A;color:#fff}.nbf-opt.on small{color:#dfe7e1}' +
    '.nbf-nav{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}.nbf-btn{border:0;padding:12px 20px;font:inherit;font-weight:600;cursor:pointer;background:#2F6B3D;color:#fff}' +
    '.nbf-btn.ghost{background:#F1F4EE;color:#14231A}.nbf-btn[disabled]{opacity:.4;cursor:not-allowed}' +
    '.nbf-grp{color:#4D5C52;margin:16px 0 6px;font-weight:500}.nbf-list{list-style:none;margin:0;padding:0}' +
    '.nbf-list li{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #EEF1EC}' +
    '.nbf-list img{width:52px;height:52px;object-fit:cover;flex:none;background:#F2F2EE}.nbf-list a{color:inherit;text-decoration:none;flex:1;min-width:0}' +
    '.nbf-list .why{display:block;color:#4D5C52;font-size:.8rem}.nbf-list .p{white-space:nowrap;font-variant-numeric:tabular-nums}' +
    '.nbf-one{border:1px solid #2F6B3D;background:#fff;color:#2F6B3D;font:inherit;font-size:.85rem;font-weight:600;padding:6px 12px;cursor:pointer;white-space:nowrap}' +
    '.nbf-one.done{background:#2F6B3D;color:#fff}.nbf-one[disabled]{cursor:default}' +
    '.nbf-total{display:flex;justify-content:space-between;font-weight:700;margin:14px 0}' +
    '.nbf-tip{background:#EFE6D4;padding:10px 14px;margin:10px 0;font-size:.9rem}.nbf-note{color:#4D5C52;font-size:.8rem;margin-top:12px}' +
    '@media (max-width:520px){.nbf-list li{flex-wrap:wrap}.nbf-list a{flex-basis:calc(100% - 62px)}.nbf-list .p{margin-inline-start:62px}.nbf-one{margin-inline-start:auto}}';

  function catName(c) { return (c && c.name && (c.name.ar || c.name.en || c.name)) || c; }
  function catKeys(p) {
    var names = (p.categories || []).map(catName).concat(p.cats_en || []);
    return names.map(function (n) { return CAT_KEYS[String(n).trim().toLowerCase()] || CAT_KEYS[String(n).trim()]; }).filter(Boolean);
  }
  function rawName(p) { return (p.name && (p.name.ar || p.name.en)) || p.name || ''; }
  function matchText(p) { return rawName(p) + ' ' + (p.name_en || ''); }
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

  function recommend(cat, a, lang) {
    var t = T[lang] || T.ar, L = lang === 'en' ? 2 : 1;
    var inStock = cat.filter(function (p) { return p.in_stock !== false; });
    var packs = PACKS[a.setting] || PACKS.home;
    var crops = a.crops.indexOf('suggest') >= 0 ? (a.level === 'beginner' ? BEGINNER_PICKS : ['tomato', 'cucumber', 'pepper']) : a.crops;
    var core = [];
    crops.forEach(function (key) {
      var def = CROPS.filter(function (c) { return c[0] === key; })[0];
      if (!def) return;
      var pool = inStock.filter(function (p) {
        var ks = catKeys(p);
        if (key === 'flowers') return ks.indexOf('flowers') >= 0;
        return def[3].test(matchText(p)) && ks.some(function (k) { return VEG.indexOf(k) >= 0; });
      });
      function rank(p) { return Math.min.apply(null, catKeys(p).map(function (k) { var i = packs.indexOf(k); return i < 0 ? 9 : i; }).concat([9])); }
      pool.sort(function (x, y) { return rank(x) - rank(y); });
      pool.slice(0, key === 'flowers' ? 3 : 1).forEach(function (p) {
        if (!core.some(function (c) { return c.p === p; })) core.push({ p: p, why: def[L] });
      });
    });
    var tools = inStock.filter(function (p) { return catKeys(p).indexOf('tools') >= 0; });
    function tool(re, why) { var x = tools.filter(function (p) { return re.test(matchText(p)); })[0]; return x ? { p: x, why: why } : null; }
    var extra = [];
    if (a.setting === 'home' || a.setting === 'garden') extra.push(tool(/مقص تقليم صغير|small pruning/i, t.why.small));
    if (a.setting === 'garden' || a.setting === 'farm') extra.push(tool(/مقص تقليم كبير|large garden pruning/i, t.why.large));
    if (a.setting === 'garden') extra.push(tool(/الأسيجة|hedge/i, t.why.hedge));
    if (crops.indexOf('onion') >= 0) extra.push(tool(a.setting === 'farm' || a.setting === 'nursery' ? /10 كيلو|10 ?kg/i : /5 كيلو|5 ?kg/i, t.why.bags));
    extra = extra.filter(Boolean);
    var box = (core.length >= 3 && (a.setting === 'home' || a.setting === 'garden')) ?
      inStock.filter(function (p) { return /كون بوكسك|build your own box/i.test(matchText(p)); })[0] : null;
    return { core: core, extra: extra, box: box };
  }

  function mount(el, opts) {
    opts = opts || {};
    var lang = opts.lang === 'en' ? 'en' : 'ar', t = T[lang];
    var cur = function (v) { return Number(v).toFixed(2) + ' ' + t.cur; };
    var shown = function (p) { return lang === 'en' && p.name_en ? p.name_en : rawName(p); };
    if (!document.getElementById('nbf-css')) {
      var st = document.createElement('style'); st.id = 'nbf-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    var a = { setting: null, crops: [], level: null }, step = 0, cat = null;
    el.className = (el.className.replace(/\bnbf\b/, '') + ' nbf').trim();
    el.dir = lang === 'en' ? 'ltr' : 'rtl';
    el.innerHTML = '<p class="nbf-sub">' + t.loading + '</p>';
    loadCatalogue(opts).then(function (c) { cat = c; render(); })
      .catch(function () { el.innerHTML = '<p class="nbf-sub">' + t.failed + '</p>'; });

    function opt(val, label, sub, on) {
      return '<button type="button" class="nbf-opt' + (on ? ' on' : '') + '" data-v="' + val + '">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
    }
    function render() {
      var h = '<h2>' + t.title + '</h2><p class="nbf-sub">' + t.intro + '</p>';
      h += '<div class="nbf-bar"><i style="width:' + (step * 33.4) + '%"></i></div>';
      if (step === 0) {
        h += '<p class="nbf-q">' + t.q1 + '</p><div class="nbf-opts">' +
          SETTINGS.map(function (s) { return opt(s[0], lang === 'en' ? s[3] : s[1], lang === 'en' ? s[4] : s[2], a.setting === s[0]); }).join('') + '</div>';
      } else if (step === 1) {
        h += '<p class="nbf-q">' + t.q2 + '</p><div class="nbf-opts">' +
          CROPS.map(function (c) { return opt(c[0], lang === 'en' ? c[2] : c[1], '', a.crops.indexOf(c[0]) >= 0); }).join('') +
          opt('suggest', t.suggest, '', a.crops.indexOf('suggest') >= 0) + '</div>';
      } else if (step === 2) {
        h += '<p class="nbf-q">' + t.q3 + '</p><div class="nbf-opts">' +
          LEVELS.map(function (l) { return opt(l[0], lang === 'en' ? l[2] : l[1], '', a.level === l[0]); }).join('') + '</div>';
      } else {
        h += result();
      }
      if (step < 3) {
        var ok = step === 0 ? !!a.setting : step === 1 ? a.crops.length > 0 : true;
        h += '<div class="nbf-nav">' + (step ? '<button type="button" class="nbf-btn ghost" data-nav="-1">' + t.back + '</button>' : '') +
          '<button type="button" class="nbf-btn" data-nav="1"' + (ok ? '' : ' disabled') + '>' + (step === 2 ? t.show : t.next) + '</button></div>';
      }
      el.innerHTML = h;
    }
    function row(x, i) {
      var p = x.p;
      return '<li><img src="' + imgOf(p) + '" alt="" loading="lazy"><a href="' + urlOf(p) + '">' + shown(p) +
        (x.why ? '<span class="why">' + x.why + '</span>' : '') + '</a><span class="p">' + cur(p.sale_price || p.price) + '</span>' +
        '<button type="button" class="nbf-one" data-one="' + i + '">' + t.add + '</button></li>';
    }
    function result() {
      var r = recommend(cat, a, lang), ids = r.core.concat(r.extra);
      var total = ids.reduce(function (s, x) { return s + Number(x.p.sale_price || x.p.price); }, 0);
      var h = '<p class="nbf-q">' + t.box + '</p>';
      h += r.core.length ? '<p class="nbf-grp">' + t.seeds + '</p><ul class="nbf-list">' + r.core.map(function (x, i) { return row(x, i); }).join('') + '</ul>'
        : '<p>' + t.none + '</p>';
      if (r.extra.length) h += '<p class="nbf-grp">' + t.extras + '</p><ul class="nbf-list">' + r.extra.map(function (x, i) { return row(x, r.core.length + i); }).join('') + '</ul>';
      if (a.setting === 'farm' || a.setting === 'nursery') h += '<p class="nbf-tip">' + t.farmTip + '</p>';
      if (r.box) h += '<p class="nbf-tip">' + t.boxTip.replace('%s', '<a href="' + urlOf(r.box) + '">' + shown(r.box) + '</a>') + '</p>';
      if (ids.length) h += '<div class="nbf-total"><span>' + t.total + '</span><span>' + cur(total) + '</span></div>' +
        '<button type="button" class="nbf-btn" data-add="1">' + t.addAll + '</button>';
      h += '<div class="nbf-nav"><button type="button" class="nbf-btn ghost" data-nav="-1">' + t.edit + '</button></div>';
      h += '<p class="nbf-note">' + t.note + '</p>';
      el._ids = ids;
      return h;
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !el.contains(b)) return;
      if (b.dataset.nav) { step = Math.max(0, Math.min(3, step + Number(b.dataset.nav))); render(); return; }
      if (b.dataset.add) { addItems(el._ids || [], b, true); return; }
      if (b.dataset.one) { addItems([(el._ids || [])[Number(b.dataset.one)]].filter(Boolean), b, false); return; }
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
    function addItems(items, b, all) {
      if (!items.length) return;
      var before = b.textContent;
      b.disabled = true; b.textContent = t.adding;
      var live = !opts.catalogue && window.zid && zid.cart && zid.cart.addProduct;
      var chain = items.reduce(function (pr, x) {
        return pr.then(function () { return live ? zid.cart.addProduct({ product_id: x.p.id, quantity: 1 }) : null; });
      }, Promise.resolve());
      chain.then(function () {
        if (all) {
          b.textContent = (live || opts.onAdd) ? t.addedAll.replace('%n', items.length) : t.previewAll.replace('%n', items.length);
          [].forEach.call(el.querySelectorAll('.nbf-one'), function (o) { o.textContent = t.added; o.classList.add('done'); o.disabled = true; });
        } else {
          b.textContent = t.added; b.classList.add('done');
        }
        if (opts.onAdd) opts.onAdd(items);
      }).catch(function () { b.disabled = false; b.textContent = all ? t.retry : before; });
    }
  }

  window.NabatakFinder = { mount: mount, recommend: recommend };
  var auto = document.getElementById('nb-finder');
  if (auto && !auto.dataset.manual) mount(auto, {});
})();
