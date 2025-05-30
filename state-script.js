import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

export let errorRate = new Counter('errors');

export let options = {
    stages: [
        { duration: '1', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
    ],
};

export default function () {
    let res = http.get('https://paar.org.in/report?state=West%20Bengal');
    let success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response time is < 500ms': (r) => r.timings.duration < 500,
    });

    if (!success) {
        errorRate.add(1);
    }

    sleep(1);
}
