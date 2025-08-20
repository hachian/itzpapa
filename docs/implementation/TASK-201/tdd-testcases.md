# TASK-201: グローバルCSS整理と統一 - テストケース定義

## 単体テストケース

### 1. CSS重複除去テスト

#### TC-201-001: tag.css重複除去
```javascript
describe('tag.css重複除去', () => {
  test('ダークモード定義が除去されている', () => {
    // Given: tag.cssファイル
    // When: ファイル内容を確認
    // Then: html.dark .tag定義が存在しない
  });
  
  test('階層タグ重複定義が除去されている', () => {
    // Given: tag.cssファイル
    // When: ファイル内容を確認
    // Then: .tag-hierarchical定義が存在しない
  });
});
```

#### TC-201-002: global.css重複除去
```javascript
describe('global.css重複除去', () => {
  test('古いタグリスト定義が除去されている', () => {
    // Given: global.cssファイル
    // When: ファイル内容を確認
    // Then: .tag-list定義が存在しない
  });
  
  test('タグクラウド定義が除去されている', () => {
    // Given: global.cssファイル
    // When: ファイル内容を確認
    // Then: .tag-cloud定義が存在しない
  });
});
```

### 2. 変数統一テスト

#### TC-201-003: 変数システム統一
```javascript
describe('変数システム統一', () => {
  test('mark要素の色が変数化されている', () => {
    // Given: global.cssのmark要素
    // When: スタイル定義を確認
    // Then: ハードコーディング色が変数に置換されている
  });
  
  test('アクセント色が統一変数を使用', () => {
    // Given: 全CSSファイル
    // When: アクセント色定義を確認
    // Then: 統一された変数が使用されている
  });
});
```

### 3. ファイル分離テスト

#### TC-201-004: 独立ファイル作成
```javascript
describe('ファイル分離', () => {
  test('mark.cssが独立している', () => {
    // Given: src/styles/mark.css
    // When: ファイルの存在を確認
    // Then: mark要素スタイルが独立定義されている
  });
  
  test('tag-cloud.cssが独立している', () => {
    // Given: src/styles/tag-cloud.css
    // When: ファイルの存在を確認
    // Then: タグクラウドスタイルが独立定義されている
  });
});
```

### 4. import順序テスト

#### TC-201-005: CSS import最適化
```javascript
describe('CSS import最適化', () => {
  test('変数ファイルが最初にimportされている', () => {
    // Given: global.css
    // When: import順序を確認
    // Then: tag-variables.cssが最初にimportされている
  });
  
  test('依存関係が正しく解決されている', () => {
    // Given: 全CSSファイル
    // When: 変数参照を確認
    // Then: 未定義変数エラーがない
  });
});
```

## 統合テストケース

### 1. ビジュアル回帰テスト

#### IT-201-001: 表示一貫性確認
```javascript
describe('ビジュアル回帰テスト', () => {
  test('タグ表示が変更前と同一', async () => {
    // Given: CSS変更後のページ
    // When: タグ要素を表示
    // Then: 変更前と同じ見た目
  });
  
  test('ダークモード切り替えが正常', async () => {
    // Given: ライト/ダークモード切り替え
    // When: モード変更を実行
    // Then: 全要素が適切にスタイル変更される
  });
});
```

### 2. パフォーマンステスト

#### IT-201-002: CSSサイズとロード時間
```javascript
describe('パフォーマンス', () => {
  test('CSSサイズが20%以上削減されている', () => {
    // Given: 変更前後のCSSファイルサイズ
    // When: サイズを比較
    // Then: 20%以上削減されている
  });
  
  test('CSSロード時間が改善されている', async () => {
    // Given: 変更後のページ
    // When: ページロード時間を測定
    // Then: ベースライン以下の時間でロード完了
  });
});
```

## 実装チェックリスト

### Phase 1: 分析と計画
- [ ] 現在のCSS重複を特定
- [ ] 変数化可能な値を抽出
- [ ] ファイル分離対象を決定
- [ ] 依存関係マップを作成

### Phase 2: 重複除去
- [ ] tag.cssの重複定義除去
- [ ] global.cssの古い定義除去
- [ ] 階層タグ定義の統合

### Phase 3: 変数統一
- [ ] mark要素の変数化
- [ ] アクセント色の統一
- [ ] グラデーション定義の変数化

### Phase 4: ファイル分離
- [ ] mark.css作成
- [ ] tag-cloud.css作成
- [ ] import順序最適化

### Phase 5: 検証
- [ ] ビジュアル回帰テスト実行
- [ ] パフォーマンス測定
- [ ] 全コンポーネント動作確認

## 測定指標

### CSSサイズ削減目標
- 重複定義除去: -15%
- 未使用スタイル除去: -5%
- **合計削減目標: -20%**

### 変数統一目標
- ハードコーディング色: 0個
- 重複変数定義: 0個
- 統一されたダークモード変数: 100%

### ファイル構造目標
- 単一責任原則: 1ファイル = 1機能
- 依存関係の明確化: 100%
- import順序の最適化: 100%