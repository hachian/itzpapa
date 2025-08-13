# Wikilink Plugin テスト環境

## 概要
このディレクトリには、Wikilink機能のテストファイルが含まれています。

## テストファイル

### 1. `wikilink-test.js`
- **説明**: Wikilink変換機能の単体テスト
- **実行方法**: `npm run test:wikilink` または `npm test`
- **テスト内容**:
  - 基本的なWikilink変換
  - エイリアス付きリンク
  - 見出しアンカー（英語・日本語）
  - 複数リンクの処理
  - パスのクリーニング
  - CSSクラスの付与

### 2. `debug-test.js`
- **説明**: AST変換のデバッグ用スクリプト
- **実行方法**: `node test/debug-test.js`

## テスト結果

### 自動テスト
```bash
npm test
```

現在のテスト結果:
- ✅ 10/10 テスト成功
- 成功率: 100%

### ブラウザでの動作確認

以下のURLでテストページを確認できます：

1. **Wikilink Test Suite** (包括的テスト)
   - URL: http://localhost:4321/blog/wikilink-test-suite/
   - 内容: すべてのWikilink機能のテストケース

2. **OFM Test Page** (実際の使用例)
   - URL: http://localhost:4321/blog/ofm-test/
   - 内容: 実際のブログ記事でのWikilink使用例

3. **Link Test Page** (リンク先テスト)
   - URL: http://localhost:4321/blog/link-test/
   - 内容: リンク先として使用されるテストページ

## テストチェックリスト

### 基本機能
- [x] `[[../page/index.md]]` → `/blog/page` への変換
- [x] `[[../page/index.md|カスタム名]]` → エイリアス表示
- [x] `[[../page]]` → 拡張子なしでも動作
- [x] CSSクラス `wikilink-internal` の付与

### 見出しリンク
- [x] `[[../page#Heading]]` → `#heading` への変換
- [x] `[[../page#Test Heading]]` → `#test-heading` への変換
- [x] 日本語見出しのサポート

### パスクリーニング
- [x] `.md` 拡張子の自動除去
- [x] `/index` の自動除去
- [x] 相対パスから絶対パスへの変換

### 互換性
- [x] 通常のMarkdownリンクとの共存
- [x] テーブル内でのWikilink
- [x] 引用文内でのWikilink
- [x] リスト内でのWikilink

## トラブルシューティング

### テストが失敗する場合
1. 依存関係を確認: `npm install`
2. デバッグモードで実行: `DEBUG=1 npm test`
3. AST出力を確認: `node test/debug-test.js`

### ブラウザで動作しない場合
1. 開発サーバーが起動しているか確認
2. キャッシュをクリア: `Ctrl+Shift+R`
3. コンソールエラーを確認: `F12`

## 今後の拡張

- [ ] 画像埋め込み機能 `![[image.jpg]]` のテスト追加
- [ ] リンク切れ検出のテスト
- [ ] パフォーマンステスト
- [ ] E2Eテスト（Playwright等）