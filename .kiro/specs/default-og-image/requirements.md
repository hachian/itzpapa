# Requirements Document

## Introduction

本仕様書は、itzpapaブログサイトのOG画像およびheroImageを記事ごとに動的生成する機能の要件を定義します。OG画像（Open Graph image）は、SNSでリンクを共有した際に表示されるプレビュー画像であり、記事タイトルを含むカスタムOG画像は、クリック率向上とブランド認知に大きく貢献します。また、heroImageは記事ページ上部に表示されるアイキャッチ画像です。

現在の実装では静的な `public/og-image.png` がデフォルトOG画像として使用されており、heroImageが未設定の記事では汎用的なベース画像が表示されています。本機能では、ベース画像 `src/assets/itzpapa-light_16_9.png`（および `itzpapa-dark_16_9.png`）に記事タイトルを重ねた動的画像を生成します。

## Requirements

### Requirement 1: 記事ごとのOG画像自動生成

**Objective:** サイト管理者として、各記事に固有のOG画像を自動生成したい。これにより、SNS共有時に記事内容が一目で分かり、クリック率を向上させたい。

#### Acceptance Criteria

1. When ブログ記事がビルドされる場合, the OG画像生成システム shall その記事のタイトルを含むOG画像を自動生成する
2. The OG画像 shall 1200x630ピクセル（Open Graph推奨サイズ）で生成する
3. The OG画像 shall PNG形式で出力する
4. The OG画像 shall ベース画像 `src/assets/itzpapa-light_16_9.png` を背景として使用する

### Requirement 2: タイトルテキストの表示

**Objective:** サイト閲覧者として、OG画像から記事の内容を把握したい。これにより、興味のある記事かどうかを即座に判断したい。

#### Acceptance Criteria

1. The OG画像 shall 記事のタイトルを視認しやすいフォントサイズで表示する
2. The OG画像 shall タイトルテキストを画像中央付近に配置する
3. When タイトルが長い場合, the OG画像生成システム shall 適切に改行して表示する
4. The タイトルテキスト shall 背景画像上で十分なコントラストを確保する（読みやすさのため）

### Requirement 3: ビルド時生成

**Objective:** 開発者として、OG画像をビルドプロセスに統合したい。これにより、静的サイトジェネレーションの利点を維持したい。

#### Acceptance Criteria

1. The OG画像生成 shall Astroのビルドプロセス中に実行される
2. The 生成されたOG画像 shall 各記事のスラッグに対応したパスで配置される
3. The BaseHeadコンポーネント shall 生成されたOG画像のパスをmeta tagに設定する
4. When 記事にカスタムOG画像が指定されている場合, the システム shall カスタム画像を優先する

### Requirement 4: デフォルトOG画像（非記事ページ用）

**Objective:** サイト管理者として、トップページやタグページなど記事以外のページにもOG画像を設定したい。これにより、サイト全体のSNS共有体験を統一したい。

#### Acceptance Criteria

1. The システム shall 記事以外のページ（トップ、タグ、アバウト等）用にデフォルトOG画像を維持する
2. The デフォルトOG画像 shall サイト名「itzpapa」とタグラインを含む
3. The デフォルトOG画像 shall 記事用OG画像と同じデザインテーマを使用する

### Requirement 5: 日本語フォント対応

**Objective:** 日本語コンテンツの著者として、日本語タイトルが正しく表示されてほしい。これにより、日本語記事のOG画像も美しく表示したい。

#### Acceptance Criteria

1. The OG画像生成システム shall 日本語テキストを正しくレンダリングする
2. The システム shall 日本語対応フォント（Noto Sans JPなど）を使用する
3. The 日本語タイトル shall 文字化けや□（豆腐）なしで表示される

### Requirement 6: heroImage自動生成

**Objective:** サイト管理者として、heroImageが未設定の記事に対しても、タイトル入りのアイキャッチ画像を自動生成したい。これにより、すべての記事で統一感のあるビジュアル体験を提供したい。

#### Acceptance Criteria

1. When ブログ記事にheroImageが設定されていない場合, the システム shall その記事のタイトルを含むheroImageを自動生成する
2. The 生成されたheroImage shall ライトモード版（`itzpapa-light_16_9.png` ベース）とダークモード版（`itzpapa-dark_16_9.png` ベース）の2種類を生成する
3. The heroImage shall 1020x510ピクセル（2:1比率）で生成する
4. The BlogPostレイアウト shall 生成されたheroImageをダークモード切り替えに対応して表示する
5. When 記事にカスタムheroImageが設定されている場合, the システム shall カスタム画像を優先し、自動生成をスキップする
6. The heroImage shall OG画像と同じタイトルテキストスタイル（フォント、配置、コントラスト）を使用する
