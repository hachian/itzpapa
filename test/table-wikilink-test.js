import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';
import { inspect } from 'util';

const testCases = [
  {
    name: 'Simple table with wikilink',
    input: `| Link |
|------|
| [[../test/index.md]] |`,
    expectedInCell: '/blog/test'
  },
  {
    name: 'Table with aliased wikilink',
    input: `| Type | Link |
|------|------|
| Wiki | [[../test/index.md|My Test]] |`,
    expectedInCell: 'My Test',
    expectedUrl: '/blog/test'
  },
  {
    name: 'Mixed table content',
    input: `| Type | Link | Note |
|------|------|------|
| Wiki | [[../page/index.md]] | Internal |
| Alias | [[../test/index.md|テスト]] | Japanese |
| Normal | [External](https://example.com) | External |`,
    expectedLinks: 3
  }
];

// カラー出力
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// リンクを検索
function findLinks(ast) {
  const links = [];
  
  function walk(node) {
    if (node.type === 'link') {
      links.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  
  walk(ast);
  return links;
}

async function runTest(testCase) {
  try {
    // GFMとWikilinkの両方を使用
    const processor = remark()
      .use(remarkWikilink)  // Wikilinkを先に処理
      .use(remarkGfm);       // その後でテーブルを処理
    
    const ast = processor.runSync(processor.parse(testCase.input));
    const links = findLinks(ast);
    
    // デバッグ出力
    if (process.env.DEBUG) {
      console.log('\nAST:', inspect(ast, { depth: null, colors: true }));
      console.log('Links found:', links);
    }
    
    // 検証
    if (testCase.expectedLinks !== undefined) {
      return {
        success: links.length === testCase.expectedLinks,
        found: links.length,
        expected: testCase.expectedLinks
      };
    }
    
    if (testCase.expectedInCell) {
      const hasExpectedLink = links.some(link => 
        link.url.includes(testCase.expectedInCell) || 
        link.children?.some(child => child.value?.includes(testCase.expectedInCell))
      );
      return {
        success: hasExpectedLink,
        links
      };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log(colors.bold('\n🧪 Table Wikilink Test Suite\n'));
  console.log('=' . repeat(50) + '\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    process.stdout.write(`Testing: ${colors.cyan(testCase.name)} ... `);
    
    const result = await runTest(testCase);
    
    if (result.success) {
      console.log(colors.green('✓ PASSED'));
      passed++;
    } else {
      console.log(colors.red('✗ FAILED'));
      console.log(`  Input:\n${testCase.input.split('\n').map(l => '    ' + l).join('\n')}`);
      if (result.error) {
        console.log(`  Error: ${colors.yellow(result.error)}`);
      } else if (result.found !== undefined) {
        console.log(`  Expected ${result.expected} links, found ${result.found}`);
      }
      failed++;
    }
  }
  
  console.log('\n' + '=' . repeat(50));
  console.log(colors.bold('\n📊 Test Results:\n'));
  console.log(`  ${colors.green(`Passed: ${passed}`)}`);
  console.log(`  ${colors.red(`Failed: ${failed}`)}`);
  
  if (failed === 0) {
    console.log(colors.green('\n✨ All table tests passed! ✨\n'));
  } else {
    console.log(colors.red(`\n⚠️  ${failed} table test(s) failed.\n`));
    console.log(colors.yellow('Note: Table support in Wikilinks is challenging due to'));
    console.log(colors.yellow('Markdown table parsing. Consider alternative syntax or'));
    console.log(colors.yellow('documentation for users about this limitation.\n'));
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);