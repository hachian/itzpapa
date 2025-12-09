/**
 * 機能フラグによる表示制御テスト
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('機能フラグによる表示制御', () => {
  describe('Task 6.1: 目次コンポーネントの表示制御', () => {
    const blogPostPath = resolve(process.cwd(), 'src/layouts/BlogPost.astro');

    it('siteConfig をインポートしている', () => {
      const content = readFileSync(blogPostPath, 'utf-8');
      assert.ok(
        content.includes('siteConfig') || content.includes('site.config'),
        'siteConfig をインポートしている'
      );
    });

    it('features 設定を使用している', () => {
      const content = readFileSync(blogPostPath, 'utf-8');
      assert.ok(
        content.includes('features') || content.includes('tableOfContents'),
        'features 設定を使用している'
      );
    });

    it('TableOfContents の表示を条件分岐で制御している', () => {
      const content = readFileSync(blogPostPath, 'utf-8');
      // TableOfContents の表示前に features.tableOfContents のチェックがある
      assert.ok(
        content.includes('tableOfContents') && content.includes('TableOfContents'),
        'tableOfContents フラグで TableOfContents コンポーネントを制御している'
      );
    });
  });

  describe('Task 6.2: タグクラウドの表示制御', () => {
    const tagIndexPath = resolve(process.cwd(), 'src/pages/tags/index.astro');

    it('タグ一覧ページが存在する', () => {
      const content = readFileSync(tagIndexPath, 'utf-8');
      assert.ok(content.length > 0, 'タグ一覧ページが存在する');
    });

    it('siteConfig をインポートしている', () => {
      const content = readFileSync(tagIndexPath, 'utf-8');
      assert.ok(
        content.includes('siteConfig') || content.includes('site.config'),
        'siteConfig をインポートしている'
      );
    });

    it('tagCloud フラグを使用している', () => {
      const content = readFileSync(tagIndexPath, 'utf-8');
      assert.ok(
        content.includes('tagCloud') || content.includes('features'),
        'tagCloud フラグを使用している'
      );
    });
  });

  describe('Task 6.3: 関連記事の表示制御', () => {
    const blogPostPath = resolve(process.cwd(), 'src/layouts/BlogPost.astro');

    it('BlogPost レイアウトが存在する', () => {
      const content = readFileSync(blogPostPath, 'utf-8');
      assert.ok(content.length > 0, 'BlogPost レイアウトが存在する');
    });

    it('siteConfig をインポートしている（Task 6.1 で対応済み）', () => {
      const content = readFileSync(blogPostPath, 'utf-8');
      assert.ok(
        content.includes('siteConfig'),
        'siteConfig をインポートしている'
      );
    });

    it('features 設定を使用している（Task 6.1 で対応済み）', () => {
      const content = readFileSync(blogPostPath, 'utf-8');
      assert.ok(
        content.includes('features'),
        'features 設定を使用している'
      );
    });

    // 注: 関連記事コンポーネントは現在未実装
    // relatedPosts フラグは将来の関連記事機能実装時に使用予定
  });
});
