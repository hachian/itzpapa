# Implementation Plan

## Tasks

- [x] 1. GiscusConfig型定義の追加
- [x] 1.1 (P) giscus設定インターフェースを定義する
  - GitHubリポジトリ情報（repo, repoId, category, categoryId）を必須プロパティとして定義
  - マッピング方式、リアクション表示、入力位置などのオプショナル設定をサポート
  - 既存のCommentsConfig型を拡張してGiscusConfig型を適用
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Commentsコンポーネントの実装
- [x] 2.1 giscusウィジェット表示機能を実装する
  - site.config.tsから設定値を読み取りgiscus scriptタグを生成
  - 記事URLとタイトルをgiscusマッピング用に渡す
  - 遅延読み込み（loading="lazy"）を設定してパフォーマンスを最適化
  - 設定不足時は安全にコンポーネントを非表示にする
  - _Requirements: 1.1, 1.4, 2.3, 5.1, 5.3_

- [x] 2.2 テーマ同期機能を実装する
  - 初期表示時にサイトのテーマ状態（ライト/ダーク）を検出
  - MutationObserverでhtml要素のdarkクラス変更を監視
  - postMessageでgiscus iframeにテーマ変更を通知
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. BlogPost.astroへの統合
- [x] 3.1 コメントセクションをレイアウトに配置する
  - Commentsコンポーネントを記事本文の後に配置
  - コメント機能の有効/無効フラグに基づいて表示を制御
  - 記事URLとタイトルをpropsとして渡す
  - _Requirements: 1.2, 1.3, 2.1, 2.2_

- [x] 4. site.config.tsの設定例を更新
- [x] 4.1 (P) giscus設定のサンプルコメントを追加する
  - 既存のコメントアウトされた設定を型安全な形式に更新
  - 必須設定とオプショナル設定の説明コメントを追加
  - _Requirements: 1.4_

- [x] 5. 動作検証
- [x] 5.1 コメント機能の表示確認を行う
  - コメント有効時のgiscusウィジェット表示を確認
  - コメント無効時の非表示を確認
  - ダーク/ライトテーマ切り替え時のgiscusテーマ同期を確認
  - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3_

## Requirements Coverage

| Requirement | Task(s) |
|-------------|---------|
| 1.1 | 2.1 |
| 1.2 | 3.1, 5.1 |
| 1.3 | 3.1, 5.1 |
| 1.4 | 2.1, 4.1 |
| 2.1 | 3.1 |
| 2.2 | 3.1 |
| 2.3 | 2.1 |
| 3.1 | 2.2, 5.1 |
| 3.2 | 2.2, 5.1 |
| 3.3 | 2.2, 5.1 |
| 4.1 | 1.1 |
| 4.2 | 1.1 |
| 4.3 | 1.1 |
| 5.1 | 2.1 |
| 5.3 | 2.1 |
