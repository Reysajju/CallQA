async function query(filename) {
  const data = new FormData();
  data.append('file', filename);
  
  const response = await fetch(
    "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: data,
    }
  );

  if (!response.ok) {
    throw new Error('Transcription failed.');
  }

  const reader = response.body.getReader();
  const contentLength = +response.headers.get('Content-Length');
  let receivedLength = 0; // Bytes received
  let chunks = []; // Array of received binary chunks

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    // Calculate progress percentage
    const progress = Math.round((receivedLength / contentLength) * 100);
    updateProgress(progress);
  }

  // Combine chunks into a single Uint8Array
  const chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  // Decode the audio transcription
  const result = new TextDecoder("utf-8").decode(chunksAll);
  return result;
}

async function transcribe() {
  const fileInput = document.getElementById('audioFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select an audio file.');
    return;
  }

  try {
    // Display loading indicator
    showLoading();

    const response = await query(file);

    // Hide loading indicator
    hideLoading();

    document.getElementById('transcriptionResult').innerText = response;
  } catch (error) {
    console.error('Transcription error:', error);
    alert('An error occurred while transcribing the audio.');
  }
}

function updateProgress(progress) {
  const progressBar = document.getElementById('progressBar');
  progressBar.style.width = `${progress}%`;
}

function showLoading() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = 'block';
}

function hideLoading() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = 'none';
}
