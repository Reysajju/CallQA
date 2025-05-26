import React, { useState, useEffect, useCallback } from 'react';
import { FileAudio, Upload, FileText, Trash2, Phone, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { transcribeAudio, analyzeTranscription, chatWithTranscription } from './lib/gemini';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TranscriptionItem } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import toast from 'react-hot-toast';

function App() {
  const [file, setFile] = useState<File | null>(null);
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
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    recentFiles: true,
    transcription: true,
    summary: true,
    timestampedTranscription: true,
    analysis: true,
    chat: true
  });

  useEffect(() => {
    const savedTranscriptions = localStorage.getItem('transcriptions');
    if (savedTranscriptions) {
      setTranscriptions(JSON.parse(savedTranscriptions));
    }
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const saveToLocalStorage = (items: TranscriptionItem[]) => {
    localStorage.setItem('transcriptions', JSON.stringify(items));
    setTranscriptions(items);
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

  const updateProgress = (stage: string, progress: number) => {
    setLoadingStage(stage);
    setLoadingProgress(progress);
    setTimeRemaining(((100 - progress) / 5) * 0.5);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const audio = new Audio(URL.createObjectURL(file));
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve);
      });
      
      const durationMinutes = Math.ceil(audio.duration / 60);

      setLoading(true);
      setError(null);
      setChatHistory([]);
      
      const processingSteps = [
        { stage: 'Preparing audio file', status: 'pending' },
        { stage: 'Transcribing audio', status: 'pending' },
        { stage: 'Analyzing content', status: 'pending' }
      ];

      updateProgress('Preparing audio file', 0);
      const reader = new FileReader();
      const audioContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      updateProgress('Preparing audio file', 100);

      updateProgress('Transcribing audio', 0);
      const transcription = await transcribeAudio(audioContent);
      updateProgress('Transcribing audio', 100);
      
      const durationMatch = transcription.match(/DURATION: (\d{2}:\d{2}:\d{2})/);
      const duration = durationMatch ? durationMatch[1] : '00:00:00';
      
      const cleanTranscription = transcription.replace(/DURATION: \d{2}:\d{2}:\d{2}\n\n/, '');
      
      updateProgress('Analyzing content', 0);
      const analysisResults = await analyzeTranscription(cleanTranscription, [
        'What are the main topics discussed in the call?',
        'What are the key action items or next steps mentioned?',
        'Are there any specific customer requirements or pain points discussed?',
        'What solutions or products were proposed during the call?',
        'Were there any objections raised, and how were they addressed?',
        'What is the overall sentiment of the conversation?',
        'Are there any follow-up tasks or commitments made?',
        'Were any deadlines or important dates mentioned?',
        'What are the key decision points discussed?',
        'Are there any compliance or regulatory concerns mentioned?'
      ]);
      updateProgress('Analyzing content', 100);

      const newTranscription: TranscriptionItem = {
        id: Date.now().toString(),
        fileName: file.name,
        transcription: cleanTranscription,
        summary: analysisResults.summary || 'No summary available.',
        timestampedTranscription: analysisResults.timestampedTranscription || [],
        analysis: analysisResults.analysis || [],
        date: new Date().toLocaleString(),
        duration: duration,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        processingSteps
      };

      const updatedTranscriptions = [newTranscription, ...transcriptions];
      saveToLocalStorage(updatedTranscriptions);
      setSelectedItem(newTranscription);
      
      toast.success('Audio processed successfully!');
      
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingStage('');
      }, 500);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      toast.error('Failed to process audio file');
    } finally {
      setFile(null);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim() || !selectedItem) return;

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
    const updatedTranscriptions = transcriptions.filter(t => t.id !== id);
    saveToLocalStorage(updatedTranscriptions);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    toast.success('Transcription deleted');
  };

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
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">Paid plans are coming soon</p>
        </div>

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
                </div>
              </div>

              {error && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {file && !loading && (
                <div className="mt-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Process
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
                        <div className="prose prose-blue dark:prose-invert max-w-none">
                          {selectedItem.summary || 'No summary available.'}
                        </div>
                      </div>
                    )}
                  </div>

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
                        {selectedItem.timestampedTranscription?.map((entry, index) => (
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
                              <p>{entry.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
                                  <div className="text-gray-700 dark:text-gray-300">
                                    {content.join('\n')}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <p key={index} className="text-gray-700 dark:text-gray-300">
                                {section}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

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
                              dangerouslySetInnerHTML={{ 
                                __html: answer
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
                                <p className="text-gray-700 dark:text-gray-300">{chat.answer}</p>
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
      </div>
    </div>
  );
}

export default App;