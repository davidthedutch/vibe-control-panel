#!/usr/bin/env node

/**
 * Test script for health checks
 * Run with: node test-health-checks.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Health Checks API\n');

  try {
    // Test 1: Run health checks
    console.log('1️⃣  Running health checks...');
    const runResult = await makeRequest('/api/health/run', 'POST');

    if (runResult.status === 200) {
      console.log('✅ Health checks completed successfully');
      console.log(`   Overall Score: ${runResult.data.overallScore}`);
      console.log(`   Checks: ${runResult.data.checks.length}`);

      // Show check results
      runResult.data.checks.forEach((check) => {
        const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
        console.log(`   ${icon} ${check.name}: ${check.score} (${check.status})`);
      });
    } else {
      console.log('❌ Health checks failed:', runResult.status);
    }

    console.log('');

    // Test 2: Get history
    console.log('2️⃣  Fetching history...');
    const historyResult = await makeRequest('/api/health/history?days=7');

    if (historyResult.status === 200) {
      console.log('✅ History fetched successfully');
      console.log(`   Entries: ${historyResult.data.history.length}`);
    } else {
      console.log('❌ Failed to fetch history:', historyResult.status);
    }

    console.log('');

    // Test 3: Get notifications
    console.log('3️⃣  Fetching notifications...');
    const notifResult = await makeRequest('/api/health/notifications');

    if (notifResult.status === 200) {
      console.log('✅ Notifications fetched successfully');
      console.log(`   Total: ${notifResult.data.notifications.length}`);
      const unread = notifResult.data.notifications.filter(n => !n.read).length;
      console.log(`   Unread: ${unread}`);
    } else {
      console.log('❌ Failed to fetch notifications:', notifResult.status);
    }

    console.log('');

    // Test 4: Get config
    console.log('4️⃣  Fetching configuration...');
    const configResult = await makeRequest('/api/health/config');

    if (configResult.status === 200) {
      console.log('✅ Configuration fetched successfully');
      console.log(`   Enabled: ${configResult.data.enabled}`);
      console.log(`   Notify on fail: ${configResult.data.notifyOnFail}`);
      console.log(`   Notify on warn: ${configResult.data.notifyOnWarn}`);
    } else {
      console.log('❌ Failed to fetch config:', configResult.status);
    }

    console.log('\n✨ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n⚠️  Make sure the dev server is running on http://localhost:3000');
    console.log('   Run: npm run dev');
  }
}

// Run tests if server is available
console.log('Checking if server is running...\n');
makeRequest('/api/health/history')
  .then(() => runTests())
  .catch(() => {
    console.error('❌ Cannot connect to server at http://localhost:3000');
    console.log('\n⚠️  Please start the dev server first:');
    console.log('   cd apps/web');
    console.log('   npm run dev');
    process.exit(1);
  });
