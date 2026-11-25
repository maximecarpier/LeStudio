# Le Studio — Barber Shop (Ploumagoar)

Site vitrine statique : HTML, CSS, JS, aucune compilation.

- `index.html` : le site
- `assets/css/site.css`, `assets/js/site.js` : mise en page et interactions
- `assets/logo/` : logos SVG (arc, horizontal, monogramme, favicon)
- `assets/img/`, `assets/video/` : photos et vidéo du salon
- `design-system/` : jetons, composants, guide de style (`design-system/index.html`) et doc

Aperçu local :

```bash
python3 -m http.server 8000
```

puis ouvrir http://localhost:8000.

À remplacer avant la mise en ligne : les prix des prestations (provisoires, repérés par `data-assumed` dans `index.html`), les photos et la vidéo en HD, et l'adresse du site dans la balise `canonical`.
