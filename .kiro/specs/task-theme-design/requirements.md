# Requirements Document

## Introduction
Obsidianで使用されるタスク記法（チェックボックス拡張構文）をAstroブログ上で視覚的にレンダリングする機能。`- [ ]`形式のタスクリストにおいて、括弧内の文字に応じた22種類のステータスアイコンを表示する。表示専用であり、ブラウザ上での状態変更は行わない。

## Requirements

### Requirement 1: 基本タスクステータスのレンダリング
**Objective:** As a ブログ閲覧者, I want Obsidianのタスク記法が適切なアイコンで表示される, so that タスクの状態を視覚的に把握できる

#### Acceptance Criteria
1. When Markdownに`- [ ]`（スペース）が含まれる場合, the Task Renderer shall 未完了（to-do）アイコンを表示する
2. When Markdownに`- [x]`が含まれる場合, the Task Renderer shall 完了（done）アイコンを表示する
3. When Markdownに`- [/]`が含まれる場合, the Task Renderer shall 進行中（incomplete）アイコンを表示する
4. When Markdownに`- [-]`が含まれる場合, the Task Renderer shall キャンセル（canceled）アイコンを表示する

### Requirement 2: スケジューリング関連ステータスのレンダリング
**Objective:** As a ブログ閲覧者, I want スケジュール関連のタスク状態が識別できる, so that タスクの進行状況を理解できる

#### Acceptance Criteria
1. When Markdownに`- [>]`が含まれる場合, the Task Renderer shall 転送（forwarded）アイコンを表示する
2. When Markdownに`- [<]`が含まれる場合, the Task Renderer shall スケジューリング（scheduling）アイコンを表示する

### Requirement 3: 重要度・状態マーカーのレンダリング
**Objective:** As a ブログ閲覧者, I want タスクの重要度や特殊な状態を視覚的に識別できる, so that 優先度の高いタスクを素早く認識できる

#### Acceptance Criteria
1. When Markdownに`- [?]`が含まれる場合, the Task Renderer shall 質問（question）アイコンを表示する
2. When Markdownに`- [!]`が含まれる場合, the Task Renderer shall 重要（important）アイコンを表示する
3. When Markdownに`- [*]`が含まれる場合, the Task Renderer shall スター（star）アイコンを表示する

### Requirement 4: 参照・情報マーカーのレンダリング
**Objective:** As a ブログ閲覧者, I want 参照情報やメタデータを示すマーカーを識別できる, so that 情報の種類を素早く判断できる

#### Acceptance Criteria
1. When Markdownに`- ["]`が含まれる場合, the Task Renderer shall 引用（quote）アイコンを表示する
2. When Markdownに`- [l]`が含まれる場合, the Task Renderer shall 場所（location）アイコンを表示する
3. When Markdownに`- [b]`が含まれる場合, the Task Renderer shall ブックマーク（bookmark）アイコンを表示する
4. When Markdownに`- [i]`が含まれる場合, the Task Renderer shall 情報（information）アイコンを表示する

### Requirement 5: アイデア・評価マーカーのレンダリング
**Objective:** As a ブログ閲覧者, I want アイデアや評価を示すマーカーを識別できる, so that 思考の種類を理解できる

#### Acceptance Criteria
1. When Markdownに`- [S]`が含まれる場合, the Task Renderer shall 貯蓄（savings）アイコンを表示する
2. When Markdownに`- [I]`が含まれる場合, the Task Renderer shall アイデア（idea）アイコンを表示する
3. When Markdownに`- [p]`が含まれる場合, the Task Renderer shall 賛成（pros）アイコンを表示する
4. When Markdownに`- [c]`が含まれる場合, the Task Renderer shall 反対（cons）アイコンを表示する

### Requirement 6: アクション・結果マーカーのレンダリング
**Objective:** As a ブログ閲覧者, I want アクションや結果を示すマーカーを識別できる, so that タスクの性質を把握できる

#### Acceptance Criteria
1. When Markdownに`- [f]`が含まれる場合, the Task Renderer shall 緊急（fire）アイコンを表示する
2. When Markdownに`- [k]`が含まれる場合, the Task Renderer shall キー（key）アイコンを表示する
3. When Markdownに`- [w]`が含まれる場合, the Task Renderer shall 勝利（win）アイコンを表示する
4. When Markdownに`- [u]`が含まれる場合, the Task Renderer shall 上昇（up）アイコンを表示する
5. When Markdownに`- [d]`が含まれる場合, the Task Renderer shall 下降（down）アイコンを表示する

### Requirement 7: 表示専用動作
**Objective:** As a ブログ運営者, I want タスクチェックボックスがクリックで変更されない, so that ブログコンテンツの整合性が保たれる

#### Acceptance Criteria
1. The Task Renderer shall チェックボックスをクリック不可（disabled）状態でレンダリングする
2. When ユーザーがタスクアイテムをクリックした場合, the Task Renderer shall 状態を変更しない
3. The Task Renderer shall ポインターカーソルを表示しない（視覚的にクリック不可を示す）

### Requirement 8: 未知のステータス処理
**Objective:** As a ブログ運営者, I want 未定義のステータス文字が適切に処理される, so that 表示エラーが発生しない

#### Acceptance Criteria
1. When Markdownに未定義のステータス文字（例: `- [z]`）が含まれる場合, the Task Renderer shall デフォルトのチェックボックスとして表示する
2. If 無効なタスク記法が検出された場合, the Task Renderer shall 通常のリストアイテムとしてフォールバック表示する
