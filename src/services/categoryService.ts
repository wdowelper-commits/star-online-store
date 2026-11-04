import { Category } from '../types';
import { db } from '../lib/storage';
import { generateId } from '../lib/utils';

export const categoryService = {
  getCategories: (): Category[] => {
    return db.getCategories().sort((a, b) => a.sort_order - b.sort_order);
  },

  getFeaturedCategories: (): Category[] => {
    return db
      .getCategories()
      .filter((c) => c.is_featured)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  createCategory: (data: Omit<Category, 'id' | 'created_at'>): Category => {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat: Category = {
      ...data,
      id: generateId('cat'),
      slug,
      created_at: new Date().toISOString(),
    };
    return db.createCategory(newCat);
  },

  updateCategory: (id: string, updates: Partial<Category>): Category => {
    return db.updateCategory(id, updates);
  },

  deleteCategory: (id: string): void => {
    db.deleteCategory(id);
  },
};
