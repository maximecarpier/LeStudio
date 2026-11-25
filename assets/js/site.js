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

  /* ---- Hero : la photo du salon s'affiche d'abord ; au premier défilement, la vidéo prend le relais, en lecture immédiate ---- */
  const video = $('[data-video]'), vbtn = $('[data-video-toggle]'), arch = video && video.closest('.hero__arch');
  if (video && vbtn && arch) {
    const sync = () => {
      const paused = video.paused;
      vbtn.setAttribute('aria-label', paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause');
      vbtn.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
    };
    let started = false;
    const onScroll = () => { if (scrollY > 24) start(); };
    const start = () => {
      if (started) return; started = true;
      removeEventListener('scroll', onScroll);
      video.currentTime = 0;
      // lecture refusée (économie d'énergie) : la photo reste et le bouton ▶ apparaît
      video.play().catch(() => arch.classList.add('can-play'));
    };
    video.addEventListener('playing', () => arch.classList.add('is-video'));
    vbtn.addEventListener('click', () => { video.paused ? video.play() : video.pause(); });
    video.addEventListener('play', sync); video.addEventListener('pause', sync); sync();
    if (reduce) arch.classList.add('can-play');   // « réduire les animations » : pas de lecture automatique, le bouton ▶ suffit
    else { addEventListener('scroll', onScroll, { passive: true }); addEventListener('wheel', start, { passive: true, once: true }); addEventListener('touchmove', start, { passive: true, once: true }); onScroll(); }
    // économise la batterie quand la vidéo n'est plus visible
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !video.paused) { video.pause(); video.dataset.auto = '1'; } else if (e.isIntersecting && video.dataset.auto) { delete video.dataset.auto; video.play().catch(() => {}); } }).observe(video);
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

  /* ---- Boutique : au survol d'un produit, une petite fiche suit la souris (touche : un appui l'ouvre, clavier : le focus) ---- */
  const tip = $('[data-tip]');
  if (tip) {
    const spots = $$('.vitrine__spot');
    let cur = null, mode = 'follow', anchor = null, tx = 0, ty = 0, x = 0, y = 0, raf = 0, sy = 0;
    const fill = id => { if (cur === id) return; const tpl = $(`[data-product-card="${id}"]`); if (!tpl) return; tip.replaceChildren(tpl.content.cloneNode(true)); cur = id; };
    const target = () => {
      const w = tip.offsetWidth, h = tip.offsetHeight, m = 12;
      let px, py;
      if (mode === 'anchor' && anchor) {
        const r = anchor.getBoundingClientRect();
        px = r.left + r.width / 2 - w / 2; py = r.top - h - m; if (py < m) py = r.bottom + m;
      } else {
        px = tx + 24; py = ty + 24;
        if (px + w > innerWidth - m) px = tx - w - 24;
        if (py + h > innerHeight - m) py = ty - h - 24;
      }
      return [Math.min(Math.max(m, px), innerWidth - w - m), Math.min(Math.max(m, py), innerHeight - h - m)];
    };
    const tick = () => {
      const [px, py] = target();
      x += (px - x) * (reduce ? 1 : .2); y += (py - y) * (reduce ? 1 : .2);
      tip.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      raf = tip.classList.contains('is-on') && (Math.abs(px - x) > .4 || Math.abs(py - y) > .4) ? requestAnimationFrame(tick) : 0;
    };
    const show = (id, m, a) => {
      mode = m; anchor = a || null; sy = scrollY; fill(id);
      if (!tip.classList.contains('is-on')) { const [px, py] = target(); x = px; y = py; tip.style.transform = `translate3d(${x}px,${y}px,0)`; }
      tip.classList.add('is-on'); if (!raf) raf = requestAnimationFrame(tick);
    };
    const hide = () => tip.classList.toggle('is-on', false);
    spots.forEach(sp => {
      const id = sp.dataset.product;
      sp.addEventListener('pointerenter', e => { if (e.pointerType === 'touch') return; tx = e.clientX; ty = e.clientY; show(id, 'follow'); });
      sp.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(tick); });
      sp.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') hide(); });
      sp.addEventListener('focus', () => { if (sp.matches(':focus-visible')) show(id, 'anchor', sp); });
      sp.addEventListener('blur', hide);
      sp.addEventListener('click', () => { if (matchMedia('(hover: none)').matches) show(id, 'anchor', sp); });
    });
    addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !e.target.closest('.vitrine__spot')) hide(); });
    addEventListener('scroll', () => { if (mode === 'anchor' && tip.classList.contains('is-on') && Math.abs(scrollY - sy) > 60) hide(); }, { passive: true });
    addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
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
