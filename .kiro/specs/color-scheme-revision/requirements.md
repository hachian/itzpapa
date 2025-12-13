# Requirements Document

## Introduction
itzpapaブログテンプレートの配色スキームを見直し、より洗練されたビジュアルデザインとアクセシビリティを実現する。現在のOKLCHベースのカラーシステムを基盤として、プライマリカラーの選択肢拡充、セマンティックカラーの最適化、ダークモード対応の改善を行う。

## Verification Strategy
**Playwrightによる視覚確認を必須とする。** 各要件の実装後、以下の検証プロセスを実施すること：

1. **実装前の現状確認**: 変更前のスクリーンショットをPlaywrightで取得
2. **段階的な視覚確認**: CSS変更ごとにPlaywrightでページをレンダリングし、意図通りの表示になっているか確認
3. **ライト/ダークモード両方の検証**: 各変更に対して両モードでのスクリーンショット比較
4. **主要ページの網羅的確認**: ホーム、ブログ一覧、ブログ記事詳細、タグページ、Aboutページを対象とする
5. **レスポンシブ確認**: デスクトップ（1280px）、タブレット（768px）、モバイル（375px）の各ビューポートで確認

**確認タイミング**:
- 各Requirementの実装完了時
- 複数コンポーネントに影響する変更時
- ダークモード関連の調整時

## Requirements

### Requirement 1: プライマリカラーの選択肢拡充
**Objective:** As a サイト管理者, I want 複数のプリセット配色スキームから選択できる機能, so that デザインの専門知識がなくてもサイトの外観を簡単にカスタマイズできる

#### Acceptance Criteria
1. When ユーザーが site.config.ts のテーマ設定を編集する, the Color System shall プリセット名（例: "purple", "ocean", "forest"）による配色スキーム指定を受け付ける
2. The Color System shall 現在のprimaryHue数値指定（0-360）も引き続きサポートする
3. The Color System shall 最低5つの配色プリセット（紫、青、緑、オレンジ、モノクロ）を提供する
4. When 無効なプリセット名が指定された場合, the Color System shall デフォルトの紫テーマにフォールバックする

### Requirement 2: カラーコントラストとアクセシビリティ
**Objective:** As a 視覚に制約のあるユーザー, I want WCAG 2.1 AA準拠のカラーコントラスト, so that コンテンツを快適に読むことができる

#### Acceptance Criteria
1. The Color System shall すべてのテキストと背景の組み合わせでWCAG 2.1 AAコントラスト比（4.5:1以上）を満たす
2. The Color System shall 大きなテキスト（18pt以上または14pt太字）で3:1以上のコントラスト比を確保する
3. The Color System shall インタラクティブ要素（ボタン、リンク）で視覚的に識別可能な状態変化を提供する
4. While ダークモードが有効な状態, the Color System shall ライトモードと同等のコントラスト比を維持する

### Requirement 3: セマンティックカラーの体系化
**Objective:** As a 開発者, I want 意味のあるCSS変数名による色指定, so that コードの可読性と保守性を向上できる

#### Acceptance Criteria
1. The Color System shall 状態を表すセマンティックカラー（success, warning, error, info）を定義する
2. The Color System shall 各セマンティックカラーに対してライト/ダークモードの両方の値を提供する
3. The Color System shall コンポーネントごとの色変数（例: --card-bg, --card-border）を提供する
4. The Color System shall 既存のdesign-tokens.cssとの後方互換性を維持する

### Requirement 4: ダークモード最適化
**Objective:** As a ユーザー, I want 目に優しいダークモード配色, so that 夜間や暗い環境でも快適にコンテンツを閲覧できる

#### Acceptance Criteria
1. The Color System shall 純粋な黒（#000000）を避け、明度を上げたダークグレー（OKLCH明度20%以上）を背景に使用する
2. The Color System shall ダークモードの背景色を現在より明るく調整し、目の疲れを軽減する
3. The Color System shall ダークモードで適切に明度調整されたプライマリカラーを提供する
4. When システムのカラースキーム設定が変更された, the Color System shall 自動的にテーマを切り替える
5. When ユーザーが手動でテーマを切り替えた, the Color System shall ユーザーの選択を優先してローカルストレージに保存する

### Requirement 6: ライトモードとダークモードの統一感
**Objective:** As a ユーザー, I want ライトモードとダークモードで一貫したデザイン体験, so that モード切り替え時に違和感なくサイトを利用できる

#### Acceptance Criteria
1. The Color System shall ライトモードとダークモードで同じデザイン言語（色相、彩度の関係性）を維持する
2. The Color System shall 両モードでプライマリカラーの視覚的な印象を統一する
3. The Color System shall コンポーネント（ボタン、カード、タグ等）の見た目の一貫性を両モードで保つ
4. The Color System shall 両モードで同等の視覚的階層（コントラスト比の相対関係）を維持する

### Requirement 7: ブログ本文エリアの背景分離
**Objective:** As a 読者, I want ブログ本文が周囲と区別された領域に表示されること, so that コンテンツに集中して読書できる

#### Acceptance Criteria
1. The Color System shall ブログ本文エリアの背景色をページ全体の背景色と異なる色に設定する
2. While ライトモードが有効な状態, the Color System shall 本文エリアを白（または明るいサーフェス色）、ページ背景をやや暗いグレーで表示する
3. While ダークモードが有効な状態, the Color System shall 本文エリアをやや明るいダークグレー、ページ背景をより暗いグレーで表示する
4. The Color System shall 本文エリアと背景の境界を視覚的に認識可能にする（色差またはシャドウによる）

### Requirement 5: Callout・タグ・マークハイライトの配色統一
**Objective:** As a コンテンツ作成者, I want Obsidian互換要素の配色がサイト全体と調和すること, so that 統一感のあるビジュアルデザインを実現できる

#### Acceptance Criteria
1. The Color System shall Calloutブロックの配色をプライマリカラーと調和させる
2. The Color System shall タグバッジの配色をプライマリカラーパレットから派生させる
3. The Color System shall マークハイライト（==テキスト==）の背景色を視認性を保ちながらテーマと調和させる
4. While カスタム配色プリセットを使用中, the Color System shall これらの要素の配色も自動的に調整する
