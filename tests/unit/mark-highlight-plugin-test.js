import { remark } from 'remark';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';
import assert from 'assert';

// Test basic plugin structure
async function testPluginStructure() {
  const processor = remark().use(remarkMarkHighlight);
  const result = await processor.process('Test ==highlight== text');

  assert(result, 'Plugin should process text');
  console.log('✓ Plugin structure test passed');
}

// Test plugin can be imported
async function testPluginImport() {
  assert(typeof remarkMarkHighlight === 'function', 'Plugin should be a function');
  console.log('✓ Plugin import test passed');
}

// Test plugin with options
async function testPluginOptions() {
  const processor = remark().use(remarkMarkHighlight, { className: 'custom-highlight' });
  const result = await processor.process('Test ==highlight== text');

  assert(result, 'Plugin should accept options');
  console.log('✓ Plugin options test passed');
}

// Test disabled plugin
async function testDisabledPlugin() {
  const processor = remark().use(remarkMarkHighlight, { enabled: false });
  const result = await processor.process('Test ==highlight== text');
  const html = String(result);

  assert(!html.includes('<mark'), 'Disabled plugin should not convert highlights');
  console.log('✓ Disabled plugin test passed');
}

// Run all tests
async function runTests() {
  console.log('Testing remark-mark-highlight plugin structure...\n');

  try {
    await testPluginImport();
    await testPluginStructure();
    await testPluginOptions();
    await testDisabledPlugin();

    console.log('\n✅ All plugin structure tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();