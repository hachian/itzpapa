import { remark } from 'remark';
import assert from 'assert';
import { describe, it } from 'node:test';

// Import will fail initially (RED phase)
import remarkTaskStatus from '../../src/plugins/remark-task-status/index.js';

// Test helper to process markdown
async function processMarkdown(input, options = {}) {
  const processor = remark().use(remarkTaskStatus, options);
  const result = await processor.process(input);
  return String(result);
}

describe('remark-task-status', () => {
  describe('基本タスクステータスの検出', () => {
    it('should detect todo status (space)', async () => {
      const input = '- [ ] Task item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="todo"'), 'Should contain todo status');
    });

    it('should detect done status (x)', async () => {
      const input = '- [x] Completed task';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="done"'), 'Should contain done status');
    });

    it('should detect done status (X)', async () => {
      const input = '- [X] Completed task';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="done"'), 'Should contain done status');
    });

    it('should detect incomplete status (/)', async () => {
      const input = '- [/] In progress task';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="incomplete"'), 'Should contain incomplete status');
    });

    it('should detect canceled status (-)', async () => {
      const input = '- [-] Canceled task';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="canceled"'), 'Should contain canceled status');
    });
  });

  describe('スケジューリング関連ステータスの検出', () => {
    it('should detect forwarded status (>)', async () => {
      const input = '- [>] Forwarded task';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="forwarded"'), 'Should contain forwarded status');
    });

    it('should detect scheduling status (<)', async () => {
      const input = '- [<] Scheduling task';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="scheduling"'), 'Should contain scheduling status');
    });
  });

  describe('重要度・状態マーカーの検出', () => {
    it('should detect question status (?)', async () => {
      const input = '- [?] Question item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="question"'), 'Should contain question status');
    });

    it('should detect important status (!)', async () => {
      const input = '- [!] Important item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="important"'), 'Should contain important status');
    });

    it('should detect star status (*)', async () => {
      const input = '- [*] Starred item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="star"'), 'Should contain star status');
    });
  });

  describe('参照・情報マーカーの検出', () => {
    it('should detect quote status (")', async () => {
      const input = '- ["] Quote item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="quote"'), 'Should contain quote status');
    });

    it('should detect location status (l)', async () => {
      const input = '- [l] Location item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="location"'), 'Should contain location status');
    });

    it('should detect bookmark status (b)', async () => {
      const input = '- [b] Bookmark item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="bookmark"'), 'Should contain bookmark status');
    });

    it('should detect information status (i)', async () => {
      const input = '- [i] Info item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="information"'), 'Should contain information status');
    });
  });

  describe('アイデア・評価マーカーの検出', () => {
    it('should detect savings status (S)', async () => {
      const input = '- [S] Savings item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="savings"'), 'Should contain savings status');
    });

    it('should detect idea status (I)', async () => {
      const input = '- [I] Idea item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="idea"'), 'Should contain idea status');
    });

    it('should detect pros status (p)', async () => {
      const input = '- [p] Pros item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="pros"'), 'Should contain pros status');
    });

    it('should detect cons status (c)', async () => {
      const input = '- [c] Cons item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="cons"'), 'Should contain cons status');
    });
  });

  describe('アクション・結果マーカーの検出', () => {
    it('should detect fire status (f)', async () => {
      const input = '- [f] Urgent item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="fire"'), 'Should contain fire status');
    });

    it('should detect key status (k)', async () => {
      const input = '- [k] Key item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="key"'), 'Should contain key status');
    });

    it('should detect win status (w)', async () => {
      const input = '- [w] Win item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="win"'), 'Should contain win status');
    });

    it('should detect up status (u)', async () => {
      const input = '- [u] Up item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="up"'), 'Should contain up status');
    });

    it('should detect down status (d)', async () => {
      const input = '- [d] Down item';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="down"'), 'Should contain down status');
    });
  });

  describe('未知のステータス処理', () => {
    it('should handle unknown status (z) with fallback', async () => {
      const input = '- [z] Unknown status';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="unknown"'), 'Should fallback to unknown status');
    });

    it('should handle multi-character in brackets as regular list', async () => {
      const input = '- [ab] Not a task';
      const output = await processMarkdown(input);
      // Should remain as regular list item, not converted
      assert(!output.includes('data-task-status'), 'Should not have task status');
    });
  });

  describe('ステータスマッピング', () => {
    const statusMapping = {
      ' ': 'todo',
      'x': 'done',
      'X': 'done',
      '/': 'incomplete',
      '-': 'canceled',
      '>': 'forwarded',
      '<': 'scheduling',
      '?': 'question',
      '!': 'important',
      '*': 'star',
      '"': 'quote',
      'l': 'location',
      'b': 'bookmark',
      'i': 'information',
      'S': 'savings',
      'I': 'idea',
      'p': 'pros',
      'c': 'cons',
      'f': 'fire',
      'k': 'key',
      'w': 'win',
      'u': 'up',
      'd': 'down'
    };

    for (const [char, name] of Object.entries(statusMapping)) {
      it(`should map '${char}' to '${name}'`, async () => {
        const input = `- [${char}] Test task`;
        const output = await processMarkdown(input);
        assert(output.includes(`data-task-status="${name}"`), `Should map ${char} to ${name}`);
      });
    }
  });

  describe('特殊ケース', () => {
    it('should not process task syntax in code blocks', async () => {
      const input = '```\n- [x] Code block task\n```';
      const output = await processMarkdown(input);
      assert(!output.includes('data-task-status'), 'Should not process in code blocks');
    });

    it('should not process task syntax in inline code', async () => {
      const input = 'Text with `- [x] inline code`';
      const output = await processMarkdown(input);
      assert(!output.includes('data-task-status'), 'Should not process in inline code');
    });

    it('should handle nested lists', async () => {
      const input = '- [x] Parent task\n  - [/] Nested task';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="done"'), 'Should handle parent task');
      assert(output.includes('data-task-status="incomplete"'), 'Should handle nested task');
    });

    it('should handle multiple tasks in same list', async () => {
      const input = '- [x] First task\n- [ ] Second task\n- [!] Third task';
      const output = await processMarkdown(input);
      assert(output.includes('data-task-status="done"'), 'Should handle first task');
      assert(output.includes('data-task-status="todo"'), 'Should handle second task');
      assert(output.includes('data-task-status="important"'), 'Should handle third task');
    });
  });

  describe('プラグインオプション', () => {
    it('should use custom className when provided', async () => {
      const input = '- [x] Task';
      const output = await processMarkdown(input, { className: 'custom-task' });
      assert(output.includes('class="custom-task"'), 'Should use custom className');
    });

    it('should be disabled when enabled=false', async () => {
      const input = '- [x] Task';
      const output = await processMarkdown(input, { enabled: false });
      assert(!output.includes('data-task-status'), 'Should not process when disabled');
    });
  });
});
