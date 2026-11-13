/* ===== SIDE QUEST CLUB - the page a shirt's QR code opens ===== */
const VIEWS = ['lang','quote','spin','accept','done'];
const owner = SHIRTS[SHIRT.toLowerCase()] || null;
const demo = !SHIRT || SHIRT === 'demo';
let current = null, spinning = false, seen = [], quoteTimer = null;

const who = () => owner ? owner.name : t('thePerson');
const fill = k => t(k).replace('{name}', who());

function show(v){
  VIEWS.forEach(n => $('v-'+n).hidden = n !== v);
  $('top').hidden = v === 'lang' || v === 'quote';
  $('menu').hidden = true;
  document.body.classList.toggle('hot', $('devil').checked && ['spin','accept','done'].includes(v));
  window.scrollTo(0,0);
}

/* ----- menu ----- */
$('burger').onclick = () => { $('menu').hidden = false; };
$('menuClose').onclick = () => { $('menu').hidden = true; };
$('mSpinLink').onclick = e => { e.preventDefault(); $('menu').hidden = true; };
document.querySelectorAll('[data-to]').forEach(a => { a.href = '../' + (SHIRT ? '?s=' + SHIRT : '') + '#' + a.dataset.to; });
$('homeLogo').href = '../' + (SHIRT ? '?s=' + SHIRT : '');

/* ----- language choice, then the quote ----- */
LANGS.forEach(l => {
  const b = document.createElement('button'); b.className = 'btn red'; b.textContent = l.label;
  b.onclick = () => { setLang(l.code); startQuote(); };
  $('langBtns').appendChild(b);
});
function startQuote(){
  show('quote');
  quoteTimer = setTimeout(endQuote, 5500);
}
function endQuote(){ clearTimeout(quoteTimer); try{ sessionStorage.setItem('sqc_quote','1'); }catch(e){} show('spin'); }
$('v-quote').onclick = endQuote;

/* ----- the quest map ----- */
const trail = $('trail'), walked = $('walked'), runner = $('runner'), goal = $('goal');
const LEN = trail.getTotalLength();
const BRANCH = 80 / LEN;                       /* where the route leaves the usual road */
/* side quests sit at each peak and dip, above and below the usual road; the last one (the star) is yours */
const STOPS = [[132,26],[174,98],[216,20],[258,92]].map(([x,y]) => {
  let best = 0, bd = 1e9;
  for (let l = 0; l <= LEN; l += 1){ const p = trail.getPointAtLength(l), d = (p.x-x)**2 + (p.y-y)**2; if (d < bd){ bd = d; best = l; } }
  return best / LEN;
});
const pins = STOPS.map(f => {
  const p = trail.getPointAtLength(f * LEN);
  const g = document.createElementNS('http://www.w3.org/2000/svg','g'); g.setAttribute('class','pin');
  g.innerHTML = '<circle cx="'+p.x+'" cy="'+p.y+'" r="10"/><text x="'+p.x+'" y="'+p.y+'">?</text>';
  $('pins').appendChild(g); return g;
});
function mapTo(f){
  const p = trail.getPointAtLength(f * LEN);
  runner.setAttribute('cx', p.x); runner.setAttribute('cy', p.y);
  /* red only from where the route leaves the usual night */
  const from = BRANCH * LEN, to = Math.max(from, f * LEN);
  walked.style.strokeDasharray = (to - from) + ' ' + (LEN * 2);
  walked.style.strokeDashoffset = -from;
  walked.style.opacity = to - from < 1 ? 0 : 1;
  const st = $('walkedStraight'), sd = Math.min(f * LEN, from);
  st.style.strokeDasharray = sd + ' ' + LEN; st.style.opacity = sd < 1 ? 0 : 1;
}
function mapReset(){ pins.forEach(p => p.classList.remove('on')); goal.classList.remove('on'); $('map').classList.remove('off'); $('machine').classList.remove('won'); runner.style.display = ''; mapTo(0); }

const deck = () => $('devil').checked ? QUESTS.devil : QUESTS.classic.concat((owner && owner.quests) || []);
const txt = q => q[LANG === 'es' ? 1 : 0];
function resetSpin(){ current = null; mapReset(); const r = $('reel'); r.className = 'reel q'; r.textContent = '? ? ?'; $('preSpin').hidden = false; $('postSpin').hidden = true; }
function pick(){
  const d = deck(); let pool = d.filter(q => !seen.includes(q));
  if (!pool.length){ seen = seen.filter(q => !d.includes(q)); pool = d; }
  const q = pool[Math.floor(Math.random()*pool.length)]; seen.push(q); return q;
}
function setReel(text, cls){ const r = $('reel'); r.className = 'reel'; void r.offsetWidth; r.textContent = text; r.className = 'reel ' + cls; }

function spin(){
  if (spinning) return; spinning = true;
  $('preSpin').hidden = false; $('postSpin').hidden = true; $('spinBtn').disabled = true;
  mapReset(); setReel('…', 'q');
  const final = pick();
  /* a few other quests flash by on the way, so people see how many there are */
  const others = deck().filter(q => q !== final).sort(() => Math.random() - .5).slice(0, STOPS.length);
  const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = still ? 0 : 4600, t0 = performance.now(); let i = 0;
  function land(){
    mapTo(1); runner.style.display = 'none'; goal.classList.add('on'); $('map').classList.add('off'); $('machine').classList.add('won');
    current = final; setReel(txt(final), 'land'); if (navigator.vibrate) navigator.vibrate(40);
    spinning = false; $('spinBtn').disabled = false; $('preSpin').hidden = true; $('postSpin').hidden = false; track('spin');
  }
  (function frame(now){
    const p = DUR ? Math.min(1, (now - t0) / DUR) : 1;
    const f = 1 - Math.pow(1 - p, 2);            /* fast at first, slowing down as it gets close */
    mapTo(f);
    if (f > BRANCH) $('map').classList.add('off');
    while (i < STOPS.length && f >= STOPS[i]){ pins[i].classList.add('on'); if (others[i]) setReel(txt(others[i]), 'sample tick'); i++; }
    if (p < 1) requestAnimationFrame(frame); else land();
  })(t0);
}
$('spinBtn').onclick = spin;
$('againBtn').onclick = spin;
$('acceptBtn').onclick = () => { $('accText').textContent = txt(current); track('accept', { quest: current[0] }); show('accept'); };
$('changeBtn').onclick = () => { resetSpin(); show('spin'); };
$('doneBtn').onclick = () => { track('done', { quest: current[0] }); show('done'); };
$('anotherBtn').onclick = () => { resetSpin(); show('spin'); };
$('devil').onchange = () => { document.body.classList.toggle('hot', $('devil').checked); if (!spinning) resetSpin(); };

/* ----- words that depend on the language and on whose shirt it is ----- */
document.addEventListener('langchange', () => {
  $('foundKicker').textContent = owner ? fill('found') : t('foundAnon');
  $('spinSub').textContent = fill('spinSub');
  $('lblUsual').textContent = t('mapUsual'); $('lblSide').textContent = t('mapSide') + ' ↗';
  $('how2').textContent = fill('how2');
  $('accNote').textContent = fill('accNote');
  if (current && !spinning){ $('reel').textContent = txt(current); $('accText').textContent = txt(current); }
});

initLang(T);
initWaitlist();
mapReset();
let quoteSeen = false; try{ quoteSeen = !!sessionStorage.getItem('sqc_quote'); }catch(e){}
if (!LANG_CHOSEN) show('lang'); else if (!quoteSeen) startQuote(); else show('spin');
try{ if (!demo && !sessionStorage.getItem('sqc_scan')){ sessionStorage.setItem('sqc_scan','1'); track('scan'); } }catch(e){}
