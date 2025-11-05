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

  // REMOVED: Landing role buttons navigation - Now handled by Django URL tags

  // Signup page wiring - REMOVED: Now handled by Django form submission

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
    if(!screens.quiz) return; // Not on a page with quiz
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
        // keyboard support for arrow keys
        if(ev.key === 'ArrowRight' || ev.key === 'ArrowDown'){ ev.preventDefault(); selectOption(Math.min(i+1, choices.length-1)); }
        if(ev.key === 'ArrowLeft' || ev.key === 'ArrowUp'){ ev.preventDefault(); selectOption(Math.max(i-1, 0)); }
        if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); selectOption(i); }
      });

      optionsEl && optionsEl.appendChild(opt);
    });

    // restore previous selection if exists
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
    // Save answers to hidden field and submit form
    const quizAnswersField = document.getElementById('quiz-answers');
    const quizForm = document.getElementById('quiz-form');
    
    if (quizAnswersField && quizForm) {
      // Create a data structure with questions and answers
      const quizData = questions.map((q, idx) => ({
        question: q.text,
        answer: choices[answers[idx]]
      }));
      
      quizAnswersField.value = JSON.stringify(quizData);
      quizForm.submit();
    }
  }

  // Auto-start quiz if on the quiz/path page
  if (screens.quiz && screens.quiz.classList.contains('active')) {
    startQuiz();
  }
  
  // REMOVED: Results page handlers - Now using Django URL tags in templates
  
  // REMOVED: Profile Setup handlers - Now using Django forms
  
  // REMOVED: Profile close button - Now using Django URL tags

  // Chat Page Functionality with WebSocket
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');
  const quickIdeaBtns = document.querySelectorAll('.quick-idea-btn');
  const muteBtn = document.getElementById('mute-btn');
  
  // Sound control
  let isSoundEnabled = true;
  
  // Mute button functionality
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isSoundEnabled = !isSoundEnabled;
      muteBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
      muteBtn.setAttribute('aria-label', isSoundEnabled ? 'Mute sound' : 'Unmute sound');
      
      // Save preference to localStorage
      localStorage.setItem('tegaSoundEnabled', isSoundEnabled);
    });
    
    // Load saved preference
    const savedPreference = localStorage.getItem('tegaSoundEnabled');
    if (savedPreference !== null) {
      isSoundEnabled = savedPreference === 'true';
      muteBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
      muteBtn.setAttribute('aria-label', isSoundEnabled ? 'Mute sound' : 'Unmute sound');
    }
  }
  
  // WebSocket connection
  let chatSocket = null;
  let reconnectAttempts = 0;
  let reconnectInterval = null;
  let isIntentionallyClosed = false;
  
  // Initialize WebSocket connection if on chat page
  if (chatMessages) {
    connectWebSocket();
  }
  
  function connectWebSocket() {
    if (isIntentionallyClosed) return;
    
    try {
      // Use local WebSocket that bridges to external AI
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat/`;
      chatSocket = new WebSocket(wsUrl);
      
      chatSocket.onopen = function(e) {
        console.log('WebSocket connection established');
        console.log('Connected to:', wsUrl);
        reconnectAttempts = 0;
        // Update connection status
        const statusEl = document.querySelector('.chat-status');
        if (statusEl) statusEl.textContent = '● Online';
        
        // Clear any reconnect interval
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
      };
      
      chatSocket.onmessage = function(e) {
        try {
          const data = JSON.parse(e.data);
          // Display Tega's response with markdown support
          const message = data.message || data.response || data.text || e.data;
          const format = data.format || 'text';
          addMessage(message, false, format);
        } catch (error) {
          // If not JSON, treat as plain text
          addMessage(e.data, false, 'text');
        }
      };
      
      chatSocket.onerror = function(e) {
        console.error('WebSocket error:', e);
        const statusEl = document.querySelector('.chat-status');
        if (statusEl) statusEl.textContent = '● Reconnecting...';
      };
      
      chatSocket.onclose = function(e) {
        console.log('WebSocket connection closed', e.code, e.reason);
        const statusEl = document.querySelector('.chat-status');
        if (statusEl) statusEl.textContent = '● Reconnecting...';
        
        // Always try to reconnect unless intentionally closed
        if (!isIntentionallyClosed) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
          console.log(`Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts})...`);
          
          reconnectInterval = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      const statusEl = document.querySelector('.chat-status');
      if (statusEl) statusEl.textContent = '● Offline';
      
      // Retry connection
      if (!isIntentionallyClosed) {
        setTimeout(connectWebSocket, 5000);
      }
    }
  }
  
  // Keep connection alive with heartbeat
  setInterval(() => {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(JSON.stringify({ type: 'ping' }));
    }
  }, 60000); // Send ping every 60 seconds (1 minute)
  
  // Audio notification for new messages
  function playMessageSound() {
    // Don't play sound if muted
    if (!isSoundEnabled) return;
    
    // Create a pleasant notification sound (2 seconds)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000; // Frequency in Hz
    oscillator.type = 'sine';
    
    // Create a gentle fade in and fade out over 2 seconds
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1); // Fade in
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 1.5); // Hold
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2); // Fade out
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.5);
  }
  
  // Close connection gracefully when leaving page
  window.addEventListener('beforeunload', () => {
    isIntentionallyClosed = true;
    if (chatSocket) {
      chatSocket.close();
    }
  });

  function addMessage(text, isUser = false, format = 'text') {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'tega-message'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `message-avatar ${isUser ? 'user-avatar' : ''}`;
    
    // Create avatar content (image for Tega, emoji for user)
    if (isUser) {
      avatarDiv.textContent = '👤';
    } else {
      const img = document.createElement('img');
      img.src = document.querySelector('.logo-icon img')?.src || '/static/icons/Logo.svg';
      avatarDiv.appendChild(img);
      
      // Play sound for Tega's messages only
      playMessageSound();
    }
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    // Handle markdown formatting
    if (format === 'markdown') {
      bubbleDiv.innerHTML = parseMarkdown(text);
    } else {
      bubbleDiv.textContent = text;
    }
    
    if (isUser) {
      messageDiv.appendChild(bubbleDiv);
      messageDiv.appendChild(avatarDiv);
    } else {
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(bubbleDiv);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Simple markdown parser
  function parseMarkdown(text) {
    // Convert markdown to HTML
    let html = text
      // Bold: **text** or __text__
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Line breaks: \n
      .replace(/\n/g, '<br>')
      // Code: `code`
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    return html;
  }

  function sendMessage() {
    // Check if there's a file attached
    const fileInput = document.getElementById('file-input');
    const attachedFile = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;
    
    // Get message text (can be empty if file is attached)
    const userMessage = messageInput ? messageInput.value.trim() : '';
    
    // Don't send if both message and file are empty
    if (!userMessage && !attachedFile) return;
    
    // Display user message in chat if there's text
    if (userMessage) {
      addMessage(userMessage, true);
    }
    
    // Display file indicator in chat if there's a file
    if (attachedFile) {
      addMessage(`📎 ${attachedFile.name}`, true);
    }
    
    // Clear input
    if (messageInput) {
      messageInput.value = '';
    }
    
    if (attachedFile) {
      // Show loading message
      addMessage('Processing file...', false);
      
      // Convert file to base64 and send
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64Content = e.target.result.split(',')[1]; // Remove data:...;base64, prefix
        
        // Create a meaningful message for the AI
        let messageForAI = userMessage;
        if (!messageForAI) {
          // Default message if user didn't provide one
          if (attachedFile.type === 'application/pdf') {
            messageForAI = 'Please read and analyze this PDF document. Help me understand its content.';
          } else if (attachedFile.type === 'text/plain') {
            messageForAI = 'Please read and analyze this text file. Help me understand its content.';
          } else {
            messageForAI = `Please analyze this file: ${attachedFile.name}`;
          }
        }
        
        // Send message with file via WebSocket
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
          
          console.log('=== FILE UPLOAD DEBUG ===');
          console.log('File sent via WebSocket:', attachedFile.name);
          console.log('File type:', attachedFile.type);
          console.log('Message sent:', messageForAI);
          console.log('File size (base64):', base64Content.length, 'characters');
          console.log('File size (original):', attachedFile.size, 'bytes');
          console.log('Full message structure:', {
            message: messageForAI,
            type: 'chat',
            unique_id: window.uniqueId || null,
            file: {
              name: attachedFile.name,
              type: attachedFile.type,
              contentLength: base64Content.length
            }
          });
          console.log('=== END DEBUG ===');
        } else {
          addMessage('Sorry, connection lost. Please refresh the page.', false);
        }
        
        // Clear file input and hide preview
        fileInput.value = '';
        const filePreview = document.getElementById('file-preview');
        if (filePreview) filePreview.style.display = 'none';
      };
      reader.onerror = function(error) {
        console.error('Error reading file:', error);
        addMessage('Sorry, there was an error reading the file.', false);
        // Clear file input and hide preview
        fileInput.value = '';
        const filePreview = document.getElementById('file-preview');
        if (filePreview) filePreview.style.display = 'none';
      };
      reader.readAsDataURL(attachedFile);
    } else {
      // Send message without file via WebSocket
      if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
          message: userMessage,
          type: 'chat',
          unique_id: window.uniqueId || null
        });
        chatSocket.send(messageData);
      } else {
        // Fallback if WebSocket not connected
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
        // Validate file type
        const validTypes = ['application/pdf', 'text/plain'];
        if (!validTypes.includes(file.type)) {
          alert('Please upload only PDF or TXT files.');
          fileInput.value = '';
          return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
          alert('File size must be less than 10MB.');
          fileInput.value = '';
          return;
        }

        // Show file preview
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

  // Quick idea buttons
  quickIdeaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idea = btn.textContent;
      if (messageInput) {
        messageInput.value = idea;
        sendMessage();
      }
    });
  });

  // ============================================
  // Persona detection for onboarding form
  // ============================================
  const personaForm = document.getElementById('personaForm');
  if (personaForm) {
    // Minimal persona profiles for client storage (optional extension)
    const PERSONAS = {
      chidi: {
        name: 'Chidi', type: 'ADHD-Optimized', icon: '⚡'
      },
      ngozi: {
        name: 'Ngozi', type: 'Audio-First Learning', icon: '🔊'
      },
      tunde: {
        name: 'Tunde', type: 'Self-Paced Mastery', icon: '🐢'
      }
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
      // Collect answers and detect persona, then let form submit to server
      try {
        const fd = new FormData(personaForm);
        const answers = {
          learningStyle: fd.get('learningStyle'),
          focusTime: fd.get('focusTime'),
          readingLevel: fd.get('readingLevel'),
          learningGoal: fd.get('learningGoal')
        };
        const persona = detectPersona(answers);

        // Save lightweight profile to storage (optional for client use)
        const profile = {
          persona,
          personaData: PERSONAS[persona] || null,
          answers,
          createdAt: new Date().toISOString()
        };
        try { localStorage.setItem('tegaLearningProfile', JSON.stringify(profile)); } catch(_){}
        try { sessionStorage.setItem('currentPersona', persona); } catch(_){}

        // Populate hidden field so server can store persona in session
        const hiddenPersona = document.getElementById('persona-field');
        if (hiddenPersona) hiddenPersona.value = persona;

        // Optionally show a brief loading state before submit
        const loading = document.getElementById('loadingState');
        if (loading) {
          // Show loading spinner briefly but do NOT block submission long
          // We don't preventDefault; submission continues normally
        }
      } catch (err) {
        console.warn('Persona detection skipped:', err);
      }
    });
  }
})();
