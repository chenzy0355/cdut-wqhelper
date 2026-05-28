chrome.action.onClicked.addListener((tab) => {
  // 当点击插件图标时，在当前页面执行 content.js
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});