/**
 * タグデータサービス
 * 記事のタグ情報を収集・管理するサービス
 */

import type { Tag, TagHierarchy, TagOptions, PostTagMetadata } from '../../types/tag';
import { DEFAULT_TAG_OPTIONS } from '../../types/tag';
import { buildTagHierarchy, flattenTagHierarchy, getTagWithDescendants } from './hierarchy';
import { normalizeTag, validateTagName } from './validation';

/**
 * タグサービスクラス
 */
export class TagService {
  private tags: Map<string, Tag> = new Map();
  private hierarchy: TagHierarchy = {};
  private options: Required<TagOptions>;
  
  constructor(options: TagOptions = {}) {
    this.options = { ...DEFAULT_TAG_OPTIONS, ...options };
  }
  
  /**
   * 記事からタグを収集して追加
   */
  addPostTags(
    postId: string,
    frontmatterTags: string[] = [],
    inlineTags: string[] = []
  ): PostTagMetadata {
    const processedFrontmatter: string[] = [];
    const processedInline: string[] = [];
    const allTags = new Set<string>();
    
    // frontmatterタグの処理
    frontmatterTags.forEach(tag => {
      const validation = validateTagName(tag, this.options);
      if (validation.isValid && validation.normalizedTag) {
        processedFrontmatter.push(validation.normalizedTag);
        allTags.add(validation.normalizedTag);
        this.incrementTagCount(validation.normalizedTag);
      }
    });
    
    // インラインタグの処理
    inlineTags.forEach(tag => {
      const validation = validateTagName(tag, this.options);
      if (validation.isValid && validation.normalizedTag) {
        processedInline.push(validation.normalizedTag);
        allTags.add(validation.normalizedTag);
        this.incrementTagCount(validation.normalizedTag);
      }
    });
    
    // 階層構造を再構築
    this.rebuildHierarchy();
    
    return {
      frontmatterTags: processedFrontmatter,
      inlineTags: processedInline,
      allTags: Array.from(allTags)
    };
  }
  
  /**
   * タグの使用回数をインクリメント
   */
  private incrementTagCount(tagName: string): void {
    let tag = this.tags.get(tagName);
    
    if (!tag) {
      // 新しいタグを作成
      const { parts, parent, level } = this.parseTagHierarchy(tagName);
      
      tag = {
        name: tagName,
        slug: this.tagToSlug(tagName),
        parent,
        children: [],
        count: 0,
        level
      };
      
      this.tags.set(tagName, tag);
    }
    
    tag.count++;
  }
  
  /**
   * 階層構造を再構築
   */
  private rebuildHierarchy(): void {
    const tagNames = Array.from(this.tags.keys());
    this.hierarchy = buildTagHierarchy(tagNames, this.options);
    
    // 子タグ情報を更新
    this.tags.forEach((tag, tagName) => {
      tag.children = this.getDirectChildren(tagName);
    });
  }
  
  /**
   * 直接の子タグを取得
   */
  private getDirectChildren(parentTag: string): string[] {
    const children: string[] = [];
    const parentLevel = parentTag.split(this.options.hierarchySeparator).length;
    
    this.tags.forEach((tag, tagName) => {
      if (tag.parent === parentTag && tag.level === parentLevel) {
        children.push(tagName);
      }
    });
    
    return children;
  }
  
  /**
   * 全タグを取得
   */
  getAllTags(): Tag[] {
    return Array.from(this.tags.values());
  }
  
  /**
   * 階層構造を取得
   */
  getTagHierarchy(): TagHierarchy {
    return this.hierarchy;
  }
  
  /**
   * 特定のタグを取得
   */
  getTag(tagName: string): Tag | undefined {
    const normalized = normalizeTag(tagName, this.options);
    return this.tags.get(normalized);
  }
  
  /**
   * タグが存在するかチェック
   */
  hasTag(tagName: string): boolean {
    const normalized = normalizeTag(tagName, this.options);
    return this.tags.has(normalized);
  }
  
  /**
   * 親タグとその子孫タグを全て取得（親タグによる包含検索）
   */
  getTagWithAllDescendants(tagName: string): Tag[] {
    return getTagWithDescendants(tagName, this.hierarchy, this.options);
  }
  
  /**
   * タグ完全一致検索
   */
  getExactTag(tagName: string): Tag | undefined {
    return this.getTag(tagName);
  }
  
  /**
   * 使用頻度の高いタグを取得
   */
  getMostUsedTags(limit: number = 10): Tag[] {
    return Array.from(this.tags.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  /**
   * 特定レベルのタグを取得
   */
  getTagsByLevel(level: number): Tag[] {
    return Array.from(this.tags.values())
      .filter(tag => tag.level === level);
  }
  
  /**
   * ルートレベルのタグを取得
   */
  getRootTags(): Tag[] {
    return this.getTagsByLevel(0);
  }
  
  /**
   * タグ名から部分検索
   */
  searchTags(query: string, limit: number = 20): Tag[] {
    const normalizedQuery = query.toLowerCase();
    
    return Array.from(this.tags.values())
      .filter(tag => 
        tag.name.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => {
        // 完全一致を優先
        const aExact = a.name.toLowerCase() === normalizedQuery ? 1 : 0;
        const bExact = b.name.toLowerCase() === normalizedQuery ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        
        // 使用頻度で並び替え
        return b.count - a.count;
      })
      .slice(0, limit);
  }
  
  /**
   * タグ統計情報を取得
   */
  getTagStatistics() {
    const allTags = this.getAllTags();
    const levelCounts: Record<number, number> = {};
    
    allTags.forEach(tag => {
      levelCounts[tag.level] = (levelCounts[tag.level] || 0) + 1;
    });
    
    return {
      totalTags: allTags.length,
      uniqueTags: allTags.length,
      mostUsedTags: this.getMostUsedTags(5).map(tag => ({
        tag,
        count: tag.count
      })),
      tagsByLevel: levelCounts
    };
  }
  
  /**
   * タグデータをクリア
   */
  clear(): void {
    this.tags.clear();
    this.hierarchy = {};
  }
  
  /**
   * タグの階層を解析
   */
  private parseTagHierarchy(tagName: string) {
    const parts = tagName.split(this.options.hierarchySeparator);
    return {
      parts,
      parent: parts.length > 1 
        ? parts.slice(0, -1).join(this.options.hierarchySeparator)
        : undefined,
      level: parts.length - 1
    };
  }
  
  /**
   * タグをスラッグに変換
   */
  private tagToSlug(tagName: string): string {
    return tagName
      .replace(new RegExp(this.options.hierarchySeparator, 'g'), '-')
      .toLowerCase();
  }
}

/**
 * グローバルタグサービスインスタンス
 */
export const globalTagService = new TagService();

/**
 * Astroコレクションからタグを収集する関数
 */
export async function collectTagsFromPosts(posts: any[]): Promise<TagService> {
  const tagService = new TagService();
  
  posts.forEach(post => {
    const frontmatterTags = post.data?.tags || [];
    const inlineTags = post.data?.processedTags || [];
    
    tagService.addPostTags(
      post.slug || post.id,
      frontmatterTags,
      inlineTags
    );
  });
  
  return tagService;
}