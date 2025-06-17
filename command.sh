K6_BROWSER_EXECUTABLE_PATH=/usr/bin/chromium K6_BROWSER_HEADLESS=true xvfb-run -a k6 run page-load-test.js

K6_BROWSER_EXECUTABLE_PATH=/usr/bin/chromium K6_BROWSER_HEADLESS=true xvfb-run -a k6 run coloredcow-page-load-test.js
