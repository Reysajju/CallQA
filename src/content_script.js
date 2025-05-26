// --- Improved Storage Logic ---
function saveAnalysisToHistory(sessionData) {
  // Ensure all required fields exist
  sessionData = {
    transcription: sessionData.transcription || '',
    summary: sessionData.summary || '',
    qa: sessionData.qa || {},
    chat: Array.isArray(sessionData.chat) ? sessionData.chat : [],
    timestamp: Date.now(),
    source: 'webpage'
  };

  // Create unique key
  const contentHash = btoa(sessionData.transcription.slice(0, 100)).replace(/[^a-zA-Z0-9]/g, '');
  const key = `gemini_audio_${sessionData.timestamp}_${contentHash}`;

  try {
    const serializedData = JSON.stringify(sessionData);
    localStorage.setItem(key, serializedData);
    sessionStorage.setItem(key, serializedData);
    
    // Share with popup
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
      // Still try to share with popup
      chrome.runtime.sendMessage({
        action: 'history-update',
        key: key,
        data: sessionData
      });
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

// Detect <audio> elements and inject an "Analyze Audio" button if not present
function injectAnalyzeButtons() {
  const audios = document.querySelectorAll('audio');
  audios.forEach(audio => {
    if (!audio.parentElement.querySelector('.gemini-analyze-audio-btn')) {
      const btn = document.createElement('button');
      btn.textContent = 'Analyze Audio';
      btn.className = 'gemini-analyze-audio-btn';
      btn.style.marginLeft = '8px';
      btn.onclick = async (e) => {
        btn.disabled = true;
        btn.textContent = 'Processing...';
        try {
          let audioSrc = audio.src;
          if (!audioSrc && audio.querySelector('source')) {
            audioSrc = audio.querySelector('source').src;
          }
          if (!audioSrc) {
            alert('No audio source found.');
            return;
          }
          
          const response = await fetch(audioSrc);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = function() {
            const base64Audio = reader.result.split(',')[1];
            const analysisId = Date.now().toString();
            
            // Send for background processing
            chrome.runtime.sendMessage({
              action: 'analyze-audio',
              id: analysisId,
              audioData: base64Audio,
              source: 'webpage'
            });

            // Show processing status
            const statusDiv = document.createElement('div');
            statusDiv.style.marginTop = '8px';
            statusDiv.textContent = 'Processing... This will continue in background.';
            btn.parentElement.appendChild(statusDiv);

            // Listen for completion
            chrome.runtime.onMessage.addListener(function listener(message) {
              if (message.action === 'analysis-complete' && message.id === analysisId) {
                btn.disabled = false;
                btn.textContent = 'Analyze Audio';
                statusDiv.remove();
                
                if (message.data) {
                  showTranscriptionPopup(
                    message.data.transcription,
                    message.data.summary,
                    message.data.qa
                  );
                }
                
                chrome.runtime.onMessage.removeListener(listener);
              }
              
              if (message.action === 'analysis-error' && message.id === analysisId) {
                btn.disabled = false;
                btn.textContent = 'Analyze Audio';
                statusDiv.textContent = 'Error: ' + message.error;
                setTimeout(() => statusDiv.remove(), 5000);
                chrome.runtime.onMessage.removeListener(listener);
              }
            });
          };
          reader.readAsDataURL(blob);
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Analyze Audio';
          alert('Failed to fetch audio: ' + err.message);
        }
      };
      audio.parentElement.appendChild(btn);
    }
  });
}

function showTranscriptionPopup(transcription, summary, qa, audioKey) {
  let modal = document.getElementById('gemini-transcription-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gemini-transcription-modal';
    modal.style.position = 'fixed';
    modal.style.top = '10%';
    modal.style.left = '50%';
    modal.style.transform = 'translateX(-50%)';
    modal.style.background = '#fff';
    modal.style.border = '1px solid #888';
    modal.style.borderRadius = '8px';
    modal.style.padding = '20px';
    modal.style.zIndex = 99999;
    modal.style.maxWidth = '80vw';
    modal.style.maxHeight = '60vh';
    modal.style.overflowY = 'auto';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.marginBottom = '10px';
    closeBtn.onclick = () => modal.remove();
    modal.appendChild(closeBtn);

    // Improved tabbed UI
    const tabBar = document.createElement('div');
    tabBar.style.display = 'flex';
    tabBar.style.marginBottom = '10px';
    const tabs = [
      { label: 'Transcription', content: transcription || 'No transcription available.' },
      { label: 'Summary', content: summary || 'No summary available.' },
      { label: 'Q&A', content: qa && Object.keys(qa).length ? 
        Object.entries(qa).map(([q,a]) => `<div><strong>${q}</strong><br>${a}</div>`).join('<hr>') :
        '<em>No Q&A available.</em>' }
    ];

    tabs.forEach((tab, idx) => {
      const t = document.createElement('button');
      t.textContent = tab.label;
      t.style.flex = '1';
      t.style.padding = '6px';
      t.style.border = 'none';
      t.style.background = idx === 0 ? '#0078d7' : '#e9ecef';
      t.style.color = idx === 0 ? '#fff' : '#333';
      
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = tab.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      contentDiv.style.display = idx === 0 ? '' : 'none';
      modal.appendChild(contentDiv);

      t.onclick = () => {
        Array.from(tabBar.children).forEach((b,i) => {
          b.style.background = i === idx ? '#0078d7' : '#e9ecef';
          b.style.color = i === idx ? '#fff' : '#333';
        });
        Array.from(modal.querySelectorAll('div')).forEach((d,i) => {
          if (i > 0) { // Skip the first div (close button)
            d.style.display = i-1 === idx ? '' : 'none';
          }
        });
      };
      tabBar.appendChild(t);
    });
    
    modal.insertBefore(tabBar, modal.children[1]); // Insert after close button
    document.body.appendChild(modal);
  }
}

// Observe DOM for dynamically added audio tags
const observer = new MutationObserver(() => injectAnalyzeButtons());
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', injectAnalyzeButtons);
window.addEventListener('load', injectAnalyzeButtons);
