// Opens 2 states and then navigates to any prison and opens any RTI and applies filter

import { browser } from 'k6/experimental/browser';
import { check } from 'k6';

export const options = {
  scenarios: {
    west_bengal_users: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: 'chromium',
        },
      },
      exec: 'westBengalFlow',
    },
    maharashtra_users: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: 'chromium',
        },
      },
      exec: 'maharashtraFlow',
    },
  },
};

export async function westBengalFlow() {
  const page = browser.newPage();
  try {
    await page.goto('https://paar.org.in/map', { waitUntil: 'networkidle' });
    console.log('West Bengal User: Map page loaded');

    await page.goto('https://paar.org.in/report?state=West%20Bengal', { waitUntil: 'networkidle' });
    console.log('West Bengal User: Report page loaded');

    check(page, {
      'West Bengal report loaded': () =>
        page.url().includes('/report?state=West%20Bengal'),
    });

    await page.goto('https://paar.org.in/report?prison=Balurghat%20Central%20Correctional%20Home', { waitUntil: 'networkidle' });
    console.log('West Bengal User: Prison page loaded');

    check(page, {
      'Balurghat prison report loaded': () =>
        page.url().includes('prison=Balurghat%20Central%20Correctional%20Home'),
    });

  } finally {
    await page.close();
  }
}

export async function maharashtraFlow() {
  const page = browser.newPage();
  try {
    await page.goto('https://paar.org.in/map', { waitUntil: 'networkidle' });
    console.log('Maharashtra User: Map page loaded');

    await page.goto('https://paar.org.in/report?state=Maharashtra', { waitUntil: 'networkidle' });
    console.log('Maharashtra User: Report page loaded');

    check(page, {
      'Maharashtra report loaded': () =>
        page.url().includes('/report?state=Maharashtra'),
    });

    await page.goto('https://paar.org.in/report?prison=Parbhani%20District%20Prison', { waitUntil: 'networkidle' });
    console.log('Maharashtra User: Prison page loaded');

    check(page, {
      'Parbhani prison report loaded': () =>
        page.url().includes('prison=Parbhani%20District%20Prison'),
    });

  } finally {
    await page.close();
  }
}
