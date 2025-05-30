// Opens any particular state and then navigates to any prison and opens any RTI

import { browser } from 'k6/experimental/browser';
import { check } from 'k6';

export const options = {
  scenarios: {
    ui_test: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
      iterations: 1,
    },
  },
};

export default async function () {
  const page = browser.newPage();

  try {
    await page.goto('https://paar.org.in/map', { waitUntil: 'networkidle' });
    console.log('Map page loaded');

    await page.goto('https://paar.org.in/report?state=West%20Bengal', { waitUntil: 'networkidle' });
    console.log('West Bengal report page loaded');

    let success = check(page, {
      'Loaded West Bengal report page': () =>
        page.url().includes('/report?state=West%20Bengal'),
    });

    if (success) {
      console.log('Successfully opened West Bengal report page!');
    } else {
      console.error('Failed to open West Bengal report page.');
    }

    // Navigate to Balurghat Central Correctional Home report page
    await page.goto('https://paar.org.in/report?prison=Balurghat%20Central%20Correctional%20Home', { waitUntil: 'networkidle' });
    console.log('Balurghat Central Correctional Home report page loaded');

    success = check(page, {
      'Loaded Balurghat Central Correctional Home report page': () =>
        page.url().includes('prison=Balurghat%20Central%20Correctional%20Home'),
    });

    if (success) {
      console.log('Successfully opened Balurghat Central Correctional Home report page!');
    } else {
      console.error('Failed to open Balurghat Central Correctional Home report page.');
    }

  } finally {
    await page.close();
  }
}
