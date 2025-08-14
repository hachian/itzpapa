/**
 * Callout Markdown Processing Test Suite
 * Tests for proper markdown handling within callouts
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

// Test suite for callout markdown processing
const tests = [
  {
    name: 'Inline bold text in callout',
    input: `> [!note]
> This text has **bold content** in it.`,
    expected: {
      contains: ['<strong>bold content</strong>'],
      notContains: ['**bold content**']
    }
  },
  {
    name: 'Inline italic text in callout',
    input: `> [!tip]
> This text has *italic content* in it.`,
    expected: {
      contains: ['<em>italic content</em>'],
      notContains: ['*italic content*']
    }
  },
  {
    name: 'Inline code in callout',
    input: `> [!info]
> Use the \`console.log()\` function for debugging.`,
    expected: {
      contains: ['<code>console.log()</code>'],
      notContains: ['`console.log()`']
    }
  },
  {
    name: 'Links in callout',
    input: `> [!warning]
> Check the [documentation](https://example.com) for more info.`,
    expected: {
      contains: ['<a href="https://example.com">documentation</a>'],
      notContains: ['[documentation](https://example.com)']
    }
  },
  {
    name: 'Mixed inline elements in callout',
    input: `> [!note] Mixed Content
> This has **bold**, *italic*, \`code\`, and [link](https://example.com) elements.`,
    expected: {
      contains: [
        '<strong>bold</strong>',
        '<em>italic</em>',
        '<code>code</code>',
        '<a href="https://example.com">link</a>'
      ],
      notContains: [
        '**bold**',
        '*italic*',
        '`code`',
        '[link](https://example.com)'
      ]
    }
  },
  {
    name: 'Multiple paragraphs with inline elements',
    input: `> [!tip] Multi-paragraph
> First paragraph with **bold text**.
> 
> Second paragraph with *italic text* and \`code\`.`,
    expected: {
      contains: [
        '<strong>bold text</strong>',
        '<em>italic text</em>',
        '<code>code</code>'
      ],
      notContains: [
        '**bold text**',
        '*italic text*',
        '`code`'
      ]
    }
  },
  {
    name: 'Inline elements in nested callouts',
    input: `> [!warning] Parent with **bold**
> Parent content with *italic*.
> 
> > [!note] Child with \`code\`
> > Child content with [link](https://example.com).`,
    expected: {
      contains: [
        '<strong>bold</strong>',
        '<em>italic</em>',
        '<code>code</code>',
        '<a href="https://example.com">link</a>'
      ],
      notContains: [
        '**bold**',
        '*italic*',
        '`code`',
        '[link](https://example.com)'
      ]
    }
  },
  {
    name: 'Block elements still work (lists)',
    input: `> [!info]
> Here's a list:
> 
> - Item with **bold**
> - Item with *italic*
> - Item with \`code\``,
    expected: {
      contains: [
        '<ul>',
        '<li>Item with <strong>bold</strong></li>',
        '<li>Item with <em>italic</em></li>',
        '<li>Item with <code>code</code></li>'
      ]
    }
  },
  {
    name: 'Block elements still work (code blocks)',
    input: `> [!example]
> Here's some code:
> 
> \`\`\`javascript
> function test() {
>   return "hello";
> }
> \`\`\``,
    expected: {
      contains: [
        '<pre>',
        '<code',
        'function test()',
        'return "hello"'
      ]
    }
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Running Callout Markdown Processing Tests\n');
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

      if (testPassed) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        failures.push(`${test.name} - ${failureReason}`);
        failed++;
        
        // Debug output for failed tests
        if (process.env.DEBUG) {
          console.log('   Expected contains:', test.expected.contains);
          console.log('   Expected not contains:', test.expected.notContains);
          console.log('   Actual output:', output.substring(0, 300));
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