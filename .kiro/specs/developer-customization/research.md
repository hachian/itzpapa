# Research & Design Decisions

## Summary
- **Feature**: developer-customization
- **Discovery Scope**: Extension（既存システムへの設定管理機能追加）
- **Key Findings**:
  - 既存の `src/consts.ts` が SITE_TITLE / SITE_DESCRIPTION を管理しており、これを拡張する形で設計
  - `--primary-hue` CSS変数による OKLCH カラースキームが既に実装済み
  - Header/Footer コンポーネントで SNS リンクがハードコードされている

## Research Log

### 既存の設定管理パターン
- **Context**: 現在のサイト設定がどのように管理されているかを調査
- **Sources Consulted**: `src/consts.ts`, `src/components/Header.astro`, `src/components/Footer.astro`
- **Findings**:
  - `src/consts.ts` で SITE_TITLE, SITE_DESCRIPTION のみを export
  - コンポーネントから直接 import して使用
  - SNS リンク（GitHub）は Header/Footer にハードコード
  - ナビゲーションメニュー項目もハードコード
- **Implications**: consts.ts を site.config.ts に置き換え、より構造化された設定オブジェクトに移行

### カラーシステム
- **Context**: テーマカラーのカスタマイズ方法を調査
- **Sources Consulted**: `src/styles/design-tokens.css`
- **Findings**:
  - `--primary-hue` CSS 変数（デフォルト: 293 = Purple）で全カラーパレットを制御
  - OKLCH カラースキームにより、hue 値の変更だけで全体の配色が変わる
  - ライトモード・ダークモード両方に対応済み
- **Implications**: 設定ファイルから `--primary-hue` を設定すれば、既存システムをそのまま活用可能

### SNS アイコン
- **Context**: SNS リンク表示に必要なアイコンの調査
- **Sources Consulted**: 現在のコード、一般的な SVG アイコンセット
- **Findings**:
  - GitHub のみ SVG アイコンがインライン実装
  - 追加 SNS（Twitter/X, YouTube, Bluesky, Instagram, LinkedIn, Mastodon, Threads）はアイコン追加が必要
- **Implications**: SocialIcon コンポーネントを作成し、SNS タイプに応じたアイコンを表示

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| TypeScript 設定オブジェクト | `site.config.ts` に型付き設定オブジェクトを定義 | 型安全、IDE補完、ビルド時検証 | TypeScript ファイルなので非開発者には敷居が高い | 現在の consts.ts パターンの自然な拡張 |
| JSON/YAML 設定ファイル | 外部設定ファイルをインポート | 非開発者でも編集しやすい | 型安全性が弱い、スキーマ検証が別途必要 | 開発者向け製品では過剰 |

**選択**: TypeScript 設定オブジェクト（Option 1）
- 開発者向け製品であり、型安全性と IDE 補完の恩恵が大きい
- 既存の consts.ts パターンを踏襲

## Design Decisions

### Decision: 設定ファイルの場所と命名
- **Context**: 設定ファイルをどこに配置し、何と命名するか
- **Alternatives Considered**:
  1. `src/site.config.ts` — src 配下に配置
  2. `site.config.ts` — プロジェクトルートに配置
- **Selected Approach**: `site.config.ts`（プロジェクトルート）
- **Rationale**: 設定ファイルはユーザーが頻繁に編集するため、見つけやすいルートに配置
- **Trade-offs**: src配下より見つけやすく、astro.config.mjsなど他のルート設定ファイルと一貫性がある
- **Follow-up**: README にファイル位置を明記

### Decision: SNS 設定の構造
- **Context**: 各 SNS の有効/無効と URL をどう設定するか
- **Alternatives Considered**:
  1. フラットな構造 `{ githubUrl: string, githubEnabled: boolean, ... }`
  2. ネストした構造 `{ github: { enabled: boolean, url: string }, ... }`
- **Selected Approach**: ネストした構造（Option 2）
- **Rationale**: 各 SNS ごとに設定がグループ化され、追加・削除が容易
- **Trade-offs**: ネストが深くなるが、開発者にとっては可読性が高い

### Decision: プライマリカラーの設定方法
- **Context**: 設定ファイルからどのようにカラーを適用するか
- **Alternatives Considered**:
  1. CSS 変数をインラインスタイルで上書き
  2. BaseHead で `<style>:root { --primary-hue: {value} }</style>` を出力
- **Selected Approach**: BaseHead でスタイルタグ出力（Option 2）
- **Rationale**: 既存の OKLCH システムをそのまま活用でき、最小限の変更で済む
- **Trade-offs**: なし（既存パターンの自然な拡張）

## Risks & Mitigations
- **既存コンポーネントの破壊的変更**: Header/Footer の変更は慎重に行い、段階的に移行
- **型定義の複雑化**: SiteConfig 型を適切に分割し、各セクションを明確に定義
- **SNS アイコンの一貫性**: 全 SNS アイコンを同一サイズ・スタイルで統一

## References
- [Astro 公式ドキュメント - Configuration](https://docs.astro.build/en/guides/configuring-astro/)
- [OKLCH Color Space](https://oklch.com/) — カラー値の検証に使用
- 既存実装: `src/consts.ts`, `src/styles/design-tokens.css`
