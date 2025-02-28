'use strict';

const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Initialize a ticker every 0.3 seconds
setInterval(() => {
  // Check for H2 element with text 'Hot Order Items' or 'Cold Order Items'
  const h2Elements = document.querySelectorAll('h2');
  let found = false;
  h2Elements.forEach(h2 => {
    if (h2.textContent.includes('Hot Order Items') || h2.textContent.includes('Cold Order Items')) {
      found = true;
    }
  });

  if (!found) {
    return;
  }
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
        orderIdDiv.style.height = '0';
        orderIdDiv.style.overflow = 'hidden';
      }
    });

    // Change content of .ml1-and-quarter to the sum
    const elements = container.querySelectorAll('.ml1-and-quarter');
    elements.forEach(element => {
      element.textContent = sum.toString();
    });
  });
}, 300);

