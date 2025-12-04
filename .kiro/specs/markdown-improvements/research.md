# Research & Design Decisions

## Summary
- **Feature**: `markdown-improvements`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - 既存プラグインは機能的に成熟しており、大規模な改修は不要
  - テストインフラは存在するが、Callout単体テストとE2Eテストが不足
  - Node.js組み込みテストランナーを活用することで追加依存なしでテスト拡充可能

## Research Log

### テストフレームワーク選定

- **Context**: E2Eテストにブラウザベースのツール（Playwright等）が必要か検討
- **Sources Consulted**:
  - 既存テスト構造（`test/README.md`）
  - Node.js Test Runner ドキュメント
  - Astroビルド出力の特性
- **Findings**:
  - 既存テストはNode.js組み込みテストランナー（`node --test`）を使用
  - E2Eテストで必要なのはDOM検証であり、ブラウザ操作は不要
  - `cheerio`ライブラリによるHTML解析で十分対応可能
- **Implications**: ブラウザ自動化ツールは不要。軽量HTMLパーサーでビルド出力を検証

### プラグイン処理順序の影響

- **Context**: 組み合わせテストで処理順序がどう影響するか調査
- **Sources Consulted**: `astro.config.mjs`、各プラグインソースコード
- **Findings**:
  - 処理順序: `remarkWikilink` → `remarkMarkHighlight` → `remarkTags` → `remarkCallout`
  - WikiLinkが最初に処理されるため、WikiLink内のハイライト記法は影響を受けない
  - Calloutはrehypeフェーズで最終変換されるため、内部のWikiLink/タグは正常に動作
- **Implications**: 現在の処理順序を維持。組み合わせテストで順序依存ケースを検証

### リンク切れ検出のアプローチ

- **Context**: 要件1.3のリンク切れスタイル実装方式を検討
- **Sources Consulted**: Astroコンテンツコレクション、既存WikiLinkプラグイン
- **Findings**:
  - ビルド時にコンテンツコレクションからスラグ一覧を取得可能
  - ただし、remarkプラグインはビルドコンテキストへのアクセスが限定的
  - オプショナル機能として後回しにすることも検討価値あり
- **Implications**: リンク切れ検出は複雑度が高いため、本フェーズではスコープ外とし、テスト拡充を優先

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 既存拡張 | 現在のtest/構造を拡張 | 一貫性維持、学習コスト低 | ディレクトリ肥大化 | 推奨 |
| 新規構造 | test/unit/, test/integration/, test/e2e/に分離 | 明確な責任分離 | リファクタリング工数 | 将来的に検討 |

## Design Decisions

### Decision: テストフィクスチャの管理方式

- **Context**: テスト入力と期待出力をどう管理するか
- **Alternatives Considered**:
  1. JSONファイルで入力/出力ペアを管理
  2. Markdownファイル＋同名の.expected.htmlファイル
  3. テストコード内にインライン定義
- **Selected Approach**: Markdownファイル＋期待出力HTMLペア
- **Rationale**:
  - Markdownファイルは手動確認にも使用可能
  - ビルド出力との比較が直感的
- **Trade-offs**: ファイル数は増えるが、メンテナンス性向上
- **Follow-up**: `test/fixtures/`ディレクトリ構造を実装時に確定

### Decision: E2Eテスト実装方式

- **Context**: ビルド出力のHTMLをどう検証するか
- **Alternatives Considered**:
  1. Playwright/Puppeteerでブラウザ自動化
  2. cheerioでHTML解析（Node.jsのみ）
  3. node:testの標準機能のみ
- **Selected Approach**: cheerioによるHTML解析
- **Rationale**:
  - ブラウザ操作は不要（静的HTML検証のみ）
  - 依存最小化（cheerioは軽量）
  - CI/CD環境での実行が容易
- **Trade-offs**: JavaScriptインタラクションのテストは対象外
- **Follow-up**: cheerio devDependency追加

### Decision: 組み合わせテストの実装範囲

- **Context**: 要件6の組み合わせマトリクス12パターンをどこまで実装するか
- **Alternatives Considered**:
  1. 全12パターン×各3ケース = 36テストケース
  2. 高リスクパターンのみ優先実装
  3. 段階的に拡充
- **Selected Approach**: 高リスクパターン優先＋段階的拡充
- **Rationale**:
  - Callout+WikiLink、マークハイライト+WikiLinkが最も干渉リスク高
  - 実装工数とテスト価値のバランス
- **Trade-offs**: 初期は網羅性が限定的
- **Follow-up**: 初期実装後に追加パターンを検討

## Risks & Mitigations

- **リスク1**: cheerio依存追加による依存ツリー肥大化
  - 軽減策: devDependencyとして追加、本番バンドルには影響なし
- **リスク2**: テストの保守コスト増加
  - 軽減策: フィクスチャベースのテスト構造で変更容易に
- **リスク3**: リンク切れ検出の実装延期による機能不足感
  - 軽減策: 要件として明示的にスコープ外と記録、将来タスクとして管理

## References

- [Node.js Test Runner](https://nodejs.org/api/test.html) — テストフレームワーク
- [cheerio](https://cheerio.js.org/) — HTMLパーサー
- [unified/remark](https://unifiedjs.com/) — Markdown AST処理
