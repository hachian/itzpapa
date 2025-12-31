# Implementation Plan

## Tasks

- [x] 1. 既存記事のフロントマターをfuwari形式にマイグレーションする
- [x] 1.1 マイグレーションスクリプトを作成する
  - 19件のMarkdownファイルを処理するNode.jsスクリプトを作成
  - gray-matterライブラリでフロントマターを解析・再構築
  - `pubDate`を`published`にリネーム
  - `heroImage`を`image`にリネーム
  - `updatedDate`を`updated`にリネーム（存在する場合）
  - 変換結果をコンソールに出力して確認可能にする
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 1.2 マイグレーションスクリプトを実行して既存記事を変換する
  - スクリプトを実行して19件の記事を変換
  - 変換後のフロントマターが正しい形式になっていることを確認
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. コンテンツスキーマをfuwari準拠に更新する
  - フィールド名を変更（pubDate→published, heroImage→image, updatedDate→updated）
  - titleフィールドを文字列型の必須フィールドとして維持
  - publishedフィールドを日付型の必須フィールドとして定義
  - updatedフィールドを日付型のオプショナルフィールドとして定義
  - descriptionフィールドをオプショナル（デフォルト: ""）で定義
  - imageフィールドをimage()ヘルパーでオプショナルとして定義
  - tagsフィールドを文字列配列でオプショナル（デフォルト: []）として定義
  - categoryフィールドを文字列型でオプショナル（デフォルト: ""）として新規追加
  - draftフィールドをブール型でオプショナル（デフォルト: false）として定義
  - langフィールドを文字列型でオプショナル（デフォルト: ""）として新規追加
  - aliasesフィールドを文字列配列でオプショナルとして新規追加（Obsidian公式プロパティ）
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 6.1, 6.2, 6.3_

- [x] 3. コード内のフロントマター参照を新しいフィールド名に更新する
- [x] 3.1 (P) BlogPostレイアウトのフィールド参照を更新する
  - Props型定義でpubDate→published、heroImage→image、updatedDate→updatedにリネーム
  - heroImageLight/Darkもimagelight/imageDarkに統一
  - 内部変数名とOG画像URL生成の参照を更新
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3.2 (P) ホームページのフィールド参照を更新する
  - ソート処理のpubDate参照をpublishedに変更
  - 記事カードのheroImage参照をimageに変更
  - FormattedDateコンポーネントへの日付渡しを更新
  - _Requirements: 5.1, 5.2_

- [x] 3.3 (P) ブログ一覧ページのフィールド参照を更新する
  - ソート処理のpubDate参照をpublishedに変更
  - 記事カードのheroImage参照をimageに変更
  - 日付表示の参照を更新
  - _Requirements: 5.1, 5.2_

- [x] 3.4 (P) タグページのフィールド参照を更新する
  - ソート処理のpubDate参照をpublishedに変更
  - 日付表示の参照を更新
  - _Requirements: 5.1_

- [x] 3.5 (P) Hero画像生成ページのフィールド参照を更新する
  - heroImageフィルタリング条件をimageに変更
  - コンソールログメッセージを更新
  - _Requirements: 5.2_

- [x] 3.6 (P) Aboutページのフィールド参照を更新する
  - pubDate propsをpublishedに変更
  - heroImageLight/Dark propsをimageLight/imageDarkに変更
  - _Requirements: 5.1, 5.2_

- [x] 4. ビルドテストを実行して変更を検証する
- [x] 4.1 ビルドを実行してTypeScriptエラーがないことを確認する
  - npm run buildを実行
  - コンパイルエラーがないことを確認
  - 全19記事のビルドが成功することを確認
  - _Requirements: 1.4, 4.4, 5.4, 6.4_

- [x] 4.2 開発サーバーで動作確認する
  - npm run devを実行
  - 記事ページで日付・画像・タグが正常に表示されることを確認
  - ホームページ・ブログ一覧・タグページが正常に動作することを確認
  - _Requirements: 1.4, 4.4, 5.4_
