# TASK-103: 他のMarkdown記法との統合 - テストケース

## テストケース一覧

### 1. WikiLink記法との併用テスト

#### TC-103-001: WikiLink優先処理
- **入力**: `[[==highlighted page==]]`
- **期待結果**: WikiLinkが優先され、ハイライト記法は無視される
- **理由**: WikiLinkプラグインが先に処理されるため

#### TC-103-002: WikiLinkとハイライトの並列処理
- **入力**: `==[[wikilink]] highlighted==`
- **期待結果**: `<mark><a href="/wikilink">wikilink</a> highlighted</mark>`
- **理由**: ハイライト範囲内でWikiLinkが処理される

#### TC-103-003: 独立したWikiLinkとハイライト
- **入力**: `[[page1]] and ==highlight== text`
- **期待結果**: `<a href="/page1">page1</a> and <mark>highlight</mark> text`

### 2. GFM記法との併用テスト

#### TC-103-004: 太字内ハイライト
- **入力**: `**==bold highlight==**`
- **期待結果**: `<strong><mark>bold highlight</mark></strong>`

#### TC-103-005: ハイライト内太字
- **入力**: `==**inner bold**==`
- **期待結果**: `<mark><strong>inner bold</strong></mark>`

#### TC-103-006: 斜体内ハイライト
- **入力**: `*==italic highlight==*`
- **期待結果**: `<em><mark>italic highlight</mark></em>`

#### TC-103-007: ハイライト内斜体
- **入力**: `==*inner italic*==`
- **期待結果**: `<mark><em>inner italic</em></mark>`

#### TC-103-008: 取り消し線内ハイライト
- **入力**: `~~==strikethrough highlight==~~`
- **期待結果**: `<del><mark>strikethrough highlight</mark></del>`

#### TC-103-009: リンク内ハイライト
- **入力**: `[==link text==](https://example.com)`
- **期待結果**: `<a href="https://example.com"><mark>link text</mark></a>`

#### TC-103-010: コード内ハイライト（除外）
- **入力**: `` `==code==` ``
- **期待結果**: `<code>==code==</code>`（変換されない）

### 3. タグ記法との併用テスト

#### TC-103-011: ハイライト内タグ
- **入力**: `==highlighted #tag==`
- **期待結果**: `<mark>highlighted <a href="/tags/tag" class="tag-link">#tag</a></mark>`

#### TC-103-012: 独立したタグとハイライト
- **入力**: `#tag ==highlight==`
- **期待結果**: `<a href="/tags/tag" class="tag-link">#tag</a> <mark>highlight</mark>`

### 4. 複合記法の処理テスト

#### TC-103-013: 太字-ハイライト-WikiLink複合
- **入力**: `**==[[compound]]==**`
- **期待結果**: `<strong><mark><a href="/compound">compound</a></mark></strong>`

#### TC-103-014: WikiLink内複合記法
- **入力**: `[[==**multi-syntax**==]]`
- **期待結果**: WikiLinkが優先され、内部記法は無視される

#### TC-103-015: タグ-太字-ハイライト複合
- **入力**: `#tag ==**bold highlight**==`
- **期待結果**: `<a href="/tags/tag" class="tag-link">#tag</a> <mark><strong>bold highlight</strong></mark>`

### 5. エッジケースのテスト

#### TC-103-016: ネストした複合記法
- **入力**: `**==*nested italic*==**`
- **期待結果**: `<strong><mark><em>nested italic</em></mark></strong>`

#### TC-103-017: 不完全な記法の混在
- **入力**: `==incomplete **bold== end**`
- **期待結果**: `<mark>incomplete **bold</mark> end**`

#### TC-103-018: 複数ハイライトと他記法
- **入力**: `==first== **bold** ==second==`
- **期待結果**: `<mark>first</mark> <strong>bold</strong> <mark>second</mark>`

### 6. パフォーマンステスト

#### TC-103-019: 大量記法の処理
- **入力**: 100個の各記法が混在するテキスト
- **期待結果**: 処理時間が既存の110%以内
- **測定項目**: 処理時間、メモリ使用量

#### TC-103-020: 深いネスト記法
- **入力**: 10レベル以上のネストした記法
- **期待結果**: 適切に処理され、スタックオーバーフローが発生しない

### 7. 安全性テスト

#### TC-103-021: XSS防止の維持
- **入力**: `==<script>alert('xss')</script>==`
- **期待結果**: HTMLエスケープが適用される
- **確認項目**: 既存のXSS対策が他記法との統合で損なわれない

#### TC-103-022: 予期しないHTML出力の防止
- **入力**: 記法の組み合わせによる異常なHTML
- **期待結果**: 有効なHTMLのみが出力される

### 8. 回帰テスト

#### TC-103-023: 既存機能の動作確認
- **入力**: TASK-101, TASK-102で実装した全テストケース
- **期待結果**: 全テストが成功する
- **確認項目**: 統合により既存機能が破損していない

#### TC-103-024: プラグイン無効時の動作
- **入力**: remarkMarkHighlightを無効にした場合
- **期待結果**: 他のプラグインが正常動作する

## テスト実装戦略

### 1. 単体テスト
- 各記法の組み合わせパターンの個別テスト
- remarkプロセッサーでの統合テスト

### 2. 統合テスト
- 実際のMarkdownファイルでのE2Eテスト
- ブラウザでの表示確認

### 3. パフォーマンステスト
- 処理時間測定
- メモリ使用量監視

### 4. 回帰テスト
- 既存テストスイートの実行
- CI/CDでの自動テスト

## 実装前の準備

### テストデータ
1. 各記法の組み合わせサンプル
2. 大量データでのパフォーマンステスト用ファイル
3. エッジケースの例文集

### テスト環境
1. remarkプロセッサーの完全な統合環境
2. ブラウザでの表示確認環境
3. パフォーマンス測定ツール