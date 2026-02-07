import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../src/components/BaseHead.astro');
const content = fs.readFileSync(filePath, 'utf8');

// Expected CSP directives
const expectedDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://giscus.app",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://giscus.app https://*.google-analytics.com https://stats.g.doubleclick.net",
  "frame-src https://giscus.app https://googleads.g.doubleclick.net https://www.youtube.com",
  "object-src 'none'",
  "base-uri 'self'"
];

// Check for meta tag
// Modified regex to handle multiline content and surrounding quotes carefully
const metaTagRegex = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"\s*\/>/;
// Note: The file content might have newlines if I used git merge diff without collapsing, but let's check.
// If the content attribute spans lines, the regex `[^"]+` matches newlines too.

const match = content.match(metaTagRegex);

if (!match) {
  console.error('❌ Content-Security-Policy meta tag not found in BaseHead.astro');
  // Debug: print file content around where we expect it
  console.log('File content snippet:');
  console.log(content.slice(0, 500));
  process.exit(1);
}

const cspContent = match[1];
console.log('✅ Found CSP meta tag:', cspContent);

// Check each directive
let missingDirectives = [];
for (const expected of expectedDirectives) {
  // Normalize whitespace for comparison
  const normalizedExpected = expected.replace(/\s+/g, ' ').trim();
  const normalizedContent = cspContent.replace(/\s+/g, ' ').trim();

  if (!normalizedContent.includes(normalizedExpected)) {
    missingDirectives.push(expected);
  }
}

if (missingDirectives.length > 0) {
  console.error('❌ CSP meta tag is missing expected directives:');
  missingDirectives.forEach(d => console.error(`   - ${d}`));
  process.exit(1);
}

console.log('✅ CSP meta tag contains all expected directives.');
process.exit(0);
