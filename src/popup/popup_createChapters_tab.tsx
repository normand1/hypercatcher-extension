import { useState, useEffect } from 'react';
import { Episode, Podcast, PodcastChapter } from '../models/podcastCreateModels';
import './Popup.css';
import { PodcastsList } from './podcastList';
import { EpisodesList } from './episodeList';
import { ChaptersList } from './chapterList';

export const PopupCreateChaptersTab = () => {

    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [episodes, setEpisodes] = useState<Episode[]>([]); 
    const [currentPodcastId, setCurrentPodcastId] = useState<string | null>(null);
    const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState('podcasts'); // 'podcasts', 'episodes', 'chapters'

    const handleSelectPodcast = (id:string) => {
        setCurrentPodcastId(id);
        chrome.storage.sync.set({ 'currentPodcastId': id });
        setCurrentView('episodes');
        const episodes = podcasts.find(podcast => podcast.id === id)?.episodes;
        if (episodes) {
            setEpisodes(episodes);

        }
    };

    const handleSelectEpisode = (id:string) => {
        setCurrentEpisodeId(id);
        chrome.storage.sync.set({ 'currentEpisodeId': id });
        setCurrentView('chapters');
    };

    const handleBackToPodcasts = () => {
        setCurrentPodcastId(null);
        setCurrentView('podcasts');
    };

    const handleBackToEpisodes = () => {
        setCurrentEpisodeId(null);
        setCurrentView('episodes');
    };

    useEffect(() => {
        // Load podcasts from Chrome Storage
        chrome.storage.sync.get(['podcasts'], (result) => {
            console.log('podcasts', result.podcasts);
            if (result.podcasts) {
                setPodcasts(result.podcasts);
            }
        });

        chrome.storage.sync.get(['currentView'], (result) => {
            console.log('currentView', result.currentView);
            if (result.currentView) {
                setCurrentView(result.currentView);
            }
        });
    }, []);  


    useEffect(() => {
        // Update Chrome Storage when currentView changes
        chrome.storage.sync.set({ 'currentView': currentView });
    }, [currentView]);

    return (
        <div className="popup-container">
        {currentView === 'podcasts' && <PodcastsList onSelectPodcast={handleSelectPodcast} podcasts={podcasts} setPodcasts={setPodcasts} />}
        {currentView === 'episodes' && <EpisodesList podcasts={podcasts} onSelectEpisode={handleSelectEpisode} onBack={handleBackToPodcasts} episodes={episodes} setPodcasts={setPodcasts} />}
        {currentView === 'chapters' && <ChaptersList onBack={handleBackToEpisodes} podcasts={podcasts} setPodcasts={setPodcasts}/>}
        </div>
    );
    };