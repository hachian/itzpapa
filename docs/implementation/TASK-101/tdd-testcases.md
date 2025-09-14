# TASK-101: ハイライト記法のパーサー実装 - テストケース

## テストケース一覧

### 1. 基本機能のテスト

#### TC-001: 単一行の基本的なハイライト
- **入力**: `This is ==highlighted== text`
- **期待結果**: `This is <mark>highlighted</mark> text`

#### TC-002: 複数のハイライト（同一行）
- **入力**: `==first== and ==second== highlights`
- **期待結果**: `<mark>first</mark> and <mark>second</mark> highlights`

#### TC-003: 日本語テキストのハイライト
- **入力**: `これは==重要な情報==です`
- **期待結果**: `これは<mark>重要な情報</mark>です`

### 2. 複数行対応のテスト

#### TC-004: 改行を跨ぐハイライト
- **入力**: `==複数行に\n渡るテキスト==`
- **期待結果**: `<mark>複数行に\n渡るテキスト</mark>`

#### TC-005: 段落を跨ぐハイライト
- **入力**: `==段落1\n\n段落2==`
- **期待結果**: `<mark>段落1\n\n段落2</mark>`

### 3. エスケープ処理のテスト

#### TC-006: エスケープされた記法（開始）
- **入力**: `\==not highlighted==`
- **期待結果**: `==not highlighted==`

#### TC-007: エスケープされた記法（終了）
- **入力**: `==not complete\==`
- **期待結果**: `==not complete==`

### 4. 他の記法との組み合わせテスト

#### TC-008: 太字との組み合わせ
- **入力**: `==**bold text**==`
- **期待結果**: `<mark><strong>bold text</strong></mark>`

#### TC-009: 斜体との組み合わせ
- **入力**: `==*italic text*==`
- **期待結果**: `<mark><em>italic text</em></mark>`

#### TC-010: リンクとの組み合わせ
- **入力**: `==[link text](url)==`
- **期待結果**: `<mark><a href="url">link text</a></mark>`

### 5. エッジケースのテスト

#### TC-011: 空のハイライト
- **入力**: `====`
- **期待結果**: `====`（変換されない）

#### TC-012: 入れ子のハイライト（外側優先）
- **入力**: `==outer ==inner== text==`
- **期待結果**: `<mark>outer ==inner== text</mark>`

#### TC-013: 不完全な記法（開始のみ）
- **入力**: `==incomplete text`
- **期待結果**: `==incomplete text`（変換されない）

#### TC-014: 不完全な記法（終了のみ）
- **入力**: `incomplete text==`
- **期待結果**: `incomplete text==`（変換されない）

#### TC-015: 連続するハイライト
- **入力**: `==first====second==`
- **期待結果**: `<mark>first</mark><mark>second</mark>`

### 6. セキュリティテスト

#### TC-016: HTMLタグのエスケープ
- **入力**: `==<script>alert('xss')</script>==`
- **期待結果**: `<mark>&lt;script&gt;alert('xss')&lt;/script&gt;</mark>`

#### TC-017: 属性のエスケープ
- **入力**: `==text" onclick="alert('xss')==`
- **期待結果**: `<mark>text&quot; onclick=&quot;alert('xss')</mark>`

### 7. パフォーマンステスト

#### TC-018: 長いテキスト
- **入力**: `==` + 'a'.repeat(1000) + `==`
- **期待結果**: `<mark>` + 'a'.repeat(1000) + `</mark>`
- **条件**: 100ms以内に処理完了

#### TC-019: 多数のハイライト
- **入力**: `==a== `.repeat(100)
- **期待結果**: `<mark>a</mark> `.repeat(100)
- **条件**: 100ms以内に処理完了

## テスト実装方針

1. **単体テスト**: 各テストケースを個別に実行
2. **統合テスト**: 実際のMarkdownファイルで動作確認
3. **パフォーマンステスト**: 大量データでの処理速度測定
4. **回帰テスト**: 既存機能が影響を受けていないことを確認