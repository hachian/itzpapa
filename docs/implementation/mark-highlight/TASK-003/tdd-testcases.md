# TASK-003: テストケース定義

## テストスイート1: インライン記法との組み合わせ

### TC-001: 太字との組み合わせ
```javascript
{
  name: '太字との組み合わせ',
  input: '==**重要な太字**==',
  expected: '<mark><strong>重要な太字</strong></mark>'
}
```

### TC-002: イタリックとの組み合わせ
```javascript
{
  name: 'イタリックとの組み合わせ',
  input: '==*重要なイタリック*==',
  expected: '<mark><em>重要なイタリック</em></mark>'
}
```

### TC-003: 太字イタリックとの組み合わせ
```javascript
{
  name: '太字イタリックとの組み合わせ',
  input: '==***重要な太字イタリック***==',
  expected: '<mark><strong><em>重要な太字イタリック</em></strong></mark>'
}
```

### TC-004: リンクとの組み合わせ
```javascript
{
  name: 'リンクとの組み合わせ',
  input: '==[重要なリンク](https://example.com)==',
  expected: '<mark><a href="https://example.com">重要なリンク</a></mark>'
}
```

### TC-005: コードとの組み合わせ（処理しない）
```javascript
{
  name: 'コードとの組み合わせ（処理しない）',
  input: '==`コード`==',
  expected: '<mark><code>コード</code></mark>'
}
```

## テストスイート2: 複数ハイライトの処理

### TC-006: 3個のハイライト
```javascript
{
  name: '3個のハイライト',
  input: '==最初== と ==二番目== と ==三番目==',
  expected: '<mark>最初</mark> と <mark>二番目</mark> と <mark>三番目</mark>'
}
```

### TC-007: 異なる記法との混在
```javascript
{
  name: '異なる記法との混在',
  input: '==ハイライト== と **太字** と ==*イタリック*==',
  expected: '<mark>ハイライト</mark> と <strong>太字</strong> と <mark><em>イタリック</em></mark>'
}
```

### TC-008: 長い文章での複数ハイライト
```javascript
{
  name: '長い文章での複数ハイライト',
  input: 'これは ==最初の重要== な部分で、次に ==二番目の重要== な部分があります。最後に ==三番目の重要== な部分です。',
  expected: 'これは <mark>最初の重要</mark> な部分で、次に <mark>二番目の重要</mark> な部分があります。最後に <mark>三番目の重要</mark> な部分です。'
}
```

## テストスイート3: エッジケース

### TC-009: 空白を含むハイライト
```javascript
{
  name: '空白を含むハイライト',
  input: '== 空白付き ==',
  expected: '<mark>空白付き</mark>'
}
```

### TC-010: 日本語ハイライト
```javascript
{
  name: '日本語ハイライト',
  input: '==重要な日本語テキスト==',
  expected: '<mark>重要な日本語テキスト</mark>'
}
```

### TC-011: 数字と記号
```javascript
{
  name: '数字と記号を含むハイライト',
  input: '==価格: $29.99==',
  expected: '<mark>価格: $29.99</mark>'
}
```

### TC-012: ネストしたハイライト（処理しない）
```javascript
{
  name: 'ネストしたハイライト（処理しない）',
  input: '==外側 ==内側== 外側==',
  expected: '==外側 <mark>内側</mark> 外側=='
}
```

## テストスイート4: セキュリティ

### TC-013: HTMLタグのエスケープ
```javascript
{
  name: 'HTMLタグのエスケープ',
  input: '==<script>alert("xss")</script>==',
  expected: '<mark>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</mark>'
}
```

### TC-014: 属性付きHTMLタグのエスケープ
```javascript
{
  name: '属性付きHTMLタグのエスケープ',
  input: '==<div onclick="alert()">危険</div>==',
  expected: '<mark>&lt;div onclick=&quot;alert()&quot;&gt;危険&lt;/div&gt;</mark>'
}
```

## テストスイート5: パフォーマンス

### TC-015: 大量のハイライト
```javascript
{
  name: '大量のハイライト（10個）',
  input: '==1== ==2== ==3== ==4== ==5== ==6== ==7== ==8== ==9== ==10==',
  expected: '<mark>1</mark> <mark>2</mark> <mark>3</mark> <mark>4</mark> <mark>5</mark> <mark>6</mark> <mark>7</mark> <mark>8</mark> <mark>9</mark> <mark>10</mark>'
}
```

### TC-016: 長いテキストのハイライト
```javascript
{
  name: '長いテキストのハイライト',
  input: '==これは非常に長いテキストで、パフォーマンステストのために使用されます。このテキストは100文字を超える長さになっています。==',
  expected: '<mark>これは非常に長いテキストで、パフォーマンステストのために使用されます。このテキストは100文字を超える長さになっています。</mark>'
}
```

## 実行計画

### フェーズ1: 基本テスト（TC-001 〜 TC-005）
- インライン記法との組み合わせを確認
- 現在の実装で失敗することを確認

### フェーズ2: 拡張テスト（TC-006 〜 TC-012）  
- 複数ハイライトとエッジケースを確認
- 実装改善後に成功することを確認

### フェーズ3: セキュリティテスト（TC-013 〜 TC-014）
- セキュリティ要件の確認
- HTMLエスケープの動作確認

### フェーズ4: パフォーマンステスト（TC-015 〜 TC-016）
- 処理速度の確認
- メモリ使用量の確認

## 自動化されたテスト実行

```bash
# 基本テスト
npm run test:mark-highlight:basic

# 拡張テスト  
npm run test:mark-highlight:extended

# セキュリティテスト
npm run test:mark-highlight:security

# パフォーマンステスト
npm run test:mark-highlight:performance

# 全テスト
npm run test:mark-highlight
```