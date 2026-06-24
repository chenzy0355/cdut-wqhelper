chrome.action.onClicked.addListener((tab) => {
  const url = tab.url || '';
  if (!url.includes('wqxt.cdut.edu.cn')) return;

  if (url.includes('classroom.wqxt.cdut.edu.cn')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['disclaimer.js', 'jspdf.umd.min.js', 'popup.js'],
      world: 'MAIN'
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['disclaimer.js', 'my-courses.js'],
      world: 'MAIN'
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'download-pdf') {
    if (!chrome.downloads) {
      sendResponse({ success: false, error: 'downloads API 不可用，请在 chrome://extensions 中重新加载扩展以激活权限' });
      return true;
    }
    chrome.downloads.download({
      url: message.dataUrl,
      filename: message.filename || '课件.pdf',
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId: downloadId });
      }
    });
    return true;
  }
});
