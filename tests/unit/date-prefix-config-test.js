
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { removeDatePrefix } from '../../src/plugins/utils/index.js';

describe('removeDatePrefix Configuration', () => {
  test('removes date prefix by default (when shouldRemove is undefined/true)', () => {
    assert.strictEqual(removeDatePrefix('20240101-post-title'), 'post-title');
    assert.strictEqual(removeDatePrefix('20240101-post-title', true), 'post-title');
  });

  test('keeps date prefix when shouldRemove is false', () => {
    assert.strictEqual(removeDatePrefix('20240101-post-title', false), '20240101-post-title');
  });

  test('handles regular slugs correctly', () => {
    assert.strictEqual(removeDatePrefix('post-title'), 'post-title');
    assert.strictEqual(removeDatePrefix('post-title', false), 'post-title');
  });
});
