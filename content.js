// helpers.js content here
function safeGetTitleFromLastContainer(container, selector) {
  const element = container.querySelector(selector);
  if (element) {
    let text = element.getAttribute('title'); // Get the 'title' attribute
    return text.replace(/,/g, '').trim(); // Remove commas
  } else {
    console.error(`Element not found for selector: ${selector}`);
    return null;
  }
}

function getStat(current, previous) {
  if (!isNaN(current) && !isNaN(previous) && previous !== 0) {
    const percentageChange = ((current - previous) / previous) * 100;
    
    // If percentageChange is greater than 100, return without decimals
    if (Math.abs(percentageChange) > 100) {
      return percentageChange.toFixed(0); // No decimal points
    } else {
      return percentageChange.toFixed(2); // Keep two decimal points otherwise
    }
  }
  return "N/A"; // In case of an issue
}


function getAbsoluteChange(current, previous) {
  if (!isNaN(current) && !isNaN(previous)) {
    const absoluteChange = (current - previous);
    return absoluteChange.toFixed(2);
  }
  return "N/A"; // In case of an issue
}

// ui.js content here
function styledHTML(value, isGood) {
  const arrow = isGood ? '▲' : '▼';  // Use arrow symbols for good and bad changes
  const indicatorColor = isGood ? 'lightseagreen' : 'darkred';  // Green for positive, Red for negative

  return `
    <div class="m10vVd">
      <div class="kZiHV">
        <span class="nnLLaf CJvxcd">
          ${value} <span style="color: ${indicatorColor}; font-weight: bold;">${arrow}</span>
        </span>
      </div>
      <div class="zhJ3J" title="Change">Change</div>
    </div>
  `;
}

function insertValuesIntoPage(container, clicksChange, impressionsChange, ctrChange, positionChange) {
  const clicksElement = container.querySelector('div[data-label="CLICKS"] .m10vVd:nth-child(3) .zhJ3J');
  const impressionsElement = container.querySelector('div[data-label="IMPRESSIONS"] .m10vVd:nth-child(3) .zhJ3J');
  const ctrElement = container.querySelector('div[data-label="CTR"] .m10vVd:nth-child(3) .zhJ3J');
  const positionElement = container.querySelector('div[data-label="POSITION"] .m10vVd:nth-child(3) .zhJ3J');

  if (clicksElement) {
    clicksElement.insertAdjacentHTML('beforeend', styledHTML(`${clicksChange}%`, clicksChange >= 0));
  }
  if (impressionsElement) {
    impressionsElement.insertAdjacentHTML('beforeend', styledHTML(`${impressionsChange}%`, impressionsChange >= 0));
  }
  if (ctrElement) {
    ctrElement.insertAdjacentHTML('beforeend', styledHTML(`${ctrChange}%`, ctrChange >= 0));
  }
  if (positionElement) {
    positionElement.insertAdjacentHTML('beforeend', styledHTML(`${positionChange}`, positionChange <= 0));  
  }
}

// main.js content here
// Debugging added to the retryLoadData function
function retryLoadData(retries = 5, delay = 1000) {
  console.log(`retryLoadData called. Retries left: ${retries}`);

  if (retries === 0) {
    console.error('Failed to find elements after multiple retries.');
    return;
  }

  // Get the last `.AaD0rc` container
  const lastContainer = getLastAaD0rc();
  if (!lastContainer) {
    console.error("No last container found. Aborting.");
    return;
  }

  // Select the values from the last set of cards within the last `.AaD0rc`
  const totalClicksCurrent = parseInt(safeGetTitleFromLastContainer(lastContainer, 'div[data-label="CLICKS"] .m10vVd:nth-child(2) .nnLLaf'));
  const totalClicksPrevious = parseInt(safeGetTitleFromLastContainer(lastContainer, 'div[data-label="CLICKS"] .m10vVd:nth-child(3) .nnLLaf'));
  const impressionsCurrent = parseInt(safeGetTitleFromLastContainer(lastContainer, 'div[data-label="IMPRESSIONS"] .m10vVd:nth-child(2) .nnLLaf'));
  const impressionsPrevious = parseInt(safeGetTitleFromLastContainer(lastContainer, 'div[data-label="IMPRESSIONS"] .m10vVd:nth-child(3) .nnLLaf'));
  const ctrCurrent = parseFloat(safeGetTitleFromLastContainer(lastContainer, 'div[data-label="CTR"] .m10vVd:nth-child(2) .nnLLaf'));
  const ctrPrevious = parseFloat(safeGetTitleFromLastContainer(lastContainer, 'div[data-label="CTR"] .m10vVd:nth-child(3) .nnLLaf'));
  const positionCurrent = parseFloat(safeGetTitleFromLastContainer(lastContainer, 'div[data-label="POSITION"] .m10vVd:nth-child(2) .nnLLaf'));
  const positionPrevious = parseFloat(safeGetTitleFromLastContainer(lastContainer, 'div[data-label="POSITION"] .m10vVd:nth-child(3) .nnLLaf'));

  // Debugging logs for all the values being fetched
  console.log('Total Clicks Current:', totalClicksCurrent);
  console.log('Total Clicks Previous:', totalClicksPrevious);
  console.log('Impressions Current:', impressionsCurrent);
  console.log('Impressions Previous:', impressionsPrevious);
  console.log('CTR Current:', ctrCurrent);
  console.log('CTR Previous:', ctrPrevious);
  console.log('Position Current:', positionCurrent);
  console.log('Position Previous:', positionPrevious);

  // Check if we have valid data; if not, retry
  if (isNaN(totalClicksCurrent) || isNaN(impressionsCurrent) || isNaN(ctrCurrent) || isNaN(positionCurrent)) {
    console.log(`Invalid data. Retrying... Attempts left: ${retries - 1}`);
    setTimeout(() => retryLoadData(retries - 1, delay), delay);
    return;
  }

  // Calculate changes
  const clicksChange = getStat(totalClicksCurrent, totalClicksPrevious);
  const impressionsChange = getStat(impressionsCurrent, impressionsPrevious);
  const ctrChange = getAbsoluteChange(ctrCurrent, ctrPrevious);
  const positionChange = getAbsoluteChange(positionCurrent, positionPrevious);

  console.log('Clicks Change:', clicksChange);
  console.log('Impressions Change:', impressionsChange);
  console.log('CTR Change:', ctrChange);
  console.log('Position Change:', positionChange);

  // Insert calculated changes into the page
  insertValuesIntoPage(lastContainer, clicksChange, impressionsChange, ctrChange, positionChange);

  console.log("I reached here! Finished recalculating and inserting values.");
}

// Function to target the last `.AaD0rc` container
function getLastAaD0rc() {
  const containers = document.querySelectorAll('.AaD0rc');
  if (containers.length > 0) {
    return containers[containers.length - 1]; // Return the last one
  } else {
    console.error("No '.AaD0rc' container found on the page.");
    return null;
  }
}

// URL Change Detection
let previousUrl = window.location.href;

// Helper function to get URL query parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    compareDate: params.get('compare_date'),
    numOfMonths: params.get('num_of_months'),
    numOfDays: params.get('num_of_days'),
    resourceID: params.get('resource_id')
  };
}

// Function to check if 'compare_date' is present in the URL
function shouldRunScript() {
  const { compareDate } = getUrlParams();
  return compareDate !== null;  // Returns true if 'compare_date' is present
}

// Store initial relevant URL parameters for comparison
let previousParams = getUrlParams();

// Check if compare_date, num_of_months, or num_of_days has changed
function shouldRecalculate() {
  const currentParams = getUrlParams();
  
  // Check if any of the relevant parameters have changed
  if (
    currentParams.compareDate !== previousParams.compareDate ||
    currentParams.numOfMonths !== previousParams.numOfMonths ||
    currentParams.numOfDays !== previousParams.numOfDays ||
    currentParams.resourceID !== previousParams.resourceID
  ) {
    previousParams = currentParams; // Update stored parameters
    return true; // Recalculate if any of these parameters have changed
  }
  return false;
}

// Function to detect URL changes and rerun the script if needed
function detectUrlChange() {
  const currentUrl = window.location.href;
  
  if (currentUrl !== previousUrl) {
    console.log('URL changed:', currentUrl);
    previousUrl = currentUrl;

    // Only recalculate if the relevant parameters have changed
    if (shouldRecalculate()) {
      console.log('Detected relevant URL change. Waiting for 3-4 seconds before recalculating...');
      
      // Wait for 3-4 seconds before recalculating to ensure data is populated
      setTimeout(() => {
        retryLoadData();  // Recalculate after delay
      }, 4000);  // 3.5 seconds delay
    }
  }
}

// Set an interval to check the URL every second
setInterval(detectUrlChange, 1000);

// Initial check and run the script if compare_date is present
if (shouldRunScript()) {
  retryLoadData();
}

