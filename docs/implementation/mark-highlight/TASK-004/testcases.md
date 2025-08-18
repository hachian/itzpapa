# TASK-004: エッジケースとセキュリティ対応 - テストケース定義

## 1. 単体テスト（Unit Tests）

### 1.1 コードブロック無視機能のテスト

#### TC-001: インラインコードブロック内の無視
```javascript
{
  name: 'インラインコードブロック内のハイライト記法は無視される',
  input: 'このコード `==ハイライトしない==` は処理されません',
  expected: 'このコード `==ハイライトしない==` は処理されません',
  purpose: 'インラインコード内の==記法が処理されないことを確認',
  precondition: 'remarkプラグインが正常に動作している',
  testSteps: [
    '1. インラインコードを含むテキストを入力',
    '2. プラグインで処理',
    '3. コード内の==が変換されていないことを確認'
  ]
}
```

#### TC-002: ブロックコード内の無視
```javascript
{
  name: 'ブロックコード内のハイライト記法は無視される',
  input: '```javascript\nfunction test() {\n  return "==ハイライトしない==";\n}\n```',
  expected: '```javascript\nfunction test() {\n  return "==ハイライトしない==";\n}\n```',
  purpose: 'コードブロック内の==記法が処理されないことを確認',
  precondition: 'remarkプラグインが正常に動作している',
  testSteps: [
    '1. コードブロックを含むマークダウンを入力',
    '2. プラグインで処理',
    '3. コードブロック内の==が変換されていないことを確認'
  ]
}
```

#### TC-003: HTMLコードタグ内の無視
```javascript
{
  name: 'HTMLコードタグ内のハイライト記法は無視される',
  input: 'このHTMLコード <code>==ハイライトしない==</code> は処理されません',
  expected: 'このHTMLコード <code>==ハイライトしない==</code> は処理されません',
  purpose: 'HTMLのcodeタグ内の==記法が処理されないことを確認',
  precondition: 'HTMLパーサーとの連携が正常に動作している',
  testSteps: [
    '1. HTMLのcodeタグを含むテキストを入力',
    '2. プラグインで処理',
    '3. codeタグ内の==が変換されていないことを確認'
  ]
}
```

### 1.2 HTMLエスケープ処理のテスト

#### TC-004: 基本的なHTMLエスケープ
```javascript
{
  name: '基本的なHTML文字が適切にエスケープされる',
  input: '==<div>テスト&"test"</div>==',
  expected: '<mark>&lt;div&gt;テスト&amp;&quot;test&quot;&lt;/div&gt;</mark>',
  purpose: '危険なHTML文字の適切なエスケープを確認',
  precondition: 'escapeHtml関数が実装されている',
  testSteps: [
    '1. HTML文字を含むハイライト記法を入力',
    '2. プラグインで処理',
    '3. 全てのHTML文字がエスケープされていることを確認'
  ]
}
```

#### TC-005: スクリプトタグのエスケープ
```javascript
{
  name: 'スクリプトタグが完全に無効化される',
  input: '==<script>alert(\'XSS\')</script>==',
  expected: '<mark>&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;</mark>',
  purpose: 'スクリプトタグの完全な無効化を確認',
  precondition: 'セキュリティ対策が実装されている',
  testSteps: [
    '1. スクリプトタグを含むハイライト記法を入力',
    '2. プラグインで処理',
    '3. スクリプトタグが実行可能でないことを確認'
  ]
}
```

#### TC-006: イベントハンドラーのエスケープ
```javascript
{
  name: 'イベントハンドラー属性が無効化される',
  input: '==<div onclick="alert(\'XSS\')" onload="malicious()">クリック</div>==',
  expected: '<mark>&lt;div onclick=&quot;alert(&#x27;XSS&#x27;)&quot; onload=&quot;malicious()&quot;&gt;クリック&lt;/div&gt;</mark>',
  purpose: 'イベントハンドラー属性の無効化を確認',
  precondition: 'イベントハンドラー検出機能が実装されている',
  testSteps: [
    '1. イベントハンドラーを含むHTMLタグを入力',
    '2. プラグインで処理',
    '3. イベントハンドラーが実行可能でないことを確認'
  ]
}
```

### 1.3 不正記法ハンドリングのテスト

#### TC-007: 奇数個の等号の処理
```javascript
{
  name: '奇数個の等号は処理されない',
  input: '===テスト=== と =====テスト===== を確認',
  expected: '===テスト=== と =====テスト===== を確認',
  purpose: '奇数個の等号パターンの無視を確認',
  precondition: '正規表現パターンが改良されている',
  testSteps: [
    '1. 奇数個の等号を含むテキストを入力',
    '2. プラグインで処理',
    '3. 変換されていないことを確認'
  ]
}
```

#### TC-008: 空の記法の処理
```javascript
{
  name: '空の記法は処理されない',
  input: '==== と == == と ==   == を確認',
  expected: '==== と == == と ==   == を確認',
  purpose: '空の記法パターンの無視を確認',
  precondition: '内容検証が強化されている',
  testSteps: [
    '1. 空の記法パターンを含むテキストを入力',
    '2. プラグインで処理',
    '3. 変換されていないことを確認'
  ]
}
```

#### TC-009: 改行を含む記法の処理
```javascript
{
  name: '改行を含む記法は処理されない',
  input: '==テスト\n改行==',
  expected: '==テスト\n改行==',
  purpose: '改行を含む記法の無視を確認',
  precondition: '正規表現に改行除外パターンが追加されている',
  testSteps: [
    '1. 改行を含む記法を入力',
    '2. プラグインで処理',
    '3. 変換されていないことを確認'
  ]
}
```

#### TC-010: ネストした記法の処理
```javascript
{
  name: 'ネストした記法は処理されない',
  input: '====テスト==== と ======テスト====== を確認',
  expected: '====テスト==== と ======テスト====== を確認',
  purpose: 'ネストパターンの無視を確認',
  precondition: '開始・終了パターンの厳密な判定が実装されている',
  testSteps: [
    '1. ネストした記法を入力',
    '2. プラグインで処理',
    '3. 変換されていないことを確認'
  ]
}
```

### 1.4 セキュリティ対策のテスト

#### TC-011: データURIスキームの無効化
```javascript
{
  name: 'データURIスキームが無効化される',
  input: '==<a href="javascript:alert(\'XSS\')">リンク</a>==',
  expected: '<mark>&lt;a href=&quot;javascript:alert(&#x27;XSS&#x27;)&quot;&gt;リンク&lt;/a&gt;</mark>',
  purpose: 'データURIスキームの無効化を確認',
  precondition: 'XSS攻撃パターンの検出が実装されている',
  testSteps: [
    '1. データURIスキームを含むリンクを入力',
    '2. プラグインで処理',
    '3. 実行可能でないことを確認'
  ]
}
```

#### TC-012: HTMLエンティティによる回避の防止
```javascript
{
  name: 'HTMLエンティティによる回避が防止される',
  input: '==&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;==',
  expected: '<mark>&amp;lt;script&amp;gt;alert(&amp;quot;XSS&amp;quot;)&amp;lt;/script&amp;gt;</mark>',
  purpose: 'HTMLエンティティによる回避の防止を確認',
  precondition: 'エンティティデコード防止機能が実装されている',
  testSteps: [
    '1. HTMLエンティティを含むテキストを入力',
    '2. プラグインで処理',
    '3. 二重エスケープされていることを確認'
  ]
}
```

## 2. 統合テスト（Integration Tests）

### 2.1 既存プラグインとの組み合わせテスト

#### TC-013: wikilinkプラグインとの共存
```javascript
{
  name: 'wikilinkプラグインと共存できる',
  input: '==[[重要なページ]]==とwikilink [[普通のページ]]',
  expected: '<mark>[[重要なページ]]</mark>とwikilink <a href="/普通のページ">普通のページ</a>',
  purpose: 'wikilinkプラグインとの処理順序の確認',
  precondition: 'wikilinkプラグインが有効になっている',
  testSteps: [
    '1. ハイライトとwikilinkを含むテキストを入力',
    '2. 両プラグインで処理',
    '3. 正しく変換されていることを確認'
  ]
}
```

#### TC-014: calloutプラグインとの共存
```javascript
{
  name: 'calloutプラグインと共存できる',
  input: '> [!INFO] ==重要な情報==\n> 詳細説明',
  expected: '<blockquote class="callout callout-info">\n<p><mark>重要な情報</mark></p>\n<p>詳細説明</p>\n</blockquote>',
  purpose: 'calloutプラグインとの処理順序の確認',
  precondition: 'calloutプラグインが有効になっている',
  testSteps: [
    '1. callout内でハイライトを使用',
    '2. 両プラグインで処理',
    '3. 正しく変換されていることを確認'
  ]
}
```

### 2.2 複合的なエッジケースのテスト

#### TC-015: 複数の問題を含む入力
```javascript
{
  name: '複数の問題を含む入力が適切に処理される',
  input: '===不正=== `==コード==` ==<script>alert("XSS")</script>== ==正常==',
  expected: '===不正=== `==コード==` <mark>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</mark> <mark>正常</mark>',
  purpose: '複数のエッジケースが同時に発生した場合の処理確認',
  precondition: '全ての単体テストが成功している',
  testSteps: [
    '1. 複数の問題パターンを含むテキストを入力',
    '2. プラグインで処理',
    '3. 各パターンが適切に処理されていることを確認'
  ]
}
```

#### TC-016: 入れ子構造でのエッジケース
```javascript
{
  name: '入れ子構造でのエッジケースが適切に処理される',
  input: '==外側 `コード ==内側==` 外側==',
  expected: '==外側 `コード ==内側==` 外側==',
  purpose: '複雑な入れ子構造での処理確認',
  precondition: 'コードブロック無視機能が実装されている',
  testSteps: [
    '1. 複雑な入れ子構造を含むテキストを入力',
    '2. プラグインで処理',
    '3. 適切に無視されていることを確認'
  ]
}
```

## 3. セキュリティテスト（Security Tests）

### 3.1 XSS攻撃パターンのテスト

#### TC-017: Reflected XSS防止
```javascript
{
  name: 'Reflected XSS攻撃が防止される',
  input: '==<img src=x onerror=alert("XSS")>==',
  expected: '<mark>&lt;img src=x onerror=alert(&quot;XSS&quot;)&gt;</mark>',
  purpose: 'Reflected XSS攻撃の防止を確認',
  precondition: 'XSS防止機能が実装されている',
  testSteps: [
    '1. Reflected XSS攻撃パターンを入力',
    '2. プラグインで処理',
    '3. 攻撃が無効化されていることを確認'
  ]
}
```

#### TC-018: Stored XSS防止
```javascript
{
  name: 'Stored XSS攻撃が防止される',
  input: '==<svg onload=alert("XSS")></svg>==',
  expected: '<mark>&lt;svg onload=alert(&quot;XSS&quot;)&gt;&lt;/svg&gt;</mark>',
  purpose: 'Stored XSS攻撃の防止を確認',
  precondition: 'XSS防止機能が実装されている',
  testSteps: [
    '1. Stored XSS攻撃パターンを入力',
    '2. プラグインで処理',
    '3. 攻撃が無効化されていることを確認'
  ]
}
```

#### TC-019: DOM-based XSS防止
```javascript
{
  name: 'DOM-based XSS攻撃が防止される',
  input: '==<iframe src="javascript:alert(\'XSS\')"></iframe>==',
  expected: '<mark>&lt;iframe src=&quot;javascript:alert(&#x27;XSS&#x27;)&quot;&gt;&lt;/iframe&gt;</mark>',
  purpose: 'DOM-based XSS攻撃の防止を確認',
  precondition: 'XSS防止機能が実装されている',
  testSteps: [
    '1. DOM-based XSS攻撃パターンを入力',
    '2. プラグインで処理',
    '3. 攻撃が無効化されていることを確認'
  ]
}
```

### 3.2 入力検証のテスト

#### TC-020: 極端に長い文字列の処理
```javascript
{
  name: '極端に長い文字列が適切に処理される',
  input: '==' + 'A'.repeat(10000) + '==',
  expected: '<mark>' + 'A'.repeat(10000) + '</mark>',
  purpose: '長い文字列での安定性確認',
  precondition: '文字列長制限が実装されている',
  testSteps: [
    '1. 10,000文字の長い文字列を入力',
    '2. プラグインで処理',
    '3. 正常に処理されることを確認',
    '4. メモリリークが発生しないことを確認'
  ]
}
```

#### TC-021: 制御文字の除外
```javascript
{
  name: '制御文字が適切に除外される',
  input: '==テスト\x00\x01\x02==',
  expected: '<mark>テスト</mark>',
  purpose: '制御文字の除外確認',
  precondition: '制御文字除外機能が実装されている',
  testSteps: [
    '1. 制御文字を含むテキストを入力',
    '2. プラグインで処理',
    '3. 制御文字が除外されていることを確認'
  ]
}
```

### 3.3 エスケープ処理の確認

#### TC-022: 二重エスケープの防止
```javascript
{
  name: '二重エスケープが防止される',
  input: '==&lt;script&gt;==',
  expected: '<mark>&amp;lt;script&amp;gt;</mark>',
  purpose: '二重エスケープの適切な処理確認',
  precondition: 'エスケープ処理が正しく実装されている',
  testSteps: [
    '1. 既にエスケープされた文字列を入力',
    '2. プラグインで処理',
    '3. 適切にエスケープされていることを確認'
  ]
}
```

## 4. パフォーマンステスト（Performance Tests）

### 4.1 処理時間の測定

#### TC-023: 1000文字での処理時間測定
```javascript
{
  name: '1000文字、10個ハイライトの処理時間が100ms以下',
  input: generateTestString(1000, 10), // 1000文字、10個のハイライト
  expected: '処理時間 <= 100ms',
  purpose: '基本的なパフォーマンス要件の確認',
  precondition: 'パフォーマンス測定機能が実装されている',
  testSteps: [
    '1. 1000文字、10個ハイライトのテキストを生成',
    '2. 処理時間を測定しながらプラグインで処理',
    '3. 処理時間が100ms以下であることを確認'
  ]
}
```

#### TC-024: 大量ハイライトでの処理時間測定
```javascript
{
  name: '10,000個のハイライトが5秒以下で処理される',
  input: generateMassiveHighlights(10000), // 10,000個のハイライト
  expected: '処理時間 <= 5000ms',
  purpose: '大量データでの処理性能確認',
  precondition: 'パフォーマンス測定機能が実装されている',
  testSteps: [
    '1. 10,000個のハイライトを含むテキストを生成',
    '2. 処理時間を測定しながらプラグインで処理',
    '3. 処理時間が5秒以下であることを確認'
  ]
}
```

### 4.2 メモリ使用量の確認

#### TC-025: メモリ使用量の測定
```javascript
{
  name: 'メモリ使用量が既存実装比110%以下',
  input: generateTestString(5000, 50), // 5000文字、50個のハイライト
  expected: 'メモリ増加率 <= 110%',
  purpose: 'メモリ効率の確認',
  precondition: 'メモリ測定機能が実装されている',
  testSteps: [
    '1. 処理前のメモリ使用量を測定',
    '2. 大量のハイライトを含むテキストを処理',
    '3. 処理後のメモリ使用量を測定',
    '4. 増加率が110%以下であることを確認'
  ]
}
```

#### TC-026: メモリリークの検出
```javascript
{
  name: 'メモリリークが発生しない',
  input: 'repeatProcessing(1000)', // 1000回の処理を繰り返し
  expected: 'メモリ使用量が安定している',
  purpose: 'メモリリークの検出',
  precondition: 'メモリ監視機能が実装されている',
  testSteps: [
    '1. 初期メモリ使用量を記録',
    '2. 1000回の処理を繰り返し実行',
    '3. 各処理後のメモリ使用量を記録',
    '4. メモリリークが発生していないことを確認'
  ]
}
```

## 5. エラーハンドリングテスト

### 5.1 例外処理のテスト

#### TC-027: 不正なUnicode文字の処理
```javascript
{
  name: '不正なUnicode文字が適切に処理される',
  input: '==テスト\uFFFF\uFFFE==',
  expected: '<mark>テスト</mark>', // 不正文字は除去される
  purpose: '不正なUnicodeに対する耐性確認',
  precondition: 'Unicode検証機能が実装されている',
  testSteps: [
    '1. 不正なUnicode文字を含むテキストを入力',
    '2. プラグインで処理',
    '3. エラーが発生せず、適切に処理されることを確認'
  ]
}
```

#### TC-028: システム例外でのフォールバック
```javascript
{
  name: 'システム例外でフォールバック処理が実行される',
  input: 'mockSystemError()', // システムエラーをモック
  expected: '元のテキストがそのまま返される',
  purpose: '例外発生時のフォールバック動作確認',
  precondition: 'フォールバック機能が実装されている',
  testSteps: [
    '1. システムエラーを発生させる',
    '2. プラグインで処理',
    '3. フォールバック処理が実行されることを確認',
    '4. エラーログが出力されることを確認'
  ]
}
```

## 6. CSP準拠テスト

### 6.1 CSP違反の検出

#### TC-029: インラインスクリプトの不使用確認
```javascript
{
  name: '生成されるHTMLにインラインスクリプトが含まれない',
  input: '==<div onclick="test()">テスト</div>==',
  expected: 'インラインスクリプトが含まれない',
  purpose: 'CSP準拠の確認',
  precondition: 'CSP検証機能が実装されている',
  testSteps: [
    '1. インラインスクリプトを含む可能性のある入力を処理',
    '2. 生成されるHTMLを検証',
    '3. インラインスクリプトが含まれていないことを確認'
  ]
}
```

#### TC-030: 外部リソースへの不正参照の防止
```javascript
{
  name: '外部リソースへの不正な参照が防止される',
  input: '==<link rel="stylesheet" href="http://malicious.com/style.css">==',
  expected: 'エスケープされた安全なHTML',
  purpose: '外部リソース参照の防止確認',
  precondition: '外部リソース検証機能が実装されている',
  testSteps: [
    '1. 外部リソースを参照する要素を入力',
    '2. プラグインで処理',
    '3. 外部リソースが参照されないことを確認'
  ]
}
```

## テスト実行計画

### フェーズ1: 単体テスト（TC-001 ～ TC-012）
- **目的**: 各機能の個別動作確認
- **期間**: 2日間
- **成功基準**: 全テスト成功率100%

### フェーズ2: 統合テスト（TC-013 ～ TC-016）
- **目的**: 既存プラグインとの互換性確認
- **期間**: 1日間
- **成功基準**: 既存機能に影響なし

### フェーズ3: セキュリティテスト（TC-017 ～ TC-022）
- **目的**: セキュリティ要件の達成確認
- **期間**: 2日間
- **成功基準**: 全XSS攻撃パターンの無効化

### フェーズ4: パフォーマンステスト（TC-023 ～ TC-026）
- **目的**: 性能要件の達成確認
- **期間**: 1日間
- **成功基準**: 全パフォーマンス目標の達成

### フェーズ5: エラーハンドリング・CSPテスト（TC-027 ～ TC-030）
- **目的**: 品質と準拠性の確認
- **期間**: 1日間
- **成功基準**: 全エラーケースでの安定動作

## 自動化テストスクリプト

### テスト実行コマンド
```bash
# 単体テスト
npm run test:mark-highlight:unit

# 統合テスト
npm run test:mark-highlight:integration

# セキュリティテスト
npm run test:mark-highlight:security

# パフォーマンステスト
npm run test:mark-highlight:performance

# エラーハンドリングテスト
npm run test:mark-highlight:error

# CSPテスト
npm run test:mark-highlight:csp

# 全テスト
npm run test:mark-highlight:task-004
```

### 継続的インテグレーション設定
```yaml
# .github/workflows/task-004-tests.yml
name: TASK-004 Mark Highlight Security Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:mark-highlight:task-004
      - run: npm run test:security-scan
      - run: npm run test:performance-benchmark
```

## 成功基準

### 機能要件達成
- [ ] 全単体テスト成功（TC-001 ～ TC-012）
- [ ] 全統合テスト成功（TC-013 ～ TC-016）

### セキュリティ要件達成
- [ ] 全XSS攻撃パターンが無効化（TC-017 ～ TC-019）
- [ ] 入力検証が正常動作（TC-020 ～ TC-021）
- [ ] エスケープ処理が適切（TC-022）

### パフォーマンス要件達成
- [ ] 処理時間要件を満たす（TC-023 ～ TC-024）
- [ ] メモリ使用量要件を満たす（TC-025 ～ TC-026）

### 品質要件達成
- [ ] エラーハンドリングが適切（TC-027 ～ TC-028）
- [ ] CSP準拠を満たす（TC-029 ～ TC-030）
- [ ] テストカバレッジ95%以上
- [ ] 既存機能との互換性維持

## 実装支援関数

### テストデータ生成関数
```javascript
// 大量のテストデータを生成する関数
function generateTestString(length, highlightCount) {
  // length文字でhighlightCount個のハイライトを含む文字列を生成
}

function generateMassiveHighlights(count) {
  // count個のハイライトを含む文字列を生成
}

function mockSystemError() {
  // システムエラーをモックする関数
}
```

### パフォーマンス測定関数
```javascript
function measureProcessingTime(input, processor) {
  const start = performance.now();
  const result = processor.processSync(input);
  const end = performance.now();
  return {
    result,
    time: end - start
  };
}

function measureMemoryUsage(callback) {
  // メモリ使用量を測定する関数
}
```