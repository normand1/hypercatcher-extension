import React, { useState, useEffect } from 'react';

interface ChapterStopwatchProps {
  autoChapterMode: boolean;
}

const ChapterStopwatch: React.FC<ChapterStopwatchProps> = ({ autoChapterMode }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const updateDisplayTime = () => {
      chrome.storage.sync.get(['currentStopwatchTime'], (result) => {
        setCurrentTime(result.currentStopwatchTime || 0);
      });
    };

    updateDisplayTime(); // Update immediately

    const interval = setInterval(updateDisplayTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStopwatchClick = () => {
    if (window.confirm("Do you want to reset the stopwatch to zero?")) {
      chrome.storage.sync.set({ 
        currentStopwatchTime: 0,
      }, () => {
        console.log('Stopwatch reset to zero');
        setCurrentTime(0);
      });
    }
  };

  return (
    <div className="chapter-stopwatch" onClick={handleStopwatchClick}>
      Current Time: {formatTime(currentTime)}
    </div>
  );
};

export default ChapterStopwatch;