/**
 * TASK-301: パフォーマンステストとベンチマーク
 * 共通ベンチマークユーティリティ
 */

/**
 * 実行時間を測定するユーティリティ
 * @param {Function} fn - 測定対象の関数
 * @param {number} iterations - 実行回数（デフォルト: 1000）
 * @returns {Object} 測定結果
 */
export function measurePerformance(fn, iterations = 1000) {
  const times = [];
  
  // ウォームアップ実行
  for (let i = 0; i < 10; i++) {
    fn();
  }
  
  // 実際の測定
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  // 統計計算
  const sorted = times.sort((a, b) => a - b);
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  
  return {
    avg: Number(avg.toFixed(3)),
    min: Number(min.toFixed(3)), 
    max: Number(max.toFixed(3)),
    median: Number(median.toFixed(3)),
    p95: Number(p95.toFixed(3)),
    p99: Number(p99.toFixed(3)),
    iterations,
    totalTime: Number((times.reduce((sum, time) => sum + time, 0)).toFixed(3))
  };
}

/**
 * メモリ使用量を測定するユーティリティ
 * @param {Function} fn - 測定対象の関数
 * @returns {Object} メモリ使用量情報
 */
export function measureMemory(fn) {
  // ガベージコレクション強制実行（Node.js環境）
  if (global.gc) {
    global.gc();
  }
  
  const beforeMemory = process.memoryUsage();
  const result = fn();
  const afterMemory = process.memoryUsage();
  
  // ガベージコレクション再実行
  if (global.gc) {
    global.gc();
  }
  
  const finalMemory = process.memoryUsage();
  
  return {
    result,
    memoryDelta: {
      heapUsed: (afterMemory.heapUsed - beforeMemory.heapUsed) / 1024 / 1024, // MB
      heapTotal: (afterMemory.heapTotal - beforeMemory.heapTotal) / 1024 / 1024,
      external: (afterMemory.external - beforeMemory.external) / 1024 / 1024,
      rss: (afterMemory.rss - beforeMemory.rss) / 1024 / 1024
    },
    memoryAfterGC: {
      heapUsed: finalMemory.heapUsed / 1024 / 1024,
      heapTotal: finalMemory.heapTotal / 1024 / 1024,
      external: finalMemory.external / 1024 / 1024,
      rss: finalMemory.rss / 1024 / 1024
    }
  };
}

/**
 * テストデータ生成器
 */
export class TestDataGenerator {
  /**
   * タグデータを生成
   * @param {number} count - 生成するタグ数
   * @param {Object} options - 生成オプション
   * @returns {Array} タグデータ配列
   */
  static generateTags(count, options = {}) {
    const {
      hierarchical = 0.3,  // 階層タグの比率
      maxLevels = 3,       // 最大階層レベル
      withCounts = true    // カウント情報含む
    } = options;
    
    const tags = [];
    const categories = ['tech', 'programming', 'web', 'mobile', 'backend', 'frontend'];
    const subcategories = ['javascript', 'typescript', 'react', 'vue', 'angular', 'node'];
    
    for (let i = 0; i < count; i++) {
      let tagName;
      
      if (Math.random() < hierarchical && maxLevels > 1) {
        // 階層タグ生成
        const levels = Math.floor(Math.random() * (maxLevels - 1)) + 2;
        const parts = [];
        
        parts.push(categories[Math.floor(Math.random() * categories.length)]);
        for (let level = 1; level < levels; level++) {
          parts.push(subcategories[Math.floor(Math.random() * subcategories.length)]);
        }
        
        tagName = parts.join('/');
      } else {
        // 単一タグ生成
        tagName = `tag${i.toString().padStart(3, '0')}`;
      }
      
      const tag = { name: tagName };
      
      if (withCounts) {
        tag.count = Math.floor(Math.random() * 50) + 1;
      }
      
      tags.push(tag);
    }
    
    return tags;
  }

  /**
   * 階層タグツリーデータを生成
   * @param {number} rootCount - ルートタグ数
   * @param {number} maxDepth - 最大深度
   * @returns {Object} 階層データ
   */
  static generateTagHierarchy(rootCount, maxDepth = 3) {
    const hierarchy = {};
    
    for (let i = 0; i < rootCount; i++) {
      const rootName = `root${i}`;
      hierarchy[rootName] = {
        tag: { name: rootName, count: Math.floor(Math.random() * 20) + 1 },
        children: this._generateChildren(rootName, maxDepth - 1, 0.7)
      };
    }
    
    return hierarchy;
  }

  static _generateChildren(parentName, remainingDepth, probability) {
    if (remainingDepth <= 0 || Math.random() > probability) {
      return {};
    }
    
    const children = {};
    const childCount = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < childCount; i++) {
      const childName = `${parentName}/child${i}`;
      children[childName] = {
        tag: { name: childName, count: Math.floor(Math.random() * 10) + 1 },
        children: this._generateChildren(childName, remainingDepth - 1, probability * 0.6)
      };
    }
    
    return children;
  }

  /**
   * Markdownテキストを生成（インラインタグ付き）
   * @param {number} tagCount - インラインタグ数
   * @param {number} textLength - テキスト長（単語数）
   * @returns {string} Markdownテキスト
   */
  static generateMarkdownWithTags(tagCount, textLength = 500) {
    const words = [
      'これは', 'テスト', 'データ', 'です', 'パフォーマンス', '測定', 'のため', 
      'の', 'サンプル', 'テキスト', '記事', 'コンテンツ', '実装', '開発'
    ];
    
    const tags = this.generateTags(tagCount, { hierarchical: 0.2 });
    const text = [];
    
    for (let i = 0; i < textLength; i++) {
      if (i > 0 && Math.random() < (tagCount / textLength)) {
        // ランダムな位置にタグを挿入
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        text.push(`#${randomTag.name}`);
      }
      
      text.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    return text.join(' ');
  }
}

/**
 * パフォーマンス閾値定義
 */
export const PERFORMANCE_THRESHOLDS = {
  // レンダリング時間 (ms)
  TAG_BADGE_RENDER: 20,        // 100個
  TAG_LIST_RENDER: 50,         // 50個
  TAG_TREE_RENDER: 100,        // 5階層
  INLINE_TAG_PROCESS: 30,      // 50個
  
  // CSS読み込み時間 (ms)
  CSS_INITIAL_PAINT: 500,
  CSS_FULLY_STYLED: 800,
  
  // メモリ使用量 (MB)
  TAG_DATA_MEMORY: 2,          // 1000個
  DOM_MEMORY: 5,               // 表示状態
  
  // バンドルサイズ (KB)
  CSS_BUNDLE_SIZE: 50,         // 統合後目標
  CSS_REDUCTION_RATIO: 0.8     // 20%削減目標
};

/**
 * 結果レポート生成
 * @param {string} testName - テスト名
 * @param {Object} results - 測定結果
 * @param {Object} thresholds - 閾値
 * @returns {Object} レポートデータ
 */
export function generateReport(testName, results, thresholds) {
  const report = {
    testName,
    timestamp: new Date().toISOString(),
    results,
    thresholds,
    status: 'passed',
    violations: []
  };
  
  // 閾値チェック
  Object.entries(thresholds).forEach(([key, threshold]) => {
    const actual = results[key];
    if (actual !== undefined && actual > threshold) {
      report.violations.push({
        metric: key,
        actual,
        threshold,
        ratio: (actual / threshold).toFixed(2)
      });
      report.status = 'failed';
    }
  });
  
  return report;
}

/**
 * レポート出力
 * @param {Object} report - レポートデータ
 */
export function printReport(report) {
  console.log(`\n=== ${report.testName} パフォーマンスレポート ===`);
  console.log(`実行時刻: ${report.timestamp}`);
  console.log(`ステータス: ${report.status === 'passed' ? '✅ 合格' : '❌ 不合格'}`);
  
  if (report.violations.length > 0) {
    console.log(`\n⚠️  閾値違反 (${report.violations.length}件):`);
    report.violations.forEach(v => {
      console.log(`  ${v.metric}: ${v.actual} > ${v.threshold} (${v.ratio}倍)`);
    });
  }
  
  console.log('\n📊 測定結果:');
  Object.entries(report.results).forEach(([key, value]) => {
    const threshold = report.thresholds[key];
    const status = threshold && value > threshold ? '❌' : '✅';
    console.log(`  ${key}: ${value} ${threshold ? `(閾値: ${threshold})` : ''} ${status}`);
  });
}