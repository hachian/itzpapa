/**
 * Obsidian Callout Plugin Test Suite
 * Tests for basic callout recognition and conversion
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

// Test suite
const tests = [
  {
    name: 'Basic callout recognition - [!note]',
    input: `> [!note]
> This is a note callout`,
    expected: {
      contains: ['class="callout callout-note"', 'This is a note callout'],
      notContains: ['blockquote']
    }
  },
  {
    name: 'All 11 callout types',
    types: ['note', 'tip', 'info', 'warning', 'danger', 'success', 'question', 'failure', 'bug', 'example', 'quote'],
    testEach: true
  },
  {
    name: 'Custom title support',
    input: `> [!warning] Important Warning
> Be careful with this operation`,
    expected: {
      contains: ['Important Warning', 'Be careful with this operation', 'class="callout callout-warning"'],
      notContains: ['[!warning']
    }
  },
  {
    name: 'Foldable callout - expanded (+)',
    input: `> [!tip]+
> This callout starts expanded`,
    expected: {
      contains: ['class="callout callout-tip callout-foldable"', 'details', 'summary'],
      notContains: ['class="callout-folded"']
    }
  },
  {
    name: 'Foldable callout - collapsed (-)',
    input: `> [!info]-
> This callout starts collapsed`,
    expected: {
      contains: ['class="callout callout-info callout-foldable callout-folded"', 'details', 'summary'],
    }
  },
  {
    name: 'Invalid callout type defaults to note',
    input: `> [!invalid]
> Content here`,
    expected: {
      contains: ['class="callout callout-note"', 'Content here'],
      notContains: ['callout-invalid']
    }
  },
  {
    name: 'Normal blockquote unchanged',
    input: `> This is a normal blockquote
> without callout syntax`,
    expected: {
      contains: ['<blockquote>', 'This is a normal blockquote'],
      notContains: ['class="callout"']
    }
  },
  {
    name: 'Empty callout',
    input: `> [!note]`,
    expected: {
      contains: ['class="callout callout-note"'],
      notContains: ['undefined', 'null']
    }
  },
  {
    name: 'Callout with multiline content',
    input: `> [!warning]
> Line 1
> Line 2
> Line 3`,
    expected: {
      contains: ['Line 1', 'Line 2', 'Line 3', 'class="callout callout-warning"']
    }
  },
  {
    name: 'Case insensitive callout type',
    input: `> [!NOTE]
> Capital letters`,
    expected: {
      contains: ['class="callout callout-note"', 'Capital letters']
    }
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Running Obsidian Callout Plugin Tests\n');
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    // Handle test groups
    if (test.testEach) {
      for (const type of test.types) {
        const input = `> [!${type}]\n> Test content for ${type}`;
        try {
          const output = await processMarkdown(input);
          
          if (output.includes(`class="callout callout-${type}"`) && output.includes(`Test content for ${type}`)) {
            console.log(`✅ ${test.name}: ${type}`);
            passed++;
          } else {
            console.log(`❌ ${test.name}: ${type}`);
            failures.push(`${test.name}: ${type} - Missing expected class or content`);
            failed++;
          }
        } catch (error) {
          console.log(`❌ ${test.name}: ${type} - Error: ${error.message}`);
          failures.push(`${test.name}: ${type} - ${error.message}`);
          failed++;
        }
      }
      continue;
    }

    // Handle individual tests
    try {
      const output = await processMarkdown(test.input);
      let testPassed = true;
      let failureReason = '';

      // Check expected contains
      if (test.expected.contains) {
        for (const expectedStr of test.expected.contains) {
          if (!output.includes(expectedStr)) {
            testPassed = false;
            failureReason = `Missing expected: "${expectedStr}"`;
            break;
          }
        }
      }

      // Check expected not contains
      if (testPassed && test.expected.notContains) {
        for (const unexpectedStr of test.expected.notContains) {
          if (output.includes(unexpectedStr)) {
            testPassed = false;
            failureReason = `Found unexpected: "${unexpectedStr}"`;
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
        
        // Debug output for failed tests
        if (process.env.DEBUG) {
          console.log('   Input:', test.input);
          console.log('   Output:', output.substring(0, 200));
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failures.push(`${test.name} - ${error.message}`);
      failed++;
    }
  }

  // Summary
  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${passed + failed}`);
  
  if (failures.length > 0) {
    console.log('\n❌ Failed Tests:');
    failures.forEach(failure => console.log(`   - ${failure}`));
  }

  // Return exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Execute tests
runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});