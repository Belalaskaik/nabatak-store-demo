/* Nabatak store design demo: shared header, footer, cart, language and page rendering.
   Catalogue: window.NB_CATALOGUE (snapshot of nabatak.sa, 26 Oct 2026, Arabic + English names from Zid).
   Language: Zid stores offer Arabic and English (ar-sa / en-sa); the toggle mirrors that. Cart is a demo kept in this browser. */
(function () {
  'use strict';
  var C = window.NB_CATALOGUE || [];
  // [Arabic category name in Zid, Arabic label, English label (Zid's English category name, tidied)]
  var CATS = [
    ['بذور خضار بكيت', 'بذور خضار بكيت', 'Vegetable seed packets'],
    ['بذور خضار 100 جرام و50 جرام', 'بذور 100 و50 جرام', 'Vegetable seeds 100g & 50g'],
    ['بذورخضار 400 جرام و 1 كيلو', 'بذور 400 جرام و1 كيلو', 'Vegetable seeds 400g & 1kg'],
    ['بذور خضار هجين', 'بذور هجين', 'Hybrid vegetable seeds'],
    ['بذور زهور', 'بذور زهور', 'Flower seeds'],
    ['معدات', 'المعدات', 'Equipment'],
    ['باقات التوفير', 'باقات التوفير', 'Savings packages']
  ];
  var IMG = 'assets/img/';
  var TABBY = 'https://media.zid.store/static/tabby2.svg'; // Zid's own Tabby logo asset
  var page = document.body.dataset.page;
  var qs = new URLSearchParams(location.search);

  /* ---------- language ---------- */
  function savedLang() { try { return localStorage.getItem('nb-lang'); } catch (e) { return null; } }
  var lang = qs.get('lang') === 'en' || qs.get('lang') === 'ar' ? qs.get('lang') : (savedLang() || 'ar');
  try { localStorage.setItem('nb-lang', lang); } catch (e) {}
  var EN = lang === 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = EN ? 'ltr' : 'rtl';

  var T = EN ? {
    brand: 'Nabatak', ship: 'Delivery across Saudi Arabia', split: 'Split it with', original: 'Original seeds', wa: 'WhatsApp',
    announce: 'Delivery to all regions of Saudi Arabia within a week at most', search: 'Search seeds, tools…', searchBtn: 'Search',
    home: 'Home', all: 'All products', finder: 'What will you grow?', cart: 'Cart', menu: 'Menu', close: 'Close',
    heroH: 'Plant the right seed', heroP: 'Original vegetable and flower seeds in home and farm pack sizes, delivered across Saudi Arabia.',
    help: 'Help me choose', browse: 'Browse products', byWay: 'Start by how you grow',
    ways: [['Home growing', 'Balcony or indoors'], ['Garden', 'Bed or yard'], ['Farm', '400 g and 1 kg packs'], ['Nursery', 'Hybrid seeds']],
    seeAll: 'See all →', story: 'From seed to harvest',
    steps: ['Choose your seeds', 'Prepare the spot', 'Sow in season', 'Water and watch', 'Prune and protect', 'Harvest and store'],
    boxH: 'Build your own box', boxP: 'Pick your seeds in one box for less.', boxBtn: 'Build your box',
    tools: 'Equipment & harvest supplies', reviews: 'What customers say', reviewsNote: 'Reviews as written by customers (Arabic).',
    about: 'Nabatak sells Turkish and Indian vegetable and flower seeds in home and farm pack sizes, plus pruning shears and harvest storage bags, delivered across Saudi Arabia.',
    add: 'Add to cart', added: 'Added ✓', addedToast: 'Added to cart', addedN: '%n added to cart',
    results: 'Search results: “%s”', products: '%n products', none: 'No matching products. Try “%f”.',
    sortDefault: 'Default order', sortLow: 'Price: low to high', sortHigh: 'Price: high to low',
    plant: 'Planting info:', plantTxt: 'best season for your region, plant spacing and days to harvest.', plantNote: 'Added for each variety once the agronomist approves it.',
    bnpl: 'From %m SAR/month in up to 12 monthly payments, Sharia-compliant.',
    descSeed: 'original seeds with the variety name on every pack.', descTool: 'from our growing and harvest supplies.',
    desc: '%p from Nabatak, %d Delivery to all regions of Saudi Arabia within a week at most.',
    alsoNeed: "You'll also need", sameCat: 'More from this category', qtyUp: 'Increase', qtyDown: 'Decrease',
    finderIntro: 'Answer three questions and we suggest products that are in stock.',
    emptyCart: 'Your cart is empty', keep: 'Continue shopping',
    freeLeft: 'Add %a for free shipping', freeOk: 'Your order qualifies for free shipping', freeNote: 'The free-shipping threshold here is an example.',
    remove: 'Remove', subtotal: 'Subtotal', shipping: 'Shipping', shipLater: 'Calculated at checkout', free: 'Free', total: 'Total',
    checkout: 'Complete your order on nabatak.sa', cartNote: 'This is a design demo; this cart is for show and does not carry over to the store. Prices include VAT.',
    fAbout: 'Original vegetable and flower seeds and growing tools for every region of Saudi Arabia.', fLinks: 'Links', fStore: 'Official store',
    fContact: 'Contact us', fFollow: 'Follow us', ig: 'Instagram', tt: 'TikTok',
    demo: 'Design demo only, built with what can be published on the current Zid store. Products and prices from nabatak.sa on 26 Oct 2026. To buy: ',
    other: 'العربية', otherCode: 'ar', cur: 'SAR', breadHome: 'Home', payWith: 'Pay with', shipWith: 'Shipped by'
  } : {
    brand: 'نباتك', ship: 'توصيل لكل مناطق المملكة', split: 'قسّطها مع', original: 'بذور أصلية', wa: 'واتساب',
    announce: 'شحن لجميع مناطق المملكة خلال أسبوع كحد أقصى', search: 'ابحث عن بذور، أدوات…', searchBtn: 'بحث',
    home: 'الرئيسية', all: 'جميع المنتجات', finder: 'ما نباتك؟', cart: 'السلة', menu: 'القائمة', close: 'إغلاق',
    heroH: 'ازرع بذرتك الصحيحة', heroP: 'بذور خضار وزهور أصلية بعبوات للبيت والمزرعة، مع توصيل لكل مناطق المملكة.',
    help: 'ساعدني أختار', browse: 'تصفّح المنتجات', byWay: 'ابدأ حسب نوع زراعتك',
    ways: [['زراعة منزلية', 'بلكونة أو داخل البيت'], ['حديقة', 'حوض أو فناء'], ['مزرعة', 'عبوات 400 جرام وكيلو'], ['مشتل', 'بذور هجين']],
    seeAll: 'عرض الكل ←', story: 'من البذرة إلى الحصاد',
    steps: ['تختار بذورك', 'تجهّز المكان', 'تزرع في موسمها', 'تسقي وتتابع', 'تقلّم وتحمي', 'تحصد وتخزّن'],
    boxH: 'كوّن بوكسك بنفسك', boxP: 'اختر بذورك في بوكس واحد بسعر أقل.', boxBtn: 'كوّن بوكسك',
    tools: 'المعدات ومستلزمات الحصاد', reviews: 'آراء عملائنا', reviewsNote: '',
    about: 'متجر نباتك لبذور الخضار والزهور التركية والهندية بعبوات للمنزل والمزارع، مع مقصات التقليم وأكياس تخزين المحصول، وتوصيل لجميع مناطق السعودية.',
    add: 'أضف للسلة', added: 'أُضيف ✓', addedToast: 'أُضيف إلى السلة', addedN: 'أُضيف %n إلى السلة',
    results: 'نتائج البحث: «%s»', products: '%n منتج', none: 'لا توجد منتجات مطابقة. جرّب «%f».',
    sortDefault: 'الترتيب الافتراضي', sortLow: 'السعر: من الأقل', sortHigh: 'السعر: من الأعلى',
    plant: 'معلومات الزراعة:', plantTxt: 'الموسم المناسب لمنطقتك، المسافة بين النباتات، والأيام حتى الحصاد.', plantNote: 'تُضاف لكل صنف بعد اعتماد المهندس الزراعي.',
    bnpl: 'ابتداءً من %m ر.س/شهر على ما يصل إلى 12 دفعة شهرية، متوافق مع أحكام الشريعة.',
    descSeed: 'بذور أصلية مع اسم الصنف على كل عبوة.', descTool: 'من مستلزمات الزراعة والحصاد.',
    desc: '%p من متجر نباتك، %d توصيل لجميع مناطق المملكة خلال أسبوع كحد أقصى.',
    alsoNeed: 'تحتاجه معها', sameCat: 'منتجات من نفس القسم', qtyUp: 'زيادة', qtyDown: 'إنقاص',
    finderIntro: 'أجب عن ثلاثة أسئلة ونرشّح لك من منتجات المتجر المتوفرة.',
    emptyCart: 'سلة التسوق فارغة', keep: 'متابعة التسوق',
    freeLeft: 'أضف %a للحصول على شحن مجاني', freeOk: 'طلبك مؤهل للشحن المجاني', freeNote: 'حد الشحن المجاني هنا قيمة توضيحية.',
    remove: 'حذف', subtotal: 'المجموع الفرعي', shipping: 'الشحن', shipLater: 'يُحسب عند الدفع', free: 'مجاني', total: 'الإجمالي',
    checkout: 'أكمل الطلب على nabatak.sa', cartNote: 'هذه نسخة تصميمية؛ السلة هنا للعرض فقط ولا تنتقل إلى المتجر. الأسعار تشمل الضريبة.',
    fAbout: 'بذور خضار وزهور وأدوات زراعية أصلية لكل مناطق المملكة.', fLinks: 'روابط مهمة', fStore: 'المتجر الرسمي',
    fContact: 'تواصل معنا', fFollow: 'تابعنا', ig: 'انستقرام', tt: 'تيك توك',
    demo: 'نسخة تصميمية للعرض فقط، مبنية بما يمكن نشره على متجر زد الحالي. المنتجات والأسعار من nabatak.sa بتاريخ 26 أكتوبر 2026. للشراء: ',
    other: 'English', otherCode: 'en', cur: 'ر.س', breadHome: 'الرئيسية', payWith: 'طرق الدفع', shipWith: 'شركات الشحن'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sar(v) { return Number(v).toFixed(2) + ' ' + T.cur; }
  function priceOf(p) { return Number(p.sale_price || p.price); }
  function nm(p) { return EN && p.name_en ? p.name_en : p.name; }
  function catLabel(arName) { var c = CATS.filter(function (x) { return x[0] === arName; })[0]; return c ? (EN ? c[2] : c[1]) : arName; }
  function byId(id) { return C.filter(function (p) { return p.id === id; })[0]; }
  function inCat(cat) { return C.filter(function (p) { return p.categories.indexOf(cat) >= 0; }); }
  function pUrl(p) { return 'product.html?id=' + encodeURIComponent(p.id); }
  function cUrl(cat) { return 'category.html?c=' + encodeURIComponent(cat); }
  function swapLangUrl() { var q = new URLSearchParams(location.search); q.set('lang', T.otherCode); return location.pathname + '?' + q.toString() + location.hash; }

  /* ---------- demo cart (this browser only) ---------- */
  var mem = {};
  function load() { try { return JSON.parse(localStorage.getItem('nb-demo-cart') || '{}'); } catch (e) { return mem; } }
  function save(c) { mem = c; try { localStorage.setItem('nb-demo-cart', JSON.stringify(c)); } catch (e) {} badge(); }
  function add(id, n) { var c = load(); c[id] = (c[id] || 0) + (n || 1); save(c); }
  function count() { var c = load(); return Object.keys(c).filter(byId).reduce(function (s, k) { return s + c[k]; }, 0); }
  function badge() { [].forEach.call(document.querySelectorAll('.cartCount'), function (b) { b.textContent = count(); }); }
  function toast(msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }
  window.NB_CART = { add: add, count: count };

  /* ---------- shared chrome ---------- */
  var LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M37.5 3.5C40 17 36.5 29.5 25 35.5c-4.2 2.2-8.4 4-10.6 8.5C9.6 33.8 11.4 21.6 19.6 13.8 24.6 9 30.6 5.6 37.5 3.5z" fill="#3E8A50"/><path d="M41.6 15.2c2.6 12.8-3.4 25.4-19.6 29.2 7.6-5 15.6-12.6 19.6-29.2z" fill="#9A6420"/></svg>';
  var ICON = {
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    cart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    globe: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
    x: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  function navLinks() {
    var cur = qs.get('c');
    return [['index.html', T.home, page === 'home'], ['category.html', T.all, page === 'category' && !cur && !qs.get('q')]]
      .concat(CATS.map(function (c) { return [cUrl(c[0]), EN ? c[2] : c[1], cur === c[0]]; }))
      .concat([['finder.html', T.finder, page === 'finder', 'finder']]);
  }
  function header() {
    var links = navLinks();
    return '<div class="strip"><span>🚚 ' + T.ship + '</span><span class="tabby-line">' + T.split + ' <img src="' + TABBY + '" alt="Tabby" height="18"></span><span>🌱 ' + T.original + '</span><span>💬 ' + T.wa + ' <bdi dir="ltr">0538776569</bdi></span></div>' +
      '<div class="announce">' + T.announce + '</div>' +
      '<header class="hdr"><div class="wrap row">' +
      '<button class="burger" type="button" aria-label="' + T.menu + '" aria-expanded="false" aria-controls="drawer">' + ICON.menu + '</button>' +
      '<a class="logo" href="index.html">' + LOGO + T.brand + '</a>' +
      '<form class="search" action="category.html" role="search"><input name="q" placeholder="' + T.search + '" value="' + esc(qs.get('q') || '') + '" aria-label="' + T.searchBtn + '"><button aria-label="' + T.searchBtn + '">' + ICON.search + '</button></form>' +
      '<div class="icons"><a class="langbtn" href="' + esc(swapLangUrl()) + '" lang="' + T.otherCode + '">' + ICON.globe + '<span>' + T.other + '</span></a>' +
      '<a class="cartlink" href="cart.html" aria-label="' + T.cart + '">' + ICON.cart + '<b class="cartCount">0</b></a></div>' +
      '</div><nav class="menu" aria-label="' + T.menu + '"><div class="wrap">' +
      links.map(function (l) { return '<a href="' + l[0] + '"' + (l[2] ? ' class="on"' : '') + '>' + l[1] + '</a>'; }).join('') +
      '</div></nav></header>' +
      '<div class="scrim" hidden></div>' +
      '<aside class="drawer" id="drawer" aria-label="' + T.menu + '" hidden>' +
      '<div class="dhead"><a class="logo" href="index.html">' + LOGO + T.brand + '</a><button class="dclose" type="button" aria-label="' + T.close + '">' + ICON.x + '</button></div>' +
      '<nav class="dlinks">' + links.filter(function (l) { return l[3] === 'finder'; }).concat(links.filter(function (l) { return l[3] !== 'finder'; })).map(function (l) {
        return '<a href="' + l[0] + '" class="' + (l[2] ? 'on ' : '') + (l[3] === 'finder' ? 'dfinder' : '') + '">' + l[1] + '</a>';
      }).join('') + '</nav>' +
      '<div class="dfoot"><a class="btn dlang" href="' + esc(swapLangUrl()) + '" lang="' + T.otherCode + '">' + ICON.globe + ' ' + T.other + '</a>' +
      '<a class="btn ghost" href="https://wa.me/966538776569">💬 ' + T.wa + '</a></div></aside>';
  }
  // Same logos the live Zid footer shows from the store's payment and shipping settings (26 Oct 2026).
  var ZS = 'https://media.zid.store/static/', ZR = 'https://media.zid.store/cdn-cgi/image/w=160,q=90/https://media.zidship.com/thumbs/servicelevel/';
  var PAY = [['Apple Pay', ZS + 'apple_pay.svg'], ['mada', ZS + 'mada-circle.png'], ['Visa', ZS + 'visa-circle.png'], ['Mastercard', ZS + 'mastercard-circle.png'], ['Tabby', ZS + 'tabby2.svg']];
  var SHIP = [['Aramex', ZR + '936c0695-2967-4ef8-afd9-a75d5e2feb4d-thumbnail-370x370.png'], ['Naqel', ZR + '79146413-5005-49b8-9621-47ac8f210e6f-thumbnail-370x370.png'], ['J&T Express', ZR + 'a01ffb8c-695e-4824-a6c8-de85e6ec4250-thumbnail-370x370.png']];
  function logos(list) { return list.map(function (l) { return '<span class="lg" title="' + l[0] + '"><img src="' + l[1] + '" alt="' + l[0] + '" loading="lazy"></span>'; }).join(''); }
  function footer() {
    return '<section class="paybar"><div class="wrap"><div class="pgroup"><b>' + T.payWith + '</b><div class="lgs">' + logos(PAY) + '</div></div>' +
      '<div class="pgroup"><b>' + T.shipWith + '</b><div class="lgs">' + logos(SHIP) + '</div></div></div></section>' +
      '<footer class="ftr"><div class="wrap">' +
      '<div><b>' + T.brand + '</b>' + T.fAbout + '</div>' +
      '<div><b>' + T.fLinks + '</b><a href="https://nabatak.sa/">' + T.fStore + '</a><br><a href="finder.html">' + T.finder + '</a><br><a href="category.html">' + T.all + '</a></div>' +
      '<div><b>' + T.fContact + '</b>nabatak@outlook.com<br><bdi dir="ltr">+966 53 877 6569</bdi></div>' +
      '<div><b>' + T.fFollow + '</b><a href="https://www.instagram.com/nabatak.sa">' + T.ig + '</a> · <a href="https://www.tiktok.com/@nabatakstore">' + T.tt + '</a></div>' +
      '<div class="demo">' + T.demo + '<a href="https://nabatak.sa/">nabatak.sa</a></div>' +
      '</div></footer>' +
      (page !== 'finder' ? '<a class="fab" href="finder.html">' + T.help + '</a>' : '') +
      '<div class="toast" id="toast" role="status"></div>';
  }

  function card(p) {
    var was = p.sale_price && Number(p.sale_price) < Number(p.price) ? '<s>' + sar(p.price) + '</s>' : '';
    return '<div class="pc"><a class="im" href="' + pUrl(p) + '"><img src="' + esc(p.img) + '" alt="' + esc(nm(p)) + '" loading="lazy"></a>' +
      '<a class="n" href="' + pUrl(p) + '">' + esc(nm(p)) + '</a><span class="pr">' + sar(priceOf(p)) + was + '</span>' +
      '<button class="add" data-add="' + p.id + '">' + T.add + '</button></div>';
  }

  /* ---------- pages ---------- */
  function home() {
    var ways = [['finder-home', 'بذور خضار بكيت'], ['finder-garden', 'بذور خضار 100 جرام و50 جرام'], ['finder-farm', 'بذورخضار 400 جرام و 1 كيلو'], ['finder-nursery', 'بذور خضار هجين']];
    var steps = ['story-1-choose', 'story-2-prepare', 'story-3-sow', 'story-4-water', 'story-5-prune', 'story-6-harvest'];
    return '<section class="iwt"><img src="' + IMG + 'finder-home.jpg" alt="">' +
      '<div class="txt"><h1>' + T.heroH + '</h1><p>' + T.heroP + '</p>' +
      '<a class="btn" href="finder.html">' + T.help + '</a> <a class="btn ghost" href="category.html">' + T.browse + '</a></div></section>' +
      '<section class="sec"><div class="wrap"><h2>' + T.byWay + '</h2><div class="cards">' +
      ways.map(function (x, i) {
        return '<a class="card" href="' + cUrl(x[1]) + '"><img src="' + IMG + x[0] + '.jpg" alt=""><b>' + T.ways[i][0] + '</b><small>' + T.ways[i][1] + '</small></a>';
      }).join('') + '</div></div></section>' +
      row('بذور خضار بكيت', 5) +
      '<section class="sec"><div class="wrap"><h2>' + T.story + '</h2><div class="gal">' +
      steps.map(function (s, i) { return '<figure><img src="' + IMG + s + '.jpg" alt="' + T.steps[i] + '" loading="lazy"><figcaption>' + T.steps[i] + '</figcaption></figure>'; }).join('') +
      '</div></div></section>' +
      '<section class="iwt rev"><img src="' + IMG + 'box-hero.jpg" alt=""><div class="txt"><h2>' + T.boxH + '</h2>' +
      '<p>' + T.boxP + '</p><a class="btn" href="' + cUrl('باقات التوفير') + '">' + T.boxBtn + '</a></div></section>' +
      row('بذور زهور', 5) + row('معدات', 5, T.tools) +
      '<section class="sec"><div class="wrap"><h2>' + T.reviews + '</h2><div class="revs" dir="rtl" lang="ar">' +
      '<div class="rv"><b>مريم عاطف</b><span class="st">★★★★★</span><p>بصراحة نباتك فاجأني بالجودة والتنوع… كل شي احتجته لقيته عندهم.</p></div>' +
      '<div class="rv"><b>شادن احمد</b><span class="st">★★★★★</span><p>تسلمو ماتوقعت توصلني بالجودة هاذي ماقصرتو.</p></div>' +
      '<div class="rv"><b>ميرال احمد</b><span class="st">★★★★★</span><p>من افضل المتاجر اللي تعاملنا معهم.</p></div>' +
      '</div>' + (T.reviewsNote ? '<p class="muted">' + T.reviewsNote + '</p>' : '') + '</div></section>' +
      '<section class="desc"><h2>' + T.brand + '</h2><p>' + T.about + '</p></section>';
  }
  function row(cat, n, title) {
    return '<section class="sec"><div class="wrap"><div class="head"><h2>' + (title || catLabel(cat)) + '</h2><a href="' + cUrl(cat) + '">' + T.seeAll + '</a></div>' +
      '<div class="plist">' + inCat(cat).slice(0, n).map(card).join('') + '</div></div></section>';
  }

  function category() {
    var c = qs.get('c'), q = (qs.get('q') || '').trim(), sort = qs.get('sort') || '';
    var list = c ? inCat(c) : C.slice();
    var title = c ? catLabel(c) : T.all;
    if (q) {
      // Search both the Arabic and the English product name, whatever the page language.
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(function (p) {
        var hay = (p.name + ' ' + (p.name_en || '')).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) >= 0; });
      });
      title = T.results.replace('%s', esc(q));
    }
    if (sort === 'low') list.sort(function (a, b) { return priceOf(a) - priceOf(b); });
    if (sort === 'high') list.sort(function (a, b) { return priceOf(b) - priceOf(a); });
    document.title = title.replace(/<[^>]+>/g, '') + ' | ' + T.brand;
    return '<div class="wrap"><p class="crumb"><a href="index.html">' + T.breadHome + '</a> › ' + title + '</p>' +
      '<div class="cathead"><h1>' + title + ' <small>(' + T.products.replace('%n', list.length) + ')</small></h1>' +
      '<select id="sort" aria-label="sort"><option value="">' + T.sortDefault + '</option><option value="low"' + (sort === 'low' ? ' selected' : '') + '>' + T.sortLow + '</option><option value="high"' + (sort === 'high' ? ' selected' : '') + '>' + T.sortHigh + '</option></select></div>' +
      (list.length ? '<div class="plist">' + list.map(card).join('') + '</div>' : '<p class="empty">' + T.none.replace('%f', '<a href="finder.html">' + T.finder + '</a>') + '</p>') +
      '</div><div style="height:40px"></div>';
  }

  function product() {
    var p = byId(qs.get('id')) || C[0];
    document.title = nm(p) + ' | ' + T.brand;
    var cat = p.categories[0] || '';
    var monthly = (priceOf(p) / 12).toFixed(2);
    var related = inCat(cat).filter(function (x) { return x.id !== p.id; }).slice(0, 3);
    var tools = C.filter(function (x) { return /مقص تقليم صغير|5 كيلو|كون بوكسك/.test(x.name) && x.id !== p.id; }).slice(0, 3);
    var isSeed = /بذور/.test(cat);
    return '<div class="wrap"><p class="crumb"><a href="index.html">' + T.breadHome + '</a> › <a href="' + cUrl(cat) + '">' + catLabel(cat) + '</a> › ' + esc(nm(p)) + '</p>' +
      '<div class="pdp"><div class="gallery"><img src="' + esc(p.img) + '" alt="' + esc(nm(p)) + '"></div><div>' +
      '<p class="cat">' + catLabel(cat) + '</p><h1>' + esc(nm(p)) + '</h1>' +
      '<div class="price">' + sar(priceOf(p)) + (p.sale_price && Number(p.sale_price) < Number(p.price) ? '<s>' + sar(p.price) + '</s>' : '') + '</div>' +
      '<div class="qty"><button type="button" data-q="1" aria-label="' + T.qtyUp + '">+</button><span id="qty">1</span><button type="button" data-q="-1" aria-label="' + T.qtyDown + '">−</button></div>' +
      (isSeed ? '<div class="agri"><b>' + T.plant + '</b> ' + T.plantTxt + '<br><small>' + T.plantNote + '</small></div>' : '') +
      '<button class="atc" data-addq="' + p.id + '">' + ICON.cart + ' ' + T.add + '</button>' +
      '<div class="bnpl"><span>' + T.bnpl.replace('%m', monthly) + '</span><img src="' + TABBY + '" alt="Tabby" height="22"></div>' +
      '<p style="margin-top:16px">' + T.desc.replace('%p', esc(nm(p))).replace('%d', isSeed ? T.descSeed : T.descTool) + '</p>' +
      '<p class="also-h">' + T.alsoNeed + '</p><div class="also">' + tools.map(card).join('') + '</div>' +
      '</div></div>' +
      (related.length ? '<section class="sec" style="padding-top:0"><h2>' + T.sameCat + '</h2><div class="plist">' + related.map(card).join('') + '</div></section>' : '') +
      '</div><div class="sticky-atc"><strong>' + sar(priceOf(p)) + '</strong><button class="atc" data-addq="' + p.id + '">' + T.add + '</button></div>';
  }

  function finder() {
    return '<div class="wrap pghead"><p class="crumb" style="padding:0"><a href="index.html">' + T.breadHome + '</a> › ' + T.finder + '</p>' +
      '<h1>' + T.finder + '</h1><p>' + T.finderIntro + '</p></div><div id="nb-finder" data-manual="1"></div><div style="height:30px"></div>';
  }

  var FREE = 150; // illustrative free-shipping threshold until the store sets one
  function cart() {
    var c = load(), ids = Object.keys(c).filter(byId), sub = ids.reduce(function (s, id) { return s + priceOf(byId(id)) * c[id]; }, 0);
    var crumb = '<p class="crumb"><a href="index.html">' + T.breadHome + '</a> › ' + T.cart + '</p>';
    if (!ids.length) return '<div class="wrap">' + crumb + '<div class="empty"><p style="font-size:20px">' + T.emptyCart + '</p><a class="btn" href="category.html">' + T.keep + '</a> <a class="btn ghost" href="finder.html">' + T.help + '</a></div></div>';
    var left = Math.max(0, FREE - sub);
    return '<div class="wrap">' + crumb + '<div class="cart"><div>' +
      '<div class="ship"><b>' + (left > 0 ? T.freeLeft.replace('%a', sar(left)) : T.freeOk) + '</b>' +
      '<div class="bar"><i style="width:' + Math.min(100, sub / FREE * 100) + '%"></i></div><small>' + T.freeNote + '</small></div>' +
      '<ul class="cl">' + ids.map(function (id) {
        var p = byId(id);
        return '<li><img src="' + esc(p.img) + '" alt=""><div class="nm"><a href="' + pUrl(p) + '">' + esc(nm(p)) + '</a><br><small>' + c[id] + ' × ' + sar(priceOf(p)) + '</small></div>' +
          '<strong>' + sar(priceOf(p) * c[id]) + '</strong><button class="rm" data-rm="' + id + '">' + T.remove + '</button></li>';
      }).join('') + '</ul></div>' +
      '<aside class="sum"><div class="line"><span>' + T.subtotal + '</span><span>' + sar(sub) + '</span></div>' +
      '<div class="line"><span>' + T.shipping + '</span><span>' + (left > 0 ? T.shipLater : T.free) + '</span></div>' +
      '<div class="line tot"><span>' + T.total + '</span><span>' + sar(sub) + '</span></div>' +
      '<a class="btn" style="display:block;text-align:center;margin-top:12px" href="https://nabatak.sa/">' + T.checkout + '</a>' +
      '<p class="demo-note">' + T.cartNote + '</p></aside></div></div>';
  }

  /* ---------- boot ---------- */
  var main = { home: home, category: category, product: product, finder: finder, cart: cart }[page] || home;
  if (EN) {
    var titles = { home: 'Nabatak | Vegetable & flower seeds and growing supplies', finder: T.finder + ' | Nabatak', cart: T.cart + ' | Nabatak' };
    if (titles[page]) document.title = titles[page];
  }
  document.getElementById('top').innerHTML = header();
  document.getElementById('main').innerHTML = main();
  document.getElementById('bottom').innerHTML = footer();
  if (page === 'product') document.body.classList.add('pdp-page');
  badge();

  // mobile drawer
  var drawer = document.getElementById('drawer'), scrim = document.querySelector('.scrim'), burger = document.querySelector('.burger');
  function setDrawer(open) {
    drawer.hidden = !open; scrim.hidden = !open; burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('noscroll', open);
    if (open) drawer.querySelector('.dclose').focus(); else burger.focus();
  }
  burger.addEventListener('click', function () { setDrawer(true); });
  drawer.querySelector('.dclose').addEventListener('click', function () { setDrawer(false); });
  scrim.addEventListener('click', function () { setDrawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });

  if (page === 'finder' && window.NabatakFinder) {
    NabatakFinder.mount(document.getElementById('nb-finder'), {
      catalogue: C, lang: lang,
      onAdd: function (items) { items.forEach(function (x) { add(x.p.id, 1); }); toast(items.length > 1 ? T.addedN.replace('%n', items.length) : T.addedToast); }
    });
  }
  var qty = 1;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.add[data-add],[data-addq],[data-q],[data-rm]'); if (!b) return;
    if (b.dataset.add) { add(b.dataset.add, 1); b.textContent = T.added; b.classList.add('done'); toast(T.addedToast); }
    if (b.dataset.addq) { add(b.dataset.addq, qty); toast(T.addedN.replace('%n', qty)); }
    if (b.dataset.q) { qty = Math.max(1, qty + Number(b.dataset.q)); document.getElementById('qty').textContent = qty; }
    if (b.dataset.rm) { var c = load(); delete c[b.dataset.rm]; save(c); document.getElementById('main').innerHTML = cart(); }
  });
  var s = document.getElementById('sort');
  if (s) s.addEventListener('change', function () { qs.set('sort', s.value); location.search = qs.toString(); });
})();
