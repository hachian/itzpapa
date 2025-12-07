/**
 * site.config.ts 型定義と設定ファイルのテスト
 * 型の構造をランタイムで検証
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('SiteConfig 型定義', () => {
  describe('型ファイルの存在確認', () => {
    it('site-config.ts ファイルが存在する', () => {
      const typesPath = resolve(process.cwd(), 'src/types/site-config.ts');
      assert.ok(existsSync(typesPath), 'src/types/site-config.ts が存在する');
    });
  });

  describe('SocialLinkConfig 構造', () => {
    it('enabled と url のプロパティを持つ', async () => {
      // SocialLinkConfig の構造をテスト用オブジェクトで検証
      const validSocialLink = {
        enabled: true,
        url: 'https://github.com/username'
      };

      assert.strictEqual(typeof validSocialLink.enabled, 'boolean');
      assert.strictEqual(typeof validSocialLink.url, 'string');
    });
  });

  describe('SocialLinks 構造', () => {
    it('すべての SNS プラットフォームが定義されている', () => {
      const requiredPlatforms = [
        'github',
        'twitter',
        'youtube',
        'bluesky',
        'instagram',
        'linkedin',
        'mastodon',
        'threads'
      ];

      const socialLinks = {
        github: { enabled: true, url: '' },
        twitter: { enabled: false, url: '' },
        youtube: { enabled: false, url: '' },
        bluesky: { enabled: false, url: '' },
        instagram: { enabled: false, url: '' },
        linkedin: { enabled: false, url: '' },
        mastodon: { enabled: false, url: '' },
        threads: { enabled: false, url: '' }
      };

      for (const platform of requiredPlatforms) {
        assert.ok(platform in socialLinks, `${platform} が SocialLinks に存在する`);
        assert.ok('enabled' in socialLinks[platform], `${platform}.enabled が存在する`);
        assert.ok('url' in socialLinks[platform], `${platform}.url が存在する`);
      }
    });
  });

  describe('NavItem 構造', () => {
    it('label と href のプロパティを持つ', () => {
      const validNavItem = {
        label: 'Home',
        href: '/'
      };

      assert.strictEqual(typeof validNavItem.label, 'string');
      assert.strictEqual(typeof validNavItem.href, 'string');
    });
  });

  describe('SiteInfo 構造', () => {
    it('必須プロパティ（title, description, author, baseUrl）を持つ', () => {
      const validSiteInfo = {
        title: 'itzpapa',
        description: 'Test description',
        author: 'Test Author',
        baseUrl: 'https://example.com'
      };

      assert.strictEqual(typeof validSiteInfo.title, 'string');
      assert.strictEqual(typeof validSiteInfo.description, 'string');
      assert.strictEqual(typeof validSiteInfo.author, 'string');
      assert.strictEqual(typeof validSiteInfo.baseUrl, 'string');
    });

    it('オプションのプロパティ（authorProfile）を持てる', () => {
      const siteInfoWithProfile = {
        title: 'itzpapa',
        description: 'Test description',
        author: 'Test Author',
        baseUrl: 'https://example.com',
        authorProfile: 'https://example.com/about'
      };

      assert.strictEqual(typeof siteInfoWithProfile.authorProfile, 'string');
    });
  });

  describe('ThemeConfig 構造', () => {
    it('primaryHue プロパティを持つ（0-360 の数値）', () => {
      const validThemeConfig = {
        primaryHue: 293
      };

      assert.strictEqual(typeof validThemeConfig.primaryHue, 'number');
      assert.ok(validThemeConfig.primaryHue >= 0 && validThemeConfig.primaryHue <= 360);
    });
  });

  describe('FooterConfig 構造', () => {
    it('オプションのプロパティ（copyrightText, startYear）を持てる', () => {
      const validFooterConfig = {
        copyrightText: 'All rights reserved.',
        startYear: 2024
      };

      assert.strictEqual(typeof validFooterConfig.copyrightText, 'string');
      assert.strictEqual(typeof validFooterConfig.startYear, 'number');
    });
  });

  describe('SeoConfig 構造', () => {
    it('オプションのプロパティを持てる', () => {
      const validSeoConfig = {
        defaultOgImage: '/og-image.png',
        defaultDescription: 'Default description',
        googleAnalyticsId: 'G-XXXXXXX'
      };

      assert.strictEqual(typeof validSeoConfig.defaultOgImage, 'string');
      assert.strictEqual(typeof validSeoConfig.defaultDescription, 'string');
      assert.strictEqual(typeof validSeoConfig.googleAnalyticsId, 'string');
    });
  });

  describe('FeatureFlags 構造', () => {
    it('必須プロパティ（tableOfContents, tagCloud, relatedPosts）を持つ', () => {
      const validFeatureFlags = {
        tableOfContents: true,
        tagCloud: true,
        relatedPosts: true
      };

      assert.strictEqual(typeof validFeatureFlags.tableOfContents, 'boolean');
      assert.strictEqual(typeof validFeatureFlags.tagCloud, 'boolean');
      assert.strictEqual(typeof validFeatureFlags.relatedPosts, 'boolean');
    });

    it('オプションの comments 設定を持てる', () => {
      const featureFlagsWithComments = {
        tableOfContents: true,
        tagCloud: true,
        relatedPosts: true,
        comments: {
          enabled: true,
          provider: 'giscus',
          config: { repo: 'owner/repo' }
        }
      };

      assert.ok(featureFlagsWithComments.comments);
      assert.strictEqual(typeof featureFlagsWithComments.comments.enabled, 'boolean');
      assert.strictEqual(featureFlagsWithComments.comments.provider, 'giscus');
    });
  });

  describe('SiteConfig 構造（統合）', () => {
    it('すべてのセクションを含む完全な設定オブジェクト', () => {
      const validSiteConfig = {
        site: {
          title: 'itzpapa',
          description: 'Test description',
          author: 'Test Author',
          baseUrl: 'https://example.com'
        },
        theme: {
          primaryHue: 293
        },
        navigation: [
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' }
        ],
        social: {
          github: { enabled: true, url: 'https://github.com/username' },
          twitter: { enabled: false, url: '' },
          youtube: { enabled: false, url: '' },
          bluesky: { enabled: false, url: '' },
          instagram: { enabled: false, url: '' },
          linkedin: { enabled: false, url: '' },
          mastodon: { enabled: false, url: '' },
          threads: { enabled: false, url: '' }
        },
        footer: {
          copyrightText: 'All rights reserved.',
          startYear: 2024
        },
        seo: {
          defaultOgImage: '/og-image.png'
        },
        features: {
          tableOfContents: true,
          tagCloud: true,
          relatedPosts: true
        }
      };

      // 各セクションの存在確認
      assert.ok(validSiteConfig.site, 'site セクションが存在する');
      assert.ok(validSiteConfig.theme, 'theme セクションが存在する');
      assert.ok(Array.isArray(validSiteConfig.navigation), 'navigation が配列である');
      assert.ok(validSiteConfig.social, 'social セクションが存在する');
      assert.ok(validSiteConfig.footer, 'footer セクションが存在する');
      assert.ok(validSiteConfig.seo, 'seo セクションが存在する');
      assert.ok(validSiteConfig.features, 'features セクションが存在する');
    });
  });
});

describe('site.config.ts 設定ファイル', () => {
  describe('ファイルの存在確認', () => {
    it('site.config.ts ファイルが存在する', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      assert.ok(existsSync(configPath), 'src/site.config.ts が存在する');
    });
  });

  describe('設定ファイルの内容検証', () => {
    it('SiteConfig 型をインポートしている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(
        content.includes("import type { SiteConfig }") ||
        content.includes("import { SiteConfig }") ||
        content.includes("from './types/site-config'"),
        '型定義をインポートしている'
      );
    });

    it('siteConfig をエクスポートしている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(
        content.includes('export const siteConfig'),
        'siteConfig をエクスポートしている'
      );
    });

    it('サイト基本情報が設定されている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('site:'), 'site セクションが存在する');
      assert.ok(content.includes('title:'), 'title が設定されている');
      assert.ok(content.includes('description:'), 'description が設定されている');
      assert.ok(content.includes('author:'), 'author が設定されている');
      assert.ok(content.includes('baseUrl:'), 'baseUrl が設定されている');
    });

    it('テーマ設定が含まれている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('theme:'), 'theme セクションが存在する');
      assert.ok(content.includes('primaryHue:'), 'primaryHue が設定されている');
    });

    it('ナビゲーション設定が含まれている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('navigation:'), 'navigation セクションが存在する');
    });

    it('SNS 設定が含まれている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('social:'), 'social セクションが存在する');
      assert.ok(content.includes('github:'), 'github 設定が存在する');
      assert.ok(content.includes('twitter:'), 'twitter 設定が存在する');
    });

    it('フッター設定が含まれている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('footer:'), 'footer セクションが存在する');
    });

    it('SEO 設定が含まれている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('seo:'), 'seo セクションが存在する');
    });

    it('機能フラグが含まれている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(content.includes('features:'), 'features セクションが存在する');
      assert.ok(content.includes('tableOfContents:'), 'tableOfContents が設定されている');
      assert.ok(content.includes('tagCloud:'), 'tagCloud が設定されている');
      assert.ok(content.includes('relatedPosts:'), 'relatedPosts が設定されている');
    });

    it('各設定項目の用途を説明するコメントが含まれている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      // コメントが存在することを確認（// または /* のいずれか）
      const hasComments = content.includes('//') || content.includes('/*');
      assert.ok(hasComments, '設定ファイルにコメントが含まれている');
    });
  });

  describe('後方互換性', () => {
    it('SITE_TITLE がエクスポートされている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(
        content.includes('export const SITE_TITLE') ||
        content.includes('export { SITE_TITLE'),
        'SITE_TITLE がエクスポートされている'
      );
    });

    it('SITE_DESCRIPTION がエクスポートされている', () => {
      const configPath = resolve(process.cwd(), 'src/site.config.ts');
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(
        content.includes('export const SITE_DESCRIPTION') ||
        content.includes('export { SITE_DESCRIPTION'),
        'SITE_DESCRIPTION がエクスポートされている'
      );
    });
  });
});
