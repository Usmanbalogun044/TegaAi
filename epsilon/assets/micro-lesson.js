// Micro-Lesson ADHD-Friendly Mode
(function() {
  let currentStep = 1;
  const totalSteps = 4;
  let lessonStartTime = Date.now();
  let timerInterval = null;
  let timeRemaining = 120; // 2 minutes in seconds
  let distractionFreeMode = false;

  const steps = document.querySelectorAll('.lesson-step');
  const progressSteps = document.querySelectorAll('.step');
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressFill = document.getElementById('progress-fill');
  const lessonTimer = document.getElementById('lesson-timer');
  const readAloudBtn = document.getElementById('read-aloud-btn');
  const distractionFreeToggle = document.getElementById('distraction-free-toggle');
  const optionBtns = document.querySelectorAll('.option-btn');
  const encouragement = document.getElementById('encouragement');

  // Initialize
  function init() {
    setupEventListeners();
    startLessonTimer();
    updateNavigation();
  }

  function setupEventListeners() {
    if (backBtn) {
      backBtn.addEventListener('click', goToPreviousStep);
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', goToNextStep);
    }
    if (readAloudBtn) {
      readAloudBtn.addEventListener('click', readStepAloud);
    }
    if (distractionFreeToggle) {
      distractionFreeToggle.addEventListener('click', toggleDistractionFree);
    }

    // Practice question options
    optionBtns.forEach(btn => {
      btn.addEventListener('click', handleAnswer);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && !backBtn.disabled) {
        goToPreviousStep();
      } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
        goToNextStep();
      }
    });
  }

  function goToNextStep() {
    if (currentStep >= totalSteps) return;

    // Hide current step
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (currentStepEl) {
      currentStepEl.classList.remove('active');
      currentStepEl.style.display = 'none';
    }

    // Update progress
    const currentProgressStep = progressSteps[currentStep - 1];
    if (currentProgressStep) {
      currentProgressStep.classList.remove('active');
      currentProgressStep.classList.add('completed');
    }

    currentStep++;

    // Show next step
    const nextStepEl = document.getElementById(`step-${currentStep}`);
    if (nextStepEl) {
      nextStepEl.style.display = 'block';
      setTimeout(() => nextStepEl.classList.add('active'), 50);
    }

    // Update progress
    if (currentStep <= totalSteps) {
      const nextProgressStep = progressSteps[currentStep - 1];
      if (nextProgressStep) {
        nextProgressStep.classList.add('active');
      }
    }

    updateProgress();
    updateNavigation();
    playTransitionSound();

    // If on completion step, stop timer
    if (currentStep === totalSteps) {
      stopLessonTimer();
      celebrateCompletion();
    }
  }

  function goToPreviousStep() {
    if (currentStep <= 1) return;

    // Hide current step
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (currentStepEl) {
      currentStepEl.classList.remove('active');
      currentStepEl.style.display = 'none';
    }

    // Update progress
    const currentProgressStep = progressSteps[currentStep - 1];
    if (currentProgressStep) {
      currentProgressStep.classList.remove('active');
    }

    currentStep--;

    // Show previous step
    const prevStepEl = document.getElementById(`step-${currentStep}`);
    if (prevStepEl) {
      prevStepEl.style.display = 'block';
      setTimeout(() => prevStepEl.classList.add('active'), 50);
    }

    // Update progress
    const prevProgressStep = progressSteps[currentStep - 1];
    if (prevProgressStep) {
      prevProgressStep.classList.remove('completed');
      prevProgressStep.classList.add('active');
    }

    updateProgress();
    updateNavigation();
  }

  function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
  }

  function updateNavigation() {
    if (backBtn) {
      backBtn.disabled = currentStep === 1;
    }
    if (nextBtn) {
      if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'inline-flex';
      }
    }
  }

  function startLessonTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();

      if (timeRemaining <= 0) {
        stopLessonTimer();
        // Auto-advance to completion if time runs out
        if (currentStep < totalSteps) {
          currentStep = totalSteps - 1;
          goToNextStep();
        }
      }
    }, 1000);
  }

  function stopLessonTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  }

  function updateTimerDisplay() {
    if (!lessonTimer) return;

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    lessonTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Change color if running out of time
    if (timeRemaining <= 30) {
      lessonTimer.style.color = '#f59e0b';
    }
  }

  function readStepAloud() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (!currentStepEl) return;

    // Get all text content
    const title = currentStepEl.querySelector('.step-title')?.textContent || '';
    const text = currentStepEl.querySelector('.step-text')?.textContent || '';
    const hint = currentStepEl.querySelector('.hint-text')?.textContent || '';

    const fullText = `${title}. ${text}. ${hint}`;

    // Use Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch for friendliness
      utterance.volume = 1;

      // Change button state
      readAloudBtn.innerHTML = '<span class="voice-icon">⏸️</span><span class="voice-text">Pause</span>';
      readAloudBtn.classList.add('speaking');

      utterance.onend = () => {
        readAloudBtn.innerHTML = '<span class="voice-icon">🔊</span><span class="voice-text">Read Aloud</span>';
        readAloudBtn.classList.remove('speaking');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser doesn\'t support text-to-speech.');
    }
  }

  function handleAnswer(e) {
    const selectedAnswer = e.target.dataset.answer;
    const correctAnswer = '6';

    optionBtns.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answer === correctAnswer) {
        btn.classList.add('correct');
      } else if (btn === e.target && btn.dataset.answer !== correctAnswer) {
        btn.classList.add('incorrect');
      }
    });

    if (selectedAnswer === correctAnswer) {
      if (encouragement) {
        encouragement.style.display = 'flex';
      }
      playSuccessSound();
      
      // Auto-advance after 2 seconds
      setTimeout(() => {
        goToNextStep();
      }, 2000);
    } else {
      // Show correct answer after a moment
      setTimeout(() => {
        const correctBtn = document.querySelector(`[data-answer="${correctAnswer}"]`);
        if (correctBtn) {
          correctBtn.classList.add('correct');
        }
        // Still advance but show encouragement
        if (encouragement) {
          encouragement.querySelector('.encourage-text').textContent = 'Good try! The answer is 6. Let\'s keep going!';
          encouragement.style.display = 'flex';
        }
        setTimeout(() => {
          goToNextStep();
        }, 3000);
      }, 1000);
    }
  }

  function toggleDistractionFree() {
    distractionFreeMode = !distractionFreeMode;
    document.body.classList.toggle('distraction-free', distractionFreeMode);
    
    if (distractionFreeMode) {
      distractionFreeToggle.querySelector('.toggle-text').textContent = 'Normal Mode';
      distractionFreeToggle.classList.add('active');
    } else {
      distractionFreeToggle.querySelector('.toggle-text').textContent = 'Distraction-Free Mode';
      distractionFreeToggle.classList.remove('active');
    }
  }

  function celebrateCompletion() {
    // Confetti effect
    createConfetti();
    playCompletionSound();
    
    // Save progress
    saveProgress();
  }

  function createConfetti() {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 5000);
    }
  }

  function playTransitionSound() {
    // Simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 600;
    gainNode.gain.value = 0.1;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    setTimeout(() => oscillator.stop(), 100);
  }

  function playSuccessSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.2;

    oscillator.start();
    setTimeout(() => {
      oscillator.frequency.value = 1000;
    }, 100);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    setTimeout(() => oscillator.stop(), 300);
  }

  function playCompletionSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C, E, G (major chord)

    notes.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        gainNode.gain.value = 0.15;

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        setTimeout(() => oscillator.stop(), 500);
      }, index * 150);
    });
  }

  function saveProgress() {
    const completionTime = Math.floor((Date.now() - lessonStartTime) / 1000);
    const progress = {
      lessonCompleted: true,
      completionTime: completionTime,
      timestamp: new Date().toISOString(),
      mode: 'ADHD-friendly'
    };

    try {
      const existingProgress = JSON.parse(localStorage.getItem('microLessons') || '[]');
      existingProgress.push(progress);
      localStorage.setItem('microLessons', JSON.stringify(existingProgress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }

  // Initialize when page loads
  if (document.querySelector('.micro-lesson-container')) {
    init();
  }
})();
