import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard as KeyboardIcon, 
  Settings, 
  RefreshCw, 
  BarChart2, 
  Play, 
  Globe, 
  Trophy,
  BrainCircuit,
  Share2
} from 'lucide-react';

import { Difficulty, KeyboardLayout, TestStats, HistoryItem } from './types';
import { generateTypingText } from './services/geminiService';
import VirtualKeyboard from './components/VirtualKeyboard';
import { CurrentStatsDisplay, HistoryCharts } from './components/Stats';

// Helper to calculate stats
const calculateStats = (
  startTime: number, 
  correctChars: number, 
  incorrectChars: number, 
  errors: number,
  missedKeys: Record<string, number>
): TestStats => {
  const timeElapsed = (Date.now() - startTime) / 1000;
  const minutes = timeElapsed / 60;
  
  // WPM = (All typed characters / 5) / Time in minutes
  // Standard calculation considers 5 chars as 1 word.
  // Net WPM subtracts uncorrected errors, but we track live WPM usually as (Correct / 5) / Time
  
  const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
  const rawWpm = minutes > 0 ? Math.round(((correctChars + incorrectChars) / 5) / minutes) : 0;
  
  const totalChars = correctChars + incorrectChars;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    incorrectChars,
    errors,
    timeElapsed,
    missedKeys
  };
};

const App: React.FC = () => {
  // --- State ---
  const [targetText, setTargetText] = useState<string>("Welcome to VelocityType AI. Press Start to generate a test.");
  const [userInput, setUserInput] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // Settings
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [layout, setLayout] = useState<KeyboardLayout>(KeyboardLayout.QWERTY);
  
  // Real-time Stats
  const [stats, setStats] = useState<TestStats>({
    wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0, errors: 0, timeElapsed: 0, missedKeys: {}
  });

  // Visualization State
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [lastPressCorrect, setLastPressCorrect] = useState<boolean | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  // Replaced NodeJS.Timeout with ReturnType<typeof setInterval> to avoid missing namespace error
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Effects ---

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('velocityTypeHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Timer loop
  useEffect(() => {
    if (isActive && !isFinished) {
      timerRef.current = setInterval(() => {
        setStats(prev => calculateStats(startTime, prev.correctChars, prev.incorrectChars, prev.errors, prev.missedKeys));
      }, 500); // Update UI every 500ms
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isFinished, startTime]);

  // Finish check
  useEffect(() => {
    if (userInput.length === targetText.length && targetText.length > 0 && isActive) {
      endTest();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, targetText]);

  // Update Active Key for visual keyboard
  useEffect(() => {
    if (!isActive || isFinished) {
      setActiveKey(null);
      return;
    }
    const nextChar = targetText[userInput.length];
    setActiveKey(nextChar || 'Enter');
  }, [userInput, targetText, isActive, isFinished]);


  // --- Logic ---

  const startTest = async () => {
    setLoading(true);
    setIsActive(false);
    setIsFinished(false);
    setUserInput("");
    setPressedKey(null);
    setLastPressCorrect(null);
    setShowHistory(false);
    
    // Generate Text
    const text = await generateTypingText(difficulty);
    setTargetText(text);
    
    // Reset Stats
    setStats({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0, errors: 0, timeElapsed: 0, missedKeys: {} });
    setLoading(false);
    
    // Ready state - user needs to type to actually "start" the timer
    inputRef.current?.focus();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    
    // Prevent backspace if not allowed (optional, but standard for strict speed tests is often to allow it)
    // Here we allow backspace but we don't reduce the "incorrect chars" count for historical accuracy tracking? 
    // For simplicity, we just sync input.

    if (!isActive && !isFinished) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    if (isFinished) return;

    // Determine what was just typed
    const inputLength = newVal.length;
    const prevLength = userInput.length;
    
    if (inputLength > prevLength) {
      // Character added
      const charTyped = newVal[inputLength - 1];
      const expectedChar = targetText[inputLength - 1];
      
      setPressedKey(charTyped);

      setStats(prev => {
        const isCorrect = charTyped === expectedChar;
        setLastPressCorrect(isCorrect);
        
        const newMissed = { ...prev.missedKeys };
        if (!isCorrect) {
           newMissed[expectedChar] = (newMissed[expectedChar] || 0) + 1;
        }

        return {
          ...prev,
          correctChars: isCorrect ? prev.correctChars + 1 : prev.correctChars,
          incorrectChars: !isCorrect ? prev.incorrectChars + 1 : prev.incorrectChars,
          errors: !isCorrect ? prev.errors + 1 : prev.errors,
          missedKeys: newMissed
        };
      });
    }

    setUserInput(newVal);
  };

  const endTest = () => {
    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const finalStats = calculateStats(startTime, stats.correctChars, stats.incorrectChars, stats.errors, stats.missedKeys);
    setStats(finalStats);

    // Save to history
    const newHistoryItem: HistoryItem = {
      ...finalStats,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      difficulty
    };
    
    const updatedHistory = [...history, newHistoryItem];
    setHistory(updatedHistory);
    localStorage.setItem('velocityTypeHistory', JSON.stringify(updatedHistory));
  };

  const reset = () => {
    startTest();
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // --- Rendering ---

  const renderText = () => {
    return targetText.split('').map((char, index) => {
      let colorClass = "text-gray-500"; // default upcoming
      let bgClass = "";
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          colorClass = "text-brand-400"; // correct
        } else {
          colorClass = "text-red-500"; // incorrect
          bgClass = "bg-red-500/10";
        }
      } else if (index === userInput.length) {
         // Current cursor position
         bgClass = "bg-brand-500/20 animate-pulse border-l-2 border-brand-500";
         colorClass = "text-gray-200";
      }

      return (
        <span key={index} className={`${colorClass} ${bgClass} px-[1px] rounded-sm transition-colors duration-75`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 font-sans selection:bg-brand-500/30 overflow-x-hidden">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <KeyboardIcon className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-400 to-blue-500 bg-clip-text text-transparent">
              VelocityType AI
            </h1>
          </div>
          
          <nav className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${showHistory ? 'bg-brand-900/50 text-brand-400' : 'hover:bg-dark-800 text-gray-400'}`}
            >
              <BarChart2 size={18} />
              <span className="hidden sm:inline">Stats</span>
            </button>
            <div className="h-4 w-px bg-gray-700 mx-2"></div>
             <button className="p-2 hover:bg-dark-800 rounded-lg text-gray-400 transition-colors" title="Coming Soon: Multiplayer">
              <Trophy size={18} />
            </button>
            <button className="p-2 hover:bg-dark-800 rounded-lg text-gray-400 transition-colors" title="Global Leaderboard">
              <Globe size={18} />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
        
        {/* Controls / Toolbar */}
        <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-4 mb-8 bg-dark-800/50 p-2 rounded-xl border border-gray-800">
           <div className="flex items-center gap-2">
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="bg-dark-900 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 outline-none"
                disabled={isActive}
              >
                {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              
              <select 
                value={layout}
                onChange={(e) => setLayout(e.target.value as KeyboardLayout)}
                className="bg-dark-900 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 outline-none"
              >
                {Object.values(KeyboardLayout).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
           </div>

           <div className="flex items-center gap-2">
             <button 
                onClick={startTest}
                disabled={loading}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-4 focus:ring-brand-900 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
             >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : isActive ? <RefreshCw size={16} /> : <Play size={16} />}
                {loading ? "Generating..." : isActive ? "Restart" : "Start Test"}
             </button>
           </div>
        </div>

        {showHistory ? (
          <HistoryCharts history={history} />
        ) : (
          <>
            {/* Live Stats */}
            <CurrentStatsDisplay stats={stats} />

            {/* Typing Area */}
            <div 
              className="relative w-full max-w-4xl bg-dark-800 rounded-2xl border border-gray-700 shadow-2xl p-8 md:p-12 min-h-[200px] cursor-text group"
              onClick={handleContainerClick}
            >
              {loading ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-500 gap-4">
                    <BrainCircuit size={48} className="animate-pulse" />
                    <p className="text-gray-400 font-mono text-sm">AI Generating Content...</p>
                 </div>
              ) : (
                <>
                   {/* Overlay when finished */}
                  {isFinished && (
                    <div className="absolute inset-0 z-10 bg-dark-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl animate-in fade-in duration-300">
                       <h2 className="text-3xl font-bold text-white mb-2">Test Complete!</h2>
                       <div className="text-brand-400 text-xl font-mono mb-6">{stats.wpm} WPM / {stats.accuracy}% Acc</div>
                       <div className="flex gap-3">
                         <button onClick={reset} className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors">
                           New Test
                         </button>
                         <button className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-gray-200 rounded-lg font-medium transition-colors flex items-center gap-2">
                           <Share2 size={16} /> Share
                         </button>
                       </div>
                    </div>
                  )}
                  
                  {/* The visible text */}
                  <div className={`font-mono text-2xl md:text-3xl leading-relaxed tracking-wide transition-opacity duration-200 ${isFinished ? 'opacity-20' : 'opacity-100'}`}>
                    {renderText()}
                  </div>

                  {/* Hidden Input for focus handling */}
                  <input
                    ref={inputRef}
                    type="text"
                    className="absolute opacity-0 top-0 left-0 w-full h-full cursor-text"
                    value={userInput}
                    onChange={handleInput}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    disabled={isFinished || loading}
                  />

                  {/* Instructions Overlay if not active and empty */}
                  {!isActive && userInput.length === 0 && !loading && !isFinished && (
                    <div className="absolute top-4 right-4 text-xs text-gray-500 flex items-center gap-1">
                       <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                       Click to focus & start typing
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Virtual Keyboard */}
            <div className="w-full max-w-4xl hidden md:block">
              <VirtualKeyboard 
                layout={layout} 
                activeKey={activeKey} 
                pressedKey={pressedKey}
                isCorrect={lastPressCorrect}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-gray-600 text-sm border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} VelocityType AI. Powered by Google Gemini.</p>
      </footer>

    </div>
  );
};

export default App;