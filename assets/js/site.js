/* Le Studio — interactions du site */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---- Vidéo : pause/lecture, et à l'arrêt sous « réduire les animations » ---- */
  const video = $('[data-video]'), vbtn = $('[data-video-toggle]');
  if (video && vbtn) {
    const sync = () => {
      const paused = video.paused;
      vbtn.setAttribute('aria-label', paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause');
      vbtn.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
    };
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
    vbtn.addEventListener('click', () => { video.paused ? video.play() : video.pause(); });
    video.addEventListener('play', sync); video.addEventListener('pause', sync); sync();
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
