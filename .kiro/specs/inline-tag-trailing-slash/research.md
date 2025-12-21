# Research & Design Decisions

## Summary
- **Feature**: `inline-tag-trailing-slash`
- **Discovery Scope**: Simple Addition（単純なバグ修正）
- **Key Findings**:
  1. `remark-tags/index.js`の`tagToSlug`関数と119行目のURL生成で末尾スラッシュが欠落
  2. `tests/integration/inline-tags-test.js`の`generateTagUrlMock`も同様に修正が必要
  3. 他のコンポーネント（TagList.astro, inline-tags.ts）は正しく末尾スラッシュを付与している

## Research Log

### インラインタグURL生成の現状分析
- **Context**: 本文中のインラインタグリンクに末尾スラッシュがない問題の調査
- **Sources Consulted**: コードベース内のタグ関連ファイル
- **Findings**:
  - `src/utils/tag/inline-tags.ts`の`generateTagUrl`: ✅ 末尾スラッシュあり（コミット788c98fで修正済み）
  - `src/components/TagList.astro`の`tagToSlug`: ✅ 末尾スラッシュあり
  - `src/plugins/remark-tags/index.js`の`tagToSlug`: ❌ 末尾スラッシュなし
  - `tests/integration/inline-tags-test.js`の`generateTagUrlMock`: ❌ 末尾スラッシュなし
- **Implications**: remark-tagsプラグインとテストファイルの2箇所を修正する必要がある

### 修正方針の検討
- **Context**: 最小限の変更で整合性を保つ方法の検討
- **Findings**:
  - 方法A: `tagToSlug`関数の戻り値に末尾スラッシュを追加
  - 方法B: URL生成箇所（119行目）で末尾スラッシュを追加
  - 方法Bの方が変更箇所が明確で、`tagToSlug`関数の責務（スラッグ生成のみ）を維持できる
- **Implications**: 方法Bを採用し、119行目でのURL生成時に末尾スラッシュを追加

## Design Decisions

### Decision: URL生成箇所での末尾スラッシュ追加
- **Context**: `tagToSlug`関数を変更するか、URL生成箇所を変更するか
- **Alternatives Considered**:
  1. `tagToSlug`関数の戻り値に末尾スラッシュを追加
  2. URL生成箇所（119行目）で末尾スラッシュを追加
- **Selected Approach**: URL生成箇所で末尾スラッシュを追加
- **Rationale**:
  - `tagToSlug`の責務は「タグ名をスラッグに変換」であり、URL形式の決定は呼び出し側の責任
  - 他のコンポーネント（TagList.astro）も同様のパターンでURL生成時に末尾スラッシュを追加している
- **Trade-offs**: `tagToSlug`を使う他の箇所があれば個別に末尾スラッシュ追加が必要だが、現状は119行目のみ
- **Follow-up**: テストファイルの`generateTagUrlMock`も同様に修正

## Risks & Mitigations
- **リスク1**: テスト期待値が変わるためテストが失敗する可能性 → テストファイルも同時に修正
- **リスク2**: 既存の外部リンクが末尾スラッシュなしURLを参照している可能性 → Astroのtrailingslash設定でリダイレクト対応（スコープ外）

## References
- コミット788c98f: `src/utils/tag/inline-tags.ts`の`generateTagUrl`修正
- Astro trailingSlash設定: https://docs.astro.build/en/reference/configuration-reference/#trailingslash
