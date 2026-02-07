import { performance } from 'node:perf_hooks';

// Current implementation
function rewriteHtmlImageUrlsLegacy(content, urlMap) {
  let replacements = 0;
  let newContent = content;

  for (const [localPath, externalUrl] of urlMap) {
    const escapedPath = localPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`(src=["'])/(${escapedPath})(["'])`, 'g'),
      new RegExp(`(srcset=["'][^"']*?)/(${escapedPath})(\\s|,)`, 'g'),
      new RegExp(`(href=["'])/(${escapedPath})(["'])`, 'g'),
      new RegExp(`(content=["'])/(${escapedPath})(["'])`, 'g'),
      new RegExp(`(content=["'])https?://[^/]+/(${escapedPath})(["'])`, 'g'),
      new RegExp(`(href=["'])https?://[^/]+/(${escapedPath})(["'])`, 'g'),
    ];

    for (const pattern of patterns) {
      const before = newContent;
      newContent = newContent.replace(pattern, (match, prefix, path, suffix) => {
        return `${prefix}${externalUrl}${suffix}`;
      });
      if (newContent !== before) {
        replacements++;
      }
    }
  }

  return { replacements, content: newContent };
}

// Optimized implementation
function rewriteHtmlImageUrlsOptimized(content, urlMap) {
  let replacements = 0;

  // Regex to match attributes: src, srcset, href, content
  // Captures: 1=attr, 2=quote, 3=value
  const attrRegex = /(src|srcset|href|content)=(["'])(.*?)\2/g;

  const newContent = content.replace(attrRegex, (match, attr, quote, value) => {
    let newValue = value;
    let modified = false;

    if (attr === 'srcset') {
        // Handle srcset: match paths starting with /
        newValue = value.replace(/(\s|,|^)\/([^\s,]+)/g, (m, prefix, key) => {
            if (urlMap.has(key)) {
                return `${prefix}${urlMap.get(key)}`;
            }
            return m;
        });
        if (newValue !== value) modified = true;

    } else {
        // src, href, content
        if (value.startsWith('/')) {
            const key = value.slice(1);
            if (urlMap.has(key)) {
                newValue = urlMap.get(key);
                modified = true;
            }
        } else if (value.startsWith('http')) {
             const match = value.match(/^https?:\/\/[^\/]+\/(.+)$/);
             if (match) {
                 const key = match[1];
                 if (urlMap.has(key)) {
                     newValue = urlMap.get(key);
                     modified = true;
                 }
             }
        }
    }

    if (modified) {
        replacements++;
        return `${attr}=${quote}${newValue}${quote}`;
    }

    return match;
  });

  return { replacements, content: newContent };
}

function generateMockData(imageCount, htmlSizeMultiplier) {
    const urlMap = new Map();
    const images = [];

    for (let i = 0; i < imageCount; i++) {
        const path = `_astro/image_${i}.hash.png`;
        const url = `https://cdn.example.com/image_${i}.hash.png`;
        urlMap.set(path, url);
        images.push(path);
    }

    let html = `<html><body>`;
    for (let i = 0; i < htmlSizeMultiplier; i++) {
        html += `<div>Some text content here...</div>`;
        if (i < imageCount) {
             html += `<img src="/${images[i]}" />`;
             html += `<link rel="preload" href="/${images[i]}" as="image">`;
             // Use different image for second srcset item to avoid legacy bug
             const otherImg = (i + 1 < imageCount) ? images[i+1] : images[0];
             html += `<img srcset="/${images[i]} 1x, /${otherImg} 2x" />`;
             html += `<meta content="https://mysite.com/${images[i]}" />`;
        }
    }
    html += `</body></html>`;

    return { urlMap, html };
}

async function runBenchmark() {
    const imageCount = 1000;
    const htmlSizeMultiplier = 1000;
    console.log(`Generating mock data with ${imageCount} images...`);
    const { urlMap, html } = generateMockData(imageCount, htmlSizeMultiplier);
    console.log(`HTML size: ${(html.length / 1024).toFixed(2)} KB`);

    console.log('Running Legacy Implementation...');
    const startLegacy = performance.now();
    const resultLegacy = rewriteHtmlImageUrlsLegacy(html, urlMap);
    const endLegacy = performance.now();
    console.log(`Legacy Time: ${(endLegacy - startLegacy).toFixed(2)} ms`);
    console.log(`Replacements: ${resultLegacy.replacements}`);

    console.log('Running Optimized Implementation...');
    const startOpt = performance.now();
    const resultOpt = rewriteHtmlImageUrlsOptimized(html, urlMap);
    const endOpt = performance.now();
    console.log(`Optimized Time: ${(endOpt - startOpt).toFixed(2)} ms`);
    console.log(`Replacements: ${resultOpt.replacements}`);

    if (resultLegacy.content === resultOpt.content) {
        console.log('SUCCESS: Outputs match!');
    } else {
        console.log('FAILURE: Outputs do not match!');
        // Find first difference
        for(let i=0; i<resultLegacy.content.length; i++) {
            if (resultLegacy.content[i] !== resultOpt.content[i]) {
                console.log(`Diff at index ${i}:`);
                console.log(`Legacy: ...${resultLegacy.content.substring(i, i+50)}...`);
                console.log(`Optimi: ...${resultOpt.content.substring(i, i+50)}...`);
                break;
            }
        }
    }
}

runBenchmark();
