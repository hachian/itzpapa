import { remark } from 'remark';
import remarkMarkHighlight from '../src/plugins/remark-mark-highlight/index.js';

// 高度な機能のテスト（現在は失敗する予定）
function runAdvancedTests() {
  console.log('🧪 マークハイライト高度機能テストを開始...\n');
  
  const processor = remark().use(remarkMarkHighlight);
  
  // インライン記法との組み合わせテスト
  const inlineTests = [
    {
      name: 'TC-001: 太字との組み合わせ',
      input: '==**重要な太字**==',
      expected: '<mark><strong>重要な太字</strong></mark>'
    },
    {
      name: 'TC-002: イタリックとの組み合わせ',
      input: '==*重要なイタリック*==',
      expected: '<mark><em>重要なイタリック</em></mark>'
    },
    {
      name: 'TC-003: 太字イタリックとの組み合わせ',
      input: '==***重要な太字イタリック***==',
      expected: '<mark><strong><em>重要な太字イタリック</em></strong></mark>'
    },
    {
      name: 'TC-004: リンクとの組み合わせ',
      input: '==[重要なリンク](https://example.com)==',
      expected: '<mark><a href="https://example.com">重要なリンク</a></mark>'
    },
    {
      name: 'TC-005: コードとの組み合わせ',
      input: '==`コード`==',
      expected: '<mark><code>コード</code></mark>'
    }
  ];
  
  // 複数ハイライトテスト
  const multipleTests = [
    {
      name: 'TC-006: 3個のハイライト',
      input: '==最初== と ==二番目== と ==三番目==',
      expected: '<mark>最初</mark> と <mark>二番目</mark> と <mark>三番目</mark>'
    },
    {
      name: 'TC-007: 異なる記法との混在',
      input: '==ハイライト== と **太字** と ==*イタリック*==',
      expected: '<mark>ハイライト</mark> と <strong>太字</strong> と <mark><em>イタリック</em></mark>'
    }
  ];
  
  // エッジケーステスト
  const edgeTests = [
    {
      name: 'TC-009: 空白を含むハイライト',
      input: '== 空白付き ==',
      expected: '<mark>空白付き</mark>'
    },
    {
      name: 'TC-010: 日本語ハイライト',
      input: '==重要な日本語テキスト==',
      expected: '<mark>重要な日本語テキスト</mark>'
    },
    {
      name: 'TC-011: 数字と記号',
      input: '==価格: $29.99==',
      expected: '<mark>価格: $29.99</mark>'
    }
  ];
  
  // セキュリティテスト
  const securityTests = [
    {
      name: 'TC-013: HTMLタグのエスケープ',
      input: '==<script>alert("xss")</script>==',
      expected: '<mark>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</mark>'
    },
    {
      name: 'TC-014: 属性付きHTMLタグのエスケープ',
      input: '==<div onclick="alert()">危険</div>==',
      expected: '<mark>&lt;div onclick=&quot;alert()&quot;&gt;危険&lt;/div&gt;</mark>'
    }
  ];
  
  const allTests = [
    ...inlineTests,
    ...multipleTests, 
    ...edgeTests,
    ...securityTests
  ];
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  console.log('📋 テスト実行中...\n');
  
  allTests.forEach((testCase, index) => {
    try {
      const result = processor.processSync(testCase.input);
      const output = result.toString().trim();
      
      if (output === testCase.expected) {
        console.log(`✅ ${testCase.name}`);
        passed++;
      } else {
        console.log(`❌ ${testCase.name}`);
        console.log(`   期待値: ${testCase.expected}`);
        console.log(`   実際値: ${output}\n`);
        failed++;
        failures.push({
          name: testCase.name,
          expected: testCase.expected,
          actual: output,
          input: testCase.input
        });
      }
    } catch (error) {
      console.log(`💥 ${testCase.name} - エラー: ${error.message}\n`);
      failed++;
      failures.push({
        name: testCase.name,
        error: error.message,
        input: testCase.input
      });
    }
  });
  
  console.log(`📊 テスト結果: ${passed}個成功, ${failed}個失敗\n`);
  
  if (failures.length > 0) {
    console.log('🔍 失敗の詳細分析:\n');
    
    const inlineFailures = failures.filter(f => f.name.includes('TC-001') || f.name.includes('TC-002') || f.name.includes('TC-003') || f.name.includes('TC-004') || f.name.includes('TC-005'));
    const multipleFailures = failures.filter(f => f.name.includes('TC-006') || f.name.includes('TC-007'));
    const edgeFailures = failures.filter(f => f.name.includes('TC-009') || f.name.includes('TC-010') || f.name.includes('TC-011'));
    const securityFailures = failures.filter(f => f.name.includes('TC-013') || f.name.includes('TC-014'));
    
    if (inlineFailures.length > 0) {
      console.log(`🎯 インライン記法との組み合わせ: ${inlineFailures.length}個失敗`);
      console.log('   → remarkプラグインでインライン記法の解析が必要\n');
    }
    
    if (multipleFailures.length > 0) {
      console.log(`🎯 複数ハイライト処理: ${multipleFailures.length}個失敗`);
      console.log('   → 既存の処理で対応可能の可能性\n');
    }
    
    if (edgeFailures.length > 0) {
      console.log(`🎯 エッジケース: ${edgeFailures.length}個失敗`);
      console.log('   → 空白処理や文字セットの調整が必要\n');
    }
    
    if (securityFailures.length > 0) {
      console.log(`🎯 セキュリティ: ${securityFailures.length}個失敗`);
      console.log('   → HTMLエスケープ処理の改善が必要\n');
    }
  }
  
  return { passed, failed, failures };
}

// テスト実行
const results = runAdvancedTests();

if (results.failed > 0) {
  console.log('🔴 予想通り、高度な機能のテストが失敗しました。');
  console.log('🔧 これから実装を改善してテストを成功させます。');
  process.exit(1);
} else {
  console.log('🎉 予想外にすべてのテストが成功しました！');
  process.exit(0);
}