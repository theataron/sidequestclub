/* ===== SIDE QUEST CLUB — shared settings & helpers =====
   WAITLIST_URL: paste the Google Apps Script web-app link (ending in /exec) between the quotes.
   While it is empty, the waitlist runs in demo mode: sign-ups are NOT collected. */
const SQC = {
  WAITLIST_URL: '',
  PROMO: true            // show the "first drop" early-list offer
};

const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};

let LANG = store.get('sqc_lang') || ((navigator.language||'en').toLowerCase().startsWith('es') ? 'es' : 'en');
let DICT = {};
const t = k => (DICT[LANG] && DICT[LANG][k]) ?? (DICT.en[k] ?? k);

function applyLang(){
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  const b = document.getElementById('lang'); if (b) b.textContent = LANG === 'en' ? 'ES' : 'EN';
  document.dispatchEvent(new Event('langchange'));
}
function initLang(dict){
  DICT = dict;
  const b = document.getElementById('lang');
  if (b) b.addEventListener('click', () => { LANG = LANG === 'en' ? 'es' : 'en'; store.set('sqc_lang', LANG); applyLang(); });
  applyLang();
}

/* ===== waitlist ===== */
const WL_TEXT = {
  en:{ ph:'Email or Instagram @', send:'Put me on the list', sending:'Sending…', ok:'You’re on the list 🎉 We’ll message you before the first drop.', bad:'Add an email or an Instagram @ so we can reach you.', err:'Couldn’t connect. Try again.', demo:'Demo mode — sign-ups are not being saved yet.' },
  es:{ ph:'Email o Instagram @', send:'Apúntame a la lista', sending:'Enviando…', ok:'Ya estás en la lista 🎉 Te escribimos antes del primer drop.', bad:'Pon un email o un @ de Instagram para poder avisarte.', err:'No se pudo conectar. Inténtalo otra vez.', demo:'Modo demo — todavía no se guardan los registros.' }
};
function initWaitlist(source){
  document.querySelectorAll('form.wl').forEach(form => {
    const input = form.querySelector('input'), btn = form.querySelector('button');
    const err = form.querySelector('.wlerr'), demo = form.parentElement.querySelector('.demo');
    const paint = () => { const w = WL_TEXT[LANG]; input.placeholder = w.ph; btn.textContent = w.send; if (demo){ demo.textContent = w.demo; demo.hidden = !!SQC.WAITLIST_URL; } };
    document.addEventListener('langchange', paint); paint();
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const w = WL_TEXT[LANG], v = input.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^@?[\w.]{2,30}$/.test(v);
      if (!ok){ err.textContent = w.bad; err.hidden = false; return; }
      err.hidden = true; btn.disabled = true; btn.textContent = w.sending;
      try{
        if (SQC.WAITLIST_URL){
          const r = await fetch(SQC.WAITLIST_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
            body: JSON.stringify({ fn:'joinWaitlist', contact:v, lang:LANG, source, shirt:new URLSearchParams(location.search).get('s')||'' }) });
          const j = await r.json(); if (!j.ok) throw new Error(j.error||'error');
        }
        const done = document.createElement('p'); done.className = 'wlmsg'; done.textContent = w.ok;
        form.replaceWith(done);
      }catch(x){ err.textContent = w.err; err.hidden = false; btn.disabled = false; btn.textContent = w.send; }
    });
  });
}
