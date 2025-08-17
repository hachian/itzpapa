/**
 * タグの階層構造処理ユーティリティ
 */

import type { Tag, TagHierarchy, TagOptions } from '../../types/tag';
import { DEFAULT_TAG_OPTIONS } from '../../types/tag';
import { normalizeTag, parseTagHierarchy } from './validation';

/**
 * タグの配列から階層構造を構築する
 */
export function buildTagHierarchy(
  tags: string[],
  options: TagOptions = {}
): TagHierarchy {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  const hierarchy: TagHierarchy = {};
  const tagMap = new Map<string, Tag>();
  
  // まず全てのタグとその親タグを収集
  const allTags = new Set<string>();
  
  tags.forEach(tagName => {
    const normalized = normalizeTag(tagName, opts);
    const { parts } = parseTagHierarchy(normalized, opts);
    
    // このタグとその全ての親タグを追加
    for (let i = 0; i < parts.length; i++) {
      const partialTag = parts.slice(0, i + 1).join(opts.hierarchySeparator);
      allTags.add(partialTag);
    }
  });
  
  // 各タグのTag構造を作成
  allTags.forEach(tagName => {
    const { parts, parent, level } = parseTagHierarchy(tagName, opts);
    
    const tag: Tag = {
      name: tagName,
      slug: tagNameToSlug(tagName, opts),
      parent,
      children: [],
      count: 0,
      level
    };
    
    tagMap.set(tagName, tag);
  });
  
  // 親子関係を設定
  tagMap.forEach((tag, tagName) => {
    if (tag.parent) {
      const parentTag = tagMap.get(tag.parent);
      if (parentTag && !parentTag.children.includes(tagName)) {
        parentTag.children.push(tagName);
      }
    }
  });
  
  // 使用回数をカウント（元のタグリストに含まれるもののみ）
  tags.forEach(tagName => {
    const normalized = normalizeTag(tagName, opts);
    const tag = tagMap.get(normalized);
    if (tag) {
      tag.count++;
    }
  });
  
  // 階層構造を構築
  tagMap.forEach((tag, tagName) => {
    if (tag.level === 0) {
      // ルートレベルのタグ
      hierarchy[tagName] = {
        tag,
        children: buildSubHierarchy(tagName, tagMap, opts)
      };
    }
  });
  
  return hierarchy;
}

/**
 * サブ階層を再帰的に構築
 */
function buildSubHierarchy(
  parentName: string,
  tagMap: Map<string, Tag>,
  options: TagOptions
): TagHierarchy {
  const hierarchy: TagHierarchy = {};
  const parent = tagMap.get(parentName);
  
  if (!parent) return hierarchy;
  
  parent.children.forEach(childName => {
    const childTag = tagMap.get(childName);
    if (childTag) {
      hierarchy[childName] = {
        tag: childTag,
        children: buildSubHierarchy(childName, tagMap, options)
      };
    }
  });
  
  return hierarchy;
}

/**
 * タグ名をスラッグに変換
 */
function tagNameToSlug(tagName: string, options: TagOptions = {}): string {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  
  // 階層セパレーターをハイフンに置換
  let slug = tagName.replace(
    new RegExp(escapeRegExp(opts.hierarchySeparator), 'g'),
    '-'
  );
  
  // URLエンコード
  slug = encodeURIComponent(slug);
  
  return slug;
}

/**
 * 階層構造から全タグをフラットなリストとして取得
 */
export function flattenTagHierarchy(hierarchy: TagHierarchy): Tag[] {
  const tags: Tag[] = [];
  
  function traverse(node: TagHierarchy) {
    Object.values(node).forEach(({ tag, children }) => {
      tags.push(tag);
      if (children && Object.keys(children).length > 0) {
        traverse(children);
      }
    });
  }
  
  traverse(hierarchy);
  return tags;
}

/**
 * 特定のタグとその子孫タグを取得
 */
export function getTagWithDescendants(
  tagName: string,
  hierarchy: TagHierarchy,
  options: TagOptions = {}
): Tag[] {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  const normalized = normalizeTag(tagName, opts);
  const result: Tag[] = [];
  
  function findAndCollect(node: TagHierarchy, targetName: string): boolean {
    for (const [name, { tag, children }] of Object.entries(node)) {
      if (name === targetName) {
        // 見つかったら、このタグとすべての子孫を収集
        result.push(tag);
        collectDescendants(children);
        return true;
      }
      
      // 子ノードで検索
      if (children && Object.keys(children).length > 0) {
        if (findAndCollect(children, targetName)) {
          return true;
        }
      }
    }
    return false;
  }
  
  function collectDescendants(node: TagHierarchy) {
    Object.values(node).forEach(({ tag, children }) => {
      result.push(tag);
      if (children && Object.keys(children).length > 0) {
        collectDescendants(children);
      }
    });
  }
  
  findAndCollect(hierarchy, normalized);
  return result;
}

/**
 * タグの祖先タグを取得（自身を含む）
 */
export function getAncestorTags(
  tagName: string,
  options: TagOptions = {}
): string[] {
  const opts = { ...DEFAULT_TAG_OPTIONS, ...options };
  const normalized = normalizeTag(tagName, opts);
  const { parts } = parseTagHierarchy(normalized, opts);
  
  const ancestors: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    ancestors.push(parts.slice(0, i + 1).join(opts.hierarchySeparator));
  }
  
  return ancestors;
}

/**
 * 循環参照をチェック
 */
export function hasCircularReference(
  hierarchy: TagHierarchy
): { hasCircular: boolean; path?: string[] } {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];
  
  function checkNode(
    node: TagHierarchy,
    currentPath: string[]
  ): { hasCircular: boolean; path?: string[] } {
    for (const [name, { tag, children }] of Object.entries(node)) {
      if (recursionStack.has(name)) {
        // 循環参照を検出
        const cycleStart = currentPath.indexOf(name);
        return {
          hasCircular: true,
          path: currentPath.slice(cycleStart).concat(name)
        };
      }
      
      if (!visited.has(name)) {
        visited.add(name);
        recursionStack.add(name);
        
        if (children && Object.keys(children).length > 0) {
          const result = checkNode(children, [...currentPath, name]);
          if (result.hasCircular) {
            return result;
          }
        }
        
        recursionStack.delete(name);
      }
    }
    
    return { hasCircular: false };
  }
  
  return checkNode(hierarchy, path);
}

/**
 * 正規表現の特殊文字をエスケープ
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}