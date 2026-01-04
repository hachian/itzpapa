# Requirements Document

## Introduction

自動生成OG画像のファイルサイズを最適化し、ページ読み込みパフォーマンスとSNS共有時のユーザー体験を向上させる。現在の実装ではsharpのデフォルト設定でPNG出力しているため、WebP変換と圧縮最適化による軽量化を行う。

### 現状分析

- **生成方式**: satori（SVG生成）→ sharp（PNG変換）
- **出力サイズ**: 1200×630（OG画像）、1020×510（Hero画像）
- **課題**: sharpのデフォルトPNG設定では圧縮最適化が行われていない
- **配信パターン**:
  - パターンA: S3/R2など外部ホスティング経由で配信（astro-image-hosting使用時）
  - パターンB: distディレクトリから直接配信（外部ホスティング未使用時）

## Requirements

### Requirement 1: WebPデフォルト出力

**Objective:** As a サイト管理者, I want OG画像をWebP形式で出力したい, so that ファイルサイズを大幅に削減しSNS共有時の読み込みを高速化できる

#### Acceptance Criteria
1. The OG Image Generator shall WebP形式をデフォルト出力フォーマットとする（軽量化優先、主要SNS対応済み）
2. The OG Image Generator shall 出力画像の品質を視覚的に維持する（著しい劣化がないこと）
3. The OG Image Generator shall 変換処理による追加のビルド時間増加を最小限に抑える（1画像あたり+100ms以内）

### Requirement 2: 画像フォーマット選択対応

**Objective:** As a サイト管理者, I want OG画像の出力フォーマットを選択可能にしたい, so that ユースケースに応じて最適なフォーマットを選べる

#### Acceptance Criteria
1. The OG Image Generator shall WebP形式をデフォルト出力フォーマットとする
2. Where site.configでPNG出力が設定された場合, the OG Image Generator shall PNG形式で画像を出力する
3. When 画像がAPIルートから配信される場合, the OG Image Generator shall 適切なContent-Typeヘッダー（image/webp または image/png）を設定する
4. When 外部ホスティングが使用されない場合, the OG Image Generator shall フォーマットに応じた正しいファイル拡張子でdistに出力する
5. The OG Image Generator shall 外部ホスティング使用時・未使用時の両方で正常に動作する

### Requirement 3: 圧縮設定のカスタマイズ

**Objective:** As a サイト管理者, I want 圧縮品質パラメータをsite.configから設定したい, so that サイト要件に応じて品質とサイズのバランスを調整できる

#### Acceptance Criteria
1. When site.configにogImage.compression設定が存在する, the OG Image Generator shall 指定された圧縮パラメータを適用する
2. If site.configにogImage.compression設定が存在しない, the OG Image Generator shall 最適化されたデフォルト値を使用する
3. The OG Image Generator shall WebP用のquality（0-100）設定をサポートする
4. Where PNG形式が選択された場合, the OG Image Generator shall compressionLevel（0-9）設定をサポートする

### Requirement 4: 既存API互換性維持

**Objective:** As a 開発者, I want 既存のOG画像生成APIを維持したい, so that 既存のページ実装に変更が不要になる

#### Acceptance Criteria
1. The OG Image Generator shall generateOgImage関数の既存シグネチャを維持する
2. The OG Image Generator shall generateHeroImage関数の既存シグネチャを維持する
3. The OG Image Generator shall generateDefaultOgImage関数の既存シグネチャを維持する
4. When 圧縮設定が指定されない, the OG Image Generator shall 後方互換性のある出力を生成する

### Requirement 5: ファイルサイズ削減効果

**Objective:** As a サイト管理者, I want OG画像のファイルサイズを有意に削減したい, so that ネットワーク帯域とストレージコストを削減できる

#### Acceptance Criteria
1. The OG Image Generator shall WebPデフォルト出力により現行PNG比50%以上のサイズ削減を達成する
2. Where PNG形式が選択された場合, the OG Image Generator shall 圧縮最適化により現行比30%以上のサイズ削減を達成する
3. The OG Image Generator shall 生成された画像が主要SNS（Twitter、Facebook、LinkedIn）で正常に表示されることを保証する
