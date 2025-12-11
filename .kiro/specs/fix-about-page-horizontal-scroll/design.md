# Design Document

## Overview

**Purpose**: Aboutページの小画面幅（640px以下）での横スクロール問題を解消し、モバイルユーザー体験を向上させる。

**Users**: モバイルデバイスやタブレットでAboutページを閲覧するユーザー。

**Impact**: `src/pages/about.astro`のスコープ内CSSに限定的な修正を加え、既存のデスクトップ表示には影響を与えない。

### Goals
- 640px以下のビューポートで横スクロールを完全に防止
- コード要素を含む全セクションがビューポート内に収まる
- 既存のデスクトップレイアウトとダークモード表示を維持

### Non-Goals
- グローバルCSSの変更
- 他ページへの影響
- JavaScript による動的制御
- 320px未満の極小画面対応（既存の`global.css`で別途対応済み）

## Architecture

### Existing Architecture Analysis

現在の`about.astro`には以下のレスポンシブ対応が実装済み：

```css
@media (max-width: 640px) {
  .feature-grid { grid-template-columns: 1fr; }
  .stack-list li { flex-direction: column; align-items: flex-start; gap: var(--space-1); }
  .stack-name { min-width: auto; }
}
```

**問題点**: `.step-text code`要素に対するオーバーフロー制御が未実装のため、長いファイルパスがコンテナを超えてはみ出す。

### Architecture Pattern & Boundary Map

本修正はスコープ内CSS（Astroコンポーネントの`<style>`タグ）のみを対象とし、アーキテクチャパターンの変更は不要。

**Architecture Integration**:
- Selected pattern: CSS-in-Component（既存パターン維持）
- Domain/feature boundaries: `about.astro`ファイル内に閉じた修正
- Existing patterns preserved: レスポンシブメディアクエリ（`@media (max-width: 640px)`）
- New components rationale: 新規コンポーネント不要
- Steering compliance: `structure.md`のスタイル分離原則に準拠

### Technology Stack

| Layer | Choice / Version | Role in Feature | Notes |
|-------|------------------|-----------------|-------|
| Frontend | Astro v5 | CSSスコープ管理 | 既存 |
| Styling | CSS (scoped) | レスポンシブ対応 | 追加ルールのみ |

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Flows |
|-------------|---------|------------|------------|-------|
| 1.1, 1.2, 1.3 | 横スクロール防止 | AboutPageStyles | — | — |
| 2.1, 2.2, 2.3 | 技術スタックレスポンシブ | StackListStyles | — | — |
| 3.1, 3.2, 3.3 | コードオーバーフロー制御 | StepCodeStyles | — | — |
| 4.1, 4.2, 4.3 | 既存デザイン維持 | MediaQueryScope | — | — |

## Components and Interfaces

| Component | Domain/Layer | Intent | Req Coverage | Key Dependencies | Contracts |
|-----------|--------------|--------|--------------|------------------|-----------|
| AboutPageStyles | UI/CSS | 小画面対応CSS | 1, 2, 3, 4 | design-tokens.css (P2) | State |

### UI / CSS

#### AboutPageStyles

| Field | Detail |
|-------|--------|
| Intent | 640px以下でのオーバーフロー防止スタイル提供 |
| Requirements | 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3 |

**Responsibilities & Constraints**
- `about.astro`内の`<style>`タグでスコープ限定
- 640px以下のメディアクエリ内でのみ追加ルールを適用
- デスクトップ表示に影響を与えない

**Dependencies**
- Inbound: BlogPost.astro — レイアウト提供 (P2)
- External: design-tokens.css — CSS変数参照 (P2)

**Contracts**: State [ ✓ ]

##### State Management

```css
/* 追加するCSSルール（640px以下） */
@media (max-width: 640px) {
  /* コード要素の折り返し制御 */
  .step-text code {
    word-break: break-all;
    overflow-wrap: break-word;
  }

  /* ステップテキストの最大幅制御 */
  .step-text {
    max-width: calc(100% - 32px - var(--space-4));
  }
}
```

**Implementation Notes**
- Integration: 既存の`@media (max-width: 640px)`ブロックに追記
- Validation: Chrome DevToolsでビューポート320px〜640pxの範囲をテスト
- Risks: 長いパスの途中折り返しによる可読性低下（許容範囲）

## Testing Strategy

### Manual Visual Tests
1. **横スクロール確認**: 640px、480px、360pxビューポートでスクロールバーが表示されないことを確認
2. **コード表示確認**: `src/content/blog/`パスが折り返されて全体が表示されることを確認
3. **デスクトップ確認**: 1024pxビューポートで既存レイアウトが維持されていることを確認
4. **ダークモード確認**: ダークモードで表示崩れがないことを確認

### Browser Testing
- Chrome DevTools（レスポンシブモード）
- 実機テスト（iOS Safari、Android Chrome）推奨
