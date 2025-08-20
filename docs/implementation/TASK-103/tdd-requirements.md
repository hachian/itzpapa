# TASK-103: TagTreeコンポーネントのスタイル適用 - 要件定義

## 概要

TagTreeコンポーネントを新しい統一スタイルシステムに適用し、ハードコーディングされた色とスタイルをCSS変数ベースに移行する。

## 機能要件

### FR-103-001: CSS変数統合
- ハードコーディングされた`rgb(var(--gray-light))`等をCSS変数に置換
- 統一されたタグシステムのCSS変数を使用
- カスタムスタイルの一貫性確保

### FR-103-002: ツリー要素スタイル統一
- `.tree-node`、`.tree-toggle`、`.indent-guide`等の要素スタイル統一
- タグシステム全体との視覚的調和
- インタラクション要素（ホバー、フォーカス）の統一

### FR-103-003: アクセシビリティ強化
- フォーカス表示をタグシステムと統一
- キーボードナビゲーションの改善
- スクリーンリーダー対応の維持

## 技術要件

### TR-103-001: ハードコーディング除去
- `rgb(var(--gray-light))`等の計算式を除去
- 直接的なCSS変数参照に変更
- カラーパレットの一元管理

### TR-103-002: ダークモード統合
- CSS変数によるダークモード自動対応
- 手動ダークモード色指定の除去
- システム全体のダークモードとの整合性

### TR-103-003: レスポンシブ統一
- モバイル対応をCSS変数化
- タッチデバイスでの操作性向上
- 既存のレスポンシブ設計保持

## 現在の実装分析

### ハードコーディング箇所（修正対象）

```css
/* 修正が必要な箇所 */
.tag-tree {
  background: white;                           // ← CSS変数化
  border: 1px solid rgb(var(--gray-light));   // ← 直接CSS変数へ
}

.tree-node-content:hover {
  background-color: rgb(var(--gray-light), 0.3);  // ← CSS変数化
}

.indent-guide::before {
  background-color: rgb(var(--gray-light));    // ← 直接CSS変数へ
}

.tree-toggle {
  color: rgb(var(--gray));                     // ← 直接CSS変数へ
}

.tree-toggle:hover {
  background-color: rgb(var(--gray-light), 0.5);  // ← CSS変数化
  color: rgb(var(--gray-dark));               // ← 直接CSS変数へ
}

.tree-toggle:focus {
  outline: 2px solid rgb(var(--accent));      // ← タグシステム変数へ
}
```

### 必要なCSS変数

```css
/* TreeView用CSS変数（追加予定） */
--tree-bg: /* 背景色 */
--tree-border: /* ボーダー色 */
--tree-hover-bg: /* ホバー背景色 */
--tree-guide-color: /* インデントガイド色 */
--tree-toggle-color: /* トグルボタン色 */
--tree-toggle-hover-bg: /* トグルホバー背景 */
--tree-toggle-hover-color: /* トグルホバー文字色 */
--tree-focus-color: /* フォーカス色 */
```

## パフォーマンス要件

### PR-103-001: ツリー表示性能
- 大量タグ（100+）での表示性能維持
- 展開/折りたたみ操作の応答性
- CSS変数計算オーバーヘッド最小化

## セキュリティ要件

### SR-103-001: CSS安全性
- CSS変数のサニタイゼーション
- XSS攻撃ベクトルの除去
- セキュアなツリー表示

## 受け入れ基準

### AC-103-001: CSS変数適用
- [ ] 全てのハードコーディング色がCSS変数に置換
- [ ] `rgb(var(--*))`計算式が除去されている
- [ ] ダークモードが自動で適用される

### AC-103-002: 視覚的統一
- [ ] ツリー要素がタグシステムと調和
- [ ] フォーカス表示が統一されている
- [ ] ホバー効果が一貫している

### AC-103-003: 機能保持
- [ ] 既存のツリー展開/折りたたみ機能が正常動作
- [ ] TagBadgeコンポーネント統合が保持
- [ ] アクセシビリティ機能が保持

### AC-103-004: パフォーマンス
- [ ] 大量タグでの表示性能が保持
- [ ] 操作の応答性が保持
- [ ] CSS読み込み時間に影響がない

## 実装対象ファイル

- `src/components/TagTree.astro` - メインコンポーネント
- `src/styles/tag-variables.css` - CSS変数追加

## テスト対象

1. **ツリー表示要素のスタイル適用**
2. **CSS変数の正常参照**
3. **ダークモード自動切替**
4. **展開/折りたたみ機能**
5. **アクセシビリティ機能**