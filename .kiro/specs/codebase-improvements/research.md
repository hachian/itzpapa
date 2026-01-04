# Research & Design Decisions

## Summary
- **Feature**: `codebase-improvements`
- **Discovery Scope**: Extension（既存システムへのリファクタリング）
- **Key Findings**:
  - `astro.config.mjs`の51-68行目と83-99行目でプラグイン設定が完全に重複している
  - プラグインテストは既に`tests/unit/`に存在するが、`src/plugins/`内には配置されていない
  - 既存テストパターンはNode.js組み込みテストランナー（`node:test`）を使用

## Research Log

### 設定ファイル重複の調査
- **Context**: `astro.config.mjs`のmarkdownとMDX設定の重複を解消する方法を調査
- **Findings**:
  - 51-68行目（MDX用remarkPlugins）と83-99行目（markdown用remarkPlugins）が同一内容
  - 70-77行目（MDX用rehypePlugins）と101-108行目（markdown用rehypePlugins）が同一内容
  - JavaScriptの配列変数として共通化することで重複を解消可能
- **Implications**: 共通配列を定義し、両方の設定から参照するシンプルなリファクタリングで対応可能

### 既存テストパターンの調査
- **Context**: プラグインテストの追加方針を決定するため、既存テストパターンを調査
- **Sources Consulted**: `tests/`ディレクトリ構造、`package.json`のtest scripts
- **Findings**:
  - **テストフレームワーク**: Node.js組み込みテストランナー（`node:test`、`node:assert`）
  - **テストファイル配置**: `tests/unit/`にプラグインテストが配置（例: `wikilink-unit-test.js`）
  - **フィクスチャ**: `tests/fixtures/`にMarkdownテストファイルを配置
  - **既存プラグインテスト**: 4つのプラグインすべてにテストが存在
    - `tests/unit/wikilink-unit-test.js`
    - `tests/unit/callout-test.js`
    - `tests/unit/mark-highlight-unit-test.js`
    - `tests/unit/tags-unit-test.js`
  - **src内テスト**: `src/**/*.test.ts`パターンも存在（TypeScript）
- **Implications**: プラグインテストは既に存在するため、Requirement 3は「テストカバレッジの確認と必要に応じた拡充」に変更すべき

### 未使用ファイルの調査
- **Context**: 削除対象ファイルの依存関係を確認
- **Findings**:
  - `src/plugins/remark-wikilink/index-backup.js` - どこからも参照されていない
  - `src/plugins/remark-wikilink/index-optimized.js` - どこからも参照されていない
  - 両ファイルは開発中のバックアップとして残されたと推測
- **Implications**: 安全に削除可能

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 共通配列変数 | プラグイン配列をファイル上部で定義 | シンプル、変更が少ない | なし | 採用 |
| 外部設定ファイル | プラグイン設定を別ファイルに分離 | さらなる分離 | 過剰設計 | 不採用 |

## Design Decisions

### Decision: プラグイン設定の共通化方式
- **Context**: `astro.config.mjs`内でmarkdownとMDXで重複するプラグイン設定を一元化
- **Alternatives Considered**:
  1. ファイル上部で共通配列を定義 - シンプルで保守しやすい
  2. 別ファイルへの分離 - 過剰設計
- **Selected Approach**: ファイル上部で`commonRemarkPlugins`と`commonRehypePlugins`配列を定義
- **Rationale**: 最小限の変更で重複を解消でき、ビルド出力に影響を与えない
- **Trade-offs**: ファイルが少し長くなるが、可読性と保守性は向上

### Decision: テストカバレッジ方針の見直し
- **Context**: Requirement 3で「プラグインテストの追加」を計画していたが、既存テストが発見された
- **Selected Approach**: 既存テストの確認とカバレッジ評価に変更
- **Rationale**: 既存テストが存在するため、新規作成は不要
- **Follow-up**: テストカバレッジが十分かを確認し、不足があれば拡充

## Risks & Mitigations
- **リスク1**: 設定変更によるビルド出力の変化 → ビルド前後の`dist/`比較で検証
- **リスク2**: テスト実行環境の差異 → CIと同一環境でテスト実行を確認

## References
- [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/) - Astro設定の公式ドキュメント
- [Node.js Test Runner](https://nodejs.org/api/test.html) - 組み込みテストランナーの公式ドキュメント
