# Research & Design Decisions

## Summary
- **Feature**: `header-scroll-prevention`
- **Discovery Scope**: Extension（既存コンポーネントの改善）
- **Key Findings**:
  - 現在のヘッダーは768px未満でのみハンバーガーメニューに折りたたむ
  - デスクトップ表示ではナビ5項目 + SNS8個が横並びで表示され、幅を超過
  - CSSで中間ブレークポイント（768px〜1024px）を追加することで対応可能

## Research Log

### 現在のヘッダー構造分析
- **Context**: 横スクロールの原因となるヘッダー構造を特定
- **Sources Consulted**: `src/components/Header.astro`
- **Findings**:
  - `.header__nav`はFlexboxで`justify-content: space-between`
  - `.header__links`（ナビゲーション）と`.header__actions`（SNS+テーマトグル）が常に表示
  - 768px未満でのみ`display: none`で非表示化
  - `max-width: 1200px`のコンテナ内でも項目が多いと幅を超過
- **Implications**: 中間ブレークポイントの追加が必要

### 既存のレスポンシブパターン調査
- **Context**: プロジェクト内で使用されているブレークポイントを確認
- **Sources Consulted**: `src/styles/global.css`, 各コンポーネント
- **Findings**:
  - 640px: タグ、カテゴリバッジのモバイル対応
  - 767px (max-width): モバイル判定の主要ブレークポイント
  - 768px〜1023px: タブレット対応（一部コンポーネント）
  - 1024px〜: デスクトップ対応
- **Implications**: 既存パターンに従い768px〜1023pxを中間ブレークポイントとして使用

### オーバーフロー制御パターン
- **Context**: 横スクロール防止のCSSテクニックを確認
- **Findings**:
  - `overflow-x: hidden` / `overflow-x: auto`
  - `flex-wrap: wrap`
  - `text-overflow: ellipsis`（一部で使用）
  - `display: none`によるレスポンシブ切り替え
- **Implications**: SNSアイコンのラップまたは非表示切り替えが適切

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 中間ブレークポイント追加 | 768px〜1023pxでSNSアイコンを非表示 | シンプル、既存パターン踏襲 | タブレットでSNSが見えない | 採用候補 |
| Flex wrap | SNSアイコンを複数行に折り返し | すべて表示可能 | レイアウト崩れの可能性 | 検討 |
| ドロップダウンメニュー | 多すぎる項目をドロップダウンに格納 | 柔軟性が高い | 実装コスト高 | 見送り |

## Design Decisions

### Decision: 中間ブレークポイントでSNSアイコンを非表示
- **Context**: デスクトップ表示で項目が多すぎて横スクロールが発生
- **Alternatives Considered**:
  1. SNSアイコンをFlex wrapで折り返し
  2. ナビゲーション項目数の制限
  3. 中間ブレークポイントでSNSを非表示化
- **Selected Approach**: 768px〜1023pxでは`.header__actions`（SNSエリア）を非表示にし、モバイルメニュー内でのみ表示
- **Rationale**: 既存のハンバーガーメニュー実装を活用でき、最小限の変更で対応可能
- **Trade-offs**: タブレット画面ではヘッダーからSNSアイコンが消えるが、モバイルメニューからはアクセス可能
- **Follow-up**: 実装後にタブレット表示を確認

### Decision: ヘッダーコンテナにoverflow制御を追加
- **Context**: 万一の幅超過時にページ全体の横スクロールを防止
- **Selected Approach**: `.header`に`overflow-x: hidden`、bodyに`overflow-x: hidden`を検討
- **Rationale**: 根本的な防御策として最小限のCSS追加
- **Trade-offs**: コンテンツが切れる可能性があるが、レスポンシブ対応と組み合わせれば問題なし

## Risks & Mitigations
- **中間サイズでSNSが非表示**: モバイルメニューからアクセス可能なため許容
- **既存機能への影響**: スティッキーヘッダー、ダークモード、View Transitionsは変更なし
- **新たなブレークポイント追加による複雑化**: 既存パターンに従うため影響は最小限

## References
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries) — ブレークポイント設計
- [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout) — レイアウト制御
