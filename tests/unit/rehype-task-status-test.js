import { rehype } from 'rehype';
import assert from 'assert';
import { describe, it } from 'node:test';
import rehypeTaskStatus from '../../src/plugins/rehype-task-status/index.js';

// Test helper to process HTML
async function processHtml(input, options = {}) {
  const processor = rehype()
    .data('settings', { fragment: true })
    .use(rehypeTaskStatus, options);

  const result = await processor.process(input);
  return String(result);
}

describe('rehype-task-status', () => {
  describe('Basic Functionality', () => {
    it('should transform unchecked checkbox to custom span', async () => {
      const input = '<ul><li><input type="checkbox"></li></ul>';
      const output = await processHtml(input);

      assert(output.includes('data-task-status="todo"'), 'Should contain todo status');
      assert(output.includes('class="task-checkbox"'), 'Should contain task-checkbox class');
      assert(output.includes('aria-hidden="true"'), 'Should contain aria-hidden attribute');
      assert(output.includes('<span class="task-icon"></span>'), 'Should contain task-icon span');
    });

    it('should transform checked checkbox to custom span', async () => {
      const input = '<ul><li><input type="checkbox" checked></li></ul>';
      const output = await processHtml(input);

      assert(output.includes('data-task-status="done"'), 'Should contain done status');
      assert(output.includes('class="task-checkbox"'), 'Should contain task-checkbox class');
    });

    it('should add accessibility label (sr-only)', async () => {
      const input = '<ul><li><input type="checkbox"></li></ul>';
      const output = await processHtml(input);

      assert(output.includes('<span class="sr-only">未完了</span>'), 'Should contain sr-only span with label');
    });

    it('should add accessibility label (sr-only) for checked item', async () => {
      const input = '<ul><li><input type="checkbox" checked></li></ul>';
      const output = await processHtml(input);

      assert(output.includes('<span class="sr-only">完了</span>'), 'Should contain sr-only span with label');
    });

    it('should add task-list-item class to parent li', async () => {
      const input = '<ul><li><input type="checkbox"></li></ul>';
      const output = await processHtml(input);

      assert(output.includes('<li class="task-list-item" data-task="todo">'), 'Should add class and data attribute to li');
    });
  });

  describe('Options', () => {
    it('should support custom className', async () => {
      const input = '<ul><li><input type="checkbox"></li></ul>';
      const output = await processHtml(input, { className: 'custom-checkbox' });

      assert(output.includes('class="custom-checkbox"'), 'Should use custom class name');
    });

    it('should disable accessibility features when option is false', async () => {
      const input = '<ul><li><input type="checkbox"></li></ul>';
      const output = await processHtml(input, { accessibility: false });

      assert(!output.includes('<span class="sr-only">'), 'Should not contain sr-only span');
    });
  });

  describe('Edge Cases', () => {
    it('should ignore inputs that are not checkboxes', async () => {
      const input = '<ul><li><input type="text"></li></ul>';
      const output = await processHtml(input);

      assert(output.includes('<input type="text">'), 'Should leave text input unchanged');
      assert(!output.includes('data-task-status'), 'Should not add task status');
    });

    it('should handle nested lists correctly', async () => {
      const input = `
        <ul>
          <li>
            <input type="checkbox" checked> Parent
            <ul>
              <li><input type="checkbox"> Child</li>
            </ul>
          </li>
        </ul>
      `;
      const output = await processHtml(input);

      // Check parent
      assert(output.includes('data-task="done"'), 'Parent should be done');

      // Check child
      assert(output.includes('data-task="todo"'), 'Child should be todo');
    });

    it('should preserve existing classes on li', async () => {
      const input = '<ul><li class="existing-class"><input type="checkbox"></li></ul>';
      const output = await processHtml(input);

      assert(output.includes('class="existing-class task-list-item"'), 'Should merge classes');
    });

    it('should not duplicate task-list-item class if already present', async () => {
      const input = '<ul><li class="task-list-item"><input type="checkbox"></li></ul>';
      const output = await processHtml(input);

      // Count occurrences of 'task-list-item'
      const count = (output.match(/task-list-item/g) || []).length;
      assert.strictEqual(count, 1, 'Should not duplicate class');
    });
  });
});
