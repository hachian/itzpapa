# Requirements Document

## Introduction

このドキュメントは、Obsidian互換のマークハイライト記法（`==text==`）と他のインラインスタイリング（`**strong**`、`*em*`、`` `code` ``等）を同時に使用した場合にマークハイライトが適用されないバグの修正に関する要件を定義します。

現在、`remark-mark-highlight`プラグインは単独の`==text==`記法は正しく処理できますが、`**==text==**`（太字＋ハイライト）や`*==text==*`（斜体＋ハイライト）のような組み合わせでは、`<mark>`タグが生成されない問題があります。

## Requirements

### Requirement 1: strongノード内のマークハイライト処理
**Objective:** コンテンツ作成者として、太字（strong）とマークハイライトを組み合わせて使いたい。これにより、重要な箇所を強調しながらハイライト表示できるようになる。

#### Acceptance Criteria
1. When ユーザーが`**==ハイライトテキスト==**`と記述した場合, the Markdown Processor shall `<strong><mark>ハイライトテキスト</mark></strong>`のHTMLを生成する
2. When ユーザーが`==**太字テキスト**==`と記述した場合, the Markdown Processor shall `<mark><strong>太字テキスト</strong></mark>`のHTMLを生成する
3. When strongノード内に複数のマークハイライトがある場合（例：`**==A==と==B==**`）, the Markdown Processor shall それぞれのマークハイライトを個別の`<mark>`タグで囲む

### Requirement 2: emphasisノード内のマークハイライト処理
**Objective:** コンテンツ作成者として、斜体（em）とマークハイライトを組み合わせて使いたい。これにより、引用や強調表現にハイライトを追加できるようになる。

#### Acceptance Criteria
1. When ユーザーが`*==ハイライトテキスト==*`と記述した場合, the Markdown Processor shall `<em><mark>ハイライトテキスト</mark></em>`のHTMLを生成する
2. When ユーザーが`==*斜体テキスト*==`と記述した場合, the Markdown Processor shall `<mark><em>斜体テキスト</em></mark>`のHTMLを生成する
3. When emphasisノード内に複数のマークハイライトがある場合, the Markdown Processor shall それぞれのマークハイライトを個別の`<mark>`タグで囲む

### Requirement 3: inlineCodeノードとマークハイライトの併用処理
**Objective:** コンテンツ作成者として、インラインコードとマークハイライトを組み合わせて使いたい。これにより、重要なコードスニペットを視覚的に強調できるようになる。

#### Acceptance Criteria
1. When ユーザーが`` ==`code`== ``と記述した場合, the Markdown Processor shall `<mark><code>code</code></mark>`のHTMLを生成する
2. The Markdown Processor shall インラインコード内部の`==`記号はリテラルとして扱い、マークハイライトに変換しない（例：`` `==text==` ``は`<code>==text==</code>`のまま）
3. When ユーザーが`` **==`code`==** ``と記述した場合, the Markdown Processor shall `<strong><mark><code>code</code></mark></strong>`のHTMLを生成する
4. When ユーザーが`` *==`code`==* ``と記述した場合, the Markdown Processor shall `<em><mark><code>code</code></mark></em>`のHTMLを生成する

### Requirement 4: 複合インラインスタイルの入れ子処理
**Objective:** コンテンツ作成者として、strong・emphasis・mark・codeを自由に組み合わせて使いたい。これにより、Obsidianと同様の柔軟な表現が可能になる。

#### Acceptance Criteria
1. When ユーザーが`***==テキスト==***`（太字＋斜体＋ハイライト）と記述した場合, the Markdown Processor shall 3つのスタイルすべてが適用されたHTMLを生成する
2. When ユーザーが`**_==テキスト==_**`と記述した場合, the Markdown Processor shall strong、em、markの入れ子構造を正しく生成する
3. While 入れ子の深さが適切な範囲（maxNestingDepth設定値以内）である場合, the Markdown Processor shall すべての入れ子レベルを正しく処理する

### Requirement 5: 既存機能との後方互換性
**Objective:** プロジェクトメンテナとして、既存のマークハイライト機能を破壊しないことを保証したい。これにより、既存コンテンツへの影響を防ぐ。

#### Acceptance Criteria
1. The Markdown Processor shall 単独の`==テキスト==`記法を従来通り`<mark>`タグに変換する
2. The Markdown Processor shall エスケープ記法`\==テキスト\==`を従来通りリテラル文字列として出力する
3. The Markdown Processor shall カスタム属性記法`==テキスト=={.class}`を従来通り処理する
4. The Markdown Processor shall アクセシビリティ属性（role="mark"等）を従来通り付与する
5. If 不正な入れ子構造（閉じタグ不一致など）が検出された場合, the Markdown Processor shall 元のテキストをそのまま出力する（フェイルセーフ）

### Requirement 6: パフォーマンス要件
**Objective:** システム管理者として、修正後もビルドパフォーマンスを維持したい。これにより、大規模サイトのビルド時間への影響を防ぐ。

#### Acceptance Criteria
1. The Markdown Processor shall 既存のキャッシュ機構を活用して重複処理を回避する
2. While 大量のマークハイライトを含むドキュメントを処理している場合, the Markdown Processor shall 処理時間が従来比150%以内に収まる
3. The Markdown Processor shall maxInputLength制限を従来通り適用してDoS攻撃を防止する
