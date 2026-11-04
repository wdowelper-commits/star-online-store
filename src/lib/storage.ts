import {
  Profile,
  SellerProfile,
  Category,
  Product,
  Coupon,
  Order,
  Address,
  WishlistItem,
  OrderStatus,
  Notification,
  HeroSettings,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_SELLER_PROFILES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_ADDRESSES,
  INITIAL_ORDERS,
} from './seedData';
import { generateId } from './utils';

const STORAGE_KEYS = {
  PROFILES: 'zenvo_profiles',
  SELLER_PROFILES: 'zenvo_seller_profiles',
  CATEGORIES: 'zenvo_categories',
  PRODUCTS: 'zenvo_products',
  COUPONS: 'zenvo_coupons',
  ADDRESSES: 'zenvo_addresses',
  ORDERS: 'zenvo_orders',
  WISHLISTS: 'zenvo_wishlists',
  NOTIFICATIONS: 'zenvo_notifications',
  HERO_SETTINGS: 'zenvo_hero_settings',
};

export const INITIAL_HERO_SETTINGS: HeroSettings = {
  card1_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
  card1_tag: 'Generational Craft',
  card1_title: '100% Full-Grain Vegetable-Tanned Leather',
  card2_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  card2_tag: 'COD Guarantee',
  card2_title: 'Pay on Delivery at Doorstep with Zero Risk',
  bg_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1800&q=80',
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to localStorage (${key}):`, err);
  }
}

export const db = {
  // Hero Settings
  getHeroSettings: (): HeroSettings => getStorage(STORAGE_KEYS.HERO_SETTINGS, INITIAL_HERO_SETTINGS),
  updateHeroSettings: (updates: Partial<HeroSettings>): HeroSettings => {
    const current = db.getHeroSettings();
    const updated = { ...current, ...updates };
    setStorage(STORAGE_KEYS.HERO_SETTINGS, updated);
    return updated;
  },

  // Profiles
  getProfiles: (): Profile[] => {
    const profiles = getStorage(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    // Ensure admin user has username 'admin' and updated phone
    const adminIdx = profiles.findIndex((p) => p.email === 'admin@zenvo.com' || p.id === 'user_admin_001');
    if (adminIdx !== -1) {
      profiles[adminIdx].username = 'admin';
      profiles[adminIdx].phone = '03027628552';
    }
    return profiles;
  },
  saveProfiles: (profiles: Profile[]) => setStorage(STORAGE_KEYS.PROFILES, profiles),
  getProfileById: (id: string): Profile | undefined => {
    return db.getProfiles().find((p) => p.id === id);
  },
  getProfileByEmail: (identifier: string): Profile | undefined => {
    const clean = identifier.trim().toLowerCase();
    return db.getProfiles().find(
      (p) =>
        p.email.toLowerCase() === clean ||
        (p.username && p.username.toLowerCase() === clean) ||
        (clean === 'admin' && p.role === 'admin')
    );
  },
  updateProfile: (id: string, updates: Partial<Profile>): Profile => {
    const profiles = db.getProfiles();
    const index = profiles.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Profile not found');
    profiles[index] = { ...profiles[index], ...updates, updated_at: new Date().toISOString() };
    db.saveProfiles(profiles);
    return profiles[index];
  },
  createProfile: (profile: Profile): Profile => {
    const profiles = db.getProfiles();
    profiles.push(profile);
    db.saveProfiles(profiles);
    return profile;
  },

  // Seller Profiles
  getSellerProfiles: (): SellerProfile[] => getStorage(STORAGE_KEYS.SELLER_PROFILES, INITIAL_SELLER_PROFILES),
  saveSellerProfiles: (sellers: SellerProfile[]) => setStorage(STORAGE_KEYS.SELLER_PROFILES, sellers),
  getSellerProfileBySellerId: (sellerId: string): SellerProfile | undefined => {
    return db.getSellerProfiles().find((s) => s.seller_id === sellerId);
  },
  createSellerProfile: (seller: SellerProfile): SellerProfile => {
    const sellers = db.getSellerProfiles();
    sellers.push(seller);
    db.saveSellerProfiles(sellers);
    return seller;
  },
  updateSellerProfile: (id: string, updates: Partial<SellerProfile>): SellerProfile => {
    const sellers = db.getSellerProfiles();
    const index = sellers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Seller profile not found');
    sellers[index] = { ...sellers[index], ...updates, updated_at: new Date().toISOString() };
    db.saveSellerProfiles(sellers);
    return sellers[index];
  },

  // Categories
  getCategories: (): Category[] => getStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
  saveCategories: (categories: Category[]) => setStorage(STORAGE_KEYS.CATEGORIES, categories),
  createCategory: (category: Category): Category => {
    const categories = db.getCategories();
    categories.push(category);
    db.saveCategories(categories);
    return category;
  },
  updateCategory: (id: string, updates: Partial<Category>): Category => {
    const categories = db.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    categories[index] = { ...categories[index], ...updates };
    db.saveCategories(categories);
    return categories[index];
  },
  deleteCategory: (id: string): void => {
    const products = db.getProducts().filter((p) => !p.is_deleted && p.category_id === id);
    if (products.length > 0) {
      throw new Error('Cannot delete category: products are assigned to it.');
    }
    const categories = db.getCategories().filter((c) => c.id !== id);
    db.saveCategories(categories);
  },

  // Products
  getProducts: (): Product[] => getStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (products: Product[]) => setStorage(STORAGE_KEYS.PRODUCTS, products),
  getProductById: (id: string): Product | undefined => {
    return db.getProducts().find((p) => p.id === id && !p.is_deleted);
  },
  createProduct: (productData: Omit<Product, 'id' | 'order_count' | 'created_at' | 'updated_at'>): Product => {
    const products = db.getProducts();
    const newProduct: Product = {
      ...productData,
      id: generateId('prod'),
      order_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    products.unshift(newProduct);
    db.saveProducts(products);
    return newProduct;
  },
  updateProduct: (id: string, updates: Partial<Product>): Product => {
    const products = db.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');
    products[index] = {
      ...products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    db.saveProducts(products);
    return products[index];
  },
  deleteProduct: (id: string, hard: boolean = false): void => {
    if (hard) {
      const products = db.getProducts().filter((p) => p.id !== id);
      db.saveProducts(products);
    } else {
      db.updateProduct(id, { is_deleted: true });
    }
  },

  // Coupons
  getCoupons: (): Coupon[] => getStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS),
  saveCoupons: (coupons: Coupon[]) => setStorage(STORAGE_KEYS.COUPONS, coupons),
  getCouponByCode: (code: string): Coupon | undefined => {
    return db.getCoupons().find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  },
  createCoupon: (coupon: Coupon): Coupon => {
    const coupons = db.getCoupons();
    coupons.push(coupon);
    db.saveCoupons(coupons);
    return coupon;
  },
  updateCoupon: (id: string, updates: Partial<Coupon>): Coupon => {
    const coupons = db.getCoupons();
    const index = coupons.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Coupon not found');
    coupons[index] = { ...coupons[index], ...updates };
    db.saveCoupons(coupons);
    return coupons[index];
  },
  deleteCoupon: (id: string): void => {
    const coupons = db.getCoupons().filter((c) => c.id !== id);
    db.saveCoupons(coupons);
  },

  // Addresses
  getAddresses: (): Address[] => getStorage(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES),
  saveAddresses: (addresses: Address[]) => setStorage(STORAGE_KEYS.ADDRESSES, addresses),
  getCustomerAddresses: (customerId: string): Address[] => {
    return db.getAddresses().filter((a) => a.customer_id === customerId);
  },
  createAddress: (address: Address): Address => {
    const addresses = db.getAddresses();
    if (address.is_default) {
      addresses.forEach((a) => {
        if (a.customer_id === address.customer_id) a.is_default = false;
      });
    }
    addresses.push(address);
    db.saveAddresses(addresses);
    return address;
  },
  updateAddress: (id: string, updates: Partial<Address>): Address => {
    const addresses = db.getAddresses();
    const index = addresses.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Address not found');
    if (updates.is_default) {
      const customerId = addresses[index].customer_id;
      addresses.forEach((a) => {
        if (a.customer_id === customerId) a.is_default = false;
      });
    }
    addresses[index] = { ...addresses[index], ...updates };
    db.saveAddresses(addresses);
    return addresses[index];
  },
  deleteAddress: (id: string): void => {
    const addresses = db.getAddresses().filter((a) => a.id !== id);
    db.saveAddresses(addresses);
  },

  // Wishlists
  getWishlists: (): WishlistItem[] => getStorage(STORAGE_KEYS.WISHLISTS, []),
  saveWishlists: (wishlists: WishlistItem[]) => setStorage(STORAGE_KEYS.WISHLISTS, wishlists),
  getCustomerWishlist: (customerId: string): WishlistItem[] => {
    const items = db.getWishlists().filter((w) => w.customer_id === customerId);
    const products = db.getProducts();
    return items.map((w) => ({
      ...w,
      product: products.find((p) => p.id === w.product_id),
    }));
  },
  toggleWishlist: (customerId: string, productId: string): boolean => {
    const wishlists = db.getWishlists();
    const existingIndex = wishlists.findIndex(
      (w) => w.customer_id === customerId && w.product_id === productId
    );
    if (existingIndex > -1) {
      wishlists.splice(existingIndex, 1);
      db.saveWishlists(wishlists);
      return false; // Removed
    } else {
      wishlists.push({
        id: generateId('wish'),
        customer_id: customerId,
        product_id: productId,
        created_at: new Date().toISOString(),
      });
      db.saveWishlists(wishlists);
      return true; // Added
    }
  },

  // Orders
  getOrders: (): Order[] => getStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
  saveOrders: (orders: Order[]) => setStorage(STORAGE_KEYS.ORDERS, orders),
  getOrderById: (id: string): Order | undefined => {
    return db.getOrders().find((o) => o.id === id);
  },
  getCustomerOrders: (customerId: string): Order[] => {
    return db
      .getOrders()
      .filter((o) => o.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getSellerOrders: (sellerId: string): Order[] => {
    return db
      .getOrders()
      .filter((o) => o.items?.some((item) => item.seller_id === sellerId))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'status_history'>): Order => {
    const orders = db.getOrders();
    const count = orders.length + 1;
    const orderNumber = `ZNV-${new Date().getFullYear()}-${String(count).padStart(5, '0')}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: generateId('ord'),
      order_number: orderNumber,
      created_at: now,
      updated_at: now,
      status: 'placed',
      status_history: [
        {
          id: generateId('hist'),
          order_id: '',
          status: 'placed',
          note: 'Order placed via Cash on Delivery (COD)',
          created_at: now,
        },
      ],
    };

    newOrder.status_history![0].order_id = newOrder.id;

    // Trigger: Decrement product stock & increment order count
    if (newOrder.items) {
      newOrder.items.forEach((item) => {
        const product = db.getProductById(item.product_id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          db.updateProduct(product.id, {
            stock: newStock,
            order_count: product.order_count + item.quantity,
          });

          // Check low stock trigger
          if (newStock <= product.low_stock_threshold) {
            db.createNotification({
              id: generateId('notif'),
              user_id: product.seller_id,
              type: 'low_stock',
              title: `Low Stock Alert: ${product.title}`,
              message: `Only ${newStock} units remaining for "${product.title}".`,
              is_read: false,
              created_at: now,
            });
          }
        }
      });
    }

    // Trigger: Increment coupon used_count if applied
    if (newOrder.coupon_id) {
      const coupon = db.getCoupons().find((c) => c.id === newOrder.coupon_id);
      if (coupon) {
        db.updateCoupon(coupon.id, { used_count: coupon.used_count + 1 });
      }
    }

    orders.unshift(newOrder);
    db.saveOrders(orders);
    return newOrder;
  },
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string, changedBy?: string): Order => {
    const orders = db.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const oldOrder = orders[index];
    const prevStatus = oldOrder.status;

    // Trigger: Restore stock on cancel (Section 5.3 of Backend Schema)
    if (prevStatus !== 'cancelled' && newStatus === 'cancelled') {
      if (oldOrder.items) {
        oldOrder.items.forEach((item) => {
          const product = db.getProductById(item.product_id);
          if (product) {
            db.updateProduct(product.id, {
              stock: product.stock + item.quantity,
              order_count: Math.max(0, product.order_count - item.quantity),
            });
          }
        });
      }
    }

    const now = new Date().toISOString();
    const historyEntry = {
      id: generateId('hist'),
      order_id: orderId,
      status: newStatus,
      note: note || `Status updated from ${prevStatus} to ${newStatus}`,
      changed_by: changedBy,
      created_at: now,
    };

    const currentHistory = oldOrder.status_history || [];

    orders[index] = {
      ...oldOrder,
      status: newStatus,
      updated_at: now,
      status_history: [...currentHistory, historyEntry],
    };

    db.saveOrders(orders);
    return orders[index];
  },

  // Notifications
  getNotifications: (userId: string): Notification[] => {
    const notifs = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifs.filter((n) => n.user_id === userId);
  },
  createNotification: (notif: Notification): void => {
    const notifs = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.unshift(notif);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },
  markNotificationAsRead: (id: string): void => {
    const notifs = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const index = notifs.findIndex((n) => n.id === id);
    if (index > -1) {
      notifs[index].is_read = true;
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },
};
