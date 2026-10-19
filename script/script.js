/* =========================================================
   RUMI - script utama
   ========================================================= */
const NOMOR_WA_TOKO = '6281234567890'; // ganti dengan nomor WhatsApp toko (format 62xxxxxxxxxx)
const CART_KEY = 'rumi_cart';

let cart = [];

/* ---------------------------------------------------------
   UTIL
   --------------------------------------------------------- */
function formatRupiah(angka) {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

// Cegah HTML/skrip tersisip lewat data localStorage
function escapeHtml(teks) {
  return String(teks).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------------------------------------------------------
   LOCALSTORAGE KERANJANG
   --------------------------------------------------------- */
function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    cart = Array.isArray(parsed)
      ? parsed
          .filter((i) => i && typeof i.nama === 'string' &&
                         Number(i.harga) > 0 && Number.isInteger(Number(i.qty)) && Number(i.qty) > 0)
          .map((i) => ({
            nama: i.nama,
            harga: Number(i.harga),
            warna: typeof i.warna === 'string' ? i.warna : 'Natural Teak',
            qty: Number(i.qty)
          }))
      : [];
  } catch (err) {
    console.error('Gagal memuat keranjang:', err);
    cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error('Gagal menyimpan keranjang:', err);
  }
}

/* ---------------------------------------------------------
   HEADER SAAT SCROLL (pakai class, gaya ada di CSS)
   --------------------------------------------------------- */
function updateHeaderState() {
  const header = document.querySelector('header');
  if (header) header.classList.toggle('scrolled', window.scrollY > 50);
}
window.addEventListener('scroll', updateHeaderState, { passive: true });

/* ---------------------------------------------------------
   MENU MOBILE
   --------------------------------------------------------- */
function toggleMenu(forceClose) {
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('menu-toggle');
  if (!nav || !btn) return;

  const open = forceClose === true ? false : !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
}

/* ---------------------------------------------------------
   FILTER KATALOG
   (hanya toggle class .hide - jangan set style.display, karena
   di HP kartu memakai display:flex dan akan tertimpa)
   --------------------------------------------------------- */
function filterProduk(kategori, btnElement) {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  if (btnElement) {
    btnElement.classList.add('active');
    btnElement.setAttribute('aria-pressed', 'true');
  }

  document.querySelectorAll('.products .grid .card').forEach((card) => {
    const cocok = kategori === 'all' || card.getAttribute('data-category') === kategori;
    card.classList.toggle('hide', !cocok);
  });
}

/* ---------------------------------------------------------
   MODAL KERANJANG
   --------------------------------------------------------- */
function toggleCart(forceClose) {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;

  const open = forceClose === true ? false : !modal.classList.contains('open');
  modal.classList.toggle('open', open);
  document.body.classList.toggle('cart-open', open);

  if (open) {
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.focus();
  }
}

/* ---------------------------------------------------------
   KERANJANG: TAMBAH / UBAH / HAPUS
   --------------------------------------------------------- */
function tambahKeranjang(namaProduk, harga, colorSelectId) {
  if (!namaProduk || typeof harga !== 'number' || harga <= 0) {
    console.error('Data produk tidak valid:', { namaProduk, harga });
    showToast('Terjadi kesalahan saat menambahkan produk. Silakan coba lagi.');
    return;
  }

  let warna = 'Natural Teak';
  if (colorSelectId) {
    const el = document.getElementById(colorSelectId);
    if (el) warna = el.value;
  }

  const existing = cart.find((i) => i.nama === namaProduk && i.warna === warna);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ nama: namaProduk, harga, warna, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`${namaProduk} (${warna}) berhasil ditambahkan ke keranjang!`);
}

function ubahQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function hapusItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

/* ---------------------------------------------------------
   TAMPILAN KERANJANG
   --------------------------------------------------------- */
function updateCartUI() {
  const container = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const badgeCount = document.getElementById('badge-count');
  const totalElem = document.getElementById('cart-total-price');
  if (!container) return;

  let total = 0;
  let totalItems = 0;
  let html = '';

  if (cart.length === 0) {
    html = '<p class="empty-msg">Keranjang Anda masih kosong.</p>';
  } else {
    cart.forEach((item, index) => {
      total += item.harga * item.qty;
      totalItems += item.qty;

      html += `
        <div class="cart-item">
          <div>
            <h4>${escapeHtml(item.nama)}</h4>
            <small>Warna: ${escapeHtml(item.warna)}</small>
            <p>${formatRupiah(item.harga)} x ${item.qty}</p>
            <div class="qty-control">
              <button type="button" onclick="ubahQty(${index}, -1)" class="btn-qty" aria-label="Kurangi jumlah">-</button>
              <span>${item.qty}</span>
              <button type="button" onclick="ubahQty(${index}, 1)" class="btn-qty" aria-label="Tambah jumlah">+</button>
            </div>
          </div>
          <button type="button" onclick="hapusItem(${index})" class="btn-remove">Hapus</button>
        </div>`;
    });
  }

  container.innerHTML = html;
  if (cartCount) cartCount.textContent = totalItems;
  if (badgeCount) badgeCount.textContent = totalItems;
  if (totalElem) totalElem.textContent = formatRupiah(total);
}

/* ---------------------------------------------------------
   CHECKOUT VIA WHATSAPP
   --------------------------------------------------------- */
function bukaWhatsApp(pesan) {
  window.open(
    `https://wa.me/${NOMOR_WA_TOKO}?text=${encodeURIComponent(pesan)}`,
    '_blank',
    'noopener'
  );
}

function checkoutWA() {
  if (cart.length === 0) {
    showToast('Keranjang Anda masih kosong!');
    return;
  }

  let pesan = 'Halo RUMI, saya ingin memesan produk berikut:\n\n';
  let total = 0;

  cart.forEach((item, i) => {
    const subtotal = item.harga * item.qty;
    total += subtotal;
    pesan += `${i + 1}. ${item.nama} (${item.warna}) - Qty: ${item.qty} = ${formatRupiah(subtotal)}\n`;
  });

  pesan += `\n*Total Pembayaran: ${formatRupiah(total)}*`;
  pesan += '\n\nMohon informasi proses selanjutnya. Terima kasih!';

  bukaWhatsApp(pesan);
}

/* ---------------------------------------------------------
   FORM KONSULTASI
   Sebelumnya form hanya menampilkan "terkirim" tanpa mengirim
   data apa pun. Sekarang data dikirim lewat WhatsApp toko.
   --------------------------------------------------------- */
function kirimKonsultasi(event) {
  event.preventDefault();
  const form = event.target;

  const ambil = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  const nama = ambil('nama');
  const kontak = ambil('email');
  const tipeRuang = ambil('tipe-ruang');
  const catatan = ambil('pesan');

  if (!nama) {
    showToast('Mohon isi nama Anda terlebih dahulu.');
    document.getElementById('nama')?.focus();
    return;
  }
  if (!tipeRuang) {
    showToast('Mohon pilih tipe ruangan yang ingin dikonsultasikan.');
    document.getElementById('tipe-ruang')?.focus();
    return;
  }

  const pesan =
    'Halo RUMI, saya ingin konsultasi desain gratis.\n\n' +
    `Nama: ${nama}\n` +
    `Kontak: ${kontak}\n` +
    `Tipe ruangan: ${tipeRuang}\n` +
    `Kebutuhan: ${catatan}`;

  showToast(`Terima kasih, ${nama}! Mengarahkan Anda ke WhatsApp untuk mengirim permintaan konsultasi.`);
  bukaWhatsApp(pesan);
  form.reset();
}

/* ---------------------------------------------------------
   TOAST
   --------------------------------------------------------- */
function showToast(pesan) {
  let toast = document.getElementById('rumi-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'rumi-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = pesan;
  requestAnimationFrame(() => toast.classList.add('show'));

  clearTimeout(toast._timeoutId);
  toast._timeoutId = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ---------------------------------------------------------
   INISIALISASI
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  loadCart();
  updateCartUI();
  updateHeaderState();

  // Tutup modal: klik area gelap
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) toggleCart(true);
    });
  }

  // Tutup modal / menu dengan tombol Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    toggleCart(true);
    toggleMenu(true);
  });

  // Tutup menu mobile setelah memilih link
  document.querySelectorAll('#main-nav a').forEach((a) =>
    a.addEventListener('click', () => toggleMenu(true))
  );

  // Gambar gagal dimuat (hotlink mati dsb.): tampilkan placeholder, bukan ikon rusak
  document.querySelectorAll('img').forEach((img) =>
    img.addEventListener('error', () => img.classList.add('img-error'), { once: true })
  );
});

// Sinkronkan keranjang jika tab lain mengubahnya
window.addEventListener('storage', (e) => {
  if (e.key === CART_KEY) {
    loadCart();
    updateCartUI();
  }
});