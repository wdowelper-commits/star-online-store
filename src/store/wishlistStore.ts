import { create } from 'zustand';
import { WishlistItem } from '../types';
import { db } from '../lib/storage';

interface WishlistState {
  items: WishlistItem[];
  loadWishlist: (customerId: string) => void;
  toggle: (customerId: string, productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loadWishlist: (customerId: string) => {
    const list = db.getCustomerWishlist(customerId);
    set({ items: list });
  },
  toggle: (customerId: string, productId: string) => {
    const added = db.toggleWishlist(customerId, productId);
    const list = db.getCustomerWishlist(customerId);
    set({ items: list });
    return added;
  },
  isWishlisted: (productId: string) => {
    return get().items.some((item) => item.product_id === productId);
  },
}));
