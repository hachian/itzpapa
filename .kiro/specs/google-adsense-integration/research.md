# Research & Design Decisions

## Summary
- **Feature**: `google-adsense-integration`
- **Discovery Scope**: Extension（既存のSEO設定パターンへの追加）
- **Key Findings**:
  - Google AdSense自動広告は単一のasyncスクリプトタグで実装可能
  - 既存の`googleAnalyticsId`と同一パターンで`googleAdsenseId`を追加可能
  - `BaseHead.astro`への統合が最適な拡張ポイント

## Research Log

### Google AdSense 自動広告スクリプトの構造
- **Context**: AdSense自動広告の現行実装方法を調査
- **Sources Consulted**:
  - [Google AdSense Help - Synchronous vs Async](https://support.google.com/adsense/answer/9183243)
  - [Google Developers - Async ad tags](https://developers.google.com/publisher-ads-audits/reference/audits/async-ad-tags)
  - [Google Developers Blog - Async AdSense](https://developers.googleblog.com/2013/07/an-async-script-for-adsense-tagging.html)
- **Findings**:
  - 現行のAdSense自動広告コード:
    ```html
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>
    ```
  - `async`属性と`crossorigin="anonymous"`が必須
  - パブリッシャーIDはクエリパラメータ`client=ca-pub-XXXXXXX`として渡す
  - 自動広告はスクリプト読み込みのみで有効化（追加コード不要）
- **Implications**:
  - 1つの`<script>`タグを`<head>`に追加するだけで実装完了
  - Google Analyticsと同様の条件付きレンダリングで対応可能

### 既存コードベースのパターン分析
- **Context**: 既存の設定・統合パターンを調査し、一貫性を確保
- **Sources Consulted**:
  - `site.config.ts` - サイト設定の中央管理
  - `src/types/site-config.ts` - 型定義
  - `src/components/BaseHead.astro` - Google Analytics統合の実装
- **Findings**:
  - `SeoConfig`インターフェースに`googleAnalyticsId?: string`が存在
  - 空文字の場合はスクリプトを出力しないパターンが確立
  - `BaseHead.astro`で条件付きレンダリング: `{googleAnalyticsId && (...)}`
- **Implications**:
  - `googleAdsenseId?: string`を`SeoConfig`に追加
  - 同一の条件付きレンダリングパターンを適用

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| BaseHead統合（推奨） | 既存のBaseHead.astroにAdSenseスクリプトを追加 | 既存パターンとの一貫性、変更最小限 | なし | Google Analyticsと同一パターン |
| 専用コンポーネント | AdSense用に別コンポーネントを作成 | 関心の分離 | 過剰な複雑化 | 単一スクリプトタグには不要 |

## Design Decisions

### Decision: BaseHead.astro への直接統合
- **Context**: AdSenseスクリプトを出力する場所の選定
- **Alternatives Considered**:
  1. 専用の`GoogleAdsense.astro`コンポーネント作成
  2. `BaseHead.astro`に直接追加（Google Analytics同様）
- **Selected Approach**: `BaseHead.astro`に直接追加
- **Rationale**:
  - Google Analyticsと同一パターンで一貫性を維持
  - 単一スクリプトタグのために専用コンポーネントは過剰
  - 変更箇所を最小限に抑制
- **Trade-offs**: コンポーネントの責務がわずかに増加するが、許容範囲内
- **Follow-up**: なし

### Decision: SeoConfig への設定追加
- **Context**: AdSense ID の設定場所
- **Alternatives Considered**:
  1. `SeoConfig`セクションに追加（`googleAnalyticsId`と並列）
  2. 新規`AdsConfig`セクションを作成
  3. `FeatureFlags`に追加
- **Selected Approach**: `SeoConfig`に`googleAdsenseId`を追加
- **Rationale**:
  - 要件で明示的に指定（`googleAnalyticsId`と同じパターン）
  - SEO/マネタイズ関連設定として論理的に一貫
- **Trade-offs**: なし
- **Follow-up**: 型定義の更新が必要

## Risks & Mitigations
- **パフォーマンス影響**: `async`属性使用により軽減。自動広告スクリプトはレンダリングをブロックしない
- **AdSense審査前の動作**: IDが設定されていても、サイトが審査通過するまで広告は表示されない（想定通りの動作）

## References
- [Google AdSense Help - Synchronous ad code](https://support.google.com/adsense/answer/9183243) - async vs sync の違い
- [Google Developers - Async ad tags](https://developers.google.com/publisher-ads-audits/reference/audits/async-ad-tags) - Lighthouse パフォーマンス推奨
- [Site Kit for WordPress - AdSense Code](https://github.com/google/site-kit-wp/issues/3783) - 最新AdSenseコード形式の参考
