import React, { useState, useEffect } from "react";
import { Podcast, PodcastChapter } from "../models/podcastCreateModels";
import ChapterStopwatch from "./chapterStopwatch";

interface ChaptersListProps {
    podcasts: Podcast[];
    setPodcasts: React.Dispatch<React.SetStateAction<Podcast[]>>;
    onBack: () => void;
}

interface CustomDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveJson: () => void;
    onCopyDescription: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ isOpen, onClose, onSaveJson, onCopyDescription }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'var(--background-color)',
                padding: '20px',
                borderRadius: '10px',
                maxWidth: '80%',
                color: 'var(--hc-orange)',
                border: '1px solid var(--hc-orange)',
            }}>
                <h3 style={{ marginTop: '0.5em', textTransform: 'uppercase', fontSize: '1.5rem', fontWeight: 200, lineHeight: '1.2rem' }}>
                    Export Chapters
                </h3>
                <p>Choose how you want to export the chapters:</p>
                <button onClick={onSaveJson} className="calc" style={{ marginRight: '10px' }}>Save as JSON</button>
                <button onClick={onCopyDescription} className="calc" style={{ marginRight: '10px' }}>Copy as Podcast Description</button>
                <button onClick={onClose} className="calc">Cancel</button>
            </div>
        </div>
    );
};

export const ChaptersList: React.FC<ChaptersListProps> = ({ podcasts, onBack, setPodcasts }) => {
    const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
    const [newChapter, setNewChapter] = useState<PodcastChapter>({ id: '', title: '', start: 0, url: '', img: '' });
    const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
    const [thisCurrentPodcastId, setThisCurrentPodcastId] = useState<string | null>(null);
    const [thisCurrentEpisodeId, setThisCurrentEpisodeId] = useState<string | null>(null);
    const [autoChapterMode, setAutoChapterMode] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);

    useEffect(() => {
        chrome.storage.sync.get(['currentPodcastId', 'currentEpisodeId', 'autoChapterMode', 'currentStopwatchTime', 'recordingStartTime'], (result) => {
            console.log('Initial storage state:', result);
            if (result.currentPodcastId) {
                setThisCurrentPodcastId(result.currentPodcastId);
            }
            if (result.currentEpisodeId) {
                setThisCurrentEpisodeId(result.currentEpisodeId);
            }
            if (typeof result.autoChapterMode === 'boolean') { 
                setAutoChapterMode(result.autoChapterMode);
            }
            
            const currentEpisode = podcasts
                .find(podcast => podcast.id === result.currentPodcastId)
                ?.episodes.find(episode => episode.id === result.currentEpisodeId);

            if (currentEpisode && (!currentEpisode.chapters || currentEpisode.chapters.length === 0)) {
                if (typeof result.currentStopwatchTime === 'undefined' || typeof result.recordingStartTime === 'undefined') {
                    chrome.storage.sync.set({ 
                        currentStopwatchTime: 0,
                        recordingStartTime: Math.round(Date.now() / 1000)
                    });
                }
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
        
        chrome.storage.sync.set({ autoChapterMode: newModeState }, () => {
          console.log('New autoChapterMode state set in storage');
          chrome.storage.sync.get(null, (allData) => {
            console.log('All storage data after toggle:', allData);
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
            setIsAddingNew(true);
        }
    };

    const handleExportChapters = () => {
        setShowExportDialog(true);
    };

    const exportAsJson = () => {
        const currentPodcast = podcasts.find(podcast => podcast.id === thisCurrentPodcastId);
        const currentEpisode = currentPodcast?.episodes.find(episode => episode.id === thisCurrentEpisodeId);
        if (!currentEpisode) {
            alert('No episode selected or no chapters to export.');
            return;
        }

        const exportData = {
            chapters: currentEpisode.chapters.map(chapter => ({
                title: chapter?.title ?? '',
                startTime: chapter?.start,
                ...(chapter?.url && { url: chapter.url }),
                ...(chapter?.img && { img: chapter.img })
            })),
            version: "1.0.0"
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `chapters-${thisCurrentEpisodeId}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setShowExportDialog(false);
    };

    const copyAsPodcastDescription = () => {
        const currentPodcast = podcasts.find(podcast => podcast.id === thisCurrentPodcastId);
        const currentEpisode = currentPodcast?.episodes.find(episode => episode.id === thisCurrentEpisodeId);
        if (!currentEpisode) {
            alert('No episode selected or no chapters to export.');
            return;
        }

        const chapterDescriptions = currentEpisode.chapters.map(chapter => {
            const time = new Date(chapter?.start * 1000).toISOString().substr(11, 8);
            let description = `<p>${time} ${chapter?.title}`;
            if (chapter?.url) {
                description += ` <a href="${chapter.url}">${chapter.url}</a>`;
            }
            description += '</p>';
            return description;
        }).join('\n');

        navigator.clipboard.writeText(chapterDescriptions).then(() => {
            alert('Chapters copied to clipboard in podcast description format!');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
        setShowExportDialog(false);
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
    
        setIsAddingNew(false);
        setEditingChapterId(null);
    };

    const saveNewItem = () => {
        if (editingChapterId) {
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
            <CustomDialog 
                isOpen={showExportDialog}
                onClose={() => setShowExportDialog(false)}
                onSaveJson={exportAsJson}
                onCopyDescription={copyAsPodcastDescription}
            />
            {isAddingNew ? (
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveNewItem();
                    }}
                    className="save-podcast-btn-container"
                >
                    <input
                        type="text"
                        className="new-podcast-input"
                        value={newChapter.title}
                        onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                        placeholder="Enter chapter title"
                        autoFocus
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
                        type="text"
                        className="new-podcast-input"
                        value={newChapter.img}
                        onChange={(e) => setNewChapter({...newChapter, img: e.target.value})}
                        placeholder="Enter Image URL"
                    />
                    <button 
                        type="submit"
                        className="save-podcast-btn"
                    >
                        Save
                    </button>
                    <button 
                        type="button"
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

export default ChaptersList;