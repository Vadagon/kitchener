import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  const authenticateBtn = document.getElementById('authenticateBtn');
  const selectBox = document.getElementById('selectBox');
  const appDiv = document.querySelector('.app');

  authenticateBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'authenticate' }, (response) => {
      if (response.error) {
        console.error('Authentication Error:', response.error);
      } else {
        console.log('Authenticated successfully');
      }
    });
  });

  // selectBox.addEventListener('change', () => {
  //   if (selectBox.checked) {
  //     getBasesList();
  //   }
  // });

  getBasesList();
  getLastError();
});

function getBasesList() {
  chrome.runtime.sendMessage({ action: 'getBasesList' }, (response) => {
    console.log(response);
    if (response.error) {
      console.error('Error fetching bases list:', response.error);
    } else {
      console.log(response);
      displayBases(response.bases);
      const selectBoxes = document.querySelectorAll('.select-box');
      if (selectBoxes.length > 0) {
        selectBoxes[0].checked = true;
        // authenticateBtn.style.display = 'none';
      } else {
        // authenticateBtn.style.display = 'block';
      }
    }
  });
}

function displayBases(bases) {
  const appDiv = document.querySelector('.app');
  bases.forEach(base => {
    const baseDiv = document.createElement('div');
    baseDiv.className = 'square';
    baseDiv.innerHTML = `
        <input type="checkbox" id="selectBox-${base.id}" class="select-box">
        <label for="selectBox-${base.id}" class="base-name">${base.name}</label>
      `;
    appDiv.appendChild(baseDiv);
  });
}

function getLastError() {
  chrome.storage.local.get('error', (result) => {
    if (result.lastError) {
      console.error('Last Error:', result.lastError);
      const errorDiv = document.getElementById('error');
      errorDiv.innerText = result.lastError;
    }
  });
}
