import { Coupon } from '../types';
import { db } from '../lib/storage';
import { generateId } from '../lib/utils';

export const couponService = {
  validateCoupon: (
    code: string,
    subtotal: number
  ): { valid: boolean; message?: string; coupon?: Coupon; discountAmount: number } => {
    const coupon = db.getCouponByCode(code);
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code.', discountAmount: 0 };
    }
    if (!coupon.is_active) {
      return { valid: false, message: 'This coupon is no longer active.', discountAmount: 0 };
    }
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
      return { valid: false, message: 'This coupon has expired.', discountAmount: 0 };
    }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return { valid: false, message: 'This coupon has reached its maximum usage limit.', discountAmount: 0 };
    }
    if (subtotal < coupon.min_order_value) {
      return {
        valid: false,
        message: `Minimum order value of ₹${coupon.min_order_value.toLocaleString()} required for this coupon.`,
        discountAmount: 0,
      };
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else {
      discountAmount = Math.min(subtotal, coupon.discount_value);
    }

    return {
      valid: true,
      message: `Coupon "${coupon.code}" applied! You save ₹${Math.round(discountAmount).toLocaleString()}.`,
      coupon,
      discountAmount,
    };
  },

  getAllCoupons: (): Coupon[] => {
    return db.getCoupons().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  createCoupon: (data: Omit<Coupon, 'id' | 'used_count' | 'created_at'>): Coupon => {
    const existing = db.getCouponByCode(data.code);
    if (existing) {
      throw new Error(`A coupon with code "${data.code}" already exists.`);
    }

    const coupon: Coupon = {
      ...data,
      id: generateId('coup'),
      code: data.code.toUpperCase().trim(),
      used_count: 0,
      created_at: new Date().toISOString(),
    };

    return db.createCoupon(coupon);
  },

  updateCoupon: (id: string, updates: Partial<Coupon>): Coupon => {
    return db.updateCoupon(id, updates);
  },

  deleteCoupon: (id: string): void => {
    db.deleteCoupon(id);
  },
};
