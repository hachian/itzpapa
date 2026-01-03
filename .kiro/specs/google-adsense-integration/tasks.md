# Implementation Plan

## Tasks

- [x] 1. SeoConfig型定義にAdSense設定を追加
  - AdSenseパブリッシャーID用のオプショナルプロパティを型定義に追加
  - 既存のGoogle Analytics IDと同一パターン（オプショナルstring）を踏襲
  - JSDocコメントで設定の用途と空文字時の動作を説明
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 2. site.config.tsにAdSense設定項目を追加
  - SEO設定セクション内にAdSenseパブリッシャーID設定を追加
  - デフォルト値を空文字に設定（無効化状態）
  - 設定コメントでIDの形式（ca-pub-XXXX）と無効化方法を説明
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 3. BaseHead.astroにAdSenseスクリプト出力を実装
  - siteConfigからAdSense IDを取得するロジックを追加
  - IDが設定されている場合のみ条件付きでスクリプトを出力
  - Google Analytics統合の直後にAdSenseスクリプトブロックを配置
  - async属性とcrossorigin属性を含む正しいスクリプトタグを生成
  - pagead2.googlesyndication.comからのスクリプト読み込みを実装
  - パブリッシャーIDをクエリパラメータとして渡す形式で実装
  - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2_

- [x] 4. 統合テストの実装
- [x] 4.1 (P) AdSense有効時のスクリプト出力テスト
  - AdSense IDが設定されている場合にスクリプトタグが出力されることを検証
  - 出力されるスクリプトにasync属性が含まれることを確認
  - スクリプトURLにパブリッシャーIDが正しく含まれることを確認
  - crossorigin="anonymous"属性の存在を検証
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 5.1, 5.2_

- [x] 4.2 (P) AdSense無効時の非出力テスト
  - AdSense IDが空文字の場合にスクリプトが出力されないことを検証
  - AdSense IDが未定義の場合にスクリプトが出力されないことを検証
  - 無効時でもGoogle Analyticsなど他のスクリプト出力に影響がないことを確認
  - _Requirements: 1.3_
