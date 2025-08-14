/**
 * Callout Security Test Suite
 * Tests for XSS prevention and security measures in callouts
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeCallout from '../src/plugins/rehype-callout/index.js';

// Test helper to process markdown with callout plugin
async function processMarkdown(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCallout)
    .use(rehypeStringify)
    .process(markdown);
  
  return result.toString();
}

// Security test suite
const securityTests = [
  {
    name: 'XSS prevention in callout title',
    input: `> [!note] <script>alert('XSS')</script> Malicious Title\n> Content here.`,
    expected: {
      notContains: ['<script>', 'alert(', 'javascript:'],
      contains: ['&lt;script&gt;', 'Malicious Title']
    }
  },
  {
    name: 'XSS prevention in callout content',
    input: `> [!warning] Security Test\n> <script>alert('XSS in content')</script>\n> More content.`,
    expected: {
      notContains: ['<script>', 'alert('],
      contains: ['&lt;script&gt;']
    }
  },
  {
    name: 'Iframe injection prevention',
    input: `> [!danger] <iframe src="javascript:alert('XSS')"></iframe>\n> Dangerous content`,
    expected: {
      notContains: ['<iframe', 'javascript:'],
      contains: ['&lt;iframe']
    }
  },
  {
    name: 'Event handler injection prevention',
    input: `> [!note] <div onclick="alert('XSS')" onload="malicious()">Test</div>\n> Content`,
    expected: {
      notContains: ['onclick=', 'onload=', 'alert('],
      contains: ['&lt;div']
    }
  },
  {
    name: 'CSS injection prevention',
    input: `> [!tip] <style>body{background:url('javascript:alert(1)')}</style>\n> Style injection test`,
    expected: {
      notContains: ['<style>', 'javascript:'],
      contains: ['&lt;style&gt;']
    }
  },
  {
    name: 'Object/embed injection prevention',
    input: `> [!warning] <object data="javascript:alert('XSS')"></object>\n> Object injection test`,
    expected: {
      notContains: ['<object', 'javascript:'],
      contains: ['&lt;object']
    }
  },
  {
    name: 'Data URI XSS prevention',
    input: `> [!note] <img src="data:text/html,<script>alert('XSS')</script>">\n> Data URI test`,
    expected: {
      notContains: ['data:text/html', '<script'],
      contains: ['&lt;img']
    }
  },
  {
    name: 'SVG XSS prevention',
    input: `> [!danger] <svg onload="alert('XSS')"><script>alert('SVG XSS')</script></svg>\n> SVG injection test`,
    expected: {
      notContains: ['<svg', 'onload=', '<script'],
      contains: ['&lt;svg']
    }
  },
  {
    name: 'Meta refresh injection prevention',
    input: `> [!warning] <meta http-equiv="refresh" content="0;url=javascript:alert('XSS')">\n> Meta injection test`,
    expected: {
      notContains: ['<meta', 'javascript:', 'http-equiv'],
      contains: ['&lt;meta']
    }
  },
  {
    name: 'Link javascript: prevention',
    input: `> [!note] [Click me](javascript:alert('XSS'))\n> Malicious link test`,
    expected: {
      notContains: ['href="javascript:', 'alert('],
      // Note: This depends on how the markdown processor handles malicious links
      testManually: true
    }
  },
  {
    name: 'Form injection prevention',
    input: `> [!tip] <form action="javascript:alert('XSS')"><input type="submit"></form>\n> Form injection test`,
    expected: {
      notContains: ['<form', 'javascript:', 'action='],
      contains: ['&lt;form']
    }
  },
  {
    name: 'Nested HTML tags in title',
    input: `> [!note] <div><span><strong>Nested</strong></span></div> Title\n> Content`,
    expected: {
      notContains: ['<div><span>'],
      contains: ['&lt;div&gt;&lt;span&gt;', 'Title']
    }
  },
  {
    name: 'HTML entity in malicious context',
    input: `> [!warning] &#60;script&#62;alert('XSS')&#60;/script&#62;\n> Entity-encoded script`,
    expected: {
      // These should be safe as they're already entities
      contains: ['&#60;script&#62;'],
      notContains: ['<script>']
    }
  },
  {
    name: 'SQL injection-like content (should be safe)',
    input: `> [!note] '; DROP TABLE users; --\n> SQL injection test content`,
    expected: {
      contains: ["'; DROP TABLE users; --"],
      notContains: []
    }
  },
  {
    name: 'Unicode normalization attack',
    input: `> [!danger] \u003cscript\u003ealert('Unicode XSS')\u003c/script\u003e\n> Unicode attack test`,
    expected: {
      notContains: ['<script>', 'alert('],
      contains: ['Unicode XSS'] // Content should be escaped
    }
  }
];

// Run security tests
async function runSecurityTests() {
  console.log('🔒 Running Callout Security Tests\n');
  let passed = 0;
  let failed = 0;
  const failures = [];
  const warnings = [];

  for (const test of securityTests) {
    try {
      const output = await processMarkdown(test.input);
      let testPassed = true;
      let failureReason = '';

      // Skip manual tests for now
      if (test.expected.testManually) {
        console.log(`⚠️  ${test.name} (manual verification required)`);
        warnings.push(test.name);
        continue;
      }

      // Check that dangerous content is NOT present
      if (test.expected.notContains) {
        for (const dangerousStr of test.expected.notContains) {
          if (output.includes(dangerousStr)) {
            testPassed = false;
            failureReason = `SECURITY RISK: Found dangerous content: "${dangerousStr}"`;
            break;
          }
        }
      }

      // Check that safe content IS present
      if (test.expected.contains) {
        for (const safeStr of test.expected.contains) {
          if (!output.includes(safeStr)) {
            testPassed = false;
            failureReason = `Missing expected safe content: "${safeStr}"`;
            break;
          }
        }
      }

      if (testPassed) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        failures.push(`${test.name} - ${failureReason}`);
        failed++;
        
        if (process.env.DEBUG) {
          console.log('   Output preview:', output.substring(0, 200));
          console.log('   Full output:', output);
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failures.push(`${test.name} - ${error.message}`);
      failed++;
    }
  }

  return { passed, failed, failures, warnings };
}

// Additional security checks
async function runSecurityChecks() {
  console.log('\n🔍 Running Additional Security Checks...\n');
  
  const checks = [
    {
      name: 'Large payload handling',
      test: async () => {
        const largePayload = 'A'.repeat(100000);
        const input = `> [!note] ${largePayload}\n> Content`;
        const output = await processMarkdown(input);
        return output.length > 0; // Should not crash
      }
    },
    {
      name: 'Deeply nested HTML prevention',
      test: async () => {
        const nestedHtml = Array(100).fill('<div>').join('') + 'content' + Array(100).fill('</div>').join('');
        const input = `> [!warning] ${nestedHtml}\n> Test`;
        const output = await processMarkdown(input);
        return !output.includes('<div><div><div>'); // Should be escaped
      }
    },
    {
      name: 'Null byte handling',
      test: async () => {
        const input = `> [!note] Test\x00null\n> Content\x00more`;
        const output = await processMarkdown(input);
        return output.length > 0; // Should handle null bytes gracefully
      }
    }
  ];

  let checksPassed = 0;
  let checksFailed = 0;

  for (const check of checks) {
    try {
      const result = await check.test();
      if (result) {
        console.log(`✅ ${check.name}`);
        checksPassed++;
      } else {
        console.log(`❌ ${check.name}`);
        checksFailed++;
      }
    } catch (error) {
      console.log(`❌ ${check.name} - Error: ${error.message}`);
      checksFailed++;
    }
  }

  return { checksPassed, checksFailed };
}

// Main test runner
async function runAllTests() {
  const securityResults = await runSecurityTests();
  const checksResults = await runSecurityChecks();
  
  // Summary
  console.log('\n📊 Security Test Results:');
  console.log(`   Security Tests Passed: ${securityResults.passed}`);
  console.log(`   Security Tests Failed: ${securityResults.failed}`);
  console.log(`   Warnings: ${securityResults.warnings.length} (manual verification)`);
  console.log(`   Security Checks Passed: ${checksResults.checksPassed}`);
  console.log(`   Security Checks Failed: ${checksResults.checksFailed}`);
  
  if (securityResults.failures.length > 0) {
    console.log('\n🚨 SECURITY ISSUES FOUND:');
    securityResults.failures.forEach(failure => console.log(`   - ${failure}`));
  }

  if (securityResults.warnings.length > 0) {
    console.log('\n⚠️  Manual Verification Required:');
    securityResults.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  // Return exit code - fail if any security tests failed
  const totalFailed = securityResults.failed + checksResults.checksFailed;
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Execute tests
runAllTests().catch(error => {
  console.error('Security test runner failed:', error);
  process.exit(1);
});