# SIDE QUEST CLUB

The website behind the Side Quest Club shirts.

## How it works
- `index.html` is the whole site. It opens on the spinner; the menu leads to The Wall, the About page and the "Join the club" page.
- Each shirt's QR code points to the site with its own number: `?s=001`, `?s=002`, …

## Files you may want to edit
- `js/text.js` — every word on the site (English and Spanish).
- `js/quests.js` — the quest decks.
- `js/common.js` — `API_URL`, which connects the site to the Google Sheet.
- `css/style.css` — colours and look.
- `VISION.md` — vision and mission statement.
- `backend/` — the Google Sheet connection. Follow `backend/SETUP.md`.

## Publishing (GitHub Pages)
Repo → Settings → Pages → Source: "Deploy from a branch" → `main` / root.
