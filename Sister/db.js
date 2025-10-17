/* Lightweight DB helper for static pages (Firestore via CDN, optional)
   Usage:
   1) Create db-config.js with:
        window.DB_CONFIG = { firebaseConfig: { apiKey:"...", authDomain:"...", projectId:"..." } };
   2) Include in HTML before this file:
        <script src="db-config.js"></script>
        <script src="db.js"></script>
   If config is missing, all DB methods become no-ops and log once.
*/
(function(){
  const W = window;
  const CFG = (W.DB_CONFIG && W.DB_CONFIG.firebaseConfig) ? W.DB_CONFIG.firebaseConfig : null;
  const state = { inited:false, warnShown:false, app:null, db:null, ready: null };

  function logOnce(){ if (!state.warnShown){ state.warnShown = true; console.warn('[DB] No config found. Calls are no-ops. Add db-config.js.'); } }

  function injectScript(src){
    return new Promise((res, rej)=>{ const s=document.createElement('script'); s.src=src; s.async=true; s.onload=res; s.onerror=()=>rej(new Error('Failed to load '+src)); document.head.appendChild(s); });
  }

  async function init(){
    if (state.inited) return;
    if (!CFG){ logOnce(); return; }
    // Load Firebase compat CDN (keeps code simple, no bundler)
    const base = 'https://www.gstatic.com/firebasejs/9.22.0';
    await injectScript(base + '/firebase-app-compat.js');
    await injectScript(base + '/firebase-firestore-compat.js');
    // Initialize
    state.app = window.firebase.initializeApp(CFG);
    state.db = window.firebase.firestore();
    state.inited = true;
  }

  state.ready = (async ()=>{ try{ await init(); }catch(e){ console.error('[DB] init failed:', e); } })();

  function slugifyName(n){ return (n||'').toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-_.]/g,'').slice(0,64) || 'anon'; }
  function nowIso(){ return new Date().toISOString(); }

  async function add(collection, data){
    if (!state.inited){ logOnce(); return null; }
    try{
      const doc = await state.db.collection(collection).add({ ...data, _ts: nowIso() });
      return doc.id;
    }catch(e){ console.error('[DB] add failed', e); return null; }
  }

  async function setDoc(path, data){
    if (!state.inited){ logOnce(); return false; }
    try{
      await state.db.doc(path).set(data, { merge:true });
      return true;
    }catch(e){ console.error('[DB] set failed', e); return false; }
  }

  async function addOrUpdateUser(name, extra){
    if (!name){ logOnce(); return false; }
    const slug = slugifyName(name);
    const base = { name: name.slice(0,40), slug, lastSeenAt: nowIso(), ...extra };
    // First-write capture createdAt if missing
    return setDoc('users/' + slug, { createdAt: window.firebase ? window.firebase.firestore.FieldValue.serverTimestamp() : nowIso(), ...base });
  }

  async function addSession(name, stats){
    const payload = { name: (name||'').slice(0,40), finishedAt: nowIso(), ...stats };
    return add('sessions', payload);
  }

  // Expose minimal API
  W.DB = {
    ready: state.ready,
    add: add,
    set: setDoc,
    addOrUpdateUser: addOrUpdateUser,
    addSession: addSession,
    _debug: () => ({ inited: state.inited })
  };
})();
