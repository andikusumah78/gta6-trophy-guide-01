# Leonida Trophy Guide — GTA VI

[![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/andikusumah78/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/andikusumah78/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden.

- **Tracker** — checklist saved in localStorage, export to JSON and import back, filters by kind (story, missable, collectibles, activities, online), search, and a spoiler setting that hides un-earned story trophies.
- **Roadmap** — four stages to the platinum, in order, built from the official descriptions.
- **Missables** — the one possibly missable trophy (Positive Mental Attitude, and its Chapter 1 balcony meditation) is flagged, with the stranger strands' story windows noted.
- **Guides** — every trophy has a guide in our own words with its sources named and linked beside it. Where no published method exists yet, the guide says so honestly instead of inventing a step.

Names, descriptions and grades are the official PlayStation list as Exophase and PSNProfiles published it (18 Nov 2026). The app is static files under `app/` — open `app/index.html` in desktop Chrome with the network off and it works. No Rockstar logo, artwork or game screenshot is used; the look is our own.

## Run it

```sh
python3 -m http.server 8000 --directory app
# open http://localhost:8000 in desktop Chrome
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# out/ holds app/, screenshots/ and dossier.json
```
