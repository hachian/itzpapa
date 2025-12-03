# Implementation Plan: custom-callout

## Task Overview

rehype-calloutsライブラリへの依存を排除し、プロジェクト独自のremark-calloutプラグインを実装する。

## Tasks

- [x] 1. コールアウトプラグインの基盤実装
- [x] 1.1 プラグインのエントリポイントとblockquote走査機能を実装する
  - remarkプラグインの基本構造を作成し、blockquoteノードを走査する仕組みを構築する
  - `unist-util-visit`を使用してAST内のblockquoteノードを検出する
  - プラグインオプション（最大ネスト深度など）を受け取れるようにする
  - 既存のremark-wikilink等と同じESModuleパターンに従う
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 1.2 コールアウトヘッダーのパース機能を実装する
  - blockquoteの最初のテキストノードから`[!type]`パターンを検出する正規表現を作成する
  - コールアウトタイプ（note, info, tip, warning, caution, important, danger）を抽出する
  - 未知のタイプはnoteとしてフォールバックする
  - カスタムタイトル（`[!type] カスタムタイトル`形式）を抽出する
  - タイトル未指定時はタイプ名をデフォルトタイトルとする
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.3 折りたたみ状態のパース機能を実装する
  - `-`記号による折りたたみ可能（初期展開）状態を検出する
  - `+`記号による折りたたみ可能（初期折りたたみ）状態を検出する
  - 記号なしの場合は折りたたみ不可とする
  - パース結果をCalloutHeader構造体として返す
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 1.4 通常のblockquoteとコールアウトを区別する機能を実装する
  - `[!type]`パターンで始まらないblockquoteは変換せずそのまま保持する
  - コールアウトパターンにマッチした場合のみHTML変換を行う
  - _Requirements: 6.1, 6.2_

- [x] 2. HTML出力構造の生成
- [x] 2.1 通常のコールアウトHTML構造を生成する機能を実装する
  - div.callout構造（callout-title, callout-icon, callout-title-inner, callout-content）を生成する
  - コールアウトタイプに応じたクラス名（callout-note, callout-warning等）を付与する
  - data-callout属性にタイプを設定する
  - _Requirements: 1.1, 1.2, 5.1_

- [x] 2.2 折りたたみ可能なコールアウトHTML構造を生成する機能を実装する
  - details/summary要素を使用した折りたたみ構造を生成する
  - 初期状態（展開/折りたたみ）に応じてopen属性を制御する
  - 折りたたみアイコン（callout-fold-icon）を追加する
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.3 (P) 各コールアウトタイプ用のSVGアイコンを定義する
  - 7種類のコールアウトタイプ（note, info, tip, warning, caution, important, danger）用のSVGを定義する
  - viewBox="0 0 24 24"、currentColorを使用してテーマ対応する
  - 折りたたみ用のシェブロンアイコンも定義する
  - _Requirements: 5.1_

- [x] 3. ネストとコンテンツ処理
- [x] 3.1 コールアウト内のMarkdownコンテンツを適切に処理する機能を実装する
  - コールアウトヘッダー行を除いた残りのコンテンツをcallout-contentとして出力する
  - 子ノード（段落、リスト、コードブロック等）をそのまま維持する
  - WikiLinkや他のremark処理結果も保持する
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.2 ネストされたコールアウトを再帰的に処理する機能を実装する
  - コールアウト内のblockquoteを検出して再帰処理する
  - 現在のネスト深度を追跡し、最大3レベルまで許可する
  - 深度超過時は通常のblockquoteとして保持する
  - ネストレベルに応じたdata-nest-level属性を付与する
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4. スタイリング実装
- [x] 4.1 (P) コールアウトタイプ別のOKLCHカラー変数を定義する
  - 7種類のタイプ別にボーダー色・アイコン色・背景色のCSS変数を定義する
  - 背景色は各色の10-15%不透明度で設定する
  - 左ボーダーに各タイプの固有色を適用する
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 4.2 (P) ダークモード用のカラースキームを実装する
  - html.darkセレクターで各色のL値（明度）を調整する
  - ダークモードでの視認性を確保する
  - OS設定連動（prefers-color-scheme）にも対応する
  - _Requirements: 5.5_

- [x] 4.3 コールアウトの基本レイアウトとレスポンシブ対応を実装する
  - callout、callout-title、callout-contentの基本レイアウトを定義する
  - プロジェクトのCSS変数（--space-*、--radius-*等）を使用する
  - モバイル/タブレット/デスクトップでの適切なパディングとマージンを設定する
  - ネストレベルに応じたインデントスタイルを追加する
  - _Requirements: 5.6, 5.7, 4.3_

- [x] 4.4 折りたたみ要素のスタイリングを実装する
  - details/summary要素のデフォルトスタイルをリセットする
  - 折りたたみアイコンの回転アニメーションを追加する
  - 折りたたみ時/展開時のトランジションを設定する
  - _Requirements: 2.4_

- [x] 5. 統合と依存削除
- [x] 5.1 astro.config.mjsにremark-calloutプラグインを登録する
  - mdx設定のremarkPluginsに新プラグインを追加する
  - markdown設定のremarkPluginsにも同様に追加する
  - 他のremarkプラグイン（WikiLink等）の後に配置する
  - rehype-calloutsの設定を削除する
  - _Requirements: 7.5, 8.2_

- [x] 5.2 rehype-callouts関連のインポートとスタイルを削除する
  - global.cssからrehype-calloutsテーマのインポートを削除する
  - callout.cssからrehype-callouts固有の変数（--rc-*）参照を削除する
  - 新しいスタイル定義でcallout.cssを置き換える
  - _Requirements: 8.3, 8.4_

- [x] 5.3 package.jsonからrehype-callouts依存を削除する
  - package.jsonのdependenciesからrehype-calloutsを削除する
  - npm installで依存を更新する
  - about.astroなどのドキュメントからrehype-calloutsの記載を更新する
  - _Requirements: 8.1_

- [x] 6. 検証とテスト
- [x] 6.1 既存のテストコンテンツで後方互換性を検証する
  - callout-comprehensive-testページでビルドを実行する
  - 全コールアウトタイプが正しく表示されることを確認する
  - カスタムタイトル、折りたたみ、ネストが動作することを確認する
  - 通常のblockquoteが影響を受けていないことを確認する
  - _Requirements: 8.5, 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 4.1, 4.2, 6.1, 6.2_

- [x] 6.2 ライトモード・ダークモードでの表示を検証する
  - 各コールアウトタイプがライトモードで正しい色で表示されることを確認する
  - ダークモードに切り替えて色が適切に調整されることを確認する
  - レスポンシブ表示（モバイル/デスクトップ）を確認する
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.7_

- [x] 6.3 他のremarkプラグインとの共存を検証する
  - コールアウト内のWikiLinkが正しく変換されることを確認する
  - コールアウト内の==ハイライト==記法が正しく変換されることを確認する
  - コールアウト内の#タグ記法が正しく変換されることを確認する
  - _Requirements: 3.5, 7.4_

- [ ]* 6.4 ユニットテストを作成する
  - parseCalloutHeader関数の各パターンテストを作成する
  - isCallout関数のコールアウト/非コールアウト判定テストを作成する
  - HTML生成関数の出力構造テストを作成する
  - ネスト処理の深度制限テストを作成する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 4.1, 4.2, 6.1, 6.2_

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1-1.5 | 1.2, 2.1, 6.1, 6.4 |
| 2.1-2.4 | 1.3, 2.2, 4.4, 6.1, 6.4 |
| 3.1-3.5 | 3.1, 6.3 |
| 4.1-4.3 | 3.2, 4.3, 6.1, 6.4 |
| 5.1-5.7 | 2.1, 2.3, 4.1, 4.2, 4.3, 6.2 |
| 6.1-6.2 | 1.4, 6.1, 6.4 |
| 7.1-7.5 | 1.1, 5.1 |
| 8.1-8.5 | 5.1, 5.2, 5.3, 6.1 |
