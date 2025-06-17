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
      { duration: '1s', target: 5 },
      { duration: '1s', target: 10 },
      { duration: '1s', target: 15 },
      { duration: '1s', target: 20 },
      { duration: '2s', target: 30 },
      { duration: '30s', target: 30 },
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
    const mapRes = await page.goto('https://coloredcow.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    check(mapRes, {
      'Home page loaded successfully': (r) => r !== null && r.status() === 200,
    });

    await page.waitForTimeout(2000);

    // STATE PAGE (reuse same page)
    statePageHits.add(1);
    const stateRes = await page.goto('https://coloredcow.com/career/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    check(stateRes, {
      'Career page loaded successfully': (r) => r !== null && r.status() === 200,
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
