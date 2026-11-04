import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice } from './utils';
import { formatWhatsAppOrderMessage, getWhatsAppOrderUrl, ZENVO_WHATSAPP_INTL } from './whatsapp';

// Isolated pure logic tests for coupon discounting
function calculateDiscount(
  subtotal: number,
  coupon: {
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    is_active: boolean;
  }
): number {
  if (!coupon.is_active || subtotal < coupon.min_order_value) return 0;
  if (coupon.discount_type === 'percentage') {
    return (subtotal * coupon.discount_value) / 100;
  }
  return Math.min(subtotal, coupon.discount_value);
}

// Order cancellation rule
function canCancelOrder(status: string): boolean {
  return status === 'placed' || status === 'confirmed';
}

// Stock calculation
function applyStockReduction(currentStock: number, qty: number): number {
  if (qty > currentStock) {
    throw new Error('Insufficient stock');
  }
  return currentStock - qty;
}

test('coupon discount calculates percentage correctly', () => {
  const coupon = {
    discount_type: 'percentage' as const,
    discount_value: 10,
    min_order_value: 1000,
    is_active: true,
  };

  assert.equal(calculateDiscount(2000, coupon), 200);
  assert.equal(calculateDiscount(500, coupon), 0); // Below min_order_value
});

test('coupon discount calculates fixed amount correctly', () => {
  const coupon = {
    discount_type: 'fixed' as const,
    discount_value: 500,
    min_order_value: 1500,
    is_active: true,
  };

  assert.equal(calculateDiscount(3000, coupon), 500);
  assert.equal(calculateDiscount(1000, coupon), 0); // Below min_order_value
});

test('business rule: order cancel permitted only when placed or confirmed', () => {
  assert.equal(canCancelOrder('placed'), true);
  assert.equal(canCancelOrder('confirmed'), true);
  assert.equal(canCancelOrder('shipped'), false);
  assert.equal(canCancelOrder('delivered'), false);
  assert.equal(canCancelOrder('cancelled'), false);
});

test('inventory stock reductions prevent negative overselling', () => {
  assert.equal(applyStockReduction(10, 3), 7);
  assert.throws(() => applyStockReduction(2, 5), /Insufficient stock/);
});

test('currency formatting works with standard Indian/Pakistani numeric notation', () => {
  const formatted = formatPrice(2499);
  assert.ok(formatted.includes('2,499'));
});

test('whatsapp order message contains required order details and phone 03027628552', () => {
  const dummyOrder: any = {
    order_number: 'ORD-9999',
    customer_name: 'Bilal Khan',
    customer_email: 'bilal@example.com',
    status: 'placed',
    subtotal: 5000,
    discount_amount: 500,
    total: 4500,
    shipping_address: {
      phone: '03001234567',
      address_line1: 'House 12, Street 4',
      city: 'Lahore',
      state: 'Punjab',
      postal_code: '54000',
    },
    items: [
      {
        title_snapshot: 'Handcrafted Leather Messenger Bag',
        quantity: 1,
        unit_price: 5000,
        subtotal: 5000,
      },
    ],
  };

  const message = formatWhatsAppOrderMessage(dummyOrder);
  assert.ok(message.includes('ORD-9999'));
  assert.ok(message.includes('Bilal Khan'));
  assert.ok(message.includes('Handcrafted Leather Messenger Bag'));
  assert.ok(message.includes('Cash on Delivery'));

  const url = getWhatsAppOrderUrl(dummyOrder);
  assert.ok(url.includes(`phone=${ZENVO_WHATSAPP_INTL}`));
  assert.ok(url.includes('923027628552'));
});
