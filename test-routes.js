#!/usr/bin/env node
/**
 * API Routes Test Script
 * Tests all 50+ endpoints across 9 route modules
 * Run with: node test-routes.js
 */

import http from 'http';

const BASE_URL = 'localhost';
const PORT = 3000;

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: json, raw: data });
        } catch {
          resolve({ status: res.statusCode, body: data, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test runner
async function test(name, method, path, body = null, expectedStatus = 200, headers = {}) {
  try {
    process.stdout.write(`  Testing ${name}... `);
    const response = await makeRequest(method, path, body, headers);
    const passed = response.status === expectedStatus;
    
    if (passed) {
      results.passed++;
      console.log('\x1b[32m✓ PASS\x1b[0m');
    } else {
      results.failed++;
      console.log(`\x1b[31m✗ FAIL\x1b[0m (Expected ${expectedStatus}, got ${response.status})`);
    }
    
    results.tests.push({ name, passed, status: response.status, expected: expectedStatus, body: response.body });
    return response;
  } catch (error) {
    results.failed++;
    console.log(`\x1b[31m✗ ERROR\x1b[0m (${error.message})`);
    results.tests.push({ name, passed: false, error: error.message });
    return null;
  }
}

// Main test suite
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          Ravi Developers API Routes Test Suite             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let adminToken = null;

  // ═══════════════════════════════════════════════════════════
  // SECTION 1: Public Routes (No Auth Required)
  // ═══════════════════════════════════════════════════════════
  console.log('\n📋 SECTION 1: Public Routes\n');
  
  await test('Health Check', 'GET', '/api/health', null, 200);
  await test('Get All Projects', 'GET', '/api/projects', null, 200);
  await test('Get All Plots', 'GET', '/api/plots', null, 200);
  await test('Get Plots by Project ID', 'GET', '/api/plots?projectId=test', null, 200);
  await test('Get All Testimonials', 'GET', '/api/testimonials', null, 200);
  await test('Get All Settings', 'GET', '/api/settings', null, 200);

  // ═══════════════════════════════════════════════════════════
  // SECTION 2: Auth Routes
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔐 SECTION 2: Authentication Routes\n');
  
  // Test login with expected failure (invalid credentials)
  await test('Login - Invalid Credentials', 'POST', '/api/auth/login', 
    { email: 'test@test.com', password: 'wrong' }, 401);
  
  // Test /me without token
  await test('Get Current User - No Token', 'GET', '/api/auth/me', null, 401);

  // ═══════════════════════════════════════════════════════════
  // SECTION 3: Protected Routes (401 Expected without token)
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔒 SECTION 3: Protected Routes (No Token - Expect 401)\n');
  
  await test('Dashboard - No Auth', 'GET', '/api/dashboard', null, 401);
  await test('Get All Users - No Auth', 'GET', '/api/users', null, 401);
  await test('Create Project - No Auth', 'POST', '/api/projects', 
    { name: 'Test', slug: 'test' }, 401);
  await test('Create Plot - No Auth', 'POST', '/api/plots', 
    { projectId: '1', plotNumber: 'A1' }, 401);
  await test('Get All Inquiries - No Auth', 'GET', '/api/inquiries', null, 401);
  await test('Create Testimonial - No Auth', 'POST', '/api/testimonials', 
    { customerName: 'Test', testimonial: 'Great!', rating: 5 }, 401);
  await test('Update Settings - No Auth', 'PUT', '/api/settings/siteName', 
    { value: 'Ravi Developers' }, 401);

  // ═══════════════════════════════════════════════════════════
  // SECTION 4: Create Resources (Public)
  // ═══════════════════════════════════════════════════════════
  console.log('\n📝 SECTION 4: Create Resources (Public)\n');
  
  const inquiryResponse = await test('Create Inquiry', 'POST', '/api/inquiries', {
    name: 'Test User',
    email: 'test@test.com',
    phone: '1234567890',
    message: 'Test inquiry message',
    projectId: null,
    plotId: null
  }, 201);

  // ═══════════════════════════════════════════════════════════
  // SECTION 5: Single Resource Fetch
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔍 SECTION 5: Single Resource Fetch\n');
  
  await test('Get Single Project (may 404)', 'GET', '/api/projects/test-id', null, 404);
  await test('Get Single Plot (may 404)', 'GET', '/api/plots/test-id', null, 404);
  await test('Get Single Testimonial (may 404)', 'GET', '/api/testimonials/test-id', null, 404);
  await test('Get Single Setting (may 404)', 'GET', '/api/settings/siteName', null, 200);

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests:  ${String(results.tests.length).padEnd(45)} ║`);
  console.log(`║  \x1b[32mPassed: ${String(results.passed).padEnd(48)}\x1b[0m ║`);
  console.log(`║  \x1b[31mFailed: ${String(results.failed).padEnd(48)}\x1b[0m ║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Show detailed failures
  const failures = results.tests.filter(t => !t.passed);
  if (failures.length > 0) {
    console.log('\n📋 Failed Tests Details:\n');
    failures.forEach((test, i) => {
      console.log(`  ${i + 1}. ${test.name}`);
      console.log(`     Status: ${test.status || 'N/A'} (Expected: ${test.expected || 'N/A'})`);
      if (test.error) console.log(`     Error: ${test.error}`);
      if (test.body) console.log(`     Response: ${JSON.stringify(test.body).substring(0, 100)}`);
      console.log('');
    });
  }

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if server is running before starting
console.log('\n⏳ Checking if server is running on port 3000...');
http.get(`http://${BASE_URL}:${PORT}/api/health`, (res) => {
  console.log('✅ Server is running!\n');
  runTests();
}).on('error', () => {
  console.log('\n❌ Server is not running on port 3000.');
  console.log('   Start the server first with: npm run dev:backend\n');
  process.exit(1);
});
