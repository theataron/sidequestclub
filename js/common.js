/* ===== SIDE QUEST CLUB — settings & helpers =====
   API_URL: paste the Google Apps Script web-app link (ending in /exec) between the quotes.
   While it is empty the site runs in DEMO MODE: email sign-ups are NOT collected,
   and wall messages only live on the visitor's own phone. See backend/SETUP.md. */
const SQC = { API_URL: '' };

const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};
const $ = id => document.getElementById(id);
const SHIRT = (new URLSearchParams(location.search).get('s') || '').replace(/[^\w-]/g,'').slice(0,12);

/* ----- language ----- */
let LANG = store.get('sqc_lang') || ((navigator.language||'en').toLowerCase().startsWith('es') ? 'es' : 'en');
let DICT = { en:{} };
const t = k => (DICT[LANG] && DICT[LANG][k]) ?? (DICT.en[k] ?? k);
function applyLang(){
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  const b = $('lang'); if (b) b.textContent = LANG === 'en' ? 'ES' : 'EN';
  document.dispatchEvent(new Event('langchange'));
}
function initLang(dict){
  DICT = dict;
  $('lang').addEventListener('click', () => { LANG = LANG === 'en' ? 'es' : 'en'; store.set('sqc_lang', LANG); applyLang(); });
  applyLang();
}

/* ----- backend (Google Apps Script) with demo fallback ----- */
const Demo = {
  _wall(){ try{ return JSON.parse(store.get('sqc_demo_wall')||'[]'); }catch(e){ return []; } },
  getWall(){ return this._wall(); },
  postMessage(d){ const w = this._wall(); w.unshift({ text:d.text, created:Date.now() }); store.set('sqc_demo_wall', JSON.stringify(w.slice(0,50))); return true; },
  joinWaitlist(){ return true; },
  logEvent(){ return true; }
};
async function api(fn, data){
  if (!SQC.API_URL) return Demo[fn](data||{});
  const res = fn === 'getWall'
    ? await fetch(SQC.API_URL + '?fn=getWall&t=' + Date.now())
    : await fetch(SQC.API_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(Object.assign({ fn, shirt:SHIRT, lang:LANG }, data||{})) });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || 'error');
  return j.data;
}
function track(type, extra){ if (SQC.API_URL) api('logEvent', Object.assign({ type }, extra||{})).catch(()=>{}); }

/* ----- email sign-up forms (any <form class="wl">) ----- */
const WL_TEXT = {
  en:{ ph:'Your email', send:'Keep me posted', sending:'Sending…', ok:'You’re on the list 🎉 You’ll hear from us before anyone else.', bad:'That email doesn’t look right.', err:'Couldn’t connect. Try again.', demo:'Demo mode — sign-ups are not being saved yet.' },
  es:{ ph:'Tu email', send:'Avisadme', sending:'Enviando…', ok:'Ya estás en la lista 🎉 Te enteras antes que nadie.', bad:'Ese email no parece correcto.', err:'No se pudo conectar. Inténtalo otra vez.', demo:'Modo demo — todavía no se guardan los registros.' }
};
function initWaitlist(){
  document.querySelectorAll('form.wl').forEach(form => {
    const input = form.querySelector('input'), btn = form.querySelector('button');
    const err = form.querySelector('.wlerr'), demo = form.parentElement.querySelector('.demo');
    const paint = () => { const w = WL_TEXT[LANG]; input.placeholder = w.ph; if (!btn.disabled) btn.textContent = w.send; if (demo){ demo.textContent = w.demo; demo.hidden = !!SQC.API_URL; } };
    document.addEventListener('langchange', paint); paint();
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const w = WL_TEXT[LANG], v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ err.textContent = w.bad; err.hidden = false; return; }
      err.hidden = true; btn.disabled = true; btn.textContent = w.sending;
      try{
        await api('joinWaitlist', { email:v, source:form.dataset.source||'' });
        store.set('sqc_joined','1');
        document.querySelectorAll('form.wl').forEach(f => { const p = document.createElement('p'); p.className = 'wlmsg'; p.textContent = w.ok; f.replaceWith(p); });
      }catch(x){ err.textContent = w.err; err.hidden = false; btn.disabled = false; btn.textContent = w.send; }
    });
  });
}
