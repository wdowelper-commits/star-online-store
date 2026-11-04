import { SellerProfile, Product, Order } from '../types';
import { db } from '../lib/storage';

export interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
}

export const sellerService = {
  getSellerProfile: (sellerId: string): SellerProfile | undefined => {
    return db.getSellerProfileBySellerId(sellerId);
  },

  updateSellerProfile: (id: string, updates: Partial<SellerProfile>): SellerProfile => {
    return db.updateSellerProfile(id, updates);
  },

  getSellerStats: (sellerId: string): SellerStats => {
    const products = db.getProducts().filter((p) => !p.is_deleted && p.seller_id === sellerId);
    const lowStock = products.filter((p) => p.stock <= p.low_stock_threshold);
    const sellerOrders = db.getSellerOrders(sellerId);

    // Calculate revenue from seller's items in delivered or non-cancelled orders
    let totalRevenue = 0;
    sellerOrders.forEach((order) => {
      if (order.status !== 'cancelled' && order.items) {
        order.items.forEach((item) => {
          if (item.seller_id === sellerId) {
            totalRevenue += item.line_total;
          }
        });
      }
    });

    return {
      totalProducts: products.length,
      totalOrders: sellerOrders.length,
      totalRevenue,
      lowStockCount: lowStock.length,
    };
  },

  getSellerLowStockProducts: (sellerId: string): Product[] => {
    return db
      .getProducts()
      .filter((p) => !p.is_deleted && p.seller_id === sellerId && p.stock <= p.low_stock_threshold);
  },

  getRecentSellerOrders: (sellerId: string, limit: number = 5): Order[] => {
    return db.getSellerOrders(sellerId).slice(0, limit);
  },
};
