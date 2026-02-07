import { describe, test } from 'node:test';
import assert from 'node:assert';
import { remark } from 'remark';
import {
  generateTagUrl,
  processInlineTags,
  remarkInlineTags
} from '../../src/utils/tag/inline-tags.ts';

// ヘルパー: remark-inline-tagsを使用してMarkdownを処理
async function processToAst(markdown) {
  const processor = remark().use(remarkInlineTags);
  return processor.runSync(processor.parse(markdown));
}

// ヘルパー: AST内のHTMLノードを検索
function findHtmlNodes(ast) {
  const results = [];
  function walk(node) {
    if (node.type === 'html') {
      results.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }
  walk(ast);
  return results;
}

describe('インラインタグユーティリティ', () => {

  describe('generateTagUrl', () => {
    test('基本的なタグURLを生成する', () => {
      const url = generateTagUrl('test');
      assert.strictEqual(url, '/tags/test/');
    });

    test('階層タグURLを生成する（/を保持）', () => {
      const url = generateTagUrl('parent/child');
      assert.strictEqual(url, '/tags/parent/child/');
    });

    test('深くネストされた階層タグURLを生成する', () => {
      const url = generateTagUrl('a/b/c/d');
      assert.strictEqual(url, '/tags/a/b/c/d/');
    });

    test('URIコンポーネントをエンコードする', () => {
      const url = generateTagUrl('日本語');
      // encodeURIComponent('日本語') -> %E6%97%A5%E6%9C%AC%E8%AA%9E
      assert.strictEqual(url, '/tags/%E6%97%A5%E6%9C%AC%E8%AA%9E/');
    });

    test('混合文字を処理する', () => {
      const url = generateTagUrl('tag with space');
      // encodeURIComponent('tag with space') -> tag%20with%20space
      // スペースはそのままエンコードされる
      assert.strictEqual(url, '/tags/tag%20with%20space/');
    });

    test('日本語を含む階層タグを正しくエンコードする', () => {
      const url = generateTagUrl('親/子');
      // 各部分が個別にエンコードされる
      const parent = encodeURIComponent('親');
      const child = encodeURIComponent('子');
      assert.strictEqual(url, `/tags/${parent}/${child}/`);
    });
  });

  describe('processInlineTags', () => {
    test('単一のタグをリンクに置換する', () => {
      const input = 'Check out #astro';
      const { html, tags } = processInlineTags(input);

      assert.strictEqual(tags.length, 1);
      assert.strictEqual(tags[0], 'astro');
      assert(html.includes('<a href="/tags/astro/"'));
      assert(html.includes('class="tag"'));
      assert(html.includes('#astro'));
    });

    test('複数のタグを置換する', () => {
      const input = '#astro is awesome with #typescript';
      const { html, tags } = processInlineTags(input);

      assert.strictEqual(tags.length, 2);
      assert.deepStrictEqual(tags, ['astro', 'typescript']);
      assert(html.includes('/tags/astro/'));
      assert(html.includes('/tags/typescript/'));
    });

    test('階層タグを処理する', () => {
      const input = '#dev/web/astro';
      const { html, tags } = processInlineTags(input);

      assert.strictEqual(tags.length, 1);
      assert.strictEqual(tags[0], 'dev/web/astro');
      assert(html.includes('/tags/dev/web/astro/'));
    });

    test('tags配列から重複を除去するが、全ての出現箇所をリンク化する', () => {
      const input = '#tag and #tag again';
      const { html, tags } = processInlineTags(input);

      assert.strictEqual(tags.length, 1);
      assert.strictEqual(tags[0], 'tag');

      // 両方の出現箇所が置換されるべき
      const matches = html.match(/\/tags\/tag\//g);
      assert.strictEqual(matches.length, 2);
    });

    test('無効なタグ（数字のみ）を無視する', () => {
      const input = '#123 is not a tag';
      const { html, tags } = processInlineTags(input);

      assert.strictEqual(tags.length, 0);
      assert.strictEqual(html, input);
    });

    test('無効なタグ（ハイフンで始まる）を無視する', () => {
      const input = '#-invalid tag';
      const { html, tags } = processInlineTags(input);

      assert.strictEqual(tags.length, 0);
      assert.strictEqual(html, input);
    });

    test('無効なタグ（連続するスラッシュ）を無視する', () => {
      const input = '#invalid//tag';
      const { html, tags } = processInlineTags(input);

      assert.strictEqual(tags.length, 0);
      assert.strictEqual(html, input);
    });

    test('日本語タグを処理する', () => {
      const input = '#日本語タグ';
      const { html, tags } = processInlineTags(input);

      assert.strictEqual(tags.length, 1);
      assert.strictEqual(tags[0], '日本語タグ');
      assert(html.includes('%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%82%BF%E3%82%B0'));
    });

    test('カスタムbaseUrlを使用する（現状の実装では無視されることを確認）', () => {
      // processInlineTagsは第2引数としてbaseUrlを受け取るが、内部で使用するgenerateTagUrlは
      // ハードコードされたパスを返すため、引数は無視される。
      // 将来的な修正の可能性を考慮しつつ、現在の挙動を確認する。

      const input = '#tag';
      const { html } = processInlineTags(input, '/categories/');
      // 現在の実装では第2引数は無視されるため、/tags/tag/を期待する
      assert(html.includes('/tags/tag/'));
    });
  });

  describe('remarkInlineTags Plugin', () => {
    test('タグを含むテキストノードをHTMLノードに変換する', () => {
      const input = 'Some text with #tag inside.';
      // テストのヘルパー関数は非同期だが、remarkInlineTags自体は同期的動作もサポートするため
      // processToAstは非同期関数として定義されている
      return processToAst(input).then(ast => {
        const htmlNodes = findHtmlNodes(ast);
        assert.strictEqual(htmlNodes.length, 1);
        assert(htmlNodes[0].value.includes('<a href="/tags/tag/"'));
      });
    });

    test('1つのパラグラフ内の複数のタグを処理する', () => {
      const input = '#tag1 and #tag2';
      return processToAst(input).then(ast => {
        const htmlNodes = findHtmlNodes(ast);
        assert.strictEqual(htmlNodes.length, 1);
        assert(htmlNodes[0].value.includes('tag1'));
        assert(htmlNodes[0].value.includes('tag2'));
      });
    });

    test('タグを含まないテキストには影響しない', () => {
      const input = 'Just plain text';
      return processToAst(input).then(ast => {
        const htmlNodes = findHtmlNodes(ast);
        assert.strictEqual(htmlNodes.length, 0);
      });
    });
  });
});
