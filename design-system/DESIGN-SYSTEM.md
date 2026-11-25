# Le Studio — Design system v1.0

Le design system du site de **Le Studio — Barber Shop**, 4 rue de la Poste, 22970 Ploumagoar.
Tout part du salon : des murs noirs, le granit d'origine, deux miroirs en arche, des anneaux de lumière au plafond, le monogramme LS sur les capes et les t-shirts, et l'or cuivré de la story « Horaires ».

| Fichier | Rôle |
|---|---|
| `tokens.css` | Jetons : couleurs, typographie, espacement, formes, lumière, mouvement |
| `components.css` | Composants `ls-*`, utilisent uniquement les jetons |
| `index.html` | Guide de style visuel (ouvrir dans un navigateur) |
| `../assets/img`, `../assets/video` | Photos et vidéo du salon, tirées des stories Instagram |

---

## 1. Principes

1. **Le noir d'abord.** Le fond est noir comme les murs. Le texte est ivoire ; pas de gris moyen.
2. **L'arche.** C'est la seule forme courbe du système, tirée des miroirs. Elle cadre la photo ou la vidéo principale, jamais un bouton.
3. **La lumière plutôt que l'ombre.** Sur du noir, on éclaire : anneau néon (`--glow-neon`) et lueur dorée (`--glow-gold`) au lieu des ombres portées.
4. **L'or avec retenue.** L'or cuivré sert à l'action principale, aux prix et aux heures. Moins de 5 % d'un écran.

## 2. Jetons

### Couleurs

Les composants n'utilisent que les jetons sémantiques `--color-*`.

| Jeton | Valeur | Usage | Contraste sur `--color-bg` |
|---|---|---|---|
| `--color-bg` | `#0A0A0B` | Fond de page | — |
| `--color-surface` | `#111113` | Panneaux, champs | — |
| `--color-surface-2` | `#19191C` | Cartes, fonds d'image | — |
| `--color-surface-hover` | `#242428` | Survol de surface | — |
| `--color-text` | `#F4F1EA` | Tout le texte courant | 17,5:1 |
| `--color-text-muted` | `#A29D93` | Descriptions, méta | 7,3:1 |
| `--color-text-faint` | `#6F6B64` | Déco, désactivé, texte ≥ 24 px seulement | 3,7:1 |
| `--color-accent` | `#C9A26B` | Bouton principal, prix, heures, icônes | 8,4:1 |
| `--color-accent-hover` | `#E2C595` | Survol, anneau de focus | — |
| `--color-accent-press` | `#9C7A48` | État pressé | — |
| `--color-on-accent` | `#0A0A0B` | Texte sur or | 8,4:1 sur l'or |
| `--color-line` / `-strong` / `-accent` | ivoire 12 % / 28 %, or 55 % | Filets | — |
| `--color-success` / `--color-danger` | `#8CC29A` / `#E2796A` | Ouvert / erreur | 6,8:1 (erreur) |

Matières (photo et illustration seulement) : granit `#B9AD99` / `#7D7262`, chêne `#B08A62`.

### Typographie

| Famille | Jeton | Pourquoi | Usage |
|---|---|---|---|
| Bodoni Moda (400, 500, italique 400) | `--font-display` | Le contraste fin/épais du monogramme LS | Titres, noms de prestations, signature « LE STUDIO », « À très vite ! » |
| Manrope (400, 500, 600) | `--font-sans` | La sobriété géométrique de l'enseigne | Texte, boutons, navigation, surtitres |

| Style | Classe | Taille 390 → 1440 |
|---|---|---|
| Display | `.ls-display` | 56 → 144 |
| H1 | `.ls-h1` | 40 → 88 |
| H2 | `.ls-h2` | 32 → 56 |
| H3 | `.ls-h3` | 22 → 28 |
| Signature | `.ls-caps` | 18 → 24, capitales, interlettrage 0,32 em |
| Lead | `.ls-lead` | 18 → 20 |
| Corps | `body` | 16 / 1,65 |
| Petit | `.ls-small` | 14 |
| Surtitre | `.ls-label` | 12, Manrope 600, capitales, or |

Règles : titres en 400, jamais en gras. Capitales Bodoni à 18 px minimum ; en dessous, surtitre Manrope. Chiffres tabulaires pour heures et prix. 62 caractères par ligne au plus.

### Espacement, formes, mouvement

- **Espacement** base 4 : `--space-1` à `--space-11` (4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192). Gouttière `--gutter` 20 → 80. Conteneur 1280 px. Section `--section-y` 96 → 192.
- **Rayons** : `--radius-none` (photos, cartes), `--radius-sm` 2 px (boutons, champs), `--radius-arch` (arche), `--radius-round` (néon, pastilles).
- **Mouvement** : 150 ms (couleur, soulignement), 250 ms (boutons, cartes), 600 ms (zoom photo), 1100 ms (entrée du hero, une fois). Courbes `--ease-out` et `--ease-in-out`. Tout s'arrête avec `prefers-reduced-motion`.

## 3. Logo

| Version | Usage | Taille minimale |
|---|---|---|
| Arc (LE STUDIO en arc, LS, BARBERSHOP) | Couverture, pied de page, réseaux | 160 px de large |
| Horizontal (`.ls-logo`) | Navigation | 32 px de haut |
| Monogramme LS | Favicon, avatar, filigrane | 24 px |

Ivoire sur noir ou noir sur ivoire. Jamais en or, jamais sur l'or, jamais incliné, déformé ou ombré.

Fichiers SVG vectorisés (tracés, aucune police requise) dans `assets/logo/` : `ls-logo-arc.svg`, `ls-logo-horizontal.svg`, `ls-monogramme.svg`, chacun en version ivoire et `-noir`, plus `favicon.svg`. Redessinés en Bodoni Moda et Manrope à partir du logo du salon.

## 4. Composants

### Bouton — `.ls-btn`

| Variante | Classe | Usage |
|---|---|---|
| Primaire | `.ls-btn--primary` | L'action « Réserver » uniquement. Un seul par écran. |
| Secondaire | `.ls-btn--secondary` | Itinéraire, horaires, Instagram |
| Lien | `.ls-link`, `.ls-link--arrow` | Liens dans le texte, « Voir tout » |

| Taille | Classe | Hauteur |
|---|---|---|
| Petite | `.ls-btn--sm` | 44 px (navigation) |
| Normale | — | 52 px |
| Grande | `.ls-btn--lg` | 60 px (dernier écran) |
| Pleine largeur | `.ls-btn--block` | barre mobile |

| État | Visuel | Comportement |
|---|---|---|
| Repos | Or plein, texte noir | — |
| Survol | Or clair, lueur dorée, monte de 1 px, flèche +3 px | 250 ms |
| Pressé | Or profond, descend de 1 px, échelle 0,985 | — |
| Focus clavier | Anneau or clair 2 px, décalé 3 px | Instantané |
| Chargement | `aria-busy="true"` : texte masqué, cercle qui tourne | Non cliquable |
| Désactivé | `disabled` ou `aria-disabled="true"` : opacité 40 % | Non cliquable |

Accessibilité : `<a>` pour aller quelque part (Planity, Maps), `<button>` pour une action. Libellé = verbe + objet. Un lien externe vers Planity s'ouvre dans le même onglet.

```html
<a class="ls-btn ls-btn--primary" href="https://www.planity.com/le-studio-barber-shop-22970-ploumagoar">
  Réserver sur Planity <svg aria-hidden="true"><use href="#i-arrow"/></svg>
</a>
```

| ✅ À faire | ❌ À éviter |
|---|---|
| Un seul bouton or par écran | Deux boutons primaires côte à côte |
| « Réserver sur Planity » | « Cliquez ici », « En savoir plus » |
| Capitales espacées Manrope | Bouton arrondi en pilule ou en arche |

### Arche — `.ls-arch`

Cadre photo ou vidéo à sommet arrondi. Propriété `--ratio` (défaut `3 / 5`). Variante `.ls-arch--outline` : filet or décalé de 10 px. Dans un lien, la photo zoome à 1,03 au survol. Une seule arche en vedette par écran.

### Anneau néon — `.ls-neon`

Décor uniquement (`aria-hidden="true"`). `--size` règle le diamètre. `--tilt` le montre en perspective comme au plafond ; `--flicker` l'allume une fois au chargement.

### Ornement — `.ls-divider`

Filet, ciseaux, filet (repris de la story). Variante `--short` (320 px max). Sépare un titre et un bloc d'info, jamais deux sections.

### Horaires — `.ls-hours`

`<dl>` avec une ligne `.ls-hours__row` par plage, attribut `data-days` (0 = dimanche). Le script marque le jour en cours (`.is-today`) et remplit l'état `.ls-status` (« Ouvert / Fermé en ce moment », heure de Paris). Fermé : `.ls-hours__row--closed`.

Horaires officiels : mardi au vendredi 9h–13h, 14h–19h ; samedi 9h–13h, 14h–18h ; dimanche et lundi fermé.

### Lignes de prix — `.ls-price-list` > `.ls-price-row`

Nom (Bodoni, H3), prix (or, chiffres tabulaires), description optionnelle (`__desc`). Un filet sous chaque ligne.

### Carte produit — `.ls-product`

Photo 3:4, marque (surtitre), nom (Bodoni 20), prix (or). Info en plus avec `.ls-tag` (« 7 senteurs »). Survol : la carte monte de 2 px, la photo zoome à 1,03.

### Carte prestation — `.ls-service`

Arche 4:5, numéro italique or, titre H3, une phrase.

### Champ — `.ls-field` / `.ls-input`

Libellé visible au-dessus, champ 52 px, texte 16 px. Erreur : `aria-invalid="true"` + `.ls-field__error` relié par `aria-describedby`, message qui dit quoi écrire.

### Navigation — `.ls-nav` et `.ls-actionbar`

Barre noire opaque 76 px, filet dessous, logo à gauche, 4 liens (Prestations, Le salon, Boutique, Venir), bouton « Réserver » à droite. Sous 768 px, les liens passent dans un menu et la barre `.ls-actionbar` affiche « Réserver sur Planity » en bas d'écran.

## 5. Icônes

Grille 24 px, trait 1,4 px, extrémités arrondies, couleur `--color-accent`. Jeu actuel : ciseaux, lame, peigne, calendrier, horloge, adresse, boutique, Instagram, flèche. Toujours `aria-hidden="true"` à côté d'un texte.

## 6. Direction photo

- Uniquement le vrai salon et la vraie équipe. Pas de banque d'images.
- Noir dominant, granit en contrepoint, l'anneau lumineux dans le cadre si possible. Format vertical 3:4 ou arche.
- À éviter : filtres colorés, texte incrusté, coins arrondis hors arche.
- **À refaire :** les images actuelles sortent de stories (483 px de large). Pour la mise en ligne, prévoir une séance photo et une vidéo en 1080p minimum.

## 7. Ce qu'il manque

| Élément | Pourquoi |
|---|---|
| Tarifs réels des prestations | Le site affiche des prix provisoires |
| Photos et vidéo en haute définition | Les stories sont en basse résolution |
| Téléphone / e-mail (si souhaité) | Absents du brief |
