import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

function CognitiveLoadIndicator({ compact = false }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loadData, setLoadData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [suggestionKey, setSuggestionKey] = useState(0); // Force re-render suggestions
  const [isPaused, setIsPaused] = useState(false);
  const [ignoreCount, setIgnoreCount] = useState(0);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Clear all local state when user logs out or auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset all state when user logs out
      setLoadData(null);
      setShowPopup(false);
      setSuggestionKey(0);
      setIsPaused(false);
      setIgnoreCount(0);
      setSettingsLoaded(false);
    }
  }, [isAuthenticated]);

  // Fetch user settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await api.get('/activity/settings');
        setIsPaused(response.data.data.notificationPaused || false);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setSettingsLoaded(true);
      }
    };
    fetchSettings();
  }, [isAuthenticated]);

  // Fetch cognitive load data
  const fetchLoadData = async () => {
    if (!isAuthenticated || isPaused || !settingsLoaded) return;
    
    try {
      const response = await api.get('/activity/load');
      setLoadData(response.data.data);
      
      // Show popup if overloaded and not already shown
      if (response.data.data.state === 'OVERLOADED' && !showPopup && !isPaused) {
        setShowPopup(true);
        setSuggestionKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching cognitive load:', error);
    }
  };

  // Poll for load data every 30 seconds
  useEffect(() => {
    if (isAuthenticated && !isPaused && settingsLoaded) {
      fetchLoadData();
      const interval = setInterval(fetchLoadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isPaused, settingsLoaded]);

  // Record user's response to suggestion
  const recordSuggestionResponse = async (actionTaken) => {
    try {
      await api.post('/activity/response', { actionTaken });
      
      // If user took a break, hide popup immediately
      if (actionTaken === 'BREAK_TAKEN' || actionTaken === 'TASK_SWITCHED') {
        setShowPopup(false);
      }
    } catch (error) {
      console.error('Error recording suggestion response:', error);
    }
  };

  // Auto-hide popup after 15 seconds (counts as ignored)
  useEffect(() => {
    if (showPopup && loadData?.state === 'OVERLOADED') {
      const timer = setTimeout(() => {
        setShowPopup(false);
        setIgnoreCount(prev => {
          const newCount = prev + 1;
          // Auto-pause if user ignores 3 times in a row
          if (newCount >= 3) {
            setIsPaused(true);
          }
          return newCount;
        });
        recordSuggestionResponse('IGNORED');
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, loadData?.state, suggestionKey]);

  if (!loadData) return null;

  const { score, state, suggestion, reasons, signals } = loadData;

  // Determine colors based on state
  const getStateStyles = () => {
    switch (state) {
      case 'OVERLOADED':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-700',
          indicator: 'bg-red-500',
          pulse: 'animate-pulse',
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          indicator: 'bg-yellow-500',
          pulse: '',
        };
      default:
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-700',
          indicator: 'bg-green-500',
          pulse: '',
        };
    }
  };

  const styles = getStateStyles();

  // Compact mode for navbar
  if (compact) {
    const displayText = isPaused ? 'PAUSED' : state;
    const displayClass = isPaused ? 'text-gray-500' : styles.text;
    const indicatorClass = isPaused ? 'bg-gray-400' : `${styles.indicator} ${styles.pulse}`;
    const bgClass = isPaused ? 'bg-gray-100' : styles.bg;
    const borderClass = isPaused ? 'border-gray-300' : styles.border;
    
    return (
      <div 
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${bgClass} ${borderClass} cursor-pointer`}
        title={`Cognitive Load: ${state} (${score}). Click for details`}
        onClick={() => setShowPopup(!showPopup)}
      >
        <div className={`w-2 h-2 rounded-full ${indicatorClass}`}></div>
        <span className={`text-xs font-medium ${displayClass}`}>{displayText}</span>
      </div>
    );
  }

  const handleBreak = () => {
    setShowPopup(false);
    recordSuggestionResponse('BREAK_TAKEN');
  };

  const handleSwitchTask = () => {
    setShowPopup(false);
    recordSuggestionResponse('TASK_SWITCHED');
    // Could navigate to easy tasks
  };

  const handleDismiss = () => {
    setShowPopup(false);
    recordSuggestionResponse('IGNORED');
  };

  const togglePause = async () => {
    setIsPaused(!isPaused);
    try {
      await api.put('/activity/settings', { notificationPaused: !isPaused });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const getEnhancedSuggestion = () => {
    const base = suggestion;
    if (state === 'OVERLOADED') {
      return base + ' Also consider pausing notifications temporarily.';
    }
    return base;
  };

  return (
    <>
      {/* Load Indicator Popup */}
      <div 
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          showPopup ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className={`bg-white rounded-xl shadow-2xl border-2 ${styles.border} p-4 w-96 animate-fade-in`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${styles.indicator} ${styles.pulse}`}></div>
              <span className={`font-bold ${styles.text}`}>{state}</span>
            </div>
            <span className="text-xs text-gray-400">Cognitive Load</span>
          </div>

          {/* Score */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Load Score</span>
              <span className="font-bold">{score}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${styles.indicator}`}
                style={{ width: `${Math.min(score * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Signals */}
          <div className="mb-4 text-xs text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
            <div className="flex justify-between">
              <span>🔴 Hard Task Streak</span>
              <span className="font-semibold">{signals?.hardTaskStreak || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>🔄 Task Switches (30m)</span>
              <span className="font-semibold">{signals?.taskSwitches || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>⏱️ Delay Factor</span>
              <span className="font-semibold">{signals?.delayFactor || 0}x</span>
            </div>
            {loadData.sensitivity && (
              <div className="flex justify-between text-purple-600">
                <span>⚙️ Sensitivity</span>
                <span className="font-semibold">{loadData.sensitivity}x</span>
              </div>
            )}
          </div>

          {/* Reasons */}
          {reasons && reasons.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-semibold text-red-600 mb-1">Why you're {state.toLowerCase()}:</p>
              <ul className="text-xs text-red-600 space-y-1">
                {reasons.map((reason, index) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestion */}
          <div className={`p-3 rounded-lg ${styles.bg} border ${styles.border} mb-4`}>
            <p className={`text-sm font-medium ${styles.text}`}>{getEnhancedSuggestion()}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              Dismiss
            </button>
            {state === 'OVERLOADED' && (
              <>
                <button
                  onClick={handleSwitchTask}
                  className={`flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition`}
                >
                  Switch to Easy
                </button>
                <button
                  onClick={handleBreak}
                  className={`flex-1 px-3 py-2 ${styles.bg} ${styles.text} rounded-lg text-sm hover:opacity-80 transition`}
                >
                  Take Break
                </button>
              </>
            )}
          </div>

          {/* Pause notifications toggle */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <label className="flex items-center justify-between text-xs text-gray-600">
              <span>Pause cognitive load notifications</span>
              <button
                onClick={togglePause}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isPaused ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    isPaused ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Mini indicator (always visible) */}
      <div className="fixed bottom-4 right-4 z-40">
        <div 
          onClick={() => setShowPopup(!showPopup)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full cursor-pointer hover:shadow-lg transition-all border-2 ${
            isPaused ? 'border-gray-300 bg-gray-100 text-gray-500' : `${styles.bg} ${styles.border}`
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-gray-400' : `${styles.indicator} ${styles.pulse}`}`}></div>
          <span className={`text-sm font-medium ${isPaused ? 'text-gray-500' : styles.text}`}>
            {isPaused ? 'PAUSED' : state}
          </span>
          {!isPaused && <span className="text-xs text-gray-400">({score})</span>}
        </div>
      </div>
    </>
  );
}

export default CognitiveLoadIndicator;
