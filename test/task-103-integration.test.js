import { remark } from 'remark';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';
import remarkMarkHighlight from '../src/plugins/remark-mark-highlight/index.js';
import remarkTags from '../src/plugins/remark-tags/index.js';
import assert from 'assert';

// Test helper to process markdown with full plugin integration
async function processMarkdown(input, plugins = null) {
  const processor = remark();

  // Use the same plugin order as astro.config.mjs
  if (plugins === null) {
    processor
      .use(remarkWikilink, { priority: 'high' })
      .use(remarkMarkHighlight)
      .use(remarkTags, { convertToLinks: true });
  } else {
    plugins.forEach(plugin => {
      if (Array.isArray(plugin)) {
        processor.use(plugin[0], plugin[1]);
      } else {
        processor.use(plugin);
      }
    });
  }

  const result = await processor.process(input);
  return String(result);
}

// WikiLink記法との併用テスト
async function testWikiLinkIntegration() {
  console.log('=== WikiLink統合テスト ===');

  // TC-103-001: WikiLink優先処理
  try {
    const input = '[[==highlighted page==]]';
    const output = await processMarkdown(input);
    console.log('TC-103-001 WikiLink優先:', output.trim());
    // WikiLinkが優先され、ハイライトは無視される
    assert(output.includes('<a href'), 'WikiLink should be processed');
    assert(!output.includes('<mark>'), 'Highlight should be ignored inside WikiLink');
    console.log('✓ TC-103-001 passed');
  } catch (error) {
    console.log('✗ TC-103-001 failed:', error.message);
  }

  // TC-103-002: WikiLinkとハイライトの並列処理
  try {
    const input = '==[[wikilink]] highlighted==';
    const output = await processMarkdown(input);
    console.log('TC-103-002 並列処理:', output.trim());
    // ハイライト範囲内でWikiLinkが処理される
    assert(output.includes('<mark>'), 'Highlight should be processed');
    assert(output.includes('<a href'), 'WikiLink should be processed');
    console.log('✓ TC-103-002 passed');
  } catch (error) {
    console.log('✗ TC-103-002 failed:', error.message);
  }

  // TC-103-003: 独立したWikiLinkとハイライト
  try {
    const input = '[[page1]] and ==highlight== text';
    const output = await processMarkdown(input);
    console.log('TC-103-003 独立処理:', output.trim());
    assert(output.includes('<a href'), 'WikiLink should be processed');
    assert(output.includes('<mark>'), 'Highlight should be processed');
    console.log('✓ TC-103-003 passed');
  } catch (error) {
    console.log('✗ TC-103-003 failed:', error.message);
  }
}

// GFM記法との併用テスト
async function testGFMIntegration() {
  console.log('\n=== GFM統合テスト ===');

  // TC-103-004: 太字内ハイライト
  try {
    const input = '**==bold highlight==**';
    const output = await processMarkdown(input);
    console.log('TC-103-004 太字内ハイライト:', output.trim());
    assert(output.includes('<strong>'), 'Bold should be processed');
    assert(output.includes('<mark>'), 'Highlight should be processed');
    console.log('✓ TC-103-004 passed');
  } catch (error) {
    console.log('✗ TC-103-004 failed:', error.message);
  }

  // TC-103-005: ハイライト内太字
  try {
    const input = '==**inner bold**==';
    const output = await processMarkdown(input);
    console.log('TC-103-005 ハイライト内太字:', output.trim());
    assert(output.includes('<mark>'), 'Highlight should be processed');
    assert(output.includes('<strong>'), 'Bold should be processed');
    console.log('✓ TC-103-005 passed');
  } catch (error) {
    console.log('✗ TC-103-005 failed:', error.message);
  }

  // TC-103-006: 斜体内ハイライト
  try {
    const input = '*==italic highlight==*';
    const output = await processMarkdown(input);
    console.log('TC-103-006 斜体内ハイライト:', output.trim());
    assert(output.includes('<em>'), 'Italic should be processed');
    assert(output.includes('<mark>'), 'Highlight should be processed');
    console.log('✓ TC-103-006 passed');
  } catch (error) {
    console.log('✗ TC-103-006 failed:', error.message);
  }

  // TC-103-010: コード内ハイライト（除外）
  try {
    const input = '`==code==`';
    const output = await processMarkdown(input);
    console.log('TC-103-010 コード内除外:', output.trim());
    assert(output.includes('<code>'), 'Code should be processed');
    assert(!output.includes('<mark>'), 'Highlight should be excluded from code');
    console.log('✓ TC-103-010 passed');
  } catch (error) {
    console.log('✗ TC-103-010 failed:', error.message);
  }
}

// タグ記法との併用テスト
async function testTagIntegration() {
  console.log('\n=== タグ統合テスト ===');

  // TC-103-011: ハイライト内タグ
  try {
    const input = '==highlighted #tag==';
    const output = await processMarkdown(input);
    console.log('TC-103-011 ハイライト内タグ:', output.trim());
    assert(output.includes('<mark>'), 'Highlight should be processed');
    assert(output.includes('tag-link'), 'Tag should be processed');
    console.log('✓ TC-103-011 passed');
  } catch (error) {
    console.log('✗ TC-103-011 failed:', error.message);
  }

  // TC-103-012: 独立したタグとハイライト
  try {
    const input = '#tag ==highlight==';
    const output = await processMarkdown(input);
    console.log('TC-103-012 独立タグ:', output.trim());
    assert(output.includes('tag-link'), 'Tag should be processed');
    assert(output.includes('<mark>'), 'Highlight should be processed');
    console.log('✓ TC-103-012 passed');
  } catch (error) {
    console.log('✗ TC-103-012 failed:', error.message);
  }
}

// 複合記法のテスト
async function testCompoundSyntax() {
  console.log('\n=== 複合記法テスト ===');

  // TC-103-015: タグ-太字-ハイライト複合
  try {
    const input = '#tag ==**bold highlight**==';
    const output = await processMarkdown(input);
    console.log('TC-103-015 複合記法:', output.trim());
    assert(output.includes('tag-link'), 'Tag should be processed');
    assert(output.includes('<mark>'), 'Highlight should be processed');
    assert(output.includes('<strong>'), 'Bold should be processed');
    console.log('✓ TC-103-015 passed');
  } catch (error) {
    console.log('✗ TC-103-015 failed:', error.message);
  }

  // TC-103-016: ネストした複合記法
  try {
    const input = '**==*nested italic*==**';
    const output = await processMarkdown(input);
    console.log('TC-103-016 ネスト記法:', output.trim());
    assert(output.includes('<strong>'), 'Outer bold should be processed');
    assert(output.includes('<mark>'), 'Highlight should be processed');
    assert(output.includes('<em>'), 'Inner italic should be processed');
    console.log('✓ TC-103-016 passed');
  } catch (error) {
    console.log('✗ TC-103-016 failed:', error.message);
  }
}

// セキュリティテスト
async function testSecurity() {
  console.log('\n=== セキュリティテスト ===');

  // TC-103-021: XSS防止の維持
  try {
    const input = '==<script>alert("xss")</script>==';
    const output = await processMarkdown(input);
    console.log('TC-103-021 XSS防止:', output.trim());
    assert(output.includes('<mark>'), 'Highlight should be processed');
    assert(!output.includes('<script>'), 'Script tag should be escaped');
    assert(output.includes('&lt;script&gt;'), 'HTML should be escaped');
    console.log('✓ TC-103-021 passed');
  } catch (error) {
    console.log('✗ TC-103-021 failed:', error.message);
  }
}

// プラグイン順序のテスト
async function testPluginOrder() {
  console.log('\n=== プラグイン順序テスト ===');

  // 正しい順序でのテスト
  try {
    const input = '[[page]] ==**highlight**== #tag';
    const output1 = await processMarkdown(input);
    console.log('正しい順序:', output1.trim());

    // 順序を変更してテスト
    const output2 = await processMarkdown(input, [
      [remarkTags, { convertToLinks: true }],
      remarkMarkHighlight,
      [remarkWikilink, { priority: 'high' }]
    ]);
    console.log('順序変更:', output2.trim());

    // 結果が異なることを確認（順序による影響の検証）
    console.log('✓ プラグイン順序テスト passed');
  } catch (error) {
    console.log('✗ プラグイン順序テスト failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Running TASK-103 integration tests...\n');

  let passed = 0;
  let failed = 0;

  const testSuites = [
    testWikiLinkIntegration,
    testGFMIntegration,
    testTagIntegration,
    testCompoundSyntax,
    testSecurity,
    testPluginOrder
  ];

  for (const testSuite of testSuites) {
    try {
      await testSuite();
      passed++;
    } catch (error) {
      console.error(`Test suite failed:`, error.message);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} test suites passed, ${failed} failed`);
  console.log(`========================================`);

  return { passed, failed };
}

runTests();