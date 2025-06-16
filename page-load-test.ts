import { browser } from 'k6/browser';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  scenarios: {
    browser_load: {
    //   executor: 'per-vu-iterations',
    //   vus: 40,
    //   iterations: 1,
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '3s', target: 3 },
      { duration: '3s', target: 6 },
      { duration: '3s', target: 9 },
      { duration: '3s', target: 12 },
      { duration: '5s', target: 18 },
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

    await page.waitForTimeout(2000);

    // STATE PAGE (reuse same page)
    statePageHits.add(1);
    const stateRes = await page.goto('https://paar.org.in/report?state=Uttarakhand', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    check(stateRes, {
      'State page loaded successfully': (r) => r !== null && r.status() === 200,
    });

    await page.waitForTimeout(2000);

    // // PRISON PAGE (reuse same page)
    // const prisonRes = await page.goto('https://www.paar.org.in/report?prison=District%20Jail%20Pauri', {
    //     waitUntil: 'domcontentloaded',
    //     timeout: 60000,
    //   });

    //   check(prisonRes, {
    //     'Prison page loaded successfully': (r) => r !== null && r.status() === 200,
    //   });

    //   await page.waitForTimeout(2000);

  } catch (err) {
    console.error('Error in test flow:', err.message || err.toString());
  } finally {
    await page.close();
  }
}
