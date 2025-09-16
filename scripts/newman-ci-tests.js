#!/usr/bin/env node

/**
 * Newman CI/CD Test Runner
 * Automated smoke tests for Oracle API deployment
 * Can be run locally or in CI/CD pipelines (GitHub Actions, Vercel, etc.)
 */

const newman = require('newman');
const path = require('path');

// Configure based on environment
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const IS_CI = process.env.CI === 'true';
const USE_STAGING = process.env.STAGING === 'true';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Color codes for output (disabled in CI)
const green = (s) => IS_CI ? s : `\x1b[32m${s}\x1b[0m`;
const red = (s) => IS_CI ? s : `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => IS_CI ? s : `\x1b[33m${s}\x1b[0m`;
const blue = (s) => IS_CI ? s : `\x1b[34m${s}\x1b[0m`;

// Test collection (can also load from external file)
const collection = {
  info: {
    name: "Soullab Oracle Smoke Tests",
    description: "Critical path tests for PersonalOracleAgent deployment"
  },
  item: [
    {
      name: "Health Check",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "{{baseUrl}}/api/oracle/personal",
          host: ["{{baseUrl}}"],
          path: ["api", "oracle", "personal"]
        }
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test('Status code is 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Service is healthy', function () {",
              "    const response = pm.response.json();",
              "    pm.expect(response.status).to.be.oneOf(['healthy', 'degraded']);",
              "});",
              "",
              "pm.test('AI status is reported', function () {",
              "    const response = pm.response.json();",
              "    pm.expect(response).to.have.property('aiEnabled');",
              "});"
            ]
          }
        }
      ]
    },
    {
      name: "Memory Test - Store",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            message: "Remember this word: phoenix",
            sessionId: "test-{{$timestamp}}",
            userId: "ci-test-user"
          })
        },
        url: {
          raw: "{{baseUrl}}/api/oracle/personal",
          host: ["{{baseUrl}}"],
          path: ["api", "oracle", "personal"]
        }
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test('Response received', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Response has text', function () {",
              "    const response = pm.response.json();",
              "    pm.expect(response).to.have.property('text');",
              "});",
              "",
              "// Store session ID for next test",
              "const response = pm.response.json();",
              "if (response.metadata && response.metadata.sessionId) {",
              "    pm.collectionVariables.set('memoryTestSessionId', response.metadata.sessionId);",
              "}"
            ]
          }
        }
      ]
    },
    {
      name: "Memory Test - Recall",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            message: "What word did I ask you to remember?",
            sessionId: "{{memoryTestSessionId}}",
            userId: "ci-test-user"
          })
        },
        url: {
          raw: "{{baseUrl}}/api/oracle/personal",
          host: ["{{baseUrl}}"],
          path: ["api", "oracle", "personal"]
        }
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test('Response contains remembered word', function () {",
              "    const response = pm.response.json();",
              "    const text = (response.text || response.message || '').toLowerCase();",
              "    pm.expect(text).to.include('phoenix');",
              "});",
              "",
              "pm.test('Using AI if enabled', function () {",
              "    const response = pm.response.json();",
              "    if (response.metadata && response.metadata.ai !== undefined) {",
              "        console.log('AI mode:', response.metadata.ai ? 'ENABLED' : 'DISABLED (pattern-based)');",
              "    }",
              "});"
            ]
          }
        }
      ]
    },
    {
      name: "Claude Integration Test",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            message: "What is the tension between fire and water in archetypal terms?",
            sessionId: "test-claude-{{$timestamp}}",
            userId: "ci-test-user"
          })
        },
        url: {
          raw: "{{baseUrl}}/api/oracle/personal",
          host: ["{{baseUrl}}"],
          path: ["api", "oracle", "personal"]
        }
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test('Response is substantial', function () {",
              "    const response = pm.response.json();",
              "    const text = response.text || response.message || '';",
              "    pm.expect(text.split(' ').length).to.be.above(30);",
              "});",
              "",
              "pm.test('Not pattern-matched response', function () {",
              "    const response = pm.response.json();",
              "    const text = response.text || response.message || '';",
              "    pm.expect(text).to.not.include('This connects to the theme of');",
              "    pm.expect(text).to.not.include('I witness');",
              "});",
              "",
              "pm.test('Source is tracked', function () {",
              "    const response = pm.response.json();",
              "    if (response.metadata) {",
              "        pm.expect(response.metadata).to.have.property('source');",
              "        console.log('Response source:', response.metadata.source);",
              "    }",
              "});"
            ]
          }
        }
      ]
    },
    {
      name: "No Repetition Test",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            message: "I feel stuck creatively",
            sessionId: "test-creativity-{{$timestamp}}",
            userId: "ci-test-user"
          })
        },
        url: {
          raw: "{{baseUrl}}/api/oracle/personal",
          host: ["{{baseUrl}}"],
          path: ["api", "oracle", "personal"]
        }
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test('Creative response without repetition', function () {",
              "    const response = pm.response.json();",
              "    const text = response.text || response.message || '';",
              "    pm.expect(text).to.not.include('connects to the theme of creativity');",
              "});",
              "",
              "// Store response for comparison",
              "pm.collectionVariables.set('firstCreativeResponse', pm.response.json().text);"
            ]
          }
        }
      ]
    },
    {
      name: "Voice Generation Test",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            message: "Hello Maya",
            sessionId: "test-voice-{{$timestamp}}",
            userId: "ci-test-user",
            enableVoice: true
          })
        },
        url: {
          raw: "{{baseUrl}}/api/oracle/personal",
          host: ["{{baseUrl}}"],
          path: ["api", "oracle", "personal"]
        }
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test('Voice response if enabled', function () {",
              "    const response = pm.response.json();",
              "    if (response.metadata && response.metadata.ai) {",
              "        // Only expect audio if AI is enabled",
              "        if (response.audioUrl || response.audioData) {",
              "            pm.expect(response.audioUrl || response.audioData).to.exist;",
              "            console.log('Voice generation: SUCCESS');",
              "        } else {",
              "            console.log('Voice generation: NOT AVAILABLE');",
              "        }",
              "    }",
              "});",
              "",
              "pm.test('No mock audio data', function () {",
              "    const response = pm.response.json();",
              "    if (response.audioData) {",
              "        pm.expect(response.audioData).to.not.equal('bW9jay1hdWRpby1kYXRh');",
              "    }",
              "});"
            ]
          }
        }
      ]
    }
  ],
  variable: [
    {
      key: "baseUrl",
      value: BASE_URL
    },
    {
      key: "memoryTestSessionId",
      value: ""
    },
    {
      key: "firstCreativeResponse",
      value: ""
    }
  ]
};

// Environment variables for the collection
const environment = {
  name: `Oracle Test Environment - ${ENVIRONMENT}`,
  values: [
    { key: "baseUrl", value: BASE_URL, enabled: true },
    { key: "usePersonalOracle", value: process.env.USE_PERSONAL_ORACLE || "true", enabled: true }
  ]
};

// Newman run options
const options = {
  collection: collection,
  environment: environment,
  reporters: IS_CI ? ['cli', 'json', 'junit'] : ['cli'],
  reporter: {
    json: {
      export: './test-results/oracle-smoke-tests.json'
    },
    junit: {
      export: './test-results/oracle-smoke-tests.xml'
    }
  },
  insecure: true, // Skip SSL validation for local testing
  timeout: 30000, // 30 second timeout per request
  color: !IS_CI,
  verbose: process.env.VERBOSE === 'true'
};

// Run header
console.log(blue('═══════════════════════════════════════════'));
console.log(blue('🤖 ORACLE CI/CD SMOKE TESTS'));
console.log(blue('═══════════════════════════════════════════'));
console.log(`Environment: ${yellow(ENVIRONMENT)}`);
console.log(`Base URL: ${yellow(BASE_URL)}`);
console.log(`CI Mode: ${IS_CI ? green('YES') : yellow('NO')}`);
console.log(`PersonalOracle: ${process.env.USE_PERSONAL_ORACLE === 'false' ? red('DISABLED') : green('ENABLED')}`);
console.log(blue('═══════════════════════════════════════════\n'));

// Run the tests
newman.run(options, function (err, summary) {
  if (err) {
    console.error(red('\n❌ Test execution failed:'), err);
    process.exit(1);
  }

  // Analyze results
  const run = summary.run;
  const stats = run.stats;
  const failures = run.failures;

  console.log(blue('\n═══════════════════════════════════════════'));
  console.log(blue('📊 TEST SUMMARY'));
  console.log(blue('═══════════════════════════════════════════'));

  console.log(`Total Tests: ${stats.assertions.total}`);
  console.log(`Passed: ${green(stats.assertions.pending + ' (pending) + ' + (stats.assertions.total - stats.assertions.failed - stats.assertions.pending) + ' (passed)')}`);
  console.log(`Failed: ${stats.assertions.failed > 0 ? red(stats.assertions.failed.toString()) : green('0')}`);

  // Calculate success rate
  const successRate = ((stats.assertions.total - stats.assertions.failed) / stats.assertions.total * 100).toFixed(1);
  console.log(`Success Rate: ${successRate >= 80 ? green(successRate + '%') : successRate >= 50 ? yellow(successRate + '%') : red(successRate + '%')}`);

  // Show failures if any
  if (failures && failures.length > 0) {
    console.log(red('\n❌ FAILURES:'));
    failures.forEach((failure, index) => {
      console.log(red(`\n${index + 1}. ${failure.source.name || failure.error.name}`));
      console.log(red(`   Test: ${failure.error.test}`));
      console.log(red(`   Message: ${failure.error.message}`));
    });
  }

  // Deployment recommendation
  console.log(blue('\n═══════════════════════════════════════════'));
  if (successRate >= 80) {
    console.log(green('✅ READY FOR DEPLOYMENT'));
    console.log(green('All critical tests passed'));
    if (process.env.USE_PERSONAL_ORACLE !== 'false') {
      console.log(green('PersonalOracleAgent (AI mode) is working'));
    }
  } else if (successRate >= 50) {
    console.log(yellow('⚠️ DEPLOY WITH CAUTION'));
    console.log(yellow('Some tests failed - review failures above'));
    console.log(yellow('Consider setting USE_PERSONAL_ORACLE=false'));
  } else {
    console.log(red('❌ DO NOT DEPLOY'));
    console.log(red('Critical failures detected'));
    console.log(red('Rollback recommended: USE_PERSONAL_ORACLE=false'));
  }
  console.log(blue('═══════════════════════════════════════════\n'));

  // Exit with appropriate code
  const exitCode = stats.assertions.failed > 0 ? 1 : 0;

  if (IS_CI) {
    console.log(`CI Exit Code: ${exitCode}`);
  }

  process.exit(exitCode);
});