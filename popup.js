document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('inspectorToggle');

    chrome.storage.sync.get(['inspectorEnabled'], function (result) {
        toggle.checked = result.inspectorEnabled === true;
    });

    toggle.addEventListener('change', function () {
        chrome.storage.sync.set({ inspectorEnabled: toggle.checked }, function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleInspector',
                    enabled: toggle.checked
                });
            });
        });
    });
});
