// Get API key from environment or fallback
function getGeminiApiKey() {
  // For Chrome extension, we'll use chrome.storage to store the API key
  // This allows users to set it in the extension options
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey) {
        resolve(result.geminiApiKey);
      } else {
        // Fallback to hardcoded key for now, but this should be removed in production
        console.warn('No API key found in storage. Please set your Gemini API key in extension settings.');
        resolve("AIzaSyAIkLMizbniJuKLd-ps9PVq6-0H8CW5eOE");
      }
    });
  });
}

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
    const analysisId = request.id || Date.now().toString();
    
    // Store analysis info
    activeAnalyses.set(analysisId, {
      status: 'processing',
      startTime: Date.now(),
      options: request.options || {
        summary: true,
        timestampedTranscription: true,
        transcription: true,
        analysis: true,
        chat: true
      }
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

        const options = request.options || {
          summary: true,
          timestampedTranscription: true,
          transcription: true,
          analysis: true,
          chat: true
        };

        const result = await analyzeAudioWithGemini(request.audioData, presetQuestions, options);
        
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

async function analyzeAudioWithGemini(audioData_base64, presetQuestions = [], options = {}) {
  const GEMINI_API_KEY = await getGeminiApiKey();
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  // Add default questions if none provided and analysis is requested
  const defaultQuestions = [
    "What were the main topics discussed?",
    "What were the key action items or decisions made?",
    "Were there any important deadlines or dates mentioned?"
  ];
  
  const questionsToAsk = presetQuestions.length > 0 ? presetQuestions : defaultQuestions;
  
  // Build sections based on selected options
  let promptSections = [];
  let sectionCounter = 1;

  // Always get basic transcription first
  const basicTranscriptionPrompt = `Please transcribe this audio content clearly and accurately.`;
  
  // Build conditional sections based on options
  if (options.timestampedTranscription) {
    promptSections.push(`${sectionCounter}. Provide a timestamped conversation in this EXACT format:
===TIMESTAMPED===
SPEAKER: Speaker A
TIME: 00:00:15
TEXT: Hello, welcome to today's meeting.
---
SPEAKER: Speaker B
TIME: 00:00:22
TEXT: Thank you for having me.
---
SPEAKER: Speaker A
TIME: 00:00:30
TEXT: Let's discuss the main agenda items.
---
===END_TIMESTAMPED===`);
    sectionCounter++;
  }

  if (options.transcription) {
    promptSections.push(`${sectionCounter}. Provide a clean transcription formatted with new topics/speakers as "**Section Title**"
===TRANSCRIPTION===
[Your formatted transcription]
===END_TRANSCRIPTION===`);
    sectionCounter++;
  }

  if (options.summary) {
    promptSections.push(`${sectionCounter}. Write a concise 5-9 line summary of the key points
===SUMMARY===
[Your summary]
===END_SUMMARY===`);
    sectionCounter++;
  }

  if (options.analysis && questionsToAsk.length > 0) {
    promptSections.push(`${sectionCounter}. Answer each question based on the transcript content:
===Q&A===
${questionsToAsk.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question, format EXACTLY as:
Question: <exact question text>
Answer: <your detailed answer>

If you can't find information for an answer, say "Based on the transcript, I cannot answer this question."
===END_Q&A===`);
    sectionCounter++;
  }

  // Only create the prompt if we have sections to process
  if (promptSections.length === 0) {
    // Fallback to basic transcription
    promptSections.push(`1. Provide a clean transcription of the audio content.`);
  }

  const fullPrompt = `You are a professional call transcription and analysis assistant. Follow these instructions EXACTLY:

${promptSections.join('\n\n')}

IMPORTANT: 
- Only include the sections requested above
- Never skip any requested section
- Always include all section markers for requested sections
- Format answers exactly as shown
- Be thorough but concise
- For timestamped section, use the exact format with SPEAKER:, TIME:, TEXT: and separate each entry with ---`;

  const promptParts = [
    { inlineData: { mimeType: "audio/wav", data: audioData_base64 } },
    { text: fullPrompt }
  ];

  const transcriptionPrompt = { contents: [{ parts: promptParts }] };
  
  try {
    console.log('Sending request to Gemini with options:', options);
    
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
      console.log('Received response from Gemini, parsing sections...');
      
      // Parse timestamped conversation ONLY if requested
      if (options.timestampedTranscription) {
        const timestampedMatch = fullText.match(/===TIMESTAMPED===([\s\S]*?)===END_TIMESTAMPED===/);
        if (timestampedMatch) {
          const timestampedText = timestampedMatch[1].trim();
          // Split by --- separator
          const entries = timestampedText.split('---').filter(entry => entry.trim());
          
          timestampedTranscription = entries.map(entry => {
            const lines = entry.trim().split('\n');
            let speaker = 'Unknown Speaker';
            let timestamp = '00:00:00';
            let text = '';
            
            lines.forEach(line => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('SPEAKER:')) {
                speaker = trimmedLine.replace('SPEAKER:', '').trim();
              } else if (trimmedLine.startsWith('TIME:')) {
                timestamp = trimmedLine.replace('TIME:', '').trim();
              } else if (trimmedLine.startsWith('TEXT:')) {
                text = trimmedLine.replace('TEXT:', '').trim();
              }
            });
            
            return {
              speaker: speaker || 'Unknown Speaker',
              timestamp: timestamp || '00:00:00',
              text: text || ''
            };
          }).filter(entry => entry.text && entry.text.length > 0);
          
          console.log('Parsed timestamped transcription:', timestampedTranscription.length, 'entries');
        }
      }

      // Parse transcription ONLY if requested
      if (options.transcription) {
        const transcriptionMatch = fullText.match(/===TRANSCRIPTION===([\s\S]*?)===END_TRANSCRIPTION===/);
        transcription = transcriptionMatch ? transcriptionMatch[1].trim() : '';
        console.log('Parsed transcription:', transcription ? 'Yes' : 'No');
      }
      
      // Parse summary ONLY if requested
      if (options.summary) {
        const summaryMatch = fullText.match(/===SUMMARY===([\s\S]*?)===END_SUMMARY===/);
        summary = summaryMatch ? summaryMatch[1].trim() : '';
        console.log('Parsed summary:', summary ? 'Yes' : 'No');
      }
      
      // Parse Q&A ONLY if requested
      if (options.analysis && questionsToAsk.length > 0) {
        const qaMatch = fullText.match(/===Q&A===([\s\S]*?)===END_Q&A===/);
        const qaText = qaMatch ? qaMatch[1].trim() : '';
        qa = {};
        
        questionsToAsk.forEach(question => {
          const escapedQ = question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const qRegex = new RegExp(`Question:\\s*${escapedQ}\\s*Answer:\\s*([\\s\\S]*?)(?=Question:|$)`, 'i');
          const match = qaText.match(qRegex);
          qa[question] = match ? match[1].trim() : 'Based on the transcript, I cannot answer this question.';
        });
        console.log('Parsed Q&A:', Object.keys(qa).length, 'questions');
      }

      // If no transcription was requested but we need it for other features, extract from full text
      if (!options.transcription && !transcription) {
        // Use the full text as fallback transcription for other features
        transcription = fullText.replace(/===.*?===/g, '').trim();
      }
    } else {
      return { error: "Could not parse Gemini response." };
    }

    const result = { 
      transcription: options.transcription ? transcription : undefined,
      summary: options.summary ? summary : undefined,
      timestampedTranscription: options.timestampedTranscription ? timestampedTranscription : undefined,
      qa: options.analysis ? qa : undefined
    };

    console.log('Final result structure:', {
      hasTranscription: !!result.transcription,
      hasSummary: !!result.summary,
      hasTimestamped: !!result.timestampedTranscription,
      hasQA: !!result.qa
    });

    return result;
  } catch (error) {
    console.error('Gemini API error:', error);
    return { error: error.message };
  }
}

async function chatWithGemini(transcript, userMessage) {
  const GEMINI_API_KEY = await getGeminiApiKey();
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