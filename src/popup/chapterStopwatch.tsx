import React, { useState, useEffect } from 'react';

interface ChapterStopwatchProps {
  autoChapterMode: boolean;
}

const ChapterStopwatch: React.FC<ChapterStopwatchProps> = ({ autoChapterMode }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: number | undefined;

    function updateTime() {
      if (autoChapterMode) {
        chrome.storage.sync.get(['currentStopwatchTime'], (result) => {
          console.log('ChapterStopwatch - current storage state:', result);
          setCurrentTime(result.currentStopwatchTime || 0);
        });
      }
    }

    if (autoChapterMode) {
      updateTime(); // Update immediately when autoChapterMode is enabled
      interval = window.setInterval(updateTime, 1000); // Update every second
    } else {
      // Update one last time when autoChapterMode is disabled
      chrome.storage.sync.get(['currentStopwatchTime'], (result) => {
        setCurrentTime(result.currentStopwatchTime || 0);
      });
      // Clear interval if autoChapterMode is disabled
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [autoChapterMode]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="chapter-stopwatch">
      Current Time: {formatTime(currentTime)}
    </div>
  );
};

export default ChapterStopwatch;
