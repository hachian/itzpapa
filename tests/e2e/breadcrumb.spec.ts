import { test, expect } from '@playwright/test';

/**
 * パンくずナビゲーション検証テスト
 * Requirements: 1, 2, 3, 6
 */

test.describe('パンくずナビゲーション', () => {

  test.describe('ブログ一覧ページ', () => {

    test('パンくずリストが「ホーム › ブログ」形式で表示される', async ({ page }) => {
      await page.goto('/blog/');
      await page.waitForLoadState('networkidle');

      // パンくずリストのnav要素が存在することを確認
      const breadcrumb = page.locator('nav.breadcrumb');
      await expect(breadcrumb).toBeVisible();

      // パンくずリストの項目を確認
      const items = breadcrumb.locator('.breadcrumb__item');
      await expect(items).toHaveCount(2);

      // ホームリンクの確認
      const homeLink = items.nth(0).locator('.breadcrumb__link');
      await expect(homeLink).toHaveText('ホーム');
      await expect(homeLink).toHaveAttribute('href', '/');

      // 現在のページ（ブログ）の確認
      const currentPage = items.nth(1).locator('.breadcrumb__current');
      await expect(currentPage).toHaveText('ブログ');
      await expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    test('ホームリンクをクリックするとホームページに遷移する', async ({ page }) => {
      await page.goto('/blog/');
      await page.waitForLoadState('networkidle');

      const homeLink = page.locator('nav.breadcrumb .breadcrumb__link').first();
      await homeLink.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('タグ一覧ページ', () => {

    test('パンくずリストが「ホーム › タグ」形式で表示される', async ({ page }) => {
      await page.goto('/tags/');
      await page.waitForLoadState('networkidle');

      // パンくずリストのnav要素が存在することを確認
      const breadcrumb = page.locator('nav.breadcrumb');
      await expect(breadcrumb).toBeVisible();

      // パンくずリストの項目を確認
      const items = breadcrumb.locator('.breadcrumb__item');
      await expect(items).toHaveCount(2);

      // ホームリンクの確認
      const homeLink = items.nth(0).locator('.breadcrumb__link');
      await expect(homeLink).toHaveText('ホーム');
      await expect(homeLink).toHaveAttribute('href', '/');

      // 現在のページ（タグ）の確認
      const currentPage = items.nth(1).locator('.breadcrumb__current');
      await expect(currentPage).toHaveText('タグ');
      await expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    test('ホームリンクをクリックするとホームページに遷移する', async ({ page }) => {
      await page.goto('/tags/');
      await page.waitForLoadState('networkidle');

      const homeLink = page.locator('nav.breadcrumb .breadcrumb__link').first();
      await homeLink.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('タグ詳細ページ', () => {

    test('フラットタグのパンくずリストが「ホーム › タグ › タグ名」形式で表示される', async ({ page }) => {
      // テスト用にtestタグが存在すると仮定
      await page.goto('/tags/test/');
      await page.waitForLoadState('networkidle');

      // パンくずリストのnav要素が存在することを確認
      const breadcrumb = page.locator('nav.breadcrumb');
      await expect(breadcrumb).toBeVisible();

      // パンくずリストの項目を確認（ホーム、タグ、タグ名）
      const items = breadcrumb.locator('.breadcrumb__item');
      await expect(items).toHaveCount(3);

      // ホームリンク
      const homeLink = items.nth(0).locator('.breadcrumb__link');
      await expect(homeLink).toHaveAttribute('href', '/');

      // タグリンク
      const tagsLink = items.nth(1).locator('.breadcrumb__link');
      await expect(tagsLink).toHaveAttribute('href', '/tags/');

      // 現在のページ（タグ名）
      const currentPage = items.nth(2).locator('.breadcrumb__current');
      await expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    test('タグリンクをクリックするとタグ一覧ページに遷移する', async ({ page }) => {
      await page.goto('/tags/test/');
      await page.waitForLoadState('networkidle');

      const tagsLink = page.locator('nav.breadcrumb .breadcrumb__link').nth(1);
      await tagsLink.click();

      await expect(page).toHaveURL('/tags/');
    });
  });

  test.describe('アクセシビリティ', () => {

    test('パンくずリストにaria-labelが設定されている', async ({ page }) => {
      await page.goto('/blog/');
      await page.waitForLoadState('networkidle');

      const breadcrumb = page.locator('nav.breadcrumb');
      await expect(breadcrumb).toHaveAttribute('aria-label');
    });

    test('区切り文字がaria-hidden属性を持つ', async ({ page }) => {
      await page.goto('/blog/');
      await page.waitForLoadState('networkidle');

      const separators = page.locator('nav.breadcrumb .breadcrumb__separator');
      const count = await separators.count();

      for (let i = 0; i < count; i++) {
        await expect(separators.nth(i)).toHaveAttribute('aria-hidden', 'true');
      }
    });

    test('順序付きリスト（ol）で構造化されている', async ({ page }) => {
      await page.goto('/blog/');
      await page.waitForLoadState('networkidle');

      const orderedList = page.locator('nav.breadcrumb ol.breadcrumb__list');
      await expect(orderedList).toBeVisible();
    });
  });
});
