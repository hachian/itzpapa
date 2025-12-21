# Implementation Plan

## Tasks

- [x] 1. remark-calloutプラグインの拡張
- [x] 1.1 (P) エイリアス解決ロジックの追加
  - TYPE_ALIASESマップを定義し、エイリアス（summary, tldr, hint等）を正規タイプに変換
  - resolveType関数を実装し、エイリアス→正規タイプ→フォールバック(note)の優先順位で解決
  - parseCalloutHeader関数内でresolveTypeを呼び出すよう修正
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 1.2 (P) サポートタイプの拡張
  - VALID_TYPESに新規タイプ（abstract, todo, success, question, failure, bug, example, quote）を追加
  - DEFAULT_TITLESに新規タイプのタイトルを追加（タイプ名をそのまま使用）
  - 既存の折りたたみ・カスタムタイトル・ネスト処理は変更しない
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 3.1, 3.2, 3.3, 3.4_

- [x] 2. rehype-calloutプラグインの拡張
- [x] 2.1 新規タイプ用Lucideアイコンの追加
  - Lucide公式サイトから各タイプ用SVGを取得（abstract→clipboard-list, todo→list-todo等）
  - CALLOUT_ICONSオブジェクトに13タイプ分のSVGを定義
  - 既存のフォールバック処理（未知タイプ→noteアイコン）を維持
  - _Requirements: 1.4, 1.2_

- [x] 3. callout.cssスタイルの拡張
- [x] 3.1 (P) 新規タイプ用OKLCH色変数の定義
  - :rootに新規タイプのcolor/bg変数を追加（abstract, todo, success, question, failure, bug, example, quote）
  - 各タイプのhue値は要件に従う（abstract:150, todo:260, success:150, question:90等）
  - html.darkセレクタにダークモード用変数を追加（L値+0.1、透明度0.15）
  - @media (prefers-color-scheme: dark)にOS設定連動の変数を追加
  - _Requirements: 1.3, 3.5_

- [x] 3.2 (P) 新規タイプ用スタイルルールの追加
  - 各タイプのdata-callout属性セレクタでborder-left-color, background-color, color, mask-imageを設定
  - 折りたたみアイコン色のタイプ別指定を追加
  - 既存のレスポンシブ対応・コンテンツスタイル・ネスト処理は変更しない
  - _Requirements: 1.3, 3.6_

- [x] 3.3 (P) 新規タイプ用アイコンCSS変数の追加
  - :rootに新規タイプのdata URI形式SVGアイコン変数を追加
  - Lucideアイコンのstroke="currentColor"形式でマスク画像として使用可能にする
  - _Requirements: 1.4_

- [x] 4. ユニットテストの拡張
- [x] 4.1 全タイプ変換テストの追加
  - 13種類すべてのcalloutタイプがVALID_TYPESに含まれることを検証
  - 各タイプのcalloutが正しいdata-callout属性を持つことを検証
  - 未知タイプがnoteにフォールバックすることを検証
  - _Requirements: 5.1, 1.1, 1.2_

- [x] 4.2 エイリアス解決テストの追加
  - 全14エイリアスが正しい正規タイプに解決されることを検証
  - 大文字小文字混在のエイリアスが正しく処理されることを検証
  - エイリアス使用時にoriginalTypeが保持されることを検証
  - _Requirements: 5.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 4.3 既存機能維持テストの確認
  - 既存の折りたたみテストが引き続きパスすることを確認
  - 既存のカスタムタイトルテストが引き続きパスすることを確認
  - 既存のネストテストが引き続きパスすることを確認
  - _Requirements: 5.3, 3.1, 3.2, 3.3, 3.4_

- [x] 5. 統合検証
- [x] 5.1 ビルド検証とE2E確認
  - npm run buildでエラーなくビルドできることを確認
  - 開発サーバーで全13タイプのcalloutが正しく表示されることを目視確認
  - ダークモード・ライトモード両方で配色が適切であることを確認
  - モバイルビューでレイアウトが崩れないことを確認
  - _Requirements: 1.1, 1.3, 1.4, 3.5, 3.6_
