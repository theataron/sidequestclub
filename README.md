# SIDE QUEST CLUB

The website behind the Side Quest Club shirts.

## How it works
- `index.html` is the home page (home, The Wall, About, Join the club).
- `p/index.html` is the page a shirt's QR code opens: language choice, quote, then the quest map.
- Each shirt's QR code points to `sidequestclub.app/p/?s=<id>`. Shirts are listed in `js/shirts.js` (Aron's is `?s=aron`).

## Files you may want to edit
- `js/text.js` - every word on the site (English and Spanish).
- `js/quests.js` - the quest decks.
- `js/common.js` - `API_URL`, which connects the site to the Google Sheet.
- `css/style.css` - colours and look.
- `VISION.md` - vision and mission statement.
- `backend/` - the Google Sheet connection. Follow `backend/SETUP.md`.

## Publishing (GitHub Pages)
Repo → Settings → Pages → Source: "Deploy from a branch" → `main` / root.
