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

    // Wait for the map to fully load
    await page.waitForTimeout(5000);

    // ✅ Click Maharashtra marker using x, y coordinates
    await page.mouse.click(22.9868, 87.8550);  // 👈 Replace with your actual coordinates
    console.log('Clicked Maharashtra marker');

    // Wait for the pop-up to appear
    const maharashtraLink = page.locator('a.link-style[href="/report?state=Maharashtra"]');
    await maharashtraLink.waitFor({ state: 'visible', timeout: 10000 });

    await maharashtraLink.click();
    console.log('Clicked link in pop-up');

    check(page, {
      'Navigated to Maharashtra report': () =>
        page.url().includes('/report?state=Maharashtra'),
    });

  } finally {
    page.close();
  }
}
