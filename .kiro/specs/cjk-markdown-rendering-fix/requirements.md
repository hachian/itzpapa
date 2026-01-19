# Requirements Document

## Introduction

本要件ドキュメントは、CJK（中国語・日本語・韓国語）の特殊文字（括弧類など）とマークダウン記法の組み合わせで発生するレンダリング問題の解決に関する仕様を定義します。

itzpapaはObsidianユーザー向けのAstroブログソリューションであり、Obsidian互換記法（強調、イタリック、マークハイライト等）をサポートしています。日本語コンテンツにおいては、全角括弧（「」『』（）【】〈〉等）とマークダウン強調記法（`*text*`、`**text**`、`==text==`等）を組み合わせて使用することが一般的ですが、現在のマークダウンパーサーでこれらの組み合わせが正しくレンダリングされない問題があります。

## Problem Statement

マークダウンパーサー（remark）はCJK括弧を単語境界として認識しないため、以下のような記法が正しくレンダリングされません：

### 現在失敗しているテストケース

```markdown
*【注意】*マーク
*〈参考〉*情報
==*（ハイライト内強調）*==
```

**期待される出力：**
- `*【注意】*` → `<em>【注意】</em>`（イタリック）
- `*〈参考〉*` → `<em>〈参考〉</em>`（イタリック）
- `==*（ハイライト内強調）*==` → `<mark><em>（ハイライト内強調）</em></mark>`（ハイライト + イタリック）

**実際の出力：**
- 強調記法が適用されず、元のテキストがそのまま表示される

## Requirements

### Requirement 1: CJK括弧と強調記法の互換性

**Objective:** ブログ執筆者として、日本語の括弧類（「」『』（）等）を含むテキストに強調記法を適用できるようにしたい。これにより、自然な日本語表記でコンテンツを作成できる。

#### Acceptance Criteria

1. When ユーザーが `*【注意】*` と記述した場合, the Markdown Processor shall `<em>【注意】</em>` としてレンダリングする
2. When ユーザーが `*〈参考〉*` と記述した場合, the Markdown Processor shall `<em>〈参考〉</em>` としてレンダリングする
3. When ユーザーが全角括弧を含むテキストに太字記法（`**text**`）を適用した場合, the Markdown Processor shall 括弧を含む全体のテキストを太字としてレンダリングする
4. The Markdown Processor shall 以下の日本語括弧をサポートする：（）「」『』【】〈〉《》〔〕［］｛｝

### Requirement 2: マークハイライトと強調記法の入れ子構造

**Objective:** ブログ執筆者として、マークハイライト内に強調記法を含む括弧付きテキストを使用できるようにしたい。これにより、複雑な表現も正確にレンダリングできる。

#### Acceptance Criteria

1. When ユーザーが `==*（ハイライト内強調）*==` と記述した場合, the Markdown Processor shall `<mark><em>（ハイライト内強調）</em></mark>` としてレンダリングする
2. When ユーザーが太字内にイタリック記法を含む括弧付きテキストを記述した場合, the Markdown Processor shall 両方の装飾を正しく適用する
3. If 入れ子構造が正しく閉じられていない場合, the Markdown Processor shall 元のテキストをそのまま表示する（静かに失敗する）

### Requirement 3: 既存機能との互換性維持

**Objective:** プロジェクト管理者として、CJK対応の修正が既存の機能を壊さないことを保証したい。これにより、安全にアップデートを適用できる。

#### Acceptance Criteria

1. The Markdown Processor shall 既存のWikiLink機能（`[[リンク]]`）との互換性を維持する
2. The Markdown Processor shall 既存のCallout機能との互換性を維持する
3. The Markdown Processor shall 既存のTask Status機能との互換性を維持する
4. The Markdown Processor shall ASCII括弧（`()`, `[]`, `{}`）の処理に影響を与えない
5. While 既存のテストが存在する場合, the Markdown Processor shall すべての既存テストをパスする

### Requirement 4: パフォーマンス維持

**Objective:** 開発者として、CJK対応によるパフォーマンス低下を防ぎたい。これにより、大量のコンテンツでも快適にビルドできる。

#### Acceptance Criteria

1. The Markdown Processor shall CJK文字を含むドキュメントでも、処理時間が著しく増加しない（既存処理の2倍以内）
2. The Markdown Processor shall 正規表現のバックトラック攻撃（ReDoS）に対する耐性を維持する

### Requirement 5: テストカバレッジ

**Objective:** 開発者として、CJK括弧の全パターンがテストされていることを確認したい。これにより、将来の回帰を防止できる。

#### Acceptance Criteria

1. The Test Suite shall 失敗しているテストケース（`*【注意】*`、`*〈参考〉*`、`==*（ハイライト内強調）*==`）をカバーする
2. The Test Suite shall 各CJK括弧タイプと強調記法の組み合わせをカバーするテストケースを含む
3. The Test Suite shall 入れ子構造パターンのテストケースを含む
4. The Test Suite shall エッジケース（空文字、括弧のみ、エスケープ）のテストケースを含む
