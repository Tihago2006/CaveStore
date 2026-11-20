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
      hbo: '¡Hola Cave Store! Quiero HBO Max. ¿Tienen perfil privado (30 Bs) o compartido (20 Bs) disponible?',
      bf1: '¡Hola Cave Store! Vi la oferta de Black Friday y quiero el combo HBO Max + Crunchyroll privado a 40 Bs. ¿Hay cupo?',
      bf2: '¡Hola Cave Store! Vi la oferta de Black Friday y quiero el combo HBO Max + Crunchyroll compartido a 29 Bs. ¿Hay cupo?',
      bf3: '¡Hola Cave Store! Vi la oferta de Black Friday y quiero el combo HBO Max + Prime Video privado a 49 Bs. ¿Hay cupo?',
      netflix: '¡Hola Cave Store! Quiero Netflix Premium. ¿Tienen perfil privado (33 Bs) o compartido (27 Bs) disponible?',
      prime: '¡Hola Cave Store! Quiero Prime Video. ¿Tienen perfil privado (30 Bs) o compartido (20 Bs) disponible?',
      youtube: '¡Hola Cave Store! Quiero consultar disponibilidad de YouTube Premium.',
      disney: '¡Hola Cave Store! Quiero un perfil de Disney+ (30 Bs). ¿Tienen disponible?',
      paramount: '¡Hola Cave Store! Quiero consultar disponibilidad de Paramount+.',
      crunchyroll: '¡Hola Cave Store! Quiero Crunchyroll. ¿Tienen perfil privado (20 Bs) o compartido (15 Bs) disponible?',
      spotify: '¡Hola Cave Store! Quiero consultar disponibilidad de Spotify Premium.'
    },

    // Canales que va pasando la tele del inicio
    channels: [
      { name: 'Netflix Premium', price: 'desde 27 Bs/mes', img: 'assets/images/netflix.webp' },
      { name: 'Prime Video', price: 'desde 20 Bs/mes', img: 'assets/images/prime.webp' },
      { name: 'YouTube Premium', price: 'desde 20 Bs/mes', img: 'assets/images/youtube.webp' },
      { name: 'Disney+', price: 'desde 30 Bs/mes', img: 'assets/images/disney.webp' },
      { name: 'Paramount+', price: 'desde 20 Bs/mes', img: 'assets/images/paramount.webp' },
      { name: 'Crunchyroll', price: 'desde 15 Bs/mes', img: 'assets/images/crunchyroll.webp' },
      { name: 'Spotify Premium', price: 'desde 20 Bs/mes', img: 'assets/images/spotify.webp' },
      { name: 'Arma tu combo', price: 'precio especial', img: 'assets/images/combo.webp' }
    ],
    channelSeconds: 3.2,

    /* ----- Precios que dependen del dólar (solo Netflix y Disney+) -----
       Tus precios de abajo valen con el dólar de "dolarDeTusPrecios".
       Si el dólar del día sube, el precio sube lo mismo que te sube el
       costo por cliente, redondeado a 5 Bs. Si baja, se queda igual. */
    dolar: {
      dolarDeTusPrecios: 11.75, // dólar de banco con el que pusiste tus precios
      automatico: true,         // true = consulta el dólar del día en internet
      redondeo: 5,              // los aumentos van de 5 en 5 Bs
      descuentoCombo: 5         // Bs de descuento por cada plataforma extra en combo
    },
    usd: {
      netflix: { nombre: 'Netflix Premium', costoUSD: 8.99,
        privado:    { precio: 35, clientes: 5 },
        compartido: { precio: 27, clientes: 6 } },
      disney:  { nombre: 'Disney+', costoUSD: 18.99,
        privado:    { precio: 40, clientes: 7 },
        compartido: { precio: 35, clientes: 8 } }
    }
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

  /* 2b. Precios según el dólar (Netflix y Disney+) ------------------------ */
  const PRECIOS = {};

  function calcularPrecios(dolar) {
    const r = CONFIG.dolar.redondeo || 1;
    const base = CONFIG.dolar.dolarDeTusPrecios;
    Object.entries(CONFIG.usd).forEach(([key, s]) => {
      ['privado', 'compartido'].forEach((tipo) => {
        const t = s[tipo];
        const subida = Math.max(0, (s.costoUSD * (dolar - base)) / t.clientes);
        PRECIOS[key + '.' + tipo] = t.precio + Math.round(subida / r) * r;
      });
    });
  }

  function aplicarPrecios() {
    $$('[data-precio]').forEach((el) => { const v = PRECIOS[el.dataset.precio]; if (v) el.textContent = v + ' Bs'; });
    $$('[data-precio-num]').forEach((el) => { const v = PRECIOS[el.dataset.precioNum]; if (v) el.textContent = v; });
    $$('[data-usd]').forEach((el) => { const v = PRECIOS[el.dataset.usd]; if (v) el.dataset.price = v; });

    // Combos listos: suma por separado y descuento por plataforma extra
    const chips = $$('.combo-options input');
    $$('.combo-preset[data-auto]').forEach((b) => {
      const names = b.dataset.combo.split('|');
      const separado = names.reduce((t, n) => {
        const i = chips.find((c) => c.value === n);
        return t + Number(i ? i.dataset.price : 0);
      }, 0);
      const precio = separado - (names.length - 1) * CONFIG.dolar.descuentoCombo;
      b.dataset.price = precio; b.dataset.separate = separado;
      const cp = $('.cp-price', b), old = $('s', b);
      if (cp) cp.textContent = precio + ' Bs';
      if (old) old.textContent = separado + ' Bs';
    });

    // Mensajes de WhatsApp y la tele del inicio
    const n = PRECIOS;
    CONFIG.serviceMessages.netflix = `¡Hola Cave Store! Quiero Netflix Premium. ¿Tienen perfil privado (${n['netflix.privado']} Bs) o compartido (${n['netflix.compartido']} Bs) disponible?`;
    CONFIG.serviceMessages.disney = `¡Hola Cave Store! Quiero un perfil de Disney+ (desde ${n['disney.compartido']} Bs). ¿Tienen disponible?`;
    CONFIG.channels.forEach((c) => {
      if (c.name === CONFIG.usd.netflix.nombre) c.price = `desde ${n['netflix.compartido']} Bs/mes`;
      if (c.name === CONFIG.usd.disney.nombre) c.price = `desde ${n['disney.compartido']} Bs/mes`;
    });
    const tvName = $('#tv-name'), tvPrice = $('#tv-price');
    const ch = tvName && CONFIG.channels.find((c) => c.name === tvName.textContent);
    if (ch && tvPrice) tvPrice.textContent = ch.price;
  }

  function initPreciosDolar() {
    calcularPrecios(CONFIG.dolar.dolarDeTusPrecios);
    aplicarPrecios();
    if (!CONFIG.dolar.automatico || !window.fetch) return;

    // Dólar del día (gratis, se guarda 12 h para no consultar a cada rato).
    // Si el dólar baja, tus precios se quedan como los pusiste.
    const KEY = 'cave_dolar', DOCE_HORAS = 12 * 60 * 60 * 1000;
    const usar = (tasa) => {
      const dolar = Math.max(Number(tasa) || 0, CONFIG.dolar.dolarDeTusPrecios);
      calcularPrecios(dolar);
      aplicarPrecios();
      initWhatsApp();
      document.dispatchEvent(new Event('cave:precios'));
    };
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && Date.now() - c.t < DOCE_HORAS) { usar(c.v); return; }
    } catch (e) { /* sin almacenamiento: seguimos */ }

    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((d) => {
        const v = d && d.rates && d.rates.BOB;
        if (!v) return;
        try { localStorage.setItem(KEY, JSON.stringify({ v, t: Date.now() })); } catch (e) { /* ok */ }
        usar(v);
      })
      .catch(() => { /* sin internet: se quedan tus precios */ });
  }

  /* 2c. Cuenta regresiva de Black Friday (se oculta sola al terminar) ---- */
  function initBlackFriday() {
    const sec = $('#black-friday');
    if (!sec) return;
    const fin = new Date(sec.dataset.bfHasta).getTime();
    const ocultar = () => { sec.hidden = true; $$('a[href="#black-friday"]').forEach((a) => a.closest('li')?.remove()); };
    if (!fin || Date.now() >= fin) { ocultar(); return; }
    const d = $('#bf-d'), h = $('#bf-h'), m = $('#bf-m'), s = $('#bf-s');
    const dos = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const t = Math.max(0, fin - Date.now());
      if (t === 0) { clearInterval(timer); ocultar(); return; }
      d.textContent = dos(Math.floor(t / 864e5));
      h.textContent = dos(Math.floor(t / 36e5) % 24);
      m.textContent = dos(Math.floor(t / 6e4) % 60);
      s.textContent = dos(Math.floor(t / 1e3) % 60);
    };
    const timer = setInterval(tick, 1000);
    tick();
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
    const presets = $$('.combo-preset');
    if (!inputs.length || !send) return;

    presets.forEach((b) => b.addEventListener('click', () => {
      const want = b.dataset.combo.split('|');
      inputs.forEach((i) => {
        const on = want.includes(i.value);
        if (i.checked !== on) {
          i.checked = on;
          const chip = i.closest('.combo-chip');
          chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop');
        }
      });
      update();
    }));

    const update = () => {
      const chosen = inputs.filter((i) => i.checked);
      const n = chosen.length;
      const sum = chosen.reduce((t, i) => t + Number(i.dataset.price || 0), 0);

      count.textContent = n;
      count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump');
      label.textContent = n === 1 ? 'plataforma elegida' : 'plataformas elegidas';

      const key = chosen.map((i) => i.value).sort().join('|');
      const preset = presets.find((b) => b.dataset.combo.split('|').sort().join('|') === key);
      presets.forEach((b) => b.classList.toggle('active', b === preset));

      if (n === 0) note.textContent = 'Elige al menos dos para armar un combo.';
      else if (n === 1) note.textContent = 'Elige una más para que sea combo.';
      else if (preset) note.innerHTML = `Precio combo: <strong>${preset.dataset.price} Bs/mes</strong> (por separado ${preset.dataset.separate} Bs).`;
      else note.textContent = `Por separado serían ${sum} Bs/mes. Escríbenos y te damos precio especial.`;

      const ready = n >= 2;
      send.classList.toggle('is-disabled', !ready);
      send.setAttribute('aria-disabled', String(!ready));

      const names = chosen.map((i) => i.value).join(', ');
      const msg = !ready ? CONFIG.comboMessage
        : preset ? `¡Hola Cave Store! Quiero el combo ${names} a ${preset.dataset.price} Bs/mes. ¿Está disponible?`
        : `¡Hola Cave Store! Quiero armar un combo con: ${names}. ¿Cuál sería el precio especial?`;
      send.href = waUrl(msg);
    };

    document.addEventListener('cave:precios', () => update());
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
    initPreciosDolar();
    initBlackFriday();
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
