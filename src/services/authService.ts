import { Profile, SellerProfile, UserRole } from '../types';
import { db } from '../lib/storage';
import { generateId } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface SignUpData {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  storeName?: string;
  storeDescription?: string;
  storePhone?: string;
}

export const authService = {
  signUp: async (data: SignUpData): Promise<{ user: Profile; seller?: SellerProfile }> => {
    // Check if email already exists
    const existing = db.getProfileByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const userId = generateId('user');
    const now = new Date().toISOString();
    const isSeller = data.role === 'seller';

    // In accordance with Business Rule 1 & Schema:
    // Seller starts with status = 'pending' awaiting admin approval
    const profile: Profile = {
      id: userId,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone || data.storePhone || '',
      role: data.role,
      status: isSeller ? 'pending' : 'active',
      created_at: now,
      updated_at: now,
    };

    db.createProfile(profile);

    let sellerProfile: SellerProfile | undefined;
    if (isSeller) {
      sellerProfile = {
        id: generateId('seller'),
        seller_id: userId,
        store_name: data.storeName || `${data.fullName}'s Store`,
        store_slug: (data.storeName || data.fullName).toLowerCase().replace(/[^a-z0-9]/g, '-'),
        store_description: data.storeDescription || '',
        phone: data.storePhone || data.phone || '',
        is_featured: false,
        created_at: now,
        updated_at: now,
      };
      db.createSellerProfile(sellerProfile);
    }

    return { user: profile, seller: sellerProfile };
  },

  signInWithPassword: async (identifier: string, password?: string): Promise<Profile> => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Check for admin login credentials
    if (cleanId === 'admin' || cleanId === 'admin@zenvo.com') {
      if (password && password !== 'admin123@#') {
        throw new Error('Incorrect password. For admin panel access, enter: admin123@#');
      }
      return db.getAdminProfile();
    }

    const profile = db.getProfileByEmail(identifier);
    if (!profile) {
      throw new Error('No user account found with this username or email.');
    }
    if (profile.status === 'suspended') {
      throw new Error('Your account has been suspended by administration. Please contact support.');
    }
    return profile;
  },

  signInWithGoogle: async (): Promise<Profile> => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    }
    // Fallback demo Google customer account
    let googleUser = db.getProfileByEmail('google.user@zenvo.com');
    if (!googleUser) {
      googleUser = {
        id: generateId('user_g'),
        email: 'google.user@zenvo.com',
        full_name: 'Verified Google Shopper',
        role: 'customer',
        status: 'active',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.createProfile(googleUser);
    }
    return googleUser;
  },

  resetPasswordForEmail: async (email: string): Promise<void> => {
    const profile = db.getProfileByEmail(email);
    if (!profile) {
      throw new Error('No account found with this email.');
    }
    // Simulated instant reset verification link dispatch
    return new Promise((resolve) => setTimeout(resolve, 600));
  },
};
