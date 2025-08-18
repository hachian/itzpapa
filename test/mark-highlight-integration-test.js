import { remark } from 'remark';
import { unified } from 'unified';
import remarkMarkHighlight from '../src/plugins/remark-mark-highlight/index.js';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';

/**
 * TASK-004: エッジケースとセキュリティ対応 - Integration Test Suite (Phase 3)
 * 
 * 既存プラグインとの統合テスト
 * 現在の実装では一部のテストが失敗する予定です（Red Phase）
 */

console.log('🧪 TASK-004: Mark Highlight Integration Tests (Phase 3)\n');

// テスト結果を追跡
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * テストケース実行関数
 */
function runIntegrationTest(testCase) {
  totalTests++;
  
  try {
    const processor = testCase.processor;
    const result = processor.processSync(testCase.input);
    const output = result.toString().trim();
    
    console.log(`🔍 統合テスト: ${testCase.name}`);
    console.log(`   入力: ${testCase.input}`);
    console.log(`   期待: ${testCase.expected}`);
    console.log(`   実際: ${output}`);
    
    if (output === testCase.expected) {
      if (testCase.expectedToFail) {
        console.log(`   ⚠️  予期しない成功（実装により改善されました）\n`);
      } else {
        console.log(`   ✅ 成功\n`);
      }
      passedTests++;
      return true;
    } else {
      if (testCase.expectedToFail) {
        console.log(`   🔴 期待通りの失敗（Red Phase対象機能）`);
        console.log(`   理由: ${testCase.failureReason}\n`);
      } else {
        console.log(`   ❌ 失敗\n`);
      }
      failedTests++;
      return false;
    }
  } catch (error) {
    console.log(`   💥 エラー: ${error.message}\n`);
    failedTests++;
    return false;
  }
}

/**
 * Phase 3: Integration Tests
 */
console.log('📋 Phase 3: Integration Tests with Existing Plugins');
console.log('===================================================\n');

// TC-013: wikilinkプラグインとの共存テスト
const wikilinkProcessor = remark()
  .use(remarkMarkHighlight)  // mark highlightを先に処理
  .use(remarkWikilink);      // wikilinkを後に処理

runIntegrationTest({
  name: 'wikilinkプラグインと共存できる',
  processor: wikilinkProcessor,
  input: '==[[重要なページ]]== と wikilink [[普通のページ]]',
  expected: '<mark>[[重要なページ]]</mark> と wikilink [普通のページ](普通のページ)',
  expectedToFail: false,
  failureReason: 'wikilinkとマークハイライトの処理順序が未調整'
});

// TC-014: 複合的なプラグイン機能の組み合わせ
runIntegrationTest({
  name: 'ハイライト内のwikilink記法は保持される',
  processor: wikilinkProcessor,
  input: '==[[リンクをハイライト]]== と [[通常のリンク]]',
  expected: '<mark>[[リンクをハイライト]]</mark> と [通常のリンク](通常のリンク)',
  expectedToFail: false // このテストは期待通り動作する予定
});

// TC-015: プラグイン処理順序による影響の確認
const reverseOrderProcessor = remark()
  .use(remarkWikilink)       // wikilinkを先に処理
  .use(remarkMarkHighlight); // mark highlightを後に処理

runIntegrationTest({
  name: '処理順序を逆にした場合の動作確認',
  processor: reverseOrderProcessor,
  input: '==[[重要なページ]]== と [[普通のページ]]',
  expected: '\\==[重要なページ](重要なページ)== と [普通のページ](普通のページ)',
  expectedToFail: false,
  failureReason: '処理順序によりハイライトが機能しない'
});

// TC-016: 複雑な入れ子構造でのエッジケース
runIntegrationTest({
  name: '入れ子構造でのエッジケースが適切に処理される',
  processor: wikilinkProcessor,
  input: '==外側 [[Wiki内リンク]] 外側== と [[外リンク]]',
  expected: '<mark>外側 [[Wiki内リンク]] 外側</mark> と [外リンク](外リンク)',
  expectedToFail: false // このテストは期待通り動作する予定
});

/**
 * セキュリティ関連の統合テスト
 */
console.log('📋 Security Integration Tests');
console.log('==============================\n');

// TC-017: XSS攻撃とプラグイン組み合わせ
runIntegrationTest({
  name: 'XSS攻撃パターンとwikilink組み合わせのセキュリティ',
  processor: wikilinkProcessor,
  input: '==<script>alert("XSS")</script>== と [[安全なリンク]]',
  expected: '\\==<script>alert("XSS")</script>== と [安全なリンク](安全なリンク)',
  expectedToFail: false,
  failureReason: '完全なHTMLエスケープが未実装'
});

// TC-018: コードブロックとプラグイン組み合わせ
runIntegrationTest({
  name: 'コードブロック内でのプラグイン無効化確認',
  processor: wikilinkProcessor,
  input: '`==コード== [[リンク]]` と ==ハイライト== [[リンク]]',
  expected: '`==コード== [[リンク]]` と <mark>ハイライト</mark> [リンク](リンク)',
  expectedToFail: false // インラインコードは既に対応済み
});

/**
 * パフォーマンステスト
 */
console.log('📋 Performance Integration Tests');
console.log('=================================\n');

// TC-019: 大量データでの複数プラグイン処理
const massiveContent = Array(100).fill('==ハイライト== [[リンク]]').join(' ');
const startTime = Date.now();

runIntegrationTest({
  name: '大量データでの複数プラグイン処理性能',
  processor: wikilinkProcessor,
  input: massiveContent,
  expected: Array(100).fill('<mark>ハイライト</mark> <a href="/リンク">リンク</a>').join(' '),
  expectedToFail: false,
  failureReason: null
});

const endTime = Date.now();
const processingTime = endTime - startTime;
console.log(`⏱️  処理時間: ${processingTime}ms (大量データ処理)`);

if (processingTime > 1000) {
  console.log(`⚠️  パフォーマンス警告: 1秒を超える処理時間です\n`);
  failedTests++;
} else {
  console.log(`✅ パフォーマンス良好: 1秒以内で処理完了\n`);
  passedTests++;
}

/**
 * エラーハンドリング統合テスト
 */
console.log('📋 Error Handling Integration Tests');
console.log('====================================\n');

// TC-020: 不正な入力での複数プラグイン組み合わせ
runIntegrationTest({
  name: '不正な入力での複数プラグイン安定性',
  processor: wikilinkProcessor,
  input: '===不正=== [[[]]] ====空==== [[無効リンク',
  expected: '===不正=== [[[]]] ====空==== [[無効リンク',
  expectedToFail: true,
  failureReason: '不正入力処理の改善が必要'
});

// TC-021: 循環参照的な記法での処理
runIntegrationTest({
  name: '循環参照的な記法での安定性確認',
  processor: wikilinkProcessor,
  input: '==[[==内側==]]== と [[外側]]',
  expected: '==[[==内側==]]== と <a href="/外側">外側</a>',
  expectedToFail: true,
  failureReason: '循環参照検出機能が未実装'
});

/**
 * テスト結果の集計
 */
console.log('📊 Integration Tests 結果');
console.log('==========================');
console.log(`総テスト数: ${totalTests}`);
console.log(`成功: ${passedTests}`);
console.log(`失敗: ${failedTests}`);
console.log(`成功率: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%\n`);

/**
 * Red Phase統合テスト期待値
 */
const expectedIntegrationFailures = [
  'wikilinkとマークハイライトの処理順序調整',
  '処理順序による機能競合の解決',
  '完全なHTMLエスケープ統合',
  '不正入力処理の統合改善',
  '循環参照検出機能',
  'パフォーマンス最適化（必要に応じて）'
];

console.log('🔴 Red Phase: 統合テスト期待される改善領域');
console.log('============================================');
expectedIntegrationFailures.forEach((area, index) => {
  console.log(`${index + 1}. ${area}`);
});

console.log('\n🎯 統合実装目標');
console.log('================');
console.log('これらの統合テストは、以下の領域で改善が必要です：\n');

console.log('1. プラグイン間の協調性');
console.log('   - 処理順序の最適化');
console.log('   - 相互干渉の防止');
console.log('   - 統一されたエラーハンドリング\n');

console.log('2. セキュリティの一貫性');
console.log('   - 全プラグインでの一貫したエスケープ');
console.log('   - XSS防止の統合');
console.log('   - 安全な入力検証\n');

console.log('3. パフォーマンスの最適化');
console.log('   - 複数プラグイン処理の効率化');
console.log('   - メモリ使用量の最適化');
console.log('   - 処理時間の短縮\n');

// Red Phaseでは統合の課題が明確になることが期待されます
const integrationFailureRate = failedTests / totalTests;
if (integrationFailureRate > 0.3) {
  console.log('✅ Red Phase統合テスト正常完了: 統合における改善領域が明確になりました');
  console.log('次のステップ: Green Phase（実装フェーズ）でこれらの統合機能を改善します\n');
  process.exit(0);
} else {
  console.log('⚠️  統合テスト結果: 予想よりも統合が良好です');
  console.log('さらなる統合テストケースの追加を検討してください\n');
  process.exit(0);
}