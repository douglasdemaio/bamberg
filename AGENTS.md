## Development

This is a vanilla HTML/JS/CSS site with no build step. Serve with any static file server:

```
python3 -m http.server 8080
```

Or use the live-reload option (requires `lite-server` or similar):

```
npx serve .
```

## Project Structure

- `index.html` — Homepage (map, progress, site cards)
- `collection.html` — Collection/map view with export/import
- `passport.html` — Beer passport / brewery stamps
- `party.html` — Party unlock page
- `plan.html` — Visit planning info
- `trails.html` — Curated walking trails overview
- `site.html` — Individual site detail (pass `?slug=` query param)
- `trail.html` — Individual trail detail (pass `?slug=` query param)
- `data/sites.json` — All 34+ sight records
- `data/trails.json` — Curated trail definitions
- `css/style.css` — Global styles / CSS custom properties
- `js/game.js` — Game logic (localStorage claims, answer checking)
- `js/i18n.js` — Internationalization engine (fetches `i18n/all.json`)
- `js/shared.js` — Theme toggle and language selector

## Editing Data

- Add/edit sights in `data/sites.json`
- Add/edit trails in `data/trails.json`
- Add/edit translations in `i18n/*.json` (one per language), then rebuild the merged `i18n/all.json` with:
  ```
  node -e 'const fs=require("fs");const langs=["de","en","fr","it","es","nl","cs","pt","sv","zh","hi","ja","tr","ru"];const r={};langs.forEach(l=>{r[l]=JSON.parse(fs.readFileSync("i18n/"+l+".json","utf-8"))});fs.writeFileSync("i18n/all.json",JSON.stringify(r))'
  ```

## Key Principles

- No build step, no npm, no dependencies
- All progress stored client-side in localStorage
- Privacy-first: no account, no tracking, no server
- 14 languages supported via `data-i18n` attributes
- Light/dark theme via `data-theme` attribute on `<html>`

## Adding Pages

Create a new `.html` file with the shared boilerplate (topbar, theme toggle, lang select, script includes) and link it from navigation on other pages.
