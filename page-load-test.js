import { browser } from 'k6/browser';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  scenarios: {
    browser_load: {
      // executor: 'per-vu-iterations',
      // vus: 24,
      // iterations: 1,
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '0.5s', target: 3 },
        { duration: '0.5', target: 6 },
        { duration: '0.5', target: 9 },
        { duration: '0.5', target: 12 },
        { duration: '1s', target: 16 },
        { duration: '60s', target: 16 },
      ],
      gracefulRampDown: '5s',
      options: {
        browser: {
          type: 'chromium',
          launchOptions: {
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-gpu',
              '--disable-dev-shm-usage',
              '--no-first-run',
              '--disable-background-timer-throttling',
              '--disable-renderer-backgrounding',
              '--disable-backgrounding-occluded-windows'
            ],
          },
        },
      },
    },
  },
  thresholds: {
    browser_data_sent: ['rate>0'],
    // checks: ['rate>0.8'],
  },
};

const mapPageHits = new Counter('map_page_hits');
const statePageHits = new Counter('state_page_hits');

export default async function () {
  const page = await browser.newPage();

  try {
    // MAP PAGE
    mapPageHits.add(1);
    const mapRes = await page.goto('https://paar.org.in/map', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    check(mapRes, {
      'Map page loaded successfully': (r) => r !== null && r.status() === 200,
    });
    console.log('After mapResponse..........', mapRes);

    await page.waitForTimeout(2000);

    // STATE PAGE (reuse same page)
    statePageHits.add(1);
    const stateRes = await page.goto('https://paar.org.in/report?state=West%20Bengal', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    if (stateRes) {
      console.log('stateRes status....', await stateRes.status());
      console.log('stateRes ok....', await stateRes.ok());
      console.log('stateRes url....', await stateRes.url());
      console.log('stateRes headers....', await stateRes.headers());
      console.log('stateRes text....', await stateRes.text());
    } else {
      console.log('inside else statement........', await stateRes)
    }

    check(stateRes, {
      'State page loaded successfully': (r) => r !== null && r.status() === 200,
    });

    check(stateRes, {
      '❌ State page not loaded successfully': (r) => r === null || r.status() !== 200,
    });

    await page.waitForTimeout(2000);

  } catch (err) {
    console.log('Log error in test flow:', err.message || err.toString());
    console.error('Error in test flow:', err.message || err.toString());
  } finally {
    await page.close();
  }
}
