# Requirements Document

## Introduction

このドキュメントは、itzpapaプロジェクトのコードベース改善Phase 2に関する要件を定義します。Phase 1で確立されたテストカバレッジを活用し、中程度のリスクを伴うリファクタリングを実施します。

### Phase 1からの引き継ぎ

Phase 1では以下が完了しています：
- プラグイン設定の一元化（`astro.config.mjs`）
- 未使用バックアップファイルの削除
- プラグインテストの確認・拡充
- コードコメントの日本語統一

### Phase 2の目的

Phase 1で準備されたテスト基盤を活用し、以下の改善を実施：
1. 正規表現のパフォーマンス最適化
2. グローバル変数の改善（View Transitions対応の堅牢化）
3. デザイントークンの重複削減

### 分析で特定された主要課題

1. **正規表現の最適化余地**: プラグイン内で毎回正規表現オブジェクトを生成している箇所がある
2. **グローバル変数の課題**: `document`へのプロパティ追加（`__mobileMenuGlobalListeners`）がView Transitions時に問題を起こす可能性
3. **CSSの重複**: `design-tokens.css`と`global.css`でダークモード関連スタイルが重複定義されている

---

## Phase 2 Requirements

### Requirement 1: 正規表現のパフォーマンス最適化

**Objective:** As a 開発者, I want プラグイン内の正規表現を最適化したい, so that ビルド時のパフォーマンスを向上できる

**リスクレベル:** 中（動作が変わる可能性）
**前提条件:** Phase 1のテストが全てパスすること

#### Acceptance Criteria

1. The remark-tags Plugin shall 正規表現オブジェクトをモジュールスコープで事前コンパイルする
2. The remark-wikilink Plugin shall 頻繁に使用される正規表現をモジュールスコープで定義する
3. When ビルドを実行する場合, the Astro Build System shall Phase 1完了時と同一の出力を生成する
4. When `npm run test`を実行する場合, the Test Runner shall すべてのプラグインテストをパスする
5. The remark-tags Plugin shall `new RegExp()`呼び出しを関数外で1回のみ実行するよう最適化する

### Requirement 2: グローバル変数の改善

**Objective:** As a 開発者, I want グローバル変数をより堅牢なパターンに置き換えたい, so that View Transitions時の予期しない動作を防げる

**リスクレベル:** 中（View Transitions動作に影響の可能性）
**前提条件:** モバイルメニューの動作確認ができること

#### Acceptance Criteria

1. The Header Component shall `document`オブジェクトへの直接プロパティ追加を避ける
2. The Header Component shall イベントリスナーの重複登録を防ぐためのフラグ管理をDOM要素のdata属性で行う
3. When View Transitionsでページ遷移する場合, the Mobile Menu shall 正常に開閉動作する
4. When モバイルメニューを開いた状態でページ遷移する場合, the Mobile Menu shall 自動的に閉じた状態でリセットされる
5. The Header Component shall `(document as any).__propertyName`パターンを使用しない

### Requirement 3: デザイントークンの重複削減

**Objective:** As a 開発者, I want CSSファイル間のダークモードスタイル重複を解消したい, so that スタイルの一貫性と保守性を向上できる

**リスクレベル:** 中〜高（ダークモード切替に影響の可能性）
**前提条件:** ダークモード切替の動作確認ができること

#### Acceptance Criteria

1. The design-tokens.css shall ダークモードのCSS変数定義を一元管理する（`html.dark`と`prefers-color-scheme: dark`の両方）
2. The global.css shall ダークモードのCSS変数上書きを行わない（`design-tokens.css`で定義された変数を参照するのみ）
3. When ダークモードに切り替える場合, the itzpapa Site shall Phase 1完了時と同一の視覚的表示を維持する
4. When OSのダークモード設定に従う場合, the itzpapa Site shall Phase 1完了時と同一の視覚的表示を維持する
5. The CSS Codebase shall `html.dark`ブロック内での同一プロパティの重複定義を持たない
6. The global.css shall コンポーネント固有のダークモードスタイル（`strong`, `em`, `blockquote`など）のみを定義する

---

## Out of Scope

以下の項目はPhase 2のスコープ外とします：

- プラグインのTypeScript化（工数が大きいため別途検討）
- OG画像生成のテンプレート統合（機能に影響するため別途検討）
- セマンティックHTMLの見直し（デザイン変更を伴うため別途検討）
- E2Eテストの新規追加（Phase 2の検証は手動確認で実施）
- ビジュアルリグレッションテストの導入（将来課題）

---

## Verification Strategy

### 各要件の検証方法

| Requirement | 検証方法 |
|-------------|----------|
| 1. 正規表現最適化 | ユニットテスト実行 + ビルド出力比較 |
| 2. グローバル変数改善 | 手動テスト（モバイルメニュー操作 + View Transitions） |
| 3. デザイントークン重複削減 | ダークモード切替の手動確認 + CSS検証 |

### 共通の検証項目

- `npm run build`がエラーなく完了すること
- `npm run test`が全てパスすること
- 開発サーバーでの動作確認
