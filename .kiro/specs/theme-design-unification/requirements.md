# Requirements Document

## Introduction

ダークモードとライトモードでデザインの一貫性が保たれていない箇所を特定し、統一されたビジュアル体験を提供する。具体的には、目次（Table of Contents）のボーダー表示の不整合や、コンポーネント間でのスタイル適用パターンの違いを解消する。

現状の調査により、以下の不整合パターンを確認:
- 目次: ライトモードでは `border` なし、ダークモードでは `border: 1px solid` あり
- カード: 両モードで `border` が適切に定義されている（参考パターン）
- Callout: 両モードで一貫したスタイルが適用されている（参考パターン）

## Requirements

### Requirement 1: 目次コンポーネントのボーダー統一

**Objective:** サイト訪問者として、ダークモードとライトモードで目次のビジュアルが一貫している状態を望む。これにより、テーマを切り替えた際にデザインの違和感を感じないようにしたい。

#### Acceptance Criteria

1. The Theme System shall ライトモードの目次（`.table-of-contents`）にボーダーを追加し、ダークモードと同様の視覚的境界を提供する
2. When テーマが切り替えられた時, the Theme System shall 目次のボーダーカラーを各テーマに適した色に変更する（ライト: `--color-gray-200`、ダーク: `--color-gray-700`）
3. The Theme System shall 目次のボーダースタイルをデザイントークン（`--color-gray-*`）を使用して定義する

### Requirement 2: デザイン不整合の網羅的調査と修正

**Objective:** 開発者として、ダークモードとライトモードで異なるスタイルが適用されているすべてのコンポーネントを特定し、一貫したパターンに統一したい。

#### Acceptance Criteria

1. The Theme System shall すべてのCSSファイルにおいて、`html.dark` または `@media (prefers-color-scheme: dark)` で追加されるプロパティ（ライトモードに存在しないもの）を特定する
2. When ライトモードに存在しないプロパティがダークモードで追加されている場合, the Theme System shall ライトモードにも同等のプロパティを追加し、両モードで一貫したスタイル構造を持つようにする
3. If コンポーネントがボーダー、シャドウ、背景色のいずれかを片方のモードでのみ持つ場合, then the Theme System shall 両モードで適切な値を定義する

### Requirement 3: テーマ切り替え時の視覚的一貫性

**Objective:** サイト訪問者として、テーマを切り替えた際にレイアウトシフトやスタイルの急激な変化を感じないようにしたい。

#### Acceptance Criteria

1. While テーマ切り替えが進行中の間, the Theme System shall トランジションを適用してスムーズな視覚的変化を提供する
2. The Theme System shall ボーダー、背景色、テキスト色などの視覚的プロパティにトランジションを適用する
3. If ユーザーが `prefers-reduced-motion` を有効にしている場合, then the Theme System shall トランジションを無効化し、即座にスタイルを適用する

### Requirement 4: 既存デザインパターンへの準拠

**Objective:** 開発者として、既存のカードコンポーネント（`.card`）やCalloutコンポーネントで確立されたダーク/ライトモード対応パターンを他のコンポーネントにも適用したい。

#### Acceptance Criteria

1. The Theme System shall カードコンポーネント（`card.css`）で使用されている「ライト: `--color-gray-200`、ダーク: `--color-gray-700`」のボーダーカラーパターンを目次にも適用する
2. The Theme System shall 新規に追加するスタイルは `design-tokens.css` で定義されたカスタムプロパティを使用する
3. The Theme System shall ダークモードスタイルは `html.dark` セレクタと `@media (prefers-color-scheme: dark)` の両方で定義し、明示的なテーマ設定とOSプリファレンスの両方に対応する

### Requirement 5: モバイルビューでのテーマ一貫性

**Objective:** モバイルユーザーとして、折りたたみ式目次などのモバイル専用UIでもダーク/ライトモードが一貫して適用されることを望む。

#### Acceptance Criteria

1. The Theme System shall モバイルビュー（767px以下）の目次サイドバー（`.toc-sidebar`）でもライトモードのボーダーを定義する
2. When テーマが切り替えられた時 and デバイスがモバイルの場合, the Theme System shall モバイル専用の背景色、ボーダー色を適切に変更する
3. The Theme System shall モバイルの折りたたみボタン（`::before`疑似要素）のスタイルが両テーマで一貫していることを確認する
