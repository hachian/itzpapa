# Implementation Plan

## Tasks

- [x] 1. 圧縮設定の型定義を追加
- [x] 1.1 (P) OG画像フォーマットと圧縮パラメータの型を定義
  - 出力フォーマット（WebP/PNG）を表す型を追加
  - WebP品質（0-100）とPNG圧縮レベル（0-9）の設定型を追加
  - 既存のOG画像設定にcompression項目を追加
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_
  - _Contracts: CompressionConfig, OgImageConfig_

- [x] 2. 画像生成ロジックをWebPデフォルト出力に変更
- [x] 2.1 圧縮設定の読み取りとデフォルト値適用
  - サイト設定から圧縮パラメータを取得する処理を追加
  - 設定未指定時はWebP形式（quality=80）をデフォルトとする
  - 範囲外の値はclamp処理で自動修正し警告ログを出力
  - _Requirements: 1.1, 2.1, 3.1, 3.2_
  - _Contracts: ImageGenerator_

- [x] 2.2 sharp出力処理をフォーマット切り替え対応に変更
  - 現在の`.png().toBuffer()`を設定に応じた出力に変更
  - WebP選択時は`.webp({ quality })`、PNG選択時は`.png({ compressionLevel })`を適用
  - 既存の3関数（generateOgImage, generateHeroImage, generateDefaultOgImage）すべてに適用
  - _Requirements: 1.1, 1.2, 2.2, 3.3, 3.4, 4.1, 4.2, 4.3_
  - _Contracts: ImageGenerator_

- [x] 2.3 Content-Type取得用ヘルパー関数を追加
  - 現在の設定に基づいてContent-Type（image/webp or image/png）を返す関数を追加
  - 現在の出力フォーマット（webp or png）を返す関数を追加
  - モジュールのエクスポートに新関数を追加
  - _Requirements: 2.3_
  - _Contracts: ImageGenerator_

- [x] 3. APIルートのContent-Typeを動的設定に変更
- [x] 3.1 (P) OG画像ルートのレスポンスヘッダーを更新
  - 固定の`image/png`を動的なContent-Type取得に変更
  - 個別記事OG画像ルートを更新
  - デフォルトOG画像ルートを更新
  - _Requirements: 2.3, 2.4, 2.5_
  - _Contracts: OgRoute_

- [x] 3.2 (P) Hero画像ルートのレスポンスヘッダーを更新
  - 固定の`image/png`を動的なContent-Type取得に変更
  - Cache-Controlヘッダーは維持
  - _Requirements: 2.3, 2.4, 2.5_
  - _Contracts: OgRoute_

- [x] 4. ユニットテストの実装
- [x] 4.1 圧縮設定読み取りのテスト
  - デフォルト値適用のテスト（compression未設定時）
  - カスタム値適用のテスト（各パラメータ指定時）
  - 範囲外値のclamp処理テスト
  - _Requirements: 3.1, 3.2, 4.4_

- [x] 4.2 Content-Typeヘルパー関数のテスト
  - WebP設定時にimage/webpを返すことを確認
  - PNG設定時にimage/pngを返すことを確認
  - フォーマット取得関数の動作確認
  - _Requirements: 2.3_

- [x] 4.3 画像生成出力形式のテスト
  - WebP出力時のBuffer形式確認（magic bytes検証）
  - PNG出力時のBuffer形式確認
  - 既存APIシグネチャの互換性確認
  - _Requirements: 1.1, 2.1, 2.2, 4.1, 4.2, 4.3_

- [x] 5. 統合確認とサイズ検証
- [x] 5.1 ビルド実行とファイルサイズ比較
  - npm run buildを実行してOG画像を生成
  - WebP出力時のサイズを計測し、現行PNG比50%以上削減を確認
  - PNG出力設定時のサイズを計測し、現行比30%以上削減を確認
  - _Requirements: 5.1, 5.2_

- [x] 5.2 外部ホスティング・ローカル配信の両パターン確認
  - astro-image-hosting有効時の動作確認
  - 外部ホスティング無効時（dist直接配信）の動作確認
  - _Requirements: 2.5_

- [ ]* 5.3 SNS互換性の手動確認
  - Twitter Card Validatorでの表示確認
  - Facebook Sharing Debuggerでの表示確認
  - LinkedIn Post Inspectorでの表示確認
  - _Requirements: 5.3_

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 2.1, 2.2, 4.3 |
| 1.2 | 2.2 |
| 1.3 | 5.1 (ビルド時間計測) |
| 2.1 | 1.1, 2.1, 4.3 |
| 2.2 | 1.1, 2.2, 4.3 |
| 2.3 | 2.3, 3.1, 3.2, 4.2 |
| 2.4 | 3.1, 3.2 |
| 2.5 | 3.1, 3.2, 5.2 |
| 3.1 | 1.1, 2.1, 4.1 |
| 3.2 | 1.1, 2.1, 4.1 |
| 3.3 | 1.1, 2.2 |
| 3.4 | 1.1, 2.2 |
| 4.1 | 2.2, 4.3 |
| 4.2 | 2.2, 4.3 |
| 4.3 | 2.2, 4.3 |
| 4.4 | 4.1 |
| 5.1 | 5.1 |
| 5.2 | 5.1 |
| 5.3 | 5.3 |
