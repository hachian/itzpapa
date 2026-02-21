import { describe, test } from 'node:test';
import assert from 'node:assert';
import { escapeRegExp } from '../../src/utils/tag/utils.ts';
import { validateTagName, normalizeTag, tagToSlug } from '../../src/utils/tag/validation.ts';
import { buildTagHierarchy } from '../../src/utils/tag/hierarchy.ts';

describe('Tag Utils', () => {
  describe('escapeRegExp', () => {
    test('should escape special characters', () => {
      const specialChars = '.*+?^${}()|[]\\';
      const escaped = escapeRegExp(specialChars);
      assert.strictEqual(escaped, '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    test('should handle string without special characters', () => {
      const normalString = 'abc123';
      const escaped = escapeRegExp(normalString);
      assert.strictEqual(escaped, normalString);
    });
  });

  describe('validation (using escapeRegExp)', () => {
    test('validateTagName should work with default options', () => {
      const result = validateTagName('test-tag');
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.normalizedTag, 'test-tag');
    });

    test('normalizeTag should handle hierarchy separator', () => {
      const tag = 'parent/child';
      const normalized = normalizeTag(tag);
      assert.strictEqual(normalized, 'parent/child');
    });

    test('normalizeTag should handle duplicate separators', () => {
      const tag = 'parent//child';
      const normalized = normalizeTag(tag);
      assert.strictEqual(normalized, 'parent/child');
    });

    test('normalizeTag should handle special characters in separator if customized', () => {
      // Create a custom separator that needs escaping
      const options = { hierarchySeparator: '.' };
      const tag = 'parent..child';
      // normalizeTag uses getSeparatorRegexes -> escapeRegExp
      const normalized = normalizeTag(tag, options);
      assert.strictEqual(normalized, 'parent.child');
    });
  });

  describe('hierarchy (using escapeRegExp)', () => {
    test('buildTagHierarchy should construct hierarchy correctly', () => {
      const tags = ['parent', 'parent/child'];
      const hierarchy = buildTagHierarchy(tags);

      assert.ok(hierarchy['parent']);
      assert.ok(hierarchy['parent'].children['parent/child']);
    });

    test('buildTagHierarchy should handle custom separator needing escaping', () => {
      const options = { hierarchySeparator: '.' };
      const tags = ['parent', 'parent.child'];
      const hierarchy = buildTagHierarchy(tags, options);

      assert.ok(hierarchy['parent']);
      assert.ok(hierarchy['parent'].children['parent.child']);
    });
  });
});
