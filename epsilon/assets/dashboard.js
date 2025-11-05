// Shared dashboard logic for persona-specific dashboards
(function(){
  function ensureProfileOrRedirect(){
    const profileRaw = localStorage.getItem('tegaLearningProfile');
    if(!profileRaw){
      window.location.href = 'persona-onboarding.html';
      return null;
    }
    try { return JSON.parse(profileRaw); } catch(e){
      localStorage.removeItem('tegaLearningProfile');
      window.location.href = 'persona-onboarding.html';
      return null;
    }
  }

  function setBodyPersonaMode(persona){
    document.body.classList.add(persona + '-mode');
  }

  function mountPersonaBadge(profile){
    const badge = document.createElement('div');
    badge.className = 'persona-badge';
    badge.style.cssText = 'position:fixed;top:16px;right:16px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:8px 14px;border-radius:18px;font-weight:600;z-index:1000;display:flex;align-items:center;gap:8px;box-shadow:0 6px 18px rgba(0,0,0,0.2)';
  badge.innerHTML = `<span style="font-size:18px">${profile.personaData?.icon || '<img src="/static/icons/Logo.svg"/>'}</span><span>${profile.personaData?.type || profile.persona}</span>`;
    document.body.appendChild(badge);
  }

  function speak(text, rate=1, pitch=1){
    if(!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = pitch;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function listenToPage(selector){
    const content = document.querySelector(selector || 'main, .container, body');
    if(!content) return;
    const text = content.innerText.replace(/\s+/g,' ').trim();
    const profile = window.TegaPersona?.getCurrentProfile?.() || {};
    const persona = profile.persona;
    // Persona-specific speaking style
    const rate = persona === 'tunde' ? 0.85 : persona === 'ngozi' ? 0.95 : 1.05;
    const pitch = persona === 'chidi' ? 1.15 : 1.0;
    speak(text, rate, pitch);
  }

  // CHIDI: XP & streak system (simple localStorage impl)
  const XP_KEY = 'chidiXP';
  const STREAK_KEY = 'chidiStreak';
  const LAST_VISIT_KEY = 'chidiLastVisitDate';

  function earnXP(amount){
    const current = parseInt(localStorage.getItem(XP_KEY)) || 0;
    const next = current + amount;
    localStorage.setItem(XP_KEY, next);
    const el = document.getElementById('xp-points');
    if(el) el.textContent = next + ' XP';
    floatToast('+'+amount+' XP ✨');
  }

  function floatToast(text){
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = 'position:fixed;left:50%;top:20%;transform:translate(-50%,-50%);padding:12px 18px;background:#4c3fb1;color:#fff;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,0.25);font-weight:700;z-index:1000;opacity:0;transition:opacity .15s, transform .3s';
    document.body.appendChild(el);
    requestAnimationFrame(()=>{el.style.opacity='1'; el.style.transform='translate(-50%,-60%)';});
    setTimeout(()=>{el.style.opacity='0'; el.style.transform='translate(-50%,-40%)'; setTimeout(()=>el.remove(),200);}, 1400);
  }

  function updateStreak(){
    const today = new Date().toDateString();
    const last = localStorage.getItem(LAST_VISIT_KEY);
    let streak = parseInt(localStorage.getItem(STREAK_KEY)) || 0;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if(last === today) {
      // already counted
    } else if(last === yesterday){
      streak += 1;
    } else {
      streak = 1;
    }
    localStorage.setItem(STREAK_KEY, ''+streak);
    localStorage.setItem(LAST_VISIT_KEY, today);
    const el = document.getElementById('streak-days');
    if(el) el.textContent = streak + ' Days';
  }

  function loadXP(){
    const xp = parseInt(localStorage.getItem(XP_KEY)) || 0;
    const el = document.getElementById('xp-points');
    if(el) el.textContent = xp + ' XP';
  }

  function initChidi(){
    loadXP();
    updateStreak();
    const startBtn = document.getElementById('chidi-start-lesson');
    if(startBtn){
      startBtn.addEventListener('click', ()=>{
        earnXP(10);
  window.location.href = '/micro-lesson/';
      });
    }
    const breakBtn = document.getElementById('chidi-take-break');
    if(breakBtn){
      breakBtn.addEventListener('click', ()=>{
  window.location.href = '/break-timer/?duration=5';
      });
    }
  }

  function initNgozi(){
    const listenPageBtn = document.getElementById('listen-page');
    if(listenPageBtn){ listenPageBtn.addEventListener('click', ()=> listenToPage('.container')); }
    // Attach small speaker buttons to headings/paragraphs
    document.querySelectorAll('h1,h2,h3,p,li').forEach(node=>{
      const btn = document.createElement('button');
      btn.setAttribute('aria-label','Listen to this text');
      btn.textContent = '🔊';
      btn.style.cssText = 'margin-left:8px;border:none;background:#4a90e2;color:#fff;border-radius:8px;padding:4px 8px;cursor:pointer';
      btn.addEventListener('click', ()=> speak(node.innerText, 0.95, 1));
      node.appendChild(btn);
    });
  }

  function initTunde(){
    const speedBtns = document.querySelectorAll('[data-speed]');
    const saved = localStorage.getItem('tundeSpeed');
    if(saved){
      document.querySelectorAll('[data-speed]').forEach(b=> b.classList.toggle('active', b.dataset.speed===saved));
    }
    speedBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        localStorage.setItem('tundeSpeed', btn.dataset.speed);
        speedBtns.forEach(b=> b.classList.toggle('active', b===btn));
        floatToast('Speed set to ' + btn.textContent);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const profile = ensureProfileOrRedirect();
    if(!profile) return;
    setBodyPersonaMode(profile.persona);
    mountPersonaBadge(profile);

    if(profile.persona === 'chidi') initChidi();
    if(profile.persona === 'ngozi') initNgozi();
    if(profile.persona === 'tunde') initTunde();
  });

  // Expose helpers
  window.TegaDash = { speak, listenToPage, earnXP };
})();