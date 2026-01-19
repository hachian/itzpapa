# ギャップ分析レポート

## 概要

CJK括弧と強調記法の組み合わせでマークダウンがレンダリングされない問題の実装ギャップ分析。

## 問題の根本原因

### CommonMark仕様の制限

この問題は**CommonMark仕様のデリミタ処理ルール**に起因する既知の問題です。

- CommonMarkでは、強調記法（`*`、`**`）の開始/終了位置を判定する際に「単語境界」を使用
- CJK文字（日本語括弧を含む）は単語境界として認識されない
- 結果として、`*【注意】*`のようなパターンで`*`が強調の開始/終了として認識されない

**参考リンク:**
- [Emphasis with CJK punctuation - CommonMark Spec Issue #650](https://github.com/commonmark/commonmark-spec/issues/650)
- [Why Markdown emphasis fails in CJK: A deep dive](https://lobste.rs/s/a8x19t/why_markdown_emphasis_fails_cjk_deep_dive)

### 技術的詳細

Astroで使用しているマークダウンパーサー（micromark/remark）は、CommonMark仕様に準拠しているため、この問題が発生します。

```
入力: *【注意】*マーク
期待: <em>【注意】</em>マーク
実際: *【注意】*マーク（変換されない）
```

## 既存コードベースの分析

### プラグイン処理順序（astro.config.mjs）

```
1. remarkWikilink     - WikiLink処理（最優先）
2. remarkCallout      - Callout構文パース
3. remarkBreaks       - 改行処理
4. remarkTaskStatus   - タスクステータス
5. remarkMarkHighlight - ハイライト記法
6. remarkTags         - タグ処理
```

**制約:** remark処理は**マークダウンパース後**に実行されるため、強調記法（`*`、`**`）の処理はremarkプラグインでは直接制御できない。

### 関連する既存実装

| ファイル | 役割 | CJK対応状況 |
|---------|------|-------------|
| `src/plugins/remark-mark-highlight/index.js` | `==text==`ハイライト | ✅ CJK文字対応済み |
| `src/plugins/remark-wikilink/index.js` | WikiLink処理 | ✅ 日本語対応済み |
| `astro.config.mjs` | プラグイン設定 | ❌ CJK強調対応なし |

### テストカバレッジ

- `tests/unit/mark-highlight-unit-test.js`: マークハイライトの基本テスト
- `tests/unit/mark-highlight-inline-test.js`: 強調記法との組み合わせテスト

**不足しているテスト:**
- CJK括弧 + 強調記法のテスト
- `*【注意】*`、`*〈参考〉*`のようなパターン

## 要件との対応マップ

| 要件 | 既存資産 | ギャップ |
|-----|---------|---------|
| Req 1: CJK括弧+強調記法 | なし | **Missing**: micromarkレベルでの対応必要 |
| Req 2: マークハイライト入れ子 | remark-mark-highlight | **Constraint**: パーサー処理順序の制限 |
| Req 3: 既存機能互換性 | 全プラグイン | 影響なし（既存テスト維持） |
| Req 4: パフォーマンス維持 | キャッシュ機構 | 計測が必要 |
| Req 5: テストカバレッジ | 部分的 | **Missing**: CJKテストケース追加必要 |

## 実装アプローチオプション

### Option A: remark-cjk-friendlyパッケージの導入

**説明:** 既存のnpmパッケージ [`remark-cjk-friendly`](https://www.npmjs.com/package/remark-cjk-friendly) を導入する。

**実装方法:**
1. `npm install remark-cjk-friendly`
2. `astro.config.mjs`の`remarkPlugins`配列の**最初**に追加

```javascript
import remarkCjkFriendly from 'remark-cjk-friendly';

const commonRemarkPlugins = [
  remarkCjkFriendly, // ← 最初に追加
  [remarkWikilink, { priority: 'high' }],
  // ...
];
```

**トレードオフ:**
- ✅ 実績あるソリューション（CommonMark仕様レベルで対応）
- ✅ 最小限のコード変更
- ✅ メンテナンスコスト低（外部パッケージに依存）
- ❌ 外部依存の追加
- ❌ 将来の更新・互換性リスク

**工数:** S（1-3日）
**リスク:** Low

### Option B: カスタムmicromark拡張の開発

**説明:** `micromark-extension-cjk-friendly`を参考に、プロジェクト固有のmicromark拡張を開発する。

**実装方法:**
1. `src/plugins/micromark-cjk-emphasis/`を新規作成
2. micromarkのデリミタ処理をカスタマイズ
3. Astro設定で統合

**トレードオフ:**
- ✅ 外部依存なし
- ✅ プロジェクト要件に最適化可能
- ❌ 実装コスト高
- ❌ micromarkの内部動作の深い理解が必要
- ❌ メンテナンス負荷高

**工数:** L（1-2週間）
**リスク:** Medium

### Option C: ハイブリッドアプローチ（remark-cjk-friendly + カスタム拡張）

**説明:** 基本機能は`remark-cjk-friendly`で対応し、マークハイライト（`==text==`）との組み合わせは既存プラグインを拡張する。

**実装方法:**
1. `remark-cjk-friendly`を導入（Option A）
2. `remark-mark-highlight`でCJK括弧を含む入れ子パターンの処理を強化

**トレードオフ:**
- ✅ 効率的な実装
- ✅ 強調記法の根本問題を解決
- ✅ 入れ子パターンも対応可能
- ❌ 外部依存の追加
- ❌ 複数箇所の変更が必要

**工数:** M（3-7日）
**リスク:** Low

## 推奨アプローチ

**Option A（remark-cjk-friendlyの導入）を推奨**

理由:
1. 問題の根本原因（CommonMark仕様のデリミタ処理）はremarkプラグインレベルでは解決不可能
2. `remark-cjk-friendly`は実績があり、CommonMark 0.31.2との互換性を維持
3. 最小限のコード変更で要件を満たせる
4. 既存のマークハイライトプラグインとの組み合わせで`==*（テキスト）*==`も対応可能

## 設計フェーズで調査が必要な項目

1. **remark-cjk-friendlyのバージョン互換性**
   - remark v15.x、Astro v5.xとの互換性確認

2. **プラグイン実行順序の検証**
   - remarkCjkFriendlyとremarkWikilinkの相互作用

3. **パフォーマンス計測**
   - 大量のCJKコンテンツでの処理時間

4. **GFM Strikethroughの対応**
   - 必要な場合は`remark-cjk-friendly-gfm-strikethrough`も検討

## 次のステップ

1. 要件の承認を確認
2. `/kiro:spec-design cjk-markdown-rendering-fix`で設計ドキュメントを生成
3. `remark-cjk-friendly`の導入手順と統合テストを設計

---

**参考資料:**
- [remark-cjk-friendly - npm](https://www.npmjs.com/package/remark-cjk-friendly)
- [markdown-cjk-friendly - GitHub](https://github.com/tats-u/markdown-cjk-friendly)
- [CommonMark CJK Discussion](https://talk.commonmark.org/t/cjk-and-bold-tags-possibly-complex-issue/4034)
