# Implementation Plan

## Task Overview

本実装計画は、itzpapaブログサイトのパフォーマンス改善とアクセシビリティ向上を実現するためのタスクを定義します。

**目標**:
- Lighthouse Performance: 79 → 90+
- Lighthouse Accessibility: 94 → 95+
- LCP: 5.6秒 → 2.5秒以下

## Tasks

### LCP最適化

- [x] 1. ヒーロー画像のpreload機能を実装
- [x] 1.1 BaseHeadコンポーネントにpreloadタグ生成機能を追加
  - ヒーロー画像のpreload情報を受け取るpropsを追加
  - `<link rel="preload" as="image">`タグを条件付きで生成
  - WebP形式のtype属性を設定
  - 既存のGoogle Fonts最適化（preconnect等）を維持
  - _Requirements: 1.3_

- [x] 1.2 BlogPostレイアウトからpreload情報をBaseHeadへ伝達
  - ヒーロー画像のパスを計算するロジックを追加
  - 画像の形式（WebP）に応じたtype属性を設定
  - heroPreload propsをBaseHeadに渡す
  - ダークモード用画像とライトモード用画像の両方を考慮
  - _Requirements: 1.1, 1.3, 1.4_

### アクセシビリティ改善（コントラスト）

- [x] 2. テキストコントラスト比を改善
- [x] 2.1 (P) セマンティックカラー変数を追加してコントラスト比を保証
  - テキスト用アクセントカラー（`--color-text-accent`）を定義
  - WCAG AA基準（4.5:1以上）を満たす明度に設定
  - ライトモード・ダークモード両方に対応
  - _Requirements: 5.1_

- [x] 2.2 日時表示要素のコントラストを修正
  - `article-meta__published`の色を`--color-text-accent`に変更
  - `post-card__date`の色も同様に修正
  - ダークモードでの視認性を確認
  - 2.1のセマンティックカラー定義に依存
  - _Requirements: 5.2_

- [x] 2.3 (P) 強調テキストのコントラストを修正
  - `em > strong`要素の色を十分なコントラスト比に調整
  - グローバルスタイルで対応
  - _Requirements: 5.3_

### アクセシビリティ改善（ARIA）

- [x] 3. タスクチェックボックスのARIA属性を修正
- [x] 3.1 sr-onlyユーティリティクラスをグローバルスタイルに追加
  - スクリーンリーダー専用の非表示スタイルを定義
  - 視覚的に非表示だがアクセシブルな状態を実現
  - _Requirements: 6.2_

- [x] 3.2 rehype-task-statusプラグインの出力をsr-onlyパターンに変更
  - role="img"とaria-label属性を削除
  - 親span要素にaria-hidden="true"を設定
  - 隣接するsr-only spanでステータステキストを出力
  - 既存のテスト（ある場合）を更新
  - 3.1のsr-onlyクラス定義に依存
  - _Requirements: 6.1, 6.2_

### 画像最適化（Lightbox）

- [x] 4. (P) Lightbox画像のレイアウトシフト防止
  - `.lightbox-image`にaspect-ratioプロパティを追加
  - 画像読み込み前のレイアウト領域を確保
  - CLS（Cumulative Layout Shift）を0.1以下に維持
  - _Requirements: 4.1, 4.2_

### 検証とテスト

- [x] 5. パフォーマンスとアクセシビリティの検証
- [x] 5.1 ローカル環境でLighthouse検証を実行
  - ビルド後のサイトでLighthouse CIを実行
  - Performance 90+、Accessibility 95+を確認
  - LCP 2.5秒以下を確認
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]*5.2 rehype-task-statusプラグインのユニットテストを追加
  - sr-only spanの出力を検証
  - aria-hidden属性の正しい配置を検証
  - 既存のテストパターンに従う
  - _Requirements: 6.1, 6.2_

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 1.2 |
| 1.2 | - (実装済み) |
| 1.3 | 1.1, 1.2 |
| 1.4 | 1.2 (実装済み、確認のみ) |
| 1.5 | - (運用ガイドライン、タスク対象外) |
| 2.1-2.4 | - (Astro自動処理、実装済み) |
| 3.1-3.4 | - (Astro自動処理、対応見送り) |
| 4.1, 4.2 | 4 |
| 4.3, 4.4 | - (実装済み) |
| 5.1 | 2.1 |
| 5.2 | 2.2 |
| 5.3 | 2.3 |
| 5.4 | 5.1 |
| 6.1 | 3.2 |
| 6.2 | 3.1, 3.2 |
| 6.3-6.5 | - (実装済み) |
| 7.1-7.3 | - (Cloudflare既存設定) |
| 8.1-8.5 | 5.1 |

## Deferred Requirements

- **1.5** (画像サイズ100KB以下): 運用ガイドラインとして別途文書化。本実装タスクの対象外。
- **3.3** (フォントサブセット): 日本語フォントのサブセット化は技術的複雑さから見送り。research.mdに詳細記載。
