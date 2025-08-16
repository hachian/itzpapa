import { remark } from 'remark';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// テストケース
const testCases = [
  {
    name: 'Basic wikilink',
    input: 'これは [[../page/index.md]] へのリンクです。',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page';
    }
  },
  {
    name: 'Wikilink with alias',
    input: '[[../page/index.md|カスタム名]] をクリック',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.children[0].value === 'カスタム名';
    }
  },
  {
    name: 'Wikilink with heading (English)',
    input: '[[../page/index.md#Test Heading]] を参照',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page#test-heading';
    }
  },
  {
    name: 'Wikilink with heading (Japanese)',
    input: '[[../page/index.md#日本語の見出し]] を参照',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page#日本語の見出し';
    }
  },
  {
    name: 'Multiple wikilinks',
    input: '[[../first/index.md]] と [[../second/index.md|二番目]] があります。',
    check: (ast) => {
      const links = findAllNodes(ast, 'link');
      return links.length === 2 && 
             links[0].url === '/blog/first' && 
             links[1].url === '/blog/second' &&
             links[1].children[0].value === '二番目';
    }
  },
  {
    name: 'Wikilink without index.md',
    input: '[[../page]] へのリンク',
    check: (ast) => {
      const link = findNode(ast, 'link');
      // [[../page]] も正しく変換される
      return link && link.url === '/blog/page';
    }
  },
  {
    name: 'Wikilink class attribute',
    input: '[[../test/index.md]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && 
             link.data?.hProperties?.className?.includes('wikilink-internal');
    }
  },
  {
    name: 'Mixed content with external link',
    input: 'テキスト [[../internal/index.md|内部]] と [外部](https://example.com) リンク',
    check: (ast) => {
      const links = findAllNodes(ast, 'link');
      if (links.length !== 2) return false;
      
      const wikilinkHasClass = links[0].data?.hProperties?.className?.includes('wikilink-internal');
      const externalNoClass = !links[1].data?.hProperties?.className;
      
      return wikilinkHasClass && externalNoClass && 
             links[0].url === '/blog/internal' && 
             links[1].url === 'https://example.com';
    }
  },
  {
    name: 'Path cleaning - removes .md extension',
    input: '[[../test/page.md]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/test/page';
    }
  },
  {
    name: 'Path cleaning - removes /index',
    input: '[[../test/index]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/test';
    }
  },
  {
    name: 'Space to hyphen conversion - basic',
    input: '[[../page name/index.md]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name';
    }
  },
  {
    name: 'Space to hyphen conversion - multiple words',
    input: '[[../My Page Name/index.md]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/my-page-name';
    }
  },
  {
    name: 'Space to hyphen conversion - with alias',
    input: '[[../page name/index.md|Display Name]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name' && 
             link.children[0].value === 'Display Name';
    }
  },
  {
    name: 'Trim leading and trailing spaces - basic',
    input: '[[  ../page name/index.md  ]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name';
    }
  },
  {
    name: 'Trim with alias - preserve alias spaces',
    input: '[[  ../page name/index.md  |  Display Name  ]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name' && 
             link.children[0].value === '  Display Name  ';
    }
  },
  {
    name: 'Trim boundary test - tabs and mixed whitespace',
    input: '[[\t ../page name/index.md \t]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name';
    }
  },
  // TASK-003: 見出しアンカーのスペース処理改善
  {
    name: 'Heading anchor space to hyphen - English',
    input: '[[../page/index.md#Test Heading]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page#test-heading';
    }
  },
  {
    name: 'Heading anchor space to hyphen - Japanese',
    input: '[[../page/index.md#日本語 見出し]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page#日本語-見出し';
    }
  },
  {
    name: 'Heading anchor with alias - preserve alias',
    input: '[[../page/index.md#Test Heading|カスタム表示名]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page#test-heading' && 
             link.children[0].value === 'カスタム表示名';
    }
  },
  {
    name: 'Complex heading anchor - mixed languages and spaces',
    input: '[[../page/index.md#English and 日本語 Mixed]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page#english-and-日本語-mixed';
    }
  },
  {
    name: 'Multiple spaces in heading',
    input: '[[../page/index.md#Multiple   Spaces   Test]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page#multiple-spaces-test';
    }
  },
  // TASK-004: テーブル内パイプ文字競合回避（スペース含有パス）
  {
    name: 'Table with spaced path wikilink - escaped pipe',
    input: '| [[../page name/index.md\\|表示名]] | セル2 |',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name' && 
             link.children[0].value === '表示名';
    }
  },
  {
    name: 'Table with multiple spaced wikilinks',
    input: '| [[../page name/index.md\\|リンク1]] | [[../other page/index.md\\|リンク2]] |',
    check: (ast) => {
      const links = findAllNodes(ast, 'link');
      return links.length === 2 && 
             links[0].url === '/blog/page-name' && 
             links[1].url === '/blog/other-page' &&
             links[0].children[0].value === 'リンク1' &&
             links[1].children[0].value === 'リンク2';
    }
  },
  {
    name: 'Table with spaced heading anchor wikilink',
    input: '| [[../page name/index.md#Test Heading\\|見出しリンク]] | セル2 |',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name#test-heading' && 
             link.children[0].value === '見出しリンク';
    }
  },
  // TASK-005: 連続スペース正規化
  {
    name: 'Multiple consecutive spaces - basic',
    input: '[[../page   name/index.md]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name';
    }
  },
  {
    name: 'Multiple consecutive spaces - extreme case',
    input: '[[../page     with     many     spaces/index.md]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-with-many-spaces';
    }
  },
  {
    name: 'Mixed whitespace characters - tabs and spaces',
    input: '[[../page\t\t  \t name/index.md]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name';
    }
  },
  {
    name: 'Unicode whitespace - full-width spaces',
    input: '[[../page　　name/index.md]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page-name';
    }
  },
  {
    name: 'Consecutive spaces in heading anchor',
    input: '[[../page/index.md#Multiple     Spaces     Test]]',
    check: (ast) => {
      const link = findNode(ast, 'link');
      return link && link.url === '/blog/page#multiple-spaces-test';
    }
  }
];

// カラー出力用のヘルパー
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

// ASTから特定のタイプのノードを検索
function findNode(ast, type) {
  let result = null;
  
  function walk(node) {
    if (node.type === type) {
      result = node;
      return;
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
        if (result) return;
      }
    }
  }
  
  walk(ast);
  return result;
}

// ASTから特定のタイプのすべてのノードを検索
function findAllNodes(ast, type) {
  const results = [];
  
  function walk(node) {
    if (node.type === type) {
      results.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  
  walk(ast);
  return results;
}

// テスト実行関数
async function runTest(testCase) {
  try {
    const processor = remark().use(remarkWikilink);
    const ast = processor.runSync(processor.parse(testCase.input));
    
    const success = testCase.check(ast);
    
    return {
      success,
      ast,
      error: success ? null : 'Assertion failed'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// メインテスト実行
async function main() {
  console.log(colors.bold('\n🧪 Wikilink Plugin Test Suite\n'));
  console.log('=' . repeat(50) + '\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const testCase of testCases) {
    process.stdout.write(`Testing: ${colors.cyan(testCase.name)} ... `);
    
    const result = await runTest(testCase);
    results.push({ ...testCase, result });
    
    if (result.success) {
      console.log(colors.green('✓ PASSED'));
      passed++;
    } else {
      console.log(colors.red('✗ FAILED'));
      console.log(`  Input: ${testCase.input}`);
      if (result.error) {
        console.log(`  Error: ${colors.yellow(result.error)}`);
      }
      if (process.env.DEBUG) {
        console.log(`  AST: ${JSON.stringify(result.ast, null, 2)}`);
      }
      failed++;
    }
  }

  // 結果サマリー
  console.log('\n' + '=' . repeat(50));
  console.log(colors.bold('\n📊 Test Results:\n'));
  console.log(`  ${colors.green(`Passed: ${passed}`)}`);
  console.log(`  ${colors.red(`Failed: ${failed}`)}`);
  console.log(`  Total: ${passed + failed}`);
  
  const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
  console.log(`  Success Rate: ${successRate}%`);
  
  if (failed === 0) {
    console.log(colors.green('\n✨ All tests passed! ✨\n'));
  } else {
    console.log(colors.red(`\n⚠️  ${failed} test(s) failed.\n`));
    console.log(colors.gray('Tip: Run with DEBUG=1 to see AST output'));
  }

  // テスト結果をファイルに保存
  const reportPath = join(__dirname, 'test-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    passed,
    failed,
    total: passed + failed,
    successRate: successRate + '%',
    details: results.map(r => ({
      name: r.name,
      input: r.input,
      success: r.result.success,
      error: r.result.error
    }))
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Test report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// テスト実行
main().catch(console.error);