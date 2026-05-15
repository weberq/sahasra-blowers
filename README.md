# Sahasra Blowers — Website

Static marketing site for **Sahasra Blowers**, an industrial blower & ventilation
fabrication workshop in IDA Jeedimetla, Hyderabad.

Live: <https://sahasra-blowers.weberq.in/>

## Stack

Plain HTML / CSS / vanilla JS. No framework, no build step required for the
website itself. Optimised for fast load on slow connections (Lighthouse target
90+ Performance, 95+ SEO).

## Folder layout

```
/
├── index.html
├── styles/
│   ├── base.css         design tokens, reset, type, layout primitives
│   ├── components.css   nav, hero, products, process, about, contact, footer
│   └── gallery.css      masonry grid + lightbox
├── scripts/
│   ├── main.js          nav toggle, scroll reveal, footer year
│   ├── gallery.js       loads manifest, renders grid, lightbox
│   └── build-gallery.mjs scans assets/gallary/ and rebuilds manifest.json
├── assets/
│   ├── img/             optimised hero / product / capability photos (jpg+webp)
│   ├── sahasra v2/      original full-size workshop photos (do not modify)
│   └── gallary/         photos shown in the “Our Work” gallery + manifest.json
├── sitemap.xml
├── robots.txt
└── .github/workflows/   CI — auto-rebuilds the gallery manifest on push
```

## Updating the gallery

1. Drop new photos into `assets/gallary/` (any `.jpg`, `.jpeg`, `.png`, `.webp`).
2. Run:
   ```bash
   npm run gallery
   # or:
   node scripts/build-gallery.mjs
   ```
3. Commit and push. (The manifest also rebuilds automatically via GitHub Actions
   on every push to `main`, so step 2 is optional.)

The script preserves any custom `caption` and `fit` values you have already
written into `manifest.json` for an existing filename — it only adds new files
and removes ones that have been deleted.

### Per-image options (in `manifest.json`)

```jsonc
{
  "file": "08-large-stainless-blower-scale.jpg",
  "caption": "Large stainless centrifugal blower …",
  "fit": "contain",        // "contain" (default) or "cover"
  "featured": true          // optional flag for future “featured” surfaces
}
```

Use `"fit": "contain"` for product / technical shots — keeps the full unit
visible. Use `"cover"` for ambient or workshop atmosphere photos.

## Site values — single place to edit

All the headline numbers (years in operation, units delivered, etc.) are stored
in **one file**: [`site.json`](site.json) at the repo root.

```jsonc
{
  "YEAR_ESTABLISHED":    "1992",
  "YEARS_IN_OPERATION":  "23+",
  "UNITS_DELIVERED":     "9000+",
  "INDUSTRIES_SERVED":   "15+",
  "REPEAT_CLIENTS":      "80%"
}
```

Include any suffix you want (`+`, `%`, etc.) directly in the value — the
template prints the value verbatim. For example, `"REPEAT_CLIENTS": "80%"`
renders as `80%`.

Edit the file, save, refresh the page — the values appear wherever `{{KEY}}`
tokens are used in [`index.html`](index.html). Leave a value empty (`""`) and
the page will keep showing the placeholder so you remember to fill it in.

Keys currently consumed by the page:

| Key | Where it appears |
| --- | --- |
| `YEAR_ESTABLISHED`    | nav subtitle, hero meta |
| `YEARS_IN_OPERATION`  | hero stats, trust strip, about copy |
| `UNITS_DELIVERED`     | hero stats, trust strip |
| `INDUSTRIES_SERVED`   | trust strip |
| `REPEAT_CLIENTS`      | trust strip |

To add a new substitutable value, add the key to `site.json` and reference it
in `index.html` as `{{YOUR_KEY}}`. No other code change is needed.

## Local preview

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## License

Content © Sahasra Blowers. Code © 2026 Sahasra Blowers.
