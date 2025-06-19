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
        { duration: '3', target: 32 },
        { duration: '120s', target: 32 },
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

const homePageHits = new Counter('home_page_hits');
const homePageFailures = new Counter('home_page_failures');
const careerPageHits = new Counter('career_page_hits');
const careerPageFailures = new Counter('career_page_failures');
const internshipPageHits = new Counter('internship_page_hits');
const internshipPageFailures = new Counter('internship_page_failures');

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
    // Home page
    homePageHits.add(1);
    const homeRes = await tryGoto(page, 'https://coloredcow.com');

    check(homeRes, {
      '✅ Home page loaded successfully': (r) => r !== null && r.status() < 400,
    });
    if (homeRes) {
      console.log('✅ homeRes status:', homeRes.status());
      console.log('✅ homeRes URL:', homeRes.url());
    } else {
      homePageFailures.add(1);
      console.error('❌ Home page response is null after retries');
    }

    // Career page
    careerPageHits.add(1);
    const careerRes = await tryGoto(page, 'https://coloredcow.com/career/');

    check(careerRes, {
      '✅ Career page loaded successfully': (r) => r !== null && r.status() < 400,
    });
    if (careerRes) {
      console.log('✅ careerRes status:', careerRes.status());
      console.log('✅ careerRes URL:', careerRes.url());
    } else {
      careerPageFailures.add(1);
      console.error('❌ Career page response is null after retries');
    }

    // Internship page
    internshipPageHits.add(1);
    const intershipRes = await tryGoto(page, 'https://coloredcow.com/internship/');

    check(intershipRes, {
      '✅ Internship page loaded successfully': (r) => r !== null && r.status() < 400,
    });
    if (intershipRes) {
      console.log('✅ intershipRes status:', intershipRes.status());
      console.log('✅ intershipRes URL:', intershipRes.url());
    } else {
      internshipPageFailures.add(1);
      console.error('❌ Internship page response is null after retries');
    }

  } catch (err) {
    console.error('❌ Error in test flow:', err.message || err.toString());
  } finally {
    await page.close();
  }
}
