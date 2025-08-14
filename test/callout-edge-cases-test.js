/**
 * Callout Edge Cases Test Suite
 * Tests for edge cases and error handling in callouts
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

// Edge case test suite
const edgeCaseTests = [
  {
    name: 'Empty callout',
    input: `> [!note]`,
    expected: {
      contains: ['class="callout callout-note"'],
      notContains: []
    }
  },
  {
    name: 'Callout with only whitespace',
    input: `> [!note]   \n>    \n>   `,
    expected: {
      contains: ['class="callout callout-note"'],
      notContains: []
    }
  },
  {
    name: 'Invalid callout type defaults to note',
    input: `> [!invalid-type] Custom Title\n> This should default to note type.`,
    expected: {
      contains: ['class="callout callout-note"', 'Custom Title'],
      notContains: ['callout-invalid-type']
    }
  },
  {
    name: 'Case insensitive callout type',
    input: `> [!WARNING] Uppercase Warning\n> This should work with uppercase.`,
    expected: {
      contains: ['class="callout callout-warning"', 'Uppercase Warning'],
      notContains: []
    }
  },
  {
    name: 'Callout with special characters in title',
    input: `> [!note] Title with "quotes" and 'apostrophes' & symbols\n> Content here.`,
    expected: {
      contains: ['Title with &quot;quotes&quot;', 'apostrophes', '&amp; symbols'],
      notContains: []
    }
  },
  {
    name: 'Nested blockquote without callout syntax',
    input: `> [!note] Parent\n> > This is just a regular blockquote\n> > Not a callout`,
    expected: {
      contains: ['class="callout callout-note"', '<blockquote>'],
      notContains: []
    }
  },
  {
    name: 'Multiple spaces in callout declaration',
    input: `> [!note]    Multiple    Spaces    Title\n> Content here.`,
    expected: {
      contains: ['Multiple    Spaces    Title'],
      notContains: []
    }
  },
  {
    name: 'Callout with code block containing similar syntax',
    input: `> [!example] Code Example\n> \`\`\`markdown\n> > [!note] This is not a real callout\n> > It's just in a code block\n> \`\`\``,
    expected: {
      contains: ['<pre>', '<code', '[!note]'],
      notContains: ['class="callout callout-note"'] // Should not create nested callout
    }
  },
  {
    name: 'Very long callout title',
    input: `> [!note] ${Array(100).fill('Very').join(' ')} Long Title\n> Content here.`,
    expected: {
      contains: ['class="callout callout-note"', 'Very Very Very'],
      notContains: []
    }
  },
  {
    name: 'Callout with emoji in title',
    input: `> [!tip] 💡 Pro Tip with Emoji 🚀\n> This works with emojis.`,
    expected: {
      contains: ['💡 Pro Tip with Emoji 🚀'],
      notContains: []
    }
  },
  {
    name: 'Maximum nesting level (20 levels)',
    input: generateDeeplyNested(20),
    expected: {
      testNestDepth: 20,
      shouldStopAtMax: true
    }
  },
  {
    name: 'Beyond maximum nesting level (25 levels)',
    input: generateDeeplyNested(25),
    expected: {
      testNestDepth: 25,
      shouldStopAtMax: true,
      maxAllowed: 20
    }
  },
  {
    name: 'Mixed callout and regular blockquote',
    input: `> [!note] This is a callout
> Regular blockquote content
> 
> > [!tip] Nested callout
> > 
> > Regular nested blockquote`,
    expected: {
      contains: ['class="callout callout-note"', 'class="callout callout-tip"'],
      notContains: []
    }
  },
  {
    name: 'Callout with HTML entities',
    input: `> [!warning] Title with &lt;HTML&gt; entities\n> Content with &amp; entities.`,
    expected: {
      contains: ['&lt;HTML&gt;', '&amp; entities'],
      notContains: []
    }
  },
  {
    name: 'Foldable callout with complex content',
    input: `> [!example]+ Complex Foldable Example
> 
> This has **bold**, *italic*, and \`code\`.
> 
> - List item 1
> - List item 2
> 
> \`\`\`javascript
> console.log("code block");
> \`\`\``,
    expected: {
      contains: [
        'class="callout callout-example callout-foldable"',
        '<details',
        '<strong>bold</strong>',
        '<em>italic</em>',
        '<code>code</code>',
        '<ul>',
        '<pre>'
      ],
      notContains: []
    }
  }
];

// Helper to generate deeply nested callouts
function generateDeeplyNested(depth) {
  let markdown = '';
  for (let i = 1; i <= depth; i++) {
    const prefix = '> '.repeat(i);
    markdown += `${prefix}[!note] Level ${i}\n`;
  }
  return markdown;
}

// Performance test for large documents
async function performanceTest() {
  console.log('🚀 Running Performance Tests...\n');
  
  // Generate large document with many callouts
  const largeDocument = Array(100).fill(0).map((_, i) => 
    `> [!note] Callout ${i + 1}\n> Content for callout ${i + 1}\n`
  ).join('\n');
  
  const startTime = Date.now();
  await processMarkdown(largeDocument);
  const duration = Date.now() - startTime;
  
  console.log(`📈 Performance Test Result:`);
  console.log(`   Document size: 100 callouts`);
  console.log(`   Processing time: ${duration}ms`);
  console.log(`   Target: < 1000ms`);
  
  const passed = duration < 1000;
  console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  return passed;
}

// Run edge case tests
async function runEdgeCaseTests() {
  console.log('🧪 Running Callout Edge Cases Tests\n');
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of edgeCaseTests) {
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

      // Check expected notContains
      if (test.expected.notContains) {
        for (const notExpectedStr of test.expected.notContains) {
          if (output.includes(notExpectedStr)) {
            testPassed = false;
            failureReason = `Should not contain: "${notExpectedStr}"`;
            break;
          }
        }
      }

      // Check nesting depth
      if (test.expected.testNestDepth) {
        const nestLevelMatches = output.match(/data-nest-level="(\d+)"/g);
        if (test.expected.shouldStopAtMax) {
          const maxLevel = test.expected.maxAllowed || 20;
          if (nestLevelMatches) {
            const maxNestLevel = Math.max(...nestLevelMatches.map(m => 
              parseInt(m.match(/data-nest-level="(\d+)"/)[1])
            ));
            if (maxNestLevel >= maxLevel) {
              testPassed = false;
              failureReason = `Max nesting level exceeded: ${maxNestLevel} >= ${maxLevel}`;
            }
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
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failures.push(`${test.name} - ${error.message}`);
      failed++;
    }
  }

  return { passed, failed, failures };
}

// Main test runner
async function runAllTests() {
  const edgeResults = await runEdgeCaseTests();
  const performancePassed = await performanceTest();
  
  // Summary
  console.log('\n📊 Edge Cases & Performance Test Results:');
  console.log(`   Edge Cases Passed: ${edgeResults.passed}`);
  console.log(`   Edge Cases Failed: ${edgeResults.failed}`);
  console.log(`   Performance Test: ${performancePassed ? 'PASS' : 'FAIL'}`);
  console.log(`   Total: ${edgeResults.passed + edgeResults.failed + 1}`);
  
  if (edgeResults.failures.length > 0) {
    console.log('\n❌ Failed Tests:');
    edgeResults.failures.forEach(failure => console.log(`   - ${failure}`));
  }

  // Return exit code
  const totalFailed = edgeResults.failed + (performancePassed ? 0 : 1);
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Execute tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});