/* ==========================================================================
   Bumi Luhur — interactions
   Small, dependency-free components wired up with data attributes:
     Tabs          [role="tablist"]      generic ARIA tabs (click + arrow keys)
     AutoTabs      [data-autotabs]       tabs that advance on their own
     Carousel      [data-carousel]       looping card slider with dots + swipe
     VideoModal    [data-video-id]       YouTube player in a modal dialog
     Accordion     .faq-item <details>   one item open per list
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------ Tabs */
  function Tabs(list, onChange) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));

    function select(tab, opts) {
      opts = opts || {};
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel && panel.hasAttribute('role') && !panel.classList.contains('strip__set')) {
          panel.hidden = !on;
          panel.classList.toggle('is-active', on);
        }
      });
      if (opts.focus) tab.focus();
      if (onChange) onChange(tabs.indexOf(tab), tab, opts);
    }

    list.addEventListener('click', function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab && list.contains(tab)) select(tab, { user: true });
    });

    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, { focus: true, user: true }); }
    });

    return {
      tabs: tabs,
      select: select,
      index: function () { return tabs.findIndex(function (t) { return t.classList.contains('is-active'); }); }
    };
  }

  /* -------------------------------------------------------------- AutoTabs
     The active tab's top line fills over `data-interval` ms (CSS animation);
     when it finishes, the next tab is selected. Hover / focus pauses it. */
  function AutoTabs(list) {
    var section = list.closest('section') || list.parentNode;
    var strip = section.querySelector('.strip');
    var sets = strip ? Array.prototype.slice.call(strip.querySelectorAll('.strip__set')) : [];
    var interval = parseInt(list.getAttribute('data-interval'), 10) || 6000;
    list.style.setProperty('--autotab-duration', interval + 'ms');

    var api = Tabs(list, function (index) {
      sets.forEach(function (s, i) {
        var on = i === index;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        // make lazy images of the incoming set load right away
        if (on) s.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
      });
      restart();
    });

    function restart() {
      var active = api.tabs[api.index()];
      // re-trigger the CSS progress animation
      active.classList.remove('is-active');
      void active.offsetWidth;
      active.classList.add('is-active');
    }

    list.addEventListener('animationend', function (e) {
      if (e.animationName !== 'autotab-progress') return;
      var next = api.tabs[(api.index() + 1) % api.tabs.length];
      api.select(next);
    });

    // pause while the user is interacting with the section
    function pause() { list.classList.add('is-paused'); }
    function resume() { list.classList.remove('is-paused'); }
    [list, strip].forEach(function (el) {
      if (!el) return;
      el.addEventListener('mouseenter', pause);
      el.addEventListener('mouseleave', resume);
    });
    // keyboard users get time to read; a mouse click keeps the rotation going
    list.addEventListener('focusin', function (e) { if (e.target.matches(':focus-visible')) pause(); });
    list.addEventListener('focusout', function () { if (!list.matches(':hover') && !(strip && strip.matches(':hover'))) resume(); });

    // only run while visible
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        list.classList.toggle('is-offscreen', !entries[0].isIntersecting);
      }, { threshold: 0.25 }).observe(section);
    }

    // preload the next sets once the browser is idle
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1500); };
    idle(function () {
      sets.forEach(function (s) { s.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; }); });
    });
  }

  /* -------------------------------------------------------------- Carousel
     Cards are absolutely positioned in a looping order relative to the
     current index: one "ghost" card on each side, `visible` cards in view. */
  function Carousel(root) {
    var section = root.closest('section');
    var viewport = root.querySelector('.carousel__viewport');
    var dotsBox = root.querySelector('.carousel__dots');
    var prevBtn = root.querySelector('[data-prev]');
    var nextBtn = root.querySelector('[data-next]');
    var tablist = section.querySelector('.tabs[role="tablist"]');
    var panel, cards, index = 0, rel = [];

    function gap() { return parseFloat(getComputedStyle(viewport).getPropertyValue('--gap')) || 24; }

    function setPanel(p) {
      panel = p;
      cards = Array.prototype.slice.call(panel.querySelectorAll('.fcard'));
      index = 0;
      rel = cards.map(function () { return null; });
      buildDots();
      layout(true);
    }

    function buildDots() {
      dotsBox.innerHTML = '';
      cards.forEach(function (card, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'carousel__dot';
        b.setAttribute('aria-label', 'Go to ' + card.querySelector('.fcard__title').textContent);
        b.addEventListener('click', function () { go(i); });
        dotsBox.appendChild(b);
      });
    }

    function layout(instant) {
      if (!cards || !cards.length) return;
      var n = cards.length;
      var w = cards[0].offsetWidth;
      var g = gap();
      var visible = Math.max(1, Math.round((viewport.clientWidth + g) / (w + g)));
      viewport.style.height = cards[0].offsetHeight + 'px';
      root.style.setProperty('--card-h', cards[0].offsetHeight + 'px');

      cards.forEach(function (card, j) {
        var r = ((j - index) % n + n) % n;
        if (r === n - 1 && n > visible + 1) r = -1;          // one card waits on the left
        var jump = rel[j] === null || Math.abs(r - rel[j]) > 1;
        card.style.transition = (instant || jump) ? 'none' : '';
        card.style.transform = 'translateX(' + (r * (w + g)) + 'px)';
        var inView = r >= 0 && r < visible;
        var ghost = r === -1 || r === visible;
        card.classList.toggle('is-ghost', ghost);
        card.classList.toggle('is-offstage', !inView && !ghost);
        card.setAttribute('aria-hidden', inView ? 'false' : 'true');
        card.inert = !inView;
        rel[j] = r;
      });
      // let the browser apply the "no transition" jumps before re-enabling
      void viewport.offsetWidth;
      cards.forEach(function (c) { if (c.style.transition === 'none') c.style.transition = ''; });

      Array.prototype.forEach.call(dotsBox.children, function (d, i) {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }

    function go(i) {
      var n = cards.length;
      index = ((i % n) + n) % n;
      layout(false);
    }

    prevBtn.addEventListener('click', function () { go(index - 1); });
    nextBtn.addEventListener('click', function () { go(index + 1); });

    root.addEventListener('keydown', function (e) {
      if (e.target.closest('[role="tab"]')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });

    // pointer / touch swipe
    var startX = null, startY = null;
    viewport.addEventListener('pointerdown', function (e) { startX = e.clientX; startY = e.clientY; });
    viewport.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    });
    viewport.addEventListener('pointercancel', function () { startX = null; });

    // tabs swap the panel; the count badge follows the active tab
    var counts = tablist ? Array.prototype.slice.call(tablist.querySelectorAll('.tab__count')) : [];
    Tabs(tablist, function (i, tab) {
      counts.forEach(function (c) { c.hidden = !tab.contains(c); });
      var p = document.getElementById(tab.getAttribute('aria-controls'));
      p.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
      setPanel(p);
    });
    counts.forEach(function (c) { c.hidden = !c.closest('.tab').classList.contains('is-active'); });

    setPanel(viewport.querySelector('.carousel__panel.is-active'));
    var raf;
    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { layout(true); });
    });
    window.addEventListener('load', function () { layout(true); });
  }

  /* ------------------------------------------------------------ VideoModal */
  function VideoModal(modal) {
    var frame = modal.querySelector('.vmodal__frame');
    var lastTrigger = null;

    function open(id, title, trigger) {
      lastTrigger = trigger;
      var src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      frame.innerHTML = '<iframe src="' + src + '" title="' + (title || 'Video') +
        '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      modal.hidden = false;
      document.documentElement.classList.add('has-modal');
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
      modal.querySelector('.vmodal__close').focus();
    }

    function close() {
      if (modal.hidden) return;
      modal.classList.remove('is-open');
      document.documentElement.classList.remove('has-modal');
      frame.innerHTML = '';                 // stops playback
      setTimeout(function () { modal.hidden = true; }, reduceMotion.matches ? 0 : 250);
      if (lastTrigger) lastTrigger.focus();
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-video-id]');
      if (t) { e.preventDefault(); open(t.getAttribute('data-video-id'), t.getAttribute('data-video-title'), t); return; }
      if (e.target.closest('[data-close]') && modal.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {             // keep focus inside the dialog
        var f = modal.querySelectorAll('button, iframe');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ------------------------------------------------------------- Accordion */
  function Accordion(list) {
    list.addEventListener('toggle', function (e) {
      var item = e.target;
      if (!item.open) return;
      list.querySelectorAll('.faq-item[open]').forEach(function (o) { if (o !== item) o.open = false; });
    }, true);
  }

  /* ------------------------------------------------------- image fallback
     If a remote photo fails to load, hide it so the brand-green card or
     slice background shows instead of a broken-image icon. */
  function hideBroken(img) { img.style.visibility = 'hidden'; }
  document.querySelectorAll('.fcard img, .strip img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) hideBroken(img);
    img.addEventListener('error', function () { hideBroken(img); });
  });

  /* ------------------------------------------------------------------ init */
  document.querySelectorAll('[data-autotabs]').forEach(AutoTabs);
  document.querySelectorAll('[data-carousel]').forEach(Carousel);
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    if (list.hasAttribute('data-autotabs') || list.closest('.experience')) return;
    Tabs(list);
  });
  document.querySelectorAll('.faq__list').forEach(Accordion);
  var modal = document.getElementById('video-modal');
  if (modal) VideoModal(modal);
})();
