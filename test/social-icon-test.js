/**
 * SocialIcon コンポーネントのテスト
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('SocialIcon コンポーネント', () => {
  const componentPath = resolve(process.cwd(), 'src/components/SocialIcon.astro');

  describe('ファイルの存在確認', () => {
    it('SocialIcon.astro ファイルが存在する', () => {
      assert.ok(existsSync(componentPath), 'src/components/SocialIcon.astro が存在する');
    });
  });

  describe('コンポーネントの内容検証', () => {
    it('Props インターフェースが定義されている', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(
        content.includes('interface Props') || content.includes('type Props'),
        'Props が定義されている'
      );
    });

    it('type プロパティが定義されている', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('type:'), 'type プロパティが存在する');
    });

    it('size プロパティが定義されている', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('size'), 'size プロパティが存在する');
    });

    it('すべての SNS タイプの SVG アイコンが含まれている', () => {
      const content = readFileSync(componentPath, 'utf-8');
      const requiredTypes = ['github', 'twitter', 'youtube', 'bluesky', 'instagram', 'linkedin', 'mastodon', 'threads'];

      for (const type of requiredTypes) {
        assert.ok(
          content.toLowerCase().includes(type),
          `${type} のアイコンが含まれている`
        );
      }
    });

    it('SVG 要素が含まれている', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('<svg'), 'SVG 要素が含まれている');
    });

    it('currentColor を使用している', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('currentColor'), 'currentColor を使用している');
    });

    it('aria-hidden 属性が設定されている', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('aria-hidden'), 'aria-hidden 属性が設定されている');
    });
  });
});
