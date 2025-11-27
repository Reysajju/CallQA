import React, { useState, useEffect, useCallback } from 'react';
import { FileAudio, Upload, FileText, Trash2, Phone, ChevronDown, ChevronUp, Clock, AlertCircle, Settings, Download, Upload as UploadIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { transcribeAudio, processSelectedFeatures, chatWithTranscription } from './lib/gemini';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProcessingOptions } from './components/ProcessingOptions';
import { TranscriptionItem, ProcessingOptions as ProcessingOptionsType } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { 
  loadTranscriptions, 
  saveTranscriptions, 
  loadSettings, 
  saveSettings, 
  addTranscription, 
  deleteTranscription as removeTranscription,
  updateTranscription,
  exportData,
  importData,
  clearAllData
} from './lib/storage';
import { formatFriendlyContent } from './lib/textFormatter';
import toast from 'react-hot-toast';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; duration?: string } | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<TranscriptionItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(loadSettings());
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptionsType>({
    summary: true,
    timestampedTranscription: true,
    transcription: true,
    analysis: true,
    chat: true
  });
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    recentFiles: true,
    transcription: true,
    summary: true,
    timestampedTranscription: true,
    analysis: true,
    chat: true,
    settings: true
  });

  useEffect(() => {
    setTranscriptions(loadTranscriptions());
  }, []);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (file) {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  const createMarkup = (content?: string) => {
    return { __html: formatFriendlyContent(content ?? '') };
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        URL.revokeObjectURL(url);
        resolve(formattedDuration);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve('Unknown');
      });

      audio.src = url;
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setError(null);
      
      // Get file info
      const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      const duration = await getAudioDuration(selectedFile);
      
      setFileInfo({
        name: selectedFile.name,
        size: `${sizeInMB} MB`,
        duration: duration !== 'Unknown' ? duration : undefined
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024 // 500MB limit
  });

  const updateProgress = (stage: string, progress: number) => {
    setLoadingStage(stage);
    setLoadingProgress(progress);
    setTimeRemaining(((100 - progress) / 5) * 0.5);
  };

  const handleUpload = async () => {
    if (!file || !fileInfo) return;

    const selectedCount = Object.values(processingOptions).filter(Boolean).length;
    if (selectedCount === 0) {
      toast.error('Please select at least one processing option');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setChatHistory([]);
      
      updateProgress('Preparing audio file', 0);
      
      // Convert file to base64 more safely
      const audioContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result && typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(file);
      });
      
      updateProgress('Preparing audio file', 100);

      let transcription = '';
      let duration = fileInfo.duration || '00:00:00';

      // Always get basic transcription first if any feature is selected
      updateProgress('Transcribing audio', 0);
      const rawTranscription = await transcribeAudio(audioContent);
      updateProgress('Transcribing audio', 100);
      
      // Extract duration from transcription if available
      const durationMatch = rawTranscription.match(/DURATION: (\d{2}:\d{2}:\d{2})/);
      if (durationMatch) {
        duration = durationMatch[1];
      }
      transcription = rawTranscription.replace(/DURATION: \d{2}:\d{2}:\d{2}\n\n/, '');

      // Process selected features with the processing options
      updateProgress('Processing selected features', 0);
      console.log('Processing with options:', processingOptions);
      const results = await processSelectedFeatures(
        transcription, 
        processingOptions, 
        settings.presetQuestions
      );
      updateProgress('Processing selected features', 100);

      console.log('Processing results:', results);

      const newTranscription: TranscriptionItem = {
        id: Date.now().toString(),
        fileName: fileInfo.name,
        transcription: processingOptions.transcription ? (results.transcription || transcription) : (transcription || ''), // Always store some transcription for chat
        summary: processingOptions.summary ? results.summary : undefined,
        timestampedTranscription: processingOptions.timestampedTranscription ? results.timestampedTranscription : undefined,
        analysis: processingOptions.analysis ? results.analysis : undefined,
        date: new Date().toLocaleString(),
        duration: duration,
        fileSize: fileInfo.size,
        processedFeatures: processingOptions
      };

      console.log('Created transcription item:', {
        hasTranscription: !!newTranscription.transcription,
        hasSummary: !!newTranscription.summary,
        hasTimestamped: !!newTranscription.timestampedTranscription,
        hasAnalysis: !!newTranscription.analysis,
        processedFeatures: newTranscription.processedFeatures
      });

      addTranscription(newTranscription);
      setTranscriptions(loadTranscriptions());
      setSelectedItem(newTranscription);
      
      toast.success(`Audio processed successfully! ${selectedCount} features completed.`);
      
      // Clear file and file info
      setFile(null);
      setFileInfo(null);
      
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStage('');
      }, 500);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      toast.error('Failed to process audio file');
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim() || !selectedItem || !selectedItem.transcription) return;

    const question = chatMessage.trim();
    setChatMessage('');
    setChatLoading(true);

    try {
      const answer = await chatWithTranscription(selectedItem.transcription, question);
      setChatHistory(prev => [...prev, { question, answer }]);
    } catch (error) {
      toast.error('Failed to get response');
    } finally {
      setChatLoading(false);
    }
  };

  const deleteTranscription = (id: string) => {
    removeTranscription(id);
    setTranscriptions(loadTranscriptions());
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    toast.success('Transcription deleted');
  };

  const addPresetQuestion = () => {
    const newSettings = {
      ...settings,
      presetQuestions: [...settings.presetQuestions, '']
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updatePresetQuestion = (index: number, value: string) => {
    const newSettings = {
      ...settings,
      presetQuestions: settings.presetQuestions.map((q, i) => i === index ? value : q)
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const removePresetQuestion = (index: number) => {
    const newSettings = {
      ...settings,
      presetQuestions: settings.presetQuestions.filter((_, i) => i !== index)
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `callqa-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (importData(content)) {
          setTranscriptions(loadTranscriptions());
          setSettings(loadSettings());
          toast.success('Data imported successfully');
        } else {
          toast.error('Failed to import data - invalid format');
        }
      } catch (error) {
        toast.error('Failed to import data');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      setTranscriptions([]);
      setSelectedItem(null);
      setSettings(loadSettings());
      toast.success('All data cleared');
    }
  };

  const clearSelectedFile = () => {
    setFile(null);
    setFileInfo(null);
    setError(null);
  };

  const selectedCount = Object.values(processingOptions).filter(Boolean).length;

  // Check if chat should be available - either chat was processed OR we have transcription data
  const isChatAvailable = selectedItem && selectedItem.transcription && 
    (selectedItem.processedFeatures?.chat || selectedItem.transcription);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 text-transparent bg-clip-text">
              CallQA
            </h1>
          </a>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {showSettings ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Preset Analysis Questions</h3>
                <div className="space-y-3">
                  {settings.presetQuestions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => updatePresetQuestion(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter analysis question..."
                      />
                      <button
                        onClick={() => removePresetQuestion(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addPresetQuestion}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Question
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Management</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <UploadIcon className="w-4 h-4" />
                    Import Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={handleClearAllData}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Export your data for backup or import previously exported data. All data is stored locally in your browser.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20 dark:border-gray-700/20">
                <div 
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <FileAudio className={`w-10 h-10 mx-auto mb-2 transition-colors duration-300 ${
                      isDragActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {isDragActive ? 'Drop the file here' : 'Drop audio file or click to upload'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Supports MP3, WAV, M4A, OGG, AAC, FLAC (max 500MB)
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {fileInfo && !loading && (
                  <div className="mt-3 space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-blue-700 dark:text-blue-300 truncate">{fileInfo.name}</span>
                        </div>
                        <button
                          onClick={clearSelectedFile}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>Size: {fileInfo.size}</span>
                        {fileInfo.duration && <span>Duration: {fileInfo.duration}</span>}
                      </div>
                    </div>
                    
                    <ProcessingOptions
                      options={processingOptions}
                      onChange={setProcessingOptions}
                      disabled={loading}
                    />
                    
                    <button
                      onClick={handleUpload}
                      disabled={loading || selectedCount === 0}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Process Selected Features ({selectedCount})
                    </button>
                  </div>
                )}

                {loading && <LoadingSpinner progress={loadingProgress} stage={loadingStage} timeRemaining={timeRemaining} />}
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20 dark:border-gray-700/20">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Files</h2>
                  <button
                    onClick={() => toggleSection('recentFiles')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {expandedSections['recentFiles'] ? (
                      <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                </div>

                {expandedSections['recentFiles'] && (
                  <div className="space-y-2 max-h-[calc(100vh-24rem)] overflow-y-auto">
                    {transcriptions.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                          selectedItem?.id === item.id
                            ? 'bg-blue-100 dark:bg-blue-900/40'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.fileName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTranscription(item.id);
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-500 dark:text-red-400" />
                        </button>
                      </div>
                    ))}
                    {transcriptions.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">No recent files</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedItem.fileName}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedItem.date}</span>
                      </div>
                      {selectedItem.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Duration: {selectedItem.duration}</span>
                        </div>
                      )}
                      {selectedItem.fileSize && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Size: {selectedItem.fileSize}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {selectedItem.summary && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Summary</h3>
                          <button
                            onClick={() => toggleSection('summary')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {expandedSections['summary'] ? (
                              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            )}
                          </button>
                        </div>
                        {expandedSections['summary'] && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                            <div 
                              className="prose prose-blue dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={createMarkup(selectedItem.summary)}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {selectedItem.timestampedTranscription && selectedItem.timestampedTranscription.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Timestamped Transcription</h3>
                          <button
                            onClick={() => toggleSection('timestampedTranscription')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {expandedSections['timestampedTranscription'] ? (
                              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            )}
                          </button>
                        </div>
                        {expandedSections['timestampedTranscription'] && (
                          <div className="space-y-4">
                            {selectedItem.timestampedTranscription.map((entry, index) => (
                              <div key={index} className={`flex ${entry.speaker === 'Speaker A' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-4 ${
                                  entry.speaker === 'Speaker A'
                                    ? 'bg-blue-500 dark:bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                }`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium">{entry.speaker}</span>
                                    <span className="text-sm opacity-75">{entry.timestamp}</span>
                                  </div>
                                  <div
                                    className="text-sm leading-relaxed [&_p]:mt-2 [&_p:first-child]:mt-0 [&_ul]:mt-2 [&_li]:ml-4 [&_li]:list-disc"
                                    dangerouslySetInnerHTML={createMarkup(entry.text)}
                                  />
                                </div>
                              </div>

                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedItem.transcription && selectedItem.processedFeatures?.transcription && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transcription</h3>
                          <button
                            onClick={() => toggleSection('transcription')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {expandedSections['transcription'] ? (
                              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            )}
                          </button>
                        </div>
                        {expandedSections['transcription'] && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                            <div className="prose prose-blue dark:prose-invert max-w-none space-y-6">
                              {selectedItem.transcription.split('\n\n').map((section, index) => {
                                if (section.startsWith('**')) {
                                  const [heading, ...content] = section.split('\n');
                                  return (
                                    <div key={index} className="mb-6">
                                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        {heading.replace(/\*\*/g, '')}
                                      </h3>
                                      <div 
                                        className="text-gray-700 dark:text-gray-300"
                                        dangerouslySetInnerHTML={createMarkup(content.join('\n'))}
                                      />
                                    </div>
                                  );
                                }
                                return (
                                  <div 
                                    key={index} 
                                    className="text-gray-700 dark:text-gray-300"
                                    dangerouslySetInnerHTML={createMarkup(section)}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedItem.analysis && selectedItem.analysis.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analysis</h3>
                          <button
                            onClick={() => toggleSection('analysis')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {expandedSections['analysis'] ? (
                              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            )}
                          </button>
                        </div>
                        {expandedSections['analysis'] && (
                          <div className="grid gap-4 md:grid-cols-2">
                            {selectedItem.analysis.map((answer, index) => (
                              <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                                <div 
                                  className="prose prose-blue dark:prose-invert max-w-none"
                                  dangerouslySetInnerHTML={createMarkup(answer)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {isChatAvailable && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat</h3>
                          <button
                            onClick={() => toggleSection('chat')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {expandedSections['chat'] ? (
                              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            )}
                          </button>
                        </div>
                        {expandedSections['chat'] && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                              {chatHistory.map((chat, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                                    <p className="font-medium text-blue-900 dark:text-blue-100">{chat.question}</p>
                                  </div>
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                    <div
                                      className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                                      dangerouslySetInnerHTML={createMarkup(chat.answer)}
                                    />
                                  </div>
                                </div>
                              ))}
                              {chatLoading && (
                                <div className="flex justify-center">
                                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Ask about the call..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleChatSubmit();
                                  }
                                }}
                              />
                              <button
                                onClick={handleChatSubmit}
                                disabled={chatLoading || !chatMessage.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20 text-center">
                  <div className="py-12">
                    <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Transcription Selected</h3>
                    <p className="text-gray-600 dark:text-gray-300">Select a transcription from the list or upload a new audio file</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;