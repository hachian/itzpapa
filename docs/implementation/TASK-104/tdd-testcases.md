# TASK-104: インラインタグ処理の更新 - テストケース定義

## 単体テストケース

### 1. 基本機能テスト

#### TC-104-001: タグ抽出と変換
```javascript
describe('インラインタグ基本機能', () => {
  test('単一タグが正しく抽出される', () => {
    // Given: "これは #JavaScript の記事です"
    // When: processInlineTags()を実行
    // Then: tags=['JavaScript'], htmlにリンクが含まれる
  });
  
  test('複数タグが正しく抽出される', () => {
    // Given: "#React と #TypeScript を使用"
    // When: processInlineTags()を実行  
    // Then: tags=['React', 'TypeScript']
  });
  
  test('階層タグが正しく抽出される', () => {
    // Given: "#tech/web/frontend の技術"
    // When: processInlineTags()を実行
    // Then: tags=['tech/web/frontend']
  });
});
```

### 2. HTML生成テスト

#### TC-104-002: 統一スタイルのHTML生成
```javascript
describe('HTML生成とスタイル統一', () => {
  test('inline-tagクラスが適用される', () => {
    // Given: "#JavaScript"
    // When: processInlineTags()を実行
    // Then: class="inline-tag" が生成される
  });
  
  test('適切なaria-labelが生成される', () => {
    // Given: "#React"  
    // When: processInlineTags()を実行
    // Then: aria-label="Reactタグの記事を表示" が生成される
  });
  
  test('roleがlinkに設定される', () => {
    // Given: "#TypeScript"
    // When: processInlineTags()を実行
    // Then: role="link" が生成される
  });
});
```

### 3. セキュリティテスト

#### TC-104-003: XSS対策とエスケープ処理
```javascript
describe('セキュリティ', () => {
  test('HTMLタグがエスケープされる', () => {
    // Given: "#<script>alert('xss')</script>"
    // When: processInlineTags()を実行
    // Then: script タグがエスケープされる
  });
  
  test('特殊文字がエスケープされる', () => {
    // Given: "#test&<>\"'"
    // When: processInlineTags()を実行
    // Then: 特殊文字が &amp; &lt; &gt; &quot; &#39; に変換される
  });
  
  test('無効なタグ名が処理される', () => {
    // Given: "#123" （数字のみ）
    // When: processInlineTags()を実行
    // Then: そのまま残される（リンク化されない）
  });
});
```

### 4. エッジケーステスト

#### TC-104-004: 境界値と異常ケース
```javascript
describe('エッジケース', () => {
  test('空文字列でエラーが発生しない', () => {
    // Given: ""
    // When: processInlineTags()を実行
    // Then: tags=[], html="" が返される
  });
  
  test('タグがない文章が正しく処理される', () => {
    // Given: "普通の文章です"
    // When: processInlineTags()を実行
    // Then: tags=[], html="普通の文章です" が返される
  });
  
  test('重複タグが適切に処理される', () => {
    // Given: "#React #React #React"
    // When: processInlineTags()を実行
    // Then: tags=['React'] （重複排除）
  });
});
```

## 統合テストケース

### 1. Markdownレンダリングテスト

#### IT-104-001: 実際の記事での動作確認
```javascript
describe('Markdown統合テスト', () => {
  test('記事内のインラインタグが統一スタイルで表示される', async () => {
    // Given: インラインタグを含むMarkdownファイル
    // When: ブラウザで記事を表示
    // Then: TagBadgeと同じスタイルで表示される
  });
  
  test('インラインタグとTagBadgeの視覚的統一', async () => {
    // Given: TagBadgeとインラインタグが同じページに存在
    // When: ブラウザで表示
    // Then: 見た目が統一されている
  });
});
```

## ビジュアルテストケース

### 1. スタイル統一確認

#### VT-104-001: 表示統一テスト
```javascript
describe('ビジュアル統一確認', () => {
  test('インラインタグとTagBadgeが同じ色で表示される', async () => {
    // Given: 同じページ内のインラインタグとTagBadge
    // When: スタイルを比較
    // Then: 背景色、文字色、ボーダーが同じ
  });
  
  test('ホバー効果が統一されている', async () => {
    // Given: インラインタグとTagBadge
    // When: ホバー
    // Then: 同じアニメーション効果
  });
});
```

## パフォーマンステストケース

### PT-104-001: 大量タグ処理性能
```javascript
describe('パフォーマンス', () => {
  test('100個のインラインタグが100ms以内に処理される', () => {
    // Given: 100個のタグを含む長い文章
    // When: processInlineTags()を実行
    // Then: 100ms以内に完了
  });
  
  test('正規表現処理が効率的', () => {
    // Given: 10000文字の文章に50個のタグ
    // When: processInlineTags()を実行
    // Then: 50ms以内に完了
  });
});
```

## 実装前チェックリスト

- [ ] 現在のinline-tags.tsの動作分析完了
- [ ] 生成されるHTMLの構造確認
- [ ] CSS変数定義の確認
- [ ] セキュリティ要件の理解
- [ ] パフォーマンス要件の確認

## 実装後チェックリスト

- [ ] すべての単体テストが合格
- [ ] セキュリティテストが合格
- [ ] パフォーマンステストが合格
- [ ] エッジケーステストが合格
- [ ] 統合テストが合格
- [ ] ビジュアルテストでスタイル統一確認
- [ ] 既存のインラインタグ機能に影響がないことを確認