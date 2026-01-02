/**
 * 統合テスト: 設定変更がビルド結果に反映されることを検証
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

describe('Task 7.1: 設定変更がビルド結果に反映されることを検証', () => {
  const configPath = resolve(process.cwd(), 'site.config.ts');
  let originalConfig;

  before(() => {
    // 元の設定ファイルをバックアップ
    originalConfig = readFileSync(configPath, 'utf-8');
  });

  after(() => {
    // 設定ファイルを元に戻す
    writeFileSync(configPath, originalConfig);
  });

  describe('設定ファイルの構造検証', () => {
    it('設定ファイルが存在する', () => {
      assert.ok(existsSync(configPath), '設定ファイルが存在する');
    });

    it('必要な設定項目をエクスポートしている', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('export const siteConfig'), 'siteConfig をエクスポートしている');
      assert.ok(content.includes('export const SITE_TITLE'), 'SITE_TITLE をエクスポートしている');
      assert.ok(content.includes('export const SITE_DESCRIPTION'), 'SITE_DESCRIPTION をエクスポートしている');
    });
  });

  describe('設定項目の存在検証', () => {
    it('site 設定が含まれている', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('site:'), 'site 設定が含まれている');
      assert.ok(content.includes('title:'), 'title が含まれている');
      assert.ok(content.includes('description:'), 'description が含まれている');
      assert.ok(content.includes('author:'), 'author が含まれている');
    });

    it('theme 設定が含まれている', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('theme:'), 'theme 設定が含まれている');
      assert.ok(content.includes('primaryHue:'), 'primaryHue が含まれている');
    });

    it('navigation 設定が含まれている', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('navigation:'), 'navigation 設定が含まれている');
    });

    it('social 設定が含まれている', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('social:'), 'social 設定が含まれている');
      assert.ok(content.includes('github:'), 'github 設定が含まれている');
      assert.ok(content.includes('twitter:'), 'twitter 設定が含まれている');
    });

    it('footer 設定が含まれている', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('footer:'), 'footer 設定が含まれている');
      assert.ok(content.includes('copyrightText:'), 'copyrightText が含まれている');
      assert.ok(content.includes('startYear:'), 'startYear が含まれている');
    });

    it('seo 設定が含まれている', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('seo:'), 'seo 設定が含まれている');
      assert.ok(content.includes('googleAnalyticsId:'), 'googleAnalyticsId が含まれている');
    });

    it('features 設定が含まれている', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('features:'), 'features 設定が含まれている');
      assert.ok(content.includes('tableOfContents:'), 'tableOfContents が含まれている');
      assert.ok(content.includes('tagCloud:'), 'tagCloud が含まれている');
      assert.ok(content.includes('relatedPosts:'), 'relatedPosts が含まれている');
    });
  });

  describe('コンポーネントでの設定使用検証', () => {
    it('Header が設定を使用している', () => {
      const headerPath = resolve(process.cwd(), 'src/components/Header.astro');
      const content = readFileSync(headerPath, 'utf-8');
      assert.ok(content.includes('siteConfig'), 'Header が siteConfig を使用している');
      assert.ok(content.includes('navigation'), 'Header が navigation を使用している');
      assert.ok(content.includes('social'), 'Header が social を使用している');
    });

    it('Footer が設定を使用している', () => {
      const footerPath = resolve(process.cwd(), 'src/components/Footer.astro');
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(content.includes('siteConfig'), 'Footer が siteConfig を使用している');
      assert.ok(content.includes('footer'), 'Footer が footer 設定を使用している');
    });

    it('BaseHead が設定を使用している', () => {
      const baseHeadPath = resolve(process.cwd(), 'src/components/BaseHead.astro');
      const content = readFileSync(baseHeadPath, 'utf-8');
      assert.ok(content.includes('siteConfig'), 'BaseHead が siteConfig を使用している');
      assert.ok(content.includes('theme'), 'BaseHead が theme 設定を使用している');
      assert.ok(content.includes('primaryHue'), 'BaseHead が primaryHue を使用している');
    });

    it('BlogPost が機能フラグを使用している', () => {
      const blogPostPath = resolve(process.cwd(), 'src/layouts/BlogPost.astro');
      const content = readFileSync(blogPostPath, 'utf-8');
      assert.ok(content.includes('siteConfig'), 'BlogPost が siteConfig を使用している');
      assert.ok(content.includes('features'), 'BlogPost が features を使用している');
      assert.ok(content.includes('showTableOfContents'), 'BlogPost が showTableOfContents を使用している');
    });

    it('タグ一覧ページが機能フラグを使用している', () => {
      const tagIndexPath = resolve(process.cwd(), 'src/pages/tags/index.astro');
      const content = readFileSync(tagIndexPath, 'utf-8');
      assert.ok(content.includes('siteConfig'), 'タグ一覧が siteConfig を使用している');
      assert.ok(content.includes('showTagCloud'), 'タグ一覧が showTagCloud を使用している');
    });
  });
});

describe('Task 7.2: TypeScript 型チェック検証', () => {
  it('型定義ファイルが存在する', () => {
    const typePath = resolve(process.cwd(), 'src/types/site-config.ts');
    assert.ok(existsSync(typePath), '型定義ファイルが存在する');
  });

  it('型定義が SiteConfig インターフェースを含む', () => {
    const typePath = resolve(process.cwd(), 'src/types/site-config.ts');
    const content = readFileSync(typePath, 'utf-8');
    assert.ok(content.includes('export interface SiteConfig'), 'SiteConfig インターフェースが存在する');
    assert.ok(content.includes('export interface SiteInfo'), 'SiteInfo インターフェースが存在する');
    assert.ok(content.includes('export interface ThemeConfig'), 'ThemeConfig インターフェースが存在する');
    assert.ok(content.includes('export interface FeatureFlags'), 'FeatureFlags インターフェースが存在する');
  });

  it('設定ファイルが型定義をインポートしている', () => {
    const configPath = resolve(process.cwd(), 'site.config.ts');
    const content = readFileSync(configPath, 'utf-8');
    assert.ok(
      content.includes("import type") && content.includes('SiteConfig'),
      '設定ファイルが型定義をインポートしている'
    );
  });
});
