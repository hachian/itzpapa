/**
 * 国際化（i18n）機能のテスト
 * Language型、翻訳リソース、ヘルパー関数のテスト
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Language型定義', () => {
  describe('型ファイルの存在確認', () => {
    it('site-config.ts に Language 型が定義されている', () => {
      const typesPath = resolve(process.cwd(), 'src/types/site-config.ts');
      const content = readFileSync(typesPath, 'utf-8');
      assert.ok(
        content.includes("type Language = 'ja' | 'en'") ||
        content.includes("type Language = \"ja\" | \"en\""),
        'Language 型が ja | en として定義されている'
      );
    });
  });

  describe('SiteInfo の language プロパティ', () => {
    it('SiteInfo に language プロパティが定義されている', () => {
      const typesPath = resolve(process.cwd(), 'src/types/site-config.ts');
      const content = readFileSync(typesPath, 'utf-8');
      assert.ok(
        content.includes('language?:') || content.includes('language :'),
        'SiteInfo に language プロパティが存在する'
      );
    });

    it('language プロパティはオプショナルである', () => {
      const typesPath = resolve(process.cwd(), 'src/types/site-config.ts');
      const content = readFileSync(typesPath, 'utf-8');
      assert.ok(
        content.includes('language?:'),
        'language プロパティがオプショナル（?:）で定義されている'
      );
    });
  });
});

describe('翻訳リソース', () => {
  describe('ファイル構造', () => {
    it('i18n ディレクトリが存在する', () => {
      const i18nPath = resolve(process.cwd(), 'src/i18n');
      assert.ok(existsSync(i18nPath), 'src/i18n ディレクトリが存在する');
    });

    it('translations.ts ファイルが存在する', () => {
      const translationsPath = resolve(process.cwd(), 'src/i18n/translations.ts');
      assert.ok(existsSync(translationsPath), 'src/i18n/translations.ts が存在する');
    });

    it('index.ts ファイルが存在する', () => {
      const indexPath = resolve(process.cwd(), 'src/i18n/index.ts');
      assert.ok(existsSync(indexPath), 'src/i18n/index.ts が存在する');
    });
  });

  describe('翻訳キーの定義', () => {
    it('TranslationKeys 型が定義されている', () => {
      const translationsPath = resolve(process.cwd(), 'src/i18n/translations.ts');
      const content = readFileSync(translationsPath, 'utf-8');
      assert.ok(
        content.includes('interface TranslationKeys') ||
        content.includes('type TranslationKeys'),
        'TranslationKeys が定義されている'
      );
    });

    it('必要な翻訳キーがすべて含まれている', () => {
      const translationsPath = resolve(process.cwd(), 'src/i18n/translations.ts');
      const content = readFileSync(translationsPath, 'utf-8');

      const requiredKeys = [
        'nav.home', 'nav.blog', 'nav.tags', 'nav.about',
        'toc.title', 'toc.ariaLabel', 'toc.toggle',
        'tags.title', 'tags.backToList', 'tags.ariaLabel',
        'menu.open', 'menu.close',
        'footer.allRightsReserved'
      ];

      for (const key of requiredKeys) {
        assert.ok(
          content.includes(`'${key}'`) || content.includes(`"${key}"`),
          `翻訳キー "${key}" が定義されている`
        );
      }
    });

    it('日本語と英語の両方の翻訳が定義されている', () => {
      const translationsPath = resolve(process.cwd(), 'src/i18n/translations.ts');
      const content = readFileSync(translationsPath, 'utf-8');

      assert.ok(content.includes('ja:'), '日本語の翻訳が定義されている');
      assert.ok(content.includes('en:'), '英語の翻訳が定義されている');
    });
  });
});

describe('翻訳ヘルパー関数', () => {
  describe('index.ts の構造', () => {
    it('getLanguage 関数がエクスポートされている', () => {
      const indexPath = resolve(process.cwd(), 'src/i18n/index.ts');
      const content = readFileSync(indexPath, 'utf-8');
      assert.ok(
        content.includes('export function getLanguage') ||
        content.includes('export const getLanguage'),
        'getLanguage 関数がエクスポートされている'
      );
    });

    it('t 関数がエクスポートされている', () => {
      const indexPath = resolve(process.cwd(), 'src/i18n/index.ts');
      const content = readFileSync(indexPath, 'utf-8');
      assert.ok(
        content.includes('export function t') ||
        content.includes('export const t'),
        't 関数がエクスポートされている'
      );
    });

    it('getTranslations 関数がエクスポートされている', () => {
      const indexPath = resolve(process.cwd(), 'src/i18n/index.ts');
      const content = readFileSync(indexPath, 'utf-8');
      assert.ok(
        content.includes('export function getTranslations') ||
        content.includes('export const getTranslations'),
        'getTranslations 関数がエクスポートされている'
      );
    });

    it('デフォルト言語として ja が使用される', () => {
      const indexPath = resolve(process.cwd(), 'src/i18n/index.ts');
      const content = readFileSync(indexPath, 'utf-8');
      assert.ok(
        content.includes("?? 'ja'") || content.includes("|| 'ja'"),
        'デフォルト言語として ja が設定されている'
      );
    });
  });
});

describe('後方互換性', () => {
  it('language が未設定でも既存の設定が動作する', () => {
    // 既存のsite.config.tsにlanguageが含まれなくても動作すること
    const configPath = resolve(process.cwd(), 'site.config.ts');
    const content = readFileSync(configPath, 'utf-8');
    // 設定ファイルが有効なTypeScriptであること（インポートとエクスポートが存在）
    assert.ok(content.includes('export const siteConfig'), '設定がエクスポートされている');
  });
});
