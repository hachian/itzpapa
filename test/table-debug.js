import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';
import { inspect } from 'util';

const tableInput = `| タイプ | リンク | 説明 |
|------|-------|-----|
| Wikilink | [[../ofm-test/index.md]] | 内部リンク |
| エイリアス付き | [[../link-test/index.md|テスト]] | カスタム表示名 |`;

async function debugTable() {
  console.log('Input:');
  console.log(tableInput);
  console.log('\n---\n');
  
  // GFMなしで処理
  console.log('Without GFM:');
  const processor1 = remark().use(remarkWikilink);
  const ast1 = processor1.runSync(processor1.parse(tableInput));
  console.log(inspect(ast1, { depth: null, colors: true }));
  
  console.log('\n---\n');
  
  // GFMありで処理（テーブルサポート）
  console.log('With GFM (table support):');
  const processor2 = remark().use(remarkGfm).use(remarkWikilink);
  const ast2 = processor2.runSync(processor2.parse(tableInput));
  console.log(inspect(ast2, { depth: null, colors: true }));
}

debugTable().catch(console.error);