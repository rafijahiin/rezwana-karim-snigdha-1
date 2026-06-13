/* ============================================================
   Dr. Rezwana Karim Snigdha — interactions
   theme · nav · scroll progress · reveal · scrollspy ·
   publication filter · count-up · fieldwork map (Leaflet)
   ============================================================ */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year ---- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Theme toggle (persisted) ---- */
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");
  // Dark navy is the default; "light" is the optional warm mode.
  const stored = localStorage.getItem("theme");
  root.setAttribute("data-theme", stored === "light" ? "light" : "dark");
  function isLight() { return root.getAttribute("data-theme") === "light"; }
  function syncThemeIcon() {
    const icon = $("#themeIcon");
    if (icon) icon.innerHTML = !isLight()
      ? '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'
      : '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  }
  syncThemeIcon();
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const next = isLight() ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    syncThemeIcon();
    if (window._fieldmapTheme) window._fieldmapTheme();
  });

  /* ---- Mobile nav ---- */
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", navLinks).forEach(a => a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---- Header scrolled + scroll progress ---- */
  const header = $("#header");
  const progress = $("#progress");
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 24);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  const reveals = $$(".reveal");
  if (reduce) {
    reveals.forEach(el => el.classList.add("in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("in"));
  }

  /* ---- Scrollspy (active nav link) ---- */
  const sections = $$("main section[id]");
  const linkFor = id => $(`#navLinks a[href="#${id}"]`);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const l = linkFor(e.target.id);
        if (l && e.isIntersecting) {
          $$("#navLinks a").forEach(a => a.classList.remove("active"));
          l.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ---- Publication filter ---- */
  const chips = $$(".chip[data-filter]");
  const pubs = $$(".pub[data-type]");
  chips.forEach(chip => chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;
    pubs.forEach(p => {
      const show = f === "all" || p.dataset.type === f;
      p.hidden = !show;
      if (show && !reduce) { p.style.animation = "none"; void p.offsetWidth; p.style.animation = "revealIn .5s var(--ease)"; }
    });
  }));

  /* ---- Count-up stats ---- */
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduce) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, target = parseInt(el.dataset.count, 10), suffix = el.textContent.replace(/[0-9]/g, "");
        let cur = 0; const step = Math.max(1, Math.round(target / 40));
        const tick = () => { cur = Math.min(target, cur + step); el.textContent = cur + suffix; if (cur < target) requestAnimationFrame(tick); };
        tick(); cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---- Fieldwork map (Leaflet) ---- */
  const mapEl = $("#fieldmap");
  if (mapEl && window.L) {
    const sites = (Array.isArray(window.FIELDWORK) && window.FIELDWORK.length)
      ? window.FIELDWORK.map(s => ({ name: s.name, note: s.note, ll: [s.lat, s.lng], c: s.color }))
      : [
      { name: "Dhaka, Bangladesh", note: "Home base · Hijra ethnography & urban fieldwork", ll: [23.8103, 90.4125], c: "plum" },
      { name: "Coastal Bangladesh", note: "“Salty Waters” SRH & climate study", ll: [22.20, 89.10], c: "terra" },
      { name: "Auckland, New Zealand", note: "PhD · Auckland University of Technology", ll: [-36.8485, 174.7633], c: "teal" },
      { name: "New Delhi, India", note: "JNU & South Asian University talks", ll: [28.6139, 77.2090], c: "teal" },
      { name: "New York, USA", note: "Sex Tech Lab, The New School", ll: [40.7128, -74.0060], c: "teal" },
      { name: "Iowa, USA", note: "University of Iowa invited lecture", ll: [41.6611, -91.5302], c: "teal" }
    ];
    const colors = { plum: "#CBA75A", terra: "#D7A94E", teal: "#6E93C4" };
    const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([20, 60], 2);

    const tiles = {
      light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      dark:  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    };
    const tileFor = () => (root.getAttribute("data-theme") === "light" ? tiles.light : tiles.dark);
    let layer = L.tileLayer(tileFor(), { maxZoom: 12, attribution: "© OpenStreetMap, © CARTO" }).addTo(map);
    window._fieldmapTheme = function () {
      map.removeLayer(layer);
      layer = L.tileLayer(tileFor(), { maxZoom: 12, attribution: "© OpenStreetMap, © CARTO" }).addTo(map);
    };

    const group = [];
    sites.forEach(s => {
      const m = L.circleMarker(s.ll, {
        radius: 9, color: "#fff", weight: 2, fillColor: colors[s.c], fillOpacity: 1
      }).addTo(map).bindPopup(`<strong>${s.name}</strong><br><span style="color:#777">${s.note}</span>`);
      group.push(m.getLatLng());
    });
    setTimeout(() => { map.invalidateSize(); map.fitBounds(L.latLngBounds(group).pad(0.25)); }, 200);
  }

  /* ---- Hero constellation ---- */
  const cv = $("#constellation");
  const hero = $(".hero");
  if (cv && hero && !reduce) {
    const ctx = cv.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, pts = [], raf = null, mouse = { x: -999, y: -999 };
    const GOLD = "203,167,90";
    function size() {
      const r = hero.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * DPR; cv.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.max(32, Math.min(110, Math.round((w * h) / 12000)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.5 + 0.6
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < 130) {
            ctx.strokeStyle = "rgba(" + GOLD + "," + (1 - d / 130) * 0.3 + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (md < 170) {
          ctx.strokeStyle = "rgba(" + GOLD + "," + (1 - md / 170) * 0.45 + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = "rgba(" + GOLD + ",.9)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    hero.addEventListener("mousemove", (e) => {
      const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("mouseleave", () => { mouse.x = mouse.y = -999; });
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 200); });
    size();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(hero);
    } else { start(); }
  }
})();
