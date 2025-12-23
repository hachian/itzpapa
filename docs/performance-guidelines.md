# パフォーマンスガイドライン

itzpapaサイトのLighthouseスコアを90+に維持するためのガイドラインです。

## 画像最適化

### ベストプラクティス

1. **Astro Imageを使用する**
   - `<Image>` コンポーネントで自動的にWebP形式に変換される
   - `width` と `height` を明示的に指定してCLSを防止

2. **適切なサイズを指定**
   - 表示サイズの2倍以下の解像度を使用（Retina対応）
   - 大きすぎる画像はビルド時に自動リサイズされる

3. **遅延読み込みを活用**
   - ファーストビュー外の画像には `loading="lazy"` を使用
   - Astro Imageはデフォルトで遅延読み込みを適用

### 例

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.png';
---

<Image src={heroImage} alt="ヒーロー画像" width={800} height={400} />
```

## CSS最適化

### コード分割

- Astroは各ページに必要なCSSのみをバンドル
- グローバルスタイルは `src/styles/global.css` に集約

### 不要なスタイルの削減

1. 使用していないCSSクラスを削除
2. 重複したスタイル定義を統合
3. CSS変数を活用して値を一元管理

### Critical CSS

- Astroは自動的にクリティカルCSSをインライン化
- 追加設定なしで最適化される

## JavaScript最適化

### バンドルサイズの監視

1. **client ディレクティブを最小限に**
   - `client:load` は必要な場合のみ使用
   - 可能な限りサーバーサイドレンダリングを活用

2. **サードパーティスクリプト**
   - Google Analyticsは `async` で読み込む
   - 不要なトラッキングスクリプトを削除

### 非同期読み込み

```html
<!-- GA4の非同期読み込み例 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
```

## Lighthouse CI使用方法

### ローカルで実行

```bash
# Lighthouse CIをグローバルインストール
npm install -g @lhci/cli

# ビルドしてテスト実行
npm run build
lhci autorun
```

### 結果の解釈

| カテゴリ | 目標 | 対処 |
|---------|------|------|
| Performance | 90+ | 画像最適化、JS削減 |
| Accessibility | 90+ | ARIA属性、色コントラスト |
| Best Practices | 90+ | HTTPS、非推奨API回避 |
| SEO | 90+ | メタタグ、構造化データ |

### Core Web Vitals

| 指標 | 目標値 | 意味 |
|------|--------|------|
| LCP | < 2.5s | 最大コンテンツ描画 |
| CLS | < 0.1 | レイアウトシフト |
| INP | < 200ms | インタラクション応答 |

## トラブルシューティング

### Performanceスコアが低い場合

1. **LCPが遅い**
   - ヒーロー画像に `fetchpriority="high"` を追加
   - フォントの遅延読み込みを確認

2. **CLSが高い**
   - 画像に `width` と `height` を指定
   - 動的コンテンツの領域を事前確保

3. **JSの実行時間が長い**
   - 不要な `client:` ディレクティブを削除
   - サードパーティスクリプトを確認

### Accessibilityスコアが低い場合

1. 画像の `alt` 属性を確認
2. フォームラベルの関連付けを確認
3. 色コントラスト比をチェック

### Best Practicesスコアが低い場合

1. コンソールエラーを確認
2. HTTPS配信を確認
3. 非推奨APIの使用がないか確認

### SEOスコアが低い場合

1. `<title>` タグの存在を確認
2. `<meta name="description">` を確認
3. モバイルビューポートの設定を確認

## 参考リンク

- [Lighthouse公式ドキュメント](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Astro画像最適化](https://docs.astro.build/en/guides/images/)
