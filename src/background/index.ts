console.log('hypercatcher extension background script is running')
import { Episode, Podcast, PodcastChapter } from '../models/podcastCreateModels';
let autoChapterMode = false;
let ignoreUrlsList = ['chrome://newtab/', 'chrome://extensions/', 'chrome://settings/', 'chrome://bookmarks/', 'chrome://downloads/'];
let stopwatchInterval: number | undefined;
let currentStopwatchTime: number = 0;

function updateStopwatch() {
  chrome.storage.sync.get(['autoChapterMode', 'recordingStartTime', 'currentStopwatchTime'], (result) => {
    console.log('updateStopwatch - current storage state:', result);
    if (result.autoChapterMode) {
      const now = Math.round(Date.now() / 1000);
      currentStopwatchTime = (result.currentStopwatchTime || 0) + (now - (result.recordingStartTime || now));
      console.log('updateStopwatch - new currentStopwatchTime:', currentStopwatchTime);
      chrome.storage.sync.set({ currentStopwatchTime, recordingStartTime: now });
    }
  });
}

chrome.runtime.onMessage.addListener((request) => {
  console.log('hypercatcher extension background received a request', request)
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    console.log('Storage changed:', changes);
    if (changes.autoChapterMode?.newValue !== undefined) {
      console.log('autoChapterMode changed', changes.autoChapterMode.newValue);
      autoChapterMode = changes.autoChapterMode.newValue;
      updateIcon(autoChapterMode);
      
      if (autoChapterMode) {
        console.log('Starting stopwatch');
        if (!stopwatchInterval) {
          updateStopwatch(); // Update immediately when starting
          stopwatchInterval = self.setInterval(updateStopwatch, 1000);
        }
      } else {
        console.log('Stopping stopwatch with stopwatch interval', stopwatchInterval);
        if (stopwatchInterval) {
          self.clearInterval(stopwatchInterval);
          stopwatchInterval = undefined;
        }
      }
    }
    
    if (autoChapterMode && changes.currentStopwatchTime) {
      console.log('currentStopwatchTime updated:', changes.currentStopwatchTime.newValue);
    }
    
    if (autoChapterMode && changes.recordingStartTime) {
      console.log('recordingStartTime updated:', changes.recordingStartTime.newValue);
    }
  }
});

function updateIcon(isRecording: boolean) {
  const iconPath = isRecording ? 'img/logo-48-recording.png' : 'img/logo-48.png';
  chrome.action.setIcon({ path: iconPath }); // Use 'chrome.browserAction.setIcon' for Manifest V2
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !ignoreUrlsList.includes(tab.url)) {
    if (autoChapterMode) {
      addNewChapter(tab.url, 'url');
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "createPodcastChapterTitle",
    title: "Chapter Title from Selection",
    contexts: ["selection"] // This makes it appear only when text is selected
  });
  chrome.contextMenus.create({
    id: "createPodcastChapterUrl",
    title: "Chapter URL from Selection",
    contexts: ["selection", "link", "video", "audio", "page"] // This makes it appear only when these things are selected
  });
  chrome.contextMenus.create({
    id: "createPodcastChapterImage",
    title: "Chapter Image from Selection",
    contexts: ["image"] // This will make it appear only when an image is right-clicked
  });

});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "createPodcastChapterTitle" && info.selectionText) {
    addNewChapter(info.selectionText, 'title');
  }
  else if (info.menuItemId === "createPodcastChapterUrl") {
    console.log('info', JSON.stringify(info));
    addNewChapter(info?.linkUrl ?? info?.srcUrl ?? 'could not capture url', 'url');
  }
  else if (info.menuItemId === "createPodcastChapterImage" && info.srcUrl) {
    addNewChapter(info.srcUrl, 'img');
  }
});

function getCurrentEpisode(): Promise<any | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['podcasts', 'currentPodcastId', 'currentEpisodeId'], (result) => {
      if (!result) {
        return reject(new Error('No result found'));
      }

      let podcasts, thisCurrentPodcastId: any, thisCurrentEpisodeId: any;

      if (result.podcasts) {
        podcasts = result.podcasts;
        console.log('podcasts', podcasts);
      }
      if (result.currentPodcastId) {
        thisCurrentPodcastId = result.currentPodcastId;
        console.log('currentPodcastId', thisCurrentPodcastId);
      }
      if (result.currentEpisodeId) {
        thisCurrentEpisodeId = result.currentEpisodeId;
        console.log('currentEpisodeId', thisCurrentEpisodeId);
      }

      // Find the current episode
      const currentEpisode = podcasts?.find((podcast:any) => podcast.id === thisCurrentPodcastId)?.episodes.find((episode:any) => episode.id === thisCurrentEpisodeId);
      console.log('currentEpisode', currentEpisode);

      resolve({currentEpisode, podcasts, thisCurrentPodcastId, thisCurrentEpisodeId} || null);
    });
  });
}
  
async function addNewChapter(selectedTextOrUrl: string, to: string = 'title') {
  const {currentEpisode, podcasts, thisCurrentPodcastId, thisCurrentEpisodeId} = await getCurrentEpisode();
  if (!currentEpisode) {
    console.log('No current episode found, skipping chapter creation.');
    return;
  }

  // Get the current stopwatch time from Chrome storage
  const result = await chrome.storage.sync.get(['currentStopwatchTime']);
  const stopwatchTime = result.currentStopwatchTime || 0;

  const chapterToAdd = {
    id: Date.now().toString(),
    title: to === 'title' ? selectedTextOrUrl : '',
    start: Math.round(stopwatchTime), // Use the stopwatch time instead of calculating
    url: to === 'url' ? selectedTextOrUrl : '',
    img: to === 'img' ? selectedTextOrUrl : '',
  };  
  const updatedPodcasts = podcasts.map((podcast: any) => {
      if (podcast.id === thisCurrentPodcastId) {
        return {
          ...podcast,
          episodes: podcast.episodes.map((episode: any) => episode.id === thisCurrentEpisodeId
            ? { ...episode, chapters: [...episode.chapters, chapterToAdd] }
            : episode)
        };
      }
      return podcast;
    });

    console.log('sending notification');

    chrome.notifications.create(`my-notification-${Date.now()}`, { // Added an ID 'notify1' for the notification
      type: 'basic',
      iconUrl: 'img/logo-48.png', // Ensure this icon exists in your extension directory
      title: 'Chapter Added',
      message: 'A new chapter has been successfully added.'
    }, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            console.log('Notification shown');
        }
    });

    console.log('sent notificaiton');
    console.log('updatedPodcasts', JSON.stringify(updatedPodcasts));
    chrome.storage.sync.set({ podcasts: updatedPodcasts }, () => {
      console.log('Podcasts with new chapter updated in Chrome Storage in background.');
    });
  }


function initializeStopwatch() {
  chrome.storage.sync.get(['autoChapterMode', 'recordingStartTime'], (result) => {
    if (result.autoChapterMode) {
      updateStopwatch();
      if (!stopwatchInterval) {
        stopwatchInterval = window.setInterval(updateStopwatch, 1000);
      }
    }
  });
}
  
  // Call initializeStopwatch when the extension starts
  initializeStopwatch();
  
  