/**
 * Test Fixture Loader Utility
 *
 * Provides utilities for loading test fixtures (Markdown input and expected HTML output)
 * from the fixtures directory structure.
 */

import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load a fixture input file
 * @param {string} category - Fixture category (e.g., 'wikilink', 'callout')
 * @param {string} name - Fixture name without extension
 * @returns {Promise<string>} - File contents
 */
export async function loadInput(category, name) {
  const filePath = join(__dirname, category, `${name}.md`);
  try {
    return await readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Fixture not found: ${category}/${name}.md - ${error.message}`);
  }
}

/**
 * Load a fixture expected output file
 * @param {string} category - Fixture category
 * @param {string} name - Fixture name without extension
 * @returns {Promise<string>} - Expected output contents
 */
export async function loadExpected(category, name) {
  const filePath = join(__dirname, category, `${name}.expected.html`);
  try {
    return await readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Expected output not found: ${category}/${name}.expected.html - ${error.message}`);
  }
}

/**
 * List all fixtures in a category
 * @param {string} category - Fixture category
 * @returns {Promise<string[]>} - Array of fixture names (without extension)
 */
export async function listFixtures(category) {
  const categoryPath = join(__dirname, category);
  try {
    const files = await readdir(categoryPath);
    // Return unique fixture names (excluding .expected.html files)
    const fixtures = files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
    return fixtures;
  } catch (error) {
    throw new Error(`Category not found: ${category} - ${error.message}`);
  }
}

/**
 * Load both input and expected output for a fixture
 * @param {string} category - Fixture category
 * @param {string} name - Fixture name
 * @returns {Promise<{input: string, expected: string}>}
 */
export async function loadFixturePair(category, name) {
  const input = await loadInput(category, name);
  let expected = null;
  try {
    expected = await loadExpected(category, name);
  } catch {
    // Expected file is optional for some test cases
    expected = null;
  }
  return { input, expected };
}

/**
 * Get the fixtures directory path
 * @returns {string}
 */
export function getFixturesPath() {
  return __dirname;
}

/**
 * Load all fixtures in a category with their input and expected output
 * @param {string} category - Fixture category
 * @returns {Promise<Array<{name: string, input: string, expected: string|null}>>}
 */
export async function loadAllFixtures(category) {
  const fixtureNames = await listFixtures(category);
  const fixtures = [];

  for (const name of fixtureNames) {
    const { input, expected } = await loadFixturePair(category, name);
    fixtures.push({ name, input, expected });
  }

  return fixtures;
}

export default {
  loadInput,
  loadExpected,
  listFixtures,
  loadFixturePair,
  loadAllFixtures,
  getFixturesPath
};
