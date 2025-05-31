import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

export const successfulUsers = new Counter('successful_users');
export const failedUsers = new Counter('failed_users');

export const options = {
  scenarios: {
    west_bengal_users: {
      executor: 'shared-iterations',
      vus: 5,
      iterations: 5,
      exec: 'westBengalFlow',
      options: {
        browser: { type: 'chromium' },
      },
    },
    maharashtra_users: {
      executor: 'shared-iterations',
      vus: 5,
      iterations: 5,
      exec: 'maharashtraFlow',
      options: {
        browser: { type: 'chromium' },
      },
    },
  },
};

export async function westBengalFlow() {
  const page = await browser.newPage();
  try {
    await page.goto('https://paar.org.in/map', { waitUntil: 'networkidle' });
    console.log('West Bengal User: Map page loaded');

    await page.goto('https://paar.org.in/report?state=West%20Bengal', { waitUntil: 'networkidle' });
    const stateCheck = check(page, {
      'West Bengal report loaded': () =>
        page.url().includes('/report?state=West%20Bengal'),
    });

    await sleep(10);

    await page.goto('https://paar.org.in/report?prison=Balurghat%20Central%20Correctional%20Home', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    const prisonCheck = check(page, {
      'Balurghat prison report loaded': () =>
        page.url().includes('prison=Balurghat%20Central%20Correctional%20Home'),
    });

    if (stateCheck && prisonCheck) {
      successfulUsers.add(1);
    } else {
      failedUsers.add(1);
    }

  } catch (err) {
    console.error('Error in westBengalFlow:', err.message || err.toString());
    failedUsers.add(1);
  } finally {
    await page.close();
  }
}

export async function maharashtraFlow() {
  const page = await browser.newPage();
  try {
    await page.goto('https://paar.org.in/map', { waitUntil: 'networkidle' });
    console.log('Maharashtra User: Map page loaded');

    await page.goto('https://paar.org.in/report?state=Maharashtra', { waitUntil: 'networkidle' });
    const stateCheck = check(page, {
      'Maharashtra report loaded': () =>
        page.url().includes('/report?state=Maharashtra'),
    });

    await sleep(10);

    await page.goto('https://paar.org.in/report?prison=Parbhani%20District%20Prison', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    const prisonCheck = check(page, {
      'Parbhani prison report loaded': () =>
        page.url().includes('prison=Parbhani%20District%20Prison'),
    });

    if (stateCheck && prisonCheck) {
      successfulUsers.add(1);
    } else {
      failedUsers.add(1);
    }

  } catch (err) {
    console.error('Error in maharashtraFlow:', err.message || err.toString());
    failedUsers.add(1);
  } finally {
    await page.close();
  }
}
