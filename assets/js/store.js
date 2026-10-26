/* Nabatak store design demo: shared header, footer, cart and page rendering.
   Catalogue: window.NB_CATALOGUE (snapshot of nabatak.sa, 26 Oct 2026). Cart is a demo kept in this browser. */
(function () {
  'use strict';
  var C = window.NB_CATALOGUE || [];
  var CATS = [
    ['بذور خضار بكيت', 'بذور خضار بكيت'],
    ['بذور خضار 100 جرام و50 جرام', 'بذور 100 و50 جرام'],
    ['بذورخضار 400 جرام و 1 كيلو', 'بذور 400 جرام و1 كيلو'],
    ['بذور خضار هجين', 'بذور هجين'],
    ['بذور زهور', 'بذور زهور'],
    ['معدات', 'المعدات'],
    ['باقات التوفير', 'باقات التوفير']
  ];
  var IMG = 'assets/img/';
  var page = document.body.dataset.page;
  var qs = new URLSearchParams(location.search);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sar(v) { return Number(v).toFixed(2) + ' ر.س'; }
  function priceOf(p) { return Number(p.sale_price || p.price); }
  function byId(id) { return C.filter(function (p) { return p.id === id; })[0]; }
  function inCat(cat) { return C.filter(function (p) { return p.categories.indexOf(cat) >= 0; }); }
  function pUrl(p) { return 'product.html?id=' + encodeURIComponent(p.id); }
  function cUrl(cat) { return 'category.html?c=' + encodeURIComponent(cat); }

  /* ---------- demo cart (this browser only) ---------- */
  var mem = {};
  function load() { try { return JSON.parse(localStorage.getItem('nb-demo-cart') || '{}'); } catch (e) { return mem; } }
  function save(c) { mem = c; try { localStorage.setItem('nb-demo-cart', JSON.stringify(c)); } catch (e) {} badge(); }
  function add(id, n) { var c = load(); c[id] = (c[id] || 0) + (n || 1); save(c); }
  function count() { var c = load(); return Object.keys(c).filter(byId).reduce(function (s, k) { return s + c[k]; }, 0); }
  function badge() { var b = document.getElementById('cartCount'); if (b) b.textContent = count(); }
  function toast(msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }
  window.NB_CART = { add: add, count: count };

  /* ---------- shared chrome ---------- */
  var LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M37.5 3.5C40 17 36.5 29.5 25 35.5c-4.2 2.2-8.4 4-10.6 8.5C9.6 33.8 11.4 21.6 19.6 13.8 24.6 9 30.6 5.6 37.5 3.5z" fill="#3E8A50"/><path d="M41.6 15.2c2.6 12.8-3.4 25.4-19.6 29.2 7.6-5 15.6-12.6 19.6-29.2z" fill="#9A6420"/></svg>';
  function header() {
    var cur = qs.get('c');
    return '<div class="strip"><span>🚚 توصيل لكل مناطق المملكة</span><span>💳 قسّطها مع تابي</span><span>🌱 بذور أصلية</span><span>💬 واتساب 0538776569</span></div>' +
      '<div class="announce">شحن لجميع مناطق المملكة خلال أسبوع كحد أقصى</div>' +
      '<header class="hdr"><div class="wrap row">' +
      '<a class="logo" href="index.html">' + LOGO + 'نباتك</a>' +
      '<form class="search" action="category.html" role="search"><input name="q" placeholder="ابحث عن بذور، أدوات…" value="' + esc(qs.get('q') || '') + '" aria-label="بحث"><button aria-label="بحث"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button></form>' +
      '<div class="icons"><a class="cartlink" href="cart.html" aria-label="السلة">🛒<b id="cartCount">0</b></a></div>' +
      '</div><nav class="menu" aria-label="الأقسام"><div class="wrap">' +
      '<a href="index.html"' + (page === 'home' ? ' class="on"' : '') + '>الرئيسية</a>' +
      '<a href="category.html"' + (page === 'category' && !cur && !qs.get('q') ? ' class="on"' : '') + '>جميع المنتجات</a>' +
      CATS.map(function (c) { return '<a href="' + cUrl(c[0]) + '"' + (cur === c[0] ? ' class="on"' : '') + '>' + c[1] + '</a>'; }).join('') +
      '<a href="finder.html"' + (page === 'finder' ? ' class="on"' : '') + '>ما نباتك؟</a>' +
      '</div></nav></header>';
  }
  function footer() {
    return '<footer class="ftr"><div class="wrap">' +
      '<div><b>نباتك</b>بذور خضار وزهور وأدوات زراعية أصلية لكل مناطق المملكة.</div>' +
      '<div><b>روابط مهمة</b><a href="https://nabatak.sa/">المتجر الرسمي</a><br><a href="finder.html">ما نباتك؟</a><br><a href="category.html">جميع المنتجات</a></div>' +
      '<div><b>تواصل معنا</b>nabatak@outlook.com<br><span dir="ltr">+966 53 877 6569</span></div>' +
      '<div><b>تابعنا</b><a href="https://www.instagram.com/nabatak.sa">انستقرام</a> · <a href="https://www.tiktok.com/@nabatakstore">تيك توك</a></div>' +
      '<div class="demo">نسخة تصميمية للعرض فقط، مبنية بما يمكن نشره على متجر زد الحالي. المنتجات والأسعار من nabatak.sa بتاريخ 26 أكتوبر 2026. للشراء: <a href="https://nabatak.sa/">nabatak.sa</a></div>' +
      '</div></footer>' +
      (page !== 'finder' ? '<a class="fab" href="finder.html">ساعدني أختار</a>' : '') +
      '<div class="toast" id="toast" role="status"></div>';
  }

  function card(p) {
    var was = p.sale_price && Number(p.sale_price) < Number(p.price) ? '<s>' + sar(p.price) + '</s>' : '';
    return '<div class="pc"><a class="im" href="' + pUrl(p) + '"><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy"></a>' +
      '<a class="n" href="' + pUrl(p) + '">' + esc(p.name) + '</a><span class="pr">' + sar(priceOf(p)) + was + '</span>' +
      '<button class="add" data-add="' + p.id + '">أضف للسلة</button></div>';
  }

  /* ---------- pages ---------- */
  function home() {
    return '<section class="iwt"><img src="' + IMG + 'finder-home.jpg" alt="زراعة منزلية على بلكونة">' +
      '<div class="txt"><h1>ازرع بذرتك الصحيحة</h1><p>بذور خضار وزهور أصلية بعبوات للبيت والمزرعة، مع توصيل لكل مناطق المملكة.</p>' +
      '<a class="btn" href="finder.html">ساعدني أختار</a> <a class="btn ghost" href="category.html">تصفّح المنتجات</a></div></section>' +
      '<section class="sec"><div class="wrap"><h2>ابدأ حسب نوع زراعتك</h2><div class="cards">' +
      [['finder-home', 'زراعة منزلية', 'بلكونة أو داخل البيت', 'بذور خضار بكيت'],
       ['finder-garden', 'حديقة', 'حوض أو فناء', 'بذور خضار 100 جرام و50 جرام'],
       ['finder-farm', 'مزرعة', 'عبوات 400 جرام وكيلو', 'بذورخضار 400 جرام و 1 كيلو'],
       ['finder-nursery', 'مشتل', 'بذور هجين', 'بذور خضار هجين']].map(function (x) {
        return '<a class="card" href="' + cUrl(x[3]) + '"><img src="' + IMG + x[0] + '.jpg" alt=""><b>' + x[1] + '</b><small>' + x[2] + '</small></a>';
      }).join('') + '</div></div></section>' +
      row('بذور خضار بكيت', 'بذور خضار بكيت', 5) +
      '<section class="sec"><div class="wrap"><h2>من البذرة إلى الحصاد</h2><div class="gal">' +
      [['story-1-choose', 'تختار بذورك'], ['story-2-prepare', 'تجهّز المكان'], ['story-3-sow', 'تزرع في موسمها'],
       ['story-4-water', 'تسقي وتتابع'], ['story-5-prune', 'تقلّم وتحمي'], ['story-6-harvest', 'تحصد وتخزّن']].map(function (x) {
        return '<figure><img src="' + IMG + x[0] + '.jpg" alt="' + x[1] + '" loading="lazy"><figcaption>' + x[1] + '</figcaption></figure>';
      }).join('') + '</div></div></section>' +
      '<section class="iwt rev"><img src="' + IMG + 'box-hero.jpg" alt="بوكس بذور"><div class="txt"><h2>كوّن بوكسك بنفسك</h2>' +
      '<p>اختر بذورك في بوكس واحد بسعر أقل.</p><a class="btn" href="' + cUrl('باقات التوفير') + '">كوّن بوكسك</a></div></section>' +
      row('بذور زهور', 'بذور زهور', 5) + row('معدات', 'المعدات ومستلزمات الحصاد', 5) +
      '<section class="sec"><div class="wrap"><h2>آراء عملائنا</h2><div class="revs">' +
      '<div class="rv"><b>مريم عاطف</b><span class="st">★★★★★</span><p>بصراحة نباتك فاجأني بالجودة والتنوع… كل شي احتجته لقيته عندهم.</p></div>' +
      '<div class="rv"><b>شادن احمد</b><span class="st">★★★★★</span><p>تسلمو ماتوقعت توصلني بالجودة هاذي ماقصرتو.</p></div>' +
      '<div class="rv"><b>ميرال احمد</b><span class="st">★★★★★</span><p>من افضل المتاجر اللي تعاملنا معهم.</p></div>' +
      '</div></div></section>' +
      '<section class="desc"><h2 style="color:var(--brand);margin:0 0 8px">نباتك</h2><p>متجر نباتك لبذور الخضار والزهور التركية والهندية بعبوات للمنزل والمزارع، مع مقصات التقليم وأكياس تخزين المحصول، وتوصيل لجميع مناطق السعودية.</p></section>';
  }
  function row(cat, title, n) {
    return '<section class="sec"><div class="wrap"><div class="head"><h2>' + title + '</h2><a href="' + cUrl(cat) + '">عرض الكل ←</a></div>' +
      '<div class="plist">' + inCat(cat).slice(0, n).map(card).join('') + '</div></div></section>';
  }

  function category() {
    var c = qs.get('c'), q = (qs.get('q') || '').trim(), sort = qs.get('sort') || '';
    var list = c ? inCat(c) : C.slice();
    var title = c ? (CATS.filter(function (x) { return x[0] === c; })[0] || [c, c])[1] : 'جميع المنتجات';
    if (q) { list = list.filter(function (p) { return p.name.indexOf(q) >= 0; }); title = 'نتائج البحث: «' + esc(q) + '»'; }
    if (sort === 'low') list.sort(function (a, b) { return priceOf(a) - priceOf(b); });
    if (sort === 'high') list.sort(function (a, b) { return priceOf(b) - priceOf(a); });
    document.title = title.replace(/<[^>]+>/g, '') + ' | نباتك';
    return '<div class="wrap"><p class="crumb"><a href="index.html">الرئيسية</a> › ' + title + '</p>' +
      '<div class="cathead"><h1>' + title + ' <small style="font-size:15px;color:var(--soft)">(' + list.length + ' منتج)</small></h1>' +
      '<select id="sort" aria-label="ترتيب"><option value="">الترتيب الافتراضي</option><option value="low"' + (sort === 'low' ? ' selected' : '') + '>السعر: من الأقل</option><option value="high"' + (sort === 'high' ? ' selected' : '') + '>السعر: من الأعلى</option></select></div>' +
      (list.length ? '<div class="plist">' + list.map(card).join('') + '</div>' : '<p class="empty">لا توجد منتجات مطابقة. جرّب «<a href="finder.html">ما نباتك؟</a>».</p>') +
      '</div><div style="height:40px"></div>';
  }

  function product() {
    var p = byId(qs.get('id')) || C[0];
    document.title = p.name + ' | نباتك';
    var cat = p.categories[0] || '';
    var catName = (CATS.filter(function (x) { return x[0] === cat; })[0] || [cat, cat])[1];
    var monthly = (priceOf(p) / 12).toFixed(2);
    var related = inCat(cat).filter(function (x) { return x.id !== p.id; }).slice(0, 3);
    var tools = C.filter(function (x) { return /مقص تقليم صغير|5 كيلو|كون بوكسك/.test(x.name); }).slice(0, 3);
    var isSeed = /بذور/.test(cat);
    return '<div class="wrap"><p class="crumb"><a href="index.html">الرئيسية</a> › <a href="' + cUrl(cat) + '">' + catName + '</a> › ' + esc(p.name) + '</p>' +
      '<div class="pdp"><div class="gallery"><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '"></div><div>' +
      '<p class="cat">' + catName + '</p><h1>' + esc(p.name) + '</h1>' +
      '<div class="price">' + sar(priceOf(p)) + (p.sale_price && Number(p.sale_price) < Number(p.price) ? '<s>' + sar(p.price) + '</s>' : '') + '</div>' +
      '<div class="qty"><button type="button" data-q="1" aria-label="زيادة">+</button><span id="qty">1</span><button type="button" data-q="-1" aria-label="إنقاص">−</button></div>' +
      (isSeed ? '<div class="agri"><b>معلومات الزراعة:</b> الموسم المناسب لمنطقتك، المسافة بين النباتات، والأيام حتى الحصاد.<br><small style="color:var(--soft)">تُضاف لكل صنف بعد اعتماد المهندس الزراعي.</small></div>' : '') +
      '<button class="atc" data-addq="' + p.id + '">🛒 أضف للسلة</button>' +
      '<div class="bnpl"><span>ابتداءً من ' + monthly + ' ر.س/شهر على ما يصل إلى 12 دفعة شهرية، متوافق مع أحكام الشريعة.</span><em>tabby</em></div>' +
      '<p style="margin-top:16px">' + esc(p.name) + ' من متجر نباتك، ' + (isSeed ? 'بذور أصلية مع اسم الصنف على كل عبوة.' : 'من مستلزمات الزراعة والحصاد.') + ' توصيل لجميع مناطق المملكة خلال أسبوع كحد أقصى.</p>' +
      '<p style="font-weight:600;margin:18px 0 8px">تحتاجه معها</p><div class="also">' + tools.filter(function (x) { return x.id !== p.id; }).map(card).join('') + '</div>' +
      '</div></div>' +
      (related.length ? '<section class="sec" style="padding-top:0"><h2>منتجات من نفس القسم</h2><div class="plist">' + related.map(card).join('') + '</div></section>' : '') +
      '</div><div class="sticky-atc"><strong>' + sar(priceOf(p)) + '</strong><button class="atc" data-addq="' + p.id + '">أضف للسلة</button></div>';
  }

  function finder() {
    return '<div class="wrap pghead"><p class="crumb" style="padding:0"><a href="index.html">الرئيسية</a> › ما نباتك؟</p>' +
      '<h1>ما نباتك؟</h1><p>أجب عن ثلاثة أسئلة ونرشّح لك من منتجات المتجر المتوفرة.</p></div><div id="nb-finder" data-manual="1"></div><div style="height:30px"></div>';
  }

  var FREE = 150; // illustrative free-shipping threshold until the store sets one
  function cart() {
    var c = load(), ids = Object.keys(c).filter(byId), sub = ids.reduce(function (s, id) { return s + priceOf(byId(id)) * c[id]; }, 0);
    if (!ids.length) return '<div class="wrap"><p class="crumb"><a href="index.html">الرئيسية</a> › السلة</p><div class="empty"><p style="font-size:20px">سلة التسوق فارغة</p><a class="btn" href="category.html">متابعة التسوق</a> <a class="btn ghost" href="finder.html">ساعدني أختار</a></div></div>';
    var left = Math.max(0, FREE - sub);
    return '<div class="wrap"><p class="crumb"><a href="index.html">الرئيسية</a> › السلة</p><div class="cart"><div>' +
      '<div class="ship"><b>' + (left > 0 ? 'أضف ' + sar(left) + ' للحصول على شحن مجاني' : 'طلبك مؤهل للشحن المجاني') + '</b>' +
      '<div class="bar"><i style="width:' + Math.min(100, sub / FREE * 100) + '%"></i></div><small style="color:var(--soft)">حد الشحن المجاني هنا قيمة توضيحية.</small></div>' +
      '<ul class="cl">' + ids.map(function (id) {
        var p = byId(id);
        return '<li><img src="' + esc(p.img) + '" alt=""><div class="nm"><a href="' + pUrl(p) + '">' + esc(p.name) + '</a><br><small>' + c[id] + ' × ' + sar(priceOf(p)) + '</small></div>' +
          '<strong>' + sar(priceOf(p) * c[id]) + '</strong><button class="rm" data-rm="' + id + '">حذف</button></li>';
      }).join('') + '</ul></div>' +
      '<aside class="sum"><div class="line"><span>المجموع الفرعي</span><span>' + sar(sub) + '</span></div>' +
      '<div class="line"><span>الشحن</span><span>' + (left > 0 ? 'يُحسب عند الدفع' : 'مجاني') + '</span></div>' +
      '<div class="line tot"><span>الإجمالي</span><span>' + sar(sub) + '</span></div>' +
      '<a class="btn" style="display:block;text-align:center;margin-top:12px" href="https://nabatak.sa/">أكمل الطلب على nabatak.sa</a>' +
      '<p class="demo-note">هذه نسخة تصميمية؛ السلة هنا للعرض فقط ولا تنتقل إلى المتجر. الأسعار تشمل الضريبة.</p></aside></div></div>';
  }

  /* ---------- boot ---------- */
  var main = { home: home, category: category, product: product, finder: finder, cart: cart }[page] || home;
  document.getElementById('top').innerHTML = header();
  document.getElementById('main').innerHTML = main();
  document.getElementById('bottom').innerHTML = footer();
  if (page === 'product') document.body.classList.add('pdp-page');
  badge();

  if (page === 'finder' && window.NabatakFinder) {
    NabatakFinder.mount(document.getElementById('nb-finder'), {
      catalogue: C,
      onAdd: function (items) { items.forEach(function (x) { add(x.p.id, 1); }); toast('أُضيفت ' + items.length + ' منتجات إلى السلة'); }
    });
  }
  var qty = 1;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.add[data-add],[data-addq],[data-q],[data-rm]'); if (!b) return;
    if (b.dataset.add) { add(b.dataset.add, 1); b.textContent = 'أُضيف ✓'; b.classList.add('done'); toast('أُضيف إلى السلة'); }
    if (b.dataset.addq) { add(b.dataset.addq, qty); toast('أُضيف ' + qty + ' إلى السلة'); }
    if (b.dataset.q) { qty = Math.max(1, qty + Number(b.dataset.q)); document.getElementById('qty').textContent = qty; }
    if (b.dataset.rm) { var c = load(); delete c[b.dataset.rm]; save(c); document.getElementById('main').innerHTML = cart(); }
  });
  var s = document.getElementById('sort');
  if (s) s.addEventListener('change', function () { qs.set('sort', s.value); location.search = qs.toString(); });
})();
