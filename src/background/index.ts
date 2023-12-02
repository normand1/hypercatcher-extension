console.log('hypercatcher extension background script is running')
import { Episode, Podcast, PodcastChapter } from '../models/podcastCreateModels';
let autoChapterMode = false;
let lastTabUrls = new Set<string>();
let ignoreUrlsList = ['chrome://newtab/', 'chrome://extensions/', 'chrome://settings/', 'chrome://bookmarks/', 'chrome://downloads/'];

chrome.runtime.onMessage.addListener((request) => {
  console.log('hypercatcher extension background received a request', request)
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.autoChapterMode?.newValue !== undefined) {
    console.log('autoChapterMode changed', changes.autoChapterMode.newValue);
    autoChapterMode = changes.autoChapterMode.newValue;
    updateIcon(autoChapterMode);
    lastTabUrls = new Set<string>();
    const recordingStartTime =  Math.round(Date.now() / 1000);
    //TODO: handle recording start time updates when swithcing episodes
    chrome.storage.sync.set({ recordingStartTime: recordingStartTime }, () => {
      console.log('updated recordingStartTime:', recordingStartTime);
    });
  }
});

function updateIcon(isRecording: boolean) {
  const iconPath = isRecording ? 'img/logo-48-recording.png' : 'img/logo-48.png';
  chrome.action.setIcon({ path: iconPath }); // Use 'chrome.browserAction.setIcon' for Manifest V2
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab's status is 'complete' and the URL is different from the last one we saw
  console.log('lastTabUrls', JSON.stringify(lastTabUrls));
  if (changeInfo.status === 'complete' && tab.url && !lastTabUrls.has(tab.url) && !ignoreUrlsList.includes(tab.url)) {
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

async function getRecordingStartTime(): Promise<number | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['recordingStartTime'], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      resolve(result.recordingStartTime || null);
    });
  });
}
  
async function addNewChapter(selectedTextOrUrl: string, to: string = 'title') {

  const {currentEpisode, podcasts, thisCurrentPodcastId, thisCurrentEpisodeId} = await getCurrentEpisode();
  if (!currentEpisode) {
    console.log('No current episode found, skipping chapter creation.');
    return;
  }
  lastTabUrls = currentEpisode!.chapters.reduce((acc: Set<string>, chapter: PodcastChapter) => {
      acc.add(chapter.url);
    return acc;
  }, new Set<string>());


  if (selectedTextOrUrl in lastTabUrls) {
    console.log('URL already exists in lastTabUrls, skipping chapter creation.');
    return;
  }

  const currentTime = Math.round(Date.now() / 1000);
  let lastChapterStartTime = 0;
  // console.log('episodeChapters', JSON.stringify(currentEpisode));
  lastChapterStartTime = currentEpisode.chapters!.reduce((max: number, chapter: PodcastChapter) => Math.max(max, chapter.start), 0) || 0;
  
 const recordingStartTime = await getRecordingStartTime() ?? 0;

  console.log('--------------');
  console.log('currentTime:', currentTime);
  console.log('recordingStartTime:', recordingStartTime);
  console.log('(currentTime - recordingStartTime) = ', (currentTime - recordingStartTime));
  console.log('lastChapterStartTime:', lastChapterStartTime);
  
  // Calculate the start time as the difference between current time and recording start time
  let startTime = (currentTime - recordingStartTime);
  console.log('startTime:', startTime);
  
  const chapterToAdd = {
    id: Date.now().toString(),
    title: to === 'title' ? selectedTextOrUrl : '',
    start: Math.round(startTime),
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
      console.log('Podcasts with new chapter updated in Chrome Storage.');
    });
  }

