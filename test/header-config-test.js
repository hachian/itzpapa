/**
 * Header コンポーネントの設定駆動化テスト
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Header コンポーネント設定駆動化', () => {
  const headerPath = resolve(process.cwd(), 'src/components/Header.astro');

  describe('設定ファイルからの読み込み', () => {
    it('siteConfig をインポートしている', () => {
      const content = readFileSync(headerPath, 'utf-8');
      assert.ok(
        content.includes('siteConfig') || content.includes('site.config'),
        'siteConfig をインポートしている'
      );
    });

    it('navigation 設定を使用している', () => {
      const content = readFileSync(headerPath, 'utf-8');
      assert.ok(
        content.includes('navigation') || content.includes('siteConfig.navigation'),
        'navigation 設定を使用している'
      );
    });
  });

  describe('動的ナビゲーション生成', () => {
    it('ナビゲーション項目をループで生成している', () => {
      const content = readFileSync(headerPath, 'utf-8');
      // .map() または {#each} などのループ処理が含まれている
      assert.ok(
        content.includes('.map(') || content.includes('{#each'),
        'ナビゲーション項目を動的に生成している'
      );
    });

    it('label と href を使用している', () => {
      const content = readFileSync(headerPath, 'utf-8');
      assert.ok(content.includes('label'), 'label を使用している');
      assert.ok(content.includes('href'), 'href を使用している');
    });
  });

  describe('外部リンク対応', () => {
    it('外部リンク判定ロジックが含まれている', () => {
      const content = readFileSync(headerPath, 'utf-8');
      // http または https で始まるリンクの判定
      assert.ok(
        content.includes('http') || content.includes('startsWith'),
        '外部リンク判定ロジックが含まれている'
      );
    });

    it('target="_blank" の設定が含まれている', () => {
      const content = readFileSync(headerPath, 'utf-8');
      assert.ok(
        content.includes('target') && content.includes('_blank'),
        'target="_blank" の設定が含まれている'
      );
    });

    it('rel="noopener noreferrer" の設定が含まれている', () => {
      const content = readFileSync(headerPath, 'utf-8');
      assert.ok(
        content.includes('noopener') || content.includes('noreferrer'),
        'セキュリティ属性が含まれている'
      );
    });
  });
});
