/**
 * CAVE STORE · interacciones
 * JavaScript puro, sin librerías.
 */
(function () {
  'use strict';

  /* ==========================================================================
     1. CONFIGURACIÓN (edita aquí)
     ========================================================================== */
  const CONFIG = {
    // Número de WhatsApp con código de país, sin "+" ni espacios.
    // Bolivia = 591 + tu número. REVISA que sea el correcto.
    whatsappNumber: '59157360383',

    defaultMessage: '¡Hola Cave Store! Vengo desde su página web y quiero consultar por sus planes de streaming.',
    comboMessage: '¡Hola Cave Store! Quiero armar un combo de streaming. ¿Me pasan el precio?',

    serviceMessages: {
      netflix: '¡Hola Cave Store! Quiero consultar disponibilidad y precio de Netflix Premium.',
      prime: '¡Hola Cave Store! Quiero consultar disponibilidad de Prime Video.',
      youtube: '¡Hola Cave Store! Quiero consultar disponibilidad de YouTube Premium.',
      disney: '¡Hola Cave Store! Quiero consultar disponibilidad de Disney+.',
      paramount: '¡Hola Cave Store! Quiero consultar disponibilidad de Paramount+.',
      crunchyroll: '¡Hola Cave Store! Quiero consultar disponibilidad de Crunchyroll.',
      spotify: '¡Hola Cave Store! Quiero consultar disponibilidad de Spotify Premium.'
    },

    // Canales que va pasando la tele del inicio
    channels: [
      { name: 'Netflix Premium', price: 'desde 35 Bs/mes', img: 'assets/images/netflix.webp' },
      { name: 'Prime Video', price: 'desde 20 Bs/mes', img: 'assets/images/prime.webp' },
      { name: 'YouTube Premium', price: 'desde 20 Bs/mes', img: 'assets/images/youtube.webp' },
      { name: 'Disney+', price: 'desde 25 Bs/mes', img: 'assets/images/disney.webp' },
      { name: 'Paramount+', price: 'desde 20 Bs/mes', img: 'assets/images/paramount.webp' },
      { name: 'Crunchyroll', price: 'desde 20 Bs/mes', img: 'assets/images/crunchyroll.webp' },
      { name: 'Spotify Premium', price: 'desde 20 Bs/mes', img: 'assets/images/spotify.webp' },
      { name: 'Arma tu combo', price: 'precio especial', img: 'assets/images/combo.webp' }
    ],
    channelSeconds: 3.2
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const waUrl = (msg) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg || CONFIG.defaultMessage)}`;

  /* 2. Botones de WhatsApp ------------------------------------------------ */
  function initWhatsApp() {
    $$('[data-wa-action]').forEach((btn) => {
      const action = btn.dataset.waAction;
      const msg = action === 'combo' ? CONFIG.comboMessage : (CONFIG.serviceMessages[action] || CONFIG.defaultMessage);
      btn.href = waUrl(msg);
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
    });
  }

  /* 3. Escena del inicio: ajustar tamaño y encender la tele --------------- */
  function initHeroTV() {
    const stage = $('.hero-stage');
    const screen = $('#tv-screen');
    if (!stage || !screen) return;

    const fit = () => stage.style.setProperty('--stage-h', stage.clientHeight + 'px');
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage);
    else window.addEventListener('resize', fit);

    // Precargar logos
    CONFIG.channels.forEach((c) => { const i = new Image(); i.src = c.img; });

    const logo = $('#tv-logo'), name = $('#tv-name'), price = $('#tv-price'), osd = $('#tv-osd');
    let index = 0;

    const show = (i) => {
      const c = CONFIG.channels[i];
      logo.src = c.img;
      name.textContent = c.name;
      price.textContent = c.price;
      osd.textContent = 'CH ' + String(i + 1).padStart(2, '0');
    };

    const next = () => {
      index = (index + 1) % CONFIG.channels.length;
      screen.classList.add('is-switching');
      setTimeout(() => { show(index); screen.classList.remove('is-switching'); }, 260);
    };

    // Encender
    requestAnimationFrame(() => screen.classList.add('is-on'));
    if (reduceMotion) return;

    let timer = null;
    const start = () => { if (!timer) timer = setInterval(next, CONFIG.channelSeconds * 1000); };
    const stop = () => { clearInterval(timer); timer = null; };

    setTimeout(start, 1600);

    // Pausar cuando la tele no se ve o la pestaña está oculta
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(stage);
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* 4. Marquesina infinita ----------------------------------------------- */
  function initMarquee() {
    const track = $('.marquee-track');
    const list = $('.marquee-list', track || document);
    if (!track || !list) return;
    const clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  /* 5. Header y enlace activo -------------------------------------------- */
  function initHeader() {
    const header = $('.site-header');
    const fab = $('.floating-whatsapp-btn');
    const onScroll = () => {
      const y = window.scrollY;
      header && header.classList.toggle('scrolled', y > 30);
      fab && fab.classList.toggle('show', y > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!('IntersectionObserver' in window)) return;
    const links = $$('.nav-link');
    const map = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.remove('active'));
        const link = map.get(e.target.id);
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* 6. Menú móvil --------------------------------------------------------- */
  function initMobileMenu() {
    const toggle = $('.mobile-toggle');
    const drawer = $('.mobile-drawer');
    const overlay = $('.mobile-drawer-overlay');
    if (!toggle || !drawer || !overlay) return;

    const setOpen = (open) => {
      drawer.classList.toggle('open', open);
      overlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
    overlay.addEventListener('click', () => setOpen(false));
    $$('a', drawer).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* 7. Filtros del catálogo (con transición) ----------------------------- */
  function initFilters() {
    const btns = $$('.filter-btn');
    const cards = $$('.service-card');
    if (!btns.length) return;

    btns.forEach((btn) => btn.addEventListener('click', () => {
      btns.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      const f = btn.dataset.filter;
      const match = (c) => f === 'all' || c.dataset.category.split(' ').includes(f);

      cards.forEach((c) => { if (!match(c) && !c.classList.contains('is-hidden')) c.classList.add('is-hiding'); });
      setTimeout(() => {
        cards.forEach((c, i) => {
          c.classList.remove('is-hiding', 'is-entering');
          if (match(c)) {
            c.classList.remove('is-hidden');
            void c.offsetWidth;
            c.style.animationDelay = (i % 4) * 50 + 'ms';
            c.classList.add('is-entering');
          } else {
            c.classList.add('is-hidden');
          }
        });
      }, reduceMotion ? 0 : 220);
    }));
  }

  /* 8. Luz que sigue al cursor en las tarjetas ---------------------------- */
  function initCardSpotlight() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    $$('.service-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* 9. Arma tu combo ------------------------------------------------------ */
  function initComboBuilder() {
    const inputs = $$('.combo-options input');
    const send = $('#combo-send');
    const count = $('#combo-count');
    const label = $('#combo-count-label');
    const note = $('#combo-note');
    if (!inputs.length || !send) return;

    const update = () => {
      const chosen = inputs.filter((i) => i.checked);
      const n = chosen.length;
      const sum = chosen.reduce((t, i) => t + Number(i.dataset.price || 0), 0);

      count.textContent = n;
      count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump');
      label.textContent = n === 1 ? 'plataforma elegida' : 'plataformas elegidas';

      if (n === 0) note.textContent = 'Elige al menos dos para armar un combo.';
      else if (n === 1) note.textContent = 'Elige una más para que sea combo.';
      else note.textContent = `Por separado serían desde ${sum} Bs/mes. En combo te damos precio especial.`;

      const ready = n >= 2;
      send.classList.toggle('is-disabled', !ready);
      send.setAttribute('aria-disabled', String(!ready));

      const names = chosen.map((i) => i.value).join(', ');
      const msg = ready
        ? `¡Hola Cave Store! Quiero armar un combo con: ${names}. ¿Cuál sería el precio especial?`
        : CONFIG.comboMessage;
      send.href = waUrl(msg);
    };

    inputs.forEach((i) => i.addEventListener('change', () => {
      const chip = i.closest('.combo-chip');
      chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop');
      update();
    }));
    update();
    count.classList.remove('bump');
  }

  /* 10. Línea de progreso de los pasos ----------------------------------- */
  function initStepsProgress() {
    const steps = $('#steps');
    if (!steps) return;
    const items = $$('.step', steps);

    const onScroll = () => {
      const r = steps.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
      steps.style.setProperty('--progress', p.toFixed(3));
      items.forEach((it, i) => it.classList.toggle('is-lit', p >= i / items.length + 0.02 || p === 1));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* 11. FAQ --------------------------------------------------------------- */
  function initFaq() {
    const items = $$('.faq-item');
    items.forEach((item) => {
      const btn = $('.faq-question-btn', item);
      btn.addEventListener('click', () => {
        const open = !item.classList.contains('active');
        items.forEach((o) => { o.classList.remove('active'); $('.faq-question-btn', o).setAttribute('aria-expanded', 'false'); });
        item.classList.toggle('active', open);
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* 12. Aparición suave de secciones -------------------------------------- */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const els = $$('.section-header, .combo-panel, .steps, .trust-row, .faq-layout, .contact-card');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('reveal'); io.observe(el); }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const year = $('#year'); if (year) year.textContent = new Date().getFullYear();
    initWhatsApp();
    initHeroTV();
    initMarquee();
    initHeader();
    initMobileMenu();
    initFilters();
    initCardSpotlight();
    initComboBuilder();
    initStepsProgress();
    initFaq();
    initReveal();
  });

  window.__CAVE_STORE__ = CONFIG;
})();
