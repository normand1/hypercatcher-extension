import { Episode, Podcast } from "../models/podcastCreateModels";
import React, {useState, useEffect} from "react";


interface EpisodesListProps {
    episodes: Episode[];
    podcasts: Podcast[];
    onSelectEpisode: (id: string) => void;
    setPodcasts: (React.Dispatch<React.SetStateAction<Podcast[]>>);
    onBack: () => void;
}

export const EpisodesList:React.FC<EpisodesListProps> = ({ podcasts, onSelectEpisode, onBack, episodes, setPodcasts }) => {

    const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
    const [newEpisodeTitle, setNewEpisodeTitle] = useState<string>('');
    const [thisCurrentPodcastId, setThisCurrentPodcastId] = useState<string | null>(null);

    const handlePlusButtonClick = () => {
        setIsAddingNew(true);
        setNewEpisodeTitle('');
    };

    useEffect(() => {
        chrome.storage.sync.get(['currentPodcastId'], (result) => {
            console.log('currentPodcastId', result.currentPodcastId);
            if (result.currentPodcastId) {
                setThisCurrentPodcastId(result.currentPodcastId);
            }
        });
    }
    , []);

    const saveNewItem = () => {
        
        // Logic to save a new episode
        const newEpisode: Episode = {
            id: Date.now().toString(),
            title: newEpisodeTitle,
            chapters: [],
        };

        const updatedPodcasts = podcasts.map(podcast => 
            podcast.id === thisCurrentPodcastId 
            ? {...podcast, episodes: [...podcast.episodes, newEpisode]} 
            : podcast
        );

        setPodcasts(updatedPodcasts);
        chrome.storage.sync.set({ podcasts: updatedPodcasts }, () => {
            console.log('Podcasts with new episode updated in Chrome Storage.');
        });

        setNewEpisodeTitle('');
        setIsAddingNew(false);
};

const handleCancelButtonClick = () => {
    setIsAddingNew(false);
};


return (
    <div>
        {isAddingNew && (
            <form 
                onSubmit={(e) => {
                    e.preventDefault(); // Prevents the default form submission behavior
                    saveNewItem(); // Calls your saveNewItem function
                }}
                className="save-podcast-btn-container"
            >
                <input
                    type="text"
                    className="new-podcast-input"
                    value={newEpisodeTitle}
                    onChange={(e) => setNewEpisodeTitle(e.target.value)}
                    placeholder="Enter new episode title"
                    autoFocus  // Automatically focuses the input field
                />
                <button 
                    type="submit"  // Indicates that this button submits the form
                    className="save-podcast-btn"
                >
                    Save
                </button>
                <button 
                    type="button"  // This ensures the button doesn't submit the form
                    className="save-podcast-btn"
                    onClick={handleCancelButtonClick}
                >
                    Cancel
                </button>
            </form>
        )}
        <button className="back-button" onClick={onBack}>&#8592; Back</button>
        <button className="add-item-btn" onClick={handlePlusButtonClick}>+</button>
        <h3>Episodes</h3>
        <div className="podcasts-list-container">
            {podcasts.find(podcast => podcast.id === thisCurrentPodcastId)?.episodes.map(episode => (
                <div key={episode.id} className="podcast-item"
                     onClick={() => onSelectEpisode(episode.id)}>
                    {episode.title}
                </div>
            ))}
        </div>
    </div>);
};
