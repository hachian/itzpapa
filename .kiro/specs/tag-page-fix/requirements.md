# Requirements Document

## Introduction
タグページにおけるスタイル・見た目のバグを修正します。主な問題はTagBadgeコンポーネントの表示問題とTagTreeコンポーネント（ツリービュー）の表示問題です。現在のタグ一覧ページ（`/tags/`）およびタグ詳細ページ（`/tags/[slug]`）で使用されているこれらのコンポーネントの視覚的な不具合を解消し、ユーザー体験を改善します。

## Requirements

### Requirement 1: TagBadgeコンポーネントのスタイル修正
**Objective:** As a サイト訪問者, I want タグバッジが正しく表示されること, so that タグを視認しやすく、クリックしやすい状態で利用できる

#### Acceptance Criteria
1. The TagBadge component shall タグテキストとカウント数を正しいフォントサイズで表示する
2. When ユーザーがタグバッジにホバーする, the TagBadge component shall CSS変数で定義された色とスタイルを正しく適用する
3. While ダークモードが有効な状態, the TagBadge component shall ダークモード用のCSS変数を使用して背景色、文字色、ボーダー色を正しく表示する
4. The TagBadge component shall モバイル画面（640px以下）で適切なサイズとタップターゲットを確保する
5. If タグにカウント数が設定されている, then the TagBadge component shall カウントバッジを適切なスタイルで表示する

### Requirement 2: TagTreeコンポーネント（ツリービュー）のスタイル修正
**Objective:** As a サイト訪問者, I want 階層タグツリーが正しく表示・動作すること, so that タグの階層構造を把握しやすく、ナビゲーションがスムーズにできる

#### Acceptance Criteria
1. The TagTree component shall 階層構造に応じた正しいインデントで各ノードを表示する
2. When ユーザーが展開/折りたたみボタンをクリックする, the TagTree component shall 子タグの表示/非表示を正しく切り替える
3. The TagTree component shall 展開/折りたたみアイコンの回転アニメーションを正しく表示する
4. While ダークモードが有効な状態, the TagTree component shall ダークモード用の背景色、ホバー色、インデントガイド色を正しく適用する
5. The TagTree component shall モバイル画面で適切なサイズ調整とレイアウトを維持する
6. If ツリーノードにホバーする, then the TagTree component shall ホバー背景色を正しく表示する

### Requirement 3: CSS変数の整合性確保
**Objective:** As a 開発者, I want CSS変数が正しく定義・参照されていること, so that コンポーネント間でスタイルの一貫性が保たれる

#### Acceptance Criteria
1. The タグ関連CSS shall `--tag-*`プレフィックスの変数を一貫して使用する
2. The ツリー関連CSS shall `--tree-*`プレフィックスの変数を一貫して使用する
3. If CSS変数が未定義の場合, then the スタイルシート shall 適切なフォールバック値を提供する
4. The CSS変数定義 shall ライトモードとダークモードの両方で適切な値を持つ
