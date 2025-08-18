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

  // TASK-004: 追加のセキュリティテストケース（Red Phase用）
  const task004TestCases = [
    {
      name: 'インラインコード内のハイライト記法は無視される',
      input: 'このコード `==ハイライトしない==` は処理されません',
      expected: 'このコード `==ハイライトしない==` は処理されません',
      task004: true,
      expectedToFail: false // このテストは既に実装済みのため成功予定
    },
    {
      name: 'ブロックコード風の記法（markdownではないコード）',
      input: '```\n==コードブロック風==\n```',
      expected: '<mark>コードブロック風</mark>', // 現在の実装では変換される（改善対象）
      task004: true,
      expectedToFail: true
    },
    {
      name: '複合的な不正記法の組み合わせ',
      input: '===不正=== `==コード==` ====空==== ===奇数===',
      expected: '===不正=== `==コード==` ====空==== ===奇数===',
      task004: true,
      expectedToFail: true
    }
  ];

  // 基本テストケースとTASK-004テストケースを結合
  const allTestCases = [...testCases, ...task004TestCases];
  
  let passed = 0;
  let failed = 0;
  let task004Tests = 0;
  let task004Failed = 0;
  
  allTestCases.forEach((testCase, index) => {
    try {
      const result = processor.processSync(testCase.input);
      const output = result.toString().trim();
      
      const testPrefix = testCase.task004 ? '🔴 [TASK-004]' : '🔍 テスト';
      console.log(`${testPrefix} ${index + 1}: ${testCase.name}`);
      console.log(`   入力: ${testCase.input}`);
      console.log(`   期待: ${testCase.expected}`);
      console.log(`   実際: ${output}`);
      
      if (testCase.task004) {
        task004Tests++;
      }
      
      if (output === testCase.expected) {
        if (testCase.expectedToFail) {
          console.log(`   ⚠️  予期しない成功（実装により改善されました）\n`);
        } else {
          console.log(`   ✅ 成功\n`);
        }
        passed++;
      } else {
        if (testCase.expectedToFail) {
          console.log(`   🔴 期待通りの失敗（Red Phase対象機能）\n`);
          if (testCase.task004) {
            task004Failed++;
          }
        } else {
          console.log(`   ❌ 失敗\n`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`   💥 エラー: ${error.message}\n`);
      failed++;
      if (testCase.task004) {
        task004Failed++;
      }
    }
  });
  
  console.log(`📊 テスト結果: ${passed}個成功, ${failed}個失敗`);
  
  if (task004Tests > 0) {
    console.log(`🔴 TASK-004関連: ${task004Tests}個のテスト中 ${task004Failed}個が期待通り失敗`);
    console.log(`   これらは将来のGreen Phaseで実装予定の機能です`);
  }
  
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