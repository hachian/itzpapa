import { describe, it } from 'node:test';
import assert from 'node:assert';
import { remark } from 'remark';
import remarkWikilink from '../src/plugins/remark-wikilink/index.js';

describe('Image Wikilink Plugin', () => {
  const processor = remark().use(remarkWikilink);

  it('should convert basic image wikilink to image node', async () => {
    const markdown = '![[test-image.png]]';
    const result = await processor.run(processor.parse(markdown));
    
    assert.strictEqual(result.children[0].children[0].type, 'image');
    assert.strictEqual(result.children[0].children[0].url, './test-image.png');
    assert.strictEqual(result.children[0].children[0].alt, 'test-image');
  });

  it('should handle image wikilink with alt text', async () => {
    const markdown = '![[test-image.png|Custom alt text]]';
    const result = await processor.run(processor.parse(markdown));
    
    assert.strictEqual(result.children[0].children[0].type, 'image');
    assert.strictEqual(result.children[0].children[0].url, './test-image.png');
    assert.strictEqual(result.children[0].children[0].alt, 'Custom alt text');
  });

  it('should handle relative path image wikilinks', async () => {
    const markdown = '![[../images/photo.jpg]]';
    const result = await processor.run(processor.parse(markdown));
    
    assert.strictEqual(result.children[0].children[0].type, 'image');
    assert.strictEqual(result.children[0].children[0].url, '../images/photo.jpg');
    assert.strictEqual(result.children[0].children[0].alt, 'photo');
  });

  it('should handle image wikilinks with directory path', async () => {
    const markdown = '![[assets/screenshots/screen1.png]]';
    const result = await processor.run(processor.parse(markdown));
    
    assert.strictEqual(result.children[0].children[0].type, 'image');
    assert.strictEqual(result.children[0].children[0].url, './assets/screenshots/screen1.png');
    assert.strictEqual(result.children[0].children[0].alt, 'screen1');
  });

  it('should handle mixed content with text and image wikilinks', async () => {
    const markdown = 'Here is an image: ![[photo.jpg]] and some text after.';
    const result = await processor.run(processor.parse(markdown));
    
    const children = result.children[0].children;
    assert.strictEqual(children[0].type, 'text');
    assert.strictEqual(children[0].value, 'Here is an image: ');
    assert.strictEqual(children[1].type, 'image');
    assert.strictEqual(children[1].url, './photo.jpg');
    assert.strictEqual(children[2].type, 'text');
    assert.strictEqual(children[2].value, ' and some text after.');
  });

  it('should handle multiple image wikilinks in one paragraph', async () => {
    const markdown = '![[image1.png]] some text ![[image2.jpg|Alt text]]';
    const result = await processor.run(processor.parse(markdown));
    
    const children = result.children[0].children;
    assert.strictEqual(children[0].type, 'image');
    assert.strictEqual(children[0].url, './image1.png');
    assert.strictEqual(children[1].type, 'text');
    assert.strictEqual(children[1].value, ' some text ');
    assert.strictEqual(children[2].type, 'image');
    assert.strictEqual(children[2].url, './image2.jpg');
    assert.strictEqual(children[2].alt, 'Alt text');
  });

  it('should not convert regular wikilinks to images', async () => {
    const markdown = '[[regular-link.md]]';
    const result = await processor.run(processor.parse(markdown));
    
    // 通常のwikilinkはlinkノードになるはず
    assert.strictEqual(result.children[0].children[0].type, 'link');
    assert.notStrictEqual(result.children[0].children[0].type, 'image');
  });

  it('should handle image wikilinks with spaces in filename', async () => {
    const markdown = '![[my image file.png]]';
    const result = await processor.run(processor.parse(markdown));
    
    assert.strictEqual(result.children[0].children[0].type, 'image');
    assert.strictEqual(result.children[0].children[0].url, './my image file.png');
    assert.strictEqual(result.children[0].children[0].alt, 'my image file');
  });

  it('should handle Japanese filenames', async () => {
    const markdown = '![[画像ファイル.png|日本語の説明]]';
    const result = await processor.run(processor.parse(markdown));
    
    assert.strictEqual(result.children[0].children[0].type, 'image');
    assert.strictEqual(result.children[0].children[0].url, './画像ファイル.png');
    assert.strictEqual(result.children[0].children[0].alt, '日本語の説明');
  });

  it('should handle image with absolute path starting with /', async () => {
    const markdown = '![[/images/absolute-path.png]]';
    const result = await processor.run(processor.parse(markdown));
    
    assert.strictEqual(result.children[0].children[0].type, 'image');
    assert.strictEqual(result.children[0].children[0].url, '/images/absolute-path.png');
    assert.strictEqual(result.children[0].children[0].alt, 'absolute-path');
  });
});