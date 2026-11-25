/* Le Studio — interactions du site */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Écran de chargement : au moins 1,9 s (le temps que le monogramme s'écrive), puis dès que la page est prête ---- */
  const loader = $('[data-loader]');
  if (loader) {
    let done = false;
    const end = () => { if (done) return; done = true; document.documentElement.classList.toggle('is-loading', false); loader.classList.add('is-done'); setTimeout(() => loader.hidden = true, 900); };
    const ready = new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }));
    Promise.all([ready, new Promise(r => setTimeout(r, 1900))]).then(end);
    setTimeout(end, 5000);
  }

  /* ---- Horaires : jour en cours + ouvert/fermé, heure de Paris ---- */
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const mins = (+get('hour') % 24) * 60 + +get('minute');
  const week = [[540, 780], [840, 1140]], sat = [[540, 780], [840, 1080]];
  const slots = { 2: week, 3: week, 4: week, 5: week, 6: sat };
  const fmt = m => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}`;
  const today = slots[day] || [];
  const cur = today.find(([a, b]) => mins >= a && mins < b);
  let label;
  if (cur) label = `Ouvert, jusqu'à ${fmt(cur[1])}`;
  else {
    const later = today.find(([a]) => mins < a);
    if (later) label = `Fermé, réouvre à ${fmt(later[0])}`;
    else {
      const names = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      let d = day; do { d = (d + 1) % 7; } while (!slots[d]);
      label = `Fermé, ouvre ${d === (day + 1) % 7 ? 'demain' : names[d]} à ${fmt(slots[d][0][0])}`;
    }
  }
  $$('[data-open-status]').forEach(el => { el.textContent = label; el.classList.toggle('ls-status--open', !!cur); });
  $$('[data-hours] [data-days]').forEach(r => { if (r.dataset.days.split(',').map(Number).includes(day)) r.classList.add('is-today'); });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* ---- Vidéo du salon : lecture quand elle est à l'écran, pause sinon (batterie) ---- */
  const video = $('[data-video]'), vbtn = $('[data-video-toggle]');
  if (video && vbtn) {
    const sync = () => {
      const paused = video.paused;
      vbtn.setAttribute('aria-label', paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause');
      vbtn.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
    };
    let userPaused = reduce;   // « réduire les animations » : pas de lecture automatique, le bouton ▶ suffit
    vbtn.addEventListener('click', () => { if (video.paused) { userPaused = false; video.play(); } else { userPaused = true; video.pause(); } });
    video.addEventListener('play', sync); video.addEventListener('pause', sync); sync();
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused) { video.preload = 'auto'; video.play().catch(() => {}); }
      else if (!e.isIntersecting && !video.paused) video.pause();
    }, { threshold: .25 }).observe(video);
  }

  /* ---- Menu mobile ---- */
  const toggle = $('[data-menu-toggle]'), sheet = $('[data-menu]');
  if (toggle && sheet) {
    const set = open => { toggle.setAttribute('aria-expanded', open); sheet.hidden = !open; document.body.style.overflow = open ? 'hidden' : ''; };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
    matchMedia('(min-width: 1024px)').addEventListener('change', () => set(false));
  }

  /* ---- Apparitions au défilement ---- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('[data-reveal], [data-ignite]').forEach(el => io.observe(el));

  /* ---- Boutique : le produit visé s'éclaire (le reste de l'étagère s'assombrit), sa fiche s'affiche sur le mur ---- */
  const vit = $('[data-vitrine]');
  if (vit) {
    const dim = $('.vitrine__dim', vit), inner = $('[data-card-in]', vit), card = $('[data-card]', vit);
    const spots = $$('.vitrine__spot', vit);
    let cur = null, swap = 0;
    const fill = id => {
      if (cur === id) return; cur = id;
      const tpl = $(`[data-product-card="${id}"]`); if (!tpl) return;
      clearTimeout(swap);
      if (reduce) { inner.replaceChildren(tpl.content.cloneNode(true)); return; }
      inner.classList.add('is-out');
      swap = setTimeout(() => { inner.replaceChildren(tpl.content.cloneNode(true)); inner.classList.remove('is-out'); }, 160);
    };
    const focus = sp => {
      const r = $('span', sp).getBoundingClientRect(), d = dim.getBoundingClientRect();
      // centre du projecteur : un peu au-dessus du point, sur le produit
      dim.style.setProperty('--sx', `${r.left + r.width / 2 - d.left}px`);
      dim.style.setProperty('--sy', `${r.top - d.top - sp.offsetHeight * .4}px`);
      spots.forEach(s => s.setAttribute('aria-pressed', s === sp));
      vit.classList.add('is-focus');
      fill(sp.dataset.product);
    };
    const blur = () => { vit.classList.remove('is-focus'); spots.forEach(s => s.setAttribute('aria-pressed', 'false')); };
    spots.forEach(sp => {
      sp.setAttribute('aria-pressed', 'false');
      sp.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') focus(sp); });
      sp.addEventListener('focus', () => focus(sp));
      sp.addEventListener('click', () => {
        focus(sp);
        if (matchMedia('(max-width: 1023px)').matches) { const r = card.getBoundingClientRect(); if (r.bottom > innerHeight) card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' }); }
      });
    });
    $('.vitrine__shelf', vit).addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') blur(); });
    vit.addEventListener('focusout', e => { if (!vit.contains(e.relatedTarget)) blur(); });
    addEventListener('pointerdown', e => { if (!e.target.closest('.vitrine__spot, [data-card]')) blur(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') blur(); });
  }

  /* ---- Lien actif dans la navigation ---- */
  const links = $$('.ls-nav__links a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id));
    links.forEach(a => a.hasAttribute('aria-current') && a.setAttribute('aria-current', 'true'));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['prestations', 'salon', 'boutique', 'venir'].forEach(id => { const s = document.getElementById(id); s && spy.observe(s); });

  /* ---- Moment : les mots du manifeste s'allument au défilement ---- */
  const words = $('[data-words]');
  if (words) {
    words.innerHTML = words.innerHTML.split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? w : `<span class="w">${w}</span>`).join('');
    const spans = $$('.w', words);
    if (!reduce) {
      let ticking = false;
      const paint = () => {
        ticking = false;
        const r = words.getBoundingClientRect(), vh = innerHeight;
        const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
        const lit = p * spans.length;
        spans.forEach((s, i) => s.style.setProperty('--o', Math.min(1, Math.max(.16, .16 + (lit - i) * .84))));
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
      paint();
    }
  }

  /* ---- Barre « Réserver » mobile : seulement quand aucun bouton Réserver n'est à l'écran ---- */
  const bar = $('[data-actionbar]');
  if (bar) {
    const watched = $$('[data-hero-cta], [data-close-cta]'); const visible = new Set();
    const update = () => { const hide = visible.size > 0; bar.classList.toggle('is-hidden', hide); bar.inert = hide; };
    new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)); update(); }).observe(watched[0]);
    const io2 = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)); update(); });
    watched.forEach(w => io2.observe(w));
    visible.add(watched[0]); update();
  }
})();
