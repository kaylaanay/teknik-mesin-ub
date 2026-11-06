/* =============================================================
   Teknik Mesin UB — interaksi minimal (vanilla JS)
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- 1. Navbar: blur saat scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 2. Hamburger menu (mobile) ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-menu');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    nav.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  // Tutup menu otomatis saat masuk layout desktop
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- 3. Tandai section aktif di navbar ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  // Semua section (termasuk yang tidak ada di menu, mis. hero & cerita)
  // supaya highlight hilang saat berada di section tanpa link menu.
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], footer[id]'));

  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  // Section aktif = section terakhir yang top-nya sudah melewati 40% tinggi layar.
  var ticking = false;
  function updateActive() {
    ticking = false;
    var line = window.innerHeight * 0.4;
    var current = '';
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= line) current = s.id;
    });
    // Footer pendek: anggap aktif kalau sudah mentok bawah
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = 'kontak';
    setActive(current);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateActive); }
  }, { passive: true });
  updateActive();

  /* ---------- 4. Fade-up saat scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!hasIO || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 5. Counter angka statistik ---------- */
  var counters = document.querySelectorAll('.count[data-target]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!hasIO || reduceMotion) {
    counters.forEach(function (el) {
      el.textContent = (parseInt(el.getAttribute('data-target'), 10) || 0).toLocaleString('id-ID');
    });
  } else {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = '0'; countObserver.observe(el); });
  }

  /* ---------- 6. Carousel prestasi: tombol prev/next ---------- */
  var track = document.getElementById('prestasi-track');
  var ctrlBtns = document.querySelectorAll('.carousel-ctrl .icon-btn');
  if (track && ctrlBtns.length) {
    function cardStep() {
      var card = track.querySelector('.ach');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return card ? card.getBoundingClientRect().width + gap : 300;
    }
    function updateBtns() {
      var max = track.scrollWidth - track.clientWidth - 2;
      ctrlBtns[0].disabled = track.scrollLeft <= 2;
      ctrlBtns[1].disabled = track.scrollLeft >= max;
    }
    ctrlBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-dir'), 10);
        track.scrollBy({ left: dir * cardStep(), behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', updateBtns, { passive: true });
    window.addEventListener('resize', updateBtns);
    updateBtns();
  }

  /* ---------- 7. FAQ accordion ---------- */
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  /* ---------- 8. Tahun otomatis di footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
