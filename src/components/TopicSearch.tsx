import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, Upload, Sparkles, Wand2 } from 'lucide-react';
import { DifficultyLevel } from '../types';

interface TopicSearchProps {
  topic: string;
  onChangeTopic: (topic: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  autoDifficulty: DifficultyLevel | null;
  onSelectDifficulty: (d: DifficultyLevel) => void;
}

const DEFAULT_SUGGESTIONS = [
  'Psychology of Memory',
  'DBMS Normalization',
  'Human Heart Cardiac Cycle',
  'World War 2 Turning Points',
  'Machine Learning Gradient Descent',
  'French Revolution',
  'Thermodynamics Laws',
  'Python Decorators & Generators',
];

const TOPIC_RELATED_MAP: Record<string, string[]> = {
  'cloud': ['AWS vs Azure', 'Kubernetes Architecture', 'Docker Containers', 'Serverless Functions'],
  'dbms': ['SQL Joins', 'ACID Properties', 'B-Trees & Indexing', 'Database Normalization'],
  'memory': ['Short-Term vs Long-Term Memory', 'Ebbinghaus Forgetting Curve', 'Working Memory Capacity'],
  'heart': ['Cardiac Conduction System', 'ECG Waveforms', 'Cardiovascular Diseases'],
  'history': ['Treaty of Versailles', 'Battle of Panipat', 'Industrial Revolution', 'Fall of Rome'],
  'python': ['Asyncio in Python', 'List Comprehensions', 'Metaclasses', 'GIL (Global Interpreter Lock)'],
  'math': ['Linear Algebra Eigenvalues', 'Calculus Derivatives', 'Bayes Theorem', 'Fourier Transform'],
  'physics': ['Special Relativity', 'Quantum Entanglement', 'Maxwell Equations', 'Newtonian Mechanics'],
};

export const TopicSearch: React.FC<TopicSearchProps> = ({
  topic,
  onChangeTopic,
  onGenerate,
  isLoading,
  autoDifficulty,
  onSelectDifficulty,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [fileExtracting, setFileExtracting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic suggestion update based on input
  useEffect(() => {
    const trimmed = topic.toLowerCase().trim();
    if (!trimmed) {
      setSuggestions(DEFAULT_SUGGESTIONS);
      return;
    }

    for (const key of Object.keys(TOPIC_RELATED_MAP)) {
      if (trimmed.includes(key) || key.includes(trimmed)) {
        setSuggestions(TOPIC_RELATED_MAP[key]);
        return;
      }
    }
  }, [topic]);

  // Global keyboard shortcut (Ctrl+/ or Cmd+/) to focus topic search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Web Speech API for voice input
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your topic directly.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onChangeTopic(transcript);
        }
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  // Document text extraction
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileExtracting(true);

    // Read text file or PDF placeholder
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const firstLine = text.split('\n')[0].slice(0, 100).trim();
          onChangeTopic(firstLine || file.name.replace(/\.[^/.]+$/, ''));
        }
        setFileExtracting(false);
      };
      reader.onerror = () => setFileExtracting(false);
      reader.readAsText(file);
    } else {
      // PDF or binary document: use filename as prompt topic
      const topicName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      onChangeTopic(topicName);
      setFileExtracting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3.5">
      {/* Search Input Container */}
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-xl shadow-indigo-950/20 focus-within:border-indigo-500/80 transition-all">
        {/* Search Icon */}
        <div className="hidden sm:flex pl-3 items-center justify-center text-slate-400">
          <Search className="w-5 h-5" />
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={topic}
          onChange={(e) => onChangeTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading && topic.trim()) {
              onGenerate();
            }
          }}
          placeholder="Enter any topic to study (e.g., Photosynthesis, Cloud Computing, Neural Networks)..."
          className="flex-1 bg-transparent px-3 py-2.5 sm:py-2 text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
          id="topic-search-input"
        />

        {/* Action icons (Voice, Upload, Auto-difficulty) */}
        <div className="flex items-center justify-end gap-1.5 px-2 sm:px-0">
          {/* Auto difficulty badge */}
          {autoDifficulty && (
            <button
              onClick={() => onSelectDifficulty(autoDifficulty)}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
              title="Click to apply auto-detected difficulty"
            >
              <Wand2 className="w-3 h-3 text-indigo-400" />
              <span>Suggested: {autoDifficulty}</span>
            </button>
          )}

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2 rounded-xl transition-all ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40'
                : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Speak your topic (Microphone)'}
            id="voice-input-btn"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* File Upload Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.png,.jpg"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={fileExtracting}
            className="p-2 rounded-xl text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
            title="Upload notes/PDF to extract topic"
            id="file-upload-btn"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Primary Generate Button */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || !topic.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            id="generate-material-btn"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Crafting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Topic Chips Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs no-scrollbar">
        <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1 pl-1">
          <span>Popular:</span>
        </span>
        {suggestions.map((sugg, idx) => (
          <button
            key={idx}
            onClick={() => {
              onChangeTopic(sugg);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-900/60 hover:bg-indigo-950/80 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 whitespace-nowrap transition-all flex items-center gap-1 shadow-sm"
          >
            <span>{sugg}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
