import { useState, useEffect } from 'react';
import './Popup.css';
import { SupportedWebsite, SupportedAction, getSupportedActionForWebsite } from '../hcGlobals';

export const PopupPublishChaptersTab = () => {

    const [fileName, setFileName] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);
    const [isSupportedSite, setIsSupportedSite] = useState(false);
    const [currentWebsite, setCurrentWebsite] = useState('');
    const [supportedAction, setSupportedAction] = useState(SupportedAction.InsertText);
    const [fileContent, setFileContent] = useState('');

    const link = 'https://studio.hypercatcher.com';

    useEffect(() => {
        // Retrieve persisted data when the component mounts
        chrome.storage.local.get(['jsonContent', 'fileName', 'isDragActive', 'fileContent'], function(result) {
          if (result.fileName) {
            setFileName(result.fileName);
          }
          if (result.isDragActive) {
            setIsDragActive(result.isDragActive);
          }
          if (result.fileContent) {
            setFileContent(result.fileContent);
          }
        });
    
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          
          if (tabs[0] && tabs[0].url) {
            const url = new URL(tabs[0].url);
            const site = url.hostname.replace('www.', ''); // Remove 'www.' if present
            setCurrentWebsite(site);
            let supportedSite: SupportedWebsite;
              if (Object.values(SupportedWebsite).some((value) => value === site)) {
                setIsSupportedSite(true);
                supportedSite = site as SupportedWebsite;
                setSupportedAction(getSupportedActionForWebsite(supportedSite));
              } else {
                setIsSupportedSite(false);
                setSupportedAction(SupportedAction.None);
              }
            }
        });
      
      }, []);

      useEffect(() => {
        // Persist data when jsonContent or fileName changes
        chrome.storage.local.set({fileName, isDragActive, fileContent });
      }, [fileName, isDragActive, fileContent]);
    
      const sendCurrentSupportedActionToPage = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id!, { action: supportedAction, fileContent });
        });
      };
    
      const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        console.log('handleDragOver');
        e.preventDefault();
      };
      
      const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        console.log('handleDragEnter');
        e.preventDefault();
        setIsDragActive(true);
      };
      
      const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        console.log('handleDragLeave');
        e.preventDefault();
        setIsDragActive(false);
      };
      
      const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        console.log('handleFileDrop');
        e.preventDefault();
        console.log('DataTransfer', e.dataTransfer); // Log the entire DataTransfer object
      
        if (e.dataTransfer) {
          console.log('data transfer');
          const file = e.dataTransfer.files[0];
          if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
              const content = e.target!.result;
              setFileContent(content as string);
              setFileName(file.name);
              // sendFileToPage(content as string); // send the file content
            };
            reader.readAsText(file);
          } else {
            console.error('File type not supported or no file selected');
          }
        } else {
          console.error('no dataTransfer'); 
        }
      };
    
      const unloadChapterFile = () => {
        setFileContent('');
        setIsDragActive(false);
        setFileName('');
      }
    
      const getDropZoneMessage = () => {
        if (fileName) {
          return `Chapter File Loaded: \n ${fileName.substring(0, 7)}...`;
        }
        return 'Drop JSON File Here';
      };

      return (
      // Existing content for the first tab
      <div>
    <img src="img/warp-standalone-logo-hypercatcher.png" alt="HyperCatcher Logo" className="logo"/>
    <h3>Chapter Sync</h3>
    {isSupportedSite && (
  <div>
    <span>✅ Supported Site <br/> </span>
    <span>{currentWebsite}</span>
  </div>
)}
  {!isSupportedSite && (
  <div>
    <span>❌ Unsupported Site <br/> </span>
    <span>{currentWebsite}</span>
  </div>
)}
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleFileDrop}
      className={`drop-zone ${isDragActive ? 'active' : ''}`}>
      {getDropZoneMessage()}
    </div>
    <div >
    <button className='calc' onClick={sendCurrentSupportedActionToPage}>Update Chapters</button>
    <button className='calc' onClick={unloadChapterFile}>Unload Chapter File</button> <br/>
    <a href={link} target="_blank">
      Visit HyperCatcher Studio
    </a>
    </div>
      </div>)


}