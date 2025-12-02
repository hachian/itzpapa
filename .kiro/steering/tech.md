# Technology Stack

## Architecture

コンテンツ駆動の静的サイトジェネレーション（SSG）アーキテクチャ。
Markdownコンテンツをビルド時に処理し、最適化されたHTMLを生成。

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Framework**: Astro v5（静的サイトジェネレーター）
- **Runtime**: Node.js

## Key Libraries

- **@astrojs/mdx**: MDX統合（MarkdownでJSXコンポーネント使用）
- **rehype-callouts**: Obsidian風Calloutブロック処理
- **sharp**: 画像最適化処理
- **unified/remark**: Markdown AST処理基盤

## Development Standards

### Type Safety
- TypeScript strict mode（`astro/tsconfigs/strict` 継承）
- `strictNullChecks: true`

### Code Quality
- Astro組み込みのLinting
- カスタムremarkプラグインはJavaScriptで記述

### Testing
- Node.js組み込みテストランナー使用
- カスタムプラグインごとに個別テスト

## Development Environment

### Required Tools
- Node.js
- npm

### Common Commands
```bash
# Dev: npm run dev
# Build: npm run build
# Test: npm run test
# Preview: npm run preview
```

## Key Technical Decisions

- **カスタムremarkプラグイン**: Obsidian記法対応のため、WikiLink・マークハイライト・タグを独自実装
- **rehypeとremarkの分離**: remark（Markdown AST）で構文処理、rehype（HTML AST）でCallout等の後処理
- **コンテンツコレクション**: `src/content/blog/` 配下のフォルダベース管理

---
_Document standards and patterns, not every dependency_
