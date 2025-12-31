import { test, expect } from '@playwright/test';

/**
 * モバイルメニュー動作テスト
 * メニュートグルとリンククリック時の動作確認
 */

const mobileViewport = { width: 375, height: 667 };

test.describe('モバイルメニュー動作テスト', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('メニューリンクをクリックするとメニューが閉じる', async ({ page }) => {
    // メニュートグルボタンを取得
    const menuToggle = page.locator('.header__menu-toggle');
    const mobileMenu = page.locator('#mobile-menu');

    // 初期状態：メニューは非表示
    await expect(mobileMenu).toBeHidden();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

    // メニューを開く
    await menuToggle.click();
    await expect(mobileMenu).toBeVisible();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    // メニュー内のHomeリンクをクリック
    const homeLink = mobileMenu.locator('a[href="/"]');
    await homeLink.click();

    // メニューが閉じることを確認
    await expect(mobileMenu).toBeHidden();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('メニュー内の各リンクをクリックするとメニューが閉じる', async ({ page }) => {
    const menuToggle = page.locator('.header__menu-toggle');
    const mobileMenu = page.locator('#mobile-menu');
    const menuLinks = mobileMenu.locator('a[data-header-link]');

    // リンク数を取得
    await menuToggle.click();
    await expect(mobileMenu).toBeVisible();
    const linkCount = await menuLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // 各リンクをクリックしてメニューが閉じることを確認
    for (let i = 0; i < linkCount; i++) {
      // メニューを開く
      await menuToggle.click();
      await expect(mobileMenu).toBeVisible();

      // リンクをクリック
      const link = menuLinks.nth(i);
      const href = await link.getAttribute('href');
      await link.click();

      // メニューが閉じることを確認
      await expect(mobileMenu).toBeHidden();
      await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

      // 次のテストのためにホームに戻る
      if (href !== '/') {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('メニュー外クリックでメニューが閉じる', async ({ page }) => {
    const menuToggle = page.locator('.header__menu-toggle');
    const mobileMenu = page.locator('#mobile-menu');

    // メニューを開く
    await menuToggle.click();
    await expect(mobileMenu).toBeVisible();

    // メニュー外（本文エリア）をクリック
    await page.locator('main').click({ force: true });

    // メニューが閉じることを確認
    await expect(mobileMenu).toBeHidden();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escキーでメニューが閉じる', async ({ page }) => {
    const menuToggle = page.locator('.header__menu-toggle');
    const mobileMenu = page.locator('#mobile-menu');

    // メニューを開く
    await menuToggle.click();
    await expect(mobileMenu).toBeVisible();

    // Escキーを押す
    await page.keyboard.press('Escape');

    // メニューが閉じることを確認
    await expect(mobileMenu).toBeHidden();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('デスクトップではハンバーガーメニューが非表示', async ({ page }) => {
    // デスクトップビューポートに変更
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(100);

    const menuToggle = page.locator('.header__menu-toggle');
    const headerLinks = page.locator('.header__links');

    // デスクトップではハンバーガーメニューが非表示
    await expect(menuToggle).not.toBeVisible();

    // デスクトップではナビゲーションリンクが表示
    await expect(headerLinks).toBeVisible();
  });
});
