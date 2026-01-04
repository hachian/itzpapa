# Research & Design Decisions

## Summary
- **Feature**: `image-external-hosting`
- **Discovery Scope**: New Feature (Complex Integration)
- **Key Findings**:
  - AWS SDK v3がS3/R2両対応の統一ライブラリとして最適（R2はS3互換API）
  - Astroビルドフック `astro:build:done` で画像アップロード処理を実行可能
  - 既存のremark-wikilinkプラグインが画像パス処理の拡張ポイント

## Research Log

### AWS SDK v3とS3/R2互換性
- **Context**: S3とCloudflare R2の両方をサポートするための技術選定
- **Sources Consulted**:
  - [AWS SDK v3 GitHub](https://github.com/aws/aws-sdk-js-v3)
  - [Cloudflare R2 aws-sdk-js-v3 docs](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)
- **Findings**:
  - AWS SDK v3はモジュラー設計で、`@aws-sdk/client-s3`のみをインストール可能
  - Cloudflare R2はS3互換APIを提供、エンドポイントを`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`に変更するだけで動作
  - 大容量ファイルには`@aws-sdk/lib-storage`の`Upload`クラスでマルチパートアップロード対応
  - Node.js 20以上が推奨（2026年1月以降のSDKバージョン）
- **Implications**: 単一のS3クライアント実装でS3/R2両対応可能。プロバイダー切り替えは設定のみ

### Astroビルドインテグレーションフック
- **Context**: ビルド時の画像アップロード処理の実装方法
- **Sources Consulted**:
  - [Astro Integration API](https://docs.astro.build/en/reference/integrations-reference/)
  - [Understanding Astro integrations and hooks lifecycle](https://blog.logrocket.com/understanding-astro-integrations-hooks-lifecycle/)
- **Findings**:
  - `astro:build:done`: ビルド完了後に呼ばれるフック、distディレクトリの内容にアクセス可能
  - `astro:config:setup`: 設定拡張に使用、Viteプラグインの追加が可能
  - カスタムインテグレーションはファクトリ関数として実装し、オプションを受け取る設計
- **Implications**: `astro:build:done`フックで画像アップロード、`astro:config:setup`で画像除外設定

### 既存画像処理アーキテクチャ
- **Context**: 現在のitzpapaプロジェクトでの画像処理方法
- **Sources Consulted**: プロジェクトソースコード分析
- **Findings**:
  - 画像は`src/content/blog/{slug}/`内に記事と同梱
  - WikiLink形式（`![[image.png]]`）とMarkdown形式（`![alt](./image.png)`）の両方をサポート
  - `remark-wikilink`プラグインで画像パスを処理、相対パス→絶対パス変換
  - `BlogPost.astro`でAstroの`<Image>`コンポーネントを使用（hero画像のみ）
  - 記事本文内の画像は標準Markdownとして処理
- **Implications**: remark-wikilinkプラグインを拡張して外部URL変換を追加

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Astro Integration | カスタムAstroインテグレーションとして実装 | Astroビルドライフサイクルに統合、設定が一元化 | Astro依存、プラグイン開発の学習コスト | 推奨アプローチ |
| スタンドアロンスクリプト | npm scriptで独立したアップロードスクリプト | シンプル、Astro非依存 | ビルドフローとの分離、二重実行リスク | 代替案 |
| Remarkプラグイン拡張 | remark-wikilinkに外部URL変換を追加 | 既存プラグインの活用 | 責務の混在、テストが複雑化 | 分離推奨 |

## Design Decisions

### Decision: AWS SDK v3を使用した統一S3クライアント
- **Context**: S3とCloudflare R2の両方をサポートする必要がある
- **Alternatives Considered**:
  1. AWS SDK v3（S3クライアント） — S3互換APIを使用
  2. Cloudflare専用ライブラリ（node-cloudflare-r2） — R2専用だが開発中
  3. fetch API直接使用 — 軽量だが署名処理が複雑
- **Selected Approach**: AWS SDK v3の`@aws-sdk/client-s3`を使用し、エンドポイントURLでプロバイダーを切り替え
- **Rationale**: R2がS3互換APIを提供しているため、単一実装で両対応可能。SDK v3はTypeScriptファーストで型安全
- **Trade-offs**: SDK依存が増える（約1MB）が、信頼性と保守性が向上
- **Follow-up**: Node.js 20以上の要件をドキュメント化

### Decision: Astroカスタムインテグレーションによる実装
- **Context**: ビルド時の画像アップロードと画像除外をAstroビルドに統合
- **Alternatives Considered**:
  1. Astroインテグレーション — ビルドフックで処理
  2. postbuildスクリプト — package.jsonで定義
  3. GitHub Actions — CI/CDで処理
- **Selected Approach**: Astroカスタムインテグレーションとして`astro-image-hosting`を作成
- **Rationale**: `astro:build:done`フックでdistの画像にアクセス可能、設定もastro.config.mjsで一元管理
- **Trade-offs**: Astro依存だが、プロジェクトはすでにAstroベース
- **Follow-up**: インテグレーションのテスト戦略を検討

### Decision: remark-image-external-hostingプラグインの新規作成
- **Context**: Markdown内の画像参照を外部URLに変換する必要がある
- **Alternatives Considered**:
  1. remark-wikilinkの拡張 — 既存プラグインに機能追加
  2. 新規remarkプラグイン — 責務分離
  3. ビルド後処理 — HTML内のsrc属性を置換
- **Selected Approach**: 新規プラグイン`remark-image-external-hosting`を作成
- **Rationale**: 単一責任原則に従い、既存プラグインの複雑化を避ける。テストも独立して実施可能
- **Trade-offs**: プラグイン数が増えるが、保守性が向上
- **Follow-up**: プラグインの処理順序（remark-wikilinkの後に実行）

### Decision: 環境変数ベースの認証情報管理
- **Context**: S3/R2のAPIキーを安全に管理する必要がある
- **Alternatives Considered**:
  1. 環境変数 — `.env`ファイルと`process.env`
  2. 設定ファイル — `site.config.ts`に追加
  3. Vaultサービス — 外部シークレット管理
- **Selected Approach**: 環境変数から読み取り、設定ファイルにはパスを含めない
- **Rationale**: 業界標準のアプローチ、CI/CDとの親和性が高い、12-factor app準拠
- **Trade-offs**: ローカル開発時は`.env`ファイルの管理が必要
- **Follow-up**: `.env.example`テンプレートの提供

## Risks & Mitigations

- **アップロード失敗時のビルド中断**: 設定で`failOnError: boolean`オプションを提供し、選択可能に
- **大量画像のアップロード時間**: 並列アップロード実装、差分チェックでスキップ
- **R2のS3互換性の限界**: 使用するAPI操作を基本的なものに限定（PutObject, HeadObject）
- **開発環境での動作確認**: `npm run dev`時はローカル画像を使用、プレビューモードで外部URL確認

## References
- [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3) — 公式リポジトリ
- [Cloudflare R2 S3 API互換性](https://developers.cloudflare.com/r2/api/s3/api/) — サポートAPI一覧
- [Astro Integration API](https://docs.astro.build/en/reference/integrations-reference/) — フック仕様
- [Understanding Astro integrations](https://blog.logrocket.com/understanding-astro-integrations-hooks-lifecycle/) — 実装ガイド
