/* Tega — simple SPA logic */
(function(){
  const body = document.body;

  const screens = {
    landing: document.getElementById('screen-landing'),
    signup: document.getElementById('screen-signup'),
    quiz: document.getElementById('screen-quiz')
  };

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  
  if (mobileMenuBtn && sidebar) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    mobileMenuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
    
    // Close sidebar when clicking overlay
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
    
    // Close sidebar when clicking a nav link
    const navLinks = sidebar.querySelectorAll('.nav-item, .footer-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    });
  }

  // Helpers
  function qs(q){ return document.querySelector(q); }
  function qsa(q){ return Array.from(document.querySelectorAll(q)); }
  function getQueryParam(key){ return new URLSearchParams(location.search).get(key); }

  let selectedRole = null;

  // Navigation helper (only toggles existing screens)
  function showScreen(name){
    Object.keys(screens).forEach(key => {
      const el = screens[key];
      if(!el) return;
      const active = key === name;
      el.hidden = !active;
      el.classList.toggle('active', active);
    });
    // Theme switch by screen
    if(name === 'quiz') body.className = 'theme-lavender';
    else body.className = 'theme-peach';
  }

  // Quiz data
  const questions = [
    { text: 'I find it easier to learn with pictures and videos' },
    { text: 'Short practice sessions work better for me than long ones' },
    { text: 'I like step-by-step guidance when learning something new' },
    { text: 'I prefer learning at my own pace with personalized tips' }
  ];
  const choices = ['Strongly Agree','Agree','Neutral','Disagree'];
  const answers = new Array(questions.length).fill(null);

  let qIndex = 0;

  const qText = document.getElementById('question-text');
  const optionsEl = document.getElementById('options');
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');

  function startQuiz(){
    if(!screens.quiz) return;
    qIndex = 0;
    showScreen('quiz');
    renderQuestion();
  }

  function renderQuestion(){
    const total = questions.length;
    const num = qIndex + 1;
    const pct = Math.round(((qIndex) / total) * 100);
    if(progressBar) progressBar.style.width = `${pct}%`;
    if(progressLabel) progressLabel.textContent = `Question ${num} of ${total}`;

    if(qText) qText.textContent = questions[qIndex].text;
    if(optionsEl) optionsEl.innerHTML = '';

    choices.forEach((label, i) => {
      const id = `opt-${qIndex}-${i}`;
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'option';
      opt.setAttribute('role','radio');
      opt.setAttribute('aria-checked','false');
      opt.setAttribute('id', id);

      opt.innerHTML = `<span class="dot"><input aria-hidden="true"></span><span class="text">${label}</span>`;

      opt.addEventListener('click', () => selectOption(i));
      opt.addEventListener('keydown', (ev)=>{
        if(ev.key === 'ArrowRight' || ev.key === 'ArrowDown'){ ev.preventDefault(); selectOption(Math.min(i+1, choices.length-1)); }
        if(ev.key === 'ArrowLeft' || ev.key === 'ArrowUp'){ ev.preventDefault(); selectOption(Math.max(i-1, 0)); }
        if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); selectOption(i); }
      });

      optionsEl && optionsEl.appendChild(opt);
    });

    if(answers[qIndex] != null){
      selectOption(answers[qIndex], false);
    } else {
      setSelected(null);
      btnNext.disabled = true;
    }

    if(btnBack) btnBack.disabled = qIndex === 0;
    if(btnNext) btnNext.textContent = (qIndex === questions.length - 1) ? 'Finish' : 'Next';
  }

  function setSelected(idx){
    document.querySelectorAll('.option').forEach((el, i) => {
      const on = idx === i;
      el.classList.toggle('selected', on);
      el.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function selectOption(choiceIndex, enableNext = true){
    answers[qIndex] = choiceIndex;
    setSelected(choiceIndex);
    if(enableNext && btnNext) btnNext.disabled = false;
  }

  if(btnBack){
    btnBack.addEventListener('click', ()=>{
      if(qIndex > 0){ qIndex--; renderQuestion(); }
    });
  }
  if(btnNext){
    btnNext.addEventListener('click', ()=>{
      if(answers[qIndex] == null){ if(btnNext) btnNext.disabled = true; return; }
      if(qIndex < questions.length - 1){
        qIndex++;
        renderQuestion();
      } else {
        finish();
      }
    });
  }

  function finish(){
    const quizAnswersField = document.getElementById('quiz-answers');
    const quizForm = document.getElementById('quiz-form');
    
    if (quizAnswersField && quizForm) {
      const quizData = questions.map((q, idx) => ({
        question: q.text,
        answer: choices[answers[idx]]
      }));
      
      quizAnswersField.value = JSON.stringify(quizData);
      quizForm.submit();
    }
  }

  if (screens.quiz && screens.quiz.classList.contains('active')) {
    startQuiz();
  }

  // ============================================
  // TEXT-TO-SPEECH SETUP (Before addMessage)
  // ============================================
  let readAloudEnabled = localStorage.getItem('readAloudEnabled') === 'true';
  let speechSynthesis = window.speechSynthesis;
  let currentUtterance = null;

  function updateReadAloudButton() {
    const readAloudBtn = document.getElementById('read-aloud-btn');
    if (readAloudBtn) {
      readAloudBtn.textContent = readAloudEnabled ? '🔊' : '🔇';
      readAloudBtn.title = readAloudEnabled ? 'Read aloud is ON' : 'Read aloud is OFF';
      readAloudBtn.classList.toggle('active', readAloudEnabled);
    }
  }

  function speakText(text) {
    if (!readAloudEnabled) return;
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    let cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n+/g, '. ')
      .replace(/#+\s/g, '')
      .trim();
    
    if (!cleanText) return;
    
    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1.1;
    currentUtterance.volume = 1.0;
    
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Google UK English Female') ||
      voice.name.includes('Microsoft Zira')
    );
    
    if (preferredVoice) {
      currentUtterance.voice = preferredVoice;
    }
    
    currentUtterance.onstart = function() {
      const readAloudBtn = document.getElementById('read-aloud-btn');
      if (readAloudBtn) readAloudBtn.classList.add('speaking');
    };
    
    currentUtterance.onend = function() {
      const readAloudBtn = document.getElementById('read-aloud-btn');
      if (readAloudBtn) readAloudBtn.classList.remove('speaking');
    };
    
    currentUtterance.onerror = function(event) {
      console.error('Speech synthesis error:', event);
      const readAloudBtn = document.getElementById('read-aloud-btn');
      if (readAloudBtn) readAloudBtn.classList.remove('speaking');
    };
    
    speechSynthesis.speak(currentUtterance);
  }

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function() {
      speechSynthesis.getVoices();
    };
  }

  // Set up read aloud button
  if (document.getElementById('read-aloud-btn')) {
    const readAloudBtn = document.getElementById('read-aloud-btn');
    updateReadAloudButton();
    
    readAloudBtn.addEventListener('click', function() {
      readAloudEnabled = !readAloudEnabled;
      localStorage.setItem('readAloudEnabled', readAloudEnabled);
      updateReadAloudButton();
      
      if (!readAloudEnabled && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    });
  }

  // ============================================
  // CHAT FUNCTIONALITY
  // ============================================
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');
  const quickIdeaBtns = document.querySelectorAll('.quick-idea-btn');
  const muteBtn = document.getElementById('mute-btn');
  
  let isSoundEnabled = true;
  
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      muteBtn.textContent = isSoundEnabled ? '🔔' : '🔇';
      muteBtn.setAttribute('aria-label', isSoundEnabled ? 'Mute sound' : 'Unmute sound');
      localStorage.setItem('tegaSoundEnabled', isSoundEnabled);
    });
    
    const savedPreference = localStorage.getItem('tegaSoundEnabled');
    if (savedPreference !== null) {
      isSoundEnabled = savedPreference === 'true';
      muteBtn.textContent = isSoundEnabled ? '🔔' : '🔇';
    }
  }
  
  let chatSocket = null;
  let reconnectAttempts = 0;
  let reconnectInterval = null;
  let isIntentionallyClosed = false;
  
  if (chatMessages) {
    connectWebSocket();
  }
  
  function connectWebSocket() {
    if (isIntentionallyClosed) return;
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat/`;
      chatSocket = new WebSocket(wsUrl);
      
      chatSocket.onopen = function(e) {
        console.log('WebSocket connection established');
        reconnectAttempts = 0;
        const statusEl = document.querySelector('.chat-status');
        if (statusEl) statusEl.textContent = '● Online';
        
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };
      
      chatSocket.onmessage = function(e) {
        try {
          const data = JSON.parse(e.data);
          const message = data.message || data.response || data.text || e.data;
          addMessage(message, false);
        } catch (error) {
          addMessage(e.data, false);
        }
      };
      
      chatSocket.onerror = function(e) {
        console.error('WebSocket error:', e);
        const statusEl = document.querySelector('.chat-status');
        if (statusEl) statusEl.textContent = '● Reconnecting...';
      };
      
      chatSocket.onclose = function(e) {
        console.log('WebSocket connection closed');
        const statusEl = document.querySelector('.chat-status');
        if (statusEl) statusEl.textContent = '● Reconnecting...';
        
        if (!isIntentionallyClosed) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          
          reconnectInterval = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      if (!isIntentionallyClosed) {
        setTimeout(connectWebSocket, 5000);
      }
    }
  }
  
  setInterval(() => {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(JSON.stringify({ type: 'ping' }));
    }
  }, 60000);
  
  function playMessageSound() {
    if (!isSoundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 1.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.5);
  }
  
  window.addEventListener('beforeunload', () => {
    isIntentionallyClosed = true;
    if (chatSocket) {
      chatSocket.close();
    }
  });

  // Simple markdown parser
  function parseMarkdown(text) {
    let html = text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    return html;
  }

  // UNIFIED addMessage function with text-to-speech support
  function addMessage(text, isUser = false) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'tega-message'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `message-avatar ${isUser ? 'user-avatar' : ''}`;
    
    if (isUser) {
      avatarDiv.textContent = '👤';
    } else {
      const img = document.createElement('img');
      img.src = document.querySelector('.logo-icon img')?.src || '/static/icons/Logo.svg';
      avatarDiv.appendChild(img);
      playMessageSound();
    }
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = parseMarkdown(text);
    
    if (isUser) {
      messageDiv.appendChild(bubbleDiv);
      messageDiv.appendChild(avatarDiv);
    } else {
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(bubbleDiv);
      
      // Add read aloud button for Tega messages
      const readBtn = document.createElement('button');
      readBtn.className = 'message-read-btn';
      readBtn.innerHTML = '🔊';
      readBtn.title = 'Read this message';
      readBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        speakText(text);
      });
      messageDiv.appendChild(readBtn);
      
      // Auto-read if enabled
      if (readAloudEnabled) {
        setTimeout(() => speakText(text), 500);
      }
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function sendMessage() {
    const fileInput = document.getElementById('file-input');
    const attachedFile = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;
    const userMessage = messageInput ? messageInput.value.trim() : '';
    
    if (!userMessage && !attachedFile) return;
    
    if (userMessage) {
      addMessage(userMessage, true);
    }
    
    if (attachedFile) {
      addMessage(`📎 ${attachedFile.name}`, true);
    }
    
    if (messageInput) {
      messageInput.value = '';
    }
    
    if (attachedFile) {
      addMessage('Processing file...', false);
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64Content = e.target.result.split(',')[1];
        
        let messageForAI = userMessage;
        if (!messageForAI) {
          if (attachedFile.type === 'application/pdf') {
            messageForAI = 'Please read and analyze this PDF document. Help me understand its content.';
          } else if (attachedFile.type === 'text/plain') {
            messageForAI = 'Please read and analyze this text file. Help me understand its content.';
          } else {
            messageForAI = `Please analyze this file: ${attachedFile.name}`;
          }
        }
        
        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
          const messageData = {
            message: messageForAI,
            type: 'chat',
            unique_id: window.uniqueId || null,
            file: {
              name: attachedFile.name,
              type: attachedFile.type,
              content: base64Content
            }
          };
          
          chatSocket.send(JSON.stringify(messageData));
          console.log('File sent:', attachedFile.name);
        } else {
          addMessage('Sorry, connection lost. Please refresh the page.', false);
        }
        
        fileInput.value = '';
        const filePreview = document.getElementById('file-preview');
        if (filePreview) filePreview.style.display = 'none';
      };
      reader.onerror = function(error) {
        console.error('Error reading file:', error);
        addMessage('Sorry, there was an error reading the file.', false);
        fileInput.value = '';
        const filePreview = document.getElementById('file-preview');
        if (filePreview) filePreview.style.display = 'none';
      };
      reader.readAsDataURL(attachedFile);
    } else {
      if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
          message: userMessage,
          type: 'chat',
          unique_id: window.uniqueId || null
        });
        chatSocket.send(messageData);
      } else {
        addMessage('Sorry, connection lost. Please refresh the page.', false);
      }
    }
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // File upload handling
  const fileUploadBtn = document.getElementById('file-upload-btn');
  const fileInput = document.getElementById('file-input');
  const filePreview = document.getElementById('file-preview');
  const fileName = document.getElementById('file-name');
  const fileRemoveBtn = document.getElementById('file-remove-btn');

  if (fileUploadBtn && fileInput) {
    fileUploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const validTypes = ['application/pdf', 'text/plain'];
        if (!validTypes.includes(file.type)) {
          alert('Please upload only PDF or TXT files.');
          fileInput.value = '';
          return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('File size must be less than 10MB.');
          fileInput.value = '';
          return;
        }

        if (fileName) {
          fileName.textContent = file.name;
        }
        if (filePreview) {
          filePreview.style.display = 'flex';
        }
      }
    });
  }

  if (fileRemoveBtn && fileInput && filePreview) {
    fileRemoveBtn.addEventListener('click', () => {
      fileInput.value = '';
      filePreview.style.display = 'none';
    });
  }

  quickIdeaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idea = btn.textContent;
      if (messageInput) {
        messageInput.value = idea;
        sendMessage();
      }
    });
  });

  // Persona detection
  const personaForm = document.getElementById('personaForm');
  if (personaForm) {
    const PERSONAS = {
      chidi: { name: 'Chidi', type: 'ADHD-Optimized', icon: '⚡' },
      ngozi: { name: 'Ngozi', type: 'Audio-First Learning', icon: '🔊' },
      tunde: { name: 'Tunde', type: 'Self-Paced Mastery', icon: '🐢' }
    };

    function detectPersona(answers){
      const scores = { chidi:0, ngozi:0, tunde:0 };
      switch(answers.learningStyle){
        case 'visual-active': scores.chidi += 3; break;
        case 'audio-patient': scores.ngozi += 3; break;
        case 'slow-steady': scores.tunde += 3; break;
        case 'mixed': scores.chidi += 1; scores.ngozi += 1; scores.tunde += 1; break;
      }
      switch(answers.focusTime){
        case '5': scores.chidi += 3; break;
        case '15': scores.chidi += 1; scores.tunde += 1; break;
        case '30': scores.tunde += 2; break;
        case 'flex': scores.chidi += 2; break;
      }
      switch(answers.readingLevel){
        case 'struggle': scores.ngozi += 3; scores.chidi += 1; break;
        case 'slow': scores.ngozi += 2; scores.tunde += 2; break;
        case 'ok': scores.tunde += 1; break;
        case 'confident': break;
      }
      switch(answers.learningGoal){
        case 'school': scores.chidi += 1; scores.tunde += 1; break;
        case 'life-skills': scores.ngozi += 3; break;
        case 'catch-up': scores.tunde += 2; break;
        case 'confidence': scores.ngozi += 1; scores.tunde += 1; break;
      }
      const detected = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
      return detected;
    }

    personaForm.addEventListener('submit', function(e){
      try {
        const fd = new FormData(personaForm);
        const answers = {
          learningStyle: fd.get('learningStyle'),
          focusTime: fd.get('focusTime'),
          readingLevel: fd.get('readingLevel'),
          learningGoal: fd.get('learningGoal')
        };
        const persona = detectPersona(answers);

        const profile = {
          persona,
          personaData: PERSONAS[persona] || null,
          answers,
          createdAt: new Date().toISOString()
        };
        try { localStorage.setItem('tegaLearningProfile', JSON.stringify(profile)); } catch(_){}
        try { sessionStorage.setItem('currentPersona', persona); } catch(_){}

        const hiddenPersona = document.getElementById('persona-field');
        if (hiddenPersona) hiddenPersona.value = persona;
      } catch (err) {
        console.warn('Persona detection skipped:', err);
      }
    });
  }
})();
