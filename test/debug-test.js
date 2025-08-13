import { remark } from 'remark';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';
import { inspect } from 'util';

async function debugTest() {
  const input = 'これは [[../page/index.md]] へのリンクです。';
  
  console.log('Input:', input);
  console.log('---');
  
  const processor = remark().use(remarkWikilink);
  const result = await processor.run(processor.parse(input));
  
  console.log('AST Output:');
  console.log(inspect(result, { depth: null, colors: true }));
}

debugTest().catch(console.error);