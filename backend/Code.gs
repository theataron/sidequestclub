/**
 * SIDE QUEST CLUB — backend (Google Apps Script, attached to a Google Sheet).
 * Saves email sign-ups, wall messages and scan/quest events into three tabs:
 * "Waitlist", "Wall" and "Events". The tabs are created automatically.
 * To hide a wall message: type anything into its "hidden" column.
 * A message reported by 3 visitors is hidden automatically (hidden = "reported").
 */
const TABS = {
  Waitlist: ['created', 'email', 'lang', 'source', 'shirt'],
  Wall:     ['created', 'text', 'ig', 'lang', 'shirt', 'hidden', 'reports'],
  Events:   ['created', 'type', 'shirt', 'quest', 'lang']
};

function tab(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(TABS[name]); sh.setFrozenRows(1); }
  return sh;
}
function clean(v, max) { return String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, max); }
function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  try {
    if ((e.parameter.fn || '') !== 'getWall') return out({ ok: false, error: 'unknown' });
    const rows = tab('Wall').getDataRange().getValues().slice(1);
    const data = rows.filter(r => r[1] && !r[5]).slice(-50).reverse()
      .map(r => ({ text: String(r[1]), ig: String(r[2] || ''), created: new Date(r[0]).getTime() }));
    return out({ ok: true, data: data });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const now = new Date(), lang = clean(d.lang, 5), shirt = clean(d.shirt, 12);
    if (d.fn === 'joinWaitlist') {
      const email = String(d.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return out({ ok: false, error: 'bad email' });
      const sh = tab('Waitlist');
      const known = sh.getRange(1, 2, Math.max(sh.getLastRow(), 1), 1).getValues().some(r => r[0] === email);
      if (!known) sh.appendRow([now, email, lang, clean(d.source, 30), shirt]);
      return out({ ok: true, data: true });
    }
    if (d.fn === 'postMessage') {
      const text = clean(String(d.text || '').trim(), 280);
      if (!text) return out({ ok: false, error: 'empty' });
      const ig = (String(d.ig || '').replace(/^@/, '').match(/^[\w.]{1,30}$/) || [''])[0];
      tab('Wall').appendRow([now, text, ig, lang, shirt, '']);
      return out({ ok: true, data: true });
    }
    if (d.fn === 'reportMessage') {
      const sh = tab('Wall'), rows = sh.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (new Date(rows[i][0]).getTime() === Number(d.created) && String(rows[i][1]) === String(d.text)) {
          const n = (Number(rows[i][6]) || 0) + 1;
          sh.getRange(i + 1, 7).setValue(n);
          if (n >= 3 && !rows[i][5]) sh.getRange(i + 1, 6).setValue('reported');
          break;
        }
      }
      return out({ ok: true, data: true });
    }
    if (d.fn === 'logEvent') {
      tab('Events').appendRow([now, clean(d.type, 20), shirt, clean(d.quest, 200), lang]);
      return out({ ok: true, data: true });
    }
    return out({ ok: false, error: 'unknown' });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}
