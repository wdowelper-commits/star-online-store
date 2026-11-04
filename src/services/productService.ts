import { Product } from '../types';
import { db } from '../lib/storage';

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  sellerId?: string;
  approvedOnly?: boolean;
  activeOnly?: boolean;
}

export const productService = {
  getProducts: (filters: ProductFilters = {}): { products: Product[]; total: number } => {
    let list = db.getProducts().filter((p) => !p.is_deleted);

    // Default public filtering
    if (filters.approvedOnly !== false) {
      list = list.filter((p) => p.is_approved);
    }
    if (filters.activeOnly !== false) {
      list = list.filter((p) => p.is_active);
    }

    if (filters.category) {
      list = list.filter((p) => p.category_id === filters.category);
    }

    if (filters.sellerId) {
      list = list.filter((p) => p.seller_id === filters.sellerId);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.category_name && p.category_name.toLowerCase().includes(q)) ||
          (p.seller_store_name && p.seller_store_name.toLowerCase().includes(q))
      );
    }

    if (filters.minPrice !== undefined) {
      list = list.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        list.sort((a, b) => b.order_count - a.order_count);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return { products: list, total: list.length };
  },

  getProductById: (id: string): Product | undefined => {
    return db.getProductById(id);
  },

  getProductsBySeller: (sellerId: string): Product[] => {
    return db
      .getProducts()
      .filter((p) => !p.is_deleted && p.seller_id === sellerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getAllProductsAdmin: (): Product[] => {
    return db
      .getProducts()
      .filter((p) => !p.is_deleted)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  createProduct: (data: Omit<Product, 'id' | 'order_count' | 'created_at' | 'updated_at'>): Product => {
    return db.createProduct(data);
  },

  updateProduct: (id: string, updates: Partial<Product>): Product => {
    return db.updateProduct(id, updates);
  },

  deleteProduct: (id: string): void => {
    db.deleteProduct(id, false); // Soft delete
  },

  toggleActive: (id: string): Product => {
    const p = db.getProductById(id);
    if (!p) throw new Error('Product not found');
    return db.updateProduct(id, { is_active: !p.is_active });
  },

  approveProduct: (id: string, isApproved: boolean): Product => {
    return db.updateProduct(id, { is_approved: isApproved });
  },
};
