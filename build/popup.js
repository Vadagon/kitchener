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

})();

/******/ })()
;
//# sourceMappingURL=popup.js.map