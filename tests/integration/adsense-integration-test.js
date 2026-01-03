/**
 * Google AdSense 統合テスト
 *
 * ビルド後のHTMLを検証し、AdSense設定が正しく反映されることを確認する。
 * 現在の設定（googleAdsenseId: ''）ではスクリプトが出力されないことを検証。
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

describe('Google AdSense 統合テスト', () => {
  const distPath = resolve(process.cwd(), 'dist');

  describe('ビルド後のHTML検証（AdSense無効時）', () => {
    before(function() {
      // distフォルダが存在しない場合はスキップ
      if (!existsSync(distPath)) {
        console.log('⚠️ dist フォルダが存在しません。npm run build を実行してください。');
        this.skip();
      }
    });

    it('AdSense IDが空の場合、HTMLにAdSenseスクリプトが含まれない', () => {
      const indexPath = join(distPath, 'index.html');
      if (!existsSync(indexPath)) {
        console.log('⚠️ index.html が存在しません');
        return;
      }

      const html = readFileSync(indexPath, 'utf-8');

      // AdSenseスクリプトが含まれていないことを確認
      assert.ok(
        !html.includes('pagead2.googlesyndication.com'),
        'AdSense IDが空の場合、AdSenseスクリプトは出力されないこと'
      );
      assert.ok(
        !html.includes('adsbygoogle'),
        'AdSense IDが空の場合、adsbygoogleは出力されないこと'
      );
    });

    it('ブログ記事ページでもAdSenseスクリプトが含まれない', () => {
      // ブログディレクトリを検索
      const blogPath = join(distPath, 'blog');
      if (!existsSync(blogPath)) {
        console.log('⚠️ blog フォルダが存在しません');
        return;
      }

      // 任意のブログ記事を検索
      const blogDirs = readdirSync(blogPath, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .slice(0, 1); // 最初の1つだけ

      if (blogDirs.length === 0) {
        console.log('⚠️ ブログ記事が存在しません');
        return;
      }

      const articlePath = join(blogPath, blogDirs[0].name, 'index.html');
      if (!existsSync(articlePath)) {
        return;
      }

      const html = readFileSync(articlePath, 'utf-8');

      assert.ok(
        !html.includes('pagead2.googlesyndication.com'),
        'ブログ記事でもAdSenseスクリプトは出力されないこと'
      );
    });

    it('Google Analyticsの出力には影響しない（設定されている場合）', () => {
      const indexPath = join(distPath, 'index.html');
      if (!existsSync(indexPath)) {
        return;
      }

      const html = readFileSync(indexPath, 'utf-8');
      const configPath = resolve(process.cwd(), 'site.config.ts');
      const config = readFileSync(configPath, 'utf-8');

      // Google Analytics IDが設定されているか確認
      const gaMatch = config.match(/googleAnalyticsId:\s*['"]([^'"]+)['"]/);
      const gaId = gaMatch ? gaMatch[1] : '';

      if (gaId) {
        // GAが設定されている場合、出力されていることを確認
        assert.ok(
          html.includes('googletagmanager.com'),
          'Google Analytics IDが設定されている場合、GAスクリプトは出力されること'
        );
      } else {
        // GAが設定されていない場合、出力されていないことを確認
        assert.ok(
          !html.includes('googletagmanager.com'),
          'Google Analytics IDが空の場合、GAスクリプトは出力されないこと'
        );
      }
    });
  });

  describe('BaseHead.astro コード構造検証', () => {
    const baseHeadPath = resolve(process.cwd(), 'src/components/BaseHead.astro');

    it('AdSenseスクリプトがGoogle Analytics直後に配置されている', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');

      // Google Analytics ブロックの位置
      const gaIndex = content.indexOf('googleAnalyticsId &&');
      // AdSense ブロックの位置
      const adsenseIndex = content.indexOf('googleAdsenseId &&');

      assert.ok(gaIndex !== -1, 'Google Analyticsの条件分岐が存在する');
      assert.ok(adsenseIndex !== -1, 'AdSenseの条件分岐が存在する');
      assert.ok(
        adsenseIndex > gaIndex,
        'AdSenseスクリプトはGoogle Analytics直後に配置されている'
      );
    });

    it('AdSenseスクリプトURLが正しい形式である', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');

      // 正しいURL形式を確認
      assert.ok(
        content.includes('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'),
        'AdSenseスクリプトURLが正しい'
      );
      assert.ok(
        content.includes('?client=${googleAdsenseId}') ||
        content.includes('?client=`') ||
        content.includes('client=${googleAdsenseId}'),
        'パブリッシャーIDがclientパラメータとして渡される'
      );
    });

    it('AdSenseスクリプトに必要な属性がすべて含まれている', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');

      // AdSenseブロックを抽出
      const adsenseMatch = content.match(/\{googleAdsenseId\s*&&\s*\([\s\S]*?googlesyndication[\s\S]*?\)\}/);
      assert.ok(adsenseMatch, 'AdSenseブロックが存在する');

      const adsenseBlock = adsenseMatch[0];

      assert.ok(adsenseBlock.includes('async'), 'async属性が含まれている');
      assert.ok(adsenseBlock.includes('crossorigin'), 'crossorigin属性が含まれている');
      assert.ok(
        adsenseBlock.includes('anonymous') || adsenseBlock.includes('"anonymous"'),
        'crossorigin="anonymous"が設定されている'
      );
    });

    it('AdSenseスクリプトがFragmentでラップされている', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');

      // AdSenseブロックを抽出
      const adsenseMatch = content.match(/\{googleAdsenseId\s*&&\s*\([\s\S]*?googlesyndication[\s\S]*?\)\}/);
      assert.ok(adsenseMatch, 'AdSenseブロックが存在する');

      const adsenseBlock = adsenseMatch[0];

      assert.ok(
        adsenseBlock.includes('<Fragment>') && adsenseBlock.includes('</Fragment>'),
        'Fragmentでラップされている'
      );
    });
  });

  describe('設定ファイル構造検証', () => {
    it('site.config.ts の seo セクションにAdSense設定がある', () => {
      const configPath = resolve(process.cwd(), 'site.config.ts');
      const content = readFileSync(configPath, 'utf-8');

      // seoセクション内にgoogleAdsenseIdがあることを確認
      const seoMatch = content.match(/seo:\s*\{[\s\S]*?\}/);
      assert.ok(seoMatch, 'seoセクションが存在する');

      const seoSection = seoMatch[0];
      assert.ok(
        seoSection.includes('googleAdsenseId'),
        'seoセクション内にgoogleAdsenseIdがある'
      );
    });

    it('googleAdsenseId の形式説明コメントがある', () => {
      const configPath = resolve(process.cwd(), 'site.config.ts');
      const content = readFileSync(configPath, 'utf-8');

      assert.ok(
        content.includes('ca-pub-'),
        'パブリッシャーIDの形式（ca-pub-）が説明されている'
      );
    });
  });

  describe('型定義検証', () => {
    it('SeoConfig に googleAdsenseId が正しく定義されている', () => {
      const typesPath = resolve(process.cwd(), 'src/types/site-config.ts');
      const content = readFileSync(typesPath, 'utf-8');

      // SeoConfig インターフェースを抽出
      const seoConfigMatch = content.match(/interface SeoConfig\s*\{[\s\S]*?\n\}/);
      assert.ok(seoConfigMatch, 'SeoConfigインターフェースが存在する');

      const seoConfig = seoConfigMatch[0];

      assert.ok(
        seoConfig.includes('googleAdsenseId?:'),
        'googleAdsenseIdがオプショナルプロパティとして定義されている'
      );
      assert.ok(
        seoConfig.includes('googleAdsenseId?: string'),
        'googleAdsenseIdがstring型として定義されている'
      );
    });

    it('googleAdsenseId と googleAnalyticsId が同一パターンで定義されている', () => {
      const typesPath = resolve(process.cwd(), 'src/types/site-config.ts');
      const content = readFileSync(typesPath, 'utf-8');

      // 両方のプロパティが同じパターンで定義されていることを確認
      const gaPattern = /googleAnalyticsId\?\s*:\s*string/;
      const adsensePattern = /googleAdsenseId\?\s*:\s*string/;

      assert.ok(gaPattern.test(content), 'googleAnalyticsIdが定義されている');
      assert.ok(adsensePattern.test(content), 'googleAdsenseIdが定義されている');
    });
  });
});
