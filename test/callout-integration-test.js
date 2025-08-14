/**
 * Callout Integration Test Suite
 * Tests for integration with existing wikilink functionality and other plugins
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeCallout from '../src/plugins/rehype-callout/index.js';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';

// Test helper to process markdown with both plugins
async function processMarkdownWithPlugins(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkWikilink) // Process wikilinks first (remark phase)
    .use(remarkRehype)
    .use(rehypeCallout) // Process callouts after (rehype phase)
    .use(rehypeStringify)
    .process(markdown);
  
  return result.toString();
}

// Test helper for callout-only processing
async function processMarkdownCalloutOnly(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCallout)
    .use(rehypeStringify)
    .process(markdown);
  
  return result.toString();
}

// Integration test suite
const integrationTests = [
  {
    name: 'Callout with wikilinks',
    input: `> [!note] See Also
> Check out [[wikilink-test-suite/index|wikilink examples]] for more details.
> 
> Also see [[another-page]] for related content.`,
    expected: {
      contains: [
        'class="callout callout-note"',
        'href="/blog/wikilink-test-suite/"',
        'wikilink examples',
        'href="/blog/another-page/"',
        'another-page'
      ],
      notContains: ['[[wikilink-test-suite', '[[another-page]]']
    }
  },
  {
    name: 'Nested callouts with wikilinks',
    input: `> [!warning] Main Warning
> This is dangerous, see [[safety-guide]].
> 
> > [!tip] Safety Tip
> > Always read the [[documentation/safety|safety docs]].`,
    expected: {
      contains: [
        'class="callout callout-warning"',
        'class="callout callout-tip"',
        'href="/blog/safety-guide/"',
        'href="/blog/documentation/safety/"',
        'safety docs'
      ],
      notContains: ['[[safety-guide]]', '[[documentation/safety|safety docs]]']
    }
  },
  {
    name: 'Callout with image wikilinks',
    input: `> [!example] Visual Example
> Here's an example: ![[test-image.png|Example Image]]
> 
> And another: ![[folder/image.jpg]]`,
    expected: {
      contains: [
        'class="callout callout-example"',
        '<img',
        'src="/blog/test-image.png"',
        'alt="Example Image"',
        'src="/blog/folder/image.jpg"'
      ],
      notContains: ['![[test-image.png', '![[folder/image.jpg]]']
    }
  },
  {
    name: 'Mixed content integration',
    input: `> [!info]+ Comprehensive Example
> This callout contains:
> 
> - Regular **bold** and *italic* text
> - A wikilink: [[important-page]]
> - An image: ![[example.png|Example]]
> - \`inline code\` and:
> 
> \`\`\`javascript
> // Code block
> console.log("Hello");
> \`\`\`
> 
> > [!note] Nested Note
> > With another [[nested-link]].`,
    expected: {
      contains: [
        'class="callout callout-info callout-foldable"',
        '<strong>bold</strong>',
        '<em>italic</em>',
        'href="/blog/important-page/"',
        '<img',
        'src="/blog/example.png"',
        '<code>inline code</code>',
        '<pre>',
        'console.log',
        'class="callout callout-note"',
        'href="/blog/nested-link/"'
      ],
      notContains: [
        '[[important-page]]',
        '![[example.png|Example]]',
        '[[nested-link]]'
      ]
    }
  },
  {
    name: 'Table with callouts',
    input: `| Column 1 | Column 2 |
|----------|----------|
| Regular cell | > [!note] Cell Note<br>> Cell content |
| Another | Normal cell |`,
    expected: {
      contains: [
        '<table>',
        '<td>',
        'class="callout callout-note"',
        'Cell Note'
      ],
      notContains: []
    }
  },
  {
    name: 'Callout preserves existing blockquote behavior',
    input: `> [!note] This is a callout
> Callout content

> This is a regular blockquote
> Regular content`,
    expected: {
      contains: [
        'class="callout callout-note"',
        '<blockquote>',
        'Regular content'
      ],
      notContains: []
    }
  },
  {
    name: 'Foldable callout with complex nested content',
    input: `> [!example]- Collapsed Example
> 
> This has **formatting** and [[links]].
> 
> > [!tip] Nested inside foldable
> > Nested content with [[another-link]].
> 
> Back to main content.`,
    expected: {
      contains: [
        'class="callout callout-example callout-foldable callout-folded"',
        '<details',
        '<summary',
        '<strong>formatting</strong>',
        'href="/blog/links/"',
        'class="callout callout-tip"',
        'href="/blog/another-link/"'
      ],
      notContains: ['[[links]]', '[[another-link]]']
    }
  },
  {
    name: 'Multiple plugin processing order',
    input: `> [!warning] Processing Order Test
> First: [[page-one]]
> Second: ![[image.png]]
> Third: [[page-two|Custom Title]]`,
    expected: {
      contains: [
        'href="/blog/page-one/"',
        'src="/blog/image.png"',
        'href="/blog/page-two/"',
        'Custom Title'
      ],
      notContains: [
        '[[page-one]]',
        '![[image.png]]',
        '[[page-two|Custom Title]]'
      ]
    }
  }
];

// Performance integration test
async function performanceIntegrationTest() {
  console.log('🚀 Running Integration Performance Tests...\n');
  
  // Generate large document with mixed content
  const mixedContent = Array(50).fill(0).map((_, i) => 
    `> [!note] Callout ${i + 1}
> This callout has a [[wikilink-${i}]] and ![[image-${i}.png]].
> 
> > [!tip] Nested ${i}
> > Nested content with [[nested-${i}]].`
  ).join('\n\n');
  
  const startTime = Date.now();
  await processMarkdownWithPlugins(mixedContent);
  const duration = Date.now() - startTime;
  
  console.log(`📈 Integration Performance Test:`);
  console.log(`   Document: 50 callouts with wikilinks`);
  console.log(`   Processing time: ${duration}ms`);
  console.log(`   Target: < 2000ms`);
  
  const passed = duration < 2000;
  console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  return passed;
}

// Compatibility test (ensure callouts don't break existing functionality)
async function compatibilityTest() {
  console.log('\n🔄 Running Compatibility Tests...\n');
  
  const compatTests = [
    {
      name: 'Regular blockquotes still work',
      input: `> This is a regular blockquote
> With multiple lines
> And no callout syntax`,
      shouldContain: ['<blockquote>', 'This is a regular'],
      shouldNotContain: ['class="callout']
    },
    {
      name: 'Wikilinks without callouts work',
      input: `Regular text with [[simple-link]] and ![[image.png]].`,
      shouldContain: ['href="/blog/simple-link/"', 'src="/blog/image.png"'],
      shouldNotContain: ['[[simple-link]]', '![[image.png]]']
    },
    {
      name: 'Markdown formatting preserved',
      input: `**Bold text** and *italic text* and \`code\`.`,
      shouldContain: ['<strong>Bold text</strong>', '<em>italic text</em>', '<code>code</code>'],
      shouldNotContain: ['**Bold text**', '*italic text*', '`code`']
    }
  ];
  
  let compatPassed = 0;
  let compatFailed = 0;
  
  for (const test of compatTests) {
    try {
      const output = await processMarkdownWithPlugins(test.input);
      let testPassed = true;
      
      for (const expected of test.shouldContain) {
        if (!output.includes(expected)) {
          testPassed = false;
          break;
        }
      }
      
      for (const notExpected of test.shouldNotContain) {
        if (output.includes(notExpected)) {
          testPassed = false;
          break;
        }
      }
      
      if (testPassed) {
        console.log(`✅ ${test.name}`);
        compatPassed++;
      } else {
        console.log(`❌ ${test.name}`);
        compatFailed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      compatFailed++;
    }
  }
  
  return { compatPassed, compatFailed };
}

// Run integration tests
async function runIntegrationTests() {
  console.log('🔗 Running Callout Integration Tests\n');
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of integrationTests) {
    try {
      const output = await processMarkdownWithPlugins(test.input);
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

  return { passed, failed, failures };
}

// Main test runner
async function runAllTests() {
  const integrationResults = await runIntegrationTests();
  const compatResults = await compatibilityTest();
  const performancePassed = await performanceIntegrationTest();
  
  // Summary
  console.log('\n📊 Integration Test Results:');
  console.log(`   Integration Tests Passed: ${integrationResults.passed}`);
  console.log(`   Integration Tests Failed: ${integrationResults.failed}`);
  console.log(`   Compatibility Tests Passed: ${compatResults.compatPassed}`);
  console.log(`   Compatibility Tests Failed: ${compatResults.compatFailed}`);
  console.log(`   Performance Test: ${performancePassed ? 'PASS' : 'FAIL'}`);
  
  if (integrationResults.failures.length > 0) {
    console.log('\n❌ Failed Tests:');
    integrationResults.failures.forEach(failure => console.log(`   - ${failure}`));
  }

  // Return exit code
  const totalFailed = integrationResults.failed + compatResults.compatFailed + (performancePassed ? 0 : 1);
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Execute tests
runAllTests().catch(error => {
  console.error('Integration test runner failed:', error);
  process.exit(1);
});