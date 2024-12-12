'use strict';

const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Initialize a ticker every 0.3 seconds
setInterval(() => {
  // Iterate over every stacksContainer > div
  const stacksContainers = document.querySelectorAll('.stacksContainer > div > div');
  stacksContainers.forEach(container => {
    // Initialize sum for the current container
    let sum = 0;

    // Iterate over each .kanbanCardContainer inside the container
    const kanbanCardContainers = container.querySelectorAll('.kanbanCardContainer');
    kanbanCardContainers.forEach(card => {
      // Look for a div with title='Quantity'
      const quantityDiv = card.querySelector('div[title="Quantity"]');
      if (quantityDiv) {
        // Get the number from the next block
        const nextBlock = quantityDiv.nextElementSibling;
        if (nextBlock) {
          const number = parseFloat(nextBlock.textContent);
          if (!isNaN(number)) {
            sum += number;
          }
        }
      }

      // Look for divs with title='Order ID' and remove their parent
      const orderIdDiv = card.querySelector('div[role="heading"]');
      if (orderIdDiv) {
        orderIdDiv.style.display = 'none';
      }
    });

    // Change content of .ml1-and-quarter to the sum
    const elements = container.querySelectorAll('.ml1-and-quarter');
    elements.forEach(element => {
      element.textContent = sum.toString();
    });
  });
}, 300);

