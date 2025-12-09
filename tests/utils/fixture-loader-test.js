/**
 * Fixture Loader Test Suite
 *
 * Tests the fixture loading utilities
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  loadInput,
  loadExpected,
  listFixtures,
  loadFixturePair,
  loadAllFixtures,
  getFixturesPath
} from '../fixtures/fixture-loader.js';

describe('Fixture Loader', () => {
  describe('loadInput', () => {
    test('loads existing wikilink fixture', async () => {
      const content = await loadInput('wikilink', 'basic');
      assert(content.includes('[[../page/index.md]]'), 'Should contain wikilink syntax');
    });

    test('loads existing callout fixture', async () => {
      const content = await loadInput('callout', 'basic');
      assert(content.includes('[!note]'), 'Should contain callout syntax');
    });

    test('loads Japanese content fixture', async () => {
      const content = await loadInput('wikilink', 'japanese');
      assert(content.includes('日本語'), 'Should contain Japanese characters');
    });

    test('throws error for non-existent fixture', async () => {
      await assert.rejects(
        async () => await loadInput('wikilink', 'non-existent'),
        { message: /Fixture not found/ }
      );
    });
  });

  describe('listFixtures', () => {
    test('lists wikilink fixtures', async () => {
      const fixtures = await listFixtures('wikilink');
      assert(Array.isArray(fixtures), 'Should return an array');
      assert(fixtures.includes('basic'), 'Should include basic fixture');
      assert(fixtures.includes('alias'), 'Should include alias fixture');
    });

    test('lists callout fixtures', async () => {
      const fixtures = await listFixtures('callout');
      assert(fixtures.includes('basic'), 'Should include basic fixture');
      assert(fixtures.includes('foldable'), 'Should include foldable fixture');
    });

    test('throws error for non-existent category', async () => {
      await assert.rejects(
        async () => await listFixtures('non-existent-category'),
        { message: /Category not found/ }
      );
    });
  });

  describe('loadFixturePair', () => {
    test('loads input without expected (expected is optional)', async () => {
      const { input, expected } = await loadFixturePair('wikilink', 'basic');
      assert(input.length > 0, 'Input should have content');
      // Expected might be null if .expected.html doesn't exist
      assert(expected === null || typeof expected === 'string');
    });
  });

  describe('loadAllFixtures', () => {
    test('loads all fixtures in a category', async () => {
      const fixtures = await loadAllFixtures('callout');
      assert(Array.isArray(fixtures), 'Should return an array');
      assert(fixtures.length >= 3, 'Should have at least 3 callout fixtures');

      const basicFixture = fixtures.find(f => f.name === 'basic');
      assert(basicFixture, 'Should include basic fixture');
      assert(basicFixture.input.includes('[!note]'), 'Basic should contain note callout');
    });
  });

  describe('getFixturesPath', () => {
    test('returns fixtures directory path', () => {
      const path = getFixturesPath();
      assert(path.includes('fixtures'), 'Path should contain "fixtures"');
    });
  });
});

console.log('🧪 Running Fixture Loader Tests...');
