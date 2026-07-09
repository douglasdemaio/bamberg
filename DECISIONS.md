# DECISIONS.md

Every open choice made during the build, with the reason.

---

## Stack

- **Astro 7** over Next.js — lighter static output, zero-JS-by-default, better content-site ergonomics, simpler progressive enhancement path.
- **No custom font loading** — system font stack (`Gill Sans`/`Fira Sans`/`Iowan Old Style`) saves ~100 KB+ over web fonts and meets the 150 KB first-load budget. The blackletter/display face for seal badges is deferred to a later step when the weight budget allows.
- **No Tailwind** — inline `<style>` per component keeps CSS co-located, zero build overhead, smaller output. The palette is already defined in CSS custom properties.

## Data model

- **`sites.json` at project root** — editable by a non-engineer without touching Astro source. Astro imports it directly.
- **`verified: false` on all records** — honest about unconfirmed data rather than silently shipping guesses. The NEEDS-VERIFICATION.md lists every gap.
- **`hours` as bilingual string** — not structured data. Simpler to edit, and the guidebook pages display them verbatim. A structured schema can be layered on later.

## Site selection (10 seed sites)

- **A1 (Dom), A3 (Kloster St. Michael), A5 (Obere Pfarre)** — three from the Seven Hills because that category is the city's backbone.
- **B1 (Neue Residenz), B7 (Altes Rathaus)** — two from Stone & Power to contrast princely and civic power.
- **C1 (Klein Venedig), C2 (Untere Brücke)** — two from Water & Rivers because the bridges and fishermen's houses are the most-photographed motif.
- **D1 (Schlenkerla)** — required by spec, the most famous brewery.
- **E1 (Gärtner- und Häckermuseum)** — represents the overlooked Gärtnerstadt half of UNESCO.
- **F8 (Zentrum Welterbe)** — the tutorial site, free entry, always open.

## Game mechanics (steps 3-5)

- **Riddle disclosure uses `<details>`** — native HTML, no JS required to reveal. Progressive enhancement at its simplest.
- **Honor tap always available** — some people are on holiday and don't want a quiz. No penalty, just a marker on the card.
- **Answer matching** — case-insensitive, umlauts normalized (ß→ss, ä→ae, etc.), numerals accepted as words. Generous matching reduces frustration.
- **Claim stored as `{slug: {claimed, method, timestamp}}`** — simple key-value in localStorage. Export/import via base64 or QR is deferred to step 10.
- **No Gold-tier chaining yet** — `requires_claimed` field is in the data model but unused. Full cipher-chain implementation is deferred to step 10.

## Collection screen (step 4)

- **Tile grid instead of illustrated map** — a full 1810-style illustrated plan is the endgame visual reward. The tile grid is a lighter v1 that still communicates the "restoring map" metaphor. Replacing tiles with a real illustrated map is a visual upgrade, not a rewrite.

## Missing from v1 seed

- Photos — all `null`. Wikimedia Commons sourcing is deferred as it's mechanical work that doesn't affect architecture.
- Offline service worker — deferred to step 9.
- Beer passport — deferred to step 6.
- Trails — deferred to step 7.
- Legendary unlocks — deferred to step 10.
- Export/party codes — deferred to step 10.
