import { browser } from 'k6/browser';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  scenarios: {
    browser_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '0.5s', target: 3 },
        { duration: '0.5s', target: 6 },
        { duration: '0.5s', target: 9 },
        { duration: '0.5s', target: 12 },
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
              '--disable-backgrounding-occluded-windows',
            ],
          },
        },
      },
    },
  },
  thresholds: {
    browser_data_sent: ['rate>0'],
  },
};

const mapPageHits = new Counter('map_page_hits');
const statePageHits = new Counter('state_page_hits');
const stateFailures = new Counter('state_page_failures');

// Retry helper
async function tryGoto(page, url, retries = 3, delay = 1000) {
  let res = null;
  for (let i = 0; i < retries; i++) {
    try {
      res = await page.goto(url, {
        waitUntil: 'load', // More reliable than 'domcontentloaded'
        timeout: 60000,
      });

      if (res && res.status() === 200) {
        return res;
      }

    } catch (err) {
      console.warn(`Retry ${i + 1} failed for ${url}:`, err.message || err.toString());
    }
    await page.waitForTimeout(delay);
  }
  return res;
}

export default async function () {
  const page = await browser.newPage();

  // Capture browser console errors for debugging
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`Console error: ${msg.text()}`);
    }
  });

  try {
    // MAP PAGE
    mapPageHits.add(1);
    console.log('Loading map page...');
    const mapRes = await page.goto('https://paar.org.in/map', {
      waitUntil: 'load',
      timeout: 60000,
    });

    check(mapRes, {
      '✅ Map page loaded successfully': (r) => r !== null && r.status() === 200,
    });

    await page.waitForTimeout(2000);

    // STATE PAGE
    statePageHits.add(1);
    console.log('Loading state report page...');
    const stateRes = await tryGoto(page, 'https://paar.org.in/report?state=West%20Bengal');

    if (stateRes) {
      console.log('✅ stateRes status:', stateRes.status());
      console.log('✅ stateRes URL:', stateRes.url());

      check(stateRes, {
        '✅ State page loaded successfully': (r) => r !== null && r.status() === 200,
      });
    } else {
      stateFailures.add(1);
      console.error('❌ State page response is null after retries');
    }

    await page.waitForTimeout(2000);

  } catch (err) {
    console.error('❌ Error in test flow:', err.message || err.toString());
  } finally {
    await page.close();
  }
}