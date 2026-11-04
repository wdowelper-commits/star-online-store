import { create } from 'zustand';
import { CartItem, Product, Coupon } from '../types';

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const STORAGE_CART = 'zenvo_cart_items';
const STORAGE_COUPON = 'zenvo_cart_coupon';

export const useCartStore = create<CartState>((set, get) => {
  let initialItems: CartItem[] = [];
  let initialCoupon: Coupon | null = null;

  try {
    const raw = localStorage.getItem(STORAGE_CART);
    if (raw) initialItems = JSON.parse(raw);
    const rawC = localStorage.getItem(STORAGE_COUPON);
    if (rawC) initialCoupon = JSON.parse(rawC);
  } catch {
    initialItems = [];
  }

  const persist = (items: CartItem[], coupon: Coupon | null) => {
    try {
      localStorage.setItem(STORAGE_CART, JSON.stringify(items));
      if (coupon) {
        localStorage.setItem(STORAGE_COUPON, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(STORAGE_COUPON);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return {
    items: initialItems,
    appliedCoupon: initialCoupon,

    addItem: (product: Product, quantity: number = 1) => {
      if (product.stock <= 0) return;
      const current = get().items;
      const existingIndex = current.findIndex((item) => item.product.id === product.id);

      let updated: CartItem[];
      if (existingIndex > -1) {
        const currentQty = current[existingIndex].quantity;
        const newQty = Math.min(product.stock, Math.min(10, currentQty + quantity));
        updated = [...current];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          product,
        };
      } else {
        const safeQty = Math.min(product.stock, Math.min(10, quantity));
        updated = [...current, { product, quantity: safeQty }];
      }

      set({ items: updated });
      persist(updated, get().appliedCoupon);
    },

    removeItem: (productId: string) => {
      const updated = get().items.filter((item) => item.product.id !== productId);
      set({ items: updated });
      persist(updated, get().appliedCoupon);
    },

    updateQty: (productId: string, quantity: number) => {
      if (quantity <= 0) {
        get().removeItem(productId);
        return;
      }
      const updated = get().items.map((item) => {
        if (item.product.id === productId) {
          const maxAllowed = Math.min(item.product.stock, 10);
          return { ...item, quantity: Math.min(quantity, maxAllowed) };
        }
        return item;
      });
      set({ items: updated });
      persist(updated, get().appliedCoupon);
    },

    clearCart: () => {
      set({ items: [], appliedCoupon: null });
      persist([], null);
    },

    applyCoupon: (coupon: Coupon) => {
      set({ appliedCoupon: coupon });
      persist(get().items, coupon);
    },

    removeCoupon: () => {
      set({ appliedCoupon: null });
      persist(get().items, null);
    },

    getSubtotal: () => {
      return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    },

    getDiscountAmount: () => {
      const subtotal = get().getSubtotal();
      const coupon = get().appliedCoupon;
      if (!coupon || subtotal < coupon.min_order_value) return 0;

      if (coupon.discount_type === 'percentage') {
        return (subtotal * coupon.discount_value) / 100;
      } else {
        return Math.min(subtotal, coupon.discount_value);
      }
    },

    getTotal: () => {
      const subtotal = get().getSubtotal();
      const discount = get().getDiscountAmount();
      return Math.max(0, subtotal - discount);
    },

    getItemCount: () => {
      return get().items.reduce((sum, item) => sum + item.quantity, 0);
    },
  };
});
