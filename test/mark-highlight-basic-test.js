import { remark } from 'remark';
import remarkMarkHighlight from '../src/plugins/remark-mark-highlight/index.js';

// 基本的なテスト
function runBasicTests() {
  console.log('🧪 マークハイライト基本テストを開始...\n');
  
  const processor = remark().use(remarkMarkHighlight);
  
  const testCases = [
    {
      name: '基本的なハイライト',
      input: 'これは ==重要== なテキストです。',
      expected: 'これは <mark>重要</mark> なテキストです。'
    },
    {
      name: '複数のハイライト',
      input: '==最初== と ==二番目== のハイライト',
      expected: '<mark>最初</mark> と <mark>二番目</mark> のハイライト'
    },
    {
      name: '空のハイライト（処理しない）',
      input: 'これは ===== 空です',
      expected: 'これは ===== 空です'
    },
    {
      name: 'ハイライトなし',
      input: '普通のテキストです',
      expected: '普通のテキストです'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = processor.processSync(testCase.input);
      const output = result.toString().trim();
      
      // 出力をそのまま比較
      if (output === testCase.expected) {
        console.log(`✅ テスト ${index + 1}: ${testCase.name}`);
        passed++;
      } else {
        console.log(`❌ テスト ${index + 1}: ${testCase.name}`);
        console.log(`   期待値: ${testCase.expected}`);
        console.log(`   実際値: ${output}`);
        failed++;
      }
    } catch (error) {
      console.log(`💥 テスト ${index + 1}: ${testCase.name} - エラー: ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\n📊 テスト結果: ${passed}個成功, ${failed}個失敗`);
  return failed === 0;
}

// テスト実行
if (runBasicTests()) {
  console.log('🎉 全てのテストが成功しました！');
  process.exit(0);
} else {
  console.log('💔 一部のテストが失敗しました');
  process.exit(1);
}