import { Podcast } from "../models/podcastCreateModels";
import React, {useState, useEffect} from "react";

interface PodcastsListProps {
    podcasts: Podcast[];
    setPodcasts: (React.Dispatch<React.SetStateAction<Podcast[]>>);
    onSelectPodcast: (id: string) => void;
}

export const PodcastsList:React.FC<PodcastsListProps> = ({ onSelectPodcast, podcasts, setPodcasts }) => {

    const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
    const [newPodcastTitle, setNewPodcastTitle] = useState<string>('');

    const handlePlusButtonClick = () => {
        setIsAddingNew(true);
        setNewPodcastTitle('');
    };

    const saveNewItem = () => {
        
            // Logic to save a new podcast
            const newPodcast = {
                id: Date.now().toString(),
                name: newPodcastTitle,
                episodes: []
            };
    
            setPodcasts((podcasts: Podcast[]) => [...podcasts, newPodcast]);
            chrome.storage.sync.set({ podcasts: [...podcasts, newPodcast] }, () => {
                console.log('Podcasts updated in Chrome Storage.');
            });
    
            setNewPodcastTitle('');
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
                    value={newPodcastTitle}
                    onChange={(e) => setNewPodcastTitle(e.target.value)}
                    placeholder="Enter new podcast title"
                    autoFocus
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
            <button className="add-item-btn" onClick={handlePlusButtonClick}>+</button>
            <h3>Podcasts</h3>
            <div className="podcasts-list-container">
                {podcasts.map(podcast => (
                    <div key={podcast.id} 
                         className="podcast-item"
                         onClick={() => onSelectPodcast(podcast.id)}>
                        {podcast.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

