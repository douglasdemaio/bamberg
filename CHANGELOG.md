# Changelog

## 2026-09-03 — "Raus aus der Altstadt" (Beyond) tab added

**New page:** `beyond.html` — five destinations around Bamberg reachable by bus from the ZOB, with departure boards (timetable, not realtime), a Linienpass stamp card, and Bus-Roulette.

**New scripts:**
- `scripts/build-transit.js` — Node.js build step that downloads the VGN GTFS feed (`https://www.vgn.de/opendata/GTFS.zip`), parses `stops/routes/trips/stop_times/calendar/calendar_dates`, and emits `data/transit.json`.
- `js/beyond.js` — page logic: loads `transit.json` + `sites.json`, renders the five destination cards sorted by fastest journey, drives the Bus-Roulette.
- `js/linienpass.js` — stamp card using `localStorage` (`bamberg-quest-claims-<slug>`) with `method: "linienpass"` semantics, self-reported.

**New data:** `data/transit.json` (generated 2026-09-03) — per-destination first/last departure, trip count, average headway and journey time for each line, split by weekday/Saturday/Sunday.

**Destinations (5):** Bambados (920/935/936), Schloss Seehof (907/917/927), ERBA (910), Bruderwald (937/918), Altenburg (906/938). Boarding at Bamberg ZOB.

**New POIs added to `data/sites.json`:**
- `a11` Schloss Seehof (category `b`, subcategory `palaces`, tier `silver`) — coords 49.9269, 10.9478.
- `c7` Bambados (category `c`, subcategory `water`, tier `bronze`) — coords 49.9123, 10.9215.
- `d18` Bruderwald (category `d`, subcategory `nature`, tier `bronze`) — coords 49.9087, 10.9491.

(Altenburg and ERBA-Park already existed as `a8` and `d17` and are cross-linked, not duplicated.)

**Nav:** "Raus aus der Altstadt" link added to `index.html` and `collection.html` (`nav.beyond` in all 14 languages). Beyond-specific strings added to `de.json` and `en.json`; `i18n/all.json` rebuilt.

### VGN / VAG data attribution and caveats

- GTFS feed (2026-06-24) used as-is. **VAG PULS API does not cover Bamberg** — only Nürnberg-region stops. So departure boards are **scheduled times (Fahrplan), not live/real-time (Echtzeit).**
- **Data licensing:** VGN/VAG open data is CC BY 3.0. Attribution line on the page and in `data/transit.json` (`source`, `source_url`, `attribution`).
- **Privacy:** no requests to a live service; the timetable is bundled, shown locally. This keeps the transit integration out of-server and avoids a TTDSG/DSGVO consent-layer interaction.

### Verification

| Fact | Source |
|------|--------|
| Stop IDs resolved from VGN GTFS `stops.txt` | GTFS feed |
| Journey times (ZOB → destination) computed from GTFS `stop_times` | GTFS feed |
| Routing assumptions (246 days/weekday/Sun) | GTFS `calendar.txt` |
| Boarding at Bamberg ZOB (`de:09461:20200:0:*`) | GTFS feed |

## 2026-09-03 — St. Heinrich (a10) added

**Entry:** `data/sites.json` — id `a10`, slug `st-heinrich`, category `a` (churches), tier `silver`

**Coordinates:** 49.904, 10.909 (Eugen-Pacelli-Platz 1, 96052 Bamberg). Resolved from kirchbau.de and Wikidata (49°54'14.760"N, 10°54'32.472"E).

### Verified against second sources

| Fact | Primary source | Corroborating sources |
|------|---------------|----------------------|
| Built 1927–1929 | Vielfalt der Moderne | Parish website (sb-bamberger-osten.de), DeWiki, kirchbau.de, NDB article |
| Architect: Michael Kurz | Vielfalt der Moderne | Wikipedia (Michael Kurz), NDB, GND, kirchbau.de |
| Hans Döllgast collaboration | Vielfalt der Moderne | DeWiki, NDB article |
| Reinforced concrete structure | Vielfalt der Moderne | DeWiki, kirchbau.de ("Eisenbeton-Skelettbau") |
| Quarry stone from Winterhausen | Vielfalt der Moderne | NDB ("archaisch-expressives Bruchsteinmauerwerk") |
| Two towers, 35 m, square, rotated 45° | Vielfalt der Moderne | kirchbau.de ("diagonal gestellte Fassadentürme"), DeWiki |
| Statue by Heinrich Söller | Vielfalt der Moderne | No second source found — rests on Vielfalt alone |
| Nine arched concrete piers per side | Vielfalt der Moderne | DeWiki ("neun gewölbte Betonpfeiler"), kirchbau.de |
| Apostle mosaics on pilasters | Vielfalt der Moderne | DeWiki |
| Zollinger timber roof | Vielfalt der Moderne | kirchbau.de ("Zollingerdach"), Straße der Moderne |
| Early Weimar exposed-concrete church | Vielfalt der Moderne | DeWiki, kirchbau.de ("erste bedeutende Sichtbeton-Kirche") |
| WWII destruction of Stations of the Cross | Vielfalt der Moderne | No second source found — rests on Vielfalt alone |
| Mosaic replacement 1948 | Vielfalt der Moderne | No second source found — rests on Vielfalt alone |
| 1968 chancel remodelling by Hans Schädel | Vielfalt der Moderne | Parish website, kirchbau.de ("1968/68 Umgestaltung des Chorraumes") |
| Foundation stone 12 June 1927 | Parish website | DeWiki |
| Consecrated 8 September 1929 | Parish website | DeWiki, Vielfalt der Moderne |
| Originally planned as Holy Trinity | Parish website | DeWiki |
| Cost 585,000 Reichsmark | Parish website | DeWiki |
| 680 seats | kirchbau.de | — |
| Dimensions 61 × 21 m | Vielfalt der Moderne | DeWiki, kirchbau.de |
| Denkmalliste D-4-61-000-138 | Wiki list Baudenkmäler | — |

### Opening times

Checked 3 September 2026 via sb-bamberger-osten.de (parish website) and kirchbau.de:
- **Daytime:** open during the day ("tagsüber geöffnet")
- **Interior access:** not guaranteed outside service times
- **Sunday services:** 9:00, 10:30, 18:00 (schwabenmedia.de)
- **Saturday vigil:** 17:30 (parish website schedule)

### Not added to any trail

St. Heinrich is in Bamberg-Ost, outside the Altstadt core. No existing trail passes through this area. Could anchor a future "Bamberg-Ost" trail (Malerstele, St. Heinrich, Hainpark).

### Notes

- The Söller statue and the WWII destruction of the Stations of the Cross rest only on the Vielfalt der Moderne entry. No contradiction found, but no independent confirmation either.
- The "house_lore" and "codeword" fields are null (not a beer POI).
- The riddle question uses the 45-degree tower rotation — the most distinctive and verifiable architectural feature.

## 2026-09-03 — Aufseßhöflein (b13) added

**Entry:** `data/sites.json` — id `b13`, slug `aufsesshoeflein`, category `b` (Bürgerliches Bamberg), subcategory `palaces`, tier `silver`

**Coordinates:** 49.915, 10.884 (Aufseßhöflein 1, 96050/96052 Bamberg). Resolved from aroundus.com (49.91594, 10.88350) and strassenkatalog.de.

### Verified against second sources

| Fact | Primary source | Corroborating sources |
|------|---------------|----------------------|
| First mentioned 1455 | Owners' site (Dengler-Schreiber) | Wikipedia, DeWiki |
| Georg von Künsberg bought 1602 | Owners' site | Wikipedia, Deutsche Stiftung Denkmalschutz (DSD) |
| Ruined in Thirty Years' War | Owners' site | Wikipedia, DSD |
| Sold to prince-bishop 1654 | Owners' site | Wikipedia |
| Carl Sigmund von Aufseß bought estate | Owners' site | DSD, Wikipedia |
| Wallensteinhaus / Haus zum Saal, Lange Str. 3 | Owners' site | — (no independent source found for this specific claim) |
| Philipp Friedrich began new build 1723 | Owners' site | Wikipedia ("1723 bis 1728"), DSD, Wikidata (Q41424542) |
| Johann Dientzenhofer as architect (probable) | Owners' site | Wikipedia ("vermutet"), DSD ("wird vermutet") |
| Rococo stucco by Dominikus Ecker, 1752 | Owners' site | DSD ("1752 erfolgte die Umgestaltung... durch Domenikus Eckert"), Wikipedia |
| Küchel designs for Ecker | Owners' site | DSD ("Johann Michael Küchels") |
| Estate receivership 1777 | Owners' site | Wikipedia, DSD |
| French soldiers 1797 | Owners' site | No second source found — rests on owners' account alone |
| Leumer family bought 1839 | Owners' site | Wikipedia, DSD |
| Railway lines from 1852 | Owners' site | Wikipedia ("seit 1852") |
| Reichsbahn demolition plan 1938 | Owners' site | Wikipedia ("1938 wollte die Reichsbahn"), DSD ("Verlegung der Gleiskurve... 1938") |
| Track realigned 7 m behind building | Owners' site | Wikipedia ("Höfleiner Kurve") |
| BLfD listing 1953 | Owners' site | Wikipedia, DSD ("1953 wurde das Aufseßhöflein in die Bamberger Denkmalschutzliste aufgenommen") |
| Last Leumer left 2000 | Owners' site | Wikipedia, DSD |
| Fiedler purchase 2011, restoration 2012–2015 | Owners' site | Wikipedia ("2012 bis 2015"), DSD |
| 1.7 million euros restoration cost | Owners' site | No second source found — rests on owners' account alone |
| Michael Schelz as architect | Owners' site | No second source found |
| Single window frame reconstruction detail | Owners' site | No second source found — rests on owners' account alone |
| Bayerlein painting for stair reinterpretation | Owners' site | Wikipedia ("historische Abbildung") |

### Access situation

Checked 3 September 2026 via aufsesshoeflein.de:
- **Exterior:** visible from the public path at all times
- **Interior:** only at booked events or advertised open days
- **Current events (2026):** Chamber music series (Kammermusik im Aufseßhöflein) — March, June, October, December. Tickets via rubin@chamber-players.de
- **Private property:** no uninvited access to grounds

### Railway proximity

The building sits in a wedge between two active railway lines (since 1852). The "Höfleiner Kurve" passes approximately 7 metres behind the building. The safe approach is via the public path from the Gärtnerland side; visitors should not attempt to reach the building from the track side.

### Not added to any trail

Located in the Gärtnerland, north of the Altstadt. No existing trail passes nearby. Could be linked to a future "Bamberg-Nord" or "Gärtnerland" trail.

### Notes

- The French soldiers episode (1797) and the single-window-frame detail rest only on the owners' history page (Dengler-Schreiber). No contradiction found, but no independent confirmation.
- The Wallensteinhaus cross-reference is included in the body text as a connection to the Altstadt.
- The "accessible" field is set to `false` (exterior-only, private property).
- The "hours" field describes the access restrictions and points to the events page.
- The riddle question uses the single-window-frame detail — the most specific and memorable restoration fact.
