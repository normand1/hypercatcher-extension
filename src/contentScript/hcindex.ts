import { SupportedAction } from '../hcGlobals';

console.info('hyperactcher contentScript is running')

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === SupportedAction.InsertText) {
    // Call a function to insert text
    const formattedChapterText = formatChapters(request.fileContent);
    insertText(formattedChapterText);
  } 
  else if (request.action === SupportedAction.UploadFile) {
    const fileContent = request.fileContent;
    const blob = new Blob([fileContent], { type: 'application/json' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([blob], "uploaded.json"));
    const inputElement = document.getElementById('chapters-json-input') as any;
    if (inputElement) {
      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event('change', { 'bubbles': true }));
    }
     else {
      console.error('inputElement not found');
    }
  } else if (request.action === SupportedAction.InsertChapters) {
    insertChapterTextToTable(request.fileContent);
  } else if (request.action === SupportedAction.
    BlUploadFile) {
      const fileContent = request.fileContent;
      blUploadFile(fileContent);
  }
});

function blUploadFile(fileContent: any) {
const blob = new Blob([fileContent], { type: 'application/json' });
const dataTransfer = new DataTransfer();
dataTransfer.items.add(new File([blob], "uploaded.json"));

// Updated ID for the input element
const inputElement = document.getElementById('chapters-upload') as HTMLInputElement;

if (inputElement) {
  inputElement.files = dataTransfer.files;
  
  // Trigger the 'change' event
  inputElement.dispatchEvent(new Event('change', { 'bubbles': true }));
} else {
  console.error('inputElement not found');
}
}

function simulatePaste(element:HTMLElement, text: string) {
  const pasteEvent = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: new DataTransfer()
  });
  pasteEvent.clipboardData!.setData('text/plain', text);
  element.dispatchEvent(pasteEvent);
}

function insertText(text: string) {
  // Selecting the element based on multiple attributes
  const selector = '[data-slate-editor="true"][contenteditable="true"][role="textbox"][name="description"]';
  const element = document.querySelector(selector);

  if (element instanceof HTMLElement && element.isContentEditable) {
    element.focus();
    simulatePaste(element, text);  
  }
}

async function insertChapterTextToTable(jsonData:any) {
  const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  for (const chapter of data.chapters) {
    await addChapter(chapter);
    await delay(2000); // Wait for 1 second (1000 milliseconds) or adjust as needed
  }
}

async function addChapter(chapter:any) {
  return new Promise<void>(async (resolve, reject) => {

  // Format the start time to ensure it matches the required HH:mm:ss format
  const startTime = formatTime(chapter.startTime); 
  const title = chapter.title;
  const link = chapter.url || '';
  const image = chapter.img || null; // Assuming chapter.img is the file to be uploaded

  // Select the form based on the class
  const forms = document.querySelectorAll('fieldset[data-controller="chapter"] form');
  const form:any = forms[forms.length - 1];


  // Check if the form is found
  if (!form) {
    console.error('Form not found');
    return;
  }

  if (chapter.img) {
    try {
      const mimeType = getMimeType(chapter.img);
      const imageFile = await urlToFile(chapter.img, 'chapterImage', mimeType);
      const imageInput = form['chapter[image]'];
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(imageFile);
      imageInput.files = dataTransfer.files;
      triggerEvent(imageInput, 'change');
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }  

  // Set the values for the form fields
  form['chapter[start_time_string]'].value = startTime;
  form['chapter[title]'].value = title;
  form['chapter[link]'].value = link;

    // Find the submit button in the form and click it programmatically
    const submitButton = form.querySelector('input[type="submit"][name="commit"]');
    if (submitButton) {
      submitButton.click();
      resolve(); // Resolve the promise after clicking the submit button
    } else {
      console.error('Submit button not found');
      reject('Submit button not found');
    }
  });
}

async function urlToFile(url:string, filename:string, mimeType:string) {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new File([blob], filename, { type: mimeType }));
}

function formatChapters(jsonData: any) {
  // Parse JSON if it's a string
  const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  // Ensure there are at least three chapters
  if (data.chapters.length < 3) {
      return "Error: There must be a minimum of 3 chapters.";
  }

  // Sort chapters by startTime
  data.chapters.sort((a:any, b:any) => a.startTime - b.startTime);

  // Create formatted chapter lines
  const formattedChapters = data.chapters.map((chapter: any) => {
      const timestamp = formatTime(chapter.startTime);
      return `(${timestamp}) ${chapter.title}`;
  });

  // Join chapters with new lines
  return formattedChapters.join('\n');
}

// Function to format time
function formatTime(seconds:any) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // Use padStart to ensure each part has at least two digits
  return [hours, minutes, remainingSeconds]
    .map(val => String(val).padStart(2, '0'))
    .join(':');
}

// Helper function to trigger an event
function triggerEvent(element:any, eventName:any) {
  const event = new Event(eventName, { 'bubbles': true, 'cancelable': true });
  element.dispatchEvent(event);
}

function delay(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMimeType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    // Add more cases as needed for different image types
    default:
      return 'application/octet-stream'; // Default MIME type
  }
}