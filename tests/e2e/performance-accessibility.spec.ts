import { test, expect } from '@playwright/test';

/**
 * パフォーマンス・アクセシビリティ検証テスト
 * Core Web Vitals測定、WCAG 2.1 AA準拠確認、パフォーマンス劣化チェック
 */

interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
}

interface PageMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

const pages = [
  { name: 'トップページ', path: '/' },
  { name: 'ブログ一覧', path: '/blog' },
  { name: 'タグページ', path: '/tags' },
  { name: 'About', path: '/about' },
  { name: 'ブログ記事（目次あり）', path: '/blog/mark-highlight-test/' },
];

test.describe('パフォーマンス・アクセシビリティ検証', () => {

  // Core Web Vitals測定
  test.describe('Core Web Vitals測定', () => {

    pages.forEach(({ name, path }) => {
      test(`${name} - Core Web Vitals測定`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Performance API でメトリクス取得
        const metrics = await page.evaluate(() => {
          return new Promise<CoreWebVitals & PageMetrics>((resolve) => {
            // ページ読み込み完了を待つ
            if (document.readyState === 'complete') {
              collectMetrics();
            } else {
              window.addEventListener('load', collectMetrics);
            }

            function collectMetrics() {
              const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
              const paintEntries = performance.getEntriesByType('paint');

              // Core Web Vitals計算
              let lcp = 0;
              let fid = 0;
              let cls = 0;

              // LCP測定
              const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
              if (lcpEntries.length > 0) {
                lcp = lcpEntries[lcpEntries.length - 1].startTime;
              }

              // FID測定（シミュレーション）
              const eventEntries = performance.getEntriesByType('event');
              if (eventEntries.length > 0) {
                fid = Math.max(...eventEntries.map(e => (e as any).processingStart - e.startTime));
              }

              // CLS測定（layout-shift entries）
              const layoutShiftEntries = performance.getEntriesByType('layout-shift');
              cls = layoutShiftEntries.reduce((sum, entry) => {
                return sum + (entry as any).value;
              }, 0);

              // その他のパフォーマンスメトリクス
              const firstPaint = paintEntries.find(e => e.name === 'first-paint')?.startTime || 0;
              const firstContentfulPaint = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0;

              resolve({
                lcp,
                fid,
                cls,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                loadComplete: navigation.loadEventEnd - navigation.fetchStart,
                firstPaint,
                firstContentfulPaint
              });
            }
          });
        });

        // Core Web Vitals 閾値チェック
        console.log(`${name} - メトリクス:`, metrics);

        // LCP: 2.5秒以下が良好
        expect(metrics.lcp).toBeLessThan(2500);

        // FID: 100ms以下が良好
        expect(metrics.fid).toBeLessThan(100);

        // CLS: 0.1以下が良好
        expect(metrics.cls).toBeLessThan(0.1);

        // 初回ページ読み込み: 3秒以内
        expect(metrics.loadComplete).toBeLessThan(3000);

        // First Contentful Paint: 1.8秒以内
        expect(metrics.firstContentfulPaint).toBeLessThan(1800);
      });
    });
  });

  // アクセシビリティテスト
  test.describe('WCAG 2.1 AA準拠確認', () => {

    test('キーボードナビゲーションテスト', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tabキーでフォーカス可能な要素を取得
      const focusableElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        ));
        return elements.map(el => ({
          tagName: el.tagName,
          text: el.textContent?.trim() || '',
          href: (el as HTMLAnchorElement).href || '',
          id: el.id,
          className: el.className
        }));
      });

      expect(focusableElements.length).toBeGreaterThan(0);

      // 主要ナビゲーション要素がフォーカス可能であることを確認
      const navigationLinks = focusableElements.filter(el =>
        el.tagName === 'A' && (el.href.includes('/blog') || el.href.includes('/about') || el.href.includes('/tags'))
      );
      expect(navigationLinks.length).toBeGreaterThan(0);

      // Tabキーでの順次フォーカス確認
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT'].includes(firstFocused || '')).toBe(true);
    });

    test('フォーカス表示の確認', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 最初のリンクにフォーカス
      const firstLink = page.locator('a').first();
      await firstLink.focus();

      // フォーカススタイルが適用されているか確認
      const focusStyles = await firstLink.evaluate(el => {
        const styles = window.getComputedStyle(el, ':focus');
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineColor: styles.outlineColor,
          outlineStyle: styles.outlineStyle
        };
      });

      // フォーカス表示があることを確認（outline または box-shadow）
      const hasFocusIndicator =
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        await firstLink.evaluate(el => {
          const styles = window.getComputedStyle(el, ':focus');
          return styles.boxShadow !== 'none';
        });

      expect(hasFocusIndicator).toBe(true);
    });

    test('カラーコントラスト測定', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const contrastResults = await page.evaluate(() => {
        const results = [];
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');

        for (let i = 0; i < Math.min(textElements.length, 20); i++) {
          const el = textElements[i] as HTMLElement;
          const styles = window.getComputedStyle(el);
          const text = el.textContent?.trim();

          if (text && text.length > 0) {
            // RGB値を取得
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;

            // 簡易的なコントラスト判定（実際の計算は複雑なため概算）
            const hasGoodContrast = color !== backgroundColor &&
              (color.includes('rgb') || color.includes('#')) &&
              (backgroundColor.includes('rgb') || backgroundColor.includes('#') || backgroundColor === 'rgba(0, 0, 0, 0)');

            results.push({
              element: el.tagName,
              text: text.substring(0, 50),
              color: color,
              backgroundColor: backgroundColor,
              hasContrast: hasGoodContrast
            });
          }
        }

        return results;
      });

      // 大部分の要素でコントラストが確保されていることを確認
      const goodContrastCount = contrastResults.filter(r => r.hasContrast).length;
      const totalCount = contrastResults.length;
      const contrastRatio = goodContrastCount / totalCount;

      console.log('コントラスト結果:', { goodContrastCount, totalCount, contrastRatio });
      expect(contrastRatio).toBeGreaterThan(0.8); // 80%以上
    });

    test('代替テキスト確認', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');
      await page.waitForLoadState('networkidle');

      const imageAccessibility = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map(img => ({
          src: img.src,
          alt: img.alt,
          hasAlt: img.alt.length > 0,
          ariaLabel: img.getAttribute('aria-label'),
          title: img.title
        }));
      });

      // 全ての画像に代替テキストがあることを確認
      for (const img of imageAccessibility) {
        expect(img.hasAlt || img.ariaLabel || img.title).toBe(true);
      }
    });

    test('見出し構造の確認', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');
      await page.waitForLoadState('networkidle');

      const headingStructure = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return headings.map(h => ({
          level: parseInt(h.tagName.charAt(1)),
          text: h.textContent?.trim() || '',
          id: h.id
        }));
      });

      // H1が存在することを確認
      const h1Count = headingStructure.filter(h => h.level === 1).length;
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // 見出しレベルが論理的な順序になっているかチェック
      let previousLevel = 0;
      for (const heading of headingStructure) {
        if (previousLevel > 0) {
          // 見出しレベルの飛び越えが2段階以上でないことを確認
          expect(heading.level - previousLevel).toBeLessThanOrEqual(1);
        }
        previousLevel = heading.level;
      }
    });
  });

  // パフォーマンス劣化チェック
  test.describe('パフォーマンス劣化チェック', () => {

    test('ページサイズ確認', async ({ page }) => {
      await page.goto('/');

      // リソースサイズを測定
      const resourceSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        let totalSize = 0;
        let cssSize = 0;
        let jsSize = 0;
        let imageSize = 0;

        resources.forEach(resource => {
          const size = resource.transferSize || 0;
          totalSize += size;

          if (resource.name.includes('.css')) {
            cssSize += size;
          } else if (resource.name.includes('.js')) {
            jsSize += size;
          } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            imageSize += size;
          }
        });

        return {
          total: totalSize,
          css: cssSize,
          js: jsSize,
          images: imageSize
        };
      });

      console.log('リソースサイズ:', resourceSizes);

      // 合理的なサイズ制限
      expect(resourceSizes.total).toBeLessThan(1024 * 1024); // 1MB以下
      expect(resourceSizes.css).toBeLessThan(100 * 1024); // CSS 100KB以下
      expect(resourceSizes.js).toBeLessThan(300 * 1024); // JS 300KB以下
    });

    test('レンダリングパフォーマンス', async ({ page }) => {
      await page.goto('/blog/mark-highlight-test/');
      await page.waitForLoadState('networkidle');

      // 複数回のビューポート変更でパフォーマンスを測定
      const viewports = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
        { width: 1200, height: 800 }
      ];

      for (const viewport of viewports) {
        const startTime = Date.now();

        await page.setViewportSize(viewport);
        await page.waitForTimeout(100); // レイアウト完了待ち

        const endTime = Date.now();
        const resizeTime = endTime - startTime;

        // ビューポート変更時の応答時間が適切であることを確認
        expect(resizeTime).toBeLessThan(500); // 500ms以下

        console.log(`ビューポート ${viewport.width}x${viewport.height}: ${resizeTime}ms`);
      }
    });
  });

  // モバイルユーザビリティ
  test.describe('モバイルユーザビリティ', () => {

    test('タッチターゲットサイズ確認', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/blog/mark-highlight-test/');
      await page.waitForLoadState('networkidle');

      const touchTargets = await page.evaluate(() => {
        const clickables = document.querySelectorAll('a, button, [onclick], [role="button"]');
        const results = [];

        clickables.forEach(el => {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);

          results.push({
            element: el.tagName,
            text: el.textContent?.trim().substring(0, 20) || '',
            width: rect.width,
            height: rect.height,
            minHeight: parseFloat(styles.minHeight) || 0,
            padding: styles.padding
          });
        });

        return results;
      });

      // タッチターゲットが44px以上であることを確認
      const smallTargets = touchTargets.filter(target =>
        target.width < 44 || target.height < 44
      );

      console.log('小さなタッチターゲット:', smallTargets);

      // 重要な要素（リンク、ボタン）は適切なサイズであることを確認
      const importantTargets = touchTargets.filter(target =>
        target.element === 'A' || target.element === 'BUTTON'
      );

      const goodSizeTargets = importantTargets.filter(target =>
        target.width >= 44 && target.height >= 44
      );

      const ratio = goodSizeTargets.length / importantTargets.length;
      expect(ratio).toBeGreaterThan(0.8); // 80%以上が適切なサイズ
    });
  });
});