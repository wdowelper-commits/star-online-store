import { Profile, SellerProfile, Product, Order } from '../types';
import { db } from '../lib/storage';

export interface AdminDashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  totalSellers: number;
  pendingSellersCount: number;
  lowStockProductsCount: number;
}

export const adminService = {
  getDashboardStats: (): AdminDashboardStats => {
    const orders = db.getOrders();
    const products = db.getProducts().filter((p) => !p.is_deleted);
    const profiles = db.getProfiles();
    const sellers = profiles.filter((p) => p.role === 'seller');
    const customers = profiles.filter((p) => p.role === 'customer');
    const pendingSellers = sellers.filter((p) => p.status === 'pending');
    const lowStock = products.filter((p) => p.stock <= p.low_stock_threshold);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o) => new Date(o.created_at).getTime() >= today.getTime());
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      totalProducts: products.length,
      totalUsers: customers.length,
      totalSellers: sellers.length,
      pendingSellersCount: pendingSellers.length,
      lowStockProductsCount: lowStock.length,
    };
  },

  getAllSellers: (): Array<{ profile: Profile; store?: SellerProfile; productCount: number }> => {
    const profiles = db.getProfiles().filter((p) => p.role === 'seller');
    const stores = db.getSellerProfiles();
    const products = db.getProducts().filter((p) => !p.is_deleted);

    return profiles.map((profile) => ({
      profile,
      store: stores.find((s) => s.seller_id === profile.id),
      productCount: products.filter((p) => p.seller_id === profile.id).length,
    }));
  },

  approveSellerApplication: (sellerId: string): Profile => {
    const updated = db.updateProfile(sellerId, { status: 'active' });
    db.createNotification({
      id: `notif_${Date.now()}`,
      user_id: sellerId,
      type: 'seller_approved',
      title: 'Seller Application Approved!',
      message: 'Congratulations! Your seller store application has been approved. You can now add products and start selling.',
      is_read: false,
      created_at: new Date().toISOString(),
    });
    return updated;
  },

  rejectSellerApplication: (sellerId: string): Profile => {
    return db.updateProfile(sellerId, { status: 'suspended' });
  },

  toggleUserSuspension: (userId: string): Profile => {
    const user = db.getProfileById(userId);
    if (!user) throw new Error('User not found');
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    return db.updateProfile(userId, { status: newStatus });
  },

  getAllCustomers: (): Array<{ profile: Profile; orderCount: number; totalSpent: number }> => {
    const profiles = db.getProfiles().filter((p) => p.role === 'customer');
    const orders = db.getOrders();

    return profiles.map((p) => {
      const userOrders = orders.filter((o) => o.customer_id === p.id);
      const spent = userOrders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);
      return {
        profile: p,
        orderCount: userOrders.length,
        totalSpent: spent,
      };
    });
  },

  getRecentOrders: (limit: number = 10): Order[] => {
    return db.getOrders().slice(0, limit);
  },
};
