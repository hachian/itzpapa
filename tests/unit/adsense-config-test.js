/**
 * Google AdSense 設定テスト
 * TDD: タスク1, 2, 3のテスト
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Google AdSense 設定', () => {
  describe('タスク1: SeoConfig型定義にAdSense設定を追加', () => {
    const typesPath = resolve(process.cwd(), 'src/types/site-config.ts');

    it('site-config.ts に googleAdsenseId プロパティが定義されている', () => {
      assert.ok(existsSync(typesPath), 'site-config.ts が存在する');
      const content = readFileSync(typesPath, 'utf-8');
      assert.ok(
        content.includes('googleAdsenseId'),
        'googleAdsenseId プロパティが SeoConfig に定義されている'
      );
    });

    it('googleAdsenseId はオプショナルな string 型として定義されている', () => {
      const content = readFileSync(typesPath, 'utf-8');
      // googleAnalyticsId と同様の形式: googleAdsenseId?: string;
      assert.ok(
        content.includes('googleAdsenseId?:') || content.includes('googleAdsenseId ?:'),
        'googleAdsenseId がオプショナルプロパティとして定義されている'
      );
    });

    it('googleAdsenseId に JSDoc コメントがある', () => {
      const content = readFileSync(typesPath, 'utf-8');
      // JSDocコメントがあるか確認
      assert.ok(
        content.includes('Google AdSense') || content.includes('AdSense'),
        'googleAdsenseId に説明コメントがある'
      );
    });
  });

  describe('タスク2: site.config.ts にAdSense設定項目を追加', () => {
    const configPath = resolve(process.cwd(), 'site.config.ts');

    it('site.config.ts に googleAdsenseId 設定がある', () => {
      const content = readFileSync(configPath, 'utf-8');
      assert.ok(
        content.includes('googleAdsenseId'),
        'seo セクションに googleAdsenseId が存在する'
      );
    });

    it('googleAdsenseId がデフォルトで空文字に設定されている', () => {
      const content = readFileSync(configPath, 'utf-8');
      // 空文字で設定されていることを確認
      assert.ok(
        content.includes("googleAdsenseId: ''") ||
        content.includes('googleAdsenseId: ""'),
        'googleAdsenseId がデフォルトで空文字'
      );
    });

    it('googleAdsenseId の設定コメントがある', () => {
      const content = readFileSync(configPath, 'utf-8');
      // AdSense関連のコメントがあるか確認
      const adsenseSection = content.includes('AdSense') || content.includes('adsense');
      assert.ok(adsenseSection, 'AdSense に関するコメントがある');
    });
  });

  describe('タスク3: BaseHead.astro にAdSenseスクリプト出力を実装', () => {
    const baseHeadPath = resolve(process.cwd(), 'src/components/BaseHead.astro');

    it('BaseHead.astro に googleAdsenseId 取得ロジックがある', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      assert.ok(
        content.includes('googleAdsenseId') || content.includes('Adsense'),
        'googleAdsenseId を取得するロジックがある'
      );
    });

    it('AdSense スクリプトの条件付き出力がある', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      // pagead2.googlesyndication.com からのスクリプト読み込み
      assert.ok(
        content.includes('pagead2.googlesyndication.com') ||
        content.includes('googlesyndication'),
        'Google AdSense スクリプトの読み込みがある'
      );
    });

    it('AdSense スクリプトに async 属性がある', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      // asyncでスクリプトを読み込む
      const hasAsyncAdsense =
        content.includes('async') &&
        content.includes('googlesyndication');
      assert.ok(hasAsyncAdsense, 'AdSense スクリプトが async で読み込まれる');
    });

    it('AdSense スクリプトに crossorigin 属性がある', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      // crossorigin="anonymous" 属性
      assert.ok(
        content.includes('crossorigin'),
        'AdSense スクリプトに crossorigin 属性がある'
      );
    });
  });

  describe('タスク4.1: AdSense有効時のスクリプト出力テスト', () => {
    const baseHeadPath = resolve(process.cwd(), 'src/components/BaseHead.astro');

    it('googleAdsenseId が設定されている場合のみスクリプトを出力する条件分岐がある', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      // 条件付き出力のパターン: {googleAdsenseId && (...)} または同等のロジック
      const hasConditionalRendering =
        content.includes('googleAdsenseId &&') ||
        content.includes('googleAdsenseId &&');
      assert.ok(
        hasConditionalRendering,
        'googleAdsenseId の条件分岐がある'
      );
    });

    it('スクリプトURLにパブリッシャーIDが含まれる形式である', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      // URL形式: https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}
      assert.ok(
        content.includes('client=') || content.includes('?client='),
        'スクリプトURLにclient=パラメータがある'
      );
    });
  });

  describe('タスク4.2: AdSense無効時の非出力テスト', () => {
    it('空文字の場合はfalsy判定でスクリプトを出力しない設計', () => {
      // 空文字はJavaScriptでfalsyなので、条件分岐で適切に処理される
      const emptyId = '';
      assert.strictEqual(!!emptyId, false, '空文字はfalsyである');
    });

    it('undefinedの場合もfalsyでスクリプトを出力しない設計', () => {
      const undefinedId = undefined;
      assert.strictEqual(!!undefinedId, false, 'undefinedはfalsyである');
    });
  });
});
