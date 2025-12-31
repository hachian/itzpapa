# Research & Design Decisions

## Summary
- **Feature**: `obsidian-frontmatter-sync`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - 7ファイルでフロントマターフィールドを参照中
  - fuwariでは`image`は文字列型（Astroの`image()`ヘルパーではなく相対パス文字列）
  - 19件の既存記事すべてにマイグレーションが必要

## Research Log

### fuwariスキーマとの互換性
- **Context**: itzpapaのスキーマがfuwariと異なるフィールド名を使用
- **Sources Consulted**:
  - [fuwari/src/content/config.ts](https://github.com/saicaca/fuwari/blob/main/src/content/config.ts)
- **Findings**:
  - fuwariは`image`を`z.string()`で定義（相対パス文字列）
  - itzpapaは`heroImage`を`image()`ヘルパーで定義（Astro画像最適化）
  - `z.coerce.date()`は両方で使用（互換性あり）
- **Implications**:
  - `image`フィールドは`image()`ヘルパーを維持（Astro画像最適化のメリットを保持）
  - フィールド名のみリネーム、型は現状維持

### 影響を受けるファイル分析
- **Context**: フロントマターフィールドを参照しているコードの特定
- **Sources Consulted**: Grep検索結果
- **Findings**:
  | ファイル | 参照フィールド | 変更内容 |
  |---------|--------------|---------|
  | `src/content.config.ts` | pubDate, updatedDate, heroImage | スキーマ定義変更 |
  | `src/layouts/BlogPost.astro` | pubDate, updatedDate, heroImage | Props・変数名変更 |
  | `src/pages/index.astro` | pubDate, heroImage | データアクセス変更 |
  | `src/pages/blog/index.astro` | pubDate, heroImage | データアクセス変更 |
  | `src/pages/blog/[...slug].astro` | draft | 変更不要 |
  | `src/pages/tags/[...slug].astro` | pubDate, tags | データアクセス変更 |
  | `src/pages/hero/[...path].png.ts` | heroImage | データアクセス変更 |
  | `src/pages/about.astro` | pubDate, heroImageLight/Dark | Props変更 |
- **Implications**: 8ファイルのコード変更が必要

### Astro image()ヘルパーとfuwari文字列型の違い
- **Context**: fuwariでは`image: z.string()`だが、itzpapaでは`heroImage: image()`
- **Sources Consulted**: Astro公式ドキュメント
- **Findings**:
  - `image()`ヘルパー: ビルド時に画像最適化、型安全なImageMetadata
  - `z.string()`: 単純な相対パス文字列、最適化なし
- **Implications**:
  - Astroの画像最適化機能を維持するため`image()`ヘルパーを継続使用
  - フィールド名のみ`image`に変更、型は`image().optional()`を維持

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 一括リファクタリング | スキーマ・コード・コンテンツを同時に更新 | 整合性が確保される | ビルド失敗リスク | 採用 |
| 段階的移行 | エイリアス導入→移行→削除 | リスク分散 | 複雑性増加、工数増 | 不採用 |

## Design Decisions

### Decision: image()ヘルパーの維持
- **Context**: fuwariは`z.string()`だがitzpapaは`image()`を使用
- **Alternatives Considered**:
  1. fuwari完全準拠（`z.string()`に変更）
  2. フィールド名のみ変更（`image()`維持）
- **Selected Approach**: フィールド名のみ変更
- **Rationale**: Astro画像最適化のメリット（WebP変換、サイズ最適化）を維持
- **Trade-offs**: fuwariとの型定義が異なる（機能的には問題なし）
- **Follow-up**: なし

### Decision: マイグレーションスクリプト方式
- **Context**: 19件の既存記事のフロントマター更新方法
- **Alternatives Considered**:
  1. 手動更新
  2. Node.jsスクリプト
  3. sedコマンド
- **Selected Approach**: Node.jsスクリプト
- **Rationale**: YAMLパース・再構築で安全な変換、エラーハンドリング可能
- **Trade-offs**: スクリプト作成コスト（19件程度なら手動も可能だが安全性優先）
- **Follow-up**: スクリプトは一時ファイルとして作成、完了後削除

## Risks & Mitigations
- **ビルド失敗リスク** — スキーマ変更後に即ビルドテストで検証
- **型エラーリスク** — TypeScript strict modeでコンパイルエラーを検出
- **コンテンツ破損リスク** — マイグレーション前にgit commitで状態保存

## References
- [fuwari content/config.ts](https://github.com/saicaca/fuwari/blob/main/src/content/config.ts)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Image](https://docs.astro.build/en/guides/images/)
