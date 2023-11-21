console.log('hypercatcher extension background script is running')

chrome.runtime.onMessage.addListener((request) => {
  console.log('hypercatcher extension background received a request', request)
})
