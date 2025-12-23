# Research & Design Decisions: Lighthouse Performance Improvement

---
**Purpose**: Lighthouseスコア改善に向けた技術調査結果と設計決定の根拠を記録

**Usage**:
- Discoveryフェーズの調査活動と結果を記録
- design.mdに含めるには詳細すぎる設計決定のトレードオフを文書化
- 将来の監査や再利用のための参照とエビデンスを提供
---

## Summary
- **Feature**: `lighthouse-performance-improvement`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - Cloudflare Pages `_headers`ファイルでセキュリティヘッダー設定が可能
  - Lighthouse CI GitHub Actions（treosh/lighthouse-ci-action v12）で自動化可能
  - Google AnalyticsへのSRI適用は現実的でない（動的更新される外部スクリプト）
  - Critical CSS対応はastro-critical-css（v0.0.7, 2024/12/10公開）で実現可能

## Research Log

### Cloudflare Pagesセキュリティヘッダー設定

- **Context**: Best Practices要件（3.6）でCSP等のセキュリティヘッダーが必要
- **Sources Consulted**:
  - [Cloudflare Fundamentals - Content Security Policies](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/content-security-policies/)
  - [Cloudflare Workers - Security Headers Example](https://developers.cloudflare.com/workers/examples/security-headers/)
  - [CloudFlare CSP Example](https://content-security-policy.com/examples/cloudflare/)
- **Findings**:
  - `public/_headers`ファイルでビルド時にヘッダー設定が可能
  - 主要ヘッダー: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security, Content-Security-Policy
  - Cloudflare Analyticsを使用する場合、`static.cloudflareinsights.com`と`connect-src 'self'`が必要
  - Google Fonts使用のため`fonts.googleapis.com`と`fonts.gstatic.com`の許可が必要
- **Implications**:
  - CSP設定は慎重に行う必要がある（strictすぎると機能を壊す）
  - 初期は報告モード（Content-Security-Policy-Report-Only）で導入し、検証後に本番適用

### Lighthouse CI GitHub Actions設定

- **Context**: 継続的監視要件（5.1-5.4）でCI/CDへのLighthouse統合が必要
- **Sources Consulted**:
  - [Lighthouse CI Action - GitHub Marketplace](https://github.com/marketplace/actions/lighthouse-ci-action)
  - [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci)
  - [LogRocket - Lighthouse meets GitHub Actions](https://blog.logrocket.com/lighthouse-meets-github-actions-use-lighthouse-ci/)
- **Findings**:
  - `treosh/lighthouse-ci-action@v12`が最新の推奨Action
  - `runs: 5`で5回実行し中央値を取ることで安定した結果が得られる
  - `uploadArtifacts: true`でレポートをArtifactとして保存可能
  - `temporaryPublicStorage: true`で一時的なパブリックストレージにアップロード可能
  - GitHub Status Checksには`LHCI_GITHUB_APP_TOKEN`が必要
- **Implications**:
  - 複数回実行による信頼性向上はCIの実行時間とのトレードオフ
  - 初期は3回実行で開始し、必要に応じて調整

### Critical CSS最適化

- **Context**: Performance要件（1.4）でレンダリングブロッキングCSS排除が必要
- **Sources Consulted**:
  - [astro-critical-css - GitHub](https://github.com/rumaan/astro-critical-css)
  - [Astro Docs - Styles and CSS](https://docs.astro.build/en/guides/styling/)
  - [astro-critters - Cantoo](https://cantoo.app/astrocritters/)
- **Findings**:
  - `astro-critical-css` v0.0.7（2024/12/10公開）が利用可能
  - Puppeteer/Chromiumに依存し、ビルド時にCritical CSSを抽出・インライン化
  - SSRモードでは`experimental.prerender`有効化が必要
  - 代替として`astro-critters`も利用可能
  - Astroの`inlineStylesheets: 'always'`オプションで全CSSをインライン化することも可能
- **Implications**:
  - ビルド時間が増加する（Puppeteer起動のオーバーヘッド）
  - 静的サイトのみ対象（SSGモード）
  - 現時点ではAstro標準の`inlineStylesheets`設定で十分な可能性あり

### Google Analytics SRI対応

- **Context**: Best Practices要件（3.7）でサードパーティスクリプトのSRIが必要
- **Sources Consulted**:
  - [Google Analytics Community - SRI Discussion](https://support.google.com/analytics/thread/178190344/enable-google-analytics-script-subresource-integrity-sri-check?hl=en)
  - [Tag Manager Community - SRI Status](https://support.google.com/tagmanager/thread/219971618/can-you-clarify-the-status-subresource-integrity-sri-check-for-gtag-lib?hl=en)
  - [Advanced Web Machinery - SRI Guide](https://advancedweb.hu/how-to-use-sri-hashes-to-secure-third-party-dependencies/)
- **Findings**:
  - Google Analyticsスクリプト（gtag.js）はバージョン管理されておらず、Googleが随時更新
  - SRIハッシュはファイル内容に基づくため、更新時に破損する
  - Googleは公式にローカルホスティングを非推奨としている
  - 一部セキュリティツール（Bitsight等）はGA4をSRI除外リストに含めている
- **Implications**:
  - GA4へのSRI適用は現実的でない
  - 要件3.7は「サードパーティスクリプトを使用する場合」の条件付きであり、GA4は例外として文書化
  - 将来的にはSignature-based SRIが解決策となる可能性

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Astro標準機能活用 | inlineStylesheets設定 + 既存Image最適化 | 追加依存なし、シンプル | Critical CSS抽出なし | 現状の実装を維持 |
| astro-critical-css導入 | Puppeteerによるビルド時Critical CSS抽出 | 高度な最適化 | ビルド時間増加、依存追加 | 効果対コストを検証必要 |
| _headers + Lighthouse CI | 静的設定ファイル + GitHub Actions | インフラ変更なし | 設定の検証が必要 | 推奨アプローチ |

## Design Decisions

### Decision: セキュリティヘッダー設定方法

- **Context**: Best Practices要件でCSP等のセキュリティヘッダーが必要
- **Alternatives Considered**:
  1. Cloudflare Workers - 高度なカスタマイズ可能だが設定複雑
  2. `_headers`ファイル - シンプルで十分な機能
  3. Transform Rules - ダッシュボード設定が必要
- **Selected Approach**: `public/_headers`ファイルによる静的設定
- **Rationale**:
  - コードベースで管理可能（バージョン管理対象）
  - Cloudflare Pages標準機能で追加コストなし
  - シンプルで理解しやすい
- **Trade-offs**:
  - ✅ 設定のバージョン管理が可能
  - ✅ 追加インフラ不要
  - ❌ 動的なヘッダー生成は不可（必要ないが）
- **Follow-up**: 本番デプロイ後にセキュリティスキャナーで検証

### Decision: Lighthouse CI実行頻度

- **Context**: CI実行時間と結果の信頼性のバランス
- **Alternatives Considered**:
  1. 1回実行 - 高速だが結果のばらつきが大きい
  2. 3回実行 - バランス型
  3. 5回実行 - 高信頼性だがCI時間増加
- **Selected Approach**: 3回実行（median取得）
- **Rationale**:
  - 静的サイトのため結果のばらつきは比較的少ない
  - CI実行時間を抑えつつ信頼性を確保
- **Trade-offs**:
  - ✅ 適度な信頼性
  - ✅ CI時間の最適化
  - ❌ 極端なばらつきがある場合は検知困難
- **Follow-up**: 導入後にばらつきを確認し、必要に応じて5回に増加

### Decision: Critical CSS対応

- **Context**: レンダリングブロッキングCSS排除の要件
- **Alternatives Considered**:
  1. astro-critical-css導入 - 高度な最適化
  2. Astro inlineStylesheets: 'always' - 全CSSインライン
  3. 現状維持 + 手動最適化 - 最小限の変更
- **Selected Approach**: 現状維持 + Lighthouse CI導入後に効果測定
- **Rationale**:
  - 現状のCSS code splittingとGoogle Fonts非同期読み込みで基本対応済み
  - 実際のLighthouseスコアを計測後に必要性を判断
  - 過剰な最適化を避ける
- **Trade-offs**:
  - ✅ ビルド時間への影響なし
  - ✅ 追加依存なし
  - ❌ 最大限の最適化ではない
- **Follow-up**: Lighthouseスコアで「Eliminate render-blocking resources」警告が出た場合に再検討

### Decision: Google Analytics SRI対応

- **Context**: サードパーティスクリプトセキュリティ要件
- **Alternatives Considered**:
  1. SRIハッシュ適用 - 不可能（動的更新のため）
  2. ローカルホスティング - Google非推奨
  3. 例外として文書化 - 現実的
- **Selected Approach**: GA4は例外として文書化、CSPでドメイン制限
- **Rationale**:
  - Google公式の制約により技術的に不可能
  - 業界標準の慣行に従う
- **Trade-offs**:
  - ✅ 現実的なアプローチ
  - ❌ 完全なSRI対応ではない
- **Follow-up**: 将来的にGoogleがSRI対応した場合に再評価

## Risks & Mitigations

- **CSP設定ミスによる機能破損** → Content-Security-Policy-Report-Onlyで段階的導入
- **Lighthouse CIスコアのばらつき** → 3回実行のmedian値を使用、閾値に余裕を持たせる
- **ビルド時間増加** → Critical CSS導入を遅延、効果測定後に判断
- **GA4のセキュリティリスク** → CSPで許可ドメインを限定、Cloudflareのセキュリティ機能を活用

## References

- [Cloudflare Fundamentals - CSP](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/content-security-policies/) - セキュリティヘッダー設定の公式ドキュメント
- [Lighthouse CI Action](https://github.com/marketplace/actions/lighthouse-ci-action) - GitHub Actions統合の公式Action
- [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) - Lighthouse CI公式リポジトリ
- [astro-critical-css](https://github.com/rumaan/astro-critical-css) - Astro用Critical CSSプラグイン
- [Astro Docs - Styling](https://docs.astro.build/en/guides/styling/) - Astro公式CSS最適化ガイド
