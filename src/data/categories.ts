import type { Category } from '../types';

/** Traverse presentation categories without imposing a backend hierarchy/schema. */
export function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap(category => [category, ...flattenCategories(category.children ?? [])]);
}
