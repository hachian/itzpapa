# Requirements Document

## Introduction

このドキュメントは、itzpapaプロジェクトのコードベース改善に関する要件を定義します。先行して実施したコード分析に基づき、保守性向上、コード品質改善、テストカバレッジ向上を目的とした改善要件を記載します。

### 実施方針: 段階的アプローチ

機能変更がないことを担保するため、以下の2フェーズで実施します：

- **Phase 1（今回スコープ）**: 低リスク要件のみ実施
  - 設定ファイルの重複解消
  - 未使用ファイルの削除
  - プラグインテストの追加
  - コードコメント言語の統一

- **Phase 2（将来スコープ）**: テストカバレッジ向上後に実施
  - 正規表現のパフォーマンス最適化
  - グローバル変数の改善
  - デザイントークンの重複削減

### 分析で特定された主要課題
1. **コードの重複**: `astro.config.mjs`でmarkdownとMDXのプラグイン設定が完全に重複
2. **未使用ファイル**: `src/plugins/remark-wikilink/`にバックアップファイルが残存
3. **テストカバレッジ不足**: プラグインに対するテストが未実装
4. **コード品質**: コメント言語の混在

---

## Phase 1 Requirements（今回スコープ）

### Requirement 1: 設定ファイルの重複解消
**Objective:** As a 開発者, I want Astro設定ファイルのプラグイン設定を一元管理したい, so that 設定変更時の修正漏れを防ぎ保守性を向上できる

**リスクレベル:** 低（同一設定の共通化のみ）

#### Acceptance Criteria
1. The Astro Build System shall 共通のremarkプラグイン配列を1箇所で定義する
2. The Astro Build System shall 共通のrehypeプラグイン配列を1箇所で定義する
3. When markdownとmdxの設定を読み込む場合, the Astro Build System shall 同一の共通プラグイン配列を参照する
4. The Astro Build System shall プラグイン設定を変更する際に1箇所の修正で両方に反映される
5. When ビルドを実行する場合, the Astro Build System shall 変更前と同一の出力を生成する

### Requirement 2: 未使用ファイルの削除
**Objective:** As a 開発者, I want 未使用のバックアップファイルや一時ファイルを削除したい, so that リポジトリをクリーンに保ち混乱を防げる

**リスクレベル:** 低（参照されていないファイルの削除）

#### Acceptance Criteria
1. The itzpapa Project shall `src/plugins/remark-wikilink/index-backup.js`を含まない
2. The itzpapa Project shall `src/plugins/remark-wikilink/index-optimized.js`を含まない
3. When `src/plugins/`ディレクトリを確認する場合, the itzpapa Project shall 各プラグインに`index.js`のみを持つ（バックアップファイルなし）
4. When ビルドを実行する場合, the Astro Build System shall エラーなく完了する

### Requirement 3: プラグインテストの追加
**Objective:** As a 開発者, I want カスタムremarkプラグインにテストを追加したい, so that リファクタリング時の回帰を検出できる

**リスクレベル:** なし（新規追加のみ）

#### Acceptance Criteria
1. The remark-wikilink Plugin shall 基本的なWikiLink変換をテストするテストファイルを持つ
2. The remark-callout Plugin shall Calloutブロックのパースをテストするテストファイルを持つ
3. The remark-mark-highlight Plugin shall ハイライト記法の変換をテストするテストファイルを持つ
4. The remark-tags Plugin shall タグ処理をテストするテストファイルを持つ
5. When `npm run test`を実行する場合, the Test Runner shall すべてのプラグインテストを実行する
6. The Test Suite shall 各プラグインの主要なユースケースをカバーする

### Requirement 4: コードコメント言語の統一
**Objective:** As a 開発者, I want コードコメントの言語を統一したい, so that コードベースの一貫性と可読性を向上できる

**リスクレベル:** なし（コメントのみの変更）

#### Acceptance Criteria
1. The itzpapa Codebase shall プラグインファイル内のコメントを日本語で統一する
2. The itzpapa Codebase shall ユーティリティファイル内のコメントを日本語で統一する
3. The itzpapa Codebase shall JSDoc/TSDocコメントを日本語で記述する
4. Where 英語のAPIドキュメントを参照する場合, the itzpapa Codebase shall 参照元の英語は保持してもよい
5. When ビルドを実行する場合, the Astro Build System shall 変更前と同一の出力を生成する

---

## Phase 2 Requirements（将来スコープ - 今回対象外）

以下の要件はPhase 1完了後、テストカバレッジが十分に確保された段階で実施します。

### Requirement 5: 正規表現のパフォーマンス最適化（Phase 2）
**リスクレベル:** 中（動作が変わる可能性）
**前提条件:** Requirement 3のテストが全てパスすること

### Requirement 6: グローバル変数の改善（Phase 2）
**リスクレベル:** 中（View Transitions動作に影響の可能性）
**前提条件:** E2Eテストでモバイルメニュー動作を検証できること

### Requirement 7: デザイントークンの重複削減（Phase 2）
**リスクレベル:** 中〜高（ダークモード切替に影響の可能性）
**前提条件:** ビジュアルリグレッションテストが導入されていること

---

## Out of Scope

以下の項目は今回のスコープ外とします：

- プラグインのTypeScript化（工数が大きいため別途検討）
- OG画像生成のテンプレート統合（機能に影響するため別途検討）
- セマンティックHTMLの見直し（デザイン変更を伴うため別途検討）
