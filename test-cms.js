#!/usr/bin/env node
/**
 * CMS API Test Script
 * Tests all new CMS endpoints
 */

import http from 'http';

const BASE_URL = 'localhost';
const PORT = 3000;

const results = { passed: 0, failed: 0, tests: [] };

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, method, path, body = null, expectedStatus = 200) {
  try {
    process.stdout.write(`  ${name}... `);
    const response = await makeRequest(method, path, body);
    const passed = response.status === expectedStatus;
    
    if (passed) {
      results.passed++;
      console.log('\x1b[32m✓ PASS\x1b[0m');
    } else {
      results.failed++;
      console.log(`\x1b[31m✗ FAIL\x1b[0m (Expected ${expectedStatus}, got ${response.status})`);
    }
    results.tests.push({ name, passed, status: response.status });
    return response;
  } catch (error) {
    results.failed++;
    console.log(`\x1b[31m✗ ERROR\x1b[0m (${error.message})`);
    return null;
  }
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║            CMS API Routes Test Suite                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // ═══════════════════════════════════════════════════════════
  // SECTIONS API TESTS
  // ═══════════════════════════════════════════════════════════
  console.log('\n📄 SECTION 1: Sections API\n');
  
  const sections = await test('Get All Sections', 'GET', '/api/sections');
  await test('Get Home Page Sections', 'GET', '/api/sections/page/home');
  await test('Get About Page Sections', 'GET', '/api/sections/page/about');
  
  // Test if sections exist
  if (sections?.body?.length > 0) {
    const firstId = sections.body[0].id;
    await test('Get Single Section', 'GET', `/api/sections/${firstId}`);
  }

  // ═══════════════════════════════════════════════════════════
  // THEME API TESTS
  // ═══════════════════════════════════════════════════════════
  console.log('\n🎨 SECTION 2: Theme API\n');
  
  await test('Get Theme Settings', 'GET', '/api/theme');

  // ═══════════════════════════════════════════════════════════
  // NAVIGATION API TESTS
  // ═══════════════════════════════════════════════════════════
  console.log('\n🧭 SECTION 3: Navigation API\n');
  
  await test('Get Navigation (Public)', 'GET', '/api/navigation');

  // ═══════════════════════════════════════════════════════════
  // SEO API TESTS
  // ═══════════════════════════════════════════════════════════
  console.log('\n🔍 SECTION 4: SEO API\n');
  
  await test('Get All SEO Settings', 'GET', '/api/seo');
  await test('Get Home Page SEO', 'GET', '/api/seo/page/home');

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Total:  ${String(results.tests.length).padEnd(45)} ║`);
  console.log(`║  \x1b[32mPassed: ${String(results.passed).padEnd(48)}\x1b[0m ║`);
  console.log(`║  \x1b[31mFailed: ${String(results.failed).padEnd(48)}\x1b[0m ║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Check server
http.get(`http://${BASE_URL}:${PORT}/api/health`, (res) => {
  console.log('✅ Server is running!\n');
  runTests();
}).on('error', () => {
  console.log('❌ Server not running on port 3000');
  process.exit(1);
});
