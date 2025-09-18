import { test, expect } from '@playwright/test';

/**
 * 横スクロール自動検知テスト
 * 全ページで横スクロールが発生していないことを確認
 */

const pages = [
  { name: 'トップページ', path: '/' },
  { name: 'ブログ一覧', path: '/blog' },
  { name: 'タグページ', path: '/tags' },
  { name: 'About', path: '/about' },
];

test.describe('横スクロール検知テスト', () => {
  pages.forEach(({ name, path }) => {
    test(`${name} - 横スクロールが発生しない`, async ({ page, viewport }) => {
      await page.goto(path);

      // ページ読み込み完了を待つ
      await page.waitForLoadState('networkidle');

      // 横スクロールの検出
      const hasHorizontalScroll = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const windowWidth = window.innerWidth;
        const scrollWidth = Math.max(
          body.scrollWidth,
          body.offsetWidth,
          html.clientWidth,
          html.scrollWidth,
          html.offsetWidth
        );

        return scrollWidth > windowWidth;
      });

      // 横スクロールが存在しないことを確認
      expect(hasHorizontalScroll).toBe(false);

      // デバッグ情報を出力
      if (hasHorizontalScroll) {
        const scrollInfo = await page.evaluate(() => {
          const elements = [];
          const all = document.querySelectorAll('*');

          all.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > window.innerWidth || rect.right > window.innerWidth) {
              elements.push({
                tag: el.tagName,
                class: el.className,
                id: el.id,
                width: rect.width,
                right: rect.right,
                windowWidth: window.innerWidth
              });
            }
          });

          return elements;
        });

        console.log(`横スクロールの原因となる要素:`, scrollInfo);
      }
    });
  });

  // ブログ記事ページのテスト（目次あり/なし）
  test('ブログ記事（目次あり） - 横スクロールが発生しない', async ({ page }) => {
    // 最初のブログ記事を取得
    await page.goto('/blog');
    const firstArticle = await page.locator('article a').first();
    const articleUrl = await firstArticle.getAttribute('href');

    if (articleUrl) {
      await page.goto(articleUrl);
      await page.waitForLoadState('networkidle');

      // 横スクロール検出
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);

      // 目次の存在確認
      const hasToc = await page.locator('.toc-sidebar').count() > 0;
      if (hasToc) {
        console.log('目次ありのページでテスト実行');

        // グリッドレイアウトのオーバーフロー確認
        const gridOverflow = await page.evaluate(() => {
          const grid = document.querySelector('.blog-layout-with-toc');
          if (grid) {
            const rect = grid.getBoundingClientRect();
            return rect.right > window.innerWidth;
          }
          return false;
        });

        expect(gridOverflow).toBe(false);
      }
    }
  });

  // 極小画面でのテスト
  test('極小画面（320px未満） - 横スクロール処理', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 280, height: 568 }
    });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // body要素にoverflow-x: autoが設定されていることを確認
    const bodyOverflow = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return styles.overflowX;
    });

    expect(['auto', 'scroll']).toContain(bodyOverflow);

    await context.close();
  });

  // 極大画面でのテスト
  test('極大画面（1920px以上） - レイアウト最大幅確認', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 2560, height: 1440 }
    });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // main要素の最大幅が適用されていることを確認
    const mainMaxWidth = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) {
        const styles = window.getComputedStyle(main);
        return styles.maxWidth;
      }
      return null;
    });

    expect(mainMaxWidth).toBe('960px');

    await context.close();
  });
});