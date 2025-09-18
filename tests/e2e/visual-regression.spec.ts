import { test, expect } from '@playwright/test';

/**
 * ビジュアル回帰テスト
 * レスポンシブ対応実装前後の表示差分検出
 */

const pages = [
  { name: 'トップページ', path: '/' },
  { name: 'ブログ一覧', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'タグページ', path: '/tags' },
  { name: 'ブログ記事（目次あり）', path: '/blog/mark-highlight-test/' },
  { name: 'ブログ記事（目次なし）', path: '/blog/markdown-basic-test/' },
];

const viewports = [
  { name: 'Mobile-320', width: 320, height: 568 },
  { name: 'Mobile-767', width: 767, height: 844 },
  { name: 'Tablet-768', width: 768, height: 1024 },
  { name: 'Desktop-1024', width: 1024, height: 800 },
  { name: 'Desktop-1200', width: 1200, height: 800 },
];

test.describe('ビジュアル回帰テスト', () => {

  // 各ページの各ビューポートでスクリーンショット撮影
  pages.forEach(({ name, path }) => {
    viewports.forEach(({ name: viewportName, width, height }) => {
      test(`${name} - ${viewportName} (${width}x${height})`, async ({ page }) => {
        // ビューポートサイズ設定
        await page.setViewportSize({ width, height });

        // ページに移動
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // フォントとアニメーションの読み込み完了を待つ
        await page.waitForTimeout(1000);

        // 画像の読み込み完了を確認
        await page.waitForFunction(() => {
          const images = Array.from(document.querySelectorAll('img'));
          return images.every(img => img.complete);
        });

        // スクリーンショット撮影（全体）
        await expect(page).toHaveScreenshot(`${name.replace(/\s+/g, '-')}-${viewportName}-full.png`, {
          fullPage: true,
          threshold: 0.3, // 30%以下の差異は許容
        });

        // ビューポート内のスクリーンショット
        await expect(page).toHaveScreenshot(`${name.replace(/\s+/g, '-')}-${viewportName}-viewport.png`, {
          fullPage: false,
          threshold: 0.3,
        });
      });
    });
  });

  // 重要要素のスクリーンショット
  test.describe('重要要素のビジュアルテスト', () => {

    test('ナビゲーションヘッダー - レスポンシブ表示', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
        { width: 1200, height: 800 },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // ヘッダー要素のスクリーンショット
        const header = page.locator('header, nav, banner').first();
        await expect(header).toHaveScreenshot(`header-${viewport.width}px.png`, {
          threshold: 0.2,
        });
      }
    });

    test('目次機能 - レスポンシブ表示', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      const viewports = [
        { width: 400, height: 600, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1200, height: 800, name: 'desktop' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(300); // レイアウト更新待ち

        // 目次要素のスクリーンショット
        const toc = page.locator('.toc-sidebar, .table-of-contents').first();
        if (await toc.count() > 0) {
          await expect(toc).toHaveScreenshot(`toc-${viewport.name}.png`, {
            threshold: 0.2,
          });
        }

        // ブログレイアウト全体のスクリーンショット
        const blogLayout = page.locator('.blog-layout-with-toc, article').first();
        await expect(blogLayout).toHaveScreenshot(`blog-layout-${viewport.name}.png`, {
          threshold: 0.3,
        });
      }
    });

    test('タグ表示 - レスポンシブサイズ', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      const viewports = [
        { width: 320, height: 568, name: 'mobile' },
        { width: 767, height: 844, name: 'mobile-large' },
        { width: 1024, height: 800, name: 'desktop' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForLoadState('networkidle');

        // タグ要素のスクリーンショット
        const tags = page.locator('.article-tags, [class*="tag"]').first();
        if (await tags.count() > 0) {
          await expect(tags).toHaveScreenshot(`tags-${viewport.name}.png`, {
            threshold: 0.2,
          });
        }
      }
    });

    test('マークハイライト - 表示確認', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      const viewports = [
        { width: 400, height: 600, name: 'mobile' },
        { width: 1024, height: 800, name: 'desktop' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForLoadState('networkidle');

        // マークハイライト要素を含む段落のスクリーンショット
        const markParagraph = page.locator('p:has(mark)').first();
        if (await markParagraph.count() > 0) {
          await expect(markParagraph).toHaveScreenshot(`mark-highlight-${viewport.name}.png`, {
            threshold: 0.1,
          });
        }
      }
    });
  });

  // レイアウト境界値テスト
  test.describe('ブレークポイント境界値ビジュアルテスト', () => {

    test('767px vs 768px - レイアウト切り替え境界', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      // 767px (モバイル)
      await page.setViewportSize({ width: 767, height: 844 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('breakpoint-767px-mobile.png', {
        fullPage: false,
        threshold: 0.3,
      });

      // 768px (タブレット)
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('breakpoint-768px-tablet.png', {
        fullPage: false,
        threshold: 0.3,
      });
    });

    test('1023px vs 1024px - レイアウト切り替え境界', async ({ page }) => {
      await page.goto('/');

      // 1023px (タブレット)
      await page.setViewportSize({ width: 1023, height: 768 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('breakpoint-1023px-tablet.png', {
        fullPage: false,
        threshold: 0.3,
      });

      // 1024px (デスクトップ)
      await page.setViewportSize({ width: 1024, height: 800 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('breakpoint-1024px-desktop.png', {
        fullPage: false,
        threshold: 0.3,
      });
    });
  });

  // エラー状態のビジュアルテスト
  test.describe('エラー状態・エッジケース', () => {

    test('画像読み込みエラー - 代替表示', async ({ page }) => {
      // 存在しない画像URLでテスト
      await page.route('**/*.jpg', route => route.abort());
      await page.route('**/*.png', route => route.abort());

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // エラー処理完了待ち

      await expect(page).toHaveScreenshot('image-error-state.png', {
        fullPage: false,
        threshold: 0.4, // エラー表示は変動が大きいため閾値を上げる
      });
    });

    test('長いコンテンツ - 折り返し表示', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      // 非常に狭い幅でテスト
      await page.setViewportSize({ width: 280, height: 600 });
      await page.waitForLoadState('networkidle');

      // 長いテキストを含む要素のスクリーンショット
      const longTextParagraph = page.locator('p').filter({ hasText: 'これは非常に長いハイライトテキストです' });
      if (await longTextParagraph.count() > 0) {
        await expect(longTextParagraph).toHaveScreenshot('long-text-narrow.png', {
          threshold: 0.3,
        });
      }
    });
  });

  // パフォーマンス表示テスト
  test.describe('パフォーマンス関連表示', () => {

    test('読み込み中状態 - スケルトン表示', async ({ page }) => {
      // ネットワークを遅くして読み込み中状態をキャプチャ
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });

      const response = page.goto('/');

      // 読み込み中のスクリーンショット
      await page.waitForTimeout(50);
      await expect(page).toHaveScreenshot('loading-skeleton.png', {
        threshold: 0.5, // 読み込み状態は変動が大きい
      });

      await response;
    });
  });
});