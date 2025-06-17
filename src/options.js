// Load saved settings
document.addEventListener('DOMContentLoaded', function() {
  loadApiKey();
  loadQuestions();
});

// API Key Management
function loadApiKey() {
  chrome.storage.sync.get(['geminiApiKey'], function(result) {
    if (result.geminiApiKey) {
      document.getElementById('apiKey').value = result.geminiApiKey;
    }
  });
}

function saveApiKey() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const statusDiv = document.getElementById('apiKeyStatus');
  
  if (!apiKey) {
    showStatus(statusDiv, 'Please enter an API key', 'error');
    return;
  }
  
  chrome.storage.sync.set({ geminiApiKey: apiKey }, function() {
    showStatus(statusDiv, 'API key saved successfully!', 'success');
  });
}

// Questions Management
let questions = [];

function loadQuestions() {
  chrome.storage.sync.get(['presetQuestions'], function(result) {
    questions = result.presetQuestions || [
      'What are the main topics discussed?',
      'What are the key action items?',
      'Were there any deadlines mentioned?',
      'What decisions were made?',
      'Who are the key stakeholders mentioned?'
    ];
    renderQuestions();
  });
}

function renderQuestions() {
  const container = document.getElementById('questionsList');
  container.innerHTML = '';
  
  questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'form-group';
    questionDiv.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="text" value="${question}" onchange="updateQuestion(${index}, this.value)" style="flex: 1;">
        <button onclick="removeQuestion(${index})" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Remove</button>
      </div>
    `;
    container.appendChild(questionDiv);
  });
}

function updateQuestion(index, value) {
  questions[index] = value;
}

function addQuestion() {
  questions.push('');
  renderQuestions();
}

function removeQuestion(index) {
  questions.splice(index, 1);
  renderQuestions();
}

function saveQuestions() {
  // Filter out empty questions
  const filteredQuestions = questions.filter(q => q.trim() !== '');
  
  chrome.storage.sync.set({ presetQuestions: filteredQuestions }, function() {
    questions = filteredQuestions;
    renderQuestions();
    showStatus(document.getElementById('questionsStatus'), 'Questions saved successfully!', 'success');
  });
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type}`;
  element.style.display = 'block';
  
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}

// Event listeners
document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
document.getElementById('addQuestion').addEventListener('click', addQuestion);
document.getElementById('saveQuestions').addEventListener('click', saveQuestions);

// Make functions global for inline event handlers
window.updateQuestion = updateQuestion;
window.removeQuestion = removeQuestion;