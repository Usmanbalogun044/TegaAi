// Persona detection and onboarding UI for student questionnaire
// This file contains the script you provided, with a safe PERSONAS fallback

// Ensure a global PERSONAS exists (do not overwrite if already defined)
if (!window.PERSONAS) {
  window.PERSONAS = {
    chidi: {
      name: "Chidi",
      type: "ADHD-Optimized",
      icon: "⚡",
      description: "You're an active learner who loves games and quick wins! We'll keep things fast, fun, and rewarding.",
      features: ["🎮 Game-based lessons (5 minutes each)", "🏆 Earn XP points and unlock badges", "🔥 Daily streak tracker"],
      dashboard: "/dashboard/",
      settings: { maxLessonDuration: 5 }
    },
    ngozi: {
      name: "Ngozi",
      type: "Audio-First Learning",
      icon: "🔊",
      description: "You learn best by listening! We'll focus on audio lessons with real-life skills.",
      features: ["🔊 Audio-first interface", "📖 Dyslexia-friendly fonts"],
      dashboard: "/dashboard/",
      settings: { audioFirst: true }
    },
    tunde: {
      name: "Tunde",
      type: "Self-Paced Mastery",
      icon: "🐢",
      description: "You understand things deeply when given time! We'll never rush you.",
      features: ["🐢 Self-paced lessons", "📚 Extra explanations and examples"],
      dashboard: "/dashboard/",
      settings: { selfPaced: true }
    }
  };
}

// Form handling
(function(){
  const personaForm = document.getElementById('personaForm');
  if (!personaForm) return;

  personaForm.addEventListener('submit', function(e) {
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
    
    // Show loading animation
    showLoading(detectedPersona);
  });

  // Persona detection algorithm (same as provided)
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
      personaData: window.PERSONAS[persona],
      answers: answers,
      createdAt: new Date().toISOString(),
      settings: window.PERSONAS[persona] ? window.PERSONAS[persona].settings : {}
    };
    
    try { localStorage.setItem('tegaLearningProfile', JSON.stringify(profile)); } catch (e) { console.warn('localStorage failed', e); }
    
    // Also save in sessionStorage for immediate access
    try { sessionStorage.setItem('currentPersona', persona); } catch (e) { /* ignore */ }
    
    console.log('Profile saved:', profile);
  }

  // Loading animation with messages
  function showLoading(persona) {
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
        showResult(persona);
      }
    }, 800);
  }

  // Show persona result
  function showResult(persona) {
    const loading = document.getElementById('loadingState');
    const result = document.getElementById('resultPreview');
    const personaData = window.PERSONAS[persona] || {};
    
    loading.style.display = 'none';
    result.style.display = 'block';
    
    // Set persona icon
    const iconEl = document.getElementById('personaIcon');
    if (iconEl) iconEl.textContent = personaData.icon || '🎮';
    
    // Set description
    const descEl = document.getElementById('personaDescription');
    if (descEl) descEl.textContent = personaData.description || '';
    
    // Set features
    const featuresEl = document.getElementById('personaFeatures');
    if (featuresEl) {
      const featuresHTML = (personaData.features || []).map(feature => 
        `<div class="feature-item">${feature}</div>`
      ).join('');
      featuresEl.innerHTML = featuresHTML;
    }
    
    // Confetti celebration
    setTimeout(() => {
      createConfetti();
    }, 300);
  }

  // Proceed to dashboard
  window.proceedToDashboard = function() {
    const profile = JSON.parse(localStorage.getItem('tegaLearningProfile') || '{}');
    const dashboardUrl = (profile.personaData && profile.personaData.dashboard) || '/dashboard/';
    
    // Redirect to persona-specific dashboard
    window.location.href = dashboardUrl;
  };

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

  // Export helpers for debugging
  window.TegaPersona = window.TegaPersona || {};
  window.TegaPersona.getCurrentProfile = () => JSON.parse(localStorage.getItem('tegaLearningProfile') || '{}');
  window.TegaPersona.getPersonaSettings = () => (window.TegaPersona.getCurrentProfile().settings || {});
})();
