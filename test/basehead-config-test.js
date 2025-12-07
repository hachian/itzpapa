/**
 * BaseHead コンポーネントの設定駆動化テスト
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('BaseHead コンポーネント設定駆動化', () => {
  const baseHeadPath = resolve(process.cwd(), 'src/components/BaseHead.astro');

  describe('設定ファイルからの読み込み', () => {
    it('siteConfig をインポートしている', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      assert.ok(
        content.includes('siteConfig') || content.includes('site.config'),
        'siteConfig をインポートしている'
      );
    });

    it('theme 設定を使用している', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      assert.ok(
        content.includes('theme') || content.includes('primaryHue'),
        'theme 設定を使用している'
      );
    });
  });

  describe('テーマカラー適用', () => {
    it('primaryHue を CSS 変数として出力している', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      assert.ok(
        content.includes('--primary-hue'),
        '--primary-hue CSS 変数を出力している'
      );
    });

    it('style タグで CSS 変数を設定している', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      assert.ok(
        content.includes('<style') && content.includes('--primary-hue'),
        'style タグで CSS 変数を設定している'
      );
    });
  });

  describe('範囲外の値のフォールバック', () => {
    it('primaryHue の検証ロジックがある', () => {
      const content = readFileSync(baseHeadPath, 'utf-8');
      // 0-360 の範囲チェックまたはデフォルト値 293 の参照がある
      assert.ok(
        content.includes('293') || content.includes('0') && content.includes('360'),
        'primaryHue の検証またはデフォルト値がある'
      );
    });
  });
});
