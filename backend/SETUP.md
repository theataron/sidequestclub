# Connecting the site to a Google Sheet (about 5 minutes)

Until this is done the site runs in demo mode: emails are not saved and wall messages stay on the visitor's phone.

1. Create a new Google Sheet (for example inside the Drive folder "03 Data") and name it "Side Quest Club data".
2. In the Sheet: Extensions → Apps Script.
3. Delete whatever is in the editor, paste everything from `Code.gs`, and save.
4. Click Deploy → New deployment → type "Web app".
   - Execute as: Me
   - Who has access: Anyone
5. Click Deploy, approve the permissions, and copy the Web app URL (it ends in `/exec`).
6. Open `js/common.js` and paste the URL between the quotes after `API_URL:`.
7. Publish the change. The "Demo mode" notes on the site disappear.

The Sheet then fills three tabs: Waitlist (emails), Wall (messages — type anything in the "hidden" column to remove one from the site) and Events (scans, spins, accepted and completed quests per shirt).
