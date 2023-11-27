console.log('hypercatcher extension background script is running')
import { Episode, Podcast, PodcastChapter } from '../models/podcastCreateModels';

interface LastTabUrls {
  [key: string]: string | undefined;
}

let podcasts:any = [];
let thisCurrentPodcastId:any = null;
let thisCurrentEpisodeId:any = null;
let autoChapterMode = false;
let lastTabUrls: LastTabUrls = {};
let ignoreUrlsList = ['chrome://newtab/'];
let recordingStartTime = 0;
let lastChapterStartTime = 0;


chrome.runtime.onMessage.addListener((request) => {
  console.log('hypercatcher extension background received a request', request)
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.autoChapterMode?.newValue !== undefined) {
    console.log('autoChapterMode changed', changes.autoChapterMode.newValue);
    autoChapterMode = changes.autoChapterMode.newValue;
    updateIcon(autoChapterMode);
    lastTabUrls = {};
        // Start or reset the timer based on autoChapterMode
        if (autoChapterMode) {
          recordingStartTime = Date.now() / 1000; // Start the timer
        } else {
          recordingStartTime = 0; // Reset the timer
        }    
  }
});

function updateIcon(isRecording: boolean) {
  const iconPath = isRecording ? 'img/logo-48-recording.png' : 'img/logo-48.png';
  chrome.action.setIcon({ path: iconPath }); // Use 'chrome.browserAction.setIcon' for Manifest V2
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab's status is 'complete' and the URL is different from the last one we saw
  console.log('lastTabUrls', JSON.stringify(lastTabUrls));
  if (changeInfo.status === 'complete' && tab.url && lastTabUrls[tab.url] !== tab.url && !ignoreUrlsList.includes(tab.url)) {
    // Logic to create a new chapter with the tab's URL
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
    contexts: ["selection"] // This makes it appear only when text is selected
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
  else if (info.menuItemId === "createPodcastChapterUrl" && info.selectionText) {
    addNewChapter(info.selectionText, 'url');
  }
  else if (info.menuItemId === "createPodcastChapterImage" && info.srcUrl) {
    addNewChapter(info.srcUrl, 'img');
  }
});
  
function addNewChapter(selectedTextOrUrl: string, to: string = 'title') {
  chrome.storage.sync.get(['podcasts', 'currentPodcastId', 'currentEpisodeId'], (result) => {
    if (result.podcasts) {
      podcasts = result.podcasts;
    }
    if (result.currentPodcastId) {
      thisCurrentPodcastId = result.currentPodcastId;
    }
    if (result.currentEpisodeId) {
      thisCurrentEpisodeId = result.currentEpisodeId;
    }

    // Find the current episode and its latest chapter start time
    const currentEpisode = podcasts
    .find((podcast: Podcast) => podcast.id === thisCurrentPodcastId)
    ?.episodes.find((episode: Episode) => episode.id === thisCurrentEpisodeId);

  lastTabUrls = currentEpisode?.chapters.reduce((acc: LastTabUrls, chapter: PodcastChapter) => {
    acc[chapter.url] = chapter.url;
    return acc;
  }) || {};

  if (selectedTextOrUrl in lastTabUrls) {
    console.log('URL already exists in lastTabUrls, skipping chapter creation.');
    return;
  }
  
  let lastChapterStartTime = currentEpisode?.chapters.reduce((max: number, chapter: PodcastChapter) => Math.max(max, chapter.start), 0) || 0;
  let startTime = 0;

    const currentTime = Math.round(Date.now() / 1000);
    if ((currentTime - recordingStartTime) > lastChapterStartTime) {
      startTime = Math.round((currentTime - recordingStartTime));
    } else {
      startTime = (Math.round(currentTime / 1000) - recordingStartTime);
    }

    const chapterToAdd = {
      id: Date.now().toString(),
      title: to == 'title' ? selectedTextOrUrl : '',
      start: startTime,
      url: to == 'url' ? selectedTextOrUrl : '',
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

    chrome.storage.sync.set({ podcasts: updatedPodcasts }, () => {
      console.log('Podcasts with new chapter updated in Chrome Storage.');
    });
  }
  );
}

