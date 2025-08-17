# TASK-205: 記事内タグ表示統合 - テストケース

## 🧪 テスト戦略

### テストタイプ
- **単体テスト**: remarkプラグインのインラインタグ処理
- **コンポーネントテスト**: TagList表示とレンダリング  
- **統合テスト**: 記事ページでの統合動作
- **E2Eテスト**: ユーザーフローの確認

## 📝 単体テスト

### TC-1: インラインタグ抽出テスト

**テスト対象**: remarkプラグインのタグ抽出機能

#### TC-1.1: 単純タグの抽出
```javascript
describe('インラインタグ抽出', () => {
  test('単純タグを正しく抽出する', () => {
    const markdown = 'この記事では #javascript を使います。';
    const result = extractInlineTags(markdown);
    expect(result.tags).toContain('javascript');
    expect(result.html).toContain('<a href="/tags/javascript">#javascript</a>');
  });
});
```

#### TC-1.2: 階層タグの抽出
```javascript
test('階層タグを正しく抽出する', () => {
  const markdown = '#tech/web/frontend の技術について';
  const result = extractInlineTags(markdown);
  expect(result.tags).toContain('tech/web/frontend');
  expect(result.html).toContain('<a href="/tags/tech-web-frontend">#tech/web/frontend</a>');
});
```

#### TC-1.3: 日本語タグの抽出
```javascript
test('日本語タグを正しく抽出する', () => {
  const markdown = '#日本語タグ のテストです。';
  const result = extractInlineTags(markdown);
  expect(result.tags).toContain('日本語タグ');
  expect(result.html).toContain('#日本語タグ');
});
```

#### TC-1.4: 複数タグの抽出
```javascript
test('複数のタグを正しく抽出する', () => {
  const markdown = '#javascript と #react と #astro を比較';
  const result = extractInlineTags(markdown);
  expect(result.tags).toHaveLength(3);
  expect(result.tags).toContain('javascript');
  expect(result.tags).toContain('react');
  expect(result.tags).toContain('astro');
});
```

#### TC-1.5: エッジケース
```javascript
test('エッジケースを適切に処理する', () => {
  // 無効なタグパターン
  const invalidCases = [
    '# タグ', // スペース直後
    '#', // タグ名なし
    '##タグ', // 二重ハッシュ
    '#123', // 数字のみ
  ];
  
  invalidCases.forEach(markdown => {
    const result = extractInlineTags(markdown);
    expect(result.tags).toHaveLength(0);
  });
});
```

### TC-2: タグリンク生成テスト

#### TC-2.1: URL生成テスト
```javascript
describe('タグリンク生成', () => {
  test('単純タグのURL生成', () => {
    const url = generateTagUrl('javascript');
    expect(url).toBe('/tags/javascript');
  });
  
  test('階層タグのURL生成', () => {
    const url = generateTagUrl('tech/web/frontend');
    expect(url).toBe('/tags/tech-web-frontend');
  });
  
  test('日本語タグのURL生成', () => {
    const url = generateTagUrl('日本語タグ');
    expect(url).toBe('/tags/%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%82%BF%E3%82%B0');
  });
});
```

#### TC-2.2: HTMLレンダリングテスト
```javascript
describe('HTMLレンダリング', () => {
  test('タグリンクの適切なHTML生成', () => {
    const html = renderTagLink('javascript', 3);
    expect(html).toContain('href="/tags/javascript"');
    expect(html).toContain('class="inline-tag"');
    expect(html).toContain('#javascript');
    expect(html).toContain('aria-label');
  });
});
```

## 🎨 コンポーネントテスト

### TC-3: BlogPost レイアウトテスト

#### TC-3.1: タグセクション表示テスト
```javascript
describe('BlogPost タグセクション', () => {
  test('フロントマターのタグが表示される', () => {
    const mockPost = {
      data: {
        title: 'テスト記事',
        tags: ['javascript', 'react', 'astro']
      }
    };
    
    render(<BlogPost post={mockPost} />);
    
    expect(screen.getByText('この記事のタグ')).toBeInTheDocument();
    expect(screen.getByText('#javascript')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#astro')).toBeInTheDocument();
  });
  
  test('タグがない場合は表示されない', () => {
    const mockPost = {
      data: {
        title: 'タグなし記事',
        tags: []
      }
    };
    
    render(<BlogPost post={mockPost} />);
    
    expect(screen.queryByText('この記事のタグ')).not.toBeInTheDocument();
  });
});
```

#### TC-3.2: タグリンク動作テスト
```javascript
test('タグクリックで正しいページに遷移する', () => {
  const mockPost = {
    data: {
      tags: ['javascript']
    }
  };
  
  render(<BlogPost post={mockPost} />);
  
  const tagLink = screen.getByRole('link', { name: /javascript/i });
  expect(tagLink).toHaveAttribute('href', '/tags/javascript');
});
```

### TC-4: レスポンシブテスト

#### TC-4.1: モバイル表示テスト
```javascript
describe('レスポンシブ表示', () => {
  test('モバイルで適切にレイアウトされる', () => {
    // 640px以下でのテスト
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(max-width: 640px)',
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    
    render(<TagSection tags={['javascript', 'react']} />);
    
    const tagContainer = screen.getByTestId('tag-container');
    expect(tagContainer).toHaveClass('mobile-layout');
  });
});
```

## 🔗 統合テスト

### TC-5: 記事ページ統合テスト

#### TC-5.1: フルページレンダリングテスト
```javascript
describe('記事ページ統合', () => {
  test('記事とタグが正しく統合表示される', async () => {
    // モックの記事データ
    const mockPost = {
      slug: 'test-article',
      data: {
        title: 'テスト記事',
        tags: ['javascript', 'tech/web/frontend'],
        content: 'この記事では #react について説明します。'
      }
    };
    
    // ページレンダリング
    const { container } = render(<BlogPostPage post={mockPost} />);
    
    // フロントマターのタグ
    expect(screen.getByText('#javascript')).toBeInTheDocument();
    expect(screen.getByText('#tech/web/frontend')).toBeInTheDocument();
    
    // インラインタグ
    expect(screen.getByText('#react')).toBeInTheDocument();
    
    // リンクの確認
    expect(screen.getByRole('link', { name: /javascript/i }))
      .toHaveAttribute('href', '/tags/javascript');
  });
});
```

#### TC-5.2: タグ統計情報統合テスト
```javascript
test('タグ使用回数が正しく表示される', () => {
  // TagServiceのモック
  jest.mock('../utils/tag/service', () => ({
    TagService: jest.fn().mockImplementation(() => ({
      getTag: jest.fn((tagName) => ({
        name: tagName,
        count: tagName === 'javascript' ? 5 : 1
      }))
    }))
  }));
  
  render(<BlogPostPage post={mockPost} />);
  
  expect(screen.getByText('(5)')).toBeInTheDocument(); // javascript
});
```

## 🎯 E2Eテスト（Playwright）

### TC-6: ユーザーフローテスト

#### TC-6.1: 記事からタグページへの遷移
```javascript
test('記事からタグページへの完全フロー', async ({ page }) => {
  // テスト記事にアクセス
  await page.goto('/blog/javascript-tutorial');
  
  // 記事末尾のタグをクリック
  await page.click('a[href="/tags/javascript"]');
  
  // タグページが表示される
  await expect(page).toHaveURL('/tags/javascript');
  await expect(page.locator('h1')).toContainText('javascript');
  
  // 関連記事が表示される
  await expect(page.locator('.post-list')).toBeVisible();
});
```

#### TC-6.2: インラインタグクリックフロー
```javascript
test('本文中のインラインタグクリック', async ({ page }) => {
  await page.goto('/blog/react-hooks');
  
  // 本文中のインラインタグをクリック
  await page.click('.post-content a[href="/tags/react"]');
  
  // タグページに遷移
  await expect(page).toHaveURL('/tags/react');
});
```

### TC-7: アクセシビリティテスト

#### TC-7.1: キーボードナビゲーション
```javascript
test('キーボードでタグを操作できる', async ({ page }) => {
  await page.goto('/blog/test-article');
  
  // Tabキーでタグにフォーカス
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab'); // 記事末尾のタグまで移動
  
  // Enterキーでタグページに移動
  await page.keyboard.press('Enter');
  
  await expect(page).toHaveURL(/\/tags\//);
});
```

#### TC-7.2: スクリーンリーダー対応
```javascript
test('適切なARIAラベルが設定されている', async ({ page }) => {
  await page.goto('/blog/test-article');
  
  const tagLink = page.locator('a[href="/tags/javascript"]');
  await expect(tagLink).toHaveAttribute('aria-label', /javascript.*記事/);
});
```

### TC-8: パフォーマンステスト

#### TC-8.1: ページロード時間テスト
```javascript
test('タグ表示がページロード時間に影響しない', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/blog/complex-article-with-many-tags');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // 3秒以内
});
```

#### TC-8.2: メモリ使用量テスト
```javascript
test('大量のタグでもメモリリークしない', async ({ page }) => {
  // 大量のタグを含む記事
  await page.goto('/blog/article-with-100-tags');
  
  const initialMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
  
  // タグを何度もクリック
  for (let i = 0; i < 10; i++) {
    await page.click('a[href^="/tags/"]');
    await page.goBack();
  }
  
  const finalMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
  
  // メモリ使用量が大幅に増加していないことを確認
  expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024); // 1MB以内
});
```

## 📱 レスポンシブテスト

### TC-9: デバイス別表示テスト

#### TC-9.1: モバイル表示テスト
```javascript
test('モバイルで適切に表示される', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/blog/mobile-test-article');
  
  // タグが縦並びになっている
  const tagContainer = page.locator('.tag-section');
  await expect(tagContainer).toHaveCSS('flex-direction', 'column');
  
  // タップしやすいサイズ
  const tagLink = page.locator('a[href^="/tags/"]').first();
  const boundingBox = await tagLink.boundingBox();
  expect(boundingBox.height).toBeGreaterThanOrEqual(44); // 44px以上
});
```

#### TC-9.2: タブレット表示テスト
```javascript
test('タブレットで適切に表示される', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 }); // iPad
  await page.goto('/blog/tablet-test-article');
  
  // 適切なグリッドレイアウト
  const tagGrid = page.locator('.tag-grid');
  await expect(tagGrid).toHaveCSS('grid-template-columns', /repeat\(auto-fit/);
});
```

## 🔧 実装レベルテスト

### TC-10: remarkプラグイン統合テスト

#### TC-10.1: プラグイン設定テスト
```javascript
test('remarkプラグインが正しく設定されている', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkTags)
    .use(remarkRehype)
    .use(rehypeStringify);
    
  const markdown = 'テスト #javascript の記事';
  const result = processor.processSync(markdown);
  
  expect(result.toString()).toContain('<a href="/tags/javascript">');
});
```

#### TC-10.2: Astro統合テスト
```javascript
test('AstroでのMarkdown処理が正しく動作する', async () => {
  // Astroのテスト環境でのマークダウン処理確認
  const { html } = await renderMarkdown('テスト #react 記事');
  
  expect(html).toContain('<a href="/tags/react"');
  expect(html).toContain('class="inline-tag"');
});
```

## ✅ テスト実行基準

### 成功条件
- 全単体テスト: 100% パス
- 全統合テスト: 100% パス  
- E2Eテスト: 95%以上 パス
- パフォーマンステスト: 全て基準値内
- アクセシビリティテスト: 100% パス

### カバレッジ要件
- コードカバレッジ: 90%以上
- 分岐カバレッジ: 85%以上
- 関数カバレッジ: 100%

### 品質ゲート
- ESLintエラー: 0個
- TypeScriptエラー: 0個
- 未使用コード: 0%
- セキュリティ脆弱性: 0個