#!/usr/bin/env node
/**
 * Frontmatter Migration Script
 *
 * Migrates frontmatter fields:
 * - pubDate → published
 * - heroImage → image
 * - updatedDate → updated
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = './src/content/blog';

// Field mapping: old name → new name
const FIELD_MAPPING = {
  pubDate: 'published',
  heroImage: 'image',
  updatedDate: 'updated',
};

/**
 * Find all markdown files in the blog directory
 */
function findMarkdownFiles(dir) {
  const files = [];

  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }

  scanDir(dir);
  return files;
}

/**
 * Migrate frontmatter fields in a single file
 * @returns {object} Migration result with changed fields
 */
function migrateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(content);

  const changes = [];
  const newData = { ...parsed.data };

  // Rename fields according to mapping
  for (const [oldName, newName] of Object.entries(FIELD_MAPPING)) {
    if (oldName in newData) {
      newData[newName] = newData[oldName];
      delete newData[oldName];
      changes.push(`${oldName} → ${newName}`);
    }
  }

  // Only write if there were changes
  if (changes.length > 0) {
    const newContent = matter.stringify(parsed.content, newData);
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  return {
    file: filePath,
    changes,
    hasChanges: changes.length > 0,
  };
}

/**
 * Main migration function
 */
function main() {
  console.log('🚀 Starting frontmatter migration...\n');
  console.log(`📁 Scanning: ${BLOG_DIR}\n`);

  const files = findMarkdownFiles(BLOG_DIR);
  console.log(`📄 Found ${files.length} markdown files\n`);

  let migratedCount = 0;
  let unchangedCount = 0;

  for (const file of files) {
    const result = migrateFile(file);

    if (result.hasChanges) {
      migratedCount++;
      const relativePath = path.relative('.', result.file);
      console.log(`✅ ${relativePath}`);
      console.log(`   Changes: ${result.changes.join(', ')}`);
    } else {
      unchangedCount++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   - Migrated: ${migratedCount} files`);
  console.log(`   - Unchanged: ${unchangedCount} files`);
  console.log(`   - Total: ${files.length} files`);
  console.log('\n✨ Migration complete!');
}

main();
