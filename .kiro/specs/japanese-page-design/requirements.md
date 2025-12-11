# Requirements Document

## Introduction

本仕様は「日本語のページとしてのデザイン」に関する要件を定義します。Obsidianユーザー向けAstroブログソリューションとして、日本語コンテンツに最適化されたデザイン・タイポグラフィ・UIを提供することを目的とします。

現在のサイトは既に日本語フォント（Noto Sans JP）、日本語向け行間設定（line-height: 1.85）、和文用UIテキストを備えています。本仕様では、これらの基盤の上に日本語コンテンツ体験をさらに向上させる機能を追加します。

### 競合サービス調査結果（フォントサイズ・行間）

| サービス | 本文font-size | line-height | 備考 |
|---------|---------------|-------------|------|
| note.com | 18px | 2.0 (36px) | 余白広め、ゆったりしたデザイン |
| Zenn | 16px | 1.8-1.9 | 技術記事向け、コード混在を考慮 |
| Qiita | 16px | 1.9 | WCAG基準を満たす行間 |
| Yahoo!ニュース等 | 16px | 1.75 (28px) | 情報量重視のニュースサイト |

**現在のitzpapa設定**: font-size: 20px (1.25rem)、line-height: 1.625

## Requirements

### Requirement 1: フォントサイズの最適化
**Objective:** ブログ読者として、日本語技術ブログに最適化されたフォントサイズで記事を読みたい。これにより、Zenn/Qiita/noteと同等の読みやすさが実現される。

#### Acceptance Criteria
1. The design system shall 本文のベースフォントサイズを16px〜18pxの範囲で設定する
2. The design system shall 本文のline-heightを1.8〜2.0の範囲で設定する
3. When デスクトップ表示（1024px以上）の場合, the typography shall 本文フォントサイズを18pxに設定する
4. When モバイル表示（768px未満）の場合, the typography shall 本文フォントサイズを16pxに設定する
5. The design tokens shall 見出しサイズを本文サイズとの比率で定義する（h1: 2.5em、h2: 2em、h3: 1.5em、h4: 1.25em）

### Requirement 2: 和文タイポグラフィの最適化
**Objective:** ブログ読者として、日本語テキストを快適に読めるタイポグラフィ設定がほしい。これにより、長文コンテンツの可読性が向上する。

#### Acceptance Criteria
1. The BlogPost layout shall 本文エリアに日本語最適化された文字間隔（letter-spacing: 0.02em〜0.05em）を適用する
2. The BlogPost layout shall 見出し（h1-h6）に和文に適したフォントウェイト（600-700）を適用する
3. The typography system shall 句読点、括弧などの約物の配置を最適化する（font-feature-settings）
4. When 画面幅が768px未満の場合, the layout shall モバイル向けに読みやすいフォントサイズと行間を維持する

### Requirement 3: 日本語向けレイアウト調整
**Objective:** コンテンツ作成者として、日本語コンテンツに適した余白とレイアウトがほしい。これにより、日本語ならではの視覚的バランスが実現される。

#### Acceptance Criteria
1. The design system shall 段落間の余白を日本語テキストの視覚的リズムに合わせて調整する（1.5em〜2em）
2. The card component shall 日本語テキストの文字数に合わせたカード幅の最適化を行う
3. The layout system shall 全角文字のテキストオーバーフローを適切に処理する（word-break: break-all回避、overflow-wrap: break-word使用）
4. When テキストが長い場合, the system shall CSS text-wrap: balanceプロパティで自然な日本語の折り返しを実現する

### Requirement 4: 日付と時刻の日本語表示
**Objective:** ブログ読者として、投稿日時を日本語形式で確認したい。これにより、日本人ユーザーにとって馴染みやすい表示になる。

#### Acceptance Criteria
1. The FormattedDate component shall 日付を「YYYY/MM/DD」形式で表示する
2. The FormattedDate component shall 曜日を表示する場合は日本語で表示する
3. The blog post metadata shall 更新日時がある場合は「（更新：YYYY/MM/DD）」形式で表示する

### Requirement 5: 日本語UI/UXパターン
**Objective:** サイト訪問者として、日本のWebデザインの慣習に沿ったUIを使用したい。これにより、直感的な操作が可能になる。

#### Acceptance Criteria
1. The navigation system shall パンくずリストを日本語の区切り文字（「>」または「›」）で表示する
2. The button component shall ボタンラベルを日本語で統一する（例：「もっと見る」「戻る」）
3. The error page (404) shall 日本語のエラーメッセージを表示する
4. The Header component shall メニューアイコンのaria-labelに日本語を使用する（既存実装済み）

---

## 参考情報

- [note.comのタイポグラフィ設定](https://note.com/chanoh/n/n2dd309c8ded0) - フォントサイズ18px、行間36px
- [日本語の文章とline-heightに対する考察 - Qiita](https://qiita.com/NagayamaToshiaki/items/25d4969636d05bf48c41) - Qiitaはline-height 1.9
- [フォントサイズのベストな設定 - note](https://note.com/jd_designschool/n/n5ecf7bca6ab9) - 16px〜18pxが推奨
