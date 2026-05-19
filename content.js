let editMode = false;

/*
---------------------------------------
TOGGLE EDIT MODE
---------------------------------------
*/

chrome.runtime.onMessage.addListener((msg) => {

  if (msg.action === 'toggleEdit') {

    editMode = !editMode;

    if (editMode) {
      enableEditor();
      alert('Edit Mode Enabled');
    } else {
      disableEditor();
      alert('Edit Mode Disabled');
    }

  }

});

/*
---------------------------------------
GENERATE UNIQUE SELECTOR
---------------------------------------
*/

function getSelector(element) {

  if (element.id) {
    return '#' + element.id;
  }

  let path = [];

  while (element.parentElement) {

    let tag = element.tagName.toLowerCase();

    let siblings = Array.from(element.parentElement.children)
      .filter(e => e.tagName === element.tagName);

    if (siblings.length > 1) {
      tag += `:nth-child(${Array.from(element.parentElement.children).indexOf(element) + 1})`;
    }

    path.unshift(tag);

    element = element.parentElement;
  }

  return path.join(' > ');
}

/*
---------------------------------------
SAVE DATA
---------------------------------------
*/

function saveChange(selector, value) {

  chrome.storage.local.get(['changes'], (result) => {

    let changes = result.changes || {};

    changes[selector] = value;

    chrome.storage.local.set({
      changes: changes
    });

  });

}

/*
---------------------------------------
APPLY SAVED CHANGES
---------------------------------------
*/

function applySavedChanges() {

  chrome.storage.local.get(['changes'], (result) => {

    const changes = result.changes || {};

    Object.keys(changes).forEach((selector) => {

      const el = document.querySelector(selector);

      if (el) {
        el.innerText = changes[selector];
      }

    });

  });

}

/*
---------------------------------------
ENABLE EDITOR
---------------------------------------
*/

function enableEditor() {

  document.body.addEventListener('mouseover', mouseOverHandler);

  document.body.addEventListener('mouseout', mouseOutHandler);

  document.body.addEventListener('click', clickHandler, true);

}

/*
---------------------------------------
DISABLE EDITOR
---------------------------------------
*/

function disableEditor() {

  document.body.removeEventListener('mouseover', mouseOverHandler);

  document.body.removeEventListener('mouseout', mouseOutHandler);

  document.body.removeEventListener('click', clickHandler, true);

}

/*
---------------------------------------
MOUSE OVER
---------------------------------------
*/

function mouseOverHandler(e) {

  if (!editMode) return;

  e.target.classList.add('persistent-editor-highlight');

}

/*
---------------------------------------
MOUSE OUT
---------------------------------------
*/

function mouseOutHandler(e) {

  e.target.classList.remove('persistent-editor-highlight');

}

/*
---------------------------------------
CLICK TO EDIT
---------------------------------------
*/

function clickHandler(e) {

  if (!editMode) return;

  e.preventDefault();
  e.stopPropagation();

  const el = e.target;

  const oldValue = el.innerText;

  const newValue = prompt('Edit Text', oldValue);

  if (newValue !== null) {

    el.innerText = newValue;

    const selector = getSelector(el);

    saveChange(selector, newValue);

  }

}

/*
---------------------------------------
KEEP CHANGES AFTER DYNAMIC RENDER
---------------------------------------
*/

const observer = new MutationObserver(() => {
  applySavedChanges();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

/*
---------------------------------------
INITIAL LOAD
---------------------------------------
*/

window.addEventListener('load', () => {

  applySavedChanges();

  setTimeout(() => {
    applySavedChanges();
  }, 2000);

});