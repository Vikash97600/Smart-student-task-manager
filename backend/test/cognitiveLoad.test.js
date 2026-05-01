/**
 * Cognitive Load Detection System - Test & Documentation
 * 
 * This file documents the cognitive load detection logic with test scenarios
 * and provides an in-memory calculation test.
 * 
 * Run: node backend/test/cognitiveLoad.test.js
 */

// In-memory calculation function (extracted from controller for testing)
function calculateCognitiveLoadScore({ hardTaskStreak, taskSwitches, delayFactor, sensitivity = 1.0 }) {
  const score = (hardTaskStreak * 2) + (taskSwitches * 1.5) + (delayFactor * 2);
  const normalThreshold = 5 * sensitivity;
  const overloadedThreshold = 8 * sensitivity;
  
  let state;
  if (score < normalThreshold) state = 'NORMAL';
  else if (score < overloadedThreshold) state = 'MODERATE';
  else state = 'OVERLOADED';
  
  return { score, state };
}

// Test scenarios from the specification
const testScenarios = [
  {
    name: 'Normal Load',
    inputs: { hardTaskStreak: 0, taskSwitches: 1, delayFactor: 1.0 },
    expectedState: 'NORMAL',
    expectedScore: 3.5
  },
  {
    name: 'Moderate - Task Switching',
    inputs: { hardTaskStreak: 1, taskSwitches: 3, delayFactor: 1.2 },
    expectedState: 'MODERATE',
    expectedScore: 6.9
  },
  {
    name: 'Overloaded - Hard Streak',
    inputs: { hardTaskStreak: 3, taskSwitches: 1, delayFactor: 1.8 },
    expectedState: 'OVERLOADED',
    expectedScore: 11.1
  },
  {
    name: 'Overloaded - Too Many Switches',
    inputs: { hardTaskStreak: 0, taskSwitches: 5, delayFactor: 1.0 },
    expectedState: 'OVERLOADED',
    expectedScore: 9.5
  },
  {
    name: 'Sensitivity Adjustment Test',
    inputs: { hardTaskStreak: 2, taskSwitches: 2, delayFactor: 1.2, sensitivity: 0.8 },
    expectedState: 'OVERLOADED', // Lower threshold (5*0.8=4, 8*0.8=6.4) -> score=6.6 -> MODERATE actually, let's verify
    // score = 4+3+2.4=9.4, but with sensitivity 0.8 thresholds: normal<4, moderate[4,6.4), overloaded>=6.4 => 9.4 >6.4 => OVERLOADED
    expectedScore: 9.4
  },
];

// Run tests
console.log('🧠 Cognitive Load System - Unit Tests\n');
console.log('=' .repeat(50));

let passed = 0;
let failed = 0;

for (const scenario of testScenarios) {
  const { inputs, expectedState, expectedScore, name } = scenario;
  const result = calculateCognitiveLoadScore(inputs);
  
  const stateMatch = result.state === expectedState;
  const scoreMatch = Math.abs(result.score - expectedScore) < 0.01;
  
  if (stateMatch && scoreMatch) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    console.log(`   Expected: ${expectedState} (score ${expectedScore})`);
    console.log(`   Got:      ${result.state} (score ${result.score})`);
    failed++;
  }
}

console.log('=' .repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

// Print overview
console.log('📋 SYSTEM OVERVIEW\n');
console.log('Signals:');
console.log('  1. Hard Task Streak (# consecutive hard tasks)');
console.log('  2. Task Switches (# of switches in last 30 min)');
console.log('  3. Delay Factor (actualDuration / expectedDuration avg)\n');
console.log('Formula: score = (hardTaskStreak * 2) + (taskSwitches * 1.5) + (delayFactor * 2)\n');
console.log('Thresholds:');
console.log('  NORMAL     → score < 5 × sensitivity');
console.log('  MODERATE   → 5 ≤ score < 8 × sensitivity');
console.log('  OVERLOADED → score ≥ 8 × sensitivity\n');
console.log('Auto-Adjustment:');
console.log('  - Tracks user responses to suggestions');
console.log('  - Adjusts sensitivity: less responsive → more sensitive');
console.log('  - Range: [0.5, 1.5]\n');
console.log('Endpoints:');
console.log('  POST /api/activity/log       - Start a task');
console.log('  POST /api/activity/complete  - Finish a task');
console.log('  POST /api/activity/switch    - Record task switch');
console.log('  GET  /api/activity/load      - Get current load');
console.log('  GET  /api/activity/history   - Get activity history');
console.log('  POST /api/activity/response  - Record suggestion response');
console.log('  GET/PUT /api/activity/settings - Manage settings\n');

process.exit(failed > 0 ? 1 : 0);
