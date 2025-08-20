# TASK-101: TagBadgeコンポーネント - テストケース定義

## 単体テストケース

### 1. 基本レンダリングテスト

#### TC-101-001: 基本的なタグ表示
```javascript
describe('TagBadge基本レンダリング', () => {
  test('タグ名が正しく表示される', () => {
    // Given: タグ名 "JavaScript"
    // When: TagBadgeをレンダリング
    // Then: "#JavaScript" が表示される
  });
  
  test('リンクなしの場合spanとして表示される', () => {
    // Given: hrefプロパティなし
    // When: TagBadgeをレンダリング
    // Then: span要素が生成される
  });
  
  test('リンクありの場合aタグとして表示される', () => {
    // Given: href="/tags/javascript"
    // When: TagBadgeをレンダリング
    // Then: a要素が生成される
  });
});
```

#### TC-101-002: スタイル統一テスト
```javascript
describe('スタイル統一', () => {
  test('階層タグと単一タグが同じCSSクラスを使用する', () => {
    // Given: isHierarchical=true と isHierarchical=false
    // When: 両方をレンダリング
    // Then: 同じ基本CSSクラス "tag" が適用される
  });
  
  test('階層タグ用の特別なクラスが追加されない', () => {
    // Given: isHierarchical=true
    // When: TagBadgeをレンダリング
    // Then: "tag-hierarchical" クラスが適用されない
  });
});
```

### 2. カウント表示テスト

#### TC-101-003: タグカウント表示
```javascript
describe('タグカウント表示', () => {
  test('カウントありの場合、カウントが表示される', () => {
    // Given: count=5
    // When: TagBadgeをレンダリング
    // Then: "5" がカウント要素に表示される
  });
  
  test('カウント0の場合、カウントが表示されない', () => {
    // Given: count=0
    // When: TagBadgeをレンダリング
    // Then: カウント要素が表示されない
  });
  
  test('カウント未定義の場合、カウントが表示されない', () => {
    // Given: count=undefined
    // When: TagBadgeをレンダリング
    // Then: カウント要素が表示されない
  });
});
```

### 3. アクセシビリティテスト

#### TC-101-004: ARIA属性テスト
```javascript
describe('アクセシビリティ', () => {
  test('リンクの場合、role="link"が設定される', () => {
    // Given: href="/tags/test"
    // When: TagBadgeをレンダリング
    // Then: role="link" が設定される
  });
  
  test('非リンクの場合、role="text"が設定される', () => {
    // Given: hrefなし
    // When: TagBadgeをレンダリング
    // Then: role="text" が設定される
  });
  
  test('aria-labelが適切に設定される', () => {
    // Given: tag="JavaScript", count=5
    // When: TagBadgeをレンダリング
    // Then: aria-label="タグ: JavaScript (5個の記事)" が設定される
  });
  
  test('カスタムaria-labelが優先される', () => {
    // Given: ariaLabel="カスタムラベル"
    // When: TagBadgeをレンダリング
    // Then: aria-label="カスタムラベル" が設定される
  });
});
```

### 4. CSS変数使用テスト

#### TC-101-005: CSS変数適用テスト
```javascript
describe('CSS変数使用', () => {
  test('背景色にCSS変数が使用される', () => {
    // Given: TagBadgeコンポーネント
    // When: スタイルを確認
    // Then: background-color: var(--tag-bg) が設定される
  });
  
  test('文字色にCSS変数が使用される', () => {
    // Given: TagBadgeコンポーネント
    // When: スタイルを確認
    // Then: color: var(--tag-color) が設定される
  });
  
  test('ボーダーにCSS変数が使用される', () => {
    // Given: TagBadgeコンポーネント
    // When: スタイルを確認
    // Then: border: 1px solid var(--tag-border) が設定される
  });
});
```

## ビジュアルテストケース

### 1. 表示統一テスト

#### VT-101-001: スタイル統一確認
```javascript
describe('ビジュアル統一テスト', () => {
  test('階層タグと単一タグが同じ見た目になる', async () => {
    // Given: 階層タグ "Frontend/React" と単一タグ "JavaScript"
    // When: 両方を同じページに表示
    // Then: 視覚的に同じスタイルで表示される
  });
  
  test('ダークモードで適切な色が表示される', async () => {
    // Given: ダークモード有効
    // When: TagBadgeを表示
    // Then: ダークモード用の色が適用される
  });
});
```

### 2. インタラクションテスト

#### VT-101-002: ホバー・フォーカステスト
```javascript
describe('インタラクション効果', () => {
  test('ホバー時にスタイルが変化する', async () => {
    // Given: リンク付きTagBadge
    // When: マウスホバー
    // Then: 背景色、文字色が変更され、Y軸移動とシャドウが適用される
  });
  
  test('フォーカス時にアウトラインが表示される', async () => {
    // Given: リンク付きTagBadge
    // When: キーボードフォーカス
    // Then: 2pxのアウトラインが表示される
  });
});
```

## パフォーマンステストケース

### PT-101-001: レンダリング性能
```javascript
describe('パフォーマンス', () => {
  test('100個のTagBadgeが100ms以内にレンダリングされる', async () => {
    // Given: 100個のタグデータ
    // When: TagBadgeコンポーネントを100個レンダリング
    // Then: 100ms以内に完了する
  });
});
```

## エッジケーステスト

### 1. 異常値テスト

#### ET-101-001: 異常な入力値
```javascript
describe('エッジケース', () => {
  test('空のタグ名の場合エラーにならない', () => {
    // Given: tag=""
    // When: TagBadgeをレンダリング
    // Then: エラーが発生せず、"#" のみ表示される
  });
  
  test('極端に長いタグ名が適切に処理される', () => {
    // Given: 100文字のタグ名
    // When: TagBadgeをレンダリング
    // Then: 省略表示またはツールチップが機能する
  });
  
  test('特殊文字を含むタグ名が適切にエスケープされる', () => {
    // Given: tag="<script>alert('xss')</script>"
    // When: TagBadgeをレンダリング
    // Then: XSS攻撃が防がれる
  });
});
```

## 統合テストケース

### IT-101-001: コンポーネント間連携
```javascript
describe('コンポーネント統合', () => {
  test('TagListで使用時に統一スタイルが適用される', () => {
    // Given: TagList内でTagBadgeを使用
    // When: レンダリング
    // Then: 統一されたスタイルが適用される
  });
  
  test('TagTreeで使用時に統一スタイルが適用される', () => {
    // Given: TagTree内でTagBadgeを使用
    // When: レンダリング
    // Then: 統一されたスタイルが適用される
  });
});
```

## 実装前チェックリスト

- [ ] 現在のTagBadgeコンポーネントの分析完了
- [ ] CSS変数定義の確認完了
- [ ] 既存のスタイルとの互換性確認
- [ ] テストフレームワークの準備完了
- [ ] ビジュアルテストツールの準備完了

## 実装後チェックリスト

- [ ] すべての単体テストが合格
- [ ] ビジュアルテストが合格
- [ ] パフォーマンステストが合格
- [ ] エッジケーステストが合格
- [ ] 統合テストが合格
- [ ] 既存機能に影響がないことを確認
- [ ] アクセシビリティ基準を満たすことを確認