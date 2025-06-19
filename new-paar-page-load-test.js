import { browser } from 'k6/browser';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
  cloud: {
    distribution: {
      'amazon:in:mumbai': { loadZone: 'amazon:in:mumbai', percent: 100 },
    },
  },
  scenarios: {
    browser_load: {
      // executor: 'per-vu-iterations',
      // vus: 1,
      // iterations: 1,
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3s', target: 16 },
        // { duration: '3', target: 32 },
        { duration: '120s', target: 16 },
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
const mapPageFailures = new Counter('map_page_failures');
const statePageHits = new Counter('state_page_hits');
const statePageFailures = new Counter('state_page_failures');
const prisonPageHits = new Counter('prison_page_hits');
const prisonPageFailures = new Counter('prison_page_failures');

// Retry helper
async function tryGoto(page, url, retries = 1, delay = 4000) {
  let res = null;
  for (let i = 0; i < retries; i++) {
    try {
      res = await page.goto(url, {
        waitUntil: 'domcontentloaded', // More reliable than 'domcontentloaded'
        timeout: 5000,
      });
      await page.waitForSelector('#COVID-19', { timeout: 2000 });

      if (res && res.status() < 400) {
        await page.waitForTimeout(delay);
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
    const mapRes = await tryGoto(page, 'https://new.paar.org.in/map');

    check(mapRes, {
      '✅ Map page loaded successfully': (r) => r !== null && r.status() < 400,
    });
    if (mapRes) {
      console.log('✅ mapRes status:', mapRes.status());
      console.log('✅ mapRes URL:', mapRes.url());
    } else {
      mapPageFailures.add(1);
      console.error('❌ State page response is null after retries');
    }

    // STATE PAGE
    statePageHits.add(1);
    const stateRes = await tryGoto(page, 'https://new.paar.org.in/report?state=West%20Bengal');

    check(stateRes, {
      '✅ State page loaded successfully': (r) => r !== null && r.status() < 400,
    });
    if (stateRes) {
      console.log('✅ stateRes status:', stateRes.status());
      console.log('✅ stateRes URL:', stateRes.url());
    } else {
      statePageFailures.add(1);
      console.error('❌ State page response is null after retries');
    }

    // PRISON PAGE
    prisonPageHits.add(1);
    const prisonRes = await tryGoto(page, 'https://new.paar.org.in/report?prison=Dum%20Dum%20Central%20Correctional%20Home');

    check(prisonRes, {
      '✅ Prison page loaded successfully': (r) => r !== null && r.status() < 400,
    });
    if (prisonRes) {
      console.log('✅ prisonRes status:', prisonRes.status());
      console.log('✅ prisonRes URL:', prisonRes.url());
    } else {
      prisonPageFailures.add(1);
      console.error('❌ Prison page response is null after retries');
    }

  } catch (err) {
    console.error('❌ Error in test flow:', err.message || err.toString());
  } finally {
    await page.close();
  }
}
