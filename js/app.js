/* ===== SIDE QUEST CLUB — page logic ===== */
const VIEWS = ['spin','accept','done','wall','about','club'];
const PLAY = ['spin','accept','done'];
const scanned = SHIRT && SHIRT !== 'demo';
let view = 'spin', current = null, spinning = false, seen = [];

function show(v){
  if (!VIEWS.includes(v)) v = 'spin';
  if ((v === 'accept' || v === 'done') && !current) v = 'spin';
  view = v;
  VIEWS.forEach(n => $('v-'+n).hidden = n !== v);
  $('menu').hidden = true;
  document.body.classList.toggle('hot', $('devil').checked && PLAY.includes(v));
  $('shirtId').hidden = !PLAY.includes(v);
  if (v === 'wall') loadWall();
  window.scrollTo(0,0);
}
function go(v){ if (location.hash === '#'+v) show(v); else location.hash = v; }
window.addEventListener('hashchange', () => show(location.hash.slice(1) || 'spin'));
$('burger').onclick = () => { $('menu').hidden = false; };
$('menuClose').onclick = () => { $('menu').hidden = true; };
document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => { $('menu').hidden = true; }));

/* ----- spinner ----- */
const deck = () => $('devil').checked ? QUESTS.devil : QUESTS.classic;
const txt = q => q[LANG === 'es' ? 1 : 0];
function resetSpin(){ current = null; const r = $('reel'); r.className = 'reel q'; r.textContent = '? ? ?'; $('preSpin').hidden = false; $('postSpin').hidden = true; }
function pick(){
  const d = deck(); let pool = d.filter(q => !seen.includes(q));
  if (!pool.length){ seen = seen.filter(q => !d.includes(q)); pool = d; }
  const q = pool[Math.floor(Math.random()*pool.length)]; seen.push(q); return q;
}
function spin(){
  if (spinning) return; spinning = true;
  $('preSpin').hidden = false; $('postSpin').hidden = true; $('spinBtn').disabled = true;
  const r = $('reel'), d = deck(), final = pick();
  r.className = 'reel'; let i = 0; const steps = 16;
  (function step(){
    r.classList.remove('tick'); void r.offsetWidth;
    if (i < steps){ r.textContent = txt(d[Math.floor(Math.random()*d.length)]); r.classList.add('tick'); i++; setTimeout(step, 60 + i*i*1.6); }
    else { current = final; r.textContent = txt(final); r.classList.add('land'); if (navigator.vibrate) navigator.vibrate(40);
      spinning = false; $('spinBtn').disabled = false; $('preSpin').hidden = true; $('postSpin').hidden = false; track('spin'); }
  })();
}
$('spinBtn').onclick = spin;
$('againBtn').onclick = spin;
$('acceptBtn').onclick = () => { $('accText').textContent = txt(current); track('accept', { quest: current[0] }); go('accept'); };
$('changeBtn').onclick = () => { resetSpin(); go('spin'); };
$('doneBtn').onclick = () => { track('done', { quest: current[0] }); go('done'); };
$('anotherBtn').onclick = () => { resetSpin(); go('spin'); };
$('devil').onchange = () => { document.body.classList.toggle('hot', $('devil').checked); if (!spinning) resetSpin(); };

/* ----- wall ----- */
function ago(ts){
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return t('now'); if (m < 60) return m + t('min');
  const h = Math.floor(m/60); if (h < 24) return h + t('hr'); return Math.floor(h/24) + t('day');
}
let wallData = null;
function paintWall(){
  const box = $('msgs'); box.textContent = '';
  if (!wallData) return;
  if (!wallData.length){ const p = document.createElement('p'); p.className = 'empty'; p.textContent = t('wallEmpty'); box.appendChild(p); return; }
  wallData.forEach(m => { const d = document.createElement('div'); d.className = 'msg'; d.textContent = m.text;
    const s = document.createElement('small'); s.textContent = ago(m.created); d.appendChild(s); box.appendChild(d); });
}
async function loadWall(){ $('wallDemo').hidden = !!SQC.API_URL; try{ wallData = await api('getWall'); }catch(e){ wallData = wallData || []; } paintWall(); }
$('wallForm').addEventListener('submit', async e => {
  e.preventDefault();
  const ta = $('wallText'), b = $('wallSend'), v = ta.value.trim(); if (!v) return;
  b.disabled = true; b.textContent = t('wallSending');
  try{ await api('postMessage', { text: v }); ta.value = ''; await loadWall(); }
  catch(x){ alertMsg(t('wallErr')); }
  b.disabled = false; b.textContent = t('wallSend');
});
function alertMsg(m){ const p = document.createElement('p'); p.className = 'wlerr'; p.style.color = 'var(--redt)'; p.textContent = m; $('wallForm').appendChild(p); setTimeout(() => p.remove(), 4000); }

/* ----- language-dependent bits ----- */
document.addEventListener('langchange', () => {
  $('foundKicker').textContent = t(scanned ? 'found' : 'foundDemo');
  $('spinSub').textContent = t(scanned ? 'spinSub' : 'spinSubDemo');
  if (current && !spinning){ $('reel').textContent = txt(current); $('accText').textContent = txt(current); }
  $('shirtId').textContent = scanned ? t('shirt') + ' #' + SHIRT : '';
  paintWall();
});

initLang(T);
initWaitlist();
show(location.hash.slice(1) || 'spin');
try{ if (scanned && !sessionStorage.getItem('sqc_scan')){ sessionStorage.setItem('sqc_scan','1'); track('scan'); } }catch(e){}
