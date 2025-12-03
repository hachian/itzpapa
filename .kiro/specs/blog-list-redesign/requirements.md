# Requirements Document

## Introduction

ブログ一覧ページ（`/blog/`）のデザインを改善し、統一感のあるグリッドレイアウトとモダンなカードデザインを実現する。現状では最初の記事が大きく表示される非対称レイアウトだが、すべての記事カードを同じサイズで揃え、視覚的な一貫性を向上させる。

## Requirements

### Requirement 1: 統一グリッドレイアウト

**Objective:** 閲覧者として、すべてのブログ記事が同じサイズのカードで表示されることで、一覧性が向上し記事を選びやすくしたい。

#### Acceptance Criteria
1. The Blog List Page shall すべての記事カードを同一サイズで表示する
2. The Blog List Page shall グリッドレイアウトで記事カードを配置する
3. When 画面幅が変更された場合, the Blog List Page shall グリッドの列数をレスポンシブに調整する
4. The Blog List Page shall 最初の記事を特別扱い（大きく表示）しない
5. The Blog List Page shall デスクトップでは3列、タブレットでは2列、モバイルでは1列のグリッドを表示する

### Requirement 2: 統一カードデザイン

**Objective:** 閲覧者として、整然と揃ったカードデザインにより、視覚的なノイズが減り記事内容に集中できるようにしたい。

#### Acceptance Criteria
1. The Post Card shall 固定の縦幅（高さ）を持つ
2. The Post Card shall ヒーロー画像を固定のアスペクト比で表示する
3. If 記事タイトルがカード幅を超える場合, then the Post Card shall タイトルを省略表示（...）する
4. If 記事説明文がカード高さを超える場合, then the Post Card shall 説明文を省略表示（...）する
5. The Post Card shall タイトル、説明文、日付の表示位置を全カードで統一する
6. The Post Card shall ヒーロー画像がない記事でも同一の高さを維持する

### Requirement 3: タイポグラフィ改善

**Objective:** 閲覧者として、読みやすいフォントサイズと行間で記事情報を把握しやすくしたい。

#### Acceptance Criteria
1. The Post Card shall 記事タイトルを適切なフォントサイズで表示する
2. The Post Card shall 説明文を本文より小さいフォントサイズで表示する
3. The Post Card shall 日付を控えめなサイズで表示する
4. The Post Card shall 適切な行間（line-height）を設定する
5. The Post Card shall タイトル・説明文・日付間に適切な余白を設ける

### Requirement 4: レスポンシブ対応

**Objective:** 閲覧者として、どのデバイスでも最適化されたレイアウトでブログ一覧を閲覧したい。

#### Acceptance Criteria
1. When デスクトップ（768px以上）で表示した場合, the Blog List Page shall 複数列のグリッドを表示する
2. When モバイル（767px以下）で表示した場合, the Blog List Page shall 1列のグリッドを表示する
3. The Post Card shall 各ブレークポイントで適切なフォントサイズに調整する
4. The Post Card shall 画面幅に応じて適切な余白を持つ

### Requirement 5: ダークモード対応

**Objective:** 閲覧者として、ダークモード時も見やすいデザインでブログ一覧を閲覧したい。

#### Acceptance Criteria
1. While ダークモードが有効な場合, the Post Card shall ダークモード用の背景色を適用する
2. While ダークモードが有効な場合, the Post Card shall 適切なコントラストを持つテキスト色を適用する
3. While ダークモードが有効な場合, the Post Card shall ダークモード用のホバーエフェクトを適用する
