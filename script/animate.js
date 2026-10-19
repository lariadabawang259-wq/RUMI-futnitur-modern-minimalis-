/* =========================================================
   LOADER (tirai) + SCROLL REVEAL
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MAX_WAIT_MS = 4000; // batas aman jika gambar/peta lambat dimuat

  const loader = document.getElementById("page-loader");
  let finished = false;

  document.body.classList.add("page-loading");

  function finishLoading() {
    if (finished) return;
    finished = true;

    document.body.classList.remove("page-loading");
    document.body.classList.add("page-ready");

    if (!loader) return;

    requestAnimationFrame(() => loader.classList.add("curtain-open"));
    setTimeout(() => loader.classList.add("hide"), reduceMotion ? 0 : 1100);
  }

  // Tunggu semua resource, tapi jangan lebih lama dari MAX_WAIT_MS
  if (document.readyState === "complete") {
    setTimeout(finishLoading, 400);
  } else {
    window.addEventListener("load", () => setTimeout(finishLoading, 400), { once: true });
  }
  setTimeout(finishLoading, MAX_WAIT_MS);

  /* -------------------------------------------------------
     SCROLL REVEAL
     ------------------------------------------------------- */
  function initScrollReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = document.querySelectorAll(
      ".section-title, .about-image, .about-text, .target-card, .card, " +
      ".custom-text, .custom-image, .gallery-card, .testimonial-card, " +
      ".consultation-container, " +
      ".footer-brand, .footer-links, .footer-contact, .footer-map"
    );

    targets.forEach((el) => {
      if (el.closest("#page-loader") || el.closest("#cart-modal")) return;

      el.classList.add("scroll-reveal");

      // Jeda bertahap berdasarkan urutan di dalam grid yang sama
      if (el.matches(".target-card, .card, .gallery-card, .testimonial-card")) {
        const siblings = Array.from(el.parentElement.children);
        el.style.setProperty("--reveal-delay", `${(siblings.indexOf(el) % 4) * 100}ms`);
      }
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          el.classList.add("is-visible");
          obs.unobserve(el);

          // Lepas class reveal setelah selesai agar hover card normal kembali
          const delay = parseInt(el.style.getPropertyValue("--reveal-delay"), 10) || 0;
          setTimeout(() => {
            el.classList.remove("scroll-reveal", "is-visible");
            el.style.removeProperty("--reveal-delay");
          }, 750 + delay + 50);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -35px 0px" }
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollReveal);
  } else {
    initScrollReveal();
  }
})();