// Persona Detection Engine for Tega Learning App

// Persona profiles
const PERSONAS = {
  chidi: {
    name: "Chidi",
    type: "ADHD-Optimized",
    icon: "⚡",
    description: "You're an active learner who loves games and quick wins! We'll keep things fast, fun, and rewarding.",
    features: [
      "🎮 Game-based lessons (5 minutes each)",
      "🏆 Earn XP points and unlock badges",
      "🔥 Daily streak tracker",
      "⏰ Movement break reminders",
      "🔊 Voice guidance and sound effects",
      "📱 Phone-optimized controls"
    ],
    dashboard: "/dashboard/",  // Changed to Django URL
    settings: {
      maxLessonDuration: 5,
      gamification: true,
      visualRewards: true,
      movementBreaks: true,
      soundEffects: true,
      voiceReminders: true
    }
  },
  
  ngozi: {
    name: "Ngozi",
    type: "Audio-First Learning",
    icon: "🔊",
    description: "You learn best by listening! We'll focus on audio lessons with real-life skills that matter to you.",
    features: [
      "🔊 Audio-first interface (listen to everything)",
      "📖 Dyslexia-friendly fonts and spacing",
      "💰 Practical life skills (banking, forms, business)",
      "🎯 No shame, no pressure - learn at your pace",
      "🖼️ Picture-based navigation",
      "✅ Patient, encouraging feedback"
    ],
  dashboard: "/dashboard/",  // Always go to main dashboard
    settings: {
      audioFirst: true,
      dyslexicFriendly: true,
      practicalSkills: true,
      shameFree: true,
      largeText: true,
      readingSupport: true
    }
  },
  
  tunde: {
    name: "Tunde",
    type: "Self-Paced Mastery",
    icon: "🐢",
    description: "You understand things deeply when given time! We'll never rush you - quality over speed.",
    features: [
      "🐢 Self-paced lessons (no timers ever)",
      "📚 Extra explanations and examples",
      "🔄 Review concepts multiple ways",
      "💡 Unlimited practice mode",
      "⭐ Encouragement, not pressure",
      "📊 Track understanding, not speed"
    ],
    dashboard: "/dashboard/",  // Changed to Django URL (can be customized)
    settings: {
      selfPaced: true,
      noTimers: true,
      extraExplanations: true,
      spacedRepetition: true,
      unlimitedRetries: true,
      encouragingFeedback: true
    }
  }
};

// Form handling
if (document.getElementById('personaForm')) {
  document.getElementById('personaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
    const answers = {
      learningStyle: formData.get('learningStyle'),
      focusTime: formData.get('focusTime'),
      readingLevel: formData.get('readingLevel'),
      learningGoal: formData.get('learningGoal')
    };
    
    // Detect persona
    const detectedPersona = detectPersona(answers);
    
    // Save to localStorage
    saveUserProfile(detectedPersona, answers);
    
    // Set hidden field
    document.getElementById('persona-field').value = detectedPersona;
    
    // Show loading then redirect directly to dashboard
    showLoadingThenRedirect(detectedPersona);
  });
}

// Persona detection algorithm
function detectPersona(answers) {
  const scores = {
    chidi: 0,
    ngozi: 0,
    tunde: 0
  };
  
  // Scoring based on learning style
  switch(answers.learningStyle) {
    case 'visual-active':
      scores.chidi += 3;
      break;
    case 'audio-patient':
      scores.ngozi += 3;
      break;
    case 'slow-steady':
      scores.tunde += 3;
      break;
    case 'mixed':
      scores.chidi += 1;
      scores.ngozi += 1;
      scores.tunde += 1;
      break;
  }
  
  // Scoring based on focus time
  switch(answers.focusTime) {
    case '5':
      scores.chidi += 3;
      break;
    case '15':
      scores.chidi += 1;
      scores.tunde += 1;
      break;
    case '30':
      scores.tunde += 2;
      break;
    case 'flex':
      scores.chidi += 2;
      break;
  }
  
  // Scoring based on reading level
  switch(answers.readingLevel) {
    case 'struggle':
      scores.ngozi += 3;
      scores.chidi += 1;
      break;
    case 'slow':
      scores.ngozi += 2;
      scores.tunde += 2;
      break;
    case 'ok':
      scores.tunde += 1;
      break;
    case 'confident':
      // No specific persona benefit
      break;
  }
  
  // Scoring based on learning goal
  switch(answers.learningGoal) {
    case 'school':
      scores.chidi += 1;
      scores.tunde += 1;
      break;
    case 'life-skills':
      scores.ngozi += 3;
      break;
    case 'catch-up':
      scores.tunde += 2;
      break;
    case 'confidence':
      scores.ngozi += 1;
      scores.tunde += 1;
      break;
  }
  
  // Determine highest scoring persona
  const sortedPersonas = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const detectedPersona = sortedPersonas[0][0];
  
  console.log('Persona Scores:', scores);
  console.log('Detected Persona:', detectedPersona);
  
  return detectedPersona;
}

// Save user profile to localStorage
function saveUserProfile(persona, answers) {
  const profile = {
    persona: persona,
    personaData: PERSONAS[persona],
    answers: answers,
    createdAt: new Date().toISOString(),
    settings: PERSONAS[persona].settings
  };
  
  localStorage.setItem('tegaLearningProfile', JSON.stringify(profile));
  
  // Also save in sessionStorage for immediate access
  sessionStorage.setItem('currentPersona', persona);
  
  console.log('Profile saved:', profile);
}

// Loading animation then redirect to dashboard
function showLoadingThenRedirect(persona) {
  const form = document.getElementById('personaForm');
  const loading = document.getElementById('loadingState');
  
  form.style.display = 'none';
  loading.style.display = 'block';
  
  const messages = [
    "Analyzing your learning style...",
    "Selecting the best lessons for you...",
    "Customizing your dashboard...",
    "Setting up your rewards system...",
    "Almost ready!"
  ];
  
  let messageIndex = 0;
  const messageElement = document.getElementById('loadingMessage');
  
  const interval = setInterval(() => {
    if (messageIndex < messages.length) {
      messageElement.textContent = messages[messageIndex];
      messageIndex++;
    } else {
      clearInterval(interval);
      // Redirect directly to persona dashboard
      redirectToDashboard(persona);
    }
  }, 600);
}

// Redirect to appropriate dashboard
function redirectToDashboard(persona) {
  const personaData = PERSONAS[persona];
  
  // Add confetti before redirect
  createConfetti();
  
  // Redirect after short delay to show confetti
  // Force redirect to main dashboard to avoid persona-specific URLs
  setTimeout(() => {
    window.location.href = '/dashboard/';
  }, 1000);
}

// Confetti animation
function createConfetti() {
  const colors = ['#4c3fb1', '#7c6fd6', '#ffd700', '#ff6b9d', '#26c6da'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
  }
}

// Export for use in other files
window.TegaPersona = {
  getCurrentProfile: () => JSON.parse(localStorage.getItem('tegaLearningProfile')),
  getPersonaSettings: () => {
    const profile = JSON.parse(localStorage.getItem('tegaLearningProfile'));
    return profile ? profile.settings : null;
  },
  isPersona: (personaName) => {
    const profile = JSON.parse(localStorage.getItem('tegaLearningProfile'));
    return profile && profile.persona === personaName;
  }
};

(function(){
  // Utility: read CSRF cookie
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  // Safe persona detector fallback (if detectPersona exists elsewhere it will be used)
  function detectPersonaFromAnswers(answers) {
    if (typeof detectPersona === 'function') {
      try { return detectPersona(answers); } catch(e){}
    }
    // simple fallback: prefer ngozi if readingLevel is 'struggle' or learningGoal life-skills
    if (answers.readingLevel === 'struggle' || answers.learningGoal === 'life-skills') return 'ngozi';
    if (answers.focusTime === '5') return 'chidi';
    return 'tunde';
  }

  // Auto-submit + redirect behavior is opt-in per-template.
  // Templates that want immediate redirect when an option is chosen should
  // add `data-auto-redirect="true"` to the <form id="personaForm">.
  const personaForm = document.getElementById('personaForm');
  if (personaForm) {
    const shouldAuto = personaForm.dataset.autoRedirect === 'true';
    if (shouldAuto) {
      const radios = personaForm.querySelectorAll('input[type="radio"]');
      radios.forEach(r => r.addEventListener('change', onAnySelection));
    }
  }

  function onAnySelection() {
    if (!personaForm) return;

    // collect current answers (may be partial)
    const fd = new FormData(personaForm);
    const answers = {
      learningStyle: fd.get('learningStyle') || '',
      focusTime: fd.get('focusTime') || '',
      readingLevel: fd.get('readingLevel') || '',
      learningGoal: fd.get('learningGoal') || ''
    };

    const persona = detectPersonaFromAnswers(answers);

    // set hidden field if present
    const hidden = document.getElementById('persona-field');
    if (hidden) hidden.value = persona;

    // Save profile locally (optional)
    try {
      const profile = {
        persona,
        answers,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('tegaLearningProfile', JSON.stringify(profile));
      sessionStorage.setItem('currentPersona', persona);
    } catch (e) { /* ignore storage errors */ }

    // POST the form to server so session is saved, then redirect to /dashboard/
    const action = personaForm.getAttribute('action') || '/path_questionnaire/';
    const csrftoken = getCookie('csrftoken');

    // send form data (including hidden persona) to server
    const postData = new FormData(personaForm);
    // ensure persona included
    postData.set('persona', persona);

    fetch(action, {
      method: 'POST',
      body: postData,
      credentials: 'same-origin',
      headers: csrftoken ? { 'X-CSRFToken': csrftoken } : {}
    }).catch((err) => {
      // still redirect even if save fails
      console.warn('Could not POST persona (will still redirect):', err);
    }).finally(() => {
      // redirect to fixed dashboard route
      window.location.href = '/dashboard/';
    });
  }

  // ...existing code...
})();
