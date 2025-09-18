import { test, expect } from '@playwright/test';

/**
 * レスポンシブレイアウト切り替えテスト
 * ブレークポイントでの表示切り替え確認
 */

const viewports = [
  { name: 'Mobile-320', width: 320, height: 568 },
  { name: 'Mobile-767', width: 767, height: 844 },
  { name: 'Tablet-768', width: 768, height: 1024 },
  { name: 'Tablet-1023', width: 1023, height: 768 },
  { name: 'Desktop-1024', width: 1024, height: 800 },
  { name: 'Desktop-1200', width: 1200, height: 800 },
];

test.describe('レスポンシブレイアウト切り替えテスト', () => {

  // ブレークポイント境界値でのテスト
  test.describe('ブレークポイント境界値テスト', () => {
    test('767px vs 768px でのレイアウト切り替え', async ({ page }) => {
      // 767px (モバイル) での確認
      await page.setViewportSize({ width: 767, height: 844 });
      await page.goto('/blog/mark-highlight-test/');
      await page.waitForLoadState('networkidle');

      const mobileLayout = await page.evaluate(() => {
        const tocSidebar = document.querySelector('.toc-sidebar');
        const blogLayout = document.querySelector('.blog-layout-with-toc');

        if (!tocSidebar || !blogLayout) return null;

        const tocStyles = window.getComputedStyle(tocSidebar);
        const layoutStyles = window.getComputedStyle(blogLayout);

        return {
          tocPosition: tocStyles.position,
          layoutDisplay: layoutStyles.display,
          layoutDirection: layoutStyles.flexDirection || 'grid'
        };
      });

      // 768px (タブレット) での確認
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(100); // レイアウト更新待ち

      const tabletLayout = await page.evaluate(() => {
        const tocSidebar = document.querySelector('.toc-sidebar');
        const blogLayout = document.querySelector('.blog-layout-with-toc');

        if (!tocSidebar || !blogLayout) return null;

        const tocStyles = window.getComputedStyle(tocSidebar);
        const layoutStyles = window.getComputedStyle(blogLayout);

        return {
          tocPosition: tocStyles.position,
          layoutDisplay: layoutStyles.display,
          layoutDirection: layoutStyles.flexDirection || 'grid'
        };
      });

      // レイアウトが切り替わっていることを確認
      expect(mobileLayout).not.toBe(null);
      expect(tabletLayout).not.toBe(null);

      // モバイルではflex、デスクトップではgridになることを確認
      if (mobileLayout && tabletLayout) {
        expect(mobileLayout.layoutDisplay).toBe('flex');
        expect(tabletLayout.layoutDisplay).toBe('grid');
      }
    });

    test('1023px vs 1024px でのレイアウト調整', async ({ page }) => {
      await page.goto('/');

      // 1023px (タブレット) での確認
      await page.setViewportSize({ width: 1023, height: 768 });
      await page.waitForLoadState('networkidle');

      const tabletMainWidth = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return null;
        return window.getComputedStyle(main).maxWidth;
      });

      // 1024px (デスクトップ) での確認
      await page.setViewportSize({ width: 1024, height: 800 });
      await page.waitForTimeout(100); // レイアウト更新待ち

      const desktopMainWidth = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return null;
        return window.getComputedStyle(main).maxWidth;
      });

      // デスクトップでmax-widthが適用されることを確認
      expect(desktopMainWidth).toBe('720px');
    });
  });

  // 目次機能のレスポンシブ動作確認
  test.describe('目次機能のレスポンシブ動作', () => {
    test('目次ありページでのレイアウト切り替え', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(100); // レイアウト更新待ち

        const tocInfo = await page.evaluate(() => {
          const tocSidebar = document.querySelector('.toc-sidebar');
          const blogLayout = document.querySelector('.blog-layout-with-toc');

          if (!tocSidebar || !blogLayout) return null;

          const tocStyles = window.getComputedStyle(tocSidebar);
          const layoutStyles = window.getComputedStyle(blogLayout);
          const tocRect = tocSidebar.getBoundingClientRect();

          return {
            isVisible: tocRect.width > 0 && tocRect.height > 0,
            position: tocStyles.position,
            display: layoutStyles.display,
            tocOrder: tocStyles.order || '0',
            viewportWidth: window.innerWidth
          };
        });

        expect(tocInfo).not.toBe(null);

        if (tocInfo) {
          // 目次が表示されていることを確認
          expect(tocInfo.isVisible).toBe(true);

          // モバイル（767px以下）ではflexレイアウト
          if (viewport.width <= 767) {
            expect(tocInfo.display).toBe('flex');
            expect(tocInfo.position).toBe('relative');
          }

          // デスクトップ（768px以上）ではgridレイアウト
          if (viewport.width >= 768) {
            expect(tocInfo.display).toBe('grid');
            expect(tocInfo.position).toBe('sticky');
          }
        }
      }
    });

    test('目次なしページでの通常レイアウト', async ({ page }) => {
      await page.goto('/about');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(100);

        const layoutInfo = await page.evaluate(() => {
          const main = document.querySelector('main');
          const tocSidebar = document.querySelector('.toc-sidebar');
          const blogLayout = document.querySelector('.blog-layout-with-toc');

          if (!main) return null;

          const mainStyles = window.getComputedStyle(main);

          return {
            hasToc: tocSidebar !== null,
            hasBlogLayout: blogLayout !== null,
            mainMaxWidth: mainStyles.maxWidth,
            mainWidth: mainStyles.width
          };
        });

        expect(layoutInfo).not.toBe(null);

        if (layoutInfo) {
          // 目次関連要素がないことを確認
          expect(layoutInfo.hasToc).toBe(false);
          expect(layoutInfo.hasBlogLayout).toBe(false);

          // 通常のmainレイアウトになっていることを確認
          if (viewport.width >= 1024) {
            expect(layoutInfo.mainMaxWidth).toBe('720px');
          }
        }
      }
    });
  });

  // タグ機能のレスポンシブ動作確認
  test.describe('タグ機能のレスポンシブ動作', () => {
    test('インラインタグのレスポンシブ表示', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(100);

        const tagInfo = await page.evaluate(() => {
          const tags = document.querySelectorAll('.tag, a[href*="/tags/"]');
          if (tags.length === 0) return null;

          const firstTag = tags[0] as HTMLElement;
          const tagStyles = window.getComputedStyle(firstTag);
          const tagRect = firstTag.getBoundingClientRect();

          return {
            tagCount: tags.length,
            minHeight: parseFloat(tagStyles.minHeight) || 0,
            fontSize: tagStyles.fontSize,
            padding: tagStyles.padding,
            isVisible: tagRect.width > 0 && tagRect.height > 0,
            viewportWidth: window.innerWidth
          };
        });

        expect(tagInfo).not.toBe(null);

        if (tagInfo) {
          // タグが表示されていることを確認
          expect(tagInfo.isVisible).toBe(true);
          expect(tagInfo.tagCount).toBeGreaterThan(0);

          // モバイル（767px以下）でタッチターゲットサイズを確認
          if (viewport.width <= 767) {
            expect(tagInfo.minHeight).toBeGreaterThanOrEqual(44); // 44px以上
          }
        }
      }
    });

    test('タグページでのレスポンシブ表示', async ({ page }) => {
      await page.goto('/tags');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(100);

        const tagPageInfo = await page.evaluate(() => {
          const tagLinks = document.querySelectorAll('a[href*="/tags/"]');
          const container = document.querySelector('main');

          if (!container) return null;

          const containerStyles = window.getComputedStyle(container);

          return {
            tagCount: tagLinks.length,
            containerWidth: containerStyles.width,
            containerMaxWidth: containerStyles.maxWidth,
            hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
          };
        });

        expect(tagPageInfo).not.toBe(null);

        if (tagPageInfo) {
          // 横スクロールが発生していないことを確認
          expect(tagPageInfo.hasHorizontalScroll).toBe(false);

          // コンテナが適切に制限されていることを確認
          if (viewport.width >= 1024) {
            expect(tagPageInfo.containerMaxWidth).toBe('720px');
          }
        }
      }
    });
  });

  // マークハイライト機能のレスポンシブ動作
  test.describe('マークハイライト機能のレスポンシブ動作', () => {
    test('マークハイライトのモバイル対応', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(100);

        const markInfo = await page.evaluate(() => {
          const marks = document.querySelectorAll('mark');
          if (marks.length === 0) return null;

          const firstMark = marks[0] as HTMLElement;
          const markStyles = window.getComputedStyle(firstMark);

          return {
            markCount: marks.length,
            padding: markStyles.padding,
            fontSize: markStyles.fontSize,
            backgroundColor: markStyles.backgroundColor,
            viewportWidth: window.innerWidth
          };
        });

        expect(markInfo).not.toBe(null);

        if (markInfo) {
          expect(markInfo.markCount).toBeGreaterThan(0);

          // モバイル（767px以下）で少し大きなパディングが適用されることを確認
          if (viewport.width <= 767) {
            // モバイル用のパディングが適用されているかチェック
            const paddingValues = markInfo.padding.split(' ');
            expect(paddingValues.some(val => parseFloat(val) >= 2.4)).toBe(true); // 0.15em ≈ 2.4px
          }
        }
      }
    });
  });

  // 画像のレスポンシブ動作確認
  test.describe('画像のレスポンシブ動作', () => {
    test('画像の適切なサイズ調整', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(100);

        const imageInfo = await page.evaluate(() => {
          const images = document.querySelectorAll('img');
          const results = [];

          for (const img of images) {
            const imgRect = img.getBoundingClientRect();
            const imgStyles = window.getComputedStyle(img);

            results.push({
              src: img.src,
              width: imgRect.width,
              height: imgRect.height,
              maxWidth: imgStyles.maxWidth,
              isOverflowing: imgRect.right > window.innerWidth
            });
          }

          return {
            imageCount: images.length,
            images: results,
            viewportWidth: window.innerWidth
          };
        });

        if (imageInfo.imageCount > 0) {
          // 全ての画像が画面幅に収まっていることを確認
          for (const img of imageInfo.images) {
            expect(img.isOverflowing).toBe(false);
            expect(img.width).toBeLessThanOrEqual(viewport.width);
          }
        }
      }
    });
  });
});