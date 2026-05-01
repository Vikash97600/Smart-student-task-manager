import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Simple test runner - run after seeding data and starting server
const runTests = async () => {
  console.log('🧪 Cognitive Load System - API Tests\n');
  console.log('Make sure the server is running on port 5000 and data is seeded.\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${err.message}`);
      failed++;
    }
  };

  // Test 1: Health check
  await test('Health endpoint', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (res.data.status !== 'OK') throw new Error('Status not OK');
  });

  // Test 2: Get cognitive load (requires auth - will fail without token)
  // You need to set AUTH_TOKEN in request or use cookie-based auth
  // This is a placeholder
  await test('Cognitive load endpoint (requires auth)', async () => {
    try {
      await axios.get(`${API_BASE}/activity/load`);
      // If we get here without auth error, it's unexpected
      throw new Error('Expected auth failure or proper auth required');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Expected: auth required
      } else {
        throw err;
      }
    }
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log('\nNote: Full integration tests require authentication.');
  console.log('Please test manually with authenticated requests.\n');
  console.log('Manual test steps:');
  console.log('1. Login as test@example.com');
  console.log('2. GET /api/activity/load should return OVERLOADED (score > 8)');
  console.log('3. Click "Take Break" and verify response recorded');
  console.log('4. Check settings toggle works');
};

runTests().catch(console.error);
