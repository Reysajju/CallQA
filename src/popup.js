// --- UI State ---
let currentTab = 'transcription';
let lastTranscription = '';
let lastSummary = '';
let lastQA = {};
let chatHistory = [];
let presetQuestions = [];

// --- Tab Logic ---
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

function switchTab(tabName) {
  tabs.forEach(t => t.classList.remove('active'));
  tabContents.forEach(tc => tc.classList.remove('active'));
  
  const targetTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    currentTab = tabName;
    
    // Show/hide back button based on tab
    const backBtn = document.getElementById('back-btn');
    if (tabName === 'settings') {
      backBtn.style.display = '';
    } else {
      backBtn.style.display = 'none';
    }
    
    if (tabName === 'settings') loadQuestionsUI();
    if (tabName === 'qa') renderQA();
  }
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

// Add back button to top bar
const topBar = document.getElementById('top-bar');
const backBtn = document.createElement('button');
backBtn.id = 'back-btn';
backBtn.className = 'icon-btn';
backBtn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
  <path d="M19 12H5M12 19l-7-7 7-7"/>
</svg>`;
backBtn.style.display = 'none';
backBtn.style.marginRight = 'auto'; // Push to left
backBtn.onclick = () => switchTab('transcription');
topBar.insertBefore(backBtn, topBar.firstChild);

// Update settings button handler
document.getElementById('settings-btn').onclick = () => {
  switchTab('settings');
};

// --- Drag & Drop/File Input ---
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const tabsDiv = document.getElementById('tabs');
const transcriptionDiv = document.getElementById('transcription');
const summaryDiv = document.getElementById('summary');
const qaDiv = document.getElementById('qa');
const chatDiv = document.getElementById('chat');

let selectedFile = null;

function showTabs() { tabsDiv.style.display = ''; }
function hideTabs() { tabsDiv.style.display = 'none'; }

// Add process button UI
const processContainer = document.createElement('div');
processContainer.style.textAlign = 'center';
processContainer.style.marginTop = '10px';
processContainer.style.display = 'none';

const processButton = document.createElement('button');
processButton.textContent = 'Process Audio';
processButton.style.background = '#0078d7';
processButton.style.color = '#fff';
processButton.style.border = 'none';
processButton.style.borderRadius = '4px';
processButton.style.padding = '8px 20px';
processButton.style.cursor = 'pointer';
processButton.onclick = () => {
  if (selectedFile) {
    handleFile(selectedFile);
  }
};

processContainer.appendChild(processButton);
dropArea.parentElement.insertBefore(processContainer, dropArea.nextSibling);

function handleFileSelection(file) {
  if (!file.type.startsWith('audio/')) {
    alert('Please select a valid audio file.');
    return;
  }
  selectedFile = file;
  dropArea.style.backgroundColor = '#e3f2fd';
  dropArea.innerHTML = `<p>Selected: ${file.name}<br>Click "Process Audio" to analyze</p>`;
  processContainer.style.display = 'block';
}

// Update existing drag & drop handlers
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  handleFileSelection(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  handleFileSelection(file);
});

// Add connection management
let port = chrome.runtime.connect({ name: 'popup' });
let currentAnalysisId = null;

// Listen for analysis status updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analysis-status' && message.id === currentAnalysisId) {
    loading.textContent = 'Processing audio... This will continue even if popup closes.';
  }
  
  if (message.action === 'analysis-complete' && message.id === currentAnalysisId) {
    loading.style.display = 'none';
    showTabs();
    
    if (message.data) {
      lastTranscription = message.data.transcription;
      lastSummary = message.data.summary;
      lastQA = message.data.qa;
      
      transcriptionDiv.innerHTML = formatHeadings(message.data.transcription);
      summaryDiv.innerHTML = formatHeadings(message.data.summary || '<em>No summary provided.</em>');
      renderQA();
      
      // Save to history
      saveAnalysisToHistory(message.data);
    }
  }
  
  if (message.action === 'analysis-error' && message.id === currentAnalysisId) {
    loading.style.display = 'none';
    dropArea.style.display = 'block';
    alert('Error processing audio: ' + message.error);
  }

  // Handle history updates from webpage
  if (message.action === 'history-update' && message.key && message.data) {
    try {
      localStorage.setItem(message.key, JSON.stringify(message.data));
      sessionStorage.setItem(message.key, JSON.stringify(message.data));
      // Refresh history if modal is open
      const historyModal = document.getElementById('gemini-history-modal');
      if (historyModal) {
        showHistoryModal();
      }
    } catch (error) {
      console.error('Failed to save shared history:', error);
    }
  }
});

function handleFile(file) {
  processContainer.style.display = 'none';
  dropArea.style.display = 'none';
  loading.style.display = 'block';
  loading.textContent = 'Processing audio... This will continue even if popup closes.';
  
  const reader = new FileReader();
  reader.onload = function() {
    const base64Audio = reader.result.split(',')[1];
    currentAnalysisId = Date.now().toString();
    
    chrome.runtime.sendMessage({
      action: 'analyze-audio',
      id: currentAnalysisId,
      audioData: base64Audio,
      source: 'popup'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Processing continues in background');
      }
    });
  };
  reader.readAsDataURL(file);
}

// --- Improved Storage Logic ---
function saveAnalysisToHistory(sessionData) {
  // Ensure all required fields exist
  sessionData = {
    transcription: sessionData.transcription || '',
    summary: sessionData.summary || '',
    qa: sessionData.qa || {},
    chat: Array.isArray(sessionData.chat) ? sessionData.chat : [],
    timestamp: Date.now(),
    source: 'popup' // or 'webpage'
  };

  // Create unique key
  const contentHash = btoa(sessionData.transcription.slice(0, 100)).replace(/[^a-zA-Z0-9]/g, '');
  const key = `gemini_audio_${sessionData.timestamp}_${contentHash}`;

  try {
    const serializedData = JSON.stringify(sessionData);
    localStorage.setItem(key, serializedData);
    sessionStorage.setItem(key, serializedData);
    
    // Broadcast to other extension contexts
    chrome.runtime.sendMessage({
      action: 'history-update',
      key: key,
      data: sessionData
    });
    
    pruneOldEntries();
    return key;
  } catch (error) {
    console.error('Failed to save analysis:', error);
    try {
      sessionStorage.setItem(key, JSON.stringify(sessionData));
      return key;
    } catch (e) {
      console.error('Failed to save to sessionStorage:', e);
      return null;
    }
  }
}

function pruneOldEntries() {
  const maxEntries = 50;
  try {
    // Get all Gemini entries
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('gemini_audio_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          entries.push({ key, timestamp: data.timestamp || 0 });
        } catch {}
      }
    }
    
    // Sort by timestamp (newest first) and remove excess
    entries.sort((a, b) => b.timestamp - a.timestamp);
    if (entries.length > maxEntries) {
      entries.slice(maxEntries).forEach(entry => {
        try {
          localStorage.removeItem(entry.key);
          sessionStorage.removeItem(entry.key);
        } catch {}
      });
    }
  } catch (error) {
    console.error('Failed to prune old entries:', error);
  }
}

function getAllGeminiSessionData() {
  const data = {};
  // Get entries from both storage types
  try {
    // First get from localStorage for persistence
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('gemini_audio_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch {}
      }
    }
    
    // Then merge in any session-only entries
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('gemini_audio_') && !data[key]) {
        try {
          data[key] = JSON.parse(sessionStorage.getItem(key));
        } catch {}
      }
    }
  } catch (error) {
    console.error('Error retrieving session data:', error);
  }
  return data;
}

// --- Headings Formatter ---
function formatHeadings(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// --- Settings: Preset Questions ---
const questionsList = document.getElementById('questions-list');
const addQBtn = document.querySelector('.add-q');
const saveQsBtn = document.getElementById('save-qs');

function loadQuestionsUI() {
  chrome.storage.sync.get(['presetQuestions'], (data) => {
    presetQuestions = Array.isArray(data.presetQuestions) ? data.presetQuestions : [];
    renderQuestions();
  });
}
function renderQuestions() {
  questionsList.innerHTML = '';
  presetQuestions.forEach((q, idx) => {
    const row = document.createElement('div');
    row.className = 'question-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = q;
    input.oninput = e => presetQuestions[idx] = e.target.value;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.className = 'remove-q';
    removeBtn.onclick = () => { presetQuestions.splice(idx, 1); renderQuestions(); };
    row.appendChild(input);
    row.appendChild(removeBtn);
    questionsList.appendChild(row);
  });
}
addQBtn.onclick = () => {
  presetQuestions.push('');
  renderQuestions();
};
saveQsBtn.onclick = () => {
  chrome.storage.sync.set({ presetQuestions }, () => {
    saveQsBtn.textContent = 'Saved!';
    setTimeout(() => saveQsBtn.textContent = 'Save', 1200);
  });
};

// --- Q&A Tab (placeholder) ---
function renderQA() {
  if (!lastQA || Object.keys(lastQA).length === 0) {
    qaDiv.innerHTML = '<em>No Q&A provided.</em>';
    return;
  }
  qaDiv.innerHTML = '';
  Object.entries(lastQA).forEach(([q, a]) => {
    const qEl = document.createElement('div');
    qEl.innerHTML = `<strong>Q:</strong> ${q}`;
    const aEl = document.createElement('div');
    aEl.innerHTML = `<strong>A:</strong> ${a}`;
    qaDiv.appendChild(qEl);
    qaDiv.appendChild(aEl);
    qaDiv.appendChild(document.createElement('hr'));
  });
}

// --- Chat Tab ---
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
chatSend.onclick = () => {
  if (!chatInput.value.trim() || !lastTranscription) return;
  const userMsg = chatInput.value.trim();
  chatHistory.push({ user: userMsg });
  renderChat();
  chatInput.value = '';
  chatInput.disabled = true;
  chatSend.disabled = true;
  chrome.runtime.sendMessage({
    action: 'chat-with-transcription',
    transcript: lastTranscription,
    userMessage: userMsg
  }, (response) => {
    chatInput.disabled = false;
    chatSend.disabled = false;
    if (response && response.reply) {
      chatHistory.push({ bot: response.reply });
    } else {
      chatHistory.push({ bot: response && response.error ? response.error : 'Error getting response.' });
    }
    renderChat();
  });
};
function renderChat() {
  chatMessages.innerHTML = '';
  chatHistory.forEach(msg => {
    if (msg.user) {
      const div = document.createElement('div');
      div.className = 'chat-msg chat-user';
      div.textContent = 'You: ' + msg.user;
      chatMessages.appendChild(div);
    }
    if (msg.bot) {
      const div = document.createElement('div');
      div.className = 'chat-msg chat-bot';
      div.textContent = 'Gemini: ' + msg.bot;
      chatMessages.appendChild(div);
    }
  });
}

// --- Top bar buttons ---
document.getElementById('settings-btn').onclick = () => {
  switchTab('settings');
};
document.getElementById('history-btn').onclick = () => {
  showHistoryModal();
}

function showHistoryModal() {
  let modal = document.getElementById('gemini-history-modal');
  if (modal) { modal.remove(); }
  
  // Create modal UI
  modal = document.createElement('div');
  modal.id = 'gemini-history-modal';
  modal.style.position = 'fixed';
  modal.style.top = '10%';
  modal.style.left = '50%';
  modal.style.transform = 'translateX(-50%)';
  modal.style.background = '#fff';
  modal.style.border = '1px solid #888';
  modal.style.borderRadius = '12px';
  modal.style.padding = '24px 24px 18px 24px';
  modal.style.zIndex = 99999;
  modal.style.maxWidth = '90vw';
  modal.style.maxHeight = '70vh';
  modal.style.overflowY = 'auto';
  modal.style.boxShadow = '0 4px 24px #0002';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.marginBottom = '16px';
  closeBtn.style.float = 'right';
  closeBtn.style.background = '#e57373';
  closeBtn.style.color = '#fff';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '4px';
  closeBtn.style.padding = '6px 16px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => modal.remove();
  modal.appendChild(closeBtn);

  const title = document.createElement('h2');
  title.textContent = 'Session History';
  title.style.margin = '0 0 18px 0';
  modal.appendChild(title);

  // List view with improved source handling
  const historyList = document.createElement('div');
  historyList.id = 'gemini-history-list';
  const entries = [];
  
  // Get all entries from both storage types
  const allData = getAllGeminiSessionData();
  Object.entries(allData).forEach(([key, val]) => {
    if (val && val.transcription) {
      entries.push({
        key,
        timestamp: val.timestamp || parseInt(key.split('_')[1]) || 0,
        data: val,
        source: val.source || 'popup'
      });
    }
  });

  // Sort by timestamp (newest first)
  entries.sort((a, b) => b.timestamp - a.timestamp);
  
  if (entries.length === 0) {
    historyList.appendChild(document.createTextNode('No history found.'));
  } else {
    entries.forEach(({ key, timestamp, data, source }) => {
      const card = document.createElement('div');
      card.className = 'history-card';
      
      // Add source indicator
      const sourceLabel = source === 'webpage' ? '(Web Page)' : '(Popup)';
      const date = new Date(timestamp);
      const preview = (data.transcription || '').slice(0, 60) + '...';
      
      card.innerHTML = `
        <strong>${date.toLocaleString()} ${sourceLabel}</strong><br>
        <span style="color:#888;font-size:13px;">${preview}</span>
      `;
      
      const viewBtn = document.createElement('button');
      viewBtn.textContent = 'View Details';
      viewBtn.onclick = () => showHistoryDetailsModal(key, data, modal);
      card.appendChild(viewBtn);
      historyList.appendChild(card);
    });
  }
  
  modal.appendChild(historyList);
  document.body.appendChild(modal);
}

function showHistoryDetailsModal(key, val, parentModal) {
  parentModal.innerHTML = '';
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to History';
  backBtn.style.background = '#e9ecef';
  backBtn.style.color = '#0078d7';
  backBtn.style.border = 'none';
  backBtn.style.borderRadius = '4px';
  backBtn.style.padding = '6px 14px';
  backBtn.style.cursor = 'pointer';
  backBtn.style.marginBottom = '12px';
  backBtn.onclick = showHistoryModal;
  parentModal.appendChild(backBtn);

  // Tabbed details view
  const tabBar = document.createElement('div');
  tabBar.style.display = 'flex';
  tabBar.style.margin = '10px 0 18px 0';
  const tabs = ['Transcription', 'Summary', 'Q&A', 'Chat'];
  let activeTab = 0;
  const tabBtns = tabs.map((tab, idx) => {
    const t = document.createElement('button');
    t.textContent = tab;
    t.style.flex = '1';
    t.style.padding = '8px';
    t.style.border = 'none';
    t.style.background = idx === 0 ? '#0078d7' : '#e9ecef';
    t.style.color = idx === 0 ? '#fff' : '#333';
    t.style.fontWeight = '500';
    t.style.cursor = 'pointer';
    t.onclick = () => {
      tabBtns.forEach((b, i) => {
        b.style.background = i === idx ? '#0078d7' : '#e9ecef';
        b.style.color = i === idx ? '#fff' : '#333';
      });
      tabContents.forEach((c, i) => c.style.display = i === idx ? '' : 'none');
    };
    tabBar.appendChild(t);
    return t;
  });
  parentModal.appendChild(tabBar);
  // Tab contents
  const transDiv = document.createElement('div');
  transDiv.innerHTML = formatHeadings(val.transcription || '<em>No transcription.</em>');
  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = formatHeadings(val.summary || '<em>No summary.</em>');
  const qaDiv = document.createElement('div');
  if (val.qa && Object.keys(val.qa).length) {
    qaDiv.innerHTML = Object.entries(val.qa).map(([q,a]) => `<div style='margin-bottom:10px;'><strong>${q}</strong><br>${a}</div>`).join('<hr>');
  } else {
    qaDiv.innerHTML = '<em>No Q&A available.</em>';
  }
  const chatDiv = document.createElement('div');
  if (val.chat && val.chat.length) {
    chatDiv.innerHTML = val.chat.map(msg =>
      msg.user ? `<div style='color:#0078d7;'><strong>You:</strong> ${msg.user}</div>` :
      msg.bot ? `<div style='color:#333;'><strong>Gemini:</strong> ${msg.bot}</div>` : ''
    ).join('');
  } else {
    chatDiv.innerHTML = '<em>No chat history.</em>';
  }
  const tabContents = [transDiv, summaryDiv, qaDiv, chatDiv];
  tabContents.forEach((c, i) => {
    c.style.display = i === 0 ? '' : 'none';
    c.style.margin = '18px 0 0 0';
    parentModal.appendChild(c);
  });
}

// --- Init ---
chrome.storage.sync.get(['presetQuestions'], (data) => {
  presetQuestions = Array.isArray(data.presetQuestions) ? data.presetQuestions : [];
});
