# Implementation Plan

## Tasks

- [x] 1. remark-wikilinkプラグインの正規表現最適化
- [x] 1.1 (P) 設定非依存の正規表現をモジュールスコープに移動する
  - WikiLink URLパターン、パイプ置換パターン、メインパターンをファイル先頭に定数として定義
  - ファイル拡張子パターンとインデックスサフィックスパターンも同様に抽出
  - 関数内での正規表現リテラル使用を定数参照に置換
  - 既存テストを実行して回帰がないことを確認
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 2. remark-tagsプラグインの正規表現最適化
- [x] 2.1 (P) escapeRegExp関数の正規表現をモジュールスコープに移動する
  - 特殊文字エスケープ用の正規表現パターンをファイル先頭に定数として定義
  - escapeRegExp関数内で定数を参照するよう変更
  - 設定依存の正規表現（tagRegex、normalizeTag内）は現状維持
  - 既存テストを実行して回帰がないことを確認
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 3. Header.astroのグローバル変数改善
- [x] 3.1 documentへの直接プロパティ追加をdata属性に置換する
  - `(document as any).__mobileMenuGlobalListeners`パターンを`document.body.dataset.mobileMenuGlobalInit`に変更
  - グローバルイベントリスナー登録前のフラグチェックを更新
  - フラグ設定時に`'true'`文字列を使用（data属性は文字列のみ）
  - TypeScript型エラーが発生しないことを確認
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 3.2 View Transitionsでのモバイルメニュー動作を手動検証する
  - 開発サーバーを起動してモバイル画面幅で動作確認
  - メニューを開いた状態でページ遷移し、遷移後にメニューが閉じていることを確認
  - 遷移後にメニューが正常に開閉できることを確認
  - 複数回のページ遷移後もイベントリスナーが正常に動作することを確認
  - _Requirements: 2.3, 2.4_

- [x] 4. global.cssのダークモードスタイル重複削減
- [x] 4.1 html.darkブロックと@media prefers-color-schemeブロックの重複を特定する
  - `html.dark`セレクタと`:root:not(.light)`セレクタで同一のスタイルを持つルールを洗い出し
  - body、::selection、code、hr、strong/b、em/i、blockquote等の重複箇所をリスト化
  - 各セレクタの特定度を確認し、統合時の影響を分析
  - _Requirements: 3.5_

- [x] 4.2 重複スタイルを統合して保守性を向上させる
  - `@media (prefers-color-scheme: dark)`ブロック内のスタイルを`html.dark`ブロックの直後に移動
  - 同一スタイルを持つセレクタをカンマ区切りで統合（例: `html.dark body, :root:not(.light) body`）
  - メディアクエリ内には統合できない固有の処理のみを残す
  - design-tokens.cssのCSS変数定義は変更しない（既に適切に構造化済み）
  - _Requirements: 3.1, 3.2, 3.5, 3.6_

- [x] 4.3 ダークモード表示の視覚的同一性を手動検証する
  - ライトモードからダークモードへの切替で表示が変わらないことを確認
  - OSのダークモード設定に従った表示が正常であることを確認
  - body背景、テキスト選択、インラインコード、strong/em、blockquote等の表示を確認
  - 複数のブラウザ（Chrome、Firefox、Safari）で動作確認
  - _Requirements: 3.3, 3.4_

- [x] 5. 全体検証
- [x] 5.1 ユニットテストとビルドの最終確認
  - `npm run test`を実行してすべてのテストがパスすることを確認
  - `npm run build`を実行してビルドがエラーなく完了することを確認
  - ビルド出力が変更前と同一であることを確認（可能であればdiff比較）
  - _Requirements: 1.3, 1.4_

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 2.1 |
| 1.2 | 1.1 |
| 1.3 | 1.1, 2.1, 5.1 |
| 1.4 | 1.1, 2.1, 5.1 |
| 1.5 | 2.1 |
| 2.1 | 3.1 |
| 2.2 | 3.1 |
| 2.3 | 3.2 |
| 2.4 | 3.2 |
| 2.5 | 3.1 |
| 3.1 | 4.2 |
| 3.2 | 4.2 |
| 3.3 | 4.3 |
| 3.4 | 4.3 |
| 3.5 | 4.1, 4.2 |
| 3.6 | 4.2 |
