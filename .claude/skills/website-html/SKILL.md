---
name: website-html
description: Edit or add HTML pages in the Bamberg Quest site (vanilla HTML/JS/CSS, no build step). Use this skill whenever the user asks to modify or add any of `index.html`, `collection.html`, `passport.html`, `party.html`, `plan.html`, `trails.html`, `site.html`, `trail.html`, `404.html`; add a new page or nav link; adjust the topbar, theme toggle, or language selector; touch styles in `css/style.css`; wire up localStorage-backed progress; or change anything user-visible in the site's markup. Trigger even if the user only names a specific page or says "the homepage", "the passport page", etc. — do NOT trigger for `data/*.json` sight data or `i18n/*.json` translation edits (those are separate concerns).
---

# Bamberg Quest — HTML editing

## The constraints that shape everything

This site is deliberately anti-modern:

- **No build step, no npm, no bundler, no framework.** Any `.html` file you write is served verbatim by a static file server. There is no compile, no JSX, no template engine.
- **No external runtime dependencies.** No CDN scripts, no Google Fonts loaders, no analytics tags. Fonts live locally; scripts live in `js/`.
- **All state is client-side.** Progress, theme, language — everything is `localStorage`. There is no server, no account, no tracking.
- **Every user-visible string is translated.** Hardcoded German or English in markup is a bug; strings go through `data-i18n`.

If a proposed change violates any of these, it's the wrong change. Push back or route the strings through the existing mechanisms.

## The shared boilerplate every page needs

Look at any existing page (`index.html` is a good reference) for the exact structure. In brief, every page has:

### `<head>`

- `<meta charset>`, `<meta viewport>`, `<meta color-scheme>`, `<meta theme-color>` (both light and dark variants).
- `<title>` and `<meta name="description">` — these are the only two places where a German or English string is hardcoded (SEO). Pick the site's primary language (German).
- `<link rel="stylesheet" href="/css/style.css">` and favicon links.
- An **inline pre-paint script** that reads `localStorage.getItem('bq-theme')` and `localStorage.getItem('bq-lang')` and sets `document.documentElement.dataset.theme` and `.lang` before the page renders. This prevents a flash of the wrong theme. Copy it verbatim from `index.html`; do not move it to an external file (it must run before the stylesheet paints).

### `<body>`

- The topbar (site title, nav links, theme toggle, language `<select>`). Copy the structure from an existing page — the nav links, theme-toggle button, and language selector are wired up by `js/shared.js`, so their IDs/classes matter.
- Main content wrapped in appropriate semantic elements.
- At the bottom, before `</body>`: `<script src="/js/i18n.js"></script>`, `<script src="/js/shared.js"></script>`, and any page-specific script (e.g. `<script src="/js/game.js"></script>` where relevant).

If you're adding a new page, the fastest correct path is to copy `index.html` (or `plan.html` for a simpler body) and edit the middle. Do not attempt to reconstruct the head/topbar from memory — the pre-paint script and localStorage key names (`bq-theme`, `bq-lang`) must match exactly, or the theme and language persistence break.

## `data-i18n` — how strings work

Every user-visible string in the DOM must be a translation key, not a literal:

```html
<!-- wrong -->
<h1>Karte</h1>

<!-- right -->
<h1 data-i18n="nav.map">Karte</h1>
```

The fallback text inside the element (the "Karte" above) is what shows if `js/i18n.js` fails to load or the key is missing. Keep it in German (the source language) so a script-blocked visitor still sees a coherent page.

Other attributes:
- `data-i18n-attr="placeholder:key,title:key,aria-label:key"` — translate specific attributes.
- `data-i18n-html="key"` — use when the translation contains inline HTML (rare; prefer `data-i18n`).

Whenever you add a translated string, invoke the `language` skill (or follow its rules manually) to add the key to all 14 language files and rebuild `i18n/all.json`. Adding a `data-i18n` attribute without adding the key surfaces the raw key string to users.

## Theming

- Themes are `data-theme="light"` or `data-theme="dark"` on `<html>`.
- All colors live in CSS custom properties in `css/style.css`, defined once for light and overridden in a `[data-theme="dark"]` block. Never hardcode a color in a page's inline `<style>`; add a variable if you need a new one.
- The theme toggle button reads `localStorage.getItem('bq-theme')` and flips the `data-theme` attribute — `js/shared.js` handles this. Don't reimplement it per page.

## localStorage keys

Existing keys (do not collide with these):

- `bq-theme` — `"light"` | `"dark"`
- `bq-lang` — two-letter language code
- `bq-claims-v1` (and friends) — game progress; managed by `js/game.js`

For any new persisted state, prefix the key with `bq-` and version it (`bq-<feature>-v1`) so future migrations are easier.

## Adding a new page

1. Copy `plan.html` (simpler) or `index.html` (fuller) as your starting point.
2. Change `<title>`, `<meta description>`, and the main content. Leave the head scripts, topbar, and bottom scripts untouched unless you have a specific reason.
3. Add a `data-i18n` translation key for every new user-visible string, and add those keys to all 14 language files (see the `language` skill).
4. Add a nav link to the new page **in every existing page's topbar** — the topbar is duplicated across pages, not shared via includes. Grep the current pages for the shape of the nav-links list and mirror it.
5. If the page needs URL parameters (like `site.html?slug=...` or `trail.html?slug=...`), parse `location.search` in a page-specific script; there is no router.

## When editing existing pages

- Preserve the structure. If the topbar boilerplate in `index.html` differs from what you're editing, it's usually because that page's boilerplate is stale — bring it in line rather than diverging further.
- Keep page-specific styles inline in a `<style>` block near the top of the page (that's the established pattern for one-page-only CSS). Move a rule into `css/style.css` only if two or more pages need it.
- If you're changing the topbar, theme toggle, or language selector, change it in **all** pages that have it. A grep like `grep -l 'class="site-header"' *.html` finds the set.

## Testing your change

There is no test suite. To verify a change works:

```bash
python3 -m http.server 8080
```

Then open the affected page in a browser and check:
1. It renders in both light and dark mode (toggle it).
2. It renders in at least German and English (switch the language selector).
3. No console errors.
4. localStorage-backed state (progress, theme, language) survives a reload.

Report explicitly if you couldn't open a browser to verify — don't claim success from a static file diff alone.

## What to hand back

After any HTML edit, tell the user:
1. Which pages changed and what changed in each.
2. Any new `data-i18n` keys added (and confirm the `language` skill work is done, or flag it as still needed).
3. Whether you verified the page in a browser, or only that the diff looks right.
