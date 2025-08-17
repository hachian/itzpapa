import { remark } from 'remark';
import remarkMarkHighlight from '../src/plugins/remark-mark-highlight/index.js';

// 単体テスト（remarkプロセッサーのみ）
function runIsolatedTests() {
  console.log('🧪 マークハイライト単体テストを開始...\n');
  
  const processor = remark().use(remarkMarkHighlight);
  
  const testCases = [
    {
      name: '基本的なハイライト',
      input: '==テスト==',
      expected: '<mark>テスト</mark>'
    },
    {
      name: '複数のハイライト',
      input: '==最初== と ==二番目==',
      expected: '<mark>最初</mark> と <mark>二番目</mark>'
    },
    {
      name: '太字との組み合わせ',
      input: '==**重要**==',
      expected: '<mark><strong>重要</strong></mark>'
    },
    {
      name: '空のハイライト（処理しない）',
      input: '====',
      expected: '===='
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = processor.processSync(testCase.input);
      const output = result.toString().trim();
      
      console.log(`🔍 テスト ${index + 1}: ${testCase.name}`);
      console.log(`   入力: ${testCase.input}`);
      console.log(`   期待: ${testCase.expected}`);
      console.log(`   実際: ${output}`);
      
      if (output === testCase.expected) {
        console.log(`   ✅ 成功\n`);
        passed++;
      } else {
        console.log(`   ❌ 失敗\n`);
        failed++;
      }
    } catch (error) {
      console.log(`   💥 エラー: ${error.message}\n`);
      failed++;
    }
  });
  
  console.log(`📊 テスト結果: ${passed}個成功, ${failed}個失敗`);
  return failed === 0;
}

// テスト実行
if (runIsolatedTests()) {
  console.log('🎉 単体テストが成功しました！');
  process.exit(0);
} else {
  console.log('💔 単体テストが失敗しました');
  process.exit(1);
}