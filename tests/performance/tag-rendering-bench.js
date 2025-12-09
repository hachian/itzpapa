/**
 * TASK-301: タグレンダリングパフォーマンステスト
 * TDD Red Phase - 性能要件チェック
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { 
  measurePerformance, 
  measureMemory, 
  TestDataGenerator, 
  PERFORMANCE_THRESHOLDS,
  generateReport,
  printReport
} from './utils/benchmark-utils.js';

// TagBadgeレンダリングモック
function renderTagBadgeMock(tag, options = {}) {
  const { showCount = false } = options;
  const href = `/tags/${encodeURIComponent(tag.name.replace(/\//g, '-').toLowerCase())}`;
  
  let html = `<a href="${href}" class="tag" aria-label="${tag.name}タグの記事を表示" role="link">`;
  html += `<span class="tag-text">#${tag.name}</span>`;
  
  if (showCount && tag.count) {
    html += `<span class="tag-count">${tag.count}</span>`;
  }
  
  html += `</a>`;
  
  return html;
}

// TagListレンダリングモック
function renderTagListMock(tags, options = {}) {
  const { maxTags, layout = 'horizontal', showCount = false } = options;
  
  if (!tags || tags.length === 0) {
    return { html: '', isEmpty: true };
  }
  
  const displayTags = maxTags !== undefined ? tags.slice(0, maxTags) : tags;
  const hiddenCount = tags.length - displayTags.length;
  
  let html = `<div class="tag-list tag-list-${layout}" role="list" aria-label="タグ一覧">`;
  
  displayTags.forEach(tag => {
    html += renderTagBadgeMock(tag, { showCount });
  });
  
  if (hiddenCount > 0) {
    html += `<span class="tag-more" aria-label="他に${hiddenCount}個のタグがあります">+${hiddenCount}個</span>`;
  }
  
  html += `</div>`;
  
  return { html, isEmpty: false, hiddenCount };
}

// TagTreeレンダリングモック
function renderTagTreeMock(hierarchy, options = {}) {
  const { showCount = true, maxLevel = 5 } = options;
  
  if (!hierarchy || Object.keys(hierarchy).length === 0) {
    return { html: '<div class="tree-empty">階層タグがありません</div>', isEmpty: true };
  }
  
  function renderNode(tagName, data, level = 0) {
    if (level >= maxLevel) return '';
    
    const hasChildren = data.children && Object.keys(data.children).length > 0;
    let html = `<div class="tree-node ${hasChildren ? 'has-children' : 'leaf-node'}" data-level="${level}">`;
    html += `<div class="tree-node-content">`;
    
    if (hasChildren) {
      html += `<button class="tree-toggle" aria-expanded="false">`;
      html += `<svg class="toggle-icon"></svg>`;
      html += `</button>`;
    }
    
    html += renderTagBadgeMock(data.tag, { showCount });
    html += `</div>`;
    
    if (hasChildren) {
      html += `<div class="tree-children">`;
      Object.entries(data.children).forEach(([childName, childData]) => {
        html += renderNode(childName, childData, level + 1);
      });
      html += `</div>`;
    }
    
    html += `</div>`;
    return html;
  }
  
  let html = '<div class="tag-tree" role="tree">';
  Object.entries(hierarchy).forEach(([tagName, data]) => {
    html += renderNode(tagName, data);
  });
  html += '</div>';
  
  return { html, isEmpty: false };
}

// インラインタグ処理モック
function processInlineTagsMock(markdown) {
  const tags = [];
  const tagSet = new Set();
  const INLINE_TAG_PATTERN = /#([a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF][a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF/_-]*)/g;
  
  const html = markdown.replace(INLINE_TAG_PATTERN, (match, tagName) => {
    if (!tagSet.has(tagName)) {
      tagSet.add(tagName);
      tags.push(tagName);
    }
    
    const url = `/tags/${encodeURIComponent(tagName.replace(/\//g, '-').toLowerCase())}`;
    const ariaLabel = `${tagName}タグの記事を表示`;
    
    return `<a href="${url}" class="tag" aria-label="${ariaLabel}" role="link"><span class="tag-text">#${tagName}</span></a>`;
  });
  
  return { tags, html };
}

describe('TASK-301: タグレンダリングパフォーマンステスト', () => {
  
  describe('TC-301-001: TagBadgeレンダリング性能', () => {
    test('100個のTagBadgeが20ms以内にレンダリング', () => {
      const tags = TestDataGenerator.generateTags(100);
      
      const performance = measurePerformance(() => {
        tags.forEach(tag => renderTagBadgeMock(tag, { showCount: true }));
      }, 100);
      
      const report = generateReport('TagBadge 100個レンダリング', {
        avgTime: performance.avg,
        p95Time: performance.p95
      }, {
        avgTime: PERFORMANCE_THRESHOLDS.TAG_BADGE_RENDER,
        p95Time: PERFORMANCE_THRESHOLDS.TAG_BADGE_RENDER * 1.5
      });
      
      printReport(report);
      
      assert.strictEqual(performance.avg < PERFORMANCE_THRESHOLDS.TAG_BADGE_RENDER, true);
    });

    test('TagBadgeメモリ使用量が適切', () => {
      const tags = TestDataGenerator.generateTags(1000);
      
      const memoryResult = measureMemory(() => {
        return tags.map(tag => renderTagBadgeMock(tag, { showCount: true }));
      });
      
      console.log(`\n💾 TagBadgeメモリ使用量:`);
      console.log(`  ヒープ使用量: ${memoryResult.memoryDelta.heapUsed.toFixed(2)}MB`);
      console.log(`  総メモリ: ${memoryResult.memoryDelta.rss.toFixed(2)}MB`);
      
      assert.strictEqual(memoryResult.memoryDelta.heapUsed < PERFORMANCE_THRESHOLDS.TAG_DATA_MEMORY, true);
    });
  });

  describe('TC-301-002: TagListレンダリング性能', () => {
    test('50個のTagListが50ms以内にレンダリング', () => {
      const tags = TestDataGenerator.generateTags(50);
      
      const performance = measurePerformance(() => {
        renderTagListMock(tags, { layout: 'horizontal', showCount: true });
      }, 100);
      
      const report = generateReport('TagList 50個レンダリング', {
        avgTime: performance.avg,
        p95Time: performance.p95
      }, {
        avgTime: PERFORMANCE_THRESHOLDS.TAG_LIST_RENDER,
        p95Time: PERFORMANCE_THRESHOLDS.TAG_LIST_RENDER * 1.5
      });
      
      printReport(report);
      
      assert.strictEqual(performance.avg < PERFORMANCE_THRESHOLDS.TAG_LIST_RENDER, true);
    });

    test('maxTags制限処理が効率的', () => {
      const tags = TestDataGenerator.generateTags(1000);
      
      const withLimit = measurePerformance(() => {
        renderTagListMock(tags, { maxTags: 10 });
      }, 100);
      
      const withoutLimit = measurePerformance(() => {
        renderTagListMock(tags.slice(0, 10));
      }, 100);
      
      console.log(`\n⚡ TagList制限処理効果:`);
      console.log(`  制限あり(1000→10): ${withLimit.avg}ms`);
      console.log(`  制限なし(10): ${withoutLimit.avg}ms`);
      console.log(`  オーバーヘッド: ${((withLimit.avg / withoutLimit.avg) - 1) * 100}%`);
      
      // 制限処理のオーバーヘッドが50%以下であること
      assert.strictEqual((withLimit.avg / withoutLimit.avg) < 1.5, true);
    });
  });

  describe('TC-301-003: TagTreeレンダリング性能', () => {
    test('5階層TagTreeが100ms以内にレンダリング', () => {
      const hierarchy = TestDataGenerator.generateTagHierarchy(10, 5);
      
      const performance = measurePerformance(() => {
        renderTagTreeMock(hierarchy, { showCount: true, maxLevel: 5 });
      }, 50);
      
      const report = generateReport('TagTree 5階層レンダリング', {
        avgTime: performance.avg,
        p95Time: performance.p95
      }, {
        avgTime: PERFORMANCE_THRESHOLDS.TAG_TREE_RENDER,
        p95Time: PERFORMANCE_THRESHOLDS.TAG_TREE_RENDER * 1.5
      });
      
      printReport(report);
      
      assert.strictEqual(performance.avg < PERFORMANCE_THRESHOLDS.TAG_TREE_RENDER, true);
    });

    test('階層展開の計算量がO(n)', () => {
      const small = TestDataGenerator.generateTagHierarchy(5, 3);
      const large = TestDataGenerator.generateTagHierarchy(10, 3);
      
      const smallTime = measurePerformance(() => {
        renderTagTreeMock(small);
      }, 100);
      
      const largeTime = measurePerformance(() => {
        renderTagTreeMock(large);
      }, 100);
      
      const ratio = largeTime.avg / smallTime.avg;
      
      console.log(`\n📈 TagTree計算量チェック:`);
      console.log(`  5ノード: ${smallTime.avg}ms`);
      console.log(`  10ノード: ${largeTime.avg}ms`);
      console.log(`  スケーリング比: ${ratio.toFixed(2)}倍`);
      
      // 線形スケーリング：2倍のデータで3倍以上時間がかからない
      assert.strictEqual(ratio < 3, true);
    });
  });

  describe('TC-301-004: インラインタグ処理性能', () => {
    test('50個のインラインタグが30ms以内に処理', () => {
      const markdown = TestDataGenerator.generateMarkdownWithTags(50, 200);
      
      const performance = measurePerformance(() => {
        processInlineTagsMock(markdown);
      }, 100);
      
      const report = generateReport('インラインタグ 50個処理', {
        avgTime: performance.avg,
        p95Time: performance.p95
      }, {
        avgTime: PERFORMANCE_THRESHOLDS.INLINE_TAG_PROCESS,
        p95Time: PERFORMANCE_THRESHOLDS.INLINE_TAG_PROCESS * 1.5
      });
      
      printReport(report);
      
      assert.strictEqual(performance.avg < PERFORMANCE_THRESHOLDS.INLINE_TAG_PROCESS, true);
    });

    test('大量テキストでの正規表現性能', () => {
      const shortText = TestDataGenerator.generateMarkdownWithTags(10, 100);
      const longText = TestDataGenerator.generateMarkdownWithTags(20, 1000);
      
      const shortTime = measurePerformance(() => {
        processInlineTagsMock(shortText);
      }, 100);
      
      const longTime = measurePerformance(() => {
        processInlineTagsMock(longText);
      }, 100);
      
      const textRatio = longText.length / shortText.length;
      const timeRatio = longTime.avg / shortTime.avg;
      
      console.log(`\n🔍 正規表現スケーラビリティ:`);
      console.log(`  短いテキスト(${shortText.length}文字): ${shortTime.avg}ms`);
      console.log(`  長いテキスト(${longText.length}文字): ${longTime.avg}ms`);
      console.log(`  テキスト比: ${textRatio.toFixed(2)}倍`);
      console.log(`  時間比: ${timeRatio.toFixed(2)}倍`);
      
      // 正規表現が効率的：テキスト長に対して線形的な時間増加
      assert.strictEqual(timeRatio < textRatio * 1.5, true);
    });
  });
});

// テスト実行前の注意事項
console.log(`
=== TASK-301 パフォーマンステスト実行ガイド ===

このテストはタグシステム全体のレンダリング性能を測定します。

実行コマンド:
node test/performance/tag-rendering-bench.js

測定内容:
- TagBadge レンダリング速度（100個 < 20ms）
- TagList 表示性能（50個 < 50ms）
- TagTree 階層表示性能（5階層 < 100ms）
- インラインタグ 処理速度（50個 < 30ms）
- メモリ使用量と計算量のスケーラビリティ

期待される結果:
- すべての性能要件を満たす
- メモリリークがない
- 線形的なスケーラビリティ
`);