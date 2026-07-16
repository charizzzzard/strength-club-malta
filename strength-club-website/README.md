# Strength Club Malta website mockup

Static, production-oriented one-page mockup for Strength Club Malta. The site uses semantic HTML, plain CSS and vanilla JavaScript. It has no build step and no runtime dependencies beyond the two Google Fonts requested in the brief.

## Run locally

Open `index.html` directly in a browser, or serve the folder locally:

```bash
cd strength-club-website
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

On Windows, if `python3` is not available, use:

```powershell
python -m http.server 8000
```

## Design tokens

All core tokens are CSS custom properties at the top of `css/styles.css`:

- `--ink: #15140F` — primary dark surface and text
- `--stone: #DCD4C2` — Globigerina limestone surface and dark-theme text
- `--stone-soft: #E7E1D3` — light cards on Stone
- `--grotto: #2F4C63` — restrained links, wayfinding and detail accent
- `--live: #3FA96A` — live occupancy UI only
- `--font-display` and `--font-body` — Archivo
- `--font-mono` — IBM Plex Mono for data, labels and wayfinding

## Replacing the image placeholder

The architectural image placeholder uses the `.media-placeholder` class in `index.html`. Replace that element with a responsive `<picture>` or `<img>` when final photography is available. Keep the current aspect, caption treatment and descriptive alternative text to avoid layout shift and preserve accessibility.

The inline Open Ring SVG is used in the navigation and footer. The favicon is the same mark encoded as an SVG data URI, so no binary assets are required.
