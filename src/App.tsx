import React, { useState, useEffect, useCallback } from 'react';
import { FileAudio, Upload, FileText, Trash2, User, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { transcribeAudio, analyzeTranscription } from './lib/gemini';
import { LoadingSpinner } from './components/LoadingSpinner';
import { History } from './components/History';
import { TranscriptionItem, UserSettings } from './types';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<TranscriptionItem | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    sopQuestions: [
      'What are the main topics discussed?',
      'Are there any action items mentioned?',
      'What are the key decisions made?'
    ]
  });

  useEffect(() => {
    const savedTranscriptions = localStorage.getItem('transcriptions');
    const savedSettings = localStorage.getItem('userSettings');
    
    if (savedTranscriptions) {
      setTranscriptions(JSON.parse(savedTranscriptions));
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveToLocalStorage = (items: TranscriptionItem[]) => {
    localStorage.setItem('transcriptions', JSON.stringify(items));
    setTranscriptions(items);
  };

  const saveSettings = (newSettings: UserSettings) => {
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    },
    maxFiles: 1
  });

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setLoadingProgress(progress);
      setTimeRemaining(((100 - progress) / 5) * 0.5); // Rough estimate
      if (progress >= 95) {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setLoadingStage('Preparing audio file');
    const cleanup = simulateProgress();

    try {
      const reader = new FileReader();
      const audioContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setLoadingStage('Transcribing audio');
      const transcription = await transcribeAudio(audioContent);
      
      setLoadingStage('Analyzing content');
      const analysisResults = await analyzeTranscription(transcription, settings.sopQuestions);

      const newTranscription: TranscriptionItem = {
        id: Date.now().toString(),
        fileName: file.name,
        transcription,
        analysis: analysisResults,
        date: new Date().toLocaleString()
      };

      const updatedTranscriptions = [newTranscription, ...transcriptions];
      saveToLocalStorage(updatedTranscriptions);
      setSelectedItem(newTranscription);
      
      cleanup();
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStage('');
      }, 500);
    } catch (error) {
      cleanup();
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setFile(null);
    }
  };

  const deleteTranscription = (id: string) => {
    const updatedTranscriptions = transcriptions.filter(t => t.id !== id);
    saveToLocalStorage(updatedTranscriptions);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const addSopQuestion = () => {
    const newSettings = {
      ...settings,
      sopQuestions: [...settings.sopQuestions, '']
    };
    saveSettings(newSettings);
  };

  const updateSopQuestion = (index: number, value: string) => {
    const newQuestions = [...settings.sopQuestions];
    newQuestions[index] = value;
    const newSettings = {
      ...settings,
      sopQuestions: newQuestions
    };
    saveSettings(newSettings);
  };

  const deleteSopQuestion = (index: number) => {
    const newQuestions = settings.sopQuestions.filter((_, i) => i !== index);
    const newSettings = {
      ...settings,
      sopQuestions: newQuestions
    };
    saveSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Audio Transcription AI</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <User className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => saveSettings({ ...settings, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    SOP Questions
                  </label>
                  <button
                    onClick={addSopQuestion}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Question
                  </button>
                </div>
                <div className="space-y-3">
                  {settings.sopQuestions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => updateSopQuestion(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter SOP question"
                      />
                      <button
                        onClick={() => deleteSopQuestion(index)}
                        className="p-2 hover:bg-red-100 rounded-md transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">History</h3>
                <History
                  items={transcriptions}
                  onDelete={deleteTranscription}
                  onSelect={(id) => {
                    setSelectedItem(transcriptions.find(t => t.id === id) || null);
                    setShowSettings(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-gray-600">Upload your audio files for instant transcription and analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <FileAudio className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {isDragActive
                      ? 'Drop the audio file here'
                      : 'Drag and drop an audio file here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports MP3, WAV, M4A, and OGG
                  </p>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              {file && !loading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <span className="text-sm text-blue-700 truncate">{file.name}</span>
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      <span>Process</span>
                    </button>
                  </div>
                </div>
              )}
              {loading && (
                <LoadingSpinner
                  progress={loadingProgress}
                  stage={loadingStage}
                  timeRemaining={timeRemaining}
                />
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Files</h2>
              {transcriptions.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{item.fileName}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTranscription(item.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              {transcriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No transcriptions yet</p>
                  <p className="text-sm">Upload an audio file to get started</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.fileName}</h2>
                  <p className="text-sm text-gray-500">{selectedItem.date}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Transcription</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.transcription}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis</h3>
                    <div className="space-y-4">
                      {settings.sopQuestions.map((question, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium text-gray-900 mb-2">{question}</p>
                          <p className="text-gray-700">{selectedItem.analysis[index]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transcription Selected</h3>
                  <p className="text-gray-600">Select a transcription from the list or upload a new audio file</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;