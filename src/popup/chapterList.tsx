import { Podcast, PodcastChapter } from "../models/podcastCreateModels";
import React, {useState, useEffect} from "react";
import ChapterStopwatch from "./chapterStopwatch";

interface ChaptersListProps {
    podcasts: Podcast[];
    setPodcasts: (React.Dispatch<React.SetStateAction<Podcast[]>>);
    onBack: () => void;
}

export const ChaptersList: React.FC<ChaptersListProps> = ({ podcasts, onBack, setPodcasts }) => {

    const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
    const [newChapter, setNewChapter] = useState<PodcastChapter>({ id: '', title: '', start: 0, url: '', img: '' });
    const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
    const [thisCurrentPodcastId, setThisCurrentPodcastId] = useState<string | null>(null);
    const [thisCurrentEpisodeId, setThisCurrentEpisodeId] = useState<string | null>(null);
    const [autoChapterMode, setAutoChapterMode] = useState(false);
    const [lastChapterStartTime, setLastChapterStartTime] = useState<number>(0);


    useEffect(() => {
        chrome.storage.sync.get(['currentPodcastId', 'currentEpisodeId', 'autoChapterMode'], (result) => {
            console.log('Initial storage state:', result);
            if (result.currentPodcastId) {
                setThisCurrentPodcastId(result.currentPodcastId);
            }
            if (result.currentEpisodeId) {
                setThisCurrentEpisodeId(result.currentEpisodeId);
            }
            // Correctly set autoChapterMode based on the stored value
            if (typeof result.autoChapterMode === 'boolean') { 
                setAutoChapterMode(result.autoChapterMode);
            }
            // Check if the current episode has chapters
            const currentEpisode = podcasts
                .find(podcast => podcast.id === result.currentPodcastId)
                ?.episodes.find(episode => episode.id === result.currentEpisodeId);

            if (currentEpisode && (!currentEpisode.chapters || currentEpisode.chapters.length === 0)) {
                // Reset the stopwatch if there are no chapters
                chrome.storage.sync.set({ 
                currentStopwatchTime: 0,
                recordingStartTime: Math.round(Date.now() / 1000)
                });
            }
            });
        }, [podcasts]);
    

    
    const handlePlusButtonClick = () => {
        setIsAddingNew(true);
    };

    const handleCancelButtonClick = () => {
        setIsAddingNew(false);
    };

    const getLastChapterStartTime = (podcasts: Podcast[], thisCurrentPodcastId: string | null, thisCurrentEpisodeId: string | null): number => {
        const selectedChapter = podcasts.find(podcast => podcast.id === thisCurrentPodcastId)
          ?.episodes.find(episode => episode.id === thisCurrentEpisodeId)
          ?.chapters.reduce((maxChapter, currentChapter) => 
            currentChapter.start > maxChapter.start ? currentChapter : maxChapter
          , { start: -Infinity } as PodcastChapter);
      
        return selectedChapter?.start ?? 0;
    };

    const toggleAutoChapterMode = () => {
        const newModeState = !autoChapterMode;
        setAutoChapterMode(newModeState);
        
        console.log('Toggling autoChapterMode to:', newModeState);
        
        chrome.storage.sync.get(['currentStopwatchTime'], (result) => {
          console.log('Current storage state before toggle:', result);
          const currentTime = result.currentStopwatchTime || 0;
          
          const newState = { 
            autoChapterMode: newModeState,
            recordingStartTime: Math.round(Date.now() / 1000),
            currentStopwatchTime: currentTime // Maintain the current time
          };
          
          console.log('Setting new state:', newState);
          
          chrome.storage.sync.set(newState, () => {
            console.log('New state set in storage');
            chrome.storage.sync.get(null, (allData) => {
              console.log('All storage data after toggle:', allData);
            });
          });
        });
      };
          
    const selectChapterForEditing = (chapterId: string) => {
        const selectedChapter = podcasts.find(podcast => podcast.id === thisCurrentPodcastId)
                                        ?.episodes.find(episode => episode.id === thisCurrentEpisodeId)
                                        ?.chapters.find(chapter => chapter?.id === chapterId);
    
        if (selectedChapter) {
            setEditingChapterId(chapterId);
            setNewChapter({...selectedChapter});
            setIsAddingNew(true); // Reuse this state to show input fields for editing
        }
    };

    const handleExportChapters = () => {
        const currentPodcast = podcasts.find(podcast => podcast.id === thisCurrentPodcastId);
        const currentEpisode = currentPodcast?.episodes.find(episode => episode.id === thisCurrentEpisodeId);
        if (!currentEpisode) {
            alert('No episode selected or no chapters to export.');
            return;
        }
    
        const exportData = {
            chapters: currentEpisode.chapters.map(chapter => {
                let chapterData: any = { 
                    title: chapter?.title ?? '', 
                    startTime: chapter?.start
                };
        
                // Conditionally add 'url' and 'img' if they are not null
                if (chapter?.url) chapterData.url = chapter?.url;
                if (chapter?.img) chapterData.img = chapter?.img;
        
                return chapterData;
            }),
            version: "1.0.0"
        };
        
            
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `chapters-${thisCurrentEpisodeId}.json`);
        document.body.appendChild(downloadAnchorNode); // Required for Firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const deleteChapter = () => {
        if (!editingChapterId) return;
    
        const updatedPodcasts = podcasts.map(podcast => {
            if (podcast.id === thisCurrentPodcastId) {
                return {
                    ...podcast,
                    episodes: podcast.episodes.map(episode => {
                        if (episode.id === thisCurrentEpisodeId) {
                            return {
                                ...episode,
                                chapters: episode.chapters.filter(chapter => chapter?.id !== editingChapterId)
                            };
                        }
                        return episode;
                    })
                };
            }
            return podcast;
        });
    
        setPodcasts(updatedPodcasts);
        chrome.storage.sync.set({ podcasts: updatedPodcasts }, () => {
            console.log('Chapter deleted from Chrome Storage.');
        });
    
        setIsAddingNew(false); // Close the editing form
        setEditingChapterId(null); // Reset editing chapter id
    };
    

    const saveNewItem = () => {

        if (editingChapterId) {
            // Logic to update an existing chapter
            const updatedPodcasts = podcasts.map(podcast => {
                if (podcast.id === thisCurrentPodcastId) {
                    return {
                        ...podcast,
                        episodes: podcast.episodes.map(episode => {
                            if (episode.id === thisCurrentEpisodeId) {
                                return {
                                    ...episode,
                                    chapters: episode.chapters.map(chapter => 
                                        chapter?.id === editingChapterId ? {...newChapter} : chapter)
                                };
                            }
                            return episode;
                        })
                    };
                }
                return podcast;
            });    

            setPodcasts(updatedPodcasts);
            chrome.storage.sync.set({ podcasts: updatedPodcasts }, () => {
                console.log('Chapter updated in Chrome Storage.');
            });
    
            setEditingChapterId(null);
            setNewChapter({ id: '', title: '', start: 0, url: '', img: '' });
            setIsAddingNew(false);
        } else if (thisCurrentEpisodeId && newChapter.title.trim() !== '') {
            // Logic to save a new chapter
            const chapterToAdd = {
                ...newChapter,
                id: Date.now().toString()
            };
    
            const updatedPodcasts = podcasts.map(podcast => {
                if (podcast.id === thisCurrentPodcastId) {
                    return {
                        ...podcast,
                        episodes: podcast.episodes.map(episode => 
                            episode.id === thisCurrentEpisodeId 
                            ? {...episode, chapters: [...episode.chapters, chapterToAdd]} 
                            : episode)
                    };
                }
                return podcast;
            });
    
            setPodcasts(updatedPodcasts);
            chrome.storage.sync.set({ podcasts: updatedPodcasts }, () => {
                console.log('Podcasts with new chapter updated in Chrome Storage.');
            });
    
            setNewChapter({ id: '', title: '', start: 0, url: '', img: '' });
            setIsAddingNew(false);
        }
    };

    return (
        <div>
            {isAddingNew ? (
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
                        value={newChapter.title}
                        onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                        placeholder="Enter chapter title"
                        autoFocus  // Automatically focuses the input field
                    />
                    <input
                        type="number"
                        className="new-podcast-input"
                        value={newChapter.start}
                        onChange={(e) => setNewChapter({...newChapter, start: Number(e.target.value)})}
                        placeholder="Enter chapter start time"
                    />
                    <input
                        type="url"
                        className="new-podcast-input"
                        value={newChapter.url}
                        onChange={(e) => setNewChapter({...newChapter, url: e.target.value})}
                        placeholder="Enter chapter URL"
                    />
                    <input
                        type="text"  // Changed from 'img' to 'text' for proper input type
                        className="new-podcast-input"
                        value={newChapter.img}
                        onChange={(e) => setNewChapter({...newChapter, img: e.target.value})}
                        placeholder="Enter Image URL"
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
                    {editingChapterId && (
                        <button 
                            type="button"
                            className="delete-podcast-btn" 
                            onClick={deleteChapter}
                        >
                            Delete
                        </button>
                    )}
                </form>
            ) : (
                <>
                    <button className="back-button" onClick={onBack}>&#8592; Back</button>
                    <h3>Chapters</h3>
                    <ChapterStopwatch autoChapterMode={autoChapterMode} />
                    <div className="podcasts-list-container">
                        <button className="add-item-btn" onClick={handlePlusButtonClick}>+</button>
                        <button className="export-btn" onClick={handleExportChapters}>Export Chapters</button>
                        <button className="export-btn" onClick={toggleAutoChapterMode}>
                            {autoChapterMode ? 'Disable Auto-Chapter Mode' : 'Enable Auto-Chapter Mode'}
                        </button>
                        {podcasts.find(podcast => podcast.id === thisCurrentPodcastId)
                            ?.episodes.find(episode => episode.id === thisCurrentEpisodeId)
                            ?.chapters.map(chapter => (
                                <div key={chapter?.id} className="podcast-item" onClick={() => selectChapterForEditing(chapter?.id ?? '')}>
                                    {chapter?.start !== null && <p>Start Time: {chapter?.start}</p>}
                                    {chapter?.title && <p>Title: {chapter?.title}</p>}
                                    {chapter?.url && <p>URL: <span>{chapter?.url}</span></p>}
                                    {chapter?.img && <p>Image: <span>{chapter?.img}</span></p>}
                                </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
