/**
 * GiscusConfig 型テスト
 * TypeScriptコンパイル時に型検証を行う
 */
import type { GiscusConfig, CommentsConfig } from './site-config';

// ==========================================
// 正常系テスト: 必須プロパティのみ
// ==========================================
const validMinimalConfig: GiscusConfig = {
  repo: 'owner/repo',
  repoId: 'R_xxxxx',
  category: 'Comments',
  categoryId: 'DIC_xxxxx',
};

// ==========================================
// 正常系テスト: すべてのオプショナルプロパティ
// ==========================================
const validFullConfig: GiscusConfig = {
  repo: 'owner/repo',
  repoId: 'R_xxxxx',
  category: 'Comments',
  categoryId: 'DIC_xxxxx',
  mapping: 'pathname',
  strict: true,
  reactionsEnabled: true,
  emitMetadata: false,
  inputPosition: 'bottom',
  lang: 'ja',
};

// ==========================================
// 正常系テスト: CommentsConfig との統合
// ==========================================
const commentsWithGiscus: CommentsConfig = {
  enabled: true,
  provider: 'giscus',
  config: {
    repo: 'owner/repo',
    repoId: 'R_xxxxx',
    category: 'Comments',
    categoryId: 'DIC_xxxxx',
  },
};

const commentsDisabled: CommentsConfig = {
  enabled: false,
};

// ==========================================
// mapping オプションの型チェック
// ==========================================
const mappingPathname: GiscusConfig = { ...validMinimalConfig, mapping: 'pathname' };
const mappingUrl: GiscusConfig = { ...validMinimalConfig, mapping: 'url' };
const mappingTitle: GiscusConfig = { ...validMinimalConfig, mapping: 'title' };
const mappingOgTitle: GiscusConfig = { ...validMinimalConfig, mapping: 'og:title' };
const mappingSpecific: GiscusConfig = { ...validMinimalConfig, mapping: 'specific' };
const mappingNumber: GiscusConfig = { ...validMinimalConfig, mapping: 'number' };

// ==========================================
// inputPosition オプションの型チェック
// ==========================================
const inputTop: GiscusConfig = { ...validMinimalConfig, inputPosition: 'top' };
const inputBottom: GiscusConfig = { ...validMinimalConfig, inputPosition: 'bottom' };

// 型テストが通ればこのファイルはコンパイル成功
// 異常系テストはコンパイルエラーでビルドが止まるため省略

export {
  validMinimalConfig,
  validFullConfig,
  commentsWithGiscus,
  commentsDisabled,
  mappingPathname,
  mappingUrl,
  mappingTitle,
  mappingOgTitle,
  mappingSpecific,
  mappingNumber,
  inputTop,
  inputBottom,
};
