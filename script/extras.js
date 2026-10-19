(function () {
  "use strict";

  /* ---------- Tombol kembali ke atas ---------- */
  const topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.id = "back-to-top";
  topBtn.setAttribute("aria-label", "Kembali ke atas");
  topBtn.innerHTML = "&#8593;";
  document.body.appendChild(topBtn);

  window.addEventListener("scroll", () => {
    topBtn.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Lightbox (galeri & foto produk) ---------- */
  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML = '<button type="button" class="lb-close" aria-label="Tutup">&times;</button><img alt="">';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");

  function closeLightbox() { lb.classList.remove("open"); }

  document.querySelectorAll(".gallery-img-wrapper img, .card > img").forEach((img) => {
    img.classList.add("zoomable");
    img.addEventListener("click", () => {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.classList.add("open");
    });
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.classList.contains("lb-close")) closeLightbox();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  /* ---------- Cari & urutkan produk ---------- */
  const grid = document.querySelector(".products .grid");
  const inputCari = document.getElementById("cari-produk");
  const selectUrut = document.getElementById("urut-produk");
  const noResult = document.getElementById("no-result");
  if (!grid || !inputCari || !selectUrut) return;

  const cards = Array.from(grid.querySelectorAll(".card"));
  cards.forEach((c, i) => (c.dataset.order = i));
  const harga = (c) => parseInt(c.querySelector(".price").textContent.replace(/\D/g, ""), 10) || 0;
  const nama = (c) => c.querySelector("h3").textContent.toLowerCase();

  function cari() {
    const q = inputCari.value.trim().toLowerCase();
    let tampil = 0;
    cards.forEach((c) => {
      const cocok = nama(c).includes(q);
      c.classList.toggle("search-hide", !cocok);
      if (cocok && !c.classList.contains("hide")) tampil++;
    });
    if (noResult) noResult.classList.toggle("show", tampil === 0);
  }

  function urut() {
    const mode = selectUrut.value;
    const sorted = cards.slice().sort((a, b) => {
      if (mode === "murah") return harga(a) - harga(b);
      if (mode === "mahal") return harga(b) - harga(a);
      if (mode === "az") return nama(a).localeCompare(nama(b), "id");
      return a.dataset.order - b.dataset.order;
    });
    sorted.forEach((c) => grid.appendChild(c));
  }

  inputCari.addEventListener("input", cari);
  selectUrut.addEventListener("change", urut);
  // jalankan ulang hitungan saat kategori diganti
  document.querySelectorAll(".filter-btn").forEach((b) =>
    b.addEventListener("click", () => setTimeout(cari, 0))
  );
})();