import { browser } from 'k6/browser';
import { check, sleep } from 'k6';

function randomSleep(minSeconds = 2, maxSeconds = 6) {
  const duration = Math.random() * (maxSeconds - minSeconds) + minSeconds;
  sleep(duration);
}

export const options = {
  scenarios: {
    ui_test: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 10,
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export default async function () {
  const page = await browser.newPage();

  async function safeGoto(url) {
    // Increase timeout to 2 minutes (120000 ms)
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
        return true;
      } catch (e) {
        console.warn(`Navigation to ${url} failed on attempt ${attempt + 1}: ${e.message}`);
        attempt++;
        if (attempt === maxRetries) throw e;
        // Wait a bit before retrying
        sleep(5);
      }
    }
  }

  try {
    await safeGoto('https://paar.org.in/map');
    console.log('Map page loaded');
    randomSleep(3, 7);

    // await safeGoto('https://paar.org.in/report?state=West%20Bengal');
    // console.log('West Bengal report page loaded');
    // check(page, { 'Loaded West Bengal report page': () => page.url().includes('/report?state=West%20Bengal') });
    // randomSleep(4, 8);

    // await safeGoto('https://paar.org.in/report?prison=Balurghat%20Central%20Correctional%20Home');
    // console.log('Balurghat Central Correctional Home report page loaded');
    // check(page, { 'Loaded Balurghat Central Correctional Home report page': () =>
    //   page.url().includes('prison=Balurghat%20Central%20Correctional%20Home') });
    // randomSleep(5, 10);

  } catch (err) {
    console.error('Error during user flow:', err.message || err.toString());
  } finally {
    await page.close();
  }
}
