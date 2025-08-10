// JavaScript for full-page RGB HSL animation, key lock, and many controls
(function(){
  const ACCESS_KEY = 'dinhlong';
  const STORAGE_KEY = 'dinhlong_full_rgb_v1';
  const app = document.getElementById('app');
  const lockOverlay = document.getElementById('lockOverlay');
  const accessInput = document.getElementById('accessKey');
  const unlockBtn = document.getElementById('unlock');
  const lockMsg = document.getElementById('lockMsg');
  const rbg = document.getElementById('rbg');

  function init(){
    // initialize UI, build lots of controls
    buildModeButtons();
    buildWeapons();
    buildExtras();
    bindGlobal();
    loadState();
    renderProfileList();
    startRGB();
  }

  // key handling
  unlockBtn.addEventListener('click', ()=>{
    const v = accessInput.value.trim();
    if(v.toLowerCase() === ACCESS_KEY){
      sessionStorage.setItem('dinhlong_unlocked','1');
      lockOverlay.style.display = 'none';
      app.setAttribute('aria-hidden','false');
      init();
    } else {
      lockMsg.textContent = 'Invalid key';
      setTimeout(()=> lockMsg.textContent = '', 1800);
    }
  });

  if(sessionStorage.getItem('dinhlong_unlocked')){
    lockOverlay.style.display = 'none';
    app.setAttribute('aria-hidden','false');
    init();
  }

  // create many mode buttons
  function buildModeButtons(){
    const modes = ['Aimlock','Aimbot','LockHead','TrickLock','AutoFire','WallHack','ESP','Teleport','Speed','AntiBan','NoRecoilPro','AimAssist','AutoScope','CrosshairPlus','Radar','SilentAim','Burst','Steady','Predictive','SoftLock'];
    const container = document.getElementById('modeButtons');
    modes.forEach(m=>{
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = m;
      b.addEventListener('click', ()=> b.classList.toggle('active'));
      container.appendChild(b);
    });
  }

  // weapons
  const weapons = ['m1887','mp40','ump','m1014','de','ak','scar','m4a1','groza','vector','famas','awm','sr25','mp5','p90','pp19'];
  function buildWeapons(){
    const wr = document.getElementById('weaponsRow');
    wr.innerHTML = '';
    weapons.forEach((w,i)=>{
      const div = document.createElement('div');
      div.className = 'weapon-card';
      div.dataset.key = w;
      div.innerHTML = `<div style="font-weight:700">${w.toUpperCase()}</div><div style="font-size:12px;color:var(--muted)">Slot ${i+1}</div>`;
      div.addEventListener('click', ()=>{
        document.querySelectorAll('.weapon-card').forEach(n=>n.classList.remove('active'));
        div.classList.add('active');
        loadWeapon(w);
      });
      wr.appendChild(div);
    });
    // select first
    const first = wr.querySelector('.weapon-card');
    if(first) { first.classList.add('active'); loadWeapon(weapons[0]); }
  }

  // create many extra visual controls
  function buildExtras(){
    const extra = document.getElementById('extrasGrid');
    extra.innerHTML = '';
    for(let i=0;i<48;i++){
      const id = 'ex_'+i;
      const c = document.createElement('div');
      c.className = 'control';
      c.innerHTML = `<label>Visual ${i+1} <span id="${id}_val">0</span><input id="${id}" type="range" min="0" max="100" value="0"></label>`;
      extra.appendChild(c);
      document.getElementById(id).addEventListener('input', e=>{ document.getElementById(id+'_val').textContent = e.target.value; });
    }
  }

  // weapon panel and toggles
  function loadWeapon(key){
    document.getElementById('weaponTitle').textContent = key.toUpperCase();
    const tg = document.getElementById('weaponToggles');
    tg.innerHTML = '';
    const toggles = ['headlock','no_recoil','no_overshoot','light_aim','heavy_aim','smooth','rapid','auto_scope','predictive','soft_lock'];
    toggles.forEach(t => {
      const b = document.createElement('button');
      b.className = 'toggle';
      b.textContent = t.replace(/_/g,' ').toUpperCase();
      b.addEventListener('click', ()=> b.classList.toggle('active'));
      tg.appendChild(b);
    });

    // populate controls grid
    const controls = document.getElementById('weaponControls');
    controls.innerHTML = '';
    const props = ['Headshot%','Sensitivity','Stability','Fire Rate','Spread','Recoil Ctrl','Aim Speed','Zoom'];
    props.forEach((p,idx)=>{
      const id = 'w_'+key+'_'+idx;
      const el = document.createElement('div');
      el.className = 'control';
      el.innerHTML = `<label>${p} <span id="${id}_val">50</span><input id="${id}" type="range" min="0" max="100" value="${50 - idx}"></label>`;
      controls.appendChild(el);
      document.getElementById(id).addEventListener('input', e => { document.getElementById(id+'_val').textContent = e.target.value; });
    });
  }

  // bind global sliders
  function bindGlobal(){
    document.getElementById('gHs').addEventListener('input', e=> { document.getElementById('gHsText').textContent = e.target.value + '%'; });
    document.getElementById('gSens').addEventListener('input', e=> { document.getElementById('gSensText').textContent = e.target.value; });
    document.getElementById('gStab').addEventListener('input', e=> { document.getElementById('gStabText').textContent = e.target.value; });
    document.getElementById('applyAll').addEventListener('click', ()=> { toast('Applied global to all weapons (mock)'); });
  }

  // profiles (simple localStorage)
  function renderProfileList(){
    const sel = document.getElementById('profileList');
    sel.innerHTML = '';
    const raw = localStorage.getItem(STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {profiles:{}};
    const profiles = Object.keys(store.profiles || {});
    profiles.forEach(p => { const o = document.createElement('option'); o.value = p; o.textContent = p; sel.appendChild(o); });
    document.getElementById('saveProfile').addEventListener('click', ()=> {
      const name = document.getElementById('profileName').value.trim();
      if(!name) { toast('Enter profile name'); return; }
      let data = raw ? JSON.parse(localStorage.getItem(STORAGE_KEY)) : {profiles:{}};
      data.profiles = data.profiles || {};
      data.profiles[name] = {time:Date.now()};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      renderProfileList();
      toast('Profile saved (mock)');
    });
    document.getElementById('loadProfile').addEventListener('click', ()=> { const val = sel.value; if(!val) return toast('Select profile'); toast('Loaded profile: '+val); });
  }

  // local state load/save basic
  function loadState(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) { console.log('state loaded'); }
  }

  // Export / Import / Reset handlers
  document.getElementById('exportBtn').addEventListener('click', ()=> {
    const data = {info:'dinhlong mock config', ts:Date.now()};
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'dinhlong_config.json'; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
  document.getElementById('resetBtn').addEventListener('click', ()=> { if(confirm('Reset mock settings?')) { localStorage.removeItem(STORAGE_KEY); toast('Reset'); } });

  // download config
  document.getElementById('downloadBtn').addEventListener('click', ()=> document.getElementById('exportBtn').click());

  // quick toast
  function toast(msg){ const t = document.createElement('div'); t.textContent = msg; t.style.cssText = 'position:fixed;right:18px;bottom:18px;background:linear-gradient(90deg,rgba(0,255,213,0.12),rgba(127,0,255,0.12));padding:8px 12px;border-radius:8px;color:#eafff8;'; document.body.appendChild(t); setTimeout(()=> t.remove(),1400); }

  // RGB animation using HSL rotation across whole page for "16 million colors" effect
  let hue = 0; let running = false;
  function startRGB(){
    if(running) return; running = true;
    function step(){
      hue = (hue + 0.6) % 360; // adjust speed here
      // compute three hue offsets for accents
      const h1 = Math.floor(hue);
      const h2 = Math.floor((hue + 120) % 360);
      const h3 = Math.floor((hue + 240) % 360);
      document.documentElement.style.setProperty('--accent1', `hsl(${h1} 100% 50%)`);
      document.documentElement.style.setProperty('--accent2', `hsl(${h2} 100% 50%)`);
      document.documentElement.style.setProperty('--accent3', `hsl(${h3} 100% 50%)`);
      // animate background gradient by rotating CSS filter hue for extra effect
      document.getElementById('rbg').style.filter = `hue-rotate(${hue}deg) saturate(140%) blur(18px)`;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

})(); // end closure