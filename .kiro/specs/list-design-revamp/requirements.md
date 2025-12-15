# Requirements Document

## Introduction

itzpapaのブログ記事本文内で使用されるMarkdownリスト（順序なしリスト `<ul>` と順序付きリスト `<ol>`）のデザインを刷新する。現在はブラウザデフォルトに依存しており、サイト全体のデザインシステムとの統一感、可読性、ネストリストの視認性に改善の余地がある。

対象スコープ：
- `.prose` クラス内の `<ul>` 要素
- `.prose` クラス内の `<ol>` 要素
- ネストしたリスト（複数階層）
- リストマーカー（ビュレット、番号）のスタイリング

## Requirements

### Requirement 1: 順序なしリスト（ul）のデザイン

**Objective:** 読者として、順序なしリストを視覚的に明確に認識したい。そうすることで、箇条書きの情報を素早く把握できる。

#### Acceptance Criteria

1. The `.prose ul` shall リストマーカーとして円形ビュレット（disc）をデフォルトで表示する
2. The `.prose ul` shall 左側にデザイントークンに基づいたインデント（1.5em〜2em）を持つ
3. The `.prose ul li` shall 適切な行間（1.6〜1.8）と項目間余白（0.5em）を持つ
4. When リストマーカーが表示される, the マーカー shall プライマリカラーまたはアクセントカラーで着色される
5. The `.prose ul` shall 段落との間に適切な余白（上下1em〜1.5em）を持つ

### Requirement 2: 順序付きリスト（ol）のデザイン

**Objective:** 読者として、順序付きリストの番号を明確に認識したい。そうすることで、手順や優先順位のある情報を正しく理解できる。

#### Acceptance Criteria

1. The `.prose ol` shall 数字マーカー（decimal）をデフォルトで表示する
2. The `.prose ol` shall 左側にデザイントークンに基づいたインデント（1.5em〜2em）を持つ
3. The `.prose ol li` shall 順序なしリストと同じ行間と項目間余白を持つ
4. When 番号マーカーが表示される, the マーカー shall 本文と区別できるスタイル（色、太さ、またはフォント）を持つ
5. The `.prose ol` shall 段落との間に適切な余白（上下1em〜1.5em）を持つ

### Requirement 3: ネストリストのスタイリング

**Objective:** 読者として、階層構造を持つリストの親子関係を視覚的に理解したい。そうすることで、複雑な情報構造を把握できる。

#### Acceptance Criteria

1. When 順序なしリストがネストされる, the 子リスト shall 異なるマーカースタイル（circle、square）を階層ごとに使用する
2. When 順序付きリストがネストされる, the 子リスト shall 適切な番号スタイル（lower-alpha、lower-roman等）を階層ごとに使用する
3. The ネストリスト shall 親リストに対して視覚的なインデント（追加の左余白）を持つ
4. The ネストリスト shall 最大3〜4階層まで明確に区別できるスタイルを持つ
5. While 深いネスト（4階層以上）が存在する, the リスト shall 読みやすさを維持するためインデント幅を調整する
6. The ネストリスト内の項目間余白 shall ネストの深さに関わらず、トップレベルのリストと同じ値（0.5em）を維持する
7. The ネストリスト shall 親項目との間に適切な上余白（0.25em〜0.5em）を持つ
8. When ネストが解消されて親リストに戻る, the 次の親項目との余白 shall 通常の項目間余白（0.5em）と同じ値を維持する

### Requirement 4: リストマーカーのカスタマイズ

**Objective:** 開発者として、リストマーカーのスタイルをCSSで柔軟に制御したい。そうすることで、デザインの一貫性と拡張性を確保できる。

#### Acceptance Criteria

1. The リストマーカー shall `::marker` 疑似要素またはカスタムプロパティで色・サイズを制御できる
2. The リストスタイル shall CSS変数（デザイントークン）を使用して定義される
3. If カスタムマーカーを使用する場合, then the マーカー shall `list-style-type: none` と `::before` 疑似要素で実装できる
4. The マーカーカラー shall ライトモード・ダークモードの両方で適切なコントラストを持つ
5. The リストスタイル shall 既存の`design-tokens.css`の変数を活用する

### Requirement 5: ダークモード対応

**Objective:** 読者として、ダークモードでもリストを快適に閲覧したい。そうすることで、目の負担なく夜間も記事を読める。

#### Acceptance Criteria

1. When ダークモードが有効な場合, the リストマーカー shall ダークモード用のカラースキームに自動切り替えする
2. The リストの文字色 shall ダークモードで`--color-text-primary`に従う
3. The マーカーカラー shall ダークモードで視認性を維持する明るさ（WCAG AA基準）を持つ
4. The `.prose ul, .prose ol` shall `html.dark`クラスに対応したスタイルを持つ
5. When システムのダークモード設定が変更される, the リストスタイル shall 自動的に切り替わる
