# Implementation Plan

## Tasks

- [x] 1. 目次コンポーネントにライトモードボーダーを追加
  - `.table-of-contents` セレクタにボーダースタイルを追加
  - デザイントークン `--color-gray-200` を使用してライトモード用ボーダー色を定義
  - ダークモードの既存 `border` 定義を `border-color` のみの上書きに変更
  - テーマ切り替え時のトランジション（`border-color`）を追加
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 4.1, 4.2_

- [x] 2. 目次リンクのホバー状態にライトモード背景色を追加
  - `.toc-link:hover` にライトモード用背景色 `--color-gray-100` を追加
  - 既存のダークモード定義はそのまま維持
  - OSプリファレンス対応（`@media (prefers-color-scheme: dark)`）を追加
  - _Requirements: 2.1, 2.2, 2.3, 4.3_

- [x] 3. 目次リンクのアクティブ状態にライトモード背景色を追加
  - `.toc-link.active` にライトモード用背景色 `--color-primary-50` を追加
  - アクティブ状態を視覚的に強調するスタイルを定義
  - OSプリファレンス対応（`@media (prefers-color-scheme: dark)`）を追加
  - _Requirements: 2.1, 2.2, 2.3, 4.3_

- [x] 4. テーマ切り替えの視覚的検証
  - ライトモードで目次のボーダーが表示されることを確認
  - ダークモードで目次のボーダーが表示されることを確認
  - テーマ切り替え時にボーダーカラーがスムーズにトランジションすることを確認
  - 目次リンクのホバー/アクティブ状態が両テーマで正しく表示されることを確認
  - OSプリファレンスによるテーマ自動切り替えが機能することを確認
  - `prefers-reduced-motion` 有効時にトランジションが無効化されることを確認
  - モバイルビュー（767px以下）で既存スタイルが維持されていることを確認
  - _Requirements: 3.3, 5.1, 5.2, 5.3_

- [x] 5. タグページの階層タグ/タグセクションの背景色を統一
  - `tag-variables.css` の `--tree-bg` をデザイントークンに変更
  - ライトモード: `var(--color-surface)`
  - ダークモード: `var(--color-gray-800)`
  - TagTree.astro と index.astro のハードコード値を削除

- [x] 6. その他のデザイン不整合を修正
  - `global.css`: 画像エラー時の背景色をデザイントークンに変更（`--color-gray-100`/`--color-gray-800`）
  - `global.css`: 画像エラーテキスト色を `--color-text-secondary` に変更
  - `mark.css`: 選択時の背景色にダークモード対応を追加（白い選択色）

## Requirements Coverage

| Requirement | Task(s) | Status |
|-------------|---------|--------|
| 1.1 | 1 | Covered |
| 1.2 | 1 | Covered |
| 1.3 | 1 | Covered |
| 2.1 | 2, 3 | Covered |
| 2.2 | 2, 3 | Covered |
| 2.3 | 2, 3 | Covered |
| 3.1 | 1 | Covered |
| 3.2 | 1 | Covered |
| 3.3 | 4 | Covered |
| 4.1 | 1 | Covered |
| 4.2 | 1 | Covered |
| 4.3 | 2, 3 | Covered |
| 5.1 | 4 | Covered |
| 5.2 | 4 | Covered |
| 5.3 | 4 | Covered |
