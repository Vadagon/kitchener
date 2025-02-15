/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/popup.css":
/*!***********************!*\
  !*** ./src/popup.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/popup.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _popup_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./popup.css */ "./src/popup.css");


document.addEventListener('DOMContentLoaded', () => {
  const authenticateBtn = document.getElementById('authenticateBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingPage = document.querySelector('.settingpage');
  const mainPage = document.querySelector('.mainpage');

  settingsBtn.addEventListener('click', () => {
    settingButtonClick();
  });
  var settingButtonClick = () => {
    settingPage.classList.toggle('active');
    mainPage.classList.toggle('active');
  };

  authenticateBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'authenticate' }, (response) => {
      if (response.error) {
        console.error('Authentication Error:', response.error);
      } else {
        console.log('Authenticated successfully');
      }
    });
  });

  getBasesList();
  getLastError();
  getLastCapturedRecords();


  function getBasesList() {
    chrome.runtime.sendMessage({ action: 'getBasesList' }, (response) => {
      if (response.error) {
        console.error('Error fetching bases list:', response.error);
      } else {
        displayBases(response.bases);
        const selectBoxes = document.querySelectorAll('.select-box');
        if (selectBoxes.length > 0) {
          selectBoxes[0].checked = true;
        }
      }
    });
  }

  function displayBases(bases) {
    console.log(12321)
    const squaresDiv = document.querySelector('.squares');
    bases.forEach(base => {
      const baseDiv = document.createElement('div');
      baseDiv.className = 'square';
      baseDiv.innerHTML = `
      <input type="checkbox" id="selectBox-${base.id}" class="select-box">
      <label for="selectBox-${base.id}" class="base-name">${base.name}</label>
    `;
      squaresDiv.appendChild(baseDiv);
    });
    if (bases.length) {
      settingButtonClick();
    }
  }

  function getLastError() {
    chrome.storage.local.get('error', (result) => {
      if (result.error) {
        console.error('Last Error:', result.error);
        const errorDiv = document.getElementById('error');
        errorDiv.innerText = result.error;
        chrome.storage.local.remove('error');
      }
    });
  }

  function getLastCapturedRecords() {
    chrome.storage.local.get('lastCapturedRecords', (result) => {
      console.log('result', result);
      if (result.lastCapturedRecords) {
        const now = new Date();
        const validRecords = result.lastCapturedRecords.filter(record => {
          console.log('sdsds', record.dateAdded)
          const recordDate = new Date(record.dateAdded);
          return (now - recordDate) < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        });

        displayCapturedRecords(validRecords);

        // Update local storage with valid records only
        chrome.storage.local.set({ lastCapturedRecords: validRecords });
      }else{
        displayCapturedRecords([])
      }
    });
  }

  function displayCapturedRecords(records) {
    const recordsDiv = document.querySelector('.records');
    recordsDiv.innerHTML = ''; // Clear previous records
    console.log('records', records)
    if (records.length === 0) {
      const noRecordsDiv = document.createElement('div');
      noRecordsDiv.className = 'no-records';
      noRecordsDiv.innerText = 'There are no updated orders yet';
      noRecordsDiv.style.textAlign = 'center';
      recordsDiv.appendChild(noRecordsDiv);
    } else {
      records.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).forEach(record => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'record';
        const recordDate = new Date(record.dateAdded);
        const now = new Date();
        const timeDifference = now - recordDate;
        let humanizedDate;

        if (timeDifference < 60 * 1000) {
          humanizedDate = `${Math.floor(timeDifference / 1000)} seconds ago`;
        } else if (timeDifference < 60 * 60 * 1000) {
          humanizedDate = `${Math.floor(timeDifference / (60 * 1000))} minutes ago`;
        } else if (timeDifference < 24 * 60 * 60 * 1000) {
          humanizedDate = `${Math.floor(timeDifference / (60 * 60 * 1000))} hours ago`;
        } else {
          humanizedDate = recordDate.toLocaleString();
        }
        console.log(record['Order Description']);
        const title = record['Order Description'] ?? ((Array.isArray(record.Booking_ID) && record.Booking_ID.length > 0) ? record.Booking_ID[0] : record.Booking_ID['Order ID']);
        const description =  record['Special Requests'] ?? record.Booking_ID['Order ID'];
        recordDiv.innerHTML = `
        <p class="record-title">${title}</p>
        <p class="record-description">${description}</p>
        <p class="record-date">${humanizedDate}</p>
      `;
        recordsDiv.appendChild(recordDiv);
      });
    }
  }

});
})();

/******/ })()
;
//# sourceMappingURL=popup.js.map