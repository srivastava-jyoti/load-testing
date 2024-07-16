import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

export let errorRate = new Counter('errors');

export let options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp-up to 10 users over 30 seconds
        { duration: '1m', target: 50 },  // Stay at 10 users for 1 minute
        { duration: '10s', target: 0 },  // Ramp-down to 0 users over 10 seconds
    ],
};

export default function () {
    let res = http.get('http://uat.paar.org.in/map');
    let success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response time is < 500ms': (r) => r.timings.duration < 500,
    });

    if (!success) {
        errorRate.add(1);
    }

    sleep(1);
}
