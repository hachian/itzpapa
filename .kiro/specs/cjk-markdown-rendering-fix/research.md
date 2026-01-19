# Research & Design Decisions

## Summary
- **Feature**: `cjk-markdown-rendering-fix`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - remark-cjk-friendly v1.2.3がremark v15.xおよびunified v11.xと互換性あり
  - CommonMark 0.31.2テストケースとの互換性を維持
  - プラグイン配置順序が重要（他のremarkプラグインより前に配置）

## Research Log

### remark-cjk-friendly パッケージ調査

- **Context**: CJK括弧と強調記法の組み合わせ問題を解決するパッケージの調査
- **Sources Consulted**:
  - [remark-cjk-friendly - npm](https://www.npmjs.com/package/remark-cjk-friendly)
  - [markdown-cjk-friendly - GitHub](https://github.com/tats-u/markdown-cjk-friendly)
  - [remark plugins list](https://github.com/remarkjs/remark/blob/main/doc/plugins.md)
- **Findings**:
  - 最新バージョン: v1.2.3（脆弱性報告なし）
  - unified/remarkエコシステムと互換性あり
  - CommonMark 0.31.2の全テストケースで同一HTML出力を維持
  - CJK以外の言語には影響なし
- **Implications**:
  - 既存の英語/ASCII Markdownコンテンツに影響なし
  - 最小限の設定変更で導入可能

### プラグイン実行順序の調査

- **Context**: remarkプラグインの正しい配置順序を確認
- **Sources Consulted**:
  - [remark-cjk-friendly-gfm-strikethrough - npm](https://www.npmjs.com/package/remark-cjk-friendly-gfm-strikethrough)
  - 既存の`astro.config.mjs`分析
- **Findings**:
  - remark-cjk-friendlyはremarkパース段階で動作
  - GFM strikethroughを使用する場合は`remarkGfm`と`remarkRehype`の間に配置が必要
  - 現在のプロジェクトはAstro組み込みのGFMを使用（`gfm: true`）
- **Implications**:
  - remark-cjk-friendlyは`commonRemarkPlugins`配列の最初に配置
  - strikethroughの問題が発生した場合は追加パッケージが必要

### Astro v5との互換性

- **Context**: Astro v5.xでのremarkプラグイン統合を確認
- **Sources Consulted**:
  - 既存の`astro.config.mjs`
  - `package.json`の依存関係
- **Findings**:
  - プロジェクト使用バージョン: Astro v5.13.7、remark v15.0.1
  - remarkPlugins配列にプラグインを追加する標準パターンで統合可能
  - MDXとMarkdownの両方に同一プラグインを適用可能
- **Implications**:
  - 既存のプラグイン設定構造を維持
  - `commonRemarkPlugins`配列への追加のみで対応

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A: remark-cjk-friendly導入 | 外部パッケージで対応 | 最小コード変更、実績あり | 外部依存追加 | **推奨** |
| B: カスタムmicromark拡張 | 独自実装 | 外部依存なし | 実装コスト高、メンテ負荷 | 非推奨 |
| C: ハイブリッド | A + mark-highlight拡張 | 柔軟性 | 複雑性増加 | 必要に応じて |

## Design Decisions

### Decision: remark-cjk-friendlyパッケージの採用

- **Context**: CJK括弧と強調記法の組み合わせでマークダウンがレンダリングされない問題
- **Alternatives Considered**:
  1. Option A: remark-cjk-friendlyパッケージ導入 — 外部パッケージで対応
  2. Option B: カスタムmicromark拡張開発 — プロジェクト固有の実装
  3. Option C: ハイブリッド — 基本機能は外部パッケージ、拡張は独自
- **Selected Approach**: Option A（remark-cjk-friendly導入）
- **Rationale**:
  - CommonMark仕様レベルの問題はremarkプラグインでは解決不可能
  - remark-cjk-friendlyは既に実績があり、CommonMark互換性を維持
  - 最小限のコード変更（1ファイル、数行）で要件を満たせる
- **Trade-offs**:
  - ✅ 実装工数: S（1-3日）
  - ✅ 既存コードへの影響なし
  - ❌ 外部依存の追加（npm package）
- **Follow-up**:
  - 既存テストの回帰テスト実行
  - CJK括弧パターンの追加テスト作成

### Decision: プラグイン配置順序

- **Context**: remarkプラグインの実行順序がパース結果に影響
- **Selected Approach**: remark-cjk-friendlyを`commonRemarkPlugins`配列の最初に配置
- **Rationale**:
  - micromarkパース段階で動作するため、他のremarkプラグインより前に実行が必要
  - WikiLink、Callout等の処理に影響を与えない位置
- **Trade-offs**: なし

## Risks & Mitigations

- **Risk 1: 既存機能への影響** — 回帰テストで検証、CommonMark互換性により低リスク
- **Risk 2: パフォーマンス低下** — CJK処理のオーバーヘッドは軽微（計測予定）
- **Risk 3: パッケージ更新・互換性** — semverに従った依存管理、定期的なアップデート

## References

- [remark-cjk-friendly - npm](https://www.npmjs.com/package/remark-cjk-friendly) — メインパッケージ
- [markdown-cjk-friendly - GitHub](https://github.com/tats-u/markdown-cjk-friendly) — ソースリポジトリ
- [CommonMark Spec Issue #650](https://github.com/commonmark/commonmark-spec/issues/650) — CJK強調記法問題
- [remark plugins documentation](https://github.com/remarkjs/remark/blob/main/doc/plugins.md) — プラグイン一覧
