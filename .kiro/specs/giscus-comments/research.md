# Research & Design Decisions

## Summary
- **Feature**: `giscus-comments`
- **Discovery Scope**: Extension（既存のsite.config.ts設定構造を活用したgiscusコメント機能の統合）
- **Key Findings**:
  - giscusはscriptタグ埋め込み方式で外部ライブラリ不要
  - 既存のテーマ切り替えロジック（`html.dark`クラス）との連携が必要
  - 既存の`CommentsConfig`型を拡張してgiscus固有設定を型安全に

## Research Log

### giscus設定オプション
- **Context**: giscusウィジェットの埋め込み方法と必須パラメータの調査
- **Sources Consulted**: https://giscus.app/
- **Findings**:
  - 必須属性: `data-repo`, `data-repo-id`, `data-category`, `data-category-id`
  - マッピング方式: `pathname`（URL path）, `url`（完全URL）, `title`（ページタイトル）, `og:title`
  - テーマ: `light`, `dark`, `preferred_color_scheme`, カスタムCSS対応
  - その他オプション: `data-reactions-enabled`, `data-emit-metadata`, `data-input-position`, `data-lang`, `data-strict`, `loading="lazy"`
- **Implications**:
  - giscusは外部npmパッケージ不要（CDNスクリプト埋め込みのみ）
  - `data-theme`をJavaScriptで動的に変更可能

### 既存テーマ切り替え実装
- **Context**: giscusテーマとサイトテーマの連携方法
- **Sources Consulted**: `src/components/ThemeToggle.astro`
- **Findings**:
  - テーマ状態は`html.dark`クラスの有無で管理
  - `localStorage.setItem('theme', ...)` で永続化
  - View Transitions対応（`astro:after-swap`イベント）
- **Implications**:
  - giscusにpostMessage経由でテーマ変更を通知する必要あり
  - 初期表示時は`document.documentElement.classList.contains('dark')`で判定

### 既存CommentsConfig型
- **Context**: 型安全な設定インターフェースの設計
- **Sources Consulted**: `src/types/site-config.ts`
- **Findings**:
  - `CommentsConfig`は`enabled`, `provider`, `config`を持つ
  - `config`は`Record<string, unknown>`（汎用型）
  - `provider`は`'giscus' | 'utterances'`のunion型
- **Implications**:
  - `GiscusConfig`インターフェースを新規定義
  - 型ガードまたは条件付き型で`config`を具体化

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 単一Astroコンポーネント | Commentsコンポーネント1つでgiscus埋め込みを担当 | シンプル、保守しやすい | 将来のutterances対応時に分岐増加 | 現時点ではgiscusのみなので採用 |
| Provider抽象化パターン | BaseCommentsを継承したGiscusComments/UtterancesComments | 拡張性高い | 現時点では過剰設計 | 将来検討 |

## Design Decisions

### Decision: giscusスクリプト埋め込み方式
- **Context**: giscusウィジェットの実装方法選択
- **Alternatives Considered**:
  1. `@giscus/react`パッケージ使用 — React依存、バンドルサイズ増加
  2. 直接scriptタグ埋め込み — 軽量、依存なし
- **Selected Approach**: 直接scriptタグ埋め込み
- **Rationale**: Astro静的サイトとの相性が良く、追加依存なしでシンプル
- **Trade-offs**: Reactコンポーネントの型安全性は得られないが、TypeScript型定義でカバー
- **Follow-up**: テーマ切り替え時のpostMessage実装をテストで検証

### Decision: テーマ連携方式
- **Context**: サイトのダーク/ライトモードとgiscusテーマの同期
- **Alternatives Considered**:
  1. `preferred_color_scheme`使用 — giscus側で自動判定
  2. postMessage経由で動的切り替え — 即座に反映
- **Selected Approach**: postMessage経由での動的切り替え
- **Rationale**: 既存のThemeToggleと連動し、ユーザー操作に即座に反映
- **Trade-offs**: 追加のJavaScriptコードが必要
- **Follow-up**: MutationObserverで`html.dark`クラス変更を監視

### Decision: GiscusConfig型の導入
- **Context**: 型安全な設定管理
- **Alternatives Considered**:
  1. `Record<string, unknown>`のまま — 型チェックなし
  2. 専用インターフェース定義 — 開発時エラー検出
- **Selected Approach**: `GiscusConfig`インターフェースを定義
- **Rationale**: 設定ミス（typo等）をビルド時に検出可能
- **Trade-offs**: 型定義ファイルの更新が必要
- **Follow-up**: utterances対応時に`UtterancesConfig`も追加

## Risks & Mitigations
- **giscus API変更リスク** — giscusのdata属性仕様変更に対応できるよう、設定をオプショナルプロパティで柔軟に
- **テーマ同期の遅延** — MutationObserverとpostMessageで即座に対応
- **GitHub Discussions未設定時のエラー** — 設定不足時はコンポーネントを非表示にし、コンソール警告

## References
- [giscus公式サイト](https://giscus.app/) — 設定オプションとセットアップガイド
- [giscus GitHub](https://github.com/giscus/giscus) — ソースコードとpostMessage仕様
