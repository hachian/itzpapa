/**
 * Footer コンポーネントの設定駆動化テスト
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Footer コンポーネント設定駆動化', () => {
  const footerPath = resolve(process.cwd(), 'src/components/Footer.astro');

  describe('設定ファイルからの読み込み', () => {
    it('siteConfig をインポートしている', () => {
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(
        content.includes('siteConfig') || content.includes('site.config'),
        'siteConfig をインポートしている'
      );
    });

    it('footer 設定を使用している', () => {
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(
        content.includes('footer') || content.includes('siteConfig.footer'),
        'footer 設定を使用している'
      );
    });

    it('navigation 設定を使用している', () => {
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(
        content.includes('navigation'),
        'navigation 設定を使用している'
      );
    });
  });

  describe('著作権表示', () => {
    it('startYear を使用した年表示ロジックがある', () => {
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(
        content.includes('startYear'),
        'startYear を使用している'
      );
    });

    it('copyrightText を使用している', () => {
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(
        content.includes('copyrightText'),
        'copyrightText を使用している'
      );
    });
  });

  describe('SNS リンク', () => {
    it('social 設定を使用している', () => {
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(
        content.includes('social'),
        'social 設定を使用している'
      );
    });

    it('SocialIcon コンポーネントをインポートしている', () => {
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(
        content.includes('SocialIcon'),
        'SocialIcon コンポーネントをインポートしている'
      );
    });
  });

  describe('動的生成', () => {
    it('ナビゲーション項目をループで生成している', () => {
      const content = readFileSync(footerPath, 'utf-8');
      assert.ok(
        content.includes('.map('),
        'ナビゲーション項目を動的に生成している'
      );
    });
  });
});
