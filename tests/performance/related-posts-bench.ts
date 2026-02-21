
import { getRelatedPosts } from '../../src/utils/related-posts/index.ts';
import type { CollectionEntry } from 'astro:content';

// Mock post generator
function createMockPosts(count: number): CollectionEntry<'blog'>[] {
  const posts: CollectionEntry<'blog'>[] = [];
  const tagsPool = ['javascript', 'typescript', 'react', 'vue', 'python', 'django', 'rust', 'go', 'java', 'kotlin'];
  const categoriesPool = ['tech', 'life', 'random', 'coding', 'design'];

  for (let i = 0; i < count; i++) {
    const numTags = Math.floor(Math.random() * 4); // 0-3 tags
    const postTags = [];
    // Ensure unique tags per post
    const usedTags = new Set();
    while (postTags.length < numTags) {
        const tag = tagsPool[Math.floor(Math.random() * tagsPool.length)];
        if (!usedTags.has(tag)) {
            usedTags.add(tag);
            postTags.push(tag);
        }
    }

    posts.push({
      id: `post-${i}`,
      slug: `post-${i}`,
      body: 'Content...',
      collection: 'blog',
      data: {
        title: `Post ${i}`,
        published: new Date(Date.now() - Math.random() * 10000000000),
        updated: Math.random() > 0.5 ? new Date() : undefined,
        tags: postTags,
        category: categoriesPool[Math.floor(Math.random() * categoriesPool.length)],
        draft: Math.random() < 0.1, // 10% draft
        description: 'Description',
      },
    } as unknown as CollectionEntry<'blog'>);
  }
  return posts;
}

const ITERATIONS = 100;
const POST_COUNT = 10000;

console.log(`Generating ${POST_COUNT} mock posts...`);
const allPosts = createMockPosts(POST_COUNT);

// Pick a post with tags to ensure we actually do some work
let currentPostIndex = 0;
while (currentPostIndex < allPosts.length && (!allPosts[currentPostIndex].data.tags || allPosts[currentPostIndex].data.tags.length === 0)) {
    currentPostIndex++;
}

if (currentPostIndex >= allPosts.length) {
    console.error("Could not find a post with tags!");
    process.exit(1);
}

const currentPost = allPosts[currentPostIndex];
const currentTags = currentPost.data.tags || [];
const currentCategory = currentPost.data.category;

console.log(`Current Post Tags: ${currentTags.join(', ')}`);
console.log(`Current Post Category: ${currentCategory}`);

console.log(`Running benchmark with ${ITERATIONS} iterations...`);

let totalDuration = 0;

// Warmup
for (let i = 0; i < 10; i++) {
  getRelatedPosts({
    currentPostId: currentPost.id,
    currentTags,
    currentCategory,
    allPosts,
    limit: 6,
  });
}

for (let i = 0; i < ITERATIONS; i++) {
  const start = performance.now();
  getRelatedPosts({
    currentPostId: currentPost.id,
    currentTags,
    currentCategory,
    allPosts,
    limit: 6,
  });
  const end = performance.now();
  totalDuration += (end - start);
}

const averageDuration = totalDuration / ITERATIONS;
console.log(`Average execution time: ${averageDuration.toFixed(4)} ms`);
