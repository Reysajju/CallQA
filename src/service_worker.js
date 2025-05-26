// Replace with your actual Gemini API key
const GEMINI_API_KEY = "AIzaSyAIkLMizbniJuKLd-ps9PVq6-0H8CW5eOE";

function getGlobalPresetQuestions(callback) {
  chrome.storage.sync.get(['presetQuestions'], (data) => {
    const presetQuestions = Array.isArray(data.presetQuestions) ? data.presetQuestions : [];
    callback(presetQuestions);
  });
}

// Add state management
let activeAnalyses = new Map();

// Listen for connection to track popup state
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    port.onDisconnect.addListener(() => {
      // Popup closed but processing continues
      console.log('Popup closed, processing continues in background');
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze-audio') {
    const analysisId = Date.now().toString();
    
    // Store analysis info
    activeAnalyses.set(analysisId, {
      status: 'processing',
      startTime: Date.now()
    });

    // Broadcast analysis start
    chrome.runtime.sendMessage({
      action: 'analysis-status',
      id: analysisId,
      status: 'processing'
    });

    // Process in background
    const processAudio = async () => {
      try {
        let presetQuestions = request.presetQuestions;
        if (!presetQuestions || (Array.isArray(presetQuestions) && presetQuestions.length === 0)) {
          presetQuestions = await new Promise(resolve => {
            getGlobalPresetQuestions(questions => resolve(questions));
          });
        }

        const result = await analyzeAudioWithGemini(request.audioData, presetQuestions);
        
        // Store result and update status
        activeAnalyses.set(analysisId, {
          status: 'complete',
          result,
          completedAt: Date.now()
        });

        // Save to history
        const sessionData = {
          transcription: result.transcription,
          summary: result.summary,
          timestampedTranscription: result.timestampedTranscription,
          qa: result.qa,
          chat: [],
          timestamp: Date.now(),
          source: request.source || 'popup'
        };

        // Broadcast completion with data
        chrome.runtime.sendMessage({
          action: 'analysis-complete',
          id: analysisId,
          data: sessionData
        });

        sendResponse(result);
      } catch (error) {
        activeAnalyses.set(analysisId, {
          status: 'error',
          error: error.message,
          completedAt: Date.now()
        });
        
        chrome.runtime.sendMessage({
          action: 'analysis-error',
          id: analysisId,
          error: error.message
        });
        
        sendResponse({ error: error.message });
      }
    };

    processAudio();
    return true; // Keep messaging channel open
  }

  if (request.action === 'get-analysis-status') {
    const analysis = activeAnalyses.get(request.id);
    sendResponse(analysis || { status: 'not_found' });
    return true;
  }

  if (request.action === 'chat-with-transcription') {
    chatWithGemini(request.transcript, request.userMessage).then(result => {
      sendResponse(result);
    });
    return true;
  }
});

async function analyzeAudioWithGemini(audioData_base64, presetQuestions = []) {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  // Add default questions if none provided
  const defaultQuestions = [
    "What were the main topics discussed?",
    "What were the key action items or decisions made?",
    "Were there any important deadlines or dates mentioned?"
  ];
  
  const questionsToAsk = presetQuestions.length > 0 ? presetQuestions : defaultQuestions;
  
  // Updated prompt structure for new requirements
  const promptParts = [
    { inlineData: { mimeType: "audio/wav", data: audioData_base64 } },
    { text: `You are a professional call transcription and analysis assistant. Follow these instructions EXACTLY:

1. First provide a timestamped conversation in this EXACT format:
===TIMESTAMPED===
[For each speaker turn, format as:]
Speaker: [A or B]
Time: [HH:MM:SS]
Text: [what they said]
[End with ===END_TIMESTAMPED===]

2. Then provide a clean transcription formatted with new topics/speakers as "**Section Title**"
===TRANSCRIPTION===
[Your formatted transcription]
===END_TRANSCRIPTION===

3. Write a concise 5-9 line summary of the key points
===SUMMARY===
[Your summary]
===END_SUMMARY===

4. Finally, answer each question based on the transcript content:
===Q&A===
${questionsToAsk.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question, format EXACTLY as:
Question: <exact question text>
Answer: <your detailed answer>

If you can't find information for an answer, say "Based on the transcript, I cannot answer this question."
===END_Q&A===

IMPORTANT: 
- Never skip any section
- Always include all section markers
- Format answers exactly as shown
- Be thorough but concise` }
  ];

  const transcriptionPrompt = { contents: [{ parts: promptParts }] };
  
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transcriptionPrompt)
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch { errorData = {}; }
      return { error: errorData.error?.message || 'API Error' };
    }

    const data = await response.json();
    let transcription = "", summary = "", qa = {}, timestampedTranscription = [];

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const fullText = data.candidates[0].content.parts[0].text || '';
      
      // Parse timestamped conversation
      const timestampedMatch = fullText.match(/===TIMESTAMPED===([\s\S]*?)===END_TIMESTAMPED===/);
      if (timestampedMatch) {
        const timestampedText = timestampedMatch[1].trim();
        const entries = timestampedText.split(/(?=Speaker:)/);
        timestampedTranscription = entries.map(entry => {
          const speakerMatch = entry.match(/Speaker:\s*([AB])/);
          const timeMatch = entry.match(/Time:\s*(\d{2}:\d{2}:\d{2})/);
          const textMatch = entry.match(/Text:\s*([\s\S]*?)(?=(?:Speaker:|$))/);
          
          return {
            speaker: speakerMatch ? `Speaker ${speakerMatch[1]}` : 'Unknown Speaker',
            timestamp: timeMatch ? timeMatch[1] : '00:00:00',
            text: textMatch ? textMatch[1].trim() : ''
          };
        }).filter(entry => entry.text);
      }

      // Parse transcription
      const transcriptionMatch = fullText.match(/===TRANSCRIPTION===([\s\S]*?)===END_TRANSCRIPTION===/);
      transcription = transcriptionMatch ? transcriptionMatch[1].trim() : 'No transcription available.';
      
      // Parse summary
      const summaryMatch = fullText.match(/===SUMMARY===([\s\S]*?)===END_SUMMARY===/);
      summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available.';
      
      // Parse Q&A
      const qaMatch = fullText.match(/===Q&A===([\s\S]*?)===END_Q&A===/);
      const qaText = qaMatch ? qaMatch[1].trim() : '';
      qa = {};
      
      questionsToAsk.forEach(question => {
        const escapedQ = question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const qRegex = new RegExp(`Question:\\s*${escapedQ}\\s*Answer:\\s*([\\s\\S]*?)(?=Question:|$)`, 'i');
        const match = qaText.match(qRegex);
        qa[question] = match ? match[1].trim() : 'Based on the transcript, I cannot answer this question.';
      });
    } else {
      return { error: "Could not parse Gemini response." };
    }

    return { transcription, summary, timestampedTranscription, qa };
  } catch (error) {
    return { error: error.message };
  }
}

async function chatWithGemini(transcript, userMessage) {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = {
    contents: [{
      parts: [
        { text: `You are a helpful assistant. This is a transcript of a call:\n--- TRANSCRIPT START ---\n${transcript}\n--- TRANSCRIPT END ---\n\nThe user has the following question about this transcript:\nUser: ${userMessage}\nAssistant:` }
      ]
    }]
  };
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt)
    });
    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch { errorData = {}; }
      return { error: errorData.error?.message || 'API Error' };
    }
    const data = await response.json();
    let reply = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      reply = data.candidates[0].content.parts[0].text;
    } else {
      return { error: "Could not parse chat reply from Gemini response." };
    }
    return { reply };
  } catch (error) {
    return { error: error.message };
  }
}