import { create } from 'zustand';
import { Profile, SellerProfile } from '../types';
import { db } from '../lib/storage';

interface AuthState {
  user: Profile | null;
  sellerProfile: SellerProfile | null;
  isLoading: boolean;
  setUser: (profile: Profile | null) => void;
  setSellerProfile: (seller: SellerProfile | null) => void;
  signOut: () => void;
  refreshUser: () => void;
}

const STORAGE_AUTH_USER = 'zenvo_auth_user';

export const useAuthStore = create<AuthState>((set, get) => {
  // Load initially cached user
  let initialUser: Profile | null = null;
  let initialSeller: SellerProfile | null = null;

  try {
    const cached = localStorage.getItem(STORAGE_AUTH_USER);
    if (cached) {
      initialUser = JSON.parse(cached);
      if (initialUser) {
        // re-verify against db
        const live = db.getProfileById(initialUser.id);
        if (live) {
          initialUser = live;
          if (live.role === 'seller') {
            initialSeller = db.getSellerProfileBySellerId(live.id) || null;
          }
        }
      }
    }
  } catch {
    initialUser = null;
  }

  return {
    user: initialUser,
    sellerProfile: initialSeller,
    isLoading: false,
    setUser: (user) => {
      if (user) {
        localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
        let seller: SellerProfile | null = null;
        if (user.role === 'seller') {
          seller = db.getSellerProfileBySellerId(user.id) || null;
        }
        set({ user, sellerProfile: seller });
      } else {
        localStorage.removeItem(STORAGE_AUTH_USER);
        set({ user: null, sellerProfile: null });
      }
    },
    setSellerProfile: (sellerProfile) => set({ sellerProfile }),
    signOut: () => {
      localStorage.removeItem(STORAGE_AUTH_USER);
      set({ user: null, sellerProfile: null });
    },
    refreshUser: () => {
      const current = get().user;
      if (current) {
        const live = db.getProfileById(current.id);
        if (live) {
          localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(live));
          const seller = live.role === 'seller' ? db.getSellerProfileBySellerId(live.id) || null : null;
          set({ user: live, sellerProfile: seller });
        }
      }
    },
  };
});
