import { useState, useEffect } from 'react';
import './Popup.css';
import { PopupPublishChaptersTab } from './popup_publishChapters_tab';
import { PopupCreateChaptersTab } from './popup_createChapters_tab';

export const Popup = () => {
  // Initialize activeTab with a default value
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Function to switch tabs and save the current tab to Chrome's storage
  const switchTab = (tabIdentifier: string) => {
    setActiveTab(tabIdentifier);
    chrome.storage.local.set({ 'activeTab': tabIdentifier });
  };

  // Effect to load the active tab from Chrome's storage when the component mounts
  useEffect(() => {
    chrome.storage.local.get(['activeTab'], function (result) {
      if (result.activeTab) {
        setActiveTab(result.activeTab);
      } else {
        setActiveTab('publishTab'); // Default to publishTab if nothing is stored
      }
    });
  }, []);

  if (activeTab === null) {
    return <div>Loading...</div>; // Or any other loading state representation
  }

  return (
    
    <main>
    <div className="tab-buttons">
      <button 
        className={`tab-button ${activeTab === 'publishTab' ? 'tab-button-active' : ''}`}
        onClick={() => switchTab('publishTab')}>
        Publish
      </button>
      <button 
        className={`tab-button ${activeTab === 'createTab' ? 'tab-button-active' : ''}`}
        onClick={() => switchTab('createTab')}>
        Create
      </button>
    </div>


      {activeTab === 'publishTab' && <PopupPublishChaptersTab />}
      {activeTab === 'createTab' && <PopupCreateChaptersTab />}
    </main>
  );
};

export default Popup;