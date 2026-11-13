/* ===== SIDE QUEST CLUB — home page (home, wall, about, club) ===== */
const VIEWS = ['home','wall','about','club'];
function show(v){
  if (!VIEWS.includes(v)) v = 'home';
  VIEWS.forEach(n => $('v-'+n).hidden = n !== v);
  $('menu').hidden = true;
  if (v === 'wall') loadWall();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange', () => show(location.hash.slice(1)));
$('burger').onclick = () => { $('menu').hidden = false; };
$('menuClose').onclick = () => { $('menu').hidden = true; };
document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => { $('menu').hidden = true; }));
/* arrived from a shirt's page: the "spin" link goes back to that shirt */
if (SHIRT) $('tryLink').href = 'p/?s=' + SHIRT;

function chips(){
  const i = LANG === 'es' ? 1 : 0;
  $('chips').innerHTML = QUESTS.classic.slice(0,8).map(q => '<span class="chip">'+q[i]+'</span>').join('');
}

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
  catch(x){ const p = document.createElement('p'); p.className = 'wlerr'; p.style.color = 'var(--redt)'; p.textContent = t('wallErr'); $('wallForm').appendChild(p); setTimeout(() => p.remove(), 4000); }
  b.disabled = false; b.textContent = t('wallSend');
});

document.addEventListener('langchange', () => { chips(); paintWall(); });
initLang(T);
initWaitlist();
show(location.hash.slice(1));
