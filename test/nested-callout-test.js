/**
 * Nested Callout Test Suite
 * Tests for nested callout functionality
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

// Test suite for nested callouts
const tests = [
  {
    name: 'Single level nested callout',
    input: `> [!note] Parent Note
> This is the parent callout
> 
> > [!tip]
> > This is a nested tip`,
    expected: {
      contains: [
        'class="callout callout-note"',
        'Parent Note',
        'This is the parent callout',
        'class="callout callout-tip"',
        'This is a nested tip'
      ]
    }
  },
  {
    name: 'Two levels of nesting',
    input: `> [!warning] Level 1
> Content at level 1
> 
> > [!info] Level 2
> > Content at level 2
> > 
> > > [!danger] Level 3
> > > Content at level 3`,
    expected: {
      contains: [
        'class="callout callout-warning"',
        'Level 1',
        'class="callout callout-info"',
        'Level 2',
        'class="callout callout-danger"',
        'Level 3'
      ]
    }
  },
  {
    name: 'Mixed content with nested callout',
    input: `> [!note]
> Some text before nested
> 
> > [!tip]
> > Nested content
> 
> Some text after nested`,
    expected: {
      contains: [
        'Some text before nested',
        'class="callout callout-tip"',
        'Nested content',
        'Some text after nested'
      ]
    }
  },
  {
    name: 'Multiple nested callouts at same level',
    input: `> [!note] Parent
> Parent content
> 
> > [!tip]
> > First nested
> 
> > [!warning]
> > Second nested`,
    expected: {
      contains: [
        'Parent',
        'class="callout callout-tip"',
        'First nested',
        'class="callout callout-warning"',
        'Second nested'
      ]
    }
  },
  {
    name: 'Nested foldable callouts',
    input: `> [!note]+ Expandable Parent
> Parent content
> 
> > [!tip]- Collapsed Child
> > Child content`,
    expected: {
      contains: [
        'class="callout callout-note callout-foldable"',
        'Expandable Parent',
        'class="callout callout-tip callout-foldable callout-folded"',
        'Collapsed Child'
      ]
    }
  },
  {
    name: 'Deep nesting (10 levels)',
    input: `> [!note] L1
> > [!note] L2
> > > [!note] L3
> > > > [!note] L4
> > > > > [!note] L5
> > > > > > [!note] L6
> > > > > > > [!note] L7
> > > > > > > > [!note] L8
> > > > > > > > > [!note] L9
> > > > > > > > > > [!note] L10`,
    expected: {
      contains: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'],
      testDepth: true
    }
  },
  {
    name: 'Respect max nesting level (20)',
    input: generateDeeplyNested(22),
    expected: {
      maxDepth: 20,
      shouldStopAt20: true
    }
  }
];

// Helper to generate deeply nested callouts
function generateDeeplyNested(depth) {
  let markdown = '';
  for (let i = 1; i <= depth; i++) {
    markdown += '> '.repeat(i) + `[!note] Level ${i}\n`;
  }
  return markdown;
}

// Run tests
async function runTests() {
  console.log('🧪 Running Nested Callout Tests\n');
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
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

      // Check nesting depth
      if (test.expected.testDepth) {
        // Count the actual nesting depth in output
        const depthMatch = output.match(/callout-content/g);
        if (!depthMatch || depthMatch.length < 10) {
          testPassed = false;
          failureReason = `Insufficient nesting depth detected`;
        }
      }

      // Check max depth handling
      if (test.expected.shouldStopAt20) {
        // Check that callout conversion stops at 20
        // Levels 21+ may appear as text but not as callouts
        const calloutDivs = output.match(/data-nest-level="\d+"/g);
        if (calloutDivs) {
          const maxNestLevel = Math.max(...calloutDivs.map(d => 
            parseInt(d.match(/data-nest-level="(\d+)"/)[1])));
          if (maxNestLevel >= 20) {
            testPassed = false;
            failureReason = `Callout nesting should stop at level 19, found level ${maxNestLevel}`;
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
          console.log('   Output preview:', output.substring(0, 300));
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