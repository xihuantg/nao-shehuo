/* ==========================================================================
   骂社火 · 交互
   ========================================================================== */
(function () {
  'use strict';

  var body = document.body;

  /* ---------------------------------------------------------------- 进度条 */
  var progress = document.querySelector('.progress');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (progress && max > 0) progress.style.width = (h.scrollTop / max) * 100 + '%';

    var nav = document.querySelector('.nav');
    if (nav) nav.classList.toggle('is-solid', h.scrollTop > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- 移动菜单 */
  var toggle = document.querySelector('.nav__toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
      body.classList.toggle('is-locked');
    });
    var menu = document.querySelector('.menu');
    if (menu) {
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          body.classList.remove('menu-open', 'is-locked');
        });
      });
    }
  }

  /* ---------------------------------------------------------------- 入场动效 */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------------- 灯箱 */
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var lbImg = lb.querySelector('.lightbox__img');
    var lbCap = lb.querySelector('.lightbox__cap');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    var idx = 0;

    function show(i) {
      if (!items.length) return;
      idx = (i + items.length) % items.length;
      var el = items[idx];
      var img = el.querySelector('img');
      lbImg.src = img.getAttribute('data-full') || img.src;
      lbImg.alt = img.alt || '';
      var cap = el.getAttribute('data-cap') || img.alt || '';
      lbCap.textContent = cap + '　' + (idx + 1) + ' / ' + items.length;
    }
    function open(i) {
      show(i);
      lb.classList.add('is-open');
      body.classList.add('is-locked');
    }
    function close() {
      lb.classList.remove('is-open');
      body.classList.remove('is-locked');
    }

    items.forEach(function (el, i) {
      el.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', function (e) {
      e.stopPropagation(); show(idx - 1);
    });
    lb.querySelector('.lightbox__nav--next').addEventListener('click', function (e) {
      e.stopPropagation(); show(idx + 1);
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------------------------------------------------------------- 展陈模式 */
  var ex = document.querySelector('.exhibit');
  if (ex) {
    var slides = (window.SITE_EXHIBIT || []).filter(function (s) { return s.src; });
    var stage = ex.querySelector('.exhibit__stage');
    var capEl = ex.querySelector('.exhibit__cap');
    var subEl = ex.querySelector('.exhibit__sub');
    var noEl = ex.querySelector('.exhibit__no');
    var bar = ex.querySelector('.exhibit__bar i');
    var imgs = [];
    var cursor = 0;
    var timer = null;
    var DURATION = 6500;

    slides.forEach(function () {
      var im = document.createElement('img');
      im.className = 'exhibit__img';
      im.alt = '';
      stage.appendChild(im);
      imgs.push(im);
    });

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function render(i) {
      var s = slides[i];
      if (!s) return;
      imgs.forEach(function (im, k) {
        im.classList.toggle('is-on', k === i);
        if (k === i && im.getAttribute('src') !== s.src) im.src = s.src;
      });
      if (capEl) capEl.textContent = s.cap || '';
      if (subEl) subEl.textContent = s.sub || '';
      if (noEl) noEl.textContent = '影像档案　' + pad(i + 1) + ' / ' + pad(slides.length);
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
        void bar.offsetWidth;
        bar.style.transition = 'width ' + DURATION + 'ms linear';
        bar.style.width = '100%';
      }
    }

    function next() {
      cursor = (cursor + 1) % slides.length;
      render(cursor);
    }

    function start() {
      stop();
      timer = setInterval(next, DURATION);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function openExhibit() {
      if (!slides.length) return;
      ex.classList.add('is-open');
      body.classList.add('is-locked');
      render(cursor);
      start();
    }
    function closeExhibit() {
      ex.classList.remove('is-open');
      body.classList.remove('is-locked');
      stop();
    }

    document.querySelectorAll('[data-exhibit-open]').forEach(function (b) {
      b.addEventListener('click', openExhibit);
    });
    var closeBtn = ex.querySelector('[data-exhibit-close]');
    if (closeBtn) closeBtn.addEventListener('click', closeExhibit);

    /* 指针停在控制区时暂停，便于讲解；移开继续 */
    var hint = ex.querySelector('.exhibit__hint');
    if (hint) {
      hint.addEventListener('mouseenter', stop);
      hint.addEventListener('mouseleave', function () {
        if (ex.classList.contains('is-open')) start();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!ex.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeExhibit();
      if (e.key === 'ArrowRight') { next(); start(); }
      if (e.key === 'ArrowLeft') { cursor = (cursor - 1 + slides.length) % slides.length; render(cursor); start(); }
      if (e.key === ' ') { e.preventDefault(); stop(); }
    });
  }

  /* ---------------------------------------------------------------- 年份 */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();