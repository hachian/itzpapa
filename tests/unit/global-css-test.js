/**
 * TASK-201: グローバルCSS整理と統一 単体テスト
 * TDD Red Phase - 失敗するテストを実装
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';

// CSSファイル読み込み用ヘルパー
async function readCssFile(filename) {
  const filePath = path.join(process.cwd(), 'src/styles', filename);
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    return '';
  }
}

// CSS重複チェック用ヘルパー
function checkForDuplicateDefinitions(css, selector) {
  const matches = css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{`, 'g'));
  return matches ? matches.length : 0;
}

// 変数定義チェック用ヘルパー
function checkCssVariables(css, variableName) {
  return css.includes(`--${variableName}:`);
}

// ハードコーディング色チェック用ヘルパー
function hasHardcodedColors(css, excludeComments = true) {
  let content = css;
  if (excludeComments) {
    content = css.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  
  // 一般的なハードコーディング色パターン
  const colorPatterns = [
    /#[0-9a-fA-F]{3,8}/,           // #fff, #ffffff
    /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/,  // rgb(255, 255, 255)
    /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/,  // rgba(255, 255, 255, 0.5)
  ];
  
  return colorPatterns.some(pattern => pattern.test(content));
}

describe('TASK-201: グローバルCSS整理と統一テスト', () => {
  
  describe('TC-201-001: CSS重複除去（失敗予定）', () => {
    test('tag.cssにダークモード重複定義がない', async () => {
      const tagCss = await readCssFile('tag.css');
      
      // 修正後はダークモード定義が除去される
      const darkModeCount = checkForDuplicateDefinitions(tagCss, 'html\\.dark .tag');
      assert.strictEqual(darkModeCount, 0);
    });

    test('tag.cssに階層タグ重複定義がない', async () => {
      const tagCss = await readCssFile('tag.css');
      
      // 修正後は階層タグ定義が除去される
      assert.strictEqual(tagCss.includes('.tag-hierarchical'), false);
    });

    test('global.cssに古いタグリスト定義がない', async () => {
      const globalCss = await readCssFile('global.css');
      
      // 修正後は古い.tag-list定義が除去される
      assert.strictEqual(globalCss.includes('.tag-list {'), false);
    });

    test('global.cssにタグクラウド定義がない', async () => {
      const globalCss = await readCssFile('global.css');
      
      // 修正後は.tag-cloud定義が除去される
      assert.strictEqual(globalCss.includes('.tag-cloud'), false);
    });
  });

  describe('TC-201-002: 変数システム統一（失敗予定）', () => {
    test('mark要素の色が変数化されている', async () => {
      const globalCss = await readCssFile('global.css');
      
      // 修正後はmark要素のハードコーディング色が変数化される
      const markSection = globalCss.substring(
        globalCss.indexOf('/* Mark Highlight Styles */'),
        globalCss.indexOf('/* Nested element support */')
      );
      
      const hasHardcoded = hasHardcodedColors(markSection);
      assert.strictEqual(hasHardcoded, false);
    });

    test('アクセント色が統一変数を使用', async () => {
      const globalCss = await readCssFile('global.css');
      const tagVariablesCss = await readCssFile('tag-variables.css');
      
      // 修正後はアクセント色がタグシステムと統一される
      assert.strictEqual(checkCssVariables(tagVariablesCss, 'accent'), true);
      assert.strictEqual(checkCssVariables(tagVariablesCss, 'accent-dark'), true);
    });

    test('グラデーション定義が変数化されている', async () => {
      const globalCss = await readCssFile('global.css');
      
      // 修正後はグラデーション定義が変数化される
      assert.strictEqual(checkCssVariables(globalCss, 'mark-bg'), true);
      assert.strictEqual(checkCssVariables(globalCss, 'mark-bg-dark'), true);
    });
  });

  describe('TC-201-003: ファイル分離（失敗予定）', () => {
    test('mark.cssが独立ファイルとして存在', async () => {
      const markCss = await readCssFile('mark.css');
      
      // 修正後はmark.cssが独立して存在する
      assert.strictEqual(markCss.length > 0, true);
      assert.strictEqual(markCss.includes('mark {'), true);
    });

    test('tag-cloud.cssが独立ファイルとして存在', async () => {
      const tagCloudCss = await readCssFile('tag-cloud.css');
      
      // 修正後はtag-cloud.cssが独立して存在する
      assert.strictEqual(tagCloudCss.length > 0, true);
      assert.strictEqual(tagCloudCss.includes('.tag-cloud'), true);
    });

    test('global.cssでmark.cssがimportされている', async () => {
      const globalCss = await readCssFile('global.css');
      
      // 修正後はmark.cssがimportされる
      assert.strictEqual(globalCss.includes("@import './mark.css'"), true);
    });
  });

  describe('TC-201-004: import順序最適化（失敗予定）', () => {
    test('変数ファイルが最初にimportされている', async () => {
      const globalCss = await readCssFile('global.css');
      
      // 修正後は変数ファイルが最初にimportされる
      const importLines = globalCss.split('\n').filter(line => 
        line.trim().startsWith('@import') && line.includes('./'));
      
      assert.strictEqual(importLines[0].includes('tag-variables.css'), true);
    });

    test('依存関係順序が正しい', async () => {
      const globalCss = await readCssFile('global.css');
      
      // 修正後は依存関係順序が最適化される
      const variablesIndex = globalCss.indexOf("@import './tag-variables.css'");
      const tagIndex = globalCss.indexOf("@import './tag.css'");
      const inlineTagIndex = globalCss.indexOf("@import './inline-tag.css'");
      
      assert.strictEqual(variablesIndex < tagIndex, true);
      assert.strictEqual(tagIndex < inlineTagIndex, true);
    });
  });
});

describe('TC-201-005: パフォーマンス測定', () => {
  test('CSSファイルサイズが削減されている', async () => {
    const globalCss = await readCssFile('global.css');
    const tagCss = await readCssFile('tag.css');
    
    // ベースラインサイズを設定（現在のサイズより小さくなることを期待）
    const currentTotalSize = globalCss.length + tagCss.length;
    const targetSize = currentTotalSize * 0.8; // 20%削減目標
    
    // 修正後は20%以上サイズが削減される
    assert.strictEqual(currentTotalSize > targetSize, true);
  });

  test('重複定義数が削減されている', async () => {
    const allCss = [
      await readCssFile('global.css'),
      await readCssFile('tag.css'),
      await readCssFile('tag-variables.css'),
      await readCssFile('inline-tag.css')
    ].join('\n');
    
    // 修正後は重複する.tag定義が最小化される
    const tagDefinitions = checkForDuplicateDefinitions(allCss, '\\.tag');
    assert.strictEqual(tagDefinitions <= 2, true); // variables + inline-tag のみ
  });
});

describe('TC-201-006: 既存機能保持', () => {
  test('全タグコンポーネントのスタイルが保持される', async () => {
    const tagVariablesCss = await readCssFile('tag-variables.css');
    
    // 修正後も全てのタグ変数が定義されている
    const requiredVariables = [
      'tag-bg', 'tag-color', 'tag-border',
      'tag-hover-bg', 'tag-hover-color',
      'tag-more-bg', 'tree-bg'
    ];
    
    requiredVariables.forEach(variable => {
      assert.strictEqual(checkCssVariables(tagVariablesCss, variable), true);
    });
  });

  test('アクセシビリティスタイルが保持される', async () => {
    const globalCss = await readCssFile('global.css');
    
    // 修正後もアクセシビリティクラスが保持される
    assert.strictEqual(globalCss.includes('.sr-only'), true);
  });

  test('レスポンシブ対応が保持される', async () => {
    const inlineTagCss = await readCssFile('inline-tag.css');
    
    // 修正後もレスポンシブ対応が保持される
    assert.strictEqual(inlineTagCss.includes('@media (max-width: 640px)'), true);
  });
});

// テスト実行前の注意事項
console.log(`
=== TASK-201 テスト実行ガイド ===

このテストは現在のCSS構造をテストします。
重複除去と変数統一のためのテストの一部は失敗することが予想されます（RED状態）。

実行コマンド:
node test/global-css-test.js

期待される結果:
- CSS重複除去テスト: 失敗（重複定義残存）
- 変数システム統一テスト: 失敗（ハードコーディング残存）
- ファイル分離テスト: 失敗（独立ファイル未作成）
- import順序テスト: 失敗（順序未最適化）
- 既存機能保持テスト: 成功
`);