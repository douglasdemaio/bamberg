---
name: language
description: Edit translations for the Bamberg Quest site. Use this skill whenever the user asks to add, edit, remove, or translate a string; mentions i18n, translations, locales, language files, missing translations, or a specific language (German, English, French, Italian, Spanish, Dutch, Czech, Portuguese, Swedish, Chinese, Hindi, Japanese, Turkish, Russian); asks to add a new translation key referenced by `data-i18n` in the HTML; or asks about `i18n/all.json`, `i18n/*.json`, or the site's 14-language support — even if they don't explicitly say "i18n".
---

# Bamberg Quest i18n

## The layout

Translations live in `i18n/`:

- One flat JSON file per language, keyed by dotted identifier: `i18n/de.json`, `i18n/en.json`, plus 12 more (`fr`, `it`, `es`, `nl`, `cs`, `pt`, `sv`, `zh`, `hi`, `ja`, `tr`, `ru`).
- A merged bundle `i18n/all.json` shaped `{ "de": {...}, "en": {...}, ... }` — this is what `js/i18n.js` fetches at runtime. It is **generated**; never hand-edit it.
- HTML markup binds strings via `data-i18n="some.key"`, `data-i18n-attr="placeholder:key,title:key"`, `data-i18n-html="key"`, etc. — see `js/i18n.js` for the full attribute set.

German (`de`) is the source-of-truth locale for the site; English (`en`) is the working reference. When adding a new key, always add it to both `de.json` and `en.json` at minimum.

## The two rules

### 1. Keys must exist in every language file

`js/i18n.js` falls back to the raw key string if a language is missing an entry, which surfaces to users as debug text like `nav.beerpass` in the UI. That is the failure mode we're avoiding.

Before finishing any i18n edit, verify parity across all 14 files. A quick check:

```bash
for f in i18n/*.json; do
  [ "$(basename "$f")" = "all.json" ] && continue
  printf "%s %d\n" "$(basename "$f")" "$(python3 -c 'import json,sys;print(len(json.load(open(sys.argv[1]))))' "$f")"
done
```

All non-`all.json` files should report the same count. If they don't, the divergence is the bug — find the missing keys and fill them in.

### 2. `i18n/all.json` must be rebuilt after any change

The runtime only reads `all.json`. Editing `de.json` alone changes nothing users see until you regenerate the bundle. Run this from the repo root (it's the exact one-liner in `CLAUDE.md`):

```bash
node -e 'const fs=require("fs");const langs=["de","en","fr","it","es","nl","cs","pt","sv","zh","hi","ja","tr","ru"];const r={};langs.forEach(l=>{r[l]=JSON.parse(fs.readFileSync("i18n/"+l+".json","utf-8"))});fs.writeFileSync("i18n/all.json",JSON.stringify(r))'
```

Output is a single minified line, no trailing newline — do not reformat it.

## Common tasks

### Adding a new string

1. Pick a dotted key that fits existing conventions (`nav.*`, `site.*`, `index.*`, `plan.*`, `passport.*`, page-scoped prefixes).
2. Add the entry to `i18n/de.json` and `i18n/en.json` first — these are the reference translations.
3. Add the same key to the other 12 files. If the user hasn't provided translations, use the English string as a placeholder and flag it clearly in your reply so they know which languages still need real translations. Do **not** silently leave the key out of a language file — that breaks rule 1.
4. Wire the key into the HTML via `data-i18n="your.key"` (or `data-i18n-attr` / `data-i18n-html` when needed — see `js/i18n.js`).
5. Rebuild `i18n/all.json`.

### Editing an existing string

1. Read the key in every language file that has it (use `grep -l '"your.key"' i18n/*.json` to be sure of the set).
2. Apply the edit in each language.
3. Rebuild `all.json`.

### Removing a string

1. Confirm no HTML or JS still references the key: `grep -rn 'your.key' index.html collection.html passport.html party.html plan.html trails.html site.html trail.html 404.html js/`.
2. If clean, delete the key from all 14 language files.
3. Rebuild `all.json`.

### Adding a new language

1. Create `i18n/<code>.json` with a translation for **every** key present in `de.json` (parity is not optional — see rule 1).
2. Add the two-letter code to the `langs` array in the rebuild one-liner above (and in `CLAUDE.md`, and anywhere else it appears, e.g. the language selector in `js/shared.js`).
3. Rebuild `all.json`.

## Style notes for translations

- Keep punctuation and casing consistent with the source language's conventions, not a mechanical copy of the English.
- Preserve inline HTML/emoji in the source string (e.g. `"🏅 …"`, `"← …"`) — the strings render as-is.
- If a source string contains a placeholder like `{n}` or `{name}`, keep it verbatim in every translation.

## What to hand back

After any i18n change, tell the user:
1. Which keys changed and in which languages.
2. Any languages where you used a placeholder translation and need a real one.
3. That `i18n/all.json` was rebuilt (or that they need to rebuild it if the environment blocked `node`).
