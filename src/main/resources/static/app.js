const $ = s => document.querySelector(s);
const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICON = { gaming: '🎮', fashion: '👗', rumah: '🏠', pc: '💻' };
const st = { cat: 'semua', sort: 'relevan', q: '', cats: [], all: [], cart: [], wish: [], token: localStorage.getItem('tk'), user: JSON.parse(localStorage.getItem('us') || 'null') };
const demoCats = [
  { id: 1, nama: 'Gaming', slug: 'gaming' },
  { id: 2, nama: 'Fashion', slug: 'fashion' },
  { id: 3, nama: 'Dapur & Rumah', slug: 'rumah' },
  { id: 4, nama: 'PC & Laptop', slug: 'pc' }
];
const demoProducts = [
  { id: 1, nama: 'Headset Gaming Pro Surround 7.1 RGB LED', kategori: demoCats[0], harga: 349000, hargaAsli: 499000, stok: 34, rating: 4.9, ulasan: 1284, gratisOngkir: false, ikon: '🎧', deskripsi: 'Headset gaming surround 7.1 dengan pencahayaan RGB.' },
  { id: 2, nama: 'Keyboard Mekanikal Wireless 75%', kategori: demoCats[0], harga: 685000, hargaAsli: 850000, stok: 19, rating: 4.8, ulasan: 842, gratisOngkir: true, ikon: '⌨️', deskripsi: 'Keyboard mekanikal wireless hot-swap.' },
  { id: 3, nama: 'Mouse Gaming Ultralight Wireless', kategori: demoCats[0], harga: 425000, hargaAsli: 550000, stok: 27, rating: 4.9, ulasan: 815, gratisOngkir: false, ikon: '🖱️', deskripsi: 'Mouse gaming ultralight hingga 26000 DPI.' },
  { id: 4, nama: 'Celana Jeans Slim Fit Premium Denim', kategori: demoCats[1], harga: 189000, hargaAsli: 259000, stok: 60, rating: 4.6, ulasan: 530, gratisOngkir: true, ikon: '👖', deskripsi: 'Celana jeans slim fit premium.' },
  { id: 5, nama: 'Sepatu Kasual Pria Kulit Sneakers', kategori: demoCats[1], harga: 275000, hargaAsli: 399000, stok: 25, rating: 4.7, ulasan: 412, gratisOngkir: true, ikon: '👟', deskripsi: 'Sepatu kasual pria berbahan kulit.' },
  { id: 6, nama: 'Tas Selempang Wanita Merah Elegan', kategori: demoCats[1], harga: 215000, hargaAsli: 320000, stok: 15, rating: 4.8, ulasan: 190, gratisOngkir: false, ikon: '👜', deskripsi: 'Tas selempang elegan untuk aktivitas harian.' },
  { id: 7, nama: 'Set Peralatan Makan Keramik 12 Pcs', kategori: demoCats[2], harga: 289000, hargaAsli: 380000, stok: 40, rating: 4.8, ulasan: 276, gratisOngkir: true, ikon: '🍽️', deskripsi: 'Set alat makan keramik 12 buah.' },
  { id: 8, nama: 'Lampu Meja LED Minimalis Dimmable', kategori: demoCats[2], harga: 129000, hargaAsli: 175000, stok: 55, rating: 4.6, ulasan: 233, gratisOngkir: false, ikon: '💡', deskripsi: 'Lampu meja LED minimalis dengan pengatur kecerahan.' },
  { id: 9, nama: 'Panci Anti Lengket Set 5 Pcs', kategori: demoCats[2], harga: 399000, hargaAsli: 520000, stok: 22, rating: 4.7, ulasan: 178, gratisOngkir: true, ikon: '🍳', deskripsi: 'Set panci anti lengket lima buah.' },
  { id: 10, nama: 'PC Rakitan RGB & Laptop Kreator Ryzen 7', kategori: demoCats[3], harga: 12900000, hargaAsli: 15500000, stok: 4, rating: 4.9, ulasan: 64, gratisOngkir: true, ikon: '🖥️', deskripsi: 'PC rakitan RGB dan laptop untuk kreator.' }
];
const wishIds = () => new Set(st.wish.map(w => w.produk.id));
const tint = p => 't' + (Math.max(0, st.cats.findIndex(c => p.kategori && c.slug === p.kategori.slug)) % 4);
const disc = p => p.hargaAsli > p.harga ? Math.round(100 - p.harga * 100 / p.hargaAsli) : 0;

async function api(path, method = 'GET', body) {
  const r = await fetch('/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(st.token ? { Authorization: 'Bearer ' + st.token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.pesan || d.message || 'Terjadi kesalahan');
  return d;
}
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2300); }
const openM = h => {
  $('#ov').classList.remove('receipt-overlay');
  $('#box').classList.remove('checkout-box', 'receipt-box');
  $('#box').innerHTML = h;
  $('#ov').classList.add('on');
};
const closeM = () => {
  $('#ov').classList.remove('on', 'receipt-overlay');
  $('#box').classList.remove('checkout-box', 'receipt-box');
};
const openCart = () => { renderCart(); $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); };
const closeCart = () => { $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); };
$('#ov').onclick = e => { if (e.target.id === 'ov') closeM(); };
const need = () => { if (!st.token) { loginM(); return false; } return true; };

// ---------- Tema ----------
function setTheme(t) { document.documentElement.dataset.theme = t; localStorage.setItem('th', t); $('#bTheme').textContent = t === 'dark' ? '☀️' : '🌙'; }
setTheme(localStorage.getItem('th') || 'light');
$('#bTheme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

// ---------- Hero ----------
const HERO = [
  { tag: '🚚 GRATIS ONGKIR SE-INDONESIA', a: 'Gaya Lokal', b: 'Terkini', p: 'Denim premium, atasan kasual, tas & sepatu tren terbaru — tampil percaya diri setiap hari.', btn: 'Belanja Fashion', k: 'fashion', g: 'linear-gradient(120deg,#2a1b7a,#6d4aff 60%,#ff6b4a)', e: [['👟', 'Sneakers'], ['👜', 'Tas Elegan'], ['👖', 'Denim']] },
  { tag: '🏠 PROMO RUMAH TANGGA', a: 'Dapur Cantik', b: 'Harga Hemat', p: 'Peralatan masak estetik & alat makan modern berkualitas, semuanya di bawah Rp 500.000.', btn: 'Belanja Dapur', k: 'rumah', g: 'linear-gradient(120deg,#0b6e75,#0fb5a0 60%,#ffb347)', e: [['🍳', 'Panci Set'], ['🍽️', 'Alat Makan'], ['💡', 'Lampu']] },
  { tag: '🎮 STOK TERBATAS', a: 'Gear Gaming', b: 'Level Berikutnya', p: 'Headset surround, keyboard hot-swap, mouse ultralight, hingga PC rakitan RGB untuk kreator.', btn: 'Lihat Gaming', k: 'gaming', g: 'linear-gradient(120deg,#14123a,#3b2aa8 55%,#ff3b8f)', e: [['🎧', 'Headset'], ['⌨️', 'Keyboard'], ['🖱️', 'Mouse']] }
];
let hi = 0, ht;
function renderHero(i) {
  hi = (i + HERO.length) % HERO.length; const h = HERO[hi];
  $('#hero').innerHTML = `<div class="hs" style="background:${h.g}"><div class="tx"><span class="tg">${h.tag}</span><h1>${h.a} <span>${h.b}</span></h1><p>${h.p}</p>
    <button class="btn" data-act="cat" data-id="${h.k}">${h.btn} →</button><button class="btn g" data-act="cat" data-id="semua">Semua Produk</button></div>
    <div class="fl">${h.e.map(x => `<div class="fc"><em>${x[0]}</em><small>${x[1]}</small></div>`).join('')}</div></div>
    <div class="dots">${HERO.map((_, k) => `<i class="${k === hi ? 'on' : ''}" data-act="slide" data-id="${k}"></i>`).join('')}</div>`;
  clearTimeout(ht); ht = setTimeout(() => renderHero(hi + 1), 5500);
}

// ---------- Kategori, flash sale, produk ----------
function renderPills() {
  $('#pills').innerHTML = [{ nama: '✨ Semua', slug: 'semua' }, ...st.cats.map(c => ({ nama: (ICON[c.slug] || '🛍️') + ' ' + c.nama, slug: c.slug }))]
    .map(c => `<button class="pl ${st.cat === c.slug ? 'on' : ''}" data-act="cat" data-id="${c.slug}">${esc(c.nama)}</button>`).join('');
}
function renderCats() {
  $('#cats').innerHTML = st.cats.map((c, i) => `<button class="ct c${i % 4}" data-act="cat" data-id="${c.slug}"><b>${esc(c.nama)}</b><small>${st.all.filter(p => p.kategori && p.kategori.slug === c.slug).length} produk</small><em>${ICON[c.slug] || '🛍️'}</em></button>`).join('');
}
function renderFlash() {
  $('#flash').innerHTML = st.all.slice(0, 4).map(p => `<div class="fi" data-act="detail" data-id="${p.id}"><div class="e">${p.ikon || '📦'}</div><h4>${esc(p.nama)}</h4><b>${rp(p.harga)}</b><s>${rp(p.hargaAsli)}</s></div>`).join('');
}
setInterval(() => {
  const n = new Date(), e = new Date(n); e.setHours(23, 59, 59, 999); let s = Math.floor((e - n) / 1000);
  const f = [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(x => String(x).padStart(2, '0'));
  $('#cd').innerHTML = f.map(x => `<span>${x}</span>`).join(':');
}, 1000);

function card(p) {
  const d = disc(p), w = wishIds().has(p.id), pct = Math.min(100, Math.round(p.stok / 60 * 100));
  return `<article class="p"><div class="im ${tint(p)}" data-act="detail" data-id="${p.id}">${p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="">` : (p.ikon || '📦')}
    ${d ? `<span class="dc">-${d}%</span>` : ''}<button class="hr ${w ? 'on' : ''}" data-act="wish" data-id="${p.id}">${w ? '♥' : '♡'}</button><span class="kt">${esc(p.kategori ? p.kategori.nama : '')}</span></div>
    <div class="pb"><h4>${esc(p.nama)}</h4><div class="rt"><b>★ ${p.rating}</b> · ${p.ulasan.toLocaleString('id-ID')} ulasan</div>
    <div class="pr"><b>${rp(p.harga)}</b>${d ? `<s>${rp(p.hargaAsli)}</s>` : ''}</div>
    <div class="stk"><i style="width:${pct}%"></i></div><div class="sm"><span>Stok ${p.stok}</span><span class="ok">${p.gratisOngkir ? '🚚 Gratis Ongkir' : 'Siap Kirim'}</span></div>
    <button class="add" data-act="add" data-id="${p.id}" ${p.stok < 1 ? 'disabled' : ''}>${p.stok < 1 ? 'Stok Habis' : '+ Tambah ke Keranjang'}</button></div></article>`;
}
async function loadProducts() {
  let ps;
  try {
    ps = await api(`/products?kategori=${st.cat}&q=${encodeURIComponent(st.q)}&sort=${st.sort}`);
  } catch {
    ps = demoProducts.filter(p => (st.cat === 'semua' || p.kategori.slug === st.cat) &&
      (!st.q || p.nama.toLowerCase().includes(st.q.toLowerCase())));
  }
  if (st.sort === 'termurah') ps.sort((a, b) => a.harga - b.harga);
  if (st.sort === 'termahal') ps.sort((a, b) => b.harga - a.harga);
  if (st.sort === 'rating') ps.sort((a, b) => b.rating - a.rating);
  if (st.sort === 'diskon') ps.sort((a, b) => disc(b) - disc(a));
  $('#sub').textContent = `${ps.length} produk bergaransi resmi`;
  $('#grid').innerHTML = ps.map(card).join('') || '<div class="empty"><span>🔍</span>Produk tidak ditemukan</div>';
}
function setCat(k) { st.cat = k; renderPills(); loadProducts(); $('#rekom').scrollIntoView(); }

// ---------- Akun ----------
function renderAcc() { $('#hi').textContent = st.user ? st.user.nama.split(' ')[0] : 'Masuk'; $('#cn').textContent = st.cart.reduce((a, c) => a + c.qty, 0); $('#wn').textContent = st.wish.length; }
function loginM(reg) {
  openM(`<h3>${reg ? '✨ Buat Akun Baru' : '👋 Selamat Datang'}</h3>${reg ? '<input id="fn" placeholder="Nama lengkap">' : ''}<input id="fe" placeholder="Email"><input id="fp" type="password" placeholder="Password (min. 6 karakter)">
    <button class="btn p1 full" data-act="auth" data-id="${reg ? 1 : 0}">${reg ? 'Daftar' : 'Masuk'}</button>
    <p style="text-align:center;font-size:13px;color:var(--mu)">${reg ? 'Sudah punya akun?' : 'Belum punya akun?'} <a href="#" style="color:var(--pri);font-weight:700" data-act="swap" data-id="${reg ? 0 : 1}">${reg ? 'Masuk' : 'Daftar'}</a></p>`);
}
async function syncUser() {
  if (!st.token) return renderAcc();
  try { [st.cart, st.wish] = await Promise.all([api('/cart'), api('/wishlist')]); }
  catch { localStorage.removeItem('tk'); localStorage.removeItem('us'); st.token = null; st.user = null; }
  renderAcc();
}

function addProductM() {
  openM(`<h3>Tambah Produk Baru</h3>
    <div class="pf">
      <input id="pn" placeholder="Nama produk" required>
      <select id="pc">${st.cats.map(c => `<option value="${c.id}">${esc(c.nama)}</option>`).join('')}</select>
      <input id="pp" type="number" min="1" placeholder="Harga jual" required>
      <input id="po" type="number" min="1" placeholder="Harga sebelum diskon" required>
      <input id="ps" type="number" min="0" placeholder="Stok" required>
      <input id="pi" placeholder="Emoji ikon (contoh: 📷)">
      <input id="pu" placeholder="URL gambar (opsional)">
    </div>
    <textarea id="pd" rows="3" placeholder="Deskripsi produk"></textarea>
    <label class="check"><input id="pfree" type="checkbox"> Gratis ongkir</label>
    <button class="btn p1 full" data-act="saveProduct">Simpan Produk</button>`);
}

// ---------- Keranjang ----------
const ongkir = () => st.cart.length && st.cart.some(c => !c.produk.gratisOngkir) ? 15000 : 0;
function renderCart() {
  const sub = st.cart.reduce((a, c) => a + c.qty * c.produk.harga, 0);
  $('#dBody').innerHTML = st.cart.map(c => `<div class="ci"><div class="e">${c.produk.ikon || '📦'}</div><div><h5>${esc(c.produk.nama)}</h5><b>${rp(c.produk.harga)}</b>
    <div class="qt"><button data-act="qty" data-id="${c.id}" data-n="${c.qty - 1}">−</button><span>${c.qty}</span><button data-act="qty" data-id="${c.id}" data-n="${c.qty + 1}">+</button></div></div></div>`).join('')
    || '<div class="empty"><span>🛒</span>Keranjangmu masih kosong</div>';
  $('#dFoot').innerHTML = st.cart.length ? `<div class="rw"><span>Subtotal</span><span>${rp(sub)}</span></div><div class="rw"><span>Ongkir</span><span>${ongkir() ? rp(ongkir()) : 'GRATIS'}</span></div>
    <div class="rw t"><span>Total</span><span>${rp(sub + ongkir())}</span></div><button class="btn p1 full" data-act="checkout">Lanjut ke Pembayaran →</button>` : '';
}
function checkoutM() {
  closeCart();
  const subtotal = st.cart.reduce((a, c) => a + c.qty * c.produk.harga, 0);
  const shipping = ongkir();
  const total = subtotal + shipping;
  const itemCount = st.cart.reduce((a, c) => a + c.qty, 0);
  openM(`<div class="checkout-header"><span class="checkout-eyebrow">🔒 TRANSAKSI AMAN</span><h3>Checkout Aman BelanjaKu</h3><p>Periksa alamat, pengiriman, dan pembayaran sebelum membuat pesanan.</p></div>
    <form id="checkoutForm" class="checkout-layout">
      <div class="checkout-main">
        <section class="checkout-section">
          <div class="checkout-section-title"><span>01</span><div><h4>Alamat Pengiriman</h4><small>Pastikan data penerima sudah benar</small></div></div>
          <div class="checkout-fields">
            <label class="checkout-field">Nama Penerima<input id="recipientName" name="namaPenerima" autocomplete="name" maxlength="120" placeholder="Nama lengkap penerima" required></label>
            <label class="checkout-field">Nomor HP / WhatsApp<input id="recipientPhone" name="nomorHp" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" pattern="(?=.*[0-9])[0-9+() -]{8,24}" title="Masukkan 8–24 karakter angka dan tanda +, -, atau kurung." placeholder="Contoh: 081234567890" required></label>
            <label class="checkout-field">Kota Tujuan<input id="destinationCity" name="kotaTujuan" autocomplete="address-level2" maxlength="120" placeholder="Kota atau kabupaten" required></label>
            <label class="checkout-field checkout-field-wide">Alamat Lengkap<textarea id="fullAddress" name="alamatLengkap" autocomplete="street-address" rows="3" maxlength="1000" placeholder="Jalan, nomor rumah, kecamatan" required></textarea></label>
          </div>
        </section>

        <section class="checkout-section">
          <div class="checkout-section-title"><span>02</span><div><h4>Pilih Jasa Pengiriman</h4><small>Estimasi dihitung sejak pesanan diproses</small></div></div>
          <div class="checkout-choice-grid courier-grid">
            <label class="checkout-choice"><input type="radio" name="jasaPengiriman" value="JNE_REGULER" required checked><span class="choice-mark">JNE</span><span class="choice-copy"><strong>JNE Reguler</strong><small>Estimasi 2-3 hari</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice"><input type="radio" name="jasaPengiriman" value="JNT_EXPRESS" required><span class="choice-mark">J&T</span><span class="choice-copy"><strong>J&T Express</strong><small>Estimasi 1-2 hari</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice"><input type="radio" name="jasaPengiriman" value="SICEPAT_BEST" required><span class="choice-mark">SiCepat</span><span class="choice-copy"><strong>SiCepat BEST</strong><small>Estimasi 1-2 hari</small></span><span class="choice-check"></span></label>
          </div>
        </section>

        <section class="checkout-section">
          <div class="checkout-section-title"><span>03</span><div><h4>Metode Pembayaran</h4><small>Pilih satu metode pembayaran</small></div></div>
          <div class="payment-group"><h5>Transfer Bank Virtual Account</h5><div class="checkout-choice-grid payment-grid">
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="VA_BCA" required checked><span class="choice-copy"><strong>BCA</strong><small>Virtual Account</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="VA_MANDIRI" required><span class="choice-copy"><strong>Mandiri</strong><small>Virtual Account</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="VA_BNI" required><span class="choice-copy"><strong>BNI</strong><small>Virtual Account</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="VA_BRI" required><span class="choice-copy"><strong>BRI</strong><small>Virtual Account</small></span><span class="choice-check"></span></label>
          </div></div>
          <div class="payment-group"><h5>QRIS &amp; Dompet Digital</h5><div class="checkout-choice-grid payment-grid">
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="QRIS" required><span class="choice-copy"><strong>QRIS</strong><small>Scan untuk membayar</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="GOPAY" required><span class="choice-copy"><strong>GoPay</strong><small>Dompet digital</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="OVO" required><span class="choice-copy"><strong>OVO</strong><small>Dompet digital</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="DANA" required><span class="choice-copy"><strong>DANA</strong><small>Dompet digital</small></span><span class="choice-check"></span></label>
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="SHOPEEPAY" required><span class="choice-copy"><strong>ShopeePay</strong><small>Dompet digital</small></span><span class="choice-check"></span></label>
          </div></div>
          <div class="payment-group"><h5>Bayar di Tempat</h5><div class="checkout-choice-grid payment-grid">
            <label class="checkout-choice payment-choice"><input type="radio" name="metodeBayar" value="COD" required><span class="choice-copy"><strong>COD</strong><small>Bayar saat pesanan diterima</small></span><span class="choice-check"></span></label>
          </div></div>
          <p class="payment-note">Pilihan ini dicatat pada pesanan. Pembayaran tidak dianggap lunas sebelum diverifikasi.</p>
        </section>
      </div>

      <aside class="checkout-summary">
        <h4>Ringkasan Pesanan</h4><p class="summary-items">${itemCount} barang dari keranjang Anda</p>
        <div class="summary-row"><span>Total harga barang</span><strong>${rp(subtotal)}</strong></div>
        <div class="summary-row"><span>Ongkos kirim</span><strong>${shipping === 0 ? 'GRATIS (Rp0)' : rp(shipping)}</strong></div>
        <div class="summary-rule"></div>
        <div class="summary-total"><span>Total tagihan</span><strong>${rp(total)}</strong></div>
        <p class="shipping-policy">${shipping === 0 ? 'Semua barang di keranjang memenuhi gratis ongkir.' : 'Tarif ongkir tetap Rp15.000. Gratis ongkir berlaku jika semua barang memenuhi program gratis ongkir.'}</p>
        <button class="btn p1 full checkout-submit" type="button" data-act="place">Buat Pesanan Sekarang</button>
        <p class="checkout-footnote">Harga dan stok akhir diverifikasi kembali oleh server.</p>
      </aside>
    </form>`);
  $('#box').classList.add('checkout-box');
}

// ---------- Pesanan & wishlist ----------
async function receiptM(id) {
  const o = await api('/orders/' + encodeURIComponent(id));
  const items = Array.isArray(o.items) ? o.items : [];
  const subtotal = Number(o.subtotal) || 0;
  const discount = Number(o.diskon) || 0;
  const shipping = Number(o.ongkir) || 0;
  const totalGoods = subtotal + discount;
  const transactionDate = o.tanggal ? new Date(o.tanggal) : null;
  const dateText = transactionDate && !Number.isNaN(transactionDate.getTime())
    ? transactionDate.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
    : (o.tanggal || '-');
  const paymentStatus = o.statusPembayaran === 'BELUM_DIBAYAR'
    ? 'Belum Dibayar'
    : o.statusPembayaran === 'MENUNGGU_PEMBAYARAN'
      ? 'Menunggu Pembayaran'
      : (o.statusPembayaran || 'Menunggu Pembayaran');
  const productRows = items.map(item => {
    const quantity = Number(item.qty) || 0;
    const price = Number(item.harga) || 0;
    const originalPrice = Number(item.hargaAsli) || price;
    return `<div class="receipt-product">
      <div class="receipt-product-image">${item.imageUrl ? `<img src="${esc(item.imageUrl)}" alt="${esc(item.namaProduk)}">` : '<span>📦</span>'}</div>
      <div class="receipt-product-info"><strong>${esc(item.namaProduk)}</strong>
        <span>${rp(price)} × ${quantity}${originalPrice > price ? ` · Harga normal ${rp(originalPrice)}` : ''}</span></div>
      <strong class="receipt-line-total">${rp(price * quantity)}</strong>
    </div>`;
  }).join('');

  openM(`<div class="receipt-view">
    <article class="receipt-paper">
      <header class="receipt-header">
        <div class="receipt-logo"><span class="receipt-mark">B</span><span>Belanja<b>Ku</b></span></div>
        <p>STRUK PEMBELIAN</p>
        <div class="receipt-number">No. Pesanan <strong>BK-${String(o.id).padStart(8, '0')}</strong></div>
        <div class="receipt-status"><span>${esc(o.status || '-')}</span><time>${esc(dateText)}</time></div>
      </header>

      <section class="receipt-section">
        <h4>Informasi Pelanggan</h4>
        <div class="receipt-customer"><strong>${esc(o.namaPenerima || '-')}</strong><span>${esc(o.nomorHp || '-')}</span>
          <span>${esc(o.kotaTujuan || '-')}</span><span>${esc(o.alamatLengkap || o.alamat || '-')}</span></div>
      </section>

      <section class="receipt-section">
        <h4>Rincian Produk</h4>
        <div class="receipt-products">${productRows || '<p class="receipt-muted">Rincian produk tidak tersedia.</p>'}</div>
      </section>

      <section class="receipt-shipping">
        <div><small>Jasa pengiriman</small><strong>${esc(o.jasaPengiriman || '-')}</strong></div>
        <div><small>Estimasi</small><strong>${esc(o.estimasiPengiriman || '-')}</strong></div>
      </section>

      <section class="receipt-section receipt-payment">
        <h4>Informasi Pembayaran</h4>
        <div><span>Metode</span><strong>${esc(o.metodeBayar || '-')}</strong></div>
        <div><span>Status pembayaran</span><strong>${esc(paymentStatus)}</strong></div>
      </section>

      <section class="receipt-totals">
        <div><span>Total harga barang</span><strong>${rp(totalGoods)}</strong></div>
        <div><span>Diskon</span><strong>${discount ? `−${rp(discount)}` : '—'}</strong></div>
        <div><span>Ongkos kirim</span><strong>${shipping === 0 ? 'GRATIS (Rp0)' : rp(shipping)}</strong></div>
        <div class="receipt-grand-total"><span>Total tagihan</span><strong>${rp(o.total)}</strong></div>
      </section>
      <footer class="receipt-footer">Terima kasih telah berbelanja di BelanjaKu.</footer>
    </article>
    <div class="receipt-actions">
      <button class="btn p1" data-act="printReceipt">Cetak Struk</button>
      <button class="btn receipt-secondary" data-act="printReceipt">Simpan sebagai PDF</button>
      <button class="btn receipt-secondary" data-act="home">Kembali ke Beranda</button>
      <button class="btn receipt-secondary" data-act="history">Lihat Riwayat Pesanan</button>
    </div>
  </div>`);
  $('#ov').classList.add('receipt-overlay');
  $('#box').classList.add('receipt-box');
}

async function ordersM() {
  const os = await api('/orders');
  openM(`<h3>📦 Pesanan & Pengembalian</h3>${os.map(o => `<div class="od"><div class="hd2"><b>#${o.id} · ${o.tanggal.slice(0, 10)}</b><span class="st ${o.status}">${o.status}</span></div>
    ${o.items.map(i => `${i.qty}× ${esc(i.namaProduk)}`).join('<br>')}<div style="margin-top:6px"><b>${rp(o.total)}</b></div>
    ${o.namaPenerima ? `<div class="order-meta"><b>Penerima:</b> ${esc(o.namaPenerima)} · ${esc(o.nomorHp || '')}</div>` : ''}
    ${o.kotaTujuan ? `<div class="order-meta"><b>Tujuan:</b> ${esc(o.kotaTujuan)}${o.alamatLengkap ? ` · ${esc(o.alamatLengkap)}` : ''}</div>` : ''}
    ${o.jasaPengiriman ? `<div class="order-meta"><b>Kurir:</b> ${esc(o.jasaPengiriman)}${o.estimasiPengiriman ? ` · ${esc(o.estimasiPengiriman)}` : ''}</div>` : ''}
    ${o.metodeBayar ? `<div class="order-meta"><b>Pembayaran:</b> ${esc(o.metodeBayar)} · ${esc(o.statusPembayaran || 'Menunggu Pembayaran')}</div>` : ''}
    <div class="order-meta">Barang ${rp(o.subtotal)} · Ongkir ${o.ongkir === 0 ? 'GRATIS (Rp0)' : rp(o.ongkir)}</div>
    <button class="sm2" data-act="receipt" data-id="${o.id}">Lihat Struk</button>
    ${o.status === 'DIKEMAS' ? `<button class="sm2" data-act="cancel" data-id="${o.id}">Batalkan</button>` : ''}${o.status === 'SELESAI' ? `<button class="sm2" data-act="ret" data-id="${o.id}">Ajukan Pengembalian</button>` : ''}</div>`).join('') || '<div class="empty"><span>📭</span>Belum ada pesanan</div>'}`);
}
function wishM() {
  openM(`<h3>♥ Daftar Keinginan</h3>${st.wish.map(w => `<div class="ci"><div class="e">${w.produk.ikon || '📦'}</div><div><h5>${esc(w.produk.nama)}</h5><b>${rp(w.produk.harga)}</b>
    <div class="qt"><button class="add" style="padding:5px 12px" data-act="add" data-id="${w.produk.id}">+ Keranjang</button><button data-act="wish" data-id="${w.produk.id}">✕</button></div></div></div>`).join('') || '<div class="empty"><span>💜</span>Belum ada produk favorit</div>'}`);
}
async function detailM(id) {
  const p = await api('/products/' + id), d = disc(p);
  openM(`<div class="im ${tint(p)}" style="border-radius:20px;height:180px">${p.imageUrl ? `<img src="${esc(p.imageUrl)}" style="border-radius:20px" alt="">` : (p.ikon || '📦')}</div>
    <h3 style="margin-top:16px">${esc(p.nama)}</h3><div class="rt"><b>★ ${p.rating}</b> · ${p.ulasan} ulasan · Stok ${p.stok}</div><p style="color:var(--mu)">${esc(p.deskripsi)}</p>
    <div class="pr"><b style="font-size:26px;color:var(--pri)">${rp(p.harga)}</b>${d ? `<s>${rp(p.hargaAsli)}</s><span class="dc" style="position:static">-${d}%</span>` : ''}</div>
    <div class="stp"><button data-act="dq" data-n="-1">−</button><b id="dqv">1</b><button data-act="dq" data-n="1">+</button></div>
    <button class="btn p1 full" data-act="addq" data-id="${p.id}" ${p.stok < 1 ? 'disabled' : ''}>Tambah ke Keranjang</button>`);
}

// ---------- Semua klik ----------
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const { act, id, n } = b.dataset;
  if (act === 'swap') e.preventDefault();
  try {
    switch (act) {
      case 'cat': closeM(); setCat(id); break;
      case 'slide': renderHero(+id); break;
      case 'detail': detailM(id); break;
      case 'dq': { const v = $('#dqv'); v.textContent = Math.max(1, +v.textContent + +n); break; }
      case 'add': case 'addq': {
        if (!need()) break;
        st.cart = await api('/cart', 'POST', { productId: +id, qty: act === 'addq' ? +$('#dqv').textContent : 1 });
        renderAcc(); if (act === 'addq') closeM(); toast('✅ Ditambahkan ke keranjang'); break;
      }
      case 'wish': if (!need()) break; st.wish = await api('/wishlist/' + id, 'POST'); renderAcc(); loadProducts(); if ($('#box').textContent.includes('Daftar Keinginan')) wishM(); break;
      case 'qty': st.cart = await api(`/cart/${id}?qty=${n}`, 'PUT'); renderAcc(); renderCart(); break;
      case 'closeCart': closeCart(); break;
      case 'checkout': checkoutM(); break;
      case 'place': {
        const form = $('#checkoutForm');
        const checkoutValues = {
          namaPenerima: $('#recipientName').value.trim(),
          nomorHp: $('#recipientPhone').value.trim(),
          kotaTujuan: $('#destinationCity').value.trim(),
          alamatLengkap: $('#fullAddress').value.trim()
        };
        [
          ['#recipientName', checkoutValues.namaPenerima, 'Nama penerima wajib diisi'],
          ['#recipientPhone', checkoutValues.nomorHp, 'Nomor HP/WhatsApp wajib diisi'],
          ['#destinationCity', checkoutValues.kotaTujuan, 'Kota tujuan wajib diisi'],
          ['#fullAddress', checkoutValues.alamatLengkap, 'Alamat lengkap wajib diisi']
        ].forEach(([selector, value, message]) => {
          $(selector).setCustomValidity(value ? '' : message);
        });
        if (!form.reportValidity()) break;
        const o = await api('/orders', 'POST', {
          ...checkoutValues,
          jasaPengiriman: document.querySelector('[name=jasaPengiriman]:checked').value,
          metodeBayar: document.querySelector('[name=metodeBayar]:checked').value
        });
        st.cart = []; renderAcc(); loadProducts();
        await receiptM(o.id); break;
      }
      case 'receipt': await receiptM(id); break;
      case 'printReceipt': window.print(); break;
      case 'home': closeM(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'history': await ordersM(); break;
      case 'cancel': await api(`/orders/${id}/batal`, 'PUT'); ordersM(); loadProducts(); break;
      case 'ret': await api(`/orders/${id}/kembalikan`, 'PUT'); ordersM(); break;
      case 'swap': loginM(id === '1'); break;
      case 'auth': {
        const reg = id === '1';
        const d = await api(reg ? '/auth/register' : '/auth/login', 'POST', { nama: reg ? $('#fn').value : undefined, email: $('#fe').value, password: $('#fp').value });
        st.token = d.token; st.user = d.user; localStorage.setItem('tk', d.token); localStorage.setItem('us', JSON.stringify(d.user));
        closeM(); await syncUser(); loadProducts(); toast('Selamat datang, ' + d.user.nama + ' 👋'); break;
      }
      case 'addProduct': addProductM(); break;
      case 'saveProduct': {
        const nama = $('#pn').value.trim(), harga = +$('#pp').value, hargaAsli = +$('#po').value, stok = +$('#ps').value;
        if (!nama || !harga || !hargaAsli || stok < 0) throw new Error('Nama, harga, harga asli, dan stok wajib diisi');
        const p = await api('/products', 'POST', {
          nama, deskripsi: $('#pd').value.trim(), harga, hargaAsli, stok,
          rating: 0, ulasan: 0, gratisOngkir: $('#pfree').checked,
          ikon: $('#pi').value.trim() || '📦', imageUrl: $('#pu').value.trim(),
          kategori: { id: +$('#pc').value }
        });
        st.all = await api('/products?sort=diskon');
        closeM(); renderCats(); renderFlash(); await loadProducts();
        toast('✅ Produk "' + p.nama + '" berhasil ditambahkan'); break;
      }
    }
  } catch (x) { toast('⚠️ ' + x.message); }
});

$('#sf').onsubmit = e => { e.preventDefault(); st.q = $('#q').value; loadProducts(); $('#rekom').scrollIntoView(); };
$('#sort').onchange = e => { st.sort = e.target.value; loadProducts(); };
$('#bCart').onclick = () => need() && openCart();
$('#bOrd').onclick = () => need() && ordersM();
$('#bWish').onclick = () => need() && wishM();
$('#bAcc').onclick = () => {
  if (!st.user) return loginM();
  openM(`<h3>👤 ${esc(st.user.nama)}</h3><p style="color:var(--mu)">${esc(st.user.email)} · ${st.user.role}</p>
    ${st.user.role === 'ADMIN' ? '<button class="btn p1 full" data-act="addProduct" style="margin-bottom:10px">+ Tambah Produk</button>' : ''}
    <button class="btn p1 full" id="lo">Keluar</button>`);
  $('#lo').onclick = () => { localStorage.removeItem('tk'); localStorage.removeItem('us'); location.reload(); };
};

(async () => {
  renderHero(0); renderAcc();
  try {
    st.cats = await api('/categories');
    st.all = await api('/products?sort=diskon');
  } catch {
    st.cats = demoCats;
    st.all = [...demoProducts].sort((a, b) => disc(b) - disc(a));
  }
  renderPills(); renderCats(); renderFlash();
  await syncUser(); loadProducts();
})();
