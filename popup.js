/*
---------------------------------------
TOGGLE EDIT MODE
---------------------------------------
*/

document.getElementById('toggle')
  .addEventListener('click', async () => {

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.tabs.sendMessage(tab.id, {
      action: 'toggleEdit'
    });

  });

/*
---------------------------------------
CLEAR STORAGE
---------------------------------------
*/

document.getElementById('clear')
  .addEventListener('click', () => {

    chrome.storage.local.remove('changes', () => {

      alert('Saved changes cleared');

    });

  });