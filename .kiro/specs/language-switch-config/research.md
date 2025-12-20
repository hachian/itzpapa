# Research & Design Decisions

## Summary
- **Feature**: `language-switch-config`
- **Discovery Scope**: Extension（既存システムへの機能追加）
- **Key Findings**:
  - 既存の `site.config.ts` と型定義 `src/types/site-config.ts` に言語設定を追加する
  - UIテキストは複数のコンポーネントに分散しており、一元管理が必要
  - 後方互換性のため `language` プロパティはオプショナルとし、デフォルト `'ja'` を適用

## Research Log

### 既存のUIテキスト分布調査
- **Context**: 国際化対象のテキストがどこに存在するか把握する必要があった
- **Sources Consulted**: プロジェクト内のGrepスキャン
- **Findings**:
  - `src/components/TableOfContents.astro`: 「目次」ハードコード
  - `src/components/Header.astro`: 「メニューを開く/閉じる」ハードコード
  - `src/pages/tags/index.astro`: 「タグ一覧」ハードコード
  - `src/pages/tags/[...slug].astro`: 「タグ一覧に戻る」ハードコード
  - `src/styles/table-of-contents.css`: CSSの `content` プロパティで「📋 目次」「📖 目次」
- **Implications**: CSS `content` プロパティ内のテキストは設定から動的に変更できないため、コンポーネント側で対応する必要がある

### ナビゲーション設定の構造
- **Context**: 現在のナビゲーション設定方式を理解する
- **Sources Consulted**: `site.config.ts`, `src/types/site-config.ts`
- **Findings**:
  - `navigation` は `NavItem[]` 型で `{ label: string; href: string }` の配列
  - ラベルはユーザーが自由に設定可能
  - 英語ラベルがデフォルトで設定されている
- **Implications**: 言語設定に応じたデフォルトラベルを提供しつつ、カスタムオーバーライドを維持する設計が必要

### Astro国際化パターン
- **Context**: Astroでの一般的な国際化アプローチを確認
- **Sources Consulted**: Astro公式ドキュメント、コミュニティパターン
- **Findings**:
  - Astro v5はビルトインの国際化サポートを持つが、ルーティングベースの多言語対応が主
  - 単一言語サイトのUI切り替えは、シンプルな翻訳オブジェクトで十分
  - 複雑なi18nライブラリ（i18next等）は今回の要件には過剰
- **Implications**: 専用の翻訳ファイルとヘルパー関数でシンプルに実装

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 翻訳オブジェクト + ヘルパー関数 | `src/i18n/` に翻訳定義とヘルパーを配置 | シンプル、型安全、追加依存なし | 言語数増加時にスケールしにくい | 採用：2言語のみで十分 |
| i18next統合 | 業界標準のi18nライブラリを導入 | 豊富な機能、複数形対応 | 依存追加、2言語には過剰 | 不採用 |
| コンポーネントProps直接渡し | 各コンポーネントにテキストをProps経由で渡す | 柔軟 | 重複多い、メンテ困難 | 不採用 |

## Design Decisions

### Decision: 翻訳リソースの配置場所
- **Context**: 翻訳テキストをどこに配置するか
- **Alternatives Considered**:
  1. `site.config.ts` 内に翻訳オブジェクトを埋め込む
  2. `src/i18n/` ディレクトリに専用ファイルを作成
  3. 各コンポーネント内に個別定義
- **Selected Approach**: `src/i18n/` ディレクトリに `translations.ts` と `index.ts` を配置
- **Rationale**: 関心の分離。設定ファイルはサイト固有の設定のみ、翻訳はi18nモジュールで管理
- **Trade-offs**: ファイル数は増えるが、保守性と拡張性が向上
- **Follow-up**: 将来的に3言語以上対応する場合は言語ファイルを分割検討

### Decision: ナビゲーションラベルの国際化方式
- **Context**: `navigation` 配列のラベルをどう国際化するか
- **Alternatives Considered**:
  1. `navigation` を言語別に定義（`navigation.ja`, `navigation.en`）
  2. `href` をキーとしてデフォルトラベルをルックアップ
  3. 現状の `navigation` 配列はそのまま維持（カスタム優先）
- **Selected Approach**: 案3を採用。ユーザー定義のカスタムラベルを最優先し、デフォルトラベルは参照例として提供
- **Rationale**: 後方互換性を完全に維持。既存ユーザーの設定を壊さない
- **Trade-offs**: 自動翻訳は行われないが、ユーザーの意図を尊重

### Decision: 言語プロパティのデフォルト値
- **Context**: `language` プロパティが未設定の場合の動作
- **Selected Approach**: デフォルト `'ja'`
- **Rationale**: 既存サイトは日本語で運用されており、後方互換性を維持

## Risks & Mitigations
- **CSS content プロパティ内のテキスト**: CSSで定義された「目次」テキストは設定から変更できない → コンポーネント側でJavaScriptまたはCSS変数を使用して対応
- **翻訳漏れ**: 新しいUIテキスト追加時に翻訳が漏れる可能性 → TypeScript型で全言語のエントリを強制
- **既存設定との互換性**: `language` 追加によるビルドエラー → オプショナルプロパティとして定義

## References
- [Astro i18n Routing](https://docs.astro.build/en/guides/routing/#_top) — ルーティングベースの国際化
- [TypeScript Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) — 翻訳キーの型安全性確保
